const apiURL = 'https://api.chess.fish';

const getWagersFenMethod = '/wagersfen';
const getWagersMethod = '/wageraddresses';
const getAnalyticsMethod = '/analytics';
const getLeaderboardMethod = '/leaderboard';
const getTournamentMethod = '/tournaments';

export async function GetWagersFenDB(chainId: number): Promise<string[]> {
  const url = apiURL + getWagersFenMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data.fen_strings)) {
      const fen_strings: string[] = data.fen_strings.map(
        (fen_string: string) => fen_string,
      );

      return fen_strings;
    } else {
      throw new Error(
        'GetWagersFenDB: Invalid response format: "wagers" field is not an array.',
      );
    }
  } catch (error) {
    throw new Error(`Error fetching wagers fen: ${error}`);
  }
}

export async function GetWagersDB(chainId: number): Promise<string[]> {
  const url = apiURL + getWagersMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    console.log(data);

    if (Array.isArray(data.wagerAddresses)) {
      const wagers: string[] = data.wagerAddresses.map(
        (wager: string) => wager,
      );
      return wagers;
    } else {
      throw new Error(
        'GetWagersDB Invalid response format: "wagers" field is not an array.',
      );
    }
  } catch (error) {
    throw new Error(`Error fetching wagers data: ${error}`);
  }
}

export async function GetAnalyticsDB(chainId: number) {
  const url = apiURL + getAnalyticsMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    console.log('DATA', data);

    if (data.numberOfGames) {
      return [data.numberOfGames, data.numberOfWagers];
    } else {
      return [];
    }
  } catch (error) {
    throw new Error(`Error fetching wagers data: ${error}`);
  }
}

export async function GetLeaderboardDataDB(chainId: number) {
  const url = apiURL + getLeaderboardMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      console.log('GET LEADERBOARD DATA', response.status);
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Error fetching wagers data: ${error}`);
  }
}

export async function GetTournamentDataDB(chainId: number) {
  const url = apiURL + getTournamentMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Error fetching wagers data: ${error}`);
  }
}
