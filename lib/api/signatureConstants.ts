export const domain = {
    chainId: 0,
    name: "ChessFish", 
    verifyingContract: '', 
    version: "1",
  };

export const types = {
    GaslessMove: [
      { name: "wagerAddress", type: "address" },
      { name: "gameNumber", type: "uint" },
      { name: "moveNumber", type: "uint" },
      { name: "move", type: "uint16" },
      { name: "expiration", type: "uint" },
    ],
  };