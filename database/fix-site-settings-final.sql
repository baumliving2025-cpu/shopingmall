-- 사이트 설정 테이블 최종 수정 스크립트
-- 관리자 패널에서 사이트 설정 수정이 안 되는 문제 해결

-- 1. 기존 테이블 삭제 (필요시)
-- DROP TABLE IF EXISTS site_settings CASCADE;

-- 2. 사이트 설정 테이블 생성 (created_at 컬럼 추가)
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 비활성화 (관리 편의성을 위해)
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 4. 권한 설정
GRANT ALL ON site_settings TO authenticated;
GRANT ALL ON site_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE site_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE site_settings_id_seq TO anon;

-- 5. 기본 설정 값 삽입/업데이트
INSERT INTO site_settings (setting_key, setting_value, created_at, updated_at) VALUES
-- 고객센터 정보
('customer_phone', '1588-0000', NOW(), NOW()),
('customer_email', 'help@modernshop.com', NOW(), NOW()),
('faq_link', '/faq', NOW(), NOW()),
('inquiry_link', '/inquiry', NOW(), NOW()),

-- 회사 정보
('company_name', 'ModernShop', NOW(), NOW()),
('company_ceo', '홍길동', NOW(), NOW()),
('company_address', '서울특별시 강남구 테헤란로 123, 10층', NOW(), NOW()),
('telecom_license', '2024-서울강남-01234', NOW(), NOW()),
('business_number', '123-45-67890', NOW(), NOW()),
('company_website', 'https://modernshop.com', NOW(), NOW()),
('company_description', '프리미엄 온라인 쇼핑몰', NOW(), NOW()),

-- 소셜미디어 링크
('instagram_link', 'https://instagram.com/modernshop', NOW(), NOW()),
('facebook_link', 'https://facebook.com/modernshop', NOW(), NOW()),
('youtube_link', 'https://youtube.com/@modernshop', NOW(), NOW()),
('blog_link', 'https://blog.modernshop.com', NOW(), NOW()),

-- 운영 정보
('operating_hours', '평일 09:00-18:00', NOW(), NOW()),
('holiday_info', '토,일,공휴일 휴무', NOW(), NOW()),
('return_exchange_info', '구매 후 7일 이내', NOW(), NOW()),
('shipping_info', '전국 무료배송 (5만원 이상)', NOW(), NOW()),

-- 정책 링크
('about_us_link', '/about', NOW(), NOW()),
('careers_link', '/careers', NOW(), NOW()),
('terms_link', '/terms', NOW(), NOW()),
('privacy_link', '/privacy', NOW(), NOW()),
('delivery_track_link', '/delivery', NOW(), NOW()),
('return_guide_link', '/return', NOW(), NOW())

ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 6. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 결과 확인
SELECT 'site_settings 테이블 설정 완료' as status;
SELECT setting_key, setting_value, created_at, updated_at
FROM site_settings
ORDER BY setting_key;

-- 10. 테이블 정보 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'site_settings'
ORDER BY ordinal_position;