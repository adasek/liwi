/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 * 
 * @class
 * This is a web-server - part of frontend to library rgb-led 
 * controlling wifi LED controller "MINI 1CH" 
 */

define(['LEDnet'], function (lednet) {

    function Server() {
//todo: load this from file
        this.devices = [];
        this.devices.push({
            "name": "room",
            "ip": "192.168.7.215",
            "port": 5577
        });

        for (var i = 0; i < this.devices.length; i++) {
            var led = new lednet(this.devices[i].ip, this.devices[i].port, function (num) {
                console.log("results:" + led.rBrightness);
                this.devices[num].brightness = led.rBrightness;
                this.devices[num].on = led.rOn;
                this.devices[num].LED = led;
            }.bind(this, i));
        }
    }

    Server.prototype.getDevices = function () {
        if (this.devices && Array.isArray(this.devices)) {
            return this.devices;
        } else {
            throw "getDevices failed";
        }
    };

    return Server;
});