'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Contact, ClientLocation } from '@/types';

import ContactsTable from '@/components/ContactsTable';
import ContactForm from '@/components/ContactForm';
import Navigation from '@/components/Navigation';

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
    } else {
      setUserType('admin');
      loadClients();
    }
  }, [router]);


  const loadClients = () => {
    const data = localStorage.getItem('clients');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Ensure proper data structure with initialized contacts arrays
          const clientsWithStructure = parsed.map((client: Client) => ({
            ...client,
            // Ensure contacts array exists
            contacts: client.contacts || [],
            // Ensure locations array exists and each location has contacts array
            locations: (client.locations || []).map((loc: ClientLocation) => ({
              ...loc,
              contacts: loc.contacts || [],
            })),

          }));
          setClients(clientsWithStructure);
        } else {

          setClients([]);
        }
      } catch {
        setClients([]);
      }
    } else {
      setClients([]);
    }
  };




  const handleSaveContact = (contact: Contact, clientId: string) => {
    let updatedClients;

    if (editingContact && editingClientId) {
      // Update existing contact
      updatedClients = clients.map((client) => {
        if (client.id === editingClientId) {
          return {
            ...client,
            contacts: (client.contacts || []).map((c) =>
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
        const updatedContacts = (client.contacts || []).map((contact) =>
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
      <Navigation />

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
          clients={clients}
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
