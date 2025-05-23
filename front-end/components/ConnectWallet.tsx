'use client';

import { useContext, useState, useEffect } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RiFileCopyLine, RiCloseLine } from 'react-icons/ri';

interface ConnectWalletButtonProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

export const ConnectWalletButton = (buttonProps: ConnectWalletButtonProps) => {
  const { children } = buttonProps;
  const [didCopyAddress, setDidCopyAddress] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(children || 'Connect');
  const { authenticate, isWalletConnected, mainnetAddress, testnetAddress, network, disconnect } =
    useContext(HiroWalletContext);

  const currentAddress = network === 'testnet' ? testnetAddress : mainnetAddress;

  useEffect(() => {
    const checkWalletConnection = () => {
      if (isWalletConnected && currentAddress) {
        setButtonLabel(truncateMiddle(currentAddress));
      } else {
        setButtonLabel(children || 'Connect');
      }
    };

    // Initial check
    checkWalletConnection();

    // Add a listener or polling mechanism
    const interval = setInterval(() => {
      checkWalletConnection();
    }, 1000); // Poll every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [isWalletConnected, currentAddress, children]);

  const copyAddress = () => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress);
      setDidCopyAddress(true);
      setTimeout(() => {
        setDidCopyAddress(false);
      }, 1000);
    }
  };

  const truncateMiddle = (str: string | null) => {
    if (!str) return '';
    if (str.length <= 12) return str;
    return `${str.slice(0, 3)}~${str.slice(-3)}`;
  };

  return (
    <TooltipProvider>
      {isWalletConnected ? (
        <div className="flex items-center gap-2 px-2 rounded-md bg-gray-200 z-100 relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-800 cursor-pointer">{truncateMiddle(currentAddress)}</span>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="!mt-0 z-[9999]">
              <p>{didCopyAddress ? 'Copied!' : 'Copy address'}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Copy address"
                className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer z-200"
                onClick={copyAddress}
              >
                <RiFileCopyLine size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="z-[9999]">
              <p>{didCopyAddress ? 'Copied!' : 'Copy address'}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Disconnect"
                className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={disconnect}
              >
                <RiCloseLine size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="z-[9999]">
              <p>Disconnect</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <Button
          onClick={authenticate}
          className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          {...buttonProps}
        >
          {buttonLabel}
        </Button>
      )}
    </TooltipProvider>
  );
};
