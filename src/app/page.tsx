import Header from '@/components/landing/Header';
import EventsShowcase from '@/components/landing/EventsShowcase';
import RegistrationForm from '@/components/landing/RegistrationForm';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-12 md:space-y-16">
        <Header />
        <main className="space-y-12 md:space-y-16">
          <EventsShowcase />
          <RegistrationForm />
        </main>
         <footer className="text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Department of Computer Science, Mazharul Uloom College. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
