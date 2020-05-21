发布顺序
====
1)git pull


采用pm2管理node进程

如何启动
====
进入项目根目录，运行 
pm2 start ecosystem.config.js --env production


如何重启
====
进入项目根目录，运行 
pm2 restart forward


ecosystem.config.js 中更改进程名称

config中新建production.json配置生产环境参数