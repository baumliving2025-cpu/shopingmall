// 기존 코드를 API 연동으로 수정하는 헬퍼 함수들

// 전역 변수
let currentUser = null;
let products = [];
let cart = [];
let orders = [];

// API 연동된 인증 함수들
async function loginUser(email, password) {
    try {
        const response = await API.auth.login(email, password);
        currentUser = response.user;
        updateHeaderButtons();
        displayProducts();
        alert(`${currentUser.name}님, 환영합니다!`);
        return true;
    } catch (error) {
        throw new Error(error.message || '로그인에 실패했습니다.');
    }
}

async function registerUser(userData) {
    try {
        const response = await API.auth.register(userData);
        alert('회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.');
        return true;
    } catch (error) {
        throw new Error(error.message || '회원가입에 실패했습니다.');
    }
}

async function logout() {
    try {
        await API.auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        currentUser = null;
        API.instance.setToken(null);
        updateHeaderButtons();
        displayProducts();
        alert('로그아웃되었습니다.');
    }
}

// API 연동된 상품 관리 함수들
async function loadProducts() {
    try {
        const response = await API.product.getProducts();
        products = response.products || [];
        displayProducts();
    } catch (error) {
        console.error('상품 로드 실패:', error);
        // 오프라인 모드용 기본 상품 데이터
        loadDefaultProducts();
    }
}

async function addToCart(productId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        showLoginModal();
        return;
    }

    try {
        await API.cart.addToCart(productId, 1);
        await loadCart();
        updateCartBadge();
        alert('장바구니에 추가되었습니다.');
    } catch (error) {
        console.error('장바구니 추가 실패:', error);
        alert('장바구니 추가에 실패했습니다.');
    }
}

async function loadCart() {
    if (!currentUser) return;

    try {
        const response = await API.cart.getCart();
        cart = response.items || [];
    } catch (error) {
        console.error('장바구니 로드 실패:', error);
        cart = [];
    }
}

async function removeFromCart(productId) {
    try {
        await API.cart.removeFromCart(productId);
        await loadCart();
        updateCartBadge();
        showCart();
    } catch (error) {
        console.error('장바구니에서 제거 실패:', error);
        alert('장바구니에서 제거에 실패했습니다.');
    }
}

async function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
        await removeFromCart(productId);
        return;
    }

    try {
        await API.cart.updateCartItem(productId, quantity);
        await loadCart();
        updateCartBadge();
        showCart();
    } catch (error) {
        console.error('장바구니 수량 변경 실패:', error);
        alert('수량 변경에 실패했습니다.');
    }
}

// API 연동된 주문 함수들
async function checkout() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        closeCart();
        showLoginModal();
        return;
    }

    if (cart.length === 0) {
        alert('장바구니가 비어있습니다.');
        return;
    }

    try {
        // 주문 데이터 준비
        const orderData = {
            items: cart.map(item => ({
                productId: item.product_id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            shippingAddress: {
                // 실제 구현에서는 사용자 입력 받기
                name: currentUser.name,
                email: currentUser.email,
                address: '서울시 강남구 테헤란로 123',
                phone: '010-1234-5678'
            }
        };

        // 주문 생성
        const response = await API.order.createOrder(orderData);
        
        // 장바구니 비우기
        await API.cart.clearCart();
        await loadCart();
        updateCartBadge();

        // 주문 완료 처리
        showOrderConfirmation(response.order);
        
        // PDF 생성 및 이메일 발송
        generateAndOfferOrderPdf(response.order);
        sendOrderNotificationEmail(response.order);

    } catch (error) {
        console.error('주문 실패:', error);
        alert('주문 처리에 실패했습니다: ' + error.message);
    }
}

async function loadOrders() {
    if (!currentUser) return;

    try {
        const response = await API.order.getOrders();
        orders = response.orders || [];
    } catch (error) {
        console.error('주문 내역 로드 실패:', error);
        orders = [];
    }
}

// API 연동된 이메일 발송 함수
async function sendOrderNotificationEmail(order) {
    try {
        // 백엔드 API를 통한 이메일 발송
        await API.order.sendOrderConfirmation(order.id);
        console.log('주문 알림 이메일이 발송되었습니다.');
    } catch (error) {
        console.error('이메일 발송 실패:', error);
        // EmailJS 폴백 사용
        await sendOrderNotificationEmailFallback(order);
    }
}

// EmailJS 폴백 함수
async function sendOrderNotificationEmailFallback(order) {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS가 로드되지 않았습니다.');
        return false;
    }

    try {
        const customerEmail = currentUser ? currentUser.email : 'unknown@example.com';
        
        const templateParams = {
            to_email: customerEmail,
            order_number: order.orderNumber,
            order_date: order.date,
            customer_name: order.customerName,
            order_items: order.items.map(item => 
                `${item.brand} ${item.name} x ${item.quantity}개 - ${(item.price * item.quantity).toLocaleString()}원`
            ).join('\n'),
            total_amount: order.total.toLocaleString(),
            order_time: new Date().toLocaleString('ko-KR')
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        console.log('이메일 발송 성공 (EmailJS):', response);
        return true;
    } catch (error) {
        console.error('이메일 발송 실패 (EmailJS):', error);
        return false;
    }
}

// 초기화 함수
async function initializeApp() {
    try {
        console.log('앱 초기화 시작...');
        
        // 기본 상품 로드
        console.log('기본 상품 로드');
        loadDefaultProducts();
        
        // 기존 데이터 로드
        loadExistingData();
        
        updateCartBadge();
        
        console.log('앱 초기화 완료');
        
    } catch (error) {
        console.error('앱 초기화 실패:', error);
    }
}

// EmailJS 초기화 함수
function initEmailJS() {
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(window.CONFIG.EMAILJS.publicKey);
            console.log('EmailJS 초기화 완료');
        } else {
            console.log('EmailJS 라이브러리가 로드되지 않음');
        }
    } catch (error) {
        console.error('EmailJS 초기화 실패:', error);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initEmailJS();
});

// 기존 데이터 로드 (localStorage에서)
function loadExistingData() {
    try {
        // 장바구니 데이터 로드
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        // 주문 데이터 로드
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
        }
        
        // 사용자 데이터 로드
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateHeaderButtons();
        }
        
        console.log('기존 데이터 로드 완료');
    } catch (error) {
        console.error('기존 데이터 로드 실패:', error);
    }
}

// 오프라인 모드용 기본 상품 데이터
function loadDefaultProducts() {
    products = [
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
    // displayProducts 함수가 index.html에 정의되어 있으므로 직접 호출
    if (typeof displayProducts === 'function') {
        displayProducts();
    } else {
        console.error('displayProducts 함수를 찾을 수 없습니다');
    }
}
