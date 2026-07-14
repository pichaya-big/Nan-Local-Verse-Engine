// app/api/campaign/generate/route.ts
import { NextResponse } from 'next/server';

// app/api/campaign/generate/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ลอง Log ดูว่า URL ที่ยิงออกไปถูกต้องไหม
    const targetUrl = `${process.env.FASTAPI_URL}/api/v1/campaign/generate`;
    console.log("Next.js Proxying to:", targetUrl);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // ถ้า FastAPI ตอบกลับมาเป็น Error (เช่น 422, 500)
    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Error:", errorText); // <--- เช็คที่นี่ใน Terminal
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error("Proxy Error:", error); // <--- เช็คที่นี่ใน Terminal
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}