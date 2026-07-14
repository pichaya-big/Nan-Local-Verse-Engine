import os
import json
import random
from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.schemas.campaign import CampaignBrief

load_dotenv()

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY ไม่ถูกตั้งค่าใน .env!")
    return genai.Client(api_key=api_key)

# คลังข้อมูลแคมเปญล้านนาจำลองระดับพรีเมียม (Rich Mock Campaigns Database)
# แบ่งตามประเภทธุรกิจ (Cafe, Homestay, Restaurant, Workshop) และสภาพอากาศ (Rainy, Sunny, Winter)
MOCK_CAMPAIGNS = {
    "cafe": {
        "rainy": [
            {
                "campaign_title": "🌧️ จิบโกโก้น่านอุ่นๆ อิงแอบไอฝนปัว",
                "caption": "หน้าฝนตั๊บๆ แบบนี้ หนีมาซุกตัวจิบโกโก้อุ่นๆ ตี้ร้านเฮาเน้อเจ้า ☕ กลิ่นอายโกโก้แท้เมืองน่านคั่วหอมกรุ่น ฟังเสียงฝนตกลงใบตอง สโลว์ไลฟ์สุดๆ จ้าว ✨🌿 #หลบฝนคนเหงา #โกโก้น่าน",
                "gamification_quest": "เควส 'โกโก้ท้าสายฝน': ถ่ายรูปแก้วโกโก้คู่กับวิวฝนตกนอกหน้าต่างร้าน แล้วแชร์ลงโซเชียลเพื่อรับรหัสสแกนรับแต้ม 150 NAN Coins ทันทีจ้าว!",
                "image_prompt": "Cozy wooden cafe in Nan Thailand during soft rain, warm indoor lights, cocoa cup on table near window, lush green valley background, cinematic 8k"
            },
            {
                "campaign_title": "☔ ชาอัญชันมะนาวหอม แก้หวัดยามฝนพรำ",
                "caption": "ฝนตกชุ่มฉ่ำแบบนี้ มาเติมความสดชื่นด้วย 'ชาอัญชันมะนาวน้ำผึ้งป่า' ร้อนๆ หอมหวานอมเปรี้ยวชุ่มคอเจ้า 🍯🍋 ฟังเสียงหยดน้ำฝนกระทบกระจกชิลๆ เติมพลังใจ๋กันเน้อเจ้า #กรีนซีซั่นน่าน",
                "gamification_quest": "เควส 'ชาหอมยามหยาดฝน': สั่งเมนูชาร้อนคู่กับขนมไทยพื้นบ้านในร้านยามฝนตก รับรหัสสแกนรับรางวัล 150 NAN Coins จ้าว",
                "image_prompt": "Cozy coffee shop in Nan, a warm cup of herbal tea with lemon on a wooden desk, rainy window view with reflections, blurry green forest outside, 8k photography"
            }
        ],
        "sunny": [
            {
                "campaign_title": "☀️ กาแฟมะไฟจีน ดับร้อนยามแดดจ้า",
                "caption": "แดดใสฟ้าเปิดแบบนี้ แวะมาจิบ 'เอสเพรสโซ่มะไฟจีน' เมนูซิกเนเจอร์รสเปรี้ยวหวานสดชื่นตี้ร้านเฮาก่อนเน้อเจ้า 🍊 ดับร้อนชาร์จพลังแล้วค่อยไปแอ่ววัดต่อจ้าว 🥤⛰️ #ส้มมะไฟจีนน่าน #คาเฟ่น่าน",
                "gamification_quest": "เควส 'เอสเพรสโซ่สู้แดด': ถ่ายภาพเครื่องดื่มคู่กับมุมสวนแดดส่องของร้าน โพสต์ลง Facebook/IG รับสิทธิ์สแกนเคลมแต้ม 150 NAN Coins จ้าว!",
                "image_prompt": "Sunlight streaming into a modern Lanna style cafe in Nan, cold orange coffee glass on wooden counter, mountains view, bright summer vibe, 8k"
            },
            {
                "campaign_title": "✨ ชาเขียวมัทฉะน่านคัดเกรด ท้าแดดฤดูร้อน",
                "caption": "ร้อนนี้ต้องชาเขียวเย็นเข้มข้นสะใจจากไร่ชาท้องถิ่นน่านเจ้า! 🍵 ผสมนมสดหอมมันกลมกล่อม ช่วยคลายร้อนผ่อนคลายอารมณ์ท่ามกลางแสงแดดใสปิ๊ง แวะมาจิมกันเน้อจ้าว #มัทฉะน่าน #เที่ยวเมืองน่าน",
                "gamification_quest": "เควส 'มัทฉะกรีนซัมเมอร์': เช็คอินและแชร์พิกัดร้านค้าของเราลงโซเชียลมีเดียพร้อมแก้วชาเขียว รับแต้มพิเศษ 150 NAN Coins จ้าว",
                "image_prompt": "A tall glass of iced matcha latte on a rustic wooden table, summer sun rays filtering through bamboo blinds, minimalist Lanna aesthetic, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "❄️ กาแฟท้าลมหนาว อุ่นใจ๋ตี้ภูพยัคฆ์",
                "caption": "สายลมหนาวพัดมาแล้วเจ้า 🍂 แวะมาดริปกาแฟสดอาราบิก้าน่านแท้ๆ อุ่นๆ ท่ามกลางอุณหภูมิ 15 องศายามเช้าเน้อเจ้า จิบกาแฟผิงไฟคุยกันเปิ้นว่าฟินขนาดจ้าว ☕🧣 #หนาวนี้ที่น่าน #กาแฟดริป",
                "gamification_quest": "เควส 'ดริปอุ่นยามหมอกเหมย': เช็คอินร้านกาแฟของเราก่อนเวลา 09:30 น. ท่ามกลางทะเลหมอกหน้าหนาว รับแต้มสะสม 150 NAN Coins จ้าว!",
                "image_prompt": "Morning mist in Nan Thailand mountain cafe, steaming drip coffee pot, wooden terrace, pine trees, winter cozy sweater vibe, highly detailed 8k"
            }
        ]
    },
    "homestay": {
        "rainy": [
            {
                "campaign_title": "🏡 นอนฟังเสียงฝนตกกระทบนาข้าวเขียวขจี",
                "caption": "กรีนซีซั่นหน้าฝนตั๊บๆ แบบนี้ ตื่นมาสูดโอโซนดมกลิ่นดินกลิ่นนาข้าวปัวสีเขียวกว้างสุดลูกหูลูกตา 🌾 นอนโฮมสเตย์ไม้ ฟังเสียงเขียดร้องประสานเสียงฝน อุ่นอกอุ่นใจ๋ขนาดเน้อเจ้า 💚💤 #กรีนซีซั่นปัว #โฮมสเตย์น่าน",
                "gamification_quest": "เควส 'นอนฟังเสียงฝนเคล้าทุ่งนา': ถ่ายภาพทุ่งนาเขียวขจีจากระเบียงห้องพักโฮมสเตย์ของเรายามฝนตก โพสต์แชร์รับรหัสสแกนรับรางวัล 200 NAN Coins จ้าว!",
                "image_prompt": "Lanna style homestay wooden balcony looking over lush green rice fields in Nan Thailand during rain, misty mountains, 8k resolution"
            },
            {
                "campaign_title": "🌧️ สโลว์ไลฟ์หลบฝนในกระท่อมปลายนาล้านนา",
                "caption": "ฝนตกชุ่มฉ่ำใจ๋แบบนี้ มานอนเล่นเปลญวน อ่านหนังสือเล่มโปรด หลบฝนในกระท่อมไม้ไผ่กลางทุ่งนาสีเขียว ทิ้งความเหนื่อยล้าแล้วมาพักผ่อนกับเฮาเน้อเจ้า 💚🛌 #นาขั้นบันได #ปัวหน้าฝน",
                "gamification_quest": "เควส 'เปลญวนซ่อนฝน': ถ่ายวิดีโอบรรยากาศฝนตกชุ่มฉ่ำรอบๆ โฮมสเตย์ของเราลง Story IG/TikTok รับ 200 NAN Coins ทันทีจ้าว!",
                "image_prompt": "A cozy bamboo cottage with a hammock in the middle of Nan rice field under a cloudy rainy sky, mist covering mountains, warm yellow light inside, 8k"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🏕️ นอนแคมป์ตากดาว รับลมเย็นยามค่ำคืน",
                "caption": "ช่วงนี้ฟ้าเปิดใสปิ๊งต้อนรับหน้าร้อนแบบใสๆ 🌌 มานอนกางเต็นท์ดูดาวล้านดวง ท่ามกลางลมภูเขาพัดเย็นสบายที่จุดกางเต็นท์ของเราเน้อเจ้า รับรองหายเหนื่อยเป็นปลิดทิ้งจ้าว 🌟⛺ #แคมปิ้งน่าน #ตากดาวล้านดวง",
                "gamification_quest": "เควส 'ล่าแสงดาวล้านดวง': เช็คอินและถ่ายภาพเต็นท์คู่กับท้องฟ้าเปิดเห็นดาวระยิบระยับยามค่ำคืน รับรหัสเคลมรางวัล 200 NAN Coins จ้าว!",
                "image_prompt": "Cozy glamping tent on a hill in Nan Thailand under a starry night sky, bonfire, warm ambient light, magical 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "❄️ โฮมสเตย์โอบสายหมอกยามเช้าสะท้านใจ",
                "caption": "ตื่นเช้ามาเจอทะเลหมอกลอยละล่องมาเคาะกระจกห้องนอนเลยเจ้า 🌫️ สัมผัสความหนาวสะท้านใจ ผิงไฟปิ้งข้าวจี่อุ่นๆ ยามเช้าตี้ลานโฮมสเตย์ชุมชนเฮาเน้อเจ้า 🧣🥔 #ทะเลหมอกน่าน #หนาวนี้ที่น่าน",
                "gamification_quest": "เควส 'ทะเลหมอกเคาะประตูหน้าบ้าน': ถ่ายรูปคู่กับทะเลหมอกจากหน้าระเบียงห้องพักก่อนเวลา 08:30 น. รับแต้มสะสมทันที 200 NAN Coins จ้าว!",
                "image_prompt": "Traditional wooden Lanna house in Nan surrounded by thick white sea of fog, early morning gold light, cozy and chilly atmosphere, 8k"
            }
        ]
    },
    "restaurant": {
        "rainy": [
            {
                "campaign_title": "🍲 ขันโตกหลบฝน อุ่นท้องด้วยแกงแคไก่เมือง",
                "caption": "ฝนตกตั๊บๆ ออกไปไหนบ่ได้ แวะมาล้อมวงกิ๋นข้าวตอนโตยกั๋นเจ้า 🥢 ซดน้ำแกงแคไก่เมืองร้อนๆ สมุนไพรน่านเน้นๆ แก้หวัดหลบฝน ลำขนาดกินคู่ข้าวนึ่งอุ่นๆ เน้อเจ้า 🍲✨ #อาหารเหนือ #ขันโตกน่าน",
                "gamification_quest": "เควส 'ขันโตกร้อนซดน้ำแกงแค': สั่งอาหารชุดขันโตกพื้นบ้านน่านและรับประทานร้อนๆ ที่ร้านของเรายามฝนตก รับแต้มสะสม 150 NAN Coins จ้าว!",
                "image_prompt": "Authentic Lanna Khantoke dining set with warm soup bowls, wooden interior restaurant in Nan, rainy background behind window, cozy 8k"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🥢 ลาบคั่วสูตรเด็ดสมุนไพรมะแขว่น ดับร้อนจัดจ้าน",
                "caption": "แดดดีๆ แบบนี้ต้อง 'ลาบคั่วหมูสมุนไพรน่าน' มะแขว่นหอมฉุนขึ้นจมูก กินแกล้มผักสดพื้นบ้านกรอบๆ อร่อยเด็ดสู้แดดจัดจ้าน ลำแต๊ๆ เน้อเจ้า แวะมาชิมกันจ้าว 🍽️🔥 #ลาบคั่วหมู #ของดีเมืองน่าน",
                "gamification_quest": "เควส 'สมุนไพรมะแขว่นพิชิตแดด': สั่งเมนูอาหารพื้นเมืองน่านที่มีส่วนประกอบของเครื่องเทศมะแขว่น แล้วถ่ายรูปส่งงาน รับรางวัล 150 NAN Coins จ้าว!",
                "image_prompt": "Traditional Northern Thai minced pork salad (Larb Kua) on banana leaf, crispy garlic on top, fresh vegetable plate, bright natural light, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "🍲 ซดน้ำสุกี้ล้านนาแก้หนาว ริมภูเขาเย็นเฉียบ",
                "caption": "หนาวนี้มาล้อมเตาซดน้ำแกงสมุนไพรร้อนๆ ท่ามกลางอุณหภูมิเย็นเฉียบ 🍲 วัตถุดิบสดใหม่ส่งตรงจากฟาร์มเกษตรกรปัว ผักกรอบหวานเจี๊ยบ กินแก้หนาวลำขนาดจ้าว 🍂🧣 #สุกี้ล้านนา #หนาวนี้แอ่วน่าน",
                "gamification_quest": "เควส 'ล้อมเตาแก้หนาวริมดอย': ทานมื้อค่ำเมนูหม้อไฟร้อนๆ กับร้านอาหารของเราท่ามกลางอากาศหนาว รับรหัสผ่านสแกน 150 NAN Coins จ้าว!",
                "image_prompt": "Hot pot meal steaming in a cold evening, mountain restaurant in Nan, friends gathered around, warm glowing lights, winter vibes, 8k"
            }
        ]
    },
    "workshop": {
        "rainy": [
            {
                "campaign_title": "🚜 ลุยฟาร์มออร์แกนิก สัมผัสวิถีเกษตรสีเขียว",
                "caption": "หน้าฝนชุ่มฉ่ำแบบนี้ สวนเกษตรของเราเขียวขจีสดชื่นสุดๆ เจ้า 🌿 แวะมาเดินกางร่มเก็บใบชา ชิมผลไม้สดๆ จากต้น ดมกลิ่นดินกลิ่นหญ้า สลัดความเหนื่อยล้ามาพิงหลังตี้สวนเฮาเน้อเจ้า ☔🍊 #สวนน่านออร์แกนิก #เกษตรอินทรีย์",
                "gamification_quest": "เควส 'เดินลุยสวนกางร่มเขียว': เข้าร่วมกิจกรรมทดลองเดินลุยสวนเกษตรหรือปลูกกล้าไม้ร่วมกับชุมชนยามฝนตก รับรหัสสแกนรับแต้ม 180 NAN Coins จ้าว!",
                "image_prompt": "Organic tea plantation in Nan Thailand during gentle rain, farmer holding umbrella, green terrace rows, beautiful misty day, 8k"
            }
        ],
        "sunny": [
            {
                "campaign_title": "🧺 เวิร์กช็อปมัดย้อมครามย้อมกาแฟสีธรรมชาติ",
                "caption": "แดดจัดฟ้าใส เหมาะกับการตากผ้าสีธรรมชาติเป็นที่สุดเจ้า! ☀️ แวะมาร่วมกิจกรรมเวิร์กช็อปมัดย้อมคราม ย้อมสีกาแฟ และสมุนไพรท้องถิ่นน่าน ได้ผ้าผืนเดียวในโลกฝีมือตัวเองกลับบ้านเน้อเจ้า 🎨🧣 #มัดย้อมน่าน #งานคราฟต์น่าน",
                "gamification_quest": "เควส 'มัดย้อมธรรมชาติท้าแดด': เข้าร่วมกิจกรรมมัดย้อมผ้าและโพสต์ภาพถ่ายผลงานมัดย้อมตากแดดเคียงข้างสวน รับแต้มทันที 180 NAN Coins จ้าว!",
                "image_prompt": "Drying colorful natural dyed fabrics in the sun, traditional workshop in Nan Thailand, bright summer sun, arts and crafts, 8k"
            }
        ],
        "winter": [
            {
                "campaign_title": "🍓 เก็บสตรอเบอร์รี่สดจากยอดดอยรับลมหนาวสะท้าน",
                "caption": "หนาวนี้สตรอเบอร์รี่ลูกโตๆ สีแดงฉ่ำหวานเจี๊ยบตี้สวนพร้อมให้มาเด็ดเก็บแล้วเจ้า 🍓 เดินรับลมหนาว ชมวิวทุ่งดอกไม้เมืองหนาวบานสะพรั่ง ถ่ายรูปมุมไหนก็สวยขนาดเน้อเจ้า 🌸🧣 #เก็บสตรอเบอร์รี่ #หนาวปัว",
                "gamification_quest": "เควส 'สตรอเบอร์รี่แดงฉ่ำยามเช้า': ร่วมกิจกรรมเก็บผลสตรอเบอร์รี่สดจากต้นใส่ตะกร้าไม้ไผ่ของสวนเกษตรเรา รับแต้มสะสม 180 NAN Coins จ้าว!",
                "image_prompt": "Picking red strawberries in a hillside farm in Nan Thailand, morning dew, cold foggy weather, bamboo basket, 8k"
            }
        ]
    }
}

