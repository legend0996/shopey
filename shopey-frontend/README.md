# Shopey Frontend

A production-grade e-commerce frontend for Shopey built with **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **TanStack Query**, **Zustand**, and **Framer Motion**.

## ✨ Features

### User App (`/`)
- **Home**: Featured products, category filtering, search with debouncing
- **Shopping**: Product cards with wishlist toggle, quick add-to-cart
- **Auth**: Register, email verification, login flow
- **Cart**: Persistent cart state with quantity controls, cart drawer
- **Checkout**: Two-step checkout with delivery details and M-Pesa payment
- **Orders**: View all orders, detailed order page, status timeline, download receipts
- **Wishlist**: Persistent wishlist management
- **Profile**: User dashboard with quick stats

### Admin Panel (`/admin`)
- **Private route** with email + code verification
- **Dashboard**: KPI cards (orders, revenue, users)
- **Orders**: Table view, detailed order management
- **Order Actions**: Update status, assign riders, manage delivery
- **Shops**: Create shops, feature users/products

### Rider Panel (`/rider`)
- **Private route** with login
- **Deliveries**: View assigned deliveries
- **Delivery Details**: Status updates (picked → in_transit → delivered)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd shopey-frontend
npm install --legacy-peer-deps
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design System
- **Primary Color**: `#C9A14A` (Gold)
- **Typography**: Inter Font
- **Spacing**: Tailwind CSS
- **Light Mode Only**: No dark mode

## 📁 Key Directories

- `src/app` - Next.js pages (user, admin, rider routes)
- `src/components` - Reusable UI components
- `src/services` - API service layer
- `src/store` - Zustand state management
- `src/lib` - Utilities (axios, images)
- `src/types` - TypeScript definitions

## 🔐 Authentication

- **Token-based**: Stored in localStorage
- **Auto-attached**: Axios interceptor adds `Authorization: Bearer ${token}`
- **Path-aware**: Different tokens for user/admin/rider

## 🛒 State Management

- **Cart**: Zustand (persisted)
- **Wishlist**: Zustand (persisted)
- **Auth**: Zustand (persisted)
- **Server State**: React Query with 60s caching

## 📦 Build & Deploy

```bash
npm run build
npm start
```

For Vercel:
1. Push to Git
2. Connect repo
3. Set `NEXT_PUBLIC_API_URL` env var
4. Deploy

## 📝 API Routes

All requests go to `http://localhost:5000/api`:

- `POST /auth/register` - User registration
- `POST /auth/verify` - Email verification
- `POST /auth/login` - User login
- `GET /products` - List products
- `POST /orders/checkout` - Create order
- `POST /mpesa/pay` - Initiate M-Pesa payment
- `GET /orders/my-orders` - User orders
- `/admin/*` - Admin endpoints
- `/rider/*` - Rider endpoints

## 🧪 Lint

```bash
npm run lint
```
