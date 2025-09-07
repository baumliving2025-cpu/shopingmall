# GitHub Pages + Supabase 배포 가이드

## 🚀 전체 배포 과정

### 1단계: Supabase 설정

#### A. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. 프로젝트 설정:
   - **Name**: `modernshop`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: `Asia Northeast (Seoul)`
   - **Pricing Plan**: Free

#### B. 데이터베이스 스키마 적용
1. Supabase Dashboard → **SQL Editor**
2. `database/schema.sql` 파일 내용 복사하여 실행
3. 샘플 데이터 삽입 (선택사항)

#### C. API 키 확인
1. **Settings** → **API**
2. **Project URL**과 **anon public** 키 복사

### 2단계: GitHub 저장소 설정

#### A. 저장소 생성
1. GitHub에서 새 저장소 생성
2. 저장소 이름: `modernshop` (또는 원하는 이름)
3. Public으로 설정 (GitHub Pages 무료 사용)

#### B. 코드 업로드
```bash
# 로컬에서 Git 초기화
git init
git add .
git commit -m "Initial commit: ModernShop with Supabase"

# GitHub 저장소 연결
git remote add origin https://github.com/your-username/modernshop.git
git branch -M main
git push -u origin main
```

### 3단계: 환경변수 설정

#### A. config.js 파일 수정
```javascript
const CONFIG = {
    // Supabase 설정 (실제 값으로 변경)
    SUPABASE_URL: 'https://your-project-ref.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // EmailJS 설정
    EMAILJS: {
        serviceId: 'service_3n75a2d',
        templateId: 'template_jkppj0x',
        publicKey: 'ZLGf9XHeyqgjOUOIK'
    }
};
```

### 4단계: GitHub Pages 활성화

#### A. GitHub Pages 설정
1. GitHub 저장소 → **Settings**
2. **Pages** 섹션으로 스크롤
3. **Source**: `Deploy from a branch` 선택
4. **Branch**: `main` 선택
5. **Folder**: `/ (root)` 선택
6. **Save** 클릭

#### B. 자동 배포 확인
- 코드를 push하면 자동으로 배포됩니다
- 배포 URL: `https://your-username.github.io/modernshop`

### 5단계: 도메인 설정 (선택사항)

#### A. 커스텀 도메인 설정
1. 도메인 구매 (Namecheap, GoDaddy 등)
2. GitHub Pages → **Custom domain** 입력
3. DNS 설정:
   ```
   Type: CNAME
   Name: www
   Value: your-username.github.io
   
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

## 🔧 로컬 개발 환경

### 1. 로컬 서버 실행
```bash
# Python HTTP 서버
python -m http.server 8000

# 또는 Node.js serve
npx serve .

# 또는 Live Server (VS Code 확장)
```

### 2. 환경변수 테스트
- `config.js`에서 Supabase 설정 확인
- 브라우저 개발자 도구에서 API 호출 테스트

## 📊 모니터링 및 관리

### 1. Supabase Dashboard
- **Table Editor**: 데이터 확인/수정
- **SQL Editor**: 쿼리 실행
- **Authentication**: 사용자 관리
- **Logs**: API 호출 로그

### 2. GitHub Pages
- **Actions**: 배포 로그 확인
- **Settings**: 도메인 및 환경 설정

## 🛡️ 보안 고려사항

### 1. Supabase 보안
- **Row Level Security (RLS)** 활성화 권장
- **API 키**는 공개되어도 안전 (anon key)
- **Database Password**는 절대 공개하지 말 것

### 2. GitHub Pages 보안
- **Public 저장소**이므로 민감한 정보 노출 주의
- **환경변수**는 `config.js`에 하드코딩 (공개됨)
- **비밀번호**나 **API 키**는 Supabase에서 관리

## 🚨 문제 해결

### 1. CORS 에러
```javascript
// Supabase에서 CORS 설정 확인
// Settings → API → CORS origins에 도메인 추가
```

### 2. 인증 오류
```javascript
// Supabase Authentication 설정 확인
// Settings → Authentication → Providers
```

### 3. 데이터베이스 연결 실패
```javascript
// config.js의 SUPABASE_URL과 SUPABASE_ANON_KEY 확인
// Supabase Dashboard → Settings → API에서 재확인
```

## 📈 확장 계획

### 1. 단기 개선사항
- [ ] Row Level Security (RLS) 적용
- [ ] 실시간 구독 (Realtime) 추가
- [ ] 파일 업로드 (Storage) 연동
- [ ] 이메일 인증 개선

### 2. 중기 개선사항
- [ ] 결제 시스템 연동 (Stripe)
- [ ] 관리자 대시보드 개선
- [ ] 모바일 최적화
- [ ] SEO 최적화

### 3. 장기 개선사항
- [ ] PWA (Progressive Web App) 변환
- [ ] 오프라인 지원
- [ ] 푸시 알림
- [ ] 다국어 지원

## 📞 지원

문제가 발생하면:
1. **Supabase Dashboard**에서 로그 확인
2. **GitHub Actions**에서 배포 로그 확인
3. **브라우저 개발자 도구**에서 에러 확인
4. **GitHub Issues**에 문제 보고

## 🎉 완료!

이제 전 세계 어디서나 접속 가능한 ModernShop이 완성되었습니다!

**배포 URL**: `https://your-username.github.io/modernshop`
**관리자 계정**: `admin@modernshop.com` / `admin123`
