import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this-in-production';

export function signQrToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '60s' }); // Short-lived token
}

export function verifyQrToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}
