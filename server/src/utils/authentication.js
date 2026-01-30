import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res
                .status(403)
                .json({ message: 'Invalid or expired token' });
        }

        req.user = decoded;
        next();
    });
}

export function generateToken(payload) {
    const secret = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secret, {
        expiresIn: '1d',
    });

    return token;
}
