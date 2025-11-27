import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Printer, Clock, Package, CheckCircle2, XCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [statusFilter, setStatusFilter] = useState("全て");

  const filteredOrders =
    statusFilter === "全て"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "未発送":
        return <Clock className="h-4 w-4" />;
      case "発送済み":
        return <Package className="h-4 w-4" />;
      case "配達完了":
        return <CheckCircle2 className="h-4 w-4" />;
      case "キャンセル":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      未発送: { variant: "outline", className: "border-yellow-500 text-yellow-700 bg-yellow-50" },
      発送済み: { variant: "default", className: "bg-blue-500" },
      配達完了: { variant: "secondary", className: "bg-green-100 text-green-700 border-green-200" },
      キャンセル: { variant: "destructive", className: "" },
    };
    const { variant, className } = config[status] || { variant: "default", className: "" };
    return (
      <Badge variant={variant} className={className}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status}
        </span>
      </Badge>
    );
  };

  const statusGroups = [
    { status: "未発送", count: orders.filter(o => o.status === "未発送").length, color: "from-yellow-500/10 to-amber-500/10" },
    { status: "発送済み", count: orders.filter(o => o.status === "発送済み").length, color: "from-blue-500/10 to-cyan-500/10" },
    { status: "配達完了", count: orders.filter(o => o.status === "配達完了").length, color: "from-green-500/10 to-emerald-500/10" },
    { status: "キャンセル", count: orders.filter(o => o.status === "キャンセル").length, color: "from-red-500/10 to-rose-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">受注管理</h1>
            <p className="text-sm sm:text-base text-muted-foreground">受注情報の管理</p>
          </div>
          <Button size="lg" className="btn-hover gap-2 shadow-lg w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            新規受注登録
          </Button>
        </div>

        {/* Status Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          {statusGroups.map((group) => (
            <Card key={group.status} className="card-hover overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${group.color} p-3`}>
                  {getStatusIcon(group.status)}
                </div>
                <div className="text-3xl font-bold">{group.count}</div>
                <div className="text-sm text-muted-foreground">{group.status}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="card-hover">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">受注一覧</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">全ての受注情報（{filteredOrders.length}件）</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
          <CardContent className="p-0 sm:p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                    <tr key={order.id} className="border-b text-sm transition-colors hover:bg-muted/50">
                      <td className="py-4 font-medium">{order.orderNumber}</td>
                      <td className="py-4">{order.orderDate}</td>
                      <td className="py-4 font-medium">{order.customerName}</td>
                      <td className="py-4">
                        {order.products.map((p, i) => (
                          <div key={i} className="text-muted-foreground">
                            {p.productName} × {p.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="py-4 font-semibold text-primary">¥{order.amount.toLocaleString()}</td>
                      <td className="py-4">{order.deliveryDate}</td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="btn-hover"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            詳細
                          </Button>
                          <Button variant="outline" size="sm" className="btn-hover">
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-base text-gray-900 mb-1.5">{order.customerName}</div>
                        <div className="text-sm text-gray-500 space-y-0.5">
                          <div>{order.orderNumber}</div>
                          <div>{order.orderDate}</div>
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-1.5 py-2">
                      {order.products.map((p, i) => (
                        <div key={i} className="text-sm text-gray-700 leading-relaxed">
                          {p.productName} × {p.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">配送予定日</div>
                        <div className="text-sm font-medium text-gray-900">{order.deliveryDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">金額</div>
                        <div className="text-xl font-bold text-primary">
                          ¥{order.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 btn-hover h-11"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        詳細
                      </Button>
                      <Button variant="outline" size="default" className="btn-hover h-11 px-4">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;
