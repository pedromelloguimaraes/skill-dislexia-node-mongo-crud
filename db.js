require("dotenv").config()
const { MongoClient, ObjectId } = require("mongodb")
const { format, utcToZonedTime } = require('date-fns-tz');

let singleton

async function connect(){

    if(singleton){
        return singleton
    }
    const client = new MongoClient(process.env.MONGO_HOST)
    await client.connect()

    singleton = client.db(process.env.MONGO_DATABASE)
    return(singleton)
}

async function insert(customer){
    const db = await connect()
    return db.collection("Provas").insertOne(customer)
}

async function find(){
    const db = await connect()
    return db.collection("Provas").find().toArray()
}

async function remove(id){
    const db = await connect()
    return db.collection("Provas").deleteOne({ "_id": new ObjectId(id) })
}

async function update(id, name, serie){
    const db = await connect()
    return db.collection("Provas").updateOne({ "_id": new ObjectId(id) }, { $set: {materia: name, serie: serie} })
}

function transformToTwoDigits(number) {
    const numStr = String(number);
    // Verifica se o número tem apenas um dígito e adiciona o zero à esquerda
    return numStr.length === 1 ? numStr.padStart(2, '0') : numStr;
}

function fusoHorario(date, timeZone){
    return date.toISOString()
}
module.exports = {
    connect,
    insert,
    find,
    remove,
    update,
    transformToTwoDigits,
    fusoHorario
}