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
  const handleConnect = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response: SolanaResponse = await window.solana.connect({ onlyIfTrusted: false });
        console.log('Connected with public key:', response.publicKey.toString());
        onConnect(response.publicKey.toString());
      } else {
        // If Phantom is not installed, redirect to install page
        window.open('https://phantom.app/', '_blank');
      }
    } catch (err) {
      console.error('Connection failed:', err);
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
