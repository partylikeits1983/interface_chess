import { Select, Switch, Flex } from '@chakra-ui/react';

interface CardFilterControlsProps {
  sortValue: string;
  setSortValue: (value: string) => void;
  filterValue: boolean;
  setFilterValue: (value: boolean) => void;
}

const CardFilterControls: React.FC<CardFilterControlsProps> = ({
  sortValue,
  setSortValue,
  filterValue,
  setFilterValue,
}) => {
  return (
    <Flex align="center" justifyContent="space-between" paddingBottom="20px">
      <Flex width="50%">
        <Select
          size="sm"
          style={{ color: 'white' }}
          value={sortValue}
          onChange={(event) => setSortValue(event.target.value)}
          placeholder=""
          bg="black"
          color="white"
          width="100%"
        >
          <option style={{ color: 'black' }} value="wagerAmountAsc">
            Wager Amount (lowest first)
          </option>
          <option style={{ color: 'black' }} value="wagerAmountDesc">
            Wager Amount (highest first)
          </option>
        </Select>
      </Flex>
    </Flex>
  );
};

export default CardFilterControls;
