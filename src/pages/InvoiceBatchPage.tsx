import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Profile {
  id: string;
  farm_name: string;
  user_id: string;
}

interface ShippingLabel {
  id: string;
  customer_id: string;
  product_name: string;
  quantity: number;
  shipping_cost: number;
  shipping_date: string;
  customers: {
    name: string;
  };
}

const InvoiceBatchPage = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [shippingLabels, setShippingLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("farm_name");

    if (error) {
      toast({
        title: "エラー",
        description: "農園情報の取得に失敗しました",
        variant: "destructive",
      });
      return;
    }

    setProfiles(data || []);
  };

  const fetchInvoiceData = async () => {
    if (!selectedProfile || !startDate || !endDate) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("shipping_labels")
      .select(`
        *,
        customers (
          name
        )
      `)
      .eq("user_id", selectedProfile)
      .gte("shipping_date", startDate)
      .lte("shipping_date", endDate)
      .order("shipping_date", { ascending: true });

    if (error) {
      toast({
        title: "エラー",
        description: "配送データの取得に失敗しました",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setShippingLabels(data || []);
    setLoading(false);

    if (!data || data.length === 0) {
      toast({
        title: "データなし",
        description: "指定期間のデータがありません",
      });
    }
  };

  const calculateTotal = () => {
    return shippingLabels.reduce((sum, label) => sum + Number(label.shipping_cost), 0);
  };

  const handleGeneratePDF = () => {
    toast({
      title: "PDF生成",
      description: "請求書PDFを生成しています（実装予定）",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">請求書一括作成</h1>
          <p className="text-muted-foreground">同一送り主の複数送り状をまとめて請求書を作成</p>
        </div>

        {/* Filter Card */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>検索条件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="profile">送り主選択</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger id="profile">
                    <SelectValue placeholder="農園を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.user_id}>
                        {profile.farm_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  開始日
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  終了日
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={fetchInvoiceData}
              disabled={loading}
              className="w-full md:w-auto btn-hover"
            >
              {loading ? "検索中..." : "検索"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {shippingLabels.length > 0 && (
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>配送明細（{shippingLabels.length}件）</CardTitle>
              <Button onClick={handleGeneratePDF} className="btn-hover gap-2">
                <FileDown className="h-4 w-4" />
                PDF出力
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>配送日</TableHead>
                      <TableHead>顧客名</TableHead>
                      <TableHead>商品名</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">配送料</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shippingLabels.map((label) => (
                      <TableRow key={label.id}>
                        <TableCell>{new Date(label.shipping_date).toLocaleDateString('ja-JP')}</TableCell>
                        <TableCell>{label.customers?.name || "-"}</TableCell>
                        <TableCell>{label.product_name || "-"}</TableCell>
                        <TableCell className="text-right">{label.quantity}</TableCell>
                        <TableCell className="text-right">¥{label.shipping_cost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={4} className="text-right">合計</TableCell>
                      <TableCell className="text-right text-primary">
                        ¥{calculateTotal().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoiceBatchPage;
