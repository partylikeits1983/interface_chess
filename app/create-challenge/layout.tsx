import { LayoutHooks } from '#/app/create-challenge/_components/router-context-layout';
import React from 'react';

export const metadata = {
  title: 'Hooks',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-9">
      <LayoutHooks />

      <div>{children}</div>
    </div>
  );
}
