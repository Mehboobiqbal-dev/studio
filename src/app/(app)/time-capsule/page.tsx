'use client'

import React from "react"
import { useFormState, useFormStatus } from "react-dom"
import { generatePredictiveSimulations, type GeneratePredictiveSimulationsOutput } from "@/ai/flows/generate-predictive-simulations-for-time-capsules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/date-picker-form"
import { Rocket } from "lucide-react"

type State = {
  result: GeneratePredictiveSimulationsOutput | null
  error: string | null
}

async function sealOpinionAction(prevState: State, formData: FormData): Promise<State> {
  const opinion = formData.get("opinion") as string;
  const unlockDate = formData.get("unlockDate") as string;

  if (!opinion || !unlockDate) {
    return { result: null, error: "Opinion and unlock date are required." };
  }

  try {
    const result = await generatePredictiveSimulations({ opinion, unlockDate });
    return { result, error: null };
  } catch (e) {
    console.error(e);
    return { result: null, error: "Failed to generate simulation. Please try again." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? "Sealing..." : "Seal in Time Capsule"}
    </Button>
  );
}

export default function TimeCapsulePage() {
  const initialState: State = { result: null, error: null };
  const [state, formAction] = useFormState(sealOpinionAction, initialState);
  const [date, setDate] = React.useState<Date | undefined>(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear;
  });

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div className="space-y-6 md:col-span-1">
        <h2 className="font-headline text-3xl">Opinion Time Capsule</h2>
        <p className="text-muted-foreground">
          Seal your controversial opinions away. The AI will predict how your take will age when it's unlocked in the future. Unlock dates can be set from 1 to 10 years from now.
        </p>
      </div>

      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Time Capsule</CardTitle>
            <CardDescription>What opinion do you want to send to the future?</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opinion">Your Opinion</Label>
                <Textarea id="opinion" name="opinion" placeholder="e.g., 'Self-driving cars will be the standard by 2030.'" className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unlockDate">Unlock Date</Label>
                <DatePicker date={date} setDate={setDate} />
                <input type="hidden" name="unlockDate" value={date ? date.toISOString().split('T')[0] : ''} />
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
              <CardTitle className="flex items-center gap-2"><Rocket className="text-primary"/>Hindsight Report</CardTitle>
              <CardDescription>A predictive simulation of how your opinion might be viewed in the future.</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none rounded-lg bg-muted p-4 text-muted-foreground">
              <p>{state.result.simulation}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
