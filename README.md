# ObeCure - Health & Wellness PWA

Complete health tracking app with AI-powered diet planning, workout logging, body metrics tracking, and subscription management.

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. **Fork/Clone this repository**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables in Vercel:**

   **Backend Variables:**
   ```
   MONGO_URL=your-mongodb-connection-string
   SECRET_KEY=your-secret-key-here
   DB_NAME=obecure_db
   GEMINI_API_KEY=your-gemini-api-key (optional)
   ```

   **Frontend Variables:**
   ```
   VITE_BACKEND_URL=https://your-app.vercel.app
   VITE_API_KEY=your-gemini-api-key
   ```

4. **Deploy!** Vercel will build and deploy automatically

### Deploy to Emergent

Already configured! Just:
1. Push to GitHub using "Save to GitHub" button
2. Deploy on Emergent platform
3. Set environment variables in dashboard

## 📦 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB

### Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/obecure.git
   cd obecure
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   pip install -r requirements.txt
   python server.py
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your values
   yarn install
   yarn dev
   ```

4. **Access app:** http://localhost:3000

## 🌐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/
DB_NAME=obecure_db
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-key (optional)
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8001
VITE_API_KEY=your-gemini-api-key
```

## 🎯 Features

### Free Features
- ✅ Diet Planning (AI-powered)
- ✅ Workouts
- ✅ Community
- ✅ MindFit
- ✅ Daily Logging
- ✅ Reports
- ✅ Push Notifications

### Premium Features
- 🔒 BioAdaptive Ayurveda
- 🔒 My Body Analytics

## 💳 Subscription Plans

- **1 Month**: ₹69
- **6 Months**: ₹399
- **1 Year**: ₹799

**Payment:** UPI to `xzecure2022@ybl`  
**Support:** WhatsApp +91 6355137969

## 🔧 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** FastAPI, Python 3.11
- **Database:** MongoDB
- **Auth:** JWT tokens, bcrypt
- **PWA:** Service Worker, Web Manifest

## 📱 PWA Installation

Users can install the app on any device:
- **Mobile:** "Add to Home Screen"
- **Desktop:** Click install button in browser

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- Environment variables for secrets
- CORS configured
- Input validation

## 📊 API Documentation

### Authentication
```
POST /api/auth/signup - Create account
POST /api/auth/login - Login
GET  /api/auth/me - Get current user
```

### Daily Logging
```
POST /api/logs/calories - Log meal
GET  /api/logs/calories - Get meals
POST /api/logs/workouts - Log workout
GET  /api/logs/workouts - Get workouts
POST /api/logs/body-metrics - Log body data
GET  /api/logs/body-metrics - Get body data
```

### Reports
```
POST /api/reports/generate - Generate report
```

### Subscription
```
POST /api/subscription/redeem - Redeem code
GET  /api/subscription/status - Check status
```

## 🎨 Customization

### Update UPI Details
Edit: `/frontend/src/components/SubscriptionModalNew.tsx`
```typescript
const UPI_ID = 'your-upi-id';
const WHATSAPP_NUMBER = '+91-your-number';
```

### Update Plans
Edit: `/frontend/src/components/SubscriptionModalNew.tsx`
```typescript
const plans: Plan[] = [
  { name: '1 Month', months: 1, price: 69 },
  // ... add your plans
];
```

## 🐛 Troubleshooting

### Frontend not connecting to backend
- Check `VITE_BACKEND_URL` in frontend `.env`
- Ensure backend is running on correct port

### MongoDB connection error
- Check `MONGO_URL` in backend `.env`
- Ensure MongoDB is running

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn install
```

## 📞 Support

- **WhatsApp:** +91 6355137969
- **Email:** support@xzecure.co.in
- **Website:** https://www.xzecure.co.in

## 📄 License

Proprietary - All rights reserved

---

Made with ❤️ by ObeCure Team
