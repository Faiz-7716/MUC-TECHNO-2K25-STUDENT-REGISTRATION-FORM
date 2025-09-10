import { Calendar } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="text-center space-y-4">
      <div className="flex justify-center">
        <Image 
          src="https://fire-studio.screenplay-dev.google.com/static/copilot/e922f25b-11c5-4a5e-99e2-d596644f8b9d/image.png" 
          alt="MUC TECHNO-2K25 Logo"
          width={400}
          height={400}
          className="w-48 h-48 md:w-64 md:h-64"
        />
      </div>
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
