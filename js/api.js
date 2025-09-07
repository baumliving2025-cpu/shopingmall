// API 통신을 위한 유틸리티 클래스
class API {
    constructor() {
        this.baseURL = process.env.NODE_ENV === 'production' 
            ? 'https://your-backend-url.railway.app/api'
            : 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    // 토큰 설정
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // HTTP 요청 헬퍼
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // 인증 토큰 추가
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // GET 요청
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST 요청
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT 요청
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE 요청
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // 파일 업로드
    async uploadFile(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'POST',
            headers: {}
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        config.body = formData;

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
}

// API 인스턴스 생성
const api = new API();

// 인증 관련 API
const authAPI = {
    // 회원가입
    register: async (userData) => {
        return api.post('/auth/register', userData);
    },

    // 로그인
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.token) {
            api.setToken(response.token);
        }
        return response;
    },

    // 로그아웃
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            api.setToken(null);
        }
    },

    // 현재 사용자 정보 조회
    getCurrentUser: async () => {
        return api.get('/auth/me');
    },

    // 이메일 인증
    verifyEmail: async (token) => {
        return api.get(`/auth/verify-email/${token}`);
    }
};

// 사용자 관련 API
const userAPI = {
    // 프로필 업데이트
    updateProfile: async (userData) => {
        return api.put('/users/profile', userData);
    },

    // 비밀번호 변경
    changePassword: async (currentPassword, newPassword) => {
        return api.put('/users/password', {
            currentPassword,
            newPassword
        });
    }
};

// 상품 관련 API
const productAPI = {
    // 상품 목록 조회
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/products${queryString ? `?${queryString}` : ''}`);
    },

    // 상품 상세 조회
    getProduct: async (id) => {
        return api.get(`/products/${id}`);
    },

    // 상품 검색
    searchProducts: async (query) => {
        return api.get(`/products/search?q=${encodeURIComponent(query)}`);
    },

    // 상품 등록 (관리자)
    createProduct: async (productData) => {
        return api.post('/products', productData);
    },

    // 상품 수정 (관리자)
    updateProduct: async (id, productData) => {
        return api.put(`/products/${id}`, productData);
    },

    // 상품 삭제 (관리자)
    deleteProduct: async (id) => {
        return api.delete(`/products/${id}`);
    }
};

// 주문 관련 API
const orderAPI = {
    // 주문 생성
    createOrder: async (orderData) => {
        return api.post('/orders', orderData);
    },

    // 주문 목록 조회
    getOrders: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/orders${queryString ? `?${queryString}` : ''}`);
    },

    // 주문 상세 조회
    getOrder: async (id) => {
        return api.get(`/orders/${id}`);
    },

    // 주문 상태 변경 (관리자)
    updateOrderStatus: async (id, status) => {
        return api.put(`/orders/${id}/status`, { status });
    }
};

// 장바구니 관련 API
const cartAPI = {
    // 장바구니 조회
    getCart: async () => {
        return api.get('/cart');
    },

    // 장바구니에 상품 추가
    addToCart: async (productId, quantity = 1) => {
        return api.post('/cart/items', { productId, quantity });
    },

    // 장바구니 상품 수량 변경
    updateCartItem: async (productId, quantity) => {
        return api.put(`/cart/items/${productId}`, { quantity });
    },

    // 장바구니에서 상품 제거
    removeFromCart: async (productId) => {
        return api.delete(`/cart/items/${productId}`);
    },

    // 장바구니 비우기
    clearCart: async () => {
        return api.delete('/cart');
    }
};

// 전역 API 객체
window.API = {
    auth: authAPI,
    user: userAPI,
    product: productAPI,
    order: orderAPI,
    cart: cartAPI,
    instance: api
};
