import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  products: { productId: string; productName: string; quantity: number }[];
  amount: number;
  deliveryDate: string;
  status: '未発送' | '発送済み' | '配達完了' | 'キャンセル';
  shippingCompany?: string;
  trackingNumber?: string;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 受注データを取得
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;

      // 各受注の商品明細を取得
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)
            .eq('user_id', user.id);

          return {
            id: order.id,
            orderNumber: order.order_number,
            orderDate: order.order_date,
            customerId: order.customer_id,
            customerName: order.customer_name,
            products: (itemsData || []).map((item) => ({
              productId: item.product_id || '',
              productName: item.product_name,
              quantity: item.quantity,
            })),
            amount: Number(order.amount),
            deliveryDate: order.delivery_date,
            status: order.status as Order['status'],
            shippingCompany: order.shipping_company || undefined,
            trackingNumber: order.tracking_number || undefined,
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const addOrder = async (
    order: Omit<Order, 'id'>,
    customerId: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // 受注を作成
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: order.orderNumber,
          order_date: order.orderDate,
          customer_id: customerId,
          customer_name: order.customerName,
          amount: order.amount,
          delivery_date: order.deliveryDate,
          status: order.status,
          shipping_company: order.shippingCompany,
          tracking_number: order.trackingNumber,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 受注商品明細を作成
      if (order.products.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          order.products.map((product) => ({
            user_id: user.id,
            order_id: orderData.id,
            product_id: product.productId || null,
            product_name: product.productName,
            quantity: product.quantity,
          }))
        );

        if (itemsError) throw itemsError;
      }

      await fetchOrders();
      return { data: orderData, error: null };
    } catch (err) {
      console.error('Error adding order:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_number: updates.orderNumber,
          order_date: updates.orderDate,
          customer_name: updates.customerName,
          amount: updates.amount,
          delivery_date: updates.deliveryDate,
          status: updates.status,
          shipping_company: updates.shippingCompany,
          tracking_number: updates.trackingNumber,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating order:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteOrder = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchOrders();
      return { error: null };
    } catch (err) {
      console.error('Error deleting order:', err);
      return { error: err as Error };
    }
  };

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
}
