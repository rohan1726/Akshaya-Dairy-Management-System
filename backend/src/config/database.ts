import mongoose from 'mongoose';
import logger from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/akshaya_dairy';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', { error: err });
    throw err;
  }
}

// Helper: convert Mongoose doc (or lean object) to API shape with string id
export function toApiDoc(doc: mongoose.Document | Record<string, any> | null): any {
  if (!doc) return null;
  const obj = (doc as mongoose.Document).toObject ? (doc as mongoose.Document).toObject() : { ...doc };
  return { ...obj, id: obj._id?.toString?.() || obj._id, _id: obj._id?.toString?.() || obj._id };
}

export function toApiDocs(docs: mongoose.Document[]): any[] {
  return docs.map((d) => toApiDoc(d)!);
}

export default { connectDatabase, toApiDoc, toApiDocs };
