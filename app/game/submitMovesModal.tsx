import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react';

interface SubmitMovesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMoves: (gameWager: string) => Promise<void>;
  gameWager: string;
}

const SubmitMovesModal: React.FC<SubmitMovesModalProps> = ({
  isOpen,
  onClose,
  onSubmitMoves,
  gameWager
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent 
        bg="black" 
        color="white" 
        border="1px" 
        borderColor="white"
      >
        <ModalHeader>Game Over</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Checkmate! Please submit your moves on chain to complete the game.
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="green" onClick={() => {
            onSubmitMoves(gameWager).then(() => {
              onClose(); // Close the modal after submission
            });
          }}>
            Submit moves on chain
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmitMovesModal;
