# Doctor Appointment System - Backend API

A complete Laravel backend for a comprehensive doctor appointment booking system with patient authentication, doctor profiles, appointment management, and file storage integration with Supabase.

## Features

### For Patients
- User registration with email, phone number, and password
- Secure login with Sanctum token authentication
- Search doctors by specialization, hospital, or name
- View doctor profiles and available time slots
- Book appointments with doctors
- View all appointments (approved, rejected, scheduled, completed)
- Reschedule or cancel appointments
- Add notes to appointments

### For Doctors
- Doctor registration and profile setup
- Upload profile picture and medical certificate
- Set availability schedule (by day of week and time slots)
- View all assigned appointments
- Accept, reject, or reschedule patient appointments
- Complete appointments and add medical notes
- Cannot book overlapping appointments (automatic conflict detection)

### System Features
- Supabase integration for file storage (certificates and profile pictures)
- Automatic appointment slot availability checking
- Doctor-patient conflict detection
- Role-based access control
- Comprehensive appointment status tracking
- API pagination and filtering

## Setup Instructions

### 1. Install Dependencies

```bash
composer install
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env` and update the following:

```bash
cp .env.example .env
```

Configure database connection:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=appointment_system
DB_USERNAME=root
DB_PASSWORD=
```

Add Supabase credentials (already provided):
```env
SUPABASE_URL=https://liibeabgtsnlqpxygilc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaWJlYWJndHNubHFweHlnaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzQ5MTgsImV4cCI6MjA4NTQ1MDkxOH0.4GIJiHg6RpiL-6Vnxi_2WWfarzodD3tfXI-POKzjikI
SUPABASE_CERTIFICATES_BUCKET=certificates
SUPABASE_PROFILES_BUCKET=profiles
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Seed Database

```bash
php artisan db:seed --class=SpecializationSeeder
```

This will add common medical specializations to the database.

