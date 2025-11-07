'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimeCapsulesPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Opinion Time Capsules</CardTitle>
          <CardDescription>
            Seal your opinions for future review.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button>Create Capsule</Button>
          <Button>View My Capsules</Button>
        </CardContent>
      </Card>
    </div>
  );
}
