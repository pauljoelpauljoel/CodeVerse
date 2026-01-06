
import { analyzeJavaCode } from './javaAnalyzer';

let pyodideInstance = null;
let pyodideLoadPromise = null;

// Piston API Configuration
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const PISTON_LANG_MAP = {
    'java': { language: 'java', version: '15.0.2' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'c': { language: 'c', version: '10.2.0' },
    'python': { language: 'python', version: '3.10.0' }, // Optional fallback
    'javascript': { language: 'javascript', version: '18.15.0' } // Optional fallback
};

// Helper to load Pyodide once
const getPyodide = async () => {
    if (pyodideInstance) return pyodideInstance;

    if (!pyodideLoadPromise) {
        pyodideLoadPromise = (async () => {
            if (!window.loadPyodide) {
                throw new Error("Pyodide script not loaded in index.html");
            }
            const pyodide = await window.loadPyodide();
            return pyodide;
        })();
    }

    pyodideInstance = await pyodideLoadPromise;
    return pyodideInstance;
};

// Helper for Piston API Execution
const executeWithPiston = async (languageId, code, stdin = "") => {
    const config = PISTON_LANG_MAP[languageId];
    if (!config) throw new Error(`Unsupported language for backend execution: ${languageId}`);

    let fileName = undefined;

    // Smart Analyzer for Java
    if (languageId === 'java') {
        try {
            const analysis = analyzeJavaCode(code);
            fileName = `${analysis.entryClass}.java`;
            // We can also log the commands if we want, but mainly we need the filename.

            // Use the reordered code so Piston executes the first class (Main)
            // or we enable Piston to match the filename class.
            // But reordering is safest.
            code = analysis.reorderedCode;
        } catch (e) {
            // Propagate the specific analysis error
            throw e;
        }
    }

    try {
        const payload = {
            language: config.language,
            version: config.version,
            files: [{
                content: code,
                ...(fileName && { name: fileName }) // Only add name if defined
            }],
            stdin: stdin
        };

        const response = await fetch(PISTON_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.run) {
            let output = data.run.output;
            if (fileName && languageId === 'java') {
                output = `[Compiler] Detected entry class: ${fileName.replace('.java', '')}\nRunning...\n---\n${output}`;
            }
            return output;
        } else {
            return "Error: No output from server.";
        }
    } catch (error) {
        throw new Error(`Piston API Error: ${error.message}`);
    }
};

export const checkInputRequirement = (languageId, code) => {
    if (languageId === 'java' && (code.includes('Scanner') || code.includes('System.in'))) return true;
    if (languageId === 'cpp' && (code.includes('cin') || code.includes('getline'))) return true;
    if (languageId === 'c' && (code.includes('scanf') || code.includes('gets') || code.includes('getchar'))) return true;
    if (languageId === 'python' && (code.includes('input('))) return true;
    if (languageId === 'javascript' && (code.includes('prompt('))) return true;
    return false;
};

export const extractPrompts = (languageId, code) => {
    const prompts = [];
    let regex;

    if (languageId === 'java') {
        regex = /System\.out\.print(?:ln)?\s*\(\s*"([^"]+)"/g;
    } else if (languageId === 'cpp') {
        regex = /cout\s*<<\s*"([^"]+)"/g;
    } else if (languageId === 'c') {
        regex = /printf\s*\(\s*"([^"]+)"/g;
    } else if (languageId === 'python') {
        regex = /input\s*\(\s*"([^"]+)"/g;
    } else if (languageId === 'javascript') {
        regex = /prompt\s*\(\s*"([^"]+)"/g;
    }

    if (regex) {
        let match;
        while ((match = regex.exec(code)) !== null) {
            const str = match[1];
            // Filter: Only keep it if it looks like a question/input prompt
            const lower = str.toLowerCase();

            // For Python/JS, the regex matches input()/prompt(), so EVERYTHING inside is a prompt.
            // For Java/C/C++, the regex matches ALL prints, so we need STRICT filtering.

            const isStrictLang = (languageId === 'java' || languageId === 'cpp' || languageId === 'c');

            if (isStrictLang) {
                // Strict Mode: Must have "enter", "input", "type" OR end with "?"
                // We specifically REMOVE the check for endsWith(':') to avoid matching output labels like "Name:"
                if (lower.includes('enter') || lower.includes('input') || lower.includes('type') || str.trim().endsWith('?')) {
                    prompts.push(str);
                }
            } else {
                // Loose Mode (Python/JS): Accept almost anything since we know it's inside input()
                // We keep the filter slightly just to be safe, but include ':'
                if (lower.includes('enter') || lower.includes('input') || lower.includes('type') || str.trim().endsWith(':') || str.trim().endsWith('?')) {
                    prompts.push(str);
                } else {
                    // Even if it doesn't match keywords, for Python/JS we probably still want it 
                    // because why would you input("Result: ")? 
                    // But let's stick to the heuristic to be safe, or just push it.
                    // Let's push it, trusting the user uses input() for inputs.
                    prompts.push(str);
                }
            }
        }
    }
    return prompts;
};

