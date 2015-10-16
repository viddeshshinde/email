
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var parser = require('xml2json');
var xml2js = require('xml2js');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('DataTables-1.10.9'));
app.use(express.static('node_modules'));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Hello, page you requested was not found!');
  err.status = 404;
  //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var inspect = require('util').inspect;
var fs      = require('fs');
var base64  = require('base64-stream');
var mimelib = require("mimelib");
var Imap    = require('imap');
var fs = require('fs');
var nodemailer = require('nodemailer');
var my_email = "viddeshshinde@gmail.com";
var my_password = "viddmeow79";

var newMail;
var imap    = new Imap({
    user: my_email,
    password: my_password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
    //,debug: function(msg){console.log('imap:', msg);}
});

function findAttachmentParts(struct, attachments) {
    attachments = attachments ||  [];
    for (var i = 0, len = struct.length, r; i < len; ++i) {
        if (Array.isArray(struct[i])) {
            findAttachmentParts(struct[i], attachments);
        } else {
            if (struct[i].disposition && ['INLINE', 'ATTACHMENT'].indexOf(struct[i].disposition.type) > -1) {
                attachments.push(struct[i]);
            }
        }
    }
    return attachments;
}

function buildAttMessageFunction(attachment, receiver) {
    //var filename = attachment.params.name;
    var filename = 'test.xml';
    var encoding = attachment.encoding;

    return function (msg, seqno) {
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
            //Create a write stream so that we can stream the attachment to file;
            console.log(prefix + 'Streaming this attachment to file', filename, info);
            var writeStream = fs.createWriteStream(filename);
            stream.pipe(writeStream);
            writeStream.on('finish', function() {
                console.log(prefix + 'Done writing to file %s', filename);
                fs.writeFile('messsage.xml', mimelib.decodeQuotedPrintable(fs.readFileSync(filename)), 'utf8');
                fs.readFile('messsage.xml','utf8',function(err,fileData){
                    var parser = new xml2js.Parser({explicitArray : false});
                    fileData= fileData.toString();
                    fileData = fileData.split("<factura",2);
                    var fact1 = fileData[1];
                    fact1 = "<factura" + fact1;
                    var fact2 = fact1.split("</factura>",2);
                    var fact3 = fact2[0];
                    fact3 = fact3 + "</factura>";
                    parser.parseString(fact3.substring(0, fact3.length), function (err, result) {
                        if (err) {
                            console.log(err);
                        }

                        //console.log(result);
                        //console.log(JSON.stringify(result));
                        var value  = JSON.stringify(result);
                        var receiver_email = receiver.toString().split("<");
                        receiver_email = receiver_email[1].split(">",1);
                        InsertRecord(value, receiver_email);
                    });
                });
            });

            console.log("encoding: " + encoding);

            //stream.pipe(writeStream);



        });
        msg.once('end', function() {
            //fs.writeFile('messsage.xml', mimelib.decodeQuotedPrintable(fs.readFileSync(filename)), 'utf8');
            //fs.readFile('messsage.xml','utf8',function(err,fileData){
            //    var parser = new xml2js.Parser({explicitArray : false});
            //    fileData= fileData.toString();
            //    fileData = fileData.split("<factura",2);
            //    var fact1 = fileData[1];
            //    fact1 = "<factura" + fact1;
            //    var fact2 = fact1.split("</factura>",2);
            //    var fact3 = fact2[0];
            //    fact3 = fact3 + "</factura>";
            //    console.log(fact3);
            //    console.log("******************");
            //    console.log(fact3.substring(0, fact3.length));
            //    parser.parseString(fact3.substring(0, fact3.length), function (err, result) {
            //        console.log("******************");
            //        console.log(err);
            //        console.log(result);
            //        console.log(JSON.stringify(result));
            //    });
            //});
            SendAcknowledgement(receiver);
            console.log(prefix + 'Finished attachment %s', filename);
        });
    };
}

