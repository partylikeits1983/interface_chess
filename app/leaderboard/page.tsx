import PageData from './pageData';

export const metadata = {
  title: 'Leaderboard',
};

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-gray-300">Leaderboard</h1>
      <PageData></PageData>
    </div>
  );
}
