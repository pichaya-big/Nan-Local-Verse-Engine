from fastapi import APIRouter, HTTPException
from app.services.weather_service import get_current_weather

router = APIRouter(prefix="/api/v1/weather", tags=["Weather"])

@router.get("/current")
async def get_weather(district: str = "ปัว"):
    try:
        data = get_current_weather(district)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
