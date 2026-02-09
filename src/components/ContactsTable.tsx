'use client';

import { useEffect, useState, useMemo } from 'react';
import { Client, Contact } from '@/types';

interface ContactWithClient extends Contact {
  clientName: string;
  clientId: string;
}

interface ContactsTableProps {
  clients: Client[];
  onUpdateContact?: (clientId: string, contactId: string, field: string, value: string) => void;
  onDeleteContact?: (clientId: string, contactId: string) => void;
  userType: string | null;
}

export default function ContactsTable({
  clients,
  onUpdateContact,
  onDeleteContact,
  userType,
}: ContactsTableProps) {
  const [filters, setFilters] = useState({
    clientName: '',
    contactName: '',
    designation: '',
    email: '',
    personalEmail: '',
    phone: '',
  });

  const [allContacts, setAllContacts] = useState<ContactWithClient[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactWithClient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ContactWithClient>>({});
  const [usePhoneAsWhatsapp, setUsePhoneAsWhatsapp] = useState(false);

  // Extract all contacts with client information
  useEffect(() => {
    const contacts: ContactWithClient[] = [];
    clients.forEach((client) => {
      // Extract contacts from client.contacts
      if (client.contacts && Array.isArray(client.contacts)) {
        client.contacts.forEach((contact) => {
          contacts.push({
            ...contact,
            clientName: client.companyName,
            clientId: client.id,
          });
        });
      }
      // Extract contacts from client.locations[*].contacts
      if (client.locations && Array.isArray(client.locations)) {
        client.locations.forEach((location) => {
          if (location.contacts && Array.isArray(location.contacts)) {
            location.contacts.forEach((contact) => {
              contacts.push({
                ...contact,
                clientName: client.companyName,
                clientId: client.id,
              });
            });
          }
        });
      }
    });
    setAllContacts(contacts);
  }, [clients]);

  // Get unique filter values
  const uniqueClientNames = useMemo(() => {
    const names = allContacts.map(c => c.clientName).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [allContacts]);

  const uniqueContactNames = useMemo(() => {
    const names = allContacts.map(c => c.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [allContacts]);

  const uniqueDesignations = useMemo(() => {
    const designations = allContacts.map(c => c.designation).filter(Boolean);
    return Array.from(new Set(designations)).sort();
  }, [allContacts]);

  const uniqueEmails = useMemo(() => {
    const emails = allContacts.map(c => c.email).filter(Boolean);
    return Array.from(new Set(emails)).sort();
  }, [allContacts]);

  const uniquePersonalEmails = useMemo(() => {
    const emails = allContacts.map(c => c.personalEmail).filter(Boolean);
    return Array.from(new Set(emails)).sort();
  }, [allContacts]);

  // Apply filters
  useEffect(() => {
    let filtered = allContacts;

    if (filters.clientName) {
      filtered = filtered.filter((c) =>
        c.clientName && c.clientName.toLowerCase().includes(filters.clientName.toLowerCase())
      );
    }

    if (filters.contactName) {
      filtered = filtered.filter((c) =>
        c.name && c.name.toLowerCase().includes(filters.contactName.toLowerCase())
      );
    }

    if (filters.designation) {
      filtered = filtered.filter((c) =>
        c.designation && c.designation.toLowerCase().includes(filters.designation.toLowerCase())
      );
    }

    if (filters.email) {
      filtered = filtered.filter((c) =>
        c.email && c.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.personalEmail) {
      filtered = filtered.filter((c) =>
        c.personalEmail && c.personalEmail.toLowerCase().includes(filters.personalEmail.toLowerCase())
      );
    }

    if (filters.phone) {
      filtered = filtered.filter((c) =>
        c.phone && c.phone.toLowerCase().includes(filters.phone.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [filters, allContacts]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      clientName: '',
      contactName: '',
      designation: '',
      email: '',
      personalEmail: '',
      phone: '',
    });
  };

  const handleStartEdit = (contact: ContactWithClient) => {
    setEditingId(contact.id);
    setEditClientId(contact.clientId);
    setEditData(contact);
    setUsePhoneAsWhatsapp(contact.phone === contact.whatsappNumber);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditClientId(null);
    setEditData({});
  };

  const handleSaveEdit = () => {
    if (editingId && editData && editClientId) {
      Object.keys(editData).forEach((key) => {
        if (key !== 'id' && key !== 'clientName' && key !== 'clientId') {
          const value = editData[key as keyof ContactWithClient] as string;
          onUpdateContact?.(editClientId, editingId, key, value);
        }
      });
      setEditingId(null);
      setEditClientId(null);
      setEditData({});
    }
  };

  const handleEditDataChange = (field: string, value: string) => {
    setEditData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      if (field === 'phone' && usePhoneAsWhatsapp) {
        newData.whatsappNumber = value;
      }
      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUsePhoneAsWhatsapp(checked);
    if (checked) {
      setEditData((prev) => ({
        ...prev,
        whatsappNumber: prev.phone || '',
      }));
    }
  };

  const handleDeleteContact = (contact: ContactWithClient) => {
    if (window.confirm(`Delete contact ${contact.name}?`)) {
      onDeleteContact?.(contact.clientId, contact.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {filteredContacts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">
            {allContacts.length === 0
              ? 'No contacts yet.'
              : 'No contacts match your filters.'}
          </p>
        </div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={filters.clientName}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  list="clientNameList"
                />
                <datalist id="clientNameList">
                  {uniqueClientNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={filters.contactName}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  list="contactNameList"
                />
                <datalist id="contactNameList">
                  {uniqueContactNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={filters.designation}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  list="designationList"
                />
                <datalist id="designationList">
                  {uniqueDesignations.map((designation) => (
                    <option key={designation} value={designation} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  list="emailList"
                />
                <datalist id="emailList">
                  {uniqueEmails.map((email) => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Personal Email
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={filters.personalEmail}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  list="personalEmailList"
                />
                <datalist id="personalEmailList">
                  {uniquePersonalEmails.map((email) => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex gap-1">
                  <input
                    type="tel"
                    name="phone"
                    value={filters.phone}
                    onChange={handleFilterChange}
                    placeholder="Filter..."
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleClearFilters}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flat Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 border-b-2 border-cyan-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Client Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Contact Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Designation
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Personal Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    WhatsApp
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    DOB
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Anniversary
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => {
                  const isEditing = editingId === contact.id;
                  const currentData = isEditing ? editData : contact;

                  return (
                    <tr key={contact.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 text-gray-700 font-medium">
                        {contact.clientName}
                      </td>
                      <td className="px-3 py-2 text-gray-800 font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.name || ''}
                            onChange={(e) => handleEditDataChange('name', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          contact.name
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.designation || ''}
                            onChange={(e) => handleEditDataChange('designation', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          contact.designation
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="email"
                            value={currentData.email || ''}
                            onChange={(e) => handleEditDataChange('email', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="email"
                            value={currentData.personalEmail || ''}
                            onChange={(e) => handleEditDataChange('personalEmail', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          contact.personalEmail ? (
                            <a
                              href={`mailto:${contact.personalEmail}`}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.personalEmail}
                            </a>
                          ) : (
                            '-'
                          )
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="tel"
                              value={currentData.phone || ''}
                              onChange={(e) => handleEditDataChange('phone', e.target.value)}
                              className="flex-1 px-1 py-1 text-xs border border-gray-300 rounded"
                            />
                            {currentData.phone === currentData.whatsappNumber && (
                              <input
                                type="checkbox"
                                checked={usePhoneAsWhatsapp}
                                onChange={handleCheckboxChange}
                                className="w-4 h-4"
                                title="Use phone as WhatsApp number"
                              />
                            )}
                          </div>
                        ) : (
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={currentData.whatsappNumber || ''}
                            onChange={(e) => handleEditDataChange('whatsappNumber', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          <>
                            {contact.whatsappNumber ? (
                              <a
                                href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                {contact.whatsappNumber}
                              </a>
                            ) : (
                              '-'
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="date"
                            value={currentData.dob || ''}
                            onChange={(e) => handleEditDataChange('dob', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          contact.dob || '-'
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="date"
                            value={currentData.anniversary || ''}
                            onChange={(e) => handleEditDataChange('anniversary', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          contact.anniversary || '-'
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition mr-1 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(contact)}
                              className="bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 transition mr-1 text-xs"
                            >
                              Edit
                            </button>
                            {userType === 'admin' && (
                              <button
                                onClick={() => handleDeleteContact(contact)}
                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
