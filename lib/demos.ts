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
        name: 'Create Tournament 🛠️',
        slug: 'create-tournament',
        description: 'Create a tournament',
      },
      {
        name: 'Join Tournament ⛳️',
        slug: 'join-tournament',
        description: 'Join a tournament',
      },
      {
        name: 'Tournament Viewer 🏆',
        slug: 'tournaments',
        description: 'Tournament viewer',
      },
      {
        name: 'Create a Challenge ✍️',
        slug: 'create-challenge',
        description: 'Create a 1v1 crypto chess wager',
      },
      {
        name: 'Pairing Room 👥',
        slug: 'game-pairing',
        description: 'Find a 1v1 chess wager',
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
