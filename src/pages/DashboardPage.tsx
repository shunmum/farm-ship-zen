import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { TrendingUp, Users, Calendar, ArrowUp, ArrowDown, AlertCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const { customers } = useCustomers();
  const { orders } = useOrders();

  const today = new Date();
  const thisMonthOrders = orders.filter(
    (o) => new Date(o.orderDate).getMonth() === today.getMonth()
  );

  const todayOrders = orders.filter(
    (o) => new Date(o.orderDate).toDateString() === today.toDateString()
  );

  const totalSales = thisMonthOrders.reduce((sum, o) => sum + o.amount, 0);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.amount, 0);
  const unshippedCount = orders.filter((o) => o.status === "未発送").length;
  const newCustomers = customers.filter(
    (c) => new Date(c.lastPurchaseDate).getMonth() === today.getMonth()
  ).length;

  const monthlySales = [
    { month: "8月", amount: 945000 },
    { month: "9月", amount: 1120000 },
    { month: "10月", amount: 1050000 },
    { month: "11月", amount: 1280000 },
    { month: "12月", amount: 1450000 },
    { month: "1月", amount: totalSales },
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
      description: "+12%",
      icon: TrendingUp,
    },
    {
      title: "未発送",
      value: `${unshippedCount}件`,
      description: "要対応",
      icon: AlertCircle,
    },
    {
      title: "新規顧客",
      value: `${newCustomers}名`,
      description: "+8%",
      icon: Users,
    },
    {
      title: "今日の売上",
      value: `¥${todaySales.toLocaleString()}`,
      description: `${todayOrders.length}件`,
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h1>
        <p className="text-sm md:text-base text-gray-600">農作物販売管理システムの概要</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                    {card.description.includes('+') ? (
                      <span className="flex items-center text-sm font-medium text-green-600">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        {card.description}
                      </span>
                    ) : card.description.includes('-') ? (
                      <span className="flex items-center text-sm font-medium text-red-600">
                        <ArrowDown className="h-4 w-4 mr-1" />
                        {card.description}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">{card.description}</span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${
                  card.icon === TrendingUp ? 'bg-green-100' :
                  card.icon === AlertCircle ? 'bg-yellow-100' :
                  card.icon === Users ? 'bg-purple-100' :
                  'bg-blue-100'
                }`}>
                  <card.icon className={`h-6 w-6 ${
                    card.icon === TrendingUp ? 'text-green-600' :
                    card.icon === AlertCircle ? 'text-yellow-600' :
                    card.icon === Users ? 'text-purple-600' :
                    'text-blue-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">月別売上推移</CardTitle>
            <CardDescription>過去6ヶ月の売上実績</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorGreen)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">人気商品TOP5</CardTitle>
            <CardDescription>今月の販売実績</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className="text-gray-600 font-semibold">{product.sales}個</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(product.sales / topProducts[0].sales) * 100}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">最近の配送</CardTitle>
          <CardDescription>直近の配送状況</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">配送日</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">顧客名</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">商品</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">金額</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4 text-sm text-gray-900">{order.deliveryDate}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{order.customerName}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {order.products.map((p) => p.productName).join(", ")}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">¥{order.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {orders.slice(0, 8).map((order, index) => (
              <Card
                key={order.id}
                className="p-4 shadow-sm hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-1">{order.deliveryDate}</div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-1">
                    {order.products.map((p) => p.productName).join(", ")}
                  </div>
                  <div className="text-lg font-bold text-gray-900 pt-1">
                    ¥{order.amount.toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
