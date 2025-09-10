"use client";

import useRegistrations from "@/hooks/use-registrations";
import StatCards from "@/components/admin/StatCards";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { registrations, loading, error } = useRegistrations();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">MUC TECHNO-2K25 Live Registrations</p>
      </header>
      <main className="space-y-8">
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        )}
        {!loading && error && <p className="text-destructive">Error loading data: {error}</p>}
        {!loading && !error && registrations && (
          <>
            <StatCards registrations={registrations} />
            <RegistrationsTable initialData={registrations} />
          </>
        )}
      </main>
    </div>
  );
}
