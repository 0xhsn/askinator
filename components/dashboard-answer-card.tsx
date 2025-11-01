"use client";

import { useState, useTransition, useEffect } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { containsArabic } from "@/lib/text";
import { useTheme } from "next-themes";

type Props = {
  id: number;
  question: string;
  askerName: string;
  answered: boolean;
  answer?: string;
  submitAnswer: (id: number, reply: string) => Promise<void>;
};

export default function DashboardAnswerCard({
  id,
  question,
  askerName,
  answered,
  submitAnswer,
  answer,
}: Props) {
  const [reply, setReply] = useState("");
  const [isAnswered, setIsAnswered] = useState(answered);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const answerText = isAnswered
    ? answer && answer.length > 0
      ? answer
      : reply
    : reply;
  const tweetText = `Q: ${question}\n\nA: ${answerText}`;
  const isQuestionArabic = containsArabic(question);
  const isAnswerArabic = containsArabic(answerText);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  const handleCopyAnswer = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!answerText?.length) {
      toast.error("Nothing to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(answerText);
      toast.success("Answer copied");
    } catch (error) {
      console.error("Failed to copy answer", error);
      toast.error("Failed to copy");
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await submitAnswer(id, reply);
        setIsAnswered(true);
        toast.success("Answer submitted");
      } catch {
        toast.error("Failed to submit");
      }
    });
  };

  const isDark = mounted && theme === 'dark';
  const buttonStyle = {
    backgroundColor: isDark ? 'white' : 'black',
    color: isDark ? 'black' : 'white',
  };

  return (
    <Card
      className={cn(
        "cursor-pointer font-sans transition-all hover:shadow-md",
        isAnswered && "border-muted-foreground/20 bg-muted/30"
      )}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{askerName}</span>
          {isAnswered && (
            <Badge variant="outline" className="ml-auto">
              Answered
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap break-words",
            isQuestionArabic && "font-sky"
          )}
          dir={isQuestionArabic ? "rtl" : "auto"}
          lang={isQuestionArabic ? "ar" : undefined}
        >
          {question}
        </p>

        <div
          className={cn(
            "transition-all duration-300",
            expanded
              ? "max-h-[40rem] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pl-4 border-l-2 border-muted">
            {!isAnswered && (
              <div className="space-y-3">
                <Textarea
                  dir="auto"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="resize-none min-h-32 focus-visible:ring-foreground/20 focus-visible:border-foreground"
                  placeholder="reply..."
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={pending || isAnswered}
                  style={buttonStyle}
                  className="hover:opacity-90 transition-opacity"
                >
                  {pending ? "submitting..." : "submit"}
                </Button>
              </div>
            )}
            {isAnswered && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p
                  className={cn(
                    "text-sm whitespace-pre-wrap break-words",
                    isAnswerArabic && "font-sky"
                  )}
                  dir={isAnswerArabic ? "rtl" : "auto"}
                  lang={isAnswerArabic ? "ar" : undefined}
                >
                  {answerText}
                </p>
              </div>
            )}
          </div>
        </div>

        {isAnswered && (
          <div
            className="flex justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyAnswer}
              aria-label="Copy answer"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              aria-label="Tweet answer"
            >
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
