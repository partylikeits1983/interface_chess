import CardList from './view-matches';

const cards = [
  {
    matchAddress: '0x123',
    opponentAddress: '0x123',
    wagerToken: 'USDC',
    wagerAmount: 100,
    timePerMove: 3600,
    numberOfGames: 3,
    isPending: false,
  },
  {
    matchAddress: '0x124',
    opponentAddress: '0x123',
    wagerToken: 'USDC',
    wagerAmount: 1000,
    timePerMove: 4800,
    numberOfGames: 3,
    isPending: false,
  },
  {
    matchAddress: '0x125',
    opponentAddress: '0x123',
    wagerToken: 'USDC',
    wagerAmount: 500,
    timePerMove: 1200,
    numberOfGames: 5,
    isPending: true,
  },
];

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Matches</h1>

      <CardList cards={cards} />
    </div>
  );
}
