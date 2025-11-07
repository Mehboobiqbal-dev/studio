'use client';

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitOpinion } from './actions';
import { MemeReport } from '@/components/meme-report';
import { AnimatePresence, motion } from "framer-motion";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? "Busting..." : "Bust my Bubble"}
    </Button>
  );
}

export default function DashboardPage() {
  const [state, formAction] = useActionState(submitOpinion, { error: null });

  // Note: In a real app, the report would be fetched based on the redirect,
  // but for this prototype, we are using the form state to show the report.
  // The redirect logic in actions.ts handles the actual navigation.

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Echo Chamber Simulator</CardTitle>
          <CardDescription>
            Enter an opinion and see how it gets amplified in a digital bubble, then watch as AI personas tear it down.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Textarea
              id="opinion"
              name="opinion"
              placeholder="What's your hot take? e.g., 'Pineapple belongs on pizza.'"
              className="min-h-[100px] text-base"
              maxLength={280}
              required
            />
             <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Max 280 characters.</p>
              <SubmitButton />
            </div>
            {state?.error && <p className="pt-2 text-sm text-destructive">{state.error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
