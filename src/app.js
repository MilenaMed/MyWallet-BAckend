import { MongoClient } from "mongodb";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"

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

console.log("entrou cadastro")
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


const PORT = 5000
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`))