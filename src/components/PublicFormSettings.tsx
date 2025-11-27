import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePublicOrderForm } from "@/hooks/usePublicOrderForm";
import { Copy, ExternalLink, Loader2, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const PublicFormSettings = () => {
  const { form, loading, createForm, updateForm, getFormUrl } = usePublicOrderForm();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    formUrlSlug: "",
    farmDisplayName: "",
    welcomeMessage: "",
    isActive: true,
  });

  const handleCreate = async () => {
    if (!formData.formUrlSlug || !formData.farmDisplayName) {
      toast({
        title: "入力エラー",
        description: "URLスラッグと農園名は必須です",
        variant: "destructive",
      });
      return;
    }

    // URLスラッグの検証（英数字とハイフンのみ）
    if (!/^[a-z0-9-]+$/.test(formData.formUrlSlug)) {
      toast({
        title: "入力エラー",
        description: "URLスラッグは半角英小文字、数字、ハイフンのみ使用できます",
        variant: "destructive",
      });
      return;
    }

    const { error } = await createForm(formData);
    if (error) {
      toast({
        title: "作成エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "作成完了",
        description: "公開注文フォームを作成しました",
      });
      setEditing(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.formUrlSlug || !formData.farmDisplayName) {
      toast({
        title: "入力エラー",
        description: "URLスラッグと農園名は必須です",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.formUrlSlug)) {
      toast({
        title: "入力エラー",
        description: "URLスラッグは半角英小文字、数字、ハイフンのみ使用できます",
        variant: "destructive",
      });
      return;
    }

    const { error } = await updateForm(formData);
    if (error) {
      toast({
        title: "更新エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "更新完了",
        description: "公開注文フォームを更新しました",
      });
      setEditing(false);
    }
  };

  const startEdit = () => {
    if (form) {
      setFormData({
        formUrlSlug: form.formUrlSlug,
        farmDisplayName: form.farmDisplayName,
        welcomeMessage: form.welcomeMessage || "",
        isActive: form.isActive,
      });
    }
    setEditing(true);
  };

  const copyUrl = () => {
    const url = getFormUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      toast({
        title: "コピーしました",
        description: "URLをクリップボードにコピーしました",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form && !editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>公開注文フォーム</CardTitle>
          <CardDescription>
            お客さまが直接注文できる公開フォームを作成できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              まだ公開注文フォームを作成していません
            </p>
            <Button onClick={() => setEditing(true)} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              公開フォームを作成
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{form ? "フォーム設定を編集" : "公開フォームを作成"}</CardTitle>
          <CardDescription>
            お客さまに表示される情報を設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug">
              URLスラッグ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.formUrlSlug}
              onChange={(e) =>
                setFormData({ ...formData, formUrlSlug: e.target.value.toLowerCase() })
              }
              placeholder="yamada-farm"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              半角英小文字、数字、ハイフンのみ使用できます（例: yamada-farm）
            </p>
            {formData.formUrlSlug && (
              <p className="text-sm text-primary">
                URL: {window.location.origin}/order/{formData.formUrlSlug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="farmName">
              農園名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="farmName"
              value={formData.farmDisplayName}
              onChange={(e) =>
                setFormData({ ...formData, farmDisplayName: e.target.value })
              }
              placeholder="やまだ農園"
            />
            <p className="text-sm text-muted-foreground">
              注文フォームに表示される農園名
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome">ウェルカムメッセージ（任意）</Label>
            <Textarea
              id="welcome"
              value={formData.welcomeMessage}
              onChange={(e) =>
                setFormData({ ...formData, welcomeMessage: e.target.value })
              }
              placeholder="いつもご利用ありがとうございます"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              注文フォームの上部に表示されるメッセージ
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active">フォームを有効化</Label>
              <p className="text-sm text-muted-foreground">
                無効にすると注文フォームが表示されなくなります
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setEditing(false)}
              variant="outline"
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              onClick={form ? handleUpdate : handleCreate}
              className="flex-1"
            >
              {form ? "更新" : "作成"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formUrl = getFormUrl();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>公開注文フォーム</CardTitle>
            <CardDescription>お客さまが注文できる公開URLです</CardDescription>
          </div>
          <Badge variant={form.isActive ? "default" : "secondary"}>
            {form.isActive ? "有効" : "無効"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-green-900">公開フォームが有効です</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-sm break-all">
                    {formUrl}
                  </code>
                  <Button
                    onClick={copyUrl}
                    variant="outline"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    コピー
                  </Button>
                  <Button
                    onClick={() => window.open(formUrl, "_blank")}
                    variant="outline"
                    size="sm"
                    className="gap-2 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                    開く
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">農園名</Label>
              <p className="text-base font-medium">{form.farmDisplayName}</p>
            </div>

            {form.welcomeMessage && (
              <div>
                <Label className="text-sm text-muted-foreground">
                  ウェルカムメッセージ
                </Label>
                <p className="text-base">{form.welcomeMessage}</p>
              </div>
            )}
          </div>
        </div>

        <Button onClick={startEdit} className="w-full">
          設定を編集
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicFormSettings;
