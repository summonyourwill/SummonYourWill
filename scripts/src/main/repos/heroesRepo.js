"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hero = void 0;
exports.upsertHeroes = upsertHeroes;
// src/main/repos/heroesRepo.ts
const mongoose_1 = __importStar(require("mongoose"));
const HeroSchema = new mongoose_1.Schema({
    _id: { type: String }, // usa tu hero.id
    name: String,
    level: Number,
    // ... lo que tengas
}, { timestamps: true, strict: false });
exports.Hero = mongoose_1.default.models.Hero || mongoose_1.default.model('Hero', HeroSchema);
async function upsertHeroes(heroes) {
    if (!heroes?.length)
        return;
    // Para colecciones múltiples: iterar el array y hacer replaceOne por cada entidad usando su id como _id
    for (const hero of heroes) {
        const heroId = String(hero.id ?? hero._id);
        await exports.Hero.replaceOne({ _id: heroId }, { ...hero, _id: heroId }, { upsert: true });
    }
}
