import React, { useState } from 'react';

const OutputPanel = ({
    output,
    isError,
    isLoading,
    showSavePrompt,
    onSave,
    inputValue,
    onInputChange,
    onClear,
    isWaitingForInput, // New prop: Is the engine waiting for user input?
    onInputSubmit,      // New prop: Callback when user submits input
    inputPrompt,         // New prop: Text prompt to show (e.g. "Enter number:")
    theme               // New prop: current theme 'light' or 'dark'
}) => {
    // Define styles based on theme
    const styles = {
        container: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "var(--border-radius)",
            overflow: "hidden",
            backgroundColor: theme === 'light' ? '#ffffff' : 'rgb(28, 33, 48)', // White for Light, Navy for Dark
            fontFamily: "'Droid Sans Mono', 'Consolas', 'Courier New', monospace",
            border: theme === 'light' ? '1px solid #e1e4e8' : 'none'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme === 'light' ? '#f0f2f5' : 'rgb(45, 47, 52)',
            padding: '0 1rem',
            height: '40px',
            borderBottom: theme === 'light' ? '1px solid #d1d5db' : '1px solid rgba(255, 255, 255, 0.1)'
        },
        headerText: {
            color: theme === 'light' ? '#1f2937' : '#fff',
            fontWeight: '600',
            fontSize: '14px',
            padding: '0 0.5rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            borderBottom: theme === 'light' ? '2px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.2)'
        },
        clearButton: {
            background: 'transparent',
            border: theme === 'light' ? '1px solid #d1d5db' : '1px solid rgb(211, 220, 230)',
            color: theme === 'light' ? '#4b5563' : '#fff',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: '"Euclid Circular A", sans-serif',
            opacity: 0.8
        },
        content: {
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            color: theme === 'light' ? '#111827' : 'rgb(238, 238, 238)',
            fontSize: '14px',
            lineHeight: '1.5'
        }
    };

    // We no longer need activeTab state since it's a single panel
    // const [activeTab, setActiveTab] = useState('output');

    // Handle Enter key for input submission
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onInputSubmit) {
                onInputSubmit(inputValue);
            }
        }
    };

    return (
        <div style={styles.container}>
            {/* Programiz-style Header */}
            <div style={styles.header}>
                <div style={styles.headerText}>
                    Output
                </div>

                <button
                    onClick={onClear}
                    title="Clear Output"
                    style={styles.clearButton}
                    onMouseOver={(e) => e.target.style.opacity = '1'}
                    onMouseOut={(e) => e.target.style.opacity = '0.8'}
                >
                    Clear
                </button>
            </div>

            {/* Content Area */}
            <div className="custom-scrollbar" style={styles.content}>
                {/* 1. If Loading */}
                {isLoading && !isWaitingForInput && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Compiling and executing...</div>
                )}

                {/* 2. Output Display */}
                {output && (
                    <div style={{ whiteSpace: 'pre-wrap', color: isError ? '#ff4d4d' : 'inherit' }}>
                        {output}
                    </div>
                )}

                {/* 3. Waiting For Input (Simulated Terminal Input) */}
                {isWaitingForInput && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '0.5rem', color: '#00d2ff' }}>{inputPrompt || "?"}</span>
                        <input
                            autoFocus
                            type="text"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                outline: 'none',
                                flex: 1,
                                minWidth: '50px'
                            }}
                        />
                        <span className="blinking-cursor" style={{ marginLeft: '-5px' }}>|</span>
                    </div>
                )}

                {/* 4. Empty State Instructions */}
                {!output && !isLoading && !isWaitingForInput && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
                        Click "Run Code" to see output.
                    </div>
                )}

                {/* 5. Save Prompt (Preserved) */}
                {!isLoading && !isWaitingForInput && showSavePrompt && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.8rem',
                        background: 'rgba(0, 210, 255, 0.05)',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 210, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: '"Euclid Circular A", sans-serif'
                    }}>
                        <span style={{ fontSize: '0.9rem' }}>Save this run to history?</span>
                        <button
                            onClick={onSave}
                            style={{
                                background: 'var(--accent-primary)',
                                color: '#fff',
                                padding: '0.4rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Blinking Cursor Style Definition if not in CSS */}
            <style>{`
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
                .blinking-cursor { animation: blink 1s step-end infinite; color: var(--accent-primary); }
            `}</style>
        </div>
    );
};

export default OutputPanel;
