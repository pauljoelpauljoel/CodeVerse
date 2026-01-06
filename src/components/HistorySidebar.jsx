import React from 'react';
import { FaTrash, FaClock, FaCode } from 'react-icons/fa';

const HistorySidebar = ({ isOpen, history, onClose, onRestore, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div
            className="glass"
            style={{
                position: 'fixed',
                right: 0,
                top: 0,
                height: '100vh',
                width: '350px',
                zIndex: 1000,
                borderLeft: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                background: 'var(--bg-secondary)'
            }}
        >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>History</h2>
                <button onClick={onClose} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                        <FaClock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>No history yet.</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1rem',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s'
                            }}
                            className="history-item"
                            onClick={() => onRestore(item)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.8rem',
                                    background: 'var(--accent-primary)',
                                    color: '#000',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}>
                                    {item.language}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)',
                                maxHeight: '60px',
                                overflow: 'hidden',
                                whiteSpace: 'pre-wrap',
                                opacity: 0.8
                            }}>
                                {item.code.substring(0, 100)}...
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    bottom: '10px',
                                    color: '#ff4d4d',
                                    opacity: 0.6
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
