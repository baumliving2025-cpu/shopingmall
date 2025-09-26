-- wjdrnsdl24@gmail.com 계정에 관리자 권한 부여
-- 즉시 실행하세요!

UPDATE users 
SET role = 'admin' 
WHERE email = 'wjdrnsdl24@gmail.com';

-- 권한 부여 확인
SELECT id, email, name, role, status, created_at 
FROM users 
WHERE email = 'wjdrnsdl24@gmail.com';

-- 결과 메시지
SELECT 'wjdrnsdl24@gmail.com 계정에 관리자 권한이 부여되었습니다!' as message;




