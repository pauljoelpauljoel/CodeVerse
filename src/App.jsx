import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import OutputPanel from './components/OutputPanel';
import HistorySidebar from './components/HistorySidebar';
import InputModal from './components/InputModal';
import { LANGUAGES } from './constants/languages';
import { runCode, checkInputRequirement, extractPrompts } from './utils/executionEngine';
import LZString from 'lz-string';

function App() {
  // Load initial state from localStorage or default
  // Load initial state from URL or localStorage or default
  const getInitialState = () => {
    // 1. Priority: URL Parameters (for new tabs/sharing)
    const params = new URLSearchParams(window.location.search);
    const sharedLangId = params.get('lang');
    const sharedCode = params.get('code');

    if (sharedLangId) {
      const foundLang = LANGUAGES.find(l => l.id === sharedLangId);
      if (foundLang) {
        let initialCode = foundLang.defaultValue;
        if (sharedCode) {
          try {
            const decompressed = LZString.decompressFromEncodedURIComponent(sharedCode);
            if (decompressed) initialCode = decompressed;
          } catch (e) {
            console.error("Failed to parse shared code", e);
          }
        }
        return { language: foundLang, code: initialCode };
      }
    }

    // 2. Priority: Saved Session (localStorage)
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const foundLang = LANGUAGES.find(l => l.id === parsed.languageId);
        if (foundLang) {
          return {
            language: foundLang,
            code: parsed.code || foundLang.defaultValue
          };
        }
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }

    // 3. Fallback: Default
    return { language: LANGUAGES[0], code: LANGUAGES[0].defaultValue };
  };

  const initialState = getInitialState();
  const [language, setLanguage] = useState(initialState.language);
  const [code, setCode] = useState(initialState.code);

  // Save session on change
  useEffect(() => {
    localStorage.setItem('currentSession', JSON.stringify({
      languageId: language.id,
      code: code
    }));
  }, [code, language]);
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  // Input State
  const [inputValue, setInputValue] = useState('');
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputHints, setInputHints] = useState([]);

  // History State
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // ... history loading and url parsing logic ...
  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('codeHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

  }, []);


  // Save history helper
  const saveToHistory = (codeToSave, langName) => {
    const newItem = {
      id: Date.now(),
      code: codeToSave,
      language: langName,
      timestamp: new Date().toISOString()
    };

    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('codeHistory', JSON.stringify(newHistory));
    return newItem;
  };

  const handleDeleteHistory = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('codeHistory', JSON.stringify(newHistory));
  };

  const handleLanguageChange = (newUiLanguage) => {
    setLanguage(newUiLanguage);
    setCode(newUiLanguage.defaultValue);
    setOutput(null);
    setShowSavePrompt(false);
  };

  const executeCode = async (finalInput) => {
    setIsRunning(true);
    setIsError(false);
    setOutput(null);
    setShowSavePrompt(false);

    try {
      const result = await runCode(language.id, code, finalInput);
      setOutput(result);
      setShowSavePrompt(true);
    } catch (error) {
      setIsError(true);
      setOutput(error.message);
    } finally {
      setIsRunning(false);
      setInputValue(''); // Clear input so next run prompts again
    }
  };

  const handleRunCode = () => {
    // Check if input is likely needed but not provided
    const needsInput = checkInputRequirement(language.id, code);
    if (needsInput && (!inputValue || inputValue.trim() === '')) {
      const hints = extractPrompts(language.id, code);
      setInputHints(hints);
      setShowInputModal(true);
      return;
    }

    // Otherwise run directly
    executeCode(inputValue);
  };

  const handleModalSubmit = (inputFromModal) => {
    setInputValue(inputFromModal); // Update the visual input box too
    setShowInputModal(false);
    executeCode(inputFromModal);
  };

  const handleShare = () => {
    // No auto save on share
    // saveToHistory(code, language.name);

    const compressedCode = LZString.compressToEncodedURIComponent(code);
    const url = `${window.location.origin}${window.location.pathname}?code=${compressedCode}&lang=${language.id}`;

    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 1rem 1rem 1rem', overflow: 'hidden' }}>
      <HistorySidebar
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={(item) => {
          const lang = LANGUAGES.find(l => l.name === item.language);
          if (lang) setLanguage(lang);
          setCode(item.code);
          setIsHistoryOpen(false);
        }}
        onDelete={handleDeleteHistory}
      />

      <InputModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSubmit={handleModalSubmit}
        inputHints={inputHints}
      />

      <div style={{ flexShrink: 0 }}>
        <Header
          language={language}
          setLanguage={handleLanguageChange}
          onRun={handleRunCode}
          onShare={handleShare}
          onToggleHistory={() => setIsHistoryOpen(true)}
          isRunning={isRunning}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
        {/* Editor Section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Editor
            language={language.id}
            code={code}
            onChange={setCode}
          />
        </div>

        {/* Output Section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <OutputPanel
            output={output}
            isError={isError}
            isLoading={isRunning}
            showSavePrompt={showSavePrompt}
            onSave={() => {
              saveToHistory(code, language.name);
              setShowSavePrompt(false);
              alert("Saved to History!");
            }}
            inputValue={inputValue}
            onInputChange={setInputValue}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
