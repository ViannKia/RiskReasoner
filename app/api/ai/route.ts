import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, answers, asset, entry, target, stopLoss } =
      await request.json();

    // Prompt AI yang memaksa AI bersikap skeptis
    const systemPrompt = `Kamu adalah RiskReasoner, asisten AI yang bertugas menguji rencana trading seseorang. 
Kamu BUKAN pemberi saran trading. Tugasmu adalah menjadi "penguji kritis" (devil's advocate).

Karakteristikmu:
- Skeptis terhadap rencana trading
- Tidak pernah memberi saran "beli" atau "jual"
- Setiap jawaban harus dalam bentuk PERTANYAAN lanjutan atau ANALISIS RISIKO

Aturan:
1. Jangan pernah bilang "ide bagus" tanpa pertanyaan kritis
2. Jangan pernah merekomendasikan entry price atau target price
3. Fokus pada kelemahan logika dan manajemen risiko
4. Gunakan bahasa Indonesia yang tegas tapi profesional`;

    const userPrompt = `Asset: ${asset}
Entry Price: ${entry}
Target Price: ${target}
Stop Loss: ${stopLoss}

Riwayat jawaban user:
${answers.map((a: any, i: number) => `Pertanyaan ${i + 1}: ${a.question}\nJawaban user: ${a.answer}`).join("\n")}

Sekarang, berikan pertanyaan ke-${answers.length + 1} dari maksimal 3 pertanyaan.
Pertanyaan harus:
- Spesifik berdasarkan data di atas
- Memaksa user memikirkan risiko
- Tidak bisa dijawab dengan "ya" atau "tidak" saja

Atau jika sudah 3 pertanyaan, berikan VERDIKT dengan format:
VERDIKT: [Skor Rasional dari 0-100]
[Analisis singkat 2-3 kalimat tentang kualitas rencana trading user]`;

    const response = await fetch(
      process.env.OPENROUTER_API_URL ||
        "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "TradePunch",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      },
    );

    const data = await response.json();
    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));

    // Cek apakah ada error dari OpenRouter
    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return NextResponse.json(
        { message: `API Error: ${data.error.message || "Unknown"}` },
        { status: 500 },
      );
    }

    const aiMessage =
      data.choices?.[0]?.message?.content ||
      "Maaf, AI sedang sibuk. Coba lagi.";

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan. Coba lagi." },
      { status: 500 },
    );
  }
}
