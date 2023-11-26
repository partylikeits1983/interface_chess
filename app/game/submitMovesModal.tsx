import React from 'react';
import { useState, useEffect } from 'react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';
import { GetGameNumber } from '#/lib/api/form';

import { GetGameNumberDB } from '#/lib/api/gaslessAPI'; 

interface SubmitMovesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMoves: (gameWager: string) => Promise<void>;
  gameWager: string;
  gameID: number;
}

const SubmitMovesModal: React.FC<SubmitMovesModalProps> = ({
  isOpen,
  onClose,
  onSubmitMoves,
  gameWager,
  gameID,
}) => {

  // const [hasGameBeenWrittenToSC, setHasGameBeenWrittenToSC] = useState(false);

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
          <Button
            colorScheme="green"
            onClick={() => {
              onSubmitMoves(gameWager).then(() => {
                onClose(); // Close the modal after submission
              });
            }}
          >
            Submit moves on chain
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmitMovesModal;
