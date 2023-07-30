var express = require('express');
var router = express.Router();
const db = require("../db")
const session = require('express-session');
var cookieParser = require('cookie-parser');

router.use(session({
	secret: 'dislexia-sfjh3248b',
	resave: true,
	saveUninitialized: true
}));
router.use(cookieParser());

/* GET home page. */
router.get('/', async function(req, res, next) {
  const result = await db.find()
  res.render('index', { title: 'Express', result });
});


router.post('/auth', async function(req, res) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
    console.log(username)
    console.log(password)
	// Ensure the input fields exists and are not empty
	if (username && password) {
        const conn = await db.connect()
        let data = await conn.collection("Login").find({ username: username, password: password }).toArray()      
        if(data.length > 0){
            console.log(req.session)
            req.session.loggedin = true
            req.session.username = username
            res.redirect('/home')
        } else{
            res.send('Usuário e/ou senha incorreto(s)')
        }
	} else {
		res.send('Entre com usuário e senha!')
	}
    res.end();
})

router.get('/home', async function(req, res) {
	// If the user is loggedin
  if (req.session.loggedin) {
  const result = await db.find()
  res.render('main', { title: 'Express', result })
	} else {
		// Not logged in
		res.render('noauth');
	}
	res.end();
})


router.post("/save", async (req, res) => {
  let customer = {}
  customer.escola = req.body.escola
  customer.serie = [req.body.segmento, parseInt(req.body.serie)]
  customer.materia = req.body.materia
  let dateinicio = new Date(`${req.body.datainicio}T${db.transformToTwoDigits(parseInt(req.body.inicioaplicacao[0])*10 + parseInt(req.body.inicioaplicacao[1]))}:${req.body.inicioaplicacao[3]}${req.body.inicioaplicacao[4]}:00.000Z`)
  customer.inicio = { $date: db.fusoHorario(dateinicio, 'America/Sao_Paulo') }
  let datefinal = new Date(`${req.body.datafinal}T${db.transformToTwoDigits(parseInt(req.body.finalaplicacao[0])*10 + parseInt(req.body.finalaplicacao[1]))}:${req.body.finalaplicacao[3]}${req.body.finalaplicacao[4]}:00.000Z`)
  customer.fim = { $date: db.fusoHorario(datefinal, 'America/Sao_Paulo') }
  customer.questoes = []
  let nquestoes = parseInt(req.body.nquestoes)
  for(let i = 1; i <= nquestoes; i++){
    let showTextoPrevio = false
    if(req.body[`showTextoPrevio${i}`] === "on"){
      showTextoPrevio = true
    }
    let textoPrevio = [showTextoPrevio]
    if(showTextoPrevio){
      textoPrevio.push(req.body[`textoPrevioInput${i}`].split("\n"))
    }

    let showComandoInicial = false
    if(req.body[`showComandoInicial${i}`] === "on"){
      showComandoInicial = true
    }
    let comando = [[showComandoInicial]]
    if(showComandoInicial){
      comando[0].push(req.body[`comandoInicialInput${i}`])
    }

    let ncomandos = req.body[`ncomandos_${i}`]

    for(let k = 1; k <= ncomandos; k++){
      comando.push(req.body[`comando_${i}_${k}`])
    }
    let questao = {
      "textoPrevio": textoPrevio,
      "comando": comando
    }

    customer.questoes.push(questao)
  }

  const result = await db.insert(customer)
  console.log(result)
  res.redirect('/home')
})

router.post("/delete", async (req, res) => {
  const id = req.body.iddel
  let result = await db.remove(id)
  console.log(result)
  res.redirect('/home')
})

router.post("/edit", async (req, res) => {
  
  let id = req.body.ided
  console.log(id)
  const name = req.body.name
  console.log(name)
  const serie = req.body.serie
  console.log(serie)
  const result = await db.update(id, name, serie)
  console.log(result)
  res.json(result)
})

router.get('/noauth', async function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
