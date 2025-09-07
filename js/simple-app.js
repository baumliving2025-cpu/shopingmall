// 간단한 쇼핑몰 앱 (API 연동 없이)
let products = [];
let cart = [];
let orders = [];
let currentUser = null;

// 기본 상품 데이터
const defaultProducts = [
    {
        id: 1,
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 159000,
        description: '혁신적인 에어 쿠셔닝과 현대적인 디자인',
        category: '패션',
        images: ['https://via.placeholder.com/300x300?text=Nike+Air+Max+270'],
        stock_quantity: 50
    },
    {
        id: 2,
        name: 'Chanel No.5 Parfum',
        brand: 'Chanel',
        price: 245000,
        description: '클래식한 향수의 대명사',
        category: '뷰티',
        images: ['https://via.placeholder.com/300x300?text=Chanel+No.5'],
        stock_quantity: 30
    },
    {
        id: 3,
        name: 'Apple iPhone 15 Pro',
        brand: 'Apple',
        price: 1350000,
        description: '최신 A17 Pro 칩셋과 티타늄 디자인',
        category: '전자제품',
        images: ['https://via.placeholder.com/300x300?text=iPhone+15+Pro'],
        stock_quantity: 20
    }
];

// 상품 표시
function displayProducts(filter = '전체') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let filteredProducts = filter === '전체' ? products : products.filter(p => p.category === filter);
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <i class="fas fa-image"></i>
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h3 class="product-title">${product.name}</h3>
                    <span style="font-size: 0.8rem; background: #f8f9fa; padding: 0.2rem 0.5rem; border-radius: 10px; color: #666;">${product.brand}</span>
                </div>
                <div class="product-price">${product.price.toLocaleString()}원</div>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="btn btn-primary">
                        <i class="fas fa-shopping-cart"></i> 장바구니 담기
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 장바구니에 상품 추가
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('상품을 찾을 수 없습니다:', productId);
        return;
    }
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    console.log('장바구니에 상품 추가됨:', product.name, '현재 장바구니:', cart);
    
    updateCartBadge();
    saveCart();
    alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);
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
            console.log('장바구니 모달 열림, 현재 장바구니:', cart);
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
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${item.name}</h4>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">${item.price.toLocaleString()}원</p>
            </div>
            <div class="item-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                <button onclick="removeFromCart(${item.productId})" style="background: #ff4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">삭제</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `총 금액: ${total.toLocaleString()}원`;
}

// 장바구니 수량 업데이트
function updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartBadge();
        displayCart();
        saveCart();
    }
}

// 장바구니에서 상품 제거
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartBadge();
    displayCart();
    saveCart();
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
    }
}

// 로그인 처리
function loginUser() {
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
    
    // 사용자 확인
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const user = existingUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
    }
    
    // 로그인 성공
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('로그인 성공:', currentUser);
    
    // 폼 초기화
    emailInput.value = '';
    passwordInput.value = '';
    
    // 모달 닫기
    hideLoginModal();
    
    // 헤더 업데이트
    updateHeaderButtons();
    
    alert(`${currentUser.name}님, 환영합니다!`);
}

// 로그아웃 처리
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // 장바구니 비우기 (로그아웃 시)
    cart = [];
    saveCart();
    updateCartBadge();
    
    // 헤더 업데이트
    updateHeaderButtons();
    
    alert('로그아웃되었습니다.');
}

// 헤더 버튼 업데이트
function updateHeaderButtons() {
    const userIcon = document.querySelector('.user-icon');
    if (userIcon && currentUser) {
        // 로그인된 상태
        userIcon.innerHTML = `
            <div style="position: relative;">
                <i class="fas fa-user"></i>
                <div class="user-dropdown" style="position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 150px; z-index: 1000;">
                    <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold;">${currentUser.name}</div>
                        <div style="font-size: 0.8rem; color: #666;">${currentUser.email}</div>
                    </div>
                    <div style="padding: 0.5rem 0;">
                        <button onclick="showUserOrders()" style="width: 100%; padding: 0.5rem 1rem; border: none; background: none; text-align: left; cursor: pointer;">주문내역</button>
                        <button onclick="logoutUser()" style="width: 100%; padding: 0.5rem 1rem; border: none; background: none; text-align: left; cursor: pointer; color: #ff4444;">로그아웃</button>
                    </div>
                </div>
            </div>
        `;
    } else if (userIcon) {
        // 로그인되지 않은 상태
        userIcon.innerHTML = '<i class="fas fa-user"></i>';
    }
}

