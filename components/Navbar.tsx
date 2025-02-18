import React from 'react';
import ConnectButton from './ConnectButton';

interface NavbarProps {
  walletAddress: string;
  onConnect: (address: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ walletAddress, onConnect }) => {
  return (
    <nav className="flex justify-between items-center px-3 sm:px-5 py-2.5 bg-[#1c1c1e] text-white">
      <div className="text-lg sm:text-xl font-bold cursor-pointer">GB</div>
      <div className="flex-shrink-0">
        <ConnectButton label="Connect Wallet" onConnect={onConnect} walletAddress={walletAddress} />
      </div>
    </nav>
  );
};

export default Navbar;
