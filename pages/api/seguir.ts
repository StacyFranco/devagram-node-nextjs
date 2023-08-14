import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from 'next-connect';
import { SeguidorModel } from "../../models/SeguidorModel";
import { UsuarioModel } from "../../models/UsuarioModel";

const seguirEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
        if(req?.method === 'PUT'){
            const {userId, id} = req?.query;
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuario logado não encontrado'});
            }
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuario a ser Seguido não encontrado'});
            }
            //busca para ver se segue usuario
            const euJaSigoEsseUsuario = await SeguidorModel.find({usuarioId : usuarioLogado._id,  usuarioSeguidoId : usuarioASerSeguido._id});
            console.log('resultado chega?',euJaSigoEsseUsuario)
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                //retirar da lista todos os seguidos( pode ter mais de um por problema de sincronia)
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id: e._id}));
                console.log('lista link seguidores',euJaSigoEsseUsuario);

                // reduzir numero seguindo e seguidores para os usuarios:
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate ({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg : 'Deixou de seguir o usuario com sucesso!'})

            }else{
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id,
                };
                await SeguidorModel.create(seguidor);
                // adicionar numero seguindo e seguidores para os usuarios:
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate ({_id : usuarioASerSeguido._id}, usuarioASerSeguido);
                return res.status(200).json({msg : 'Usuario seguido com sucesso!'})

            }


        }
        return res.status(405).json({erro : 'Método informado não é valido '})

    } catch (e) {
        console.log(e);
        return res.status(400).json({ erro: 'Não foi possivel seguir/deseguir usuario!' })
    }
}
export default validarTokenJWT(conectarMongoDB(seguirEndpoint))