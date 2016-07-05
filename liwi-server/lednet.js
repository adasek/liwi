"use strict";

define(['net'], function (net) {

    /**
     * 
     * @param {type} controller
     * @param {int} type - 0=QUERY, 1=COMMAND
     * @returns {lednet_L3.ledSocket}
     */
    var ledSocket = function (controller) {
        net.Socket.call(this);
        this.controller = controller;
        this.initConnect();
        this.type = 0;


        this.on("error", function (ev) {
            this.state = "error";
            console.log(" error " + ev.code);
            console.log(JSON.stringify(ev));
        });

        this.on("close", function () {
            this.state = "close";
        });

        this.on("connect", function () {
            this.state = "ready";
            this.update();
            console.log("connected");
        });

        this.on("data", function (buffer) {
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

            if (typeof this._cb === "function") {
                this._cb();
                this._cb = function () {};
            }

            console.log("Is " + (this.controller.rOn ? "on" : "off") + ", brightness=" + this.controller.rBrightness);
        });
    };

    ledSocket.prototype = Object.create(net.Socket.prototype);


    ledSocket.prototype.initConnect = function () {
        console.log("initConnect");
        this.answerI = 0;
        this.connect({port: this.controller.port, host: this.controller.ip});
    };

    /**
     * Creates a socket and then(async) sends a message corresponding
     * to actual state of LEDnet object (on/off, brightness value).
     * Than the socket is closed.
     * Message describing real state should be retrieved.
     * 
     * @param {function} cb - callback
     * @returns {undefined}
     */
    ledSocket.prototype.update = function (cb) {
        if (typeof cb === "function") {
            console.log("setting cb");
            this._cb = cb;
        }
        if (this.state === "ready" && this.type === 1) {
            //we can write
            this.write(new Buffer([0xef, 0x01, 0x77])); //init query state message
            this.write(new Buffer([0xcc, (this.controller.on ? 0x23 : 0x24), 0x33]));
            this.write(new Buffer([0x56, this.controller.brightness, 0xaa]));
            this.write(new Buffer([0xef, 0x01, 0x77])); //repeat again query state message

            /*
             this.end();
             this.initConnect(1);
             */
        } else if (this.state === "ready" && this.type === 0) {
            this.write(new Buffer([0xef, 0x01, 0x77])); //query state message

            this.type = 1;
            /*
             this.end();
             this.initConnect(1);
             */
        } else if (this.state === "ready") {
            throw "unknown type" + this.type;
        } else {
            //todo: change this 
            setTimeout(this.update.bind(this, cb), 10);
        }
    };


    var LEDnet = function (ip, port, cb) {
        this.ip = ip;
        this.port = port | 5577;
        this.state = "init";
        this.on = true;

        this.answerI = 0;
        this.socket = new ledSocket(this);

        this.socket.update(cb);
    };


    LEDnet.prototype.setBrightness = function (val, cb) {
        this.brightness = val % 256;
        this.socket.update(cb);
    };

    LEDnet.prototype.turnOn = function (cb) {
        this.on = true;
        this.socket.update(cb);
    };

    LEDnet.prototype.turnOff = function (cb) {
        this.on = false;
        this.socket.update(cb);
    };


    return LEDnet;
});


