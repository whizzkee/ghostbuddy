'use client';

import React, { useState, useEffect } from 'react';
import ConnectButton from './ConnectButton';
import WalletInfo from './WalletInfo';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  connected: boolean;
  onConnect: (address: string) => void;
  walletAddress: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ connected, onConnect, walletAddress }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  useEffect(() => {
    if (connected) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setShowWalletInfo(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  return (
    <section className="flex justify-center items-center h-[80vh] bg-[#1c1c1e]">
      <AnimatePresence mode="wait">
        {!connected && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#2c2c2e] p-8 rounded-lg text-center shadow-lg"
          >
            <h1 className="text-2xl text-white">Connect to Phantom</h1>
            <p className="text-base text-[#b0b0b0] mb-5">Manage your Phantom assets in one place</p>
            <ConnectButton label="Connect" onConnect={onConnect} walletAddress={walletAddress} />
          </motion.div>
        )}

        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-[#2c2c2e] p-8 rounded-lg text-center shadow-lg"
          >
            <h1 className="text-2xl text-white">Welcome to GhostBuddy</h1>
          </motion.div>
        )}

        {showWalletInfo && (
          <motion.div
            key="wallet-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WalletInfo walletAddress={walletAddress} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
