const OrderModel = require('../models/orders.model');

// Mendapatkan semua pesanan berdasarkan user_id
exports.getOrders = async (req, res) => {
    const { user_id } = req.query;
    try {
        const orders = await OrderModel.getOrders(user_id);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// Membuat pesanan baru
exports.createOrder = async (req, res) => {
    const { total_price, user_id, product_id, quantity } = req.body;

    try {
        const newOrder = await OrderModel.createOrder({ total_price, user_id, product_id, quantity });
        res.json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// Mendapatkan pesanan berdasarkan nomor pesanan
exports.getOrderByNumber = async (req, res) => {
    const { user_id } = req.query;
    const { orderNumber } = req.params;

    try {
        const order = await OrderModel.getOrderByNumber(user_id, orderNumber);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        console.error('Error fetching order by order_number:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// Melakukan checkout cart
exports.checkoutCart = async (req, res) => {
    const { user_id } = req.body;
    try {
        const { orders, order_number } = await OrderModel.checkoutCart(user_id);
        res.json({ orders, order_number });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Failed to checkout' });
    }
};
