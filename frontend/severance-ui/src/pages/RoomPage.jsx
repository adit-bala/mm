import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getRoom, getRoomMessages, sendMessage, streamMessages } from '../api/api';
import { saveRoom } from '../utils/roomStorage';

const RoomPage = () => {
  const { code4 } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch room data and initial messages
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomData, messagesData] = await Promise.all([
          getRoom(code4),
          getRoomMessages(code4)
        ]);
        setRoom(roomData);
        setMessages(messagesData);

        // Save room to localStorage for easy access later (only for regular users)
        if (user && user.role !== 'admin') {
          saveRoom(user.username, roomData);
        }
      } catch (err) {
        console.error('Error fetching room data:', err);
        if (err.response?.status === 404) {
          setError('Room not found');
        } else if (err.response?.status === 403) {
          setError('You are not authorized to access this room');
        } else {
          setError('Failed to load room data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    // Clean up polling on unmount
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [code4, user]);

  // Set up message polling
  useEffect(() => {
    const pollMessages = async () => {
      if (!room) return;

      try {
        const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
        const newMessages = await streamMessages(code4, lastMessageId);

        if (newMessages && newMessages.length > 0) {
          // Deduplicate messages by ID
          const existingIds = new Set(messages.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));

          if (uniqueNewMessages.length > 0) {
            setMessages(prev => [...prev, ...uniqueNewMessages]);
          }
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }

      // Poll again after 5 seconds - balanced polling interval
      pollingRef.current = setTimeout(pollMessages, 5000);
    };

    pollMessages();

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [code4, room, messages]); // Add messages back as dependency to get the latest message ID

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const sentMessage = await sendMessage(code4, newMessage);

      // Check if the message is already in the list (avoid duplicates)
      const messageExists = messages.some(msg => msg.id === sentMessage.id);
      if (!messageExists) {
        setMessages(prev => [...prev, sentMessage]);
      }

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.status === 429) {
        setError('You are sending messages too quickly. Please wait a moment.');
      } else {
        setError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                {error}
              </h1>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Room header */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Room: {code4}
              </h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.role === 'admin' ? (
                  <span>Observing: {room.playerA} & {room.playerB}</span>
                ) : (
                  <span>Chatting with: {room.playerA === user.username ? room.playerB : room.playerA}</span>
                )}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="p-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === user.username ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === user.username
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="text-xs mb-1">
                        {message.sender}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
