'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Placeholder for the list of open arenas
const openArenas = [
  {
    id: "1",
    topic: "Is social media a net positive or negative for society?",
    participants: 12,
  },
  {
    id: "2",
    topic: "Should pineapple be on pizza?",
    participants: 25,
  },
  {
    id: "3",
    topic: "Is remote work the future of employment?",
    participants: 8,
  },
];

export default function ArenasPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Multiplayer Arenas</CardTitle>
          <CardDescription>
            Engage in real-time debates with other users or AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button>Create New Arena</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Arenas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {openArenas.map((arena) => (
            <Link href={`/arenas/${arena.id}`} key={arena.id} passHref>
              <Card className="hover:bg-accent">
                <CardHeader>
                  <CardTitle>{arena.topic}</CardTitle>
                  <CardDescription>{arena.participants} participants</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
