var express = require ('express');
var server = express()

var GtfsRealtimeBindings = require ('gtfs-realtime-bindings');
var request = require ('request');
var GeoJSON = require ('geojson');

var credentials = require('./credentials.json')

//this is required by openshift, it checks for openshifts env params and if possible use it
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

server.get('/', (req, res) => res.send('Hello World!'))

// // allow CORS
// server.use (function crossOrigin (req, res, next) {
//   res.header ('Access-Control-Allow-Origin', '*');
//   res.header ('Access-Control-Allow-Headers', 'X-Requested-With');
//   return next ();
// });

//rtd credentials
var requestSettings = {
  method: 'GET',
  url: 'http://'+ credentials.username +':'+ credentials.password +'@rtd-denver.com/google_sync/VehiclePosition.pb',
  encoding: null,
};

server.get('/api/geojson', function (req, res){

    request (requestSettings, function(error, response, body){
        if (!error && response.statusCode == 200) {
            var feed = GtfsRealtimeBindings.FeedMessage.decode (body);
      vehicles = [];
      feed.entity.forEach (function (entity) {
        if (entity.vehicle.trip != null) {
          current_status = '';
          if (entity.vehicle.current_status == 1) {
            current_status = 'In Transit To';
          }
          if (entity.vehicle.current_status == 2) {
            current_status = 'Stopped At';
          }
          vehicles.push ({
            trip_id: entity.vehicle.trip.trip_id,
            ID: entity.vehicle.vehicle.id,
            route_id: entity.vehicle.trip.route_id,
            status: current_status,
            stop_id: entity.vehicle.stop_id,
            lng: entity.vehicle.position.longitude,
            lat: entity.vehicle.position.latitude,
            bearing: entity.vehicle.position.bearing,
          });
        }
      });
      res.send (GeoJSON.parse (vehicles, {Point: ['lat', 'lng']}));
    } else {
      console.log (error);
        }
    })
})

server.get ('/api/json', function (req, res) {
  request (requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var feed = GtfsRealtimeBindings.FeedMessage.decode (body);
      vehicles = [];
      feed.entity.forEach (function (entity) {
        if (entity.vehicle.trip != null) {
          current_status = '';
          if (entity.vehicle.current_status == 1) {
            current_status = 'In Transit To';
          }
          if (entity.vehicle.current_status == 2) {
            current_status = 'Stopped At';
          }
          vehicles.push ({
            trip_id: entity.vehicle.trip.trip_id,
            ID: entity.vehicle.vehicle.id,
            route_id: entity.vehicle.trip.route_id,
            status: current_status,
            stop_id: entity.vehicle.stop_id,
            lng: entity.vehicle.position.longitude,
            lat: entity.vehicle.position.latitude,
            bearing: entity.vehicle.position.bearing,
          });
        }
      });
      res.send (vehicles);
    } else {
      console.log (error);
    }
  });
});

//turn the server on
server.listen (server_port, server_ip_address, function () {
  console.log (
    'Listening on ' + server_ip_address + ', server_port ' + server_port
  );
});
