let ChemDoodle = (function() {
    'use strict';
    var c = {};

    c.iChemLabs = {};
    c.informatics = {};
    c.io = {};
    c.lib = {};
    c.notations = {};
    c.structures = {};
    c.structures.d2 = {};
    c.structures.d3 = {};
    c.uis = {};
    c.uis.gui = {};
    c.uis.gui.desktop = {};

    var VERSION = '7.0.1';

    c.getVersion = function() {
        return VERSION;
    };

    return c;

})();

ChemDoodle.uis.gui.imageDepot = (function (undefined) {
    'use strict';
    let d = {};
    d.getURI = function (s) {
        return 'data:image/svg+xml,' + s;
    };

    d.getCursor = function(cursor) {
        return 'url("data:image/png;base64,' + cursor[0] + '") '+ cursor[1] + ' ' + cursor[2] + ', auto';
    };

    // PNG pointers, image and coords for hotspot correction
    d.POINTER_LASSO = ['iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAVklEQVQoz6WQuRHAQAgDV/Tfk0uTA258jxkcWBmzEh/8lbbKb6YVVTwNNrVEdBggegzxdUVr0FiyGKLpmNf5QNuSxuhSRrS+LzL75FQNM0fbSv0zOnwD5H4V0Q6i+NQAAAAASUVORK5CYII=', 3, 16];
    d.POINTER_ROTATE = ['iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAQ0lEQVQoz2NgIBr8xy7MhF8aoRunAkY03YyETMBpFrIETiUEfUSCAiQlTIRUMmHRi+IjbP5GuIARV8D8xxdoRPsDCgC2xRb2xK4rcwAAAABJRU5ErkJggg==', 6, 6];
    d.POINTER_DRAG = ['iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAYUlEQVQoz32QSQ7AMAgDx/z/z+6BRAUV6hOLM1iBLuM+iLawMVl1w7vg9rcLBrkUaZDquHFGQuXECVgYnSRsYDwB6Ib0eESgSPhmyQzHshsWCdT+YbWVb/m8rycWyk+G1AOPtyIPKl7P8AAAAABJRU5ErkJggg==', 8, 9];

    // SVG icons
    {
        // bottom toolbar
        d.CLEAR = '<svg viewBox="0 0 24 24"><path d="M13.91 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.09zM18 19H6V5h6v3.5a2.5 2.5 0 0 0 2.5 2.5H18zm0-9h-3.5A1.5 1.5 0 0 1 13 8.5V5h.09L18 9.91z"></path></svg>';
        d.ERASE = '<svg viewBox="0 0 24 24"><path d="M20.29 7.71l-3.17-3.17a3.08 3.08 0 0 0-4.24 0l-9.17 9.17a3 3 0 0 0 0 4.24l.34.35a7 7 0 0 0 9.9 0l6.34-6.3a3 3 0 0 0 0-4.29zm-7.75 9.17a5 5 0 0 1-7.08 0l-.34-.34a1 1 0 0 1 0-1.42l4.65-4.64 4.58 4.58zm6.34-6.34l-3.82 3.81-4.58-4.58L14.29 6a1 1 0 0 1 1.42 0l3.17 3.17a1 1 0 0 1 0 1.37z""></path></svg>';
        d.OPEN = '<svg viewBox="0 0 24 24"><path d="M1 5.5V20h18l3.83-7.66A1.56 1.56 0 0 0 21.35 10H7a2.78 2.78 0 0 0-2.34 1.45L2 17.49V5.5a.5.5 0 0 1 .5-.5h3.75a1.27 1.27 0 0 1 1 .62L8.44 8H18a.5.5 0 0 1 .5.5V9h1v-.5A1.5 1.5 0 0 0 18 7H9.06l-.92-1.83A2.27 2.27 0 0 0 6.25 4H2.5A1.5 1.5 0 0 0 1 5.5zM4.12 18l2.33-5.66A.81.81 0 0 1 7 12h13.73l-3 6z"></path></svg>';
        d.SAVE = '<svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v12.41L6.59 21H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 5h8v5H8zm7 14H9v-4h6zm4 0h-3v-5H8v5h-.59L5 16.59V5h2v6h10V5h2z"></path></svg>';
        d.UNDO = '<svg viewBox="0 0 24 24"><path d="M11.75 4.5a7.93 7.93 0 0 0-4.08 1.13L6.25 3.5l-2 6h6L8.78 7.29a6 6 0 1 1 3 11.21v2a8 8 0 0 0 0-16z"></path></svg>';
        d.REDO = '<svg viewBox="0 0 24 24"><path d="M20 9.5l-2-6-1.18 1.77A8 8 0 1 0 12.5 20v-2a6 6 0 1 1 3.21-11.07L14 9.5z"></path></svg>';

        d.LASSO = '<svg viewBox="0 0 24 24"><path d="M11 11l3.33 9.98 1.66-4.99 4.99-1.66L11 11zm5.83-5.38a8.13 8.13 0 0 0-1.81-1l-.38.92a6.9 6.9 0 0 1 1.58.91zM6.44 7.75l-.8-.6A8.27 8.27 0 0 0 4.6 9l.93.38a6.75 6.75 0 0 1 .91-1.63zM5 12a6.84 6.84 0 0 1 .06-.91l-1-.12A6.94 6.94 0 0 0 4 12a7.41 7.41 0 0 0 .07 1.05l1-.13A7 7 0 0 1 5 12zm14.37-3.12a8 8 0 0 0-1.06-1.8l-.79.62a6.91 6.91 0 0 1 .93 1.57zM7.12 18.34a7.92 7.92 0 0 0 1.8 1.05l.39-.93a6.7 6.7 0 0 1-1.58-.91zm5.76-13.29l.12-1a8.52 8.52 0 0 0-2.08 0l.13 1a7.47 7.47 0 0 1 1.83 0zM4.61 15.06a7.59 7.59 0 0 0 1 1.81l.79-.61a7.12 7.12 0 0 1-.91-1.58zm4.68-9.52l-.38-.92a7.92 7.92 0 0 0-1.8 1l.61.79a7.26 7.26 0 0 1 1.57-.87z" ></path></svg>';
        d.BOND_SINGLE = '<svg viewBox="0 0 24 24"><path d="M5.587 17L17 5.586 18.414 7 7.001 18.413z"></path></svg>';
        d.BOND_RECESSED = '<svg width="24" height="24"><g><path d="M 3.15 21.85 L 3.15 21.85 M 5.80 18.10 L 6.88 19.14 M 8.45 14.38 L 10.59 16.56 M 11.08 10.65 L 14.32 13.90 M 13.69 6.93 L 18.04 11.28 M 16.38 3.15 L 21.85 8.60 Z" stroke-width="2.3"></path></g></svg>';
        d.BOND_PROTRUDING = '<svg width="24" height="245" overflow="hidden"><defs></defs><g><path d="M 3.15 21.85 L 18.11 3.15 21.85 6.89 Z"stroke-width="2.3"></path></g></svg>';
        d.CHAIN_CARBON = '<svg viewBox="0 0 24 24"><path d="M6.5 18.5h-1v-7.37l6 3.5v-7l6 3.5V5.5h1v7.37l-6-3.5v7l-6-3.5v5.63z"></path></svg>';
        d.INCREASE_CHARGE = '<svg viewBox="0 0 24 24"><path d="M17 11h-4V7h-2v4H7v2h4v4h2v-4h4v-2z"></path></svg>';
        d.DECREASE_CHARGE = '<svg viewBox="0 0 24 24"><path d="M7 11h10v2H7z"></path></svg>';
    }
    return d;

})();

