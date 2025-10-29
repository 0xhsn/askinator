import { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { env } = getRequestContext();
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL || "ask@msgs.macdoos.lol";
  const toEmail = env.TO_EMAIL || "mail@macdoos.lol";

  if (!apiKey) {
    return Response.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }

  const body: any = await req.json().catch(() => ({}));
  const subject = body?.subject || "Hello world";
  const html =
    body?.html ||
    "<p>Congrats on sending your <strong>first email</strong>!</p>";
  const to = Array.isArray(body?.to) ? body.to : [body?.to || toEmail];
  const from = body?.from || fromEmail;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await resp.json().catch(async () => ({ text: await resp.text() }));
    if (!resp.ok) {
      return Response.json({ error: data }, { status: resp.status });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}


