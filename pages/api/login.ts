import type {NextApiRequest,NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectaMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg'
import type {LoginResposta} from '../../types/LoginResposta'
import {UsuarioModel} from '../../models/UsuarioModel';
import md5 from 'md5';
import jwt from 'jsonwebtoken';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg | LoginResposta>
) =>{

    const {MINHA_CHAVE_JWT} = process.env;
    if(!MINHA_CHAVE_JWT){
        res.status(500).json({erro : 'ENV Jwt não informado'});
    }


    if(req.method=== 'POST'){
        const{login,senha} = req.body;

        const usuarioEncontrados = await UsuarioModel.find({email: login,senha: md5(senha)});
        if(usuarioEncontrados && usuarioEncontrados.length > 0){
            const usuarioEncontrado = usuarioEncontrados[0]; 
            // ponto de exclamação no final é para informar garantidamente que a chave não é vazia se não da erro!
            const token = jwt.sign({_id : usuarioEncontrado._id}, MINHA_CHAVE_JWT!);
            
            return res.status(200).json({
                nome : usuarioEncontrado.nome,
                email : usuarioEncontrado.email,
                 token});
        }
        return res.status(400).json({erro : 'Usuário ou senha não encontrado'});
    }
    return res.status(405).json({erro : 'Método informado não é válido'});
}

export default conectarMongoDB (endpointLogin);