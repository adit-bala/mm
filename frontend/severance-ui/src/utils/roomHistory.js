/**
 * Utility functions for managing room history
 */

const ROOM_HISTORY_KEY = 'severance_room_history';
const MAX_ROOMS = 5; // Maximum number of rooms to remember

/**
 * Get the user's room history from localStorage
 * @param {string} username - The current user's username
 * @returns {Array} Array of room objects with code4, playerA, playerB, and lastVisited
 */
export const getRoomHistory = (username) => {
  try {
    const historyData = localStorage.getItem(ROOM_HISTORY_KEY);
    if (!historyData) return {};
    
    const history = JSON.parse(historyData);
    return history[username] || [];
  } catch (error) {
    console.error('Error getting room history:', error);
    return [];
  }
};

/**
 * Add a room to the user's history
 * @param {string} username - The current user's username
 * @param {Object} room - Room object with code4, playerA, and playerB
 */
export const addRoomToHistory = (username, room) => {
  try {
    // Get all users' history
    const historyData = localStorage.getItem(ROOM_HISTORY_KEY);
    const allHistory = historyData ? JSON.parse(historyData) : {};
    
    // Get current user's history
    const userHistory = allHistory[username] || [];
    
    // Check if room already exists in history
    const existingIndex = userHistory.findIndex(r => r.code4 === room.code4);
    
    if (existingIndex !== -1) {
      // Update existing room's last visited time
      userHistory[existingIndex].lastVisited = new Date().toISOString();
    } else {
      // Add new room with timestamp
      userHistory.unshift({
        code4: room.code4,
        playerA: room.playerA,
        playerB: room.playerB,
        lastVisited: new Date().toISOString()
      });
      
      // Limit to MAX_ROOMS
      if (userHistory.length > MAX_ROOMS) {
        userHistory.pop();
      }
    }
    
    // Sort by last visited (most recent first)
    userHistory.sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited));
    
    // Save back to localStorage
    allHistory[username] = userHistory;
    localStorage.setItem(ROOM_HISTORY_KEY, JSON.stringify(allHistory));
    
    return userHistory;
  } catch (error) {
    console.error('Error adding room to history:', error);
    return [];
  }
};

/**
 * Clear the user's room history
 * @param {string} username - The current user's username
 */
export const clearRoomHistory = (username) => {
  try {
    const historyData = localStorage.getItem(ROOM_HISTORY_KEY);
    if (!historyData) return;
    
    const allHistory = JSON.parse(historyData);
    delete allHistory[username];
    
    localStorage.setItem(ROOM_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('Error clearing room history:', error);
  }
};
