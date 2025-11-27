import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShippingCalculation, PREFECTURES } from "@/hooks/useShippingCalculation";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ZoneManagement = () => {
  const {
    zones,
    prefectureZones,
    addZone,
    updateZone,
    deleteZone,
    setPrefectureZone,
    loading,
  } = useShippingCalculation();

  const { toast } = useToast();

  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [editingZone, setEditingZone] = useState<{ id?: string; name: string; displayOrder: number } | null>(null);
  const [selectedPrefectures, setSelectedPrefectures] = useState<Set<string>>(new Set());
  const [selectedZoneForAssignment, setSelectedZoneForAssignment] = useState<string>("");

  const toggleExpanded = (zoneId: string) => {
    const newExpanded = new Set(expandedZones);
    if (newExpanded.has(zoneId)) {
      newExpanded.delete(zoneId);
    } else {
      newExpanded.add(zoneId);
    }
    setExpandedZones(newExpanded);
  };

  const getPrefecturesForZone = (zoneId: string) => {
    return prefectureZones.filter(pz => pz.zoneId === zoneId);
  };

  const getUnassignedPrefectures = () => {
    const assignedPrefectures = new Set(prefectureZones.map(pz => pz.prefecture));
    return PREFECTURES.filter(p => !assignedPrefectures.has(p));
  };

  const handleSaveZone = async () => {
    if (!editingZone || !editingZone.name) {
      toast({
        title: "入力エラー",
        description: "ゾーン名を入力してください",
        variant: "destructive",
      });
      return;
    }

    const { error } = editingZone.id
      ? await updateZone(editingZone.id, {
          name: editingZone.name,
          displayOrder: editingZone.displayOrder,
        })
      : await addZone({
          name: editingZone.name,
          displayOrder: editingZone.displayOrder,
        });

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: editingZone.id ? "ゾーンを更新しました" : "ゾーンを追加しました",
      });
      setEditingZone(null);
    }
  };

  const handleDeleteZone = async (id: string, name: string) => {
    if (!confirm(`「${name}」ゾーンを削除しますか?このゾーンに割り当てられた都道府県は未割り当てになります。`)) {
      return;
    }

    const { error } = await deleteZone(id);

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "成功",
        description: "ゾーンを削除しました",
      });
    }
  };

  const togglePrefectureSelection = (prefecture: string) => {
    const newSelected = new Set(selectedPrefectures);
    if (newSelected.has(prefecture)) {
      newSelected.delete(prefecture);
    } else {
      newSelected.add(prefecture);
    }
    setSelectedPrefectures(newSelected);
  };

  const handleBulkAssignPrefectures = async () => {
    if (selectedPrefectures.size === 0 || !selectedZoneForAssignment) {
      toast({
        title: "入力エラー",
        description: "都道府県とゾーンを選択してください",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const prefecture of selectedPrefectures) {
      const { error } = await setPrefectureZone(prefecture, selectedZoneForAssignment);
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    if (errorCount === 0) {
      toast({
        title: "成功",
        description: `${successCount}件の都道府県を割り当てました`,
      });
      setSelectedPrefectures(new Set());
      setSelectedZoneForAssignment("");
    } else {
      toast({
        title: "一部エラー",
        description: `成功: ${successCount}件、失敗: ${errorCount}件`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ゾーン管理</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  const unassignedPrefectures = getUnassignedPrefectures();

  return (
    <div className="space-y-4">
      {/* ゾーン一覧 */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-5 w-5" />
                配送ゾーン管理
              </CardTitle>
              <CardDescription className="text-sm">
                配送地域をゾーンにまとめて管理します
              </CardDescription>
            </div>
            <Button
              className="gap-2 w-full sm:w-auto"
              onClick={() => setEditingZone({ name: "", displayOrder: zones.length + 1 })}
            >
              <Plus className="h-4 w-4" />
              新規ゾーン追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {zones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>ゾーンが登録されていません</p>
              <p className="text-xs mt-1">「新規ゾーン追加」ボタンから追加してください</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.map((zone) => {
                const zonePrefectures = getPrefecturesForZone(zone.id);
                const isExpanded = expandedZones.has(zone.id);

                return (
                  <div key={zone.id} className="border rounded-lg">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {zonePrefectures.length > 0 && (
                          <button
                            onClick={() => toggleExpanded(zone.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{zone.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {zonePrefectures.length}都道府県
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() =>
                            setEditingZone({
                              id: zone.id,
                              name: zone.name,
                              displayOrder: zone.displayOrder,
                            })
                          }
                        >
                          <Edit className="h-3 w-3" />
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive"
                          onClick={() => handleDeleteZone(zone.id, zone.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                          削除
                        </Button>
                      </div>
                    </div>

                    {isExpanded && zonePrefectures.length > 0 && (
                      <div className="border-t bg-muted/20 p-4">
                        <div className="text-xs text-muted-foreground font-semibold mb-2">
                          割り当て都道府県
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {zonePrefectures.map((pz) => (
                            <Badge key={pz.id} variant="secondary">
                              {pz.prefecture}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 都道府県割り当て */}
      {zones.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">都道府県のゾーン割り当て</CardTitle>
            <CardDescription className="text-sm">
              複数の都道府県を選択してゾーンに一括割り当てできます
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* ゾーン選択 */}
              <div className="space-y-2">
                <Label htmlFor="zone">割り当て先ゾーン</Label>
                <Select
                  value={selectedZoneForAssignment}
                  onValueChange={setSelectedZoneForAssignment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ゾーンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 都道府県選択エリア */}
              <div className="space-y-2">
                <Label>
                  都道府県を選択 ({selectedPrefectures.size}件選択中)
                </Label>
                <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {PREFECTURES.map((pref) => {
                      const existing = prefectureZones.find(pz => pz.prefecture === pref);
                      const isSelected = selectedPrefectures.has(pref);

                      return (
                        <button
                          key={pref}
                          onClick={() => togglePrefectureSelection(pref)}
                          className={`
                            p-2 text-sm rounded border transition-all text-left
                            ${isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background hover:bg-muted border-border'
                            }
                            ${existing ? 'opacity-60' : ''}
                          `}
                        >
                          <div className="font-medium">{pref}</div>
                          {existing && (
                            <div className="text-xs mt-0.5 opacity-75">
                              {existing.zoneName}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkAssignPrefectures}
                  disabled={selectedPrefectures.size === 0 || !selectedZoneForAssignment}
                  className="flex-1 sm:flex-initial"
                >
                  {selectedPrefectures.size}件を割り当て
                </Button>
                {selectedPrefectures.size > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPrefectures(new Set())}
                  >
                    選択解除
                  </Button>
                )}
              </div>

              {unassignedPrefectures.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                    未割り当ての都道府県: {unassignedPrefectures.length}件
                  </p>
                  <div className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    上記の都道府県から選択してゾーンに割り当ててください
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ゾーン編集ダイアログ */}
      <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone?.id ? "ゾーン編集" : "新規ゾーン追加"}</DialogTitle>
            <DialogDescription>ゾーン情報を入力してください</DialogDescription>
          </DialogHeader>
          {editingZone && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">ゾーン名 *</Label>
                <Input
                  id="zoneName"
                  placeholder="例: 関東、中部、関西など"
                  value={editingZone.name}
                  onChange={(e) =>
                    setEditingZone({ ...editingZone, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">表示順</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={editingZone.displayOrder}
                  onChange={(e) =>
                    setEditingZone({
                      ...editingZone,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingZone(null)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveZone}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ZoneManagement;
