'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClientTable from '../../components/ClientTable';
import ClientForm from '../../components/ClientForm';
import { Client } from '@/types';

export default function ClientDetailsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');

    if (isAdminLoggedIn !== 'true') {
      router.push('/');
    } else {
      setUserType('admin');
      loadClients();
    }
  }, [router]);

  const loadClients = () => {
    const data = localStorage.getItem('clients');
    if (data) {
      const parsedClients = JSON.parse(data);
      // Assign default serial numbers if missing
      const clientsWithSerial = parsedClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: client.serialNumber || (index + 1).toString(),
      }));
      setClients(clientsWithSerial);
      // Save back to localStorage with serial numbers
      localStorage.setItem('clients', JSON.stringify(clientsWithSerial));
    }
  };

  const handleSaveClient = (client: Client) => {

    // Check for duplicate client code
    const isDuplicate = editingClient
      ? clients.some(c => c.id !== client.id && c.clientCode === client.clientCode)
      : clients.some(c => c.clientCode === client.clientCode);

    if (isDuplicate) {
      alert('Client code already exists. Please enter a new code.');
      return;
    }

    let updatedClients;

    if (editingClient) {
      updatedClients = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedClients = [...clients, client];
    }

    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    const updatedClients = clients.filter((c) => c.id !== id);
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleUpdateField = (id: string, field: string, value: string) => {
    // Validate duplicate client code
    if (field === 'clientCode') {
      const isDuplicate = clients.some(c => c.id !== id && c.clientCode === value);
      if (isDuplicate) {
        alert('Client code already exists. Please enter a new code.');
        return;
      }
    }

    const updatedClients = clients.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Client List</h1>
            <p className="text-cyan-100 text-xs">
              Manage and filter all clients
            </p>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-4">
        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{editingClient ? 'Edit Client Information' : 'Add Client Information'}</h2>
            <p className="text-gray-600 mb-6">Fill in the client details below. Required fields are marked with *</p>
            <ClientForm
              client={editingClient || undefined}
              existingClients={clients}
              onSave={handleSaveClient}
              onCancel={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
            />
          </div>
        )}

        <ClientTable
          clients={clients}
          onDelete={handleDeleteClient}
          userType={userType}
          onUpdateField={handleUpdateField}
        />
      </main>
    </div>
  );
}
