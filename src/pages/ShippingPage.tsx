import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { useSampleData, type Recipient, type ShippingCarrier } from "@/hooks/useSampleData";
import { Printer, ArrowRight, Truck, Check, Package, FileText, Users, Plus, Trash2, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SelectedProduct {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  size: string;
  quantity: number;
}

const ShippingPage = () => {
  const navigate = useNavigate();
  const { customers, products, productVariants, shippingRates, consolidationRules } = useSampleData();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<"self" | string>("self");
  const [shippingCompany, setShippingCompany] = useState<ShippingCarrier | "">("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [useCoolDelivery, setUseCoolDelivery] = useState(false);

  const customer = customers.find((c) => c.id === selectedCustomer);

  // お届け先情報を取得（顧客自身 or 登録済みお届け先）
  const getRecipientInfo = () => {
    if (!customer) return null;

    if (selectedRecipient === "self") {
      return {
        name: customer.name,
        postalCode: customer.postalCode,
        address: customer.address,
        phone: customer.phone,
      };
    }

    const recipient = customer.recipients?.find((r) => r.id === selectedRecipient);
    if (recipient) {
      return {
        name: recipient.name,
        postalCode: recipient.postalCode,
        address: recipient.address,
        phone: recipient.phone,
      };
    }

    return null;
  };

  const recipientInfo = getRecipientInfo();

  // 配送料金の自動計算
  const calculateShippingCost = useMemo(() => {
    if (!shippingCompany || selectedProducts.length === 0) {
      return null;
    }

    // 1. 商品のサイズをカウント
    const sizeCounts: Record<string, number> = {};
    selectedProducts.forEach((item) => {
      const size = item.size;
      sizeCounts[size] = (sizeCounts[size] || 0) + item.quantity;
    });

    // 2. 荷合いルールを適用
    const enabledRules = consolidationRules.filter((r) => r.enabled);
    let consolidatedSizes: Record<string, number> = { ...sizeCounts };

    // ルールを適用（大きいサイズから順に）
    enabledRules
      .sort((a, b) => parseInt(b.fromSize) - parseInt(a.fromSize))
      .forEach((rule) => {
        const count = consolidatedSizes[rule.fromSize] || 0;
        const applicableSets = Math.floor(count / rule.quantity);
        if (applicableSets > 0) {
          // 荷合いルールを適用
          consolidatedSizes[rule.fromSize] = count - applicableSets * rule.quantity;
          consolidatedSizes[rule.toSize] = (consolidatedSizes[rule.toSize] || 0) + applicableSets;
        }
      });

    // 3. 最終的なサイズを決定（最大のサイズを使用）
    const sizes = Object.entries(consolidatedSizes)
      .filter(([_, count]) => count > 0)
      .map(([size]) => parseInt(size));

    if (sizes.length === 0) {
      return null;
    }

    const finalSize = Math.max(...sizes).toString();

    // 4. 配送料金を取得
    const rate = shippingRates.find(
      (r) => r.carrier === shippingCompany && r.size === finalSize
    );

    if (!rate) {
      return null;
    }

    const basePrice = rate.basePrice;
    const coolPrice = useCoolDelivery ? rate.coolPrice : 0;
    const total = basePrice + coolPrice;

    return {
      originalSizes: sizeCounts,
      consolidatedSizes,
      finalSize,
      basePrice,
      coolPrice,
      total,
      appliedRules: enabledRules.filter((rule) => {
        const count = sizeCounts[rule.fromSize] || 0;
        return count >= rule.quantity;
      }),
    };
  }, [shippingCompany, selectedProducts, useCoolDelivery, shippingRates, consolidationRules]);

  const addProduct = (productId: string, variantId?: string) => {
    let size = "";
    let name = "";
    let variantName = "";

    if (variantId) {
      const variant = productVariants.find((v) => v.id === variantId);
      const product = products.find((p) => p.id === productId);
      if (variant && product) {
        size = variant.size;
        name = product.name;
        variantName = variant.name;
      }
    } else {
      const product = products.find((p) => p.id === productId);
      if (product && !product.isParent) {
        size = product.size || "";
        name = product.name;
      }
    }

    if (size && name) {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId,
          variantId,
          productName: name,
          variantName,
          size,
          quantity: 1,
        },
      ]);
    }
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = [...selectedProducts];
    updated[index].quantity = quantity;
    setSelectedProducts(updated);
  };

  const steps = [
    { number: 1, title: "顧客選択", icon: Check },
    { number: 2, title: "商品選択", icon: Package },
    { number: 3, title: "配送設定", icon: Truck },
  ];

  const shippingCompanies: Array<{ id: ShippingCarrier; name: string; logo: string }> = [
    { id: "yamato", name: "ヤマト運輸", logo: "🐱" },
    { id: "sagawa", name: "佐川急便", logo: "📦" },
    { id: "yupack", name: "ゆうパック", logo: "📮" },
  ];

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">送り状作成</h1>
            <p className="text-sm sm:text-base text-muted-foreground">配送業者の送り状を作成・印刷</p>
          </div>
          <Button
            onClick={() => navigate("/shipping/import")}
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <FileText className="w-4 h-4" />
            <span className="sm:inline">AI送り状作成</span>
          </Button>
        </div>

        {/* Step Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                        currentStep >= step.number
                          ? "bg-primary text-white shadow-lg scale-105"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <span className="text-lg font-bold">{step.number}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{step.title}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-1 flex-1 rounded transition-all ${
                        currentStep > step.number ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Left: Form */}
          <div className="space-y-4 lg:space-y-6">
            <Card className="card-hover">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">配送情報入力</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Step 1: Customer */}
                {currentStep >= 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">ご依頼主（ご請求先）選択 *</Label>
                      <Select
                        value={selectedCustomer}
                        onValueChange={(value) => {
                          setSelectedCustomer(value);
                          setSelectedRecipient("self");
                        }}
                      >
                        <SelectTrigger id="customer" className="h-12">
                          <SelectValue placeholder="ご依頼主を選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {customer && (
                      <>
                        <Card className="bg-gradient-to-br from-blue/5 to-blue/10 border-blue-500/20">
                          <CardContent className="pt-6">
                            <div className="space-y-2 text-sm">
                              <div className="text-xs text-muted-foreground">ご依頼主</div>
                              <div className="font-semibold text-base">{customer.name}</div>
                              <div>〒{customer.postalCode}</div>
                              <div>{customer.address}</div>
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Badge variant="outline">📞 {customer.phone}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* お届け先選択 */}
                        <div className="space-y-2">
                          <Label htmlFor="recipient" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            お届け先を選択 *
                          </Label>
                          <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                            <SelectTrigger id="recipient" className="h-12">
                              <SelectValue placeholder="お届け先を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self">
                                ご依頼主と同じ（{customer.name}）
                              </SelectItem>
                              {customer.recipients && customer.recipients.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    登録済みのお届け先
                                  </div>
                                  {customer.recipients.map((recipient) => (
                                    <SelectItem key={recipient.id} value={recipient.id}>
                                      {recipient.name}
                                      {recipient.relation && ` (${recipient.relation})`}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 選択されたお届け先情報の表示 */}
                        {recipientInfo && (
                          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                            <CardContent className="pt-6">
                              <div className="space-y-2 text-sm">
                                <div className="text-xs text-muted-foreground">お届け先</div>
                                <div className="font-semibold text-base">{recipientInfo.name} 様</div>
                                <div>〒{recipientInfo.postalCode}</div>
                                <div>{recipientInfo.address}</div>
                                <div className="flex items-center gap-2 pt-2 border-t">
                                  <Badge variant="outline">📞 {recipientInfo.phone}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Products */}
                {currentStep >= 2 && (
                  <div className="space-y-4 pt-4 border-t">
                    <Label>商品選択 *</Label>

                    {/* 商品追加 */}
                    <div className="space-y-2">
                      <Select onValueChange={(value) => {
                        const [productId, variantId] = value.split("::");
                        addProduct(productId, variantId);
                      }}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="商品を追加" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => {
                            if (product.isParent) {
                              const variants = productVariants.filter(
                                (v) => v.parentProductId === product.id
                              );
                              return variants.map((variant) => (
                                <SelectItem
                                  key={variant.id}
                                  value={`${product.id}::${variant.id}`}
                                >
                                  {product.name} - {variant.name} ({variant.size}サイズ)
                                </SelectItem>
                              ));
                            } else {
                              return (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.size}サイズ)
                                </SelectItem>
                              );
                            }
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 選択された商品一覧 */}
                    {selectedProducts.length > 0 && (
                      <div className="space-y-2">
                        {selectedProducts.map((item, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                              <div className="flex-1 w-full sm:w-auto">
                                <div className="font-medium text-sm">
                                  {item.productName}
                                  {item.variantName && ` - ${item.variantName}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.size}サイズ
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(index, parseInt(e.target.value))
                                  }
                                  className="w-20 h-9 text-center"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProduct(index)}
                                  className="text-destructive h-9"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {selectedProducts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">商品を選択してください</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Shipping */}
                {currentStep >= 3 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-3">
                      <Label>配送業者選択 *</Label>
                      <div className="grid gap-3">
                        {shippingCompanies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => setShippingCompany(company.id)}
                            className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                              shippingCompany === company.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{company.logo}</div>
                              <div className="text-left">
                                <div className="font-semibold">{company.name}</div>
                              </div>
                            </div>
                            {shippingCompany === company.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* クール便オプション */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
                      <input
                        type="checkbox"
                        id="coolDelivery"
                        checked={useCoolDelivery}
                        onChange={(e) => setUseCoolDelivery(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="coolDelivery" className="cursor-pointer flex items-center gap-2">
                        <Snowflake className="h-4 w-4 text-blue-500" />
                        クール便を使用する
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">配送希望日</Label>
                      <Input id="date" type="date" className="h-12" />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 h-11 sm:h-12 btn-hover text-sm sm:text-base"
                    >
                      戻る
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1 h-11 sm:h-12 btn-hover gap-2 text-sm sm:text-base"
                      disabled={
                        (currentStep === 1 && !selectedCustomer) ||
                        (currentStep === 2 && selectedProducts.length === 0)
                      }
                    >
                      次へ
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="flex-1 h-11 sm:h-12 btn-hover gap-2 text-sm sm:text-base">
                      <Printer className="h-4 w-4" />
                      印刷
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4 lg:space-y-6">
            <Card className="card-hover">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">送り状プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                {shippingCompany && customer && recipientInfo ? (
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {shippingCompanies.find((c) => c.id === shippingCompany)?.name}
                        </h3>
                      </div>
                      <div className="space-y-1 border-t-2 border-dashed pt-6">
                        <div className="text-xs text-muted-foreground">お届け先</div>
                        <div className="font-bold text-lg">〒{recipientInfo.postalCode}</div>
                        <div className="font-medium">{recipientInfo.address}</div>
                        <div className="text-2xl font-bold pt-2">{recipientInfo.name} 様</div>
                        <div className="text-muted-foreground">{recipientInfo.phone}</div>
                      </div>
                      <div className="border-t-2 border-dashed pt-6">
                        <div className="text-xs text-muted-foreground">ご依頼主（ご請求先）</div>
                        <div className="font-bold text-lg">〒{customer.postalCode}</div>
                        <div className="font-medium">{customer.address}</div>
                        <div className="text-xl font-bold pt-2">{customer.name}</div>
                        <div className="text-muted-foreground">{customer.phone}</div>
                      </div>
                      {calculateShippingCost && (
                        <div className="border-t-2 border-dashed pt-6">
                          <div className="text-xs text-muted-foreground mb-2">配送サイズ</div>
                          <div className="text-2xl font-bold text-primary">
                            {calculateShippingCost.finalSize}サイズ
                          </div>
                          {useCoolDelivery && (
                            <Badge variant="secondary" className="mt-2">
                              <Snowflake className="h-3 w-3 mr-1" />
                              クール便
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        配送情報を入力してください
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {calculateShippingCost && (
              <Card className="card-hover">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">配送料金（自動計算）</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* 元のサイズ */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground">商品サイズ</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(calculateShippingCost.originalSizes).map(
                          ([size, count]) => (
                            <Badge key={size} variant="outline">
                              {size}サイズ × {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {/* 荷合い適用後 */}
                    {calculateShippingCost.appliedRules.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          荷合いルール適用
                        </div>
                        <div className="space-y-1">
                          {calculateShippingCost.appliedRules.map((rule) => (
                            <div
                              key={rule.id}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <Check className="h-3 w-3 text-green-600" />
                              {rule.name}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(calculateShippingCost.consolidatedSizes)
                            .filter(([_, count]) => count > 0)
                            .map(([size, count]) => (
                              <Badge key={size} variant="secondary">
                                {size}サイズ × {count}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 料金詳細 */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span>基本料金（{calculateShippingCost.finalSize}サイズ）</span>
                        <span>¥{calculateShippingCost.basePrice.toLocaleString()}</span>
                      </div>
                      {useCoolDelivery && (
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Snowflake className="h-3 w-3 text-blue-500" />
                            クール便追加料金
                          </span>
                          <span>¥{calculateShippingCost.coolPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-3 text-lg font-bold">
                        <span>合計</span>
                        <span className="text-primary">
                          ¥{calculateShippingCost.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
