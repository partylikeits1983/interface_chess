// MyComponent.tsx
import React, { useState } from 'react';
import { Button, ChakraProvider, Tooltip } from '@chakra-ui/react';
import { DownloadIcon, LinkIcon } from '@chakra-ui/icons';
import { checkIfGasless, submitMoves, DownloadMoves } from 'lib/api/gaslessAPI';

interface DownloadMovesButtonProps {
  wager: string;
}

const DownloadMovesButton: React.FC<DownloadMovesButtonProps> = ({ wager }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleDownload = async (wager: string) => {
    // Make sure wagerAddress is available
    try {
      const data = await DownloadMoves(wager); // Assuming this function returns a JSON object
      const json = JSON.stringify(data);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `ChessFishWager:${wager}.json`; // Updated file name for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error('Error downloading moves:', error);
    }
  };

  return (
    <>
      <style>
        {`
    .small-screen-button {
      font-size: 14px; /* Default smaller font size */
    }

    @media (max-width: 600px) {
      .small-screen-button {
        font-size: 12px; /* Even smaller font size on small screens */
      }
    }

    .icon-button-text {
      display: none;
    }

    .icon-button:hover .icon-button-text {
      display: inline;
    }

    .button-container {
      display: flex;
      justify-content: flex-end; /* Aligns buttons to the right */
    }
  `}
      </style>

      <div className="button-container">
        <Button
          className="small-screen-button"
          colorScheme="green"
          onClick={() => submitMoves(wager)}
        >
          Submit moves on chain
          <LinkIcon ml={2} /> {/* Adjust the icon name and margin as needed */}
        </Button>

        <Button
          className="icon-button"
          colorScheme="black"
          onClick={() => handleDownload(wager)} // Updated onClick event handler
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Tooltip label="Download Gasless Move Data" isOpen={isHovered}>
            <DownloadIcon />
          </Tooltip>
        </Button>
      </div>
    </>
  );
};

export default DownloadMovesButton;
