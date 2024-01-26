const apiURL = 'https://api.chess.fish';

const getWagersFenMethod = '/wagersfen';
const getWagersMethod = '/wageraddresses';
const getAnalyticsMethod = '/analytics';
const getLeaderboardMethod = '/leaderboard';
const getTournamentMethod = '/tournaments';

export async function GetWagersFenDB(
  chainId: number,
): Promise<{ wagerAddress: string; fenString: string }[]> {
  const url = apiURL + getWagersFenMethod + '/' + chainId;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data.wagerAddresses) && Array.isArray(data.fenStrings)) {
      // Combine wagerAddresses and fenStrings into an array of objects
      return data.wagerAddresses.map((wagerAddress: string, index: number) => {
        return { wagerAddress, fenString: data.fenStrings[index] };
      });
    } else {
      throw new Error(
        'GetWagersFenDB: Invalid response format: Expected fields "wagerAddresses" and "fenStrings".',
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

    if (data.numberOfGames !== undefined && data.numberOfGames !== null) {
      return [data.numberOfGames, data.numberOfWagers];
    } else {
      return [0, 0];
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
