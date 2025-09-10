"use client";

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { Registration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, ListChecks, School, CalendarDays } from 'lucide-react';
import { departments, years, events } from '@/lib/types';

interface StatCardsProps {
  registrations: Registration[];
}

const processData = (registrations: Registration[], categories: readonly string[], key: keyof Registration) => {
  const counts = categories.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as { [key: string]: number });

  registrations.forEach(reg => {
    const categoryValue = reg[key] as string;
    if (counts.hasOwnProperty(categoryValue)) {
      counts[categoryValue]++;
    }
  });

  return Object.entries(counts).map(([name, total]) => ({ name, total }));
};

const SimpleBarChart = ({ data, title }: { data: { name: string, total: number }[], title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={{}} className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
                cursor={{ fill: 'hsl(var(--card))' }}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default function StatCards({ registrations }: StatCardsProps) {
  const totalRegistrations = registrations.length;

  const registrationsByEvent = useMemo(() => processData(registrations, events, 'event'), [registrations]);
  const registrationsByDept = useMemo(() => processData(registrations, departments, 'department'), [registrations]);
  const registrationsByYear = useMemo(() => processData(registrations, years, 'year'), [registrations]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRegistrations}</div>
          <p className="text-xs text-muted-foreground">Participants across all events</p>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-3 grid gap-4 md:grid-cols-3">
        <SimpleBarChart data={registrationsByEvent} title="By Event" />
        <SimpleBarChart data={registrationsByDept} title="By Department" />
        <SimpleBarChart data={registrationsByYear} title="By Year" />
      </div>
    </div>
  );
}
