"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// __tests__/contact.test.ts
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const dbConfig_1 = require("../config/dbConfig");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // reset all tables
    yield dbConfig_1.sequelize.sync({ force: true });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dbConfig_1.sequelize.close();
}));
describe('POST /api/contact/identify', () => {
    it('1) creates a new primary contact', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({ email: 'foo@bar.com', phoneNumber: '123456' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            contact: {
                primaryContactId: expect.any(Number),
                emails: ['foo@bar.com'],
                phoneNumbers: ['123456'],
                secondaryContactIds: []
            }
        });
    }));
    it('2) adds a secondary when same phone, new email', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({ email: 'mcfly@hillvalley.edu', phoneNumber: '123456' });
        expect(res.status).toBe(200);
        const c = res.body.contact;
        expect(c.primaryContactId).toBe(1);
        expect(c.emails.sort()).toEqual(expect.arrayContaining(['foo@bar.com', 'mcfly@hillvalley.edu']));
        expect(c.phoneNumbers).toEqual(['123456']);
        expect(c.secondaryContactIds).toHaveLength(1);
    }));
    it('3) returns same chain when querying by email only', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({ email: 'foo@bar.com' });
        expect(res.status).toBe(200);
        expect(res.body.contact.primaryContactId).toBe(1);
        expect(res.body.contact.emails.sort()).toEqual(expect.arrayContaining(['foo@bar.com', 'mcfly@hillvalley.edu']));
    }));
    it('4) returns same chain when querying by phone only', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({ phoneNumber: '123456' });
        expect(res.status).toBe(200);
        expect(res.body.contact.primaryContactId).toBe(1);
        expect(res.body.contact.phoneNumbers).toEqual(['123456']);
    }));
    it('5) creates a brand-new primary for completely new details', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({ email: 'new@domain.com', phoneNumber: '999999' });
        expect(res.status).toBe(200);
        expect(res.body.contact.primaryContactId).toBe(3);
        expect(res.body.contact.emails).toEqual(['new@domain.com']);
        expect(res.body.contact.phoneNumbers).toEqual(['999999']);
        expect(res.body.contact.secondaryContactIds).toEqual([]);
    }));
    it('6) 400 if neither email nor phoneNumber provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/contact/identify')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: 'Either email or phone number is required.'
        });
    }));
});
