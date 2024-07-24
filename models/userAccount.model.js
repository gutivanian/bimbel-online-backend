const pool = require('../config/db.config');

// Fungsi utilitas untuk mengonversi string kosong atau spasi tunggal menjadi null
const convertEmptyToNull = (value) => {
    return value === '' || value === ' ' ? null : value;
};

const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
};

const UserAccount = function(account) {
    this.user_id = account.user_id;
    this.nama_lengkap = account.nama_lengkap;
    this.nama_panggilan = account.nama_panggilan;
    this.jenis_kelamin = account.jenis_kelamin;
    this.tanggal_lahir = account.tanggal_lahir;
    this.nomor_whatsapp = account.nomor_whatsapp;
    this.nomor_whatsapp_ortu = account.nomor_whatsapp_ortu;
    this.provinsi = account.provinsi;
    this.kota = account.kota;
    this.kecamatan = account.kecamatan;
    this.kelurahan = account.kelurahan;
    this.pendidikan_sekarang = account.pendidikan_sekarang;
    this.sekolah = account.sekolah;
    this.kelas = account.kelas;
    this.jurusan = account.jurusan;
    this.tahun_lulus_sma_smk = account.tahun_lulus_sma_smk;
    this.strata = account.strata;
    this.universitas = account.universitas;
    this.program_studi = account.program_studi;
    this.tahun_masuk = account.tahun_masuk;
    this.pendidikan_terakhir = account.pendidikan_terakhir;
    this.tahun_lulus = account.tahun_lulus;
};

// Mencari user account berdasarkan user_id
UserAccount.findByUserId = (user_id, result) => {
    pool.query(
        "SELECT * FROM user_account WHERE user_id = $1",
        [user_id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.rows.length) {
                console.log("found user account: ", res.rows[0]);
                result(null, res.rows[0]);
                return;
            }

            result({ kind: "not_found" }, null);
        }
    );
};

// Membuat user account baru
UserAccount.create = (newAccount, result) => {
    const tanggal_lahir = formatDate(newAccount.tanggal_lahir); // Konversi tanggal_lahir ke date
    const nomor_whatsapp = parseInt(newAccount.nomor_whatsapp); // Konversi nomor_whatsapp ke int
    const nomor_whatsapp_ortu = newAccount.nomor_whatsapp_ortu ? parseInt(newAccount.nomor_whatsapp_ortu) : null; // Konversi nomor_whatsapp_ortu ke int atau null

    pool.query(
        "INSERT INTO user_account (user_id, nama_lengkap, nama_panggilan, jenis_kelamin, tanggal_lahir, nomor_whatsapp, nomor_whatsapp_ortu, provinsi, kota, kecamatan, kelurahan, pendidikan_sekarang, sekolah, kelas, jurusan, tahun_lulus_sma_smk, strata, universitas, program_studi, tahun_masuk, pendidikan_terakhir, tahun_lulus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *",
        [newAccount.user_id, convertEmptyToNull(newAccount.nama_lengkap), convertEmptyToNull(newAccount.nama_panggilan), convertEmptyToNull(newAccount.jenis_kelamin), tanggal_lahir, nomor_whatsapp, nomor_whatsapp_ortu, convertEmptyToNull(newAccount.provinsi), convertEmptyToNull(newAccount.kota), convertEmptyToNull(newAccount.kecamatan), convertEmptyToNull(newAccount.kelurahan), convertEmptyToNull(newAccount.pendidikan_sekarang), convertEmptyToNull(newAccount.sekolah), convertEmptyToNull(newAccount.kelas), convertEmptyToNull(newAccount.jurusan), convertEmptyToNull(newAccount.tahun_lulus_sma_smk), convertEmptyToNull(newAccount.strata), convertEmptyToNull(newAccount.universitas), convertEmptyToNull(newAccount.program_studi), convertEmptyToNull(newAccount.tahun_masuk), convertEmptyToNull(newAccount.pendidikan_terakhir), convertEmptyToNull(newAccount.tahun_lulus)],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            console.log("created user account: ", res.rows[0]);
            result(null, res.rows[0]);
        }
    );
};

// Memperbarui user account
UserAccount.update = (user_id, accountData, result) => {
    const tanggal_lahir = formatDate(accountData.tanggal_lahir); // Konversi tanggal_lahir ke date
    const nomor_whatsapp = parseInt(accountData.nomor_whatsapp); // Konversi nomor_whatsapp ke int
    const nomor_whatsapp_ortu = accountData.nomor_whatsapp_ortu ? parseInt(accountData.nomor_whatsapp_ortu) : null; // Konversi nomor_whatsapp_ortu ke int atau null

    pool.query(
        "UPDATE user_account SET nama_lengkap = $1, nama_panggilan = $2, jenis_kelamin = $3, tanggal_lahir = $4, nomor_whatsapp = $5, nomor_whatsapp_ortu = $6, provinsi = $7, kota = $8, kecamatan = $9, kelurahan = $10, pendidikan_sekarang = $11, sekolah = $12, kelas = $13, jurusan = $14, tahun_lulus_sma_smk = $15, strata = $16, universitas = $17, program_studi = $18, tahun_masuk = $19, pendidikan_terakhir = $20, tahun_lulus = $21 WHERE user_id = $22 RETURNING *",
        [convertEmptyToNull(accountData.nama_lengkap), convertEmptyToNull(accountData.nama_panggilan), convertEmptyToNull(accountData.jenis_kelamin), tanggal_lahir, nomor_whatsapp, nomor_whatsapp_ortu, convertEmptyToNull(accountData.provinsi), convertEmptyToNull(accountData.kota), convertEmptyToNull(accountData.kecamatan), convertEmptyToNull(accountData.kelurahan), convertEmptyToNull(accountData.pendidikan_sekarang), convertEmptyToNull(accountData.sekolah), convertEmptyToNull(accountData.kelas), convertEmptyToNull(accountData.jurusan), convertEmptyToNull(accountData.tahun_lulus_sma_smk), convertEmptyToNull(accountData.strata), convertEmptyToNull(accountData.universitas), convertEmptyToNull(accountData.program_studi), convertEmptyToNull(accountData.tahun_masuk), convertEmptyToNull(accountData.pendidikan_terakhir), convertEmptyToNull(accountData.tahun_lulus), user_id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }

            if (res.rowCount === 0) {
                // Tidak ditemukan user dengan user_id tersebut
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated user account: ", res.rows[0]);
            result(null, res.rows[0]);
        }
    );
};

module.exports = UserAccount;
