// 환경 설정 파일 (GitHub Pages용)
const CONFIG = {
    // Supabase 설정 (실제 값으로 변경 필요)
    // 실제 Supabase 설정 값 (사용자가 제공한 값으로 변경됨)
    SUPABASE_URL: 'https://fifcrjnfiguuzizferpu.supabase.co', // 사용자가 제공한 Project URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZmNyam5maWd1dXppemZlcnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDMxOTUsImV4cCI6MjA3MjQ3OTE5NX0.7RSw5A5ijNQ9uP-AtkBuLgZ1fNtaIAQ7H5hXoUBArA0', // 사용자가 제공한 anon public 키
    
    // EmailJS 설정 (백업용)
    EMAILJS: {
        SERVICE_ID: 'service_3n75a2d',
        TEMPLATE_ID: 'template_jkppj0x',
        PUBLIC_KEY: 'ZLGf9XHeyqgjOUOIK',
        TO_EMAIL: 'baumliving2025@gmail.com'
    },
    
    // 앱 설정
    APP: {
        name: 'ModernShop',
        version: '1.0.0',
        environment: 'production'
    }
};

// 전역 설정 객체
window.CONFIG = CONFIG;
