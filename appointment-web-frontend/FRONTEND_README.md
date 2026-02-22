# MedBook - Doctor Appointment System Frontend

A modern React-based web application for booking doctor appointments with separate dashboards for patients and doctors.

## Features

### Patient Features
- 🔍 **Search Doctors**: Search by name, specialization, or hospital
- 📅 **Book Appointments**: View available slots and book appointments
- 📍 **Manage Appointments**: View, reschedule, or cancel appointments
- 👤 **View Profile**: Access patient information and appointment history

### Doctor Features
- 📋 **View Appointments**: See all scheduled appointments from patients
- ✅ **Approve/Reject**: Accept or decline patient appointments
- ⏰ **Set Availability**: Manage working hours and available days
- 👨‍⚕️ **Doctor Profile**: Display professional information and credentials

## Tech Stack

- **Frontend Framework**: React 19
- **Routing**: React Router DOM v7
- **UI Framework**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Icons**: Lucide React & React Icons
- **Build Tool**: Vite
- **Package Manager**: npm

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure API Base URL**

The frontend is configured to connect to `http://localhost:8000/api` by default. If your backend is on a different URL, update it in `src/api/client.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── client.js          # API client and endpoints
├── components/
│   ├── Navbar.jsx         # Navigation component
│   └── PrivateRoute.jsx   # Route protection component
├── pages/
│   ├── LoginPage.jsx      # Login form
│   ├── RegisterPage.jsx   # Registration form
│   ├── DoctorDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── DoctorProfileSetup.jsx
│   ├── NotFoundPage.jsx
│   ├── Doctor/
│   │   ├── DoctorAppointments.jsx
│   │   ├── DoctorAvailability.jsx
│   │   └── DoctorProfile.jsx
│   └── Patient/
│       ├── PatientSearchDoctors.jsx
│       ├── PatientMyAppointments.jsx
│       └── PatientProfile.jsx
├── utils/
│   └── helpers.js         # Helper functions and storage
├── App.jsx                # Main app component with routing
├── main.js                # Entry point
└── style.css              # Global styles
```

## Authentication Flow

### Patient Registration & Login
1. User registers as a patient
2. System auto-logs in after successful registration
3. User is redirected to patient dashboard

### Doctor Registration & Profile Setup
1. User registers as a doctor
2. User needs to login
3. On first login, redirected to profile setup page
4. Doctor completes profile with specialization, hospital, files
5. Doctor profile is auto-approved
6. Doctor can then set availability and view appointments

## Key Components

### API Client (`src/api/client.js`)
- Handles all HTTP requests to backend
- Automatically includes JWT token in headers
- Organized into logical endpoint groups

### Authentication Storage (`src/utils/helpers.js`)
- Manages token and user data in localStorage
- Provides utility functions for formatting dates/times
- Status color mapping for UI consistency

### Routing (`src/App.jsx`)
- Protected routes for authenticated users
- Role-based access control (doctor/patient)
- Lazy loading of components

## Usage Examples

### For Patients
1. **Register**: Go to `/register`, select "Patient" role
2. **Login**: Use credentials to login
3. **Find Doctor**: Use search filters to find doctors by specialization/hospital/name
4. **Book Appointment**: Select a doctor, choose available time slot, add notes
5. **Manage**: View, reschedule, or cancel appointments

### For Doctors
1. **Register**: Go to `/register`, select "Doctor" role  
2. **Complete Profile**: Upload picture, certificate, set specialization
3. **Set Availability**: Define working hours for each day
4. **Review Appointments**: View patient appointments
5. **Approve/Decline**: Accept or reject appointment requests
6. **Mark Completed**: Complete appointments and add notes

## Environment Variables

No environment file needed. Configure these in `src/api/client.js` if needed:

```javascript
const API_BASE_URL = 'http://localhost:8000/api'; // Adjust as needed
```

## Styling

The app uses Tailwind CSS for styling. Custom theme colors are configured in `tailwind.config.js`:

- **Primary Color**: Blue (#0ea5e9)
- **Success Color**: Green (#10b981)
- **Warning Color**: Amber (#f59e0b)
- **Danger Color**: Red (#ef4444)

## Common Tasks

### Adding a New Endpoint
1. Add to `src/api/client.js` in the appropriate API object
2. Use in components via `import { appointmentAPI } from '../../api/client'`

### Creating a New Page
1. Create file in `src/pages/` or `src/pages/{Role}/`
2. Add route to `App.jsx` in the Routes section
3. Update navigation if needed

### Styling a Component
- Use Tailwind CSS classes directly in JSX
- Responsive classes: `md:`, `lg:`, etc.
- Example: `className="w-full md:w-1/2 lg:w-1/3"`

## Troubleshooting

### API Connection Error
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Verify API base URL in `src/api/client.js`

### Token Issues
- Clear browser cache and localStorage
- Re-login to get a fresh token
- Check if token is being sent in Authorization header

### Styling Issues
- Run `npm install` to ensure Tailwind is properly installed
- Rebuild CSS: `npm run build`
- Check that Tailwind content paths are correct in `tailwind.config.js`

## Performance Tips

- Images are lazy-loaded when possible
- API requests use pagination (15 items per page)
- Consider implementing React.memo for large lists
- Use code splitting for dashboard components

## Security Considerations

- Tokens stored in localStorage (consider using httpOnly cookies for production)
- CORS headers configured for API requests
- Protected routes prevent unauthorized access
- Role-based access control on both frontend and backend

## Future Enhancements

- [ ] Profile picture upload/preview
- [ ] Email notifications
- [ ] Rating and review system
- [ ] Payment integration
- [ ] Telemedicine video consultation
- [ ] Mobile app (React Native)
- [ ] Dark mode support
- [ ] Multi-language support

## Support

For issues or questions:
1. Check backend API endpoints in documentation
2. Verify backend is running and accessible
3. Check browser console for error messages
4. Review API responses in Network tab

## License

This project is part of the Doctor Appointment System backend project.
