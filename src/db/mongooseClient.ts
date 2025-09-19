import mongoose from 'mongoose';
import { mongoEnabled, assertMongoEnabled } from './mongoGate';

export async function connectMongoose(uri: string, opts: any = {}): Promise<void> {
  if (!(await mongoEnabled())) return;
  await mongoose.connect(uri, opts);
}

export async function safeCreate<T>(model: mongoose.Model<T>, doc: Partial<T>) {
  await assertMongoEnabled();
  return model.create(doc as any);
}

export async function safeUpdateOne<T>(model: mongoose.Model<T>, filter: any, update: any, options: any = {}) {
  await assertMongoEnabled();
  return model.updateOne(filter, update, options);
}

export async function safeDeleteOne<T>(model: mongoose.Model<T>, filter: any) {
  await assertMongoEnabled();
  return model.deleteOne(filter);
}

export async function safeFind<T>(model: mongoose.Model<T>, filter: any, projection?: any, options?: any) {
  await assertMongoEnabled();
  return model.find(filter, projection, options);
}


