import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../types/RespostaPadraoMsg";
import NextCors from "nextjs-cors";

export const politicaCORS = (handler : NextApiHandler ) => 
async( req: NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) =>{
    try{
        await NextCors(req,res,{
            origin : '*',
            methods : ['PUT','POST','GET'],
            optionsSuccessStatus : 200, // alguns navegadores antigos tem problema quando se retorna 204

        });
        return handler(req,res);
    }catch(e){
        console.log('Erro ao tratar politica de CORS', e);
        return res.status(500).json({erro : 'Ocorreu um erro ao tratar politica de CORS'})
    }

}

