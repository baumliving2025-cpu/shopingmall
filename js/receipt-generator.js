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

        // 주문자 정보 및 주문 상품 로드
        const buyerInfo = await this.getBuyerInfo(order.user_id);
        const orderItems = await this.getOrderItems(order.id);

        // HTML 템플릿 생성
        const receiptHtml = this.createReceiptHTML(order, buyerInfo, orderItems);

        // 임시 div 생성하여 HTML 렌더링
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = receiptHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '210mm'; // A4 너비
        tempDiv.style.backgroundColor = 'white';
        document.body.appendChild(tempDiv);

        try {
            // HTML을 캔버스로 변환
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // 고해상도
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 794, // A4 너비 (픽셀)
                height: 1123 // A4 높이 (픽셀)
            });

            // PDF 생성
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 너비 (mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // 파일명 생성
            const fileName = `거래명세서_${order.order_number}_${this.formatDateForFile(order.created_at)}.pdf`;

            // PDF 다운로드
            pdf.save(fileName);

        } finally {
            // 임시 div 제거
            document.body.removeChild(tempDiv);
        }
    }

    // 영수증 HTML 템플릿 생성
    createReceiptHTML(order, buyerInfo, orderItems) {
        let totalAmount = 0;
        const itemsHtml = orderItems.map(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            return `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatPrice(item.price)}원</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${this.formatPrice(itemTotal)}원</td>
                </tr>
            `;
        }).join('');

        return `
            <div style="font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; padding: 30px; background: white; max-width: 794px; margin: 0 auto;">
                <!-- 제목 -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #333;">거래명세서(영수증)</h1>
                    <div style="width: 100%; height: 2px; background: #333; margin: 10px 0;"></div>
                </div>

                <!-- 공급자 정보 -->
                <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a90e2; padding-bottom: 5px;">[ 공급자 정보 ]</h2>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <div><strong>사업자번호:</strong> ${this.siteSettings.business_number || '123-45-67890'}</div>
                        <div><strong>상호(법인명):</strong> ${this.siteSettings.company_name || 'ModernShop'}</div>
                        <div><strong>대표자명:</strong> ${this.siteSettings.company_ceo || '홍길동'}</div>
                        <div><strong>주소:</strong> ${this.siteSettings.company_address || '서울특별시 강남구 테헤란로 123, 10층'}</div>
                        <div><strong>업태:</strong> ${this.siteSettings.business_type || '전자상거래'}</div>
                        <div><strong>종목:</strong> ${this.siteSettings.business_category || '온라인쇼핑몰'}</div>
                    </div>
                </div>

                <!-- 주문자 정보 -->
                <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a90e2; padding-bottom: 5px;">[ 주문자 정보 ]</h2>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <div><strong>주문자명:</strong> ${buyerInfo.name || '고객'}</div>
                        <div><strong>주문번호:</strong> ${order.order_number}</div>
                        <div><strong>주문일시:</strong> ${this.formatDate(order.created_at)}</div>
                        <div><strong>결제금액:</strong> ${this.formatPrice(order.total_amount)}원</div>
                    </div>
                </div>

                <!-- 상품 정보 -->
                <div style="margin-bottom: 25px;">
                    <h2 style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #4a90e2; padding-bottom: 5px;">[ 상품 정보 ]</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">상품명</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; width: 80px;">수량</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; width: 100px;">단가</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold; width: 120px;">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f8f9fa; font-weight: bold;">
                                <td colspan="3" style="padding: 12px; border: 1px solid #ddd; text-align: right;">총 금액:</td>
                                <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #e74c3c; font-size: 16px;">${this.formatPrice(totalAmount)}원</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- 하단 정보 -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    <div style="margin-bottom: 5px;">※ 본 거래명세서는 세금계산서가 아닙니다.</div>
                    <div style="margin-bottom: 5px;">문의전화: ${this.siteSettings.customer_phone || '1588-0000'}</div>
                    <div>발행일: ${this.formatDate(new Date())}</div>
                </div>
            </div>
        `;
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

                // 잠시 대기 (브라우저 부하 방지 및 html2canvas 안정화)
                await this.delay(1000);
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