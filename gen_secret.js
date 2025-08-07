// gen_secret.js — положите в D:/programming/flashcards_app/
import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

const key = randomBytes(64).toString('hex');
const envPath = join('backend', '.env'); // помещаем в backend

writeFileSync(envPath, `SECRET_KEY=${key}\n`, { encoding: 'utf8', flag: 'w' });
console.log(`✅ SECRET_KEY сгенерирован и записан в ${envPath}`);