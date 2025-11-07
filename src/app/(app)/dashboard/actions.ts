'use server';

import {
  generateEchoFeedAndBustIt,
  type GenerateEchoFeedAndBustItOutput,
} from '@/ai/flows/generate-echo-feed-and-bust-it';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// This is a temporary in-memory store for the prototype.
// In a real app, this would be a database.
const reports: { [id: string]: GenerateEchoFeedAndBustItOutput & { opinion: string } } = {};

// Function to access reports from another server component/action
export async function getReport(id: string) {
  return reports[id];
}

export async function submitOpinion(
  prevState: any,
  formData: FormData
): Promise<{ error: string | null }> {
  const opinion = formData.get('opinion') as string;
  if (!opinion || opinion.length > 280) {
    return { error: 'Opinion must be between 1 and 280 characters.' };
  }

  let reportId: string;
  try {
    const result = await generateEchoFeedAndBustIt({ opinion });
    reportId = Date.now().toString();
    reports[reportId] = { ...result, opinion };

    // This part is crucial for making the new report page available.
    revalidatePath('/report/[id]', 'page');

  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate AI response. Please try again.' };
  }
  
  // We must redirect outside the try/catch block
  redirect(`/report/${reportId}`);
}
