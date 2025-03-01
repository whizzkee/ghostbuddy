import { HELIUS_API_KEY, HELIUS_RPC_URL } from '../config/helius';
import { Connection, PublicKey } from '@solana/web3.js';

export const connection = new Connection(HELIUS_RPC_URL);

interface HeliusTokenBalance {
  mint: string;
  amount: string;
  decimals: number;
}

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  tokenName: string;
  tokenSymbol: string;
  logo?: string;
}

export interface NFTData {
  mint: string;
  name: string;
  symbol: string;
  image: string;
  collection?: string;
  attributes?: Array<{trait_type: string; value: string}>;
}

export interface TransactionHistory {
  signature: string;
  timestamp: number;
  type: string;
  status: string;
  amount?: number;
  token?: string;
}

export interface DeFiPosition {
  protocol: string;
  type: string;  // e.g., "LP", "Stake", "Loan"
  value: number;
  tokenA?: string;
  tokenB?: string;
  apy?: number;
}

export interface WalletData {
  solBalance: number;
  tokens: TokenBalance[];
  nfts: NFTData[];
  recentTransactions: TransactionHistory[];
  defiPositions: DeFiPosition[];
  totalPortfolioValueUSD: number;
  lastUpdated: number;
}

interface PhantomToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
}

async function getPhantomTokenList(): Promise<Map<string, PhantomToken>> {
  try {
    // Try Jupiter token list as primary source
    const response = await fetch('https://token.jup.ag/strict', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token list: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Create a map of token address to token info
    const tokenMap = new Map<string, PhantomToken>();
    
    if (!Array.isArray(data)) {
      console.error('Expected array of tokens, got:', typeof data);
      return tokenMap;
    }

    data.forEach((token: any) => {
      if (token.address && token.symbol) {
        tokenMap.set(token.address, {
          address: token.address,
          chainId: 101, // Solana mainnet
          decimals: token.decimals,
          name: token.name,
          symbol: token.symbol,
          logoURI: token.logoURI
        });
      }
    });

    console.log('Loaded token list with', tokenMap.size, 'tokens');
    return tokenMap;
  } catch (error) {
    console.error('Error fetching token list:', error);
    return new Map<string, PhantomToken>();
  }
}

export async function getWalletData(address: string): Promise<WalletData> {
  try {
    const publicKey = new PublicKey(address);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);

    // Get token list
    const tokenList = await getPhantomTokenList();

    // Parallel data fetching for better performance
    const [tokenBalances, nftData, transactions] = await Promise.all([
      // Get token balances using Helius API
      fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${HELIUS_API_KEY}`).then(res => res.json()),
      // Get NFTs using Helius API
      fetch(`https://api.helius.xyz/v0/addresses/${address}/nfts?api-key=${HELIUS_API_KEY}`).then(res => res.json()),
      // Get recent transactions
      fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`).then(res => res.json())
    ]);

    // Process token balances
    const processedTokens = tokenBalances.tokens?.map((token: HeliusTokenBalance) => {
      const tokenInfo = tokenList.get(token.mint);
      return {
        mint: token.mint,
        amount: token.amount,
        decimals: token.decimals,
        tokenName: tokenInfo?.name || 'Unknown',
        tokenSymbol: tokenInfo?.symbol || 'Unknown',
        logo: tokenInfo?.logoURI
      };
    }) || [];

    // Process NFTs
    const processedNFTs = (nftData.nfts || []).map((nft: any) => ({
      mint: nft.mint,
      name: nft.name,
      symbol: nft.symbol,
      image: nft.image,
      collection: nft.collection?.name,
      attributes: nft.attributes
    }));

    // Process transactions
    const processedTransactions = (transactions.transactions || []).map((tx: any) => ({
      signature: tx.signature,
      timestamp: tx.timestamp,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      token: tx.token
    }));

    // For now, return empty DeFi positions - this will be implemented in the next phase
    const defiPositions: DeFiPosition[] = [];

    // Calculate total portfolio value (placeholder - will be implemented with price feeds)
    const totalPortfolioValueUSD = 0; // To be implemented

    return {
      solBalance: solBalance / 1e9,
      tokens: processedTokens,
      nfts: processedNFTs,
      recentTransactions: processedTransactions,
      defiPositions,
      totalPortfolioValueUSD,
      lastUpdated: Date.now()
    };

  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return {
      solBalance: 0,
      tokens: [],
      nfts: [],
      recentTransactions: [],
      defiPositions: [],
      totalPortfolioValueUSD: 0,
      lastUpdated: Date.now()
    };
  }
}
