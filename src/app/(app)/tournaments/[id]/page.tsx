'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder for tournament details
const tournamentDetails = {
  id: "1",
  name: "The Great Debate Championship",
  prize: "$10,000",
  endDate: "2024-12-31",
  description: "An epic tournament to determine the ultimate debater.",
};

// Placeholder for tournament bracket
const bracket = [
  {
    round: 1,
    matches: [
      { id: 1, player1: "User A", player2: "User B", winner: "User A" },
      { id: 2, player1: "User C", player2: "User D", winner: "User D" },
    ],
  },
  {
    round: 2,
    matches: [
      { id: 3, player1: "User A", player2: "User D", winner: null },
    ],
  },
];

export default function TournamentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{tournamentDetails.name}</CardTitle>
          <CardDescription>{tournamentDetails.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Prize: {tournamentDetails.prize}</p>
          <p>End Date: {tournamentDetails.endDate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Bracket</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {bracket.map((round) => (
            <div key={round.round}>
              <h3 className="text-lg font-bold mb-2">Round {round.round}</h3>
              <div className="flex flex-col space-y-2">
                {round.matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="p-4">
                      <p>{match.player1} vs {match.player2}</p>
                      {match.winner && <p>Winner: {match.winner}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
