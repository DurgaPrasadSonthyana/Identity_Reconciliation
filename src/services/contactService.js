"use strict";
// src/services/contactService.ts
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
exports.getOrCreateContact = getOrCreateContact;
const sequelize_1 = require("sequelize");
const contact_1 = __importDefault(require("../models/contact"));
/**
 * Finds or creates the correct contact cluster for the given email/phone,
 * and handles merging two existing primaries into one cluster if both fields
 * point to different primaries.
 */
function getOrCreateContact(email, phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // 1) If user supplied BOTH email & phone, check for two different primaries
        if (email && phoneNumber) {
            const emailContact = yield contact_1.default.findOne({ where: { email } });
            const phoneContact = yield contact_1.default.findOne({ where: { phoneNumber } });
            if (emailContact && phoneContact) {
                // figure out each record’s primary
                const emailPrimaryId = (_a = emailContact.linkedId) !== null && _a !== void 0 ? _a : emailContact.id;
                const phonePrimaryId = (_b = phoneContact.linkedId) !== null && _b !== void 0 ? _b : phoneContact.id;
                if (emailPrimaryId !== phonePrimaryId) {
                    // two different primary clusters → we must merge them
                    const primaries = yield contact_1.default.findAll({
                        where: { id: { [sequelize_1.Op.in]: [emailPrimaryId, phonePrimaryId] } },
                        order: [['createdAt', 'ASC']]
                    });
                    const [older, younger] = primaries; // older = keep as primary
                    // demote the younger
                    yield contact_1.default.update({ linkPrecedence: 'secondary', linkedId: older.id }, { where: { id: younger.id } });
                }
            }
        }
        // 2) Now look for ANY existing contact by email OR phone
        const existing = yield contact_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { email: email !== null && email !== void 0 ? email : null },
                    { phoneNumber: phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : null }
                ]
            }
        });
        // 2a) If none found, create a brand-new primary
        if (!existing) {
            const primary = yield contact_1.default.create({
                email: email !== null && email !== void 0 ? email : null,
                phoneNumber: phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : null,
                linkPrecedence: 'primary'
            });
            return buildResponse([primary]);
        }
        // 2b) We have at least one match. Compute the root primary ID:
        const primaryId = (_c = existing.linkedId) !== null && _c !== void 0 ? _c : existing.id;
        // 3) Load the entire cluster: the primary record + all secondaries
        let chain = yield contact_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { id: primaryId },
                    { linkedId: primaryId }
                ]
            }
        });
        // 4) If the incoming email or phone is brand-new to this cluster, insert as secondary
        const emailsInChain = new Set(chain.map(c => c.email).filter(Boolean));
        const phonesInChain = new Set(chain.map(c => c.phoneNumber).filter(Boolean));
        const needsNewSecondary = (email && !emailsInChain.has(email)) ||
            (phoneNumber && !phonesInChain.has(phoneNumber));
        if (needsNewSecondary) {
            yield contact_1.default.create({
                email, phoneNumber,
                linkedId: primaryId,
                linkPrecedence: 'secondary'
            });
            // reload the cluster after insertion
            chain = yield contact_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { id: primaryId },
                        { linkedId: primaryId }
                    ]
                }
            });
        }
        // 5) Build and return the normalized response
        return buildResponse(chain);
    });
}
/** Turn a raw array of Contact instances into the API response shape */
function buildResponse(chain) {
    // find the one marked primary
    const primary = chain.find(c => c.linkPrecedence === 'primary');
    if (!primary) {
        console.error('❌ buildResponse: no primary in chain', chain);
        throw new Error('Primary contact not found');
    }
    const emails = Array.from(new Set(chain.map(c => c.email).filter((e) => !!e && e.trim() !== '')));
    const phoneNumbers = Array.from(new Set(chain.map(c => c.phoneNumber).filter((p) => !!p && p.trim() !== '')));
    const secondaryContactIds = chain
        .filter(c => c.linkPrecedence === 'secondary')
        .map(c => c.id);
    return {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds
    };
}
