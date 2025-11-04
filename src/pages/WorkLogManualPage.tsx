import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";

const WorkLogManualPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    logDate: new Date().toISOString().split('T')[0],
    field: "",
    workDetails: "",
    photoUrl: "",
    harvestItems: "",
    materialsUsed: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        log_date: formData.logDate,
        field: formData.field,
        work_details: formData.workDetails,
        photo_url: formData.photoUrl || null,
        harvest_items: formData.harvestItems || null,
        materials_used: formData.materialsUsed || null,
        input_type: "manual",
      });

      if (error) throw error;

      toast({
        title: "保存完了",
        description: "作業日誌を保存しました",
      });

      navigate("/work-logs");
    } catch (error) {
      console.error("Error saving work log:", error);
      toast({
        title: "エラー",
        description: "保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/work-logs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">手動入力</h1>
            <p className="text-muted-foreground">作業内容を詳細に記録します</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>作業日誌入力フォーム</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 作業日 */}
              <div className="space-y-2">
                <Label htmlFor="logDate">作業日 *</Label>
                <Input
                  id="logDate"
                  name="logDate"
                  type="date"
                  value={formData.logDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 圃場 */}
              <div className="space-y-2">
                <Label htmlFor="field">圃場・畑 *</Label>
                <Input
                  id="field"
                  name="field"
                  placeholder="例：第1圃場、南の畑"
                  value={formData.field}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* 作業内容 */}
              <div className="space-y-2">
                <Label htmlFor="workDetails">作業内容 *</Label>
                <Textarea
                  id="workDetails"
                  name="workDetails"
                  placeholder="例：トマトの収穫作業を実施。午前中に実施。"
                  value={formData.workDetails}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              {/* 収穫物 */}
              <div className="space-y-2">
                <Label htmlFor="harvestItems">収穫物と量</Label>
                <Input
                  id="harvestItems"
                  name="harvestItems"
                  placeholder="例：トマト 50kg、きゅうり 30kg"
                  value={formData.harvestItems}
                  onChange={handleChange}
                />
              </div>

              {/* 使用資材 */}
              <div className="space-y-2">
                <Label htmlFor="materialsUsed">使用した資材</Label>
                <Input
                  id="materialsUsed"
                  name="materialsUsed"
                  placeholder="例：農薬A 500ml、肥料B 2kg"
                  value={formData.materialsUsed}
                  onChange={handleChange}
                />
              </div>

              {/* 写真URL */}
              <div className="space-y-2">
                <Label htmlFor="photoUrl">写真URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    placeholder="https://..."
                    value={formData.photoUrl}
                    onChange={handleChange}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  写真のURLを入力してください
                </p>
              </div>

              {/* 送信ボタン */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/work-logs")}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkLogManualPage;
