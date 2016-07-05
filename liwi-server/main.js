/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 * 
 * This is a web-server - part of frontend to library rgb-led 
 * controlling wifi LED controller "MINI 1CH" 
 */

var requirejs = require('requirejs');
requirejs.config({
    nodeRequire: require,
    enforceDefine: false,
    baseUrl: "./"
});



requirejs(['session', 'path', 'fs', 'http', 'md5'],
        function (Session, path, fs, http, md5) {

            var PORT = 8082;

            /**
             * @exports RequestService
             * 
             * @class
             * @classdesc This is responsible for communicating with one client.
             * 
             * @param {http.IncomingMessage} request
             * @param {http.ServerResponse} response
             * @constructor
             */
            function RequestService(request, response) {

                this.request = request;
                this.response = response;
                //debug reasons (when client is run separately in Netbeans)
                response.setHeader("Access-Control-Allow-Origin", "*");
                if (this.request.url === "/upload" && this.request.method === "POST") {
                    this.handleUpload();
                } else if (this.request.method === "GET") {
                    this.handleFileGet();
                } else {
                    //unknown, unauthorized handler
                    this.handleError();
                }
            }

            RequestService.prototype.handleUpload = function () {
                this.body = '';
                this.request.on('data', function (data) {
                    this.body += data;
                    if (this.body.length > 1e7) {
                        this.response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
                        this.response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
                    }
                }.bind(this));

                this.request.on('end', function () {
                    try {
                        this.receivedData = JSON.parse(this.body);

                    } catch (e) {
                        console.log("received data error " + e.toString());
                        this.handleError();
                        return;
                    }

                    //Unique session ID: todo: login+pass
                    var reqHash = md5(JSON.stringify(this.receivedData));

                    var session = this.sessions[reqHash];
                    if (session !== undefined) {


                    } else {
                        //session is undefined = create new session
                        session = new Session();
                        this.sessions[reqHash] = session;
                    }
                    //session exists and is in progress

                    session.handleQuery(this.receivedData, this.response);


                }.bind(this));
                return;
            };

            RequestService.prototype.handleFileGet = function () {
                //Simple content of files in "data" folder
                var buffer = new Buffer(1000000);
                var relFilename = path.normalize('./' + this.request.url);
                if (relFilename.substr(0, 4) === "def/") {
                    fs.open(relFilename, 'r', function (err, fd) {
                        if (err) {
                            this.response.statusCode = 404;
                            this.response.statusMessage = "Not found";
                            this.response.end();
                        } else {

                            if (path.extname(relFilename) === ".json") {
                                this.response.setHeader("Content-Type", "application/json");
                            }
                            //todo: another content-types

                            fs.read(fd, buffer, 0, buffer.length, 0, function (e, l, b) {
                                this.response.write(b.toString('utf8', 0, l));
                                this.response.end();
                            }.bind(this));
                        }
                    }.bind(this));
                } else {
                    this.handleError();
                }
            };

            /** 
             * Handler when request is invalid
             * @returns {undefined}
             */
            RequestService.prototype.handleError = function () {
                this.response.statusCode = 403;
                this.response.statusMessage = "Forbidden";
                this.response.end();
            };


            /**
             * Static array of all Sessions
             * @type Array
             */
            RequestService.sessions = [];
            RequestService.prototype.sessions = [];

            activeRequests = [];

            var server = http.createServer(function (request, response) {
                activeRequests.push(new RequestService(request, response));
            });
//Lets start our server
            server.timeout = 0;
            server.listen(PORT, function () {
                //Callback triggered when server is successfully listening. Hurray!
                console.log("Server listening on: http://localhost:%s", PORT);
            });

        });