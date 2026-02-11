export interface Category {
    name: string;
}

export interface RecipeItem {
    materialId: string;
    name: string;
    quantity: number;
    unit?: string;
}

export interface Product {
    id: string;
    name: string;
    type: string;
    price: number;
    cost: number;
    stock_qty: number;
    image_placeholder: string;
    recipe?: RecipeItem[];
    created_at?: string;
}

export interface RawMaterial {
    id: string;
    name: string;
    unit: string;
    quantity: number;
    avg_cost?: number;
    image_placeholder: string;
    created_at?: string;
}

export interface Discount {
    id: string;
    name: string;
    percentage: number;
    start_date: string;
    end_date: string;
    apply_to_all: boolean;
    product_ids: string[];
    is_active: boolean;
    created_at?: string;
}

export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
}

export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    payment_method: 'cash' | 'card';
    created_at?: string;
}

export interface User {
    id: string;
    name: string;
    username: string;
    password?: string;
    role: 'admin' | 'sales';
    created_at?: string;
}

export interface ActivityLog {
    id?: string;
    user_id: string;
    username: string;
    action: string;
    details: any;
    created_at?: string;
}

export interface MaterialPurchase {
    material_id: string;
    quantity: number;
    cost: number;
}

export type InventoryItem = (Product | RawMaterial) & {
    category: string;
    icon: React.ElementType;
    isRaw: boolean;
    stock_qty: number;
    price?: number;
    avg_cost?: number;
    unit?: string;
};
