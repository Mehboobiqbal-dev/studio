'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Big Data AI Insights</CardTitle>
          <CardDescription>
            Analyze platform-wide trends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button>Explore Trends</Button>
          <Button>Subscribe for Updates</Button>
        </CardContent>
      </Card>
    </div>
  );
}
