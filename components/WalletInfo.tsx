'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWalletData } from '../utils/helius';
import type { WalletData } from '../utils/helius';
import Image from 'next/image';

interface WalletInfoProps {
  walletAddress: string;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ walletAddress }) => {
  const [walletData, setWalletData] = useState<WalletData>({
    solBalance: 0,
    tokens: [],
    nfts: [],
    recentTransactions: [],
    defiPositions: [],
    totalPortfolioValueUSD: 0,
    lastUpdated: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview'|'nfts'|'transactions'|'defi'>('overview');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const data = await getWalletData(walletAddress);
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const TabButton: React.FC<{name: string; active: boolean; onClick: () => void}> = ({name, active, onClick}) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'
      }`}
    >
      {name}
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-[#3c3c3e] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
        <p className="text-2xl font-bold">${walletData.totalPortfolioValueUSD.toFixed(2)} USD</p>
      </div>
      
      <div className="bg-[#3c3c3e] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">SOL Balance</h3>
        <p className="text-xl">{walletData.solBalance.toFixed(4)} SOL</p>
      </div>

      <div className="bg-[#3c3c3e] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Tokens ({walletData.tokens.length})</h3>
        <div className="space-y-2">
          {walletData.tokens.map((token) => (
            <div key={token.mint} className="flex items-center space-x-2">
              {token.logo && <Image src={token.logo} alt={token.tokenSymbol} className="w-6 h-6 rounded-full" />}
              <span>{token.tokenSymbol}</span>
              <span className="text-gray-400">
                {(Number(token.amount) / Math.pow(10, token.decimals)).toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNFTs = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {walletData.nfts.map((nft) => (
        <div key={nft.mint} className="bg-[#3c3c3e] p-4 rounded-lg">
          <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded-lg mb-2" />
          <h3 className="font-semibold">{nft.name}</h3>
          {nft.collection && <p className="text-sm text-gray-400">{nft.collection}</p>}
        </div>
      ))}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      {walletData.recentTransactions.map((tx) => (
        <div key={tx.signature} className="bg-[#3c3c3e] p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${tx.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {tx.type}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(tx.timestamp * 1000).toLocaleString()}
            </span>
          </div>
          {tx.amount && (
            <p className="mt-1">
              Amount: {tx.amount} {tx.token || 'SOL'}
            </p>
          )}
          <a
            href={`https://solscan.io/tx/${tx.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 mt-2 block"
          >
            View on Solscan
          </a>
        </div>
      ))}
    </div>
  );

  const renderDeFi = () => (
    <div className="space-y-4">
      {walletData.defiPositions.map((position, index) => (
        <div key={index} className="bg-[#3c3c3e] p-4 rounded-lg">
          <h3 className="font-semibold">{position.protocol}</h3>
          <p className="text-sm text-gray-400">{position.type}</p>
          <p className="mt-2">Value: ${position.value.toFixed(2)}</p>
          {position.apy && <p className="text-green-500">APY: {position.apy}%</p>}
          {position.tokenA && position.tokenB && (
            <p className="text-sm mt-1">
              {position.tokenA} - {position.tokenB}
            </p>
          )}
        </div>
      ))}
      {walletData.defiPositions.length === 0 && (
        <p className="text-center text-gray-400">No DeFi positions found</p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#2c2c2e] p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto"
    >
      <div className="flex space-x-4 mb-6">
        <TabButton name="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <TabButton name="NFTs" active={activeTab === 'nfts'} onClick={() => setActiveTab('nfts')} />
        <TabButton name="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        <TabButton name="DeFi" active={activeTab === 'defi'} onClick={() => setActiveTab('defi')} />
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'nfts' && renderNFTs()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'defi' && renderDeFi()}

      <div className="text-xs text-gray-500 mt-4 text-right">
        Last updated: {new Date(walletData.lastUpdated).toLocaleString()}
      </div>
    </motion.div>
  );
};

export default WalletInfo;
