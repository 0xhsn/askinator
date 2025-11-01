"use client";

import { useState, useTransition } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Twitter } from "lucide-react";
import { clsx } from "clsx";
import Image from "next/image";
import { containsArabic } from "@/lib/text";

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

  return (
    <div
      className={clsx(
        "bg-card border rounded-xl p-4 space-y-3 hover:shadow transition cursor-pointer font-sans",
        isAnswered
          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
          : "border-gray-300"
      )}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{askerName}</span>
      </div>

      <p
        className={clsx(
          "text-sm whitespace-pre-wrap break-words",
          isQuestionArabic && "font-sky"
        )}
        dir={isQuestionArabic ? "rtl" : "auto"}
        lang={isQuestionArabic ? "ar" : undefined}
      >
        {question}
      </p>

      <div
        className={clsx(
          "transition-all duration-300",
          expanded
            ? "max-h-[32rem] opacity-100 mt-2"
            : "max-h-0 opacity-0 overflow-hidden"
        )}
        onClick={(e) => e.stopPropagation()} //read more on this
      >
        <div className="bg-accent p-3 rounded-md">
          {!isAnswered && (
            <>
              <Textarea
                dir="auto"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="mb-2 resize-none"
                placeholder="Write your reply..."
              />
              <Button onClick={handleSubmit} disabled={pending || isAnswered}>
                {pending ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
          {isAnswered && (
            <div className="flex flex-col gap-2">
              <div className="max-h-56 overflow-y-auto rounded-md border border-border/40 bg-background/60 p-3 pr-4">
                <p
                  className={clsx(
                    "text-sm whitespace-pre-wrap break-words",
                    isAnswerArabic && "font-sky"
                  )}
                  dir={isAnswerArabic ? "rtl" : "auto"}
                  lang={isAnswerArabic ? "ar" : undefined}
                >
                  {answerText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {isAnswered && (
        <div
          className="flex justify-end gap-2 pt-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleCopyAnswer}
            className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-sm text-blue-500 transition-colors hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Copy answer"
          >
            <Copy className="h-4 w-4" />
          </button>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-sm text-blue-500 transition-colors hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Tweet answer"
            onClick={(event) => event.stopPropagation()}
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
