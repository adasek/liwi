"use strict";

define(['net'], function (net) {


    var LEDnet = function (ip, port) {
        this.ip = ip;
        this.port = port | 5577;
        this.state = "init";
        this.on = true;

        this.answerI = 0;

    }

    /**
     * Connect creates a socket and then(async) sends a message corresponding
     * to actual state of LEDnet object (on/off, brightness value).
     * Than the socket is closed.
     * Message describing real state should be retrieved.
     * 
     * @returns {undefined}
     */
    LEDnet.prototype.connect = function () {
        var socket = new net.Socket();
        socket.controller = this;
        socket.answerI = 0;

        socket.connect({port: this.port, host: this.ip});

        socket.update = function () {
            if (this.state === "ready") {
                //we can write
                this.write(new Buffer([0xef, 0x01, 0x77])); //init state message
                this.write(new Buffer([0xcc, (this.controller.on ? 0x23 : 0x24), 0x33]));
                this.write(new Buffer([0x56, this.controller.brightness, 0xaa]));
                this.write(new Buffer([0xef, 0x01, 0x77])); //repeat again state message

                this.end();
            } else {
                console.log("not ready for update");
                //throw?
            }
        };

        socket.on("error", function (ev) {
            this.state = "error";
            console.log(" error " + ev.code);
            console.log(JSON.stringify(ev));
        });

        socket.on("close", function () {
            this.state = "close";
            console.log("close");
        });

        socket.on("connect", function () {
            this.state = "ready";
            this.update();
            console.log("connected");
        });

        socket.on("data", function (buffer) {
            for (var i = 0; i < buffer.length; i++) {
                if (this.answerI === 2 && buffer[i] === 0x23) {
                    this.controller.rOn = true;
                } else if (this.answerI === 2 && buffer[i] === 0x24) {
                    this.controller.rOn = false;
                } else if (this.answerI === 2) {
                    console.log("Err:third byte unknown value " + buffer[i].toString(16));
                }

                if (this.answerI === 6) {
                    this.controller.rBrightness = buffer[i];
                }
                this.answerI = (this.answerI + 1) % 11;
            }
            console.log("Is " + (this.controller.rOn ? "on" : "off") + ", brightness=" + this.controller.rBrightness);
        });
    };

    LEDnet.prototype.setBrightness = function (val) {
        this.brightness = val % 256;
        this.connect();
    };

    LEDnet.prototype.turnOn = function () {
        this.on = true;
        this.connect();
    };

    LEDnet.prototype.turnOff = function () {
        this.on = false;
        this.connect();
    };


    return LEDnet;
});