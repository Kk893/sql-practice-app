import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { FiPlay, FiClock, FiCheck, FiX } from 'react-icons/fi';

const SQLEditor = ({ onSubmit, loading }) => {
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (value) => {
    setQuery(value);
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    onSubmit(query);
  };

  const handleKeyDown = (e) => {
    // Execute query with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Sample queries for demonstration
  const sampleQueries = [
    {
      title: 'Basic SELECT',
      query: 'SELECT * FROM users LIMIT 10;'
    },
    {
      title: 'Filtering with WHERE',
      query: 'SELECT name, email, age FROM users WHERE age > 25;'
    },
    {
      title: 'JOIN example',
      query: 'SELECT users.name, orders.product_id, products.name as product_name\nFROM users\nJOIN orders ON users.id = orders.user_id\nJOIN products ON orders.product_id = products.id\nLIMIT 10;'
    },
    {
      title: 'GROUP BY with aggregation',
      query: 'SELECT department_id, COUNT(*) as employee_count, AVG(salary) as avg_salary\nFROM employees\nGROUP BY department_id\nORDER BY avg_salary DESC;'
    }
  ];

  return (
    <div className="card sql-editor-container flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">SQL Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="btn btn-outline text-sm px-3 py-1"
          >
            {showHelp ? 'Hide Samples' : 'Show Samples'}
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
          <h3 className="font-semibold mb-2">Sample Queries</h3>
          <div className="grid gap-2">
            {sampleQueries.map((sample, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                <p className="font-medium mb-1">{sample.title}</p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                  {sample.query}
                </pre>
                <button
                  onClick={() => setQuery(sample.query)}
                  className="text-primary text-xs mt-1 hover:underline"
                >
                  Use this query
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sql-editor flex-grow mb-3 min-h-[200px]" onKeyDown={handleKeyDown}>
        <CodeMirror
          value={query}
          height="200px"
          extensions={[sql()]}
          theme={oneDark}
          onChange={handleChange}
          className="rounded-md border border-gray-300 dark:border-gray-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Press Ctrl+Enter to execute
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <FiClock className="animate-pulse" />
              Running...
            </>
          ) : (
            <>
              <FiPlay />
              Execute Query
            </>
          )}
        </button>
      </div>

      <div className="text-xs mt-4 text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> For safety, destructive operations like{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">DROP</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">DELETE</code>, and{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">TRUNCATE</code> are blocked.
        </p>
      </div>
    </div>
  );
};

export default SQLEditor;