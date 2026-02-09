'use client';

import { useState, useEffect } from 'react';
import { Contact, Client } from '@/types';

interface ContactFormProps {
  contact?: Contact;
  clients: Client[];
  selectedClientId?: string;
  onSave: (contact: Contact, clientId: string) => void;
  onCancel: () => void;
}

export default function ContactForm({
  contact,
  clients,
  selectedClientId,
  onSave,
  onCancel,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    personalEmail: '',
    phone: '',
    whatsappNumber: '',
    dob: '',
    anniversary: '',
  });

  const [selectedClient, setSelectedClient] = useState(selectedClientId || '');
  const [usePhoneAsWhatsapp, setUsePhoneAsWhatsapp] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        designation: contact.designation,
        email: contact.email,
        personalEmail: contact.personalEmail || '',
        phone: contact.phone,
        whatsappNumber: contact.whatsappNumber,
        dob: contact.dob,
        anniversary: contact.anniversary,
      });
      setUsePhoneAsWhatsapp(contact.phone === contact.whatsappNumber);
    }
  }, [contact]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      if (name === 'phone' && usePhoneAsWhatsapp) {
        newData.whatsappNumber = value;
      }
      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUsePhoneAsWhatsapp(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        whatsappNumber: prev.phone,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !selectedClient) {
      alert('Please fill in all required fields');
      return;
    }

    const newContact = {
      id: contact?.id || Date.now().toString(),
      ...formData,
    };

    onSave(newContact, selectedClient);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Client *</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="form-select"
            required
            disabled={!!contact}
          >
            <option value="">Select a Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Contact Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="form-input"
            required
          />
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            placeholder="Manager, Director, etc."
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="form-input"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Personal Email</label>
          <input
            type="email"
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleInputChange}
            placeholder="john.personal@example.com"
            className="form-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number</label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className="form-input"
            disabled={usePhoneAsWhatsapp}
          />
          <div className="flex items-center mt-3 mb-2">
            <input
              type="checkbox"
              id="sameAsContact"
              checked={usePhoneAsWhatsapp}
              onChange={handleCheckboxChange}
              className="w-5 h-5 accent-blue-600"
            />
            <label htmlFor="sameAsContact" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
              Same as contact number
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Anniversary</label>
          <input
            type="date"
            name="anniversary"
            value={formData.anniversary}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-3">
        <button type="submit" className="btn-primary flex-1">
          {contact ? 'Update Contact' : 'Add Contact'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
