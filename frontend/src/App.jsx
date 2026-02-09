import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Registration form
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  
  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // Wallet operations
  const [creditAmount, setCreditAmount] = useState('');
  const [debitAmount, setDebitAmount] = useState('');

  useEffect(() => {
    if (token) {
      fetchWallet();
      fetchTransactions();
    }
  }, [token]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, regForm);
      showMessage('Registration successful! Please login.', 'success');
      setRegForm({ name: '', email: '', password: '' });
    } catch (error) {
      showMessage(error.response?.data?.error?.message || 'Registration failed', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, loginForm);
      const { accessToken } = response.data.data.tokens;
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      setUser(response.data.data.user);
      showMessage('Login successful!', 'success');
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      showMessage(error.response?.data?.error?.message || 'Login failed', 'error');
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallet(response.data.data);
    } catch (error) {
      console.error('Fetch wallet error:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/api/wallet/credit`,
        { amount: parseFloat(creditAmount), description: 'Deposit' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Idempotency-Key': `credit-${Date.now()}-${Math.random()}`
          }
        }
      );
      showMessage(`Successfully credited $${creditAmount}`, 'success');
      setCreditAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      showMessage(error.response?.data?.error?.message || 'Credit failed', 'error');
    }
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/api/wallet/debit`,
        { amount: parseFloat(debitAmount), description: 'Withdrawal' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Idempotency-Key': `debit-${Date.now()}-${Math.random()}`
          }
        }
      );
      showMessage(`Successfully debited $${debitAmount}`, 'success');
      setDebitAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      showMessage(error.response?.data?.error?.message || 'Debit failed', 'error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setWallet(null);
    setTransactions([]);
    localStorage.removeItem('token');
    showMessage('Logged out successfully', 'success');
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🏦 Banking Microservices</h1>
        <p>Secure Digital Wallet System</p>
      </div>

      <div className="container">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {!token ? (
          <div className="auth-forms">
            <div className="form-section">
              <h2>Register</h2>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Min 8 characters"
                    required
                    minLength="8"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </form>
            </div>

            <div className="form-section">
              <h2>Login</h2>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Sign In</button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="wallet-section">
              <div className="wallet-balance">
                <h3>Current Balance</h3>
                <div className="balance">
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="wallet-actions">
                <div className="action-card">
                  <h4>💰 Deposit</h4>
                  <form onSubmit={handleCredit}>
                    <div className="form-group">
                      <input
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="Amount"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-success">Credit</button>
                  </form>
                </div>

                <div className="action-card">
                  <h4>💸 Withdraw</h4>
                  <form onSubmit={handleDebit}>
                    <div className="form-group">
                      <input
                        type="number"
                        value={debitAmount}
                        onChange={(e) => setDebitAmount(e.target.value)}
                        placeholder="Amount"
                        step="0.01"
                        min="0.01"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-danger">Debit</button>
                  </form>
                </div>
              </div>
            </div>

            <div className="transactions">
              <h3>📊 Transaction History</h3>
              <div className="transaction-list">
                {transactions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx._id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-type">
                          {tx.type === 'CREDIT' ? '📥' : '📤'} {tx.type}
                        </div>
                        <div className="transaction-desc">{tx.description}</div>
                        <div className="transaction-date">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="transaction-amount">
                        <div className={`amount ${tx.type.toLowerCase()}`}>
                          {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <div className="transaction-date">
                          Balance: ${tx.balanceAfter.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="logout-section">
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