export const runCode = async (languageId, code, stdin = "") => {
    try {
        if (languageId === 'javascript') {
            // Safe(r) execution for JS: Capture console.log
            let logs = [];

            // Handle Stdin for prompt()
            const inputs = stdin ? stdin.split('\n') : [];
            let inputIndex = 0;

            const originalLog = console.log;
            const originalPrompt = window.prompt;

            // Override console.log
            console.log = (...args) => {
                logs.push(args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '));
            };

            // Override prompt to use stdin
            window.prompt = (message) => {
                if (inputIndex < inputs.length) {
                    return inputs[inputIndex++];
                }
                return ""; // Default empty if no input provided
            };

            try {
                const func = new Function(code);
                func();
            } catch (e) {
                logs.push(`Error: ${e.message}`);
            } finally {
                console.log = originalLog;
                window.prompt = originalPrompt;
            }

            return logs.join('\n') || "Program executed successfully (no output).";

        } else if (languageId === 'python') {
            // Check if we have stdin or input() usage
            if (stdin || code.includes('input(')) {
                // If using modal inputs, we MUST use Piston (Server) 
                // because Pyodide (Client) 'input()' blocks the browser thread and requires window.prompt
                return await executeWithPiston('python', code, stdin);
            }

            // Otherwise, Use Pyodide for Client-side speed (if simple script)
            const pyodide = await getPyodide();
            pyodide.setStdout({ batched: (msg) => { } });
            let output = [];
            pyodide.setStdout({ batched: (msg) => output.push(msg) });
            pyodide.setStderr({ batched: (msg) => output.push(`Error: ${msg}`) });
            await pyodide.runPythonAsync(code);
            return output.join('\n');

        } else if (languageId === 'java' || languageId === 'cpp' || languageId === 'c') {
            // Directly Run with Provided Stdin
            let output = await executeWithPiston(languageId, code, stdin);

            // Smart Error Helper for Java Scanner
            if (languageId === 'java' && output.includes("java.util.NoSuchElementException")) {
                output += "\n\n[System Helper]: The program ran out of input! \n- If using the prompt, separate multiple inputs with '||' (e.g. John||john@email.com||25).\n- Or use the 'Input' tab for standard multi-line input.";
            }

            // --- OUTPUT CLEANING ---
            // Remove the prompts ("Enter name:") that are printed back by Piston
            // because prompts are useful for interactive terminals but redundant here
            const potentialPrompts = extractPrompts(languageId, code);

            // We iterate through prompts and remove their *first* occurrence from output
            // This is a heuristic. It assumes the program prints the prompt then waits.
            // Piston output usually includes everything printed to stdout.
            potentialPrompts.forEach(prompt => {
                // We trim the prompt to match what might be in output roughly
                const trimmedPrompt = prompt.trim();
                // Simple string replace for the first occurrence
                // We use replace() which only replaces the first match
                // We try to match the prompt string exactly as defined in code
                if (output.includes(prompt)) {
                    output = output.replace(prompt, "");
                }
            });

            // Clean up leading newlines/spaces left behind
            output = output.trim();

            return output;
        } else {
            return `Execution for ${languageId} is not supported.`;
        }
    } catch (error) {
        return `Runtime Error:\n${error.message}`;
    }
};
