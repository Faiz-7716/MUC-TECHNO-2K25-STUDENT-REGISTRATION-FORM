'use client';

import { useState } from 'react';
import type { QuizRound } from '@/lib/quiz-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuizClientProps {
  quizData: QuizRound;
  round: number;
}

export default function QuizClient({ quizData, round }: QuizClientProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const activeQuestion = quizData.questions[activeQuestionIndex];
  const isCorrect = selectedAnswer === activeQuestion.correctAnswer;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < quizData.questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };
  
  const handleRestart = () => {
    setActiveQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  }

  const progressPercentage = (activeQuestionIndex / quizData.questions.length) * 100;

  if (showResults) {
    const finalPercentage = (score / quizData.questions.length) * 100;
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="max-w-lg w-full text-center p-6 animate-in fade-in zoom-in-95">
                <CardHeader>
                    <Trophy className="h-20 w-20 text-primary mx-auto mb-4" />
                    <CardTitle className="font-headline text-3xl">Round {round} Complete!</CardTitle>
                    <CardDescription className="text-lg">
                        You scored {score} out of {quizData.questions.length}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Progress value={finalPercentage} className="h-4" />
                        <p className="text-xl font-bold">{finalPercentage.toFixed(0)}%</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={handleRestart}>
                            <RotateCcw className="mr-2" />
                            Play Again
                        </Button>
                         <Link href="/quiz">
                            <Button variant="outline">Choose Another Round</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <Progress value={progressPercentage} className="mb-4" />
          <CardTitle className="font-headline text-2xl">{quizData.title}</CardTitle>
          <CardDescription>
            Question {activeQuestionIndex + 1} of {quizData.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold">{activeQuestion.questionText}</p>
          
          <RadioGroup 
            value={selectedAnswer ?? undefined}
            onValueChange={setSelectedAnswer}
            disabled={isAnswered}
            className="space-y-3"
          >
            {activeQuestion.options.map(option => (
              <Label 
                key={option.key}
                htmlFor={option.key}
                className={cn(
                    "flex items-center gap-4 rounded-md border p-4 cursor-pointer transition-colors",
                    "hover:bg-accent",
                    isAnswered && option.key === activeQuestion.correctAnswer && "bg-green-100 border-green-500 text-green-800",
                    isAnswered && option.key !== activeQuestion.correctAnswer && selectedAnswer === option.key && "bg-red-100 border-red-500 text-red-800"
                )}
                >
                <RadioGroupItem value={option.key} id={option.key} />
                <span className="flex-1">{option.text}</span>
                {isAnswered && option.key === activeQuestion.correctAnswer && <CheckCircle className="text-green-600" />}
                {isAnswered && option.key !== activeQuestion.correctAnswer && selectedAnswer === option.key && <XCircle className="text-red-600" />}
              </Label>
            ))}
          </RadioGroup>

          <div className="flex justify-end">
            {isAnswered ? (
                <Button onClick={handleNextQuestion}>
                    {activeQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Show Results'}
                    <ArrowRight className="ml-2" />
                </Button>
            ) : (
                <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
                    Submit Answer
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
