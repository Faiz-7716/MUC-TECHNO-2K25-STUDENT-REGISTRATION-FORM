import QuizClient from './QuizClient';
import { getQuizQuestions } from '@/ai/flows/get-quiz-questions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function QuizPage({ params }: { params: { round: string } }) {
  const roundNumber = parseInt(params.round, 10);

  if (isNaN(roundNumber) || ![1, 2, 4].includes(roundNumber)) {
    return <div className="text-center p-8">Invalid round selected.</div>;
  }

  try {
    const quizData = await getQuizQuestions(roundNumber);
    return <QuizClient quizData={quizData} round={roundNumber} />;
  } catch (error) {
    console.error(error);
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Failed to Load Quiz</CardTitle>
                    <CardDescription>
                        Sorry, we couldn&apos;t load the quiz questions at this moment. Please try again later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Link href="/quiz">
                        <Button variant="outline">Back to Quiz Home</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
  }
}
