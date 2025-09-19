"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seedFromFiles.ts (ejecútalo con ts-node o compílalo)
const db_1 = require("../src/main/db");
const heroesRepo_1 = require("../src/main/repos/heroesRepo");
const petsRepo_1 = require("../src/main/repos/petsRepo");
const villainsRepo_1 = require("../src/main/repos/villainsRepo");
const familiarsRepo_1 = require("../src/main/repos/familiarsRepo");
const partnerRepo_1 = require("../src/main/repos/partnerRepo");
const villageChiefRepo_1 = require("../src/main/repos/villageChiefRepo");
const saveRepo_1 = require("../src/main/repos/saveRepo");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const BASE = 'C:\\Users\\fijim\\OneDrive\\Documentos\\SummonYourWillSaves';
async function read(p) {
    return JSON.parse(await fs_1.promises.readFile(p, 'utf8'));
}
(async () => {
    await (0, db_1.connectMongo)();
    try {
        // Importar héroes
        try {
            const heroes = await read(path_1.default.join(BASE, 'heroes.json'));
            await (0, heroesRepo_1.upsertHeroes)(Array.isArray(heroes) ? heroes : heroes?.heroes ?? []);
            console.log('✓ Héroes importados');
        }
        catch (e) {
            console.log('⚠ No se encontró heroes.json o error:', e.message);
        }
        // Importar mascotas
        try {
            const pets = await read(path_1.default.join(BASE, 'pets.json'));
            await (0, petsRepo_1.upsertPets)(Array.isArray(pets) ? pets : pets?.pets ?? []);
            console.log('✓ Mascotas importadas');
        }
        catch (e) {
            console.log('⚠ No se encontró pets.json o error:', e.message);
        }
        // Importar villanos
        try {
            const villains = await read(path_1.default.join(BASE, 'villains.json'));
            await (0, villainsRepo_1.upsertVillains)(Array.isArray(villains) ? villains : villains?.villains ?? []);
            console.log('✓ Villanos importados');
        }
        catch (e) {
            console.log('⚠ No se encontró villains.json o error:', e.message);
        }
        // Importar familiares
        try {
            const familiars = await read(path_1.default.join(BASE, 'familiars.json'));
            await (0, familiarsRepo_1.upsertFamiliars)(Array.isArray(familiars) ? familiars : familiars?.familiars ?? []);
            console.log('✓ Familiares importados');
        }
        catch (e) {
            console.log('⚠ No se encontró familiars.json o error:', e.message);
        }
        // Importar compañero
        try {
            const partner = await read(path_1.default.join(BASE, 'partner.json'));
            await (0, partnerRepo_1.upsertPartner)(partner);
            console.log('✓ Compañero importado');
        }
        catch (e) {
            console.log('⚠ No se encontró partner.json o error:', e.message);
        }
        // Importar jefe de aldea
        try {
            const vc = await read(path_1.default.join(BASE, 'villagechief.json'));
            await (0, villageChiefRepo_1.upsertVillageChief)(vc);
            console.log('✓ Jefe de aldea importado');
        }
        catch (e) {
            console.log('⚠ No se encontró villagechief.json o error:', e.message);
        }
        // Importar save
        try {
            const save = await read(path_1.default.join(BASE, 'save.json'));
            await (0, saveRepo_1.upsertSave)(save);
            console.log('✓ Save importado');
        }
        catch (e) {
            console.log('⚠ No se encontró save.json o error:', e.message);
        }
        console.log('🎉 Seed completado exitosamente');
    }
    finally {
        await (0, db_1.disconnectMongo)();
    }
})();
