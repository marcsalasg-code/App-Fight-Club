const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const secret = crypto.randomBytes(32).toString('base64');
const envContent = `\nAUTH_SECRET="${secret}"\n`;

try {
    fs.appendFileSync(envPath, envContent);
    console.log('AUTH_SECRET added to .env');
} catch (err) {
    console.error('Error writing to .env:', err);
}
