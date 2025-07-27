import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import SQLEditor from './components/SQLEditor';
import ResultsViewer from './components/ResultsViewer';
import SchemaViewer from './components/SchemaViewer';
import QueryHistory from './components/QueryHistory';
import PracticeMode from './components/PracticeMode';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'schema', 'history', 'practice'

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check system preference
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);

  // Update document class and localStorage when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleQuerySubmit = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://sql-app-ry1b.onrender.com/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }
      
      setResults(data);
      
      // Add to query history
      setQueryHistory(prev => [
        { id: Date.now(), query, timestamp: new Date().toISOString() },
        ...prev.slice(0, 9) // Keep only the last 10 queries
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-light">
            SQL Practice App
          </h1>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-4">
              <button 
                className={`px-3 py-1 rounded-md ${activeTab === 'editor' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab('editor')}
              >
                SQL Editor
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${activeTab === 'schema' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab('schema')}
              >
                Schema
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${activeTab === 'history' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${activeTab === 'practice' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setActiveTab('practice')}
              >
                Practice
              </button>
            </nav>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <nav className="flex w-full justify-between gap-2">
            <button 
              className={`flex-1 px-3 py-1 rounded-md text-sm ${activeTab === 'editor' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button 
              className={`flex-1 px-3 py-1 rounded-md text-sm ${activeTab === 'schema' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setActiveTab('schema')}
            >
              Schema
            </button>
            <button 
              className={`flex-1 px-3 py-1 rounded-md text-sm ${activeTab === 'history' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button 
              className={`flex-1 px-3 py-1 rounded-md text-sm ${activeTab === 'practice' ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setActiveTab('practice')}
            >
              Practice
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SQLEditor onSubmit={handleQuerySubmit} loading={loading} />
            </div>
            <div className="lg:col-span-2">
              <ResultsViewer results={results} error={error} loading={loading} />
            </div>
          </div>
        )}

        {activeTab === 'schema' && <SchemaViewer />}
        {activeTab === 'history' && <QueryHistory history={queryHistory} onSelectQuery={(query) => {
          setActiveTab('editor');
          // This will be handled by the SQLEditor component to set the query
        }} />}
        {activeTab === 'practice' && <PracticeMode onRunQuery={handleQuerySubmit} />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          SQL Practice App - Learn SQL interactively with simulated database
        </div>
      </footer>
    </div>
  );
}

export default App;