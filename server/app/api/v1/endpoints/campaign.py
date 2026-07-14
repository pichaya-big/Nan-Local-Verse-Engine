from fastapi import APIRouter
from fastapi import HTTPException
from app.schemas.campaign import CampaignBrief
from app.services.ai_service import generate_campaign_content
from app.services.db_service import save_to_db

router = APIRouter(prefix="/api/v1/campaign", tags=["Campaigns"])

@router.post("/generate")
async def create_campaign(brief: CampaignBrief):
    try:
        campaign_data = generate_campaign_content(brief)
        
        # กรองและแมปเฉพาะคีย์คอลัมน์ที่มีอยู่จริงในโครงสร้างตาราง public.campaigns เพื่อไม่ให้เกิด Error
        db_payload = {
            "title": campaign_data.get("campaign_title", "แคมเปญเมืองน่านอัจฉริยะ"),
            "description": f"แคปชั่น: {campaign_data.get('caption')}\n\nภารกิจ: {campaign_data.get('gamification_quest')}\n\nPrompt ภาพ: {campaign_data.get('image_prompt')}",
            "weather_condition": brief.season,
            "status": "active"
        }
        
        # เพิ่ม store_id หากมีส่งข้อมูลมาจากฝั่งหน้าบ้าน
        if brief.store_id:
            db_payload["store_id"] = brief.store_id
            
        save_to_db(db_payload)
        return {"success": True, "data": campaign_data}
    except Exception as e:
        # ส่ง error กลับไปบอก Frontend ว่ามีปัญหาอะไร
        raise HTTPException(status_code=500, detail=str(e))