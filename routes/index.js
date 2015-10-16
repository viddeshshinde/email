var uuid = require('uuid');
var dateFormat = require('dateformat');
var express = require('express');
var router = express.Router();
mysql =  require('mysql');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Email' });
//});

db_config = {
      "host" : "173.194.230.183",
      "user" : "root",
      "password" : "root",
      "database" : "imap",
      "multipleStatements" : "true"
    }// Reading

// console.log(db_config);

connection = mysql.createConnection(db_config);

connection.connect();

connection.query( "select email from infoTributaria" , function(err, rows){
    if(err)
    {
        rows = null;
        console.log(err);
    }
    else
    {
        var result = rows;
        rows = null;
    }
});

router.get('/:email', function(req, res, next) {
  res.render('index', { title: 'Email' ,
                        email : req.params.email});
});


router.post('/infoTributaria/:email', function(req, res, next) {

    console.log("query...");
  res.setHeader('Content-Type', 'application/json');

  var strQuery = "select email, guid, ambiente, tipoEmision," +
      "razonSocial, nombreComercial, ruc, claveAcceso, codDoc, " +
      "estab, ptoEmi, secuencial, dirMatriz from infoTributaria where " +
      "email = '"+req.params.email+"'";

  connection.query( strQuery , function(err, rows){
    if(err)
    {
      rows = null;
      console.log(err);
    }
    else
    {
      var result = rows;
      rows = null;
      res.json({"data" : result});
    }
  });
});

router.post('/detalles/:guid', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var strQuery = "select codigoPrincipal, descripcion, cantidad, precioUnitario," +
        "descuento, precioTotalSinImpuesto, impuesto_codigo, impuesto_codigoPorcentaje, impuesto_tarifa, " +
        "impuesto_baseImponible, impuesto_valor from detalles where " +
        "guid = '"+req.params.guid+"'";

    connection.query( strQuery , function(err, rows){
        if(err)
        {
            rows = null;
            console.log(err);
        }
        else
        {
            var result = rows;
            rows = null;
            res.json({"data" : result});
        }
    });
});

router.post('/detalles', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    res.json({});
});

router.post('/infoAdicional/:guid', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var strQuery = "select nombre, text from infoAdicional where " +
        "guid = '"+req.params.guid+"'";

    connection.query( strQuery , function(err, rows){
        if(err)
        {
            rows = null;
            console.log(err);
        }
        else
        {
            var result = rows;
            rows = null;
            res.json({"data" : result});
        }
    });
});

router.post('/infoAdicional', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    res.json({});
});

router.post('/infoFactura/:guid', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var strQuery = "select fechaEmision, dirEstablecimiento, contribuyenteEspecial, obligadoContabilidad," +
        "tipoIdentificacionComprador, razonSocialComprador, identificacionComprador, totalSinImpuestos, totalDescuento, " +
        "propina, importeTotal, moneda from infoFactura where " +
        "guid = '"+req.params.guid+"'";

    connection.query( strQuery , function(err, rows){
        if(err)
        {
            rows = null;
            console.log(err);
        }
        else
        {
            var result = rows;
            rows = null;
            res.json({"data" : result});
        }
    });
});

router.post('/infoFactura', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    res.json({});
});

router.post('/totalConImpuestos/:guid', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');

    var strQuery = "select codigo, codigoPorcentaje, baseImponible, " +
        "tarifa, valor from totalConImpuestos where " +
        "guid = '"+req.params.guid+"'";

    connection.query( strQuery , function(err, rows){
        if(err)
        {
            rows = null;
            console.log(err);
        }
        else
        {
            var result = rows;
            rows = null;
            res.json({"data" : result});
        }
    });
});

router.post('/totalConImpuestos', function(req, res, next) {

    res.setHeader('Content-Type', 'application/json');
    res.json({});
});


//Insert Record in database

