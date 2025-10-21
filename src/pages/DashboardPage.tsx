import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSampleData } from "@/hooks/useSampleData";
import { TrendingUp, Package, Users, RotateCcw, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
  const avgPrice = totalSales / thisMonthOrders.length || 0;

  const monthlySales = [
    { month: "8月", sales: 945000 },
    { month: "9月", sales: 1120000 },
    { month: "10月", sales: 1050000 },
    { month: "11月", sales: 1280000 },
    { month: "12月", sales: 1450000 },
    { month: "1月", sales: totalSales },
  ];

  const topProducts = [
    { name: "トマト", sales: 45 },
    { name: "きゅうり", sales: 38 },
    { name: "いちご", sales: 32 },
    { name: "じゃがいも", sales: 28 },
    { name: "玉ねぎ", sales: 25 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      未発送: "outline",
      発送済み: "default",
      配達完了: "secondary",
      キャンセル: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const kpiCards = [
    {
      title: "今月の売上",
      value: `¥${totalSales.toLocaleString()}`,
      change: "+12%",
      subtitle: "前月比",
      icon: TrendingUp,
      bgColor: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-primary",
    },
    {
      title: "配送完了",
      value: `${deliveryCount}件`,
      change: "本日: 12件",
      subtitle: "",
      icon: Package,
      bgColor: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "新規顧客",
      value: `${newCustomers}名`,
      change: "+8%",
      subtitle: "前月比",
      icon: Users,
      bgColor: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-600",
    },
    {
      title: "平均単価",
      value: `¥${Math.round(avgPrice).toLocaleString()}`,
      change: "+3%",
      subtitle: "前月比",
      icon: RotateCcw,
      bgColor: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ダッシュボード</h1>
          <p className="text-muted-foreground">やまだ農園の配送業務概要</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, index) => (
            <Card key={index} className="card-hover overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`rounded-xl bg-gradient-to-br ${card.bgColor} p-2.5`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{card.change}</span>
                  {card.subtitle && <span className="text-muted-foreground">{card.subtitle}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>月別売上推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} name="売上" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>人気商品 TOP 5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground">{product.sales}個</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${(product.sales / topProducts[0].sales) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>最近の配送</CardTitle>
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
                    <tr key={order.id} className="border-b text-sm transition-colors hover:bg-muted/50">
                      <td className="py-4">{order.deliveryDate}</td>
                      <td className="py-4 font-medium">{order.customerName}</td>
                      <td className="py-4">
                        {order.products.map((p) => p.productName).join(", ")}
                      </td>
                      <td className="py-4 font-semibold">¥{order.amount.toLocaleString()}</td>
                      <td className="py-4">{getStatusBadge(order.status)}</td>
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
