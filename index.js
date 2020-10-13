const config = require('./config/config')
const Koa = require('koa');
const router = require('./routes/routes');
const bodyparser = require('koa-bodyparser');
const formidable = require('koa2-formidable');
const cors = require('koa2-cors');
const app = new Koa();
// 处理webhooks的request payload
app.use(formidable());
app.use(bodyparser());
// 允许跨域
app.use(cors())

app.use(router.routes());

// 添加0.0.0.0是为了获取ip时直接获取ipv4（192.168.0.0），而不是ipv6(::ffff:192.168.0.0)
app.listen(config.port, '0.0.0.0', () => {
  console.log(`启动成功${config.port}`)
});
