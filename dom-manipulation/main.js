import { createSyncManager } from './syncManager.js';

// Initialize sync manager
const syncManager = createSyncManager();

// UI Update Functions
function updateSyncStatus({ status, message }) {
  const statusEl = document.getElementById('sync-status');
  statusEl.textContent = message;
  statusEl.className = `sync-status ${status}`;
}

function updateQuoteDisplay(quotes) {
  const display = document.getElementById('quote-display');
  display.innerHTML = quotes.map(q => `
    <div class="quote">
      <p>"${q.text}"</p>
      <small>${q.category} • ${new Date(q.lastUpdated).toLocaleString()}</small>
    </div>
  `).join('');
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Load initial quotes
  const initialQuotes = JSON.parse(localStorage.getItem('quotes') || []);
  updateQuoteDisplay(initialQuotes);
  
  // Setup sync
  syncManager.startPeriodicSync((update) => {
    updateSyncStatus(update);
    if (update.data) {
      updateQuoteDisplay(update.data);
    }
  });
  
  // Manual sync button
  document.getElementById('manual-sync').addEventListener('click', () => {
    syncManager.manualSync(update);
  });
  
  // Add quote form
  document.getElementById('add-quote-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = e.target.elements.text.value;
    const category = e.target.elements.category.value;
    
    if (text && category) {
      const newQuote = {
        id: Date.now(), // Temporary ID
        text,
        category,
        lastUpdated: new Date().toISOString()
      };
      
      const quotes = JSON.parse(localStorage.getItem('quotes') || []);
      quotes.push(newQuote);
      localStorage.setItem('quotes', JSON.stringify(quotes));
      
      updateQuoteDisplay(quotes);
      e.target.reset();
      
      // Trigger immediate sync
      syncManager.manualSync(update);
    }
  });
});
