import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!file || !type) {
      return new Response(
        JSON.stringify({ error: 'ファイルとタイプが必要です' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${type} file: ${file.name}`);

    if (type === 'pdf') {
      // PDFの場合、base64エンコードしてAIに送信
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Sending PDF to AI for analysis...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `あなたはFAX注文書から送り状情報を抽出する専門家です。
以下のJSON形式で情報を抽出してください：
{
  "orders": [
    {
      "customerName": "顧客名",
      "postalCode": "郵便番号（ハイフン付き）",
      "prefecture": "都道府県",
      "city": "市区町村",
      "address": "番地・建物名",
      "phoneNumber": "電話番号（ハイフン付き）",
      "items": [
        {
          "name": "商品名",
          "quantity": 数量（数値）,
          "size": "サイズ（cm）"
        }
      ],
      "deliveryDate": "配送希望日（YYYY-MM-DD形式）",
      "notes": "備考"
    }
  ]
}

- 郵便番号は必ずXXX-XXXXの形式で返す
- 電話番号はXXX-XXXX-XXXXの形式で返す
- 数量は数値で返す
- 日付はYYYY-MM-DD形式で返す
- 情報が不明な場合はnullを返す`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'この画像からFAX注文書の情報を抽出してください。'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        }),
      });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'レート制限に達しました。しばらく待ってから再度お試しください。' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: '利用可能なクレジットがありません。ワークスペースに資金を追加してください。' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'AI解析に失敗しました' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const aiResult = await response.json();
      const parsedData = JSON.parse(aiResult.choices[0].message.content);
      
      console.log('AI analysis completed:', parsedData);

      return new Response(
        JSON.stringify({ success: true, data: parsedData.orders || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'csv') {
      // CSVの場合、テキストを読み込んで簡易パース
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSVファイルが空です');
      }

      // ヘッダー行を取得
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('CSV headers:', headers);
      
      // データ行をパース
      const orders = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        // CSVカラムを送り状フォーマットにマッピング
        const order = {
          customerName: row['お名前'] || row['顧客名'] || row['customer_name'] || row['name'] || '',
          postalCode: row['郵便番号'] || row['postal_code'] || row['zipcode'] || '',
          prefecture: row['都道府県'] || row['prefecture'] || '',
          city: row['市区町村'] || row['city'] || '',
          address: row['番地'] || row['address'] || row['住所'] || '',
          phoneNumber: row['電話番号'] || row['phone'] || row['tel'] || '',
          items: [
            {
              name: row['商品名'] || row['product_name'] || row['product'] || '',
              quantity: parseInt(row['数量'] || row['quantity'] || '1'),
              size: row['サイズ'] || row['size'] || '80'
            }
          ],
          deliveryDate: row['配送希望日'] || row['delivery_date'] || null,
          notes: row['備考'] || row['notes'] || ''
        };
        
        orders.push(order);
      }

      console.log(`Parsed ${orders.length} orders from CSV`);

      return new Response(
        JSON.stringify({ success: true, data: orders }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'サポートされていないファイルタイプです' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-shipment function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
