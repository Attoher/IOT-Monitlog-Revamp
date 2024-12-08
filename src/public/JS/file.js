const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');

document.getElementById('file-upload').addEventListener('change', (e) => {
    document.getElementById('file-name').textContent = e.target.files[0]?.name || 'Belum ada file';
  });
  
