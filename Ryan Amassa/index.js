const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

// Configurar a conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'aluno',
  database: 'mydb',
});




db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida.');
});

// Configurar a sessão
app.use(
  session({
    secret: 'sua_chave_secreta',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'))); // se acontecer algo apaga essa linha 39


// Configurar EJS como o motor de visualização
app.set('view engine', 'ejs');

// Rota para a página de login
app.get('/', (req, res) => {
  res.render('login.ejs');
});

// Rota para processar o formulário de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      res.redirect('/dashboard');
    } else {
      res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
    }
  });
});

// Rota para a página do painel
app.get('/dashboard', (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(__dirname + '/index.html');
  } else {
    res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Começ0u aqui
// Configuração do Multer para salvar os arquivos no diretório 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // O diretório onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + ext); // Nome do arquivo no formato: timestamp.extensao
    },
  });
  
  const upload = multer({ storage });
  
  // Rota para exibir um formulário HTML para fazer o upload de um arquivo
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  
  // Rota para lidar com o envio do arquivo
  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo foi enviado.');
    }
  
    res.send('Arquivo enviado com sucesso.');
  });
  

//e terminou aqui meu teste



app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});


// se quiser adicionar usúarios entre no phpmyadmin, na aba SQL e digite : INSERT INTO users (username,password) VALUES ('nome','senha');

