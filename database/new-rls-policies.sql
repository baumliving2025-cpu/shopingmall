-- 새로운 RLS (Row Level Security) 정책 설정
-- 관리자 승인 시스템에 맞춘 보안 정책

-- 1. RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 2. users 테이블 정책
-- 모든 사용자는 자신의 정보를 조회할 수 있음
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- 모든 사용자는 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 관리자는 모든 사용자 정보를 조회할 수 있음
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 관리자는 모든 사용자 정보를 업데이트할 수 있음 (승인/거부)
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 3. products 테이블 정책
-- 모든 인증된 사용자는 상품을 조회할 수 있음
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- 관리자만 상품을 삽입/수정/삭제할 수 있음
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 4. orders 테이블 정책
-- 사용자는 자신의 주문만 조회할 수 있음
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 주문만 삽입할 수 있음
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 주문을 조회/수정할 수 있음
CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 5. order_items 테이블 정책
-- 사용자는 자신의 주문 아이템만 조회할 수 있음
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id AND user_id = auth.uid()
        )
    );

-- 사용자는 자신의 주문 아이템만 삽입할 수 있음
CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id AND user_id = auth.uid()
        )
    );

-- 관리자는 모든 주문 아이템을 관리할 수 있음
CREATE POLICY "Admins can manage all order items" ON order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 6. cart_items 테이블 정책
-- 사용자는 자신의 장바구니 아이템만 조회/수정/삭제할 수 있음
CREATE POLICY "Users can manage own cart items" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- 사용자는 자신의 장바구니에만 아이템을 추가할 수 있음
CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 장바구니 아이템을 관리할 수 있음
CREATE POLICY "Admins can manage all cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- 완료 메시지
SELECT 'RLS 정책 설정 완료' as message;




