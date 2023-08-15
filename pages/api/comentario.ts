import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from "../../models/PublicacaoModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const comentarioEndpoint =async (req:NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
  try{
    if(req.method ==='PUT'){
        const {userId, id} = req.query;
        const usuarioLogado = await UsuarioModel.findById(userId);
        if(!usuarioLogado){
            return res.status(400).json({erro : 'Usuario não encontrado!'})
        }
        const publicacao = await PublicacaoModel.findById(id);
        if(!publicacao){
            return res.status(400).json({erro : 'Publicação não encontrada!'})
        }
        console.log(req.body.comentario)
        if(!req.body || !req.body.comentario || req.body.comentario.length < 2){
            return res.status(400).json({erro : 'Comentario não é valido!'})
        }
        const comentario = {
            usuarioId : usuarioLogado._id,
            nome : usuarioLogado.nome,
            comentario : req.body.comentario,
        }
        publicacao.comentarios.push(comentario);
        await PublicacaoModel. findByIdAndUpdate({_id : publicacao._id},publicacao);
        return res.status(200).json({msg : 'Comentario adicionado com sucesso!'})
    }
    return res.status(405).json({erro : 'Método informado não é valido!'})

  } catch(e){
    console.log(e);
    return res.status(400).json({erro : 'Ocorreu um erro ao adicionar comentario!'})
  } 
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(comentarioEndpoint)));