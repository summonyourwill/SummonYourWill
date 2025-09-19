// scripts/verifyCluster.cjs
const mongoose = require('mongoose');

const uri = process.argv[2];
const dbName = process.argv[3] || 'SummonYourWill';

if (!uri) {
  console.error('Uso: node scripts/verifyCluster.cjs "<mongodb+srv uri>" [dbName]');
  process.exit(1);
}

const isObjectId = (v) => v && typeof v === 'object' && v.constructor && v.constructor.name === 'ObjectId';

async function main(){
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;

  const vc = await db.collection('villagechief').findOne({});
  console.log('villagechief._id is ObjectId?', isObjectId(vc && vc._id), vc && String(vc && vc._id));

  const hero = await db.collection('heroes').findOne({});
  console.log('heroes._chief_id is ObjectId?', isObjectId(hero && hero._chief_id));

  const pet = await db.collection('pets').findOne({});
  console.log('pets._chief_id is ObjectId?', isObjectId(pet && pet._chief_id));
  console.log('pets._id_hero is ObjectId?', isObjectId(pet && pet._id_hero));

  const vil = await db.collection('villains').findOne({});
  console.log('villains._chief_id is ObjectId?', isObjectId(vil && vil._chief_id));

  const fam = await db.collection('familiars').findOne({});
  console.log('familiars._chief_id is ObjectId?', isObjectId(fam && fam._chief_id));

  const partner = await db.collection('partner').findOne({});
  console.log('partner._chief_id is ObjectId?', isObjectId(partner && partner._chief_id));

  const vca = await db.collection('villagechief_abilities').findOne({});
  console.log('villagechief_abilities._chief_id is ObjectId?', isObjectId(vca && vca._chief_id));

  const pa = await db.collection('partner_abilities').findOne({});
  console.log('partner_abilities._chief_id is ObjectId?', isObjectId(pa && pa._chief_id));
  console.log('partner_abilities._partner_id is ObjectId?', isObjectId(pa && pa._partner_id));

  await mongoose.disconnect();
}

main().catch(async (e) => { console.error(e); try { await mongoose.disconnect(); } catch(_){} process.exit(1); });
