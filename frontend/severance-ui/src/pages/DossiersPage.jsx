import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPersonas, getClues } from '../api/api';
import { FaStrikethrough, FaHighlighter } from 'react-icons/fa';

const DossiersPage = () => {
  const [personas, setPersonas] = useState([]);
  const [clues, setClues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [struckPersonas, setStruckPersonas] = useState([]);
  const [highlightedPersonas, setHighlightedPersonas] = useState([]);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedStruck = localStorage.getItem('struckPersonas');
      const savedHighlighted = localStorage.getItem('highlightedPersonas');
      const savedNotes = localStorage.getItem('investigationNotes');

      console.log('Loading saved state:', { savedStruck, savedHighlighted, savedNotes });

      if (savedStruck) {
        const parsed = JSON.parse(savedStruck);
        console.log('Parsed struck personas:', parsed);
        setStruckPersonas(parsed);
      }

      if (savedHighlighted) {
        const parsed = JSON.parse(savedHighlighted);
        console.log('Parsed highlighted personas:', parsed);
        setHighlightedPersonas(parsed);
      }

      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }, []);

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

  // Functions to handle striking and highlighting
  const toggleStrikeThrough = (username) => {
    console.log('Toggle strike through for:', username);
    console.log('Current struck personas:', struckPersonas);

    // Check if username is already in the list
    const isAlreadyStruck = struckPersonas.includes(username);
    console.log('Is already struck:', isAlreadyStruck);

    // Create new array based on current state
    const newStruckPersonas = isAlreadyStruck
      ? struckPersonas.filter(name => name !== username) // Remove if present
      : [...struckPersonas, username]; // Add if not present

    console.log('New struck personas:', newStruckPersonas);

    // Update state and localStorage
    setStruckPersonas(newStruckPersonas);
    localStorage.setItem('struckPersonas', JSON.stringify(newStruckPersonas));

    // Force a re-render
    setTimeout(() => {
      const currentState = localStorage.getItem('struckPersonas');
      console.log('Saved to localStorage:', currentState);
    }, 100);
  };

  const toggleHighlight = (username) => {
    console.log('Toggle highlight for:', username);
    console.log('Current highlighted personas:', highlightedPersonas);

    // Check if username is already in the list
    const isAlreadyHighlighted = highlightedPersonas.includes(username);
    console.log('Is already highlighted:', isAlreadyHighlighted);

    // Create new array based on current state
    const newHighlightedPersonas = isAlreadyHighlighted
      ? highlightedPersonas.filter(name => name !== username) // Remove if present
      : [...highlightedPersonas, username]; // Add if not present

    console.log('New highlighted personas:', newHighlightedPersonas);

    // Update state and localStorage
    setHighlightedPersonas(newHighlightedPersonas);
    localStorage.setItem('highlightedPersonas', JSON.stringify(newHighlightedPersonas));

    // Force a re-render
    setTimeout(() => {
      const currentState = localStorage.getItem('highlightedPersonas');
      console.log('Saved to localStorage:', currentState);
    }, 100);
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    localStorage.setItem('investigationNotes', newNotes);
  };

  const toggleNotesPanel = () => {
    setShowNotes(!showNotes);
  };

  // Debug state changes
  useEffect(() => {
    console.log('Struck personas state updated:', struckPersonas);
  }, [struckPersonas]);

  useEffect(() => {
    console.log('Highlighted personas state updated:', highlightedPersonas);
  }, [highlightedPersonas]);

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

            {/* Legend */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center text-sm">
              <span className="mr-4 text-gray-700 dark:text-gray-300">Actions:</span>
              <div className="flex items-center mr-4">
                <FaStrikethrough className="text-gray-500 mr-1" size={14} />
                <span className="text-gray-700 dark:text-gray-300">Strike through name</span>
              </div>
              <div className="flex items-center">
                <FaHighlighter className="text-gray-500 mr-1" size={14} />
                <span className="text-gray-700 dark:text-gray-300">Highlight character</span>
              </div>
            </div>

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

            {/* Clues Section */}
            {clues.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Investigation Clues
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  {clues.map((clue, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {clue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes Toggle Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={toggleNotesPanel}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {showNotes ? 'Hide Notes' : 'Show Investigation Notes'}
              </button>
            </div>

            {/* Notes Panel */}
            {showNotes && (
              <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Investigation Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Write your investigation notes here..."
                  className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Notes are saved automatically and will persist between sessions.
                </p>
              </div>
            )}

            {/* Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonas.map((persona) => {
                const isStruck = struckPersonas.includes(persona.username);
                const isHighlighted = highlightedPersonas.includes(persona.username);

                return (
                  <div
                    key={persona.username}
                    className={`rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
                      persona.group === 'outie'
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-purple-50 dark:bg-purple-900/20'
                    } ${
                      isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''
                    } ${
                      isStruck ? 'opacity-70' : 'hover:shadow-xl'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`p-3 border-b ${
                      persona.group === 'outie'
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-800/30'
                        : 'border-purple-200 dark:border-purple-800 bg-purple-100/50 dark:bg-purple-800/30'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${
                            isStruck ? 'line-through text-gray-500 dark:text-gray-500' : ''
                          }`}>
                            {persona.username}
                          </h3>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleStrikeThrough(persona.username);
                              }}
                              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                isStruck ? 'text-red-500' : 'text-gray-500'
                              }`}
                              title="Strike through name"
                              type="button"
                            >
                              <FaStrikethrough size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleHighlight(persona.username);
                              }}
                              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                isHighlighted ? 'text-yellow-500' : 'text-gray-500'
                              }`}
                              title="Highlight character"
                              type="button"
                            >
                              <FaHighlighter size={14} />
                            </button>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          persona.group === 'outie'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                        }`}>
                          {persona.group === 'outie' ? 'Outie' : 'Innie'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed ${
                        isStruck ? 'text-gray-500 dark:text-gray-500' : ''
                      }`}>
                        {persona.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DossiersPage;
