const express = require('express');
const router   = express.Router();

router.post('/update',(req,res)=>{

    
    res.json(req.body);
});


module.exports = router;