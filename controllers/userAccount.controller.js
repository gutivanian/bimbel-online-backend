const User = require("../models/user.model");
const UserAccount = require("../models/userAccount.model");

// Fungsi untuk menyimpan atau memperbarui data akun user
exports.saveUserAccount = (req, res) => {
    const { username, ...accountData } = req.body;
    console.log('Request body:', req.body);

    User.findByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).send({
                message: err.message || 'Some error occurred while finding the User.'
            });
        }
        if (!user) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }

        const user_id = user.user_id;
        accountData.user_id = user_id;
        console.log('User ID Controller:', user_id);

        UserAccount.findByUserId(user_id, (err, existingAccount) => {
            // if (err) {
            //     return res.status(500).send({
            //         message: err.message || 'Some error occurred while finding the User Account.'
            //     });
            // }
            if (existingAccount) {
                console.log('Updating existing account');
                UserAccount.update(user_id, accountData, (err, data) => {
                    if (err) {
                        return res.status(500).send({
                            message: err.message || 'Some error occurred while updating the User Account.'
                        });
                    }
                    console.log('Updated account:', data);
                    res.send(data);
                });
            } else {
                console.log('Creating new account');
                console.log(accountData);
                UserAccount.create(accountData, (err, data) => {
                    if (err) {
                        return res.status(500).send({
                            message: err.message || 'Some error occurred while creating the User Account.'
                        });
                    }
                    console.log('Created account:', data);
                    res.send(data);
                });
            }
        });
    });
};

// Fungsi untuk mengambil data user account berdasarkan user_id
exports.getUserAccount = (req, res) => {
    const user_id = req.params.user_id;
    console.log('Fetching account for user_id:', user_id);

    UserAccount.findByUserId(user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found User Account with user_id ${user_id}.`
                });
            } else {
                return res.status(500).send({
                    message: "Error retrieving User Account with user_id " + user_id
                });
            }
        } else {
            res.send(data);
        }
    });
};

// Fungsi untuk mengambil semua data user account
exports.getAllUserAccounts = (req, res) => {
    UserAccount.getAll((err, data) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Some error occurred while retrieving user accounts."
            });
        } else {
            res.send(data);
        }
    });
};

// Fungsi untuk menghapus data user account berdasarkan user_id
exports.deleteUserAccount = (req, res) => {
    const user_id = req.params.user_id;
    console.log('Deleting account for user_id:', user_id);

    UserAccount.delete(user_id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found User Account with user_id ${user_id}.`
                });
            } else {
                return res.status(500).send({
                    message: "Could not delete User Account with user_id " + user_id
                });
            }
        } else {
            res.send({ message: `User Account was deleted successfully!` });
        }
    });
};