imap.once('ready', function() {
    var from="";
    function poleMails(from) {
        imap.openBox('INBOX', true, function(err, box) {
            if (err) {
                console.log("error:",err.message);
                return;
            } else {
                //var f = imap.seq.fetch('1:3', {
                //    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                //    struct: true
                //});



                //imap.search([ 'UNSEEN', ['SINCE', 'October 08, 2015'] ], function(err, results){
                //imap.search(['UNSEEN'], function(err, results){
                    console.log("fetching new emails...");
                    //console.log("results",results);
                    var f;
                    try{

                        var f = imap.seq.fetch(box.messages.total + ':*',{
                            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                            struct: true
                        });

                        //f = imap.fetch(results, {
                        //        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                        //        struct: true
                        //    });

                        //console.log("seqno",seqno);
                        //console.log("newMail",newMail);

                        f.on('message', function (msg, seqno) {

                            if(newMail == seqno) {
                                console.log("no new emails");
                                return;
                            } else {
                                console.log("new emails");
                                newMail = seqno;
                            }

                            console.log('Message #%d', seqno);
                            console.log("seqno",seqno);
                            var prefix = '(#' + seqno + ') ';
                            msg.on('body', function(stream, info) {
                                var buffer = '';
                                stream.on('data', function(chunk) {
                                    buffer += chunk.toString('utf8');
                                });
                                stream.once('end', function() {
                                    console.log(prefix + 'Parsed header: %s', JSON.stringify(Imap.parseHeader(buffer)));
                                    var temp = JSON.stringify(Imap.parseHeader(buffer));
                                    from = Imap.parseHeader(buffer).from;
                                    console.log(temp);
                                    console.log(from);
                                });
                            });
                            msg.once('attributes', function(attrs) {
                                var attachments = findAttachmentParts(attrs.struct);
                                console.log(prefix + 'Has attachments: %d', attachments.length);
                                for (var i = 0, len=attachments.length ; i < len; ++i) {
                                    var attachment = attachments[i];
                                    /*This is how each attachment looks like {
                                     partID: '2',
                                     type: 'application',
                                     subtype: 'octet-stream',
                                     params: { name: 'file-name.ext' },
                                     id: null,
                                     description: null,
                                     encoding: 'BASE64',
                                     size: 44952,
                                     md5: null,
                                     disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
                                     language: null
                                     }
                                     */
                                    console.log(prefix + 'Fetching attachment %s', attachment.params.name);
                                    var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
                                        bodies: [attachment.partID],
                                        struct: true
                                    });
                                    //build function to process attachment message
                                    console.log(from);
                                    f.on('message', buildAttMessageFunction(attachment,from));
                                }
                            });
                            msg.once('end', function() {
                                console.log(prefix + 'Finished email');
                                newMail = seqno;
                            });


                        });
                        f.once('error', function(err) {
                            console.log('Fetch error: ' + err);
                        });
                        f.once('end', function() {
                            console.log('Done fetching all messages!');
                            //InsertRecord(json, 'viddesh@gmail.com');
                            //imap.end();
                        });
                    } catch(e) {
                        console.log("error:", e.message);
                        //imap.end();
                        return;
                    }


                //});
                //var f = imap.seq.fetch(box.messages.total + ':*', {
                //    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                //    struct:true
                //});

                /*f.on('message', function (msg, seqno) {
                 console.log('Message #%d', seqno);
                 if(newMail == seqno) {
                 console.log("no new emails");
                 return;
                 } else {
                 var prefix = '(#' + seqno + ') ';
                 msg.on('body', function(stream, info) {
                 var buffer = '';
                 stream.on('data', function(chunk) {
                 buffer += chunk.toString('utf8');
                 });
                 stream.once('end', function() {
                 console.log(prefix + 'Parsed header: %s', JSON.stringify(Imap.parseHeader(buffer)));
                 var temp = JSON.stringify(Imap.parseHeader(buffer));
                 from = Imap.parseHeader(buffer).from;
                 console.log(temp);
                 console.log(from);
                 });
                 });
                 msg.once('attributes', function(attrs) {
                 var attachments = findAttachmentParts(attrs.struct);
                 console.log(prefix + 'Has attachments: %d', attachments.length);
                 for (var i = 0, len=attachments.length ; i < len; ++i) {
                 var attachment = attachments[i];
                 *//*This is how each attachment looks like {
                 partID: '2',
                 type: 'application',
                 subtype: 'octet-stream',
                 params: { name: 'file-name.ext' },
                 id: null,
                 description: null,
                 encoding: 'BASE64',
                 size: 44952,
                 md5: null,
                 disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
                 language: null
                 }
                 *//*
                 console.log(prefix + 'Fetching attachment %s', attachment.params.name);
                 var f = imap.fetch(attrs.uid , { //do not use imap.seq.fetch here
                 bodies: [attachment.partID],
                 struct: true
                 });
                 //build function to process attachment message
                 console.log(from);
                 f.on('message', buildAttMessageFunction(attachment,from));
                 }
                 });
                 msg.once('end', function() {
                 console.log(prefix + 'Finished email');
                 newMail = seqno;
                 });
                 }

                 });
                 f.once('error', function(err) {
                 console.log('Fetch error: ' + err);
                 });
                 f.once('end', function() {
                 console.log('Done fetching all messages!');
                 //InsertRecord(json, 'viddesh@gmail.com');
                 //imap.end();
                 });*/
            }

        });
    }

    setInterval(function(){
        poleMails(from);
    }, 1000*3);

});

imap.once('error', function(err) {
    console.log(err);
});

imap.once('end', function() {
    console.log('Connection ended');
    //imap.connect();
});

imap.connect();
//imap.connect();

//ConnectImap = function(){
//    //console.log("connecting mailbox...");
//    //imap.connect();
//}
//setInterval(function(){
//    ConnectImap();
//},1000*10);


function SendAcknowledgement(receiver){
    // create reusable transporter object using SMTP transport
    //    var receiver = receiver.toString();
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: my_email,
            pass: my_password
        }
    });

    console.log("sending email to: " + receiver);

    var receiver_email = receiver.toString().split("<");
    receiver_email = receiver_email[1].split(">",1);
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'Viddesh Shinde <viddeshshinde@gmail.com>', // sender address
        to: receiver, // list of receivers
        subject: 'Check ' + receiver_email + ' data', // Subject line
        text: 'Hello world', // plaintext body
        html: '<h1>Hi Viddesh</h1><br><p>Please use the following link to check your uploaded data</p><br><b>https://poetic-maxim-109005.appspot.com/'+receiver_email+'</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });
}




module.exports = app;
