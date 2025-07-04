const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const Database = require('better-sqlite3');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
let db;
try {
  db = new Database(':memory:'); // In-memory database
  console.log('Connected to SQLite database (in-memory)');
  
  // Initialize database with tables and data
  initializeDatabase(db);
} catch (err) {
  console.error('Error connecting to SQLite database:', err.message);
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
    let result;
    if (query.trim().toLowerCase().startsWith('select') || query.trim().toLowerCase().startsWith('pragma')) {
      // For SELECT queries, return the rows
      result = db.prepare(query).all();
      
      // Extract column names from the first row
      const columns = result.length > 0 ? Object.keys(result[0]) : [];
      
      // Convert to format expected by frontend
      const formattedResult = {
        columns,
        rows: result,
        metadata: {
          executionTime: Math.round(performance.now() - startTime),
          // In a real app, you'd determine highlighted rows/cells based on the query
          highlightedRows: [],
          highlightedCells: []
        }
      };
      
      return res.json(formattedResult);
    } else {
      // For non-SELECT queries (e.g., INSERT, UPDATE)
      result = db.prepare(query).run();
      
      return res.json({
        columns: ['Result'],
        rows: [{ Result: `Query executed successfully. ${result.changes} row(s) affected.` }],
        metadata: {
          executionTime: Math.round(performance.now() - startTime),
          changes: result.changes
        }
      });
    }
  } catch (err) {
    console.error('Error executing query:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

// API endpoint to get database schema
app.get('/api/schema', (req, res) => {
  try {
    const schema = {};
    
    // Get all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    
    schema.tables = {};
    
    // For each table, get its columns and foreign keys
    tables.forEach(table => {
      const tableName = table.name;
      
      // Get columns
      const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
      
      // Get foreign keys
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();
      
      schema.tables[tableName] = {
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          isPrimary: col.pk === 1
        })),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.from,
          reference: {
            table: fk.table,
            column: fk.to
          }
        }))
      };
    });
    
    return res.json(schema);
  } catch (err) {
    console.error('Error getting schema:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Function to check if a query contains harmful operations
function isHarmfulQuery(query) {
  const harmful = /\\b(drop|delete|truncate|alter\\s+table|pragma\\s+writable_schema)\\b/i;
  return harmful.test(query);
}

// Function to initialize the database with tables and sample data
function initializeDatabase(db) {
  console.log('Initializing database with tables and sample data...');
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  db.exec(`
    -- Users table
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Categories table
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
    
    -- Products table
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    
    -- Orders table
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    -- Order items table
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    -- Departments table
    CREATE TABLE departments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT
    );
    
    -- Employees table
    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      department_id INTEGER,
      salary REAL,
      hire_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );
  `);
  
  // Insert sample data
  // Categories
  const categories = [
    { name: 'Electronics' },
    { name: 'Clothing' },
    { name: 'Books' },
    { name: 'Home & Kitchen' },
    { name: 'Sports & Outdoors' }
  ];
  
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  categories.forEach(category => {
    insertCategory.run(category.name);
  });
  
  // Users (50 sample users)
  const insertUser = db.prepare('INSERT INTO users (name, email, age) VALUES (?, ?, ?)');
  for (let i = 1; i <= 50; i++) {
    const age = 18 + Math.floor(Math.random() * 50); // Random age between 18-67
    insertUser.run(`User ${i}`, `user${i}@example.com`, age);
  }
  
  // Products (100 sample products)
  const insertProduct = db.prepare('INSERT INTO products (name, description, price, category_id) VALUES (?, ?, ?, ?)');
  for (let i = 1; i <= 100; i++) {
    const categoryId = 1 + Math.floor(Math.random() * 5); // Random category 1-5
    const price = (10 + Math.random() * 990).toFixed(2); // Random price between 10-1000
    insertProduct.run(
      `Product ${i}`, 
      `Description for product ${i}`, 
      price, 
      categoryId
    );
  }
  
  // Departments
  const departments = [
    { name: 'Engineering', location: 'Building A' },
    { name: 'Marketing', location: 'Building B' },
    { name: 'Sales', location: 'Building C' },
    { name: 'Human Resources', location: 'Building A' },
    { name: 'Customer Support', location: 'Building D' }
  ];
  
  const insertDepartment = db.prepare('INSERT INTO departments (name, location) VALUES (?, ?)');
  departments.forEach(dept => {
    insertDepartment.run(dept.name, dept.location);
  });
  
  // Employees (50 sample employees)
  const insertEmployee = db.prepare('INSERT INTO employees (name, email, department_id, salary) VALUES (?, ?, ?, ?)');
  for (let i = 1; i <= 50; i++) {
    const departmentId = 1 + Math.floor(Math.random() * 5); // Random department 1-5
    const salary = (30000 + Math.random() * 70000).toFixed(2); // Random salary between 30k-100k
    insertEmployee.run(
      `Employee ${i}`, 
      `employee${i}@example.com`, 
      departmentId, 
      salary
    );
  }
  
  // Orders (200 sample orders)
  const insertOrder = db.prepare('INSERT INTO orders (user_id, status, total_amount) VALUES (?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  for (let i = 1; i <= 200; i++) {
    const userId = 1 + Math.floor(Math.random() * 50); // Random user 1-50
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalAmount = (50 + Math.random() * 450).toFixed(2); // Random total between 50-500
    
    const result = insertOrder.run(userId, status, totalAmount);
    const orderId = result.lastInsertRowid;
    
    // Add 1-5 items to each order
    const itemCount = 1 + Math.floor(Math.random() * 5);
    for (let j = 0; j < itemCount; j++) {
      const productId = 1 + Math.floor(Math.random() * 100); // Random product 1-100
      const quantity = 1 + Math.floor(Math.random() * 5); // Random quantity 1-5
      const price = (10 + Math.random() * 190).toFixed(2); // Random price between 10-200
      
      insertOrderItem.run(orderId, productId, quantity, price);
    }
  }
  
  console.log('Database initialized with sample data!');
  
  // Verify data count
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  
  console.log(`Initialized with: ${userCount} users, ${productCount} products, ${orderCount} orders, ${employeeCount} employees`);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});