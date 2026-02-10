'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClientTable from '../../components/ClientTable';
import ClientForm from '../../components/ClientForm';
import ContactForm from '../../components/ContactForm';
import Navigation from '../../components/Navigation';
import { Client, Contact, ClientLocation } from '@/types';


export default function ClientListPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedClientForContact, setSelectedClientForContact] = useState<Client | null>(null);

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
      // Filter out deleted clients and ensure proper data structure
      const activeClients = parsedClients
        .filter((client: Client) => !client.isDeleted)
        .map((client: Client) => ({
          ...client,
          // Ensure contacts array exists
          contacts: client.contacts || [],
          // Ensure locations array exists and each location has contacts array
          locations: (client.locations || []).map((loc: ClientLocation) => ({
            ...loc,
            contacts: loc.contacts || [],
          })),
        }));
      // Assign default serial numbers if missing
      const clientsWithSerial = activeClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: client.serialNumber || (index + 1).toString(),
      }));
      setClients(clientsWithSerial);
      // Save back to localStorage with serial numbers and proper structure
      localStorage.setItem('clients', JSON.stringify(parsedClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: client.serialNumber || (index + 1).toString(),
        contacts: client.contacts || [],
        locations: (client.locations || []).map((loc: ClientLocation) => ({
          ...loc,
          contacts: loc.contacts || [],
        })),
      }))));
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

    const data = localStorage.getItem('clients');
    let parsedClients: Client[] = [];
    if (data) {
      parsedClients = JSON.parse(data);
    }

    let updatedParsedClients;
    if (editingClient) {
      updatedParsedClients = parsedClients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedParsedClients = [...parsedClients, client];
    }

    localStorage.setItem('clients', JSON.stringify(updatedParsedClients));
    const activeClients = updatedParsedClients.filter((c: Client) => !c.isDeleted);
      const clientsWithSerial = activeClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: client.serialNumber || (index + 1).toString(),
      }));
    setClients(clientsWithSerial);
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    const data = localStorage.getItem('clients');
    if (data) {
      const parsedClients = JSON.parse(data);
      const updatedClients = parsedClients.map((c: Client) => c.id === id ? { ...c, isDeleted: true } : c);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      const activeClients = updatedClients.filter((c: Client) => !c.isDeleted);
      const clientsWithSerial = activeClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: client.serialNumber || (index + 1).toString(),
      }));
      setClients(clientsWithSerial);
    }
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

    const data = localStorage.getItem('clients');
    if (data) {
      const parsedClients = JSON.parse(data);
      const updatedParsedClients = parsedClients.map((c: Client) => (c.id === id ? { ...c, [field]: value } : c));
      localStorage.setItem('clients', JSON.stringify(updatedParsedClients));
      const activeClients = updatedParsedClients.filter((c: Client) => !c.isDeleted);
      const clientsWithSerial = activeClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: (index + 1).toString(),
      }));
      setClients(clientsWithSerial);
    }
  };

  const handleAddContact = (client: Client) => {
    setSelectedClientForContact(client);
    setShowContactForm(true);
  };

  const handleSaveContact = (contact: Contact, clientId: string) => {
    const data = localStorage.getItem('clients');
    if (data) {
      const parsedClients = JSON.parse(data);
      const updatedParsedClients = parsedClients.map((client: Client) => {
        if (client.id === clientId) {
          return {
            ...client,
            contacts: [...(client.contacts || []), contact],
          };
        }
        return client;
      });
      localStorage.setItem('clients', JSON.stringify(updatedParsedClients));
      const activeClients = updatedParsedClients.filter((c: Client) => !c.isDeleted);
      const clientsWithSerial = activeClients.map((client: Client, index: number) => ({
        ...client,
        serialNumber: (index + 1).toString(),
      }));
      setClients(clientsWithSerial);
    }
    setShowContactForm(false);
    setSelectedClientForContact(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

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
              onViewDetails={(client) => router.push(`/client/${client.id}`)}
            />
          </div>
        )}

        {/* Contact Form Section */}
        {showContactForm && selectedClientForContact && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Add Contact for {selectedClientForContact.companyName}</h2>
            <p className="text-gray-600 mb-6">Fill in the contact details below. Required fields are marked with *</p>
            <ContactForm
              contact={undefined}
              clients={clients}
              selectedClientId={selectedClientForContact.id}
              onSave={handleSaveContact}
              onCancel={() => {
                setShowContactForm(false);
                setSelectedClientForContact(null);
              }}
            />
          </div>
        )}

        <ClientTable
          clients={clients}
          onDelete={handleDeleteClient}
          userType={userType}
          onUpdateField={handleUpdateField}
          onViewDetails={(client) => router.push(`/client/${client.id}`)}
          onAddContact={handleAddContact}
        />
      </main>
    </div>
  );
}
