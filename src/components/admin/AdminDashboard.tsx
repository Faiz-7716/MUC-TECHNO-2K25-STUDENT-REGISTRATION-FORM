"use client";

import useRegistrations from "@/hooks/use-registrations";
import StatCards from "@/components/admin/StatCards";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import AddRegistration from "@/components/admin/AddRegistration";
import LiveEventStats from "./LiveEventStats";
import FeeCollectionStats from "./FeeCollectionStats";
import type { AccessLevel } from "@/app/admin/page";

interface AdminDashboardProps {
  accessLevel: AccessLevel;
}

export default function AdminDashboard({ accessLevel }: AdminDashboardProps) {
  const { 
    registrations, 
    loading, 
    error, 
    addRegistration, 
    deleteRegistration, 
    deleteMultipleRegistrations,
    updateFeeStatus
  } = useRegistrations();

  const isViewer = accessLevel === 'viewer';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            MUC TECHNO-2K25 Live Registrations {isViewer && <span className="font-semibold text-primary">(Read-Only Mode)</span>}
          </p>
        </div>
        {!isViewer && <AddRegistration onAdd={addRegistration} />}
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
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
              <LiveEventStats registrations={registrations} className="lg:col-span-1" />
              <FeeCollectionStats registrations={registrations} className="lg:col-span-2"/>
            </div>
            <RegistrationsTable 
              initialData={registrations}
              onDelete={deleteRegistration}
              onDeleteMultiple={deleteMultipleRegistrations}
              onUpdateFeeStatus={updateFeeStatus}
              isViewer={isViewer}
            />
          </>
        )}
      </main>
    </div>
  );
}
