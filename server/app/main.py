import os
from dotenv import load_dotenv
# โหลด Environment Variables
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import campaign, weather


def create_app() -> FastAPI:
    app = FastAPI(
        title="Nan Local-Verse Engine API",
        description="API สำหรับจัดการแคมเปญท่องเที่ยวชุมชนน่าน",
        version="1.0.0"
    )

    # ตั้งค่า CORS โดยดึงค่าจาก .env
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # รวม Router (ถ้ามีหลายตัว สามารถเพิ่มที่นี่ได้เลย)
    app.include_router(campaign.router)
    app.include_router(weather.router)

    @app.get("/", tags=["Health Check"])
    def health_check():
        return {
            "status": "Nan Engine Online", 
            "version": "1.0.0",
            "environment": os.getenv("APP_ENV", "development")
        }

    return app

app = create_app()