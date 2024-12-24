const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000/auth'
  : 'https://iot-monitlog-revamp.vercel.app/auth'; // Base URL backend untuk user

// Elemen DOM
const leftSection = document.getElementById('left-section');
const rightSection = document.getElementById('right-section');
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
const overlay = document.createElement('div'); // Create overlay dynamically
overlay.classList.add('overlay'); // Add overlay class
document.body.appendChild(overlay); // Append overlay to the body

let token = null;

// Replace hideBody function with hideSections
function hideSections() {
  const leftSection = document.querySelector('.left');
  const rightSection = document.querySelector('.right');
  
  // Remove transition for instant hide
  leftSection.style.transition = 'none';
  rightSection.style.transition = 'none';
  document.body.style.transition = 'none';
  
  // Force browser reflow
  void leftSection.offsetWidth;
  
  // Apply changes immediately
  leftSection.style.opacity = '0';
  rightSection.style.opacity = '0';
  document.body.style.backgroundColor = '#000';
}

function showSections() {
  const leftSection = document.querySelector('.left');
  const rightSection = document.querySelector('.right');
  
  // Add transition only for showing
  leftSection.style.transition = 'none';
  rightSection.style.transition = 'none';
  document.body.style.transition = 'background-color 0.5s';
  
  leftSection.style.opacity = '1';
  rightSection.style.opacity = '1';
  document.body.style.backgroundColor = '';
}

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
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(data.data));
      
      hideSections(); // Hide sections instead of body

      // Keep existing SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Redirecting to dashboard...',
        timer: 2000,
        showConfirmButton: true,
        backdrop: `rgba(0, 0, 0, 1)`,
        customClass: {
          popup: 'bg-white',
          title: 'text-black',
          content: 'text-black',
        },
      }).then(() => {
        window.location.href = 'index.html';
      });
    } else {
      throw new Error(data.msg || 'Login failed');
    }
  } catch (err) {
    hideSections(); // Hide before showing error
    Swal.fire({
      icon: 'error',
      title: 'Login Gagal',
      text: err.message || 'Username atau password salah.',
      customClass: {
        popup: 'bg-white',
        title: 'text-black',
        content: 'text-black',
      }
    }).then(() => {
      window.location.href = '0login.html';
    });
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
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      hideSections(); // Hide sections instead of body

      // Keep existing success SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Silakan login untuk melanjutkan.',
        backdrop: `rgba(0, 0, 0, 1)`,
        customClass: {
          popup: 'bg-white',
          title: 'text-black',
          content: 'text-black',
        },
      }).then(() => {
        window.location.href = '0login.html';
      });
    } else {
      throw new Error(data.msg || 'Registration failed');
    }
  } catch (err) {
    hideSections(); // Hide before showing error
    Swal.fire({
      icon: 'error',
      title: 'Registrasi Gagal',
      text: err.message || 'Username mungkin sudah digunakan.',
      customClass: {
        popup: 'bg-white',
      },
      didClose: () => {
        showSections(); // Show sections after SweetAlert closes
      }
    }).then(() => {
      window.location.href = '0login.html';
    });
  }
});

const fileInput = document.getElementById('file-upload');
const uploadButton = document.getElementById('upload-btn');
const fileNameDisplay = document.getElementById('file-name');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    fileNameDisplay.textContent = `File dipilih: ${file.name}`;
  } else {
    fileNameDisplay.textContent = 'Belum ada file yang dipilih';
  }
});

