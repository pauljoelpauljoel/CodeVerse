import logo from '../assets/mix-n-fix-logo.jpg';
import React from 'react';
import { FaPlay, FaShareAlt, FaCode, FaHistory, FaJava, FaSun, FaMoon } from 'react-icons/fa';
import { SiJavascript, SiPython, SiCplusplus, SiC } from 'react-icons/si';
import { LANGUAGES } from '../constants/languages';

const LANGUAGE_ICONS = {
    'javascript': SiJavascript,
    'python': SiPython,
    'java': FaJava,
    'cpp': SiCplusplus,
    'c': SiC
};

const Header = ({ language, setLanguage, onRun, onShare, onToggleHistory, isRunning, theme, toggleTheme }) => {

    return (
        <header
            className="glass flex-center"
            style={{
                justifyContent: 'space-between',
                padding: '1rem 2rem',
                marginBottom: '1rem',
                borderRadius: 'var(--border-radius)',
                flexWrap: 'wrap',
                gap: '1rem'
            }}
        >
            {/* Logo Area */}
            <div className="flex-center" style={{ gap: '1.5rem', marginRight: 'auto' }}>
                <img src={logo} alt="Mix-N-Fix Logo" style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.3s ease'
                }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
                <h1 className="sway-animation" style={{
                    fontSize: '1.8rem',
                    fontWeight: '900',
                    letterSpacing: '-1px', // Tight spacing like the logo
                    fontFamily: "'Montserrat', sans-serif",
                    color: 'var(--text-primary)',
                    // Removed Gold Gradient & Shadow as requested
                }}>
                    Mix-N-Fix-COMPILER
                </h1>
            </div>

            {/* Language Selector - Visual List */}
            <div className="language-selector custom-scrollbar" style={{
                display: 'flex',
                gap: '0.8rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                maxWidth: '600px', // Prevent taking up too much space
                margin: '0 1rem'
            }}>
                {LANGUAGES.map(lang => {
                    const Icon = LANGUAGE_ICONS[lang.id] || FaCode;
                    const isActive = language.id === lang.id;
                    return (
                        <button
                            key={lang.id}
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?lang=${lang.id}`;
                                window.open(url, '_blank');
                            }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.5rem 0.8rem',
                                borderRadius: '8px',
                                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                border: isActive ? 'none' : '1px solid var(--glass-border)',
                                minWidth: '80px',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{lang.name}</span>
                            <Icon size={20} />
                        </button>
                    )
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex-center" style={{ gap: '1rem', marginLeft: 'auto' }}>
                <button
                    className="flex-center"
                    onClick={onRun}
                    disabled={isRunning}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: isRunning ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                        color: '#fff',
                        borderRadius: '6px',
                        fontWeight: '600',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                        opacity: isRunning ? 0.7 : 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    <FaPlay size={14} />
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>

                <button
                    className="flex-center"
                    onClick={onShare}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)',
                        borderRadius: '6px',
                        fontWeight: '600',
                        gap: '0.5rem',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <FaShareAlt size={14} />
                    Share
                </button>

                <button
                    className="flex-center"
                    onClick={onToggleHistory}
                    style={{
                        padding: '0.6rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)'
                    }}
                    title="History"
                >
                    <FaHistory size={16} />
                </button>

                <button
                    className="flex-center"
                    onClick={toggleTheme}
                    style={{
                        padding: '0.6rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)'
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
