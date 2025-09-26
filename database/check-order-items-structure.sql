-- order_items 테이블 구조 확인 및 수정
-- 실제 테이블 구조에 맞게 order_items 테이블을 확인하고 필요시 수정합니다.

-- 1. 현재 order_items 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- 2. order_items 테이블이 없다면 생성 (최소한의 필수 컬럼만)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 불필요한 컬럼이 있다면 제거 (product_name, product_brand 등)
-- 주의: 실제 데이터가 있다면 백업 후 실행
-- ALTER TABLE order_items DROP COLUMN IF EXISTS product_name;
-- ALTER TABLE order_items DROP COLUMN IF EXISTS product_brand;

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 5. RLS 비활성화 (임시)
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 6. 권한 설정
GRANT ALL ON order_items TO authenticated;

-- 7. 테이블 구조 재확인
SELECT 'order_items 테이블 구조 확인 완료' as message;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;




