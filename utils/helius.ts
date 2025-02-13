import { HELIUS_API_KEY, HELIUS_RPC_URL } from '../config/helius';
import { Connection, PublicKey } from '@solana/web3.js';

export const connection = new Connection(HELIUS_RPC_URL);

export interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  tokenName: string;
  tokenSymbol: string;
  logo?: string;
}

export interface WalletData {
  solBalance: number;
  tokens: TokenBalance[];
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
    console.log('Token list size:', tokenList.size);

    // Get token balances using Helius API
    const response = await fetch(`https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${HELIUS_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch token balances: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.tokens || !Array.isArray(data.tokens)) {
      console.error('Unexpected response format from Helius API:', data);
      return {
        solBalance: solBalance / 1e9,
        tokens: []
      };
    }
    
    // Transform token balances
    const tokens = data.tokens
      .map((token: any) => {
        // Log the mint address we're looking up
        console.log('Looking up token:', token.mint);
        const tokenInfo = tokenList.get(token.mint);
        console.log('Token info found:', tokenInfo ? 'yes' : 'no');
        
        // Keep the raw amount as a string to preserve precision
        const rawAmount = token.amount;
        
        if (rawAmount && rawAmount !== '0') {
          return {
            mint: token.mint,
            amount: rawAmount,
            decimals: token.decimals || tokenInfo?.decimals || 0,
            tokenName: tokenInfo?.name || `Unknown Token`,
            tokenSymbol: tokenInfo?.symbol || 'UNKNOWN',
            logo: tokenInfo?.logoURI
          };
        }
        return null;
      })
      .filter((token: TokenBalance | null): token is TokenBalance => token !== null);

    // Debug logging
    tokens.forEach(token => {
      console.log(`Token ${token.tokenSymbol} (${token.mint}):`, {
        rawAmount: token.amount,
        decimals: token.decimals,
        uiAmount: Number(token.amount) / Math.pow(10, token.decimals)
      });
    });

    return {
      solBalance: solBalance / 1e9,
      tokens
    };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw error;
  }
}
