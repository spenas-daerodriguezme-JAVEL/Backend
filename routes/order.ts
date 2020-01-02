import express from "express";
import Order from "../models/order";
import adminAuth from "../middleware/adminAuth";
import auth from "../middleware/auth";
import _ from "lodash";

const router = express.Router();


router.get('/', [auth, adminAuth], async (req: express.Request, res: express.Response) => {

})

router.post('/', auth, async (req: express.Request, res: express.Response) => {
    let order = new Order({
        
    })
})