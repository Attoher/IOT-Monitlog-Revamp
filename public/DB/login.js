document.querySelectorAll(".form input, .form textarea").forEach(function (input) {
    input.addEventListener("keyup", handleEvent);
    input.addEventListener("blur", handleEvent);
    input.addEventListener("focus", handleEvent);
  });
  
  function handleEvent(e) {
    const label = this.previousElementSibling;
  
    if (e.type === "keyup") {
      if (this.value === "") {
        label.classList.remove("active", "highlight");
      } else {
        label.classList.add("active", "highlight");
      }
    } else if (e.type === "blur") {
      if (this.value === "") {
        label.classList.remove("active", "highlight");
      } else {
        label.classList.remove("highlight");
      }
    } else if (e.type === "focus") {
      if (this.value === "") {
        label.classList.remove("highlight");
      } else {
        label.classList.add("highlight");
      }
    }
  }
  
  document.querySelectorAll(".tab a").forEach(function (tab) {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
  
      const parent = this.parentElement;
      parent.classList.add("active");
      Array.from(parent.parentElement.children).forEach((sibling) => {
        if (sibling !== parent) sibling.classList.remove("active");
      });
  
      const target = document.querySelector(this.getAttribute("href"));
  
      document.querySelectorAll(".tab-content > div").forEach((div) => {
        if (div !== target) div.style.display = "none";
      });
  
      target.style.display = "block";
      target.style.opacity = 0;
      setTimeout(() => target.style.opacity = 1, 10); // for fade effect
    });
  });
  
  // Menangani pengiriman form signup
  document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Mencegah reload halaman
  
    // Ambil nilai dari input form
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    // Validasi sederhana
    if (!email || !password) {
      document.getElementById('message').innerText = 'Email dan password harus diisi.';
      return;
    }
  
    // Data yang akan dikirim ke server
    const data = { email, password };
  
    // Kirim data menggunakan Fetch API
    fetch('http://localhost:3000/0login.html', {
      method: 'POST', // HTTP method
      headers: {
        'Content-Type': 'application/json', // Jenis konten
      },
      body: JSON.stringify(data), // Konversi data ke JSON
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Signup gagal, server mengembalikan respons gagal');
        }
        return response.json();
      })
      .then((result) => {
        // Tampilkan pesan dari server
        if (result.message) {
          document.getElementById('message').innerText = result.message;
        } else if (result.error) {
          document.getElementById('message').innerText = result.error;
        }
      })
      .catch((error) => {
        // Tangkap kesalahan jika request gagal
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Terjadi kesalahan. Coba lagi.';
      });
  });
  
  

// Menangani pengiriman form login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Mencegah form untuk disubmit secara langsung

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  try {
    // Kirim data login ke server
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      // Jika login berhasil, redirect ke index.html
      window.location.href = 'index.html';
    } else {
      // Jika login gagal, tampilkan pesan kesalahan
      const errorMessage = await response.json();
      alert('Login gagal: ' + errorMessage.error);
    }
  } catch (error) {
    // Tangani jika ada kesalahan dalam permintaan (misalnya masalah jaringan)
    alert('Terjadi kesalahan: ' + error.message);
  }
});



