// Quotes array - will be loaded from localStorage
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Initialize the application
function init() {
  // Load quotes from localStorage
  loadQuotes();
  
  // Set up event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  
  // Show initial random quote
  showRandomQuote();
  
  // Store initial visit time in sessionStorage
  if (!sessionStorage.getItem('firstVisit')) {
    const now = new Date();
    sessionStorage.setItem('firstVisit', now.toString());
    showMessage(`Welcome! First visit at ${now.toLocaleTimeString()}`, 'success');
  }
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "work" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
      { text: "Simplicity is the ultimate sophistication.", category: "wisdom" },
      { text: "The journey of a thousand miles begins with one step.", category: "inspiration" }
    ];
    saveQuotes();
  }
  updateCategoryFilter();
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  updateCategoryFilter();
}

// Add a new quote to the array and update storage
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  
  if (!text || !category) {
    showMessage('Please enter both quote text and category', 'error');
    return;
  }
  
  const newQuote = {
    text: text,
    category: category.toLowerCase()
  };
  
  quotes.push(newQuote);
  
  // Clear form
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Update storage and UI
  saveQuotes();
  showRandomQuote();
  showMessage('Quote added successfully!', 'success');
}

// Export quotes to JSON file
function exportToJson() {
  if (quotes.length === 0) {
    showMessage('No quotes to export', 'error');
    return;
  }
  
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'quotes.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  showMessage('Quotes exported successfully!', 'success');
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      if (importedQuotes.length === 0) {
        showMessage('File contains no quotes', 'error');
        return;
      }
      
      // Validate each quote has text and category
      for (const quote of importedQuotes) {
        if (!quote.text || !quote.category) {
          throw new Error('Invalid format: Each quote must have text and category');
        }
      }
      
      // Add imported quotes to our collection
      quotes.push(...importedQuotes);
      saveQuotes();
      showRandomQuote();
      showMessage(`${importedQuotes.length} quotes imported successfully!`, 'success');
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      showMessage(`Import failed: ${error.message}`, 'error');
      console.error('Import error:', error);
    }
  };
  
  fileReader.onerror = function() {
    showMessage('Error reading file', 'error');
  };
  
  fileReader.readAsText(file);
}

// Display a random quote
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  let filteredQuotes = quotes;
  
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `
      <p class="quote-text">No quotes found in this category.</p>
      <p class="quote-category">${selectedCategory}</p>
    `;
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p class="quote-text">"${randomQuote.text}"</p>
    <p class="quote-category">Category: ${randomQuote.category}</p>
  `;
  
  // Store last viewed quote in sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Update the category filter dropdown
function updateCategoryFilter() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  categorySelect.innerHTML = '';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All Categories' : category;
    categorySelect.appendChild(option);
  });
}

// Show message to user
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.className = `message ${type}`;
  
  // Add to DOM
  document.body.insertBefore(messageDiv, document.body.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

function exportToJson() {
  if (!quotes || quotes.length === 0) {
    showMessage('No quotes available to export', 'error');
    return;
  }

  try {
    // Format the JSON with 2-space indentation
    const jsonString = JSON.stringify(quotes, null, 2);
    
    // Create blob with proper MIME type
    const blob = new Blob([jsonString], { 
      type: 'application/json;charset=utf-8' 
    });
    
    // Create temporary download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Set filename with current date
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `my-quotes-${dateStr}.json`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    showMessage(`Exported ${quotes.length} quotes successfully!`, 'success');
  } catch (error) {
    showMessage(`Export failed: ${error.message}`, 'error');
    console.error('Export error:', error);
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Add export button event listener
  const exportBtn = document.getElementById('exportJson');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToJson);
  }
});
