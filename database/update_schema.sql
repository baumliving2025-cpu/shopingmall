-- users 테이블 스키마 수정 SQL
-- 기존 status 제약조건을 수정하여 'pending' 상태 추가

-- 1. 기존 CHECK 제약조건 삭제
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- 2. 새로운 CHECK 제약조건 추가 (pending 상태 포함)
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('pending', 'active', 'inactive', 'banned'));

-- 3. 기본값을 'pending'으로 변경
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending';

-- 4. 기존 'active' 상태의 사용자들을 'pending'으로 변경 (선택사항)
-- UPDATE users SET status = 'pending' WHERE status = 'active';

-- 5. 관리자 계정은 'active' 상태로 유지 (필요시)
-- UPDATE users SET status = 'active' WHERE role = 'admin';

