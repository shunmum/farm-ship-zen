import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // システムプロンプト：AIの役割と目的を定義
    const systemPrompt = `あなたは農家の作業日誌記録を支援するAIアシスタントです。
以下の情報を自然な会話で収集してください：

1. logDate（作業日）- 必須
2. field（圃場・畑の名前）- 必須
3. workDetails（作業内容の詳細）- 必須
4. harvestItems（収穫物と量）- 任意
5. materialsUsed（使用した資材）- 任意
6. photoUrl（写真のURL）- 任意

必要な情報が揃ったら、以下のJSON形式でデータを返してください：
{
  "isComplete": true,
  "workLogData": {
    "logDate": "YYYY-MM-DD",
    "field": "圃場名",
    "workDetails": "作業内容",
    "harvestItems": "収穫物",
    "materialsUsed": "資材",
    "photoUrl": null
  }
}

まだ情報が不足している場合は、isCompleteをfalseにして、次に必要な質問をしてください。
会話は親しみやすく、簡潔に行ってください。

【重要】ユーザーは音声入力でメッセージを送ることがあります。そのため、送られてくるテキストが、多少の誤認識を含んでいたり、句読点がなかったり、非常に短い単語（例：「トマト」「50キロ」）だけの場合があります。それらの場合でも、文脈を推測し、会話を続ける努力をしてください。`;

    // Lovable AI Gatewayへリクエスト
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // AIの応答が完了データを含むかチェック
    let isComplete = false;
    let workLogData = null;

    try {
      // JSON形式のデータが含まれているかチェック
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.isComplete) {
          isComplete = true;
          workLogData = parsed.workLogData;
        }
      }
    } catch (e) {
      // JSON解析失敗時は通常のメッセージとして扱う
      console.log("Not a structured response, continuing conversation");
    }

    return new Response(
      JSON.stringify({
        message: isComplete 
          ? "ありがとうございます！作業日誌を保存しています..." 
          : aiMessage,
        isComplete,
        workLogData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in work-log-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "申し訳ありません。エラーが発生しました。もう一度お試しください。",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
