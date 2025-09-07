-- site_settings 테이블 상태 확인 및 문제 진단

-- 1. 테이블 존재 여부 확인
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'site_settings';

-- 2. 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'site_settings'
ORDER BY ordinal_position;

-- 3. 기존 데이터 확인
SELECT * FROM site_settings ORDER BY setting_key;

-- 4. 제약조건 확인
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'site_settings';

-- 5. RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'site_settings';

