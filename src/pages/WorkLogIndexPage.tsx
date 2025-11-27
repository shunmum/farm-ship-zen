import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, MessageSquare } from "lucide-react";

const WorkLogIndexPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">作業日誌</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            日々の農作業を記録し、管理しましょう
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 手動入力カード */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                  <FileEdit className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg md:text-xl">手動で記録する</CardTitle>
              <CardDescription className="text-sm">
                フォーム形式で詳細な作業内容を入力できます
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  作業日・圃場の記録
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  収穫物・使用資材の詳細入力
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  写真の添付が可能
                </li>
              </ul>
              <Button 
                className="w-full text-sm md:text-base" 
                onClick={() => navigate("/work-logs/manual")}
              >
                手動入力を開始
              </Button>
            </CardContent>
          </Card>

          {/* AIチャット入力カード */}
          <Card className="relative overflow-hidden border-2 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] hover:-translate-y-1 cursor-pointer rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400/30">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="p-2 md:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                  <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg md:text-xl text-white font-semibold">
                ✨ AIと会話して記録する
              </CardTitle>
              <CardDescription className="text-sm text-white/90">
                AIとの対話形式で簡単に作業内容を記録できます
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <ul className="space-y-2 text-xs md:text-sm text-white/85 mb-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90 flex-shrink-0" />
                  自然な会話で情報入力
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90 flex-shrink-0" />
                  AIが必要事項を質問
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90 flex-shrink-0" />
                  自動で情報を整理
                </li>
              </ul>
              <Button
                className="w-full bg-white hover:bg-white/90 text-purple-600 font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(139,92,246,0.3)] text-sm md:text-base"
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
