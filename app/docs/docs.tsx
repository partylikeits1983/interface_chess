'use client';

import {
  Box,
  OrderedList,
  ListItem,
  Text,
  ChakraProvider,
} from '@chakra-ui/react';

export default function Docs() {
  return (
    <ChakraProvider>
      <Box color="white">
        <Text mb={4} fontSize="xl" fontWeight="bold">
          Welcome to the Chess Wager Application!
        </Text>
        <Text mb={4} fontSize="lg" lineHeight="taller">
          Here&apos;s a step-by-step guide on how to use our application:
        </Text>
        <OrderedList spacing={4}>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 1:</b> To get started, visit the &quot;Create a
              Challenge&quot; page. Here, you can set the parameters of your
              chess match, such as the time limit and the number of games to be
              played.
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 2:</b> Once you&apos;ve set your chess parameters, you can
              choose the ERC20 token you want to wager. Once you&apos;ve
              selected the token, you&apos;ll need to approve the smart contract
              to access your funds.
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 3:</b> After you&apos;ve approved the tokens, you can
              submit your wager. The smart contract will hold the wagered assets
              until a winner is determined.
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 4:</b> Once you&apos;ve submitted your wager, the other
              player must accept the terms of the wager. If they do not accept,
              the wager will be cancelled.
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 5:</b> The chess smart contract will keep track of the
              entire state of the games and can algorithmically determine the
              winner of the wager.
            </Text>
          </ListItem>
          <ListItem>
            <Text fontSize="lg">
              <b>Step 6:</b> Once a winner is determined, they can claim their
              winnings on the &quot;Matches&quot; page. The winner will be sent
              the assets in the chess wager contract.
            </Text>
          </ListItem>
        </OrderedList>
        <Text mt={4} fontSize="lg" lineHeight="taller">
          That&apos;s it! We hope you enjoy using our Chess Wager Application.
          If you have any questions or issues, please don&apos;t hesitate to
          contact our support team.
        </Text>
      </Box>
    </ChakraProvider>
  );
}