"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContactRequest = void 0;
const validateContactRequest = (req, res, next) => {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Either email or phone number is required.' });
    }
    next();
};
exports.validateContactRequest = validateContactRequest;
