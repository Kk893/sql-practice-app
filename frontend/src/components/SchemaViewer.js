import React, { useState, useEffect } from 'react';
import { FiDatabase, FiKey, FiLink, FiChevronRight, FiChevronDown, FiLoader } from 'react-icons/fi';

const SchemaViewer = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTables, setExpandedTables] = useState({});

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch('/api/schema');
        if (!response.ok) {
          throw new Error('Failed to fetch database schema');
        }
        const data = await response.json();
        setSchema(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  if (loading) {
    return (
      <div className="card flex flex-col items-center justify-center py-12">
        <FiLoader className="animate-spin text-primary text-3xl mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading database schema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
          <h3 className="font-semibold mb-1">Error Loading Schema</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Use mock schema data for development until backend is ready
  const mockSchema = {
    tables: {
      users: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT', isPrimary: false },
          { name: 'email', type: 'TEXT', isPrimary: false },
          { name: 'age', type: 'INTEGER', isPrimary: false },
          { name: 'created_at', type: 'TIMESTAMP', isPrimary: false }
        ],
        foreignKeys: []
      },
      products: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT', isPrimary: false },
          { name: 'description', type: 'TEXT', isPrimary: false },
          { name: 'price', type: 'REAL', isPrimary: false },
          { name: 'category_id', type: 'INTEGER', isPrimary: false },
          { name: 'created_at', type: 'TIMESTAMP', isPrimary: false }
        ],
        foreignKeys: [
          { column: 'category_id', reference: { table: 'categories', column: 'id' } }
        ]
      },
      categories: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT', isPrimary: false }
        ],
        foreignKeys: []
      },
      orders: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'user_id', type: 'INTEGER', isPrimary: false },
          { name: 'order_date', type: 'TIMESTAMP', isPrimary: false },
          { name: 'status', type: 'TEXT', isPrimary: false },
          { name: 'total_amount', type: 'REAL', isPrimary: false }
        ],
        foreignKeys: [
          { column: 'user_id', reference: { table: 'users', column: 'id' } }
        ]
      },
      order_items: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'order_id', type: 'INTEGER', isPrimary: false },
          { name: 'product_id', type: 'INTEGER', isPrimary: false },
          { name: 'quantity', type: 'INTEGER', isPrimary: false },
          { name: 'price', type: 'REAL', isPrimary: false }
        ],
        foreignKeys: [
          { column: 'order_id', reference: { table: 'orders', column: 'id' } },
          { column: 'product_id', reference: { table: 'products', column: 'id' } }
        ]
      },
      employees: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT', isPrimary: false },
          { name: 'email', type: 'TEXT', isPrimary: false },
          { name: 'department_id', type: 'INTEGER', isPrimary: false },
          { name: 'salary', type: 'REAL', isPrimary: false },
          { name: 'hire_date', type: 'TIMESTAMP', isPrimary: false }
        ],
        foreignKeys: [
          { column: 'department_id', reference: { table: 'departments', column: 'id' } }
        ]
      },
      departments: {
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'TEXT', isPrimary: false },
          { name: 'location', type: 'TEXT', isPrimary: false }
        ],
        foreignKeys: []
      }
    }
  };

  // Use the actual schema from the API or the mock data for development
  const schemaData = schema || mockSchema;

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Database Schema</h2>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This database contains {Object.keys(schemaData.tables).length} tables with foreign key relationships.
          Click on a table to view its columns and relationships.
        </p>
        
        <div className="space-y-3">
          {Object.entries(schemaData.tables).map(([tableName, tableData]) => (
            <div key={tableName} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                onClick={() => toggleTable(tableName)}
              >
                <div className="flex items-center">
                  <FiDatabase className="mr-2 text-primary" />
                  <span className="font-medium">{tableName}</span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({tableData.columns.length} columns)
                  </span>
                </div>
                {expandedTables[tableName] ? <FiChevronDown /> : <FiChevronRight />}
              </div>
              
              {expandedTables[tableName] && (
                <div className="p-3 bg-white dark:bg-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="py-2 px-3 text-left">Column</th>
                        <th className="py-2 px-3 text-left">Type</th>
                        <th className="py-2 px-3 text-left">Constraints</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tableData.columns.map((column, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-2 px-3 flex items-center">
                            {column.isPrimary && <FiKey className="text-yellow-500 mr-1" title="Primary Key" />}
                            {tableData.foreignKeys.some(fk => fk.column === column.name) && 
                              <FiLink className="text-blue-500 mr-1" title="Foreign Key" />}
                            {column.name}
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{column.type}</td>
                          <td className="py-2 px-3">
                            {column.isPrimary && <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">PRIMARY KEY</span>}
                            {tableData.foreignKeys.some(fk => fk.column === column.name) && 
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full ml-1">
                                FOREIGN KEY → {tableData.foreignKeys.find(fk => fk.column === column.name).reference.table}.
                                {tableData.foreignKeys.find(fk => fk.column === column.name).reference.column}
                              </span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchemaViewer;