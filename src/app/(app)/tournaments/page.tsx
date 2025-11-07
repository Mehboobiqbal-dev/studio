'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Placeholder for tournament data
const ongoingTournaments = [
  {
    id: "1",
    name: "The Great Debate Championship",
    prize: "$10,000",
    endDate: "2024-12-31",
  },
];

const upcomingTournaments = [
  {
    id: "2",
    name: "The Logic Masters Cup",
    prize: "$5,000",
    startDate: "2025-01-15",
  },
];

export default function TournamentsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Global Tournaments</CardTitle>
          <CardDescription>
            Compete for prizes and prove your mettle.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ongoing Tournaments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {ongoingTournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
                <CardDescription>Prize: {tournament.prize} | Ends: {tournament.endDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/tournaments/${tournament.id}`} passHref>
                  <Button>View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tournaments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {upcomingTournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader>
                <CardTitle>{tournament.name}</CardTitle>
                <CardDescription>Prize: {tournament.prize} | Starts: {tournament.startDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Join Now</Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>View Results</Button>
        </CardContent>
      </Card>
    </div>
  );
}
