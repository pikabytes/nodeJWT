const express = require('express'),
      bodyParser = require('body-parser'),
      jwt = require('jsonwebtoken'),
      config = require('./configs/config'),
      app = express();

// indicamos la configuracion de nuestra key
app.set('key', config.key);
// seteamos para que el bodyParser nos convierta lo que viene del cliente
app.use(bodyParser.urlencoded({ extended: true }));
// lo pasamos a json
app.use(bodyParser.json());
// inciamos el servidor
app.listen(3000, ()=>{
    console.log('Servidor iniciado en el puerto 3000');
});
// generamos un punto de inicio
app.get('/', function(req, res){
    res.send('Home');
});

app.post('/login', (req, res)=>{
    console.log('printing body');
    console.log(req.body);
    if(req.body.username === 'pikabytes' &&
    req.body.password === 'pikabytes'){
        const payload = {
            check: true,
            username: 'pikabytes'
        };
        const token = jwt.sign(payload, app.get('key'), {
            expiresIn: 2000
        });
        res.json({
            message: 'Success authentication',
            token: token
        });
    } else {
        res.json({ message: 'User and password incorrects...'})
    }
});

// middleware que estara entre la peticion y el nuestro API, el cual
// verificara las peticiones  y validara el token
const protectedRoutes = express.Router();
protectedRoutes.use((req, res, next) => {
    const token = req.headers['access-token'];
    if( token){
        jwt.verify(token, app.get('key'), (err, decoded) =>{
            if(err){
                return res.json({ message: 'Invalid token...'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({message: 'Token not found...'});
    }
});

// ruta protegida con el jwt
app.get('/profile', protectedRoutes, (req, res) => {
    console.log(req.decoded);
    const  data = [
        {id: 1, name: 'Pikabytes', workAt: 'Developer', birthDate: '1994/04/22'}
    ];
    res.json(data);
})
