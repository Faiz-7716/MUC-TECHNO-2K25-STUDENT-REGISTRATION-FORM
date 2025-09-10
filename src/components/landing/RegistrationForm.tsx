"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { departments, years, events, teamEvents, EventName } from "@/lib/types";

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
import { Send, Plus, Trash2 } from "lucide-react";
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
    if (teamEvents.includes(data.event1) && !data.teamMember2) {
      // Optional, but you could enforce team member for team events
      return true; 
    }
    return true;
}, {
    message: "Team member name is required for this event.",
    path: ["teamMember2"],
}).refine(data => {
    if (data.addEvent2 && !data.event2) {
        return false;
    }
    return true;
}, {
    message: "Please select a second event.",
    path: ["event2"],
}).refine(data => {
    if(data.addEvent2 && data.event1 === data.event2) {
        return false;
    }
    return true;
},
{
    message: "You cannot select the same event twice.",
    path: ["event2"],
});

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const showTeamMemberField = teamEvents.includes(selectedEvent1 as EventName);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

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
        rollNumber: values.rollNumber,
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

      let description = `You have successfully registered for ${values.event1}.`;
      if (registrationData.event2) {
        description = `You have successfully registered for ${values.event1} and ${values.event2}.`;
      }
      
      toast({
        title: "Registration Successful!",
        description: description,
        variant: "default",
      });
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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
