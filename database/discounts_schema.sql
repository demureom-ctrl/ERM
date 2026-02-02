-- إضافة جدول التخفيضات
CREATE TABLE discounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    percentage INTEGER NOT NULL CHECK (percentage IN (10, 20, 30)),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    apply_to_all BOOLEAN DEFAULT true,
    product_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_discounts_active ON discounts(is_active, start_date, end_date);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_discounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_discounts_updated_at
BEFORE UPDATE ON discounts
FOR EACH ROW
EXECUTE FUNCTION update_discounts_updated_at();

-- تعطيل RLS مؤقتاً للتطوير
ALTER TABLE discounts DISABLE ROW LEVEL SECURITY;
