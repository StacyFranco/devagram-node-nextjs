import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import type { CadastroRequisicao } from '../../types/CadastroRequisicao';
import { UsuarioModel } from '../../models/UsuarioModel';
import md5 from 'md5';
import { conectarMongoDB } from '../../middlewares/conectaMongoDB';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from 'next-connect';
import { politicaCORS } from "../../middlewares/politicaCORS";

const handler = nc()
    .use(upload.single('file'))
    .post(async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {

       try{
        //console.log('cadastro endpoint',req.body)
        
        const usuario = req.body as CadastroRequisicao;

        if (!usuario.nome || usuario.nome.length < 2) {
            return res.status(400).json({ erro: 'Nome inválido!' });
        }

        if (!usuario.email || usuario.email.length < 5
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')) {
            return res.status(400).json({ erro: 'Email inválido!' });
        }

        if (!usuario.senha || usuario.senha.length < 4) {
            return res.status(400).json({ erro: 'Senha inválido!' });
        }

        // Validação se já existe usuario com mesmo email
        const usuariosComMesmoEmail = await UsuarioModel.find({ email: usuario.email });
        if (usuariosComMesmoEmail && usuariosComMesmoEmail.length > 0) {
            return res.status(400).json({ erro: 'Já existe uma conta com o email informado' });

        }
        // enviar a imagem do multer para o cosmic
        const image = await uploadImagemCosmic(req);
        
        //Salvar no banco de dados
        const usuarioASerSalvo = {
            nome: usuario.nome,
            email: usuario.email,
            senha: md5(usuario.senha),
            avatar : image?.media?.url
        }
        
        await UsuarioModel.create(usuarioASerSalvo);

        return res.status(200).json({ msg: 'Usuario cadastrado com sucesso!' })
       } catch(e){
        console.log(e);
        return res.status(500).json({ erro: 'Erro ao cadastrar usuario' })
       }

    });

    // Altera configuração dessa API para não converter em JSON o conteudo
    export const config = {
        api : {
            bodyParser : false
        }
    }

export default politicaCORS(conectarMongoDB(handler));