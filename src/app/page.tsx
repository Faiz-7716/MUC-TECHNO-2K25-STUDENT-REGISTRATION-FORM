import Header from '@/components/landing/Header';
import EventsShowcase from '@/components/landing/EventsShowcase';
import GeneralInstructions from '@/components/landing/GeneralInstructions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Header />
        <GeneralInstructions />
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 mt-8 md:mt-12">
          <div className="lg:col-span-3">
            <EventsShowcase />
          </div>
          <div className="lg:col-span-2">
             <section id="register">
                <Card className="w-full flex flex-col items-center justify-center text-center p-8 min-h-[500px] bg-primary/5 border-primary/20">
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <PartyPopper className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto" />
                        <h2 className="font-headline text-3xl sm:text-4xl font-bold text-primary mt-6">Ready to Participate?</h2>
                        <CardDescription className="mt-2 text-base sm:text-lg max-w-sm mx-auto">
                           Click the button below to pay the fee and complete your registration.
                        </CardDescription>
                         <Link href="/register">
                            <Button size="lg" className="mt-8 text-base sm:text-lg">
                                Register Now
                            </Button>
                        </Link>
                    </div>
                </Card>
            </section>
          </div>
        </main>
         <footer className="text-center text-muted-foreground text-sm mt-12 md:mt-16">
          <p>&copy; {new Date().getFullYear()} Department of Computer Science, Mazharul Uloom College. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
