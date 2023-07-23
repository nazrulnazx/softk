const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const SwitchBoard = require('../models/switchboard');
const Switch = require('../models/switch');



router.get('/get', [auth], async (req, res) => {

    SwitchBoard.hasMany(Switch, {
        foreignKey: 'switch_board_id'
    });

    const switchBoard = await SwitchBoard.findAll({
        where: {
            user_id: req.user.id
        },
        include: Switch
    });


    res.json(switchBoard);

});


/**
 *  URL      switch-board/create
 *  Method   post
 *  ACCESS   Private
 */
router.post('/create', [auth,
    check('devicelabel', 'Device  Name is Required').not().isEmpty(),
    check('devicemodel', 'Device  Model is Required').not().isEmpty(),
    check('switchcount', 'Switch Count  is Required').not().isEmpty()
], async (req, res) => {

    try {

        // Variables Extarction
        var { devicelabel, devicemodel, switchcount } = req.body;

        // Validation Check
        var errors = validationResult(req);

        //create new switch board
        const switchBoardData = SwitchBoard.build({

            user_id : req.user.id,
            label:devicelabel,
            color:'black',
            token: devicemodel
        });
        await switchBoardData.save();

        //create switchs in loop
        for(let i= 0; i<switchcount; i++){

            var switchData = Switch.build({
                user_id :  req.user.id,
                switch_board_id : switchBoardData.id
            });

            await switchData.save();

        }

        
        return res.status(200).json({ status: "1", msg: "Board created sucessfully" });


    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: "0", msg: "Server Error" });
    }
});


module.exports = router;