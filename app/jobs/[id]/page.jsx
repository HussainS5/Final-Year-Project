import { mockJobs } from '@/lib/mockData';
import JobDetailClient from './JobDetailClient';

export function generateStaticParams() {
  return mockJobs.map((job) => ({
    id: job.id.toString(),
  }));
}

export default function JobDetailPage({ params }) {
  return <JobDetailClient params={params} />;
}
