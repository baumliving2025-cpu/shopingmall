-- products 테이블 생성 (상품 등록을 위한 테이블)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS 비활성화 (임시)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 샘플 상품 데이터 삽입
INSERT INTO products (name, brand, price, category, description, image_urls, stock, discount) VALUES
('스마트폰 케이스', '테크브랜드', 15000, '전자제품', '고품질 실리콘 케이스', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'], 50, 10),
('무선 이어폰', '사운드마스터', 89000, '전자제품', '노이즈 캔슬링 기능', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'], 30, 15),
('면 티셔츠', '패션브랜드', 25000, '패션', '100% 면 소재', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'], 100, 0),
('스킨케어 세트', '뷰티코어', 45000, '뷰티', '자연 유래 성분', ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300'], 25, 20),
('인테리어 조명', '홈데코', 35000, '홈&리빙', 'LED 스탠드', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'], 15, 5);

-- 테이블 생성 확인
SELECT 'products 테이블이 성공적으로 생성되었습니다.' as message;
SELECT COUNT(*) as product_count FROM products;
