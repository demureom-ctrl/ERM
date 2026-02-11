import { supabase } from './supabase';
import {
    Category, Discount, Product, RawMaterial, Sale, User, ActivityLog, RecipeItem
} from '../types';

export const api = {
    // Categories
    getCategories: async (): Promise<string[]> => {
        const { data, error } = await supabase.from('categories').select('name').order('name');
        if (error) throw error;
        return data.map((c: any) => c.name);
    },

    addCategory: async (name: string): Promise<Category> => {
        const { data, error } = await supabase.from('categories').insert([{ name }]).select();
        if (error) throw error;
        return data[0];
    },

    deleteCategory: async (name: string): Promise<boolean> => {
        const { error } = await supabase.from('categories').delete().eq('name', name);
        if (error) throw error;
        return true;
    },

    // Discounts
    getActiveDiscounts: async (): Promise<Discount[]> => {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now);

        if (error) throw error;
        return (data as Discount[]) || [];
    },

    getAllDiscounts: async (): Promise<Discount[]> => {
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as Discount[]) || [];
    },

    addDiscount: async (discount: any): Promise<Discount> => {
        const newDiscount = {
            id: 'd' + Date.now(),
            name: discount.name,
            percentage: parseInt(discount.percentage),
            start_date: new Date(discount.start_date).toISOString(),
            end_date: new Date(discount.end_date).toISOString(),
            apply_to_all: discount.apply_to_all,
            product_ids: discount.product_ids || [],
            is_active: true
        };

        const { data, error } = await supabase.from('discounts').insert([newDiscount]).select();
        if (error) throw error;
        return data[0] as Discount;
    },

    updateDiscount: async (id: string, discount: Partial<Discount>): Promise<Discount> => {
        const { data, error } = await supabase
            .from('discounts')
            .update(discount)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0] as Discount;
    },

    deleteDiscount: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('discounts').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Products
    getProducts: async (): Promise<Product[]> => {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data as Product[]) || [];
    },

    addProduct: async (product: any): Promise<Product> => {
        const newProduct = {
            id: 'p' + Date.now(),
            name: product.name,
            type: product.type,
            price: parseFloat(product.price) || 0,
            cost: parseFloat(product.cost) || 0,
            stock_qty: parseInt(product.stock_qty) || 0,
            image_placeholder: product.image_placeholder || '',
            recipe: product.recipe || null
        };

        const { data, error } = await supabase.from('products').insert([newProduct]).select();
        if (error) throw error;
        return data[0] as Product;
    },

    // Raw Materials
    getMaterials: async (): Promise<RawMaterial[]> => {
        const { data, error } = await supabase.from('raw_materials').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data as RawMaterial[]) || [];
    },

    addRawMaterial: async (materialData: any): Promise<RawMaterial> => {
        const newMaterial = {
            id: 'm' + Date.now(),
            name: materialData.name,
            unit: materialData.unit,
            quantity: parseInt(materialData.quantity) || 0,
            image_placeholder: materialData.image_placeholder || ''
        };

        const { data, error } = await supabase.from('raw_materials').insert([newMaterial]).select();
        if (error) throw error;
        return data[0] as RawMaterial;
    },

    updateMaterialStock: async (materialId: string, quantity: any, unitPrice: any): Promise<RawMaterial> => {
        // Get current material
        const { data: material, error: fetchError } = await supabase
            .from('raw_materials')
            .select('*')
            .eq('id', materialId)
            .single();

        if (fetchError) throw fetchError;

        const currentQty = parseInt(material.quantity) || 0;
        const currentAvgCost = parseFloat(material.avg_cost) || 0;
        const addedQty = parseInt(quantity as string);
        const purchasePrice = parseFloat(unitPrice as string);
        const totalPurchaseCost = addedQty * purchasePrice;

        const newQuantity = currentQty + addedQty;

        // Calculate new weighted average cost
        let newAvgCost = 0;
        if (newQuantity > 0) {
            newAvgCost = ((currentQty * currentAvgCost) + totalPurchaseCost) / newQuantity;
        }

        // Update material quantity and average cost
        const { error: updateError } = await supabase
            .from('raw_materials')
            .update({
                quantity: newQuantity,
                avg_cost: newAvgCost
            })
            .eq('id', materialId);

        if (updateError) throw updateError;

        // Log purchase
        const { error: logError } = await supabase.from('material_purchases').insert([{
            material_id: materialId,
            quantity: addedQty,
            cost: totalPurchaseCost
        }]);

        if (logError) throw logError;

        return { ...material, quantity: newQuantity, avg_cost: newAvgCost };
    },

    // Sales
    getSales: async (): Promise<Sale[]> => {
        const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data as Sale[]) || [];
    },

    getPurchasesTotal: async (): Promise<number> => {
        const { data, error } = await supabase.from('material_purchases').select('cost');
        if (error) throw error;
        return data.reduce((sum: number, record: any) => sum + (record.cost || 0), 0);
    },

    addSale: async (sale: Partial<Sale>): Promise<Sale> => {
        const newSale = {
            id: 's' + Date.now(),
            items: sale.items,
            total: parseFloat(sale.total as any),
            payment_method: sale.payment_method || 'cash'
        };

        // Insert sale
        const { error: saleError } = await supabase.from('sales').insert([newSale]);
        if (saleError) throw saleError;

        // Update product stock
        if (sale.items) {
            for (const item of sale.items) {
                const { data: product, error: fetchError } = await supabase
                    .from('products')
                    .select('stock_qty')
                    .eq('id', item.productId)
                    .single();

                if (fetchError) continue;

                const newStockQty = (product.stock_qty || 0) - item.quantity;

                await supabase
                    .from('products')
                    .update({ stock_qty: Math.max(0, newStockQty) })
                    .eq('id', item.productId);
            }
        }

        return newSale as Sale;
    },

    // Generic Edit/Delete
    deleteItem: async (id: string): Promise<boolean> => {
        // Try to delete from products first
        const { error: productError } = await supabase.from('products').delete().eq('id', id);

        if (!productError) return true;

        // If not found, try raw_materials
        const { error: materialError } = await supabase.from('raw_materials').delete().eq('id', id);

        if (materialError) throw materialError;
        return true;
    },

    getItem: async (id: string): Promise<any> => {
        // Try products first
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (!productError && product) {
            return { ...product, isRaw: false };
        }

        // Try raw_materials
        const { data: material, error: materialError } = await supabase
            .from('raw_materials')
            .select('*')
            .eq('id', id)
            .single();

        if (materialError) throw new Error('Item not found');

        return { ...material, isRaw: true };
    },

    updateItem: async (id: string, data: any, isRaw: boolean): Promise<any> => {
        const table = isRaw ? 'raw_materials' : 'products';

        const updatePayload = { ...data };

        // For materials, map stock_qty to quantity
        if (isRaw && updatePayload.stock_qty !== undefined) {
            updatePayload.quantity = updatePayload.stock_qty;
            delete updatePayload.stock_qty;
        }

        const { data: updated, error } = await supabase
            .from(table)
            .update(updatePayload)
            .eq('id', id)
            .select();

        if (error) throw error;
        return updated[0];
    },

    // Manufacturing Logic
    manufactureProduct: async (productId: string, quantity: any): Promise<Product> => {
        // Get product with recipe
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        const recipe: RecipeItem[] = product.recipe || [];

        if (recipe.length === 0) throw new Error('No recipe defined for this product');

        // Get all materials
        const { data: materials, error: materialsError } = await supabase
            .from('raw_materials')
            .select('*');

        if (materialsError) throw materialsError;

        const qty = parseInt(quantity as string);

        // 1. Check stock availability
        for (const ingredient of recipe) {
            const material = materials.find((m: RawMaterial) => m.id === ingredient.materialId);
            if (!material) throw new Error(`Material ${ingredient.name} not found`);

            const requiredQty = ingredient.quantity * qty;
            if (material.quantity < requiredQty) {
                throw new Error(`Insufficient stock for ${material.name}. Required: ${requiredQty}, Available: ${material.quantity}`);
            }
        }

        // 2. Deduct Materials
        for (const ingredient of recipe) {
            const material = materials.find((m: RawMaterial) => m.id === ingredient.materialId);
            if (!material) continue; // Should be found as per check above
            const requiredQty = ingredient.quantity * qty;
            const newQuantity = material.quantity - requiredQty;

            await supabase
                .from('raw_materials')
                .update({ quantity: newQuantity })
                .eq('id', ingredient.materialId);
        }

        // 3. Increase Product Stock
        const newStockQty = (parseInt(product.stock_qty) || 0) + qty;

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ stock_qty: newStockQty })
            .eq('id', productId)
            .select();

        if (updateError) throw updateError;

        // 4. Log manufacturing (optional)
        await supabase.from('manufacturing_logs').insert([{
            product_id: productId,
            quantity: qty,
            materials_used: recipe
        }]);

        return updatedProduct[0] as Product;
    },

    // User Management
    login: async (username: string, password: string): Promise<User | null> => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();

        if (error) return null;
        return data as User;
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data as User[]) || [];
    },

    addUser: async (user: Partial<User>): Promise<User> => {
        const { data, error } = await supabase.from('users').insert([user]).select();
        if (error) throw error;
        return data[0] as User;
    },

    deleteUser: async (id: string): Promise<boolean> => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Activity Logs
    logActivity: async (user: User | null, action: string, details: any = {}) => {
        if (!user) return;

        const log = {
            user_id: user.id,
            username: user.username,
            action: action,
            details: details
        };

        await supabase.from('activity_logs').insert([log]);
    },

    getLogs: async (): Promise<ActivityLog[]> => {
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return (data as ActivityLog[]) || [];
    }
};
