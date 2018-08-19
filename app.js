const fs = require('fs');
const Koa = require('koa');
const json = require('koa-json');
const route = require('koa-route');

const app = new Koa();
app.use(json());

const files = fs.readdirSync(__dirname + '/src/routes');
files.forEach(f => {
  if (f.endsWith('.js')) {
    const module = require(__dirname + '/src/routes/' + f);

    ['get', 'post', 'delete', 'put', 'all'].forEach(method => {
      module[method] && Object.keys(module[method]).forEach(fn => {
        const path = '/' + f.replace(/.js$/g, '') + '/' + fn;
        app.use(route[method](path, module[method][fn]));
      })
    });
  }
});

app.listen(3000);