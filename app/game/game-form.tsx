'use client';

import { useState } from 'react';

import { FormControl, FormLabel, ChakraProvider } from '@chakra-ui/react';

import GameInfo from './game-info';

interface FormInputs {
  color: string;
}

const colors = [
  { value: 'red', label: '0x1' },
  { value: 'green', label: '0x2' },
  { value: 'blue', label: '0x3' },
];

export function GameForm() {
  const [formInputs, setFormInputs] = useState<FormInputs>({ color: '' });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const { name, value } = event.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  return (
    <ChakraProvider>
      <FormControl>
        <FormLabel></FormLabel>
      </FormControl>
    </ChakraProvider>
  );
}
