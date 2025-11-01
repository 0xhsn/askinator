import { ModeToggle } from "@/components/theme-toggle";
import Cards from "@/components/cards";
import { generateRandomName } from "@/lib/names";
import QuestionForm from "@/components/questionform";
import z from "zod";
import { headers } from "next/headers";

export const runtime = "edge";

export default function Home() {
  async function submitQuestion(formData: FormData) {
    "use server";

    const rawFormData = formData.get("question-text");

    const zSchema = z
      .string()
      .trim()
      .min(4, { message: "Message has to be longer than 4 characters." })
      .max(2000, { message: "Message has to be less than 2000 characters." });
    const result = await zSchema.safeParseAsync(rawFormData);

    if (!result.success) {
      return { error: result.error.issues[0].message, success: false };
    }

    const askerName = generateRandomName();
    const hdrs = await headers();
    const host = hdrs.get("host") || "";
    const proto = hdrs.get("x-forwarded-proto") || "https";
    const baseUrl = host ? `${proto}://${host}` : "";
    const resp = await fetch(`${baseUrl}/api/questions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionText: result.data, askerName }),
      cache: "no-store",
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { error: text || `Failed to send question (${resp.status})`, success: false };
    }

    return { success: true };
  }
  return (
    <main className="flex flex-col gap-6 mt-16 font-sans w-10/12 mx-auto h-auto max-w-sm md:max-w-lg">
      <div className="flex flex-row items-center justify-between">
        <p className="text-3xl font-bold tracking-tight">ask @macdoos anything</p>
        <ModeToggle />
      </div>
      <QuestionForm submitQuestion={submitQuestion} />
      <Cards />
    </main>
  );
}
