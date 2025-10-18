import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSampleData } from "@/hooks/useSampleData";
import { Badge } from "@/components/ui/badge";
import { Printer, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HistoryPage = () => {
  const { orders } = useSampleData();
  const [companyFilter, setCompanyFilter] = useState("全て");
  const [statusFilter, setStatusFilter] = useState("全て");

  const shippedOrders = orders.filter(
    (order) => order.status === "発送済み" || order.status === "配達完了"
  );

  const filteredOrders = shippedOrders.filter((order) => {
    const companyMatch =
      companyFilter === "全て" || order.shippingCompany === companyFilter;
    const statusMatch = statusFilter === "全て" || order.status === statusFilter;
    return companyMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      未発送: "outline",
      発送済み: "default",
      配達完了: "secondary",
      キャンセル: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">配送履歴</h1>
          <p className="text-muted-foreground">過去の配送記録と追跡情報</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>配送履歴一覧</CardTitle>
                <CardDescription>配送済みの記録（{filteredOrders.length}件）</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="配送業者" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全ての業者</SelectItem>
                    <SelectItem value="ヤマト運輸">ヤマト運輸</SelectItem>
                    <SelectItem value="佐川急便">佐川急便</SelectItem>
                    <SelectItem value="ゆうパック">ゆうパック</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全てのステータス</SelectItem>
                    <SelectItem value="発送済み">発送済み</SelectItem>
                    <SelectItem value="配達完了">配達完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">送り状番号</th>
                    <th className="pb-3 font-medium">配送日</th>
                    <th className="pb-3 font-medium">顧客名</th>
                    <th className="pb-3 font-medium">配送業者</th>
                    <th className="pb-3 font-medium">追跡番号</th>
                    <th className="pb-3 font-medium">金額</th>
                    <th className="pb-3 font-medium">ステータス</th>
                    <th className="pb-3 font-medium">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b text-sm hover:bg-muted/50">
                      <td className="py-4 font-medium">{order.orderNumber}</td>
                      <td className="py-4">{order.deliveryDate}</td>
                      <td className="py-4">{order.customerName}</td>
                      <td className="py-4">{order.shippingCompany}</td>
                      <td className="py-4">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {order.trackingNumber}
                        </code>
                      </td>
                      <td className="py-4 font-medium">¥{order.amount.toLocaleString()}</td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="h-3 w-3" />
                            再印刷
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Copy className="h-3 w-3" />
                            複製
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ヤマト運輸</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shippedOrders.filter((o) => o.shippingCompany === "ヤマト運輸").length}件
              </div>
              <p className="text-xs text-muted-foreground">配送実績</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">佐川急便</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shippedOrders.filter((o) => o.shippingCompany === "佐川急便").length}件
              </div>
              <p className="text-xs text-muted-foreground">配送実績</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ゆうパック</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shippedOrders.filter((o) => o.shippingCompany === "ゆうパック").length}件
              </div>
              <p className="text-xs text-muted-foreground">配送実績</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
