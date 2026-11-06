interface Env {}

type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };

  const url = new URL(request.url);
  const rawCik = url.searchParams.get("cik") || "";
  if (!/^\d{1,10}$/.test(rawCik)) {
    return new Response(
      JSON.stringify({ error: "A valid 10-digit SEC CIK is required." }),
      { status: 400, headers }
    );
  }
  const cik = rawCik.padStart(10, "0");

  try {
    const response = await fetch(
      `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
      {
        headers: {
          "User-Agent": "MarketMind educational project contact: k.v.s.shashank0904@gmail.com",
          "Accept-Encoding": "gzip, deflate",
        },
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `SEC returned status ${response.status}` }),
        { status: 502, headers }
      );
    }

    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unable to reach SEC data source." }),
      { status: 502, headers }
    );
  }
};
