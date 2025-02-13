'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWalletData, WalletData } from '../utils/helius';
import Image from 'next/image';

interface WalletInfoProps {
  walletAddress: string;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ walletAddress }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [walletAddress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#2c2c2e] p-8 rounded-lg shadow-lg w-full max-w-md"
    >
      <h2 className="text-2xl text-white mb-4">Wallet Details</h2>
      <div className="space-y-4">
        <div className="bg-[#3c3c3e] p-4 rounded-lg">
          <p className="text-[#b0b0b0] text-sm">Wallet Address</p>
          <p className="text-white font-mono break-all">{walletAddress}</p>
        </div>
        <div className="bg-[#3c3c3e] p-4 rounded-lg">
          <p className="text-[#b0b0b0] text-sm">SOL Balance</p>
          {loading ? (
            <div className="animate-pulse h-6 bg-[#4c4c4e] rounded w-24"></div>
          ) : (
            <p className="text-white text-xl">{walletData?.solBalance?.toFixed(4) ?? '0.0000'} SOL</p>
          )}
        </div>
        
        {!loading && walletData?.tokens.length > 0 && (
          <div className="bg-[#3c3c3e] p-4 rounded-lg">
            <p className="text-[#b0b0b0] text-sm mb-3">Token Balances</p>
            <div className="space-y-3">
              {walletData.tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {token.logo ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-[#4c4c4e]">
                        <Image
                          src={token.logo}
                          alt={token.tokenSymbol}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#4c4c4e] flex items-center justify-center">
                        <span className="text-xs text-white">
                          {token.tokenSymbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-white">
                      {token.tokenSymbol}
                    </span>
                  </div>
                  <span className="text-white">
                    {Number(token.amount) / Math.pow(10, token.decimals) >= 1
                      ? (Number(token.amount) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })
                      : (Number(token.amount) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                          minimumSignificantDigits: 1,
                          maximumSignificantDigits: 6
                        })
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WalletInfo;
