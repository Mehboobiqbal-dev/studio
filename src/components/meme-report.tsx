import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  CheckCircle,
  MessageSquareQuote,
  Scale,
  Quote,
} from 'lucide-react';
import type { GenerateEchoFeedAndBustItOutput } from '@/ai/flows/generate-echo-feed-and-bust-it';

type Report = GenerateEchoFeedAndBustItOutput & { opinion: string };

export function MemeReport({ report }: { report: Report }) {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader className="relative">
          <CardTitle className="font-headline text-3xl">Meme Report</CardTitle>
          <CardDescription>Your opinion, stress-tested.</CardDescription>
          <div className="absolute right-6 top-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Scale className="size-8" />
              <span className="text-4xl font-bold">{report.bubbleScore}/10</span>
            </div>
            <Badge variant="secondary">Bubble Score</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 font-headline text-lg">
              <Quote className="size-5 text-muted-foreground" />
              Original Opinion
            </h3>
            <p className="pt-2 text-base italic text-foreground">
              "{report.opinion}"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-headline text-xl text-primary">
                <MessageSquareQuote />
                Echo Feed
              </h3>
              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                {report.echoFeed.map((echo, index) => (
                  <p key={index} className="text-sm">
                    " {echo} "
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-headline text-xl text-green-600">
                <Bot />
                Bust Feed
              </h3>
              <div className="space-y-3 rounded-lg border bg-background p-4">
                {report.bustFeed.map((bust, index) => (
                  <div key={index}>
                    <p className="text-sm">" {bust} "</p>
                    <div className="flex items-center gap-1 text-xs text-green-700">
                      <CheckCircle className="size-3" />
                      <span>Fact-checked</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 font-headline text-xl">Shareable Summary</h3>
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="italic text-primary-foreground/90">
                {report.memeReport}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
