'use client';

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { moderateContent, type ModerateContentOutput } from "@/ai/flows/assist-with-content-moderation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type State = {
  result: ModerateContentOutput | null;
  error: string | null;
};

async function moderateContentAction(prevState: State, formData: FormData): Promise<State> {
  const text = formData.get("text") as string;

  if (!text) {
    return { result: null, error: "Content to moderate is required." };
  }

  try {
    const result = await moderateContent({ text });
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return { result: null, error: "Failed to moderate content. Please try again." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? "Moderating..." : "Moderate Content"}
    </Button>
  );
}

export default function ModerationPage() {
  const initialState: State = { result: null, error: null };
  const [state, formAction] = useFormState(moderateContentAction, initialState);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="space-y-6 md:col-span-1">
        <h2 className="font-headline text-3xl">AI-Assisted Moderation</h2>
        <p className="text-muted-foreground">
          Use the AI moderation tool to flag toxic content. The AI provides a toxicity score and an explanation to assist human reviewers in making the final decision.
        </p>
      </div>

      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Moderation Tool</CardTitle>
            <CardDescription>Enter text below to check for toxicity.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Content to Moderate</Label>
                <Textarea id="text" name="text" placeholder="Paste user-generated content here..." className="min-h-[150px]" />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        {state.error && (
          <Card className="border-destructive">
            <CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader>
            <CardContent><p>{state.error}</p></CardContent>
          </Card>
        )}

        {state.result && (
          <Card>
            <CardHeader>
              <CardTitle>Moderation Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="font-medium">Content Status</span>
                {state.result.isToxic ? (
                  <Badge variant="destructive" className="gap-1.5 pl-1.5">
                    <AlertTriangle className="size-3" /> Flagged as Toxic
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1.5 pl-1.5 text-green-600">
                    <ShieldCheck className="size-3" /> Looks Clear
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Activity /> Toxicity Score</Label>
                <Progress value={state.result.toxicityScore * 100} className="h-3" />
                <p className="text-sm text-right font-mono">{ (state.result.toxicityScore * 100).toFixed(1) }%</p>
              </div>

              <div className="space-y-2">
                <Label>AI Explanation</Label>
                <p className="text-sm text-muted-foreground rounded-md border bg-background p-3">{state.result.explanation}</p>
              </div>

              <div className="text-center">
                 <Button>Acknowledge and Review</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
