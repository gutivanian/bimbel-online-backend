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

// Delete user by ID
User.deleteUser = (userId, result) => {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;

    pool.query(query, [userId], (err, res) => {
        if (err) {
            console.error("Error deleting user:", err);
            result(err, null);
            return;
        }

        if (res.rows.length === 0) {
            result({ kind: "not_found" }, null);
            return;
        }
 
        console.log("Deleted user with id:", res.rows[0].id);
        result(null, res.rows[0]);
    });
};



// Update user data
User.updateUser = (userId, updatedData, result) => {
    const { username, email, oldPassword, newPassword } = updatedData;

    // Langkah 1: Periksa old password
    const queryCheckPassword = `SELECT password FROM users WHERE id = $1`;

    pool.query(queryCheckPassword, [userId], (err, res) => {
        if (err) {
            console.error("Error checking old password:", err);
            result(err, null);
            return;
        }

        if (res.rows.length === 0) {
            result({ message: "User not found" }, null);
            return;
        }

        const currentPassword = res.rows[0].password;

        if (currentPassword !== oldPassword) {
            result({ message: "Old password does not match" }, null);
            return;
        }

        // Langkah 2: Update user data (password, username, email)
        const queryUpdateUser = `
            UPDATE users
            SET username = $1, email = $2, password = $3
            WHERE id = $4
            RETURNING id, username, email, role, last_login, create_date
        `;

        pool.query(
            queryUpdateUser,
            [username, email, newPassword, userId],
            (updateErr, updateRes) => {
                if (updateErr) {
                    console.error("Error updating user data:", updateErr);
                    result(updateErr, null);
                    return;
                }

                if (updateRes.rows.length === 0) {
                    result({ message: "Update failed" }, null);
                    return;
                }

                result(null, updateRes.rows[0]);
            }
        );
    });
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
 
User.findById = (id, result) => {
    console.log('Executing query to find user by id:', id); // Log username yang dicari
    pool.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [id],
        (err, res) => {
            if (err) { 
                console.log("error executing query: ", err); // Log error eksekusi query
                result(err, null);
                return;
            }
            console.log('Query result:', res.rows); // Log hasil query
            if (res.rows.length === 0) {
                console.log('User not found for id:', id); // Log jika user tidak ditemukan
                result({ kind: "not_found" }, null);
                return;
            }
            console.log('User found:', res.rows[0]); // Log user yang ditemukan
            result(null, res.rows[0]);
        }
    );

}; 

// Update last_login untuk username tertentu
User.updateLastLogin = (username, result) => {
    pool.query(
        "UPDATE users SET last_login = NOW() WHERE username = $1 RETURNING *",
        [username],
        (err, res) => {
            if (err) {
                console.log("Error updating last_login:", err);
                result(err, null);
                return;
            }
            console.log("Updated last_login for user:", res.rows[0]);
            result(null, res.rows[0]);
        }
    );
};


User.getUserDataByRole = (role, result) => {
    console.log('Executing query to find users by role:', role); // Log role yang dicari
    pool.query(
        "SELECT * FROM v_dashboard_UserData WHERE role = $1",
        [role],
        (err, res) => {
            if (err) {
                console.error("Error executing query:", err); // Log error eksekusi query
                result(err, null);
                return;
            }
            console.log('Query result:', res.rows); // Log hasil query
            if (res.rows.length === 0) {
                console.log('No users found for role:', role); // Log jika tidak ada user ditemukan
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, res.rows); // Kembalikan semua baris hasil query
        }
    );
};

