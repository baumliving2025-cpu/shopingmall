-- 관리자 계정 설정 가이드
-- 이 파일은 단계별로 관리자 계정을 설정하는 방법을 안내합니다.

-- 1단계: Supabase Auth에서 관리자 계정 생성
-- Supabase 대시보드 → Authentication → Users → "Add user"
-- 이메일: admin@modernshop.com
-- 비밀번호: 원하는 비밀번호
-- 생성된 UUID를 복사하세요!

-- 2단계: 복사한 UUID로 관리자 계정 업데이트
-- 아래 UUID를 실제 UUID로 교체하고 주석을 해제하세요!

-- UPDATE users
-- SET id = '여기에-복사한-UUID-입력' -- <-- 여기에 Supabase Auth에서 복사한 UUID를 붙여넣으세요!
-- WHERE email = 'admin@modernshop.com';

-- 3단계: 관리자 계정 확인
SELECT 
    id,
    email,
    name,
    role,
    status,
    created_at
FROM users 
WHERE role = 'admin';

-- 4단계: 사용자 수 확인
SELECT 
    role,
    status,
    COUNT(*) as count
FROM users 
GROUP BY role, status
ORDER BY role, status;

-- 완료 메시지
SELECT '관리자 계정 설정 가이드 완료' as message;
