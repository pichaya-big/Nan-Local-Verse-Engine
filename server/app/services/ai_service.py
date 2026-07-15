import os
import json
import random
import requests
from dotenv import load_dotenv
from app.schemas.campaign import CampaignBrief

load_dotenv()

# --- คลังข้อมูลแคมเปญล้านนาจำลองระดับพรีเมียม (Rich Mock Campaigns Database) ---
# รองรับการยัดค่า {district} และ {target} เพื่อความเนียนเวลา Fallback
MOCK_CAMPAIGNS = {
    "cafe": {
        "rainy": [
            {
                "campaign_title": "🌧️ จิบโกโก้น่านอุ่นๆ อิงแอบไอฝนตี้ {district}",
                "caption": "หน้าฝนตั๊บๆ แบบนี้ หนีมาซุกตัวจิบโกโก้อุ่นๆ ตี้ร้านเฮาเน้อเจ้า ☕ เอาใจแก๊ง {target} กลิ่นอายโกโก้แท้เมืองน่านคั่วหอมกรุ่น ฟังเสียงฝนตกลงใบตอง สโลว์ไลฟ์สุดๆ จ้าว ✨🌿 #หลบฝนคนเหงา #โกโก้น่าน #{district}หน้าฝน",
                "gamification_quest": "เควส 'โกโก้ท้าสายฝนตี้ {district}': ถ่ายรูปแก้วโกโก้คู่กับวิวฝนตกนอกหน้าต่างร้าน แล้วแชร์ลงโซเชียลเพื่อรับรหัสสแกนรับแต้ม 150 NAN Coins ทันทีจ้าว!",
                "image_prompt": "Cozy wooden cafe in Nan Thailand during soft rain, warm indoor lights, cocoa cup on table near window, lush green valley background, cinematic 8k"
            },
            {
                "campaign_title": "☔ ชาอัญชันมะนาวหอม แก้หวัดยามฝนพรำตี้ {district}",
                "caption": "ฝนตกชุ่มฉ่ำแบบนี้ มาเติมความสดชื่นด้วย 'ชาอัญชันมะนาวน้ำผึ้งป่า' ร้อนๆ หอมหวานอมเปรี้ยวชุ่มคอเจ้า 🍯🍋 ชวนชาว {target} ฟังเสียงหยดน้ำฝนกระทบกระจกชิลๆ เติมพลังใจ๋กันเน้อเจ้า #กรีนซีซั่น{district}",
                "gamification_quest": "เควส 'ชาหอมยามหยาดฝน': สั่งเมนูชาร้อนคู่กับขนมไทยพื้นบ้านในร้านยามฝนตกตี้ {district} รับรหัสสแกนรับรางวัล 150 NAN Coins จ้าว",
                "image_prompt": "Cozy coffee shop in Nan, a warm cup of herbal tea with lemon on a wooden desk, rainy window view with reflections, blurry green forest outside, 8k photography"
            }
        ],
        "sunny": [
            {
                "campaign_title": "☀️ กาแฟมะไฟจีน ดับร้อนยามแดดจ้าตี้ {district}",
                "caption": "แดดใสฟ้าเปิดแบบนี้ แวะมาจิบ 'เอสเพรสโซ่มะไฟจีน' เมนูซิกเนเจอร์รสเปรี้ยวหวานสดชื่นตี้ร้านเฮาก่อนเน้อเจ้า 🍊 ชวนชาว {target} ดับร้อนชาร์จพลังแล้วค่อยไปแอ่ววัดต่อจ้าว 🥤⛰️ #ส้มมะไฟจีนน่าน #คาเฟ่{district}",
                "gamification_quest": "เควส 'เอสเพรสโซ่สู้แดด': ถ่ายภาพเครื่องดื่มคู่กับมุมสวนแดดส่องของร้านใน {district} โพสต์ลง Facebook/IG รับสิทธิ์สแกนเคลมแต้ม 150 NAN Coins จ้าว!",
                "image_prompt": "Sunlight streaming into a modern Lanna style cafe in Nan, cold orange coffee glass on wooden counter, mountains view, bright summer vibe, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "❄️ กาแฟท้าลมหนาว อุ่นใจ๋ตี้ {district}",
                "caption": "สายลมหนาวพัดมาแล้วเจ้า 🍂 แวะมาดริปกาแฟสดอาราบิก้าน่านแท้ๆ อุ่นๆ ท่ามกลางอุณหภูมิเย็นเฉียบยามเช้าเน้อเจ้า ชวนชาว {target} จิบกาแฟผิงไฟคุยกันเปิ้นว่าฟินขนาดจ้าว ☕🧣 #หนาวนี้ที่{district} #กาแฟดริป",
                "gamification_quest": "เควส 'ดริปอุ่นยามหมอกเหมย': เช็คอินร้านกาแฟของเราก่อนเวลา 09:30 น. ท่ามกลางทะเลหมอกหน้าหนาวตี้ {district} รับแต้มสะสม 150 NAN Coins จ้าว!",
                "image_prompt": "Morning mist in Nan Thailand mountain cafe, steaming drip coffee pot, wooden terrace, pine trees, winter cozy sweater vibe, highly detailed 8k"
            }
        ]
    },
    "homestay": {
        "rainy": [
            {
                "campaign_title": "🏡 นอนฟังเสียงฝนตกกระทบนาข้าวเขียวขจีตี้ {district}",
                "caption": "กรีนซีซั่นหน้าฝนตั๊บๆ แบบนี้ ตื่นมาสูดโอโซนดมกลิ่นดินกลิ่นนาข้าวตี้ {district} สีเขียวกว้างสุดลูกหูลูกตา 🌾 ชวนกลุ่ม {target} นอนโฮมสเตย์ไม้ ฟังเสียงฝน อุ่นอกอุ่นใจ๋ขนาดเน้อเจ้า 💚💤 #โฮมสเตย์{district}",
                "gamification_quest": "เควส 'นอนฟังเสียงฝนเคล้าทุ่งนา': ถ่ายภาพทุ่งนาเขียวขจีจากระเบียงห้องพักโฮมสเตย์ของเรายามฝนตกใน {district} โพสต์แชร์รับรหัสสแกนรับรางวัล 200 NAN Coins จ้าว!",
                "image_prompt": "Lanna style homestay wooden balcony looking over lush green rice fields in Nan Thailand during rain, misty mountains, 8k resolution"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🏕️ นอนแคมป์ตากดาว รับลมเย็นยามค่ำคืนตี้ {district}",
                "caption": "ช่วงนี้ฟ้าเปิดใสปิ๊งต้อนรับหน้าร้อนแบบใสๆ 🌌 พลพรรค {target} มานอนกางเต็นท์ดูดาวล้านดวง ท่ามกลางลมภูเขาพัดเย็นสบายที่จุดกางเต็นท์ {district} เน้อเจ้า รับรองหายเหนื่อยเป็นปลิดทิ้งจ้าว 🌟⛺ #แคมปิ้ง{district} #ตากดาวล้านดวง",
                "gamification_quest": "เควส 'ล่าแสงดาวล้านดวง': เช็คอินและถ่ายภาพเต็นท์คู่กับท้องฟ้าเปิดเห็นดาวระยิบระยับยามค่ำคืนตี้ {district} รับรหัสเคลมรางวัล 200 NAN Coins จ้าว!",
                "image_prompt": "Cozy glamping tent on a hill in Nan Thailand under a starry night sky, bonfire, warm ambient light, magical 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "❄️ โฮมสเตย์โอบสายหมอกยามเช้าตี้ {district}",
                "caption": "ตื่นเช้ามาเจอทะเลหมอกลอยละล่องมาเคาะกระจกห้องนอนเลยเจ้า ยินดีต้อนรับชาว {target} สัมผัสความหนาวสะท้านใจ ผิงไฟปิ้งข้าวจี่อุ่นๆ ยามเช้าตี้ลานโฮมสเตย์ {district} เฮาเน้อเจ้า 🧣🥔 #ทะเลหมอก{district} #หนาวนี้ที่น่าน",
                "gamification_quest": "เควส 'ทะเลหมอกเคาะประตูหน้าบ้าน': ถ่ายรูปคู่กับทะเลหมอกจากหน้าระเบียงห้องพักใน {district} ก่อนเวลา 08:30 น. รับแต้มสะสมทันที 200 NAN Coins จ้าว!",
                "image_prompt": "Traditional wooden Lanna house in Nan surrounded by thick white sea of fog, early morning gold light, cozy and chilly atmosphere, 8k"
            }
        ]
    },
    "restaurant": {
        "rainy": [
            {
                "campaign_title": "🍲 ขันโตกหลบฝน อุ่นท้องด้วยแกงแคไก่เมืองตี้ {district}",
                "caption": "ฝนตกตั๊บๆ ออกไปไหนบ่ได้ แวะมาล้อมวงกิ๋นข้าวตอนโตยกั๋นเจ้า ต้อนรับสายกิ๋นกลุ่ม {target} 🥢 ซดน้ำแกงแคไก่เมืองร้อนๆ สมุนไพรน่านเน้นๆ แก้หวัดหลบฝนตี้ {district} ลำขนาดกินคู่ข้าวนึ่งอุ่นๆ เน้อเจ้า 🍲✨ #อาหารเหนือ #ขันโตกน่าน",
                "gamification_quest": "เควส 'ขันโตกร้อนซดน้ำแกงแค': สั่งอาหารชุดขันโตกพื้นบ้านน่านและรับประทานร้อนๆ ที่ร้านของเราใน {district} ยามฝนตก รับแต้มสะสม 150 NAN Coins จ้าว!",
                "image_prompt": "Authentic Lanna Khantoke dining set with warm soup bowls, wooden interior restaurant in Nan, rainy background behind window, cozy 8k"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🥢 ลาบคั่วสูตรเด็ดสมุนไพรมะแขว่น ดับร้อนจัดจ้านตี้ {district}",
                "caption": "แดดดีๆ แบบนี้ต้อง 'ลาบคั่วหมูสมุนไพรน่าน' มะแขว่นหอมฉุนขึ้นจมูก ชวนชาว {target} กินแกล้มผักสดพื้นบ้านกรอบๆ อร่อยเด็ดสู้แดดจัดจ้านตี้ {district} ลำแต๊ๆ เน้อเจ้า แวะมาชิมกันจ้าว 🍽️🔥 #ลาบคั่วหมู #ของดีเมืองน่าน",
                "gamification_quest": "เควส 'สมุนไพรมะแขว่นพิชิตแดด': สั่งเมนูอาหารพื้นเมืองน่านที่มีส่วนประกอบของเครื่องเทศมะแขว่นตี้ร้านใน {district} รับรางวัล 150 NAN Coins จ้าว!",
                "image_prompt": "Traditional Northern Thai minced pork salad (Larb Kua) on banana leaf, crispy garlic on top, fresh vegetable plate, bright natural light, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "🍲 ซดน้ำสุกี้ล้านนาแก้หนาว ริมภูเขาเย็นเฉียบตี้ {district}",
                "caption": "หนาวนี้มาล้อมเตาซดน้ำแกงสมุนไพรร้อนๆ กับชาว {target} ท่ามกลางอุณหภูมิเย็นเฉียบตี้ {district} วัตถุดิบสดใหม่ส่งตรงจากฟาร์มเกษตรกร ผักกรอบหวานเจี๊ยบ กินแก้หนาวลำขนาดจ้าว 🍂🧣 #สุกี้ล้านนา #หนาวนี้แอ่วน่าน",
                "gamification_quest": "เควส 'ล้อมเตาแก้หนาวริมดอย': ทานมื้อค่ำเมนูหม้อไฟร้อนๆ กับร้านอาหารของเราใน {district} ท่ามกลางอากาศหนาว รับรหัสผ่านสแกน 150 NAN Coins จ้าว!",
                "image_prompt": "Hot pot meal steaming in a cold evening, mountain restaurant in Nan, friends gathered around, warm glowing lights, winter vibes, 8k"
            }
        ]
    },
    "workshop": {
        "rainy": [
            {
                "campaign_title": "🚜 ลุยฟาร์มออร์แกนิก สัมผัสวิถีเกษตรสีเขียวตี้ {district}",
                "caption": "หน้าฝนชุ่มฉ่ำแบบนี้ สวนเกษตรของเราเขียวขจีสดชื่นสุดๆ เจ้า 🌿 ชวนแก๊ง {target} แวะมาเดินกางร่มเก็บใบชา ชิมผลไม้สดๆ จากต้น ดมกลิ่นดินกลิ่นหญ้าตี้ {district} สลัดความเหนื่อยล้ามาพิงหลังตี้สวนเฮาเน้อเจ้า ☔🍊 #สวนน่านออร์แกนิก",
                "gamification_quest": "เควส 'เดินลุยสวนกางร่มเขียว': เข้าร่วมกิจกรรมทดลองเดินลุยสวนเกษตรหรือปลูกกล้าไม้ร่วมกับชุมชนใน {district} ยามฝนตก รับรหัสสแกนรับแต้ม 180 NAN Coins จ้าว!",
                "image_prompt": "Organic tea plantation in Nan Thailand during gentle rain, farmer holding umbrella, green terrace rows, beautiful misty day, 8k"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🧺 เวิร์กช็อปมัดย้อมครามย้อมกาแฟสีธรรมชาติፈላጊตี้ {district}",
                "caption": "แดดจัดฟ้าใส เหมาะกับการตากผ้าสีธรรมชาติเป็นที่สุดเจ้า! ☀️ ชวนสายเวิร์กช็อปกลุ่ม {target} แวะมาร่วมกิจกรรมมัดย้อมคราม ย้อมสีกาแฟท้องถิ่นตี้ {district} ได้ผ้าผืนเดียวในโลกฝีมือตัวเองกลับบ้านเน้อเจ้า 🎨🧣 #มัดย้อมน่าน #งานคราฟต์น่าน",
                "gamification_quest": "เควส 'มัดย้อมธรรมชาติท้าแดด': เข้าร่วมกิจกรรมมัดย้อมผ้าและโพสต์ภาพถ่ายผลงานมัดย้อมตากแดดเคียงข้างสวนใน {district} รับแต้มทันที 180 NAN Coins จ้าว!",
                "image_prompt": "Drying colorful natural dyed fabrics in the sun, traditional workshop in Nan Thailand, bright summer sun, arts and crafts, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "🍓 เก็บสตรอเบอร์รี่สดจากยอดดอยรับลมหนาวตี้ {district}",
                "caption": "หนาวนี้สตรอเบอร์รี่ลูกโตๆ สีแดงฉ่ำหวานเจี๊ยบตี้สวนพร้อมให้ชาว {target} มาเด็ดเก็บแล้วเจ้า 🍓 เดินรับลมหนาว ชมวิวทุ่งดอกไม้เมืองหนาวบานสะพรั่งตี้ {district} ถ่ายรูปมุมไหนก็สวยขนาดเน้อเจ้า 🌸🧣 #เก็บสตรอเบอร์รี่",
                "gamification_quest": "เควส 'สตรอเบอร์รี่แดงฉ่ำยามเช้า': ร่วมกิจกรรมเก็บผลสตรอเบอร์รี่สดจากต้นใส่ตะกร้าไม้ไผ่ของสวนเกษตรเราใน {district} รับแต้มสะสม 180 NAN Coins จ้าว!",
                "image_prompt": "Picking red strawberries in a hillside farm in Nan Thailand, morning dew, cold foggy weather, bamboo basket, 8k"
            }
        ]
    }
}

