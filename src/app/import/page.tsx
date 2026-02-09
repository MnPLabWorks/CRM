'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImportExcel from '@/components/ImportExcel';
import { Client } from '@/types';

export default function ImportPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUserType = localStorage.getItem('userType');

    if (!isLoggedIn) {
      router.push('/');
    } else {
      setUserType(savedUserType);
    }
  }, [router]);

  const handleImport = (newClients: Client[]) => {
    try {
      // Get existing clients
      const existingData = localStorage.getItem('clients');
      const existingClients: Client[] = existingData ? JSON.parse(existingData) : [];

      // Filter out deleted clients and add new ones
      const activeClients = existingClients.filter(c => !c.isDeleted);
      const allClients = [...activeClients, ...newClients];

      // Recalculate serial numbers
      const clientsWithSerial = allClients.map((client, index) => ({
        ...client,
        serialNumber: (index + 1).toString(),
      }));

      // Save to localStorage
      localStorage.setItem('clients', JSON.stringify(clientsWithSerial));

      alert(`Successfully imported ${newClients.length} client(s)!`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only admin users can access the import page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg">
        <div className="container-custom flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-white">Import Excel Data</h1>
            <p className="text-cyan-100 text-xs">
              Logged in as: <span className="font-semibold capitalize">{userType}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <ImportExcel onImport={handleImport} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
}
