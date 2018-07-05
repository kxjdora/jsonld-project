const express = require('express')
const path = require('path')
const app = express()
var createError = require('http-errors');
var logger = require('morgan');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')))

app.get(/\/T(.+)/, function (req, res) {
  var url=req.params[0];
  if(url.indexOf('.')!=-1){
     url=url.slice(0,url.indexOf('.'));
  }
  
  res.format({
    html: function(){
       console.log('html');
       res.redirect(url+".html");
    },

    json: function(){
      console.log('json');
      res.redirect(url+".json");  
    },

    'application/ld+json': function(){
      console.log('jsonld');
      res.redirect(url+".json");  
    },

    'default': function () {
      // log the request and respond with 406
      res.status(406).send('Not Acceptable');
    }
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log(`App listening at port 3000`)
})

