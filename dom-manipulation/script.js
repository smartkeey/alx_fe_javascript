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
  updateCategoryFilter();
  newQuoteBtn.addEventListener('click', showRandomQuote);
  showRandomQuote();
  
  // Create and append the add quote form dynamically
  createAddQuoteForm();
}

// Function to create the add quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';
  
  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Add New Quote';
  
  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';
  
  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';
  
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;
  
  formContainer.appendChild(formTitle);
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  
  document.body.appendChild(formContainer);
}

// Add a new quote to the array and update UI
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
  
  // Update UI
  updateCategoryFilter();
  showRandomQuote();
  showMessage('Quote added successfully!', 'success');
}

// Show message to user
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.padding = '10px';
  messageDiv.style.margin = '10px 0';
  messageDiv.style.borderRadius = '4px';
  
  if (type === 'error') {
    messageDiv.style.backgroundColor = '#ffdddd';
    messageDiv.style.color = '#d8000c';
  } else {
    messageDiv.style.backgroundColor = '#ddffdd';
    messageDiv.style.color = '#4F8A10';
  }
  
  // Add to DOM
  const formContainer = document.querySelector('.form-container');
  formContainer.insertBefore(messageDiv, formContainer.firstChild);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
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

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
