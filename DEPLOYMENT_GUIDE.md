# 🚀 ObeCure Deployment Guide (Simple Version)

## Quick Start - Everything is Already Set Up! ✅

Your ObeCure app is ready to use! All services are running automatically.

## 📱 Access Your App

### Local Access (on this server)
Open your browser and go to:
```
http://localhost:3000
```

### Remote Access (from other devices)
Get your server's IP address and use:
```
http://YOUR_SERVER_IP:3000
```

## 🔧 Managing Your App

### Check if Everything is Running
```bash
sudo supervisorctl status
```

You should see all services as "RUNNING":
- ✅ backend
- ✅ frontend  
- ✅ mongodb

### Restart Services (if needed)
```bash
# Restart everything
sudo supervisorctl restart all

# Restart only backend
sudo supervisorctl restart backend

# Restart only frontend
sudo supervisorctl restart frontend
```

### View Logs (for troubleshooting)
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs
tail -f /var/log/supervisor/frontend.out.log
```

## 📝 Important Information

### Payment Details
- **UPI ID**: xzecure2022@ybl
- **WhatsApp**: +916355137969
- **Support**: +916355137969

### Subscription Plans
- **1 Month**: ₹69
- **6 Months**: ₹399 (Best Value)
- **1 Year**: ₹799

### Free Features
- Diet Planning
- Workouts
- Community
- MindFit

### Premium Features (Requires Subscription)
- BioAdaptive Ayurveda
- My Body Analytics

## 🔐 Admin Access

To manage users and subscriptions, you have full database access:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use obecure_db

# View all users
db.users.find().pretty()

# Check specific user
db.users.findOne({email: "user@example.com"})
```

## 🎯 How Users Will Use Your App

1. **First Time Users**:
   - Open the app
   - See login/signup screen
   - Create account with name, email, password
   - Complete onboarding

2. **Using Free Features**:
   - Diet Planning - Generate personalized diet plans
   - Workouts - Access workout programs
   - Community - Share progress
   - MindFit - Mental health resources

3. **Subscribing to Premium**:
   - Click on locked features (BioAdaptive or My Body)
   - See subscription plans
   - Click "Pay with UPI"
   - UPI app opens automatically
   - Complete payment
   - Take screenshot
   - Send to WhatsApp +916355137969
   - Wait for 14-digit code
   - Redeem code in app

4. **After Subscription**:
   - All features unlocked
   - Access BioAdaptive recommendations
   - Use body composition tracking
   - Advanced health analytics

## 🔑 Generating Redeem Codes

Users pay you → You generate codes → They redeem in app

### Code Rules (14 characters):
- Contains **'Y'** anywhere = 1 Year (12 months)
- Contains **'6'** anywhere = 6 Months
- Contains **'1'** anywhere = 1 Month

### Example Codes:
```
ABCDEFGHIJKLMY  → 1 Year (has 'Y')
ABCDEFGHIJK6LM  → 6 Months (has '6')
ABCDEFGHIJK1LM  → 1 Month (has '1')
```

### Generate Random Codes:
```python
import random
import string

# For 1 Year
code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13)) + 'Y'
print(f"1 Year Code: {code}")

# For 6 Months  
code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13)) + '6'
print(f"6 Months Code: {code}")

# For 1 Month
code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13)) + '1'
print(f"1 Month Code: {code}")
```

## 🌐 Making App Accessible from Internet

Your app currently works on localhost. To make it accessible from anywhere:

### Option 1: Use ngrok (Quick & Easy)
```bash
# Install ngrok
# Visit ngrok.com and follow instructions

# Expose port 3000
ngrok http 3000
```

### Option 2: Deploy to Cloud (Recommended for Production)
- AWS, DigitalOcean, Heroku, etc.
- Get a domain name
- Set up SSL certificate
- Configure DNS

**Need help with deployment? Contact: +916355137969**

## 🐛 Common Issues & Solutions

### "Services not running"
```bash
sudo supervisorctl restart all
```

### "Can't access from other devices"
- Check firewall settings
- Make sure port 3000 is open
- Use correct IP address

### "Database connection error"
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Restart if needed
sudo supervisorctl restart mongodb
```

### "Frontend not loading"
```bash
# Check logs
tail -f /var/log/supervisor/frontend.err.log

# Restart frontend
sudo supervisorctl restart frontend
```

## 📞 Support

For any issues or questions:
- **WhatsApp**: +916355137969
- **Phone**: +916355137969
- **Instagram**: @ObeCure_official

## 🎉 You're All Set!

Your ObeCure app is running and ready for users!

---

**Made with ❤️ for ObeCure**
