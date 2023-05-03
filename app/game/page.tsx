import { Board } from './board';
import { GameForm } from './game-form';
import { StatusBar } from './status-bar';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Chess Board</h1>
      <Board />
      <div></div>
      <GameForm />
      <StatusBar />
    </div>
  );
}
