-- ModernShop 샘플 데이터 (Supabase Authentication 사용)

-- 1. 샘플 상품 데이터 삽입
INSERT INTO products (name, brand, price, description, category, stock_quantity, is_featured, images) VALUES
('Nike Air Max 270', 'Nike', 159000, '혁신적인 에어 쿠셔닝과 현대적인 디자인의 러닝화', '신발', 50, true, '{"https://via.placeholder.com/300x300?text=Nike+Air+Max+270"}'),
('샤넬 넘버5 오드퍼퓸', 'Chanel', 245000, '세계에서 가장 유명한 향수, 클래식한 플로럴 향', '향수', 30, true, '{"https://via.placeholder.com/300x300?text=Chanel+No.5"}'),
('아이폰 15 프로', 'Apple', 1350000, 'A17 Pro 칩, 티타늄 디자인, 48MP 카메라', '전자제품', 20, true, '{"https://via.placeholder.com/300x300?text=iPhone+15+Pro"}'),
('갤럭시 S24', 'Samsung', 1200000, 'AI 기능 강화, 200MP 카메라, 120Hz 디스플레이', '전자제품', 25, false, '{"https://via.placeholder.com/300x300?text=Galaxy+S24"}'),
('루이비통 핸드백', 'Louis Vuitton', 2800000, '모노그램 캔버스 소재의 클래식 핸드백', '가방', 10, true, '{"https://via.placeholder.com/300x300?text=LV+Handbag"}'),
('아디다스 스탠스미스', 'Adidas', 89000, '클래식한 화이트 스니커즈', '신발', 40, false, '{"https://via.placeholder.com/300x300?text=Adidas+Stan+Smith"}'),
('맥북 프로 16인치', 'Apple', 3500000, 'M3 Pro 칩, Liquid Retina XDR 디스플레이', '전자제품', 15, true, '{"https://via.placeholder.com/300x300?text=MacBook+Pro"}'),
('구찌 구찌 블룸', 'Gucci', 180000, '플로럴 노트의 우아한 향수', '향수', 25, false, '{"https://via.placeholder.com/300x300?text=Gucci+Bloom"}');

-- 2. 관리자 계정 생성 (웹에서 회원가입 후 실행)
-- 회원가입 후 다음 SQL로 관리자 권한 부여:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@gmail.com';

-- 3. Row Level Security (RLS) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 사용자 정책
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- 상품 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- 주문 정책
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 주문 상품 정책
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- 장바구니 정책
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- 4. 관리자 권한 정책 (관리자는 모든 데이터 접근 가능)
CREATE POLICY "Admins can do everything" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Admins can manage cart items" ON cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
