
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
    if (languageId === 'python' && (code.includes('input('))) return false; // Allowed to run interactively
    if (languageId === 'javascript' && (code.includes('prompt('))) return false; // Allowed to run interactively
    return false;
};

export const extractPrompts = (languageId, code) => {
    const prompts = [];
    let regex;

    if (languageId === 'java') {
        // Matches System.out.print("...") or println("...")
        regex = /System\.out\.print(?:ln)?\s*\(\s*"([^"]+)"/g;
    } else if (languageId === 'cpp') {
        // Matches cout << "..."
        regex = /cout\s*<<\s*"([^"]+)"/g;
    } else if (languageId === 'c') {
        // Matches printf("...")
        regex = /printf\s*\(\s*"([^"]+)"/g;
    }

    if (regex) {
        let match;
        while ((match = regex.exec(code)) !== null) {
            const str = match[1];
            const lower = str.toLowerCase();

            // Heuristic: It's likely a prompt if it contains keywords or ends with typical punctuation
            // We want to capture things like:
            // "Enter number: "
            // "Input value:"
            // "Age?"
            if (
                lower.includes('enter') ||
                lower.includes('input') ||
                lower.includes('type') ||
                str.trim().endsWith(':') ||
                str.trim().endsWith('?') ||
                str.trim().endsWith('>')
            ) {
                prompts.push(str);
            }
        }
    }
    return prompts;
};

export const runCode = async (languageId, code, stdin = "", callbacks = {}) => {
    // callbacks: { requestInput: async (promptText) => string }

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

            // Override prompt to use stdin or callback if available
            window.prompt = (message) => {
                // Not easily async-awaitable in synchronous JS execution (new Function)
                // blocking prompt is the only way for synchronous JS unfortunately without Service Workers
                if (inputIndex < inputs.length) {
                    return inputs[inputIndex++];
                }
                return originalPrompt(message);
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
            // Pyodide Execution
            const pyodide = await getPyodide();

            // Python input() is synchronous. We can't easily await a React UI callback.
            // We'll stick to window.prompt for Python OR we could try to implement a SharedArrayBuffer approach if we had more time.
            // For now, let's keep Python with window.prompt but maybe we can hook it?
            // Actually, let's just use window.prompt for Python for now to be safe, 
            // OR if the user wants uniformity, we can try to use the callback if we can make it blocking (which we can't easily in main thread).
            // Retaining window.prompt for Python as per plan fallback.

            const pythonInputSetup = `
import js
import builtins

def custom_input(prompt=""):
    val = js.prompt(prompt if prompt else "")
    return val if val else ""

builtins.input = custom_input
`;

            await pyodide.runPythonAsync(pythonInputSetup);

            pyodide.setStdout({ batched: (msg) => { } });
            let output = [];
            pyodide.setStdout({ batched: (msg) => output.push(msg) });
            pyodide.setStderr({ batched: (msg) => output.push(`Error: ${msg}`) });

            try {
                await pyodide.runPythonAsync(code);
            } catch (e) {
                output.push(`Error: ${e.message}`);
            }

            return output.join('\n');

        } else if (languageId === 'java' || languageId === 'cpp' || languageId === 'c') {
            // --- PRE-EXECUTION INPUT COLLECTION ("Simulated Interactive") ---

            // 1. Detect Prompts ("Enter number:")
            const detectedPrompts = extractPrompts(languageId, code);
            const collectedInputs = [];

            // 2. Interactive Loop via Callback (Async!)
            if (detectedPrompts.length > 0) {
                for (const promptText of detectedPrompts) {
                    if (callbacks.requestInput) {
                        // Use the UI-based input method
                        const userVal = await callbacks.requestInput(promptText);
                        collectedInputs.push(userVal !== null ? userVal : "");
                    } else {
                        // Fallback to window.prompt
                        const userVal = window.prompt(promptText);
                        collectedInputs.push(userVal !== null ? userVal : "");
                    }
                }
            } else {
                // 3. Fallback: If NO prompts found but code looks like it needs input
                if (checkInputRequirement(languageId, code) && !stdin) {
                    if (callbacks.requestInput) {
                        const genericInput = await callbacks.requestInput("This program appears to require input.\nPlease enter all inputs needed, separated by lines:");
                        if (genericInput) collectedInputs.push(genericInput);
                    } else {
                        const genericInput = window.prompt("This program appears to require input.\nPlease enter all inputs needed, separated by lines:");
                        if (genericInput) collectedInputs.push(genericInput);
                    }
                }
            }

            // 4. Construct Final Stdin
            let finalStdin = stdin;
            if (collectedInputs.length > 0) {
                finalStdin = collectedInputs.join('\n');
            }

            // 5. Execute with Piston
            let output = await executeWithPiston(languageId, code, finalStdin);

            // Smart Error Helper for Java Scanner
            if (languageId === 'java' && output.includes("java.util.NoSuchElementException")) {
                output += "\n\n[System Helper]: The program ran out of input! \n- If using the prompt, separate multiple inputs with '||' (e.g. John||john@email.com||25).\n- Or use the 'Input' tab for standard multi-line input.";
            }

            // --- OUTPUT CLEANING ---
            detectedPrompts.forEach(prompt => {
                const trimmedPrompt = prompt.trim();
                // Heuristic removal of prompts from output since we already showed them
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
