import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  size: string;
  isParent: boolean;
}

interface ProductVariant {
  id: string;
  parentProductId: string;
  name: string;
  price: number;
}

interface Recipient {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  products: { productId: string; productName: string; quantity: number; price: number }[];
}

const PublicOrderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  // ステップ1: 送り先の人数
  const [recipientCount, setRecipientCount] = useState(1);

  // ステップ2: 注文者情報
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // ステップ3以降: 各送り先の情報と商品
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0);

  // 注文完了
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadFormData();
    }
  }, [slug]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError("");

      // フォーム設定を取得
      const { data: formData, error: formError } = await supabase
        .from("public_order_forms")
        .select("*")
        .eq("form_url_slug", slug)
        .eq("is_active", true)
        .single();

      if (formError || !formData) {
        setError("注文フォームが見つかりません");
        return;
      }

      setFormData(formData);

      // 商品データを取得
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", formData.user_id);

      const { data: variantsData } = await supabase
        .from("product_variants")
        .select("*")
        .eq("user_id", formData.user_id);

      setProducts(
        (productsData || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          size: p.size || "",
          isParent: p.is_parent,
        }))
      );

      setProductVariants(
        (variantsData || []).map((v) => ({
          id: v.id,
          parentProductId: v.parent_product_id,
          name: v.name,
          price: Number(v.price),
        }))
      );
    } catch (err) {
      console.error("Error loading form:", err);
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Next = () => {
    if (recipientCount < 1 || recipientCount > 10) {
      setError("送り先は1〜10人までです");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setError("すべての項目を入力してください");
      return;
    }
    setError("");

    // 送り先の初期データを作成
    const initialRecipients: Recipient[] = Array.from({ length: recipientCount }, () => ({
      name: "",
      postalCode: "",
      address: "",
      phone: "",
      products: [],
    }));
    setRecipients(initialRecipients);
    setCurrentRecipientIndex(0);
    setCurrentStep(3);
  };

  const handleRecipientInfoNext = () => {
    const recipient = recipients[currentRecipientIndex];
    if (!recipient.name || !recipient.postalCode || !recipient.address || !recipient.phone) {
      setError("すべての項目を入力してください");
      return;
    }
    setError("");
    setCurrentStep(4);
  };

  const handleProductSelectionNext = () => {
    const recipient = recipients[currentRecipientIndex];
    if (recipient.products.length === 0) {
      setError("商品を1つ以上選択してください");
      return;
    }
    setError("");

    // 次の送り先へ、または確認画面へ
    if (currentRecipientIndex < recipientCount - 1) {
      setCurrentRecipientIndex(currentRecipientIndex + 1);
      setCurrentStep(3);
    } else {
      setCurrentStep(5);
    }
  };

  const updateRecipientInfo = (field: string, value: string) => {
    const updated = [...recipients];
    updated[currentRecipientIndex] = {
      ...updated[currentRecipientIndex],
      [field]: value,
    };
    setRecipients(updated);
  };

  const addProduct = (productId: string, productName: string, price: number) => {
    const updated = [...recipients];
    const existingIndex = updated[currentRecipientIndex].products.findIndex(
      (p) => p.productId === productId
    );

    if (existingIndex >= 0) {
      updated[currentRecipientIndex].products[existingIndex].quantity += 1;
    } else {
      updated[currentRecipientIndex].products.push({
        productId,
        productName,
        quantity: 1,
        price,
      });
    }
    setRecipients(updated);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    const updated = [...recipients];
    const productIndex = updated[currentRecipientIndex].products.findIndex(
      (p) => p.productId === productId
    );

    if (quantity <= 0) {
      updated[currentRecipientIndex].products.splice(productIndex, 1);
    } else {
      updated[currentRecipientIndex].products[productIndex].quantity = quantity;
    }
    setRecipients(updated);
  };

  const calculateTotal = () => {
    return recipients.reduce((total, recipient) => {
      return total + recipient.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      setError("");

      // 注文番号を生成
      const orderNumber = `PUB${Date.now()}`;
      const totalAmount = calculateTotal();

      // 公開注文を作成
      const { data: orderData, error: orderError } = await supabase
        .from("public_orders")
        .insert({
          form_id: formData.id,
          user_id: formData.user_id,
          order_number: orderNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          total_amount: totalAmount,
          payment_status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 各送り先と商品を保存
      for (const recipient of recipients) {
        const { data: recipientData, error: recipientError } = await supabase
          .from("public_order_recipients")
          .insert({
            public_order_id: orderData.id,
            recipient_name: recipient.name,
            recipient_postal_code: recipient.postalCode,
            recipient_address: recipient.address,
            recipient_phone: recipient.phone,
          })
          .select()
          .single();

        if (recipientError) throw recipientError;

        // 商品明細を保存
        const items = recipient.products.map((p) => ({
          public_order_id: orderData.id,
          recipient_id: recipientData.id,
          product_id: p.productId,
          product_name: p.productName,
          quantity: p.quantity,
          unit_price: p.price,
          total_price: p.price * p.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("public_order_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      setOrderCompleted(true);
    } catch (err) {
      console.error("Error submitting order:", err);
      setError("注文の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">注文完了！</CardTitle>
            <CardDescription className="text-lg mt-2">
              ご注文ありがとうございました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg">
              ご登録いただいたメールアドレスに確認メールをお送りしました。
            </p>
            <p className="text-center text-base text-muted-foreground">
              商品の発送まで今しばらくお待ちください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {formData?.farm_display_name}
          </h1>
          {formData?.welcome_message && (
            <p className="text-lg text-gray-600">{formData.welcome_message}</p>
          )}
        </div>

        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    currentStep >= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-8 h-1 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "何人に送りますか？"}
              {currentStep === 2 && "ご注文者さまの情報"}
              {currentStep === 3 && `送り先 ${currentRecipientIndex + 1}/${recipientCount} の情報`}
              {currentStep === 4 && `送り先 ${currentRecipientIndex + 1}/${recipientCount} の商品選択`}
              {currentStep === 5 && "注文内容の確認"}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 && "ギフトで複数の方に送る場合は人数を入力してください"}
              {currentStep === 2 && "ご注文者さまのお名前とご連絡先を入力してください"}
              {currentStep === 3 && "お届け先の情報を入力してください"}
              {currentStep === 4 && "お届けする商品を選んでください"}
              {currentStep === 5 && "内容を確認して、注文を確定してください"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-700 text-lg font-medium">{error}</p>
              </div>
            )}

            {/* ステップ1: 送り先の人数 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="count" className="text-xl mb-3 block">
                    送り先の人数
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="10"
                    value={recipientCount}
                    onChange={(e) => setRecipientCount(parseInt(e.target.value) || 1)}
                    className="text-2xl h-16 text-center"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    ※ 自分用の場合は「1」のままで大丈夫です
                  </p>
                </div>
                <Button onClick={handleStep1Next} size="lg" className="w-full h-14 text-xl">
                  次へ
                </Button>
              </div>
            )}

            {/* ステップ2: 注文者情報 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="customerName" className="text-lg mb-2 block">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="山田 太郎"
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail" className="text-lg mb-2 block">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-lg mb-2 block">
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    戻る
                  </Button>
                  <Button onClick={handleStep2Next} size="lg" className="flex-1 h-14 text-xl">
                    次へ
                  </Button>
                </div>
              </div>
            )}

            {/* ステップ3: 送り先情報 */}
            {currentStep === 3 && recipients[currentRecipientIndex] && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="recipientName" className="text-lg mb-2 block">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipients[currentRecipientIndex].name}
                    onChange={(e) => updateRecipientInfo("name", e.target.value)}
                    placeholder="鈴木 花子"
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientPostalCode" className="text-lg mb-2 block">
                    郵便番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recipientPostalCode"
                    value={recipients[currentRecipientIndex].postalCode}
                    onChange={(e) => updateRecipientInfo("postalCode", e.target.value)}
                    placeholder="123-4567"
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientAddress" className="text-lg mb-2 block">
                    住所 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recipientAddress"
                    value={recipients[currentRecipientIndex].address}
                    onChange={(e) => updateRecipientInfo("address", e.target.value)}
                    placeholder="東京都〇〇区〇〇..."
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientPhone" className="text-lg mb-2 block">
                    電話番号 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    value={recipients[currentRecipientIndex].phone}
                    onChange={(e) => updateRecipientInfo("phone", e.target.value)}
                    placeholder="090-1234-5678"
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (currentRecipientIndex > 0) {
                        setCurrentRecipientIndex(currentRecipientIndex - 1);
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleRecipientInfoNext}
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    次へ
                  </Button>
                </div>
              </div>
            )}

            {/* ステップ4: 商品選択 */}
            {currentStep === 4 && recipients[currentRecipientIndex] && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {products.map((product) => {
                    if (product.isParent) {
                      const variants = productVariants.filter(
                        (v) => v.parentProductId === product.id
                      );
                      return (
                        <div key={product.id} className="space-y-2">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          {variants.map((variant) => {
                            const selected = recipients[currentRecipientIndex].products.find(
                              (p) => p.productId === variant.id
                            );
                            return (
                              <Card key={variant.id} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-lg font-medium">
                                      {variant.name} - ¥{variant.price.toLocaleString()}
                                    </p>
                                  </div>
                                  {selected ? (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() =>
                                          updateProductQuantity(variant.id, selected.quantity - 1)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="h-10 w-10 text-xl"
                                      >
                                        −
                                      </Button>
                                      <span className="text-xl font-bold w-12 text-center">
                                        {selected.quantity}
                                      </span>
                                      <Button
                                        onClick={() =>
                                          updateProductQuantity(variant.id, selected.quantity + 1)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="h-10 w-10 text-xl"
                                      >
                                        +
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() =>
                                        addProduct(variant.id, `${product.name} ${variant.name}`, variant.price)
                                      }
                                      size="sm"
                                      className="h-10"
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      追加
                                    </Button>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      );
                    } else {
                      const selected = recipients[currentRecipientIndex].products.find(
                        (p) => p.productId === product.id
                      );
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-lg font-medium">
                                {product.name} - ¥{product.price.toLocaleString()}
                              </p>
                            </div>
                            {selected ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() =>
                                    updateProductQuantity(product.id, selected.quantity - 1)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 text-xl"
                                >
                                  −
                                </Button>
                                <span className="text-xl font-bold w-12 text-center">
                                  {selected.quantity}
                                </span>
                                <Button
                                  onClick={() =>
                                    updateProductQuantity(product.id, selected.quantity + 1)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 text-xl"
                                >
                                  +
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => addProduct(product.id, product.name, product.price)}
                                size="sm"
                                className="h-10"
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                追加
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    }
                  })}
                </div>

                {recipients[currentRecipientIndex].products.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-2">選択した商品</h4>
                    <div className="space-y-2">
                      {recipients[currentRecipientIndex].products.map((p) => (
                        <div key={p.productId} className="flex justify-between text-base">
                          <span>
                            {p.productName} × {p.quantity}
                          </span>
                          <span className="font-semibold">
                            ¥{(p.price * p.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleProductSelectionNext}
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    {currentRecipientIndex < recipientCount - 1 ? "次の送り先へ" : "確認画面へ"}
                  </Button>
                </div>
              </div>
            )}

            {/* ステップ5: 確認画面 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-3">ご注文者さま</h3>
                    <div className="space-y-1 text-base">
                      <p>お名前: {customerName}</p>
                      <p>メール: {customerEmail}</p>
                      <p>電話: {customerPhone}</p>
                    </div>
                  </div>

                  {recipients.map((recipient, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-3">送り先 {index + 1}</h3>
                      <div className="space-y-2">
                        <div className="text-base">
                          <p>お名前: {recipient.name}</p>
                          <p>〒{recipient.postalCode}</p>
                          <p>{recipient.address}</p>
                          <p>電話: {recipient.phone}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <h4 className="font-semibold mb-2">商品</h4>
                          {recipient.products.map((p) => (
                            <div key={p.productId} className="flex justify-between text-base">
                              <span>
                                {p.productName} × {p.quantity}
                              </span>
                              <span>¥{(p.price * p.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-primary/10 p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">合計金額</span>
                      <span className="text-3xl font-bold text-primary">
                        ¥{calculateTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setCurrentRecipientIndex(recipientCount - 1);
                      setCurrentStep(4);
                    }}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-xl"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    size="lg"
                    className="flex-1 h-14 text-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      "注文を確定する"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicOrderPage;
