"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.appConfig = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'secret_key',
};
