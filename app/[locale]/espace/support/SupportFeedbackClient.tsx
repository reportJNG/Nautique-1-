"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitSupportFeedback } from "./actions";
import { Send, MessageSquareText } from "lucide-react";

export function SupportFeedbackClient({
  queueSize,
  translations,
}: {
  queueSize: number;
  translations: {
    title: string;
    subtitle: string;
    subject: string;
    message: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
    sending: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("message", message);

    startTransition(async () => {
      const result = await submitSupportFeedback(formData);
      if (result.error) {
        toast.error(translations.errorTitle, {
          description: result.error,
        });
        return;
      }

      setSubject("");
      setMessage("");
      toast.success(translations.successTitle, {
        description: translations.successDescription.replace("{count}", String(queueSize + 1)),
      });
    });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="rounded-[32px] border border-border/50 bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-950/50"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
          <MessageSquareText className="size-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{translations.title}</h2>
          <p className="text-sm text-muted-foreground">{translations.subtitle}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {translations.subject}
          </span>
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={translations.subjectPlaceholder}
            className="h-11 rounded-2xl"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {translations.message}
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={translations.messagePlaceholder}
            className="min-h-36 w-full rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-300"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" className="h-11 rounded-2xl" disabled={pending}>
          <Send className="size-4" />
          {pending ? translations.sending : translations.submit}
        </Button>
      </div>
    </motion.form>
  );
}
