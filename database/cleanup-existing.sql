-- 기존 데이터베이스 정리 SQL
-- 이 파일은 기존 테이블과 정책을 정리합니다.

-- 1. 기존 RLS 정책 삭제 (테이블이 존재할 때만)
DO $$ 
BEGIN
    -- users 테이블 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        DROP POLICY IF EXISTS "Admins can view all users" ON users;
        DROP POLICY IF EXISTS "Admins can update all users" ON users;
    END IF;
    
    -- products 테이블 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
        DROP POLICY IF EXISTS "Admins can manage products" ON products;
    END IF;
    
    -- orders 테이블 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP POLICY IF EXISTS "Users can view own orders" ON orders;
        DROP POLICY IF EXISTS "Users can create own orders" ON orders;
        DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
    END IF;
    
    -- order_items 테이블 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
        DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
        DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
        DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
    END IF;
    
    -- cart_items 테이블 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
        DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
        DROP POLICY IF EXISTS "Admins can manage all cart items" ON cart_items;
    END IF;
END $$;

-- 2. 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. 기존 제약조건 삭제 (테이블이 존재할 때만)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    END IF;
END $$;

-- 4. 기존 인덱스 삭제 (있다면)
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_cart_items_user_id;
DROP INDEX IF EXISTS idx_products_category;

-- 5. 기존 시퀀스 삭제 (있다면)
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS cart_items_id_seq CASCADE;

-- 6. 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 정리 완료 메시지
SELECT '기존 데이터베이스 정리 완료' as message;
