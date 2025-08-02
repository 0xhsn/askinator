"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  // i dont know how industry standard this workaround is, need to read more into it.
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

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 shrink-0">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          className={`resize-none font-medium border-2 min-h-32 ${
            overLimit ? "border-red-500" : ""
          }`}
          placeholder="Send messages or whatever you like."
          required
          dir="auto"
          name="question-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span
          className={`absolute bottom-2 right-3 text-xs ${
            overLimit
              ? "text-red-500"
              : nearLimit
              ? "text-yellow-500"
              : "text-muted-foreground"
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
      <div className="self-end">
        <Button
          type="submit"
          disabled={cooldown > 0 || overLimit || charCount < 4}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
