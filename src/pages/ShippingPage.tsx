import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Printer, FileDown, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const ShippingPage = () => {
  const { customers, products } = useSampleData();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shippingCompany, setShippingCompany] = useState("");
  const [serviceType, setServiceType] = useState("");

  const customer = customers.find((c) => c.id === selectedCustomer);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">送り状作成</h1>
          <p className="text-muted-foreground">配送業者の送り状を作成・印刷</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>配送情報入力</CardTitle>
                <CardDescription>送り状に必要な情報を入力してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">顧客選択 *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer">
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
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">お届け先：</span>
                          {customer.name}
                        </div>
                        <div>
                          <span className="font-medium">〒</span>
                          {customer.postalCode}
                        </div>
                        <div>{customer.address}</div>
                        <div>
                          <span className="font-medium">電話：</span>
                          {customer.phone}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="company">配送業者 *</Label>
                  <Select value={shippingCompany} onValueChange={setShippingCompany}>
                    <SelectTrigger id="company">
                      <SelectValue placeholder="配送業者を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yamato">ヤマト運輸</SelectItem>
                      <SelectItem value="sagawa">佐川急便</SelectItem>
                      <SelectItem value="yupack">ゆうパック</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">サービス種別 *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="サービスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常</SelectItem>
                      <SelectItem value="cool">クール便</SelectItem>
                      <SelectItem value="frozen">冷凍</SelectItem>
                      <SelectItem value="cod">代金引換</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">商品選択 *</Label>
                  <Select>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="商品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
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
                    <Input id="size" placeholder="80" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">重量（kg）</Label>
                    <Input id="weight" placeholder="1.5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">配送希望日</Label>
                  <Input id="date" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemName">品名</Label>
                  <Input id="itemName" placeholder="野菜" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">メッセージカード</Label>
                  <Textarea id="message" placeholder="お客様へのメッセージ" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>送り状プレビュー</CardTitle>
                <CardDescription>
                  {shippingCompany === "yamato" && "ヤマト運輸の送り状フォーマット"}
                  {shippingCompany === "sagawa" && "佐川急便の送り状フォーマット"}
                  {shippingCompany === "yupack" && "ゆうパックの送り状フォーマット"}
                  {!shippingCompany && "配送業者を選択するとプレビューが表示されます"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shippingCompany ? (
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-bold">
                          {shippingCompany === "yamato" && "ヤマト運輸 宅急便"}
                          {shippingCompany === "sagawa" && "佐川急便 飛脚宅配便"}
                          {shippingCompany === "yupack" && "ゆうパック"}
                        </h3>
                      </div>
                      {customer && (
                        <>
                          <div className="space-y-1 border-t pt-4">
                            <div className="text-xs text-muted-foreground">お届け先</div>
                            <div className="font-bold">〒{customer.postalCode}</div>
                            <div className="font-medium">{customer.address}</div>
                            <div className="text-lg font-bold">{customer.name} 様</div>
                            <div>{customer.phone}</div>
                          </div>
                          <div className="border-t pt-4">
                            <div className="text-xs text-muted-foreground">ご依頼主</div>
                            <div className="font-medium">〒000-0000</div>
                            <div>農園住所</div>
                            <div className="font-bold">農園名</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                    <p className="text-muted-foreground">
                      配送業者と顧客を選択してください
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>配送料金</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>基本料金</span>
                    <span>¥900</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>クール便追加料金</span>
                    <span>¥220</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>合計</span>
                    <span className="text-lg text-primary">¥1,120</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 gap-2">
                <Printer className="h-5 w-5" />
                印刷
              </Button>
              <Button size="lg" variant="outline" className="flex-1 gap-2">
                <FileDown className="h-5 w-5" />
                PDF保存
              </Button>
            </div>
            <Button size="lg" variant="secondary" className="w-full gap-2">
              保存して次へ
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
