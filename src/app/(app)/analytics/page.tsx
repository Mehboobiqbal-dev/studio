'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Advanced Analytics</CardTitle>
          <CardDescription>
            Track your growth and explore global bias trends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button>Personal Dashboard</Button>
          <Button>Global View</Button>
        </CardContent>
      </Card>
    </div>
  );
}
