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
        description: 'Challenge another player to a chess wager',
      },
      {
        name: 'Play',
        slug: 'game',
        description: 'Play chess on the blockchain',
      },
      {
        name: 'Docs',
        slug: 'docs',
        description: 'Understand how it',
      },
    ],
  },
];
