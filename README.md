# PLN IP Learning Hub - Frontend

Next.js 14 frontend for PLN Indonesia Power Learning Management System.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Heroicons** - Icon library
- **js-cookie** - Cookie management

## Prerequisites

- Node.js 18.17.0 or higher
- npm 8.x or higher
- Laravel backend running on port 8000

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory (already created):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_APP_NAME=PLN IP Learning Hub
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Employee dashboard page
│   ├── login/               # Login page
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Home page (redirects)
├── contexts/
│   └── AuthContext.tsx      # Authentication context & hooks
├── lib/
│   └── axios.ts             # Axios instance with interceptors
├── middleware.ts            # Route protection middleware
└── tailwind.config.ts       # Tailwind config with PLN colors
```

## Authentication Flow

1. User logs in via `/login` page
2. Credentials sent to Laravel API `/api/login`
3. API returns user data + Sanctum token
4. Token stored in cookie (`auth_token`)
5. Axios interceptor adds token to all API requests
6. Middleware protects dashboard routes

## Test Accounts

Use these credentials from Laravel seeder:

### Super Admin
- Email: `superadmin@plnip.local`
- Password: `Admin123!`

### Employee
- Email: `employee@plnip.local`
- Password: `Employee123!`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with Laravel backend through:

- **Base URL**: `http://127.0.0.1:8000/api`
- **Authentication**: Bearer token via cookies
- **CORS**: Configured for localhost:3000

### Key Endpoints

- `POST /login` - User authentication
- `POST /logout` - Logout user
- `GET /user` - Get authenticated user
- `GET /dashboard/employee` - Dashboard data
- `GET /announcements` - List announcements
- `GET /announcements/latest` - Latest announcements

## Development Notes

### PLN Color Palette

The app uses PLN Indonesia Power brand colors:

```css
pln-primary: #035B71
pln-light: #00A2B9
pln-dark: #024656
```

### Route Protection

Routes are protected by middleware:
- Public: `/`, `/login`, `/register`
- Protected: `/dashboard` (requires auth)

### State Management

- **Global Auth**: React Context (`AuthContext`)
- **API Calls**: Axios with interceptors
- **Token Storage**: HTTP-only cookies (for security)

## Troubleshooting

### CORS Issues

Make sure Laravel backend has CORS configured:
- `config/sanctum.php` - Add localhost:3000 to stateful domains
- `.env` - Set `SANCTUM_STATEFUL_DOMAINS=localhost:3000`

### Token Not Sent

Check:
1. `withCredentials: true` in axios config
2. Cookie is set after login
3. API URL matches CORS settings

### 401 Unauthorized

- Clear cookies and login again
- Run `php artisan optimize:clear` on backend
- Check token expiration

## Next Steps

- [ ] Add register page
- [ ] Add forgot password page
- [ ] Add profile edit page
- [ ] Add course browsing
- [ ] Add certificate viewing
- [ ] Add real-time notifications
- [ ] Add search functionality

## License

Proprietary - PLN Indonesia Power
