# Surya Jaya Motor Admin Dashboard

A comprehensive admin dashboard and website for Surya Jaya Motor, a used motorcycle dealer in Batam. This application manages inventory, transactions, users, and provides a public-facing website with customer testimonials.

## Project Overview

This project consists of:

- **Public Landing Page**: Customer-facing website with testimonials and motorcycle listings
- **Admin Dashboard**: Complete management system for inventory, transactions, users, and reporting
- **Backend API**: RESTful APIs for authentication and data management
- **Reporting System**: Generate PDF reports and manage transaction history

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 with React 19
- **Database**: [Supabase](https://supabase.com) with PostgreSQL
- **UI Components**: [HeroUI](https://heroui.org) & [Untitled UI Icons](https://icons.untitledui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4
- **Animations**: [Framer Motion](https://www.framer.com/motion)
- **Charts**: [Recharts](https://recharts.org)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) with AutoTable
- **Data Parsing**: [PapaParse](https://www.papaparse.com) for CSV handling
- **Language**: TypeScript

## Project Structure

```
app/
├── page.tsx                 # Public landing page
├── layout.tsx              # Root layout with HeroUIProvider
├── globals.css             # Global styles
├── api/
│   └── admin/             # Admin API routes
│       ├── users/         # User management endpoints
│       └── auth-util.ts   # Authentication utilities
└── dashboard/             # Admin dashboard routes
    ├── login/             # Authentication page
    ├── halaman-utama/     # Main dashboard page with expiring alerts
    ├── data-stok/         # Motorcycle inventory management
    ├── jenis-motor/       # Motor types/categories management
    ├── transaksi/         # Transaction management (create, edit, view)
    ├── user/              # User management
    ├── kalkulator/        # Installment calculator
    └── laporan/           # Reports & analytics

lib/
├── supabase-client.ts     # Client-side Supabase configuration
└── supabase-server.ts     # Server-side Supabase utilities

app/store/                 # Zustand state management stores
├── MotorStore.ts          # Motorcycle inventory state
├── JenisMotorStore.ts     # Motor types state
├── TransaksiStore.ts      # Transaction state
├── UserStore.ts           # User state
└── PembeliStore.ts        # Buyer/customer state

utils/
└── pdf-generator.ts       # PDF generation utilities

public/
└── tabel_angsuran.csv     # Installment payment schedule table
```

## Features

### Inventory Management

- Add, edit, and delete motorcycles with details (model, price, condition)
- Track motorcycle status with visual status chips
- Categorize motorcycles by type (NMAX, Aerox, Vario, Beat, PCX, Scoopy, etc.)

### Transaction Management

- Create and manage motorcycle sales transactions
- Track customer information and payment status
- Generate PDF reports for transactions
- Edit transaction details

### User Management

- User authentication system
- User roles and permissions
- CRUD operations for user accounts

### Reporting & Analytics

- View transaction history with filters
- Generate PDF reports with installment calculations
- Track inventory metrics
- Monitor expiring motorcycles with notifications

### Dashboard Features

- Real-time inventory overview
- Transaction analytics with charts
- User and customer management
- Installment calculator for pricing
- Modal notifications for expiring stock

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Supabase account and project setup

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd surya_motor_admin
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint code quality checks

## Screenshots

### Public Landing Page

The main entry point featuring customer testimonials, motorcycle showcase, and WhatsApp contact integration for inquiries.

![Landing Page](/public/readme/readme-1.png)

### Admin Dashboard

The comprehensive dashboard provides:

#### Main Dashboard (Halaman Utama)

Overview of key metrics, expiring inventory alerts, and quick access to main functions.

![Main Dashboard](/public/readme/readme-2.png)

#### Inventory Management (Data Stok)

Complete motorcycle listing with status tracking, prices, and quick actions for editing or deleting items.

![Inventory Management](/public/readme/readme-3.png)

#### Add/Edit Motorcycle

Form interface for adding new motorcycles or updating existing inventory with detailed information.

![Add/Edit Motorcycle](/public/readme/readme-4.png)

#### Transactions (Transaksi)

View, create, and manage all motorcycle sales with customer details and payment status.

![Transactions List](/public/readme/readme-5.png)

#### Transaction Management

Create new transactions with customer information, pricing, and installment calculations.

![Transaction Management](/public/readme/readme-6.png)

#### User Management

Admin control panel for managing user accounts and permissions.

![User Management](/public/readme/readme-7.png)

#### Additional Features

Motor Types management, Reports & Analytics, and Installment Calculator.

![Additional Features](/public/readme/readme-8.png)

## Key Components

- **MotorForm**: Form for adding/editing motorcycle inventory
- **TransaksiForm**: Form for managing transactions
- **UserForm**: Form for user management
- **StatusChip**: Visual indicator for motorcycle status
- **ExpiringModal**: Alert modal for items nearing expiration
- **MotorIcon**: Custom icon component for motorcycles

## State Management

Uses Zustand for client-side state management with dedicated stores for:

- Motorcycles (MotorStore)
- Motor types (JenisMotorStore)
- Transactions (TransaksiStore)
- Users (UserStore)
- Customers/Buyers (PembeliStore)

## PDF Generation

The project includes PDF generation capabilities for:

- Transaction receipts
- Sales reports
- Installment schedules with automatic calculations

## Development Notes

- The project uses Next.js App Router for file-based routing
- Server and client components are properly separated
- Supabase is used for both authentication and data persistence
- Tailwind CSS with HeroUI components for consistent UI

## Deployment

The application can be deployed on [Vercel](https://vercel.com) for optimal Next.js performance. For other platforms, follow standard Node.js deployment procedures.

## License

This project is proprietary software for Surya Jaya Motor.
