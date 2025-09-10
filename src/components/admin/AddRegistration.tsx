"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { departments, years, events, teamEvents, EventName, RegistrationData } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
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
import { Plus, Send } from "lucide-react";
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
  feePaid: z.boolean().default(false).optional(),
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

interface AddRegistrationProps {
    onAdd: (data: RegistrationData) => Promise<void>;
}

export default function AddRegistration({ onAdd }: AddRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      mobileNumber: "",
      teamMember2: "",
      addEvent2: false,
      feePaid: false,
    },
  });

  const selectedEvent1 = form.watch("event1");
  const addEvent2 = form.watch("addEvent2");

  const showTeamMemberField = teamEvents.includes(selectedEvent1 as EventName);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const registrationData: RegistrationData = {
        name: values.name,
        rollNumber: values.rollNumber,
        department: values.department,
        year: values.year,
        mobileNumber: values.mobileNumber,
        event1: values.event1,
        feePaid: values.feePaid || false,
    };

    if (values.addEvent2 && values.event2) {
        registrationData.event2 = values.event2;
    }

    if (showTeamMemberField && values.teamMember2) {
        registrationData.teamMember2 = values.teamMember2;
    }

    try {
      await onAdd(registrationData);
      
      toast({
        title: "Registration Added!",
        description: `${values.name} has been successfully registered.`,
        variant: "default",
      });
      form.reset();
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
                <Plus/>
                Add Registration
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Add New Registration</DialogTitle>
                <DialogDescription>
                    Fill out the form below to manually add a new participant.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter full name" {...field} />
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
                                    <Input placeholder="Enter roll number" {...field} />
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
                                                <SelectValue placeholder="Select department" />
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
                                                <SelectValue placeholder="Select year" />
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
                                    <Input type="tel" placeholder="Enter 10-digit mobile" {...field} />
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
                                                <SelectValue placeholder="Select event" />
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
                                    <FormLabel>Team Member Name (Optional)</FormLabel>
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
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
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
                        <FormField
                            control={form.control}
                            name="feePaid"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Has the registration fee been paid?
                                </FormLabel>
                                </div>
                            </FormItem>
                            )}
                        />
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Registering..." : "Submit Registration"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
