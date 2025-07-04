import React from 'react';
import { FiAlertCircle, FiLoader, FiDatabase, FiClock, FiGrid } from 'react-icons/fi';

const ResultsViewer = ({ results, error, loading }) => {
  if (loading) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <FiLoader className="animate-spin text-primary text-3xl mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Executing query...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          <FiAlertCircle className="text-xl mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Query Error</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center">
        <FiDatabase className="text-3xl text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Execute a SQL query using the editor to see results here
        </p>
      </div>
    );
  }

  const { columns, rows, metadata } = results;

  if (rows.length === 0) {
    return (
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Query Results</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiClock className="text-gray-400" />
              <span>{metadata?.executionTime || 0}ms</span>
              
              <span className="mx-2">•</span>
              
              <FiGrid className="text-gray-400" />
              <span>0 rows</span>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Query executed successfully, but returned no data.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Query Results</h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiClock className="text-gray-400" />
            <span>{metadata?.executionTime || 0}ms</span>
            
            <span className="mx-2">•</span>
            
            <FiGrid className="text-gray-400" />
            <span>{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={metadata?.highlightedRows?.includes(rowIndex) ? 'highlighted-row' : ''}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className={metadata?.highlightedCells?.some(
                        cell => cell.row === rowIndex && cell.col === colIndex
                      ) ? 'highlighted-cell' : ''}
                    >
                      {renderCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length > 10 && (
          <div className="mt-3 text-right text-sm text-gray-500 dark:text-gray-400">
            Showing all {rows.length} rows
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to render cell values appropriately
const renderCellValue = (value) => {
  if (value === null) return <span className="text-gray-400 italic">NULL</span>;
  if (value === undefined) return <span className="text-gray-400 italic">undefined</span>;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  
  return String(value);
};

export default ResultsViewer;