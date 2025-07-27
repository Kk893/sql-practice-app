# SQL Practice App

An interactive web application for learning and practicing SQL queries with a simulated database environment.

## Features

- **Interactive SQL Editor**: Terminal-like UI with syntax highlighting for writing SQL queries
- **Real-time Query Execution**: Execute SQL queries against a simulated database
- **Visual Results Display**: View query results in a well-formatted table with highlighting
- **Multiple Database Tables**: Practice with realistic data across various related tables
- **Query Validation**: Safe execution with validation to prevent harmful operations
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Query History**: Save and review previously executed queries
- **Practice Mode**: Guided challenges with common SQL tasks to improve skills
- **Schema Viewer**: Visualize database tables and their relationships

## Screenshots

![SQL Practice App](screenshots/app-screenshot.png)

## Database Schema

The application includes the following tables with relationships:

- **users**: User profiles with personal information (id, name, email, age)
- **products**: Product catalog with details and pricing (id, name, description, price, category_id)
- **categories**: Product categories (id, name)
- **orders**: Customer orders (id, user_id, order_date, status, total_amount)
- **order_items**: Items within orders (id, order_id, product_id, quantity, price)
- **employees**: Employee information (id, name, email, department_id, salary, hire_date)
- **departments**: Company departments (id, name, location)

## Tech Stack

- **Frontend**: React, TailwindCSS, CodeMirror (for SQL editor)
- **Backend**: Node.js with Express
- **Database**: SQLite (in-memory)
- **Tools**: Axios, React-Toastify, Zustand

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation & Running the App

1. **Clone the repository:**
   ```
   git clone https://github.com/s1t2g0/sql-practice-app.git
   cd sql-practice-app
   ```

2. **Install all dependencies:**
   ```
   npm run install-all
   ```
   This will install dependencies for the root project, frontend, and backend.

3. **Start the application:**
   ```
   npm start
   ```
   This will start both the backend server (http://localhost:5000) and frontend development server (http://localhost:3000) concurrently.

4. **For development:**
   ```
   npm run dev
   ```
   This starts the backend with nodemon for automatic restarts on code changes.

## Usage Examples

Try these example SQL queries in the application:

### Basic Query
```sql
SELECT * FROM users WHERE age > 30;
```

### Join Query
```sql
SELECT users.name AS customer, 
       products.name AS product,
       order_items.quantity,
       orders.order_date
FROM users 
JOIN orders ON users.id = orders.user_id
JOIN order_items ON orders.id = order_items.order_id
JOIN products ON order_items.product_id = products.id
LIMIT 20;
```

### Aggregate Query
```sql
SELECT departments.name AS department, 
       COUNT(*) AS employee_count,
       AVG(salary) AS average_salary,
       MAX(salary) AS highest_salary
FROM employees 
JOIN departments ON employees.department_id = departments.id
GROUP BY departments.name
ORDER BY average_salary DESC;
```

### Filtering with Multiple Conditions
```sql
SELECT products.name, products.price, categories.name AS category
FROM products
JOIN categories ON products.category_id = categories.id
WHERE products.price > 500
   OR categories.name = 'Electronics'
ORDER BY products.price DESC
LIMIT 15;
```

## Practice Mode

The application includes a practice mode with guided challenges to help you improve your SQL skills. These challenges range from simple queries to more complex ones involving multiple joins and aggregations.

## Project Structure

```
sql-practice-app/
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── hooks/          # Custom React hooks
│       ├── store/          # State management
│       ├── styles/         # CSS/TailwindCSS
│       └── utils/          # Utility functions
├── backend/                # Node.js backend
│   ├── public/             # Static files
│   └── server.js           # Express server and database setup
└── README.md               # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Live Website

<a href="https://sql-app-frontend.onrender.com/" target="_blank">
  <img src="https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=google-chrome" alt="Live Demo Button"/>
</a>

## 🔗 Live Website(work not properly)

<a href="https://sqlapp.work.gd" target="_blank">
  <img src="https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logo=google-chrome" alt="Live Demo Button"/>
</a>

