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
// Initialize filter on load
function initFilter() {
  populateCategories();
  restoreLastFilter();
  
  // Set up event listeners
  document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
  document.getElementById('resetFilter').addEventListener('click', resetFilter);
}

// Populate category dropdown with unique categories
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Save current selection
  const currentValue = categoryFilter.value;
  
  // Clear existing options (keeping "All Categories")
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Get unique categories from quotes
  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  
  // Add categories to dropdown
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (currentValue !== 'all' && uniqueCategories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  
  // Save to localStorage
  localStorage.setItem('lastCategoryFilter', selectedCategory);
  
  // Filter quotes
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);
  
  // Update display
  displayQuotes(filteredQuotes);
  
  // Show current filter status
  showMessage(`Showing ${filteredQuotes.length} quotes in category: ${selectedCategory === 'all' ? 'All' : selectedCategory}`);
}

// Restore last filter from localStorage
function restoreLastFilter() {
  const lastFilter = localStorage.getItem('lastCategoryFilter');
  if (lastFilter) {
    document.getElementById('categoryFilter').value = lastFilter;
    filterQuotes(); // Apply the filter
  }
}

// Reset filter to show all quotes
function resetFilter() {
  document.getElementById('categoryFilter').value = 'all';
  filterQuotes();
}

// Update the addQuote function to handle new categories
function addQuote() {
  // ... existing addQuote code ...
  
  // After adding the quote:
  const categoryExists = [...document.getElementById('categoryFilter').options]
    .some(option => option.value === newQuote.category);
    
  if (!categoryExists) {
    populateCategories(); // Refresh category list if new category was added
  }
  
  saveQuotes(); // Save to localStorage
  filterQuotes(); // Re-apply current filter
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  initFilter();
  // ... other initialization code ...
});

// Server simulation using JSONPlaceholder
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
let lastSyncTime = null;
let syncInProgress = false;
let conflictsDetected = false;

// Initialize sync functionality
function initSync() {
  // Load last sync time from localStorage
  lastSyncTime = localStorage.getItem('lastSyncTime') || null;
  
  // Set up event listeners
  document.getElementById('manual-sync').addEventListener('click', manualSync);
  document.getElementById('resolve-conflicts').addEventListener('click', showConflictModal);
  document.getElementById('keep-local').addEventListener('click', () => resolveConflict('local'));
  document.getElementById('use-server').addEventListener('click', () => resolveConflict('server'));
  document.getElementById('merge-changes').addEventListener('click', () => resolveConflict('merge'));
  
  // Start periodic sync (every 30 seconds)
  setInterval(autoSync, 30000);
  
  // Initial sync
  autoSync();
}

// Automatic sync function
async function autoSync() {
  if (syncInProgress) return;
  
  try {
    syncInProgress = true;
    updateSyncStatus('Syncing with server...');
    
    // Get server data
    const serverQuotes = await fetchServerData();
    
    // Compare with local data
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    if (!areQuotesEqual(localQuotes, serverQuotes)) {
      conflictsDetected = true;
      document.getElementById('resolve-conflicts').style.display = 'inline-block';
      updateSyncStatus('Conflicts detected - click to resolve');
    } else {
      // No conflicts, update last sync time
      lastSyncTime = new Date().toISOString();
      localStorage.setItem('lastSyncTime', lastSyncTime);
      updateSyncStatus(`Last synced: ${formatTime(lastSyncTime)}`);
    }
  } catch (error) {
    console.error('Sync failed:', error);
    updateSyncStatus('Sync failed - try again later');
  } finally {
    syncInProgress = false;
  }
}

// Manual sync trigger
function manualSync() {
  if (!syncInProgress) {
    autoSync();
  }
}

// Fetch data from mock server
async function fetchServerData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    // Transform the mock data into our quote format
    return data.map(item => ({
      id: item.id,
      text: item.title,
      category: 'server', // Mock server uses a single category
      body: item.body
    }));
  } catch (error) {
    console.error('Failed to fetch server data:', error);
    throw error;
  }
}

// Compare local and server data
function areQuotesEqual(localQuotes, serverQuotes) {
  if (localQuotes.length !== serverQuotes.length) return false;
  
  // Simple comparison - in real app you'd want a more robust comparison
  const localString = JSON.stringify(localQuotes.map(q => ({ text: q.text, category: q.category })));
  const serverString = JSON.stringify(serverQuotes.map(q => ({ text: q.text, category: q.category })));
  
  return localString === serverString;
}

// Conflict resolution
function showConflictModal() {
  document.getElementById('conflict-modal').style.display = 'flex';
}

function hideConflictModal() {
  document.getElementById('conflict-modal').style.display = 'none';
}

async function resolveConflict(resolutionType) {
  try {
    updateSyncStatus('Resolving conflicts...');
    
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const serverQuotes = await fetchServerData();
    
    let resolvedQuotes = [];
    
    switch (resolutionType) {
      case 'local':
        // Keep local version - push to server
        resolvedQuotes = localQuotes;
        await pushToServer(localQuotes);
        break;
      case 'server':
        // Use server version
        resolvedQuotes = serverQuotes;
        break;
      case 'merge':
        // Merge changes - simple implementation
        resolvedQuotes = mergeQuotes(localQuotes, serverQuotes);
        await pushToServer(resolvedQuotes);
        break;
    }
    
    // Update local storage
    localStorage.setItem('quotes', JSON.stringify(resolvedQuotes));
    quotes = resolvedQuotes;
    updateCategoryFilter();
    showRandomQuote();
    
    // Update sync status
    lastSyncTime = new Date().toISOString();
    localStorage.setItem('lastSyncTime', lastSyncTime);
    conflictsDetected = false;
    document.getElementById('resolve-conflicts').style.display = 'none';
    updateSyncStatus(`Last synced: ${formatTime(lastSyncTime)}`);
    
    showMessage('Conflicts resolved successfully!', 'success');
  } catch (error) {
    console.error('Conflict resolution failed:', error);
    showMessage('Failed to resolve conflicts', 'error');
  } finally {
    hideConflictModal();
  }
}

// Push data to server
async function pushToServer(quotes) {
  // Transform our quotes to the server's format
  const serverData = quotes.map((quote, index) => ({
    id: index + 1,
    title: quote.text,
    body: quote.category
  }));
  
  // Note: JSONPlaceholder doesn't actually save data, so we just simulate
  // In a real app, you would make a PUT or POST request here
  console.log('Simulating server update:', serverData);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
}

// Merge quotes from both sources
function mergeQuotes(localQuotes, serverQuotes) {
  // Simple merge - concatenate and remove duplicates by text
  const combined = [...localQuotes, ...serverQuotes];
  const unique = [];
  const seen = new Set();
  
  for (const quote of combined) {
    if (!seen.has(quote.text)) {
      seen.add(quote.text);
      unique.push(quote);
    }
  }
  
  return unique;
}

// Helper function to update sync status UI
function updateSyncStatus(message) {
  document.getElementById('sync-message').textContent = message;
}

// Helper function to format time
function formatTime(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}

// Initialize sync when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // ... existing initialization code ...
  initSync();
});
