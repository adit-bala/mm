import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import DirectMessagesModal from './DirectMessagesModal';
import { getUnreadMessageCount } from '../api/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  // Fetch unread message count for regular users
  useEffect(() => {
    if (user && !isAdmin()) {
      const fetchUnreadCount = async () => {
        try {
          const { unread_count } = await getUnreadMessageCount();
          setUnreadCount(unread_count);
        } catch (err) {
          console.error('Error fetching unread count:', err);
        }
      };

      fetchUnreadCount();

      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/home" className="text-xl font-bold text-gray-900 dark:text-white">
                  Severance Mystery
                </Link>
              </div>
              {user && (
                <div className="ml-6 flex space-x-4 items-center">
                  <Link
                    to="/home"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Home
                  </Link>
                  <Link
                    to="/dossiers"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Dossiers
                  </Link>
                  {isAdmin() && (
                    <>
                      <Link
                        to="/admin"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        Admin
                      </Link>
                      <Link
                        to="/direct-messages"
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        Messages
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              {user && (
                <div className="flex items-center">
                  {!isAdmin() && (
                    <button
                      onClick={() => setShowMessagesModal(true)}
                      className="relative px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Messages
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mx-2">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Direct Messages Modal */}
      <DirectMessagesModal
        isOpen={showMessagesModal}
        onClose={() => {
          setShowMessagesModal(false);
          // Reset unread count after viewing messages
          setUnreadCount(0);
        }}
      />
    </>
  );
};

export default Navbar;
