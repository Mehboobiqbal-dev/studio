import { getReport } from '@/app/(app)/dashboard/actions';
import { MemeReport } from '@/components/meme-report';
import { notFound } from 'next/navigation';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);

  if (!report) {
    notFound();
  }

  return <MemeReport report={report} />;
}
