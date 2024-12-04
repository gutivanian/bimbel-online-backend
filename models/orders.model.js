const pool = require('../config/db.config');
const { convertToBase35 } = require('../utils/utils');

const OrderModel = {
    // Mendapatkan semua pesanan berdasarkan user_id
    getOrders: async (user_id) => {
        const result = await pool.query(`
            SELECT 
                o.order_number, 
                o.total_price, 
                o.quantity, 
                o.product_id, 
                p.name AS product_name, 
                p.price AS price_per_quantity,
                o.quantity * p.price AS subtotal
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            LEFT JOIN payments py ON py.order_id = o.order_id
            WHERE o.user_id = $1 AND o.valid = true and py.payment_id IS NULL
        `, [user_id]);
        console.log(result)
        return result.rows;
    },

    // Membuat order baru
    createOrder: async ({ total_price, user_id, product_id, quantity }) => {
        const userCode = convertToBase35(user_id);

        await pool.query('BEGIN'); // Mulai transaksi

        // Check jika user sudah ada di tabel CustOrder
        const custOrderResult = await pool.query('SELECT orderCount FROM CustOrder WHERE user_id = $1', [user_id]);

        let orderCount;
        if (custOrderResult.rows.length === 0) {
            orderCount = 1;
            await pool.query('INSERT INTO CustOrder (user_id, userCode, orderCount) VALUES ($1, $2, $3)', [user_id, userCode, orderCount]);
        } else {
            orderCount = custOrderResult.rows[0].ordercount + 1;
            await pool.query('UPDATE CustOrder SET orderCount = $1 WHERE user_id = $2', [orderCount, user_id]);
        }

        // Format orderCount menjadi 4 digit
        const formattedOrderCount = orderCount < 10000 ? String(orderCount).padStart(4, '0') : orderCount;
        const order_number = `ORDFE-${userCode}-${formattedOrderCount}`;

        // Insert ke tabel orders
        const result = await pool.query(
            'INSERT INTO orders (order_number, total_price, user_id, product_id, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [order_number, total_price, user_id, product_id, quantity]
        );

        await pool.query('COMMIT'); // Commit transaksi

        return result.rows[0];
    },

    // Mendapatkan pesanan berdasarkan nomor pesanan dan user_id
    getOrderByNumber: async (user_id, orderNumber) => {
        const result = await pool.query(`
            SELECT 
                o.order_number, 
                o.total_price, 
                o.quantity, 
                o.product_id, 
                p.name AS product_name, 
                p.price AS price_per_quantity,
                o.quantity * p.price AS subtotal
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.user_id = $1 AND o.order_number = $2
        `, [user_id, orderNumber]);

        return result.rows.length > 0 ? result.rows[0] : null;
    },

    // Melakukan checkout berdasarkan cart
    checkoutCart: async (user_id) => {
        const timestamp = Date.now();
        const order_number = `ORDRFE-${user_id}-${timestamp}`; // Generate order_number

        // Ambil semua item di cart
        const cartItems = await pool.query('SELECT * FROM cart WHERE user_id = $1', [user_id]);

        if (cartItems.rows.length === 0) {
            throw new Error('Cart is empty');
        }

        const orderPromises = cartItems.rows.map(async (item) => {
            const { product_id, quantity } = item;
            const product = await pool.query('SELECT price FROM products WHERE product_id = $1', [product_id]);
            const total_price = product.rows[0].price * quantity;

            const order = await pool.query(
                'INSERT INTO orders (total_price, user_id, product_id, quantity, order_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [total_price, user_id, product_id, quantity, order_number]
            );
            return order.rows[0];
        });

        const orders = await Promise.all(orderPromises);

        // Hapus isi keranjang setelah checkout
        await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

        return { orders, order_number };
    }
};

module.exports = OrderModel;
