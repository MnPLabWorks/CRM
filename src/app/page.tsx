'use client';

import { useState, useEffect } from 'react';
import ClientForm from '@/components/ClientForm';
import Navigation from '@/components/Navigation';
import { Client } from '@/types';

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  useEffect(() => {
    loadClients();
  }, []);


  const loadClients = () => {
    const data = localStorage.getItem('clients');
    if (data) {
      setClients(JSON.parse(data));
    }
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
      <Navigation />

      {/* Main Content */}

      <main className="container-custom py-4">


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
