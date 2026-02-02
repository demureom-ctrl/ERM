-- ERM System Database Schema
-- PostgreSQL/Supabase

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Raw Materials Table
CREATE TABLE IF NOT EXISTS raw_materials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 0,
    image_placeholder TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100),
    price NUMERIC(10, 3) DEFAULT 0,
    cost NUMERIC(10, 3) DEFAULT 0,
    stock_qty INTEGER DEFAULT 0,
    image_placeholder TEXT,
    recipe JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    items JSONB NOT NULL,
    total NUMERIC(10, 3) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Material Purchases Table (for tracking raw material purchases)
CREATE TABLE IF NOT EXISTS material_purchases (
    id SERIAL PRIMARY KEY,
    material_id VARCHAR(50) REFERENCES raw_materials(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Manufacturing Logs Table (optional, for tracking production)
CREATE TABLE IF NOT EXISTS manufacturing_logs (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    materials_used JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
    ('عطور رجالية'),
    ('عطور نسائية'),
    ('عطور مشتركة'),
    ('زيوت عطرية')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_material_purchases_material_id ON material_purchases(material_id);
CREATE INDEX IF NOT EXISTS idx_manufacturing_logs_product_id ON manufacturing_logs(product_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
