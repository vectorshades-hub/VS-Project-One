// Usage: npm run hash-password -- "your-password"
// Prints a bcrypt hash you can put in ADMIN_PASSWORD_HASH instead of ADMIN_PASSWORD.
const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 12));
