
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { departments, years, events, teamEvents, EventName, eventTimes, REGISTRATION_FEE } from "@/lib/types";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, QrCode, FileUp, CheckCircle, PartyPopper, FileWarning, Send, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  rollNumber: z.string().min(3, { message: "Please enter a valid roll number." }),
  department: z.enum(departments, { required_error: "Please select a department." }),
  year: z.enum(years, { required_error: "Please select your year." }),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number." }),
  event1: z.enum(events, { required_error: "Please select an event." }),
  addEvent2: z.boolean().default(false).optional(),
  event2: z.enum(events).optional(),
  teamMember2: z.string().optional(),
}).refine(data => {
    if (data.addEvent2) {
        if (!data.event2) return false;
        if (data.event1 === data.event2) return false;
        const time1 = eventTimes[data.event1];
        const time2 = eventTimes[data.event2];
        if (time1 && time2 && time1.split('-')[0] === time2.split('-')[0]) return false;
    }
    return true;
}, {
    message: "You cannot select the same event, or two events at the same time slot.",
    path: ["event2"],
});

type SubmissionStatus = 'idle' | 'uploading' | 'upload-success' | 'saving' | 'success' | 'error';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export default function RegistrationFlow() {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      mobileNumber: "",
      teamMember2: "",
      addEvent2: false,
    },
  });

  const { watch, setValue } = form;
  const selectedEvent1 = watch("event1");
  const addEvent2 = watch("addEvent2");
  const selectedDepartment = watch("department");
  const showTeamMemberField = teamEvents.includes(selectedEvent1 as EventName);
  
  useEffect(() => {
    if (selectedDepartment === "B.Sc. Maths") {
      setValue("year", "3rd Year");
    }
  }, [selectedDepartment, setValue]);

  const availableYears = selectedDepartment === "B.Sc. Maths" ? ["3rd Year"] as const : years;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        setSelectedFile(null);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
        setFileError("Please select a screenshot file first.");
        return;
    }

    const rollNumber = form.getValues('rollNumber');
    const name = form.getValues('name');
    if (!rollNumber || !name) {
        toast({
            title: "Details Missing",
            description: "Please fill in your Name and Roll Number before uploading.",
            variant: "destructive"
        });
        // Briefly highlight the fields
        form.trigger(['name', 'rollNumber']);
        return;
    }


    setSubmissionStatus('uploading');
    setFileError(null);
    const rollNumberUpper = rollNumber.toUpperCase();

    // Check for existing roll number
    const q = query(collection(db, "registrations_2k25"), where("rollNumber", "==", rollNumberUpper));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({
          title: "Registration Failed",
          description: "This roll number has already been registered.",
          variant: "destructive",
        });
        setSubmissionStatus('idle');
        return;
      }
    } catch (error) {
       console.error("Error checking for existing roll number: ", error);
       toast({ title: "Verification Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
       setSubmissionStatus('error');
       return;
    }

    const fileExtension = selectedFile.name.split('.').pop();
    const storageRef = ref(storage, `payment_screenshots/${rollNumberUpper}_${Date.now()}.${fileExtension}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
        (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => {
            console.error("Upload failed:", error);
            toast({ title: "Upload Failed", description: "Could not upload your screenshot.", variant: "destructive" });
            setSubmissionStatus('error');
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setScreenshotUrl(downloadURL);
            setSubmissionStatus('upload-success');
            toast({
                title: "Upload Successful",
                description: "Your screenshot has been uploaded. Please complete the form below.",
            });
        }
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (submissionStatus !== 'upload-success' || !screenshotUrl) {
        toast({
            title: "Upload Required",
            description: "Please upload your payment screenshot before submitting.",
            variant: "destructive"
        });
        return;
    }
    setSubmissionStatus('saving');
    
    try {
        const rollNumberUpper = values.rollNumber.toUpperCase();
        const registrationData = {
            ...values,
            rollNumber: rollNumberUpper,
            paymentScreenshotUrl: screenshotUrl,
            feePaid: false, // All online payments need verification
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "registrations_2k25"), registrationData);
        setSubmissionStatus('success');
        
    } catch (error) {
        console.error("Error saving registration: ", error);
        toast({ title: "Submission Failed", description: "Could not save your registration.", variant: "destructive" });
        setSubmissionStatus('error');
    }
  }

  const handleReset = () => {
    form.reset();
    setSubmissionStatus('idle');
    setSelectedFile(null);
    setFileError(null);
    setUploadProgress(0);
    setScreenshotUrl(null);
  }

  if (submissionStatus === 'success') {
    return (
        <Card className="w-full flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse" />
            <h2 className="font-headline text-4xl font-bold text-primary mt-6">Registration Submitted!</h2>
            <CardDescription className="mt-2 text-lg max-w-sm mx-auto">
                Thank you! Your registration and payment proof have been submitted for verification. We look forward to seeing you!
            </CardDescription>
            <Button onClick={handleReset} className="mt-8">
              <PartyPopper className="mr-2 h-4 w-4"/>
              Register Another Participant
            </Button>
          </div>
        </Card>
    )
  }

  const isFormDisabled = submissionStatus !== 'upload-success';
  const isUploadInProgress = submissionStatus === 'uploading';

  return (
    <section id="register">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Register for MUC TECHNO-2K25</CardTitle>
                <CardDescription>Follow the steps below to complete your registration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* PRE-UPLOAD FORM: Name and Roll Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-lg bg-muted/20">
                     <FormField name="name" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Enter your full name" 
                                    {...field} 
                                    disabled={submissionStatus !== 'idle'} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField name="rollNumber" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Roll Number</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Enter your roll number" 
                                    {...field} 
                                    disabled={submissionStatus !== 'idle'} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                {/* STEP 1: PAYMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border rounded-lg">
                    <div className="space-y-4">
                        <h3 className="font-headline text-xl font-bold flex items-center gap-2"><QrCode /> Step 1: Scan & Pay</h3>
                        <p className="text-muted-foreground">Scan the QR code with any UPI app to pay the registration fee of <span className="font-bold text-foreground">₹{REGISTRATION_FEE}</span>.</p>
                        <Image 
                            src="/docs/payment-qr.jpg" 
                            alt="Payment QR Code"
                            width={250}
                            height={250}
                            className="rounded-lg border-4 border-primary shadow-lg mx-auto"
                        />
                    </div>
                     {/* STEP 2: UPLOAD */}
                    <div className="space-y-4">
                        <h3 className="font-headline text-xl font-bold flex items-center gap-2"><FileUp /> Step 2: Upload Proof</h3>
                         <p className="text-muted-foreground">After payment, take a screenshot and upload it here. Your name and roll number are required before uploading.</p>
                        
                        <div className="space-y-2">
                             <Input 
                                type="file" 
                                accept={ALLOWED_FILE_TYPES.join(',')}
                                disabled={isUploadInProgress || submissionStatus === 'upload-success'}
                                onChange={handleFileChange}
                                className="file:text-foreground"
                            />
                            {fileError && <p className="text-sm font-medium text-destructive flex items-center gap-2 mt-2"><FileWarning className="h-4 w-4" /> {fileError}</p>}
                        </div>

                        {selectedFile && submissionStatus !== 'uploading' && submissionStatus !== 'upload-success' && (
                             <Button onClick={handleUpload} className="w-full">
                                <UploadCloud className="mr-2" />
                                Upload Screenshot to Continue
                            </Button>
                        )}
                        
                        {isUploadInProgress && (
                            <div className="space-y-2 pt-2">
                                <Progress value={uploadProgress} />
                                <p className="text-sm font-semibold text-primary animate-pulse text-center">
                                    Uploading screenshot... {Math.round(uploadProgress)}%
                                </p>
                            </div>
                        )}
                        
                        {submissionStatus === 'upload-success' && (
                            <div className="flex items-center gap-3 p-3 rounded-md bg-green-50 border border-green-200 text-green-700">
                                <CheckCircle className="h-6 w-6" />
                                <div className="flex flex-col">
                                    <span className="font-bold">Upload Complete!</span>
                                    <span className="text-sm">You can now fill out the rest of the form.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* STEP 3: REGISTRATION FORM */}
                <div className={`transition-opacity duration-500 ${isFormDisabled && 'opacity-50 pointer-events-none'}`}>
                     <h3 className="font-headline text-xl font-bold flex items-center gap-2 mb-4"><Send /> Step 3: Complete Your Registration</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <fieldset disabled={isFormDisabled || submissionStatus === 'saving'} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField name="department" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Department</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your department" /></SelectTrigger></FormControl><SelectContent>{departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="year" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Year</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={selectedDepartment === "B.Sc. Maths"}><FormControl><SelectTrigger><SelectValue placeholder="Select your year" /></SelectTrigger></FormControl><SelectContent>{availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="mobileNumber" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input type="tel" placeholder="Enter your 10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="event1" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Event 1</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger></FormControl><SelectContent>{events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                    )}/>
                                    {showTeamMemberField && (
                                        <FormField name="teamMember2" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Team Member Name (Optional)</FormLabel><FormControl><Input placeholder="Enter team member's name" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    )}
                                    <FormField name="addEvent2" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 md:col-span-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl><div className="space-y-1 leading-none"><FormLabel>Register for a second event?</FormLabel></div></FormItem>
                                    )}/>
                                    {addEvent2 && (
                                        <FormField name="event2" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Event 2</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a second event" /></SelectTrigger></FormControl><SelectContent>{events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )}/>
                                    )}
                                </div>
                            </fieldset>
                            {submissionStatus === 'saving' && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-primary animate-pulse text-center">
                                        Finalizing registration...
                                    </p>
                                </div>
                            )}

                            <Button type="submit" disabled={isFormDisabled || submissionStatus === 'saving'} className="w-full md:w-auto">
                                {submissionStatus === 'saving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {submissionStatus === 'saving' ? "Submitting..." : "Submit Registration"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
    </section>
  );
}

    