'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getWalletData, WalletData } from '../utils/helius';
import Image from 'next/image';

interface WalletInfoProps {
  walletAddress: string;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ walletAddress }) => {
  const [walletData, setWalletData] = useState<WalletData>({ solBalance: 0, tokens: [] });
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
      className="bg-[#2c2c2e] p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-md mx-auto"
    >
      <h2 className="text-xl sm:text-2xl text-white mb-4">Wallet Details</h2>
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-[#3c3c3e] p-3 sm:p-4 rounded-lg">
          <p className="text-[#b0b0b0] text-xs sm:text-sm">Wallet Address</p>
          <p className="text-white text-sm sm:text-base font-mono break-all">{`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}</p>
          <button 
            onClick={() => navigator.clipboard.writeText(walletAddress)}
            className="mt-1 text-xs text-[#5c6bc0] hover:text-[#7986cb] transition-colors"
          >
            Copy full address
          </button>
        </div>
        <div className="bg-[#3c3c3e] p-3 sm:p-4 rounded-lg">
          <p className="text-[#b0b0b0] text-xs sm:text-sm">SOL Balance</p>
          {loading ? (
            <div className="animate-pulse h-5 sm:h-6 bg-[#4c4c4e] rounded w-24"></div>
          ) : (
            <p className="text-white text-lg sm:text-xl">{walletData.solBalance.toFixed(4)} SOL</p>
          )}
        </div>
        
        {!loading && walletData.tokens.length > 0 && (
          <div className="bg-[#3c3c3e] p-3 sm:p-4 rounded-lg">
            <p className="text-[#b0b0b0] text-xs sm:text-sm mb-3">Token Balances</p>
            <div className="space-y-2 sm:space-y-3 max-h-[200px] overflow-y-auto sm:overflow-visible sm:max-h-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {walletData.tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {token.logo ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-[#4c4c4e]">
                        <Image
                          src={token.logo}
                          alt={token.tokenSymbol}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4c4c4e] flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs text-white">
                          {token.tokenSymbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-white text-sm sm:text-base">
                      {token.tokenSymbol}
                    </span>
                  </div>
                  <span className="text-white text-sm sm:text-base">
                    {Number(token.amount) / Math.pow(10, token.decimals) >= 1
                      ? (Number(token.amount) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                          maximumFractionDigits: 2
                        })
                      : (Number(token.amount) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                          minimumSignificantDigits: 1,
                          maximumSignificantDigits: 4
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
