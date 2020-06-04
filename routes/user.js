

const config = require('config');

const express = require('express');

const moment = require('moment');

const router = express.Router();

// const gFun = require('./public/util/GlobalFunc.js');

router.get('/home', async function (req, res, next) {
    res.render('user/home', {
        title : '233',
    })
});

router.get('/login', async function (req, res, next) {

  console.log(' ');
  console.log('===============================================================================================');
  console.log('userInfo ',moment().format('YYMMDD HH:mm:ss'));
  console.log('===============================================================================================');

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  let session = req.session;
  let cookies = req.cookies;

  let evn_mode    =  cookies.evn_mode;
  let platform    =  cookies.platform;
  let get_access_token = "";

  let campaign_id = '5d564201db73c330640f4886';

  console.log('ip',ip);
  console.log('evn_mode'    , evn_mode);
  console.log('platform'    , platform);


  //服务器端
  //用使用者client cookie中的 advanced-wemall
  //去获取access_token
  let get_access_token_options = {
    method : 'GET',
    rejectUnauthorized: false,
    uri : 'https://m.yimishiji.com/member/get-access-token'+ "?timestamp=" + (new Date()).valueOf(),
    headers : {
      'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie' : req.headers.cookie
    },
    json : true // Automatically stringifies the body to JSON
  };
  let get_access_token_result = {
    status      : '-1',
    status_text : ''
  };

  //地址栏中传了access_token就直接拿(目前只有小程序情况下会带)

  console.log('req.query----------------------');
  console.log(req.query);
  //小程序中未登录状态
  if(req.query.access_token === 'none'){
    //在APP中直接返还-1，去登录页
    res.status(200);
    res.json({
      status : '-1',
      status_text : '小程序中未登录状态'
    });
    return;
  }
  let Cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
    let parts = Cookie.split('=');
    Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  if(req.query.access_token){
    console.log('req.query.access_token----------------------');
    console.log(req.query.access_token);
    get_access_token = req.query.access_token;
    if(session.access_token !== get_access_token ){
      session['_' + campaign_id + '_player_id'] = undefined;
    }

    session.access_token = get_access_token;
    get_access_token_result = {
      status : '2',
      status_text : '从请求链接中获取了access_token',
      results:[{
        access_token: get_access_token
      }]
    }
  }
  else if(Cookies.app_growth_token){
    console.log('Cookies.app_growth_token----------------------');
    console.log(Cookies.app_growth_token);
    get_access_token = Cookies.app_growth_token;
    res.clearCookie('app_growth_token');
    if(session.access_token !== get_access_token ){
      session['_' + campaign_id + '_player_id'] = undefined;
    }

    session.access_token = get_access_token;
    get_access_token_result = {
      status : '2',
      status_text : '从cookie中获取了access_token',
      results:[{
        access_token: get_access_token
      }]
    }
  }
  else{
    try {
      get_access_token_result = await request(get_access_token_options);
    }
    catch (e) {
      console.log('get-access-token error');
      console.log(e);

      get_access_token_result.status_text = e.message;
    }
  }

  console.log('1.get_access_token_result status',get_access_token_result.status,'status_text',get_access_token_result.status_text);

  if(config.get('fake_user')){
    //本地测试设定固定access_token
    session.access_token = config.get('fake_accesstoken');
    get_access_token_result.status = '1';
    get_access_token_result.status_text = '本地测试设定固定access_token';
    get_access_token_result.results[0]={'access_token':session.access_token};
  }
  console.log('session.access_token',session.access_token);

  // 若没有access_token
  // 依平台不同 去做登入

  //这只有在app会产生env_mode=app
  //微商城没有
  if (evn_mode === 'app' && get_access_token_result.status === '-1') {
    //在APP中直接返还-1，去登录页
    res.status(200);
    res.json({
      status : get_access_token_result.status,
      status_text : get_access_token_result.status_text
    });
    return;
  }

  if (evn_mode !== 'app' && get_access_token_result.status === '-1') {

    // 在 微商城 如果已登入 会自动用openid去换资料advanced-wemall 和 access_token
    // 登入状况分二种
    // 1) 微商城 已登入 使用者 直接用 微信开启 领券页 会取不到access_token 而且 导到登入页後 会因为上面原因 被自动登入 导到member 页
    // 2) 微商城 未登入 使用者 直接用 微信开启 领券页 会取不到access_token 可以导到登入页後

    //为解决 1) 的问题 去一次首页，刷新微商城取的 access_tokent
    let go_home_option = {
      method : 'GET',
      rejectUnauthorized : false,
      uri : 'https://m.yimishiji.com/',
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie' : req.headers.cookie
      },
      json : true // Automatically stringifies the body to JSON
    };
    await request(go_home_option);

    try {
      get_access_token_result = await request(get_access_token_options);
    }
    catch (e) {
      console.log('get-access-token error');
      console.log(e)

      get_access_token_result.status = e.message;
    }

    console.log('2.get_access_token_result status',get_access_token_result.status,'status_text',get_access_token_result.status_text);

    // 还是拿不到access_token 导去登入页
    if (get_access_token_result.status === '-1' || get_access_token_result.status === -1) {
      console.log('还是拿不到access_token 导去登入页');
      res.status(200);
      res.json({
        status : get_access_token_result.status,
        status_text : get_access_token_result.status_text
      });
      return;
    }

  }
  //有access_token回传，更新到session
  console.log('login success');
  console.log(get_access_token_result);
/*

  //去获取member_id
  let get_member_id_options = {
    method : 'GET',
    rejectUnauthorized: false,
    uri : config.get('api_server')+'v2/member?access_token='+ get_access_token_result.results[0].access_token + '&break403=true' + '&timestamp=' + (new Date()).valueOf(),
    json : true // Automatically stringifies the body to JSON
  };
  let get_member_id_result= {
    status      : '-1',
    status_text : ''
  };
  let member_id;
  try {
    get_member_id_result = await request(get_member_id_options);
  }
  catch (e) {
    console.log('get-access-token error');
    console.log(e)

    get_member_id_result.status_text = e.message;
  }
  if(get_member_id_result.results && get_member_id_result.results[0] && get_member_id_result.results[0].member_id){
    member_id = get_member_id_result.results[0].member_id;
  }
  res.status(200);
  res.json({
    status : get_member_id_result.status,
    status_text : get_member_id_result.status_text,
    member_id : member_id
  });*/
  res.status(200);
  res.json(get_access_token_result);

});

module.exports = router;//Router.use() requires a middleware function but got a Object