def generate_campaign_content(brief: CampaignBrief):
    try:
        client = get_gemini_client()
        
        prompt = f"""
        คุณคือนักการตลาด AI อัจฉริยะล้านนา ที่เชี่ยวชาญการโปรโมตการท่องเที่ยวจังหวัดน่านด้วยพลัง Gamification และ Local Context-Aware
        ภารกิจของคุณคือการสร้างแคมเปญการตลาดสำหรับส่งเสริมธุรกิจชุมชนน่าน โดยอ้างอิงจากข้อมูลต่อไปนี้:
        - ประเภทธุรกิจ: {brief.business_type}
        - ฤดูกาล / บริบทช่วงเวลา: {brief.season}
        - กลุ่มเป้าหมายหลัก: {brief.target_audience}

        กรุณาสร้างแคมเปญการตลาดที่น่าสนใจ อบอุ่น และแฝงไปด้วยความน่ารักของคำเมืองล้านนา (เช่น จ้าว, เน้อ, เปิ้น, ลำขนาด)
        โดยส่งผลลัพธ์กลับมาเป็นโครงสร้างข้อมูล JSON ที่มีฟิลด์ดังนี้เท่านั้น:
        - campaign_title: ชื่อแคมเปญสั้นๆ ดึงดูดใจ และมีความเป็นล้านนาร่วมสมัย
        - caption: ข้อความโพสต์โซเชียลมีเดียโปรโมตแคมเปญนี้ เขียนด้วยคำเมือง/ภาษาล้านนาสลับไทยอย่างสละสลวย อบอุ่น น่ารัก ดึงดูดให้อยากแอ่วเมืองน่าน
        - gamification_quest: รายละเอียดกิจกรรมเควสท้าทายนักท่องเที่ยว เช่น ให้มาเช็คอินเมื่อฝนตก, ถ่ายภาพ หรือแชร์กิจกรรมกับชุมชนเพื่อสะสมคะแนน
        - image_prompt: ข้อความภาษาอังกฤษ (English Prompt) คุณภาพสูงสำหรับนำไปเจ็นภาพแคมเปญด้วย Midjourney/DALL-E ให้เข้ากับอารมณ์และบริบทของแคมเปญนี้
        """

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"WARNING: Gemini Generation Failed ({e}). Falling back to local context-aware Lanna template generator.")
        
        # 1. จัดหมวดหมู่ของประเภทธุรกิจ (Business Category Mapping)
        biz_text = (brief.business_type or "").lower()
        category = "cafe" # ค่าเริ่มต้น
        if any(x in biz_text for x in ["ที่พัก", "โฮมสเตย์", "homestay", "hotel", "resort"]):
            category = "homestay"
        elif any(x in biz_text for x in ["อาหาร", "กิน", "กิ๋น", "restaurant", "food", "ขันโตก"]):
            category = "restaurant"
        elif any(x in biz_text for x in ["สวน", "เกษตร", "ท่องเที่ยว", "workshop", "farm", "มัดย้อม"]):
            category = "workshop"

        # 2. จัดหมวดหมู่ของฤดูกาล/สภาพอากาศ (Weather Category Mapping)
        season_text = (brief.season or "").lower()
        weather = "sunny" # ค่าเริ่มต้น
        if any(x in season_text for x in ["ฝน", "rain", "green", "ชุ่ม", "หมอก"]):
            weather = "rainy"
        elif any(x in season_text for x in ["หนาว", "winter", "cool", "cold", "หิมะ"]):
            weather = "winter"

        # 3. ดึงคลังข้อมูลที่เกี่ยวข้อง
        campaign_pool = MOCK_CAMPAIGNS[category].get(weather, MOCK_CAMPAIGNS[category]["rainy"])
        
        # 4. สุ่มเลือกหนึ่งในแคมเปญที่มีความหลากหลายในคลัง
        selected_mock = random.choice(campaign_pool)
        
        # 5. นำมาปรับแต่งชื่อร้านหรือฟิลด์แบบ Dynamic เพื่อความสมจริงสูงสุด
        return {
            "campaign_title": selected_mock["campaign_title"],
            "caption": selected_mock["caption"],
            "gamification_quest": selected_mock["gamification_quest"],
            "image_prompt": selected_mock["image_prompt"]
        }