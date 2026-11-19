# FixFlow – Smart Complaint & Issue Resolution Management System

FixFlow is a centralized complaint management REST API designed to simplify how organizations receive, manage, assign, and resolve complaints. It provides a structured workflow where users can submit complaints, administrators can review and assign them to staff, and staff members can update progress until resolution.

The system is developed using **NestJS, TypeScript, PostgreSQL, and TypeORM**, with JWT-based authentication and role-based authorization.

## Features

- **Authentication & Authorization**
  - User registration and login.
  - Password hashing.
  - JWT-based authentication.
  - Role-based access control (`USER`, `STAFF`, `ADMIN`).

- **User Management**
  - Create, retrieve, update, and manage user accounts.
  - Role-based access restrictions.

- **Department & Staff Management**
  - Department management.
  - Staff profile management.
  - Staff assignment and reassignment.

- **Complaint Management**
  - Submit and manage complaints.
  - Categorize and prioritize complaints.
  - Generate complaint tracking codes.
  - Track complaint status and progress.
  - Review and manage complaint requests.

- **Assignment & Resolution**
  - Assign complaints to staff members.
  - Accept or reject assignments.
  - Update complaint progress.
  - Resolve complaints.
  - Allow users to confirm resolution or request reopening.

- **Additional Features**
  - Complaint categories and tags.
  - Complaint status history.
  - Notifications.
  - Complaint feedback.
  - DTO validation and structured error handling.
  - Request logging and request ID tracking.

## Technology Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Programming language |
| PostgreSQL | Relational database |
| TypeORM | Object-relational mapping |
| JWT | Authentication |
| bcrypt | Password hashing |
| class-validator | Request validation |
| class-transformer | Data transformation |
| Swagger | API documentation |
| Postman | API testing |

## Project Structure

```text
FixFlow/
│
├── complaint-management-api/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── departments/
│   │   ├── staff-profiles/
│   │   ├── categories/
│   │   ├── complaints/
│   │   ├── assignments/
│   │   ├── complaint-history/
│   │   ├── complaint-attachments/
│   │   ├── complaint-tags/
│   │   ├── notifications/
│   │   ├── feedback/
│   │   ├── tags/
│   │   ├── common/
│   │   ├── config/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

*The structure above provides an overview of the main application modules.*

## Prerequisites

Make sure the following software is installed:

- [Node.js](https://nodejs.org/) – JavaScript runtime.
- [npm](https://www.npmjs.com/) – Package manager (included with Node.js).
- [PostgreSQL](https://www.postgresql.org/download/) – Relational database.
- [Git](https://git-scm.com/) – Version control.

You can verify the installations using:

```bash
node --version
npm --version
git --version
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Samir201514/FixFlow.git
```

### 2. Navigate to the Backend Directory

```bash
cd FixFlow/complaint-management-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure PostgreSQL

Make sure your PostgreSQL server is running.

Create a database for the project. For example:

```sql
CREATE DATABASE fixflow_db;
```

You can execute this command through pgAdmin or the PostgreSQL command-line interface.

### 5. Configure Environment Variables

Create a `.env` file inside the `complaint-management-api` directory.

Use the following configuration as a reference and ensure the variable names match the application's environment validation schema:

```env
# Application
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_DATABASE=fixflow_db

# JWT Authentication
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=1d
```

**Important:**
- Replace the database credentials with your own PostgreSQL credentials.
- Use a strong, unique JWT secret.
- Never commit your `.env` file or expose database credentials.
- The `.env.example` file should contain placeholders only.

### 6. Run the Application

Start the development server:

```bash
npm run start:dev
```

The API should be available at:

```text
http://localhost:3000
```

The port may differ depending on your environment configuration.

## API Documentation

FixFlow uses Swagger to provide interactive API documentation.

Once the application is running, open:

```text
http://localhost:3000/api/docs
```

From Swagger UI, you can:

- Explore available API endpoints.
- View request and response schemas.
- Test API operations.
- Provide a JWT bearer token for protected endpoints.

For protected endpoints, authenticate using the JWT returned by the login endpoint.

## Authentication & User Roles

FixFlow supports three primary user roles:

| Role | Responsibilities |
|---|---|
| USER | Submit complaints, track progress, provide feedback, and request reopening. |
| STAFF | Handle assigned complaints and update their progress and resolution status. |
| ADMIN | Manage users, departments, categories, review complaints, and assign staff. |

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate and receive a JWT |
| GET | `/auth/profile` | Retrieve the authenticated user's profile |

## Available API Modules

The application provides REST API endpoints for the following modules:

| Module | Description |
|---|---|
| Auth | Registration, login, and authentication |
| Users | User management |
| Departments | Department management |
| Staff Profiles | Staff profile management |
| Categories | Complaint category management |
| Complaints | Complaint creation, retrieval, and management |
| Assignments | Complaint assignment and staff workflow |
| Complaint History | Complaint status history |
| Complaint Attachments | Complaint attachment metadata management |
| Complaint Tags | Tag association with complaints |
| Tags | Tag management |
| Notifications | User notifications |
| Feedback | Complaint feedback |

Refer to Swagger UI for the complete endpoint list, request formats, and authorization requirements.

## Available npm Scripts

The following are standard NestJS project commands. Check `package.json` for the scripts available in this repository.

```bash
# Start in development mode
npm run start:dev

# Start normally
npm run start

# Build the application
npm run build

# Start the production build
npm run start:prod

# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## Error Handling

FixFlow uses standard HTTP status codes to communicate API results.

| Status Code | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Bad request or validation failure |
| 401 | Unauthorized access |
| 403 | Forbidden – insufficient permissions |
| 404 | Requested resource not found |
| 409 | Conflict, such as duplicate data |
| 500 | Internal server error |

## Security Considerations

- Passwords are hashed before being stored.
- Protected endpoints require JWT authentication.
- Role-based authorization restricts access to specific operations.
- Request DTOs are validated.
- Environment variables are used for sensitive configuration.
- Database credentials and JWT secrets must not be committed to version control.

## Development Team

**Project:** FixFlow – Smart Complaint & Issue Resolution Management System

**Course:** CSC4161 – Advanced Programming in Web Technology

**Institution:** American International University-Bangladesh (AIUB)

**Repository:** [GitHub – Samir201514/FixFlow](https://github.com/Samir201514/FixFlow)

---

## License

This project was developed for academic purposes as part of the CSC4161 Advanced Programming in Web Technology course.