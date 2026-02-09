﻿'use client';

import { useState, useEffect } from 'react';
import { Client, Contact, Location } from '@/types';

interface ClientFormProps {
  client?: Client;
  existingClients: Client[];
  onSave: (client: Client) => void;
  onCancel: () => void;
  onViewDetails?: (client: Client) => void;
}

export default function ClientForm({ client, existingClients, onSave, onCancel, onViewDetails }: ClientFormProps) {
  const [formData, setFormData] = useState({
    serialNumber: '',
    clientCode: '',
    status: 'Potential Client',
    domain: '',
    companyName: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    locations: [] as Location[],
    paymentTerm: '',
    paymentRemarks: '',
    paymentMode: 'Postpaid',
    availability: '',
    gstNumber: '',
    panNumber: '',
    startDate: '',
    companyDOB: '',
    contacts: [] as Contact[],
  });

  const [usePhoneAsWhatsapp, setUsePhoneAsWhatsapp] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (client) {
      setFormData({
        serialNumber: client.serialNumber,
        clientCode: client.clientCode,
        status: client.status,
        domain: client.domain,
        companyName: client.companyName,
        website: client.website,
        email: client.email,
        phone: client.phone,
        country: client.country,
        locations: client.locations || [],
        paymentTerm: client.paymentTerm,
        paymentRemarks: client.paymentRemarks,
        paymentMode: client.paymentMode,
        availability: client.availability,
        gstNumber: client.gstNumber,
        panNumber: client.panNumber,
        startDate: client.startDate,
        companyDOB: client.companyDOB,
        contacts: client.contacts || [],
      });
    } else {
      // Reset to blank for new clients
      setFormData({
        serialNumber: '',
        clientCode: '',
        status: 'Potential Client',
        domain: '',
        companyName: '',
        website: '',
        email: '',
        phone: '',
        country: '',
        locations: [],
        paymentTerm: '',
        paymentRemarks: '',
        paymentMode: 'Postpaid',
        availability: '',
        gstNumber: '',
        panNumber: '',
        startDate: '',
        companyDOB: '',
        contacts: [],
      });
      setUsePhoneAsWhatsapp({});
    }
  }, [client, existingClients]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (index: number, field: keyof Location, value: string) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      ),
    }));
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, {
        id: Date.now().toString(),
        locationName: '',
        address: '',
        city: '',
        contactNumber: '',
        contacts: [],
      }],
    }));
  };

  const removeLocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const addContactToLocation = (locationIndex: number) => {
    const contactId = Date.now().toString();
    const currentContactsLength = formData.locations[locationIndex].contacts.length;
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc, i) =>
        i === locationIndex
          ? {
              ...loc,
              contacts: [...loc.contacts, {
                id: contactId,
                name: '',
                designation: '',
                email: '',
                phone: '',
                whatsappNumber: '',
                dob: '',
                anniversary: '',
              }],
            }
          : loc
      ),
    }));
    setUsePhoneAsWhatsapp((prev) => ({
      ...prev,
      [`${locationIndex}-${currentContactsLength}`]: false,
    }));
  };

  const removeContactFromLocation = (locationIndex: number, contactIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc, i) =>
        i === locationIndex
          ? {
              ...loc,
              contacts: loc.contacts.filter((_, j) => j !== contactIndex),
            }
          : loc
      ),
    }));
  };

  const handleLocationContactChange = (
    locationIndex: number,
    contactIndex: number,
    field: keyof Contact,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc, i) =>
        i === locationIndex
          ? {
              ...loc,
              contacts: loc.contacts.map((contact, j) =>
                j === contactIndex
                  ? {
                      ...contact,
                      [field]: value,
                      ...(field === 'phone' && usePhoneAsWhatsapp[`${locationIndex}-${contactIndex}`] ? { whatsappNumber: value } : {}),
                    }
                  : contact
              ),
            }
          : loc
      ),
    }));
  };

  const handleLocationContactCheckboxChange = (locationIndex: number, contactIndex: number, checked: boolean) => {
    setUsePhoneAsWhatsapp((prev) => ({
      ...prev,
      [`${locationIndex}-${contactIndex}`]: checked,
    }));
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        locations: prev.locations.map((loc, i) =>
          i === locationIndex
            ? {
                ...loc,
                contacts: loc.contacts.map((contact, j) =>
                  j === contactIndex ? { ...contact, whatsappNumber: contact.phone } : contact
                ),
              }
            : loc
        ),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedFormData = { ...formData };

    if (!client) {
      // Generate client code and serial number for new clients
      const nextNumber = (existingClients?.length || 0) + 1;
      const clientCode = `CLI${nextNumber.toString().padStart(3, '0')}`;
      const serialNumber = nextNumber.toString();
      updatedFormData.clientCode = clientCode;
      updatedFormData.serialNumber = serialNumber;
    }

    if (!updatedFormData.clientCode || !updatedFormData.companyName || !updatedFormData.email) {
      alert('Please fill in all required fields');
      return;
    }

    const newClient = {
      id: client?.id || Date.now().toString(),
      ...updatedFormData,
      createdAt: client?.createdAt || new Date().toISOString(),
    };

    onSave(newClient);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Client Code *</label>
          <input type="text" name="clientCode" value={formData.clientCode} onChange={handleInputChange} placeholder="CLI001" className="form-input" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Acme Corp" className="form-input" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@example.com" className="form-input" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Status</label>
          <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
            <option>Client</option>
            <option>Potential Client</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Domain</label>
          <input type="text" name="domain" value={formData.domain} onChange={handleInputChange} placeholder="Technology, Finance, etc." className="form-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Term</label>
          <input type="text" name="paymentTerm" value={formData.paymentTerm} onChange={handleInputChange} placeholder="30 days, Net 60, etc." className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Availability</label>
          <input type="text" name="availability" value={formData.availability} onChange={handleInputChange} placeholder="Monday-Friday, 9am-5pm, etc." className="form-input" />
        </div>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Website</label>
          <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">GST/IN</label>
          <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} placeholder="27AABCT1234F2Z5" className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">PAN Number</label>
          <input type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="AAATQ1234A" className="form-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Company DOB</label>
          <input type="date" name="companyDOB" value={formData.companyDOB} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleInputChange} className="form-select">
            <option>Prepaid</option>
            <option>Postpaid</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Payment Remarks</label>
        <textarea name="paymentRemarks" value={formData.paymentRemarks} onChange={handleInputChange} placeholder="Additional payment information..." className="form-input" rows={2} />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-gray-700 font-semibold">Business Locations</label>
          <button type="button" onClick={addLocation} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
            + Add Location
          </button>
        </div>
        {formData.locations.length === 0 ? (
          <p className="text-gray-500 text-sm mb-3">No locations added yet</p>
        ) : (
          <div className="space-y-4">
            {formData.locations.map((location, locationIndex) => (
              <div key={location.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Location Name</label>
                    <input
                      type="text"
                      value={location.locationName}
                      onChange={(e) => handleLocationChange(locationIndex, 'locationName', e.target.value)}
                      placeholder="e.g., Head Office, Branch Office"
                      className="form-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Contact Number</label>
                    <input
                      type="tel"
                      value={location.contactNumber}
                      onChange={(e) => handleLocationChange(locationIndex, 'contactNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="form-input text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">Address</label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => handleLocationChange(locationIndex, 'address', e.target.value)}
                      placeholder="Street address"
                      className="form-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">City</label>
                    <input
                      type="text"
                      value={location.city}
                      onChange={(e) => handleLocationChange(locationIndex, 'city', e.target.value)}
                      placeholder="City name"
                      className="form-input text-sm"
                    />
                  </div>
                </div>

                {/* Contacts section for this location */}
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-gray-700 font-semibold text-sm">Contacts for this Location</label>
                    <button
                      type="button"
                      onClick={() => addContactToLocation(locationIndex)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      + Add Contact
                    </button>
                  </div>

                  {location.contacts.length === 0 ? (
                    <p className="text-gray-400 text-xs mb-3">No contacts for this location</p>
                  ) : (
                    <div className="space-y-3">
                      {location.contacts.map((contact, contactIndex) => (
                        <div key={contact.id} className="border rounded bg-white p-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Name</label>
                              <input
                                type="text"
                                value={contact.name}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'name', e.target.value)
                                }
                                placeholder="Full name"
                                className="form-input text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Designation</label>
                              <input
                                type="text"
                                value={contact.designation}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'designation', e.target.value)
                                }
                                placeholder="e.g., Manager, Director"
                                className="form-input text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Email</label>
                              <input
                                type="email"
                                value={contact.email}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'email', e.target.value)
                                }
                                placeholder="email@example.com"
                                className="form-input text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Phone</label>
                              <input
                                type="tel"
                                value={contact.phone}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'phone', e.target.value)
                                }
                                placeholder="Phone number"
                                className="form-input text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">WhatsApp Number</label>
                              <input
                                type="tel"
                                value={contact.whatsappNumber}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'whatsappNumber', e.target.value)
                                }
                                placeholder="WhatsApp number"
                                className="form-input text-xs"
                                disabled={usePhoneAsWhatsapp[`${locationIndex}-${contactIndex}`]}
                              />
                              <div className="flex items-center mt-1 mb-2">
                                <input
                                  type="checkbox"
                                  id={`sameAsContact-${locationIndex}-${contactIndex}`}
                                  checked={usePhoneAsWhatsapp[`${locationIndex}-${contactIndex}`] || false}
                                  onChange={(e) => handleLocationContactCheckboxChange(locationIndex, contactIndex, e.target.checked)}
                                  className="w-4 h-4 accent-blue-600"
                                />
                                <label htmlFor={`sameAsContact-${locationIndex}-${contactIndex}`} className="ml-2 text-xs font-medium text-gray-700 cursor-pointer">
                                  Same as contact number
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Date of Birth</label>
                              <input
                                type="date"
                                value={contact.dob}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'dob', e.target.value)
                                }
                                className="form-input text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex-1">
                              <label className="block text-gray-600 font-semibold mb-1 text-xs">Anniversary</label>
                              <input
                                type="date"
                                value={contact.anniversary}
                                onChange={(e) =>
                                  handleLocationContactChange(locationIndex, contactIndex, 'anniversary', e.target.value)
                                }
                                className="form-input text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeContactFromLocation(locationIndex, contactIndex)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs ml-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => removeLocation(locationIndex)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn-primary flex-1">{client ? 'Update Client' : 'Add Client'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        {client && onViewDetails && (
          <button type="button" onClick={() => onViewDetails(client)} className="btn-secondary flex-1">View Details</button>
        )}
      </div>
    </form>
  );
}
