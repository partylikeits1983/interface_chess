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
        name: 'Analytics 📊',
        slug: 'analytics',
        description: 'chess.fish analytics',
      },
      {
        name: 'Leaderboard 🏅',
        slug: 'leaderboard',
        description: 'chess.fish leaderboard',
      },
      {
        name: 'Create a Challenge ✍️',
        slug: 'create-challenge',
        description: 'Create a crypto chess wager',
      },
      {
        name: 'Pairing Room 👥',
        slug: 'game-pairing',
        description: 'Find a chess wager',
      },

      {
        name: 'Your Matches 🎯',
        slug: 'matches',
        description: 'View your current matches',
      },
      {
        name: 'Game Viewer 🔎',
        slug: 'game',
        description: 'Explore current matches',
      },
      {
        name: 'Protocol Dividends 🏛️',
        slug: 'dividends',
        description: 'Withdraw earned dividends',
      },
      {
        name: 'Docs 📖',
        slug: 'docs',
        description: 'Understand how chess.fish works',
      },
    ],
  },
];