User.getPaginatedUsers = async ({ role, page, limit, search, sortBy, order }, result) => {
    const offset = (page - 1) * limit; // Hitung offset berdasarkan halaman

    const query = `
        SELECT 
            *
        FROM v_dashboard_UserData
        WHERE role = $1
        AND (LOWER(name) LIKE $2 OR LOWER(email) LIKE $2)
        ORDER BY ${sortBy} ${order}
        LIMIT $3 OFFSET $4
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM v_dashboard_UserData
        WHERE role = $1
        AND (LOWER(name) LIKE $2 OR LOWER(email) LIKE $2)
    `;

    const values = [role, `%${search.toLowerCase()}%`, limit, offset];
    const countValues = [role, `%${search.toLowerCase()}%`];

    try {
        const data = await pool.query(query, values);
        const count = await pool.query(countQuery, countValues);

        result(null, {
            rows: data.rows,
            total: parseInt(count.rows[0].total, 10), // Total jumlah data
        });
    } catch (error) {
        result(error, null);
    }
};

User.getTotalUsersAndGrowthByRole = async (role, result) => {
    try {
        const currentCountQuery = `
            SELECT COUNT(*) AS total 
            FROM users
            WHERE role = $1;
        `;
        const lastMonthCountQuery = `
            SELECT COUNT(*) AS total 
            FROM users
            WHERE role = $1 AND create_date >= NOW() - INTERVAL '1 MONTH';
        `;

        const currentCountResult = await pool.query(currentCountQuery, [role]);
        const lastMonthCountResult = await pool.query(lastMonthCountQuery, [role]);

        const totalUsers = currentCountResult.rows[0].total;
        const lastMonthUsers = lastMonthCountResult.rows[0].total;

        // Calculate growth
        const growthPercentage = lastMonthUsers === 0 
            ? 0 
            : ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100;

        result(null, {
            totalUsers,
            growthPercentage: parseFloat(growthPercentage.toFixed(2))
        });
    } catch (err) {
        console.error('Error fetching total users and growth:', err);
        result(err, null);
    }
};


// Dapatkan jumlah pengguna aktif dan pertumbuhan berdasarkan role
User.getActiveUsersAndGrowthByRole = async (role, result) => {
    try {
        const activeUsersQuery = `
            SELECT COUNT(*) AS activeUsers
            FROM users
            WHERE role = $1 AND last_login >= NOW() - INTERVAL '14 DAYS';
        `;

        const lastMonthActiveUsersQuery = `
            SELECT COUNT(*) AS lastMonthActiveUsers
            FROM users
            WHERE role = $1 AND last_login >= NOW() - INTERVAL '30 DAYS';
        `;

        const activeUsersResult = await pool.query(activeUsersQuery, [role]);
        const lastMonthActiveUsersResult = await pool.query(lastMonthActiveUsersQuery, [role]);

        const activeUsers = parseInt(activeUsersResult.rows[0].activeusers, 10);
        const lastMonthActiveUsers = parseInt(lastMonthActiveUsersResult.rows[0].lastmonthactiveusers, 10);

        // Calculate growth
        const growthPercentage = lastMonthActiveUsers === 0
            ? 0
            : ((activeUsers - lastMonthActiveUsers) / lastMonthActiveUsers) * 100;

        result(null, {
            activeUsers,
            growthPercentage: parseFloat(growthPercentage.toFixed(2))
        });
    } catch (err) {
        console.error("Error fetching active users and growth: ", err);
        result(err, null);
    }
};

// Dapatkan jumlah pengguna baru dan pertumbuhan berdasarkan role
User.getNewUsersAndGrowthByRole = async (role, result) => {
    try {
        // Query untuk pengguna baru bulan ini
        const currentMonthQuery = `
            SELECT COUNT(*) AS newUsers
            FROM users
            WHERE role = $1 AND create_date >= DATE_TRUNC('month', NOW());
        `;

        // Query untuk pengguna baru bulan lalu
        const previousMonthQuery = `
            SELECT COUNT(*) AS previousMonthUsers
            FROM users
            WHERE role = $1 AND create_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 MONTH'
              AND create_date < DATE_TRUNC('month', NOW());
        `;

        const currentMonthResult = await pool.query(currentMonthQuery, [role]);
        const previousMonthResult = await pool.query(previousMonthQuery, [role]);

        const newUsers = parseInt(currentMonthResult.rows[0].newusers, 10);
        const previousMonthUsers = parseInt(previousMonthResult.rows[0].previousmonthusers, 10);

        // Hitung pertumbuhan
        const growthPercentage = previousMonthUsers === 0
            ? 0
            : ((newUsers - previousMonthUsers) / previousMonthUsers) * 100;

        result(null, {
            newUsers,
            growthPercentage: parseFloat(growthPercentage.toFixed(2))
        });
    } catch (err) {
        console.error("Error fetching new users and growth: ", err);
        result(err, null);
    }
};

