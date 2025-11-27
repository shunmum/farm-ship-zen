import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { type ShippingCarrier } from './useShippingSettings';

export type ShippingMode = 'flat_rate' | 'prefecture' | 'zone';

export interface ShippingModeSetting {
  id: string;
  mode: ShippingMode;
}

export interface ShippingZone {
  id: string;
  name: string;
  displayOrder: number;
}

export interface PrefectureZone {
  id: string;
  prefecture: string;
  zoneId: string;
  zoneName?: string;
}

export interface ZoneShippingRate {
  id: string;
  zoneId: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

export interface PrefectureShippingRate {
  id: string;
  prefecture: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

// 47都道府県のリスト
export const PREFECTURES = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export function useShippingCalculation() {
  const { user } = useAuth();
  const [modeSetting, setModeSetting] = useState<ShippingModeSetting | null>(null);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [prefectureZones, setPrefectureZones] = useState<PrefectureZone[]>([]);
  const [zoneRates, setZoneRates] = useState<ZoneShippingRate[]>([]);
  const [prefectureRates, setPrefectureRates] = useState<PrefectureShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!user) {
      setModeSetting(null);
      setZones([]);
      setPrefectureZones([]);
      setZoneRates([]);
      setPrefectureRates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // モード設定を取得
      const { data: modeData, error: modeError } = await supabase
        .from('shipping_mode_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (modeError && modeError.code !== 'PGRST116') {
        throw modeError;
      }

      if (modeData) {
        setModeSetting({
          id: modeData.id,
          mode: modeData.mode as ShippingMode,
        });
      } else {
        // デフォルトでflat_rateモードを作成
        const { data: newMode } = await supabase
          .from('shipping_mode_settings')
          .insert({ user_id: user.id, mode: 'flat_rate' })
          .select()
          .single();

        if (newMode) {
          setModeSetting({
            id: newMode.id,
            mode: newMode.mode as ShippingMode,
          });
        }
      }

      // ゾーン一覧を取得
      const { data: zonesData, error: zonesError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (zonesError) throw zonesError;

      setZones(
        (zonesData || []).map((z) => ({
          id: z.id,
          name: z.name,
          displayOrder: z.display_order,
        }))
      );

      // 都道府県ゾーンマッピングを取得
      const { data: prefZonesData, error: prefZonesError } = await supabase
        .from('prefecture_zones')
        .select('*, shipping_zones(name)')
        .eq('user_id', user.id);

      if (prefZonesError) throw prefZonesError;

      setPrefectureZones(
        (prefZonesData || []).map((pz: any) => ({
          id: pz.id,
          prefecture: pz.prefecture,
          zoneId: pz.zone_id,
          zoneName: pz.shipping_zones?.name,
        }))
      );

      // ゾーン別送料を取得
      const { data: zoneRatesData, error: zoneRatesError } = await supabase
        .from('zone_shipping_rates')
        .select('*')
        .eq('user_id', user.id);

      if (zoneRatesError) throw zoneRatesError;

      setZoneRates(
        (zoneRatesData || []).map((r) => ({
          id: r.id,
          zoneId: r.zone_id,
          carrier: r.carrier as ShippingCarrier,
          size: r.size,
          basePrice: Number(r.base_price),
          coolPrice: Number(r.cool_price),
        }))
      );

      // 都道府県別送料を取得
      const { data: prefRatesData, error: prefRatesError } = await supabase
        .from('prefecture_shipping_rates')
        .select('*')
        .eq('user_id', user.id);

      if (prefRatesError) throw prefRatesError;

      setPrefectureRates(
        (prefRatesData || []).map((r) => ({
          id: r.id,
          prefecture: r.prefecture,
          carrier: r.carrier as ShippingCarrier,
          size: r.size,
          basePrice: Number(r.base_price),
          coolPrice: Number(r.cool_price),
        }))
      );
    } catch (err) {
      console.error('Error fetching shipping calculation data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  // モード変更
  const updateMode = async (mode: ShippingMode) => {
    if (!user || !modeSetting) return { error: new Error('No mode setting') };

    try {
      const { data, error } = await supabase
        .from('shipping_mode_settings')
        .update({ mode })
        .eq('id', modeSetting.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating mode:', err);
      return { data: null, error: err as Error };
    }
  };

  // ゾーンCRUD
  const addZone = async (zone: Omit<ShippingZone, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('shipping_zones')
        .insert({
          user_id: user.id,
          name: zone.name,
          display_order: zone.displayOrder,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding zone:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateZone = async (id: string, updates: Partial<ShippingZone>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('shipping_zones')
        .update({
          name: updates.name,
          display_order: updates.displayOrder,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating zone:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteZone = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAll();
      return { error: null };
    } catch (err) {
      console.error('Error deleting zone:', err);
      return { error: err as Error };
    }
  };

  // 都道府県ゾーンマッピングCRUD
  const setPrefectureZone = async (prefecture: string, zoneId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // 既存のマッピングを削除して新規追加
      await supabase
        .from('prefecture_zones')
        .delete()
        .eq('user_id', user.id)
        .eq('prefecture', prefecture);

      const { data, error } = await supabase
        .from('prefecture_zones')
        .insert({
          user_id: user.id,
          prefecture,
          zone_id: zoneId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error setting prefecture zone:', err);
      return { data: null, error: err as Error };
    }
  };

  // ゾーン別送料CRUD
  const addZoneRate = async (rate: Omit<ZoneShippingRate, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('zone_shipping_rates')
        .insert({
          user_id: user.id,
          zone_id: rate.zoneId,
          carrier: rate.carrier,
          size: rate.size,
          base_price: rate.basePrice,
          cool_price: rate.coolPrice,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding zone rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateZoneRate = async (id: string, updates: Partial<ZoneShippingRate>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('zone_shipping_rates')
        .update({
          zone_id: updates.zoneId,
          carrier: updates.carrier,
          size: updates.size,
          base_price: updates.basePrice,
          cool_price: updates.coolPrice,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating zone rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteZoneRate = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('zone_shipping_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAll();
      return { error: null };
    } catch (err) {
      console.error('Error deleting zone rate:', err);
      return { error: err as Error };
    }
  };

  // 都道府県別送料CRUD
  const addPrefectureRate = async (rate: Omit<PrefectureShippingRate, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('prefecture_shipping_rates')
        .insert({
          user_id: user.id,
          prefecture: rate.prefecture,
          carrier: rate.carrier,
          size: rate.size,
          base_price: rate.basePrice,
          cool_price: rate.coolPrice,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding prefecture rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const updatePrefectureRate = async (id: string, updates: Partial<PrefectureShippingRate>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('prefecture_shipping_rates')
        .update({
          prefecture: updates.prefecture,
          carrier: updates.carrier,
          size: updates.size,
          base_price: updates.basePrice,
          cool_price: updates.coolPrice,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchAll();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating prefecture rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const deletePrefectureRate = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('prefecture_shipping_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAll();
      return { error: null };
    } catch (err) {
      console.error('Error deleting prefecture rate:', err);
      return { error: err as Error };
    }
  };

  return {
    modeSetting,
    zones,
    prefectureZones,
    zoneRates,
    prefectureRates,
    loading,
    error,
    updateMode,
    addZone,
    updateZone,
    deleteZone,
    setPrefectureZone,
    addZoneRate,
    updateZoneRate,
    deleteZoneRate,
    addPrefectureRate,
    updatePrefectureRate,
    deletePrefectureRate,
    refetch: fetchAll,
  };
}
