import { TournamentView } from '../TournamentView';

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Tournament Viewer</h1>
      <TournamentView tournamentID={params.slug} />
    </div>
  );
}
