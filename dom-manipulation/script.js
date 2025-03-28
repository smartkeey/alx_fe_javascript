// Initial quotes data
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "work" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "wisdom" },
  { text: "The journey of a thousand miles begins with one step.", category: "inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Initialize the application
function init() {
  // Populate category dropdown
  updateCategoryFilter();
  
  // Set up event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  
  // Show initial random quote
  showRandomQuote();
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
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  
  if (!text || !category) {
    alert('Please enter both quote text and category');
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
  
  // Update UI
  updateCategoryFilter();
  showRandomQuote();
  
  alert('Quote added successfully!');
}

// Update the category filter dropdown
function updateCategoryFilter() {
  // Get all unique categories
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options
  categorySelect.innerHTML = '';
  
  // Add new options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All Categories' : category;
    categorySelect.appendChild(option);
  });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
