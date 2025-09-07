const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/email');

const router = express.Router();

// 회원가입
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { email, password, name } = req.body;

        // 이메일 중복 확인
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // 비밀번호 해시화
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 이메일 인증 토큰 생성
        const verificationToken = require('crypto').randomBytes(32).toString('hex');

        // 사용자 생성
        const result = await query(
            `INSERT INTO users (email, password_hash, name, verification_token) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, name, role, status, created_at`,
            [email, passwordHash, name, verificationToken]
        );

        const user = result.rows[0];

        // 이메일 인증 토큰 저장
        await query(
            'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, verificationToken, new Date(Date.now() + 24 * 60 * 60 * 1000)] // 24시간 후 만료
        );

        // 인증 이메일 발송
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // 이메일 발송 실패해도 회원가입은 성공으로 처리
        }

        res.status(201).json({
            message: 'User registered successfully. Please check your email for verification.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 로그인
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { email, password } = req.body;

        // 사용자 조회
        const result = await query(
            'SELECT id, email, password_hash, name, role, status, email_verified FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 계정 상태 확인
        if (user.status !== 'active') {
            return res.status(401).json({ error: 'Account is not active' });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.email_verified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 이메일 인증
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // 토큰 확인
        const result = await query(
            `SELECT et.user_id, et.expires_at, u.email 
             FROM email_verification_tokens et
             JOIN users u ON et.user_id = u.id
             WHERE et.token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        const { user_id, expires_at, email } = result.rows[0];

        // 토큰 만료 확인
        if (new Date() > new Date(expires_at)) {
            return res.status(400).json({ error: 'Verification token expired' });
        }

        // 이메일 인증 완료
        await query(
            'UPDATE users SET email_verified = true WHERE id = $1',
            [user_id]
        );

        // 사용된 토큰 삭제
        await query(
            'DELETE FROM email_verification_tokens WHERE token = $1',
            [token]
        );

        res.json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, name, role, status, email_verified, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = router;
