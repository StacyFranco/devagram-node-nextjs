import { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .use(upload.single('file'))
    .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {
            const { userId } = req?.query;
            const usuario = await UsuarioModel.findById(userId);

            if (!usuario) {
                return res.status(400).json({ erro: 'Usuario não encontrado' });
            }

            const { nome } = req.body
            // validação se tem um alteração de nome com nome valido!
            if (nome && nome.length > 2) {
                usuario.nome = nome;
            }
            const { file } = req;
            if (file && file.originalname) {
                const image = await uploadImagemCosmic(req);
                if (image && image.media && image.media.url) {
                    usuario.avatar = image.media.url;
                }

            }
            await UsuarioModel.findByIdAndUpdate({ _id: usuario._id}, usuario );
            return res.status(200).json({ msg: 'Usuario alterado com sucesso' })

        } catch (e) {
            console.log(e);
            return res.status(400).json({ erro: 'Não foi possivel atualizar usuario' });
        }

    })

    .get(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
        try {

            const { userId } = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            usuario.senha = null;
            return res.status(200).json(usuario);//{msg: 'Usuario autenticado com sucesso'});

        } catch (e) {
            console.log(e);
            return res.status(400).json({ erro: 'Não foi possivel obter dados do usuario' });
        }



    });

export const config = {
    api: {
        bodyParser : false
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(handler)));