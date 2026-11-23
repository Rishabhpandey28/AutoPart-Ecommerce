# AutoParts Store

Auto parts e-commerce store with an admin dashboard.
Ordering happens on WhatsApp; every order tap is saved and counted in the dashboard.

```
autoparts-store/
├── frontend/   React + Vite + Tailwind (store + admin dashboard)
└── backend/    Node + Express + MongoDB (API)
```

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `.env` and fill in:

- `MONGO_URI`      MongoDB Atlas (free) or local MongoDB connection string
- `JWT_SECRET`     any long random string
- `ADMIN_EMAIL`    your admin login email
- `ADMIN_PASSWORD` your admin password (make it strong)
- `CLIENT_URL`     keep http://localhost:5173 while developing

```bash
npm run dev                  # http://localhost:5000
```

## 2. Frontend (open a second terminal)

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

`frontend/.env` already points to the backend at http://localhost:5000.

## 3. First use

1. Open http://localhost:5173/admin/login and log in with the email and password from backend `.env`.
2. Settings: set your WhatsApp number (country code + number, no + or spaces).
3. Categories: add your categories first.
4. Products: add products. They show on the home page straight away.
5. When a customer taps "Order on WhatsApp", the order appears in Orders and is counted on the Dashboard.

## Going live

- Backend: Render or Railway. Set the same env vars there, and set `CLIENT_URL` to your frontend URL.
- Frontend: Vercel or Netlify. Set `VITE_API_URL` to your backend URL, then build.
- Never upload your `.env` file to GitHub.
