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
// src/server.ts
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const dbConfig_1 = require("./config/dbConfig");
const appConfig_1 = require("./config/appConfig");
(function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1) Make Sequelize create or update the table to match your model:
            yield dbConfig_1.sequelize.sync({ alter: true });
            console.log('✅ Database synced successfully');
            // 2) Then start your server:
            const port = Number(process.env.PORT) || appConfig_1.appConfig.port;
            app_1.default.listen(port, () => {
                console.log(`🚀 Server running on port ${port}`);
            });
        }
        catch (err) {
            console.error('❌ Failed to sync database:', err);
            process.exit(1);
        }
    });
})();
