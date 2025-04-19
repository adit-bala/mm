import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoomCodeSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim().length !== 4) {
      setError('Room code must be 4 characters');
      return;
    }
    
    navigate(`/room/${roomCode.toUpperCase()}`);
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
