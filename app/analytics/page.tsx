import { ExternalLink } from '#/ui/external-link';
import Link from 'next/link';

import Docs from './docs';

export const metadata = {
  title: 'Docs',
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
      <h1 className="text-xl font-medium text-gray-300">Coming Soon</h1>
      <Docs />
    </div>
  );
}