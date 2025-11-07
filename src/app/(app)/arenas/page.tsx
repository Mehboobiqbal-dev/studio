'use client';

import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { moderateRealTimeDebate, type ModerateRealTimeDebateOutput } from "@/ai/flows/moderate-real-time-debates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, CheckCircle } from "lucide-react";

type State = {
  result: ModerateRealTimeDebateOutput | null;
  error: string | null;
};

async function moderateStatementAction(prevState: State, formData: FormData): Promise<State> {
  const statement = formData.get("statement") as string;
  const context = formData.get("context") as string;

  if (!statement || !context) {
    return { result: null, error: "Statement and context are required." };
  }

  try {
    const result = await moderateRealTimeDebate({ statement, context, rules: "Standard debate rules apply." });
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return { result: null, error: "Failed to moderate statement. Please try again." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? "Analyzing..." : "Analyze Statement"}
    </Button>
  );
}

export default function ArenasPage() {
  const initialState: State = { result: null, error: null };
  const [state, formAction] = useActionState(moderateStatementAction, initialState);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="space-y-6 md:col-span-1">
        <h2 className="font-headline text-3xl">Multiplayer Arenas</h2>
        <p className="text-muted-foreground">
          Engage in real-time debates. Submit a statement to have our AI moderator detect fallacies and score its quality.
        </p>
      </div>
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Debate Moderator</CardTitle>
            <CardDescription>Test a statement against the AI moderator.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="context">Debate Context</Label>
                <Input id="context" name="context" placeholder="e.g., 'The future of artificial intelligence'" defaultValue="The ethics of AI in art" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statement">Your Statement</Label>
                <Textarea id="statement" name="statement" placeholder="e.g., 'AI-generated art isn't real art because it lacks human intention.'" className="min-h-[120px]" />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>

        {state.error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{state.error}</p>
            </CardContent>
          </Card>
        )}

        {state.result && (
          <Card>
            <CardHeader>
              <CardTitle>Moderation Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="font-medium">Fallacy Detected?</span>
                {state.result.isFallacy ? (
                  <Badge variant="destructive" className="gap-1.5 pl-1.5">
                    <AlertTriangle className="size-3" /> Yes
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1.5 pl-1.5 text-green-600">
                    <CheckCircle className="size-3" /> No
                  </Badge>
                )}
              </div>

              {state.result.isFallacy && (
                <div className="space-y-2">
                  <Label>Fallacy Type</Label>
                  <p className="font-semibold">{state.result.fallacyType}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Explanation</Label>
                <p className="text-sm text-muted-foreground">{state.result.explanation}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="font-medium">Statement Score</span>
                <div className="flex items-center gap-2 text-primary">
                  <Scale className="size-5" />
                  <span className="text-2xl font-bold">{state.result.score.toFixed(1)} / 10</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
