const db = require('./model')
const _ = require('lodash')
const { user, usermeta, post, postmeta, comment, commentmeta, term } = db.models

const userSchema = ['id', 'username', 'password', 'email', 'status', 'authority', 'loginedAt', 'createdAt', 'updatedAt']

/*
 *   在用户注册注销时使用
 *   @parmas     {string}        用户名字符串
 *   @return     {Object}        用户相关信息(用户名/密码/邮箱/状态)
 * */
user.findByName = async(name) => {
    // 如果用户名为空,则直接返回空
    if (!name) {
        return 10001
    }
    let ops = {
        where: {
            username: name
        },
        attributes: ['password', 'username', 'email', 'status', 'id']
    }
    return await user.findOne(ops)
}

// 增加用户(注册)
user.signup = async(obj) => {
    // 如果用户名密码不存在,直接返回
    if (!obj.username || !obj.password) {
        return 10002
    }

    let user = await user.findByName(obj.username)
        // 如果用户已存在,直接返回空
    if (!user) {
        return 10003
    }

    let ops = {
        username: obj.username,
        password: obj.password
    }

    return await user.create(ops)
}

// 更新主表及附加表,返回用户完整信息
user.updateAndMetaById = async(id, obj) => {
    if (!Number(id)) {
        return 10006
    }
    await user.updateMainById(id, obj)
    let keys = _.without(Object.keys(obj), ...userSchema)
    if (keys.length) {
        keys.map(async item => {
            await usermeta.create({ ukey: item, uvalue: obj[item] })
        })
    }
    return await user.findById(id, {
        include: [
            { model: usermeta }
        ]
    })
}

module.exports = user