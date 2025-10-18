import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Printer } from "lucide-react";
import { useSampleData } from "@/hooks/useSampleData";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrdersPage = () => {
  const { orders } = useSampleData();
  const [statusFilter, setStatusFilter] = useState("全て");

  const filteredOrders =
    statusFilter === "全て"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">受注管理</h1>
            <p className="text-muted-foreground">受注情報の管理</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            新規受注登録
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>受注一覧</CardTitle>
                <CardDescription>全ての受注情報（{filteredOrders.length}件）</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全て">全て</SelectItem>
                    <SelectItem value="未発送">未発送</SelectItem>
                    <SelectItem value="発送済み">発送済み</SelectItem>
                    <SelectItem value="配達完了">配達完了</SelectItem>
                    <SelectItem value="キャンセル">キャンセル</SelectItem>
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
                    <th className="pb-3 font-medium">受注番号</th>
                    <th className="pb-3 font-medium">受注日</th>
                    <th className="pb-3 font-medium">顧客名</th>
                    <th className="pb-3 font-medium">商品・数量</th>
                    <th className="pb-3 font-medium">金額</th>
                    <th className="pb-3 font-medium">配送予定日</th>
                    <th className="pb-3 font-medium">ステータス</th>
                    <th className="pb-3 font-medium">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b text-sm hover:bg-muted/50">
                      <td className="py-4 font-medium">{order.orderNumber}</td>
                      <td className="py-4">{order.orderDate}</td>
                      <td className="py-4">{order.customerName}</td>
                      <td className="py-4">
                        {order.products.map((p, i) => (
                          <div key={i}>
                            {p.productName} × {p.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 font-medium">¥{order.amount.toLocaleString()}</td>
                      <td className="py-4">{order.deliveryDate}</td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            詳細
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="h-3 w-3" />
                            送り状
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                            編集
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
      </div>
    </div>
  );
};

export default OrdersPage;
