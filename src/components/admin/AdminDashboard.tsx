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
import useSettings from "@/hooks/use-settings";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

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
  
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const isViewer = accessLevel === 'viewer';
  
  const paymentsToReview = registrations.filter(r => r.paymentScreenshotBase64 && !r.feePaid);

  const handleFeeToggle = async (isFeeEnabled: boolean) => {
    if (isViewer || settingsLoading) return;
    try {
      await updateSettings({ isFeeEnabled });
      toast({
        title: "Setting Updated",
        description: `Registration fee has been ${isFeeEnabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Could not update the fee setting.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            MUC TECHNO-2K25 Live Registrations {isViewer && <span className="font-semibold text-primary">(Read-Only Mode)</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {!isViewer && (
              <div className="flex items-center space-x-2 border rounded-md p-2 bg-background">
                <Label htmlFor="fee-toggle" className="text-sm font-medium">Fee Active</Label>
                <Switch 
                  id="fee-toggle" 
                  checked={settings?.isFeeEnabled}
                  onCheckedChange={handleFeeToggle}
                  disabled={settingsLoading || isViewer}
                  aria-label="Toggle registration fee"
                />
              </div>
            )}
            {!isViewer && <AddRegistration onAdd={addRegistration} />}
             <Button 
              variant={viewMode === 'table' ? 'default' : 'outline'} 
              onClick={() => setViewMode('table')}
              title="View Registrations Table"
              size="icon"
             >
                <List className="h-5 w-5"/>
             </Button>
             <Button 
                variant={viewMode === 'payments' ? 'default' : 'outline'} 
                onClick={() => setViewMode('payments')}
                className="relative"
                title="View Payments Manager"
                size="icon"
                disabled={!settings?.isFeeEnabled}
             >
                <GalleryVerticalEnd className="h-5 w-5" />
                {paymentsToReview.length > 0 && settings?.isFeeEnabled && (
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
                    <StatCards registrations={registrations} isFeeEnabled={settings?.isFeeEnabled ?? true} />
                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                      <LiveEventStats registrations={registrations} className="lg:col-span-1" />
                      {settings?.isFeeEnabled && <FeeCollectionStats registrations={registrations} className="lg:col-span-2"/>}
                    </div>
                    <RegistrationsTable 
                      initialData={registrations}
                      onDelete={deleteRegistration}
                      onDeleteMultiple={deleteMultipleRegistrations}
                      onUpdateFeeStatus={updateFeeStatus}
                      isViewer={isViewer}
                      isFeeEnabled={settings?.isFeeEnabled ?? true}
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
