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
          <option style={{ color: 'black' }} value="gamesAmountDesc">
            Number of Games (most first)
          </option>
          <option style={{ color: 'black' }} value="gamesAmountAsc">
            Number of Games (least first)
          </option>
          <option style={{ color: 'black' }} value="wagerAmountDesc">
            Wager Amount (highest first)
          </option>
          <option style={{ color: 'black' }} value="wagerAmountAsc">
            Wager Amount (least first)
          </option>
        </Select>
      </Flex>
      <Flex width="50%" justifyContent="flex-end">
        <label htmlFor="hide-games" style={{ marginRight: '10px' }}>
          Hide amount zero wagers
        </label>
        <Switch
          id="hide-games"
          isChecked={filterValue}
          onChange={(event) => setFilterValue(event.target.checked)}
        />
      </Flex>
    </Flex>
  );
};

export default CardFilterControls;
