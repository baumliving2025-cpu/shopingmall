-- 관리자 계정 생성 SQL
-- 이 파일은 관리자 계정을 생성합니다.

-- 1. 관리자 계정 생성 (Supabase Auth에 직접 생성 필요)
-- 참고: 이 SQL은 users 테이블에만 삽입하며, 실제 인증은 Supabase Auth에서 처리됩니다.

-- 임시 관리자 계정 (실제 사용 시에는 Supabase Auth에서 생성)
INSERT INTO users (id, email, name, role, status, email_verified, created_at, updated_at)
VALUES (
    gen_random_uuid(), -- 임시 UUID (실제로는 Supabase Auth에서 생성된 UUID 사용)
    'admin@modernshop.com',
    '관리자',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

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

