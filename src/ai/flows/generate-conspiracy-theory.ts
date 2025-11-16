import { ai } from '../genkit';
import { z } from 'zod';

const GenerateConspiracyTheoryInputSchema = z.object({
  topic: z.string().describe('The topic or subject to generate a conspiracy theory about'),
  context: z.string().optional().describe('Additional context about the topic'),
  historical: z.boolean().optional().describe('Whether this is about a historical event'),
});

const GenerateConspiracyTheoryOutputSchema = z.object({
  title: z.string().describe('A compelling title for the conspiracy theory'),
  content: z.string().describe('The full conspiracy theory content (500-2000 words)'),
  tags: z.array(z.string()).describe('Relevant tags for categorization'),
  excerpt: z.string().describe('A short excerpt (150-160 characters) for SEO'),
});

export type GenerateConspiracyTheoryInput = z.infer<typeof GenerateConspiracyTheoryInputSchema>;
export type GenerateConspiracyTheoryOutput = z.infer<typeof GenerateConspiracyTheoryOutputSchema>;

const generateConspiracyTheoryPrompt = ai.definePrompt({
  name: 'generateConspiracyTheory',
  input: { schema: GenerateConspiracyTheoryInputSchema },
  output: { schema: GenerateConspiracyTheoryOutputSchema },
  prompt: `You are an AI that generates creative and thought-provoking conspiracy theories. 
Your goal is to create engaging, well-structured conspiracy theories that are:
- Creative and imaginative
- Well-written and compelling
- Based on real events or topics (but with fictional connections)
- Clearly marked as theories (not facts)
- Engaging for readers interested in alternative perspectives

Topic: {{{topic}}}
Context: {{{context}}}
Historical: {{{historical}}}

Generate a conspiracy theory that:
1. Has a compelling, attention-grabbing title
2. Contains 500-2000 words of well-structured content
3. Includes multiple interconnected elements
4. References real events, people, or facts (but connects them in creative ways)
5. Is written in an engaging, narrative style
6. Includes an excerpt suitable for SEO (150-160 characters)

Return a JSON object with title, content, tags (array of 3-5 relevant tags), and excerpt.`,
});

export async function generateConspiracyTheory(
  input: GenerateConspiracyTheoryInput
): Promise<GenerateConspiracyTheoryOutput> {
  const result = await generateConspiracyTheoryPrompt({
    topic: input.topic,
    context: input.context || '',
    historical: input.historical || false,
  });

  return result.output;
}

