import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { FiAward, FiCheck, FiX, FiHelpCircle, FiEye, FiEyeOff, FiPlay } from 'react-icons/fi';

// Practice questions with different difficulty levels
const practiceQuestions = [
  {
    id: 1,
    title: 'List All Users',
    description: 'Write a query to retrieve all users from the database.',
    difficulty: 'easy',
    hint: 'Use the SELECT * statement with the users table.',
    expected: 'SELECT * FROM users;',
    solution: 'SELECT * FROM users;',
  },
  {
    id: 2,
    title: 'Find Users Over 30',
    description: 'Find all users who are over 30 years old.',
    difficulty: 'easy',
    hint: 'Use the WHERE clause with the age column to filter users.',
    expected: 'SELECT * FROM users WHERE age > 30;',
    solution: 'SELECT * FROM users WHERE age > 30;',
  },
  {
    id: 3,
    title: 'Count Products by Category',
    description: 'Count how many products are in each category.',
    difficulty: 'medium',
    hint: 'Use GROUP BY with the COUNT() function.',
    expected: 'SELECT category_id, COUNT(*) FROM products GROUP BY category_id;',
    solution: 'SELECT category_id, COUNT(*) as product_count\nFROM products\nGROUP BY category_id;',
  },
  {
    id: 4,
    title: 'Find Top 5 Expensive Products',
    description: 'Find the 5 most expensive products in the database.',
    difficulty: 'medium',
    hint: 'Use the ORDER BY and LIMIT clauses.',
    expected: 'SELECT * FROM products ORDER BY price DESC LIMIT 5;',
    solution: 'SELECT * FROM products\nORDER BY price DESC\nLIMIT 5;',
  },
  {
    id: 5,
    title: 'User Orders with Product Names',
    description: 'List all orders with user names and the products they ordered.',
    difficulty: 'hard',
    hint: 'You need to JOIN three tables: users, orders, and order_items with products.',
    expected: 'SELECT users.name, products.name FROM users JOIN orders ON users.id = orders.user_id JOIN order_items ON orders.id = order_items.order_id JOIN products ON order_items.product_id = products.id;',
    solution: `SELECT 
  users.name as user_name, 
  products.name as product_name,
  order_items.quantity,
  orders.order_date
FROM users 
JOIN orders ON users.id = orders.user_id
JOIN order_items ON orders.id = order_items.order_id
JOIN products ON order_items.product_id = products.id;`,
  },
  {
    id: 6,
    title: 'Department Salary Statistics',
    description: 'Calculate the minimum, maximum, and average salary for each department.',
    difficulty: 'hard',
    hint: 'Use GROUP BY with multiple aggregate functions (MIN, MAX, AVG).',
    expected: 'SELECT department_id, MIN(salary), MAX(salary), AVG(salary) FROM employees GROUP BY department_id;',
    solution: `SELECT 
  departments.name as department_name,
  MIN(salary) as min_salary,
  MAX(salary) as max_salary,
  AVG(salary) as avg_salary,
  COUNT(*) as employee_count
FROM employees
JOIN departments ON employees.department_id = departments.id
GROUP BY departments.name
ORDER BY avg_salary DESC;`,
  },
  {
    id: 7,
    title: 'Recent Orders with Status',
    description: 'Find the 10 most recent orders and their status.',
    difficulty: 'medium',
    hint: 'Use the ORDER BY clause with a date column and LIMIT.',
    expected: 'SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;',
    solution: `SELECT 
  orders.id,
  users.name as customer_name,
  orders.order_date,
  orders.status,
  orders.total_amount
FROM orders
JOIN users ON orders.user_id = users.id
ORDER BY orders.order_date DESC
LIMIT 10;`,
  },
  {
    id: 8,
    title: 'Customers with No Orders',
    description: 'Find all users who have not placed any orders.',
    difficulty: 'medium',
    hint: 'Use a LEFT JOIN with a WHERE clause to find NULL values.',
    expected: 'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE orders.id IS NULL;',
    solution: `SELECT 
  users.id,
  users.name,
  users.email
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE orders.id IS NULL;`,
  }
];

const PracticeMode = ({ onRunQuery }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'easy', 'medium', 'hard'

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setUserQuery('');
    setShowSolution(false);
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    if (!userQuery.trim()) return;
    
    // This is a simplified check - in a real app, you'd compare execution results
    const simplifiedUserQuery = userQuery.toLowerCase().replace(/\s+/g, ' ').trim();
    const simplifiedExpected = selectedQuestion.expected.toLowerCase().replace(/\s+/g, ' ').trim();
    
    const isCorrect = simplifiedUserQuery === simplifiedExpected || 
                      // Additional check for variations that may still be correct
                      simplifiedUserQuery.includes(simplifiedExpected.replace(';', ''));
    
    setFeedback({
      correct: isCorrect,
      message: isCorrect 
        ? 'Great job! Your query is correct.' 
        : 'Not quite right. Your query doesn\'t match the expected solution.'
    });
    
    // Execute the query to show the results
    onRunQuery(userQuery);
  };

  const handleViewSolution = () => {
    setShowSolution(!showSolution);
    if (!showSolution) {
      setUserQuery(selectedQuestion.solution);
    }
  };

  const filteredQuestions = filter === 'all' 
    ? practiceQuestions 
    : practiceQuestions.filter(q => q.difficulty === filter);

  const difficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Question List */}
      <div className="lg:col-span-1">
        <div className="card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Practice Questions</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('easy')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                Easy
              </button>
              <button 
                onClick={() => setFilter('medium')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                Medium
              </button>
              <button 
                onClick={() => setFilter('hard')}
                className={`px-3 py-1 text-sm rounded-md ${filter === 'hard' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                Hard
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[500px]">
            {filteredQuestions.map((question) => (
              <div 
                key={question.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedQuestion?.id === question.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                onClick={() => handleSelectQuestion(question)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{question.title}</h3>
                  {difficultyBadge(question.difficulty)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {question.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Question Editor */}
      <div className="lg:col-span-2">
        {selectedQuestion ? (
          <div className="card">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedQuestion.title}</h2>
                {difficultyBadge(selectedQuestion.difficulty)}
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {selectedQuestion.description}
              </p>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Your SQL Query</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowSolution(!showSolution)}
                    className="btn btn-outline text-sm px-3 py-1 flex items-center gap-1"
                  >
                    {showSolution ? <FiEyeOff /> : <FiEye />}
                    {showSolution ? 'Hide Solution' : 'View Solution'}
                  </button>
                  <button 
                    className="btn btn-outline text-sm px-3 py-1 flex items-center gap-1"
                    title={selectedQuestion.hint}
                  >
                    <FiHelpCircle />
                    Hint
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <CodeMirror
                  value={userQuery}
                  height="150px"
                  extensions={[sql()]}
                  theme={oneDark}
                  onChange={(value) => setUserQuery(value)}
                  className="rounded-md border border-gray-300 dark:border-gray-600"
                />
              </div>
              
              {showSolution && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Solution</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
                    {selectedQuestion.solution}
                  </pre>
                </div>
              )}
              
              {feedback && (
                <div className={`mb-4 p-4 rounded-md ${feedback.correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
                  <div className="flex items-center gap-2">
                    {feedback.correct ? <FiCheck className="text-green-500" /> : <FiX className="text-red-500" />}
                    <span>{feedback.message}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitAnswer}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FiPlay />
                  Run Query
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <FiAward className="text-3xl text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Practice Question</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Choose a question from the list to practice your SQL skills
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeMode;