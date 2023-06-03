export type Item = {
  name: string;
  slug: string;
  description?: string;
};

export const demos: { name: string; items: Item[] }[] = [
  {
    name: 'Menu',
    items: [
      {
        name: 'Analytics',
        slug: 'analytics',
        description: 'chess.fish analytics',
      },
      {
        name: 'Create a Challenge',
        slug: 'create-challenge',
        description: 'Create a crypto chess wager',
      },
      {
        name: 'Pairing Room',
        slug: 'game-pairing',
        description: 'Find a chess wager',
      },

      {
        name: 'Matches',
        slug: 'matches',
        description: 'Play chess on the blockchain for crypto',
      },
      {
        name: 'Play',
        slug: 'game',
        description: 'Play chess on the blockchain for crypto',
      },
      {
        name: 'Docs',
        slug: 'docs',
        description: 'Understand how chess.fish works',
      },
    ],
  },
];
