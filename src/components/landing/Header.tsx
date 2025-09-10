import { Calendar } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="text-center space-y-4 py-8">
      <div className="flex justify-center items-center gap-4">
        <Image 
          src="https://fire-studio.screenplay-dev.google.com/static/copilot/e922f25b-11c5-4a5e-99e2-d596644f8b9d/image.png" 
          alt="MUC TECHNO-2K25 Logo"
          width={100}
          height={100}
          className="w-16 h-16 md:w-24 md:h-24"
        />
        <div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary tracking-tight">
                MUC TECHNO-2K25
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                Organized by the Department of Computer Science, Mazharul Uloom College (Autonomous), Ambur.
            </p>
        </div>
      </div>
      <div className="inline-flex items-center justify-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full">
        <Calendar className="w-5 h-5" />
        <span>September 25, 2025</span>
      </div>
    </header>
  );
}
