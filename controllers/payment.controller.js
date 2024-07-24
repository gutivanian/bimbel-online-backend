// controllers/payment.controller.js
const coreApi = require('../config/midtransConfig');

exports.createTransaction = async (req, res) => {
    try {
        const orderId = 'order-id-' + new Date().getTime();
        const transactionDetails = {
            transaction_details: {
                order_id: orderId,
                gross_amount: req.body.amount
            },
            customer_details: {
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone
            },
            item_details: req.body.items // Array of items
        };

        const response = await coreApi.charge(transactionDetails);
        
        // Only return the necessary parts of the response
        res.json({
            status_code: response.status_code,
            status_message: response.status_message,
            transaction_id: response.transaction_id,
            order_id: response.order_id,
            gross_amount: response.gross_amount,
            payment_type: response.payment_type,
            transaction_time: response.transaction_time,
            transaction_status: response.transaction_status,
            fraud_status: response.fraud_status
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.paymentNotification = async (req, res) => {
    try {
        const notification = await coreApi.transaction.notification(req.body);
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        // Log or handle the notification details
        console.log(`Order ID: ${orderId}, Transaction Status: ${transactionStatus}, Fraud Status: ${fraudStatus}`);

        // Update status pembayaran di database
        // Misalnya, dengan model dari Sequelize atau ORM yang digunakan

        res.json({ status: 'ok' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
