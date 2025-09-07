// Supabase 설정 파일
// 이 파일은 Supabase 클라이언트 초기화와 설정을 담당합니다.

// Supabase 클라이언트 초기화 함수
function initializeSupabase() {
    try {
        // CONFIG에서 Supabase 설정 가져오기
        if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
            throw new Error('Supabase 설정이 없습니다. config.js 파일을 확인해주세요.');
        }

        // Supabase 클라이언트 생성
        const supabaseClient = window.supabase.createClient(
            window.CONFIG.SUPABASE_URL,
            window.CONFIG.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: false
                }
            }
        );

        // 전역 변수로 설정
        window.supabase = supabaseClient;
        
        console.log('Supabase 클라이언트 초기화 완료');
        return true;
        
    } catch (error) {
        console.error('Supabase 초기화 실패:', error);
        return false;
    }
}

// Supabase 연결 테스트 함수
async function testSupabaseConnection() {
    try {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }

        // 간단한 연결 테스트
        const { data, error } = await window.supabase
            .from('products')
            .select('count')
            .limit(1);

        if (error) {
            console.warn('Supabase 연결 테스트 실패:', error.message);
            return false;
        }

        console.log('Supabase 연결 테스트 성공');
        return true;
        
    } catch (error) {
        console.error('Supabase 연결 테스트 오류:', error);
        return false;
    }
}

// 페이지 로드 시 Supabase 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Supabase 설정 로드 중...');
    
    // Supabase 초기화
    if (initializeSupabase()) {
        // 연결 테스트 (비동기)
        testSupabaseConnection();
    } else {
        console.error('Supabase 초기화에 실패했습니다.');
    }
});
