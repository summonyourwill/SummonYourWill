"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
exports.disconnectMongo = disconnectMongo;
// src/main/db.ts
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'SummonYourWill';
async function connectMongo() {
    if (!uri)
        throw new Error('MONGODB_URI no configurada');
    await mongoose_1.default.connect(uri, { dbName });
    console.log('[Mongo] Conectado a', dbName);
}
async function disconnectMongo() {
    await mongoose_1.default.disconnect();
}
