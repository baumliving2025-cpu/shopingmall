const { Pool } = require('pg');
require('dotenv').config();

let pool;

const connectDB = async () => {
    try {
        const config = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };

        pool = new Pool(config);

        // 연결 테스트
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();

        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return pool;
};

const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

const getClient = async () => {
    return await pool.connect();
};

module.exports = {
    connectDB,
    getPool,
    query,
    getClient
};
