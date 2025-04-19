import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPersonas, getClues } from '../api/api';

const DossiersPage = () => {
  const [personas, setPersonas] = useState([]);
  const [clues, setClues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personasData, cluesData] = await Promise.all([
          getPersonas(),
          getClues()
        ]);
        setPersonas(personasData);
        setClues(cluesData.clues || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPersonas = activeTab === 'all' 
    ? personas 
    : personas.filter(persona => persona.group === activeTab);

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Character Dossiers
            </h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  All Characters
                </button>
                <button
                  onClick={() => setActiveTab('outie')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'outie'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Outies
                </button>
                <button
                  onClick={() => setActiveTab('innie')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'innie'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Innies
                </button>
              </nav>
            </div>
            
            {/* Clues */}
            {clues.length > 0 && (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your Clues:
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  {clues.map((clue, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {clue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonas.map((persona) => (
                <div 
                  key={persona.username}
                  className={`rounded-xl shadow-lg overflow-hidden ${
                    persona.group === 'outie' 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'bg-purple-50 dark:bg-purple-900/20'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {persona.username}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        persona.group === 'outie'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                      }`}>
                        {persona.group === 'outie' ? 'Outie' : 'Innie'}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {persona.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossiersPage;
