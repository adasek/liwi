/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 * 
 * @class
 * This is a web-server - part of frontend to library rgb-led 
 * controlling wifi LED controller "MINI 1CH" 
 */


define([], function () {



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
    var Session = function (server) {
        this.server = server;
    };
    Session.prototype.handleQuery = function (request, response) {

        response.writeHead(200, 'OK', {'Content-Type': 'application/json'});
        //todo: nicer
        this.devices = this.server.getDevices();
        for (var i = 0; i < this.devices.length; i++) {


            if (Array.isArray(request.devices) && request.devices.length > i) {
                //fill in retrieved values
                this.devices[i].brightness = request.devices[i].rBrightness;
                this.devices[i].on = request.devices[i].rOn;
                if (request.devices[i].brightness >= 0 && request.devices[i].brightness <= 255 && request.devices[i].brightness === parseInt(request.devices[i].brightness)) {

                    this.devices[i].LED.setBrightness(request.devices[i].brightness);
                    this.devices[i].brightness = request.devices[i].brightness;
                }
                if (request.devices[i].on === true) {
                    this.devices[i].LED.turnOn();
                    this.devices[i].on = true;
                } else if (request.devices[i].on === false) {
                    this.devices[i].LED.turnOff();
                    this.devices[i].on = false;
                }
            }
        }

        response.write(JSON.stringify(this.devices,
                function (key, value) {
                    if (key === "LED") {
                        return;
                    } else {
                        return value;
                    }
                }), 1);
        response.end("");
        return;
    };
    return Session;
});