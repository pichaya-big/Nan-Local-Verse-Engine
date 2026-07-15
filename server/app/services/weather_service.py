import os
import requests
import datetime
from app.services.db_service import supabase

# พิกัดละติจูด/ลองจิจูดของแต่ละอำเภอในจังหวัดน่าน
DISTRICT_COORDINATES = {
    "ปัว": {"lat": 19.1764, "lon": 100.9161},
    "บ่อเกลือ": {"lat": 19.1485, "lon": 101.1785},
    "เมืองน่าน": {"lat": 18.7830, "lon": 100.7816},
    "เชียงกลาง": {"lat": 19.2941, "lon": 100.8617},
    "นาน้อย": {"lat": 18.3248, "lon": 100.7138}
}

# แปลงรหัสสภาพอากาศ WMO (World Meteorological Organization) เป็นคำภาษาไทย
def interpret_wmo_code(code: int) -> str:
    if code == 0:
        return "แดดออก ฟ้าใส"
    elif code in [1, 2, 3]:
        return "มีเมฆบางส่วน"
    elif code in [45, 48]:
        return "หมอกลงหนาแน่น"
    elif code in [51, 53, 55]:
        return "ฝนตกปรอยๆ"
    elif code in [56, 57]:
        return "ฝนละอองเย็นจัด"
    elif code in [61, 63, 65]:
        return "ฝนตกปานกลาง"
    elif code in [66, 67]:
        return "ฝนตกหนักเย็นจัด"
    elif code in [71, 73, 75, 77]:
        return "หิมะตก"
    elif code in [80, 81, 82]:
        return "ฝนตกไล่ช้าง"
    elif code in [85, 86]:
        return "หิมะตกไล่ช้าง"
    elif code in [95, 96, 99]:
        return "พายุฝนฟ้าคะนอง"
    else:
        return "สภาพอากาศแปรปรวน"

def get_current_weather(district: str) -> dict:
    # ค้นหาพิกัดอำเภอ
    coord = DISTRICT_COORDINATES.get(district, DISTRICT_COORDINATES["ปัว"])
    lat = coord["lat"]
    lon = coord["lon"]
    
    try:
        # ยิง HTTP Get ไปหา Open-Meteo API
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        current = data.get("current", {})
        
        temperature = current.get("temperature_2m", 25.0)
        humidity = current.get("relative_humidity_2m", 80)
        wmo_code = current.get("weather_code", 0)
        
        condition = interpret_wmo_code(wmo_code)
        
        # บันทึกข้อมูลสภาพอากาศลงฐานข้อมูล Supabase ตาราง weather_logs
        weather_log = {
            "district": district,
            "temperature": float(temperature),
            "humidity": int(humidity),
            "condition": condition,
            "logged_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        try:
            supabase.table("weather_logs").insert(weather_log).execute()
        except Exception as db_err:
            print(f"Failed to log weather in database: {db_err}")
            
        return {
            "success": True,
            "district": district,
            "temperature": temperature,
            "humidity": humidity,
            "condition": condition
        }
        
    except Exception as e:
        print(f"Error fetching weather from Open-Meteo: {e}")
        # Fallback กรณี API ล่ม
        return {
            "success": False,
            "district": district,
            "temperature": 24.0,
            "humidity": 85,
            "condition": "ฝนตกเบาบาง"
        }
