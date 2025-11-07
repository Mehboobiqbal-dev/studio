'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

// A mock hook to simulate checking user authentication status.
// In a real app, this would use a library like NextAuth.js to check the session.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Simulate checking for a JWT token in localStorage
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, []);
  return { isAuthenticated };
};

interface Guild {
  _id: string; // MongoDB typically uses _id
  name: string;
  description: string;
  members: number;
}

export default function GuildsPage() {
  const { isAuthenticated } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);

  useEffect(() => {
    // This function would fetch data from your API route (e.g., /api/guilds)
    // which in turn queries the MongoDB database.
    const fetchGuilds = async () => {
      // Mock API response
      const mockApiResponse: Guild[] = [
        {
          _id: "60d5ec49f1a7b8b6a8f1b3a5",
          name: "The Philosophy Club",
          description: "A place for deep thinkers and lovers of wisdom.",
          members: 128,
        },
        {
          _id: "60d5ec49f1a7b8b6a8f1b3a6",
          name: "Tech & Ethics",
          description: "Discussing the moral implications of our digital future.",
          members: 74,
        },
      ];
      setGuilds(mockApiResponse);
    };

    fetchGuilds();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Opinion Guilds</CardTitle>
          <CardDescription>
            Find your community and engage in specialized discussions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <Button>Create New Guild</Button>
          ) : (
            <p className="text-muted-foreground">You must be logged in to create a guild.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join a Guild</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {guilds.map((guild) => (
            <Link href={`/guilds/${guild._id}`} key={guild._id} passHref>
              <Card className="hover:bg-accent">
                <CardHeader>
                  <CardTitle>{guild.name}</CardTitle>
                  <CardDescription>{guild.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{guild.members} members</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
