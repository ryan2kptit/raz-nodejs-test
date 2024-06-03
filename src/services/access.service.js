'use strict'

const userModel = require("../models/user.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./key-token.service")
const { createTokenPair } = require("../auth/auth-utils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../common/response/error.response")
const { findByEmail } = require("./user.service")
const Role = {
    USER: 'USER',
    ADMIN: 'ADMIN'
}
class AccessService {

    static login = async ({ email, password, refreshToken = null}) => {
        const foundUser = await findByEmail({email});
        if(!foundUser) throw new BadRequestError("User not resiterd");
        
        const matchPassword = bcrypt.compare( password, foundUser.password);
        if(!matchPassword) throw new AuthFailureError('authen password is not correct!');

        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        const { _id: userId } = foundUser
        const tokens = await createTokenPair({userId , email}, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            privateKey, publicKey, userId,
            refreshToken: tokens.refreshToken
        })

        return {
            user: getInfoData({fields: ['_id', 'email', 'name'], object: foundUser}),
            tokens
        }

    }

    static signUp = async ({ name, email, password}) => {
        // try {
            const holderUser = await userModel.findOne({email}).lean()
            if(holderUser) {
                throw new BadRequestError('Error: User already registed')
            }
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await userModel.create({
                name, email, password: hashedPassword, roles: [Role.USER]
            })

            if(newUser) {

                const publicKey = crypto.randomBytes(64).toString('hex')
                const privateKey = crypto.randomBytes(64).toString('hex')

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newUser._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error'
                    }
                }
                const tokens = await createTokenPair({userId: newUser._id, email}, publicKey, privateKey)
                return {
                    code: 201,
                    metadata: {
                        user: getInfoData({fields: ['_id', 'email', 'name'], object: newUser}),
                        tokens
                    }
                }
            }

            return  {
                code: 200,
                metadata: null
            }
    }
}

module.exports = AccessService