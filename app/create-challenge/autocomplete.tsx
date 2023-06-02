import { useState, ChangeEvent, useEffect, useRef } from 'react';
import {
  Input,
  List,
  ListItem,
  Box,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

interface AutocompleteProps {
  options: string[];
  onChange: (selectedOption: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ options, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    onChange(value); // Also pass the typed value to the parent component
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().startsWith(value.toLowerCase()),
      ),
    );
    setShowOptions(true);
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setShowOptions(false);
    onChange(option); // Pass the selected option to the parent component
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
          placeholder="Type to search..."
        />
        <InputRightElement pointerEvents="none">
          <ChevronDownIcon color="gray.400" />
        </InputRightElement>
      </InputGroup>
      {showOptions && (
        <Box
          ref={dropdownRef}
          position="absolute"
          width="100%"
          zIndex={1}
          borderWidth="1px"
          borderRadius="md"
          mt={0}
          boxShadow="sm"
          bg="white"
        >
          <List spacing={0}>
            {filteredOptions.map((option, index) => (
              <ListItem
                key={index}
                pl={2} // Adjust the left padding here
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Autocomplete;
