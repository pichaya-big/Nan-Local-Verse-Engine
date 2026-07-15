from pydantic import BaseModel, Field

class CampaignBrief(BaseModel):
    # Field เหล่านี้คือข้อมูลที่ API ต้องการจากหน้าบ้าน (Next.js)
    business_type: str = Field(..., description="ประเภทธุรกิจ เช่น ร้านกาแฟ, โฮมสเตย์")
    season: str = Field(..., description="ช่วงเวลา เช่น ฤดูหนาว, หน้าฝน")
    store_id: int | None = Field(None, description="รหัสร้านค้าของผู้ประกอบการ")
    target_audience: str = Field("นักท่องเที่ยวทั่วไป", description="กลุ่มเป้าหมาย")
    tone: str = Field("ร่วมสมัยล้านนาโมเดิร์น", description="น้ำเสียงแคมเปญ เช่น สุภาพ อบอุ่นคำเมือง, โมเดิร์นคูล ชิคๆ, ขี้เล่น วัยรุ่นกระตือรือร้น")
    district: str | None = Field("เมืองน่าน", description="อำเภอ")
    
    class Config:
        # ใช้สำหรับทำตัวอย่างใน Swagger UI (/docs)
        json_schema_extra = {
            "example": {
                "business_type": "โฮมสเตย์ในบ่อเกลือ",
                "season": "ฤดูหนาว",
                "target_audience": "วัยรุ่นชอบถ่ายรูป",
                "tone": "โมเดิร์นคูล ชิคๆ",
                "district": "บ่อเกลือ"
            }
        }