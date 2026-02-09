'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Contact } from '@/types';
import ContactsTable from '@/components/ContactsTable';
import ContactForm from '@/components/ContactForm';

export default function ContactsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isAdminLoggedIn !== 'true') {
      router.push('/');
      return;
    }
    setUserType('admin');
    loadClients();
  }, [router]);

  const loadClients = () => {
    const data = localStorage.getItem('clients');
    if (data) {
      const parsedClients = JSON.parse(data);
      setClients(parsedClients);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAdminLoggedIn');
    router.push('/');
  };

  const handleSaveContact = (contact: Contact, clientId: string) => {
    let updatedClients;

    if (editingContact && editingClientId) {
      // Update existing contact
      updatedClients = clients.map((client) => {
        if (client.id === editingClientId) {
          return {
            ...client,
            contacts: client.contacts.map((c) =>
              c.id === editingContact.id ? contact : c
            ),
          };
        }
        return client;
      });
    } else {
      // Add new contact
      updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            contacts: [...(client.contacts || []), contact],
          };
        }
        return client;
      });
    }

    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setShowForm(false);
    setEditingContact(null);
    setEditingClientId(null);
  };

  const handleUpdateContact = (clientId: string, contactId: string, field: string, value: string) => {
    const updatedClients = clients.map((client) => {
      if (client.id === clientId) {
        const updatedContacts = client.contacts.map((contact) =>
          contact.id === contactId ? { ...contact, [field]: value } : contact
        );
        return { ...client, contacts: updatedContacts };
      }
      return client;
    });
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleDeleteContact = (clientId: string, contactId: string) => {
    const updatedClients = clients.map((client) => {
      if (client.id === clientId) {
        const updatedContacts = client.contacts.filter((contact) => contact.id !== contactId);
        return { ...client, contacts: updatedContacts };
      }
      return client;
    });
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Client Contacts</h1>
            <p className="text-cyan-100 text-xs">
              View and manage all contacts across clients
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Contacts List</h2>
              <p className="text-gray-600 text-sm mt-1">
                All contacts organized with filtering, editing, and management capabilities
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingContact(null);
                  setEditingClientId(null);
                  setShowForm(!showForm);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                {showForm ? 'Cancel' : 'Add Contact'}
              </button>
              <button
                onClick={() => router.push('/client-list')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                View Clients
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              {editingContact ? 'Edit Contact Information' : 'Add Contact Information'}
            </h2>
            <p className="text-gray-600 mb-6">Fill in the contact details below. Required fields are marked with *</p>
            <ContactForm
              contact={editingContact || undefined}
              clients={clients}
              selectedClientId={editingClientId || undefined}
              onSave={handleSaveContact}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
                setEditingClientId(null);
              }}
            />
          </div>
        )}

        <ContactsTable
          clients={clients.filter(c => !c.isDeleted)}
          onUpdateContact={handleUpdateContact}
          onDeleteContact={handleDeleteContact}
          userType={userType}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 border-t border-gray-700 mt-auto">
        <div className="container-custom text-center text-sm">
          <p>&copy; 2025 Techno Imaging. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
