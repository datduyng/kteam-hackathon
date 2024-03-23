export const config = {
  runtime: "edge",
}

export default async function handleRequest(req: Request & { nextUrl?: URL }) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const body = await req.json();

  const data = {
    model: 'tts-1',
    input: body.input,
    voice: 'shimmer',
    "response_format": "mp3",
    speed: 1.5
  };
  const response = await fetch(`https://api.openai.com/v1/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });


  const resHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(
      pickHeaders(response.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
    ),
  };

  return new Response(response.body, {
    headers: resHeaders,
    status: response.status
  });
}

const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
  const picked = new Headers();

  // @ts-ignore
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  return picked;
};

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
};