// 거래명세서(영수증) 생성 기능
class ReceiptGenerator {
    constructor() {
        this.siteSettings = {};
        this.loadSiteSettings();
    }

    // 사이트 설정 정보 로드
    async loadSiteSettings() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
            }

            const { data, error } = await window.supabase
                .from('site_settings')
                .select('setting_key, setting_value');

            if (error) {
                throw new Error(error.message);
            }

            // 배열을 객체로 변환
            this.siteSettings = data.reduce((acc, item) => {
                acc[item.setting_key] = item.setting_value;
                return acc;
            }, {});

            console.log('사이트 설정 로드 완료:', this.siteSettings);

        } catch (error) {
            console.error('사이트 설정 로드 실패:', error);
            // 기본값 사용
            this.siteSettings = {
                company_name: 'ModernShop',
                business_number: '123-45-67890',
                company_address: '서울특별시 강남구 테헤란로 123, 10층',
                company_ceo: '홍길동',
                business_type: '전자상거래',
                business_category: '온라인쇼핑몰',
                customer_phone: '1588-0000'
            };
        }
    }

    // 단일 주문 영수증 생성
    async generateSingleReceipt(order) {
        await this.loadSiteSettings(); // 최신 설정 로드

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 한글 폰트 설정 (기본 폰트로 대체)
        doc.setFont('helvetica');

        // 제목
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('거래명세서(영수증)', 105, 30, { align: 'center' });

        // 선 그리기
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // 공급자 정보
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('[ 공급자 정보 ]', 20, 50);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        let yPos = 60;

        doc.text(`사업자번호: ${this.siteSettings.business_number || '123-45-67890'}`, 20, yPos);
        yPos += 8;
        doc.text(`상호(법인명): ${this.siteSettings.company_name || 'ModernShop'}`, 20, yPos);
        yPos += 8;
        doc.text(`대표자명: ${this.siteSettings.company_ceo || '홍길동'}`, 20, yPos);
        yPos += 8;
        doc.text(`주소: ${this.siteSettings.company_address || '서울특별시 강남구 테헤란로 123, 10층'}`, 20, yPos);
        yPos += 8;
        doc.text(`업태: ${this.siteSettings.business_type || '전자상거래'}`, 20, yPos);
        yPos += 8;
        doc.text(`종목: ${this.siteSettings.business_category || '온라인쇼핑몰'}`, 20, yPos);

        // 주문자 정보
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('[ 주문자 정보 ]', 20, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        yPos += 10;

        // 주문자 정보 로드
        const buyerInfo = await this.getBuyerInfo(order.user_id);

        doc.text(`주문자명: ${buyerInfo.name || '고객'}`, 20, yPos);
        yPos += 8;
        doc.text(`주문번호: ${order.order_number}`, 20, yPos);
        yPos += 8;
        doc.text(`주문일시: ${this.formatDate(order.created_at)}`, 20, yPos);
        yPos += 8;
        doc.text(`결제금액: ${this.formatPrice(order.total_amount)}원`, 20, yPos);

        // 상품 정보
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('[ 상품 정보 ]', 20, yPos);

        // 테이블 헤더
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('상품명', 20, yPos);
        doc.text('수량', 100, yPos);
        doc.text('단가', 130, yPos);
        doc.text('금액', 160, yPos);

        // 선 그리기
        yPos += 3;
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);

        // 상품 목록
        yPos += 10;
        doc.setFont('helvetica', 'normal');

        const orderItems = await this.getOrderItems(order.id);
        let totalAmount = 0;

        for (const item of orderItems) {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            doc.text(this.truncateText(item.product_name, 25), 20, yPos);
            doc.text(item.quantity.toString(), 100, yPos);
            doc.text(this.formatPrice(item.price), 130, yPos);
            doc.text(this.formatPrice(itemTotal), 160, yPos);
            yPos += 8;

            // 페이지 넘김 체크
            if (yPos > 270) {
                doc.addPage();
                yPos = 30;
            }
        }

        // 총액
        yPos += 5;
        doc.setLineWidth(0.3);
        doc.line(130, yPos, 190, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('총 금액:', 130, yPos);
        doc.text(`${this.formatPrice(totalAmount)}원`, 160, yPos);

        // 하단 정보
        yPos += 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('※ 본 거래명세서는 세금계산서가 아닙니다.', 20, yPos);
        yPos += 6;
        doc.text(`문의전화: ${this.siteSettings.customer_phone || '1588-0000'}`, 20, yPos);
        yPos += 6;
        doc.text(`발행일: ${this.formatDate(new Date())}`, 20, yPos);

        // 파일명 생성
        const fileName = `거래명세서_${order.order_number}_${this.formatDateForFile(order.created_at)}.pdf`;

        // PDF 다운로드
        doc.save(fileName);
    }

    // 주문자 정보 조회
    async getBuyerInfo(userId) {
        try {
            const { data, error } = await window.supabase
                .from('users')
                .select('name, email')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('주문자 정보 조회 실패:', error);
                return { name: '고객', email: '' };
            }

            return data;
        } catch (error) {
            console.error('주문자 정보 조회 오류:', error);
            return { name: '고객', email: '' };
        }
    }

    // 주문 상품 목록 조회
    async getOrderItems(orderId) {
        try {
            const { data, error } = await window.supabase
                .from('order_items')
                .select(`
                    quantity,
                    price,
                    products (
                        name
                    )
                `)
                .eq('order_id', orderId);

            if (error) {
                console.error('주문 상품 조회 실패:', error);
                return [];
            }

            return data.map(item => ({
                product_name: item.products?.name || '상품명 없음',
                quantity: item.quantity,
                price: item.price
            }));
        } catch (error) {
            console.error('주문 상품 조회 오류:', error);
            return [];
        }
    }

    // 여러 주문 일괄 다운로드
    async generateBulkReceipts(orders) {
        if (!orders || orders.length === 0) {
            alert('다운로드할 주문이 없습니다.');
            return;
        }

        // 로딩 표시
        this.showLoadingModal(orders.length);

        try {
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];

                // 진행상황 업데이트
                this.updateLoadingProgress(i + 1, orders.length, order.order_number);

                // 각 주문의 영수증 생성
                await this.generateSingleReceipt(order);

                // 잠시 대기 (브라우저 부하 방지)
                await this.delay(500);
            }

            // 완료 메시지
            this.hideLoadingModal();
            alert(`${orders.length}개 주문의 영수증이 다운로드되었습니다.`);

        } catch (error) {
            console.error('일괄 다운로드 실패:', error);
            this.hideLoadingModal();
            alert('일괄 다운로드 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 로딩 모달 표시
    showLoadingModal(totalCount) {
        const modal = document.createElement('div');
        modal.id = 'receiptLoadingModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            min-width: 300px;
        `;

        content.innerHTML = `
            <h3 style="margin-bottom: 20px;">영수증 다운로드 중</h3>
            <div id="receiptProgress">
                <div style="font-size: 14px; margin-bottom: 10px;">
                    <span id="currentProgress">0</span> / ${totalCount}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                    현재: <span id="currentOrder">준비 중...</span>
                </div>
                <div style="width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                    <div id="progressBar" style="width: 0%; height: 100%; background: #007bff; transition: width 0.3s;"></div>
                </div>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    // 로딩 진행상황 업데이트
    updateLoadingProgress(current, total, orderNumber) {
        const currentEl = document.getElementById('currentProgress');
        const currentOrderEl = document.getElementById('currentOrder');
        const progressBarEl = document.getElementById('progressBar');

        if (currentEl) currentEl.textContent = current;
        if (currentOrderEl) currentOrderEl.textContent = orderNumber;
        if (progressBarEl) {
            const percentage = (current / total) * 100;
            progressBarEl.style.width = percentage + '%';
        }
    }

    // 로딩 모달 숨기기
    hideLoadingModal() {
        const modal = document.getElementById('receiptLoadingModal');
        if (modal) {
            modal.remove();
        }
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 파일명용 날짜 포맷팅
    formatDateForFile(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 10).replace(/-/g, '');
    }

    // 가격 포맷팅
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price);
    }

    // 텍스트 자르기
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // 지연 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 전역 인스턴스 생성
let receiptGenerator;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    receiptGenerator = new ReceiptGenerator();
});

