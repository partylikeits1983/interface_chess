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
  IsEncryptionKeyAvailable,
  IsDelegationAvailable,
  GetDelegation,
  GetEncryptionKey,
} from '#/lib/api/form';

// Define the type for your props
interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMoves: (gameWager: string) => Promise<void>;
  gameWager: string;
  wereMovesSubmitted: boolean;
  setWereMovesSubmitted: (value: boolean) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSubmitMoves,
  gameWager,
  wereMovesSubmitted,
  setWereMovesSubmitted,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEncryptionKeyAvailable, setIsEncryptionKeyAvailable] =
    useState(true);
  const [isDelegationAvailable, setIsDelegationAvailable] = useState(true);

  useEffect(() => {
    const checkDoesDelegationExist = async () => {
      const isEncryptionKeyAvailable = await IsEncryptionKeyAvailable();

      if (!isEncryptionKeyAvailable) {
        setIsEncryptionKeyAvailable(false);
        await GetEncryptionKey();
        setIsEncryptionKeyAvailable(true);
      }

      const isDelegationAvailable = await IsDelegationAvailable(gameWager);
      if (!isDelegationAvailable) {
        setIsDelegationAvailable(false);
        await GetDelegation(gameWager);
        setIsDelegationAvailable(true);
      }
    };

    checkDoesDelegationExist();
  }, [gameWager]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg="black"
        color="white"
        border="1px"
        borderColor="white"
        maxWidth="2xl"
      >
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody></ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignatureModal;
