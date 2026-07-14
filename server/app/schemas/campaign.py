from pydantic import BaseModel, Field

class CampaignBrief(BaseModel):
    # Field เหล่านี้คือข้อมูลที่ API ต้องการจากหน้าบ้าน (Next.js)
    business_type: str = Field(..., description="ประเภทธุรกิจ เช่น ร้านกาแฟ, โฮมสเตย์")
    season: str = Field(..., description="ช่วงเวลา เช่น ฤดูหนาว, หน้าฝน")
    store_id: int | None = Field(None, description="รหัสร้านค้าของผู้ประกอบการ")
    
    # เพิ่ม field อื่นๆ ที่อาจจำเป็นในอนาคตได้ที่นี่
    target_audience: str = Field("นักท่องเที่ยวทั่วไป", description="กลุ่มเป้าหมาย")
    
    class Config:
        # ใช้สำหรับทำตัวอย่างใน Swagger UI (/docs)
        json_schema_extra = {
            "example": {
                "business_type": "โฮมสเตย์ในบ่อเกลือ",
                "season": "ฤดูหนาว",
                "target_audience": "วัยรุ่นชอบถ่ายรูป"
            }
        }