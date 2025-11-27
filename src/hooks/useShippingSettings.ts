import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ShippingCarrier = 'yamato' | 'sagawa' | 'yupack';

export interface ShippingRate {
  id: string;
  carrier: ShippingCarrier;
  size: string;
  basePrice: number;
  coolPrice: number;
}

export interface ConsolidationRule {
  id: string;
  name: string;
  fromSize: string;
  quantity: number;
  toSize: string;
  enabled: boolean;
}

export function useShippingSettings() {
  const { user } = useAuth();
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [consolidationRules, setConsolidationRules] = useState<ConsolidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingSettings = async () => {
    if (!user) {
      setShippingRates([]);
      setConsolidationRules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 配送料金設定を取得
      const { data: ratesData, error: ratesError } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('user_id', user.id)
        .order('carrier', { ascending: true })
        .order('size', { ascending: true });

      if (ratesError) throw ratesError;

      // 荷合いルールを取得
      const { data: rulesData, error: rulesError } = await supabase
        .from('consolidation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (rulesError) throw rulesError;

      setShippingRates(
        (ratesData || []).map((r) => ({
          id: r.id,
          carrier: r.carrier as ShippingCarrier,
          size: r.size,
          basePrice: Number(r.base_price),
          coolPrice: Number(r.cool_price),
        }))
      );

      setConsolidationRules(
        (rulesData || []).map((r) => ({
          id: r.id,
          name: r.name,
          fromSize: r.from_size,
          quantity: r.quantity,
          toSize: r.to_size,
          enabled: r.enabled,
        }))
      );
    } catch (err) {
      console.error('Error fetching shipping settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingSettings();
  }, [user]);

  const addShippingRate = async (rate: Omit<ShippingRate, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .insert({
          user_id: user.id,
          carrier: rate.carrier,
          size: rate.size,
          base_price: rate.basePrice,
          cool_price: rate.coolPrice,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchShippingSettings();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding shipping rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateShippingRate = async (id: string, updates: Partial<ShippingRate>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .update({
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

      await fetchShippingSettings();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating shipping rate:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteShippingRate = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('shipping_rates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchShippingSettings();
      return { error: null };
    } catch (err) {
      console.error('Error deleting shipping rate:', err);
      return { error: err as Error };
    }
  };

  const addConsolidationRule = async (rule: Omit<ConsolidationRule, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('consolidation_rules')
        .insert({
          user_id: user.id,
          name: rule.name,
          from_size: rule.fromSize,
          quantity: rule.quantity,
          to_size: rule.toSize,
          enabled: rule.enabled,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchShippingSettings();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding consolidation rule:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateConsolidationRule = async (id: string, updates: Partial<ConsolidationRule>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('consolidation_rules')
        .update({
          name: updates.name,
          from_size: updates.fromSize,
          quantity: updates.quantity,
          to_size: updates.toSize,
          enabled: updates.enabled,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchShippingSettings();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating consolidation rule:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteConsolidationRule = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('consolidation_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchShippingSettings();
      return { error: null };
    } catch (err) {
      console.error('Error deleting consolidation rule:', err);
      return { error: err as Error };
    }
  };

  return {
    shippingRates,
    consolidationRules,
    loading,
    error,
    addShippingRate,
    updateShippingRate,
    deleteShippingRate,
    addConsolidationRule,
    updateConsolidationRule,
    deleteConsolidationRule,
    refetch: fetchShippingSettings,
  };
}