InsertRecord = function (json, email) {
    console.log("InsertRecord()");
    var json = JSON.parse(json);
    console.log(json);

    //console.log("***************");
    var guid = uuid.v4();
    var current_date = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

    /*
     Inserting into detalles table
     */

    var query1 = "insert into detalles values";
    var joinQueryArray = [];
    for (var i in json.factura.detalles.detalle) {
        var joinQuery = "('" + guid + "','"
                        + json.factura.detalles.detalle[i].codigoPrincipal + "','"
                        + json.factura.detalles.detalle[i].descripcion + "','"
                        + json.factura.detalles.detalle[i].cantidad + "','"
                        + json.factura.detalles.detalle[i].precioUnitario + "','"
                        + json.factura.detalles.detalle[i].descuento + "','"
                        + json.factura.detalles.detalle[i].precioTotalSinImpuesto + "','"
                        + json.factura.detalles.detalle[i].impuestos.impuesto.codigo + "','"
                        + json.factura.detalles.detalle[i].impuestos.impuesto.codigoPorcentaje + "','"
                        + json.factura.detalles.detalle[i].impuestos.impuesto.tarifa + "','"
                        + json.factura.detalles.detalle[i].impuestos.impuesto.baseImponible + "','"
                        + json.factura.detalles.detalle[i].impuestos.impuesto.valor + "')";
        joinQueryArray.push(joinQuery);
    }
    var queryToBeJoined = '';
    for (var i in joinQueryArray) {
        if (i == joinQueryArray.length -1) {
            queryToBeJoined = queryToBeJoined + joinQueryArray[i];
        } else {
            queryToBeJoined = queryToBeJoined + joinQueryArray[i] + ",";
        }

    }
    query1 = query1 + queryToBeJoined + ";";
    //console.log("\nquery1:\n***********\n"+ query1 + "\n");


    /*
     Inserting into infoAdicional table
     */

    var query2 = "insert into infoAdicional values";
    var joinQuery2Array = [];
    for (var i in json.factura.infoAdicional.campoAdicional) {
        var joinQuery2 = "('" + guid + "','"
                         + json.factura.infoAdicional.campoAdicional[i]['$'].nombre + "','"
                         + json.factura.infoAdicional.campoAdicional[i]['_'] + "')";
        joinQuery2Array.push(joinQuery2);
    }
    var query2ToBeJoined = '';
    for (var i in joinQuery2Array) {
        if (i == joinQuery2Array.length -1) {
            query2ToBeJoined = query2ToBeJoined + joinQuery2Array[i];
        } else {
            query2ToBeJoined = query2ToBeJoined + joinQuery2Array[i] + ",";
        }

    }
    query2 = query2 + query2ToBeJoined + ";";
    //console.log("\nquery2:\n***********\n"+ query2 + "\n");

    /*
     Inserting into infoTributaria table
     */

    var query3 = "insert into infoTributaria values('" +
                 guid + "','" +
                 current_date + "','" +
                 email + "','" +
                 json.factura.infoTributaria.ambiente + "','" +
                 json.factura.infoTributaria.tipoEmision + "','" +
                 json.factura.infoTributaria.razonSocial + "','" +
                 json.factura.infoTributaria.nombreComercial + "','" +
                 json.factura.infoTributaria.ruc + "','" +
                 json.factura.infoTributaria.claveAcceso + "','" +
                 json.factura.infoTributaria.codDoc + "','" +
                 json.factura.infoTributaria.estab + "','" +
                 json.factura.infoTributaria.ptoEmi + "','" +
                 json.factura.infoTributaria.secuencial + "','" +
                 json.factura.infoTributaria.dirMatriz + "');";

    //console.log("\nquery3:\n***********\n"+ query3 + "\n");


    /*
     Inserting into infoFactura table
     */
    var query4 = "insert into infoFactura values('" +
                 guid + "','" +
                 json.factura.infoFactura.fechaEmision + "','" +
                 json.factura.infoFactura.dirEstablecimiento + "','" +
                 json.factura.infoFactura.contribuyenteEspecial + "','" +
                 json.factura.infoFactura.obligadoContabilidad + "','" +
                 json.factura.infoFactura.tipoIdentificacionComprador + "','" +
                 json.factura.infoFactura.razonSocialComprador + "','" +
                 json.factura.infoFactura.identificacionComprador + "','" +
                 json.factura.infoFactura.totalSinImpuestos + "','" +
                 json.factura.infoFactura.totalDescuento + "','" +
                 json.factura.infoFactura.propina + "','" +
                 json.factura.infoFactura.importeTotal + "','" +
                 json.factura.infoFactura.moneda + "');";

    //console.log("\nquery4:\n***********\n"+ query4 + "\n");

    /*
     Inserting into totalConImpuestos table
     */

    var query5 = "insert into totalConImpuestos values";
    var joinQuery5Array = [];
    for (var i in json.factura.infoFactura.totalConImpuestos.totalImpuesto) {
        var joinQuery5 = "('" + guid + "','"
                         + json.factura.infoFactura.totalConImpuestos.totalImpuesto[i].codigo + "','"
                         + json.factura.infoFactura.totalConImpuestos.totalImpuesto[i].codigoPorcentaje + "','"
                         + json.factura.infoFactura.totalConImpuestos.totalImpuesto[i].baseImponible + "','"
                         + json.factura.infoFactura.totalConImpuestos.totalImpuesto[i].tarifa + "','"
                         + json.factura.infoFactura.totalConImpuestos.totalImpuesto[i].valor + "')";
        joinQuery5Array.push(joinQuery5);
    }
    var query5ToBeJoined = '';
    for (var i in joinQuery5Array) {
        if (i == joinQuery5Array.length -1) {
            query5ToBeJoined = query5ToBeJoined + joinQuery5Array[i];
        } else {
            query5ToBeJoined = query5ToBeJoined + joinQuery5Array[i] + ",";
        }

    }
    query5 = query5 + query5ToBeJoined + ";";
    //console.log("\nquery5:\n***********\n"+ query5 + "\n");

    var finalQuery = query1 + query2 + query3 + query4 + query5;
    console.log("\nfinalQuery:\n***********\n"+ finalQuery + "\n");
    connection.query(finalQuery, function (err, rows) {
        if(err) {
            console.log(err);
        } else {
            for (var i in rows) {
                console.log("Rows inserted: ",rows[i].affectedRows);
            }

        }
    });
}

//InsertRecord(json, 'viddesh@gmail.com');



module.exports = router;
