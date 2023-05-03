import { ExternalLink } from '#/ui/external-link';
import { AddressBar } from '#/ui/address-bar';

import { Board } from './board';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Chess Board</h1>

      <Board />
    </div>
  );
}
