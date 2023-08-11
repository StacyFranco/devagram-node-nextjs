import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";

const{ BUCKET_SLUG, WRITE_KEY, READ_KEY } = process.env;

const bucketDevagram = createBucketClient({
    bucketSlug: BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string,
});

const storage = multer.memoryStorage();

const upload = multer({storage : storage});

const uploadImagemCosmic = async( req : any) => {
   //console.log('uploadImagemCosmic',req.body)
    if(req?.file?.originalname){
        if(
        !req.file.originalname.includes(".png") &&
        !req.file.originalname.includes(".jpg") &&
        !req.file.originalname.includes(".jpeg")
        ) {
            throw new Error("Extensão da imagem inválida");
        }
    
        const media_object = {
            originalname : req.file.originalname,
            buffer : req.file.buffer
        };
        //console.log('uploadImagemCosmic url',req.url)
        //console.log('uploadImagemCosmic media_object',media_object)


        if(req.url && req.url.includes('publicacao')){
            return await bucketDevagram.media.insertOne({
                media : media_object,
                folder: "publicacoes",
            });
        }else if(req.url && req.url.includes('cadastro')){// estava usuario na aula...
            return await bucketDevagram.media.insertOne({
                media: media_object,
                folder: "avatar",
            });
        }else{
            return await bucketDevagram.media.insertOne({
                media: media_object,
                folder: "stories",
            });
        }
    }         
};

export {upload, uploadImagemCosmic};
