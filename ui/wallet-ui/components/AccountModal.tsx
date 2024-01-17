import {
  Box,
  Button,
  Flex,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CopyIcon } from '@chakra-ui/icons';

import copyIconFeedback from 'ui/copyIconFeedback';

import Identicon from './Identicon';
import { useMetamask } from './Metamask';

import { useState, useEffect } from 'react';
import { useStateManager } from '../../../lib/api/sharedState';

const NETWORK_EXPLORER_URLS: { [key: string]: string } = {
  0x1: 'https://etherscan.io',
  0xa4b1: 'https://arbiscan.io',
  0xaa36a7: 'https://sepolia.etherscan.io',
  0x66eee: 'https://sepolia.arbiscan.io',
};

type Props = {
  isOpen: any;
  onClose: any;
};

export default function AccountModal({ isOpen, onClose }: Props) {
  const [account, setAccount] = useState<string>('');

  const { connect, deactivate, accounts } = useMetamask();

  const initialChainID = { chainID: 42161 };
  const [globalState, setGlobalState] = useStateManager(initialChainID);

  useEffect(() => {
    if (account == undefined && isOpen) {
      connect();
    }
    setAccount(accounts[0]);
  });

  function handleDeactivateAccount() {
    deactivate();
    setAccount('');
    onClose();
  }

  function copyAddress() {
    const copyText = account;
    navigator.clipboard.writeText(copyText);
    copyIconFeedback('Address copied');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent
        background="gray.900"
        border="1px"
        borderStyle="solid"
        borderColor="gray.700"
        borderRadius="3xl"
      >
        <ModalHeader color="white" px={4} fontSize="lg" fontWeight="medium">
          Account
        </ModalHeader>
        <ModalCloseButton
          color="white"
          fontSize="sm"
          _hover={{
            color: 'whiteAlpha.700',
          }}
        />
        <ModalBody pt={0} px={4}>
          <Box
            borderRadius="3xl"
            border="1px"
            borderStyle="solid"
            borderColor="gray.600"
            px={5}
            pt={4}
            pb={2}
            mb={3}
          >
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
              <Text color="gray.400" fontSize="sm">
                Connected with MetaMask
              </Text>
              <Button
                variant="outline"
                size="sm"
                borderColor="blue.800"
                borderRadius="3xl"
                color="blue.500"
                fontSize="13px"
                fontWeight="normal"
                px={2}
                height="26px"
                _hover={{
                  background: 'none',
                  borderColor: 'blue.300',
                  textDecoration: 'underline',
                }}
                onClick={handleDeactivateAccount}
              >
                Change
              </Button>
            </Flex>
            <Flex alignItems="center" mt={2} mb={4} lineHeight={1}>
              <Identicon account={account} />
              <Text
                color="white"
                fontSize="xl"
                fontWeight="semibold"
                ml="2"
                lineHeight="1.1"
              >
                {account &&
                  `${account.slice(0, 6)}...${account.slice(
                    account.length - 6,
                    account.length,
                  )}`}
              </Text>
            </Flex>
            <Flex alignContent="center" m={3}>
              <Button
                onClick={copyAddress}
                variant="link"
                color="gray.400"
                fontWeight="normal"
                fontSize="sm"
                _hover={{
                  textDecoration: 'none',
                  color: 'whiteAlpha.800',
                }}
              >
                <CopyIcon mr={1} />
                Copy Address
              </Button>
              <Link
                fontSize="sm"
                display="flex"
                alignItems="center"
                href={`${
                  NETWORK_EXPLORER_URLS[globalState.chainID]
                }/address/${account}`}
                isExternal
                color="gray.400"
                ml={6}
                _hover={{
                  color: 'whiteAlpha.800',
                  textDecoration: 'underline',
                }}
              >
                <ExternalLinkIcon mr={1} />
                View on Explorer
              </Link>
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter
          justifyContent="left"
          background="gray.700"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
          p={6}
        >
          <Text color="white" fontWeight="medium" fontSize="md"></Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