(function(desktop, imageDepot, undefined) {
    'use strict';
    desktop.Button = function(id, icon, tooltip, func) {
        this.id = id;
        this.icon = icon;
        this.toggle = true;
        this.tooltip = tooltip ? tooltip : '';
        this.func = func ? func : undefined;

        this.enabled = true;
        this.pressed = false;
    };
    let _ = desktop.Button.prototype;
    _.getElement = function() {
        return document.getElementById(this.id);
    };
    _.getSource = function() {
        let sb = [];
        sb.push('<div class="button"');
        sb.push(' id="'+this.id+'"');
        sb.push(' title="'+this.tooltip+'">');
        if (this.icon) {
            sb.push('<div class="icon">');
            sb.push(this.icon);
            sb.push('</div>');
        }
        sb.push('</div>');
        return sb.join('');
    };
    _.setup = function() {
        let element = this.getElement();
        let self = this;
        if (this.toggle) {
            element.onclick = function () {
                if (self.enabled && !self.pressed) {
                    element.classList.add('button-select');
                    self.func();
                    self.pressed = true;
                }
            }
        } else {
            element.onmousedown = function () {
                if (self.enabled) {
                    element.classList.add('button-select');
                    self.pressed = true;
                    self.func();
                }
            }
            element.onmouseup = function () {
                if (self.enabled && self.pressed) {
                    self.pressed = false;
                    element.classList.remove('button-select');
                }
            }
            element.onmouseout = function () {
                if (self.enabled && self.pressed) {
                    self.pressed = false;
                    element.classList.remove('button-select');
                }
            }
        }
    };
    _.disable = function() {
        this.enabled = false;
        this.pressed = false;
        let element = this.getElement();
        element.classList.remove('button-select');
        element.classList.add('button-disable');
    };
    _.enable = function() {
        this.enabled = true;
        let element = this.getElement();
        element.classList.remove('button-disable');
    };
    _.select = function() {
        this.func();
        let element = this.getElement();
        element.classList.add('button-select');
    };
})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot);

