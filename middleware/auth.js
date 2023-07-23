const express = require('express');
const jwt = require('jsonwebtoken');
const  User = require('../models/user');
const router = express.Router();


router.use('', async (req, res, next) => {

    const token = req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ status: "0", msg: "Unautorised! Token Required." });
    }

    const decode =  await jwt.verify(token, require('config').get('jwtSecret'));

    if (!decode || !decode.user) {
        return res.status(401).json({ status: "0", msg: "Unautorised! Wrong Token" });
    }

    req.user = decode.user;

    const user = await User.findOne({
        where: {
            id: req.user.id
        }
    });

    if(!user){
        return res.status(401).json({ status: "0", msg: "Unautorised! User Does not Exist" }); 
    }
    console.log("here");
    next(); 
});



module.exports = router;