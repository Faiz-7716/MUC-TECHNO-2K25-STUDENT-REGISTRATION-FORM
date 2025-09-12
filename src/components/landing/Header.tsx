import { Calendar } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="text-center space-y-4 py-6 md:py-8">
      <div className="flex justify-center items-center gap-4 md:gap-6">
        <Image 
          src="/docs/logo.png" 
          alt="MUC TECHNO-2K25 Logo"
          width={100}
          height={100}
          className="w-16 h-16 md:w-20 md:h-20 object-contain"
        />
        <div className="text-left">
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-tight">
                MUC TECHNO-2K25
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl">
                Organized by the Department of Computer Science
            </p>
        </div>
        <Image 
          src="/docs/logo2.png" 
          alt="Department Logo"
          width={100}
          height={100}
          className="w-16 h-16 md:w-20 md:h-20 object-contain"
        />
      </div>
       <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-2">
         <div className="inline-flex items-center justify-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full text-sm">
            <Calendar className="w-4 h-4" />
            <span>September 25, 2025</span>
        </div>
      </div>
      <p className="text-sm md:text-base text-muted-foreground font-medium max-w-2xl mx-auto">
          Mazharul Uloom College (Autonomous), Ambur.
      </p>
    </header>
  );
}
