// Configuration
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // 30 seconds
const USER_ID = 1; // Simulate logged-in user

// State variables
let lastSyncTime = null;
let syncInProgress = false;

// Transform quote to server format
function toServerFormat(quote) {
  return {
    title: quote.text,
    body: JSON.stringify({
      category: quote.category,
      timestamp: new Date().toISOString()
    }),
    userId: USER_ID
  };
}

// Transform server data to our quote format
function toClientFormat(serverData) {
  try {
    const bodyData = JSON.parse(serverData.body);
    return {
      id: serverData.id,
      text: serverData.title,
      category: bodyData.category || 'unknown',
      serverTimestamp: bodyData.timestamp
    };
  } catch (e) {
    console.error('Failed to parse server data:', e);
    return null;
  }
}

// Fetch quotes from mock server
export async function fetchQuotes() {
  try {
    const response = await fetch(`${API_URL}?userId=${USER_ID}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    
    const serverData = await response.json();
    const quotes = serverData.map(toClientFormat).filter(Boolean);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return quotes;
  } catch (error) {
    console.error('Fetch quotes failed:', error);
    throw error;
  }
}

// Post quotes to mock server
export async function postQuotes(quotes) {
  try {
    const serverData = quotes.map(toServerFormat);
    
    // JSONPlaceholder only allows one post at a time in free tier
    // So we'll simulate batch upload
    const responses = [];
    for (const data of serverData) {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      responses.push(await response.json());
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses.map(toClientFormat).filter(Boolean);
  } catch (error) {
    console.error('Post quotes failed:', error);
    throw error;
  }
}

// Initialize periodic sync
export function initSync(callback) {
  // Load last sync time from localStorage
  lastSyncTime = localStorage.getItem('lastSyncTime') || null;
  
  // Immediate first sync
  performSync(callback);
  
  // Set up periodic sync
  setInterval(() => performSync(callback), SYNC_INTERVAL);
  
  return {
    manualSync: () => performSync(callback)
  };
}

// Perform the actual sync operation
async function performSync(callback) {
  if (syncInProgress) return;
  
  syncInProgress = true;
  try {
    callback({ status: 'syncing', message: 'Connecting to server...' });
    
    // Get server data
    const serverQuotes = await fetchQuotes();
    callback({ status: 'syncing', message: 'Processing data...' });
    
    // Get local data
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || [];
    
    // Compare timestamps to detect changes
    const serverChanges = detectChanges(localQuotes, serverQuotes);
    const localChanges = detectChanges(serverQuotes, localQuotes);
    
    if (serverChanges.length > 0 || localChanges.length > 0) {
      callback({ 
        status: 'conflict', 
        message: 'Data changes detected',
        serverChanges,
        localChanges
      });
    } else {
      // Update last sync time
      lastSyncTime = new Date().toISOString();
      localStorage.setItem('lastSyncTime', lastSyncTime);
      callback({ 
        status: 'success', 
        message: `Sync complete (${formatTime(lastSyncTime)})`
      });
    }
  } catch (error) {
    callback({ 
      status: 'error', 
      message: `Sync failed: ${error.message}`
    });
  } finally {
    syncInProgress = false;
  }
}

// Helper to detect changes between two sets of quotes
function detectChanges(source, target) {
  return source.filter(sQuote => {
    const tQuote = target.find(t => t.id === sQuote.id);
    return !tQuote || tQuote.text !== sQuote.text || tQuote.category !== sQuote.category;
  });
}

// Helper to format time
function formatTime(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}
