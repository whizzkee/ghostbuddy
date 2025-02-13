import React from 'react';
import ConnectButton from './ConnectButton';

interface NavbarProps {
  connected: boolean;
  walletAddress: string;
  onConnect: (address: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ connected, walletAddress, onConnect }) => {
  return (
    <nav className="flex justify-between items-center px-5 py-2.5 bg-[#1c1c1e] text-white">
      <div className="text-xl font-bold cursor-pointer">GB</div>
      <ConnectButton label="Connect Wallet" onConnect={onConnect} walletAddress={walletAddress} />
    </nav>
  );
};

export default Navbar;
