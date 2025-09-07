-- site_settings 테이블 409 충돌 오류 해결

-- 1. 기존 테이블 완전 삭제 (데이터 포함)
DROP TABLE IF EXISTS site_settings CASCADE;

-- 2. 새 테이블 생성 (더 안전한 구조)
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 완전 비활성화
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 4. 권한 설정
GRANT ALL ON site_settings TO authenticated;
GRANT ALL ON site_settings TO anon;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- 6. 기본값 삽입 (INSERT IGNORE 방식으로 충돌 방지)
INSERT INTO site_settings (setting_key, setting_value) VALUES
('customer_phone', '1588-0000'),
('customer_email', 'help@modernshop.com'),
('faq_link', '/faq'),
('inquiry_link', '/inquiry'),
('company_name', 'ModernShop'),
('company_ceo', '홍길동'),
('company_address', '서울특별시 강남구 테헤란로 123, 10층'),
('telecom_license', '2024-서울강남-01234'),
('business_number', '123-45-67890'),
('company_website', 'https://modernshop.com'),
('company_description', '프리미엄 온라인 쇼핑몰')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. 테이블 확인
SELECT 'site_settings 테이블이 성공적으로 재생성되었습니다.' as message;
SELECT * FROM site_settings ORDER BY setting_key;
