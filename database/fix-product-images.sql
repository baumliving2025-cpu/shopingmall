-- 상품 이미지 URL 수정 스크립트
-- 잘못된 이미지 URL을 실제 로딩 가능한 URL로 업데이트

-- 1. 잘못된 example.com URL을 가진 상품들 수정
UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format']
WHERE images IS NULL 
   OR array_length(images, 1) = 0 
   OR images[1] LIKE '%example.com%'
   OR images[1] LIKE '%placeholder%'
   OR images[1] = ''
   OR images[1] LIKE '%hub1.jpg%'
   OR images[1] LIKE '%mouse1.jpg%'
   OR images[1] LIKE '%stand1.jpg%';

-- 2. 다양한 카테고리별 기본 이미지 설정
UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format']
WHERE category = '전자제품' 
  AND (images IS NULL OR array_length(images, 1) = 0 OR images[1] LIKE '%example.com%');

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&auto=format']
WHERE category = '패션' 
  AND (images IS NULL OR array_length(images, 1) = 0 OR images[1] LIKE '%example.com%');

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&auto=format']
WHERE category = '뷰티' 
  AND (images IS NULL OR array_length(images, 1) = 0 OR images[1] LIKE '%example.com%');

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format']
WHERE category = '홈&리빙' 
  AND (images IS NULL OR array_length(images, 1) = 0 OR images[1] LIKE '%example.com%');

-- 3. 샘플 상품 데이터 업데이트 (더 나은 이미지들로)
UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop&auto=format']
WHERE name = '스마트폰 케이스';

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format']
WHERE name = '무선 이어폰';

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&auto=format']
WHERE name = '면 티셔츠';

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&auto=format']
WHERE name = '스킨케어 세트';

UPDATE products 
SET images = ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format']
WHERE name = '인테리어 조명';

-- 4. 수정 결과 확인
SELECT 
    id,
    name,
    category,
    images,
    CASE 
        WHEN images IS NULL OR array_length(images, 1) = 0 THEN '이미지 없음'
        WHEN images[1] LIKE '%example.com%' THEN '잘못된 URL'
        WHEN images[1] LIKE '%unsplash.com%' THEN '정상 URL'
        ELSE '기타'
    END as image_status
FROM products 
ORDER BY created_at DESC;

-- 5. 완료 메시지
SELECT '상품 이미지 URL 수정이 완료되었습니다.' as message;
