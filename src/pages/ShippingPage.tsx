import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSampleData } from "@/hooks/useSampleData";
import { Printer, FileUp, ArrowRight, Truck, Box, Check, Package, Upload, FileText, Table as TableIcon, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ShippingPage = () => {
  const { customers, products } = useSampleData();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [activeTab, setActiveTab] = useState("manual");

  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const customer = customers.find((c) => c.id === selectedCustomer);

  const steps = [
    { number: 1, title: "顧客選択", icon: Check },
    { number: 2, title: "商品選択", icon: Box },
    { number: 3, title: "配送設定", icon: Truck },
  ];

  const shippingCompanies = [
    { id: "yamato", name: "ヤマト運輸", price: 900, logo: "🐱" },
    { id: "sagawa", name: "佐川急便", price: 850, logo: "📦" },
    { id: "yupack", name: "ゆうパック", price: 920, logo: "📮" },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'csv') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setImportError(null);
    setExtractedData(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("認証が必要です");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imports')
        .getPublicUrl(filePath);

      const { data: importRecord, error: insertError } = await supabase
        .from('import_orders')
        .insert({
          user_id: user.id,
          import_type: type,
          file_url: publicUrl,
          file_name: file.name,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProcessing(true);

      if (type === 'csv') {
        await processCSV(file, importRecord.id);
      } else {
        await processPDF(file, importRecord.id);
      }

      toast({
        title: "アップロード完了",
        description: `${file.name}のインポートが完了しました`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setImportError(error.message || "アップロードに失敗しました");
      toast({
        title: "エラー",
        description: error.message || "アップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const processCSV = async (file: File, importId: string) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });

    setExtractedData(data);

    await supabase
      .from('import_orders')
      .update({
        status: 'completed',
        extracted_data: data,
      })
      .eq('id', importId);
  };

  const processPDF = async (file: File, importId: string) => {
    await supabase
      .from('import_orders')
      .update({
        status: 'processing',
      })
      .eq('id', importId);

    const mockExtractedData = {
      customer_name: "サンプル顧客",
      postal_code: "123-4567",
      address: "東京都渋谷区サンプル1-2-3",
      phone: "03-1234-5678",
      products: [
        { name: "トマト", quantity: 2, price: 1200 }
      ]
    };

    setTimeout(async () => {
      setExtractedData(mockExtractedData);

      await supabase
        .from('import_orders')
        .update({
          status: 'completed',
          extracted_data: mockExtractedData,
        })
        .eq('id', importId);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">送り状作成</h1>
          <p className="text-muted-foreground">配送業者の送り状を作成・印刷</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">手動入力</TabsTrigger>
            <TabsTrigger value="pdf">PDFインポート</TabsTrigger>
            <TabsTrigger value="csv">CSVインポート</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                            currentStep >= step.number
                              ? "bg-primary text-white shadow-lg scale-105"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {currentStep > step.number ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <span className="text-lg font-bold">{step.number}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{step.title}</div>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`mx-4 h-1 flex-1 rounded transition-all ${
                            currentStep > step.number ? "bg-primary" : "bg-secondary"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>配送情報入力</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentStep >= 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer">顧客選択 *</Label>
                          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                            <SelectTrigger id="customer" className="h-12">
                              <SelectValue placeholder="顧客を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name} - {customer.phone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {customer && (
                          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                            <CardContent className="pt-6">
                              <div className="space-y-2 text-sm">
                                <div className="font-semibold text-base">{customer.name}</div>
                                <div>〒{customer.postalCode}</div>
                                <div>{customer.address}</div>
                                <div className="flex items-center gap-2 pt-2 border-t">
                                  <Badge variant="outline">{customer.phone}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {currentStep >= 2 && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="product">商品選択 *</Label>
                          <Select>
                            <SelectTrigger id="product" className="h-12">
                              <SelectValue placeholder="商品を選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.slice(0, 6).map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ¥{product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="size">サイズ（cm）</Label>
                            <Input id="size" placeholder="80" className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">重量（kg）</Label>
                            <Input id="weight" placeholder="1.5" className="h-12" />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep >= 3 && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-3">
                          <Label>配送業者選択 *</Label>
                          <div className="grid gap-3">
                            {shippingCompanies.map((company) => (
                              <button
                                key={company.id}
                                onClick={() => setShippingCompany(company.id)}
                                className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                                  shippingCompany === company.id
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-3xl">{company.logo}</div>
                                  <div className="text-left">
                                    <div className="font-semibold">{company.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ¥{company.price}〜
                                    </div>
                                  </div>
                                </div>
                                {shippingCompany === company.id && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">配送希望日</Label>
                          <Input id="date" type="date" className="h-12" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {currentStep > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="flex-1 h-12 btn-hover"
                        >
                          戻る
                        </Button>
                      )}
                      {currentStep < 3 ? (
                        <Button
                          onClick={() => setCurrentStep(currentStep + 1)}
                          className="flex-1 h-12 btn-hover gap-2"
                          disabled={currentStep === 1 && !selectedCustomer}
                        >
                          次へ
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button className="flex-1 h-12 btn-hover gap-2">
                          <Printer className="h-4 w-4" />
                          印刷
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="card-hover">
                  <CardHeader>
                    <CardTitle>送り状プレビュー</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shippingCompany && customer ? (
                      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                        <div className="space-y-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold">
                              {shippingCompanies.find((c) => c.id === shippingCompany)?.name}
                            </h3>
                          </div>
                          <div className="space-y-1 border-t-2 border-dashed pt-6">
                            <div className="text-xs text-muted-foreground">お届け先</div>
                            <div className="font-bold text-lg">〒{customer.postalCode}</div>
                            <div className="font-medium">{customer.address}</div>
                            <div className="text-2xl font-bold pt-2">{customer.name} 様</div>
                            <div className="text-muted-foreground">{customer.phone}</div>
                          </div>
                          <div className="border-t-2 border-dashed pt-6">
                            <div className="text-xs text-muted-foreground">ご依頼主</div>
                            <div className="font-medium">〒000-0000</div>
                            <div>農園住所</div>
                            <div className="font-bold text-lg">やまだ農園</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[400px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            配送情報を入力してください
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {shippingCompany && (
                  <Card className="card-hover">
                    <CardHeader>
                      <CardTitle>配送料金</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>基本料金</span>
                          <span>¥900</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>クール便追加料金</span>
                          <span>¥220</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 text-lg font-bold">
                          <span>合計</span>
                          <span className="text-primary">¥1,120</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pdf" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  PDFファイルインポート
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    FAXなどで送られた注文書PDFをアップロードすると、AIが自動で文字起こしを行い、送り状を作成します。
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    className="hidden"
                    id="pdf-upload"
                    disabled={uploading || processing}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    {uploading || processing ? (
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {processing ? "AI処理中..." : uploading ? "アップロード中..." : "PDFファイルを選択"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        クリックしてファイルを選択
                      </p>
                    </div>
                  </label>
                </div>

                {importError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}

                {extractedData && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base">抽出されたデータ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>顧客名:</strong> {extractedData.customer_name}</div>
                      <div><strong>郵便番号:</strong> {extractedData.postal_code}</div>
                      <div><strong>住所:</strong> {extractedData.address}</div>
                      <div><strong>電話番号:</strong> {extractedData.phone}</div>
                      {extractedData.products && (
                        <div>
                          <strong>商品:</strong>
                          {extractedData.products.map((p: any, i: number) => (
                            <div key={i} className="ml-4">
                              {p.name} × {p.quantity} (¥{p.price})
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  CSVファイルインポート
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    オンラインショップから出力したCSVファイルをアップロードして、一括で送り状を作成できます。
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'csv')}
                    className="hidden"
                    id="csv-upload"
                    disabled={uploading || processing}
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    {uploading || processing ? (
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    ) : (
                      <TableIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {processing ? "処理中..." : uploading ? "アップロード中..." : "CSVファイルを選択"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        クリックしてファイルを選択
                      </p>
                    </div>
                  </label>
                </div>

                {importError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}

                {extractedData && Array.isArray(extractedData) && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base">インポート成功: {extractedData.length}件</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {Object.keys(extractedData[0] || {}).map((key) => (
                                <th key={key} className="text-left py-2 px-2">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {extractedData.slice(0, 5).map((row, i) => (
                              <tr key={i} className="border-b">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="py-2 px-2">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {extractedData.length > 5 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            他 {extractedData.length - 5} 件
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShippingPage;
