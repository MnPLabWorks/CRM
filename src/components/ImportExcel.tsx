'use client';

import { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Client, Contact } from '@/types';

interface ImportExcelProps {
  onImport: (clients: Client[]) => void;
  onCancel: () => void;
}

export default function ImportExcel({ onImport, onCancel }: ImportExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setPreviewData([]);

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);

    // Preview the data
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Get the first worksheet
        const worksheet = workbook.worksheets[0];

        // Convert to JSON
        const jsonData: any[][] = [];
        worksheet.eachRow((row, rowNumber) => {
          const rowData: any[] = [];
          row.eachCell((cell) => {
            rowData.push(cell.value);
          });
          jsonData.push(rowData);
        });

        // Show first 6 rows as preview
        setPreviewData(jsonData.slice(0, 6));
      } catch (err) {
        setError('Error reading Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);

          // Get the first worksheet
          const worksheet = workbook.worksheets[0];

          // Convert to JSON with headers
          const jsonData: any[] = [];
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
              const headerCell = worksheet.getCell(1, colNumber);
              const header = headerCell.value?.toString() || `col${colNumber}`;
              rowData[header] = cell.value;
            });
            jsonData.push(rowData);
          });

          if (jsonData.length === 0) {
            setError('The Excel file appears to be empty.');
            setIsProcessing(false);
            return;
          }

          // Convert to Client format
          const clients: Client[] = jsonData.map((row: any, index: number) => {
            // Generate unique ID
            const id = `client_${Date.now()}_${index}`;

            // Parse contacts if they exist in the row
            let contacts: Contact[] = [];
            if (row.contacts && typeof row.contacts === 'string') {
              try {
                contacts = JSON.parse(row.contacts);
              } catch {
                // If contacts is not JSON, create a single contact from available fields
                contacts = [{
                  id: `contact_${Date.now()}_${index}`,
                  name: row.contactName || row.name || '',
                  designation: row.designation || '',
                  email: row.contactEmail || row.email || '',
                  phone: row.contactPhone || row.phone || '',
                  whatsappNumber: row.whatsappNumber || '',
                  dob: row.dob || '',
                  anniversary: row.anniversary || ''
                }];
              }
            } else if (row.contactName || row.name) {
              // Create contact from individual fields
              contacts = [{
                id: `contact_${Date.now()}_${index}`,
                name: row.contactName || row.name || '',
                designation: row.designation || '',
                email: row.contactEmail || row.email || '',
                phone: row.contactPhone || row.phone || '',
                whatsappNumber: row.whatsappNumber || '',
                dob: row.dob || '',
                anniversary: row.anniversary || ''
              }];
            }

            // Parse locations array
            let locations: string[] = [];
            if (row.locations) {
              if (typeof row.locations === 'string') {
                try {
                  locations = JSON.parse(row.locations);
                } catch {
                  locations = row.locations.split(',').map((loc: string) => loc.trim());
                }
              } else if (Array.isArray(row.locations)) {
                locations = row.locations;
              }
            }

            return {
              id,
              serialNumber: '', // Will be set by the parent component
              clientCode: row.clientCode || row.code || `CL${String(index + 1).padStart(3, '0')}`,
              status: row.status || 'Active',
              domain: row.domain || '',
              companyName: row.companyName || row.company || '',
              website: row.website || '',
              email: row.companyEmail || row.email || '',
              phone: row.companyPhone || row.phone || '',
              country: row.country || '',
              city: row.city || '',
              address: row.address || '',
              locations,
              paymentTerm: row.paymentTerm || '',
              paymentRemarks: row.paymentRemarks || '',
              paymentMode: row.paymentMode || '',
              availability: row.availability || '',
              gstNumber: row.gstNumber || '',
              panNumber: row.panNumber || '',
              startDate: row.startDate || new Date().toISOString().split('T')[0],
              companyDOB: row.companyDOB || '',
              contacts,
              createdAt: new Date().toISOString(),
              isDeleted: false
            };
          });

          onImport(clients);
        } catch (err) {
          console.error('Import error:', err);
          setError('Error processing the Excel file. Please check the data format.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('File reading error:', err);
      setError('Error reading the file. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyan-800 mb-2">Import Clients from Excel</h2>
        <p className="text-cyan-600">
          Upload an Excel file (.xlsx or .xls) containing client data to import into the CRM.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          file ? 'border-cyan-300 bg-cyan-50' : 'border-cyan-300 hover:border-cyan-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {file ? (
          <div className="space-y-2">
            <div className="text-cyan-600 text-lg">✓ File selected: {file.name}</div>
            <button
              onClick={() => {
                setFile(null);
                setPreviewData([]);
                setError('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-sm text-cyan-500 hover:text-cyan-700 underline"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-cyan-500">
              <svg className="mx-auto h-12 w-12 text-cyan-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-cyan-900">Drop your Excel file here</p>
              <p className="text-cyan-500">or</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-cyan-300 rounded-md shadow-sm text-sm font-medium text-cyan-700 bg-white hover:bg-cyan-50"
              >
                Browse Files
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview */}
      {previewData.length > 0 && (
        <div className="bg-cyan-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-cyan-900 mb-3">Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyan-200">
              <tbody className="bg-white divide-y divide-cyan-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-cyan-50' : ''}>
                    {Array.isArray(row) && row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-sm text-cyan-900 border">
                        {cell || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-cyan-500 mt-2">
            Showing first 6 rows. The first row should contain column headers.
          </p>
        </div>
      )}

      {/* Expected Format Info */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-cyan-800">Expected Excel Format</h3>
            <div className="mt-2 text-sm text-cyan-700">
              <p>Your Excel file should have columns for client information. Common column names include:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>clientCode, companyName, email, phone, address, city, country</li>
                <li>contactName, contactEmail, designation (for contact information)</li>
                <li>gstNumber, panNumber, paymentTerm, etc.</li>
              </ul>
              <p className="mt-2">The system will automatically map columns and create missing IDs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={processImport}
          disabled={!file || isProcessing}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Import Data'
          )}
        </button>
      </div>
    </div>
  );
}
