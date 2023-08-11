import {NextApiRequest,NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { PublicacaoModel } from '../../models/PublicacaoModel';

const feedEndpoint = async (req : NextApiRequest, res : NextApiResponse < RespostaPadraoMsg | any >) => {
    try{
        if(req.method === 'GET'){
            //verifica se vc tem o id do usuario
            if(req?.query?.id){
                const usuario = await UsuarioModel.findById(req.query.id);
                // verifica se o usuario é valido
                if(!usuario){
                    return res.status(400).json({erro: 'Usuario não encontrado' })
                }
                const publicacoes = await PublicacaoModel
                    .find({idUsuario : usuario._id})
                    .sort({data : -1});
                return res.status(200).json(publicacoes);
            }
            
        }
        return res.status(405).json({erro: 'Metodo informado não é válido' })



    }catch(e){
        console.log(e);
        return res.status(400).json({erro: 'Não foi possivel obter o feed' })
    }
}


export default validarTokenJWT(conectarMongoDB(feedEndpoint))