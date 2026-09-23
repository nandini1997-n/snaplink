# 🔗 SnapLink — URL Shortener with Analytics

A full-stack URL shortener built with **React**, **Node.js**, **Express**, and **PostgreSQL**.

![SnapLink Dashboard](https://via.placeholder.com/900x450/6366f1/ffffff?text=SnapLink+Dashboard)

## 🚀 Live Demo

👉 [Try SnapLink Live](https://snaplink-omega-pearl.vercel.app)

## ✨ Features

- **URL Shortening** — Shorten any URL with auto-generated or custom slugs
- **Click Analytics** — Track total clicks, daily trends, device & browser breakdowns
- **User Auth** — JWT-based register/login with protected routes
- **Link Management** — View, copy, and delete all your links from a dashboard
- **Link Expiry** — Set optional expiration dates on links
- **Redirect Engine** — Fast `GET /:slug` redirect with click logging

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS (no framework) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/snaplink.git
cd snaplink
```

### 2. Set up the database
```bash
psql -U postgres -c "CREATE DATABASE snaplink;"
psql -U postgres -d snaplink -f server/db/schema.sql
```

### 3. Configure the server
```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

### 4. Start the client
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` — the app is running!

## 📁 Project Structure

```
snaplink/
├── server/
│   ├── controllers/        # Business logic
│   │   ├── authController.js
│   │   └── linkController.js
│   ├── db/
│   │   ├── pool.js          # PostgreSQL connection
│   │   └── schema.sql       # Database schema
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── routes/
│   │   ├── auth.js
│   │   └── links.js
│   └── index.js             # Express entry point
│
└── client/
    └── src/
        ├── api/             # Axios instance
        ├── hooks/           # useAuth context
        ├── pages/           # Login, Register, Dashboard, Analytics
        └── index.css        # Global styles
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/links` | ✅ | Create short link |
| GET | `/api/links` | ✅ | Get all user links |
| DELETE | `/api/links/:id` | ✅ | Delete a link |
| GET | `/api/links/:id/analytics` | ✅ | Get link analytics |
| GET | `/:slug` | ❌ | Redirect to original URL |

## 🌐 Deployment

- **Backend** → [Render.com](https://render.com) (free tier)
- **Frontend** → [Vercel](https://vercel.com) (free tier)
- **Database** → [Supabase](https://supabase.com) (free PostgreSQL)

## 📄 License

MIT
