import { Select, Switch, Flex } from '@chakra-ui/react';

interface CardFilterControlsProps {
  sortValue: string;
  setSortValue: (value: string) => void;
  filterValue: boolean;
  setFilterValue: (value: boolean) => void;
  showOnlyTournaments: boolean;
  setShowOnlyTournaments: (value: boolean) => void;
}

const CardFilterControls: React.FC<CardFilterControlsProps> = ({
  sortValue,
  setSortValue,
  filterValue,
  setFilterValue,
  showOnlyTournaments,
  setShowOnlyTournaments,
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
          <option style={{ color: 'black' }} value="isPending">
            In Progress First
          </option>
          <option style={{ color: 'black' }} value="wagerAmountAsc">
            Wager Amount (lowest first)
          </option>
          <option style={{ color: 'black' }} value="wagerAmountDesc">
            Wager Amount (highest first)
          </option>
        </Select>
      </Flex>
      <Flex width="50%" justifyContent="flex-end">
        <label htmlFor="hide-pending-games" style={{ marginRight: '10px' }}>
          Hide Pending
        </label>
        <Switch
          id="hide-pending-games"
          isChecked={filterValue}
          onChange={(event) => setFilterValue(event.target.checked)}
        />
      </Flex>

      <Flex width="50%" justifyContent="flex-end">
        <label htmlFor="show-tournaments" style={{ marginRight: '10px' }}>
          Show only Tournaments
        </label>
        <Switch
          id="show-tournaments"
          isChecked={showOnlyTournaments}
          onChange={(event) => setShowOnlyTournaments(event.target.checked)}
        />
      </Flex>
    </Flex>
  );
};

export default CardFilterControls;
