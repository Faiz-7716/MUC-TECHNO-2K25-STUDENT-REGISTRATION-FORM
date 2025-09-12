'use server';
/**
 * @fileOverview A flow for parsing quiz questions from text files.
 *
 * - getQuizQuestions - A function that returns quiz questions for a given round.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';
import type { QuizRound } from '@/lib/quiz-types';
import { QuizRoundSchema } from '@/lib/quiz-types';


const questionParserPrompt = ai.definePrompt({
    name: 'quizQuestionParserPrompt',
    input: { schema: z.object({ rawText: z.string() }) },
    output: { schema: QuizRoundSchema },
    prompt: `You are an expert at parsing text and converting it into a structured JSON format.
Parse the provided raw text from a quiz file. The text contains a title and a series of multiple-choice questions.

Here are the specific instructions:
1.  Identify the main title of the quiz.
2.  For each question, extract the question number, the full question text, the multiple-choice options (A, B, C, D, etc.), and the correct answer.
3.  The options should be represented as an array of objects, each with a 'key' (e.g., "A") and 'text'.
4.  The correct answer is indicated in the text. Sometimes it's marked with a "✅" emoji, other times it's explicitly stated like "Correct Answer: B". Your output for the 'correctAnswer' field should just be the letter key (e.g., "B").

Here is the raw text to parse:
---
{{{rawText}}}
---
`,
});


const getQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'getQuizQuestionsFlow',
    inputSchema: z.object({ round: z.number() }),
    outputSchema: QuizRoundSchema,
  },
  async ({ round }) => {
    let fileName = '';
    if (round === 1) fileName = 'Round 1.txt';
    else if (round === 2) fileName = 'Round 2.txt';
    else if (round === 4) fileName = 'Round 4.txt';
    else {
        throw new Error('Invalid round number. Only rounds 1, 2 and 4 are available.');
    }
    
    const filePath = path.join(process.cwd(), 'Quiz Questions', fileName);

    try {
        const rawText = await fs.readFile(filePath, 'utf-8');
        const { output } = await questionParserPrompt({ rawText });
        return output!;
    } catch (error) {
        console.error(`Error reading or parsing file for round ${round}:`, error);
        throw new Error(`Could not load quiz for round ${round}.`);
    }
  }
);

export async function getQuizQuestions(round: number): Promise<QuizRound> {
    return getQuizQuestionsFlow({ round });
}
