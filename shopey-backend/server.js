require('dotenv').config();
const app = require('./src/app');
const { ensureDefaultAdmin } = require('./src/services/bootstrapAdminService');

const PORT = process.env.PORT || 5000;

(async () => {
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();