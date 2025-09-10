"use client";

import { useMemo } from 'react';
import type { Registration } from '@/lib/types';
import { REGISTRATION_FEE } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, ResponsiveContainer } from "recharts"


interface FeeCollectionStatsProps {
  registrations: Registration[];
  className?: string;
}

export default function FeeCollectionStats({ registrations, className }: FeeCollectionStatsProps) {
  const feeStats = useMemo(() => {
    const totalRegistrations = registrations.length;
    const paidRegistrations = registrations.filter(reg => reg.feePaid).length;
    const unpaidRegistrations = totalRegistrations - paidRegistrations;

    const totalPotentialRevenue = totalRegistrations * REGISTRATION_FEE;
    const collectedRevenue = paidRegistrations * REGISTRATION_FEE;
    const pendingRevenue = unpaidRegistrations * REGISTRATION_FEE;

    const collectionPercentage = totalPotentialRevenue > 0 ? (collectedRevenue / totalPotentialRevenue) * 100 : 0;

    const chartData = [
        { name: 'Collected', value: collectedRevenue, fill: 'hsl(var(--primary))' },
        { name: 'Pending', value: pendingRevenue, fill: 'hsl(var(--muted))' },
    ];

    return {
      totalRegistrations,
      paidRegistrations,
      unpaidRegistrations,
      totalPotentialRevenue,
      collectedRevenue,
      pendingRevenue,
      collectionPercentage,
      chartData
    };
  }, [registrations]);

  const chartConfig = {
    collected: {
      label: "Collected",
      color: "hsl(var(--chart-1))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--muted))",
    },
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <IndianRupee className="text-primary"/>
            Fee Collection Report
        </CardTitle>
        <CardDescription>
            Live tracking of registration fee payments. Total potential revenue is {feeStats.totalPotentialRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="sm:col-span-1 h-32">
                <ChartContainer config={chartConfig} className="min-h-[128px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                                />
                            <Pie
                                data={feeStats.chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={30}
                                outerRadius={50}
                                strokeWidth={2}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
            <div className="sm:col-span-2 space-y-4">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-lg font-bold text-primary">₹{feeStats.collectedRevenue.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-muted-foreground">Collected ({feeStats.paidRegistrations} students)</span>
                    </div>
                     <Progress value={feeStats.collectionPercentage} className="h-3" />
                </div>

                <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <span className="font-medium text-foreground">Pending:</span>
                    <span>₹{feeStats.pendingRevenue.toLocaleString('en-IN')} ({feeStats.unpaidRegistrations} students)</span>
                    <span className="font-medium text-foreground">Total:</span>
                     <span>₹{feeStats.totalPotentialRevenue.toLocaleString('en-IN')} ({feeStats.totalRegistrations} students)</span>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
