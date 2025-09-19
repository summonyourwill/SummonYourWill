// src/main/db.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { mongoEnabled } from '../db/mongoGate';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'SummonYourWill';

export async function connectMongo() {
  if (!(await mongoEnabled())) return;
  if (!uri) throw new Error('MONGODB_URI no configurada');
  await mongoose.connect(uri, { dbName });
  console.log('[Mongo] Conectado a', dbName);
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}
