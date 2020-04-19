const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const UserAccount = require('./UserAccount')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/register', async (req, res) => {
    const userPassword = req.body.password
    const email = req.body.email
    const fullName = req.body.fullName
    const uniquePhoneId = req.body.uniquePhoneId

    try {
        if (!userPassword || !email || !fullName || !uniquePhoneId) {
            return res.status(401).json({
                message: 'Missing mandetory keys'
            })
        }

        console.log('Full Name: ', fullName)
        console.log('Email: ', email)
        console.log('User Password: ', userPassword)
        console.log('Unique Phone ID: ', uniquePhoneId)

        const count = await UserAccount.count({
            where: {
                // unique_phone_id: uniquePhoneId
                email
            }
        })

        console.log('Count: ', count)

        if (count > 0) {
            return res.status(401).json({
                message: 'User account already exists'
            })
        }

        console.log(process.env.SALTROUNDS, typeof process.env.SALTROUNDS)

        const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS))
        const userPasswordHash = bcrypt.hashSync(userPassword, salt)

        console.log('User password hash: ', userPasswordHash)

        const userAccount = await UserAccount.create({
            full_name: fullName,
            email,
            user_password: userPasswordHash,
            unique_phone_id: uniquePhoneId
        })

        // console.log('User account created: ', userAccount.email)

        const token = jwt.sign({
            full_name: fullName,
            email: email,
            unique_phone_id: uniquePhoneId
        }, process.env.JWT_KEY, {
            expiresIn: 3600
        })

        // console.log('Token: ', token)

        return res.status(200).json({
            message: 'User registered successfully',
            token,
            expires_in: '1h'
        })
    } catch (err) {
        return res.status(401).json({
            message: err
        })
    }
})

app.post('/api/login', async (req, res) => {
    const userPassword = req.body.password
    const email = req.body.email
    const uniquePhoneId = req.body.uniquePhoneId

    try {
        const userAccount = await UserAccount.findOne({
            where: {
                // email,
                unique_phone_id: uniquePhoneId
            }
        })

        // console.log(userAccount)

        if (!userAccount) {
            return res.status(401).json({
                message: 'Authentication failed'
            })
        }

        bcrypt.compare(userPassword, userAccount.user_password, (err, result) => {
            if (err) {
                return res.status(400).json({
                    message: err
                })
            }

            if (result) {
                const token = jwt.sign({
                    full_name: userAccount.full_name,
                    email: userAccount.email,
                    unique_phone_id: userAccount.unique_phone_id
                }, process.env.JWT_KEY, {
                    expiresIn: 3600
                })

                return res.status(200).json({
                    message: 'Authentication successful',
                    token,
                    fullName: userAccount.full_name,
                    email: userAccount.email,
                    expires_in: '1h'
                })
            }

            return res.status(400).json({
                message: 'Something went wrong'
            })
        })
    } catch (err) {
        return res.status(400).json({
            message: err
        })
    }
})

app.get('/bcrypt/:str', (req, res) => {
    const salt = bcrypt.genSaltSync(12);
    return res.json({
        hash: bcrypt.hashSync(req.params.str, salt)
    })
    // bcrypt.hash(req.params.str, process.env.SALTROUNDS, (err, encryptedString) => {
    //     if (err) return res.status(401).json(err)

    //     return res.send(encryptedString)
    // })
})

app.post('/api/submit_answers', (req, res) => {
    const token = req.body.token
    const answers = req.body.answers

    console.log(token)
    console.log(answers)

    return res.status(200).json({
        message: 'Answers submitted successfully'
    })
})

app.listen(process.env.PORT || 3000)