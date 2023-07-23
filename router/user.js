const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');


/**
 *  URL      user/create
 *  Method   post
 *  ACCESS   public
 */
router.post('/register', [
    check('firstname', 'First Name is Required').not().isEmpty(),
    check('lastname', 'Last Name is Required').not().isEmpty(),
    check('email', 'Email is Required').isEmail(),
    check('phone', 'Phone is Required').isLength({ min: "10" }),
    check('phone_code', 'Phone Code is Required').not().isEmpty(),
    check('password', 'Password should be minimum 6 char').isLength({ min: "6" }),
    check('password_confrmation', 'Password should be minimum 6 char').isLength({ min: "6" })
], async (req, res) => {

    try {

        // Variables Extarction
        var { firstname, lastname, email, phone, phone_code,  password, password_confrmation } = req.body;


        // Validation Check
        var errors = validationResult(req);


        if (password != password_confrmation) {
            errors.errors.push({
                "msg": "Password does not match",
                "param": "password_confrmation",
                "location": "body"
            });
        }

        let user_exist = await User.findOne({
            where: {
                email
            }
        });

        if (user_exist) {
            errors.errors.push({
                "msg": "Email is taken!",
                "param": "email",
                "location": "body"
            });

        }

        if (!errors.isEmpty()) {
            return res.status(401).json({ status: "0", msg: "Server Error", error: errors.array() });
        }


        const user = User.build({
            firstname,
            lastname,
            email,
            password,
            phone_code,
            phone
        });

        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);


        user.password = password;

        await user.save();

        if (!user.id) {
            res.status(500).json({ status: "0", msg: "Server Error" });
        }

        jwt.sign({
            user: {
                id: user.id
            }
        }, config.get('jwtSecret'), { expiresIn: 60 * 60 * 60 }, (err, token) => {

            if (err) throw err;
            return res.status(200).json({ status: "1", msg: "User created sucessfully", token, user });

        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "0", msg: "Server Error" });
    }
});


/**
 *  URL      user/Login
 *  Method   post
 *  ACCESS   public
 */
router.post('/login', [
    check('email', 'Email is Required').isEmail(),
    check('password', 'Password should be minimum 6 char').isLength({ min: "6" })
], async (req, res) => {

    try {

        // Extarct value
        var { email, password } = req.body;

        // Validation Check
        var errors = validationResult(req);

        let user_exist = await User.findOne({
            where: {
                email
            }
        });

        if ((!user_exist) || (!await bcrypt.compare(password, user_exist.password))) {
            errors.errors.push({
                "msg": "Credential does not match",
                "param": "email",
                "location": "body"
            });
        }

        if (!errors.isEmpty()) {
            return res.status(401).json({ status: "0", msg: "Server Error", error: errors.array() });
        }


        jwt.sign({
            user: {
                id: user_exist.id
            }
        }, config.get('jwtSecret'), { expiresIn: '1d' }, (err, token) => {

            if (err) throw err;
            return res.status(200).json({ status: "1", msg: "User Login sucess", token ,user:user_exist});

        });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ status: "0", msg: "Server Error" });
    }
});


/**
 *  URL      user/all
 *  Method   post
 *  ACCESS   public
 */
router.get('/all', [auth], async (req, res) => {

    try {
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "0", msg: "Server Error" });
    }

});



/**
 *  URL      user/get/{id}
 *  Method   post
 *  ACCESS   public
 */
router.get('/get/:id', [auth], async (req, res) => {

    try {
        
        const user = await User.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!user) {
            return res.status(402).json({ status: "0", msg: "User Not Found !" });
        }

        return res.status(200).json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "0", msg: "Server Error" });
    }

});


module.exports = router;