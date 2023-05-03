import { ExternalLink } from '#/ui/external-link';

import { Board } from './board';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Chess Board</h1>

      <Board />
    </div>
  );
}
