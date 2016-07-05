/* 
 * @copyright Adam Benda, 2016
 * @license MIT
 */

function UI(serverConnector) {
    this.serverConnector = serverConnector;
    this.serverConnector.ui = this;
}

UI.prototype.getValuesJSON = function () {
    return {};
};