
"use client"

import { useMemo, useState } from "react";
import type { Registration } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ZoomIn, Wallet } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";


interface PaymentsManagerProps {
    registrations: Registration[];
    onUpdateFeeStatus: (id: string, feePaid: boolean) => Promise<void>;
    isViewer: boolean;
}

export default function PaymentsManager({ registrations, onUpdateFeeStatus, isViewer }: PaymentsManagerProps) {
    const { toast } = useToast();
    
    const [filter, setFilter] = useState<'pending' | 'approved'>('pending');

    const payments = useMemo(() => {
        return registrations.filter(r => r.paymentScreenshotUrl);
    }, [registrations]);

    const filteredPayments = useMemo(() => {
        if (filter === 'pending') {
            return payments.filter(p => !p.feePaid);
        }
        return payments.filter(p => p.feePaid);
    }, [payments, filter]);
    
    const handleApprove = async (id: string) => {
        try {
            await onUpdateFeeStatus(id, true);
            toast({
                title: "Payment Approved",
                description: "The registration has been marked as paid.",
            });
        } catch (error) {
            toast({
                title: "Approval Failed",
                description: "Could not update the payment status.",
                variant: "destructive",
            });
        }
    };

    const handleReject = async (id: string) => {
         try {
            await onUpdateFeeStatus(id, false);
            toast({
                title: "Payment Rejected",
                description: "The registration has been marked as unpaid.",
                variant: 'destructive'
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update the payment status.",
                variant: "destructive",
            });
        }
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Wallet/> Payments Manager</CardTitle>
                        <CardDescription>Review and approve online payment submissions.</CardDescription>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        <Button 
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                        >
                            Pending ({payments.filter(p => !p.feePaid).length})
                        </Button>
                        <Button
                             variant={filter === 'approved' ? 'default' : 'outline'}
                            onClick={() => setFilter('approved')}
                        >
                            Approved ({payments.filter(p => p.feePaid).length})
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredPayments.length === 0 ? (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No {filter} payments found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredPayments.map(reg => (
                            <Card key={reg.id} className="overflow-hidden">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base truncate">{reg.name}</CardTitle>
                                    <CardDescription>{reg.rollNumber}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 aspect-square relative group">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ZoomIn className="h-10 w-10 text-white"/>
                                            </button>
                                        </DialogTrigger>
                                        <Image 
                                            src={reg.paymentScreenshotUrl!}
                                            alt={`Payment proof for ${reg.name}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <DialogContent className="max-w-3xl">
                                             <DialogHeader>
                                                <DialogTitle>Proof for {reg.name} ({reg.rollNumber})</DialogTitle>
                                            </DialogHeader>
                                            <div className="relative h-[80vh]">
                                                 <Image 
                                                    src={reg.paymentScreenshotUrl!}
                                                    alt={`Payment proof for ${reg.name}`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                                <CardFooter className="p-2 bg-muted/50">
                                    {!isViewer && (
                                        <div className="w-full flex gap-2">
                                            {filter === 'pending' ? (
                                                <>
                                                    <Button size="sm" className="w-full" onClick={() => handleApprove(reg.id)}>
                                                        <Check className="mr-2"/> Approve
                                                    </Button>
                                                </>
                                            ) : (
                                                 <Button size="sm" variant="destructive" className="w-full" onClick={() => handleReject(reg.id)}>
                                                    <X className="mr-2"/> Mark as Unpaid
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
