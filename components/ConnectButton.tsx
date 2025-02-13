'use client';

import React from 'react';

interface SolanaResponse {
  publicKey: {
    toString: () => string;
  };
}

interface ConnectButtonProps {
  label: string;
  onConnect: (address: string) => void;
  walletAddress?: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ label, onConnect, walletAddress }) => {
  const handleConnect = () => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.connect({ onlyIfTrusted: false })
        .then((response: SolanaResponse) => {
          console.log('Connected with public key:', response.publicKey.toString());
          onConnect(response.publicKey.toString());
        })
        .catch((err: Error) => {
          console.error('Connection failed:', err);
        });
    } else {
      console.error('Phantom wallet not found.');
    }
  };

  const displayLabel = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : label;

  return (
    <button 
      onClick={handleConnect} 
      className="px-6 py-3 bg-[#5c6bc0] text-white border-none rounded-md cursor-pointer text-base"
    >
      {displayLabel}
    </button>
  );
};

export default ConnectButton;
