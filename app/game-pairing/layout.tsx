import React from 'react';

export const metadata = {
  title: 'Game',
};

const items = [
  {
    text: 'Global CSS',
    slug: 'global-css',
  },
  {
    text: 'CSS Modules',
    slug: 'css-modules',
  },
  {
    text: 'Styled Components',
    slug: 'styled-components',
  },
  {
    text: 'Styled JSX',
    slug: 'styled-jsx',
  },
  {
    text: 'Tailwind CSS',
    slug: 'tailwind',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-9">
      <div>{children}</div>
    </div>
  );
}