User.getRevenuePerUser = async (role, result) => {
    try {
        const query = `
            WITH current_quarter_revenue AS (
                SELECT 
                    COALESCE(AVG(o.total_price)::NUMERIC, 0) AS avg_revenue_current_quarter
                FROM 
                    payments p
                JOIN 
                    users u ON p.user_id = u.id
                JOIN 
                    orders o ON o.order_id = p.order_id
                WHERE 
                    p.status = 'Settlement'
                    AND u.role = $1
                    AND EXTRACT(QUARTER FROM p.payment_date) = EXTRACT(QUARTER FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            ),
            previous_quarter_revenue AS (
                SELECT 
                    COALESCE(AVG(o.total_price)::NUMERIC, 0) AS avg_revenue_previous_quarter
                FROM 
                    payments p
                JOIN 
                    users u ON p.user_id = u.id
                JOIN 
                    orders o ON o.order_id = p.order_id
                WHERE 
                    p.status = 'Settlement'
                    AND u.role = $1
                    AND (
                        (EXTRACT(QUARTER FROM p.payment_date) = EXTRACT(QUARTER FROM CURRENT_DATE) - 1
                        AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE))
                        OR (EXTRACT(QUARTER FROM CURRENT_DATE) = 1 AND EXTRACT(QUARTER FROM p.payment_date) = 4 
                        AND EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1)
                    )
            )
            SELECT 
                current_quarter_revenue.avg_revenue_current_quarter,
                previous_quarter_revenue.avg_revenue_previous_quarter,
                CASE 
                    WHEN previous_quarter_revenue.avg_revenue_previous_quarter = 0 THEN 0
                    ELSE ((current_quarter_revenue.avg_revenue_current_quarter - previous_quarter_revenue.avg_revenue_previous_quarter) 
                          / previous_quarter_revenue.avg_revenue_previous_quarter) * 100
                END AS growth_percentage
            FROM 
                current_quarter_revenue, 
                previous_quarter_revenue;
        `;
        const values = [role];
        const { rows } = await pool.query(query, values);

        // Pastikan hasil berupa angka di sini juga (parse bila diperlukan)
        if (rows[0]) {
            rows[0].avg_revenue_current_quarter = parseFloat(rows[0].avg_revenue_current_quarter);
            rows[0].avg_revenue_previous_quarter = parseFloat(rows[0].avg_revenue_previous_quarter);
            rows[0].growth_percentage = parseFloat(rows[0].growth_percentage);
        }

        result(null, rows[0]);
    } catch (err) {
        console.error('Error fetching revenue per user:', err);
        result(err, null);
    }
};

User.getStudentPendidikanDistribution = async (result) => {
    try {
        const query = `
            SELECT 
                CASE
                    WHEN ua.pendidikan_sekarang = 'Kuliah' THEN 
                        COALESCE(ua.strata, 'Other')
                    WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                    ELSE ua.pendidikan_sekarang
                END AS pendidikan_group,
                COUNT(*) AS total
            FROM 
                users u
            LEFT JOIN 
                user_account ua ON u.id = ua.id
            WHERE
                u.role = 'student'
            GROUP BY 
                CASE
                    WHEN ua.pendidikan_sekarang = 'Kuliah' THEN 
                        COALESCE(ua.strata, 'Other')
                    WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                    ELSE ua.pendidikan_sekarang
                END;
                
        `;
        const { rows } = await pool.query(query);

        // Pastikan hasilnya dikembalikan
        result(null, rows);
    } catch (err) {
        console.error('Error fetching pendidikan distribution:', err);
        result(err, null);
    }
};

