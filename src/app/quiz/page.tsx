import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Trophy, BrainCircuit } from 'lucide-react';
import Header from '@/components/landing/Header';

export default function QuizHomePage() {
  const quizRounds = [
    {
      round: 1,
      title: 'Round 1: CS Fundamentals',
      description: 'Test your knowledge on the core concepts of computer science.',
    },
    {
      round: 2,
      title: 'Round 2: Tech Abbreviations',
      description: 'How well do you know your tech acronyms? Find out now!',
    },
    {
      round: 4,
      title: 'Round 4: Code Snippets',
      description: 'Predict the output of Python and C++ code snippets.',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-12 text-center">
            <Card>
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Trophy className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-4xl font-bold text-primary">Tech Quiz Challenge</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Welcome to the MUC TECHNO-2K25 Quiz! Select a round to begin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {quizRounds.map((quiz) => (
                    <Card key={quiz.round} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-center mb-3">
                                <BrainCircuit className="h-10 w-10 text-primary/80"/>
                            </div>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/quiz/round/${quiz.round}`}>
                                <Button className="w-full">
                                    <Rocket className="mr-2 h-4 w-4" />
                                    Start Round {quiz.round}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    ))}
                </CardContent>
            </Card>
        </main>
        <footer className="text-center text-muted-foreground text-sm mt-16">
            <p>&copy; {new Date().getFullYear()} Department of Computer Science, Mazharul Uloom College. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