// 전역 함수들 (HTML에서 호출)
function downloadReceipt(orderId) {
    if (!receiptGenerator) {
        receiptGenerator = new ReceiptGenerator();
    }

    // 주문 정보 조회 후 영수증 생성
    const order = getCurrentOrderData(orderId);
    if (order) {
        receiptGenerator.generateSingleReceipt(order);
    } else {
        alert('주문 정보를 찾을 수 없습니다.');
    }
}

function downloadAllReceipts() {
    if (!receiptGenerator) {
        receiptGenerator = new ReceiptGenerator();
    }

    const allOrders = getAllVisibleOrders();
    if (allOrders.length === 0) {
        alert('다운로드할 주문이 없습니다.');
        return;
    }

    if (confirm(`총 ${allOrders.length}개 주문의 영수증을 다운로드하시겠습니까?`)) {
        receiptGenerator.generateBulkReceipts(allOrders);
    }
}

// 현재 표시된 주문 데이터 가져오기 (주문내역 모달에서)
function getCurrentOrderData(orderId) {
    // 전역 변수에서 주문 데이터 가져오기
    if (window.currentUserOrders) {
        return window.currentUserOrders.find(order => order.id === orderId);
    }
    return null;
}

// 현재 표시된 모든 주문 가져오기
function getAllVisibleOrders() {
    if (window.currentUserOrders) {
        return window.currentUserOrders;
    }
    return [];
}

// 전역 함수 등록
window.downloadReceipt = downloadReceipt;
window.downloadAllReceipts = downloadAllReceipts;
window.receiptGenerator = receiptGenerator;