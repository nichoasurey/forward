const express=require('express');

const app                    =express();
const path                   =require('path');
const config                 =require('config');
const moment                 =require('moment');
const ProxyAgent             =require('proxy-agent');
const {createProxyMiddleware}=require('http-proxy-middleware');

//////////////////////////////////////////////////////
// program start
//////////////////////////////////////////////////////

console.log('===================================');
console.log('|        all service init         |');
console.log('===================================');
console.log('NODE_ENV : ',process.env.NODE_ENV);

app.get('/hello',function(req,res){
  //res.header('Access-Control-Allow-Credentials', 'true');
  res.send('Hello World!');
});

let options={
  //'agent':new ProxyAgent('socks5://127.0.0.1:1086'),
  'target':config.get('target'), // 目标服务器 host
  'changeOrigin':true,               // 默认false，是否需要改变原始主机头为目标URL
  'ws':true,                         // 是否代理websockets
  'pathRewrite':{
    //"^/api/old-path" : "/api/new-path",     // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
    //"^/api/remove/path" : "/path"           // 同上
  },
  'router':{
    // 如果请求主机 == "dev.localhost:3000",
    // 重写目标服务器 "http://www.example.org" 为 "http://localhost:8000"
    //"dev.localhost:3000" : "http://localhost:8000"
  }
};
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use('/user',require('./routes/user'));

if(config.get('agent')){
  options.agent=new ProxyAgent(config.get('agent'));
}

let proxy=createProxyMiddleware(options);

app.use('/',proxy);

let port=config.get('port');
app.listen(port,function(){
  console.log('===================================');
  console.log('|   app listening on port '+port+'!   |');
  console.log('|  ',moment().format('YYMMDD HH:mm:ss'),'              |');
  console.log('===================================');
});

function graceful(){

  console.log('graceful');
  console.log('bye');
  process.exit(0);

}

process.on('SIGTERM',graceful);
process.on('SIGINT',graceful);










