import { useEffect, RefObject, useRef } from 'react';
import Jazzicon from '@metamask/jazzicon';
import styled from '@emotion/styled';

const StyledIdenticon = styled.div`
  height: 2rem; // Increase the height to your desired size
  width: 2rem; // Increase the width to your desired size
  svg {
    transform: scale(1); // Adjust the scale factor to resize the Identicon
  }
`;

interface IdenticonProps {
  account: string;
  account2?: string;
}

export default function Identicon({ account, account2 = '' }: IdenticonProps) {
  const ref: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = '';
      const identicon = Jazzicon(
        16,
        parseInt(account.slice(2, 10) + account2, 16),
      );
      identicon.style.transform = 'scale(2)'; // Adjust the scale factor to resize the Identicon
      ref.current.appendChild(identicon);
    }
  }, [account]);

  return <StyledIdenticon ref={ref} />;
}
