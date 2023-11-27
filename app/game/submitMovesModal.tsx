import React, { useState } from 'react';
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
} from '@chakra-ui/react';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="black" color="white" border="1px" borderColor="white">
        <ModalHeader>Game Over</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Checkmate! Please submit your moves on chain to complete the game.
        </ModalBody>
        <ModalFooter>
          <Flex width="100%" justifyContent="center" alignItems="center">
            {/* Invisible Box to maintain layout */}
            <Box
              width="40px"
              height="40px"
              marginRight="2"
              visibility="hidden"
            />

            <Button
              colorScheme="green"
              onClick={async () => {
                setIsSubmitting(true); // Start submission
                try {
                  await onSubmitMoves(gameWager);
                  setWereMovesSubmitted(true);
                  onClose();
                  const newGameSound = new Audio('/sounds/GenericNotify.mp3');
                  newGameSound.play();
                } catch (error) {
                  console.error('Error during submit:', error);
                } finally {
                  setIsSubmitting(false); // End submission regardless of outcome
                }
              }}
            >
              Submit moves on chain
            </Button>

            {/* Spinner or invisible box to maintain symmetry */}
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmitMovesModal;
