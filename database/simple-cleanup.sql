-- 간단한 데이터베이스 정리 SQL
-- 테이블이 없어도 안전하게 실행됩니다.

-- 1. 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- 2. 기존 시퀀스 삭제 (있다면)
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS cart_items_id_seq CASCADE;

-- 3. 기존 트리거 삭제 (테이블이 존재할 때만)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
    END IF;
END $$;

-- 4. 기존 인덱스 삭제 (있다면)
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_products_featured;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;

-- 5. 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 정리 완료 메시지
SELECT '데이터베이스 정리 완료' as message;
