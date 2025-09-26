// 엑셀 업로드 및 일괄 상품 등록 기능
class ExcelUploader {
    constructor() {
        this.selectedFile = null;
        this.parsedData = [];
        this.validData = [];
        this.errors = [];
        this.currentUploadIndex = 0;
        this.uploadResults = {
            success: [],
            failed: []
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 드래그 앤 드롭 이벤트
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        }

        // 파일 선택 이벤트
        const excelFileInput = document.getElementById('excelFile');
        if (excelFileInput) {
            excelFileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // 파일 형식 검증
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                           'application/vnd.ms-excel'];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            this.showError('지원하지 않는 파일 형식입니다. .xlsx 또는 .xls 파일을 선택해주세요.');
            return;
        }

        // 파일 크기 검증 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
            return;
        }

        this.selectedFile = file;
        this.showSelectedFile(file);
        this.parseExcelFile(file);
    }

    showSelectedFile(file) {
        const selectedFileDiv = document.getElementById('selectedFile');
        const filename = selectedFileDiv.querySelector('.filename');
        const filesize = selectedFileDiv.querySelector('.filesize');

        filename.textContent = file.name;
        filesize.textContent = this.formatFileSize(file.size);
        selectedFileDiv.style.display = 'flex';

        // 업로드 영역 숨기기
        document.getElementById('uploadArea').style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    parseExcelFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // 첫 번째 시트 읽기
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // JSON으로 변환
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                this.processExcelData(jsonData);

            } catch (error) {
                console.error('엑셀 파일 파싱 오류:', error);
                this.showError('엑셀 파일을 읽는 중 오류가 발생했습니다.');
            }
        };

        reader.onerror = () => {
            this.showError('파일을 읽는 중 오류가 발생했습니다.');
        };

        reader.readAsArrayBuffer(file);
    }

    processExcelData(rawData) {
        if (rawData.length < 2) {
            this.showError('데이터가 없거나 헤더 행이 없습니다.');
            return;
        }

        // 헤더 행과 데이터 행 분리
        const headers = rawData[0];
        const dataRows = rawData.slice(1);

        // 필수 컬럼 확인
        const requiredColumns = ['상품명', '브랜드', '가격', '카테고리'];
        const optionalColumns = ['설명', '이미지URL', '재고수량', '할인율'];
        const allColumns = [...requiredColumns, ...optionalColumns];

        const missingRequired = requiredColumns.filter(col => !headers.includes(col));
        if (missingRequired.length > 0) {
            this.showError(`필수 컬럼이 누락되었습니다: ${missingRequired.join(', ')}`);
            return;
        }

        this.parsedData = [];
        this.errors = [];
        this.validData = [];

        dataRows.forEach((row, index) => {
            const rowData = {};
            const rowErrors = [];

            // 각 컬럼 데이터 매핑
            headers.forEach((header, colIndex) => {
                if (allColumns.includes(header)) {
                    rowData[header] = row[colIndex];
                }
            });

            // 데이터 검증
            this.validateRowData(rowData, index + 2, rowErrors); // +2는 헤더 행과 0-based 인덱스 보정

            if (rowErrors.length === 0) {
                this.validData.push({
                    row: index + 2,
                    data: this.transformRowData(rowData)
                });
            } else {
                this.errors.push({
                    row: index + 2,
                    errors: rowErrors,
                    data: rowData
                });
            }

            this.parsedData.push({
                row: index + 2,
                data: rowData,
                errors: rowErrors,
                isValid: rowErrors.length === 0
            });
        });

        this.displayPreview();
    }

    validateRowData(data, rowNumber, errors) {
        // 상품명 검증
        if (!data['상품명'] || data['상품명'].toString().trim() === '') {
            errors.push('상품명이 비어있습니다');
        }

        // 브랜드 검증
        if (!data['브랜드'] || data['브랜드'].toString().trim() === '') {
            errors.push('브랜드가 비어있습니다');
        }

        // 가격 검증
        const price = parseFloat(data['가격']);
        if (isNaN(price) || price < 0) {
            errors.push('가격이 유효하지 않습니다');
        }

        // 카테고리 검증
        const validCategories = ['패션', '전자제품', '뷰티', '홈&리빙'];
        if (!data['카테고리'] || !validCategories.includes(data['카테고리'])) {
            errors.push(`카테고리가 유효하지 않습니다. 사용 가능: ${validCategories.join(', ')}`);
        }

        // 재고수량 검증 (선택사항)
        if (data['재고수량'] !== undefined && data['재고수량'] !== '') {
            const stock = parseInt(data['재고수량']);
            if (isNaN(stock) || stock < 0) {
                errors.push('재고수량이 유효하지 않습니다');
            }
        }

        // 할인율 검증 (선택사항)
        if (data['할인율'] !== undefined && data['할인율'] !== '') {
            const discount = parseFloat(data['할인율']);
            if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('할인율은 0-100 사이의 값이어야 합니다');
            }
        }

        // 이미지URL 검증 (선택사항)
        if (data['이미지URL'] && data['이미지URL'].toString().trim() !== '') {
            const url = data['이미지URL'].toString().trim();
            try {
                new URL(url);
            } catch {
                errors.push('이미지URL 형식이 올바르지 않습니다');
            }
        }
    }

    transformRowData(data) {
        return {
            productName: data['상품명']?.toString().trim() || '',
            productBrand: data['브랜드']?.toString().trim() || '',
            productPrice: parseFloat(data['가격']) || 0,
            productCategory: data['카테고리']?.toString().trim() || '',
            productDescription: data['설명']?.toString().trim() || '',
            productImageUrl: data['이미지URL']?.toString().trim() || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format',
            productStock: parseInt(data['재고수량']) || 0,
            productDiscount: parseFloat(data['할인율']) || 0
        };
    }

    displayPreview() {
        const previewSection = document.getElementById('previewSection');
        const totalRows = document.getElementById('totalRows');
        const validRows = document.getElementById('validRows');
        const errorRows = document.getElementById('errorRows');

        // 통계 업데이트
        totalRows.textContent = this.parsedData.length;
        validRows.textContent = this.validData.length;
        errorRows.textContent = this.errors.length;

        // 미리보기 테이블 생성
        this.createPreviewTable();

        // 오류 목록 표시
        if (this.errors.length > 0) {
            this.displayErrors();
        }

        // 미리보기 섹션 표시
        previewSection.style.display = 'block';

        // 업로드 버튼 활성화/비활성화
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = this.validData.length === 0;

        if (this.validData.length === 0) {
            uploadBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 유효한 데이터 없음';
        } else {
            uploadBtn.innerHTML = `<i class="fas fa-upload"></i> ${this.validData.length}개 상품 등록`;
        }
    }

    createPreviewTable() {
        const previewHeader = document.getElementById('previewHeader');
        const previewBody = document.getElementById('previewBody');

        // 헤더 생성
        previewHeader.innerHTML = `
            <tr>
                <th>행</th>
                <th>상태</th>
                <th>상품명</th>
                <th>브랜드</th>
                <th>가격</th>
                <th>카테고리</th>
                <th>재고</th>
                <th>할인율</th>
            </tr>
        `;

        // 데이터 행 생성 (최대 10개만 표시)
        const displayData = this.parsedData.slice(0, 10);
        previewBody.innerHTML = '';

        displayData.forEach(item => {
            const row = document.createElement('tr');
            if (!item.isValid) {
                row.classList.add('error-row');
            }

            const statusIcon = item.isValid ?
                '<i class="fas fa-check-circle" style="color: #28a745;"></i>' :
                '<i class="fas fa-exclamation-circle" style="color: #dc3545;"></i>';

            row.innerHTML = `
                <td>${item.row}</td>
                <td>${statusIcon}</td>
                <td>${item.data['상품명'] || ''}</td>
                <td>${item.data['브랜드'] || ''}</td>
                <td>${item.data['가격'] || ''}</td>
                <td>${item.data['카테고리'] || ''}</td>
                <td>${item.data['재고수량'] || 0}</td>
                <td>${item.data['할인율'] || 0}%</td>
            `;

            previewBody.appendChild(row);
        });

        // 더 많은 데이터가 있는 경우 표시
        if (this.parsedData.length > 10) {
            const moreRow = document.createElement('tr');
            moreRow.innerHTML = `
                <td colspan="8" style="text-align: center; font-style: italic; color: #6c757d;">
                    ... 및 ${this.parsedData.length - 10}개 행 더
                </td>
            `;
            previewBody.appendChild(moreRow);
        }
    }

    displayErrors() {
        const errorList = document.getElementById('errorList');
        const errorDetails = document.getElementById('errorDetails');

        errorDetails.innerHTML = '';

        this.errors.forEach(error => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>행 ${error.row}:</strong> ${error.errors.join(', ')}`;
            errorDetails.appendChild(li);
        });

        errorList.style.display = 'block';
    }

    async startBulkUpload() {
        if (this.validData.length === 0) {
            this.showError('업로드할 유효한 데이터가 없습니다.');
            return;
        }

        // UI 초기화
        this.resetUploadState();
        this.showUploadProgress();

        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < this.validData.length; i++) {
            const item = this.validData[i];

            // 진행률 업데이트
            this.updateProgress(i + 1, this.validData.length);

            try {
                await this.uploadSingleProduct(item.data);
                successCount++;
                this.uploadResults.success.push(item);

                // 성공 카운트 업데이트
                document.getElementById('successCount').textContent = successCount;

                // 잠시 대기 (너무 빠른 요청 방지)
                await this.delay(100);

            } catch (error) {
                console.error(`상품 등록 실패 (행 ${item.row}):`, error);
                failureCount++;
                this.uploadResults.failed.push({
                    ...item,
                    error: error.message || '알 수 없는 오류'
                });

                // 실패 카운트 업데이트
                document.getElementById('failureCount').textContent = failureCount;
            }
        }

        // 업로드 완료 처리
        this.completeUpload(successCount, failureCount);
    }

    async uploadSingleProduct(productData) {
        if (!window.supabase) {
            throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.');
        }

        const { data, error } = await window.supabase
            .from('products')
            .insert([{
                name: productData.productName,
                brand: productData.productBrand,
                price: productData.productPrice,
                category: productData.productCategory,
                description: productData.productDescription,
                image_urls: productData.productImageUrl ? [productData.productImageUrl] : [],
                stock: productData.productStock,
                discount: productData.productDiscount,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    resetUploadState() {
        this.currentUploadIndex = 0;
        this.uploadResults = {
            success: [],
            failed: []
        };
    }

    showUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadResult = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadBtn');

        uploadProgress.style.display = 'block';
        uploadResult.style.display = 'none';
        uploadBtn.disabled = true;

        // 초기값 설정
        document.getElementById('currentProgress').textContent = '0';
        document.getElementById('totalProgress').textContent = this.validData.length;
        document.getElementById('successCount').textContent = '0';
        document.getElementById('failureCount').textContent = '0';
        document.getElementById('progressFill').style.width = '0%';
    }

    updateProgress(current, total) {
        const percentage = Math.round((current / total) * 100);

        document.getElementById('currentProgress').textContent = current;
        document.getElementById('progressFill').style.width = percentage + '%';
    }

    completeUpload(successCount, failureCount) {
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadResult = document.getElementById('uploadResult');
        const uploadBtn = document.getElementById('uploadBtn');

        // 진행률 숨기기
        uploadProgress.style.display = 'none';

        // 결과 표시
        document.getElementById('finalSuccessCount').textContent = successCount;
        document.getElementById('finalFailureCount').textContent = failureCount;

        // 상세 결과 생성
        this.displayUploadResults();

        // 결과 섹션 표시
        uploadResult.style.display = 'block';

        // 업로드 버튼 재활성화
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> 상품 일괄 등록';
    }

    displayUploadResults() {
        const resultDetails = document.getElementById('resultDetails');
        resultDetails.innerHTML = '';

        if (this.uploadResults.failed.length > 0) {
            const failedSection = document.createElement('div');
            failedSection.innerHTML = '<h6 style="color: #dc3545; margin-bottom: 0.5rem;">실패한 항목:</h6>';

            const failedList = document.createElement('ul');
            failedList.style.margin = '0';
            failedList.style.paddingLeft = '1.5rem';

            this.uploadResults.failed.forEach(item => {
                const li = document.createElement('li');
                li.style.color = '#dc3545';
                li.style.marginBottom = '0.25rem';
                li.innerHTML = `행 ${item.row}: ${item.data.productName} - ${item.error}`;
                failedList.appendChild(li);
            });

            failedSection.appendChild(failedList);
            resultDetails.appendChild(failedSection);
        }

        if (this.uploadResults.success.length > 0) {
            const successInfo = document.createElement('div');
            successInfo.style.marginTop = '1rem';
            successInfo.innerHTML = `
                <p style="color: #28a745; margin: 0;">
                    <i class="fas fa-check-circle"></i>
                    ${this.uploadResults.success.length}개 상품이 성공적으로 등록되었습니다.
                </p>
            `;
            resultDetails.appendChild(successInfo);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showError(message) {
        // 간단한 에러 표시 (필요시 더 정교한 UI로 교체)
        alert('오류: ' + message);
        console.error('엑셀 업로드 오류:', message);
    }
}

// 전역 함수들 (HTML에서 직접 호출)
let excelUploader;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    excelUploader = new ExcelUploader();
});

// 상품 탭 전환 함수
function showProductTab(tabName) {
    const tabs = document.querySelectorAll('.product-tab-btn');
    const contents = document.querySelectorAll('.product-tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.style.display = 'none');

    document.querySelector(`[onclick="showProductTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').style.display = 'block';
}

// 템플릿 다운로드 함수
function downloadTemplate() {
    // 템플릿 데이터 생성
    const templateData = [
        ['상품명', '브랜드', '가격', '카테고리', '설명', '이미지URL', '재고수량', '할인율'],
        ['샘플 상품1', '샘플 브랜드', 29900, '패션', '이것은 샘플 상품 설명입니다.', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&auto=format', 100, 10],
        ['샘플 상품2', '또다른 브랜드', 59900, '전자제품', '또 다른 샘플 상품입니다.', 'https://images.unsplash.com/photo-1560472355-536de3962603?w=300&h=300&fit=crop&auto=format', 50, 0]
    ];

    // 엑셀 파일 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 컬럼 너비 설정
    ws['!cols'] = [
        { width: 20 }, // 상품명
        { width: 15 }, // 브랜드
        { width: 10 }, // 가격
        { width: 12 }, // 카테고리
        { width: 30 }, // 설명
        { width: 50 }, // 이미지URL
        { width: 12 }, // 재고수량
        { width: 10 }  // 할인율
    ];

    XLSX.utils.book_append_sheet(wb, ws, '상품목록');

    // 파일 다운로드
    const fileName = `상품등록_템플릿_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// 파일 선택 처리 함수
function handleFileSelect(event) {
    if (excelUploader) {
        excelUploader.handleFileSelect(event);
    }
}

// 선택된 파일 제거
function clearSelectedFile() {
    document.getElementById('selectedFile').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('excelFile').value = '';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('uploadBtn').innerHTML = '<i class="fas fa-upload"></i> 상품 일괄 등록';

    if (excelUploader) {
        excelUploader.selectedFile = null;
        excelUploader.parsedData = [];
        excelUploader.validData = [];
        excelUploader.errors = [];
    }
}

// 일괄 업로드 시작
function startBulkUpload() {
    if (excelUploader) {
        excelUploader.startBulkUpload();
    }
}

// 업로드 초기화
function resetBulkUpload() {
    clearSelectedFile();
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'none';
}