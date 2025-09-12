import {z} from 'zod';

export const QuizQuestionSchema = z.object({
    questionNumber: z.number().describe('The question number.'),
    questionText: z.string().describe('The text of the question.'),
    options: z
      .array(z.object({key: z.string(), text: z.string()}))
      .describe('The multiple-choice options.'),
    correctAnswer: z.string().describe('The key of the correct answer (e.g., "A").'),
  });

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizRoundSchema = z.object({
    title: z.string().describe('The title of the quiz round.'),
    questions: z.array(QuizQuestionSchema).describe('The list of questions in the round.'),
});

export type QuizRound = z.infer<typeof QuizRoundSchema>;
