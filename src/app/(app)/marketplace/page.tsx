'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">NFT Marketplace & VR/AR Hooks</CardTitle>
          <CardDescription>
            Monetize and gamify your achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button>Browse NFTs</Button>
          <Button>Enable VR/AR</Button>
        </CardContent>
      </Card>
    </div>
  );
}
