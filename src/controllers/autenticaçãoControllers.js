import bcrypt from "bcrypt"
import {userSignUpPageSchema} from "../schemas.js"

//Cadastro
app.post('/cadastro', async (request, response) => {
    const dadosDoUsuario = request.body;
console.log("entrou cadastro")
    const senhaCriptografada = bcrypt.hashSync(dadosDoUsuario.senha, 10);
    const usuárioExiste = await db.collection("users").findOne({ email: dadosDoUsuario.email })
    if (usuárioExiste) {
        return res.sendStatus(409)
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

//Login
//Logout