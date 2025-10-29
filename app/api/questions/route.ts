import { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { questions } from "@/db/migrations/schema";
import { desc } from "drizzle-orm";

export const runtime = "edge";

type PostBody = {
  questionText?: string;
  askerName?: string;
};

export async function GET(_req: NextRequest) {
  const DB = getRequestContext().env.DB;
  const db = createDB(DB);
  const rows = await db.select().from(questions).orderBy(desc(questions.createdAt));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const { env } = getRequestContext();
  const DB = env.DB;
  const db = createDB(DB);
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body || typeof body.questionText !== "string") {
    return new Response("Invalid body", { status: 400 });
  }
  const inserted = await db
    .insert(questions)
    .values({ questionText: body.questionText, askerName: body.askerName ?? "Anonymous", isAnswered: false })
    .returning();
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.FROM_EMAIL || "ask@msgs.macdoos.lol";
  const toEmail = env.TO_EMAIL || "mail@macdoos.lol";
  if (apiKey) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: "New question on askinator",
          html: `<p><strong>${inserted[0].askerName}</strong> asked:</p><p>${inserted[0].questionText}</p>`
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Resend API error", resp.status, text);
      }
    } catch (err) {
      console.error("Failed to send email via Resend fetch", err);
    }
  } else {
    console.warn("RESEND_API_KEY is not set; skipping email notification");
  }
  return Response.json(inserted[0], { status: 201 });
}

