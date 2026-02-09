# Banking Frontend

Simple React frontend built with Vite for testing the Banking Microservices APIs.

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- ✅ User Registration
- ✅ User Login with JWT
- ✅ View Wallet Balance
- ✅ Credit/Deposit Money
- ✅ Debit/Withdraw Money
- ✅ Transaction History
- ✅ Logout

## Usage

### New User
1. Fill in the **Register** form with your name, email, and password
2. Click "Create Account"
3. After registration, use the same email/password in the **Login** form

### Existing User
1. Fill in the **Login** form with your credentials
2. Click "Sign In"

### After Login
- **View Balance**: See your current wallet balance at the top
- **Deposit**: Enter amount in the Deposit card and click "Credit"
- **Withdraw**: Enter amount in the Withdraw card and click "Debit"
- **History**: Scroll down to see all your transactions
- **Logout**: Click the Logout button at the bottom

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/credit` - Add money
- `POST /api/wallet/debit` - Remove money
- `GET /api/wallet/transactions` - Get transaction history

## Tech Stack

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 18** - UI library
- 🔌 **Axios** - HTTP client

## Notes

- Backend must be running on `http://localhost` (via NGINX)
- Frontend runs on port `5173` (Vite default)
- All API calls include proper authentication headers
- Idempotency keys are automatically generated for wallet operations
- Token is stored in localStorage for persistence
