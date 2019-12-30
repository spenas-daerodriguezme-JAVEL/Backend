import express from 'express';
import  fileUpload  from "express-fileupload";
// import  Product  from "../models/product";
// import  User  from "../models/user";
import  fs  from "fs";
import  path  from "path";

const router = express()

router.use(fileUpload());

router.put('/upload/product/:id', function(req, res){
    let tipo = req.params.tipo;
    let id = req.params.id;

    if(!req.files){
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'None files were selected'
                }
            });

    }


let images = req.files.images;
let extFile = images.name.split('.');

let validExtensions = ['png', 'jpg', 'jpeg'];

if(validExtensions.indexOf(extFile) < 0){
    return res.status(400).json({
        ok: false,
        err:{
            message: 'Valid file extensions are: ' + validExtensions,
            ext: extFile
        }
    })
}

images.mv(`images/product/${extFile}`, (err: any) => {
    if(err)
        return res.status(500).json({
            ok:false,
            err
        });


});


})

export default {
    router
  };