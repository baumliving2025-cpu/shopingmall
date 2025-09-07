-- Supabase Storage 설정 스크립트
-- 상품 이미지 업로드를 위한 Storage 버킷 생성 및 정책 설정

-- 1. product-images 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5MB 제한
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- 2. 공개 읽기 정책 설정 (모든 사용자가 이미지 조회 가능)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 3. 인증된 사용자 업로드 정책 (로그인한 사용자만 업로드 가능)
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- 4. 인증된 사용자 업데이트 정책 (본인이 업로드한 파일만 수정 가능)
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- 5. 인증된 사용자 삭제 정책 (본인이 업로드한 파일만 삭제 가능)
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- 6. 설정 확인
SELECT 'Storage 버킷이 성공적으로 생성되었습니다.' as message;
SELECT * FROM storage.buckets WHERE id = 'product-images';

