-- 사이트 설정 테이블 생성 및 기본값 설정
-- 관리자가 사이트 정보를 편집할 수 있도록 하는 테이블

-- 1. site_settings 테이블 생성
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 비활성화 (임시)
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 3. 권한 설정
GRANT ALL ON site_settings TO authenticated;

-- 4. 기본값 삽입 (기존 데이터가 있으면 업데이트)
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
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- 6. 테이블 확인
SELECT 'site_settings 테이블이 성공적으로 생성되었습니다.' as message;
SELECT * FROM site_settings ORDER BY setting_key;
