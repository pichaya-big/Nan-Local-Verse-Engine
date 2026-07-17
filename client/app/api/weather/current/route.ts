export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || 'ปัว';
    
    const targetUrl = `${process.env.FASTAPI_URL}/api/v1/weather/current?district=${encodeURIComponent(district)}`;
    console.log("Next.js Proxying Weather Request to:", targetUrl);

    const response = await fetch(targetUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Weather Error:", errorText);
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error("Proxy Weather Error:", error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
