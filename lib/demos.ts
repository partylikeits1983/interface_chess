export type Item = {
  name: string;
  slug: string;
  description?: string;
};

export const demos: { name: string; items: Item[] }[] = [
  {
    name: 'EVM CHESS',
    items: [
      {
        name: 'Create a Challenge',
        slug: 'hooks',
        description: 'Challenge another player to a chess wager',
      },
      {
        name: 'Play',
        slug: 'styling',
        description: 'Play chess on the blockchain',
      },
      {
        name: 'Docs',
        slug: 'snippets',
        description: 'Understand how it',
      },
    ],
  },
];
