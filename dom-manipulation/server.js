const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds

// Convert between client and server data formats
const dataAdapter = {
  toServer: (quote) => ({
    title: quote.text,
    body: JSON.stringify({
      category: quote.category,
      lastUpdated: new Date().toISOString()
    }),
    userId: 1 // Simulate logged-in user
  }),
  
  toClient: (serverData) => {
    try {
      const body = JSON.parse(serverData.body);
      return {
        id: serverData.id,
        text: serverData.title,
        category: body.category,
        lastUpdated: body.lastUpdated
      };
    } catch {
      return null;
    }
  }
};

export const serverAPI = {
  async fetchQuotes() {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Server error');
      
      const data = await response.json();
      return data.map(dataAdapter.toClient).filter(Boolean);
    } catch (error) {
      console.error('Fetch failed:', error);
      throw error;
    }
  },

  async postQuotes(quotes) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // JSONPlaceholder only allows single posts in free tier
      const responses = [];
      for (const quote of quotes) {
        const response = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify(dataAdapter.toServer(quote)),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });
        responses.push(await response.json());
      }
      
      return responses.map(dataAdapter.toClient).filter(Boolean);
    } catch (error) {
      console.error('Post failed:', error);
      throw error;
    }
  }
};
