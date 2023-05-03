import React from 'react';

export const metadata = {
  title: 'Not Found',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-9">
      <div className="flex justify-between">
        <div className="self-start"></div>
      </div>

      <div>{children}</div>
    </div>
  );
}
