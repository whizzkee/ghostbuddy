'use client'

import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import React, { useState } from 'react';

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = (address: string) => {
    setConnected(true);
    setWalletAddress(address);
  };

  return (
    <>
      <Navbar walletAddress={walletAddress} onConnect={handleConnect} />
      <HeroSection connected={connected} onConnect={handleConnect} walletAddress={walletAddress} />
    </>
  );
}
