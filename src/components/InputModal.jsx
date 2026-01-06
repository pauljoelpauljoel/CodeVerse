import React, { useState } from 'react';

const InputModal = ({ isOpen, onClose, onSubmit, inputHints = [] }) => {
    const [localInput, setLocalInput] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit(localInput);
        setLocalInput(''); // Clear after submit
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass" style={{
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                borderRadius: '16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Input Required
                </h3>

                {inputHints.length > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                            Detected Questions:
                        </p>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {inputHints.map((hint, idx) => (
                                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                    • {hint}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Please enter inputs for the program below.<br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        (Separate multiple inputs with new lines)
                    </span>
                </p>

                <textarea
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    placeholder="Enter input here..."
                    className="custom-scrollbar"
                    style={{
                        width: '100%',
                        height: '150px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '1rem',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: '1.5rem',
                        resize: 'none',
                        outline: 'none'
                    }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.6rem 1.2rem',
                            color: 'var(--text-secondary)',
                            borderRadius: '6px',
                            fontWeight: '600'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            borderRadius: '6px',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px var(--accent-glow)'
                        }}
                    >
                        Run with Input
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
