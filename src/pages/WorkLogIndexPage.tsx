import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, MessageSquare } from "lucide-react";

const WorkLogIndexPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">作業日誌</h1>
          <p className="text-muted-foreground">
            日々の農作業を記録し、管理しましょう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 手動入力カード */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileEdit className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle>手動で記録する</CardTitle>
              <CardDescription>
                フォーム形式で詳細な作業内容を入力できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  作業日・圃場の記録
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  収穫物・使用資材の詳細入力
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  写真の添付が可能
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => navigate("/work-logs/manual")}
              >
                手動入力を開始
              </Button>
            </CardContent>
          </Card>

          {/* AIチャット入力カード */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-secondary/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <CardTitle>AIと会話して記録する</CardTitle>
              <CardDescription>
                AIとの対話形式で簡単に作業内容を記録できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  自然な会話で情報入力
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  AIが必要事項を質問
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  自動で情報を整理
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => navigate("/work-logs/chat")}
              >
                AI入力を開始
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkLogIndexPage;
