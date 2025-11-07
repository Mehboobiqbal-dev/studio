'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Placeholder for arena details
const arenaDetails = {
  id: "1",
  topic: "Is social media a net positive or negative for society?",
};

// Placeholder for debate messages
const messages = [
  {
    id: "1",
    user: "User A",
    argument: "Social media connects people from all over the world.",
    votes: 10,
  },
  {
    id: "2",
    user: "User B",
    argument: "It can also lead to cyberbullying and the spread of misinformation.",
    votes: 5,
  },
];

export default function ArenaPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{arenaDetails.topic}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <CardTitle>{message.user}</CardTitle>
                  <CardDescription>Votes: {message.votes}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{message.argument}</p>
                  <Button className="mt-2">Vote</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join the Debate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input placeholder="Enter your argument" />
            <Button>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
