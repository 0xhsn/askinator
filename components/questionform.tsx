"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type Props = {
  submitQuestion: (
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
};

const COOLDOWN_KEY = "question-form-cooldown";
const MAX_LENGTH = 2000;

export default function QuestionForm({ submitQuestion }: Props) {
  const [cooldown, setCooldown] = useState(0);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(COOLDOWN_KEY);
    if (saved) {
      const savedTime = parseInt(saved);
      const now = Date.now();
      const diff = Math.floor((savedTime - now) / 1000);
      if (diff > 0) {
        setCooldown(diff);
      } else {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem(COOLDOWN_KEY);
      return;
    }
    localStorage.setItem(
      COOLDOWN_KEY,
      (Date.now() + cooldown * 1000).toString()
    );

    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleSubmit(formData: FormData) {
    if (cooldown > 0) return;

    const res = await submitQuestion(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Message Sent :-)");
      setCooldown(10);
      setText("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    }
  }

  const charCount = text.trim().length;
  const nearLimit = charCount > MAX_LENGTH * 0.9;
  const overLimit = charCount > MAX_LENGTH;

  const isDark = mounted && theme === 'dark';
  const buttonStyle = {
    backgroundColor: isDark ? 'white' : 'black',
    color: isDark ? 'black' : 'white',
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 shrink-0 w-full">
      <div className="relative w-full">
        <Textarea
          ref={textareaRef}
          className={cn(
            "resize-none font-medium min-h-32 w-full focus-visible:ring-foreground/20 focus-visible:border-foreground",
            overLimit && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
          )}
          placeholder="write smth..."
          required
          dir="auto"
          name="question-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span
          className={cn(
            "absolute bottom-3 right-3 text-xs pointer-events-none select-none mt-2",
            overLimit && "text-destructive font-medium",
            !overLimit && "text-muted-foreground"
          )}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
      <Button
        type="submit"
        disabled={cooldown > 0 || overLimit || charCount < 4}
        style={buttonStyle}
        className="w-fit self-end hover:opacity-90 transition-opacity mt-4"
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "send"}
      </Button>
    </form>
  );
}
