export async function GetWagersFenDB(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data.wagers)) {
      const wagers: string[] = data.wagers.map((wager: string) => wager);
      return wagers;
    } else {
      throw new Error(
        'Invalid response format: "wagers" field is not an array.',
      );
    }
  } catch (error) {
    throw new Error(`Error fetching wagers: ${error}`);
  }
}

export async function GetWagersDB(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data.wageraddresses)) {
      const wagers: string[] = data.wageraddresses.map(
        (wager: string) => wager,
      );
      return wagers;
    } else {
      throw new Error(
        'Invalid response format: "wagers" field is not an array.',
      );
    }
  } catch (error) {
    throw new Error(`Error fetching wagers: ${error}`);
  }
}
