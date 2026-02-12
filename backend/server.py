from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "obecure-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")

# Initialize FastAPI
app = FastAPI(title="ObeCure API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
try:
    mongo_client = MongoClient(MONGO_URL)
    db = mongo_client["obecure_db"]
    users_collection = db["users"]
    calorie_logs_collection = db["calorie_logs"]
    workout_logs_collection = db["workout_logs"]
    body_metrics_collection = db["body_metrics"]
    # Create unique index on email
    users_collection.create_index("email", unique=True)
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    db = None

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic Models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class RedeemCodeRequest(BaseModel):
    code: str

class UserPreferences(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    preferences: Optional[dict] = None

class CalorieLog(BaseModel):
    date: str  # YYYY-MM-DD
    meal_name: str
    calories: int
    meal_type: Optional[str] = None  # breakfast, lunch, dinner, snack

class WorkoutLog(BaseModel):
    date: str  # YYYY-MM-DD
    workout_name: str
    duration_minutes: int
    calories_burned: Optional[int] = None

class BodyMetricsLog(BaseModel):
    date: str  # YYYY-MM-DD
    weight: float
    waist: Optional[float] = None
    chest: Optional[float] = None
    hips: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    notes: Optional[str] = None

class ReportRequest(BaseModel):
    start_date: str
    end_date: str
    report_type: str  # "all", "calories", "workouts", "body_metrics"

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user = users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    user["_id"] = str(user["_id"])
    return user

# API Routes
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db is not None else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserSignup):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = {
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "subscription_expiry": None,
        "preferences": {}
    }
    
    result = users_collection.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.email})
    
    # Remove password from response
    del new_user["password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    # Find user
    user = users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": credentials.email})
    
    # Prepare user data
    user["_id"] = str(user["_id"])
    del user["password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@app.post("/api/subscription/redeem")
async def redeem_code(request: RedeemCodeRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    code = request.code.upper().strip()
    
    if len(code) != 14:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid code format. Code must be 14 characters."
        )
    
    # Validate redeem code based on new logic
    duration_months = 0
    
    # Check for year access (contains 'Y')
    if 'Y' in code:
        duration_months = 12
    # Check for 6 months access (contains '6')
    elif '6' in code:
        duration_months = 6
    # Check for 1 month access (contains '1')
    elif '1' in code:
        duration_months = 1
    
    if duration_months == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid redeem code"
        )
    
    # Check if code already used - get fresh user data
    user_id = ObjectId(current_user["_id"])
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    used_codes = user.get("used_codes", [])
    
    if code in used_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This code has already been used"
        )
    
    # Calculate new expiry date
    current_expiry = user.get("subscription_expiry")
    if current_expiry and current_expiry > datetime.utcnow():
        new_expiry = current_expiry + timedelta(days=duration_months * 30)
    else:
        new_expiry = datetime.utcnow() + timedelta(days=duration_months * 30)
    
    # Update user subscription
    users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {"subscription_expiry": new_expiry},
            "$push": {"used_codes": code}
        }
    )
    
    return {
        "success": True,
        "message": f"Successfully redeemed {duration_months} month(s) subscription",
        "subscription_expiry": new_expiry.isoformat(),
        "duration_months": duration_months
    }

@app.get("/api/subscription/status")
async def subscription_status(current_user: dict = Depends(get_current_user)):
    subscription_expiry = current_user.get("subscription_expiry")
    
    is_subscribed = False
    days_remaining = 0
    
    if subscription_expiry:
        if isinstance(subscription_expiry, str):
            subscription_expiry = datetime.fromisoformat(subscription_expiry)
        
        if subscription_expiry > datetime.utcnow():
            is_subscribed = True
            days_remaining = (subscription_expiry - datetime.utcnow()).days
    
    return {
        "is_subscribed": is_subscribed,
        "days_remaining": days_remaining,
        "subscription_expiry": subscription_expiry.isoformat() if subscription_expiry else None
    }

@app.put("/api/user/preferences")
async def update_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    update_data = preferences.dict(exclude_none=True)
    
    user_id = ObjectId(current_user["_id"])
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"preferences": update_data}}
    )
    
    return {"success": True, "message": "Preferences updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
