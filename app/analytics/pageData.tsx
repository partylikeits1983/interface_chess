'use client';

import React, { useEffect, useState } from 'react';

import { Stack, Divider, Heading, ChakraProvider } from '@chakra-ui/react';

import Analytics from './analytics';
import CurrentGames from './currentGames';

const PageData: React.FC = () => {
  return (
    <ChakraProvider>
      <Stack spacing={8}>
        <Analytics />
        <CurrentGames />
      </Stack>
    </ChakraProvider>
  );
};

export default PageData;
