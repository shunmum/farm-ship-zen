import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/Timeline";
import { useSampleData } from "@/hooks/useSampleData";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Package, 
  XCircle, 
  MoreVertical,
  Plus,
  MapPin,
  Truck,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, customers, products } = useSampleData();
  
  const order = orders.find(o => o.id === id);
  const customer = customers.find(c => c.id === order?.customerId);

  if (!order || !customer) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <Button variant="ghost" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold">注文が見つかりません</h2>
          </div>
        </div>
      </div>
    );
  }

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

  const subtotal = order.amount;
  const shipping = 800;
  const tax = Math.floor((subtotal + shipping) * 0.1);
  const total = subtotal + shipping + tax;

  // Mock history data
  const historyItems = [
    {
      date: "2024年9月24日",
      title: order.status === "配達完了" ? '注文が「配達完了」に変更されました' : order.status === "発送済み" ? '注文が「発送済み」に変更されました' : '注文が作成されました',
      time: "15:16"
    },
    {
      date: "2024年9月14日",
      title: '支払い状況を「支払済み」に変更しました',
      time: "15:16"
    },
    {
      date: "2024年9月13日",
      title: `${customer.name}さんに注文確認メールが送信されました`,
      time: "10:04"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                注文番号: {order.orderNumber}
              </h1>
              <p className="text-muted-foreground">注文日: {order.orderDate}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              支払済み
            </Button>
            <Button variant="outline" className="gap-2">
              <Truck className="h-4 w-4" />
              発送済み
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>請求書を印刷</DropdownMenuItem>
                <DropdownMenuItem>配送ラベルを印刷</DropdownMenuItem>
                <DropdownMenuItem>メモを追加</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">注文をキャンセル</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content (2/3 width) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>商品 ({order.products.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.products.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={idx} className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          サイズ: {product?.size}cm / 重さ: {product?.weight}kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">¥{product?.price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  お支払い情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">商品合計</span>
                    <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">配送料</span>
                    <span className="font-medium">¥{shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">消費税 (10%)</span>
                    <span className="font-medium">¥{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">合計金額</span>
                    <span className="text-xl font-bold text-primary">¥{total.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  顧客の支払い金額を確認
                </Button>
              </CardContent>
            </Card>

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle>受注履歴</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline>
                  {historyItems.map((item, idx) => (
                    <TimelineItem
                      key={idx}
                      date={item.date}
                      title={item.title}
                      time={item.time}
                    />
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>注文内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">連絡先情報</p>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">配送方法</p>
                  <p className="font-medium">{order.shippingCompany || "通常配送"}</p>
                  <p className="text-sm text-muted-foreground">3〜5営業日</p>
                  {order.trackingNumber && (
                    <p className="text-sm text-muted-foreground">追跡番号: {order.trackingNumber}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  配送先住所
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    〒{customer.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.address}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{customer.phone}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  地図を見る
                </a>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>請求先住所</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">配送先住所と同じ</p>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>タグ</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-start gap-2 text-primary">
                  <Plus className="h-4 w-4" />
                  タグを割り当てる
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
