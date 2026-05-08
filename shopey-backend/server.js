require('dotenv').config();
const app = require('./src/app');
const { ensureDefaultAdmin } = require('./src/services/bootstrapAdminService');
const { ensureProductSearchIndexes } = require('./src/services/productIndexService');

const PORT = process.env.PORT || 5000;

(async () => {
  await ensureDefaultAdmin();
  await ensureProductSearchIndexes();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();