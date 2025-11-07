'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome back, [User]!</CardTitle>
          <CardDescription>Here's a snapshot of your activity on the Opinionated Alpha Network.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Opinions Shared: 12</p>
                <p>Debates Won: 5</p>
                <p>Current Rank: Challenger</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You challenged the opinion "Coffee is overrated."</p>
                <p>You joined the "Technology & Ethics" guild.</p>
                <p>You created a new time capsule: "Predictions for 2025."</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Arena</CardTitle>
          <CardDescription>A popular debate happening right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-bold">Is social media a net positive or negative for society?</p>
          <Button className="mt-4">Join the Debate</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start a New Debate</CardTitle>
          <CardDescription>Challenge an opinion and see how it fares in the arena.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Start New Debate</Button>
        </CardContent>
      </Card>
    </div>
  );
}
