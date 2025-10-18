import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSampleData } from "@/hooks/useSampleData";
import { TrendingUp, Package, Users, RotateCcw } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const { customers, orders } = useSampleData();

  const thisMonthOrders = orders.filter(
    (o) => new Date(o.orderDate).getMonth() === new Date().getMonth()
  );

  const totalSales = thisMonthOrders.reduce((sum, o) => sum + o.amount, 0);
  const deliveryCount = thisMonthOrders.filter((o) => o.status === "発送済み" || o.status === "配達完了").length;
  const newCustomers = customers.filter(
    (c) => new Date(c.lastPurchaseDate).getMonth() === new Date().getMonth()
  ).length;
  const repeatRate = ((thisMonthOrders.length / customers.length) * 100).toFixed(1);

  const monthlySales = [
    { month: "10月", sales: 450000 },
    { month: "11月", sales: 520000 },
    { month: "12月", sales: 680000 },
    { month: "1月", sales: totalSales },
  ];

  const productSales = [
    { name: "米", value: 35 },
    { name: "果物", value: 30 },
    { name: "野菜", value: 25 },
    { name: "その他", value: 10 },
  ];

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ダッシュボード</h1>
          <p className="text-muted-foreground">配送業務の概要</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の売上</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">前月比 +12.5%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今月の配送数</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryCount}件</div>
              <p className="text-xs text-muted-foreground">前月比 +8.2%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">新規顧客数</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newCustomers}名</div>
              <p className="text-xs text-muted-foreground">前月比 +15.3%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">リピート率</CardTitle>
              <RotateCcw className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repeatRate}%</div>
              <p className="text-xs text-muted-foreground">前月比 +2.1%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>月別売上推移</CardTitle>
              <CardDescription>過去4ヶ月の売上トレンド</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="売上" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>商品別売上構成</CardTitle>
              <CardDescription>カテゴリー別の売上比率</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productSales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>最近の配送</CardTitle>
            <CardDescription>直近の配送状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">配送日</th>
                    <th className="pb-3 font-medium">顧客名</th>
                    <th className="pb-3 font-medium">商品</th>
                    <th className="pb-3 font-medium">金額</th>
                    <th className="pb-3 font-medium">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="border-b text-sm">
                      <td className="py-3">{order.deliveryDate}</td>
                      <td className="py-3">{order.customerName}</td>
                      <td className="py-3">
                        {order.products.map((p) => p.productName).join(", ")}
                      </td>
                      <td className="py-3">¥{order.amount.toLocaleString()}</td>
                      <td className="py-3">{getStatusBadge(order.status)}</td>
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

export default DashboardPage;
