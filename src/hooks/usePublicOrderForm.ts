import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PublicOrderForm {
  id: string;
  formUrlSlug: string;
  farmDisplayName: string;
  welcomeMessage?: string;
  isActive: boolean;
}

export function usePublicOrderForm() {
  const { user } = useAuth();
  const [form, setForm] = useState<PublicOrderForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForm = async () => {
    if (!user) {
      setForm(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('public_order_forms')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (まだフォームを作成していない)
        throw fetchError;
      }

      if (data) {
        setForm({
          id: data.id,
          formUrlSlug: data.form_url_slug,
          farmDisplayName: data.farm_display_name,
          welcomeMessage: data.welcome_message || undefined,
          isActive: data.is_active,
        });
      } else {
        setForm(null);
      }
    } catch (err) {
      console.error('Error fetching public order form:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch form');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [user]);

  const createForm = async (formData: Omit<PublicOrderForm, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('public_order_forms')
        .insert({
          user_id: user.id,
          form_url_slug: formData.formUrlSlug,
          farm_display_name: formData.farmDisplayName,
          welcome_message: formData.welcomeMessage,
          is_active: formData.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchForm();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating form:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateForm = async (updates: Partial<PublicOrderForm>) => {
    if (!user || !form) return { error: new Error('No form to update') };

    try {
      const { data, error } = await supabase
        .from('public_order_forms')
        .update({
          form_url_slug: updates.formUrlSlug,
          farm_display_name: updates.farmDisplayName,
          welcome_message: updates.welcomeMessage,
          is_active: updates.isActive,
        })
        .eq('id', form.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchForm();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating form:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteForm = async () => {
    if (!user || !form) return { error: new Error('No form to delete') };

    try {
      const { error } = await supabase
        .from('public_order_forms')
        .delete()
        .eq('id', form.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchForm();
      return { error: null };
    } catch (err) {
      console.error('Error deleting form:', err);
      return { error: err as Error };
    }
  };

  const getFormUrl = () => {
    if (!form) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/order/${form.formUrlSlug}`;
  };

  return {
    form,
    loading,
    error,
    createForm,
    updateForm,
    deleteForm,
    getFormUrl,
    refetch: fetchForm,
  };
}
