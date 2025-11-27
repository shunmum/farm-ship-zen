import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShippingSettings, type ShippingRate, type ConsolidationRule, type ShippingCarrier } from "@/hooks/useShippingSettings";
import { Edit, Trash2, Plus, Package, Truck, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PublicFormSettings from "@/components/PublicFormSettings";
import ProductManagement from "@/components/ProductManagement";
import ShippingModeSettings from "@/components/ShippingModeSettings";
import ZoneManagement from "@/components/ZoneManagement";
import ZoneShippingRates from "@/components/ZoneShippingRates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SettingsPage = () => {
  const { shippingRates, consolidationRules } = useShippingSettings();

  const [editingShippingRate, setEditingShippingRate] = useState<ShippingRate | null>(null);
  const [editingConsolidationRule, setEditingConsolidationRule] = useState<ConsolidationRule | null>(null);
  const [isAddingConsolidationRule, setIsAddingConsolidationRule] = useState(false);

  const carrierNames: Record<ShippingCarrier, string> = {
    yamato: "ヤマト運輸",
    sagawa: "佐川急便",
    yupack: "ゆうパック",
  };

  const groupedShippingRates = shippingRates.reduce((acc, rate) => {
    if (!acc[rate.carrier]) {
      acc[rate.carrier] = [];
    }
    acc[rate.carrier].push(rate);
    return acc;
  }, {} as Record<ShippingCarrier, ShippingRate[]>);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">設定</h1>
          <p className="text-sm sm:text-base text-muted-foreground">システムの各種設定</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-10 gap-1">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="products">商品マスター</TabsTrigger>
            <TabsTrigger value="shipping-mode">送料計算方式</TabsTrigger>
            <TabsTrigger value="zones">ゾーン管理</TabsTrigger>
            <TabsTrigger value="zone-rates">ゾーン別料金</TabsTrigger>
            <TabsTrigger value="shipping">配送料金</TabsTrigger>
            <TabsTrigger value="consolidation">荷合いルール</TabsTrigger>
            <TabsTrigger value="public-form">公開フォーム</TabsTrigger>
            <TabsTrigger value="print">印刷設定</TabsTrigger>
            <TabsTrigger value="notify">通知設定</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">店舗基本情報</CardTitle>
                <CardDescription className="text-sm">送り状に印刷される情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
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
            <ProductManagement />
          </TabsContent>

          <TabsContent value="shipping-mode" className="space-y-4">
            <ShippingModeSettings />
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <ZoneManagement />
          </TabsContent>

          <TabsContent value="zone-rates" className="space-y-4">
            <ZoneShippingRates />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Truck className="h-5 w-5" />
                  配送料金設定
                </CardTitle>
                <CardDescription className="text-sm">配送業者別・サイズ別の料金設定（クール便料金を含む）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                {Object.entries(groupedShippingRates).map(([carrier, rates]) => (
                  <div key={carrier} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{carrierNames[carrier as ShippingCarrier]}</h3>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr className="text-left text-sm">
                            <th className="p-3 font-medium">サイズ</th>
                            <th className="p-3 font-medium">基本料金</th>
                            <th className="p-3 font-medium">クール便追加料金</th>
                            <th className="p-3 font-medium">合計（クール便）</th>
                            <th className="p-3 font-medium">アクション</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rates
                            .sort((a, b) => parseInt(a.size) - parseInt(b.size))
                            .map((rate) => (
                              <tr key={rate.id} className="border-t text-sm hover:bg-muted/30">
                                <td className="p-3 font-medium">{rate.size}サイズ</td>
                                <td className="p-3">¥{rate.basePrice.toLocaleString()}</td>
                                <td className="p-3">¥{rate.coolPrice.toLocaleString()}</td>
                                <td className="p-3 font-semibold text-primary">
                                  ¥{(rate.basePrice + rate.coolPrice).toLocaleString()}
                                </td>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingShippingRate(rate)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consolidation" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Settings2 className="h-5 w-5" />
                      荷合いルール設定
                    </CardTitle>
                    <CardDescription className="text-sm">
                      複数個口の商品を一つにまとめる際のサイズ変換ルール
                    </CardDescription>
                  </div>
                  <Button
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => {
                      setIsAddingConsolidationRule(true);
                      setEditingConsolidationRule({
                        id: `CR${String(consolidationRules.length + 1).padStart(3, '0')}`,
                        name: "",
                        fromSize: "60",
                        quantity: 2,
                        toSize: "80",
                        enabled: true,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    ルール追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  {consolidationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 ${
                        rule.enabled ? "bg-background" : "bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <Badge variant="outline">{rule.fromSize}サイズ</Badge>
                          <span className="text-muted-foreground">×</span>
                          <Badge variant="outline">{rule.quantity}</Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary">{rule.toSize}サイズ</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{rule.name}</div>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "有効" : "無効"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConsolidationRule(rule);
                            setIsAddingConsolidationRule(false);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {consolidationRules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>荷合いルールが登録されていません</p>
                  </div>
                )}
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

          <TabsContent value="public-form" className="space-y-4">
            <PublicFormSettings />
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

      {/* Shipping Rate Edit Dialog */}
      <Dialog open={!!editingShippingRate} onOpenChange={(open) => !open && setEditingShippingRate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配送料金編集</DialogTitle>
            <DialogDescription>料金を編集してください</DialogDescription>
          </DialogHeader>
          {editingShippingRate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>配送業者</Label>
                <div className="font-semibold">{carrierNames[editingShippingRate.carrier]}</div>
              </div>
              <div className="space-y-2">
                <Label>サイズ</Label>
                <div className="font-semibold">{editingShippingRate.size}サイズ</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">基本料金 *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={editingShippingRate.basePrice}
                  onChange={(e) =>
                    setEditingShippingRate({
                      ...editingShippingRate,
                      basePrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coolPrice">クール便追加料金 *</Label>
                <Input
                  id="coolPrice"
                  type="number"
                  value={editingShippingRate.coolPrice}
                  onChange={(e) =>
                    setEditingShippingRate({
                      ...editingShippingRate,
                      coolPrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="font-medium">合計（クール便使用時）</span>
                <span className="text-lg font-bold text-primary">
                  ¥{(editingShippingRate.basePrice + editingShippingRate.coolPrice).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShippingRate(null)}>
              キャンセル
            </Button>
            <Button onClick={() => setEditingShippingRate(null)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consolidation Rule Edit Dialog */}
      <Dialog
        open={!!editingConsolidationRule}
        onOpenChange={(open) => {
          if (!open) {
            setEditingConsolidationRule(null);
            setIsAddingConsolidationRule(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingConsolidationRule ? "荷合いルール追加" : "荷合いルール編集"}
            </DialogTitle>
            <DialogDescription>荷合いルールを設定してください</DialogDescription>
          </DialogHeader>
          {editingConsolidationRule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">ルール名 *</Label>
                <Input
                  id="ruleName"
                  placeholder="例：60サイズ×2 → 80サイズ"
                  value={editingConsolidationRule.name}
                  onChange={(e) =>
                    setEditingConsolidationRule({ ...editingConsolidationRule, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromSize">元のサイズ *</Label>
                  <Select
                    value={editingConsolidationRule.fromSize}
                    onValueChange={(value) =>
                      setEditingConsolidationRule({ ...editingConsolidationRule, fromSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="80">80</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">個数 *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="2"
                    value={editingConsolidationRule.quantity}
                    onChange={(e) =>
                      setEditingConsolidationRule({
                        ...editingConsolidationRule,
                        quantity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toSize">統合後のサイズ *</Label>
                <Select
                  value={editingConsolidationRule.toSize}
                  onValueChange={(value) =>
                    setEditingConsolidationRule({ ...editingConsolidationRule, toSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">80</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                    <SelectItem value="140">140</SelectItem>
                    <SelectItem value="160">160</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingConsolidationRule.enabled}
                  onChange={(e) =>
                    setEditingConsolidationRule({
                      ...editingConsolidationRule,
                      enabled: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="enabled" className="cursor-pointer">
                  このルールを有効にする
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingConsolidationRule(null);
                setIsAddingConsolidationRule(false);
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                setEditingConsolidationRule(null);
                setIsAddingConsolidationRule(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