### 6. Start Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "patient" // or "doctor"
}
```

#### Complete Doctor Profile
```
POST /api/auth/complete-doctor-profile
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "user_id": 1,
  "specialization": "Cardiology",
  "hospital_name": "City Hospital",
  "profile_picture": <file>,
  "certificate": <file>,
  "bio": "Experienced cardiologist with 10 years of practice",
  "consultation_duration": 30,
  "consultation_fee": 50.00
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful.",
  "user": {...},
  "token": "auth_token_here"
}
```

#### Get Current User
```
GET /api/me
Authorization: Bearer {token}
```

#### Logout
```
POST /api/logout
Authorization: Bearer {token}
```

### Doctor Endpoints

#### Search Doctors
```
GET /api/doctors/search?name=John&specialization=Cardiology&hospital=City%20Hospital&page=1
```

#### Get Doctor Profile
```
GET /api/doctors/{id}
```

#### Get Available Slots
```
GET /api/doctors/{id}/available-slots?date=2024-03-15
```

#### Update Doctor Availability
```
POST /api/doctor/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "availability": [
    {
      "day_of_week": "Monday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    },
    {
      "day_of_week": "Tuesday",
      "start_time": "09:00",
      "end_time": "17:00",
      "is_available": true
    }
  ]
}
```

### Appointment Endpoints

#### Book Appointment
```
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctor_id": 1,
  "appointment_start": "2024-03-15 14:00",
  "notes": "I have a concern about chest pain"
}
```

#### Get Patient's Appointments
```
GET /api/appointments/my?status=scheduled&page=1
Authorization: Bearer {token}
```

Possible statuses: `scheduled`, `approved`, `rejected`, `completed`, `cancelled`

#### Get Doctor's Appointments
```
GET /api/doctor/appointments?status=scheduled&page=1
Authorization: Bearer {token}
```

#### Get Appointment Details
```
GET /api/appointments/{id}
Authorization: Bearer {token}
```

#### Approve Appointment (Doctor Only)
```
POST /api/appointments/{id}/approve
Authorization: Bearer {token}
```

#### Reject Appointment
```
POST /api/appointments/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Fully booked at that time"
}
```

#### Reschedule Appointment
```
POST /api/appointments/{id}/reschedule
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointment_start": "2024-03-16 10:00"
}
```

#### Complete Appointment (Doctor Only)
```
POST /api/appointments/{id}/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "doctor_notes": "Patient is doing well. Prescribed medication for one month."
}
```

#### Cancel Appointment
```
POST /api/appointments/{id}/cancel
Authorization: Bearer {token}
```

## Database Schema

### Users Table
- id: Primary Key
- name: String
- email: String (unique)
- phone_number: String (unique)
- password: Hashed password
- role: Enum (patient, doctor)
- is_verified: Boolean
- timestamps

### Doctors Table
- id: Primary Key
- user_id: Foreign Key to Users
- specialization: String
- hospital_name: String
- bio: Text (nullable)
- profile_picture_url: String (Supabase URL)
- certificate_url: String (Supabase URL)
- consultation_duration: Integer (minutes)
- consultation_fee: Decimal
- is_approved: Boolean
- rejection_reason: Text (nullable)
- timestamps

### Appointments Table
- id: Primary Key
- patient_id: Foreign Key to Users
- doctor_id: Foreign Key to Doctors
- appointment_start: DateTime
- appointment_end: DateTime
- status: Enum (scheduled, approved, rejected, completed, cancelled)
- notes: Text (patient notes)
- doctor_notes: Text (doctor notes)
- rejection_reason: Text
- rescheduled_at: DateTime
- rescheduled_by: Foreign Key to Users
- timestamps

### DoctorAvailability Table
- id: Primary Key
- doctor_id: Foreign Key to Doctors
- day_of_week: Enum (Monday-Sunday)
- start_time: Time
- end_time: Time
- is_available: Boolean
- timestamps

### Specializations Table
- id: Primary Key
- name: String
- description: Text
- timestamps

## Error Handling

All API responses follow a consistent format:

Success (2xx):
```json
{
  "message": "Success message",
  "data": {...}
}
```

Error (4xx, 5xx):
```json
{
  "message": "Error message",
  "errors": {...}
}
```

## Validation Rules

### User Registration
- name: required, string, max 255
- email: required, unique, valid email format
- phone_number: required, unique
- password: required, min 8 chars, uppercase, lowercase, number, special char
- role: required, must be "patient" or "doctor"

### Doctor Profile
- specialization: required, string
- hospital_name: required, string
- profile_picture: required, image, max 5MB
- certificate: required, PDF/JPG/PNG, max 10MB
- consultation_duration: integer, 15-480 minutes
- consultation_fee: numeric, min 0

### Appointment Booking
- doctor_id: required, must exist
- appointment_start: required, datetime, after now
- notes: optional, max 1000 chars

## Security Considerations

1. **Authentication**: Uses Laravel Sanctum for token-based API authentication
2. **Authorization**: Role-based access control on protected routes
3. **File Storage**: Supabase storage for secure file uploads
4. **Validation**: Comprehensive input validation on all endpoints
5. **Password Security**: Bcrypt hashing with Laravel's Hash facade
6. **CORS**: Configure in `config/cors.php` for production
7. **Rate Limiting**: API rate limiting via Laravel's throttle middleware

## Testing

Run the test suite:
```bash
php artisan test
```

## Troubleshooting

### Database Connection Issues
Ensure MySQL is running and credentials are correct in `.env`

### Supabase Upload Failures
- Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Ensure buckets exist in Supabase
- Check file sizes don't exceed limits

### Token Authentication Not Working
- Check Sanctum middleware is enabled in API middleware group
- Ensure `Authorization: Bearer {token}` header is sent correctly
- Verify token hasn't expired

## Future Enhancements

- Video consultation integration
- SMS/Email notifications
- Prescription management
- Payment gateway integration
- Doctor ratings and reviews
- Appointment reminders
- Admin dashboard
- Analytics and reporting

## License

This project is open source and available under the MIT license.

## Support

For issues and questions, please create an issue on the repository.
