# Supabase 쇼핑몰 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: "modernshop")
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (Asia Northeast - Seoul 권장)

### 1.2 API 키 확인
1. 프로젝트 대시보드 → Settings → API
2. **Project URL** 복사
3. **anon public** 키 복사

### 1.3 config.js 설정
```javascript
const CONFIG = {
    SUPABASE_URL: 'https://your-project-ref.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    EMAILJS: {
        SERVICE_ID: 'your-service-id',
        TEMPLATE_ID: 'your-template-id',
        PUBLIC_KEY: 'your-public-key',
        TO_EMAIL: 'your-email@gmail.com'
    }
};
```

## 2. 데이터베이스 설정

### 2.1 기존 데이터 정리 (완료!)
1. ✅ **`database/safe-cleanup.sql` 실행 완료**
2. ✅ **모든 기존 테이블 정리 완료**

### 2.2 새로운 스키마 생성
1. **`database/new-schema.sql` 파일 내용 복사하여 실행**
2. **관리자 승인 시스템이 포함된 새로운 스키마**

### 2.3 RLS 정책 설정
1. **`database/new-rls-policies.sql` 파일 내용 복사하여 실행**
2. **보안 정책 설정**

### 2.4 샘플 데이터 삽입
1. **`database/new-sample-data.sql` 파일 내용 복사하여 실행**
2. **테스트용 상품 데이터**

### 2.5 관리자 계정 생성
1. **`database/new-admin-account.sql` 파일 내용 복사하여 실행**
2. **실제 관리자 계정은 Supabase Auth에서 생성해야 합니다**

#### 관리자 계정 생성 방법:
1. **Supabase 대시보드 → Authentication → Users**
2. **"Add user" 클릭**
3. **이메일**: `admin@modernshop.com`
4. **비밀번호**: 원하는 비밀번호 입력
5. **"Create user" 클릭**
6. **생성된 UUID를 복사**
7. **SQL Editor에서 다음 쿼리 실행**:
```sql
-- 생성된 UUID로 관리자 계정 업데이트
UPDATE users 
SET id = '생성된-UUID-여기에-입력'
WHERE email = 'admin@modernshop.com';
```

## 3. EmailJS 설정

### 3.1 EmailJS 계정 생성
1. [EmailJS](https://www.emailjs.com)에 가입
2. 이메일 서비스 연결 (Gmail 권장)
3. 템플릿 생성

### 3.2 템플릿 변수 설정
```
{{to_email}}
{{order_number}}
{{customer_name}}
{{customer_email}}
{{total_amount}}
{{order_time}}
{{items}}
{{message}}
```

## 4. 배포 설정

### 4.1 GitHub Pages
1. GitHub 저장소 생성
2. 파일 업로드
3. Settings → Pages → Source: Deploy from a branch
4. Branch: main 선택

### 4.2 도메인 설정 (선택사항)
1. Custom domain 설정
2. DNS 설정

## 5. 문제 해결

### 5.1 콘솔 오류 해결
- **400/404 에러**: Supabase URL과 키 확인
- **RLS 오류**: 정책 설정 확인
- **EmailJS 오류**: 서비스 ID와 템플릿 ID 확인

### 5.2 로그인 문제
- **이메일 인증**: Supabase Auth 설정에서 비활성화
- **관리자 승인**: users 테이블에서 status를 'active'로 변경

### 5.3 이메일 발송 문제
- **템플릿 변수**: EmailJS 템플릿과 코드 변수명 일치 확인
- **서비스 연결**: EmailJS에서 이메일 서비스 연결 상태 확인

## 6. 보안 설정

### 6.1 API 키 보안
- config.js 파일을 .gitignore에 추가 (선택사항)
- 환경변수 사용 권장

### 6.2 RLS 정책
- 모든 테이블에 RLS 활성화
- 사용자별 데이터 접근 제한

### 6.3 비밀번호 정책
- 최소 6자 이상
- 복잡한 비밀번호 권장

## 7. 모니터링

### 7.1 Supabase 대시보드
- 사용자 수 확인
- 데이터베이스 사용량 모니터링
- API 호출 통계 확인

### 7.2 브라우저 개발자 도구
- 콘솔 오류 확인
- 네트워크 탭에서 API 호출 상태 확인
