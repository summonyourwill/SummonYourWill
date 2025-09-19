import { MongoClient } from 'mongodb';
import { mongoEnabled, assertMongoEnabled } from './mongoGate';

let client: MongoClient | null = null;

export async function getClient(uri: string): Promise<MongoClient | null> {
  if (!(await mongoEnabled())) return null;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function safeInsertOne(dbName: string, coll: string, doc: any) {
  await assertMongoEnabled();
  if (!client) throw new Error('No MongoClient (connection disabled or not initialized)');
  return client.db(dbName).collection(coll).insertOne(doc);
}


