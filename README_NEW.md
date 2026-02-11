# ObeCure - Health & Wellness PWA

A comprehensive Progressive Web App for personalized diet planning, body composition tracking, BioAdaptive recommendations, and wellness management.

## 🚀 Features

### Free Features (No Subscription Required)
- ✅ **Diet Planning** - Personalized Indian diet plans with AI
- ✅ **Workouts** - Customized workout programs and tracking
- ✅ **Community** - Share victories and connect with others
- ✅ **MindFit** - Mental health resources and FAQs

### Premium Features (Subscription Required)
- 🔒 **BioAdaptive Ayurveda™** - Personalized herbal and lifestyle recommendations
- 🔒 **My Body Analytics** - Comprehensive body composition tracking, metabolic age analysis, and health insights

## 🛠️ Tech Stack

### Frontend
- React 19.2.0 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Axios for API calls
- PWA with service worker

### Backend
- FastAPI (Python)
- MongoDB for database
- JWT authentication
- Bcrypt password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- MongoDB
- Gemini API Key (for AI features)

### Backend Setup

1. Install Python dependencies:
```bash
cd /app/backend
pip install -r requirements.txt
```

2. Configure environment variables in `/app/backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017/
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

3. Start backend server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd /app/frontend
yarn install
```

2. Configure environment variables in `/app/frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
GEMINI_API_KEY=your-gemini-api-key-here
```

3. Start frontend server:
```bash
yarn start
```

## 💳 Subscription Plans

### Available Plans
- **1 Month** - ₹69/month
- **6 Months** - ₹399 (Best Value)
- **1 Year** - ₹799

### Payment Process

1. User selects a plan in the app
2. Click "Pay with UPI" button
3. Complete payment to: **xzecure2022@ybl**
4. Take screenshot of successful payment
5. Send screenshot to WhatsApp: **+916355137969**
6. Receive 14-digit redeem code within 24 hours
7. Enter code in app to unlock premium features

### Redeem Code Format

Codes are 14 characters long and contain special markers:
- Contains **'Y'** anywhere → 1 Year access
- Contains **'6'** anywhere → 6 Months access  
- Contains **'1'** anywhere → 1 Month access

### Refund Policy
If payment is deducted but code is not received, customers can call **+916355137969** for a full refund.

## 🔐 Authentication

### User Registration
- Users sign up with name, email, and password
- Passwords are securely hashed using bcrypt
- JWT tokens for session management

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

#### Subscription
- `POST /api/subscription/redeem` - Redeem subscription code
- `GET /api/subscription/status` - Check subscription status

#### User
- `PUT /api/user/preferences` - Update user preferences

## 📱 PWA Installation

The app is a Progressive Web App that can be installed on any device:

### On Mobile (Android/iOS)
1. Open the app in browser
2. Click "Add to Home Screen" button in the app
3. Or use browser menu → "Add to Home Screen"

### On Desktop
1. Click the install button in browser address bar
2. Or click "Install" button in the app

### Features
- Works offline with cached data
- Push notifications (coming soon)
- Native app-like experience
- Fast loading with service worker

## 🎨 Design Features

- Modern, responsive UI with Tailwind CSS
- Dark/Light mode (auto-detects system preference)
- Smooth animations and transitions
- Haptic feedback on mobile devices
- Glass morphism effects
- Gradient accents

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  created_at: DateTime,
  subscription_expiry: DateTime,
  used_codes: Array<String>,
  preferences: Object
}
```

## 🔧 Development

### Running with Supervisor

Both frontend and backend are managed by supervisor:

```bash
# Start all services
sudo supervisorctl start all

# Restart specific service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.out.log
```

### Hot Reload
Both frontend and backend support hot reload during development. Changes are automatically reflected without manual restart.

## 🚀 Deployment

### Quick Deploy (for non-technical users)

1. Make sure all services are running:
```bash
sudo supervisorctl status
```

2. All services should show "RUNNING"

3. Access your app at: `http://localhost:3000`

### Production Deployment

For production deployment, you'll need:
- A server (VPS, AWS, DigitalOcean, etc.)
- Domain name
- SSL certificate (Let's Encrypt recommended)
- Nginx as reverse proxy

Contact support for deployment assistance.

## 📞 Support

### Contact Information
- **WhatsApp**: +916355137969 (Payment & Subscription)
- **Phone**: +916355137969 (Refunds & Support)
- **Website**: https://www.xzecure.co.in
- **Instagram**: @ObeCure_official

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- HTTPS recommended for production
- CORS configured for API security
- Input validation on all forms

## 📝 Notes

### Important Files
- `/app/backend/server.py` - Main backend API
- `/app/frontend/src/App.tsx` - Main React component
- `/app/frontend/src/components/AuthModal.tsx` - Login/Signup
- `/app/frontend/src/components/SubscriptionModalNew.tsx` - Payment & Redeem
- `/app/frontend/src/services/api.ts` - API service layer

### Local Storage Keys
- `auth_token` - JWT authentication token
- `user_data` - User profile data
- `obeCureUserPreferences` - App preferences
- `obeCureDailyDietPlan` - Cached diet plan
- `obeCureStreak` - Login streak counter

## 🎯 Future Enhancements

- Push notifications for reminders
- Integration with fitness trackers
- Social features and challenges
- Video workout tutorials
- Meal photo recognition
- Progressive challenges and achievements

## 📄 License

Proprietary - All rights reserved by ObeCure/XZeCure

---

Made with ❤️ by the ObeCure Team