User.getStudentGrowth = async (result) => {
    try {
        const query = `
            WITH student_data AS (
                SELECT
                    COALESCE(
                        CASE
                            WHEN ua.pendidikan_sekarang = 'Kuliah' THEN CONCAT('Kuliah - ', ua.strata)
                            WHEN ua.pendidikan_sekarang IS NULL OR ua.pendidikan_sekarang = '' THEN 'Other'
                            ELSE ua.pendidikan_sekarang
                        END,
                        'Other'
                    ) AS pendidikan_group,
                    to_char(
                        (u.create_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'),
                        'IYYY-IW'
                    ) AS year_week
                FROM users u
                LEFT JOIN user_account ua ON u.id = ua.id
            )
            SELECT
                pendidikan_group,
                year_week,
                COUNT(*) AS total
            FROM student_data
            GROUP BY pendidikan_group, year_week
            ORDER BY year_week ASC, pendidikan_group ASC;
        `;

        const { rows } = await pool.query(query);
        result(null, rows);
    } catch (err) {
        console.error("Error fetching student growth data:", err);
        result(err, null);
    }
};  

User.getUserDetailsById = (userId, result) => {
    const query = `
        SELECT
            u.username,
            u.email,
            u.create_date,
            u.last_login,
            ua.tanggal_lahir,
            ua.nomor_whatsapp,
            ua.tahun_lulus_sma_smk,
            ua.tahun_masuk,
            ua.tahun_lulus,
            ua.nomor_whatsapp_ortu,
            ua.provinsi,
            ua.kota,
            ua.kecamatan,
            ua.kelurahan,
            ua.pendidikan_sekarang,
            ua.sekolah,
            ua.kelas,
            ua.jurusan,
            ua.pendidikan_terakhir,
            ua.strata,
            ua.nama_lengkap,
            ua.nama_panggilan,
            ua.jenis_kelamin,
            ua.universitas,
            ua.program_studi
        FROM users u
        JOIN user_account ua ON u.id = ua.id
        WHERE u.id = $1
    `;

    pool.query(query, [userId], (err, res) => {
        if (err) {
            console.error("Error fetching user details:", err);
            result(err, null);
        } else {
            const filteredData = {};
            for (const key in res.rows[0]) {
                if (res.rows[0][key] !== null) {
                    filteredData[key] = res.rows[0][key];
                }
            }
            result(null, filteredData);
        }
    });
};
 
User.searchUsersByRoleAndName = async (role, searchTerm) => {
    const query = `
        SELECT userid, name
        FROM v_dashboard_userdata
        WHERE role = $1 AND name ILIKE $2
        ORDER BY name ASC
        LIMIT 50
    `;
    const values = [role, `%${searchTerm}%`];

    try {
        const res = await pool.query(query, values);
        return res.rows;
    } catch (error) {
        throw error;
    }
};
 
User.searchUsersByRolesAndName = async (roles, searchTerm) => {
    const query = `
        SELECT userid, name
        FROM v_dashboard_userdata
        WHERE role IN (${roles.map((_, i) => `$${i + 1}`).join(', ')})
        AND name ILIKE $${roles.length + 1}
        ORDER BY name ASC
        LIMIT 50
    `;
 
    const values = [...roles, `%${searchTerm}%`];

    try {
        const res = await pool.query(query, values);
        return res.rows;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

User.getStudentGroup = async () => {
    try {
        const query = `
          SELECT 
            dgu.id,
            dgu.name,
            dgu.id_list,
            array_agg(vdu.name) AS user_names
          FROM 
            dimgroupstudent dgu
          CROSS JOIN LATERAL UNNEST(dgu.id_list) AS user_id
          JOIN 
            v_dashboard_userdata vdu ON vdu.userid = user_id
          WHERE dgu.status = 1
          GROUP BY 
            dgu.id, dgu.name;
        `;
        const result = await pool.query(query);
        return result.rows;
      } catch (error) {
        throw new Error(`Error fetching student groups: ${error.message}`);
      }
    
};

module.exports = User;
 