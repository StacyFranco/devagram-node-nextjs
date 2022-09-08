import type {NextApiRequest,NextApiResponse} from 'next';
import {conectarMongoDB} from '../../middlewares/conectaMongoDB';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg'
import {UsuarioModel} from '../../models/UsuarioModel';
import md5 from 'md5';

const endpointLogin = async (
    req : NextApiRequest,
    res : NextApiResponse<RespostaPadraoMsg>
) =>{
    if(req.method=== 'POST'){
        const{login,senha} = req.body;

        const usuarioEncontrados = await UsuarioModel.find({email: login,senha: md5(senha)});
        if(usuarioEncontrados && usuarioEncontrados.length > 0){
            const usuarioEncontrado = usuarioEncontrados[0];    
            return res.status(200).json({ msg : `Usuario ${usuarioEncontrado.nome} autenticado com sucesso`});
        }
        return res.status(400).json({erro : 'Usuário ou senha não encontrado'});
    }
    return res.status(405).json({erro : 'Método informado não é válido'});
}

export default conectarMongoDB (endpointLogin);