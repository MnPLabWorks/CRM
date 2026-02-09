'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientForm from '@/components/ClientForm';
import { Client } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    loadClients();
    const loggedInStatus = localStorage.getItem('isAdminLoggedIn');
    if (loggedInStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const loadClients = () => {
    const data = localStorage.getItem('clients');
    if (data) {
      setClients(JSON.parse(data));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      setLoginError('Invalid admin password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    setShowAdminLogin(false);
    setAdminPassword('');
  };

  const handleSaveClient = (client: Client) => {
    let updatedClients;

    if (editingClient) {
      updatedClients = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedClients = [...clients, client];
    }

    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setEditingClient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Techno Imaging Logo"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">CRM Portal</h1>
                <p className="text-xs text-gray-500">Client Management System</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isAdminLoggedIn ? (
                <>
                  <span className="text-gray-700 font-semibold py-2 text-sm">Admin</span>
                  <button
                    onClick={handleAdminLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-semibold text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="btn-primary text-sm"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h2>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="form-input"
                  required
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Password: admin123
                </p>
              </div>

              {loginError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
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
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-custom py-4">
        {/* Action Buttons - Admin Only */}
        {isAdminLoggedIn && (
          <div className="mb-6 flex gap-3 flex-wrap">
            <button
              onClick={() => router.push('/client-list')}
              className="btn-secondary"
            >
              View Client List
            </button>
            <button
              onClick={() => router.push('/contacts')}
              className="btn-secondary"
            >
              View Client Contacts
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(clients, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `clients-${new Date().toISOString()}.json`;
                a.click();
              }}
              className="btn-secondary"
            >
              Export as JSON
            </button>
          </div>
        )}

        {/* Form Section - Accessible to Everyone */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">{editingClient ? 'Edit Client Information' : 'Add Client Information'}</h2>
          <p className="text-gray-600 mb-6">Fill in the client details below. Required fields are marked with *</p>
          <ClientForm
            client={editingClient || undefined}
            existingClients={clients}
            onSave={handleSaveClient}
            onCancel={() => {
              setEditingClient(null);
            }}
          />
        </div>


      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 border-t border-gray-700">
        <div className="container-custom text-center text-sm">
          <p>&copy; 2025 Techno Imaging. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
