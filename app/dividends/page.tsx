import { ExternalLink } from '#/ui/external-link';
import Link from 'next/link';

import PageData from './pageData';
import { Stack, Divider, Heading, ChakraProvider } from '@chakra-ui/react';

export const metadata = {
  title: 'Dividends',
};

const items = [
  {
    name: 'Dividends',
    slug: 'search-params',
    description: 'dividends',
  },
];

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none space-y-9">
      <h1 className="text-xl font-medium text-white">Protocol Dividends</h1>
      <PageData></PageData>
    </div>
  );
}
