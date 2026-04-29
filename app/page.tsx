'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface QuestionAnswer {
  question: string;
  answer: string;
}

export default function Home() {
  // State untuk form
  const [asset, setAsset] = useState('BTC');
  const [entry, setEntry] = useState('');
  const [target, setTarget] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  
  // State untuk wizard
  const [step, setStep] = useState<'form' | 'question' | 'verdict'>('form');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState('');
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [showShake, setShowShake] = useState(false);

  // Ambil harga live dari CoinGecko
  useEffect(() => {
    const fetchPrice = async () => {
      const res = await fetch(`/api/price?coin=${asset.toLowerCase()}`);
      const data = await res.json();
      if (data.price) setLivePrice(data.price);
    };
    if (asset) fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [asset]);

  // Hitung Risk/Reward Ratio
  const entryNum = parseFloat(entry);
  const targetNum = parseFloat(target);
  const stopNum = parseFloat(stopLoss);
  const risk = entryNum - stopNum;
  const reward = targetNum - entryNum;
  const ratio = risk > 0 ? (reward / risk).toFixed(1) : '0';
  const isValid = entryNum && targetNum && stopNum && risk > 0;

  // Mulai pengujian AI
  const startTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset,
          entry: entryNum,
          target: targetNum,
          stopLoss: stopNum,
          answers: []
        })
      });
      const data = await res.json();
      setCurrentQuestion(data.message);
      setStep('question');
    } catch (error) {
      alert('Gagal memulai tes. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Kirim jawaban dan dapatkan pertanyaan berikutnya/verdict
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    setIsLoading(true);
    setShowShake(true);
    setTimeout(() => setShowShake(false), 300);

    const newAnswers = [...answers, { question: currentQuestion, answer: currentAnswer }];
    setAnswers(newAnswers);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset,
          entry: entryNum,
          target: targetNum,
          stopLoss: stopNum,
          answers: newAnswers
        })
      });
      const data = await res.json();
      
      if (data.message.includes('VERDIKT:') || newAnswers.length >= 3) {
        setVerdict(data.message);
        setStep('verdict');
      } else {
        setCurrentQuestion(data.message);
        setCurrentAnswer('');
      }
    } catch (error) {
      alert('Gagal memproses jawaban.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset semua
  const reset = () => {
    setStep('form');
    setAnswers([]);
    setCurrentAnswer('');
    setVerdict('');
    setCurrentQuestion('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      {/* Header dengan Logo */}
      <div className="flex items-center justify-between mb-8 border-b border-red-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
            🥊
          </div>
          <h1 className="text-2xl font-bold text-white">RiskReasoner</h1>
        </div>
        <div className="text-xs text-gray-500">Stress-test your trade</div>
      </div>

      {/* STEP 1: Form Input */}
      {step === 'form' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-red-400">📊 Command Center</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Asset</label>
                <select 
                  value={asset} 
                  onChange={(e) => setAsset(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                >
                  <option>BTC</option><option>ETH</option><option>SOL</option><option>DOGE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Harga Live ≈</label>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-green-400">
                  ${livePrice?.toLocaleString() || '...'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Entry Price ($)</label>
                <input 
                  type="number" value={entry} onChange={(e) => setEntry(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  placeholder="60000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
                <input 
                  type="number" value={target} onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  placeholder="70000"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Stop Loss ($)</label>
                <input 
                  type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                  placeholder="55000"
                />
              </div>
            </div>

            {isValid && (
              <div className={`p-4 rounded-lg mb-6 ${parseFloat(ratio) >= 2 ? 'bg-green-900/30 border border-green-500' : 'bg-yellow-900/30 border border-yellow-500'}`}>
                <div className="flex justify-between items-center">
                  <span>Risk/Reward Ratio</span>
                  <span className={`text-2xl font-bold ${parseFloat(ratio) >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                    1 : {ratio}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {parseFloat(ratio) >= 2 ? '✅ Rasio sehat (≥ 1:2)' : '⚠️ Rasio rendah, perbesar target atau perkecil risk'}
                </div>
              </div>
            )}

            <button
              onClick={startTest}
              disabled={!isValid || isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-white transition"
            >
              {isLoading ? 'Loading...' : '👊 UJI RENCANA INI'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Wizard Pertanyaan */}
      {step === 'question' && (
        <div className={`bg-gray-900/50 rounded-xl p-6 border border-red-500/50 ${showShake ? 'shake-effect' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-500 text-2xl">🥊</span>
            <span className="text-sm text-gray-400">Pertanyaan {answers.length + 1}/3</span>
          </div>
          
          <p className="text-lg mb-6 text-white">{currentQuestion}</p>
          
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Tulis jawaban Anda..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white min-h-[100px] mb-4"
          />
          
          <button
            onClick={submitAnswer}
            disabled={!currentAnswer.trim() || isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded-lg font-bold"
          >
            {isLoading ? 'Memproses...' : answers.length + 1 === 3 ? '📋 Lihat Verdict' : '💬 Lanjut'}
          </button>
        </div>
      )}

      {/* STEP 3: Verdict */}
      {step === 'verdict' && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-green-500/50">
          <h2 className="text-xl font-bold text-green-400 mb-4">📋 Verdict</h2>
          <div className="whitespace-pre-wrap text-gray-300 mb-6">{verdict}</div>
          
          <button
            onClick={reset}
            className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold"
          >
            🔄 Uji Rencana Lain
          </button>
        </div>
      )}
    </div>
  );
}