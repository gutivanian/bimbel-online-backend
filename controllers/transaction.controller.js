const pool = require('../config/db.config');

exports.getPendingTransactions = async (req, res) => {
    const { user_id } = req.query;

    try {
        const result = await pool.query(`
            SELECT 
                o.order_number,
                p.expired_date,
                o.total_price,
                p.snap_token,
                p.midtrans_url
            FROM payments p
            JOIN orders o ON o.order_id = p.order_id
            WHERE p.status = 'Pending' 
            AND p.user_id = $1
            AND p.expired_date > NOW()
        `, [user_id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ error: 'Failed to fetch pending transactions' });
    }
};
