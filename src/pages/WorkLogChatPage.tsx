import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WorkLogChatPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "こんにちは！今日の作業内容を教えてください。いつ、どこの畑で、どんな作業をしましたか？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("work-log-chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // AIが作業内容を完全に収集したかチェック
      if (data.isComplete && data.workLogData) {
        handleSaveWorkLog(data.workLogData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkLog = async (workLogData: any) => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "エラー",
          description: "ログインが必要です",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("work_logs").insert({
        user_id: user.id,
        log_date: workLogData.logDate,
        field: workLogData.field,
        work_details: workLogData.workDetails,
        photo_url: workLogData.photoUrl || null,
        harvest_items: workLogData.harvestItems || null,
        materials_used: workLogData.materialsUsed || null,
        input_type: "ai_chat",
      });

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "作業日誌を保存しました",
      });

      setTimeout(() => {
        navigate("/work-logs");
      }, 1500);
    } catch (error) {
      console.error("Error saving work log:", error);
      toast({
        title: "エラー",
        description: "保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/work-logs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI会話入力</h1>
            <p className="text-muted-foreground">
              AIと会話しながら作業日誌を記録します
            </p>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>作業内容の記録</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              {isSaving && (
                <div className="flex justify-center">
                  <div className="bg-secondary rounded-lg px-6 py-3 flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">保存中...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                disabled={isLoading || isSaving}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || isSaving}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkLogChatPage;
