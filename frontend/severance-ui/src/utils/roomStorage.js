/**
 * Utility functions for managing saved room codes
 */

const SAVED_ROOMS_KEY = 'severance_saved_rooms';

/**
 * Get saved rooms for a user
 * @param {string} username - The current user's username
 * @returns {Array} Array of room objects with code4, playerA, playerB
 */
export const getSavedRooms = (username) => {
  try {
    const savedRoomsData = localStorage.getItem(SAVED_ROOMS_KEY);
    if (!savedRoomsData) return {};
    
    const savedRooms = JSON.parse(savedRoomsData);
    return savedRooms[username] || [];
  } catch (error) {
    console.error('Error getting saved rooms:', error);
    return [];
  }
};

/**
 * Save a room for a user
 * @param {string} username - The current user's username
 * @param {Object} room - Room object with code4, playerA, and playerB
 */
export const saveRoom = (username, room) => {
  try {
    // Get all users' saved rooms
    const savedRoomsData = localStorage.getItem(SAVED_ROOMS_KEY);
    const allSavedRooms = savedRoomsData ? JSON.parse(savedRoomsData) : {};
    
    // Get current user's saved rooms
    const userSavedRooms = allSavedRooms[username] || [];
    
    // Check if room already exists
    const existingIndex = userSavedRooms.findIndex(r => r.code4 === room.code4);
    
    if (existingIndex === -1) {
      // Add new room
      userSavedRooms.push({
        code4: room.code4,
        playerA: room.playerA,
        playerB: room.playerB,
        lastVisited: new Date().toISOString()
      });
    } else {
      // Update last visited time
      userSavedRooms[existingIndex].lastVisited = new Date().toISOString();
    }
    
    // Save back to localStorage
    allSavedRooms[username] = userSavedRooms;
    localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(allSavedRooms));
    
    return userSavedRooms;
  } catch (error) {
    console.error('Error saving room:', error);
    return [];
  }
};

/**
 * Remove a saved room
 * @param {string} username - The current user's username
 * @param {string} code4 - The room code to remove
 */
export const removeRoom = (username, code4) => {
  try {
    const savedRoomsData = localStorage.getItem(SAVED_ROOMS_KEY);
    if (!savedRoomsData) return;
    
    const allSavedRooms = JSON.parse(savedRoomsData);
    const userSavedRooms = allSavedRooms[username] || [];
    
    // Filter out the room to remove
    const updatedRooms = userSavedRooms.filter(room => room.code4 !== code4);
    
    // Save back to localStorage
    allSavedRooms[username] = updatedRooms;
    localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(allSavedRooms));
    
    return updatedRooms;
  } catch (error) {
    console.error('Error removing room:', error);
    return [];
  }
};
