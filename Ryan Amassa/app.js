const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

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

app.use(express.static(path.join(__dirname, 'public'))); // se acontecer algo apaga essa linha 38


// Configurar EJS como o motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Multer para uploads
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

// Servir arquivos estáticos da pasta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota para a página de login
app.get('/', (req, res) => {
  res.render('login.ejs');
});

// Rota para processar o formulário de login
app.post('/', (req, res) => {
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
    res.render('dashboard.ejs', { username: req.session.username });
  } else {
    res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }
}
);

// Rota para a página de upload de arquivos E TALVEZ FALHA
app.get('/upload', (req, res) => {
    if (req.session.loggedin) {
      res.render('upload.ejs'); // Renderize a página de upload
    } else {
      res.redirect('/'); // Redirecione para a página de login se não estiver autenticado
    }
  });
  
  // Rota para processar o envio do arquivo
  app.post('/uploads', upload.single('file'), (req, res) => {
    // Lógica para lidar com o upload do arquivo aqui
    if (req.file) {
      // O arquivo foi carregado com sucesso
      res.send('Arquivo enviado com sucesso!');
    } else {
      // Nenhum arquivo foi carregado
      res.send('Nenhum arquivo selecionado para envio.');
    }
  });



// Rota para fazer logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

