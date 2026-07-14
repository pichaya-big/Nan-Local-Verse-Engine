from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# สร้าง client
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# ต้องมีฟังก์ชันนี้เป๊ะๆ!
def save_to_db(data: dict):
    try:
        response = supabase.table("campaigns").insert(data).execute()
        return response.data
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return None