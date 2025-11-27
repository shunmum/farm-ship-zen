import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useShippingCalculation, type ShippingMode } from "@/hooks/useShippingCalculation";
import { useToast } from "@/hooks/use-toast";
import { Calculator, MapPin, Globe } from "lucide-react";

const ShippingModeSettings = () => {
  const { modeSetting, updateMode, loading } = useShippingCalculation();
  const { toast } = useToast();

  const handleModeChange = async (mode: ShippingMode) => {
    const { error } = await updateMode(mode);

    if (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const modeNames = {
        flat_rate: "全国一律料金",
        zone: "ゾーン制",
        prefecture: "都道府県別料金",
      };
      toast({
        title: "成功",
        description: `送料計算方式を「${modeNames[mode]}」に変更しました`,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            送料計算方式
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calculator className="h-5 w-5" />
          送料計算方式
        </CardTitle>
        <CardDescription className="text-sm">
          お客様への配送料金をどのように計算するか選択してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <RadioGroup
          value={modeSetting?.mode || 'flat_rate'}
          onValueChange={(value) => handleModeChange(value as ShippingMode)}
        >
          {/* オプション1: 全国一律 */}
          <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="flat_rate" id="flat_rate" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="flat_rate" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-semibold">オプション1: 全国一律料金</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  配送先の都道府県に関わらず、サイズのみで送料を計算します。
                  <br />
                  <strong>メリット:</strong> 設定が最もシンプルで管理が簡単
                  <br />
                  <strong>デメリット:</strong> 遠方への配送コストを考慮できない
                  <br />
                  <strong>おすすめ:</strong> 小規模事業者、近隣地域中心の配送
                </p>
              </Label>
            </div>
          </div>

          {/* オプション2: 都道府県別 */}
          <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="prefecture" id="prefecture" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="prefecture" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">オプション2: 都道府県別料金</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  47都道府県ごとに個別の送料を設定します。
                  <br />
                  <strong>メリット:</strong> 最も正確な送料計算が可能
                  <br />
                  <strong>デメリット:</strong> 初期設定が大変（業者×サイズ×都道府県 = 846レコード）
                  <br />
                  <strong>おすすめ:</strong> 全国展開、正確なコスト管理が必要な事業者
                </p>
              </Label>
            </div>
          </div>

          {/* オプション3: ゾーン制 */}
          <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="zone" id="zone" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="zone" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold">オプション3: ゾーン制</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  都道府県を「関東」「中部」「関西」などのゾーンに分類して料金設定します。
                  <br />
                  <strong>メリット:</strong> 設定が楽で、地域差も考慮できる
                  <br />
                  <strong>デメリット:</strong> ゾーン内の都道府県は同一料金
                  <br />
                  <strong>おすすめ:</strong> バランス重視、中規模以上の事業者
                  <br />
                  <span className="text-xs italic">例: 関東ゾーン、中部ゾーン、関西ゾーン、北海道・沖縄ゾーン</span>
                </p>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {modeSetting?.mode && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">
              現在の設定:
              <span className="ml-2 text-primary font-semibold">
                {modeSetting.mode === 'flat_rate' && '全国一律料金'}
                {modeSetting.mode === 'prefecture' && '都道府県別料金'}
                {modeSetting.mode === 'zone' && 'ゾーン制'}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {modeSetting.mode === 'flat_rate' && '「配送料金」タブで業者とサイズごとの料金を設定してください'}
              {modeSetting.mode === 'prefecture' && '「都道府県別料金」タブで各都道府県の送料を設定してください'}
              {modeSetting.mode === 'zone' && '「ゾーン設定」タブでゾーンと料金を設定してください'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingModeSettings;
