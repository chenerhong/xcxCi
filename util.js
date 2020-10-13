const path = require('path');
const child_process = require("child_process");
const fs = require('fs')
const config = require('./config/config')

// 传入分支名时自动切换分支
const getCode = ({
    name,
    type = 'wx',
    isUpload = true
}) => {
    const xcxPath = path.join(process.cwd(), config[type][isUpload ? 'uploadProject' : 'previewProject'])
    // 判断是否存在xcx项目文件夹，没有就去clone，有就pull最新代码
    if (fs.existsSync(xcxPath)) {
        // 存在分支名先切分支再pull
        if (name) {
            // 先撤销所有本地修改（修改本地环境会修改代码），然后再pull是为了拉到分支（可能后面创建的分支），最后切换分支
            child_process.execSync(`git checkout . && git pull && git checkout ${name}`, {
                cwd: xcxPath
            })
        }
        child_process.execSync('git pull', {
            cwd: xcxPath
        })
    } else {
        child_process.execSync(`git clone ${config[type].git}`, {
            cwd: path.join(process.cwd(), path.join(config[type][isUpload ? 'uploadProject' : 'previewProject'], '..'))
        })
    }
}


module.exports = {
    getCode
}