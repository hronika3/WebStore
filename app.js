let express = require('express');
let app = express();
/**
 * public - имя папки где храниться статика
 * */
app.use(express.static('public'));
/**
 * задаем шаблонизатор
 * */
app.set('view engine', 'pug');
/**
* подключаю mysql модуль
* */
let mysql = require('mysql');
/**
* настраиваю модуль
* */
let con = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'store'
});

app.listen(3000, function () {
    console.log('node express work on 3000');
});


app.use(express.json());

const nodemailer = require('nodemailer');


app.get('/', function (req, res) {
    let cat = new Promise(function (resolve, reject) {
       con.query(
           "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category " +
           "!= category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, " +
           "( select @curr_category := '' ) v ) goods where ind < 3",
           function (error, result, field) {
               if(error) return reject(error);
               resolve(result);
           }
       );
    });
    let catDescription = new Promise(function (resolve, reject) {
        con.query(
            "SELECT * from category",
            function (error, result, field) {
                if(error) return reject(error);
                resolve(result);
            }
        );
    });
    Promise.all([cat, catDescription]).then(function (value) {
        res.render('index',{
            goods: JSON.parse(JSON.stringify(value[0])),
            cat: JSON.parse(JSON.stringify(value[1]))
        })
    })
});


app.get('/cat', function (req, res){
    console.log(req.query.id);
    let catId = req.query.id;

    let cat = new Promise(function (resolve, reject){
        con.query(
            'SELECT * FROM category where id='+catId,
            function (error, result) {
                if(error) reject(error);
                resolve(result);
            });
    });

    let goods = new Promise(function (resolve, reject){
        con.query(
            'SELECT * FROM goods where category='+catId,
            function (error, result) {
                if(error) reject(error);
                resolve(result);
            });
    });

    // ожидание промисов
    Promise.all([cat, goods]).then(function (value){
        console.log(value);
        res.render('cat', {
            cat: JSON.parse(JSON.stringify(value[0])),
            goods: JSON.parse(JSON.stringify(value[1]))
        });
    })
});


app.get('/goods', function (req, res){
    console.log(req.query.id);
    con.query('SELECT * FROM goods WHERE id='+req.query.id, function (error, result, fields){
        if(error) throw error;
        res.render('goods', {goods: JSON.parse(JSON.stringify(result))});
    });

});

app.get('/order', function (req, res){
        res.render('order');
});

app.post('/get-category-list', function (req, res) {
 //  console.log(req.body);
    con.query('SELECT id, category FROM category', function (error, result, fields){
        if(error) throw error;
        console.log(result);
        res.json(result);
    });
});

app.post('/get-goods-info', function (req, res) {
    console.log(req.body.key);
    if (req.body.key.length !=0){
        con.query('SELECT id,name,cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function (error, result, fields) {
            if (error) throw error;
            console.log(result);
            let goods = {};
            for (let i = 0; i < result.length; i++){
                goods[result[i]['id']] = result[i];
            }
            res.json(goods);
        });
    }
    else{
        res.send('0');
    }
});

app.post('/finish-order', function (req, res) {
    console.log(req.body);
    if (req.body.key.length != 0){
        let key = Object.keys(req.body.key);
        con.query('SELECT id,name,cost FROM goods WHERE id IN ('+key.join(',')+')',
            function (error, result, fields) {
            if (error) throw error;
            console.log(result);
            sendMail(req.body, result).catch(console.error);
            res.send('1');
    });
    }
    else{
        res.send('0');
    }
});

async function sendMail(data, result) {
    let res = '<h2>Order in lite shop</h2>';
    let total = 0;
    for (let i = 0; i < result.length; i++) {
        res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost'] * data.key[result[i]['id']]} blr </p>`;
        total += result[i]['cost'] * data.key[result[i]['id']];
    }
    console.log(res);
    res += '<hr>';
    res += `Total ${total} blr`;
    res +=`<hr>Username: ${data.username}`;
    res +=`<hr>Phone: ${data.phone}`;
    res +=`<hr>email: ${data.email}`;
    res +=`<hr>address: ${data.address}`;

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });

    let mailOption = {
      from : '<andrew.artish@gmail.com>',
      to : "andrew.artish@gmail.com, "+data.email,
      subject: "Sofa and chair option",
      text: "Hello",
      html: res
    };

    let info = await transporter.sendMail(mailOption);
    console.log("MessageSent: %s", info.message);
    console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));

}

