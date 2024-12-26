import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom'; // Changed Switch to Routes
import axios from 'axios';
import './App.css'; // Import custom styles

// Navigation Bar Component
const NavBar = () => (
  <div className="navbar">
    <Link to="/enter-expense" className="nav-link">Enter Expense</Link>
    <Link to="/list-expenses" className="nav-link">List All Expenses</Link>
  </div>
);

const MainScreen = () => (
  <div className="main-screen">
    <h1 className="app-title">Expense Tracker</h1>
    <div className="button-container">
      <Link to="/enter-expense">
        <button className="main-button">Enter Expense</button>
      </Link>
      <Link to="/list-expenses">
        <button className="main-button">List All Expenses</button>
      </Link>
    </div>
  </div>
);

const EnterExpenseScreen = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otherCategory, setOtherCategory] = useState('');  // For "Other" category input

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    if (e.target.value !== 'Other') {
      setOtherCategory(''); // Reset custom category if not "Other"
    }
  };

  const saveExpense = async () => {
    if (!category || !amount || !date || (category === 'Other' && !otherCategory)) {
      setError('Category, amount, and date are required');
      setSuccessMessage('');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/expenses', { 
        category: category === 'Other' ? otherCategory : category, 
        amount, 
        date 
      });
      setSuccessMessage('Expense saved successfully!');
      setError('');
      setCategory('');
      setAmount('');
      setDate('');
      setOtherCategory('');
    } catch (err) {
      console.error(err);
      setSuccessMessage('');
      setError('Error saving expense');
    }
  };

  return (
    <div className="form-screen">
      <NavBar /> {/* Navigation Bar */}
      <h2 className="form-title">Enter Expense</h2>
      <div className="form-container">
        <select className="input-field" value={category} onChange={handleCategoryChange}>
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Bus Pass">Bus Pass</option>
          <option value="Cloths">Cloths</option>
          <option value="Birthday Gift">Birthday Gift</option>
          <option value="Anniversary Gift">Anniversary Gift</option>
          <option value="Festive Gift">Festive Gift</option>
          <option value="New Year Gift">New Year Gift</option>
          <option value="Other">Other</option>
        </select>

        {category === 'Other' && (
          <input
            className="input-field"
            type="text"
            placeholder="Enter Custom Category"
            value={otherCategory}
            onChange={(e) => setOtherCategory(e.target.value)}
          />
        )}

        <input
          className="input-field"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="input-field"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button className="submit-button" onClick={saveExpense}>Save Expense</button>
      </div>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const ListExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');

  // Fetch expenses from the backend
  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error fetching expenses');
    }
  };

  // Fetch expenses filtered by date
  const fetchExpensesByDate = async () => {
    if (!filterDate) {
        setError('Please enter a date to filter by');
        return;
    }
    try {
        const response = await axios.get(`http://localhost:5000/api/expenses/date/${filterDate}`);
        setExpenses(response.data);
        setError('');
    } catch (err) {
        console.error(err);
        setError('Error fetching expenses by date');
    }
  };

  return (
    <div className="list-expenses-screen">
      <NavBar /> {/* Navigation Bar */}
      <h2 className="form-title">List Expenses</h2>
      <div className="filter-container">
        <input
          className="input-field"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button className="filter-button" onClick={fetchExpensesByDate}>Filter by Date</button>
        <button className="filter-button" onClick={fetchExpenses}>Show All</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <ul className="expense-list">
        {expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <li key={index} className="expense-item">
              <div>{expense.category}</div>
              <div>{expense.amount}</div>
              <div>{expense.date}</div>
            </li>
          ))
        ) : (
          <p>No expenses found</p>
        )}
      </ul>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/enter-expense" element={<EnterExpenseScreen />} />
        <Route path="/list-expenses" element={<ListExpensesScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