(function(desktop, undefined) {
    'use strict';
    desktop.ButtonSet = function(id) {
        this.id = id;
        this.buttons = [];
        this.toggle = true;
        this.columnCount = -1;
    };
    let _ = desktop.ButtonSet.prototype;
    _.getElement = function() {
        return document.getElementById(this.id);
    };
    _.getSource = function() {
        let sb = [];
            sb.push('<div id="');
            sb.push(this.id);
            sb.push('" ');

            sb.push('style="grid-template-columns: repeat(');
            if(this.columnCount===-1) {
                sb.push(this.buttons.length);
            } else {
                sb.push(this.columnCount);
            }
            sb.push(', 1fr);">');

            for ( let i = 0, ii = this.buttons.length; i < ii; i++) {
                sb.push(this.buttons[i].getSource());
            }

            sb.push('</div>');

        return sb.join('');
    };
    _.setup = function() {
        for ( let i = 0, ii = this.buttons.length; i < ii; i++) {
            this.buttons[i].toggle = this.toggle;
            this.buttons[i].setup();
        }
    };

    _.disable = function() {
        for (let i = 0, ii = this.buttons.length; i < ii; i++) {
            this.buttons[i].disable();
        }
    };

    _.enable = function() {
        for (let i = 0, ii = this.buttons.length; i < ii; i++) {
            this.buttons[i].enable();
        }
    };

})(ChemDoodle.uis.gui.desktop);

