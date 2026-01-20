import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import OutputPanel from './components/OutputPanel';
import HistorySidebar from './components/HistorySidebar';
// import InputModal from './components/InputModal'; // Removed as per simplified Programiz style
import { LANGUAGES } from './constants/languages';
import { runCode } from './utils/executionEngine';
import LZString from 'lz-string';

function App() {
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

  // Clear query parameters after initial load so refresh doesn't reset state
  useEffect(() => {
    if (window.location.search) {
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, '', url);
    }
  }, []);

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
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const inputResolverRef = useRef(null); // To store the promise resolve function

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
    setIsWaitingForInput(false);
    setInputPrompt('');
    setInputValue('');
  };

  const handleClearOutput = () => {
    setOutput(null);
    setIsError(false);
    setShowSavePrompt(false);
    setIsWaitingForInput(false);
  };

  // Callback to show input UI
  const requestInput = (promptText) => {
    return new Promise((resolve) => {
      setInputPrompt(promptText);
      setIsWaitingForInput(true);
      // Scroll to bottom of output to ensure input is visible could be good, but panel handles overflow
      inputResolverRef.current = resolve;
    });
  };

  const handleInputSubmit = (value) => {
    setIsWaitingForInput(false);
    setInputPrompt('');
    setInputValue(''); // Clear input box

    // Add the user's input to the output display immediately so it looks like a terminal history
    setOutput(prev => (prev || "") + value + "\n");

    if (inputResolverRef.current) {
      inputResolverRef.current(value);
      inputResolverRef.current = null;
    }
  };

  const executeCode = async () => {
    setIsRunning(true);
    setIsError(false);
    setOutput(null); // Clear previous output on new run
    setShowSavePrompt(false);
    setIsWaitingForInput(false);

    try {
      const callbacks = {
        requestInput: requestInput
      };

      const result = await runCode(language.id, code, "", callbacks);

      // Check for error keywords in the result string from the engine
      const isRuntimeError = result.startsWith("Error:") || result.startsWith("Runtime Error:");
      const statusMessage = isRuntimeError ? "=== Code Execution With Error ===" : "=== Code Execution Successful ===";

      if (isRuntimeError) setIsError(true);

      setOutput(prev => (prev ? prev + "\n" : "") + result + "\n\n" + statusMessage);
      setShowSavePrompt(true);
    } catch (error) {
      setIsError(true);
      setOutput(error.message + "\n\n=== Code Execution With Error ===");
    } finally {
      setIsRunning(false);
      setInputValue('');
    }
  };

  const handleRunCode = () => {
    executeCode(); // No initial input needed, we ask for it if required
  };

  const handleShare = async () => {
    const compressedCode = LZString.compressToEncodedURIComponent(code);
    const url = `${window.location.origin}${window.location.pathname}?code=${compressedCode}&lang=${language.id}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error('Could not copy text: ', err);
      alert("Failed to copy link.");
    }
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

      {/* InputModal removed */}

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

      <main className="main-content" style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Editor
            language={language.id}
            code={code}
            onChange={setCode}
            theme={theme}
          />
        </div>
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
            onClear={handleClearOutput}
            inputValue={inputValue}
            onInputChange={setInputValue}
            isWaitingForInput={isWaitingForInput}
            onInputSubmit={handleInputSubmit}
            inputPrompt={inputPrompt}
            theme={theme}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
