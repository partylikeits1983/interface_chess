import { ExternalLink } from '#/ui/external-link';
import Link from 'next/link';
import Analytics from './analytics';

export const metadata = {
  title: 'Analytics',
};

const items = [
  {
    name: 'Analytics',
    slug: 'search-params',
    description: 'analytics',
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-gray-300">Analytics</h1>
      <Analytics />
    </div>
  );
}
