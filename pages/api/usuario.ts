import {NextApiRequest,NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';

const usuarioEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) =>{
    try{
        const{userId} = req?.query;
        const usuario = await UsuarioModel.findById(userId);  
        usuario.senha = null;      
        return res.status(200).json(usuario);//{msg: 'Usuario autenticado com sucesso'});

    }catch(e){
        console.log(e);
        return res.status(400).json({erro: 'Não foi possivel obter dados do usuario'}); 
    }
    
    
    
}
export default validarTokenJWT(conectarMongoDB(usuarioEndpoint));