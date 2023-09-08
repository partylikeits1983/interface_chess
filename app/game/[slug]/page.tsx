import { Board } from '../boardPage';
import { GameForm } from '../game-form';

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Chess Board</h1>
      <Board wager={params.slug} />
      <GameForm />
    </div>
  );
}
