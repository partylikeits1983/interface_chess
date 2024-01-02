import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  FormControl,
  FormLabel,
  Box,
  Tooltip,
} from '@chakra-ui/react';

import { InfoOutlineIcon } from '@chakra-ui/icons';

interface RecipientsProps {
  initialTextValue?: string;
  isAuthed: boolean;
  setIsAuthed: React.Dispatch<React.SetStateAction<boolean>>;
  setAuthedPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  setShouldCreatorJoin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Recipients: React.FC<RecipientsProps> = ({
  initialTextValue = '',
  isAuthed,
  setIsAuthed,
  setAuthedPlayers,
  setShouldCreatorJoin,
}) => {
  const [textValue, setTextValue] = useState<string>(initialTextValue);
  // const [showTextField, setShowTextField] = useState<boolean>(false);
  const [shouldCreatorJoin, setCreatorJoin] = useState<boolean>(false);

  const parseText = (textValue: string): string[] => {
    return textValue.split('\n').filter((line) => isValidAddress(line.trim()));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextValue(value);
    setAuthedPlayers(parseText(value));
  };

  const handleAuthSwitchChange = () => {
    // setShowTextField(!showTextField);
    setIsAuthed(!isAuthed);
  };

  const handleCreatorSwitchChange = () => {
    const newShouldCreatorJoin = !shouldCreatorJoin;
    setCreatorJoin(newShouldCreatorJoin);
    setShouldCreatorJoin(newShouldCreatorJoin);
  };

  return (
    <div className="pt-4">
      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="email-alerts" mb="0">
          Specify player addresses{' '}

          <Tooltip
                      label="Specify the player addresses in the tournament. Minimum 3 players, maximum 25 players"
                      aria-label="Number of games tooltip"
                      placement="right"
                    >
                      <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                    </Tooltip>
        </FormLabel>
        <Switch colorScheme="green" onChange={handleAuthSwitchChange} />
      </FormControl>

      {isAuthed && (
        <div>
          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="creator-join" mb="0">
              Creator Joining{' '}

              <Tooltip
                    label="Turn on if you want to join"
                    aria-label="Number of games tooltip"
                    placement="right"
                    >
                      <Box as={InfoOutlineIcon} ml={0} mb={1.5} />
                    </Tooltip>

            </FormLabel>
            <Switch
              id="creator-join"
              colorScheme="green"
              isChecked={shouldCreatorJoin}
              onChange={handleCreatorSwitchChange}
            />
          </FormControl>
          <FormLabel>
          Authenticated Player List 
          </FormLabel>
          <textarea
            spellCheck="false"
            value={textValue}
            onChange={handleTextChange}
            className="mt-4 block h-32 max-w-3xl px-2 py-2 outline-none"
            style={{
              width: '100%',
              background: 'black',
              color: 'white',
              border: '1px solid white',
              borderRadius: '5px',
            }}
            placeholder="0x04E7aD617B38D9FCd9A65C8A1b30255350faC8C6 0x5AE870dCbF7913b07C455CB7ceA5AA889042AF4E 0x26775A1CDd6CE94f1bAD7263Be8B4bF6067585A0"
          ></textarea>
          <Box maxH="200px" overflowY="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Player Address</Th>
                </Tr>
              </Thead>
              <Tbody>
                {parseText(textValue).map((address, index) => (
                  <Tr key={index}>
                    <Td>{address}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </div>
      )}
    </div>
  );
};

export default Recipients;

const isValidAddress = (address: string): boolean => {
  // Replace with your actual address validation logic
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
