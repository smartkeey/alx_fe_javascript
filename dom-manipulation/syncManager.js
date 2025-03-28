import { serverAPI } from './server.js';

export const createSyncManager = () => {
  let syncInterval;
  let lastSyncTime = localStorage.getItem('lastSyncTime') || null;
  
  // Basic conflict resolution - server wins
  const resolveConflicts = (serverQuotes, localQuotes) => {
    const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
    const localMap = new Map(localQuotes.map(q => [q.id, q]));
    
    // Merge strategy: server version takes precedence
    const merged = [];
    
    // Add all server quotes
    serverMap.forEach(quote => merged.push(quote));
    
    // Add local quotes that don't exist on server
    localMap.forEach((quote, id) => {
      if (!serverMap.has(id)) {
        merged.push(quote);
      }
    });
    
    return merged;
  };

  const performSync = async (onStatusUpdate) => {
    try {
      onStatusUpdate({ status: 'syncing', message: 'Starting sync...' });
      
      // Get data from both sources
      const [serverQuotes, localQuotes] = await Promise.all([
        serverAPI.fetchQuotes(),
        Promise.resolve(JSON.parse(localStorage.getItem('quotes') || '[]'))
      ]);
      
      onStatusUpdate({ status: 'syncing', message: 'Processing data...' });
      
      // Resolve conflicts
      const mergedQuotes = resolveConflicts(serverQuotes, localQuotes);
      
      // Update local storage
      localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
      localStorage.setItem('lastSyncTime', new Date().toISOString());
      
      onStatusUpdate({ 
        status: 'success', 
        message: `Sync complete at ${new Date().toLocaleTimeString()}`,
        data: mergedQuotes
      });
      
      return mergedQuotes;
    } catch (error) {
      onStatusUpdate({ 
        status: 'error', 
        message: `Sync failed: ${error.message}`
      });
      throw error;
    }
  };

  return {
    startPeriodicSync(onStatusUpdate, interval = SYNC_INTERVAL) {
      // Initial sync
      performSync(onStatusUpdate);
      
      // Set up periodic sync
      syncInterval = setInterval(
        () => performSync(onStatusUpdate), 
        interval
      );
    },
    
    stopPeriodicSync() {
      if (syncInterval) clearInterval(syncInterval);
    },
    
    manualSync(onStatusUpdate) {
      return performSync(onStatusUpdate);
    },
    
    getLastSyncTime() {
      return lastSyncTime;
    }
  };
};
