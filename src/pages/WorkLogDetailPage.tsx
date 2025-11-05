import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, CalendarIcon, MapPin, FileText, Sprout, Package } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WorkLogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workLog, isLoading } = useQuery({
    queryKey: ["work-log", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("work_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-logs"] });
      toast({
        title: "削除しました",
        description: "作業日誌を削除しました。",
      });
      navigate("/work-logs/list");
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!workLog) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">日誌が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/work-logs/list")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">作業日誌 詳細</h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(workLog.log_date), "yyyy年MM月dd日")}の記録
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/work-logs/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。作業日誌が完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">作業日</div>
              <div className="text-foreground">
                {format(new Date(workLog.log_date), "yyyy年MM月dd日")}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                圃場
              </div>
              <div className="text-foreground">{workLog.field}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">入力方法</div>
              <div className="text-foreground">
                {workLog.input_type === "manual" ? "手動入力" : "AI入力"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              作業内容
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{workLog.work_details}</p>
          </CardContent>
        </Card>

        {workLog.harvest_items && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5" />
                収穫物
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{workLog.harvest_items}</p>
            </CardContent>
          </Card>
        )}

        {workLog.materials_used && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                使用資材
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{workLog.materials_used}</p>
            </CardContent>
          </Card>
        )}

        {workLog.photo_url && (
          <Card>
            <CardHeader>
              <CardTitle>添付写真</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={workLog.photo_url}
                alt="作業写真"
                className="rounded-lg max-w-full h-auto"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkLogDetailPage;