def generate_campaign_content(brief: CampaignBrief):
    """
    Hybrid Context-Aware Engine: พยายามเจ็นด้วย OpenRouter ก่อน 
    หาก Limit เต็มหรือติด Error จะหล่นมาดักด้วย Local Template ทันที
    """
    try:
        # 1. โหลดการตั้งค่าจาก OpenRouter
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY Missing")
            
        model_id = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct:free")
        district_val = brief.district if brief.district else "เมืองน่าน"
        target_val = brief.target_audience if brief.target_audience else "นักท่องเที่ยวคนสำคัญ"
        tone_val = brief.tone if brief.tone else "ร่วมสมัยล้านนาโมเดิร์น"

        system_msg = (
            f"คุณคือนักการตลาด AI อัจฉริยะล้านนา ที่เชี่ยวชาญการโปรโมตการท่องเที่ยวจังหวัดน่านด้วยพลัง Gamification "
            f"ภารกิจของคุณคือการสร้างแคมเปญการตลาดสำหรับส่งเสริมธุรกิจชุมชนน่าน โดยอ้างอิงจากข้อมูลประเภทธุรกิจ สภาพอากาศ และพิกัดพื้นที่ "
            f"กรุณาสร้างแคมเปญการตลาดที่มีระดับความอบอุ่น/น้ำเสียงแบบ: '{tone_val}' และแฝงไปด้วยความน่ารักของคำเมืองล้านนา (เช่น จ้าว, เน้อ, เปิ้น, ลำขนาด) "
            f"โดยส่งผลลัพธ์กลับมาเป็นโครงสร้างข้อมูล JSON ที่มีฟิลด์ตามที่กำหนดไว้เท่านั้น"
        )

        user_msg = f"""
        สร้างแคมเปญ JSON สำหรับ:
        - ประเภทธุรกิจ: {brief.business_type}
        - ฤดูกาล / สภาพอากาศ: {brief.season}
        - พิกัดพื้นที่: อำเภอ{district_val} จังหวัดน่าน
        - กลุ่มเป้าหมายหลัก: {target_val}
        - น้ำเสียงแคมเปญ (Tone): {tone_val}

        โครงสร้างข้อมูล JSON:
        {{
          "campaign_title": "ชื่อแคมเปญสั้นๆ ดึงดูดใจ และมีความเป็นล้านนาร่วมสมัย",
          "caption": "ข้อความโพสต์โซเชียลมีเดียโปรโมตแคมเปญนี้ เขียนด้วยคำเมือง/ภาษาล้านนาสลับไทยอย่างสละสลวย อบอุ่น น่ารัก",
          "gamification_quest": "รายละเอียดกิจกรรมเควสท้าทายนักท่องเที่ยว เพื่อสะสมแต้ม NAN Coins",
          "image_prompt": "ข้อความภาษาอังกฤษ (English Prompt) คุณภาพสูงสำหรับนำไปเจ็นภาพแคมเปญด้วย Midjourney/DALL-E"
        }}
        """

        # 2. ยิงของจริงไปที่ OpenRouter
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
                "X-Title": "Nan Local Verse Engine"
            },
            json={  # 🛑 เปลี่ยนตรงนี้จาก data=json.dumps(...) ให้เป็น json={...} สั้นๆ แบบนี้เลย
                "model": model_id,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg}
                ],
                "response_format": { "type": "json_object" }
            },
            timeout=8
        )
        
        # ถ้ารหัสการตอบกลับไม่ใช่ 200 (เช่น 429 Rate Limit หรือ 502) จะกระโดดไปที่ตระกูล except
        response.raise_for_status() 
        
        content_text = response.json()['choices'][0]['message']['content'].strip()
        return json.loads(content_text)

    except Exception as e:
        print("====== OPENROUTER DEBUG INFO ======")
        print(f"Exception Type: {type(e)}")
        print(f"Exception Message: {e}")
        
        # ถ้าเกิด Error จากการยิง HTTP (เช่น 404, 401, 429) เราจะแอบดูข้อความข้างในมัน
        if 'response' in locals() or 'response' in globals():
            try:
                print(f"Response Status Code: {response.status_code}")
                print(f"Response Headers: {response.headers}")
                print(f"Response Body: {response.text}") # 🌟 ตัวนี้แหละจะบอกว่าทำไมถึง 404
            except Exception:
                pass
        print("====================================")
        
        print(f"FALLBACK ENGAGED: ({e}). Generating high-quality local template.")
        # 🔥 SECTION FALLBACK: เปิดทำงานอัตโนมัติเมื่อ API ขัดข้อง หรือ Limit เต็ม
        print(f"FALLBACK ENGAGED: ({e}). Generating high-quality local template.")
        
        # A. จัดหมวดหมู่ของประเภทธุรกิจ (Business Categorization)
        biz_text = (brief.business_type or "").lower()
        category = "cafe"
        if any(x in biz_text for x in ["ที่พัก", "โฮมสเตย์", "homestay", "hotel", "resort"]):
            category = "homestay"
        elif any(x in biz_text for x in ["อาหาร", "กิน", "กิ๋n", "restaurant", "food", "ขันโตก"]):
            category = "restaurant"
        elif any(x in biz_text for x in ["สวน", "เกษตร", "ท่องเที่ยว", "workshop", "farm", "มัดย้อม"]):
            category = "workshop"

        # B. จัดหมวดหมู่ของฤดูกาล/สภาพอากาศ (Weather Categorization)
        season_text = (brief.season or "").lower()
        weather = "sunny"
        if any(x in season_text for x in ["ฝน", "rain", "green", "ชุ่ม", "หมอก"]):
            weather = "rainy"
        elif any(x in season_text for x in ["หนาว", "winter", "cool", "cold", "หิมะ"]):
            weather = "winter"

        # C. ดึงคลังข้อมูลที่แมตช์เจอ และสุ่มแคมเปญขึ้นมาตัวหนึ่ง
        campaign_pool = MOCK_CAMPAIGNS[category].get(weather, MOCK_CAMPAIGNS[category]["rainy"])
        selected_mock = random.choice(campaign_pool)
        
        # D. ดึงค่าพิกัดกับกลุ่มเป้าหมายเซ็ตค่า Default กรณีส่งมาเป็นค่าว่าง
        district_val = brief.district if hasattr(brief, 'district') and brief.district else "เมืองน่าน"
        target_val = brief.target_audience if brief.target_audience else "นักท่องเที่ยวคนสำคัญ"

        # E. ยัด Token Data ฉีดเข้า String Template แล้วส่งกลับออกไปทันที
        return {
            "campaign_title": selected_mock["campaign_title"].format(district=district_val, target=target_val),
            "caption": selected_mock["caption"].format(district=district_val, target=target_val),
            "gamification_quest": selected_mock["gamification_quest"].format(district=district_val, target=target_val),
            "image_prompt": selected_mock["image_prompt"].format(district=district_val, target=target_val)
        }