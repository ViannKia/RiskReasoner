import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { answers, asset, entry, target, stopLoss } = await request.json();

    const entryNum = parseFloat(entry);
    const targetNum = parseFloat(target);
    const stopNum = parseFloat(stopLoss);
    const riskPercent = ((entryNum - stopNum) / entryNum * 100).toFixed(1);
    const rewardPercent = ((targetNum - entryNum) / entryNum * 100).toFixed(1);
    const ratio = ((targetNum - entryNum) / (entryNum - stopNum)).toFixed(1);

    // Kumpulan pertanyaan (3 pertanyaan berbeda)
    const questions = [
      `Dengan entry di $${entryNum} dan stop loss di $${stopNum} (risiko -${riskPercent}%), apa jaminan harga tidak akan menyentuh stop loss dulu sebelum naik?`,
      `Baik. Lalu bagaimana strategi kamu jika harga naik 5% dulu, lalu tiba-tiba turun balik ke entry?`,
      `Pertanyaan terakhir: Berapa persen dari total portofolio yang akan kamu alokasikan untuk trade ${asset} ini, dan apa rencana jika trade ini rugi?`
    ];

    // Jika sudah 3 jawaban, berikan verdict
    if (answers.length >= 3) {
      let score = 75;
      let verdictText = "";
      
      if (parseFloat(ratio) >= 2) {
        score = 85;
        verdictText = `Trade ${asset} dengan risk/reward 1:${ratio} sangat baik. Manajemen risiko solid, target realistis.`;
      } else if (parseFloat(ratio) >= 1.5) {
        score = 70;
        verdictText = `Rencana cukup baik, tapi masih ada ruang perbaikan. Pertimbangkan untuk memperkecil stop loss.`;
      } else if (parseFloat(ratio) >= 1) {
        score = 55;
        verdictText = `Risk/reward 1:${ratio} kurang ideal (minimal 1:2). Kamu mungkin terpengaruh fomo. Evaluasi ulang.`;
      } else {
        score = 35;
        verdictText = `Rencana ini terlalu berisiko. Risk/reward tidak menguntungkan. Saran: jangan eksekusi dulu.`;
      }
      
      return NextResponse.json({ message: `VERDIKT: ${score}\n${verdictText}` });
    }

    // Berikan pertanyaan berdasarkan jumlah jawaban yang sudah ada
    const questionIndex = answers.length; // 0, 1, atau 2
    const question = questions[questionIndex];
    
    return NextResponse.json({ message: question });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 });
  }
}