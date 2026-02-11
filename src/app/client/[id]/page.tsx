'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Client, Contact } from '@/types';
import ContactsTable from '@/components/ContactsTable';
import ContactForm from '@/components/ContactForm';

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (isAdminLoggedIn !== 'true') {
      router.push('/');
      return;
    }
    setUserType('admin');

    const data = localStorage.getItem('clients');
    if (data) {
      const clients: Client[] = JSON.parse(data);
      const found = clients.find(c => c.id === id);
      setClient(found || null);
    }
  }, [id, router]);

  const handleUpdateContact = (clientId: string, contactId: string, field: string, value: string) => {
    if (!client) return;

    const updatedClients = JSON.parse(localStorage.getItem('clients') || '[]').map((c: Client) => {
      if (c.id === clientId) {
        const updatedContacts = c.contacts?.map((contact) =>
          contact.id === contactId ? { ...contact, [field]: value } : contact
        );
        return { ...c, contacts: updatedContacts };
      }
      return c;
    });

    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClient(updatedClients.find((c: Client) => c.id === id) || null);
  };

  const handleDeleteContact = (clientId: string, contactId: string) => {
    if (!client) return;

    const updatedClients = JSON.parse(localStorage.getItem('clients') || '[]').map((c: Client) => {
      if (c.id === clientId) {
        const updatedContacts = c.contacts?.filter((contact) => contact.id !== contactId);
        return { ...c, contacts: updatedContacts };
      }
      return c;
    });

    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClient(updatedClients.find((c: Client) => c.id === id) || null);
  };

  const handleSaveContact = (contact: Contact, clientId: string) => {
    if (!client) return;

    let updatedClients;

    if (editingContact && editingContact.id) {
      updatedClients = JSON.parse(localStorage.getItem('clients') || '[]').map((c: Client) => {
        if (c.id === clientId) {
          return {
            ...c,
            contacts: c.contacts?.map((cont) =>
              cont.id === editingContact.id ? contact : cont
            ),
          };
        }
        return c;
      });
    } else {
      updatedClients = JSON.parse(localStorage.getItem('clients') || '[]').map((c: Client) => {
        if (c.id === clientId) {
          return {
            ...c,
            contacts: [...(c.contacts || []), contact],
          };
        }
        return c;
      });
    }

    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClient(updatedClients.find((c: Client) => c.id === id) || null);
    setShowForm(false);
    setEditingContact(null);
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Client Not Found</h1>
          <button
            onClick={() => router.push('/client-list')}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            Back to Client List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Contact Details</h1>
            <p className="text-cyan-100 text-xs">
              Manage and filter all contacts for {client.companyName}
            </p>
          </div>
        </div>
      </header>

      <main className="container-custom py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Contacts List</h2>
              <p className="text-gray-600 text-sm mt-1">
                All contacts for {client.companyName} with filtering, editing, and management capabilities
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingContact(null);
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

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              {editingContact ? 'Edit Contact Information' : 'Add Contact Information'}
            </h2>
            <p className="text-gray-600 mb-6">Fill in the contact details below. Required fields are marked with *</p>
            <ContactForm
              contact={editingContact || undefined}
              clients={[client]}
              selectedClientId={client.id}
              onSave={handleSaveContact}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
              }}
            />
          </div>
        )}

        <ContactsTable
          clients={[client]}
          onUpdateContact={handleUpdateContact}
          onDeleteContact={handleDeleteContact}
          userType={userType}
        />
      </main>
    </div>
  );
}
