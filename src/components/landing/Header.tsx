import { Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="text-center space-y-4">
      <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-primary">
        MUC TECHNO-2K25
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground font-medium">
        Organized by the Department of Computer Science, Mazharul Uloom College (Autonomous), Ambur.
      </p>
      <div className="flex items-center justify-center gap-2 text-accent font-semibold">
        <Calendar className="w-5 h-5" />
        <span>September 25, 2025</span>
      </div>
    </header>
  );
}
