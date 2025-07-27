const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database simulation
let database = {
  users: [],
  categories: [],
  products: [],
  departments: [],
  employees: [],
  orders: [],
  order_items: []
};

// Initialize database with sample data
function initializeDatabase() {
  console.log('Initializing in-memory database with sample data...');
  
  // Categories
  database.categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' },
    { id: 4, name: 'Home & Kitchen' },
    { id: 5, name: 'Sports & Outdoors' }
  ];
  
  // Users
  for (let i = 1; i <= 50; i++) {
    const age = 18 + Math.floor(Math.random() * 50);
    database.users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: age,
      created_at: new Date().toISOString()
    });
  }
  
  // Products
  for (let i = 1; i <= 100; i++) {
    const categoryId = 1 + Math.floor(Math.random() * 5);
    const price = (10 + Math.random() * 990).toFixed(2);
    database.products.push({
      id: i,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: parseFloat(price),
      category_id: categoryId,
      created_at: new Date().toISOString()
    });
  }
  
  // Departments
  database.departments = [
    { id: 1, name: 'Engineering', location: 'Building A' },
    { id: 2, name: 'Marketing', location: 'Building B' },
    { id: 3, name: 'Sales', location: 'Building C' },
    { id: 4, name: 'Human Resources', location: 'Building A' },
    { id: 5, name: 'Customer Support', location: 'Building D' }
  ];
  
  // Employees
  for (let i = 1; i <= 50; i++) {
    const departmentId = 1 + Math.floor(Math.random() * 5);
    const salary = (30000 + Math.random() * 70000).toFixed(2);
    database.employees.push({
      id: i,
      name: `Employee ${i}`,
      email: `employee${i}@example.com`,
      department_id: departmentId,
      salary: parseFloat(salary),
      hire_date: new Date().toISOString()
    });
  }
  
  // Orders
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  for (let i = 1; i <= 200; i++) {
    const userId = 1 + Math.floor(Math.random() * 50);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalAmount = (50 + Math.random() * 450).toFixed(2);
    
    database.orders.push({
      id: i,
      user_id: userId,
      order_date: new Date().toISOString(),
      status: status,
      total_amount: parseFloat(totalAmount)
    });
    
    // Add order items
    const itemCount = 1 + Math.floor(Math.random() * 5);
    for (let j = 0; j < itemCount; j++) {
      const productId = 1 + Math.floor(Math.random() * 100);
      const quantity = 1 + Math.floor(Math.random() * 5);
      const price = (10 + Math.random() * 190).toFixed(2);
      
      database.order_items.push({
        id: database.order_items.length + 1,
        order_id: i,
        product_id: productId,
        quantity: quantity,
        price: parseFloat(price)
      });
    }
  }
  
  console.log('Database initialized with sample data!');
  console.log(`Initialized with: ${database.users.length} users, ${database.products.length} products, ${database.orders.length} orders, ${database.employees.length} employees`);
}

// Simple SQL parser for basic SELECT queries
function executeQuery(query) {
  const trimmedQuery = query.trim().toLowerCase();
  
  // Handle simple SELECT * FROM table queries
  if (trimmedQuery.startsWith('select * from users')) {
    return database.users;
  } else if (trimmedQuery.startsWith('select * from categories')) {
    return database.categories;
  } else if (trimmedQuery.startsWith('select * from products')) {
    return database.products;
  } else if (trimmedQuery.startsWith('select * from departments')) {
    return database.departments;
  } else if (trimmedQuery.startsWith('select * from employees')) {
    return database.employees;
  } else if (trimmedQuery.startsWith('select * from orders')) {
    return database.orders;
  } else if (trimmedQuery.startsWith('select * from order_items')) {
    return database.order_items;
  }
  
  // Handle simple WHERE clauses
  if (trimmedQuery.includes('where')) {
    if (trimmedQuery.includes('users') && trimmedQuery.includes('age >')) {
      const ageMatch = query.match(/age\s*>\s*(\d+)/i);
      if (ageMatch) {
        const minAge = parseInt(ageMatch[1]);
        return database.users.filter(user => user.age > minAge);
      }
    }
  }
  
  // Handle LIMIT
  if (trimmedQuery.includes('limit')) {
    const limitMatch = query.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      if (trimmedQuery.includes('users')) {
        return database.users.slice(0, limit);
      } else if (trimmedQuery.includes('products')) {
        return database.products.slice(0, limit);
      }
    }
  }
  
  // Default: return users for any unrecognized query
  return database.users.slice(0, 10);
}

// API endpoint to execute SQL queries
app.post('/api/execute-sql', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Validate the query to prevent harmful operations
    if (isHarmfulQuery(query)) {
      return res.status(403).json({ 
        error: 'Harmful operations like DROP, DELETE, TRUNCATE are not allowed in this learning environment'
      });
    }
    
    const startTime = performance.now();
    
    // Execute the query
    const result = executeQuery(query);
    
    // Extract column names from the first row
    const columns = result.length > 0 ? Object.keys(result[0]) : [];
    
    // Convert to format expected by frontend
    const formattedResult = {
      columns,
      rows: result,
      metadata: {
        executionTime: Math.round(performance.now() - startTime),
        highlightedRows: [],
        highlightedCells: []
      }
    };
    
    return res.json(formattedResult);
  } catch (err) {
    console.error('Error executing query:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

// API endpoint to get database schema
app.get('/api/schema', (req, res) => {
  try {
    const schema = {
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
        categories: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimary: true },
            { name: 'name', type: 'TEXT', isPrimary: false }
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
        departments: {
          columns: [
            { name: 'id', type: 'INTEGER', isPrimary: true },
            { name: 'name', type: 'TEXT', isPrimary: false },
            { name: 'location', type: 'TEXT', isPrimary: false }
          ],
          foreignKeys: []
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
        }
      }
    };
    
    return res.json(schema);
  } catch (err) {
    console.error('Error getting schema:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Function to check if a query contains harmful operations
function isHarmfulQuery(query) {
  const harmful = /\b(drop|delete|truncate|alter\s+table|pragma\s+writable_schema)\b/i;
  return harmful.test(query);
}

// Initialize database
initializeDatabase();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});