"use client";

import { useState, useEffect } from "react";

interface QuestionAnswer {
  question: string;
  answer: string;
}

export default function Home() {
  // State untuk form
  const [asset, setAsset] = useState("BTC");
  const [entry, setEntry] = useState("");
  const [target, setTarget] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  // State untuk wizard
  const [step, setStep] = useState<"form" | "question" | "verdict">("form");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [score, setScore] = useState<number | null>(null);
  const [scoreLabel, setScoreLabel] = useState("");
  const [coinList, setCoinList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoins = async () => {
      const res = await fetch("/api/coins");
      const data = await res.json();
      setCoinList(data);
    };
    fetchCoins();
  }, []);

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
  const ratio = risk > 0 ? (reward / risk).toFixed(1) : "0";
  const isValid = entryNum && targetNum && stopNum && risk > 0;

  const formatNumber = (num: number) => {
    return num > 0 ? num.toLocaleString() : "—";
  };

  // Parse score dari verdict (misal "VERDIKT: 75")
  const parseScore = (text: string) => {
    const match = text.match(/VERDIKT:\s*(\d+)/i);
    if (match) {
      const s = parseInt(match[1]);
      setScore(s);
      if (s >= 80) setScoreLabel("Strategic Pro 🎯");
      else if (s >= 60) setScoreLabel("Cautious Trader 📊");
      else if (s >= 40) setScoreLabel("FOMO Warning ⚠️");
      else setScoreLabel("Gambling Mode 🎲");
    }
  };

  // Mulai pengujian AI
  const startTest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          entry: entryNum,
          target: targetNum,
          stopLoss: stopNum,
          answers: [],
        }),
      });
      const data = await res.json();
      setCurrentQuestion(data.message);
      setCurrentQuestionNum(1);
      setStep("question");
    } catch (error) {
      alert("Gagal memulai tes. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Kirim jawaban dan dapatkan pertanyaan berikutnya/verdict
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    setIsLoading(true);

    const newAnswers = [
      ...answers,
      { question: currentQuestion, answer: currentAnswer },
    ];
    setAnswers(newAnswers);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          entry: entryNum,
          target: targetNum,
          stopLoss: stopNum,
          answers: newAnswers,
        }),
      });
      const data = await res.json();

      if (data.message.includes("VERDIKT:") || newAnswers.length >= 3) {
        parseScore(data.message);
        setVerdict(data.message);
        setStep("verdict");
      } else {
        setCurrentQuestion(data.message);
        setCurrentAnswer("");
        setCurrentQuestionNum((prev) => prev + 1);
      }
    } catch (error) {
      alert("Gagal memproses jawaban.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep("form");
    setAnswers([]);
    setCurrentAnswer("");
    setVerdict("");
    setCurrentQuestion("");
    setCurrentQuestionNum(1);
    setScore(78);
    setScoreLabel("High Risk");
    // Reset input form
    setEntry("");
    setTarget("");
    setStopLoss("");
    setAsset("BTC");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-10">
      <div className="max-w-6xl mx-auto p-6">
        {/* HEADER with modern design */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🥊</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                RiskReasoner
              </h1>
              <p className="text-xs text-gray-500">
                Stress-test your trading plan
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-gray-600">
              AI-Powered Risk Analyzer
            </div>
            <div className="text-xs text-gray-700">v1.0</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div>
          {step !== "verdict" ? (
            // TAMPILAN 2 KOLOM (form & question)
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN - Summary */}
              <div className="lg:col-span-1 space-y-4">
                {/* Trade Summary Card */}
                <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 p-5">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                    <span>📋</span> Trade Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Asset</span>
                      <span className="text-white font-bold text-lg">
                        {asset}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Entry</span>
                      <span className="text-white">
                        ${entryNum > 0 ? entryNum.toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Target</span>
                      <span className="text-green-400">
                        ${targetNum > 0 ? targetNum.toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Stop Loss</span>
                      <span className="text-red-400">
                        ${stopNum > 0 ? stopNum.toLocaleString() : "—"}
                      </span>
                    </div>
                    {livePrice && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                        <span className="text-gray-500 text-sm">
                          Live Price
                        </span>
                        <span className="text-blue-400 font-mono">
                          ${livePrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk/Reward Card */}
                {entry !== "" &&
                  target !== "" &&
                  stopLoss !== "" &&
                  isValid && (
                    <div
                      className={`rounded-2xl border p-5 backdrop-blur-sm ${
                        parseFloat(ratio) >= 2
                          ? "bg-green-900/20 border-green-500/50"
                          : "bg-yellow-900/20 border-yellow-500/50"
                      }`}
                    >
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <span>⚖️</span> Risk/Reward Ratio
                      </h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          1 : {ratio}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${parseFloat(ratio) >= 2 ? "bg-green-500" : "bg-yellow-500"}`}
                            style={{
                              width: `${Math.min(100, (parseFloat(ratio) / 4) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          {parseFloat(ratio) >= 2
                            ? "✅ Rasio sehat"
                            : "⚠️ Rasio kurang"}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* RIGHT COLUMN - Form & Question */}
              <div className="lg:col-span-2">
                {/* STEP 1: Form Input */}
                {step === "form" && (
                  <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <span className="text-red-500">🎯</span> Enter Your Trade
                      Plan
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Asset
                        </label>
                        <select
                          value={asset}
                          onChange={(e) => setAsset(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white"
                        >
                          {coinList.map((coin) => (
                            <option key={coin.symbol} value={coin.symbol}>
                              {coin.symbol} - {coin.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Entry Price ($)
                        </label>
                        <input
                          type="number"
                          value={entry}
                          onChange={(e) => setEntry(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white"
                          placeholder="60000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Target Price ($)
                        </label>
                        <input
                          type="number"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-green-400"
                          placeholder="70000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Stop Loss ($)
                        </label>
                        <input
                          type="number"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-red-400"
                          placeholder="55000"
                        />
                      </div>
                    </div>

                    <button
                      onClick={startTest}
                      disabled={!isValid || isLoading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 py-4 rounded-xl font-bold text-white"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        "👊 UJI RENCANA INI"
                      )}
                    </button>
                  </div>
                )}

                {/* STEP 2: Questions */}
                {step === "question" && (
                  <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6">
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Stress Test Progress</span>
                        <span>{currentQuestionNum}/3</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(currentQuestionNum / 3) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-3xl">🥊</span>
                        <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">
                          Kritik #{currentQuestionNum}
                        </span>
                      </div>
                      <div className="bg-red-950/30 rounded-xl p-5 border-l-4 border-red-500">
                        <p className="text-white text-sm leading-relaxed">
                          {currentQuestion}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Tulis jawaban Anda di sini..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white min-h-[120px] resize-none"
                      />
                      <button
                        onClick={submitAnswer}
                        disabled={!currentAnswer.trim() || isLoading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 py-4 rounded-xl font-bold text-white"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : currentQuestionNum === 3 ? (
                          "📋 LIHAT VERDIKT"
                        ) : (
                          "💬 LANJUTKAN"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // TAMPILAN 1 KOLOM (verdict) - full width tanpa summary
            <div className="max-w-3xl mx-auto">
              {/* STEP 3: Verdict Dashboard */}
              <div className="space-y-5">
                {/* Header Dashboard */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Trade Verdict Dashboard
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      AI-powered risk analysis
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                      {asset}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Risk Score Card */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🎯</span>
                        <span className="text-sm font-medium text-gray-400">
                          Risk Score
                        </span>
                      </div>
                      <div className="text-5xl font-bold text-white mt-1">
                        {score || 78}
                      </div>
                      <div className="text-sm text-gray-500">/ 100</div>
                    </div>
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#1f2937"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke={
                            (score || 78) >= 70
                              ? "#ef4444"
                              : (score || 78) >= 50
                                ? "#eab308"
                                : "#22c55e"
                          }
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${((score || 78) * 214) / 100} 214`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {(score || 78) >= 70
                            ? "🔴"
                            : (score || 78) >= 50
                              ? "🟡"
                              : "🟢"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${(score || 78) >= 70 ? "bg-red-500/20 text-red-400" : (score || 78) >= 50 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}
                    >
                      {(score || 78) >= 70
                        ? "High Risk Trade"
                        : (score || 78) >= 50
                          ? "Medium Risk Trade"
                          : "Low Risk Trade"}
                    </div>
                  </div>
                </div>

                {/* Emotional Risk & Portfolio Match */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 rounded-2xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <div className="text-xs text-gray-500">
                          Emotional Risk
                        </div>
                        <div className="text-lg font-bold text-red-400">
                          HIGH
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full w-[75%]"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ FOMO terdeteksi dari entry price
                    </p>
                  </div>

                  <div className="bg-gray-900/40 rounded-2xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📊</span>
                      <div>
                        <div className="text-xs text-gray-500">
                          Portfolio Match
                        </div>
                        <div className="text-lg font-bold text-yellow-400">
                          MEDIUM
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full w-[50%]"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      🔄 Diversifikasi disarankan
                    </p>
                  </div>
                </div>

                {/* Best Action Card */}
                <div className="bg-gray-900/40 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm font-medium text-gray-400">
                      Best Action
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex-1 py-3 px-4 rounded-xl font-semibold bg-yellow-600/20 border border-yellow-500/50 text-yellow-400">
                      ⏳ WAIT
                    </button>
                    <button className="flex-1 py-3 px-4 rounded-xl font-semibold bg-green-600/20 border border-green-500/50 text-green-400">
                      💰 BUY SMALL
                    </button>
                    <button
                      className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gray-800 text-gray-500 cursor-not-allowed"
                      disabled
                    >
                      🚫 AVOID
                    </button>
                  </div>
                </div>

                {/* AI Explanation Card */}
                <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/20 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">
                        AI Explanation
                      </h3>
                      <div className="text-sm text-gray-400 leading-relaxed">
                        {verdict.replace(/VERDIKT:\s*\d+\s*/, "").trim() ||
                          "Risk/reward ratio kurang optimal. Entry terlalu dekat dengan resistance. Pertimbangkan untuk menunggu pullback atau menaikkan target."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={reset}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-semibold"
                  >
                    🔄 Uji Rencana Lain
                  </button>
                  <button
                    onClick={() => alert("Fitur share akan segera hadir")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
                  >
                    📤 Bagikan ke X
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
