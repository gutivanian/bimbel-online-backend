const pool = require('../config/db.config');
const { convertToBase35 } = require('../utils/utils'); // Import fungsi konversi user_id
const axios = require('axios');
const crypto = require('crypto');

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
// Ambil semua pembayaran
exports.getPayments = async (req, res) => {
    const result = await pool.query('SELECT * FROM payments');
    res.json(result.rows);
};

    exports.checkTransactionStatus = async (req, res) => {
        const { order_number } = req.params;

        try {
            // Mengambil status transaksi dari Midtrans
            const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${order_number}/status`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY).toString('base64')}`
                }
            });

            const {
                transaction_status,
                currency,
                payment_type,
                fraud_status,
                issuer,
                acquirer,
                settlement_time,
            } = response.data;

            // Update status transaksi di tabel payments berdasarkan order_number
            const updateResult = await pool.query(
                `UPDATE payments 
                SET status = $1, currency = $2, payment_type = $3, fraud_status = $4, 
                    issuer = $5, acquirer = $6, settlement_time = $7
                WHERE order_id = (SELECT order_id FROM orders WHERE order_number = $8) 
                RETURNING *`,
                [
                    transaction_status,
                    currency,
                    payment_type,
                    fraud_status,
                    issuer,
                    acquirer,
                    settlement_time,
                    order_number,
                ]
            );

            if (updateResult.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found for update' });
            }

            console.log('Payment status updated successfully:', updateResult.rows[0]);
            res.status(200).json({ message: 'Payment status updated successfully', data: updateResult.rows[0] });
        } catch (error) {
            console.error('Failed to fetch or update payment status:', error);
            res.status(500).json({ message: 'Failed to fetch or update payment status', error });
        }
    };


    
    // Antrian untuk menyimpan request pembayaran
    let paymentQueue = [];
    let processing = false; // Flag untuk memeriksa apakah sedang memproses pembayaran
    
    // Fungsi untuk memulai pemrosesan antrian
    const processQueue = async () => {
        console.log(processing)
        console.log(paymentQueue)
        if (processing || paymentQueue.length === 0) return;
    
        processing = true; // Tandai pemrosesan sedang berlangsung
        const paymentRequest = paymentQueue.shift(); // Ambil request pertama dari antrian
    
        try {
            console.log("masuk create payment request")
            result = await createPaymentInternal(paymentRequest); // Proses pembayaran
            return result
        } catch (error) {
            console.error('Error saat memproses pembayaran:', error);
        } finally {
            processing = false; // Pemrosesan selesai, periksa apakah ada request lain yang menunggu
            if (paymentQueue.length > 0) {
                setTimeout(processQueue, 1000); // Tunggu 1 detik sebelum memproses request berikutnya
            }
        }
    };
    
    // Fungsi untuk menambahkan request ke dalam antrian
    const enqueuePayment = (paymentRequest) => {
        paymentQueue.push(paymentRequest);
        console.log(`Order ${paymentRequest.order_number} ditambahkan ke antrian pembayaran.`);
        result = processQueue(); // Mulai proses antrian jika belum ada yang berjalan
        return result;

    };
    
    // Fungsi internal untuk proses pembayaran (tanpa antrian)
    const createPaymentInternal = async ({ order_number, amount, user_id }) => {
        user_id = parseInt(user_id, 10);
        try {
            console.log(`Memulai pembuatan pembayaran untuk order_number: ${order_number}...`);
            
            await pool.query('BEGIN'); // Mulai transaksi
    
            // Periksa apakah ada pembayaran pending sebelumnya
            const preTransactionCheck = await pool.query(
                'SELECT * FROM payments WHERE order_id = (SELECT order_id FROM orders WHERE order_number = $1) AND status = $2',
                [order_number, 'Pending']
            );
            if (preTransactionCheck.rows.length > 0) {
                console.log('Pembayaran pending sudah ada untuk order_number ini:', preTransactionCheck.rows);
                await pool.query('ROLLBACK'); // Batalkan transaksi jika sudah ada pending payment
                return { 
                    snapToken: preTransactionCheck.rows[0].snap_token,
                    midtransUrl: preTransactionCheck.rows[0].midtrans_url,
                    expiredDate: preTransactionCheck.rows[0].expired_date,
                    invoiceNumber: preTransactionCheck.rows[0].invoice_number,
                    message: 'Transaksi pending yang sudah ada ditemukan'
                };
            }
    
            // Mendapatkan order_id dan detail order (product_id, quantity)
            const orderResult = await pool.query(
                'SELECT order_id, product_id, quantity FROM orders WHERE order_number = $1 AND valid = true FOR UPDATE',
                [order_number]
            );
            if (orderResult.rows.length === 0) {
                await pool.query('ROLLBACK'); // Batalkan transaksi
                console.log('Order sudah divalidasi atau tidak ditemukan.');
                return { message: 'Order sudah tidak valid atau tidak ditemukan' };
            }
    
            const { order_id, product_id, quantity } = orderResult.rows[0];
    
            // Update kolom valid di tabel orders
            const updateOrder = await pool.query('UPDATE orders SET valid = false WHERE order_id = $1 RETURNING *', [order_id]);
            if (updateOrder.rowCount === 0) {
                await pool.query('ROLLBACK');
                console.error('Gagal mengupdate status valid pada tabel orders');
                return { message: 'Gagal mengupdate status order' };
            }
    
            // Kurangi quantity di tabel products berdasarkan product_id
            const updateProductQuantity = await pool.query(
                'UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1 RETURNING *',
                [quantity, product_id]
            );
            if (updateProductQuantity.rowCount === 0) {
                await pool.query('ROLLBACK');
                console.error('Gagal mengurangi quantity produk atau stok tidak mencukupi');
                return { message: 'Gagal mengurangi quantity produk atau stok tidak mencukupi' };
            }
    
            // Ambil atau tingkatkan invoiceCount di CustInvoice
            let invoiceCount;
            const invoiceCheck = await pool.query(
                'SELECT invoiceCount FROM CustInvoice WHERE user_id = $1',
                [user_id]
            );
    
            const userCode = convertToBase35(user_id);
    
            if (invoiceCheck.rows.length === 0) {
                invoiceCount = 1;
                await pool.query(
                    'INSERT INTO CustInvoice (user_id, userCode, invoiceCount) VALUES ($1, $2, $3)',
                    [user_id, userCode, invoiceCount]
                );
            } else {
                invoiceCount = invoiceCheck.rows[0].invoicecount + 1;
                await pool.query(
                    'UPDATE CustInvoice SET invoiceCount = $1 WHERE user_id = $2',
                    [invoiceCount, user_id]
                );
            }
    
            // Format nomor invoice
            const formattedInvoiceCount = invoiceCount < 10000 ? String(invoiceCount).padStart(4, '0') : invoiceCount;
            const invoiceNumber = `INVFE-${userCode}-${formattedInvoiceCount}`;
    
            // Menghitung tanggal kadaluarsa
            const expiredDate = new Date(Date.now() + 60 * 60 * 1000);
    
            const parameter = {
                transaction_details: { order_id: order_number, gross_amount: Number(amount) },
                credit_card: { secure: true },
                customer_details: { user_id, email: `${user_id}@example.com`, phone: "08111222333" },
                expiry: { start_time: new Date().toISOString().slice(0, 19).replace('T', ' ') + ' +0000', unit: 'minute', duration: 60 },
                callbacks: { finish: "" }
            };
    
            // Mendapatkan token Snap dari Midtrans
            const response = await axios.post(
                'https://app.sandbox.midtrans.com/snap/v1/transactions',
                parameter,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY).toString('base64')}`
                    }
                }
            );
    
            const snapToken = response.data.token;
            const midtransUrl = response.data.redirect_url;
    
            // Insert record pembayaran ke tabel payments
            const result = await pool.query(
                `INSERT INTO payments (order_id, status, user_id, snap_token, midtrans_url, expired_date, invoice_number)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [order_id, 'Pending', user_id, snapToken, midtransUrl, expiredDate, invoiceNumber]
            );
    
            await pool.query('COMMIT'); // Commit transaksi jika berhasil
            console.log(`Pembayaran untuk order_number ${order_number} berhasil dibuat`);
            console.log("Snaptoken:")
            console.log(snapToken);
            console.log("midtransUrl:" + midtransUrl)
            console.log("Expired Date:" + expiredDate)
            console.log("Invoice Number:" + invoiceNumber)
            
    
            return {
                snapToken: snapToken,
                midtransUrl: midtransUrl,
                expiredDate: expiredDate,
                invoiceNumber: invoiceNumber,
                message: 'Transaksi berhasil dibuat dan token Snap berhasil diperoleh'
            };
    
        } catch (error) {
            await pool.query('ROLLBACK'); // Rollback transaksi jika ada error
            console.error(`Gagal membuat pembayaran untuk order_number ${order_number}:`, error);
            return { message: 'Gagal membuat snapshot', error };
        }
    };
    
    // Endpoint untuk membuat pembayaran
    exports.createPayment = async (req, res) => {
        const { order_number, amount, user_id } = req.body;
        try {
            // Tambahkan request ke antrian
            const paymentRequest = { order_number, amount, user_id };
            const result = await enqueuePayment(paymentRequest);
    
            res.json(result);
            console.log(result);
        } catch (error) {
            res.status(500).json({ message: 'Error saat mengantri pembayaran', error });
        }
    };


    exports.handleWebhook = async (req, res) => {
        const notification = req.body;
        console.log(`Received webhook notification: ${JSON.stringify(notification)}`);
    
        try {
            // Ambil data penting dari notifikasi
            const { order_id, status_code, gross_amount, signature_key, transaction_status } = notification;
    
            // Verifikasi signature key
            const input = order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY;
            const generatedSignature = crypto.createHash('sha512').update(input).digest('hex');
    
            if (generatedSignature !== signature_key) {
                return res.status(401).json({ message: 'Invalid signature key' });
            }
    
            // Perbarui status pembayaran di database
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
    
                // Perbarui status pembayaran
                const updatePaymentQuery = `
                    UPDATE payments
                    SET status = $1, settlement_time = $2
                    WHERE order_id = (SELECT order_id FROM orders WHERE order_number = $3)
                    RETURNING *;
                `;
                const updateResult = await client.query(updatePaymentQuery, [
                    transaction_status,
                    notification.settlement_time || null,
                    order_id,
                ]);
    
                if (updateResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ message: 'Order not found for update' });
                }
    
                // Jika status transaksi gagal, expired, atau dibatalkan, kembalikan stok
                if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
                    console.log(`Transaction ${order_id} failed. Returning stock...`);
    
                    const returnStockQuery = `
                        UPDATE products
                        SET stock = stock + (
                            SELECT quantity FROM orders WHERE order_number = $1
                        )
                        WHERE product_id = (
                            SELECT product_id FROM orders WHERE order_number = $1
                        )
                    `;
                    await client.query(returnStockQuery, [order_id]);
                }
    
                await client.query('COMMIT');
    
                console.log(`Transaction status for order ${order_id} updated successfully`);
                res.status(200).json({ message: 'Transaction status updated successfully' });
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error updating payment status:', error);
                res.status(500).json({ message: 'Failed to update payment status', error });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    };    
