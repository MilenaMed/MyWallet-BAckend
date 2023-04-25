import { MongoClient , ObjectId} from "mongodb";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid"
import dayjs from "dayjs";

dotenv.config()

//MONGO
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect()
    db = mongoClient.db()
} catch (err) {
    console.log(err.message)
}

//EXPRESS e CORS
const app = express()
app.use(express.json())
app.use(cors())


//POST CADASTRO
app.post('/cadastro', async (request, response) => {
    const dadosDoUsuario = request.body;

    console.log(dadosDoUsuario)
    const senhaCriptografada = bcrypt.hashSync(dadosDoUsuario.senha, 10);
    const usuárioExiste = await db.collection("users").findOne({ email: dadosDoUsuario.email })
    if (usuárioExiste) {
        return response.sendStatus(409)
    }

    try {
        await db.collection("users").insertOne({
            name: dadosDoUsuario.nomeUsuário,
            email: dadosDoUsuario.email,
            password: senhaCriptografada
        })
        return response.status(201).send("Usuário Cadastrado!")
    } catch (err) {
        return response.status(422).send(err.message)
    }
})

//POST LOGIN
app.post("/", async (request, response) => {
    const token = uuid()
    const { id } = request.params
    const dadosLogin = request.body
    const sessão = await db.collection("sessions").insertOne({token})
    const usuario = await db.collection("users").findOne({ email: dadosLogin.email })

    try {
        if (!usuario || !bcrypt.compareSync(dadosLogin.senha, usuario.password)) {
            return response.status(409).send("usuário não cadastrado ou senha incorreta");
        }
        response.status(500).send(err);

    } catch (err) {
        console.log({ token: token, userId: sessão._id})
    }

})
// GET HOME
app.get("/home", async (request, response) => {
    const idUser = response.locals.sessions.idUser;
    const { authorization } = request.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) {
        return response.status(401).send("Token não encontrado!")
    };
    try {
        const logado = await db.collection("sessions").findOne({ token })
        if (!logado) return response.status(401).send("Token inválido");
        console.log("logado =",logado)

        const historico = await db.collection("historico").find({_id: response.locals.session.idUser}).toArray();
        console.log("dataUSER=",historico)
        if (!historico) return response.status(500).send("Erro ao encontrar dados");


        const transactionUser = await db
            .collection("historico")
            .find({ user: logado.idUser })
            .toArray();
    } catch (err) {
        response.status(500).send(err);
    }
})


//POST DE ENTRADAS E SAIDAS
//ENTRADAS
app.post("/nova-transacao/:entrada", async (request, response) => {
    const dadosEntrada = request.body
    const { token } = response.locals;

    try {
        await db.collection("historico").insertOne({
            value: dadosEntrada.valorMonetario,
            description: dadosEntrada.descriçaoEntrada,
            day: dayjs().format('DD/MM'),
            type: "entrada",
        })
        return response.status(201).send("valor cadastrado com sucesso")
    } catch (err) {
        response.status(500).send(err);
    }
});
// SAIDAS
app.post("/nova-transacao/:saida", async (request, response) => {
    const dadosSaida = request.body
    const { token } = response.locals;

    try {
        await db.collection("historico").insertOne({
            value: dadosSaida.valorMonetario,
            description: dadosSaida.descriçaoEntrada,
            day: dayjs().format('DD/MM'),
            type: "saida",
        })
        return response.status(201).send("valor debitado com sucesso")
    } catch (err) {
        return response.status(500).send(err);
    }
});


//LOGOUT

const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))