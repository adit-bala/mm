import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getSavedRooms, removeRoom } from '../utils/roomStorage';

const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [savedRooms, setSavedRooms] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load saved rooms when user changes
  useEffect(() => {
    if (user && user.role !== 'admin') {
      const rooms = getSavedRooms(user.username);
      setSavedRooms(rooms);
    }
  }, [user]);

  const handleRoomCodeSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim().length !== 4) {
      setError('Room code must be 4 characters');
      return;
    }

    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  const handleRemoveRoom = (code4) => {
    if (user) {
      const updatedRooms = removeRoom(user.username, code4);
      setSavedRooms(updatedRooms);
    }
  };

  const handleJoinSavedRoom = (code4) => {
    navigate(`/room/${code4}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome, {user?.username}!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Character Dossiers
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  View all character profiles and gather information for your investigation.
                </p>
                <button
                  onClick={() => navigate('/dossiers')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  View Dossiers
                </button>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Enter Room Code
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Join a chat room with another player to exchange information.
                </p>
                <form onSubmit={handleRoomCodeSubmit}>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Join Room
                  </button>
                </form>

                {/* Saved Rooms */}
                {savedRooms.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Your Saved Rooms
                    </h3>
                    <div className="space-y-2">
                      {savedRooms.map((room) => (
                        <div
                          key={room.code4}
                          className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Room: {room.code4}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              With: {room.playerA === user?.username ? room.playerB : room.playerA}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleJoinSavedRoom(room.code4)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1 px-3 rounded-lg"
                            >
                              Join
                            </button>
                            <button
                              onClick={() => handleRemoveRoom(room.code4)}
                              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium py-1 px-3 rounded-lg"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
