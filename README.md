# 🧀 Akshaya Dairy Management System

A comprehensive dairy milk collection and management system with separate admin panel and driver/center panel.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Documentation](#documentation)

## 📁 Project Structure

This project is organized into three separate applications:

```
akshaya-dairy/
├── backend/                 # Backend API Server
│   ├── src/                # Source code
│   ├── database/           # Migrations & seeds
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
│
├── frontend-admin/          # Admin Panel (React App)
│   ├── src/                # Source code
│   ├── package.json        # Admin frontend dependencies
│   └── README.md           # Admin panel documentation
│
└── frontend-driver-center/  # Driver & Center Panel (React App)
    ├── src/                # Source code
    ├── package.json        # Driver/Center frontend dependencies
    └── README.md           # Driver/Center panel documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Update database credentials

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start backend server
npm run dev
```

Backend runs on: **http://localhost:3000**

### 2. Setup Admin Panel

```bash
# Navigate to admin frontend
cd frontend-admin

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin panel runs on: **http://localhost:3001**

### 3. Setup Driver/Center Panel

```bash
# Navigate to driver/center frontend
cd frontend-driver-center

# Install dependencies
npm install

# Start development server
npm run dev
```

Driver/Center panel runs on: **http://localhost:3002**

## 🛠 Technology Stack

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL + Knex.js
- JWT Authentication
- JOI Validation
- Swagger Documentation

### Frontend
- React 18 + TypeScript
- Vite
- Bootstrap 5
- React Router
- Axios

## ✨ Features

### Admin Panel
- Dashboard with real-time statistics
- Driver management
- Dairy center management
- Milk collection tracking
- Payment management
- Reports and analytics

### Driver Panel
- On/Off duty toggle
- Milk collection entry
- View assigned centers
- GPS location sharing
- Collection history

### Dairy Center Panel
- View milk collections
- Payment tracking
- Monthly reports
- Rate information

## 📚 Documentation

Each application has its own detailed README:

- **[Backend README](./backend/README.md)** - API documentation, setup, and endpoints
- **[Admin Panel README](./frontend-admin/README.md)** - Admin panel setup and features
- **[Driver/Center Panel README](./frontend-driver-center/README.md)** - Driver and center panel setup

## 🔑 Default Credentials

After running backend seeds:

### Admin
- **Mobile/Email**: `9876543210` or `admin@akshayadairy.com`
- **Password**: `password123`

### Driver 1
- **Mobile/Email**: `9876543211` or `driver1@akshayadairy.com`
- **Password**: `password123`

### Vendor 1
- **Mobile/Email**: `9876543213` or `vendor1@akshayadairy.com`
- **Password**: `password123`

## 📊 API Documentation

Once the backend is running, access Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api-docs

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with JOI
- CORS configuration
- SQL injection protection

## 📝 Development

### Running All Services

You'll need three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Admin Panel:**
```bash
cd frontend-admin
npm run dev
```

**Terminal 3 - Driver/Center Panel:**
```bash
cd frontend-driver-center
npm run dev
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when implemented)
cd frontend-admin
npm test
```

## 📞 Support

For issues and questions, please create an issue in the repository.

## 📄 License

ISC

---

**Built with ❤️ for Akshaya Dairy**
