const ci = require('miniprogram-ci');
const path = require('path');
const config = require('../config/config')
const router = require('koa-router')();
const fs = require('fs')
const redis = require('../config/redis')
const dayjs = require('dayjs')
// 叮叮机器人sdk
const Robot = require('dingtalk-robot-sdk');
const {
    getCode
} = require('../util');
const uploadProject = path.join(process.cwd(), config.wx.uploadProject)
router.post('/upload', async ctx => {
    const body = ctx.request.body
    // 合并状态并且合到master才会自动上传到后台
    if (body.state === 'merged' && body.target_branch === config.targetBranch) {
        try {
            const robot = new Robot({
                accessToken: config.wx.robotAccessToken,
                secret: config.wx.robotSecret
            });
            const text = new Robot.Text('开始上传')
            robot.send(text)
            // 更新代码(切换到master)
            getCode({
                name: config.targetBranch
            })
            // 创建项目对象
            const project = new ci.Project({
                appid: config.wx.appid,
                type: 'miniProgram',
                projectPath: uploadProject,
                privateKeyPath: path.join(process.cwd(), 'node/wx.key'),
                ignores: ['node_modules/**/*'],
            })
            const year = new Date().getFullYear() - 2000
            let month = new Date().getMonth() + 1
            const day = new Date().getDate()
            // 根据年月日当版本号
            const version = '2.5.' + year + (month < 10 ? '0' + month : month) + (day < 10 ? '0' + day : day);
            // 上传
            const previewResult = await ci.upload({
                project,
                version,
                desc: body.title,
                setting: {
                    es6: true,
                    minify: true,
                    autoPrefixWXSS: true,
                    minifyWXML: true,
                    minifyWXSS: true,
                    minifyJS: true
                }
            })
            let fullSize = ''
            previewResult.subPackageInfo.forEach(item => {
                item.size = (item.size / 1024).toFixed(1)
                if (item.name === '__FULL__') {
                    fullSize = item.size
                }
            })
            // 通知叮叮机器人上传完成
            const markdown = new Robot.Markdown()
                .setTitle('上传完成！！！！')
                .add(`### [上传完成](https://mp.weixin.qq.com)\n`)
                .add(`1. version：${version}`)
                .add(`2. size：${fullSize}`)
                .add(`3. ${JSON.stringify(previewResult)}`)
            robot.send(markdown)
            // 返回结果
            ctx.body = {
                code: 200,
                msg: '上传成功',
                success: true,
                data: previewResult
            };
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 500,
                msg: '上传失败',
                success: false,
                data: e
            };
        }
    } else {
        ctx.body = {
            code: 500,
            msg: '只有提PR到master并且是合并完成状态才会自动上传到后台喔～',
            success: false
        };
    }
})

module.exports = router;