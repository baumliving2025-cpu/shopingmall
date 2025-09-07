-- 완전히 안전한 데이터베이스 정리 SQL
-- 어떤 상황에서도 오류 없이 실행됩니다.

-- 1. 기존 테이블 삭제 (CASCADE로 모든 의존성 자동 삭제)
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- 2. 기존 시퀀스 삭제
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS orders_id_seq CASCADE;
DROP SEQUENCE IF EXISTS order_items_id_seq CASCADE;
DROP SEQUENCE IF EXISTS cart_items_id_seq CASCADE;

-- 3. 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 정리 완료 메시지
SELECT '데이터베이스 정리 완료' as message;

