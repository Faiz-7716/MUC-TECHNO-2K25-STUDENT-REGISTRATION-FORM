"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { departments, years, events, teamEvents, EventName, eventTimes } from "@/lib/types";

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
import { Send, CheckCircle, PartyPopper } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
        if (!data.event2) {
            return false;
        }
        if (data.event1 === data.event2) {
            return false;
        }
        const time1 = eventTimes[data.event1];
        const time2 = eventTimes[data.event2];
        if (time1 && time2) {
            const t1 = time1.split('-')[0];
            const t2 = time2.split('-')[0];
            if (t1 === t2) return false;
        }
    }
    return true;
}, {
    message: "You cannot select the same event, or two events at the same time slot.",
    path: ["event2"],
});

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const selectedEvent1 = form.watch("event1");
  const addEvent2 = form.watch("addEvent2");
  const selectedDepartment = form.watch("department");
  
  useEffect(() => {
    if (selectedDepartment === "B.Sc. Maths") {
      form.setValue("year", "3rd Year");
    }
  }, [selectedDepartment, form]);

  const availableYears = selectedDepartment === "B.Sc. Maths" ? ["3rd Year"] as const : years;


  const showTeamMemberField = teamEvents.includes(selectedEvent1 as EventName);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const db = getDb();

    // Check for existing roll number
    const rollNumberUpper = values.rollNumber.toUpperCase();
    const q = query(collection(db, "registrations_2k25"), where("rollNumber", "==", rollNumberUpper));
    
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({
          title: "Registration Failed",
          description: "This roll number has already been registered.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
       console.error("Error checking for existing roll number: ", error);
       toast({
        title: "Registration Failed",
        description: "Something went wrong while verifying your details. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }


    const registrationData: {
        name: string;
        rollNumber: string;
        department: (typeof departments)[number];
        year: (typeof years)[number];
        mobileNumber: string;
        event1: EventName;
        event2?: EventName;
        teamMember2?: string;
        createdAt: any;
        feePaid: boolean;
    } = {
        name: values.name,
        rollNumber: rollNumberUpper,
        department: values.department,
        year: values.year,
        mobileNumber: values.mobileNumber,
        event1: values.event1,
        createdAt: serverTimestamp(),
        feePaid: false,
    };

    if (values.addEvent2 && values.event2) {
        registrationData.event2 = values.event2;
    }

    if (values.teamMember2) {
        registrationData.teamMember2 = values.teamMember2;
    }

    try {
      await addDoc(collection(db, "registrations_2k25"), registrationData);
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRegisterAnother = () => {
    setIsSuccess(false);
  }

  if (isSuccess) {
    return (
      <section id="register">
        <Card className="w-full flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-pulse" />
            <h2 className="font-headline text-4xl font-bold text-primary mt-6">Registration Successful!</h2>
            <CardDescription className="mt-2 text-lg max-w-sm mx-auto">
              Thank you for registering. We've received your details and look forward to seeing you at MUC TECHNO-2K25!
            </CardDescription>
            <Button onClick={handleRegisterAnother} className="mt-8">
              <PartyPopper className="mr-2 h-4 w-4"/>
              Register Another Participant
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section id="register">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="font-headline text-4xl font-bold text-primary">Register Now</CardTitle>
                <CardDescription>Fill out the form below to participate in MUC TECHNO-2K25. You can register for up to two events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rollNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Roll Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your roll number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                            disabled={selectedDepartment === "B.Sc. Maths"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Enter your 10-digit mobile number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="event1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event 1</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an event" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {showTeamMemberField && (
                                <FormField
                                    control={form.control}
                                    name="teamMember2"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Team Member 2 Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter team member's name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                             <FormField
                                control={form.control}
                                name="addEvent2"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Register for a second event?
                                    </FormLabel>
                                    </div>
                                </FormItem>
                                )}
                            />
                            {addEvent2 && (
                                 <FormField
                                    control={form.control}
                                    name="event2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Event 2</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a second event" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {events.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Registering..." : "Submit Registration"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </section>
  );
}
