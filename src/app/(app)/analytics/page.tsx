import { BiasEvolutionChart, ViewShiftChart } from "@/components/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BrainCircuit, Users } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-headline text-3xl">Personal Dashboard & Analytics</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Tree</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Perspective Shifter</div>
            <p className="text-xs text-muted-foreground">
              Unlocked after 20 debates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              <Badge>Top Debater</Badge>
              <Badge variant="secondary">Bubble Buster</Badge>
              <Badge variant="outline">Time Traveler</Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              +5 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guild</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tech Utopians</div>
            <p className="text-xs text-muted-foreground">
              60% shifted views this month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BiasEvolutionChart />
        <ViewShiftChart />
      </div>
    </div>
  );
}
