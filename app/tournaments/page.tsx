import { TournamentView } from './TournamentView';
// import { StatusBar } from './status-bar';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Chess Board</h1>
      <TournamentView tournamentID="" />
    </div>
  );
}
