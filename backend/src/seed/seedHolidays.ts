import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Holiday } from '../models/Holiday';

const year = 2026;
const holidays: [string, string][] = [
  [`${year}-01-01`, 'Jour de l an'],
  [`${year}-04-06`, 'Lundi de Paques'],
  [`${year}-05-01`, 'Fete du Travail'],
  [`${year}-05-08`, 'Victoire 1945'],
  [`${year}-05-14`, 'Ascension'],
  [`${year}-05-25`, 'Lundi de Pentecote'],
  [`${year}-07-14`, 'Fete nationale'],
  [`${year}-08-15`, 'Assomption'],
  [`${year}-11-01`, 'Toussaint'],
  [`${year}-11-11`, 'Armistice 1918'],
  [`${year}-12-25`, 'Noel'],
];

async function seed() {
  await connectDB();
  for (const [date, name] of holidays) {
    await Holiday.updateOne(
      { date: new Date(date) },
      { date: new Date(date), name },
      { upsert: true }
    );
  }
  console.log(`✅ ${holidays.length} jours feries inseres pour ${year}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });