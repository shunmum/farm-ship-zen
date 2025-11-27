import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Recipient {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  email?: string;
  relation?: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: number;
  recipients?: Recipient[];
}

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 顧客データを取得
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // 各顧客のお届け先を取得
      const customersWithRecipients = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { data: recipientsData } = await supabase
            .from('recipients')
            .select('*')
            .eq('customer_id', customer.id)
            .eq('user_id', user.id);

          return {
            id: customer.id,
            name: customer.name,
            address: customer.address,
            postalCode: customer.postal_code,
            phone: customer.phone,
            email: customer.email || '',
            lastPurchaseDate: customer.last_purchase_date || '',
            totalSpent: Number(customer.total_spent) || 0,
            recipients: (recipientsData || []).map((r) => ({
              id: r.id,
              name: r.name,
              address: r.address,
              postalCode: r.postal_code,
              phone: r.phone,
              email: r.email || undefined,
              relation: r.relation || undefined,
            })),
          };
        })
      );

      setCustomers(customersWithRecipients);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'lastPurchaseDate' | 'totalSpent' | 'recipients'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          name: customer.name,
          address: customer.address,
          postal_code: customer.postalCode,
          phone: customer.phone,
          email: customer.email,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding customer:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          address: updates.address,
          postal_code: updates.postalCode,
          phone: updates.phone,
          email: updates.email,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating customer:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchCustomers();
      return { error: null };
    } catch (err) {
      console.error('Error deleting customer:', err);
      return { error: err as Error };
    }
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}
