import { supabase } from './supabase';

export const api = {
    // Categories
    getCategories: async () => {
        const { data, error } = await supabase.from('categories').select('name').order('name');
        if (error) throw error;
        return data.map(c => c.name);
    },

    addCategory: async (name) => {
        const { data, error } = await supabase.from('categories').insert([{ name }]).select();
        if (error) throw error;
        return data[0];
    },

    deleteCategory: async (name) => {
        const { error } = await supabase.from('categories').delete().eq('name', name);
        if (error) throw error;
        return true;
    },

    // Discounts
    getActiveDiscounts: async () => {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', now)
            .gte('end_date', now);

        if (error) throw error;
        return data || [];
    },

    getAllDiscounts: async () => {
        const { data, error } = await supabase
            .from('discounts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    addDiscount: async (discount) => {
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
        return data[0];
    },

    updateDiscount: async (id, discount) => {
        const { data, error } = await supabase
            .from('discounts')
            .update(discount)
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    deleteDiscount: async (id) => {
        const { error } = await supabase.from('discounts').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Products
    getProducts: async () => {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    addProduct: async (product) => {
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
        return data[0];
    },

    // Raw Materials
    getMaterials: async () => {
        const { data, error } = await supabase.from('raw_materials').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    addRawMaterial: async (materialData) => {
        const newMaterial = {
            id: 'm' + Date.now(),
            name: materialData.name,
            unit: materialData.unit,
            quantity: parseInt(materialData.quantity) || 0,
            image_placeholder: materialData.image_placeholder || ''
        };

        const { data, error } = await supabase.from('raw_materials').insert([newMaterial]).select();
        if (error) throw error;
        return data[0];
    },

    updateMaterialStock: async (materialId, quantity, cost) => {
        // Get current material
        const { data: material, error: fetchError } = await supabase
            .from('raw_materials')
            .select('*')
            .eq('id', materialId)
            .single();

        if (fetchError) throw fetchError;

        const newQuantity = (parseInt(material.quantity) || 0) + parseInt(quantity);

        // Update material quantity
        const { error: updateError } = await supabase
            .from('raw_materials')
            .update({ quantity: newQuantity })
            .eq('id', materialId);

        if (updateError) throw updateError;

        // Log purchase
        const { error: logError } = await supabase.from('material_purchases').insert([{
            material_id: materialId,
            quantity: parseInt(quantity),
            cost: parseFloat(cost)
        }]);

        if (logError) throw logError;

        return { ...material, quantity: newQuantity };
    },

    // Sales
    getSales: async () => {
        const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    addSale: async (sale) => {
        const newSale = {
            id: 's' + Date.now(),
            items: sale.items,
            total: parseFloat(sale.total),
            payment_method: sale.payment_method || 'cash'
        };

        // Insert sale
        const { error: saleError } = await supabase.from('sales').insert([newSale]);
        if (saleError) throw saleError;

        // Update product stock
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

        return newSale;
    },

    // Generic Edit/Delete
    deleteItem: async (id) => {
        // Try to delete from products first
        const { error: productError } = await supabase.from('products').delete().eq('id', id);

        if (!productError) return true;

        // If not found, try raw_materials
        const { error: materialError } = await supabase.from('raw_materials').delete().eq('id', id);

        if (materialError) throw materialError;
        return true;
    },

    getItem: async (id) => {
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

    updateItem: async (id, data, isRaw) => {
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
    manufactureProduct: async (productId, quantity) => {
        // Get product with recipe
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        const recipe = product.recipe || [];

        if (recipe.length === 0) throw new Error('No recipe defined for this product');

        // Get all materials
        const { data: materials, error: materialsError } = await supabase
            .from('raw_materials')
            .select('*');

        if (materialsError) throw materialsError;

        // 1. Check stock availability
        for (const ingredient of recipe) {
            const material = materials.find(m => m.id === ingredient.materialId);
            if (!material) throw new Error(`Material ${ingredient.name} not found`);

            const requiredQty = ingredient.quantity * quantity;
            if (material.quantity < requiredQty) {
                throw new Error(`Insufficient stock for ${material.name}. Required: ${requiredQty}, Available: ${material.quantity}`);
            }
        }

        // 2. Deduct Materials
        for (const ingredient of recipe) {
            const material = materials.find(m => m.id === ingredient.materialId);
            const requiredQty = ingredient.quantity * quantity;
            const newQuantity = material.quantity - requiredQty;

            await supabase
                .from('raw_materials')
                .update({ quantity: newQuantity })
                .eq('id', ingredient.materialId);
        }

        // 3. Increase Product Stock
        const newStockQty = (parseInt(product.stock_qty) || 0) + parseInt(quantity);

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ stock_qty: newStockQty })
            .eq('id', productId)
            .select();

        if (updateError) throw updateError;

        // 4. Log manufacturing (optional)
        await supabase.from('manufacturing_logs').insert([{
            product_id: productId,
            quantity: parseInt(quantity),
            materials_used: recipe
        }]);

        return updatedProduct[0];
    }
};
