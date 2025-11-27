import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProductVariant {
  id: string;
  parentProductId: string;
  name: string;
  price: number;
  size: string;
  weight: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  isParent: boolean;
  price?: number;
  size?: string;
  weight?: number;
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!user) {
      setProducts([]);
      setProductVariants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 商品マスタを取得
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // 商品バリエーションを取得
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (variantsError) throw variantsError;

      setProducts(
        (productsData || []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description || undefined,
          isParent: p.is_parent,
          price: p.price ? Number(p.price) : undefined,
          size: p.size || undefined,
          weight: p.weight ? Number(p.weight) : undefined,
        }))
      );

      setProductVariants(
        (variantsData || []).map((v) => ({
          id: v.id,
          parentProductId: v.parent_product_id,
          name: v.name,
          price: Number(v.price),
          size: v.size,
          weight: Number(v.weight),
          sku: v.sku || undefined,
        }))
      );
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: product.name,
          category: product.category,
          description: product.description,
          is_parent: product.isParent,
          price: product.price,
          size: product.size,
          weight: product.weight,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding product:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category: updates.category,
          description: updates.description,
          is_parent: updates.isParent,
          price: updates.price,
          size: updates.size,
          weight: updates.weight,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating product:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { error: err as Error };
    }
  };

  const addProductVariant = async (variant: Omit<ProductVariant, 'id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          user_id: user.id,
          parent_product_id: variant.parentProductId,
          name: variant.name,
          price: variant.price,
          size: variant.size,
          weight: variant.weight,
          sku: variant.sku,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error adding product variant:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateProductVariant = async (id: string, updates: Partial<ProductVariant>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update({
          name: updates.name,
          price: updates.price,
          size: updates.size,
          weight: updates.weight,
          sku: updates.sku,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      return { data, error: null };
    } catch (err) {
      console.error('Error updating product variant:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteProductVariant = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProducts();
      return { error: null };
    } catch (err) {
      console.error('Error deleting product variant:', err);
      return { error: err as Error };
    }
  };

  return {
    products,
    productVariants,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    refetch: fetchProducts,
  };
}
