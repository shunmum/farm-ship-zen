import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";

const CustomerManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">顧客管理</h1>
            <p className="text-muted-foreground">顧客情報の管理と検索</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規顧客登録
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="顧客名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="secondary">検索</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>顧客一覧</CardTitle>
            <CardDescription>登録されている顧客</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">顧客データがありません</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerManagement;
