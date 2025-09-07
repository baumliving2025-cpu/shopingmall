-- 관리자 계정 생성 SQL
-- Supabase Auth와 연동된 관리자 계정

-- 1. Supabase Auth에서 생성된 관리자 계정의 UUID로 users 테이블 업데이트
-- 참고: 먼저 Supabase Auth에서 관리자 계정을 생성하고 UUID를 복사해야 합니다.

-- 아래 UUID를 Supabase Auth에서 생성된 실제 UUID로 교체하세요!
-- UPDATE users
-- SET id = '여기에-복사한-UUID-입력' -- <-- 여기에 Supabase Auth에서 복사한 UUID를 붙여넣으세요!
-- WHERE email = 'admin@modernshop.com';

-- 임시로 관리자 계정 생성 (UUID는 나중에 업데이트)
-- 주의: 이 방법은 외래 키 제약 조건 오류를 발생시킬 수 있습니다.
-- 권장: Supabase Auth에서 먼저 관리자 계정을 생성한 후 UUID를 사용하세요.

-- INSERT INTO users (id, email, name, role, status, email_verified, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(), -- 임시 UUID (나중에 Supabase Auth UUID로 업데이트 필요)
--     'admin@modernshop.com',
--     '관리자',
--     'admin',
--     'active',
--     true,
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- ) ON CONFLICT (email) DO NOTHING;

-- 2. 관리자 계정 확인
SELECT 
    id,
    email,
    name,
    role,
    status,
    created_at
FROM users 
WHERE role = 'admin';

-- 3. 사용자 수 확인
SELECT 
    role,
    status,
    COUNT(*) as count
FROM users 
GROUP BY role, status
ORDER BY role, status;

-- 완료 메시지
SELECT '관리자 계정 생성 완료' as message;
