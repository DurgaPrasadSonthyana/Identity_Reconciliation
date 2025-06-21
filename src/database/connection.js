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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDb = void 0;
const dbConfig_1 = require("../config/dbConfig");
const initializeDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbConfig_1.sequelize.sync(); // Sync all models with the database
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
exports.initializeDb = initializeDb;
