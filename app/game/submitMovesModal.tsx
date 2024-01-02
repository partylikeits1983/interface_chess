import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Spinner,
  Flex,
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  chakra, // If you're using chakra.span
} from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';

import {
  GetWagerStatus,
  GetIsWagerComplete,
  GetWagerPlayers,
  GetGameNumber,
} from '#/lib/api/form';

// Define the type for your props
interface SubmitMovesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMoves: (gameWager: string) => Promise<void>;
  gameWager: string;
  gameID: number;
  wereMovesSubmitted: boolean;
  setWereMovesSubmitted: (value: boolean) => void;
}

// Define the type for wager status
interface WagerStatus {
  winsPlayer0: number;
  winsPlayer1: number;
}

interface WagerPlayers {
  player0: string;
  player1: string;
}

const SubmitMovesModal: React.FC<SubmitMovesModalProps> = ({
  isOpen,
  onClose,
  onSubmitMoves,
  gameWager,
  gameID,
  wereMovesSubmitted,
  setWereMovesSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wagerStatus, setWagerStatus] = useState<WagerStatus | null>(null);
  const [wagerPlayers, setWagerPlayers] = useState<WagerPlayers | null>(null);

  useEffect(() => {
    const checkWagerCompletion = async () => {
      const isWagerComplete = await GetIsWagerComplete(gameWager);
      if (isWagerComplete) {
        const [winsPlayer0, winsPlayer1] = await GetWagerStatus(gameWager);
        setWagerStatus({ winsPlayer0, winsPlayer1 });

        const [player0, player1] = await GetWagerPlayers(gameWager);
        setWagerPlayers({ player0, player1 });
      }
    };

    const checkGameNumber = async () => {
      const currentGameID = await GetGameNumber(gameWager);
      if (currentGameID > gameID) {
        setWereMovesSubmitted(true);
        onClose();
        const newGameSound = new Audio('/sounds/GenericNotify.mp3');
        newGameSound.play();
      }
    };

    checkWagerCompletion();

    const intervalId = setInterval(() => {
      checkGameNumber();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameWager, gameID, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg="black"
        color="white"
        border="1px"
        borderColor="white"
        maxWidth="2xl" // Use maxWidth instead of size
      >
        <ModalHeader>{wagerStatus ? 'Wager Outcome' : 'Game Over'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {wagerStatus ? (
            <>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                Wager Results:
              </Text>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FaUserCircle} color="blue.500" />
                  <Text fontSize="md" fontWeight="semibold">
                    Player {wagerPlayers?.player0}:{' '}
                    <chakra.span color="green.500">
                      {wagerStatus.winsPlayer0} Wins
                    </chakra.span>
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={FaUserCircle} color="red.500" />
                  <Text fontSize="md" fontWeight="semibold">
                    Player {wagerPlayers?.player1}:{' '}
                    <chakra.span color="green.500">
                      {wagerStatus.winsPlayer1} Wins
                    </chakra.span>
                  </Text>
                </HStack>
              </VStack>
            </>
          ) : (
            'Checkmate! Please submit your moves on chain to complete the game.'
          )}
        </ModalBody>
        <ModalFooter>
          {wagerStatus === null && (
            <Flex width="100%" justifyContent="center" alignItems="center">
              <Box
                width="40px"
                height="40px"
                marginRight="2"
                visibility="hidden"
              />
              <Button
                colorScheme="green"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onSubmitMoves(gameWager);
                    setWereMovesSubmitted(true);
                    onClose();
                    const newGameSound = new Audio('/sounds/GenericNotify.mp3');
                    newGameSound.play();
                  } catch (error) {
                    console.error('Error during submit:', error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Submit moves on chain
              </Button>
              {isSubmitting ? (
                <Spinner
                  color="green.500"
                  width="40px"
                  height="40px"
                  marginLeft="2"
                />
              ) : (
                <Box
                  width="40px"
                  height="40px"
                  marginLeft="2"
                  visibility="hidden"
                />
              )}
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmitMovesModal;
