import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getPersonas, sendDirectMessage, getSentDirectMessages } from '../api/api';

const DirectMessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/home');
    }
  }, [user, navigate]);

  // Fetch personas and sent messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personasData, messagesData] = await Promise.all([
          getPersonas(),
          getSentDirectMessages()
        ]);
        setPersonas(personasData);
        setSentMessages(messagesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !messageContent.trim()) {
      setError('Please select a user and enter a message');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await sendDirectMessage(selectedUser, messageContent);
      setSuccess(`Message sent to ${selectedUser} successfully!`);
      setMessageContent('');
      
      // Refresh sent messages
      const messagesData = await getSentDirectMessages();
      setSentMessages(messagesData);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Direct Messages
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Send Message Form */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Send New Message
                </h2>

                <form onSubmit={handleSendMessage}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                      {success}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Recipient:
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select User</option>
                      {personas.map((persona) => (
                        <option key={persona.username} value={persona.username}>
                          {persona.username} ({persona.group})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Message:
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your message here..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* Sent Messages */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Sent Messages
                </h2>
                
                {sentMessages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No messages sent yet.
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {sentMessages.map((message) => (
                      <div 
                        key={message.id}
                        className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            To: {message.user_username}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(message.ts).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {message.content}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {message.is_read ? 'Read' : 'Unread'}
                        </div>
                      </div>
                    ))}
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

export default DirectMessagesPage;
