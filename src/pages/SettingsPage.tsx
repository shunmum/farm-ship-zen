import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSampleData } from "@/hooks/useSampleData";
import { Edit, Trash2, Plus } from "lucide-react";

const SettingsPage = () => {
  const { products } = useSampleData();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">設定</h1>
          <p className="text-muted-foreground">システムの各種設定</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="products">商品マスター</TabsTrigger>
            <TabsTrigger value="shipping">配送料金</TabsTrigger>
            <TabsTrigger value="print">印刷設定</TabsTrigger>
            <TabsTrigger value="notify">通知設定</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>店舗基本情報</CardTitle>
                <CardDescription>送り状に印刷される情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">店舗名 *</Label>
                  <Input id="shopName" placeholder="○○農園" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">郵便番号 *</Label>
                    <Input id="postalCode" placeholder="000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号 *</Label>
                    <Input id="phone" placeholder="000-0000-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">住所 *</Label>
                  <Input id="address" placeholder="都道府県市区町村" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" placeholder="info@farm.com" />
                </div>
                <Button size="lg">保存</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>商品マスター</CardTitle>
                    <CardDescription>販売する商品の登録と管理</CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    新規商品追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">商品名</th>
                        <th className="pb-3 font-medium">カテゴリー</th>
                        <th className="pb-3 font-medium">単価</th>
                        <th className="pb-3 font-medium">サイズ(cm)</th>
                        <th className="pb-3 font-medium">重量(kg)</th>
                        <th className="pb-3 font-medium">アクション</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b text-sm hover:bg-muted/50">
                          <td className="py-3 font-medium">{product.name}</td>
                          <td className="py-3">{product.category}</td>
                          <td className="py-3">¥{product.price.toLocaleString()}</td>
                          <td className="py-3">{product.size}</td>
                          <td className="py-3">{product.weight}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-1">
                                <Edit className="h-3 w-3" />
                                編集
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                                削除
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
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>配送料金設定</CardTitle>
                <CardDescription>地域別・サイズ別の配送料金</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">地域</th>
                        <th className="pb-3 font-medium">60サイズ</th>
                        <th className="pb-3 font-medium">80サイズ</th>
                        <th className="pb-3 font-medium">100サイズ</th>
                        <th className="pb-3 font-medium">120サイズ</th>
                        <th className="pb-3 font-medium">140サイズ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { region: "北海道", prices: [1100, 1300, 1500, 1800, 2100] },
                        { region: "東北", prices: [900, 1100, 1300, 1600, 1900] },
                        { region: "関東", prices: [800, 1000, 1200, 1500, 1800] },
                        { region: "中部", prices: [800, 1000, 1200, 1500, 1800] },
                        { region: "関西", prices: [900, 1100, 1300, 1600, 1900] },
                        { region: "中国", prices: [1000, 1200, 1400, 1700, 2000] },
                        { region: "四国", prices: [1000, 1200, 1400, 1700, 2000] },
                        { region: "九州", prices: [1100, 1300, 1500, 1800, 2100] },
                      ].map((row) => (
                        <tr key={row.region} className="border-b text-sm hover:bg-muted/50">
                          <td className="py-3 font-medium">{row.region}</td>
                          {row.prices.map((price, i) => (
                            <td key={i} className="py-3">
                              ¥{price.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button size="lg">料金表を更新</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>印刷設定</CardTitle>
                <CardDescription>送り状・宛名シールの印刷設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="printer">デフォルトプリンター</Label>
                  <Input id="printer" placeholder="プリンター名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paperSize">用紙サイズ</Label>
                  <Input id="paperSize" placeholder="A4" />
                </div>
                <Button size="lg">保存</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notify" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>メール通知の設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">配送完了通知</div>
                    <div className="text-sm text-muted-foreground">
                      配送が完了したら顧客にメールを送信
                    </div>
                  </div>
                  <Button variant="outline">有効</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">入金通知</div>
                    <div className="text-sm text-muted-foreground">
                      入金確認時に管理者にメールを送信
                    </div>
                  </div>
                  <Button variant="outline">有効</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
