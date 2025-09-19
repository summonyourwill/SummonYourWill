import { loadMongoFlag } from '../config/mongoFlag';

export async function mongoEnabled(): Promise<boolean> {
  return await loadMongoFlag();
}

export async function assertMongoEnabled(): Promise<void> {
  if (!(await mongoEnabled())) {
    throw new Error('MongoDB connection disabled by mongodbconnection.json');
  }
}


