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
  const DB = getRequestContext().env.DB;
  const db = createDB(DB);
  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body || typeof body.questionText !== "string") {
    return new Response("Invalid body", { status: 400 });
  }
  const inserted = await db
    .insert(questions)
    .values({ questionText: body.questionText, askerName: body.askerName ?? "Anonymous", isAnswered: false })
    .returning();
  return Response.json(inserted[0], { status: 201 });
}

