# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

### A. 계정 생성 및 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 설정:
   - **Name**: `modernshop`
   - **Database Password**: 강력한 비밀번호 설정 (기록해두세요!)
   - **Region**: `Asia Northeast (Seoul)` 선택
   - **Pricing Plan**: Free 선택

### B. 데이터베이스 스키마 적용
1. Supabase Dashboard → **SQL Editor** 클릭
2. **New Query** 클릭
3. `database/schema.sql` 파일 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행

### C. 연결 정보 확인
1. **Settings** → **Database** 클릭
2. **Connection string** 섹션에서 **URI** 복사
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## 2. 환경변수 설정

### A. Supabase 환경변수
- `DATABASE_URL`: 위에서 복사한 연결 문자열
- `SUPABASE_URL`: `https://[PROJECT-REF].supabase.co`
- `SUPABASE_ANON_KEY`: Settings → API → anon public 키

### B. JWT 및 이메일 설정
- `JWT_SECRET`: 임의의 긴 문자열 (예: `your-super-secret-jwt-key-here`)
- `EMAIL_HOST`: `smtp.gmail.com`
- `EMAIL_PORT`: `587`
- `EMAIL_USER`: Gmail 주소
- `EMAIL_PASS`: Gmail 앱 비밀번호

## 3. 기본 데이터 삽입

### A. 관리자 계정 생성
```sql
-- 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (email, password_hash, name, role, status, email_verified) 
VALUES (
    'admin@modernshop.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8K8K8K8K', -- admin123
    '관리자',
    'admin',
    'active',
    true
);
```

### B. 샘플 상품 데이터
```sql
-- 샘플 상품 데이터 삽입
INSERT INTO products (name, brand, price, description, category, stock_quantity, is_featured) VALUES
('Nike Air Max 270', 'Nike', 159000, '혁신적인 에어 쿠셔닝과 현대적인 디자인', '패션', 50, true),
('Chanel No.5 Parfum', 'Chanel', 245000, '클래식한 향수의 대명사', '뷰티', 30, true),
('Apple iPhone 15 Pro', 'Apple', 1350000, '최신 A17 Pro 칩셋과 티타늄 디자인', '전자제품', 20, true),
('Samsung Galaxy S24', 'Samsung', 1200000, 'AI 기능이 강화된 최신 스마트폰', '전자제품', 25, false),
('Louis Vuitton Handbag', 'Louis Vuitton', 2800000, '럭셔리 브랜드의 시그니처 핸드백', '패션', 10, true);
```
