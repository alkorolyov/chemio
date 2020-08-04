// google closure fails if undefined is provided to this module... but it is not needed so whatever...
let ChemDoodle = (function() {
    'use strict';
    let c = {};

    c.iChemLabs = {};
    c.informatics = {};
    c.io = {};
    c.lib = {};
    c.notations = {};
    c.structures = {};
    c.structures.d2 = {};
    c.structures.d3 = {};

    let VERSION = '9.1.0';

    c.getVersion = function() {
        return VERSION;
    };

    return c;

})();
