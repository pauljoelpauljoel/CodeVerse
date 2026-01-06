
/**
 * Analyzes Java code to find the main class (entry point) and reorders code 
 * to ensure the main class is defined first (after imports).
 * 
 * Logic:
 * 1. Scans top-level classes.
 * 2. Checks for 'public static void main(String[] args)'.
 * 3. Reconstructs code: Imports + MainClass + OtherClasses.
 * 
 * @param {string} code 
 * @returns {Object} { entryClass, reorderedCode, compileCommand, runCommand }
 * @throws {Error} if no main method is found.
 */
export const analyzeJavaCode = (code) => {
    // 1. Clean for analysis (keep original for extraction)
    // We need indices from the original code, so we won't strip comments for the regex search 
    // strictly, or we must be careful. Regex is robust enough for standard formatting.

    // Find imports area: Everything before the first "class" keyword that isn't in a comment?
    // Simpler: Just find the first class match index.

    const classRegex = /(?:public\s+|abstract\s+|final\s+)*class\s+(\w+)\s*\{/g;

    let match;
    const classes = [];

    while ((match = classRegex.exec(code)) !== null) {
        classes.push({
            name: match[1],
            startIndex: match.index,
            fullMatch: match[0]
        });
    }

    if (classes.length === 0) {
        throw new Error("Error: No class definitions found.");
    }

    let mainClassIndex = -1;

    // Identify Main Class
    for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];
        const nextClassStart = (i + 1 < classes.length) ? classes[i + 1].startIndex : code.length;
        const classBody = code.substring(cls.startIndex, nextClassStart);

        if (/public\s+static\s+void\s+main\s*\(\s*String\s*[\[\]\.]+\s*\w+\s*\)/.test(classBody)) {
            if (!cls.fullMatch.includes('abstract')) {
                mainClassIndex = i;
                break;
            }
        }
    }

    if (mainClassIndex === -1) {
        throw new Error("Error: No main(String[] args) found.");
    }

    const mainClass = classes[mainClassIndex];

    // Reconstruction
    const firstClassIndex = classes[0].startIndex;
    const header = code.substring(0, firstClassIndex); // Imports/Comments at top

    const nextToMainStart = (mainClassIndex + 1 < classes.length) ? classes[mainClassIndex + 1].startIndex : code.length;
    const mainClassBody = code.substring(mainClass.startIndex, nextToMainStart);

    // Remove Main class from original sequence to avoid duplication? 
    // Easier: Construct parts.

    let otherClassesBody = "";
    for (let i = 0; i < classes.length; i++) {
        if (i === mainClassIndex) continue;
        const start = classes[i].startIndex;
        const end = (i + 1 < classes.length) ? classes[i + 1].startIndex : code.length;
        otherClassesBody += code.substring(start, end) + "\n\n";
    }

    const reorderedCode = `${header}\n${mainClassBody}\n\n${otherClassesBody}`;

    return {
        entryClass: mainClass.name,
        reorderedCode: reorderedCode,
        compileCommand: "javac *.java",
        runCommand: `java ${mainClass.name}`
    };
};
