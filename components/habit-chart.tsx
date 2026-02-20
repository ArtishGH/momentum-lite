'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartDataPoint } from '@/lib/types'

type HabitChartProps = {
  data: ChartDataPoint[]
  title?: string
  description?: string
}

/**
 * HabitChart - Area chart showing habit completion rate over time.
 * Uses shadcn/ui chart components with Recharts.
 * Demonstrates: Container query responsive sizing.
 */
export function HabitChart({
  data,
  title = 'Weekly Progress',
  description = 'Your habit completion rate over the past 7 days',
}: HabitChartProps) {
  // Compute actual colors in JS - CSS vars won't work in Recharts
  const primaryColor = '#22c55e'
  const primaryColorLight = '#22c55e40'

  return (
    <Card className="@container">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={{
            rate: {
              label: 'Completion %',
              color: primaryColor,
            },
          }}
          className="h-[180px] @md:h-[220px] @lg:h-[260px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(0 0% 50%)', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(0 0% 50%)', fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={primaryColor}
                strokeWidth={2}
                fill="url(#greenGradient)"
                dot={{ fill: primaryColor, r: 3 }}
                activeDot={{ fill: primaryColor, r: 5, stroke: primaryColorLight, strokeWidth: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
