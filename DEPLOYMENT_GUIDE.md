# ModernShop 배포 가이드

## 🚀 전체 배포 과정

### 1. 데이터베이스 설정 (Supabase 추천)

#### A. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 이름: `modernshop`
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (Asia Northeast - Seoul 추천)

#### B. 데이터베이스 스키마 적용
1. Supabase Dashboard → SQL Editor
2. `database/schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 실행

#### C. 환경변수 확인
- Database URL: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### 2. 백엔드 배포 (Railway)

#### A. Railway 계정 생성
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인

#### B. 프로젝트 배포
1. "New Project" → "Deploy from GitHub repo"
2. `backend` 폴더 선택
3. 환경변수 설정:
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   JWT_SECRET=your-super-secret-jwt-key-here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

#### C. 도메인 설정
1. Railway Dashboard → Settings → Domains
2. Custom Domain 추가 또는 Railway 제공 도메인 사용

### 3. 프론트엔드 배포 (Vercel)

#### A. Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인

#### B. 프로젝트 배포
1. "New Project" → GitHub 저장소 선택
2. Root Directory: `/` (프로젝트 루트)
3. Build Command: (비워둠)
4. Output Directory: (비워둠)

#### C. 환경변수 설정
```
NODE_ENV=production
```

### 4. 이메일 설정 (Gmail)

#### A. Gmail 앱 비밀번호 생성
1. Google 계정 → 보안
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
4. "메일" 선택 → 비밀번호 복사

#### B. 환경변수에 추가
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

### 5. 도메인 설정 (선택사항)

#### A. 커스텀 도메인 구매
- Namecheap, GoDaddy 등에서 도메인 구매

#### B. DNS 설정
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

#### C. Vercel에 도메인 추가
1. Vercel Dashboard → Domains
2. 도메인 추가
3. DNS 설정 확인

## 🔧 로컬 개발 환경 설정

### 1. 백엔드 실행
```bash
cd backend
npm install
cp env.example .env
# .env 파일 수정
npm run dev
```

### 2. 프론트엔드 실행
```bash
# 간단한 HTTP 서버 실행
npx serve .
# 또는
python -m http.server 8000
```

## 📊 모니터링 및 관리

### 1. 로그 확인
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Functions → Logs

### 2. 데이터베이스 관리
- **Supabase**: Dashboard → Table Editor
- **SQL 쿼리**: Dashboard → SQL Editor

### 3. 성능 모니터링
- **Vercel Analytics**: 자동 활성화
- **Railway Metrics**: Dashboard에서 확인

## 🛡️ 보안 체크리스트

### ✅ 완료된 보안 기능
- [x] JWT 토큰 인증
- [x] 비밀번호 해시화 (bcrypt)
- [x] Rate Limiting
- [x] CORS 설정
- [x] Helmet 보안 헤더
- [x] 입력 데이터 검증
- [x] SQL Injection 방지 (Prepared Statements)

### 🔄 추가 권장사항
- [ ] HTTPS 강제 설정
- [ ] API 키 로테이션
- [ ] 로그 모니터링
- [ ] 백업 자동화
- [ ] CDN 설정 (Cloudflare)

## 🚨 문제 해결

### 자주 발생하는 문제들

#### 1. 데이터베이스 연결 실패
```bash
# 연결 문자열 확인
echo $DATABASE_URL
# Supabase 연결 정보 재확인
```

#### 2. 이메일 발송 실패
```bash
# Gmail 앱 비밀번호 확인
# 2단계 인증 활성화 확인
```

#### 3. CORS 에러
```javascript
// backend/server.js에서 CORS 설정 확인
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
```

#### 4. JWT 토큰 오류
```bash
# JWT_SECRET 환경변수 확인
# 토큰 만료 시간 확인
```

## 📈 확장 계획

### 단기 (1-3개월)
- [ ] 상품 이미지 CDN 연동
- [ ] 결제 시스템 연동 (Stripe/PayPal)
- [ ] 재고 관리 시스템
- [ ] 관리자 대시보드 개선

### 중기 (3-6개월)
- [ ] 모바일 앱 개발
- [ ] 다국어 지원
- [ ] 고급 검색 기능
- [ ] 추천 시스템

### 장기 (6개월+)
- [ ] 마이크로서비스 아키텍처
- [ ] 실시간 알림 (WebSocket)
- [ ] AI 기반 상품 추천
- [ ] 글로벌 배송 시스템

## 📞 지원

문제가 발생하면:
1. 로그 확인
2. 환경변수 재확인
3. 데이터베이스 연결 상태 확인
4. GitHub Issues에 문제 보고
