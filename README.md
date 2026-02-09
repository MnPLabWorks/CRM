# CRM Application

A comprehensive Client Relationship Management (CRM) system built with Next.js, React, and TypeScript. This application allows organizations to manage client data, track interactions, and maintain detailed client profiles.

## Features

### User Authentication
- **Admin Login**: Full access to all features including delete and export functionality
- **Guest User**: Can add and view client information (no delete permissions)
- Default Admin Password: `admin123`

### Client Management
- Create, read, update, and delete client records
- Comprehensive client profile with 18 different fields
- Multi-select dropdown for business locations
- Status tracking (Client vs Potential Client)
- Agreement tracking (Sent/Not Sent)

### Client Fields
- **Client Code**: Unique identifier for each client
- **Status**: Client or Potential Client
- **Domain**: Industry classification
- **Company Name**: Official company name
- **Website**: Company website URL
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Country**: Company's country
- **City**: Company's city
- **Address**: Full company address
- **Locations**: Multi-select Indian states (Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal, Delhi, Chandigarh, Puducherry)
- **Payment Term**: Payment duration (e.g., Net 30)
- **Payment Remarks**: Additional payment notes
- **Agreement Status**: Sent or Not Sent
- **Payment Mode**: Prepaid or Postpaid
- **USG**: Unique Service Grade or custom identifier
- **Availability**: Client availability schedule

### Admin Features
- Delete client records
- Export all client data as JSON
- Full view of all client information

### Data Storage
- JSON-based local storage (localStorage)
- Easy migration path to SQL Server in the future
- Automatic data persistence

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Data Storage**: JSON (localStorage)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Admin Access
1. Click "Login as Admin"
2. Enter password: `admin123`
3. Access full CRM functionality including delete and export

### Guest Access
1. Click "Login as Guest User"
2. No password required
3. Can add and view clients, but cannot delete

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   ├── page.tsx            # Login page
│   └── dashboard/
│       └── page.tsx        # Dashboard with client management
├── components/
│   ├── ClientForm.tsx      # Form for adding/editing clients
│   └── ClientTable.tsx     # Table displaying all clients
└── ...
```

## Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

- [ ] SQL Server integration
- [ ] Advanced filtering and search
- [ ] Client analytics and reporting
- [ ] Email notifications
- [ ] User roles and permissions management
- [ ] Activity logging
- [ ] Document management
- [ ] Task management

## License

MIT License - Feel free to use this project for your own purposes.
