import React from 'react';
import { FiClock, FiChevronRight, FiTrash2 } from 'react-icons/fi';

const QueryHistory = ({ history = [], onSelectQuery }) => {
  if (history.length === 0) {
    return (
      <div className="card p-6 text-center">
        <FiClock className="text-3xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Query History</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Your executed queries will appear here
        </p>
      </div>
    );
  }

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Truncate long queries for display in the list
  const truncateQuery = (query, maxLength = 50) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Query History</h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <FiClock className="mr-1" />
                {formatTimestamp(item.timestamp)}
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => onSelectQuery(item.query)}
                  className="text-primary hover:text-primary-dark text-xs flex items-center"
                  title="Use this query"
                >
                  Use <FiChevronRight className="ml-1" />
                </button>
              </div>
            </div>
            
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {item.query}
            </pre>
          </div>
        ))}
      </div>
      
      {history.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
          <button 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center ml-auto"
          >
            <FiTrash2 className="mr-1" />
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default QueryHistory;