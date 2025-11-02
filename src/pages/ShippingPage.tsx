import { useState } from "react";
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
import { useSampleData } from "@/hooks/useSampleData";
import { Printer, FileDown, ArrowRight, Truck, Box, Snowflake, Check, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ShippingPage = () => {
  const { customers, products } = useSampleData();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");

  const customer = customers.find((c) => c.id === selectedCustomer);

  const steps = [
    { number: 1, title: "顧客選択", icon: Check },
    { number: 2, title: "商品選択", icon: Box },
    { number: 3, title: "配送設定", icon: Truck },
  ];

  const shippingCompanies = [
    { id: "yamato", name: "ヤマト運輸", price: 900, logo: "🐱" },
    { id: "sagawa", name: "佐川急便", price: 850, logo: "📦" },
    { id: "yupack", name: "ゆうパック", price: 920, logo: "📮" },
  ];

  return (
    <div className="min-h-screen bg-background p-8 fade-in">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">送り状作成</h1>
          <p className="text-muted-foreground">配送業者の送り状を作成・印刷</p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Form */}
          <div className="space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>配送情報入力</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Customer */}
                {currentStep >= 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">顧客選択 *</Label>
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger id="customer" className="h-12">
                          <SelectValue placeholder="顧客を選択してください" />
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
                      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                        <CardContent className="pt-6">
                          <div className="space-y-2 text-sm">
                            <div className="font-semibold text-base">{customer.name}</div>
                            <div>〒{customer.postalCode}</div>
                            <div>{customer.address}</div>
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Badge variant="outline">📞 {customer.phone}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 2: Products */}
                {currentStep >= 2 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="product">商品選択 *</Label>
                      <Select>
                        <SelectTrigger id="product" className="h-12">
                          <SelectValue placeholder="商品を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.slice(0, 6).map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ¥{product.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="size">サイズ（cm）</Label>
                        <Input id="size" placeholder="80" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">重量（kg）</Label>
                        <Input id="weight" placeholder="1.5" className="h-12" />
                      </div>
                    </div>
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
                                <div className="text-sm text-muted-foreground">
                                  ¥{company.price}〜
                                </div>
                              </div>
                            </div>
                            {shippingCompany === company.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">配送希望日</Label>
                      <Input id="date" type="date" className="h-12" />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 h-12 btn-hover"
                    >
                      戻る
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1 h-12 btn-hover gap-2"
                      disabled={currentStep === 1 && !selectedCustomer}
                    >
                      次へ
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="flex-1 h-12 btn-hover gap-2">
                      <Printer className="h-4 w-4" />
                      印刷
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>送り状プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                {shippingCompany && customer ? (
                  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {shippingCompanies.find((c) => c.id === shippingCompany)?.name}
                        </h3>
                      </div>
                      <div className="space-y-1 border-t-2 border-dashed pt-6">
                        <div className="text-xs text-muted-foreground">お届け先</div>
                        <div className="font-bold text-lg">〒{customer.postalCode}</div>
                        <div className="font-medium">{customer.address}</div>
                        <div className="text-2xl font-bold pt-2">{customer.name} 様</div>
                        <div className="text-muted-foreground">{customer.phone}</div>
                      </div>
                      <div className="border-t-2 border-dashed pt-6">
                        <div className="text-xs text-muted-foreground">ご依頼主</div>
                        <div className="font-medium">〒000-0000</div>
                        <div>農園住所</div>
                        <div className="font-bold text-lg">やまだ農園</div>
                      </div>
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

            {shippingCompany && (
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>配送料金</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>基本料金</span>
                      <span>¥900</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>クール便追加料金</span>
                      <span>¥220</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                      <span>合計</span>
                      <span className="text-primary">¥1,120</span>
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
