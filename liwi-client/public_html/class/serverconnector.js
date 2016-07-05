/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 */

function ServerConnector(url) {
    this.SERVERADDRESS = url.replace(/\/*$/, "");

    this.ui = null;

    this.communicate();
}



/**
 * Loads remote JSON containing Form structure
 * @param {function} callback - function to be called after data are retrieved (or error is indicated)
 **/
ServerConnector.prototype.communicate = function (callback)
{
    var xhr = this.xhrPrepare(callback);
    xhr.open("POST", this.SERVERADDRESS + "/upload", true);
    if (this.ui) {
        xhr.send(JSON.stringify(this.ui.getValuesJSON()));
    } else {
        xhr.send("{}");
    }
};

ServerConnector.prototype.xhrPrepare = function (callback)
{
    var xhr = new XMLHttpRequest();
    xhr.callerForm = this;
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (callback) {
                    var response = xhr.responseText;
                    if (typeof (response) === "string") {
                        response = JSON.parse(response);
                    }
                    xhr.callerForm.signalWaitEnd();
                    callback(null, response);
                }
            } else {
                console.log("Status:" + xhr.status);

                if (callback) {
                    callback(xhr);
                }
            }
        }
    };
    return xhr;
};