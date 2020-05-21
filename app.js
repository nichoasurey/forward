const express=require('express');

const app                    =express();
const config                 =require('config');
const moment                 =require('moment');
//const ProxyAgent             =require('proxy-agent');
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


let proxy=createProxyMiddleware(config.get('options'));

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










