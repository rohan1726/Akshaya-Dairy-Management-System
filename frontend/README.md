# 🧀 Akshaya Dairy - Driver & Center Panel

Frontend application for drivers and dairy centers built with React, TypeScript, and Bootstrap.

## 📋 Features

### For Drivers
- **Duty Management** - Toggle on/off duty status
- **Milk Collection** - Record milk collections with fat/SNF percentages
- **Assigned Centers** - View assigned dairy centers
- **GPS Location** - Share live location (future feature)
- **Collection History** - View past collections
- **Payments** - View payment history

### For Dairy Centers (Vendors)
- **Dashboard** - View collection statistics
- **Milk Collections** - View all collections
- **Payments** - Track payments and receipts
- **Rate Information** - View current milk rates

## 🛠 Technology Stack

- **React 18** with **TypeScript**
- **Vite** (Build tool)
- **React Router** (Routing)
- **Bootstrap 5** (UI Framework)
- **Axios** (HTTP Client)
- **React Toastify** (Notifications)
- **React Icons** (Icons)

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+)
- npm or yarn

### 1. Install Dependencies

```bash
cd frontend-driver-center
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will start on http://localhost:3002

### 3. Build for Production

```bash
npm run build
```

## 🔧 Configuration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:3000`.

To change the API URL, update `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

Or update the base URL in `src/contexts/AuthContext.tsx`:

```typescript
axios.defaults.baseURL = 'http://your-api-url/api';
```

## 📁 Project Structure

```
frontend-driver-center/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx
│   │   └── PrivateRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MilkCollection.tsx
│   │   └── Payments.tsx
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔑 Authentication

The panel supports both driver and vendor (dairy center) roles. Admin users are not allowed to access this panel.

### Default Credentials

**Driver 1:**
- **Mobile/Email**: `9876543211` or `driver1@akshayadairy.com`
- **Password**: `password123`

**Vendor 1:**
- **Mobile/Email**: `9876543213` or `vendor1@akshayadairy.com`
- **Password**: `password123`

## 📱 Mobile Responsive

The application is fully responsive and optimized for mobile devices, making it easy for drivers to use on the go.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 UI Components

The application uses Bootstrap 5 for styling with:
- Mobile-friendly navigation
- Responsive forms
- Data tables
- Toast notifications
- Duty status toggle (for drivers)

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for Akshaya Dairy**

