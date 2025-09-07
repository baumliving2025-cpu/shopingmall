-- Supabase 샘플 데이터
-- 스키마 생성 후 실행

-- 1. 기본 상품 데이터
INSERT INTO public.products (name, brand, price, description, category, images, stock_quantity) VALUES
('Nike Air Max 270', 'Nike', 159000, '혁신적인 에어 쿠셔닝과 현대적인 디자인', '패션', ARRAY['https://via.placeholder.com/300x300?text=Nike+Air+Max+270'], 50),
('Chanel No.5 Parfum', 'Chanel', 245000, '클래식한 향수의 대명사', '뷰티', ARRAY['https://via.placeholder.com/300x300?text=Chanel+No.5'], 30),
('Apple iPhone 15 Pro', 'Apple', 1350000, '최신 A17 Pro 칩셔닝과 티타늄 디자인', '전자제품', ARRAY['https://via.placeholder.com/300x300?text=iPhone+15+Pro'], 20),
('Samsung Galaxy S24', 'Samsung', 1200000, 'AI 기능이 강화된 최신 스마트폰', '전자제품', ARRAY['https://via.placeholder.com/300x300?text=Galaxy+S24'], 25),
('Louis Vuitton Handbag', 'Louis Vuitton', 2500000, '럭셔리 브랜드의 시그니처 핸드백', '패션', ARRAY['https://via.placeholder.com/300x300?text=LV+Handbag'], 10),
('Dyson V15 Vacuum', 'Dyson', 850000, '강력한 흡입력의 무선 청소기', '홈&리빙', ARRAY['https://via.placeholder.com/300x300?text=Dyson+V15'], 15);

-- 2. 관리자 계정 생성 (Supabase Auth에서 수동으로 생성 후 실행)
-- 주의: 실제 관리자 계정은 Supabase Auth에서 먼저 생성해야 함
-- 아래는 예시이며, 실제 auth.users에 관리자가 생성된 후 실행해야 함

-- 예시: 관리자 계정이 auth.users에 생성된 후 실행
-- INSERT INTO public.users (id, email, name, role, status) VALUES
-- ('관리자_UUID_여기에_입력', 'admin@modernshop.com', '관리자', 'admin', 'approved');

-- 3. 테스트용 일반 사용자 (승인 대기 상태)
-- 주의: 실제 사용자는 회원가입을 통해 생성됨

