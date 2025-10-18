import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ダッシュボード</h1>
          <p className="text-muted-foreground">販売と配送の状況を一目で確認</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今月の売上</CardDescription>
              <CardTitle className="text-3xl">¥0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">前月比 +0%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>受注件数</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">今月の受注</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>配送済み</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">今月の配送</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>顧客数</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">登録顧客</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最近の受注</CardTitle>
              <CardDescription>直近5件の受注情報</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">受注データがありません</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>入金状況</CardTitle>
              <CardDescription>未入金の受注</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">入金データがありません</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
