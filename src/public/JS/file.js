document.getElementById('file-upload').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Initialize Tingle modal
    const modal = new tingle.modal({
        footer: true,
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
        closeLabel: "Tutup",
    });

    // Set modal content
    modal.setContent(`
        <div class="upload-modal">
            <h2>Pilih Jenis Data untuk Diunggah</h2>
            <div class="upload-options">
                <button class="upload-option" data-type="temperature">
                    <span class="material-symbols-outlined">device_thermostat</span>
                    <span>Data Suhu</span>
                </button>
                <button class="upload-option" data-type="humidity">
                    <span class="material-symbols-outlined">humidity_percentage</span>
                    <span>Data Kelembapan</span>
                </button>
                <button class="upload-option" data-type="power">
                    <span class="material-symbols-outlined">electric_bolt</span>
                    <span>Data Listrik</span>
                </button>
            </div>
        </div>
    `);

    // Add footer buttons
    modal.addFooterBtn('Batal', 'tingle-btn tingle-btn--danger', function() {
        modal.close();
    });

    // Open modal
    modal.open();

    // Handle option clicks
    const options = modal.modalBox.querySelectorAll('.upload-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.dataset.type;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';

            fileInput.onchange = async function(e) {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    // Update file name display
                    document.getElementById('file-name').textContent = file.name;

                    const fileContent = await file.text();
                    const jsonData = JSON.parse(fileContent);

                    // Determine endpoint based on type
                    const endpoints = {
                        temperature: '/temperature/data',
                        humidity: '/humidity/data',
                        power: '/power/data'
                    };

                    const response = await fetch(endpoints[type], {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(jsonData)
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    // Show success notification
                    const typeNames = {
                        temperature: 'suhu',
                        humidity: 'kelembapan',
                        power: 'listrik'
                    };
                    
                    showNotification('success', `Data ${typeNames[type]} berhasil diunggah`);
                    modal.close();

                } catch (error) {
                    console.error('Error:', error);
                    showNotification('error', 'Gagal mengunggah file. Pastikan format JSON valid.');
                }
            };

            fileInput.click();
        });
    });
});

// Helper function for notifications
function showNotification(type, message) {
    const notyf = new Notyf({
        duration: 3000,
        position: {
            x: 'right',
            y: 'top',
        },
        types: [
            {
                type: 'success',
                background: '#22c55e'
            },
            {
                type: 'error',
                background: '#ef4444'
            }
        ]
    });
    notyf[type](message);
}

