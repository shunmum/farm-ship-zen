import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">設定</h1>
          <p className="text-muted-foreground">システムの各種設定</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>商品マスター</CardTitle>
            <CardDescription>販売する商品の登録と管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>商品マスター管理</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配送料金設定</CardTitle>
            <CardDescription>地域別・商品別の配送料金設定</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>配送料金設定</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配送業者設定</CardTitle>
            <CardDescription>ヤマト運輸、佐川急便などの設定</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>配送業者設定</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
