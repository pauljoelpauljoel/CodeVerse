import React, { useState } from 'react';

const OutputPanel = ({ output, isError, isLoading, showSavePrompt, onSave, inputValue, onInputChange }) => {
    const [activeTab, setActiveTab] = useState('output'); // 'output' or 'input'

    return (
        <div className="glass" style={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: "var(--border-radius)", overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setActiveTab('output')}
                    style={{
                        padding: '0.8rem 1.5rem',
                        color: activeTab === 'output' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'output' ? '2px solid var(--accent-primary)' : 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}
                >
                    Output
                </button>
                <button
                    onClick={() => setActiveTab('input')} // Placeholder for now
                    style={{
                        padding: '0.8rem 1.5rem',
                        color: activeTab === 'input' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'input' ? '2px solid var(--accent-primary)' : 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}
                >
                    Input
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', overflowY: 'auto' }} className="custom-scrollbar">
                {isLoading ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Compiling and executing...</div>
                ) : (
                    activeTab === 'output' ? (
                        output ? (
                            <div style={{ whiteSpace: 'pre-wrap', color: isError ? '#ff4d4d' : 'var(--text-primary)' }}>
                                {output}
                                {showSavePrompt && (
                                    <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '4px', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Save this run to history?</span>
                                        <button
                                            onClick={onSave}
                                            style={{ background: 'var(--accent-primary)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                Click "Run Code" to see output.
                            </div>
                        )
                    ) : (
                        <textarea
                            placeholder="Enter standard input here..."
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default OutputPanel;
