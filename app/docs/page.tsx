import { ExternalLink } from '#/ui/external-link';
import Link from 'next/link';

const items = [
  {
    name: 'Updating searchParams',
    slug: 'search-params',
    description: 'Update searchParams using `useRouter` and `<Link>`',
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-gray-300">Coming Soon</h1>
    </div>
  );
}
