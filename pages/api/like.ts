import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from "../../models/PublicacaoModel";
import { UsuarioModel } from "../../models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";

const likeEndPoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req?.method === 'PUT') {
            const { id } = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            
            if (!publicacao) {
                return res.status(400).json({ erro: 'Publicação não encontrada!' })
            }
            const { userId } = req?.query;
            const usuario = await UsuarioModel.findById(userId);
                console.log('user:', req.query)
            if (!usuario) {
                return res.status(400).json({ erro: 'Usuário não encontrado!' });
            }
            // se o index for -1 usuario ainda não curtiu.
            const IndexUsuarioNoLike = publicacao.likes.findIndex((e: any) => e.toString() === usuario._id.toString());
            if (IndexUsuarioNoLike != -1) {
                publicacao.likes.splice(IndexUsuarioNoLike, 1);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'Publicação descurtida com sucesso' })

            } else {
                publicacao.likes.push(usuario._id);
                await PublicacaoModel.findByIdAndUpdate({ _id: publicacao._id }, publicacao);
                return res.status(200).json({ msg: 'Publicação curtida com sucesso' })
            }
        }
        return res.status(405).json({ erro: 'Método informado não é valido' })
    } catch (e) {
        console.log(e);
        return res.status(400).json({ erro: 'Ocorreu erro ao Curtir/Descurtir a publicação' })
    }
}
export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndPoint)))