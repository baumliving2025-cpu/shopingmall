-- 새로운 샘플 데이터 삽입
-- 관리자 승인 시스템 테스트용

-- 1. 샘플 상품 데이터 삽입
INSERT INTO products (name, brand, price, description, category, stock_quantity, is_featured, images) VALUES
('프리미엄 무선 이어폰', 'TechSound', 129000, '고음질 무선 이어폰으로 완벽한 음악 경험을 제공합니다.', '전자제품', 50, true, ARRAY['https://example.com/earphone1.jpg', 'https://example.com/earphone2.jpg']),
('스마트워치 Pro', 'SmartTech', 299000, '건강 모니터링과 스마트 기능이 탑재된 프리미엄 스마트워치입니다.', '전자제품', 30, true, ARRAY['https://example.com/watch1.jpg', 'https://example.com/watch2.jpg']),
('무선 충전기', 'PowerUp', 89000, '빠른 무선 충전을 지원하는 고성능 충전기입니다.', '전자제품', 100, false, ARRAY['https://example.com/charger1.jpg']),
('블루투스 스피커', 'SoundWave', 159000, '강력한 베이스와 선명한 고음질을 제공하는 휴대용 스피커입니다.', '전자제품', 75, true, ARRAY['https://example.com/speaker1.jpg', 'https://example.com/speaker2.jpg']),
('게이밍 키보드', 'GameMaster', 189000, '기계식 스위치로 정확한 타이핑과 게이밍 경험을 제공합니다.', '컴퓨터', 40, false, ARRAY['https://example.com/keyboard1.jpg']),
('무선 마우스', 'Precision', 79000, '고정밀 센서와 인체공학적 디자인의 무선 마우스입니다.', '컴퓨터', 60, false, ARRAY['https://example.com/mouse1.jpg']),
('모니터 스탠드', 'ErgoDesk', 129000, '높이 조절이 가능한 인체공학적 모니터 스탠드입니다.', '컴퓨터', 25, false, ARRAY['https://example.com/stand1.jpg']),
('USB-C 허브', 'ConnectPro', 99000, '다양한 포트를 제공하는 USB-C 멀티 허브입니다.', '컴퓨터', 80, false, ARRAY['https://example.com/hub1.jpg']);

-- 2. 상품 수 확인
SELECT 
    category,
    COUNT(*) as product_count,
    SUM(stock_quantity) as total_stock
FROM products 
GROUP BY category
ORDER BY category;

-- 3. 전체 상품 수 확인
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_products
FROM products;

-- 완료 메시지
SELECT '샘플 데이터 삽입 완료' as message;

