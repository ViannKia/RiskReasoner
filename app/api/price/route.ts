import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get('coin');

  console.log("💰 API price dipanggil untuk:", coin);

  if (!coin) {
    return NextResponse.json({ error: 'Missing coin parameter' }, { status: 400 });
  }

  const coinMap: { [key: string]: string } = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'sol': 'solana',
    'doge': 'dogecoin',
    'xrp': 'ripple',
    'hype': 'hype',
    'bnb': 'binancecoin',
    'leo': 'unusdollar',
  };

  const coinId = coinMap[coin.toLowerCase()] || coin.toLowerCase();
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    const data = await response.json();
    const price = data[coinId]?.usd;

    if (price) {
      return NextResponse.json({ price, symbol: coin.toUpperCase() });
    } else {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}