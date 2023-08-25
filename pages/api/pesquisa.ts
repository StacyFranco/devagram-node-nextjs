import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { conectarMongoDB } from "../../middlewares/conectaMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { UsuarioModel } from "../../models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { SeguidorModel } from "../../models/SeguidorModel";
// tirei o any[] pq estava dando erro com a alteração do usuario que eu pegava...
const pesquisaEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        if (req.method === 'GET') {
            if (req.query.id) {
                const usuariosEncontrado = await UsuarioModel.findById(req?.query?.id)
                if (!usuariosEncontrado) {
                    return res.status(400).json({ erro: 'Usuario não encontrado' })
                }
                usuariosEncontrado.senha = null;

                // Para enviar a informção se eu já sigo ou não esse usuario:
                const { userId, id } = req?.query;

                const usuarioLogado = await UsuarioModel.findById(userId);
                if (!usuarioLogado) {   
                    return res.status(400).json({ erro: 'Usuario logado não encontrado' });
                }
                const usuarioPesquisado = await UsuarioModel.findById(id);
                if (!usuarioPesquisado) {
                    return res.status(400).json({ erro: 'Usuario a ser Seguido não encontrado' });
                }
                const euJaSigoEsseUsuario = await SeguidorModel.find({ usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioPesquisado._id });

                // tem alguma forma de fazer isso mais facilmente? pq não consigo adicionar ao objeto?
                if (euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
                    const usuariosEncontradoN = {
                        _id:usuariosEncontrado._id,
                        nome: usuariosEncontrado.nome,
                        email:usuariosEncontrado.email,
                        senha: usuariosEncontrado.senha,
                        avatar: usuariosEncontrado.avatar,
                        seguidores: usuariosEncontrado.seguidores,
                        seguindo: usuariosEncontrado.seguindo,
                        publicacoes: usuariosEncontrado.publicacoes,
                        segueEsseUsuario:true,

                }
                
                return res.status(200).json(usuariosEncontradoN);

                
            }

            const usuariosEncontradoN = {
                _id:usuariosEncontrado._id,
                nome: usuariosEncontrado.nome,
                email:usuariosEncontrado.email,
                senha: usuariosEncontrado.senha,
                avatar: usuariosEncontrado.avatar,
                seguidores: usuariosEncontrado.seguidores,
                seguindo: usuariosEncontrado.seguindo,
                publicacoes: usuariosEncontrado.publicacoes,
                segueEsseUsuario:false,
            }
            return res.status(200).json(usuariosEncontradoN);
        } else {
            const { filtro } = req.query;

            if (!filtro || filtro.length < 2) {
                return res.status(400).json({ erro: 'Favor informar pelo menos 2 caracteres para a busca' })
            }

            const usuariosEncontrados = await UsuarioModel.find({
                //
                $or: [{ nome: { $regex: filtro, $options: 'i' } }, { email: { $regex: filtro, $options: 'i' } }]
            });

            usuariosEncontrados.forEach(user => user.senha = null);
            return res.status(200).json(usuariosEncontrados);
        }

    }
        return res.status(405).json({ erro: 'Método informado não é valido' })
} catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Não foi possivel buscar usuarios' })
}
}
export default politicaCORS(validarTokenJWT(conectarMongoDB(pesquisaEndpoint)));