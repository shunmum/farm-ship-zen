import { useState } from "react";
import { FileText, Table, Loader, CheckCircle, AlertCircle, Package, User, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShipmentData {
  customerName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  phoneNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
  }>;
  deliveryDate: string | null;
  notes: string;
}

const ShipmentImportPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ShipmentData[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: "pdf" | "csv") => {
    setIsProcessing(true);
    setProcessingStatus(`${type === "pdf" ? "PDF" : "CSV"}ファイルをアップロード中...`);
    setProcessingProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      setProcessingStatus("AIが注文データを解析中...");
      setProcessingProgress(40);

      const { data, error } = await supabase.functions.invoke("import-shipment", {
        body: formData,
      });

      if (error) {
        console.error("Error invoking function:", error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "解析に失敗しました");
      }

      setProcessingStatus("データを検証中...");
      setProcessingProgress(80);

      setParsedData(data.data);
      setProcessingProgress(100);

      toast({
        title: "解析完了",
        description: `${data.data.length}件の注文データを読み込みました`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ファイルの処理中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
      setProcessingProgress(0);
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "pdf");
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "csv");
    }
  };

  const toggleSelectItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === parsedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(parsedData.map((_, i) => i)));
    }
  };

  const createShipmentLabels = async () => {
    const selectedData = parsedData.filter((_, i) => selectedItems.has(i));
    
    if (selectedData.length === 0) {
      toast({
        title: "エラー",
        description: "送り状を作成する注文を選択してください",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "送り状作成中",
      description: `${selectedData.length}件の送り状を作成しています...`,
    });

    // TODO: 実際の送り状作成処理を実装
    console.log("Creating shipment labels for:", selectedData);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI送り状作成</h1>
            <p className="text-muted-foreground mt-1">
              PDFやCSVファイルから自動的に送り状データを作成します
            </p>
          </div>
        </div>

        {/* インポート方法選択 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF（FAX注文）インポート */}
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">FAX注文をスキャン</CardTitle>
              <CardDescription>
                PDFファイルからAIが自動で注文情報を読み取ります
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
                id="pdf-upload"
                disabled={isProcessing}
              />
              <label htmlFor="pdf-upload">
                <Button
                  className="w-full"
                  disabled={isProcessing}
                  asChild
                >
                  <span>PDFを選択</span>
                </Button>
              </label>
            </CardContent>
          </Card>

          {/* CSVインポート */}
          <Card className="border-2 border-dashed hover:border-blue-500 transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Table className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-xl">ECサイト注文データ</CardTitle>
              <CardDescription>
                CSVファイルから一括で送り状を作成します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label htmlFor="csv-upload">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                  asChild
                >
                  <span>CSVを選択</span>
                </Button>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* AI処理状態表示 */}
        {isProcessing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Loader className="animate-spin w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-semibold text-lg">AIが注文データを解析中...</p>
                    <p className="text-sm text-muted-foreground">{processingStatus}</p>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 解析結果プレビュー */}
        {parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>解析結果</CardTitle>
                  <CardDescription>
                    {parsedData.length}件の注文データ
                    {selectedItems.size > 0 && ` (${selectedItems.size}件選択中)`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setParsedData([])}
                  >
                    クリア
                  </Button>
                  <Button
                    size="sm"
                    onClick={createShipmentLabels}
                    disabled={selectedItems.size === 0}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    送り状作成 ({selectedItems.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* テーブルヘッダー */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg font-medium text-sm">
                  <div className="w-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === parsedData.length}
                      onChange={toggleSelectAll}
                      className="rounded border-input"
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      顧客名
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      配送先
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      商品
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      配送日
                    </div>
                    <div>ステータス</div>
                  </div>
                </div>

                {/* データ行 */}
                {parsedData.map((row, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border transition-colors
                      ${selectedItems.has(index) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30'}
                    `}
                  >
                    <div className="w-10 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => toggleSelectItem(index)}
                        className="rounded border-input"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-5 gap-3">
                      <div>
                        <p className="font-medium">{row.customerName || "（未入力）"}</p>
                        <p className="text-xs text-muted-foreground">{row.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm">〒{row.postalCode}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.prefecture}{row.city}
                        </p>
                        <p className="text-xs text-muted-foreground">{row.address}</p>
                      </div>
                      <div>
                        {row.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="text-sm">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity}個 / {item.size}cm
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm">
                        {row.deliveryDate || "指定なし"}
                      </div>
                      <div>
                        {row.customerName && row.postalCode && row.items[0]?.name ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            準備完了
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            要確認
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ヘルプセクション */}
        {parsedData.length === 0 && !isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle>使い方</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">ファイルを選択</p>
                  <p>FAX注文書のPDFファイル、またはECサイトからエクスポートしたCSVファイルを選択します。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">AIが自動解析</p>
                  <p>AIが注文書の内容を読み取り、送り状に必要な情報を自動で抽出します。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">確認して作成</p>
                  <p>抽出されたデータを確認し、問題なければ送り状を一括作成します。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShipmentImportPage;
