import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { desc, eq } from "drizzle-orm";
import { questions } from "@/db/migrations/schema";
import { CornerLeftUp } from "lucide-react";
import { avatars } from "@/lib/avatars";
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
      asker_name: questions.askerName,
      isAnswered: questions.isAnswered,
      answer: questions.answer,
    })
    .from(questions)
    .where(eq(questions.isAnswered, true))
    .orderBy(desc(questions.updatedAt));

  return (
    <div className="flex flex-col font-sans gap-4 mb-2">
      {answeredQuestions.map(({ id, question_text, asker_name, answer }) => {
        const questionIsArabic = containsArabic(question_text);
        const answerIsArabic = containsArabic(answer);

        return (
          <div key={id} className="flex flex-col gap-2">
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={`${
                        avatars[Math.floor(Math.random() * avatars.length)]
                      }`}
                    />
                    <AvatarFallback>AN</AvatarFallback>
                  </Avatar>
                  <div className="font-medium text-sm">{asker_name}</div>
                  <Badge 
                    style={{
                      backgroundColor: 'rgb(249 115 22)',
                      color: 'white',
                      borderColor: 'rgb(249 115 22)'
                    }}
                    className="ml-auto [&]:bg-orange-500 [&]:text-white [&]:border-orange-500 dark:[&]:bg-orange-600 dark:[&]:text-white dark:[&]:border-orange-600"
                  >
                    #{id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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
