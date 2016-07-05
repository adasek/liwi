/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 * 
 * @class
 * This is a web-server - part of frontend to library rgb-led 
 * controlling wifi LED controller "MINI 1CH" 
 */


define(["rgb-led"],
        function (rgbled) {



            /**
             * @exports Session
             * 
             * @class
             * @classdesc One task = run of underlying program with set of parameters
             * 
             * @constructor
             * @param {Object} options 
             * @returns {Task}
             */
            var Session = function () {



            };

            Session.prototype.handleQuery = function (request, response) {

                response.writeHead(200, 'OK', {'Content-Type': 'application/json'});
                response.write(JSON.stringify(
                        {"hello": "world"}
                ));
                response.end("");
                return;
            };



            return Session;
        });