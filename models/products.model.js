const pool = require('../config/db.config');

const ProductModel = {
    // Mendapatkan semua produk
    getProducts: async () => {
        const result = await pool.query('SELECT * FROM products');
        return result.rows;
    },
    getProductsFromTryOut: async ({exam_schedule_id}) => {
        const result = await pool.query(`
            SELECT * FROM products p
            LEFT JOIN exam_schedule es ON es.id = p.exam_schedule_id 
            LEFT JOIN product_type pt ON pt.id = p."type"
            WHERE es.id = $1
        `,[exam_schedule_id]);
        return result.rows;
    },
    getProductsPaket: async ({classtype}) => {
        const result = await pool.query(`
            SELECT * FROM products p
            WHERE p.type = 10
            AND p.classtype = $1
        `,[classtype]);
        return result.rows;
    },
    
    // Menambahkan produk baru
    createProduct: async ({ name, description, price, stock }) => {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, stock]
        );
        return result.rows[0];
    }
};

module.exports = ProductModel;
