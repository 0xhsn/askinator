import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { desc, eq } from "drizzle-orm";
import { questions } from "@/db/migrations/schema";
import { LucideCornerLeftUp } from "lucide-react";
import { avatars } from "@/lib/avatars";
import { clsx } from "clsx";
import { containsArabic } from "@/lib/text";
export const runtime = "edge";

export default async function Cards() {
  "use server";
  const DB = getRequestContext().env.DB;
  const drizzle = createDB(DB);

  const answeredQuestions = await drizzle
    .select({
      id: questions.id,
      question_text: questions.questionText,
      asker_name: questions.askerName,
      isAnswered: questions.isAnswered,
      answer: questions.answer,
    })
    .from(questions)
    .where(eq(questions.isAnswered, true))
    .orderBy(desc(questions.updatedAt));

  return (
    <>
      <div className="flex flex-col font-sans gap-4 mb-2">
        {answeredQuestions.map(({ id, question_text, asker_name, answer }) => {
          const questionIsArabic = containsArabic(question_text);
          const answerIsArabic = containsArabic(answer);

          return (
            <div key={id} className="flex flex-col gap-1">
            <div className="h-auto gap-2 border rounded-xl py-4 bg-card text-card-foreground">
              <div className="flex flex-row items-center gap-2 mx-6 pb-2">
                <Avatar className="w-[25px] h-[25px]">
                  <AvatarImage
                    src={`${
                      avatars[Math.floor(Math.random() * avatars.length)]
                    }`}
                  />
                  <AvatarFallback>AN</AvatarFallback>
                </Avatar>
                <div className="font-medium text-sm/tight">{asker_name}</div>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">#{id}</span>
              </div>
              <div className="">
                <p
                  className={clsx(
                    "text-sm/snug px-6 break-words whitespace-pre-wrap",
                    questionIsArabic && "font-sky"
                  )}
                  dir={questionIsArabic ? "rtl" : "auto"}
                  lang={questionIsArabic ? "ar" : undefined}
                >
                  {question_text}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-evenly ml-2">
              <LucideCornerLeftUp className="" />
              <div className="bg-accent py-2 rounded-xl grow">
                <div className="max-h-56 overflow-y-auto px-3">
                  <p
                    dir={answerIsArabic ? "rtl" : "auto"}
                    lang={answerIsArabic ? "ar" : undefined}
                    className={clsx(
                      "text-sm/snug px-3 break-words whitespace-pre-wrap",
                      answerIsArabic && "font-sky"
                    )}
                  >
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
}
