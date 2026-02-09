'use client';

import { useEffect, useState, useMemo } from 'react';
import { Client } from '@/types';

interface ClientTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
  userType: string | null;
  onUpdateField?: (id: string, field: string, value: string) => void;
  onViewDetails?: (client: Client) => void;
  onAddContact?: (client: Client) => void;
}

export default function ClientTable({
  clients,
  onDelete,
  userType,
  onUpdateField,
  onViewDetails,
  onAddContact,
}: ClientTableProps) {
  const [filters, setFilters] = useState({
    serialNumber: '',
    clientCode: '',
    companyName: '',
    email: '',
    phone: '',
    status: '',
    domain: '',
    country: '',
    paymentMode: '',
  });

  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Client>>({});

  const uniqueSerialNumbers = useMemo(() => {
    const sns = clients.map(c => c.serialNumber).filter(Boolean);
    return Array.from(new Set(sns)).sort();
  }, [clients]);

  const uniqueClientCodes = useMemo(() => {
    const ccs = clients.map(c => c.clientCode).filter(Boolean);
    return Array.from(new Set(ccs)).sort();
  }, [clients]);

  const uniqueCompanyNames = useMemo(() => {
    const cns = clients.map(c => c.companyName).filter(Boolean);
    return Array.from(new Set(cns)).sort();
  }, [clients]);

  const uniqueEmails = useMemo(() => {
    const emails = clients.map(c => c.email).filter(Boolean);
    return Array.from(new Set(emails)).sort();
  }, [clients]);

  const uniqueDomains = useMemo(() => {
    const domains = clients.map(c => c.domain).filter(Boolean);
    return Array.from(new Set(domains)).sort();
  }, [clients]);

  const uniqueCountries = useMemo(() => {
    const countries = clients.map(c => c.country).filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }, [clients]);

  useEffect(() => {
    let filtered = clients;

    if (filters.serialNumber) {
      filtered = filtered.filter((c) =>
        c.serialNumber && c.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())
      );
    }

    if (filters.clientCode) {
      filtered = filtered.filter((c) =>
        c.clientCode && c.clientCode.toLowerCase().includes(filters.clientCode.toLowerCase())
      );
    }

    if (filters.companyName) {
      filtered = filtered.filter((c) =>
        c.companyName && c.companyName.toLowerCase().includes(filters.companyName.toLowerCase())
      );
    }

    if (filters.email) {
      filtered = filtered.filter((c) =>
        c.email && c.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.phone) {
      filtered = filtered.filter((c) =>
        c.phone && c.phone.toLowerCase().includes(filters.phone.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.domain) {
      filtered = filtered.filter((c) =>
        c.domain && c.domain.toLowerCase().includes(filters.domain.toLowerCase())
      );
    }

    if (filters.country) {
      filtered = filtered.filter((c) =>
        c.country && c.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.paymentMode) {
      filtered = filtered.filter((c) => c.paymentMode === filters.paymentMode);
    }

    setFilteredClients(filtered);
  }, [filters, clients]);

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
      serialNumber: '',
      clientCode: '',
      companyName: '',
      email: '',
      phone: '',
      status: '',
      domain: '',
      country: '',
      paymentMode: '',
    });
  };

  const handleStartEdit = (client: Client) => {
    setEditingId(client.id);
    setEditData(client);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = () => {
    if (editingId && editData) {
      Object.keys(editData).forEach((key) => {
        if (key !== 'id') {
          const value = editData[key as keyof Client] as string;
          onUpdateField?.(editingId, key, value);
        }
      });
      setEditingId(null);
      setEditData({});
    }
  };

  const handleEditDataChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {filteredClients.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              {clients.length === 0
                ? 'No clients yet.'
                : 'No clients match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 border-b-2 border-cyan-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Serial Number
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Client Code
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Company Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Domain
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Country
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Payment Mode
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-white">
                    Locations
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-white">
                    Actions
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="px-3 py-1">
                    <input
                      type="text"
                      name="serialNumber"
                      value={filters.serialNumber}
                      onChange={handleFilterChange}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      list="serialNumberList"
                    />
                    <datalist id="serialNumberList">
                      {uniqueSerialNumbers.map((sn) => (
                        <option key={sn} value={sn} />
                      ))}
                    </datalist>
                  </th>
                  <th className="px-3 py-1">
                    <input
                      type="text"
                      name="clientCode"
                      value={filters.clientCode}
                      onChange={handleFilterChange}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      list="clientCodeList"
                    />
                    <datalist id="clientCodeList">
                      {uniqueClientCodes.map((cc) => (
                        <option key={cc} value={cc} />
                      ))}
                    </datalist>
                  </th>
                  <th className="px-3 py-1">
                    <input
                      type="text"
                      name="companyName"
                      value={filters.companyName}
                      onChange={handleFilterChange}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      list="companyNameList"
                    />
                    <datalist id="companyNameList">
                      {uniqueCompanyNames.map((cn) => (
                        <option key={cn} value={cn} />
                      ))}
                    </datalist>
                  </th>
                  <th className="px-3 py-1">
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      <option value="Client">Client</option>
                      <option value="Potential Client">Potential Client</option>
                    </select>
                  </th>
                  <th className="px-3 py-1">
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
                  </th>
                  <th className="px-3 py-1">
                    <input
                      type="tel"
                      name="phone"
                      value={filters.phone}
                      onChange={handleFilterChange}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-3 py-1">
                    <input
                      type="text"
                      name="domain"
                      value={filters.domain}
                      onChange={handleFilterChange}
                      placeholder="Filter..."
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      list="domainList"
                    />
                    <datalist id="domainList">
                      {uniqueDomains.map((domain) => (
                        <option key={domain} value={domain} />
                      ))}
                    </datalist>
                  </th>
                  <th className="px-3 py-1">
                    <select
                      name="country"
                      value={filters.country}
                      onChange={handleFilterChange}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      {uniqueCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="px-3 py-1">
                    <select
                      name="paymentMode"
                      value={filters.paymentMode}
                      onChange={handleFilterChange}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="">All</option>
                      <option value="Prepaid">Prepaid</option>
                      <option value="Postpaid">Postpaid</option>
                    </select>
                  </th>
                  <th className="px-3 py-1">
                  </th>
                  <th className="px-3 py-1 text-center">
                    <button
                      onClick={handleClearFilters}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client: Client) => {
                  const isEditing = editingId === client.id;
                  const currentData = isEditing ? editData : client;

                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.serialNumber || ''}
                            onChange={(e) => handleEditDataChange('serialNumber', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.serialNumber
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.clientCode || ''}
                            onChange={(e) => handleEditDataChange('clientCode', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.clientCode
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.companyName || ''}
                            onChange={(e) => handleEditDataChange('companyName', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.companyName
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <select
                            value={currentData.status || ''}
                            onChange={(e) => handleEditDataChange('status', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="Client">Client</option>
                            <option value="Potential Client">Potential Client</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.status === 'Client'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {client.status}
                          </span>
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
                          client.email
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={currentData.phone || ''}
                            onChange={(e) => handleEditDataChange('phone', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.phone
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.domain || ''}
                            onChange={(e) => handleEditDataChange('domain', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.domain
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentData.country || ''}
                            onChange={(e) => handleEditDataChange('country', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          />
                        ) : (
                          client.country
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <select
                            value={currentData.paymentMode || ''}
                            onChange={(e) => handleEditDataChange('paymentMode', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
                          >
                            <option value="Prepaid">Prepaid</option>
                            <option value="Postpaid">Postpaid</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.paymentMode === 'Prepaid'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {client.paymentMode}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        {client.locations && client.locations.length > 0 ? (
                          <div className="text-xs space-y-2">
                            {client.locations.map((loc, locIdx) => (
                              <div key={locIdx} className="bg-gray-100 p-2 rounded">
                                <div className="font-semibold text-gray-900">{loc.locationName}</div>
                                <div className="text-gray-600 text-xs">{loc.city}</div>
                                <div className="text-gray-600 text-xs">{loc.contactNumber}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No locations</span>
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
                            {onViewDetails && (
                              <button
                                onClick={() => onViewDetails(client)}
                                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition mr-1 text-xs"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEdit(client)}
                              className="bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 transition mr-1 text-xs"
                            >
                              Edit
                            </button>
                            {onAddContact && (
                              <button
                                onClick={() => onAddContact(client)}
                                className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition mr-1 text-xs"
                              >
                                Add Contact
                              </button>
                            )}
                            {userType === 'admin' && (
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      'Are you sure you want to delete this client?'
                                    )
                                  ) {
                                    onDelete(client.id);
                                  }
                                }}
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
        )}
    </div>
  );
}
