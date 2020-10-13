const router = require('koa-router')();
const wxRouter = require('./wx');

router.use('/xcxCi/wx', wxRouter.routes(), wxRouter.allowedMethods());

module.exports = router;
