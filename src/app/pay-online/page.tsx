import Header from '@/components/landing/Header';
import PayOnlineForm from '@/components/pay-online/PayOnlineForm';

export default function PayOnlinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-12">
            <PayOnlineForm />
        </main>
         <footer className="text-center text-muted-foreground text-sm mt-16">
          <p>&copy; {new Date().getFullYear()} Department of Computer Science, Mazharul Uloom College. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
