document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-bar input');
    const searchSuggestions = ['home', 'dashboard', 'analytics', 'message', 'settings']; // Possible suggestions
    
    // Handle Enter key press for redirection
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {  // When Enter is pressed
            e.preventDefault();  // Prevent form submission
            
            const query = searchInput.value.toLowerCase();  // Get the input value
            
            // Redirect based on the search query
            if (query === 'home') {
                window.location.href = 'index.html';
            } else if (query === 'dashboard') {
                window.location.href = '1dashboard.html';
            } else if (query === 'analytics') {
                window.location.href = '2analytics.html';
            } else if (query === 'message') {
                window.location.href = '3message.html';
            } else if (query === 'settings') {
                window.location.href = '4settings.html';
            } else {
                alert('Page not found');
            }
        } else if (e.key === 'Tab') {  // When Tab is pressed
            e.preventDefault();  // Prevent default tab behavior
            
            const inputValue = searchInput.value.toLowerCase();  // Get current input value
            const matchingSuggestion = searchSuggestions.find(suggestion => suggestion.startsWith(inputValue));  // Find the closest match
            
            if (matchingSuggestion) {
                searchInput.value = matchingSuggestion;  // Set the input value to the matched suggestion
            }
        }
    });
});
