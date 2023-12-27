import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react';

import {
  IsEncryptionKeyAvailable,
  IsDelegationAvailable,
  GetDelegation,
  GetEncryptionKey,
  IsSignerInWagerAddress,
} from '#/lib/api/form';

// Define the type for your props
interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMoves: (gameWager: string) => Promise<void>;
  gameWager: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
    isOpen,
    onClose,
    gameWager,
  }) => {
    const [isEncryptionKeyAvailable, setIsEncryptionKeyAvailable] =
      useState(true);
    const [isDelegationAvailable, setIsDelegationAvailable] = useState(true);
    const [delegationCompleted, setDelegationCompleted] = useState(false); // New state for tracking delegation completion
    const [initialOpen, setInitialOpen] = useState(isOpen);
 
    useEffect(() => {
      const checkAvailability = async () => {
        const isSignerInWagerAddress = await IsSignerInWagerAddress(gameWager);
  
        if (isSignerInWagerAddress) {
          const encryptionKeyAvailable = await IsEncryptionKeyAvailable();
          setIsEncryptionKeyAvailable(encryptionKeyAvailable);
  
          if (!encryptionKeyAvailable) {
            await GetEncryptionKey();
          }
  
          const delegationAvailable = await IsDelegationAvailable(gameWager);
          setIsDelegationAvailable(delegationAvailable);
  
          if (!delegationAvailable) {
            try {
                await GetDelegation(gameWager);
                onClose(); // Directly close the modal after successful completion
                setDelegationCompleted(true); // Set to true after GetDelegation call
            } catch (error) {
                setDelegationCompleted(false); // Set to true after GetDelegation call
            }
          }
        } else {
          console.log('Signer not in game');
        }
      };
  
      checkAvailability();
    }, [gameWager]);
  
    useEffect(() => {
        if (delegationCompleted) {
          onClose();
        }
      }, [delegationCompleted, onClose]);
    
      // Logic to determine if the modal should be open
      const shouldModalBeOpen = initialOpen && (!isEncryptionKeyAvailable || !isDelegationAvailable);
    
      // Logic to handle closing the modal
      const handleModalClose = () => {
        onClose();
        setInitialOpen(false); // Close the modal and update initialOpen state
      };

  return (
    <Modal isOpen={shouldModalBeOpen} onClose={handleModalClose} isCentered>
    <ModalOverlay />
      <ModalContent
        bg="black"
        color="white"
        border="1px"
        borderColor="white"
        maxWidth="lg" 
      >
        <ModalHeader>Game Initialization</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {!isEncryptionKeyAvailable ? (
              <Box>
                <Text fontSize="xl" width="full">
                  1. Share your public encryption key. 🔑
                </Text>
                <Text fontSize="md" width="full" fontStyle="italic">
                  Sharing your public key ensures secure storage of game data 
                </Text>
              </Box>
            ) : null}
            {!isDelegationAvailable && (
              <>
                <Box>
                  <Text fontSize="xl" width="full">
                    {isEncryptionKeyAvailable ? '1.' : '2.'} Generate a new
                    wallet signer. 🔏
                  </Text>
                  <Text fontSize="md" width="full" fontStyle="italic">
                    This ensures a seamless gameplay experience
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xl" width="full">
                    {isEncryptionKeyAvailable ? '2.' : '3.'} Sign game
                    delegation data. ✍️
                  </Text>
                  <Text fontSize="md" width="full" fontStyle="italic">
                    Allows the smart contract to prove that you played this game
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>{/* Your modal footer content goes here */}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SignatureModal;
