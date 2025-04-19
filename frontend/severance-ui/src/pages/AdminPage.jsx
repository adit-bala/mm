import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPersonas, getMurderClues, createRoom, getAllRooms } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [murderClues, setMurderClues] = useState({ to_outies: [], to_innies: [] });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room creation state
  const [showModal, setShowModal] = useState(false);
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personasData, cluesData, roomsData] = await Promise.all([
          getPersonas(),
          getMurderClues(),
          getAllRooms()
        ]);
        setPersonas(personasData);
        setMurderClues(cluesData);
        setRooms(roomsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to refresh rooms after creating a new one
  const refreshRooms = async () => {
    try {
      const roomsData = await getAllRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error('Error refreshing rooms:', err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!playerA || !playerB || playerA === playerB) {
      setError('Please select two different players');
      return;
    }

    setCreatingRoom(true);
    try {
      const room = await createRoom(playerA, playerB);
      setCreatedRoomCode(room.code4);
      setPlayerA('');
      setPlayerB('');

      // Refresh the rooms list
      await refreshRooms();
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
    } finally {
      setCreatingRoom(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCreatedRoomCode('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Filter personas by group
  const outiePersonas = personas.filter(p => p.group === 'outie');
  const inniePersonas = personas.filter(p => p.group === 'innie');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Create Room
              </button>
            </div>

            {/* Active Rooms Section */}
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Active Rooms
              </h2>

              {rooms.length === 0 ? (
                <p className="text-gray-700 dark:text-gray-300">
                  No active rooms. Create a room to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Room Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Player A
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Player B
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {rooms.map((room) => (
                        <tr key={room.code4}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {room.code4}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {room.playerA}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {room.playerB}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(room.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate(`/room/${room.code4}`)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-1 px-3 rounded-lg text-xs"
                            >
                              Join Room
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Murder Clues Section */}
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Murder Clues
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Clues for Outies:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {murderClues.to_outies.map((clue, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {clue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Clues for Innies:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {murderClues.to_innies.map((clue, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {clue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Personas Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Outies Table */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Outies
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {outiePersonas.map((persona) => (
                        <tr key={persona.username}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {persona.username}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {persona.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Innies Table */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Innies
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {inniePersonas.map((persona) => (
                        <tr key={persona.username}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {persona.username}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {persona.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Chat Room
            </h2>

            {createdRoomCode ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Room created successfully!
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    Code: {createdRoomCode}
                  </p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => navigate(`/room/${createdRoomCode}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRoom}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Player A:
                  </label>
                  <select
                    value={playerA}
                    onChange={(e) => setPlayerA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Player A</option>
                    {personas.map((persona) => (
                      <option key={persona.username} value={persona.username}>
                        {persona.username} ({persona.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Player B:
                  </label>
                  <select
                    value={playerB}
                    onChange={(e) => setPlayerB(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Player B</option>
                    {personas.map((persona) => (
                      <option key={persona.username} value={persona.username}>
                        {persona.username} ({persona.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingRoom}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {creatingRoom ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
