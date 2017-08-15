'use strict';

const Hapi = require('hapi');
const instagram = require('instagram-node').instagram();
const server = new Hapi.Server();

/*** Server Configuration ***/
server.connection({ port: 3000, host: 'localhost'});

/*** Instagram Configuration ***/
instagram.use({
  client_id: '',
  client_secret: ''
});
var redirect_uri = 'http://localhost:3000/handleauth';

/*** Routes ***/
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply){
    console.log('Simple Get');
    reply.redirect(instagram.get_authorization_url(redirect_uri, { scope: ['public_content'], state: 'a state' }));
  }
});

server.route({
  method: 'GET',
  path: '/handleauth',
  handler: function (request, reply){
    instagram.authorize_user(request.query.code, redirect_uri, function(err, result) {
      if (err) {
        console.log(err.body);
        reply("Didn't work");
      } else {
        console.log('Yay! Access token is ' + result.access_token);
        instagram.use({
          access_token: result.access_token,
          client_id: '',
          client_secret: ''
        });
        reply('You made it!!');
      }
    });
  }
});

server.route({
  method: 'GET',
  path: '/tag/{tag}',
  handler: function (request, reply){
    console.log('On Tag method');
    instagram.tag_media_recent(encodeURIComponent(request.params.tag), {}, function(err, medias, pagination, remaining, limit) {
      console.log(err);
      reply(medias);
    });
  }
});


/*** Server Start ***/
server.start((err) => {
  if(err){
    throw err;
  }
  console.log('Server running at: ' + server.info.uri);
});
