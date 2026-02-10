'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsAdmin(loggedIn);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      setLoginError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdminLoggedIn');
    setShowAdminLogin(false);
    setAdminPassword('');
    setLoginError('');
    router.push('/');
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Techno Imaging Logo"
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">CRM Portal</h1>
                <p className="text-xs text-gray-500">Client Management System</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Home
              </button>
              {isAdmin ? (
                <>
                  <button
                    onClick={() => router.push('/client-list')}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Client List
                  </button>
                  <button
                    onClick={() => router.push('/contacts')}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Contacts
                  </button>

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {loginError && (
                <p className="text-red-600 text-sm mb-4">{loginError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                    setLoginError('');
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
