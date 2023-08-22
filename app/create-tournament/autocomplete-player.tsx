import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  InputGroup,
  Input,
  InputRightElement,
  List,
  ListItem,
  Flex,
  Text,
  Image,
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';

interface Option {
  label: string;
  image?: string;
  address: string;
}

interface AutocompleteProps {
  options: Option[];
  onChange: (address: string) => void;
}

const AutocompletePlayer: React.FC<AutocompleteProps> = ({
  options,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setInputValue(value);
    onChange(value);

    if (!value) {
      // if input value is empty, clear selected option
      setSelectedOption(null);
    }

    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().startsWith(value.toLowerCase()),
      ),
    );
    setShowOptions(true);
  };

  const handleOptionClick = (option: Option) => {
    console.log(option);

    setInputValue(option.label);
    setSelectedOption(option);
    setShowOptions(false);
    onChange(option.address);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Box position="relative">
      <InputGroup>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type player address..."
        />
        <InputRightElement>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {selectedOption?.image && (
              <Image
                src={selectedOption.image}
                alt={selectedOption.label}
                boxSize="20px"
              />
            )}
            <ChevronDownIcon color="gray.400" boxSize={5} mr={2} />
          </Box>
        </InputRightElement>
      </InputGroup>
      {showOptions && (
        <Box
          ref={dropdownRef}
          zIndex={2}
          position="absolute"
          width="100%"
          borderWidth="1px"
          borderRadius="md"
          mt={2}
          boxShadow="sm"
          bg="black"
          maxHeight="400px"
          overflowY="auto"
        >
          <List spacing={0} pl={0}>
            {filteredOptions.map((option, index) => (
              <ListItem
                key={index}
                pl={0}
                py={0}
                cursor="pointer"
                _hover={{ bg: 'gray.800' }}
                onClick={() => handleOptionClick(option)}
              >
                <Flex align="center" justify="space-between" p={4}>
                  <Text fontSize="lg" fontWeight="bold">
                    {option.label}
                  </Text>
                  {option.image && (
                    <Image
                      src={option.image}
                      alt={option.label}
                      boxSize="30px"
                      mr={2}
                    />
                  )}
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default AutocompletePlayer;
