// utils/utils.js

// Fungsi untuk konversi user_id ke basis 35
function convertToBase35(number) {
    const base35Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";

    while (number > 0) {
        const remainder = number % 35;
        result = base35Chars[remainder] + result;
        number = Math.floor(number / 35);
    }

    // Isi dengan '0' di awal agar panjang string menjadi 6
    return result.padStart(6, '0');
}

module.exports = { convertToBase35 };
