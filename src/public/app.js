const API_BASE_URL = 'http://localhost:3000/users'; // Base URL backend untuk user

// Elemen DOM
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const todoSection = document.getElementById('todo-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');

let token = null;

// Navigasi antara Login dan Register
showRegister.addEventListener('click', () => {
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
});

showLogin.addEventListener('click', () => {
  registerSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      token = data.token;
      alert('Login successful! Redirecting to dashboard...');
      window.location.href = 'http://localhost:4000/index.html'; // Redirect to index.html after successful login
    } else {
      alert('Login failed');
    }
  } catch (err) {
    alert('An error occurred');
  }
});

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert('Registration successful! Please login.');
      registerSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    } else {
      alert('Registration failed');
    }
  } catch (err) {
    alert('An error occurred');
  }
});