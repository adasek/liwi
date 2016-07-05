"use strict";

define(['net'], function (net) {


    var LEDnet = function (ip, port) {
        this.ip = ip;
        this.port = port | 5577;
        this.socket = new net.Socket();
        this.state = "init";
        this.on = true;
        this.connect();

        this.answerI = 0;

        this.socket.on("error", function (ev) {
            this.state = "error";
            console.log(" error " + ev.code);
            console.log(JSON.stringify(ev));
        }.bind(this));

        this.socket.on("close", function () {
            this.state = "close";
            console.log(" close");
        }.bind(this));

        this.socket.on("connect", function () {
            this.state = "ready"
            console.log((this.ip) + " is connected");
        }.bind(this));

        this.socket.on("data", function (buffer) {
            for (var i = 0; i < buffer.length; i++) {
                if (this.answerI === 2 && buffer[i] === 0x23) {
                    this.rOn = true;
                } else if (this.answerI === 2 && buffer[i] === 0x24) {
                    this.rOn = false;
                } else if (this.answerI === 2) {
                    console.log("Err:third byte unknown value " + buffer[i].toString(16));
                }

                if (this.answerI === 6) {
                    this.rBrightness = buffer[i];
                }
                this.answerI = (this.answerI + 1) % 11;
            }
            console.log("Is " + (this.rOn ? "on" : "off") + ", brightness=" + this.rBrightness);
        }.bind(this));
    }

    LEDnet.prototype.connect = function () {
        this.socket.connect({port: this.port, host: this.ip});
    };

    LEDnet.prototype.setBrightness = function (val) {
        this.brightness = val % 256;
        this.update();
    };

    LEDnet.prototype.turnOn = function () {
        this.on = true;
        if (this.rOn !== this.on) {
            this.update();
        }
    };

    LEDnet.prototype.turnOff = function () {
        this.on = false;
        if (this.rOn !== this.on) {
            this.update();
        }
    };

    LEDnet.prototype.update = function () {
        if (this.state === "ready") {
            //we can write
            this.socket.write(new Buffer([0xef, 0x01, 0x77])); //init state message
            this.socket.write(new Buffer([0xcc, (this.on ? 0x23 : 0x24), 0x33]));
            this.socket.write(new Buffer([0x56, this.brightness, 0xaa]));
            this.socket.write(new Buffer([0xef, 0x01, 0x77])); //repeat again state message

            //this.socket.end();
        } else {
            setTimeout(this.update.bind(this), 10);
        }
    };

    return LEDnet;
});