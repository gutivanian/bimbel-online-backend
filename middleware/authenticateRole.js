// middleware/authenticateRole.js
const authenticateRole = (roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
        next();
    } else {
        res.status(403).send("Access denied");
    }
};

module.exports = authenticateRole;
