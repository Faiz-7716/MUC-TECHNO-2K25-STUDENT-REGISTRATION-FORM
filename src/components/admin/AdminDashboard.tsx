"use client";

import useRegistrations from "@/hooks/use-registrations";
import StatCards from "@/components/admin/StatCards";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import AddRegistration from "@/components/admin/AddRegistration";
import LiveEventStats from "./LiveEventStats";

export default function AdminDashboard() {
  const { registrations, loading, error, addRegistration, deleteRegistration, deleteMultipleRegistrations } = useRegistrations();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">MUC TECHNO-2K25 Live Registrations</p>
        </div>
        <AddRegistration onAdd={addRegistration} />
      </header>
      <main className="space-y-8">
        {loading && (
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        )}
        {!loading && error && <p className="text-destructive">Error loading data: {error}</p>}
        {!loading && !error && registrations && (
          <>
            <StatCards registrations={registrations} />
            <LiveEventStats registrations={registrations} />
            <RegistrationsTable 
              initialData={registrations}
              onDelete={deleteRegistration}
              onDeleteMultiple={deleteMultipleRegistrations}
            />
          </>
        )}
      </main>
    </div>
  );
}
