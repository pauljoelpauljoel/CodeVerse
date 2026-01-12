import React, { useRef } from 'react';
import { Editor as MonacoEditor } from "@monaco-editor/react";

const Editor = ({ language, code, onChange, theme }) => {
    // Map common language names to Monaco identifiers if needed
    // For now, our ids in languages.js (javascript, python, java, cpp) match Monaco's usually.
    // C++ in monaco is 'cpp'. Java is 'java'. Python is 'python'. Javascript is 'javascript'.

    const handleEditorChange = (value) => {
        onChange(value);
    };

    const handleEditorDidMount = (editor, monaco) => {
        // Disable Copy Command (Ctrl+C / Cmd+C)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
            // Do nothing to prevent copying
        });
    };

    return (
        <div className="glass" style={{ height: "100%", width: "100%", overflow: "hidden", borderRadius: "var(--border-radius)" }}>
            <MonacoEditor
                height="100%"
                language={language}
                value={code}
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    contextmenu: false,
                    minimap: { enabled: false },
                    fontSize: 16,
                    fontFamily: "'Fira Code', monospace",
                    fontLigatures: true,
                    padding: { top: 24, bottom: 24 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                    roundedSelection: false,
                    cursorStyle: "line",
                    tabSize: 4,
                }}
            />
        </div>
    );
};

export default Editor;
