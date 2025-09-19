require('dotenv/config');
const { MongoClient } = require('mongodb');

const LOCAL_URI = process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017';
const ATLAS_URI = process.env.MONGODB_URI_ATLAS;
const DB_NAME   = process.env.MONGODB_DB_NAME || 'SummonYourWill';

const COLLECTIONS = [
  'familiars',
  'heroes',
  'partner',
  'partner_abilities',
  'pets',
  'villagechief',
  'villagechief_abilities',
  'villains'
];

function safeUri(uri) {
  try {
    const u = new URL(uri);
    if (u.username || u.password) {
      u.username = '***';
      u.password = '***';
    }
    return u.toString();
  } catch {
    return '<uri>';
  }
}

async function sync() {
  if (!ATLAS_URI) {
    console.error('Falta MONGODB_URI_ATLAS');
    process.exit(1);
  }

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    console.log('⏳ Sincronizando local → Atlas');
    console.log(`🟦 Local: ${LOCAL_URI} db=${DB_NAME}`);
    console.log(`🟩 Atlas: ${safeUri(ATLAS_URI)} db=${DB_NAME}`);

    await Promise.all([localClient.connect(), atlasClient.connect()]);
    const ldb = localClient.db(DB_NAME);
    const adb = atlasClient.db(DB_NAME);

    for (const name of COLLECTIONS) {
      const src = ldb.collection(name);
      const dst = adb.collection(name);

      const srcCount = await src.estimatedDocumentCount();
      console.log(`\n📚 ${name}: local=${srcCount}`);
      if (srcCount === 0) {
        console.log('  ↷ Sin datos en local, omitiendo.');
        continue;
      }

      const exists = await adb.listCollections({ name }).hasNext();
      if (!exists) {
        await adb.createCollection(name);
        console.log(`  ✔ Creada en Atlas: ${name}`);
      }

      const cursor = src.find({});
      const batchSize = 500;
      let ops = [];
      let copied = 0;
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        if (!doc) break;
        ops.push({
          replaceOne: {
            filter: { _id: doc._id },
            replacement: doc,
            upsert: true
          }
        });
        if (ops.length >= batchSize) {
          await dst.bulkWrite(ops, { ordered: false });
          copied += ops.length;
          console.log(`  → Copiados ${copied}/${srcCount}`);
          ops = [];
        }
      }
      if (ops.length) {
        await dst.bulkWrite(ops, { ordered: false });
        copied += ops.length;
        console.log(`  → Copiados ${copied}/${srcCount}`);
      }

      const dstCount = await dst.estimatedDocumentCount();
      console.log(`  ✅ Atlas ${name}: ${dstCount}`);
    }

    console.log('\n✅ Sincronización completada.');
  } catch (e) {
    console.error('❌ Error en sincronización:', e.message);
    process.exitCode = 1;
  } finally {
    await Promise.allSettled([localClient.close(), atlasClient.close()]);
  }
}

sync();


