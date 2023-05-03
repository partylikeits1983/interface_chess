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
        name: 'Create a Challenge',
        slug: 'create-challenge',
        description: 'Create a crypto chess wager',
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
