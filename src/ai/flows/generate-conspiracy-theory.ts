'use server';

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

export async function generateConspiracyTheory(
  input: GenerateConspiracyTheoryInput
): Promise<GenerateConspiracyTheoryOutput> {
  try {
    const historicalText = input.historical ? 'historical event' : 'current topic';
    const contextText = input.context ? `\n\nContext: ${input.context}` : '';

    const prompt = `You are an AI that generates creative and thought-provoking conspiracy theories. 
Your goal is to create engaging, well-structured conspiracy theories that are:
- Creative and imaginative
- Well-written and compelling
- Based on real events or topics (but with fictional connections)
- Clearly marked as theories (not facts)
- Engaging for readers interested in alternative perspectives

Generate a conspiracy theory about: ${input.topic}
This is a ${historicalText}.${contextText}

Requirements:
1. Create a compelling, attention-grabbing title (5-15 words)
2. Write 500-2000 words of well-structured content with multiple paragraphs
3. Include multiple interconnected elements and connections
4. Reference real events, people, or facts (but connect them in creative ways)
5. Write in an engaging, narrative style
6. Create an excerpt (150-160 characters) for SEO
7. Generate 3-5 relevant tags

Return ONLY a valid JSON object in this exact format:
{
  "title": "Your compelling title here",
  "content": "Your full conspiracy theory content here (500-2000 words)",
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "Your SEO excerpt here (150-160 characters)"
}`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: prompt,
      config: {
        temperature: 0.9,
        maxOutputTokens: 4000,
      },
    });

    const text = response.text || '';
    
    // Try to extract JSON from the response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Validate and return
    return {
      title: parsed.title || `Conspiracy Theory: ${input.topic}`,
      content: parsed.content || text,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [input.topic.toLowerCase()],
      excerpt: parsed.excerpt || (parsed.content ? parsed.content.substring(0, 160) : text.substring(0, 160)),
    };
  } catch (error: any) {
    console.error('Error generating conspiracy theory:', error);
    
    // Fallback response
    return {
      title: `The Hidden Truth About ${input.topic}`,
      content: `This is a conspiracy theory about ${input.topic}. ${
        input.historical
          ? 'This historical event has many unanswered questions.'
          : "There are many things the mainstream media doesn't want you to know about this topic."
      } The truth is often hidden in plain sight, and when you start connecting the dots, a different picture emerges. Many people believe that there's more to this story than meets the eye.`,
      tags: [input.topic.toLowerCase().replace(/\s+/g, '-'), 'conspiracy', 'theory'],
      excerpt: `A deep dive into the conspiracy theories surrounding ${input.topic} and what they reveal about hidden truths.`,
    };
  }
}

