import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { desc, eq } from "drizzle-orm";
import { questions } from "@/db/migrations/schema";
import { CornerLeftUp } from "lucide-react";
import { cn } from "@/lib/utils";
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
      isAnswered: questions.isAnswered,
      answer: questions.answer,
    })
    .from(questions)
    .where(eq(questions.isAnswered, true))
    .orderBy(desc(questions.updatedAt));

  return (
    <div className="flex flex-col font-sans gap-4 mb-2">
      {answeredQuestions.map(({ id, question_text, answer }) => {
        const questionIsArabic = containsArabic(question_text);
        const answerIsArabic = containsArabic(answer);

        return (
          <div key={id} className="flex flex-col gap-2">
            <Card>
              <CardContent>
                <div className="flex flex-row items-center justify-start mb-2">
                  <Badge 
                    style={{
                      backgroundColor: 'rgb(249 115 22)',
                      color: 'white',
                      borderColor: 'rgb(249 115 22)'
                    }}
                    className="[&]:bg-orange-500 [&]:text-white [&]:border-orange-500 dark:[&]:bg-orange-600 dark:[&]:text-white dark:[&]:border-orange-600"
                  >
                    #{id}
                  </Badge>
                </div>
                <p
                  className={cn(
                    "text-sm break-words whitespace-pre-wrap",
                    questionIsArabic && "font-sky"
                  )}
                  dir={questionIsArabic ? "rtl" : "auto"}
                  lang={questionIsArabic ? "ar" : undefined}
                >
                  {question_text}
                </p>
              </CardContent>
            </Card>
            <div className="flex items-start gap-2 ml-4">
              <CornerLeftUp className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              <Card className="grow bg-muted/50">
                <CardContent>
                  <p
                    dir={answerIsArabic ? "rtl" : "auto"}
                    lang={answerIsArabic ? "ar" : undefined}
                    className={cn(
                      "text-sm break-words whitespace-pre-wrap",
                      answerIsArabic && "font-sky"
                    )}
                  >
                    {answer}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}
