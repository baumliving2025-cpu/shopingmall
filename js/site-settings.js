// 사이트 설정 관리 모듈
class SiteSettingsManager {
    constructor() {
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // DOM이 로드된 후 이벤트 리스너 등록
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormListeners();
        });

        // DOM이 이미 로드된 경우를 위한 즉시 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupFormListeners();
            });
        } else {
            this.setupFormListeners();
        }
    }

    setupFormListeners() {
        // 고객센터 정보 폼
        const customerServiceForm = document.getElementById('customerServiceForm');
        if (customerServiceForm) {
            customerServiceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCustomerServiceSubmit(e);
            });
        }

        // 회사 정보 폼
        const companyInfoForm = document.getElementById('companyInfoForm');
        if (companyInfoForm) {
            companyInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCompanyInfoSubmit(e);
            });
        }

        // 소셜미디어 폼
        const socialMediaForm = document.getElementById('socialMediaForm');
        if (socialMediaForm) {
            socialMediaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSocialMediaSubmit(e);
            });
        }

        // 운영 정보 폼
        const operationInfoForm = document.getElementById('operationInfoForm');
        if (operationInfoForm) {
            operationInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOperationInfoSubmit(e);
            });
        }

        // 정책 링크 폼
        const policyLinksForm = document.getElementById('policyLinksForm');
        if (policyLinksForm) {
            policyLinksForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePolicyLinksSubmit(e);
            });
        }

        console.log('사이트 설정 폼 이벤트 리스너 등록 완료');
    }

    // 고객센터 정보 폼 제출 처리
    async handleCustomerServiceSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            // 버튼 비활성화 및 로딩 표시
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

            const formData = new FormData(form);
            const settings = {
                customer_phone: formData.get('customer_phone') || '',
                customer_email: formData.get('customer_email') || '',
                faq_link: formData.get('faq_link') || '',
                inquiry_link: formData.get('inquiry_link') || ''
            };

            console.log('고객센터 정보 저장 시작:', settings);

            let successCount = 0;
            const errors = [];

            // 각 설정 저장
            for (const [key, value] of Object.entries(settings)) {
                try {
                    const success = await this.saveSetting(key, value);
                    if (success) {
                        successCount++;
                    } else {
                        errors.push(`${key} 저장 실패`);
                    }
                } catch (error) {
                    console.error(`${key} 저장 오류:`, error);
                    errors.push(`${key}: ${error.message}`);
                }
            }

            // 결과 표시
            if (successCount > 0) {
                if (errors.length === 0) {
                    this.showSuccess('고객센터 정보가 성공적으로 저장되었습니다!');
                } else {
                    this.showWarning(`고객센터 정보가 부분적으로 저장되었습니다.\n성공: ${successCount}개\n오류: ${errors.join(', ')}`);
                }
                await this.updateFooterContent();
            } else {
                this.showError(`저장에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('고객센터 정보 저장 중 오류:', error);
            this.showError('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 복원
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    // 회사 정보 폼 제출 처리
    async handleCompanyInfoSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            // 버튼 비활성화 및 로딩 표시
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

            const formData = new FormData(form);
            const settings = {
                company_name: formData.get('company_name') || '',
                company_ceo: formData.get('company_ceo') || '',
                company_address: formData.get('company_address') || '',
                telecom_license: formData.get('telecom_license') || '',
                business_number: formData.get('business_number') || '',
                company_website: formData.get('company_website') || '',
                company_description: formData.get('company_description') || ''
            };

            console.log('회사 정보 저장 시작:', settings);

            let successCount = 0;
            const errors = [];

            // 각 설정 저장
            for (const [key, value] of Object.entries(settings)) {
                try {
                    const success = await this.saveSetting(key, value);
                    if (success) {
                        successCount++;
                    } else {
                        errors.push(`${key} 저장 실패`);
                    }
                } catch (error) {
                    console.error(`${key} 저장 오류:`, error);
                    errors.push(`${key}: ${error.message}`);
                }
            }

            // 결과 표시
            if (successCount > 0) {
                if (errors.length === 0) {
                    this.showSuccess('회사 정보가 성공적으로 저장되었습니다!');
                } else {
                    this.showWarning(`회사 정보가 부분적으로 저장되었습니다.\n성공: ${successCount}개\n오류: ${errors.join(', ')}`);
                }
                await this.updateFooterContent();
            } else {
                this.showError(`저장에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('회사 정보 저장 중 오류:', error);
            this.showError('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            // 버튼 복원
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    // 소셜미디어 폼 제출 처리
    async handleSocialMediaSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

            const formData = new FormData(form);
            const settings = {
                instagram_link: formData.get('instagram_link') || '',
                facebook_link: formData.get('facebook_link') || '',
                youtube_link: formData.get('youtube_link') || '',
                blog_link: formData.get('blog_link') || ''
            };

            console.log('소셜미디어 링크 저장 시작:', settings);

            let successCount = 0;
            const errors = [];

            for (const [key, value] of Object.entries(settings)) {
                try {
                    const success = await this.saveSetting(key, value);
                    if (success) {
                        successCount++;
                    } else {
                        errors.push(`${key} 저장 실패`);
                    }
                } catch (error) {
                    console.error(`${key} 저장 오류:`, error);
                    errors.push(`${key}: ${error.message}`);
                }
            }

            if (successCount > 0) {
                if (errors.length === 0) {
                    this.showSuccess('소셜미디어 링크가 성공적으로 저장되었습니다!');
                } else {
                    this.showWarning(`소셜미디어 링크가 부분적으로 저장되었습니다.\n성공: ${successCount}개\n오류: ${errors.join(', ')}`);
                }
                await this.updateFooterContent();
            } else {
                this.showError(`저장에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('소셜미디어 링크 저장 중 오류:', error);
            this.showError('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    // 운영 정보 폼 제출 처리
    async handleOperationInfoSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

            const formData = new FormData(form);
            const settings = {
                operating_hours: formData.get('operating_hours') || '',
                holiday_info: formData.get('holiday_info') || '',
                return_exchange_info: formData.get('return_exchange_info') || '',
                shipping_info: formData.get('shipping_info') || ''
            };

            console.log('운영 정보 저장 시작:', settings);

            let successCount = 0;
            const errors = [];

            for (const [key, value] of Object.entries(settings)) {
                try {
                    const success = await this.saveSetting(key, value);
                    if (success) {
                        successCount++;
                    } else {
                        errors.push(`${key} 저장 실패`);
                    }
                } catch (error) {
                    console.error(`${key} 저장 오류:`, error);
                    errors.push(`${key}: ${error.message}`);
                }
            }

            if (successCount > 0) {
                if (errors.length === 0) {
                    this.showSuccess('운영 정보가 성공적으로 저장되었습니다!');
                } else {
                    this.showWarning(`운영 정보가 부분적으로 저장되었습니다.\n성공: ${successCount}개\n오류: ${errors.join(', ')}`);
                }
                await this.updateFooterContent();
            } else {
                this.showError(`저장에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('운영 정보 저장 중 오류:', error);
            this.showError('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    // 정책 링크 폼 제출 처리
    async handlePolicyLinksSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

            const formData = new FormData(form);
            const settings = {
                about_us_link: formData.get('about_us_link') || '',
                careers_link: formData.get('careers_link') || '',
                terms_link: formData.get('terms_link') || '',
                privacy_link: formData.get('privacy_link') || '',
                delivery_track_link: formData.get('delivery_track_link') || '',
                return_guide_link: formData.get('return_guide_link') || ''
            };

            console.log('정책 링크 저장 시작:', settings);

            let successCount = 0;
            const errors = [];

            for (const [key, value] of Object.entries(settings)) {
                try {
                    const success = await this.saveSetting(key, value);
                    if (success) {
                        successCount++;
                    } else {
                        errors.push(`${key} 저장 실패`);
                    }
                } catch (error) {
                    console.error(`${key} 저장 오류:`, error);
                    errors.push(`${key}: ${error.message}`);
                }
            }

            if (successCount > 0) {
                if (errors.length === 0) {
                    this.showSuccess('정책 링크가 성공적으로 저장되었습니다!');
                } else {
                    this.showWarning(`정책 링크가 부분적으로 저장되었습니다.\n성공: ${successCount}개\n오류: ${errors.join(', ')}`);
                }
                await this.updateFooterContent();
            } else {
                this.showError(`저장에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('정책 링크 저장 중 오류:', error);
            this.showError('저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    // 개별 설정 저장
    async saveSetting(key, value) {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }

        try {
            console.log(`설정 저장 시도: ${key} = ${value}`);

            // 1. 기존 데이터 확인
            const { data: existing, error: selectError } = await window.supabase
                .from('site_settings')
                .select('setting_key, setting_value')
                .eq('setting_key', key)
                .maybeSingle();

            if (selectError) {
                console.error('기존 데이터 조회 실패:', selectError);
                throw new Error(`데이터 조회 실패: ${selectError.message}`);
            }

            if (existing) {
                // 2. 기존 데이터 업데이트
                console.log(`기존 설정 업데이트: ${key}`);
                const { error: updateError } = await window.supabase
                    .from('site_settings')
                    .update({
                        setting_value: value,
                        updated_at: new Date().toISOString()
                    })
                    .eq('setting_key', key);

                if (updateError) {
                    console.error('설정 업데이트 실패:', updateError);
                    throw new Error(`업데이트 실패: ${updateError.message}`);
                }
            } else {
                // 3. 새 데이터 삽입
                console.log(`새 설정 삽입: ${key}`);
                const { error: insertError } = await window.supabase
                    .from('site_settings')
                    .insert({
                        setting_key: key,
                        setting_value: value,
                        updated_at: new Date().toISOString()
                    });

                if (insertError) {
                    console.error('설정 삽입 실패:', insertError);
                    throw new Error(`삽입 실패: ${insertError.message}`);
                }
            }

            console.log(`✅ 설정 저장 성공: ${key}`);
            return true;

        } catch (error) {
            console.error(`❌ 설정 저장 실패 (${key}):`, error);
            throw error;
        }
    }

    // 모든 설정 로드
    async loadSettings() {
        if (!window.supabase) {
            console.warn('Supabase 클라이언트가 아직 초기화되지 않았습니다. 잠시 후 다시 시도합니다.');
            setTimeout(() => this.loadSettings(), 1000);
            return;
        }

        try {
            console.log('사이트 설정 로드 시작');

            const { data: settings, error } = await window.supabase
                .from('site_settings')
                .select('setting_key, setting_value');

            if (error) {
                console.error('사이트 설정 로드 실패:', error);
                return;
            }

            console.log('로드된 설정:', settings);

            // 폼 필드에 값 설정
            if (settings && settings.length > 0) {
                settings.forEach(setting => {
                    const element = document.getElementById(this.mapSettingKeyToElementId(setting.setting_key));
                    if (element) {
                        element.value = setting.setting_value || '';
                        console.log(`설정 적용: ${setting.setting_key} -> ${element.id} = ${setting.setting_value}`);
                    } else {
                        console.warn(`설정 필드를 찾을 수 없음: ${setting.setting_key}`);
                    }
                });

                // 푸터 업데이트
                await this.updateFooterContent();
                console.log('사이트 설정 로드 완료');
            } else {
                console.log('저장된 설정이 없습니다. 기본값을 사용합니다.');
            }

        } catch (error) {
            console.error('사이트 설정 로드 중 오류:', error);
        }
    }

    // 설정 키를 HTML 요소 ID로 매핑
    mapSettingKeyToElementId(settingKey) {
        const mapping = {
            // 고객센터 정보
            'customer_phone': 'customerPhone',
            'customer_email': 'customerEmail',
            'faq_link': 'faqLink',
            'inquiry_link': 'inquiryLink',

            // 회사 정보
            'company_name': 'companyName',
            'company_ceo': 'companyCeo',
            'company_address': 'companyAddress',
            'telecom_license': 'telecomLicense',
            'business_number': 'businessNumber',
            'company_website': 'companyWebsite',
            'company_description': 'companyDescription',

            // 소셜미디어 링크
            'instagram_link': 'instagramLink',
            'facebook_link': 'facebookLink',
            'youtube_link': 'youtubeLink',
            'blog_link': 'blogLink',

            // 운영 정보
            'operating_hours': 'operatingHours',
            'holiday_info': 'holidayInfo',
            'return_exchange_info': 'returnExchangeInfo',
            'shipping_info': 'shippingInfo',

            // 정책 링크
            'about_us_link': 'aboutUsLink',
            'careers_link': 'careersLink',
            'terms_link': 'termsLink',
            'privacy_link': 'privacyLink',
            'delivery_track_link': 'deliveryTrackLink',
            'return_guide_link': 'returnGuideLink'
        };
        return mapping[settingKey] || settingKey;
    }

    // 푸터 내용 업데이트
    async updateFooterContent() {
        try {
            const { data: settings, error } = await window.supabase
                .from('site_settings')
                .select('setting_key, setting_value');

            if (error) {
                console.error('푸터 업데이트용 설정 로드 실패:', error);
                return;
            }

            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.setting_key] = setting.setting_value;
            });

            // 1. 고객센터 정보 업데이트
            const footerPhone = document.querySelector('.footer-phone');
            if (footerPhone && settingsMap.customer_phone) {
                footerPhone.textContent = settingsMap.customer_phone;
                footerPhone.href = `tel:${settingsMap.customer_phone}`;
            }

            const footerEmail = document.querySelector('.footer-email');
            if (footerEmail && settingsMap.customer_email) {
                footerEmail.textContent = settingsMap.customer_email;
                footerEmail.href = `mailto:${settingsMap.customer_email}`;
            }

            const footerFaq = document.querySelector('.footer-faq');
            if (footerFaq && settingsMap.faq_link) {
                footerFaq.href = settingsMap.faq_link;
            }

            const footerInquiry = document.querySelector('.footer-inquiry');
            if (footerInquiry && settingsMap.inquiry_link) {
                footerInquiry.href = settingsMap.inquiry_link;
            }

            // 2. 회사 정보 업데이트
            const footerCompanyName = document.querySelector('.footer-company-name');
            if (footerCompanyName && settingsMap.company_name) {
                footerCompanyName.textContent = settingsMap.company_name;
            }

            const footerCompanyAddress = document.querySelector('.footer-company-address');
            if (footerCompanyAddress && settingsMap.company_address) {
                footerCompanyAddress.textContent = settingsMap.company_address;
            }

            const footerBusinessNumber = document.querySelector('.footer-business-number');
            if (footerBusinessNumber && settingsMap.business_number) {
                if (settingsMap.telecom_license) {
                    footerBusinessNumber.textContent = `사업자등록번호: ${settingsMap.business_number} | 통신판매업신고: ${settingsMap.telecom_license}`;
                } else {
                    footerBusinessNumber.textContent = `사업자등록번호: ${settingsMap.business_number}`;
                }
            }

            // 3. 소셜미디어 링크 업데이트
            const socialLinks = {
                instagram: document.querySelector('a[href*="instagram"]'),
                facebook: document.querySelector('a[href*="facebook"]'),
                youtube: document.querySelector('a[href*="youtube"]')
            };

            if (socialLinks.instagram && settingsMap.instagram_link) {
                socialLinks.instagram.href = settingsMap.instagram_link;
            }
            if (socialLinks.facebook && settingsMap.facebook_link) {
                socialLinks.facebook.href = settingsMap.facebook_link;
            }
            if (socialLinks.youtube && settingsMap.youtube_link) {
                socialLinks.youtube.href = settingsMap.youtube_link;
            }

            // 4. 정책 링크 업데이트
            const policyLinks = document.querySelectorAll('.footer-section ul li a');
            policyLinks.forEach(link => {
                const text = link.textContent.trim();
                switch (text) {
                    case '회사소개':
                        if (settingsMap.about_us_link) link.href = settingsMap.about_us_link;
                        break;
                    case '채용정보':
                        if (settingsMap.careers_link) link.href = settingsMap.careers_link;
                        break;
                    case '이용약관':
                        if (settingsMap.terms_link) link.href = settingsMap.terms_link;
                        break;
                    case '개인정보처리방침':
                        if (settingsMap.privacy_link) link.href = settingsMap.privacy_link;
                        break;
                    case '배송조회':
                        if (settingsMap.delivery_track_link) link.href = settingsMap.delivery_track_link;
                        break;
                    case '교환/반품 안내':
                        if (settingsMap.return_guide_link) link.href = settingsMap.return_guide_link;
                        break;
                }
            });

            // 5. 푸터 하단 회사명 업데이트
            const footerBottom = document.querySelector('.footer-bottom p');
            if (footerBottom && settingsMap.company_name) {
                footerBottom.textContent = `© 2025 ${settingsMap.company_name}. All rights reserved.`;
            }

            console.log('푸터 내용 업데이트 완료');

        } catch (error) {
            console.error('푸터 업데이트 중 오류:', error);
        }
    }

    // 설정 초기화
    async resetToDefaults() {
        if (!confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
            return;
        }

        const defaultSettings = {
            // 고객센터 정보
            customer_phone: '1588-0000',
            customer_email: 'help@modernshop.com',
            faq_link: '/faq',
            inquiry_link: '/inquiry',

            // 회사 정보
            company_name: 'ModernShop',
            company_ceo: '홍길동',
            company_address: '서울특별시 강남구 테헤란로 123, 10층',
            telecom_license: '2024-서울강남-01234',
            business_number: '123-45-67890',
            company_website: 'https://modernshop.com',
            company_description: '프리미엄 온라인 쇼핑몰',

            // 소셜미디어 링크
            instagram_link: 'https://instagram.com/modernshop',
            facebook_link: 'https://facebook.com/modernshop',
            youtube_link: 'https://youtube.com/@modernshop',
            blog_link: 'https://blog.modernshop.com',

            // 운영 정보
            operating_hours: '평일 09:00-18:00',
            holiday_info: '토,일,공휴일 휴무',
            return_exchange_info: '구매 후 7일 이내',
            shipping_info: '전국 무료배송 (5만원 이상)',

            // 정책 링크
            about_us_link: '/about',
            careers_link: '/careers',
            terms_link: '/terms',
            privacy_link: '/privacy',
            delivery_track_link: '/delivery',
            return_guide_link: '/return'
        };

        try {
            let successCount = 0;
            const errors = [];

            for (const [key, value] of Object.entries(defaultSettings)) {
                try {
                    await this.saveSetting(key, value);
                    successCount++;
                } catch (error) {
                    errors.push(`${key}: ${error.message}`);
                }
            }

            if (successCount > 0) {
                this.showSuccess('설정이 기본값으로 초기화되었습니다!');
                await this.loadSettings();
            } else {
                this.showError(`초기화에 실패했습니다.\n오류: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('설정 초기화 중 오류:', error);
            this.showError('설정 초기화 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // 성공 메시지 표시
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // 경고 메시지 표시
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    // 에러 메시지 표시
    showError(message) {
        this.showNotification(message, 'error');
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        // 기존 알림이 있으면 제거
        const existing = document.querySelector('.settings-notification');
        if (existing) {
            existing.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `settings-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' :
                                type === 'warning' ? 'fa-exclamation-triangle' :
                                type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 설정 탭에 추가
        const settingsTab = document.getElementById('settingsTab');
        if (settingsTab) {
            settingsTab.insertBefore(notification, settingsTab.firstChild);
        }

        // 자동 제거 (5초 후)
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// 전역 함수들
let siteSettingsManager;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    siteSettingsManager = new SiteSettingsManager();
    // 전역 접근 가능하도록 설정
    window.siteSettingsManager = siteSettingsManager;
});

// 전역 함수들 (HTML에서 직접 호출)
function loadSiteSettings() {
    if (siteSettingsManager) {
        siteSettingsManager.loadSettings();
    }
}

function resetSiteSettings() {
    if (siteSettingsManager) {
        siteSettingsManager.resetToDefaults();
    }
}

// 내보내기 (모듈 시스템이 있는 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteSettingsManager;
}