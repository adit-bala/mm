import React, { useState, useEffect } from 'react';
import { getReceivedDirectMessages } from '../api/api';

const DirectMessagesModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchMessages = async () => {
        try {
          const messagesData = await getReceivedDirectMessages();
          setMessages(messagesData);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages from Admin
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
            No messages from admin.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div 
                key={message.id}
                className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    From: {message.admin_username}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(message.ts).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectMessagesModal;
