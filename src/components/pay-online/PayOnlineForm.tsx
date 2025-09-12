"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDb, getStorage } from "@/lib/firebase";
import { REGISTRATION_FEE, type Registration } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, QrCode, FileUp, CheckCircle, PartyPopper, User, FileWarning, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  rollNumber: z.string().min(3, { message: "Please enter a valid roll number." }),
});

type SubmissionStatus = 'idle' | 'verifying' | 'found' | 'not-found' | 'uploading' | 'saving' | 'success' | 'error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PayOnlineForm() {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [foundRegistration, setFoundRegistration] = useState<Registration | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { rollNumber: "" },
  });

  async function onVerify(values: z.infer<typeof formSchema>) {
    setSubmissionStatus('verifying');
    setFoundRegistration(null);
    const db = getDb();

    const rollNumber = values.rollNumber.trim().toUpperCase();
    const q = query(collection(db, "registrations_2k25"), where("rollNumber", "==", rollNumber));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setSubmissionStatus('not-found');
      } else {
        const doc = querySnapshot.docs[0];
        const registrationData = { id: doc.id, ...doc.data() } as Registration;
        setFoundRegistration(registrationData);
        if (registrationData.feePaid && registrationData.paymentScreenshotUrl) {
          setSubmissionStatus('success'); // Already paid and verified
        } else {
          setSubmissionStatus('found');
        }
      }
    } catch (error) {
      console.error("Error verifying roll number: ", error);
      toast({
        title: "Verification Failed",
        description: "Something went wrong while checking your registration. Please try again.",
        variant: "destructive",
      });
      setSubmissionStatus('error');
    }
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedFile || !foundRegistration) return;

    setSubmissionStatus('uploading');
    const storage = getStorage();
    const db = getDb();

    const uploadPromise = new Promise<string>((resolve, reject) => {
        const fileExtension = selectedFile.name.split('.').pop();
        const storageRef = ref(storage, `payment_screenshots/${foundRegistration.rollNumber}_${Date.now()}.${fileExtension}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ title: "Upload Failed", description: "Could not upload your screenshot. Please try again.", variant: "destructive" });
                setSubmissionStatus('error');
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });

    try {
        const downloadURL = await uploadPromise;
        setSubmissionStatus('saving');
        
        const regDocRef = doc(db, "registrations_2k25", foundRegistration.id);
        await updateDoc(regDocRef, { 
            feePaid: true,
            paymentScreenshotUrl: downloadURL
        });
        
        setSubmissionStatus('success');

    } catch (error) {
        console.error("Error submitting payment: ", error);
        if (submissionStatus !== 'error') { // Avoid double toast
             toast({ title: "Submission Failed", description: "Could not update your payment status. Please try again.", variant: "destructive" });
             setSubmissionStatus('error');
        }
    }
  };


  const handleReset = () => {
    form.reset();
    setSubmissionStatus('idle');
    setFoundRegistration(null);
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
  }

  if (submissionStatus === 'success') {
    return (
        <Card className="w-full flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse" />
            <h2 className="font-headline text-4xl font-bold text-primary mt-6">
                {foundRegistration?.feePaid && foundRegistration?.paymentScreenshotUrl ? 'Payment Already Verified' : 'Payment Submitted!'}
            </h2>
            <CardDescription className="mt-2 text-lg max-w-sm mx-auto">
                {foundRegistration?.feePaid && foundRegistration?.paymentScreenshotUrl ? `Thank you, ${foundRegistration.name}. Your payment for MUC TECHNO-2K25 has already been confirmed.` : 'Your payment proof has been submitted successfully. We will verify it shortly. See you at the event!'}
            </CardDescription>
            <Button onClick={handleReset} className="mt-8">
              <PartyPopper className="mr-2 h-4 w-4"/>
              Check Another Roll Number
            </Button>
          </div>
        </Card>
    )
  }

  return (
    <section id="pay-online">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Pay Online</CardTitle>
                <CardDescription>Verify your registration by entering your college roll number to proceed with online payment.</CardDescription>
            </CardHeader>
            <CardContent>
                {submissionStatus !== 'found' ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onVerify)} className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                <FormField
                                    control={form.control}
                                    name="rollNumber"
                                    render={({ field }) => (
                                        <FormItem className="flex-grow">
                                        <FormLabel>Roll Number</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter your college roll number (e.g. 22UCS01)" 
                                                {...field} 
                                                disabled={submissionStatus === 'verifying'}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={submissionStatus === 'verifying'} className="w-full sm:w-auto">
                                    {submissionStatus === 'verifying' ? <Loader2 className="animate-spin" /> : <Search />}
                                    Verify
                                </Button>
                            </div>
                            {submissionStatus === 'not-found' && (
                                <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md flex items-center gap-2">
                                  <AlertTriangle />
                                  <span>No registration found for this roll number. Please check the number or complete your registration first.</span>
                                </div>
                            )}
                             {submissionStatus === 'error' && (
                                <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md">
                                  An unexpected error occurred. Please try again later.
                                </div>
                            )}
                        </form>
                    </Form>
                ) : (
                    <div className="animate-in fade-in space-y-8">
                        <Card className="bg-green-50 border-green-200">
                           <CardHeader className="flex-row items-center gap-4">
                                <User className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">{foundRegistration?.name}</CardTitle>
                                    <CardDescription className="font-semibold text-primary">{foundRegistration?.rollNumber} - {foundRegistration?.department}</CardDescription>
                                </div>
                           </CardHeader>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-headline text-xl font-bold flex items-center gap-2"><QrCode /> Step 1: Scan & Pay</h3>
                                <p className="text-muted-foreground">Scan the QR code with any UPI app to pay the registration fee of <span className="font-bold text-foreground">₹{REGISTRATION_FEE}</span>.</p>
                                <Image 
                                    src="/docs/payment-qr.jpeg" 
                                    alt="Payment QR Code"
                                    width={250}
                                    height={250}
                                    className="rounded-lg border-4 border-primary shadow-lg mx-auto"
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-headline text-xl font-bold flex items-center gap-2"><FileUp /> Step 2: Upload Proof</h3>
                                 <p className="text-muted-foreground">After payment, take a screenshot and upload it here as proof. Please ensure the transaction ID is visible.</p>
                                <div className="space-y-2">
                                     <Input 
                                        type="file" 
                                        accept="image/*"
                                        disabled={submissionStatus !== 'found'}
                                        onChange={handleFileChange}
                                        className="file:text-foreground"
                                    />
                                    {fileError && <p className="text-sm font-medium text-destructive flex items-center gap-2 mt-2"><FileWarning className="h-4 w-4" /> {fileError}</p>}
                                </div>

                                {selectedFile && submissionStatus === 'found' && (
                                    <div className="border p-3 rounded-md bg-muted/50">
                                        <p className="text-sm font-medium text-muted-foreground">Selected file: <span className="font-bold text-foreground">{selectedFile.name}</span></p>
                                    </div>
                                )}
                                
                                {(submissionStatus === 'uploading' || submissionStatus === 'saving') && (
                                    <div className="space-y-2">
                                        <Progress value={uploadProgress} />
                                        <p className="text-sm font-semibold text-primary animate-pulse text-center">
                                            {submissionStatus === 'uploading' ? `Uploading... ${Math.round(uploadProgress)}%` : 'Finalizing...'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <Button onClick={handlePaymentSubmit} disabled={!selectedFile || submissionStatus !== 'found'}>
                                        Submit Payment Proof
                                    </Button>
                                    <Button variant="ghost" onClick={handleReset} disabled={submissionStatus === 'uploading' || submissionStatus === 'saving'}>Cancel</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </section>
  );
}
