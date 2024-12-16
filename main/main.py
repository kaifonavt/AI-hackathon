from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user.route import router as UserRoute 
from routes.restaurant.route import router as RestaurantRoute 

from database import engine, Base

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

logger.info("Starting application...")

# Initialize FastAPI app
app = FastAPI(
    title="ExperaAPI",
    description="API for managing user portfolios",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(UserRoute)
app.include_router(RestaurantRoute)

logger.info("All routers registered successfully")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the experaAPI",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)