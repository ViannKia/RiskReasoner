import { NextResponse } from 'next/server';

export async function GET() {
  const coinMap: { [key: string]: string } = {
    'btc': 'Bitcoin',
    'eth': 'Ethereum',
    'xrp': 'Ripple',
    'bnb': 'Binance Coin',
    'sol': 'Solana',
    'trx': 'Tron',
    'doge': 'Dogecoin',
    'hype': 'Hyperliquid',
    'leo': 'LEO Token',
    'bch': 'Bitcoin Cash',
  };

  const coins = Object.keys(coinMap).map(symbol => ({
    symbol: symbol.toUpperCase(),
    name: coinMap[symbol]
  }));

  return NextResponse.json(coins);
}