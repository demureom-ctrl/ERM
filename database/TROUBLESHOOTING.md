# استكشاف أخطاء قاعدة البيانات

## المشاكل المحتملة:

### 1. صلاحيات Row Level Security (RLS)
Supabase تفعّل RLS افتراضياً، مما يمنع القراءة/الكتابة من المتصفح.

**الحل:**
1. افتح Supabase Dashboard
2. اذهب إلى **Authentication** → **Policies**
3. لكل جدول (products, raw_materials, categories, sales):
   - اضغط **New Policy**
   - اختر **Enable read/write access for all users**
   - أو أنشئ Policy يدوياً:
   ```sql
   -- للقراءة
   CREATE POLICY "Enable read access for all users" ON public.products
   FOR SELECT USING (true);
   
   -- للكتابة
   CREATE POLICY "Enable insert for all users" ON public.products
   FOR INSERT WITH CHECK (true);
   
   -- للتحديث
   CREATE POLICY "Enable update for all users" ON public.products
   FOR UPDATE USING (true);
   
   -- للحذف
   CREATE POLICY "Enable delete for all users" ON public.products
   FOR DELETE USING (true);
   ```

**أو تعطيل RLS مؤقتاً (للتطوير فقط):**
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_logs DISABLE ROW LEVEL SECURITY;
```

### 2. مشكلة CORS
إذا كان الخطأ يتعلق بـ CORS، تأكد من أن localhost مسموح في Supabase Settings.

### 3. الاتصال بالإنترنت
تأكد من اتصالك بالإنترنت لأن قاعدة البيانات على السحابة.

## التشخيص السريع:

افتح Console في المتصفح (F12) وشغّل:
```javascript
import { supabase } from './src/services/supabase.js';
const { data, error } = await supabase.from('categories').select('*');
console.log('Data:', data, 'Error:', error);
```

إذا ظهر خطأ مثل:
- `"new row violates row-level security policy"` → المشكلة في RLS
- `"relation does not exist"` → الجداول غير موجودة
- `"Failed to fetch"` → مشكلة شبكة أو CORS
