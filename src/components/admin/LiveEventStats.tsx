"use client";

import { useMemo } from 'react';
import type { Registration } from '@/lib/types';
import { events } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LiveEventStatsProps {
  registrations: Registration[];
  className?: string;
}

interface EventStat {
    name: string;
    count: number;
}

export default function LiveEventStats({ registrations, className }: LiveEventStatsProps) {
  const eventStats = useMemo(() => {
    const counts = events.reduce((acc, eventName) => {
      acc[eventName] = 0;
      return acc;
    }, {} as Record<string, number>);

    registrations.forEach(reg => {
      if (reg.event1 && events.includes(reg.event1)) {
        counts[reg.event1]++;
      }
      if (reg.event2 && events.includes(reg.event2)) {
        counts[reg.event2]++;
      }
    });

    const totalSlots = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalSlots > 0 ? (count / totalSlots) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [registrations]);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Flame className="text-primary"/>
            Live Event Popularity
        </CardTitle>
        <CardDescription>Real-time registration count for each event.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventStats.map((event, index) => (
            <div key={event.name} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{event.name}</span>
                <span className="text-muted-foreground font-semibold">{event.count}</span>
              </div>
              <Progress value={event.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
