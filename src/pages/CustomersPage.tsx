import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit, Trash2, Printer } from "lucide-react";
import { useSampleData } from "@/hooks/useSampleData";

const CustomersPage = () => {
  const { customers } = useSampleData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">顧客管理</h1>
            <p className="text-muted-foreground">顧客情報の管理と検索</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            新規顧客追加
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>顧客検索</CardTitle>
            <CardDescription>名前、住所、電話番号で検索</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="顧客名、電話番号、メールアドレスで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base"
                />
              </div>
              <Button variant="secondary" size="lg">
                検索
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>顧客一覧</CardTitle>
            <CardDescription>登録されている顧客（{filteredCustomers.length}件）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">顧客名</th>
                    <th className="pb-3 font-medium">住所</th>
                    <th className="pb-3 font-medium">電話番号</th>
                    <th className="pb-3 font-medium">メールアドレス</th>
                    <th className="pb-3 font-medium">最終購入日</th>
                    <th className="pb-3 font-medium">総購入金額</th>
                    <th className="pb-3 font-medium">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b text-sm hover:bg-muted/50">
                      <td className="py-4 font-medium">{customer.name}</td>
                      <td className="py-4">
                        〒{customer.postalCode}<br />
                        {customer.address}
                      </td>
                      <td className="py-4">{customer.phone}</td>
                      <td className="py-4">{customer.email}</td>
                      <td className="py-4">{customer.lastPurchaseDate}</td>
                      <td className="py-4 font-medium">¥{customer.totalSpent.toLocaleString()}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-3 w-3" />
                            編集
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="h-3 w-3" />
                            送り状
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive">
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
      </div>
    </div>
  );
};

export default CustomersPage;
