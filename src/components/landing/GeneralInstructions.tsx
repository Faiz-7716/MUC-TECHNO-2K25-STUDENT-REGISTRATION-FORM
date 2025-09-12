import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Award, Trophy, Users, Phone, IndianRupee, HandMetal, FileCheck, XOctagon, School, QrCode } from "lucide-react";

const instructions = [
    {
        icon: IndianRupee,
        text: "Registration Fee is only ₹50 per head.",
    },
    {
        icon: QrCode,
        text: "Payment should be made online via UPI, and a screenshot must be uploaded during registration.",
    },
    {
        icon: Award,
        text: "Participation Certificate for all participants.",
    },
    {
        icon: Trophy,
        text: "Trophies and Merit Certificates for winners.",
    },
    {
        icon: FileCheck,
        text: "Maximum of two events can be selected.",
    },
     {
        icon: Users,
        text: "Refreshment pack will be provided for all.",
    },
    {
        icon: Phone,
        text: "For queries, contact Student Incharge: Mohammed Faiz (8778648054).",
    },
    {
        icon: HandMetal,
        text: "The decision of the evaluators will be final.",
    },
    {
        icon: XOctagon,
        text: "Any participant caught engaging in plagiarism will be disqualified.",
    },
];

export default function GeneralInstructions() {
  return (
    <Card className="mt-12 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
            <Info />
            General Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {instructions.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 mt-1 text-primary shrink-0" />
                    <p className="text-foreground/90">{item.text}</p>
                </div>
            ))}
        </div>
        <p className="mt-6 text-sm text-center font-medium text-muted-foreground">Please fill in your name and roll number correctly as it will be used for your certificates.</p>
      </CardContent>
    </Card>
  );
}
