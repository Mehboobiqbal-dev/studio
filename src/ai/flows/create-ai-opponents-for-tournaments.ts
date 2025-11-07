// src/ai/flows/create-ai-opponents-for-tournaments.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating AI opponents for tournaments.
 *
 * - createAIOpponentsForTournament - A function that handles the creation of AI opponents for a tournament.
 * - CreateAIOpponentsForTournamentInput - The input type for the createAIOpponentsForTournament function.
 * - CreateAIOpponentsForTournamentOutput - The return type for the createAIOpponentsForTournament function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateAIOpponentsForTournamentInputSchema = z.object({
  tournamentName: z.string().describe('The name of the tournament.'),
  numberOfAIOpponents: z
    .number()
    .describe('The number of AI opponents to create.')
    .min(1)
    .max(100),
});
export type CreateAIOpponentsForTournamentInput = z.infer<
  typeof CreateAIOpponentsForTournamentInputSchema
>;

const CreateAIOpponentsForTournamentOutputSchema = z.object({
  aiOpponentNames: z.array(z.string()).describe('The names of the AI opponents created.'),
});
export type CreateAIOpponentsForTournamentOutput = z.infer<
  typeof CreateAIOpponentsForTournamentOutputSchema
>;

export async function createAIOpponentsForTournament(
  input: CreateAIOpponentsForTournamentInput
): Promise<CreateAIOpponentsForTournamentOutput> {
  return createAIOpponentsForTournamentFlow(input);
}

const createAIOpponentsPrompt = ai.definePrompt({
  name: 'createAIOpponentsPrompt',
  input: {schema: CreateAIOpponentsForTournamentInputSchema},
  output: {schema: CreateAIOpponentsForTournamentOutputSchema},
  prompt: `You are a helpful assistant that creates names for AI opponents in a tournament.

You will be given the tournament name and the number of AI opponents to create.

Tournament Name: {{{tournamentName}}}
Number of AI Opponents: {{{numberOfAIOpponents}}}

Create {{numberOfAIOpponents}} unique and creative names for AI opponents that are fitting for the {{tournamentName}} tournament. Return them as a JSON array of strings. The output should only be the JSON, and nothing else.`,
});

const createAIOpponentsForTournamentFlow = ai.defineFlow(
  {
    name: 'createAIOpponentsForTournamentFlow',
    inputSchema: CreateAIOpponentsForTournamentInputSchema,
    outputSchema: CreateAIOpponentsForTournamentOutputSchema,
  },
  async input => {
    const {output} = await createAIOpponentsPrompt(input);
    return output!;
  }
);
