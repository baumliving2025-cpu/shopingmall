// Supabase 기반 쇼핑몰 앱
let products = [];
let cart = [];
let orders = [];
let currentUser = null;

// Supabase 클라이언트 확인
function checkSupabase() {
    if (!window.supabase) {
        console.error('Supabase 클라이언트가 로드되지 않았습니다.');
        return false;
    }
    return true;
}

// 디버깅용 로그 함수
function debugLog(message, data = null) {
    console.log(`[DEBUG] ${message}`, data);
}

// 상품 표시
function displayProducts(filter = '전체') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filteredProducts = filter === '전체' ? products : products.filter(p => p.category === filter);
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>등록된 상품이 없습니다</h3>
                <p>새로운 상품이 등록되면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredProducts.map(product => {
        const discountPrice = product.discount > 0 ? 
            Math.round(product.price * (1 - product.discount / 100)) : product.price;
        const badge = product.discount > 0 ? `${product.discount}% 할인` : 
                     (product.stock_quantity <= 5 && product.stock_quantity > 0) ? '재고부족' : 
                     product.stock_quantity === 0 ? '품절' : '';
        
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.images && product.images.length > 0 ? 
                        `<img src="${getSafeImageUrl(product.images[0], product.category)}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="this.src='${getCategoryImageUrl(product.category)}'; this.onerror=null;">` :
                        `<img src="${getCategoryImageUrl(product.category)}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
                    }
                    ${badge ? `<div class="product-badge">${badge}</div>` : ''}
                </div>
                <div class="product-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h3 class="product-title">${product.name}</h3>
                        <span style="font-size: 0.8rem; background: #f8f9fa; padding: 0.2rem 0.5rem; border-radius: 10px; color: #666;">${product.brand || '미지정'}</span>
                    </div>
                    <div class="product-price">
                        ${product.discount > 0 ? 
                            `<span style="text-decoration: line-through; color: #999; font-size: 0.9rem;">${product.price.toLocaleString()}원</span><br>` : ''
                        }
                        <strong style="color: #e74c3c; font-size: 1.2rem;">${discountPrice.toLocaleString()}원</strong>
                    </div>
                    <p class="product-description">${product.description || '상품 설명이 없습니다.'}</p>
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 1rem;">
                        <strong>카테고리:</strong> ${product.category || '미지정'} | 
                        <strong>재고:</strong> ${product.stock_quantity || 0}개
                    </div>
                    <div class="product-actions">
                        <button onclick="addToCart('${String(product.id)}')" class="btn btn-primary" 
                                ${product.stock_quantity === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> 
                            ${product.stock_quantity === 0 ? '품절' : '장바구니 담기'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 상품 로드 (Supabase에서 - RLS 비활성화 상태)
async function loadProducts() {
    if (!checkSupabase()) {
        console.warn('Supabase 연결 실패, 기본 상품 로드');
        loadDefaultProducts();
        return;
    }
    
    try {
        // RLS가 비활성화된 상태에서 직접 조회
        const { data, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.warn('상품 로드 실패:', error.message);
            loadDefaultProducts();
            return;
        }
        
        products = data || [];
        
        // 상품 ID 타입 로깅
        if (products.length > 0) {
            console.log('로드된 상품 ID 타입:', typeof products[0].id);
            console.log('첫 번째 상품 ID:', products[0].id);
        }
        
        displayProducts();
        console.log('상품 로드 완료:', products.length, '개');
    } catch (error) {
        console.error('상품 로드 오류:', error);
        loadDefaultProducts();
    }
}

// 기본 상품 데이터 (Supabase 연결 실패 시)
function loadDefaultProducts() {
    products = [
        {
            id: '1',
            name: 'Nike Air Max 270',
            brand: 'Nike',
            price: 159000,
            description: '혁신적인 에어 쿠셔닝과 현대적인 디자인',
            category: '패션',
            images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&auto=format'],
            stock_quantity: 50,
            discount: 0
        },
        {
            id: '2',
            name: 'Chanel No.5 Parfum',
            brand: 'Chanel',
            price: 245000,
            description: '클래식한 향수의 대명사',
            category: '뷰티',
            images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&auto=format'],
            stock_quantity: 30,
            discount: 0
        },
        {
            id: '3',
            name: 'Apple iPhone 15 Pro',
            brand: 'Apple',
            price: 1350000,
            description: '최신 A17 Pro 칩셋과 티타늄 디자인',
            category: '전자제품',
            images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format'],
            stock_quantity: 20,
            discount: 0
        }
    ];
    displayProducts();
}

// 장바구니에 상품 추가 (localStorage 기반 - 안정적인 버전)
async function addToCart(productId) {
    console.log('=== 장바구니 추가 시작 ===');
    console.log('요청된 상품 ID:', productId);
    console.log('현재 사용자:', currentUser);
    console.log('로드된 상품 수:', products.length);
    console.log('상품 목록:', products.map(p => ({ id: p.id, name: p.name })));
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        showLoginModal();
        return;
    }
    
    try {
        // 상품 ID 타입 변환 (문자열 ↔ 숫자)
        const productIdStr = String(productId);
        const productIdNum = Number(productId);
        
        let product = products.find(p => 
            p.id === productId || 
            p.id === productIdStr || 
            p.id === productIdNum ||
            String(p.id) === productIdStr ||
            Number(p.id) === productIdNum
        );
        
        // 상품을 찾지 못한 경우 상품 목록을 다시 로드 시도
        if (!product && products.length === 0) {
            console.log('상품 목록이 비어있음, 상품 다시 로드 시도');
            await loadProducts();
            product = products.find(p => 
                p.id === productId || 
                p.id === productIdStr || 
                p.id === productIdNum ||
                String(p.id) === productIdStr ||
                Number(p.id) === productIdNum
            );
        }
        
        if (!product) {
            console.error('상품을 찾을 수 없음:', {
                productId,
                availableIds: products.map(p => p.id),
                productsCount: products.length
            });
            alert('상품을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        console.log('장바구니 추가 시도:', { productId, userId: currentUser.id });
        
        // localStorage에서 장바구니 로드
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 기존 아이템 확인
        const existingItem = storedCart.find(item => 
            item.user_id === currentUser.id && item.product_id === productId
        );
        
        if (existingItem) {
            // 수량 증가
            existingItem.quantity += 1;
        } else {
            // 새 아이템 추가
            storedCart.push({
                id: Date.now(),
                user_id: currentUser.id,
                product_id: productId,
                quantity: 1,
                products: product
            });
        }
        
        // localStorage에 저장
        localStorage.setItem('cart', JSON.stringify(storedCart));
        
        // UI 업데이트
        await loadCart();
        updateCartBadge();
        alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
        
    } catch (error) {
        console.error('장바구니 추가 실패:', error);
        alert('장바구니 추가에 실패했습니다: ' + error.message);
    }
}

// 장바구니 로드 (localStorage 기반 - 안정적인 버전)
async function loadCart() {
    if (!currentUser) {
        cart = [];
        return;
    }
    
    try {
        console.log('장바구니 로드 시작:', { userId: currentUser.id });
        
        // localStorage에서 장바구니 로드
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 현재 사용자의 장바구니만 필터링
        cart = storedCart.filter(item => item.user_id === currentUser.id);
        
        console.log('장바구니 로드 완료:', cart.length, '개 아이템');
        
    } catch (error) {
        console.error('장바구니 로드 실패:', error);
        cart = [];
    }
}

// 장바구니 배지 업데이트
function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// 장바구니 토글
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
        if (cartModal.style.display === 'block') {
            displayCart();
        }
    }
}

// 장바구니 표시
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('totalPrice');
    
    if (!cartItems || !cartTotal) {
        console.error('장바구니 요소를 찾을 수 없습니다:', { cartItems, cartTotal });
        return;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">장바구니가 비어있습니다.</p>';
        cartTotal.textContent = '총 금액: 0원';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
            <div class="item-info">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${item.products.name}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.products.price.toLocaleString()}원</p>
            </div>
            <div class="item-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                <button onclick="removeFromCart(${item.id})" style="background: #ff4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">삭제</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    cartTotal.textContent = `총 금액: ${total.toLocaleString()}원`;
}

// 장바구니 수량 업데이트 (localStorage 기반 - 안정적인 버전)
async function updateCartQuantity(cartItemId, newQuantity) {
    if (!currentUser) return;
    
    try {
        console.log('장바구니 수량 업데이트:', { cartItemId, newQuantity });
        
        // localStorage에서 장바구니 로드
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 아이템 찾기 및 수량 업데이트
        const itemIndex = storedCart.findIndex(item => 
            item.id === cartItemId && item.user_id === currentUser.id
        );
        
        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                // 수량이 0 이하면 아이템 삭제
                storedCart.splice(itemIndex, 1);
            } else {
                // 수량 업데이트
                storedCart[itemIndex].quantity = newQuantity;
            }
            
            // localStorage에 저장
            localStorage.setItem('cart', JSON.stringify(storedCart));
            
            console.log('장바구니 수량 업데이트 완료');
        }
        
        // UI 업데이트
        await loadCart();
        updateCartBadge();
        displayCart();
        
    } catch (error) {
        console.error('장바구니 수량 업데이트 실패:', error);
        alert('장바구니 수량 업데이트에 실패했습니다: ' + error.message);
    }
}

// 장바구니에서 상품 제거 (localStorage 기반 - 안정적인 버전)
async function removeFromCart(cartItemId) {
    if (!currentUser) return;
    
    try {
        console.log('장바구니 아이템 삭제:', { cartItemId });
        
        // localStorage에서 장바구니 로드
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // 아이템 찾기 및 삭제
        const itemIndex = storedCart.findIndex(item => 
            item.id === cartItemId && item.user_id === currentUser.id
        );
        
        if (itemIndex !== -1) {
            storedCart.splice(itemIndex, 1);
            
            // localStorage에 저장
            localStorage.setItem('cart', JSON.stringify(storedCart));
            
            console.log('장바구니 아이템 삭제 완료');
        }
        
        // UI 업데이트
        await loadCart();
        updateCartBadge();
        displayCart();
        
    } catch (error) {
        console.error('장바구니 아이템 삭제 실패:', error);
        alert('장바구니에서 상품 제거에 실패했습니다: ' + error.message);
    }
}

// 장바구니 모달 닫기
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// 주문하기 (Supabase 연동)
async function checkout() {
    console.log('=== 주문하기 시작 ===');
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        showLoginModal();
        return;
    }
    
    if (cart.length === 0) {
        alert('장바구니가 비어있습니다.');
        return;
    }
    
    if (!window.supabase) {
        alert('데이터베이스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    try {
        // 주문 번호 생성
        const orderNumber = `ORD${Date.now()}`;
        const totalAmount = cart.reduce((sum, item) => {
            const price = item.products?.price || item.price || 0;
            const quantity = item.quantity || 0;
            return sum + (price * quantity);
        }, 0);
        
        console.log('주문 정보:', {
            orderNumber,
            totalAmount,
            cartItems: cart.length,
            userId: currentUser.id
        });
        
        // 1. orders 테이블에 주문 저장
        console.log('orders 테이블에 주문 저장 중...');
        const { data: orderData, error: orderError } = await window.supabase
            .from('orders')
            .insert([{
                order_number: orderNumber,
                user_id: currentUser.id,
                total_amount: totalAmount,
                status: '주문접수'
            }])
            .select()
            .single();
        
        if (orderError) {
            console.error('주문 저장 실패:', orderError);
            throw new Error(`주문 저장 실패: ${orderError.message}`);
        }
        
        console.log('주문 저장 성공:', orderData);
        
        // 2. order_items 테이블에 주문 상품들 저장
        console.log('order_items 테이블에 상품 저장 중...');
        const orderItems = cart.map(item => {
            const product = item.products || item;
            return {
                order_id: orderData.id,
                product_id: item.product_id || item.id,
                quantity: item.quantity,
                price: product.price
            };
        });
        
        console.log('저장할 주문 상품들:', orderItems);
        
        const { error: itemsError } = await window.supabase
            .from('order_items')
            .insert(orderItems);
        
        if (itemsError) {
            console.error('주문 상품 저장 실패:', itemsError);
            throw new Error(`주문 상품 저장 실패: ${itemsError.message}`);
        }
        
        console.log('주문 상품 저장 성공');
        
        // 3. 장바구니 비우기 (localStorage)
        cart = [];
        localStorage.setItem('cart', JSON.stringify([]));
        
        // 4. UI 업데이트
        updateCartBadge();
        displayCart();
        closeCart();
        
        // 5. 성공 메시지
        alert(`주문이 완료되었습니다!\n주문번호: ${orderNumber}\n총 금액: ${totalAmount.toLocaleString()}원`);
        
        // 6. 이메일 발송 (EmailJS) - 고객과 사업자 모두에게 발송
        if (window.CONFIG?.EMAILJS) {
            try {
                console.log('이메일 발송 시작...');
                
                // 이메일용 주문 데이터 생성 (cart가 비워지기 전에 미리 생성)
                const orderForEmail = {
                    order_number: orderNumber,
                    user_name: currentUser.name,
                    user_email: currentUser.email,
                    total_amount: totalAmount,
                    items: cart.map(item => {
                        const product = item.products || item;
                        return {
                            product_name: product.name,
                            quantity: item.quantity,
                            price: product.price
                        };
                    }),
                    created_at: new Date().toISOString()
                };
                
                // 1. 고객에게 주문내역 발송
                console.log('고객에게 이메일 발송 시도...');
                await sendOrderEmail(orderForEmail, currentUser.email);
                console.log('고객 이메일 발송 완료!');
                
                // 2. 사업자에게 주문 알림 발송
                console.log('사업자에게 이메일 발송 시도...');
                await sendOrderEmail(orderForEmail, 'baumliving2025@gmail.com');
                console.log('사업자 이메일 발송 완료!');
                
                console.log('모든 이메일 발송 완료!');
            } catch (emailError) {
                console.error('이메일 발송 실패:', emailError);
                // 이메일 발송 실패는 주문 성공에 영향을 주지 않음
            }
        } else {
            console.warn('EmailJS 설정이 없습니다.');
        }
        
        console.log('=== 주문하기 완료 ===');
        
    } catch (error) {
        console.error('주문 실패:', error);
        alert(`주문 처리에 실패했습니다: ${error.message}`);
    }
}

// 사용자 정보 표시
function showUserInfo() {
    if (!currentUser) {
        console.warn('사용자 정보가 없습니다');
        return;
    }
    
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.style.display = 'none';
    
    alert(`내 정보\n\n이름: ${currentUser.name}\n이메일: ${currentUser.email}\n역할: ${currentUser.role === 'admin' ? '관리자' : '일반회원'}\n상태: ${currentUser.status}`);
}

// 로그인 모달 토글
function toggleLogin() {
    if (currentUser) {
        // Show user info if logged in
        showUserInfo();
    } else {
        document.getElementById('loginModal').style.display = 'block';
    }
}

// 로그인 모달 표시
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

// 로그인 모달 숨기기
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        loginModal.style.visibility = 'hidden';
        loginModal.style.opacity = '0';
        loginModal.classList.remove('show');
        console.log('로그인 모달 닫기 완료');
    }
}

// 로그인 모달 닫기 (closeLogin 함수 추가)
function closeLogin() {
    hideLoginModal();
}

// 회원가입 탭 표시
function showSignup() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'none';
        signupContent.style.display = 'block';
    }
}

// 로그인 탭 표시
function showLogin() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'block';
        signupContent.style.display = 'none';
    }
}

// 회원가입 처리 (Supabase 직접 호출)
async function registerUser() {
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupPasswordConfirm');
    
    // 입력값 가져오기
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // 유효성 검사
    if (!name || !email || !password || !confirmPassword) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    if (!checkSupabase()) {
        alert('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    try {
        // 1. Supabase Auth에 회원가입
        const { data: authData, error: authError } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: undefined // 이메일 인증 우회
            }
        });
        
        if (authError) throw new Error(authError.message);
        
        // 2. 사용자 정보를 users 테이블에 저장 (승인 대기 상태)
        if (authData.user) {
            const { error: insertError } = await window.supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email,
                    name: name,
                    role: 'user',
                    status: 'active' // RLS 비활성화 상태에서는 바로 활성화
                });
            
            if (insertError) {
                console.error('사용자 정보 저장 실패:', insertError);
                throw new Error('사용자 정보 저장에 실패했습니다.');
            }
        }
        
        // 폼 초기화
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        
        // 로그인 탭으로 전환
        showLogin();
        
        alert('회원가입이 완료되었습니다. 바로 로그인할 수 있습니다.');
        
        // 자동으로 로그인 시도
        console.log('자동 로그인 시도...');
        try {
            const { data: loginData, error: loginError } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (loginData.user && !loginError) {
                // 로그인 성공 시 사용자 정보 설정
                currentUser = {
                    id: loginData.user.id,
                    email: loginData.user.email,
                    name: name,
                    role: 'user',
                    status: 'active'
                };
                
                updateHeaderButtons();
                await loadCart();
                updateCartBadge();
                
                alert(`환영합니다, ${name}님! 자동으로 로그인되었습니다.`);
            }
        } catch (autoLoginError) {
            console.warn('자동 로그인 실패:', autoLoginError);
        }
        
    } catch (error) {
        console.error('회원가입 실패:', error);
        alert(error.message || '회원가입에 실패했습니다.');
    }
}

// 로그인 처리 (Supabase 직접 호출)
async function loginUser() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    // 입력값 가져오기
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // 유효성 검사
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    if (!checkSupabase()) {
        alert('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    try {
        console.log('1단계: Supabase Auth 로그인 시도...', { email });
        
        // 1. Supabase Auth로 로그인
        const { data: authData, error: authError } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        console.log('Auth 응답:', { authData, authError });
        
        if (authError) {
            console.error('Auth 오류:', authError);
            
            // 구체적인 오류 메시지 처리
            if (authError.message.includes('Invalid login credentials')) {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else if (authError.message.includes('Email not confirmed')) {
                throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
            } else if (authError.message.includes('Too many requests')) {
                throw new Error('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
            } else {
                throw new Error(authError.message);
            }
        }
        
        if (!authData.user) {
            throw new Error('로그인에 실패했습니다. 사용자 정보를 찾을 수 없습니다.');
        }
        
        console.log('2단계: 사용자 정보 조회...', { userId: authData.user.id });
        
        // 2. 사용자 정보를 users 테이블에서 가져오기
        const { data: userData, error: userError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        console.log('사용자 데이터 조회 결과:', { userData, userError });
        
        if (userError) {
            console.warn('users 테이블에서 사용자 정보를 찾을 수 없음:', userError);
            
            // users 테이블에 사용자 정보가 없는 경우 새로 생성
            const { error: insertError } = await window.supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email,
                    name: authData.user.user_metadata?.name || email.split('@')[0],
                    role: 'user',
                    status: 'active'
                });
            
            if (insertError) {
                console.error('사용자 정보 생성 실패:', insertError);
                throw new Error('사용자 정보 생성에 실패했습니다.');
            }
            
            // 새로 생성된 사용자 정보로 설정
            currentUser = {
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata?.name || email.split('@')[0],
                role: 'user',
                status: 'active'
            };
        } else {
            // 기존 사용자 정보로 설정
            currentUser = {
                id: authData.user.id,
                email: authData.user.email,
                name: userData.name,
                role: userData.role || 'user',
                status: userData.status || 'active'
            };
        }
        
        console.log('3단계: 로그인 성공, 사용자 정보 설정:', currentUser);
        
        // 폼 초기화
        emailInput.value = '';
        passwordInput.value = '';
        
        // 모달 닫기
        hideLoginModal();
        
        // 헤더 업데이트
        updateHeaderButtons();
        
        // 장바구니 로드
        await loadCart();
        updateCartBadge();
        
        alert(`로그인되었습니다! 안녕하세요, ${currentUser.name}님!`);
        
    } catch (error) {
        console.error('로그인 실패:', error);
        alert('로그인에 실패했습니다: ' + error.message);
    }
}

// 로그아웃 처리 (Supabase 직접 호출 - 개선된 버전)
async function logoutUser() {
    if (!checkSupabase()) return;
    
    try {
        console.log('로그아웃 시작...');
        
        // 드롭다운 닫기
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        
        // Supabase Auth에서 로그아웃
        const { error } = await window.supabase.auth.signOut();
        
        if (error) {
            console.error('Supabase 로그아웃 오류:', error);
            throw error;
        }
        
        // 사용자 정보 초기화
        currentUser = null;
        
        // 장바구니 비우기
        cart = [];
        updateCartBadge();
        
        // 헤더 업데이트
        updateHeaderButtons();
        
        console.log('로그아웃 완료');
        alert('로그아웃되었습니다. 안녕히 가세요!');
        
    } catch (error) {
        console.error('로그아웃 실패:', error);
        alert('로그아웃에 실패했습니다: ' + error.message);
    }
}

// 헤더 버튼 업데이트 (간단하고 확실한 버전)
function updateHeaderButtons() {
    const userIcon = document.querySelector('.user-icon');
    if (!userIcon) {
        console.error('user-icon 요소를 찾을 수 없습니다.');
        return;
    }
    
    console.log('updateHeaderButtons 호출됨, currentUser:', currentUser);
    
    if (currentUser) {
        // 로그인된 상태 - 간단한 드롭다운
        userIcon.innerHTML = `
            <i class="fas fa-user" style="color: #007bff;"></i>
            <div id="userDropdown" style="position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; z-index: 1000; display: none; margin-top: 5px;">
                <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa;">
                    <div style="font-weight: bold; color: #333;">${currentUser.name}</div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">${currentUser.email}</div>
                </div>
                                    <div style="padding: 0.5rem 0;">
                        <button onclick="showOrderHistory()" style="width: 100%; padding: 0.75rem 1rem; border: none; background: none; text-align: left; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                            <i class="fas fa-shopping-bag" style="margin-right: 0.5rem; color: #666;"></i>주문내역
                        </button>
                        ${currentUser.role === 'admin' ? 
                            `<button onclick="showAdminPanel()" style="width: 100%; padding: 0.75rem 1rem; border: none; background: none; text-align: left; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                                <i class="fas fa-cog" style="margin-right: 0.5rem; color: #6c757d;"></i>관리자 패널
                            </button>` : ''}
                        <button onclick="logoutUser()" style="width: 100%; padding: 0.75rem 1rem; border: none; background: none; text-align: left; cursor: pointer; color: #ff4444; transition: background 0.2s;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='none'">
                            <i class="fas fa-sign-out-alt" style="margin-right: 0.5rem;"></i>로그아웃
                        </button>
                    </div>
            </div>
        `;
        
        // 클릭 이벤트 추가
        userIcon.onclick = toggleUserDropdown;
        console.log('로그인된 상태 UI 생성 완료');
    } else {
        // 로그인되지 않은 상태
        userIcon.innerHTML = `
            <i class="fas fa-user" style="color: #666; font-size: 1.2rem;"></i>
        `;
        
        // 클릭 이벤트 추가
        userIcon.onclick = showLoginModal;
        console.log('로그인되지 않은 상태 UI 생성 완료');
    }
}

// 사용자 드롭다운 토글 (간단하고 확실한 버전)
function toggleUserDropdown() {
    console.log('toggleUserDropdown 함수 호출됨');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        console.log('사용자 드롭다운 토글:', isVisible ? '닫기' : '열기');
    } else {
        console.error('사용자 드롭다운을 찾을 수 없습니다.');
    }
}

// 전역 함수로 등록
window.toggleUserDropdown = toggleUserDropdown;

// ==================== 주문내역 기능 ====================

// 주문내역 모달 표시
async function showOrderHistory() {
    console.log('주문내역 모달 표시 요청');
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const modal = document.getElementById('orderHistoryModal');
    if (modal) {
        modal.style.display = 'block';
        await loadUserOrderHistory();
    } else {
        console.error('주문내역 모달을 찾을 수 없습니다');
    }
}

// 사용자 주문내역 로드
async function loadUserOrderHistory() {
    console.log('사용자 주문내역 로드 시작');
    
    const orderList = document.getElementById('orderHistoryList');
    if (!orderList) {
        console.error('주문내역 리스트 요소를 찾을 수 없습니다');
        return;
    }
    
    // 로딩 표시
    orderList.innerHTML = `
        <div class="loading-orders">
            <i class="fas fa-spinner"></i>
            <p>주문내역을 불러오는 중...</p>
        </div>
    `;
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        console.log('현재 사용자 ID:', currentUser.id);
        
        // 주문 데이터와 관련 상품 정보, 사용자 정보를 함께 조회
        const { data: orders, error } = await window.supabase
            .from('orders')
            .select(`
                *,
                users!orders_user_id_fkey (name, email),
                order_items (
                    *,
                    products (name, brand, price, images)
                )
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('주문내역 조회 오류:', error);
            throw error;
        }
        
        console.log('조회된 주문 수:', orders ? orders.length : 0);
        displayOrderHistory(orders || []);
        
    } catch (error) {
        console.error('주문내역 로드 실패:', error);
        orderList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-exclamation-triangle"></i>
                <p>주문내역을 불러올 수 없습니다.</p>
                <p style="font-size: 12px; color: #999;">오류: ${error.message}</p>
            </div>
        `;
    }
}

// 주문내역 표시
function displayOrderHistory(orders) {
    console.log('주문내역 표시 시작:', orders.length, '개 주문');
    
    const container = document.getElementById('orderHistoryList');
    if (!container) {
        console.error('주문내역 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-shopping-bag"></i>
                <p>주문 내역이 없습니다.</p>
                <p style="font-size: 14px; color: #999;">첫 번째 주문을 해보세요!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => {
        console.log('주문 처리 중:', order.order_number, '상품 수:', order.order_items?.length || 0);
        
        return `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-info">
                        <h4>주문번호: ${order.order_number || order.id}</h4>
                        <p>주문일: ${new Date(order.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                        <p>주문자: ${order.users?.name || '정보 없음'}</p>
                        <p>상태: <span class="order-status status-${order.status}">${order.status}</span></p>
                    </div>
                    <div class="order-total">
                        <h3>${(order.total_amount || 0).toLocaleString()}원</h3>
                    </div>
                </div>
                
                <div class="order-products">
                    ${(order.order_items || []).map(item => {
                        const product = item.products || {};
                        const imageUrl = product.images && product.images[0] 
                            ? product.images[0] 
                            : 'https://via.placeholder.com/60x60?text=No+Image';
                        
                        return `
                            <div class="order-product">
                                <img src="${imageUrl}" 
                                     alt="${product.name || '상품'}" 
                                     onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                                <div class="product-details">
                                    <h5>${product.brand || ''} ${product.name || '상품명 없음'}</h5>
                                    <p>수량: ${item.quantity || 0}개 × ${(item.price || 0).toLocaleString()}원</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="order-actions">
                    <button onclick="viewOrderDetail('${order.id}')" class="btn-secondary">상세보기</button>
                    ${order.status === '주문접수' ? 
                        `<button onclick="cancelOrder('${order.id}')" class="btn-danger">주문취소</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 주문내역 모달 닫기
function closeOrderHistory() {
    const modal = document.getElementById('orderHistoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 주문 상세보기
async function viewOrderDetail(orderId) {
    console.log('주문 상세보기:', orderId);
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        // 주문 상세 정보 조회
        const { data: order, error } = await window.supabase
            .from('orders')
            .select(`
                *,
                users!orders_user_id_fkey (name, email),
                order_items (
                    *,
                    products (name, brand, price, images, description)
                )
            `)
            .eq('id', orderId)
            .single();
        
        if (error) {
            throw error;
        }
        
        // 상세 정보를 모달로 표시
        const detailHtml = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h3>주문 상세 정보</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p><strong>주문번호:</strong> ${order.order_number || order.id}</p>
                    <p><strong>주문일시:</strong> ${new Date(order.created_at).toLocaleString('ko-KR')}</p>
                    <p><strong>주문자:</strong> ${order.users?.name || '정보 없음'}</p>
                    <p><strong>이메일:</strong> ${order.users?.email || '정보 없음'}</p>
                    <p><strong>주문상태:</strong> <span class="order-status status-${order.status}">${order.status}</span></p>
                    <p><strong>총 금액:</strong> ${(order.total_amount || 0).toLocaleString()}원</p>
                </div>
                
                <h4>주문 상품</h4>
                ${(order.order_items || []).map(item => {
                    const product = item.products || {};
                    return `
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
                            <img src="${product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/60x60'}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">
                            <div>
                                <h5 style="margin: 0 0 5px 0;">${product.brand || ''} ${product.name || '상품명 없음'}</h5>
                                <p style="margin: 0; color: #666;">수량: ${item.quantity || 0}개</p>
                                <p style="margin: 0; color: #666;">단가: ${(item.price || 0).toLocaleString()}원</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold;">소계: ${((item.quantity || 0) * (item.price || 0)).toLocaleString()}원</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        alert(detailHtml.replace(/<[^>]*>/g, '')); // HTML 태그 제거하여 간단히 표시
        
    } catch (error) {
        console.error('주문 상세보기 실패:', error);
        alert('주문 상세 정보를 불러올 수 없습니다.');
    }
}

// 주문 취소
async function cancelOrder(orderId) {
    console.log('주문 취소 요청:', orderId);
    
    if (!confirm('정말 주문을 취소하시겠습니까?')) {
        return;
    }
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        const { error } = await window.supabase
            .from('orders')
            .update({ status: '취소' })
            .eq('id', orderId);
        
        if (error) {
            throw error;
        }
        
        alert('주문이 취소되었습니다.');
        await loadUserOrderHistory(); // 주문내역 새로고침
        
    } catch (error) {
        console.error('주문 취소 실패:', error);
        alert('주문 취소에 실패했습니다: ' + error.message);
    }
}

// 주문 필터링
async function filterOrders() {
    console.log('주문 필터링 시작');
    
    const statusFilter = document.getElementById('orderStatusFilter')?.value;
    const dateFrom = document.getElementById('orderDateFrom')?.value;
    const dateTo = document.getElementById('orderDateTo')?.value;
    
    console.log('필터 조건:', { statusFilter, dateFrom, dateTo });
    
    try {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        let query = window.supabase
            .from('orders')
            .select(`
                *,
                users!orders_user_id_fkey (name, email),
                order_items (
                    *,
                    products (name, brand, price, images)
                )
            `)
            .eq('user_id', currentUser.id);
        
        // 상태 필터 적용
        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }
        
        // 날짜 필터 적용
        if (dateFrom) {
            query = query.gte('created_at', dateFrom + 'T00:00:00');
        }
        if (dateTo) {
            query = query.lte('created_at', dateTo + 'T23:59:59');
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data: orders, error } = await query;
        
        if (error) {
            throw error;
        }
        
        displayOrderHistory(orders || []);
        
    } catch (error) {
        console.error('주문 필터링 실패:', error);
        alert('주문 필터링에 실패했습니다: ' + error.message);
    }
}

// 주문 필터 초기화
function resetOrderFilters() {
    console.log('주문 필터 초기화');
    
    const statusFilter = document.getElementById('orderStatusFilter');
    const dateFrom = document.getElementById('orderDateFrom');
    const dateTo = document.getElementById('orderDateTo');
    
    if (statusFilter) statusFilter.value = '';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    
    // 전체 주문내역 다시 로드
    loadUserOrderHistory();
}

// ==================== 관리자 상품 관리 시스템 ====================

// 관리자 권한 확인
function checkAdminPermission() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return false;
    }
    if (currentUser.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        return false;
    }
    return true;
}

// 관리자 탭 전환
function showAdminTab(tabName) {
    console.log('관리자 탭 전환:', tabName);
    
    try {
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // 모든 탭 콘텐츠 숨기기
        document.querySelectorAll('.admin-tab-content').forEach(content => content.style.display = 'none');
        
        // 선택된 탭 버튼 활성화
        const selectedButton = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // 해당 탭 콘텐츠 표시
        const contentId = tabName + 'Tab';
        const content = document.getElementById(contentId);
        if (content) {
            content.style.display = 'block';
            console.log('탭 활성화:', tabName);
            
            // 탭별 콘텐츠 로드
            switch(tabName) {
                case 'users':
                    if (typeof loadUsersList === 'function') {
                        loadUsersList();
                    }
                    break;
                case 'products':
                    refreshProductList();
                    break;
                case 'orders':
                    if (typeof loadAdminOrders === 'function') {
                        loadAdminOrders();
                    }
                    break;
                case 'settings':
                    // 새로운 사이트 설정 시스템 사용
                    if (window.siteSettingsManager) {
                        window.siteSettingsManager.loadSettings();
                    }
                    break;
            }
        } else {
            console.error('탭 콘텐츠를 찾을 수 없습니다:', contentId);
        }
    } catch (error) {
        console.error('탭 전환 중 오류 발생:', error);
    }
}

// 상품 목록 로드 (관리자용)
async function loadProductsList() {
    if (!checkAdminPermission()) return;
    
    try {
        console.log('관리자 상품 목록 로드 시작');
        
        const { data: products, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('상품 목록 로드 오류:', error);
            alert('상품 목록을 불러오는데 실패했습니다.');
            return;
        }
        
        displayProductsList(products || []);
        console.log('관리자 상품 목록 로드 완료:', products?.length || 0, '개');
        
    } catch (error) {
        console.error('상품 목록 로드 실패:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

// 상품 목록 표시 (관리자용)
function displayProductsList(products) {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>등록된 상품이 없습니다</h3>
                <p>새 상품을 추가해보세요.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="product-list">
            ${products.map(product => `
                <div class="product-card">
                    <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format'}" 
                         alt="${product.name}" class="product-card-image"
                         onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format'; this.onerror=null;">
                    <div class="product-card-content">
                        <h3 class="product-card-title">${product.name}</h3>
                        <p class="product-card-brand">${product.brand || '브랜드 미지정'}</p>
                        <div class="product-stock ${product.stock_quantity <= 0 ? 'out' : product.stock_quantity <= 10 ? 'low' : ''}">
                            재고: ${product.stock_quantity || 0}개
                        </div>
                        <div class="product-card-price">
                            ${product.price?.toLocaleString() || 0}원
                            ${product.discount > 0 ? `<span style="color: #dc3545; font-size: 0.875rem;">(${product.discount}% 할인)</span>` : ''}
                        </div>
                        <div class="product-card-actions">
                            <button onclick="editProduct('${product.id}')" class="btn btn-secondary btn-sm">
                                <i class="fas fa-edit"></i> 수정
                            </button>
                            <button onclick="deleteProduct('${product.id}')" class="btn btn-danger btn-sm">
                                <i class="fas fa-trash"></i> 삭제
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 상품 추가 모달 표시
function showAddProductModal() {
    if (!checkAdminPermission()) return;
    
    document.getElementById('productModalTitle').textContent = '상품 추가';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imageUrlInputs').innerHTML = '<input type="url" class="image-url-input" placeholder="https://example.com/image1.jpg">';
    
    // 모달 표시
    document.getElementById('productModal').style.display = 'block';
}

// 상품 수정 모달 표시
async function editProduct(productId) {
    if (!checkAdminPermission()) return;
    
    try {
        const { data: product, error } = await window.supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) {
            console.error('상품 조회 오류:', error);
            alert('상품 정보를 불러오는데 실패했습니다.');
            return;
        }
        
        // 폼에 데이터 채우기 (안전한 DOM 접근)
        const productModalTitle = document.getElementById('productModalTitle');
        const productName = document.getElementById('productName');
        const productBrand = document.getElementById('productBrand');
        const productPrice = document.getElementById('productPrice');
        const productCategory = document.getElementById('productCategory');
        const productStock = document.getElementById('productStock');
        const productDiscount = document.getElementById('productDiscount');
        const productDescription = document.getElementById('productDescription');
        
        if (productModalTitle) productModalTitle.textContent = '상품 수정';
        if (productName) productName.value = product.name || '';
        if (productBrand) productBrand.value = product.brand || '';
        if (productPrice) productPrice.value = product.price || '';
        if (productCategory) productCategory.value = product.category || '';
        if (productStock) productStock.value = product.stock_quantity || '';
        if (productDiscount) productDiscount.value = product.discount || '';
        if (productDescription) productDescription.value = product.description || '';
        
        // 이미지 URL 입력 필드 설정 (안전한 DOM 접근)
        const imageUrlInputs = document.getElementById('imageUrlInputs');
        if (imageUrlInputs) {
            imageUrlInputs.innerHTML = '';
                if (product.images && product.images.length > 0) {
                    product.images.forEach(url => {
                        const input = document.createElement('input');
                        input.type = 'url';
                        input.className = 'image-url-input';
                        input.value = url;
                        input.placeholder = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format';
                        imageUrlInputs.appendChild(input);
                    });
                } else {
                    imageUrlInputs.innerHTML = '<input type="url" class="image-url-input" placeholder="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format">';
                }
            }
        
        // 이미지 미리보기
        displayImagePreviews(product.images || []);
        
        // 모달 표시
        document.getElementById('productModal').style.display = 'block';
        
        // 폼에 제출 이벤트 리스너 추가 (수정 모드)
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.onsubmit = (e) => {
                e.preventDefault();
                saveProduct(productId);
            };
        }
        
    } catch (error) {
        console.error('상품 수정 실패:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
    }
}

// 상품 삭제
async function deleteProduct(productId) {
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await window.supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) {
            console.error('상품 삭제 오류:', error);
            alert('상품 삭제에 실패했습니다.');
            return;
        }
        
        alert('상품이 삭제되었습니다.');
        loadProductsList(); // 목록 새로고침
        
    } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
    }
}

// 상품 추가/수정
async function saveProduct(productId = null) {
    if (!checkAdminPermission()) return;
    
    try {
        // 폼 데이터 수집
        // 안전한 DOM 접근으로 폼 데이터 수집
        const productName = document.getElementById('productName');
        const productBrand = document.getElementById('productBrand');
        const productPrice = document.getElementById('productPrice');
        const productCategory = document.getElementById('productCategory');
        const productStock = document.getElementById('productStock');
        const productDiscount = document.getElementById('productDiscount');
        const productDescription = document.getElementById('productDescription');
        
        const formData = {
            name: productName ? productName.value.trim() : '',
            brand: productBrand ? productBrand.value.trim() : '',
            price: productPrice ? parseInt(productPrice.value) : 0,
            category: productCategory ? productCategory.value : '',
            stock_quantity: productStock ? parseInt(productStock.value) : 0,
            discount: productDiscount ? parseInt(productDiscount.value) || 0 : 0,
            description: productDescription ? productDescription.value.trim() : ''
        };
        
        // 이미지 URL 수집
        const imageUrls = Array.from(document.querySelectorAll('.image-url-input'))
            .map(input => input.value.trim())
            .filter(url => url);
        
        formData.images = imageUrls;
        
        // 유효성 검사
        if (!formData.name || !formData.brand || !formData.price || !formData.category || formData.stock_quantity < 0) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }
        
        if (formData.price < 0) {
            alert('가격은 0 이상이어야 합니다.');
            return;
        }
        
        if (formData.stock_quantity < 0) {
            alert('재고 수량은 0 이상이어야 합니다.');
            return;
        }
        
        if (formData.discount < 0 || formData.discount > 100) {
            alert('할인율은 0-100 사이여야 합니다.');
            return;
        }
        
        console.log('상품 저장:', formData);
        
        if (productId) {
            // 수정
            const { error } = await window.supabase
                .from('products')
                .update(formData)
                .eq('id', productId);
            
            if (error) {
                console.error('상품 수정 오류:', error);
                alert('상품 수정에 실패했습니다.');
                return;
            }
            
            alert('상품이 수정되었습니다.');
        } else {
            // 추가
            const { error } = await window.supabase
                .from('products')
                .insert([formData]);
            
            if (error) {
                console.error('상품 추가 오류:', error);
                alert('상품 추가에 실패했습니다.');
                return;
            }
            
            alert('상품이 추가되었습니다.');
        }
        
        // 모달 닫기
        closeProductModal();
        
        // 목록 새로고침
        loadProductsList();
        
    } catch (error) {
        console.error('상품 저장 실패:', error);
        alert('상품 저장에 실패했습니다.');
    }
}

// 상품 모달 닫기
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// 이미지 URL 입력 필드 추가
function addImageUrlInput() {
    const container = document.getElementById('imageUrlInputs');
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'image-url-input';
    input.placeholder = 'https://example.com/image.jpg';
    container.appendChild(input);
}

// 이미지 미리보기 표시
function displayImagePreviews(imageUrls) {
    const container = document.getElementById('imagePreview');
    container.innerHTML = '';
    
    imageUrls.forEach((url, index) => {
        if (url) {
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `
                <img src="${url}" alt="Preview ${index + 1}">
                <button class="remove-btn" onclick="removeImagePreview(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(item);
        }
    });
}

// 이미지 미리보기 제거
function removeImagePreview(index) {
    const inputs = document.querySelectorAll('.image-url-input');
    if (inputs[index]) {
        inputs[index].value = '';
    }
    displayImagePreviews(Array.from(inputs).map(input => input.value));
}

// 이미지 파일 업로드 처리
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const imageUrls = files.map(file => URL.createObjectURL(file));
            displayImagePreviews(imageUrls);
        });
    }
    
    // 상품 폼 제출 이벤트
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
});

// ==================== 이미지 업로드 처리 함수 ====================

// 이미지 파일 업로드 (Supabase Storage)
async function uploadImageFiles(files) {
    console.log('이미지 업로드 시작:', files.length, '개 파일');
    
    if (!window.supabase) {
        throw new Error('Supabase 클라이언트가 없습니다');
    }
    
    const imageUrls = [];
    
    for (const file of files) {
        try {
            // 파일명 생성 (타임스탬프 + 원본 파일명)
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
            
            console.log('업로드 중:', fileName);
            
            // Supabase Storage에 업로드
            const { data, error } = await window.supabase.storage
                .from('product-images')
                .upload(fileName, file);
                
            if (error) {
                console.error('이미지 업로드 실패:', error);
                throw error;
            }
            
            // 공개 URL 생성
            const { data: { publicUrl } } = window.supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
                
            imageUrls.push(publicUrl);
            console.log('업로드 성공:', publicUrl);
            
        } catch (error) {
            console.error('이미지 업로드 실패:', file.name, error);
            // 업로드 실패 시 기본 이미지 사용
            imageUrls.push(getCategoryImageUrl('전자제품'));
        }
    }
    
    console.log('이미지 업로드 완료:', imageUrls);
    return imageUrls;
}

// 이미지 업로드 방식에 따른 이미지 URL 수집
async function collectImageUrls() {
    const imageMethod = document.querySelector('input[name="imageMethod"]:checked');
    const method = imageMethod ? imageMethod.value : 'url';
    
    console.log('이미지 수집 방식:', method);
    
    if (method === 'url') {
        // URL 입력 방식
        const urlInput = document.getElementById('newProductImageUrl');
        const url = urlInput ? urlInput.value.trim() : '';
        
        if (url) {
            return [getSafeImageUrl(url, document.getElementById('newProductCategory')?.value || '')];
        } else {
            return [getCategoryImageUrl(document.getElementById('newProductCategory')?.value || '')];
        }
    } else {
        // 파일 업로드 방식
        const fileInput = document.getElementById('newProductImageFile');
        const files = fileInput ? Array.from(fileInput.files) : [];
        
        if (files.length > 0) {
            return await uploadImageFiles(files);
        } else {
            return [getCategoryImageUrl(document.getElementById('newProductCategory')?.value || '')];
        }
    }
}

// ==================== 상품 수정 관련 함수 ====================

// 상품 수정 함수 (updateProduct 별칭)
async function updateProduct(productId) {
    console.log('updateProduct 호출됨 - saveProduct로 리다이렉트');
    return await saveProduct(productId);
}

// ==================== 이미지 로딩 처리 함수 ====================

// 이미지 로딩 실패 시 대체 이미지 설정
function setImageFallback(imgElement, fallbackUrl) {
    if (imgElement) {
        imgElement.onerror = function() {
            this.src = fallbackUrl;
            this.onerror = null; // 무한 루프 방지
        };
    }
}

// 상품 카테고리별 기본 이미지 URL 반환
function getCategoryImageUrl(category) {
    const categoryImages = {
        '전자제품': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format',
        '패션': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&auto=format',
        '뷰티': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&auto=format',
        '홈&리빙': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format'
    };
    
    return categoryImages[category] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format';
}

// 안전한 이미지 URL 생성 (유효성 검사 포함)
function getSafeImageUrl(imageUrl, category = '') {
    if (!imageUrl || imageUrl.trim() === '') {
        return getCategoryImageUrl(category);
    }
    
    // 잘못된 URL 패턴 체크
    const invalidPatterns = [
        /example\.com/i,
        /placeholder/i,
        /via\.placeholder/i,
        /^https?:\/\/$/i,
        /^https?:\/\/\s*$/i
    ];
    
    for (const pattern of invalidPatterns) {
        if (pattern.test(imageUrl)) {
            console.warn('잘못된 이미지 URL 감지:', imageUrl, '→ 기본 이미지로 대체');
            return getCategoryImageUrl(category);
        }
    }
    
    return imageUrl;
}

// ==================== 상품 등록 시스템 재구현 ====================

// 상품 등록 폼 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    console.log('상품 등록 시스템 초기화 시작');
    
    const form = document.getElementById('productRegistrationForm');
    if (form) {
        console.log('상품 등록 폼을 찾았습니다:', form);
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        form.removeEventListener('submit', handleProductRegistration);
        form.removeEventListener('submit', handleProductFormSubmit);
        
        // 새로운 이벤트 리스너 등록
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('상품 등록 폼 제출됨');
            
            await handleProductRegistration(e);
        });
        
        // 이미지 업로드 방식 전환 이벤트
        setupImageUploadOptions();
        
        console.log('상품 등록 폼 이벤트 리스너 등록 완료');
    } else {
        console.warn('상품 등록 폼을 찾을 수 없습니다');
    }
});

// 이미지 업로드 옵션 설정
function setupImageUploadOptions() {
    const imageMethodRadios = document.querySelectorAll('input[name="imageMethod"]');
    const urlSection = document.getElementById('imageUrlSection');
    const fileSection = document.getElementById('imageFileSection');
    const fileInput = document.getElementById('newProductImageFile');
    
    if (!imageMethodRadios.length || !urlSection || !fileSection) {
        console.warn('이미지 업로드 옵션 요소를 찾을 수 없습니다');
        return;
    }
    
    // 라디오 버튼 이벤트 리스너
    imageMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'url') {
                urlSection.style.display = 'block';
                fileSection.style.display = 'none';
            } else {
                urlSection.style.display = 'none';
                fileSection.style.display = 'block';
            }
        });
    });
    
    // 파일 선택 시 미리보기
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
}

// 파일 선택 처리
function handleFileSelection(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('imagePreview');
    
    if (!preview) return;
    
    // 기존 미리보기 제거
    preview.innerHTML = '';
    
    // 최대 5개 파일 제한
    if (files.length > 5) {
        alert('최대 5개의 이미지만 선택할 수 있습니다.');
        e.target.value = '';
        return;
    }
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const previewItem = createImagePreview(file, index);
            preview.appendChild(previewItem);
        } else {
            alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        }
    });
}

// 이미지 미리보기 생성
function createImagePreview(file, index) {
    const previewItem = document.createElement('div');
    previewItem.className = 'image-preview-item';
    previewItem.dataset.index = index;
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => removeImagePreview(previewItem, index);
    
    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    
    return previewItem;
}

// 이미지 미리보기 제거
function removeImagePreview(previewItem, index) {
    previewItem.remove();
    
    // 파일 입력에서도 제거
    const fileInput = document.getElementById('newProductImageFile');
    if (fileInput) {
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        files.forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });
        fileInput.files = dt.files;
    }
}

// 상품 등록 처리 함수
async function handleProductRegistration(e) {
    console.log('=== 상품 등록 시작 ===');
    
    if (!checkAdminPermission()) {
        alert('관리자 권한이 필요합니다.');
        return;
    }
    
    try {
        // 폼 데이터 수집 (실제 테이블 구조에 맞게 수정)
        const productData = {
            name: document.getElementById('newProductName').value.trim(),
            brand: document.getElementById('newProductBrand').value.trim(),
            price: parseFloat(document.getElementById('newProductPrice').value),
            category: document.getElementById('newProductCategory').value,
            description: document.getElementById('newProductDescription').value.trim(),
            images: await collectImageUrls(), // 이미지 업로드 방식에 따른 처리
            stock_quantity: parseInt(document.getElementById('newProductStock').value) || 0,
            discount: parseInt(document.getElementById('newProductDiscount').value) || 0
        };
        
        console.log('수집된 상품 데이터:', productData);
        
        // 유효성 검사
        if (!productData.name || !productData.brand || !productData.price || !productData.category) {
            alert('필수 항목(상품명, 브랜드, 가격, 카테고리)을 모두 입력해주세요.');
            return;
        }
        
        if (productData.price <= 0) {
            alert('가격은 0보다 커야 합니다.');
            return;
        }
        
        if (productData.stock_quantity < 0) {
            alert('재고 수량은 0 이상이어야 합니다.');
            return;
        }
        
        console.log('유효성 검사 통과');
        
        // Supabase 연결 확인
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        // Supabase에 상품 등록
        const { data, error } = await window.supabase
            .from('products')
            .insert([productData])
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('상품 등록 성공:', data);
        alert('상품이 성공적으로 등록되었습니다!');
        
        // 폼 초기화
        resetProductForm();
        
        // 상품 목록 새로고침
        await refreshProductList();
        await loadProducts();
        
        console.log('=== 상품 등록 완료 ===');
        
    } catch (error) {
        console.error('상품 등록 실패:', error);
        alert('상품 등록에 실패했습니다: ' + error.message);
    }
}

// 기존 함수명 호환성을 위한 별칭 (FormData 사용)
async function handleProductFormSubmit(event) {
    console.log('handleProductFormSubmit 호출됨 - handleProductRegistration으로 리다이렉트');
    event.preventDefault();
    
    if (!checkAdminPermission()) {
        alert('관리자 권한이 필요합니다.');
        return;
    }
    
    try {
        // FormData를 사용한 데이터 수집 (실제 테이블 구조에 맞게 수정)
        const formData = new FormData(event.target);
        const productData = {
            name: formData.get('productName') || document.getElementById('newProductName')?.value?.trim() || '',
            brand: formData.get('productBrand') || document.getElementById('newProductBrand')?.value?.trim() || '',
            price: parseFloat(formData.get('productPrice') || document.getElementById('newProductPrice')?.value || '0'),
            category: formData.get('productCategory') || document.getElementById('newProductCategory')?.value || '',
            description: formData.get('productDescription') || document.getElementById('newProductDescription')?.value?.trim() || '',
            images: [getSafeImageUrl(formData.get('productImageUrl') || document.getElementById('newProductImageUrl')?.value?.trim(), formData.get('productCategory') || document.getElementById('newProductCategory')?.value)],
            stock_quantity: parseInt(formData.get('productStock') || document.getElementById('newProductStock')?.value || '0'),
            discount: parseInt(formData.get('productDiscount') || document.getElementById('newProductDiscount')?.value || '0')
        };
        
        console.log('FormData로 수집된 상품 데이터:', productData);
        
        // 유효성 검사
        if (!productData.name || !productData.brand || !productData.price || !productData.category) {
            alert('필수 항목(상품명, 브랜드, 가격, 카테고리)을 모두 입력해주세요.');
            return;
        }
        
        if (productData.price <= 0) {
            alert('가격은 0보다 커야 합니다.');
            return;
        }
        
        if (productData.stock_quantity < 0) {
            alert('재고 수량은 0 이상이어야 합니다.');
            return;
        }
        
        console.log('유효성 검사 통과');
        
        // Supabase 연결 확인
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 없습니다');
        }
        
        // Supabase에 상품 등록
        const { data, error } = await window.supabase
            .from('products')
            .insert([productData])
            .select();
        
        if (error) {
            throw error;
        }
        
        console.log('상품 등록 성공:', data);
        alert('상품이 성공적으로 등록되었습니다!');
        
        // 폼 초기화
        clearProductForm();
        
        // 상품 목록 새로고침
        await refreshProductList();
        await loadProducts();
        
        console.log('=== 상품 등록 완료 ===');
        
    } catch (error) {
        console.error('상품 등록 실패:', error);
        alert('상품 등록에 실패했습니다: ' + error.message);
    }
}

// 상품 폼 초기화 (새로운 폼용)
function resetProductForm() {
    const form = document.getElementById('productRegistrationForm');
    if (form) {
        form.reset();
        
        // 이미지 미리보기 초기화
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.innerHTML = '';
        }
        
        // URL 입력 방식으로 초기화
        const urlSection = document.getElementById('imageUrlSection');
        const fileSection = document.getElementById('imageFileSection');
        if (urlSection && fileSection) {
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';
        }
        
        // 라디오 버튼 초기화
        const urlRadio = document.querySelector('input[name="imageMethod"][value="url"]');
        if (urlRadio) {
            urlRadio.checked = true;
        }
        
        console.log('상품 등록 폼 초기화 완료');
    } else {
        console.warn('상품 등록 폼을 찾을 수 없습니다');
    }
}

// 기존 함수명 호환성을 위한 별칭
function clearProductForm() {
    console.log('clearProductForm 호출됨 - resetProductForm으로 리다이렉트');
    resetProductForm();
}

// 상품 목록 새로고침 (관리자용)
async function refreshProductList() {
    if (!checkAdminPermission()) return;
    
    try {
        console.log('관리자 상품 목록 새로고침 시작');
        
        const { data: products, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        displayAdminProductList(products || []);
        console.log('관리자 상품 목록 새로고침 완료:', products?.length || 0, '개');
        
    } catch (error) {
        console.error('상품 목록 새로고침 실패:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

// 관리자 상품 목록 표시
function displayAdminProductList(products) {
    const container = document.getElementById('adminProductList');
    if (!container) {
        console.error('adminProductList 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>등록된 상품이 없습니다</h3>
                <p>새 상품을 등록해보세요.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&auto=format'}" 
                 alt="${product.name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&auto=format'; this.onerror=null;">
            <div class="admin-product-info">
                <div class="admin-product-title">${product.name}</div>
                <div class="admin-product-details">
                    <strong>브랜드:</strong> ${product.brand || '미지정'} | 
                    <strong>카테고리:</strong> ${product.category || '미지정'} | 
                    <strong>가격:</strong> ${product.price?.toLocaleString() || 0}원
                    ${product.discount > 0 ? ` (${product.discount}% 할인)` : ''}
                </div>
                <div class="admin-product-details">
                    <strong>재고:</strong> ${product.stock_quantity || 0}개 | 
                    <strong>등록일:</strong> ${new Date(product.created_at).toLocaleDateString()}
                </div>
            </div>
            <div class="admin-product-actions">
                <button onclick="editProduct('${product.id}')" class="btn btn-secondary btn-sm">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button onclick="deleteProduct('${product.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 관리자용 상품 목록 로드
async function loadAdminProducts() {
    if (!checkAdminPermission()) return;
    
    try {
        console.log('관리자 상품 목록 로드 시작');
        
        const { data: products, error } = await window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('상품 목록 로드 오류:', error);
            alert('상품 목록을 불러오는데 실패했습니다.');
            return;
        }
        
        displayAdminProducts(products || []);
        console.log('관리자 상품 목록 로드 완료:', products?.length || 0, '개');
        
    } catch (error) {
        console.error('상품 목록 로드 실패:', error);
        alert('상품 목록을 불러오는데 실패했습니다.');
    }
}

// 관리자용 상품 목록 표시
function displayAdminProducts(products) {
    const container = document.getElementById('adminProductList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>등록된 상품이 없습니다</h3>
                <p>새 상품을 등록해보세요.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <img src="${product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&auto=format'}" 
                 alt="${product.name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop&auto=format'; this.onerror=null;">
            <div class="admin-product-info">
                <div class="admin-product-title">${product.name}</div>
                <div class="admin-product-details">
                    <strong>브랜드:</strong> ${product.brand || '미지정'} | 
                    <strong>카테고리:</strong> ${product.category || '미지정'} | 
                    <strong>가격:</strong> ${product.price?.toLocaleString() || 0}원
                    ${product.discount > 0 ? ` (${product.discount}% 할인)` : ''}
                </div>
                <div class="admin-product-details">
                    <strong>재고:</strong> ${product.stock_quantity || 0}개 | 
                    <strong>등록일:</strong> ${new Date(product.created_at).toLocaleDateString()}
                </div>
            </div>
            <div class="admin-product-actions">
                <button onclick="editProduct('${product.id}')" class="btn btn-secondary btn-sm">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button onclick="deleteAdminProduct('${product.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
}

// 관리자용 상품 삭제
async function deleteAdminProduct(productId) {
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await window.supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) {
            console.error('상품 삭제 오류:', error);
            alert('상품 삭제에 실패했습니다.');
            return;
        }
        
        alert('상품이 삭제되었습니다.');
        loadAdminProducts(); // 목록 새로고침
        
    } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
    }
}

// 관리자용 주문 목록 로드
async function loadAdminOrders() {
    if (!checkAdminPermission()) return;
    
    try {
        console.log('관리자 주문 목록 로드 시작');
        
        const { data: orders, error } = await window.supabase
            .from('orders')
            .select(`
                *,
                users (name, email),
                order_items (
                    *,
                    products (name, price)
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('주문 목록 로드 오류:', error);
            alert('주문 목록을 불러오는데 실패했습니다.');
            return;
        }
        
        displayAdminOrders(orders || []);
        console.log('관리자 주문 목록 로드 완료:', orders?.length || 0, '개');
        
    } catch (error) {
        console.error('주문 목록 로드 실패:', error);
        alert('주문 목록을 불러오는데 실패했습니다.');
    }
}

// 관리자용 주문 목록 표시
function displayAdminOrders(orders) {
    const container = document.getElementById('adminOrderList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>주문 내역이 없습니다</h3>
                <p>고객이 주문을 하면 여기에 표시됩니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="admin-order-item">
            <div class="order-header">
                <div class="order-id">주문 #${order.id.substring(0, 8)}</div>
                <div class="order-status ${order.status || 'pending'}">${order.status || '주문접수'}</div>
            </div>
            <div class="order-details">
                <div>
                    <strong>고객:</strong> ${order.users?.name || '알 수 없음'} (${order.users?.email || '알 수 없음'})<br>
                    <strong>주문일:</strong> ${new Date(order.created_at).toLocaleString()}<br>
                    <strong>총 금액:</strong> ${order.total_amount?.toLocaleString() || 0}원
                </div>
                <div>
                    <strong>배송지:</strong> ${order.shipping_address || '미입력'}<br>
                    <strong>연락처:</strong> ${order.phone || '미입력'}<br>
                    <strong>요청사항:</strong> ${order.notes || '없음'}
                </div>
            </div>
            <div class="order-actions">
                <button onclick="updateOrderStatus('${order.id}', '처리중')" class="btn btn-warning btn-sm">
                    <i class="fas fa-cog"></i> 처리중
                </button>
                <button onclick="updateOrderStatus('${order.id}', '배송중')" class="btn btn-info btn-sm">
                    <i class="fas fa-truck"></i> 배송중
                </button>
                <button onclick="updateOrderStatus('${order.id}', '완료')" class="btn btn-success btn-sm">
                    <i class="fas fa-check"></i> 완료
                </button>
            </div>
        </div>
    `).join('');
}

// 주문 상태 업데이트
async function updateOrderStatus(orderId, newStatus) {
    if (!checkAdminPermission()) return;
    
    try {
        const { error } = await window.supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (error) {
            console.error('주문 상태 업데이트 오류:', error);
            alert('주문 상태 업데이트에 실패했습니다.');
            return;
        }
        
        alert(`주문 상태가 "${newStatus}"로 변경되었습니다.`);
        loadAdminOrders(); // 목록 새로고침
        
    } catch (error) {
        console.error('주문 상태 업데이트 실패:', error);
        alert('주문 상태 업데이트에 실패했습니다.');
    }
}

// 사용자 목록 로드 (기존 함수들)
async function loadPendingUsers() {
    if (!checkAdminPermission()) return;
    console.log('대기중인 사용자 목록 로드');
    // 기존 사용자 관리 로직
}

async function loadAllUsers() {
    if (!checkAdminPermission()) return;
    console.log('전체 사용자 목록 로드');
    // 기존 사용자 관리 로직
}

// 사용자 목록 표시 함수
function loadUsersList() {
    if (!checkAdminPermission()) return;
    console.log('사용자 목록 표시');
    // 사용자 목록 표시 로직
}

// 폼 이벤트 리스너 등록 (즉시 실행)
function setupProductFormListener() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        // 기존 이벤트 리스너 제거 후 새로 등록
        addProductForm.removeEventListener('submit', handleProductFormSubmit);
        addProductForm.addEventListener('submit', handleProductFormSubmit);
        console.log('상품 등록 폼 이벤트 리스너 등록 완료');
        
        // 입력 필드 이벤트 리스너 추가
        setupInputFieldListeners();
    } else {
        console.warn('상품 등록 폼을 찾을 수 없습니다');
    }
}

// 입력 필드 이벤트 리스너 설정
function setupInputFieldListeners() {
    const form = document.getElementById('addProductForm');
    if (!form) return;
    
    // 모든 입력 필드에 이벤트 리스너 추가
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // 기존 이벤트 리스너 제거
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('blur', handleInputBlur);
        input.removeEventListener('input', handleInputChange);
        
        // 새 이벤트 리스너 추가
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        input.addEventListener('input', handleInputChange);
    });
    
    console.log('입력 필드 이벤트 리스너 설정 완료');
}

// 입력 필드 포커스 처리
function handleInputFocus(event) {
    const input = event.target;
    console.log('필드 포커스:', input.id);
    
    // 스타일 강제 적용
    input.style.backgroundColor = 'white';
    input.style.color = '#333';
    input.style.borderColor = '#007bff';
    
    // readonly나 disabled 속성 제거
    if (input.hasAttribute('readonly')) {
        input.removeAttribute('readonly');
    }
    if (input.hasAttribute('disabled')) {
        input.removeAttribute('disabled');
    }
}

// 입력 필드 블러 처리
function handleInputBlur(event) {
    const input = event.target;
    console.log('필드 블러:', input.id, '값:', input.value);
    
    // 기본 스타일 유지
    input.style.backgroundColor = 'white';
    input.style.color = '#333';
    input.style.borderColor = '#ddd';
}

// 입력 필드 값 변경 처리
function handleInputChange(event) {
    const input = event.target;
    console.log('입력 값 변경:', input.id, '값:', input.value);
    
    // 스타일 강제 적용
    input.style.backgroundColor = 'white';
    input.style.color = '#333';
}

// DOM 로드 시 실행
document.addEventListener('DOMContentLoaded', setupProductFormListener);

// 관리자 패널이 열릴 때마다 실행
function showAdminPanel() {
    if (!checkAdminPermission()) return;
    
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'block';
        showAdminTab('users'); // 기본 탭
        
        // 폼 이벤트 리스너 재등록
        setTimeout(setupProductFormListener, 100);
    }
}

// 전역 함수로 등록
window.showAdminTab = showAdminTab;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.closeProductModal = closeProductModal;
window.addImageUrlInput = addImageUrlInput;
window.removeImagePreview = removeImagePreview;
window.loadAdminProducts = loadAdminProducts;
window.loadAdminOrders = loadAdminOrders;
window.deleteAdminProduct = deleteAdminProduct;
window.updateOrderStatus = updateOrderStatus;
window.clearProductForm = clearProductForm;
window.loadPendingUsers = loadPendingUsers;
window.loadAllUsers = loadAllUsers;
window.loadUsersList = loadUsersList;
window.resetProductForm = resetProductForm;
window.refreshProductList = refreshProductList;
window.handleProductRegistration = handleProductRegistration;
window.clearProductForm = clearProductForm;
window.handleProductFormSubmit = handleProductFormSubmit;
window.setImageFallback = setImageFallback;
window.getCategoryImageUrl = getCategoryImageUrl;
window.getSafeImageUrl = getSafeImageUrl;
window.updateProduct = updateProduct;
window.uploadImageFiles = uploadImageFiles;
window.collectImageUrls = collectImageUrls;
window.setupImageUploadOptions = setupImageUploadOptions;

// 주문내역 관련 전역 함수 등록
window.showOrderHistory = showOrderHistory;
window.loadUserOrderHistory = loadUserOrderHistory;
window.displayOrderHistory = displayOrderHistory;
window.closeOrderHistory = closeOrderHistory;
window.viewOrderDetail = viewOrderDetail;
window.cancelOrder = cancelOrder;
window.filterOrders = filterOrders;
window.resetOrderFilters = resetOrderFilters;

// 로그인 관련 전역 함수 등록
window.toggleLogin = toggleLogin;
window.showUserInfo = showUserInfo;

// 사이트 설정 관련 전역 함수 등록
window.loadSiteSettings = loadSiteSettings;
window.saveSetting = saveSetting;
window.saveCustomerServiceSettings = saveCustomerServiceSettings;
window.saveCompanyInfoSettings = saveCompanyInfoSettings;
window.updateFooterContent = updateFooterContent;
window.resetSiteSettings = resetSiteSettings;

// 디버깅 함수들
window.debugSiteSettings = debugSiteSettings;
window.testSiteSettings = testSiteSettings;

// ==================== 사이트 설정 기능 ====================

// 사이트 설정 폼 이벤트 리스너 등록 (새로운 site-settings.js에서 처리됨)
/*
document.addEventListener('DOMContentLoaded', function() {
    // 고객센터 정보 폼 이벤트 리스너
    const customerServiceForm = document.getElementById('customerServiceForm');
    if (customerServiceForm) {
        customerServiceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            await saveCustomerServiceSettings(formData);
        });
    }

    // 회사 정보 폼 이벤트 리스너
    const companyInfoForm = document.getElementById('companyInfoForm');
    if (companyInfoForm) {
        companyInfoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            await saveCompanyInfoSettings(formData);
        });
    }
});
*/

// 사이트 설정 로드
async function loadSiteSettings() {
    console.log('사이트 설정 로드 시작');
    
    if (!window.supabase) {
        console.error('Supabase 클라이언트가 없습니다');
        return;
    }
    
    try {
        const { data: settings, error } = await window.supabase
            .from('site_settings')
            .select('*');
        
        if (error) {
            console.error('사이트 설정 로드 실패:', error);
            return;
        }
        
        console.log('로드된 설정:', settings);
        
        // 폼 필드에 값 설정
        if (settings) {
            settings.forEach(setting => {
                const element = document.getElementById(setting.setting_key);
                if (element) {
                    element.value = setting.setting_value;
                    console.log(`설정 적용: ${setting.setting_key} = ${setting.setting_value}`);
                }
            });
        }
        
        // 푸터 내용 업데이트
        updateFooterContent();
        
    } catch (error) {
        console.error('사이트 설정 로드 중 오류:', error);
    }
}

// 설정 저장 (안전한 방식)
async function saveSetting(key, value) {
    console.log(`설정 저장: ${key} = ${value}`);
    
    if (!window.supabase) {
        console.error('Supabase 클라이언트가 없습니다');
        return false;
    }
    
    try {
        // 1. 먼저 기존 데이터 확인
        const { data: existing, error: selectError } = await window.supabase
            .from('site_settings')
            .select('id, setting_key, setting_value')
            .eq('setting_key', key)
            .single();
        
        if (selectError && selectError.code !== 'PGRST116') {
            console.error('기존 데이터 조회 실패:', selectError);
            return false;
        }
        
        if (existing) {
            // 2. 기존 데이터가 있으면 업데이트
            console.log('기존 설정 업데이트:', key);
            const { error: updateError } = await window.supabase
                .from('site_settings')
                .update({ 
                    setting_value: value,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', key);
            
            if (updateError) {
                console.error('설정 업데이트 실패:', updateError);
                return false;
            }
        } else {
            // 3. 기존 데이터가 없으면 새로 삽입
            console.log('새 설정 삽입:', key);
            const { error: insertError } = await window.supabase
                .from('site_settings')
                .insert({ 
                    setting_key: key, 
                    setting_value: value,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            
            if (insertError) {
                console.error('설정 삽입 실패:', insertError);
                return false;
            }
        }
        
        console.log('설정 저장 성공:', key);
        return true;
        
    } catch (error) {
        console.error('설정 저장 중 오류:', error);
        return false;
    }
}

// 고객센터 정보 저장
async function saveCustomerServiceSettings(formData) {
    console.log('고객센터 정보 저장 시작');
    
    const settings = [
        { key: 'customer_phone', value: formData.get('customer_phone') },
        { key: 'customer_email', value: formData.get('customer_email') },
        { key: 'faq_link', value: formData.get('faq_link') },
        { key: 'inquiry_link', value: formData.get('inquiry_link') }
    ];
    
    let successCount = 0;
    let errorMessages = [];
    
    for (const setting of settings) {
        if (setting.value && setting.value.trim()) {
            try {
                const success = await saveSetting(setting.key, setting.value.trim());
                if (success) {
                    successCount++;
                    console.log(`✅ ${setting.key} 저장 성공`);
                } else {
                    errorMessages.push(`${setting.key} 저장 실패`);
                    console.error(`❌ ${setting.key} 저장 실패`);
                }
            } catch (error) {
                errorMessages.push(`${setting.key} 저장 중 오류: ${error.message}`);
                console.error(`❌ ${setting.key} 저장 중 오류:`, error);
            }
        }
    }
    
    if (successCount > 0) {
        if (errorMessages.length > 0) {
            alert(`고객센터 정보가 부분적으로 저장되었습니다.\n\n성공: ${successCount}개\n실패: ${errorMessages.join(', ')}`);
        } else {
            alert('고객센터 정보가 성공적으로 저장되었습니다!');
        }
        updateFooterContent();
    } else {
        alert(`저장에 실패했습니다.\n\n오류: ${errorMessages.join(', ')}`);
    }
}

// 회사 정보 저장
async function saveCompanyInfoSettings(formData) {
    console.log('회사 정보 저장 시작');
    
    const settings = [
        { key: 'company_name', value: formData.get('company_name') },
        { key: 'company_ceo', value: formData.get('company_ceo') },
        { key: 'company_address', value: formData.get('company_address') },
        { key: 'telecom_license', value: formData.get('telecom_license') },
        { key: 'business_number', value: formData.get('business_number') },
        { key: 'company_website', value: formData.get('company_website') },
        { key: 'company_description', value: formData.get('company_description') }
    ];
    
    let successCount = 0;
    let errorMessages = [];
    
    for (const setting of settings) {
        if (setting.value && setting.value.trim()) {
            try {
                const success = await saveSetting(setting.key, setting.value.trim());
                if (success) {
                    successCount++;
                    console.log(`✅ ${setting.key} 저장 성공`);
                } else {
                    errorMessages.push(`${setting.key} 저장 실패`);
                    console.error(`❌ ${setting.key} 저장 실패`);
                }
            } catch (error) {
                errorMessages.push(`${setting.key} 저장 중 오류: ${error.message}`);
                console.error(`❌ ${setting.key} 저장 중 오류:`, error);
            }
        }
    }
    
    if (successCount > 0) {
        if (errorMessages.length > 0) {
            alert(`회사 정보가 부분적으로 저장되었습니다.\n\n성공: ${successCount}개\n실패: ${errorMessages.join(', ')}`);
        } else {
            alert('회사 정보가 성공적으로 저장되었습니다!');
        }
        updateFooterContent();
    } else {
        alert(`저장에 실패했습니다.\n\n오류: ${errorMessages.join(', ')}`);
    }
}

// 푸터 내용 실시간 업데이트
function updateFooterContent() {
    console.log('푸터 내용 업데이트 시작');
    
    // 고객센터 정보 업데이트
    const customerPhone = document.getElementById('customerPhone')?.value;
    const customerEmail = document.getElementById('customerEmail')?.value;
    const faqLink = document.getElementById('faqLink')?.value;
    const inquiryLink = document.getElementById('inquiryLink')?.value;
    
    if (customerPhone) {
        const phoneElement = document.querySelector('.footer-phone');
        if (phoneElement) {
            phoneElement.textContent = customerPhone;
            phoneElement.href = `tel:${customerPhone}`;
        }
    }
    
    if (customerEmail) {
        const emailElement = document.querySelector('.footer-email');
        if (emailElement) {
            emailElement.textContent = customerEmail;
            emailElement.href = `mailto:${customerEmail}`;
        }
    }
    
    if (faqLink) {
        const faqElement = document.querySelector('.footer-faq');
        if (faqElement) {
            faqElement.href = faqLink;
        }
    }
    
    if (inquiryLink) {
        const inquiryElement = document.querySelector('.footer-inquiry');
        if (inquiryElement) {
            inquiryElement.href = inquiryLink;
        }
    }
    
    // 회사 정보 업데이트
    const companyName = document.getElementById('companyName')?.value;
    const companyAddress = document.getElementById('companyAddress')?.value;
    const businessNumber = document.getElementById('businessNumber')?.value;
    
    if (companyName) {
        const nameElement = document.querySelector('.footer-company-name');
        if (nameElement) {
            nameElement.textContent = companyName;
        }
    }
    
    if (companyAddress) {
        const addressElement = document.querySelector('.footer-company-address');
        if (addressElement) {
            addressElement.textContent = companyAddress;
        }
    }
    
    if (businessNumber) {
        const businessElement = document.querySelector('.footer-business-number');
        if (businessElement) {
            businessElement.textContent = `사업자등록번호: ${businessNumber}`;
        }
    }
    
    console.log('푸터 내용 업데이트 완료');
}

// 설정 초기화
async function resetSiteSettings() {
    if (!confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
        return;
    }
    
    console.log('설정 초기화 시작');
    
    const defaultSettings = [
        { key: 'customer_phone', value: '1588-0000' },
        { key: 'customer_email', value: 'help@modernshop.com' },
        { key: 'faq_link', value: '/faq' },
        { key: 'inquiry_link', value: '/inquiry' },
        { key: 'company_name', value: 'ModernShop' },
        { key: 'company_ceo', value: '홍길동' },
        { key: 'company_address', value: '서울특별시 강남구 테헤란로 123, 10층' },
        { key: 'telecom_license', value: '2024-서울강남-01234' },
        { key: 'business_number', value: '123-45-67890' },
        { key: 'company_website', value: 'https://modernshop.com' },
        { key: 'company_description', value: '프리미엄 온라인 쇼핑몰' }
    ];
    
    let successCount = 0;
    let errorMessages = [];
    
    for (const setting of defaultSettings) {
        try {
            const success = await saveSetting(setting.key, setting.value);
            if (success) {
                successCount++;
                console.log(`✅ ${setting.key} 초기화 성공`);
            } else {
                errorMessages.push(`${setting.key} 초기화 실패`);
                console.error(`❌ ${setting.key} 초기화 실패`);
            }
        } catch (error) {
            errorMessages.push(`${setting.key} 초기화 중 오류: ${error.message}`);
            console.error(`❌ ${setting.key} 초기화 중 오류:`, error);
        }
    }
    
    if (successCount > 0) {
        if (errorMessages.length > 0) {
            alert(`설정이 부분적으로 초기화되었습니다.\n\n성공: ${successCount}개\n실패: ${errorMessages.join(', ')}`);
        } else {
            alert('설정이 성공적으로 기본값으로 초기화되었습니다!');
        }
        await loadSiteSettings();
    } else {
        alert(`초기화에 실패했습니다.\n\n오류: ${errorMessages.join(', ')}`);
    }
}

// 디버깅 함수들
async function debugSiteSettings() {
    console.log('=== 사이트 설정 디버깅 ===');
    
    if (!window.supabase) {
        console.error('❌ Supabase 클라이언트가 없습니다');
        return;
    }
    
    try {
        // 1. 테이블 존재 확인
        const { data: tables, error: tableError } = await window.supabase
            .from('site_settings')
            .select('*')
            .limit(1);
        
        if (tableError) {
            console.error('❌ site_settings 테이블 접근 실패:', tableError);
            return;
        }
        
        console.log('✅ site_settings 테이블 접근 성공');
        
        // 2. 모든 설정 조회
        const { data: settings, error: selectError } = await window.supabase
            .from('site_settings')
            .select('*')
            .order('setting_key');
        
        if (selectError) {
            console.error('❌ 설정 조회 실패:', selectError);
            return;
        }
        
        console.log('📋 현재 설정들:', settings);
        
        // 3. 폼 필드 상태 확인
        const formFields = [
            'customerPhone', 'customerEmail', 'faqLink', 'inquiryLink',
            'companyName', 'companyCeo', 'companyAddress', 'telecomLicense',
            'businessNumber', 'companyWebsite', 'companyDescription'
        ];
        
        console.log('📝 폼 필드 상태:');
        formFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                console.log(`  ${fieldId}: "${element.value}"`);
            } else {
                console.warn(`  ${fieldId}: 요소를 찾을 수 없음`);
            }
        });
        
    } catch (error) {
        console.error('❌ 디버깅 중 오류:', error);
    }
}

async function testSiteSettings() {
    console.log('=== 사이트 설정 테스트 ===');
    
    try {
        // 테스트 설정 저장
        const testKey = 'test_setting';
        const testValue = `test_${Date.now()}`;
        
        console.log(`테스트 설정 저장: ${testKey} = ${testValue}`);
        const success = await saveSetting(testKey, testValue);
        
        if (success) {
            console.log('✅ 테스트 설정 저장 성공');
            
            // 테스트 설정 조회
            const { data: settings, error } = await window.supabase
                .from('site_settings')
                .select('*')
                .eq('setting_key', testKey);
            
            if (error) {
                console.error('❌ 테스트 설정 조회 실패:', error);
            } else {
                console.log('✅ 테스트 설정 조회 성공:', settings);
            }
            
            // 테스트 설정 삭제
            const { error: deleteError } = await window.supabase
                .from('site_settings')
                .delete()
                .eq('setting_key', testKey);
            
            if (deleteError) {
                console.error('❌ 테스트 설정 삭제 실패:', deleteError);
            } else {
                console.log('✅ 테스트 설정 삭제 성공');
            }
            
        } else {
            console.error('❌ 테스트 설정 저장 실패');
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
    }
}

// 주문 관련 디버깅 함수들
window.debugOrderTables = async function() {
    console.log('=== 주문 테이블 디버깅 ===');
    
    if (!window.supabase) {
        console.error('Supabase 클라이언트가 없습니다');
        return;
    }
    
    try {
        // orders 테이블 확인
        const { data: orders, error: ordersError } = await window.supabase
            .from('orders')
            .select('*')
            .limit(5);
        
        if (ordersError) {
            console.error('orders 테이블 조회 실패:', ordersError);
        } else {
            console.log('orders 테이블 데이터:', orders);
        }
        
        // order_items 테이블 확인
        const { data: orderItems, error: itemsError } = await window.supabase
            .from('order_items')
            .select(`
                *,
                products (name, brand, price, images)
            `)
            .limit(5);
        
        if (itemsError) {
            console.error('order_items 테이블 조회 실패:', itemsError);
        } else {
            console.log('order_items 테이블 데이터:', orderItems);
        }
        
        // 현재 사용자 주문 확인
        if (currentUser) {
            const { data: userOrders, error: userOrdersError } = await window.supabase
                .from('orders')
                .select(`
                    *,
                    users!orders_user_id_fkey (name, email),
                    order_items (
                        *,
                        products (name, brand, price)
                    )
                `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (userOrdersError) {
                console.error('사용자 주문 조회 실패:', userOrdersError);
            } else {
                console.log('현재 사용자 주문:', userOrders);
            }
        }
        
    } catch (error) {
        console.error('디버깅 중 오류:', error);
    }
};

window.testCheckout = async function() {
    console.log('=== 주문 테스트 ===');
    
    if (!currentUser) {
        console.error('로그인이 필요합니다');
        return;
    }
    
    if (cart.length === 0) {
        console.error('장바구니가 비어있습니다');
        return;
    }
    
    console.log('현재 장바구니:', cart);
    console.log('현재 사용자:', currentUser);
    
    // 실제 주문 실행
    await checkout();
};

// 디버깅용 함수들
window.debugProductForm = function() {
    console.log('=== 상품 등록 폼 디버깅 ===');
    
    // 새로운 상품 등록 폼 확인
    const productForm = document.getElementById('productRegistrationForm');
    console.log('상품 등록 폼:', productForm);
    
    if (productForm) {
        console.log('폼 이벤트 리스너 확인 중...');
        const listeners = getEventListeners ? getEventListeners(productForm) : 'getEventListeners 함수 없음';
        console.log('폼 이벤트 리스너:', listeners);
        
        // 입력 필드 상태 확인
        const inputs = productForm.querySelectorAll('input, textarea, select');
        console.log('폼 내 입력 필드:', inputs.length, '개');
        inputs.forEach(input => {
            console.log(`필드 ${input.id}:`, {
                value: input.value,
                disabled: input.disabled,
                readonly: input.readOnly,
                backgroundColor: input.style.backgroundColor,
                color: input.style.color,
                type: input.type
            });
        });
        
        console.log('상품 등록 폼이 정상적으로 설정되었습니다.');
    } else {
        console.error('상품 등록 폼을 찾을 수 없습니다!');
        console.log('사용 가능한 폼들:', Array.from(document.querySelectorAll('form')).map(f => f.id));
    }
};

window.testProductRegistration = function() {
    console.log('=== 상품 등록 테스트 ===');
    
    // 관리자 패널이 열려있는지 확인
    const adminModal = document.getElementById('adminModal');
    if (!adminModal || adminModal.style.display === 'none') {
        console.log('관리자 패널을 먼저 열어주세요.');
        alert('관리자 패널을 먼저 열어주세요.');
        return;
    }
    
    // 상품 관리 탭으로 전환
    showAdminTab('products');
    
    // 테스트 데이터로 폼 채우기
    const testData = {
        newProductName: '테스트 상품',
        newProductBrand: '테스트 브랜드',
        newProductPrice: '10000',
        newProductCategory: '패션',
        newProductDescription: '테스트 상품 설명',
        newProductImageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
        newProductStock: '10',
        newProductDiscount: '0'
    };
    
    let successCount = 0;
    Object.keys(testData).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = testData[id];
            element.style.backgroundColor = 'white';
            element.style.color = '#333';
            console.log(`${id} 필드에 값 설정:`, testData[id]);
            successCount++;
        } else {
            console.warn(`${id} 필드를 찾을 수 없습니다`);
        }
    });
    
    console.log(`테스트 데이터 입력 완료: ${successCount}/${Object.keys(testData).length} 필드 성공`);
    
    // 폼 제출 시뮬레이션
    const form = document.getElementById('productRegistrationForm');
    if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        console.log('폼 제출 이벤트 발생');
    } else {
        console.error('productRegistrationForm을 찾을 수 없습니다');
    }
};

// 함수 존재 여부 확인 함수
window.checkProductFunctions = function() {
    console.log('=== 상품 등록 함수 확인 ===');
    console.log('clearProductForm:', typeof clearProductForm);
    console.log('handleProductFormSubmit:', typeof handleProductFormSubmit);
    console.log('handleProductRegistration:', typeof handleProductRegistration);
    console.log('resetProductForm:', typeof resetProductForm);
    console.log('refreshProductList:', typeof refreshProductList);
    console.log('setImageFallback:', typeof setImageFallback);
    console.log('getCategoryImageUrl:', typeof getCategoryImageUrl);
    console.log('getSafeImageUrl:', typeof getSafeImageUrl);
    console.log('updateProduct:', typeof updateProduct);
    console.log('saveProduct:', typeof saveProduct);
    
    const form = document.getElementById('productRegistrationForm');
    console.log('productRegistrationForm 요소:', form);
    
    if (form) {
        console.log('폼 이벤트 리스너 확인 중...');
        const listeners = getEventListeners ? getEventListeners(form) : 'getEventListeners 함수 없음';
        console.log('폼 이벤트 리스너:', listeners);
    }
};

// 이미지 URL 검증 및 수정 함수
window.validateAndFixImages = async function() {
    console.log('=== 이미지 URL 검증 및 수정 시작 ===');
    
    try {
        const { data: products, error } = await window.supabase
            .from('products')
            .select('id, name, category, images');
        
        if (error) throw error;
        
        console.log('검증할 상품 수:', products.length);
        
        let fixedCount = 0;
        for (const product of products) {
            if (!product.images || product.images.length === 0) {
                console.log(`상품 "${product.name}" - 이미지 없음, 기본 이미지 설정`);
                const safeImage = getCategoryImageUrl(product.category);
                
                const { error: updateError } = await window.supabase
                    .from('products')
                    .update({ images: [safeImage] })
                    .eq('id', product.id);
                
                if (!updateError) {
                    fixedCount++;
                    console.log(`✅ 상품 "${product.name}" 이미지 수정 완료`);
                }
            } else {
                const firstImage = product.images[0];
                const safeImage = getSafeImageUrl(firstImage, product.category);
                
                if (firstImage !== safeImage) {
                    console.log(`상품 "${product.name}" - 잘못된 URL 감지:`, firstImage, '→', safeImage);
                    
                    const { error: updateError } = await window.supabase
                        .from('products')
                        .update({ images: [safeImage] })
                        .eq('id', product.id);
                    
                    if (!updateError) {
                        fixedCount++;
                        console.log(`✅ 상품 "${product.name}" 이미지 수정 완료`);
                    }
                }
            }
        }
        
        console.log(`=== 이미지 수정 완료: ${fixedCount}개 상품 수정됨 ===`);
        alert(`${fixedCount}개 상품의 이미지가 수정되었습니다.`);
        
        // 상품 목록 새로고침
        await loadProducts();
        
    } catch (error) {
        console.error('이미지 검증 중 오류:', error);
        alert('이미지 검증 중 오류가 발생했습니다: ' + error.message);
    }
};

// 장바구니 디버깅 함수
window.debugCart = function() {
    console.log('=== 장바구니 디버깅 ===');
    console.log('현재 사용자:', currentUser);
    console.log('로드된 상품 수:', products.length);
    console.log('상품 목록:', products.map(p => ({ 
        id: p.id, 
        idType: typeof p.id, 
        name: p.name 
    })));
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('장바구니 아이템 수:', cart.length);
    console.log('장바구니 내용:', cart);
    
    if (currentUser) {
        const userCart = cart.filter(item => item.user_id === currentUser.id);
        console.log('현재 사용자 장바구니:', userCart);
    }
    
    // 상품 ID 타입 테스트
    if (products.length > 0) {
        const testId = products[0].id;
        console.log('첫 번째 상품 ID 테스트:', {
            original: testId,
            asString: String(testId),
            asNumber: Number(testId),
            type: typeof testId
        });
    }
};

// 상품 강제 로드 함수
window.forceLoadProducts = async function() {
    console.log('=== 상품 강제 로드 ===');
    await loadProducts();
    console.log('상품 로드 완료:', products.length, '개');
    displayProducts();
};

// 장바구니 테스트 함수
window.testAddToCart = function(productId = null) {
    console.log('=== 장바구니 테스트 ===');
    
    if (!productId && products.length > 0) {
        productId = products[0].id;
        console.log('첫 번째 상품으로 테스트:', productId);
    }
    
    if (!productId) {
        console.error('테스트할 상품 ID가 없습니다.');
        return;
    }
    
    console.log('테스트할 상품 ID:', productId, '타입:', typeof productId);
    addToCart(productId);
};

// 즉시 이미지 수정 실행 함수 (콘솔 오류 해결용)
window.fixImagesNow = async function() {
    console.log('🚀 즉시 이미지 수정 실행 중...');
    
    try {
        // example.com 관련 모든 상품 즉시 수정
        const { data: products, error } = await window.supabase
            .from('products')
            .select('id, name, category, images')
            .or('images.cs.{"example.com"},images.cs.{"hub1.jpg"},images.cs.{"mouse1.jpg"},images.cs.{"stand1.jpg"}');
        
        if (error) {
            console.warn('특정 패턴 검색 실패, 전체 상품 검사로 전환');
            await validateAndFixImages();
            return;
        }
        
        console.log('수정할 상품 수:', products.length);
        
        for (const product of products) {
            const safeImage = getCategoryImageUrl(product.category);
            
            const { error: updateError } = await window.supabase
                .from('products')
                .update({ images: [safeImage] })
                .eq('id', product.id);
            
            if (!updateError) {
                console.log(`✅ "${product.name}" 이미지 수정 완료`);
            }
        }
        
        console.log('🎉 모든 이미지 수정 완료!');
        alert('이미지 수정이 완료되었습니다. 페이지를 새로고침해주세요.');
        
        // 페이지 새로고침
        location.reload();
        
    } catch (error) {
        console.error('이미지 수정 실패:', error);
        alert('이미지 수정에 실패했습니다: ' + error.message);
    }
};

// 입력 필드 강제 수정 함수
window.fixInputFields = function() {
    console.log('=== 입력 필드 강제 수정 ===');
    const form = document.getElementById('addProductForm');
    if (!form) {
        console.error('폼을 찾을 수 없습니다');
        return;
    }
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // 모든 제한 속성 제거
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
        
        // 스타일 강제 적용
        input.style.backgroundColor = 'white !important';
        input.style.color = '#333 !important';
        input.style.border = '1px solid #ddd';
        
        console.log(`${input.id} 필드 수정 완료`);
    });
    
    console.log('모든 입력 필드 수정 완료');
};

// Supabase 컬럼명 확인 함수
window.checkSupabaseColumns = function() {
    console.log('=== Supabase 컬럼명 확인 ===');
    
    // 예상되는 컬럼명들
    const expectedColumns = {
        'id': 'UUID (Primary Key)',
        'name': 'VARCHAR(255) - 상품명',
        'brand': 'VARCHAR(100) - 브랜드명',
        'price': 'DECIMAL(10,2) - 가격',
        'description': 'TEXT - 상품 설명',
        'category': 'VARCHAR(50) - 카테고리',
        'images': 'ARRAY - 이미지 URL 배열',
        'stock_quantity': 'INTEGER - 재고 수량',
        'discount': 'INTEGER - 할인율',
        'created_at': 'TIMESTAMP - 생성일',
        'updated_at': 'TIMESTAMP - 수정일'
    };
    
    console.log('예상되는 products 테이블 컬럼 구조:');
    Object.keys(expectedColumns).forEach(column => {
        console.log(`- ${column}: ${expectedColumns[column]}`);
    });
    
    console.log('\n중요: images는 ARRAY 타입입니다.');
    console.log('JavaScript에서 사용할 때: product.images[0] (첫 번째 이미지)');
    
    return expectedColumns;
};


// 사용자 주문내역 표시 (기존 함수 - 새로운 showOrderHistory로 대체됨)
function showUserOrders() {
    console.log('showUserOrders 호출됨 - showOrderHistory로 리다이렉트');
    showOrderHistory();
}

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const userIcon = document.querySelector('.user-icon');
    const dropdown = document.getElementById('userDropdown');
    
    if (userIcon && dropdown && !userIcon.contains(event.target)) {
        dropdown.style.display = 'none';
        console.log('드롭다운 외부 클릭으로 닫기');
    }
});

// 현재 사용자 확인 (Supabase 직접 호출 - 개선된 버전)
async function checkCurrentUser() {
    if (!checkSupabase()) {
        console.warn('Supabase 연결 실패, 사용자 확인 건너뜀');
        currentUser = null;
        updateHeaderButtons();
        return;
    }
    
    try {
        debugLog('현재 사용자 확인 시작');
        
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        debugLog('Auth 사용자 확인 결과:', { user, error });
        
        if (error) {
            console.warn('사용자 인증 확인 실패:', error.message);
            currentUser = null;
            updateHeaderButtons();
            return;
        }
        
        if (user) {
            debugLog('Auth 사용자 발견, users 테이블에서 정보 조회:', { userId: user.id });
            
            // users 테이블에서 추가 정보 가져오기
            const { data: userData, error: userError } = await window.supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            
            debugLog('users 테이블 조회 결과:', { userData, userError });
            
            if (userError) {
                console.warn('users 테이블에서 사용자 정보를 찾을 수 없음:', userError);
                
                // users 테이블에 사용자 정보가 없는 경우 새로 생성
                const { error: insertError } = await window.supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || user.email.split('@')[0],
                        role: 'user',
                        status: 'active'
                    });
                
                if (insertError) {
                    console.error('사용자 정보 생성 실패:', insertError);
                    currentUser = null;
                    updateHeaderButtons();
                    return;
                }
                
                // 새로 생성된 사용자 정보로 설정
                currentUser = {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email.split('@')[0],
                    role: 'user',
                    status: 'active'
                };
            } else {
                // 기존 사용자 정보로 설정
                currentUser = {
                    id: user.id,
                    email: user.email,
                    name: userData.name,
                    role: userData.role || 'user',
                    status: userData.status || 'active'
                };
            }
            
            debugLog('현재 사용자 설정 완료:', currentUser);
            
            // 로그인 모달이 열려있다면 닫기
            const loginModal = document.getElementById('loginModal');
            if (loginModal && loginModal.style.display === 'block') {
                hideLoginModal();
            }
            
            updateHeaderButtons();
            await loadCart();
            updateCartBadge();
        } else {
            debugLog('로그인된 사용자 없음');
            currentUser = null;
            updateHeaderButtons();
        }
    } catch (error) {
        console.error('사용자 확인 오류:', error);
        currentUser = null;
        updateHeaderButtons();
    }
}

// EmailJS 초기화
function initEmailJS() {
    try {
        if (window.emailjs && window.CONFIG?.EMAILJS) {
            const emailConfig = window.CONFIG.EMAILJS;
            // EmailJS 초기화 (PUBLIC_KEY 사용)
            window.emailjs.init(emailConfig.PUBLIC_KEY);
            console.log('EmailJS 초기화 완료');
            console.log('EmailJS 설정:', emailConfig);
            return true;
        } else {
            console.warn('EmailJS 설정이 없습니다.');
            return false;
        }
    } catch (error) {
        console.error('EmailJS 초기화 실패:', error);
        return false;
    }
}

// 앱 초기화
async function initializeApp() {
    console.log('Supabase 쇼핑몰 앱 초기화...');
    
    // Supabase 클라이언트 확인
    if (!checkSupabase()) {
        console.error('Supabase 클라이언트를 찾을 수 없습니다.');
        return;
    }
    
    // EmailJS 초기화
    initEmailJS();
    
    // 상품 로드
    await loadProducts();
    
    // 현재 사용자 확인
    await checkCurrentUser();
    
    // 헤더 버튼 업데이트
    updateHeaderButtons();
    
    console.log('앱 초기화 완료');
}

// 관리자 패널 표시
async function showAdminPanel() {
    if (!checkAdminPermission()) return;
    
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.style.display = 'block';
        // 기본적으로 사용자 관리 탭 표시
        showAdminTab('users');
    }
}

// 관리자 패널 닫기
function closeAdminPanel() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.style.display = 'none';
    }
}

// 관리자 데이터 로드 (Supabase 직접 호출)
async function loadAdminData() {
    if (!checkSupabase()) return;
    
    try {
        // 대기 중인 사용자 로드
        const { data: pendingUsers, error: pendingError } = await window.supabase
            .from('users')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        
        if (pendingError) throw pendingError;
        
        displayPendingUsers(pendingUsers || []);
        
        // 전체 사용자 로드
        const { data: allUsers, error: allUsersError } = await window.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (allUsersError) throw allUsersError;
        
        displayAllUsers(allUsers || []);
        
    } catch (error) {
        console.error('관리자 데이터 로드 실패:', error);
    }
}

// 대기 중인 사용자 표시
function displayPendingUsers(users) {
    const container = document.getElementById('pendingUsersList');
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">대기 중인 사용자가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem;">
            <div class="user-info">
                <h4 style="margin: 0 0 0.5rem 0;">${user.name}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">${user.email}</p>
                <p style="margin: 0; color: #999; font-size: 0.8rem;">가입일: ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div class="user-actions">
                <button onclick="approveUser('${user.id}')" style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">승인</button>
                <button onclick="rejectUser('${user.id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">거부</button>
            </div>
        </div>
    `).join('');
}

// 전체 사용자 표시
function displayAllUsers(users) {
    const container = document.getElementById('allUsersList');
    if (!container) return;
    
    container.innerHTML = users.map(user => `
        <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; margin-bottom: 1rem;">
            <div class="user-info">
                <h4 style="margin: 0 0 0.5rem 0;">${user.name} ${user.role === 'admin' ? '<span style="background: #007bff; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem;">관리자</span>' : ''}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">${user.email}</p>
                <p style="margin: 0; color: #999; font-size: 0.8rem;">
                    상태: <span style="color: ${user.status === 'active' ? '#28a745' : user.status === 'pending' ? '#ffc107' : '#dc3545'}">${user.status === 'active' ? '승인됨' : user.status === 'pending' ? '대기중' : user.status === 'banned' ? '거부됨' : user.status}</span>
                    | 가입일: ${new Date(user.created_at).toLocaleDateString()}
                </p>
            </div>
        </div>
    `).join('');
}

// 사용자 승인 (Supabase 직접 호출)
async function approveUser(userId) {
    if (!checkSupabase()) return;
    
    try {
        const { error } = await window.supabase
            .from('users')
            .update({ status: 'active' })
            .eq('id', userId);
        
        if (error) throw error;
        
        alert('사용자가 승인되었습니다.');
        await loadAdminData();
    } catch (error) {
        console.error('사용자 승인 실패:', error);
        alert('사용자 승인에 실패했습니다.');
    }
}

// 사용자 거부 (Supabase 직접 호출)
async function rejectUser(userId) {
    if (!checkSupabase()) return;
    
    try {
        const { error } = await window.supabase
            .from('users')
            .update({ status: 'banned' })
            .eq('id', userId);
        
        if (error) throw error;
        
        alert('사용자가 거부되었습니다.');
        await loadAdminData();
    } catch (error) {
        console.error('사용자 거부 실패:', error);
        alert('사용자 거부에 실패했습니다.');
    }
}

// 사용자 주문 내역 표시
async function showUserOrders() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    // 주문 내역 모달 표시 로직
    alert('주문 내역 기능은 추후 구현 예정입니다.');
}

// 이메일 발송 함수 (EmailJS) - 고객 이메일로 발송
async function sendOrderEmail(order, customerEmail = null) {
    try {
        console.log('sendOrderEmail 함수 호출됨');
        console.log('주문 데이터:', order);
        console.log('고객 이메일:', customerEmail);
        
        // EmailJS 초기화 확인
        if (!window.emailjs) {
            console.error('window.emailjs가 없습니다.');
            return;
        }
        
        if (!window.CONFIG?.EMAILJS) {
            console.error('window.CONFIG.EMAILJS가 없습니다.');
            return;
        }
        
        const emailConfig = window.CONFIG.EMAILJS;
        console.log('EmailJS 설정:', emailConfig);
        
        // 발송할 이메일 주소 결정
        const toEmail = customerEmail || order.user_email || emailConfig.TO_EMAIL || 'baumliving2025@gmail.com';
        console.log('발송 대상 이메일:', toEmail);
        
        // EmailJS 템플릿 변수 (템플릿에 맞게 설정)
        const isCustomerEmail = toEmail === order.user_email;
        const emailTitle = isCustomerEmail ? '주문이 완료되었습니다!' : '새로운 주문이 접수되었습니다!';
        const emailMessage = isCustomerEmail 
            ? `주문이 완료되었습니다!\n\n주문번호: ${order.order_number}\n고객명: ${order.user_name}\n이메일: ${order.user_email}\n총 금액: ${order.total_amount.toLocaleString()}원\n\n주문 상품:\n${order.items.map(item => `${item.product_name} x ${item.quantity}개 - ${item.price.toLocaleString()}원`).join('\n')}\n\n감사합니다!`
            : `새로운 주문이 접수되었습니다!\n\n주문번호: ${order.order_number}\n고객명: ${order.user_name}\n이메일: ${order.user_email}\n총 금액: ${order.total_amount.toLocaleString()}원\n\n주문 상품:\n${order.items.map(item => `${item.product_name} x ${item.quantity}개 - ${item.price.toLocaleString()}원`).join('\n')}\n\n빠른 처리를 부탁드립니다.`;
        
        // EmailJS 템플릿 변수 (템플릿에 정의된 변수명 사용)
        const templateParams = {
            to_email: toEmail,
            order_number: order.order_number,
            customer_name: order.user_name,
            customer_email: order.user_email,
            total_amount: order.total_amount.toLocaleString(),
            order_time: new Date(order.created_at).toLocaleString('ko-KR'),
            items: order.items.map(item => 
                `${item.product_name} x ${item.quantity}개 - ${item.price.toLocaleString()}원`
            ).join('\n'),
            message: emailMessage,
            email_title: emailTitle,
            // 추가 템플릿 변수들
            order_date: new Date(order.created_at).toLocaleDateString('ko-KR'),
            order_items: order.items.map(item => 
                `${item.product_name} x ${item.quantity}개 - ${item.price.toLocaleString()}원`
            ).join('\n'),
            total_price: order.total_amount.toLocaleString()
        };
        
        console.log('이메일 템플릿 변수:', templateParams);
        console.log('이메일 발송 시도 중...');
        
        // 이메일 발송 (EmailJS 템플릿 방식)
        const response = await window.emailjs.send(
            emailConfig.SERVICE_ID,
            emailConfig.TEMPLATE_ID,
            templateParams
        );
        
        console.log('이메일 발송 성공:', response);
        console.log(`이메일이 ${toEmail}로 발송되었습니다!`);
        alert(`주문내역이 ${toEmail}로 발송되었습니다!`);
        return true;
        
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        alert('이메일 발송에 실패했습니다: ' + error.message);
        throw error;
    }
}

// 누락된 함수들 추가
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

function showSignup() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'none';
        signupContent.style.display = 'block';
    }
}

function showLogin() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'block';
        signupContent.style.display = 'none';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 폼 제출 이벤트 연결
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            loginUser();
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });
    }
    
    // 앱 초기화 (Supabase 로드 대기)
    setTimeout(() => {
        initializeApp();
    }, 1000);
});
