const nodemailer = require('nodemailer');
require('dotenv').config();

// 이메일 전송 설정
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 이메일 인증 메일 발송
const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
        from: `"ModernShop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ModernShop 이메일 인증',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">ModernShop 이메일 인증</h2>
                <p>안녕하세요! ModernShop 회원가입을 완료하기 위해 이메일 인증을 진행해주세요.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #3498db; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        이메일 인증하기
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    위 버튼이 작동하지 않는다면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    이 링크는 24시간 후 만료됩니다.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// 비밀번호 재설정 메일 발송
const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
        from: `"ModernShop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ModernShop 비밀번호 재설정',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">비밀번호 재설정</h2>
                <p>비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #e74c3c; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        비밀번호 재설정하기
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    위 버튼이 작동하지 않는다면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    이 링크는 1시간 후 만료됩니다.<br>
                    만약 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Password reset email sending failed:', error);
        throw error;
    }
};

// 주문 완료 알림 메일 발송
const sendOrderConfirmationEmail = async (email, orderData) => {
    const mailOptions = {
        from: `"ModernShop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[ModernShop] 주문 완료 - 주문번호 ${orderData.orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">주문이 완료되었습니다!</h2>
                
                <h3>주문 정보</h3>
                <p><strong>주문번호:</strong> ${orderData.orderNumber}</p>
                <p><strong>주문일자:</strong> ${orderData.orderDate}</p>
                <p><strong>고객명:</strong> ${orderData.customerName}</p>
                <p><strong>주문시간:</strong> ${orderData.orderTime}</p>
                
                <h3>주문 상품</h3>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${orderData.orderItems}</pre>
                </div>
                
                <h3>총 결제금액</h3>
                <p style="font-size: 18px; font-weight: bold; color: #e74c3c;">${orderData.totalAmount}원</p>
                
                <p>감사합니다. ModernShop 드림</p>
                <p>고객센터: 1588-0000</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Order confirmation email sending failed:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail
};
