import { useState, ChangeEvent, useEffect, useRef } from 'react';
import {
  Input,
  List,
  ListItem,
  Box,
  InputGroup,
  Flex,
  InputRightElement,
  Image,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
// First, define an interface for the options
interface Option {
  label: string;
  image: string;
}

interface AutocompleteProps {
  options: Option[];
  onChange: (selectedOption: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ options, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    // Do not trigger onChange here, as the value is not yet selected
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().startsWith(value.toLowerCase()),
      ),
    );
    setShowOptions(true);
  };

  const handleOptionClick = (option: Option) => {
    setInputValue(option.label);
    setShowOptions(false);
    onChange(option.label); // Pass the selected option to the parent component
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
                pl={2}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleOptionClick(option)}
              >
                <Flex align="center" justify="space-between">
                  <Box>{option.label}</Box>
                  {option.image && (
                    <Image
                      src={option.image}
                      alt={option.label}
                      boxSize="20px"
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

export default Autocomplete;
