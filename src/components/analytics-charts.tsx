"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const biasEvolutionData = [
  { category: "Confirmation Bias", value: 8, fill: "var(--color-chart-1)" },
  { category: "Anchoring Bias", value: 5, fill: "var(--color-chart-1)" },
  { category: "Availability Heuristic", value: 3, fill: "var(--color-chart-1)" },
  { category: "Bandwagon Effect", value: 6, fill: "var(--color-chart-1)" },
  { category: "Dunning-Kruger Effect", value: 2, fill: "var(--color-chart-1)" },
]

const chartConfig = {
  value: {
    label: "Score",
  },
}

export function BiasEvolutionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bias Evolution</CardTitle>
        <CardDescription>Your most common logical fallacies and biases in debates.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={biasEvolutionData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const viewShiftData = [
  { month: "January", shift: 4.5 },
  { month: "February", shift: 4.2 },
  { month: "March", shift: 5.1 },
  { month: "April", shift: 6.2 },
  { month: "May", shift: 5.5 },
  { month: "June", shift: 6.8 },
]

const viewShiftChartConfig = {
    shift: {
      label: "Perspective Shift %",
      color: "hsl(var(--chart-2))",
    },
}

export function ViewShiftChart() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>View Shifts Over Time</CardTitle>
          <CardDescription>Monthly average change in perspective after debates.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={viewShiftChartConfig} className="h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={viewShiftData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Line
                dataKey="shift"
                type="monotone"
                stroke="var(--color-shift)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-shift)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
}
