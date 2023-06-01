const apiURL = 'http://34.159.207.87:4000';
const getWagersFenMethod = '/wagersfen';
const getWagersMethod = '/wageraddresses';

export async function GetWagersFenDB(): Promise<string[]> {
  const url = apiURL + getWagersFenMethod;
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
    throw new Error(`Error fetching wagers: ${error}`);
  }
}

export async function GetWagersDB(): Promise<string[]> {
  const url = apiURL + getWagersMethod;
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
    throw new Error(`Error fetching wagers: ${error}`);
  }
}