// 회원가입 모달 표시
function showRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'block';
    }
}

// 회원가입 탭 표시 (HTML에서 호출)
function showSignup() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'none';
        signupContent.style.display = 'block';
    }
}

// 로그인 탭 표시 (HTML에서 호출)
function showLogin() {
    const loginContent = document.getElementById('loginContent');
    const signupContent = document.getElementById('signupContent');
    
    if (loginContent && signupContent) {
        loginContent.style.display = 'block';
        signupContent.style.display = 'none';
    }
}

// 회원가입 모달 숨기기
function hideRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
}

// 회원가입 처리
function registerUser() {
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
    
    // 기존 사용자 확인
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = existingUsers.find(user => user.email === email);
    
    if (existingUser) {
        alert('이미 가입된 이메일입니다.');
        return;
    }
    
    // 새 사용자 생성
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // 실제로는 해시화해야 함
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // 사용자 목록에 추가
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    console.log('회원가입 완료:', newUser);
    
    // 폼 초기화
    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
    
    // 로그인 탭으로 전환
    showLogin();
    
    alert('회원가입이 완료되었습니다! 로그인해주세요.');
}

// 데이터 저장
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('장바구니 데이터 저장됨:', cart);
    } catch (error) {
        console.error('장바구니 데이터 저장 실패:', error);
    }
}

function saveOrders() {
    try {
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log('주문 데이터 저장됨:', orders);
    } catch (error) {
        console.error('주문 데이터 저장 실패:', error);
    }
}

// 데이터 로드
function loadData() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('장바구니 데이터 로드됨:', cart);
        }
        
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
            console.log('주문 데이터 로드됨:', orders);
        }
        
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('사용자 데이터 로드됨:', currentUser);
        }
        
        console.log('모든 데이터 로드 완료');
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

// 앱 초기화
function initializeApp() {
    console.log('간단한 쇼핑몰 앱 초기화...');
    
    // 기본 상품 로드
    products = [...defaultProducts];
    
    // 저장된 데이터 로드
    loadData();
    
    // 상품 표시
    displayProducts();
    
    // 장바구니 배지 업데이트
    updateCartBadge();
    
    // 헤더 버튼 업데이트
    updateHeaderButtons();
    
    console.log('앱 초기화 완료');
}

// 장바구니 모달 닫기
function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// 주문하기 (체크아웃)
function checkout() {
    if (cart.length === 0) {
        alert('장바구니가 비어있습니다.');
        return;
    }
    
    // 간단한 주문 처리
    const orderNumber = `ORD${Date.now()}`;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        id: Date.now(),
        orderNumber: orderNumber,
        items: [...cart], // 장바구니 복사본으로 주문 생성
        totalAmount: totalAmount,
        status: '주문접수',
        createdAt: new Date().toISOString()
    };
    
    orders.push(order);
    
    // 주문 데이터 먼저 저장
    saveOrders();
    
    // 장바구니 비우기
    cart = [];
    
    // 빈 장바구니 저장
    saveCart();
    
    // UI 업데이트
    updateCartBadge();
    displayCart();
    closeCart();
    
    alert(`주문이 완료되었습니다!\n주문번호: ${orderNumber}\n총 금액: ${totalAmount.toLocaleString()}원`);
}

// Local Storage 테스트 함수
function testLocalStorage() {
    console.log('=== Local Storage 테스트 시작 ===');
    
    // 테스트 데이터 저장
    const testData = { test: '데이터', timestamp: new Date().toISOString() };
    localStorage.setItem('test', JSON.stringify(testData));
    console.log('테스트 데이터 저장됨:', testData);
    
    // 저장된 데이터 확인
    const retrieved = localStorage.getItem('test');
    console.log('저장된 데이터 확인:', retrieved);
    
    // Local Storage 전체 내용 확인
    console.log('Local Storage 전체 내용:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
    
    console.log('=== Local Storage 테스트 완료 ===');
}

// Local Storage 강제 새로고침 함수
function refreshLocalStorage() {
    console.log('=== Local Storage 강제 새로고침 ===');
    
    // 현재 데이터를 다시 저장
    if (cart.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('장바구니 데이터 강제 저장:', cart);
    }
    
    if (orders.length > 0) {
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log('주문 데이터 강제 저장:', orders);
    }
    
    // Local Storage 전체 내용 다시 확인
    console.log('Local Storage 전체 내용 (새로고침 후):');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value}`);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
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
    
    // Local Storage 테스트 실행
    setTimeout(() => {
        testLocalStorage();
    }, 1000);
});
