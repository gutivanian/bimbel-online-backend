const pool = require("../config/db.config");

const User = function(user) {
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.role = user.role; // Tambahkan role
};

// Buat pengguna baru
// Update fungsi create untuk memasukkan role
User.create = (newUser, result) => {
    pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [newUser.username, newUser.email, newUser.password, newUser.role], // Tambahkan role di sini
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            console.log("created user: ", res.rows[0]);
            result(null, res.rows[0]);
        }
    );
};

// Cek apakah username atau email sudah ada
User.checkExistence = (username, email, result) => {
    pool.query(
        "SELECT * FROM users WHERE username = $1 OR email = $2",
        [username, email],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            // Jika ada hasil, berarti username atau email sudah ada
            result(null, res.rows);
        }
    );
};

// Temukan pengguna berdasarkan username
User.findByUsername = (username, result) => {
    console.log('Executing query to find user by username:', username); // Log username yang dicari
    pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
        (err, res) => {
            if (err) {
                console.log("error executing query: ", err); // Log error eksekusi query
                result(err, null);
                return;
            }
            console.log('Query result:', res.rows); // Log hasil query
            if (res.rows.length === 0) {
                console.log('User not found for username:', username); // Log jika user tidak ditemukan
                result({ kind: "not_found" }, null);
                return;
            }
            console.log('User found:', res.rows[0]); // Log user yang ditemukan
            result(null, res.rows[0]);
        }
    );
};

module.exports = User;
