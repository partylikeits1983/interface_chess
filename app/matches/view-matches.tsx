'use client';

import { useState, useEffect } from 'react';

const { ethers } = require('ethers');
const { getAllWagers } = require('ui/wallet-ui/api/form');

export const MatchesTable = () => {
  const [matches, setMatches] = useState<string[]>([]);

  const getWagers = async (move: any) => {
    try {
      let value = await getAllWagers();
      setMatches([...matches, value]);
    } catch (error) {
      console.log(error);
    }
  };

  return <div></div>;
};
