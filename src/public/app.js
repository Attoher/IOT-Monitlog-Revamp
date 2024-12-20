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
const overlay = document.createElement('div'); // Create overlay dynamically
overlay.classList.add('overlay'); // Add overlay class
document.body.appendChild(overlay); // Append overlay to the body

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

      // Show overlay (everything except SweetAlert will turn black)
      overlay.classList.add('show');

      // SweetAlert popup
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Redirecting to dashboard...',
        timer: 2000,
        showConfirmButton: true,
        backdrop: `
          rgba(0, 0, 0, 1) url('/images/your-image.gif') left top no-repeat
        `, // Fully opaque black backdrop with optional animated image
        customClass: {
          popup: 'bg-white',  // Solid white background for the SweetAlert
          title: 'text-black', // Optional: Black title text
          content: 'text-black', // Optional: Black content text
        },
      }).then(() => {
        // Hide the left and right sections
        document.querySelector('.left').classList.add('hidden');
        document.querySelector('.right').classList.add('hidden');

        // After 2 seconds, show the sections again
        setTimeout(() => {
          document.querySelector('.left').classList.remove('hidden');
          document.querySelector('.right').classList.remove('hidden');
        }, 500);
        // Redirect to the dashboard page
        window.location.href = 'index.html';
      });
    } else {
      // If login fails
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Username atau password salah.',
        customClass: {
          popup: 'bg-white',  // Solid white background
        },
      });

      // Hide the left and right sections for 2 seconds
      document.querySelector('.left').classList.add('hidden');
      document.querySelector('.right').classList.add('hidden');

      // After 2 seconds, show the sections again
      setTimeout(() => {
        document.querySelector('.left').classList.remove('hidden');
        document.querySelector('.right').classList.remove('hidden');
      }, 2000);
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Silakan coba lagi nanti.',
      customClass: {
        popup: 'bg-white',  // Solid white background
      },
    });

    // Hide the left and right sections for 2 seconds
    document.querySelector('.left').classList.add('hidden');
    document.querySelector('.right').classList.add('hidden');

    // After 2 seconds, show the sections again
    setTimeout(() => {
      document.querySelector('.left').classList.remove('hidden');
      document.querySelector('.right').classList.remove('hidden');
    }, 2000);
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
      Swal.fire({
        icon: 'success',
        title: 'Registrasi Berhasil!',
        text: 'Silakan login untuk melanjutkan.',
        backdrop: `
          rgba(0, 0, 0, 1) url('/images/your-image.gif') left top no-repeat
        `, // Fully opaque black backdrop with optional animated image
        customClass: {
          popup: 'bg-white',  // Solid white background for the SweetAlert
          title: 'text-black', // Optional: Black title text
          content: 'text-black', // Optional: Black content text
        },
      }).then(() => {
        // Hide the left and right sections
        document.querySelector('.left').classList.add('hidden');
        document.querySelector('.right').classList.add('hidden');

        // After 2 seconds, show the sections again
        setTimeout(() => {
          document.querySelector('.left').classList.remove('hidden');
          document.querySelector('.right').classList.remove('hidden');
        }, 500);
        // Redirect to the dashboard page
        window.location.href = 'index.html';
      });
    } else {
      // If registration fails
      Swal.fire({
        icon: 'error',
        title: 'Registrasi Gagal',
        text: 'Username mungkin sudah digunakan.',
        customClass: {
          popup: 'bg-white',  // Solid white background
        },
      });

      // Hide the left and right sections for 2 seconds
      document.querySelector('.left').classList.add('hidden');
      document.querySelector('.right').classList.add('hidden');

      // After 2 seconds, show the sections again
      setTimeout(() => {
        document.querySelector('.left').classList.remove('hidden');
        document.querySelector('.right').classList.remove('hidden');
      }, 2000);
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: 'Silakan coba lagi nanti.',
      customClass: {
        popup: 'bg-white',  // Solid white background
      },
    });

    // Hide the left and right sections for 2 seconds
    document.querySelector('.left').classList.add('hidden');
    document.querySelector('.right').classList.add('hidden');

    // After 2 seconds, show the sections again
    setTimeout(() => {
      document.querySelector('.left').classList.remove('hidden');
      document.querySelector('.right').classList.remove('hidden');
    }, 2000);
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

