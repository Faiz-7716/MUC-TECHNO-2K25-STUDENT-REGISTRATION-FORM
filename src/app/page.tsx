import Header from '@/components/landing/Header';
import EventsShowcase from '@/components/landing/EventsShowcase';
import RegistrationForm from '@/components/landing/RegistrationForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Header />
        <main className="grid grid-cols-1 lg:grid-cols-5 gap-12 md:gap-16 mt-12">
          <div className="lg:col-span-2">
            <EventsShowcase />
          </div>
          <div className="lg:col-span-3">
            <RegistrationForm />
          </div>
        </main>
         <footer className="text-center text-muted-foreground text-sm mt-16">
          <p>&copy; {new Date().getFullYear()} Department of Computer Science, Mazharul Uloom College. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
