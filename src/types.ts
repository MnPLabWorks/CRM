export interface Contact {
  id: string;
  name: string;
  designation: string;
  email: string;
  personalEmail?: string;
  phone: string;
  whatsappNumber: string;
  dob: string;
  anniversary: string;
}

export interface Location {
  id: string;
  locationName: string;
  address: string;
  city: string;
  contactNumber: string;
  contacts: Contact[];
}

export interface Client {
  id: string;
  serialNumber: string;
  clientCode: string;
  status: string;
  domain: string;
  companyName: string;
  website: string;
  email: string;
  phone: string;
  country: string;
  locations: Location[];
  paymentTerm: string;
  paymentRemarks: string;
  paymentMode: string;
  availability: string;
  gstNumber: string;
  panNumber: string;
  startDate: string;
  companyDOB: string;
  contacts: Contact[];
  createdAt: string;
  isDeleted?: boolean;
}
