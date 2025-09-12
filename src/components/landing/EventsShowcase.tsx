
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrainCircuit, Bug, Users, CodeXml, Palette, User, Clock, Group, Server, Presentation, Ban, Globe, MapPin, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

const eventDetails = [
  {
    icon: BrainCircuit,
    title: "Tech Quiz",
    description: "A quiz competition with individual prelims and two-person team finals. This event is open for all departments.",
    venue: "Sir Syed Ahmed Convention Hall",
    time: "10:15 AM - 11:15 AM",
    topics: "Topics: Basics of Computer, Logo name finding, acronyms, and cyber security",
  },
  {
    icon: Bug,
    title: "Bug Blaster",
    description: "A coding challenge focused on debugging existing code, not writing new code.",
    venue: "Allied Lab",
    time: "10:15 AM - 11:15 AM",
    rules: "Key rules: No internet access or personal mobile phones/USB drives are allowed.",
  },
  {
    icon: Users,
    title: "Panel Debate",
    description: "A paper presentation event for teams of up to two, open for all departments. Each team gets 5 minutes to present followed by a 2-minute Q&A.",
    venue: "Sir Syed Ahmed Convention Hall",
    time: "11:15 AM - 12:15 PM",
    topics: "Topics: Cyber Security, Machine Learning, Artificial Intelligence, Ethical Hacking, and Cloud Computing.",
    rules: "Note: AI-generated content is strictly prohibited.",
  },
  {
    icon: CodeXml,
    title: "Web Wizards",
    description: "A web design competition for two-person teams. All necessary assets (logos, banners, brochures, and content) will be provided. Participants have 45 minutes to build a website for the 'MUC TECHNO 2k25' event.",
    venue: "Allied Lab",
    time: "11:15 AM - 12:00 PM",
    rules: "Key rules: No internet access allowed.",
  },
  {
    icon: Palette,
    title: "Design Duel",
    description: "An individual poster design competition, open for all departments. Participants have 30 minutes to create a promotional poster for the event.",
    venue: "Multimedia Room",
    time: "11:15 AM - 11:45 AM",
    rules: "Note: The use of AI tools or pre-made templates is forbidden.",
  },
];

export default function EventsShowcase() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl font-bold text-primary">Events Showcase</CardTitle>
        <CardDescription>Explore the exciting challenges awaiting you.</CardDescription>
      </CardHeader>
      <CardContent>
      <Accordion type="single" collapsible className="w-full">
        {eventDetails.map((event, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg hover:no-underline font-medium">
              <div className="flex items-center gap-4">
                <event.icon className="w-5 h-5 text-primary" />
                <span>{event.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-11">
              <div className="space-y-3 text-muted-foreground">
                <p>{event.description}</p>
                 {event.venue && <p className="text-sm"><MapPin className="inline-block mr-2 h-4 w-4" /> <span className="font-semibold text-foreground">Venue:</span> {event.venue}</p>}
                {event.time && <p className="text-sm"><Clock className="inline-block mr-2 h-4 w-4" /> <span className="font-semibold text-foreground">Time:</span> {event.time}</p>}
                {event.topics && <p className="text-sm"><Globe className="inline-block mr-2 h-4 w-4" /> <span className="font-semibold text-foreground">Topics:</span> {event.topics}</p>}
                {event.rules && <p className="text-sm text-destructive/80"><Ban className="inline-block mr-2 h-4 w-4" /> <span className="font-semibold text-destructive">Rules:</span> {event.rules}</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </CardContent>
    </Card>
  );
}
