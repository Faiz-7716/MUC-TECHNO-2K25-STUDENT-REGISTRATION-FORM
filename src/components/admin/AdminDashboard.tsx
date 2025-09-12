"use client";

import useRegistrations from "@/hooks/use-registrations";
import StatCards from "@/components/admin/StatCards";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import AddRegistration from "@/components/admin/AddRegistration";
import LiveEventStats from "./LiveEventStats";
import FeeCollectionStats from "./FeeCollectionStats";
import type { AccessLevel } from "@/app/admin/page";
import PaymentsManager from "./PaymentsManager";
import { useState } from "react";
import { Button } from "../ui/button";
import { List, GalleryVerticalEnd } from "lucide-react";

interface AdminDashboardProps {
  accessLevel: AccessLevel;
}

type ViewMode = "table" | "payments";

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
  
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const isViewer = accessLevel === 'viewer';
  
  const paymentsToReview = registrations.filter(r => r.paymentScreenshotUrl && !r.feePaid);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            MUC TECHNO-2K25 Live Registrations {isViewer && <span className="font-semibold text-primary">(Read-Only Mode)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
            {!isViewer && <AddRegistration onAdd={addRegistration} />}
             <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')}
              title="View Registrations Table"
             >
                <List />
             </Button>
             <Button 
                variant={viewMode === 'payments' ? 'default' : 'outline'} 
                onClick={() => setViewMode('payments')}
                className="relative"
                title="View Payments Manager"
             >
                <GalleryVerticalEnd />
                {paymentsToReview.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                    {paymentsToReview.length}
                  </span>
                )}
             </Button>
        </div>
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
            {viewMode === 'table' ? (
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
            ) : (
                <PaymentsManager 
                    registrations={registrations}
                    onUpdateFeeStatus={updateFeeStatus}
                    isViewer={isViewer}
                />
            )}
          </>
        )}
      </main>
    </div>
  );
}
