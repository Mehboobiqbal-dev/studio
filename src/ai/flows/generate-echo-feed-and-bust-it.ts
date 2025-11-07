'use server';
/**
 * @fileOverview Generates an echo feed of absurd agreements to a user's opinion,
 * then "busts" it with counterarguments from diverse AI personas.
 *
 * - generateEchoFeedAndBustIt - A function that generates the echo feed and busts it.
 * - GenerateEchoFeedAndBustItInput - The input type for the generateEchoFeedAndBustIt function.
 * - GenerateEchoFeedAndBustItOutput - The return type for the generateEchoFeedAndBustIt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEchoFeedAndBustItInputSchema = z.object({
  opinion: z
    .string()
    .describe('The user submitted opinion (up to 280 characters).'),
});
export type GenerateEchoFeedAndBustItInput = z.infer<
  typeof GenerateEchoFeedAndBustItInputSchema
>;

const GenerateEchoFeedAndBustItOutputSchema = z.object({
  bubbleScore: z
    .number()
    .describe('A score indicating the strength of the echo chamber.'),
  echoFeed: z
    .array(z.string())
    .describe('An array of absurd, escalating agreements to the opinion.'),
  bustFeed: z
    .array(z.string())
    .describe(
      'An array of counterarguments from diverse AI personas, fact-checked via APIs.'
    ),
  memeReport: z
    .string()
    .describe(
      'A shareable meme report summarizing the echo chamber and bust results.'
    ),
});
export type GenerateEchoFeedAndBustItOutput = z.infer<
  typeof GenerateEchoFeedAndBustItOutputSchema
>;

export async function generateEchoFeedAndBustIt(
  input: GenerateEchoFeedAndBustItInput
): Promise<GenerateEchoFeedAndBustItOutput> {
  return generateEchoFeedAndBustItFlow(input);
}

const generateEchoFeedAndBustItPrompt = ai.definePrompt({
  name: 'generateEchoFeedAndBustItPrompt',
  input: {schema: GenerateEchoFeedAndBustItInputSchema},
  output: {schema: GenerateEchoFeedAndBustItOutputSchema},
  prompt: `You are an AI that generates an echo feed of absurd agreements to a user's opinion, and then "busts" it with counterarguments from diverse AI personas.

  Opinion: {{{opinion}}}

  Generate a bubble score (0-10), an echo feed (10-20 items), a bust feed, and a meme report.
  `,
});

const generateEchoFeedAndBustItFlow = ai.defineFlow(
  {
    name: 'generateEchoFeedAndBustItFlow',
    inputSchema: GenerateEchoFeedAndBustItInputSchema,
    outputSchema: GenerateEchoFeedAndBustItOutputSchema,
  },
  async input => {
    const {output} = await generateEchoFeedAndBustItPrompt(input);
    return output!;
  }
);