(function(desktop, imageDepot, undefined) {

    let sketcher = {id:'sketcher'};

    // lasso
    this.buttonLasso = new desktop.Button(sketcher.id + '_button_lasso', imageDepot.LASSO, 'Lasso: [Space]', function() {
        // sketcher.stateManager.setState(sketcher.stateManager.STATE_LASSO);
        // sketcher.lasso.mode = tools.Lasso.MODE_LASSO;
        // if (!sketcher.lasso.isActive()) {
        //     sketcher.lasso.selectNextMolecule();
        // }
    });
    // single bond
    this.buttonSingle = new desktop.Button(sketcher.id + '_button_bond_single', imageDepot.BOND_SINGLE, 'Single Bond [1]', function() {
        // sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
        // sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
        // sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
        // if (sketcher.lasso.isActive()) sketcher.lasso.empty();
    });
    // wedged bond
    this.buttonProtruding = new desktop.Button(sketcher.id + '_button_bond_protruding', imageDepot.BOND_PROTRUDING, 'Wedged Bond [W]', function() {
        // sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
        // sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
        // sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_PROTRUDING;
        // if (sketcher.lasso.isActive()) sketcher.lasso.empty();
    });
    // hashed bond
    this.buttonRecessed = new desktop.Button(sketcher.id + '_button_bond_recessed', imageDepot.BOND_RECESSED, 'Hashed Bond [H]', function() {
        // sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
        // sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
        // sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_RECESSED;
        // if (sketcher.lasso.isActive()) sketcher.lasso.empty();
    });

    let leftToolBar =  new desktop.ButtonSet(sketcher.id + '_left_toolbar');
    leftToolBar.buttons.push(buttonRecessed);
    leftToolBar.buttons.push(buttonLasso);
    leftToolBar.buttons.push(buttonProtruding);
    leftToolBar.buttons.push(buttonSingle);
    leftToolBar.toggle = true;
    leftToolBar.columnCount = 2;

    // clear
    this.buttonClear = new desktop.Button(sketcher.id + '_button_clear', imageDepot.CLEAR, 'Clear', function() {
        console.log(this);
        // let clear = true;
        // if (sketcher.oneMolecule) {
        //     if (sketcher.molecules[0].atoms.length === 1) {
        //         let a = sketcher.molecules[0].atoms[0];
        //         if (a.label === 'C' && a.charge === 0 && a.mass === -1) {
        //             clear = false;
        //         }
        //     }
        // } else {
        //     if (sketcher.molecules.length === 0 && sketcher.shapes.length === 0) {
        //         clear = false;
        //     }
        // }
        // if (clear) {
        //     sketcher.stateManager.getCurrentState().clearHover();
        //     if (sketcher.lasso && sketcher.lasso.isActive()) {
        //         sketcher.lasso.empty();
        //     }
        //     sketcher.historyManager.pushUndo(new actions.ClearAction(sketcher));
        // }
    });
    // center
    this.buttonCenter = new desktop.Button(sketcher.id + '_button_center', imageDepot.CENTER, 'Center: [Space]', function() {
        console.log(this);
        // let dif = new structures.Point(sketcher.width / 2, sketcher.height / 2);
        // let bounds = sketcher.getContentBounds();
        // dif.x -= (bounds.maxX + bounds.minX) / 2;
        // dif.y -= (bounds.maxY + bounds.minY) / 2;
        // sketcher.historyManager.pushUndo(new actions.MoveAction(sketcher.getAllPoints(), dif));
    });
    // open
    this.buttonOpen = new desktop.Button(sketcher.id + '_button_open', imageDepot.OPEN, 'Open: [Ctrl + O]', function() {
        // sketcher.dialogManager.openPopup.show();
    });
    // save
    this.buttonSave = new desktop.Button(sketcher.id + '_button_save', imageDepot.SAVE, 'Save: [Ctrl + S]', function() {
        // if (sketcher.useServices) {
        //     sketcher.dialogManager.saveDialog.clear();
        // } else if (sketcher.lasso.isActive()) {
        //     sketcher.dialogManager.saveDialog.getTextArea().val(c.writeMOL(sketcher.lasso.getFirstMolecule()));
        // }
        // sketcher.dialogManager.saveDialog.open();
    });
    // undo
    this.buttonUndo = new desktop.Button(sketcher.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
        //sketcher.historyManager.undo();
    });
    // redo
    this.buttonRedo = new desktop.Button(sketcher.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
        //sketcher.historyManager.redo();
    });

    let bottomToolBar = new desktop.ButtonSet(sketcher.id + '_bottom_toolbar');
    bottomToolBar.buttons.push(buttonClear);
    bottomToolBar.buttons.push(buttonCenter);
    bottomToolBar.buttons.push(buttonOpen);
    bottomToolBar.buttons.push(buttonSave);
    bottomToolBar.buttons.push(buttonUndo);
    bottomToolBar.buttons.push(buttonRedo);
    bottomToolBar.toggle = false;
    bottomToolBar.columnCount = -1;


    let sb = [];

    sb.push('<div class="left-toolbar">');
        sb.push(leftToolBar.getSource());
    sb.push('</div>');

    sb.push('<div class="canvas-group">');
        sb.push('<canvas class="ChemDoodleWebComponent canvas"></canvas>');
        sb.push(bottomToolBar.getSource());
    sb.push('<div>');

    let editor = document.createElement('div');
    editor.classList.add('editor');
    editor.innerHTML = sb.join('');

    let currentDOM = document.getElementsByTagName('script')[0];
    currentDOM.parentNode.insertBefore(editor, currentDOM);

    leftToolBar.setup();
    leftToolBar.getElement().classList.add('left-toolbar');

    bottomToolBar.setup();
    bottomToolBar.getElement().classList.add('bottom-toolbar');


})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot);


