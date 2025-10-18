import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const OrderManagement = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">受注管理</h1>
            <p className="text-muted-foreground">受注情報の管理</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規受注登録
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>受注一覧</CardTitle>
            <CardDescription>すべての受注情報</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">受注データがありません</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderManagement;
