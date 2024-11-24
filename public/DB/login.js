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
document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Mencegah form untuk disubmit secara langsung

  // Di sini, Anda bisa menambahkan validasi atau logika lain sebelum pengalihan
  // Misalnya, kirim data ke server dan tunggu respon untuk memastikan signup berhasil

  // Jika signup berhasil, arahkan ke index.html
  window.location.href = 'index.html'; // Pengalihan ke index.html setelah signup
});

// Menangani pengiriman form login
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Mencegah form untuk disubmit secara langsung

  // Di sini, Anda bisa menambahkan validasi atau logika lain sebelum pengalihan
  // Misalnya, kirim data ke server dan tunggu respon untuk memastikan login berhasil

  // Jika login berhasil, arahkan ke index.html
  window.location.href = 'index.html'; // Pengalihan ke index.html setelah login
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Mencegah form untuk disubmit secara langsung

  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  // Kirim data login ke server
  const response = await fetch('/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
      // Jika login berhasil, arahkan ke index.html
      window.location.href = 'index.html';
  } else {
      // Tampilkan pesan kesalahan jika login gagal
      alert('Login failed: ' + await response.text());
  }
});
