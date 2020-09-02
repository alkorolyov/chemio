//************************ UI ELEMENTS ***********************

(function(desktop, imageDepot, undefined) {
    'use strict';
    desktop.Button = function(id, icon, tooltip, func) {
        this.id = id;
        this.icon = icon;
        this.toggle = true;
        this.tooltip = tooltip ? tooltip : '';
        this.func = func ? func : undefined;

        this.enabled = true;
        this.selected = false;
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
    _.setup = function(single) {
        let self = this;
        let element = this.getElement();

        if (this.toggle) {
            element.onclick = function (e) {
                e.btn = self;
                if (self.enabled && !self.selected) {
                    self.select();
                } else if (self.enabled && self.selected && single) {
                    self.deselect();
                }
            }
        } else {
            element.onmousedown = function () {
                if (self.enabled) {
                    element.classList.add('button-select');
                    self.selected = true;
                    self.func();
                }
            }
            element.onmouseup = function () {
                if (self.enabled && self.selected) {
                    self.selected = false;
                    element.classList.remove('button-select');
                }
            }
            element.onmouseout = function () {
                if (self.enabled && self.selected) {
                    self.selected = false;
                    element.classList.remove('button-select');
                }
            }
        }
    };
    _.disable = function() {
        this.enabled = false;
        this.selected = false;
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
        this.selected = true;
        this.func();
        let element = this.getElement();
        element.classList.add('button-select');
    };
    _.deselect = function() {
        this.selected = false;
        let element = this.getElement();
        element.classList.remove('button-select');
    }
})(Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot);
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
    /**
     * Setup for whole buttonset
     * @param {string} style classname for styling
     */
    _.setup = function(style) {
        let self = this;
        let element = this.getElement();
        if (style) {
            this.getElement().classList.add(style);
        }
        if (this.toggle) {
            element.onclick = function(e) {
                if (!e.btn) return;

                for (let i = 0, ii = self.buttons.length; i < ii; i++) {
                    let btn = self.buttons[i];
                    if (e.btn === btn) {
                        // find previous and deselect it
                        let oldBtn = undefined;
                        for (let j = 0, jj = self.buttons.length; j < jj; j++) {
                            oldBtn = self.buttons[j];
                            if (oldBtn !== btn && oldBtn.selected) break;
                        }
                        if (oldBtn) oldBtn.deselect();
                    }
                }
            }
        }
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

})(Chemio.uis.gui.desktop);

//region Unused ui's
// (function(desktop, q, undefined) {
// 	'use strict';
// 	desktop.CheckBox = function(id, tooltip, func, checked) {
// 		this.id = id;
// 		this.checked = checked ? checked : false;
// 		this.tooltip = tooltip ? tooltip : '';
// 		this.func = func ? func : undefined;
// 	};
// 	let _ = desktop.CheckBox.prototype = new desktop.Button();
// 	_.getSource = function() {
// 		let sb = [];
// 		sb.push('<input type="checkbox" id="');
// 		sb.push(this.id);
// 		sb.push('" ');
// 		if (this.checked) {
// 			sb.push('checked="" ');
// 		}
// 		sb.push('><label for="');
// 		sb.push(this.id);
// 		sb.push('">');
// 		sb.push(this.tooltip);
// 		sb.push('</label>');
// 		return sb.join('');
// 	};
// 	_.setup = function() {
// 		this.getElement().click(this.func);
// 	};
//
// 	_.check = function() {
// 		this.checked = true;
// 		this.getElement().prop('checked', true);
// 	};
//
// 	_.uncheck = function() {
// 		this.checked = false;
// 		this.getElement().removeAttr('checked');
// 	};
// })(Chemio.uis.gui.desktop, Chemio.lib.jQuery);

// (function(desktop, q, undefined) {
// 	'use strict';
// 	desktop.ColorPicker = function (id, tooltip, func) {
// 		this.id = id;
// 		this.tooltip = tooltip ? tooltip : '';
// 		this.func = func ? func : undefined;
// 	};
// 	let _ = desktop.ColorPicker.prototype;
// 	_.getElement = function() {
// 		return q('#' + this.id);
// 	};
// 	_.getSource = function() {
// 		let sb = [];
// 		sb.push('<table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td><p>');
// 		sb.push(this.tooltip);
// 		sb.push('</p></td><td><input id="');
// 		sb.push(this.id);
// 		sb.push('" class="simple_color" value="#000000" /></td></tr></table>');
// 		return sb.join('');
// 	};
// 	_.setup = function() {
// 		this.getElement().simpleColor({
// 			boxWidth : 20,
// 			livePreview : true,
// 			chooserCSS: { 'z-index' : '900'},
// 			onSelect : this.func });
// 	};
// 	_.setColor = function(color) {
// 		this.getElement().setColor(color);
// 	};
// })(Chemio.uis.gui.desktop, Chemio.lib.jQuery);

// (function(desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.Dialog = function(sketcherid, subid, title) {
// 		// sketcherid is the DOM element id everything will be anchored around
// 		// when adding dynamically.
// 		this.sketcherid = sketcherid;
// 		this.id = sketcherid + subid;
// 		this.title = title ? title : 'Information';
// 	};
// 	let _ = desktop.Dialog.prototype;
// 	_.buttons = undefined;
// 	_.message = undefined;
// 	_.afterMessage = undefined;
// 	_.includeTextArea = false;
// 	_.includeTextField = false;
// 	_.getElement = function() {
// 		return q('#' + this.id);
// 	};
// 	_.getTextArea = function() {
// 		return q('#' + this.id + '_ta');
// 	};
// 	_.getTextField = function() {
// 		return q('#' + this.id + '_tf');
// 	};
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		if (this.message) {
// 			sb.push('<p>');
// 			sb.push(this.message);
// 			sb.push('</p>');
// 		}
// 		if (this.includeTextField) {
// 			sb.push('<input type="text" style="font-family:\'Courier New\';" id="');
// 			sb.push(this.id);
// 			sb.push('_tf" autofocus></input>');
// 		}
// 		if (this.includeTextArea) {
// 			sb.push('<textarea style="font-family:\'Courier New\';" id="');
// 			sb.push(this.id);
// 			sb.push('_ta" cols="55" rows="10"></textarea>');
// 		}
// 		if (this.afterMessage) {
// 			sb.push('<p>');
// 			sb.push(this.afterMessage);
// 			sb.push('</p>');
// 		}
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcherid)) {
// 			let canvas = q('#' + this.sketcherid);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		let self = this;
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 435,
// 			buttons : self.buttons
// 		});
// 	};
// 	_.open = function() {
// 		this.getElement().dialog('open');
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(c, structures, actions, desktop, q, document, undefined) {
// 	'use strict';
//
// 	let makeRow = function(id, name, tag, description, component) {
// 		let sb = ['<tr>'];
// 		// checkbox for include
// 		sb.push('<td>');
// 		if(id.indexOf('_elements')===-1){
// 			sb.push('<input type="checkbox" id="');
// 			sb.push(id);
// 			sb.push('_include">');
// 		}
// 		sb.push('</td>');
// 		// name and tag
// 		sb.push('<td>');
// 		sb.push(name);
// 		if(tag){
// 			sb.push('<br>(<strong>');
// 			sb.push(tag);
// 			sb.push('</strong>)');
// 		}
// 		sb.push('</td>');
// 		// component
// 		sb.push('<td style="padding-left:20px;padding-right:20px;">');
// 		sb.push(description);
// 		if(component){
// 			if(component===1){
// 				sb.push('<br>');
// 				sb.push('<input type="text" id="');
// 				sb.push(id);
// 				sb.push('_value">');
// 			}else{
// 				sb.push(component);
// 			}
// 		}
// 		sb.push('</td>');
// 		// checkbox for not
// 		sb.push('<td><input type="checkbox" id="');
// 		sb.push(id);
// 		sb.push('_not"><br><strong>NOT</strong>');
// 		sb.push('</td>');
// 		// close
// 		sb.push('</tr>');
// 		return sb.join('');
// 	};
//
// 	desktop.AtomQueryDialog = function(sketcher, subid) {
// 		this.sketcher = sketcher;
// 		this.id = sketcher.id + subid;
// 	};
// 	let _ = desktop.AtomQueryDialog.prototype = new desktop.Dialog();
// 	_.title = 'Atom Query';
// 	_.setAtom = function(a) {
// 		this.a = a;
// 		let use = a.query;
// 		if(!use){
// 			use = new structures.Query(structures.Query.TYPE_ATOM);
// 			use.elements.v.push(a.label);
// 		}
// 		for(let i = 0, ii = this.periodicTable.cells.length; i<ii; i++){
// 			this.periodicTable.cells[i].selected = use.elements.v.indexOf(this.periodicTable.cells[i].element.symbol)!==-1;
// 		}
// 		this.periodicTable.repaint();
// 		q('#'+this.id+'_el_any').prop("checked", use.elements.v.indexOf('a')!==-1);
// 		q('#'+this.id+'_el_noth').prop("checked", use.elements.v.indexOf('r')!==-1);
// 		q('#'+this.id+'_el_het').prop("checked", use.elements.v.indexOf('q')!==-1);
// 		q('#'+this.id+'_el_hal').prop("checked", use.elements.v.indexOf('x')!==-1);
// 		q('#'+this.id+'_el_met').prop("checked", use.elements.v.indexOf('m')!==-1);
// 		q('#'+this.id+'_elements_not').prop("checked", use.elements.not);
//
// 		q('#'+this.id+'_aromatic_include').prop("checked", use.aromatic!==undefined);
// 		q('#'+this.id+'_aromatic_not').prop("checked", use.aromatic!==undefined&&use.aromatic.not);
// 		q('#'+this.id+'_charge_include').prop("checked", use.charge!==undefined);
// 		q('#'+this.id+'_charge_value').val(use.charge?use.outputRange(use.charge.v):'');
// 		q('#'+this.id+'_charge_not').prop("checked", use.charge!==undefined&&use.charge.not);
// 		q('#'+this.id+'_hydrogens_include').prop("checked", use.hydrogens!==undefined);
// 		q('#'+this.id+'_hydrogens_value').val(use.hydrogens?use.outputRange(use.hydrogens.v):'');
// 		q('#'+this.id+'_hydrogens_not').prop("checked", use.charge!==undefined&&use.charge.not);
// 		q('#'+this.id+'_ringCount_include').prop("checked", use.ringCount!==undefined);
// 		q('#'+this.id+'_ringCount_value').val(use.ringCount?use.outputRange(use.ringCount.v):'');
// 		q('#'+this.id+'_ringCount_not').prop("checked", use.ringCount!==undefined&&use.ringCount.not);
// 		q('#'+this.id+'_saturation_include').prop("checked", use.saturation!==undefined);
// 		q('#'+this.id+'_saturation_not').prop("checked", use.saturation!==undefined&&use.saturation.not);
// 		q('#'+this.id+'_connectivity_include').prop("checked", use.connectivity!==undefined);
// 		q('#'+this.id+'_connectivity_value').val(use.connectivity?use.outputRange(use.connectivity.v):'');
// 		q('#'+this.id+'_connectivity_not').prop("checked", use.connectivity!==undefined&&use.connectivity.not);
// 		q('#'+this.id+'_connectivityNoH_include').prop("checked", use.connectivityNoH!==undefined);
// 		q('#'+this.id+'_connectivityNoH_value').val(use.connectivityNoH?use.outputRange(use.connectivityNoH.v):'');
// 		q('#'+this.id+'_connectivityNoH_not').prop("checked", use.connectivityNoH!==undefined&&use.connectivityNoH.not);
// 		q('#'+this.id+'_chirality_include').prop("checked", use.chirality!==undefined);
// 		if(!use.chirality || use.chirality.v === 'R'){
// 			q('#'+this.id+'_chiral_r').prop('checked', true).button('refresh');
// 		}else if(!use.chirality || use.chirality.v === 'S'){
// 			q('#'+this.id+'_chiral_s').prop('checked', true).button('refresh');
// 		}else if(!use.chirality || use.chirality.v === 'A'){
// 			q('#'+this.id+'_chiral_a').prop('checked', true).button('refresh');
// 		}
// 		q('#'+this.id+'_chirality_not').prop("checked", use.chirality!==undefined&&use.chirality.not);
// 	};
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;text-align:center;height:300px;overflow-y:scroll;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		sb.push('<p>Set the following form to define the atom query.</p>');
// 		sb.push('<table>');
// 		sb.push(makeRow(this.id+'_elements', 'Identity', undefined, 'Select any number of elements and/or wildcards.', '<canvas class="ChemioWebComponent" id="'+this.id+'_pt"></canvas><br><input type="checkbox" id="'+this.id+'_el_any">Any (a)<input type="checkbox" id="'+this.id+'_el_noth">!Hydrogen (r)<input type="checkbox" id="'+this.id+'_el_het">Heteroatom (q)<br><input type="checkbox" id="'+this.id+'_el_hal">Halide (x)<input type="checkbox" id="'+this.id+'_el_met">Metal (m)'));
// 		sb.push('<tr><td colspan="4"><hr style="width:100%"></td></tr>');
// 		sb.push(makeRow(this.id+'_aromatic', 'Aromatic', 'A', 'Specifies that the matched atom should be aromatic. Use the NOT modifier to specify not aromatic or anti-aromatic.'));
// 		sb.push(makeRow(this.id+'_charge', 'Charge', 'C', 'Defines the allowed charge for the matched atom.', 1));
// 		sb.push(makeRow(this.id+'_hydrogens', 'Hydrogens', 'H', 'Defines the total number of hydrogens attached to the atom, implicit and explicit.', 1));
// 		sb.push(makeRow(this.id+'_ringCount', 'Ring Count', 'R', 'Defines the total number of rings this atom is a member of. (SSSR)', 1));
// 		sb.push(makeRow(this.id+'_saturation', 'Saturation', 'S', 'Specifies that the matched atom should be saturated. Use the NOT modifier to specify unsaturation.'));
// 		sb.push(makeRow(this.id+'_connectivity', 'Connectivity', 'X', 'Defines the total number of bonds connected to the atom, including all hydrogens.', 1));
// 		sb.push(makeRow(this.id+'_connectivityNoH', 'Connectivity (No H)', 'x', 'Defines the total number of bonds connected to the atom, excluding all hydrogens.', 1));
// 		sb.push(makeRow(this.id+'_chirality', 'Chirality', '@', 'Defines the stereochemical configuration of the atom.', '<div id="'+this.id+'_radio"><input type="radio" id="'+this.id+'_chiral_a" name="radio"><label for="'+this.id+'_chiral_a">Any (A)</label><input type="radio" id="'+this.id+'_chiral_r" name="radio"><label for="'+this.id+'_chiral_r">Rectus (R)</label><input type="radio" id="'+this.id+'_chiral_s" name="radio"><label for="'+this.id+'_chiral_s">Sinestra (S)</label></div>'));
// 		sb.push('</table>');
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		this.periodicTable = new c.PeriodicTableCanvas(this.id + '_pt', 16);
// 		this.periodicTable.allowMultipleSelections = true;
// 		this.periodicTable.drawCell = function(ctx, styles, cell){
// 		    //if hovered, then show a red background
// 		    if(this.hovered===cell){
// 		      ctx.fillStyle='blue';
// 		      ctx.fillRect(cell.x, cell.y, cell.dimension, cell.dimension);
// 		    }else if(cell.selected){
// 			    ctx.fillStyle='#c10000';
// 			    ctx.fillRect(cell.x, cell.y, cell.dimension, cell.dimension);
// 			}
// 		    //draw the main cells
// 		    ctx.strokeStyle='black';
// 		    ctx.strokeRect(cell.x, cell.y, cell.dimension, cell.dimension);
// 		    ctx.font = '10px Sans-serif';
// 		    ctx.fillStyle='black';
// 		    ctx.textAlign = 'center';
// 		    ctx.textBaseline = 'middle';
// 		    ctx.fillText(cell.element.symbol, cell.x+cell.dimension/2, cell.y+cell.dimension/2);
// 		};
// 		this.periodicTable.repaint();
// 		let self = this;
// 		function setNewQuery(){
// 			let query = new structures.Query(structures.Query.TYPE_ATOM);
//
// 			if(q('#'+self.id+'_el_any').is(':checked')){
// 				query.elements.v.push('a');
// 			}
// 			if(q('#'+self.id+'_el_noth').is(':checked')){
// 				query.elements.v.push('r');
// 			}
// 			if(q('#'+self.id+'_el_het').is(':checked')){
// 				query.elements.v.push('q');
// 			}
// 			if(q('#'+self.id+'_el_hal').is(':checked')){
// 				query.elements.v.push('x');
// 			}
// 			if(q('#'+self.id+'_el_met').is(':checked')){
// 				query.elements.v.push('m');
// 			}
// 			for(let i = 0, ii = self.periodicTable.cells.length; i<ii; i++){
// 				if(self.periodicTable.cells[i].selected){
// 					query.elements.v.push(self.periodicTable.cells[i].element.symbol);
// 				}
// 			}
// 			if(q('#'+self.id+'_elements_not').is(':checked')){
// 				query.elements.not = true;
// 			}
//
// 			if(q('#'+self.id+'_aromatic_include').is(':checked')){
// 				query.aromatic = {v:true,not:q('#'+self.id+'_aromatic_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_charge_include').is(':checked')){
// 				query.charge = {v:query.parseRange(q('#'+self.id+'_charge_value').val()),not:q('#'+self.id+'_charge_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_hydrogens_include').is(':checked')){
// 				query.hydrogens = {v:query.parseRange(q('#'+self.id+'_hydrogens_value').val()),not:q('#'+self.id+'_hydrogens_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_ringCount_include').is(':checked')){
// 				query.ringCount = {v:query.parseRange(q('#'+self.id+'_ringCount_value').val()),not:q('#'+self.id+'_ringCount_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_saturation_include').is(':checked')){
// 				query.saturation = {v:true,not:q('#'+self.id+'_saturation_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_connectivity_include').is(':checked')){
// 				query.connectivity = {v:query.parseRange(q('#'+self.id+'_connectivity_value').val()),not:q('#'+self.id+'_connectivity_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_connectivityNoH_include').is(':checked')){
// 				query.connectivityNoH = {v:query.parseRange(q('#'+self.id+'_connectivityNoH_value').val()),not:q('#'+self.id+'_connectivityNoH_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_chirality_include').is(':checked')){
// 				let val = 'R';
// 				if(q('#'+self.id+'_chiral_a').is(':checked')){
// 					val = 'A';
// 				}else if(q('#'+self.id+'_chiral_s').is(':checked')){
// 					val = 'S';
// 				}
// 				query.chirality = {v:val,not:q('#'+self.id+'_chirity_not').is(':checked')};
// 			}
//
// 			self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.a, query));
// 			q(this).dialog('close');
// 		};
// 		q('#'+this.id+'_radio').buttonset();
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 500,
// 			height: 300,
// 			buttons : {
// 				'Cancel' : function(){q(this).dialog('close');},
// 				'Remove' : function(){self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.a));q(this).dialog('close');},
// 				'Set' : setNewQuery
// 			},
// 			open : function(event, ui) {
// 				q("#"+self.id).animate({ scrollTop: 0 }, "fast");
// 			}
// 		});
// 	};
//
// })(Chemio, Chemio.structures, Chemio.uis.actions, Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(c, structures, actions, desktop, imageDepot, q, document, undefined) {
// 	'use strict';
//
// 	let makeRow = function(id, name, tag, description, component) {
// 		let sb = ['<tr>'];
// 		// checkbox for include
// 		sb.push('<td>');
// 		if(id.indexOf('_orders')===-1){
// 			sb.push('<input type="checkbox" id="');
// 			sb.push(id);
// 			sb.push('_include">');
// 		}
// 		sb.push('</td>');
// 		// name and tag
// 		sb.push('<td>');
// 		sb.push(name);
// 		if(tag){
// 			sb.push('<br>(<strong>');
// 			sb.push(tag);
// 			sb.push('</strong>)');
// 		}
// 		sb.push('</td>');
// 		// component
// 		sb.push('<td style="padding-left:20px;padding-right:20px;">');
// 		sb.push(description);
// 		if(component){
// 			if(component===1){
// 				sb.push('<br>');
// 				sb.push('<input type="text" id="');
// 				sb.push(id);
// 				sb.push('_value">');
// 			}else{
// 				sb.push(component);
// 			}
// 		}
// 		sb.push('</td>');
// 		// checkbox for not
// 		sb.push('<td><input type="checkbox" id="');
// 		sb.push(id);
// 		sb.push('_not"><br><strong>NOT</strong>');
// 		sb.push('</td>');
// 		// close
// 		sb.push('</tr>');
// 		return sb.join('');
// 	};
//
// 	desktop.BondQueryDialog = function(sketcher, subid) {
// 		this.sketcher = sketcher;
// 		this.id = sketcher.id + subid;
// 	};
// 	let _ = desktop.BondQueryDialog.prototype = new desktop.Dialog();
// 	_.title = 'Bond Query';
// 	_.setBond = function(b) {
// 		this.b = b;
// 		let use = b.query;
// 		if(!use){
// 			use = new structures.Query(structures.Query.TYPE_BOND);
// 			switch(b.bondOrder){
// 			case 0:
// 				use.orders.v.push('0');
// 				break;
// 			case 0.5:
// 				use.orders.v.push('h');
// 				break;
// 			case 1:
// 				use.orders.v.push('1');
// 				break;
// 			case 1.5:
// 				use.orders.v.push('r');
// 				break;
// 			case 2:
// 				use.orders.v.push('2');
// 				break;
// 			case 3:
// 				use.orders.v.push('3');
// 				break;
// 			}
// 		}
//
// 		q('#'+this.id+'_type_0').prop("checked", use.orders.v.indexOf('0')!==-1).button('refresh');
// 		q('#'+this.id+'_type_1').prop("checked", use.orders.v.indexOf('1')!==-1).button('refresh');
// 		q('#'+this.id+'_type_2').prop("checked", use.orders.v.indexOf('2')!==-1).button('refresh');
// 		q('#'+this.id+'_type_3').prop("checked", use.orders.v.indexOf('3')!==-1).button('refresh');
// 		q('#'+this.id+'_type_4').prop("checked", use.orders.v.indexOf('4')!==-1).button('refresh');
// 		q('#'+this.id+'_type_5').prop("checked", use.orders.v.indexOf('5')!==-1).button('refresh');
// 		q('#'+this.id+'_type_6').prop("checked", use.orders.v.indexOf('6')!==-1).button('refresh');
// 		q('#'+this.id+'_type_h').prop("checked", use.orders.v.indexOf('h')!==-1).button('refresh');
// 		q('#'+this.id+'_type_r').prop("checked", use.orders.v.indexOf('r')!==-1).button('refresh');
// 		q('#'+this.id+'_type_a').prop("checked", use.orders.v.indexOf('a')!==-1).button('refresh');
// 		q('#'+this.id+'_orders_not').prop("checked", use.orders.not);
//
// 		q('#'+this.id+'_aromatic_include').prop("checked", use.aromatic!==undefined);
// 		q('#'+this.id+'_aromatic_not').prop("checked", use.aromatic!==undefined&&use.aromatic.not);
// 		q('#'+this.id+'_ringCount_include').prop("checked", use.ringCount!==undefined);
// 		q('#'+this.id+'_ringCount_value').val(use.ringCount?use.outputRange(use.ringCount.v):'');
// 		q('#'+this.id+'_ringCount_not').prop("checked", use.ringCount!==undefined&&use.ringCount.not);
// 		q('#'+this.id+'_stereo_include').prop("checked", use.stereo!==undefined);
// 		if(!use.stereo || use.stereo.v === 'E'){
// 			q('#'+this.id+'_stereo_e').prop('checked', true).button('refresh');
// 		}else if(!use.stereo || use.stereo.v === 'Z'){
// 			q('#'+this.id+'_stereo_z').prop('checked', true).button('refresh');
// 		}else if(!use.stereo || use.stereo.v === 'A'){
// 			q('#'+this.id+'_stereo_a').prop('checked', true).button('refresh');
// 		}
// 		q('#'+this.id+'_stereo_not').prop("checked", use.stereo!==undefined&&use.stereo.not);
// 	};
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;text-align:center;height:300px;overflow-y:scroll;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		sb.push('<p>Set the following form to define the bond query.</p>');
// 		sb.push('<table>');
// 		sb.push(makeRow(this.id+'_orders', 'Identity', undefined, 'Select any number of bond types.', '<div id="'+this.id+'_radioTypes"><input type="checkbox" id="'+this.id+'_type_0"><label for="'+this.id+'_type_0"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_ZERO)+'" /></label><input type="checkbox" id="'+this.id+'_type_1"><label for="'+this.id+'_type_1"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_SINGLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_2"><label for="'+this.id+'_type_2"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_DOUBLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_3"><label for="'+this.id+'_type_3"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_TRIPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_4"><label for="'+this.id+'_type_4"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_QUADRUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_5"><label for="'+this.id+'_type_5"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_QUINTUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_6"><label for="'+this.id+'_type_6"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_SEXTUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_h"><label for="'+this.id+'_type_h"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_HALF)+'" /></label><input type="checkbox" id="'+this.id+'_type_r"><label for="'+this.id+'_type_r"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_RESONANCE)+'" /></label><input type="checkbox" id="'+this.id+'_type_a"><label for="'+this.id+'_type_a"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_ANY)+'" /></label></div>'));
// 		sb.push('<tr><td colspan="4"><hr style="width:100%"></td></tr>');
// 		sb.push(makeRow(this.id+'_aromatic', 'Aromatic', 'A', 'Specifies that the matched bond should be aromatic. Use the NOT modifier to specify not aromatic or anti-aromatic.'));
// 		sb.push(makeRow(this.id+'_ringCount', 'Ring Count', 'R', 'Defines the total number of rings this bond is a member of. (SSSR)', 1));
// 		sb.push(makeRow(this.id+'_stereo', 'Stereochemistry', '@', 'Defines the stereochemical configuration of the bond.', '<div id="'+this.id+'_radio"><input type="radio" id="'+this.id+'_stereo_a" name="radio"><label for="'+this.id+'_stereo_a">Any (A)</label><input type="radio" id="'+this.id+'_stereo_e" name="radio"><label for="'+this.id+'_stereo_e">Entgegen (E)</label><input type="radio" id="'+this.id+'_stereo_z" name="radio"><label for="'+this.id+'_stereo_z">Zusammen (Z)</label></div>'));
// 		sb.push('</table>');
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		let self = this;
// 		function setNewQuery(){
// 			let query = new structures.Query(structures.Query.TYPE_BOND);
//
// 			if(q('#'+self.id+'_type_0').is(':checked')){
// 				query.orders.v.push('0');
// 			}
// 			if(q('#'+self.id+'_type_1').is(':checked')){
// 				query.orders.v.push('1');
// 			}
// 			if(q('#'+self.id+'_type_2').is(':checked')){
// 				query.orders.v.push('2');
// 			}
// 			if(q('#'+self.id+'_type_3').is(':checked')){
// 				query.orders.v.push('3');
// 			}
// 			if(q('#'+self.id+'_type_4').is(':checked')){
// 				query.orders.v.push('4');
// 			}
// 			if(q('#'+self.id+'_type_5').is(':checked')){
// 				query.orders.v.push('5');
// 			}
// 			if(q('#'+self.id+'_type_6').is(':checked')){
// 				query.orders.v.push('6');
// 			}
// 			if(q('#'+self.id+'_type_h').is(':checked')){
// 				query.orders.v.push('h');
// 			}
// 			if(q('#'+self.id+'_type_r').is(':checked')){
// 				query.orders.v.push('r');
// 			}
// 			if(q('#'+self.id+'_type_a').is(':checked')){
// 				query.orders.v.push('a');
// 			}
// 			if(q('#'+self.id+'_orders_not').is(':checked')){
// 				query.orders.not = true;
// 			}
//
// 			if(q('#'+self.id+'_aromatic_include').is(':checked')){
// 				query.aromatic = {v:true,not:q('#'+self.id+'_aromatic_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_ringCount_include').is(':checked')){
// 				query.ringCount = {v:query.parseRange(q('#'+self.id+'_ringCount_value').val()),not:q('#'+self.id+'_ringCount_not').is(':checked')};
// 			}
// 			if(q('#'+self.id+'_stereo_include').is(':checked')){
// 				let val = 'E';
// 				if(q('#'+self.id+'_stereo_a').is(':checked')){
// 					val = 'A';
// 				}else if(q('#'+self.id+'_stereo_z').is(':checked')){
// 					val = 'Z';
// 				}
// 				query.stereo = {v:val,not:q('#'+self.id+'_stereo_not').is(':checked')};
// 			}
//
// 			self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.b, query));
// 			q(this).dialog('close');
// 		};
// 		q('#'+this.id+'_radioTypes').buttonset();
// 		q('#'+this.id+'_radio').buttonset();
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 520,
// 			height: 300,
// 			buttons : {
// 				'Cancel' : function(){q(this).dialog('close');},
// 				'Remove' : function(){self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.b));q(this).dialog('close');},
// 				'Set' : setNewQuery
// 			},
// 			open : function(event, ui) {
// 				q("#"+self.id).animate({ scrollTop: 0 }, "fast");
// 			}
// 		});
// 	};
//
// })(Chemio, Chemio.structures, Chemio.uis.actions, Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot, Chemio.lib.jQuery, document);

// (function(c, desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.MolGrabberDialog = function(sketcherid, subid) {
// 		this.sketcherid = sketcherid;
// 		this.id = sketcherid + subid;
// 	};
// 	let _ = desktop.MolGrabberDialog.prototype = new desktop.Dialog();
// 	_.title = 'MolGrabber';
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;text-align:center;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		if (this.message) {
// 			sb.push('<p>');
// 			sb.push(this.message);
// 			sb.push('</p>');
// 		}
// 		// Next is the MolGrabberCanvas, whose constructor will be called AFTER
// 		// the elements are in the DOM.
// 		sb.push('<canvas class="ChemioWebComponent" id="');
// 		sb.push(this.id);
// 		sb.push('_mg"></canvas>');
// 		if (this.afterMessage) {
// 			sb.push('<p>');
// 			sb.push(this.afterMessage);
// 			sb.push('</p>');
// 		}
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcherid)) {
// 			let canvas = q('#' + this.sketcherid);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		this.canvas = new c.MolGrabberCanvas(this.id + '_mg', 200, 200);
// 		this.canvas.styles.backgroundColor = '#fff';
// 		this.canvas.repaint();
// 		let self = this;
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 250,
// 			buttons : self.buttons
// 		});
// 	};
//
// })(Chemio, Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(c, desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.PeriodicTableDialog = function(sketcher, subid) {
// 		this.sketcher = sketcher;
// 		this.id = sketcher.id + subid;
// 	};
// 	let _ = desktop.PeriodicTableDialog.prototype = new desktop.Dialog();
// 	_.title = 'Periodic Table';
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="text-align:center;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		sb.push('<canvas class="ChemioWebComponents" id="');
// 		sb.push(this.id);
// 		sb.push('_pt"></canvas></div>');
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		this.canvas = new Chemio.PeriodicTableCanvas(this.id + '_pt', 20);
// 		// set default to oxygen
// 		this.canvas.selected = this.canvas.cells[7];
// 		this.canvas.repaint();
// 		let self = this;
// 		this.canvas.click = function(evt) {
// 			if (this.hovered) {
// 				this.selected = this.hovered;
// 				let e = this.getHoveredElement();
// 				self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
// 				self.sketcher.stateManager.STATE_LABEL.label = e.symbol;
// 				self.sketcher.toolbarManager.buttonLabel.absorb(self.sketcher.toolbarManager.buttonLabelPT);
// 				self.sketcher.toolbarManager.buttonLabel.select();
// 				this.repaint();
// 			}
// 		};
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 400,
// 			buttons : self.buttons
// 		});
// 	};
//
// })(Chemio, Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.Popover = function(sketcher, id, free, onclose) {
// 		this.sketcher = sketcher;
// 		this.id = id;
// 		this.free = free;
// 		this.onclose = onclose;
// 	};
// 	let _ = desktop.Popover.prototype;
// 	_.getHiddenSource = function() {
// 		let sb = [];
// 		sb.push('<div style="display:none;position:absolute;z-index:10;border:1px #C1C1C1 solid;background:#F5F5F5;padding:5px;');
// 		if(this.free){
// 			// if free, round all edges
// 			sb.push('border-radius:5px;-moz-border-radius:5px;');
// 		}else{
// 			sb.push('border-bottom-left-radius:5px;-moz-border-radius-bottomleft:5px;border-bottom-right-radius:5px;-moz-border-radius-bottomright:5px;border-top-color:black;');
// 		}
// 		sb.push('" id="');
// 		sb.push(this.id);
// 		sb.push('">');
// 		sb.push(this.getContentSource());
// 		sb.push('</div>');
// 		return sb.join('');
// 	};
// 	_.setup = function() {
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(this.getHiddenSource());
// 		} else {
// 			document.writeln(this.getHiddenSource());
// 		}
// 		let tag = '#' + this.id;
// 		q(tag).hide();
// 		if(this.setupContent){
// 			this.setupContent();
// 		}
// 	};
// 	_.show = function(e){
// 		if(this.sketcher.modal){
// 			// apparently there is already another popover up, this shouldn't happen
// 			return false;
// 		}
// 		this.sketcher.modal = this;
// 		this.sketcher.doEventDefault = true;
// 		let component = q('#' + this.id);
// 		let self = this;
// 		if(this.free){
// 			component.fadeIn(200).position({
// 				my : 'center bottom',
// 				at : 'center top',
// 				of : e,
// 				collision : 'fit'
// 			});
// 		}else{
// 			component.slideDown(400).position({
// 				my : 'center top',
// 				at : 'center top',
// 				of : q('#' + this.sketcher.id),
// 				collision : 'fit'
// 			});
// 		}
// 		return false;
// 	};
// 	_.close = function(cancel){
// 		let component = q('#' + this.id);
// 		if(this.free){
// 			component.hide(0);
// 		}else{
// 			component.slideUp(400);
// 		}
// 		if(this.onclose){
// 			this.onclose(cancel);
// 		}
// 		this.sketcher.modal = undefined;
// 		this.sketcher.doEventDefault = false;
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(c, desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.SaveFileDialog = function(id, sketcher) {
// 		this.id = id;
// 		this.sketcher = sketcher;
// 	};
// 	let _ = desktop.SaveFileDialog.prototype = new desktop.Dialog();
// 	_.title = 'Save File';
// 	_.clear = function() {
// 		q('#' + this.id + '_link').html('The file link will appear here.');
// 	};
// 	_.setup = function() {
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		sb.push('<p>Select the file format to save your structure to and click on the <strong>Generate File</strong> button.</p>');
// 		sb.push('<select id="');
// 		sb.push(this.id);
// 		sb.push('_select">');
// 		sb.push('<option value="sk2">ACD/ChemSketch Document {sk2}');
// 		sb.push('<option value="ros">Beilstein ROSDAL {ros}');
// 		sb.push('<option value="cdx">Cambridgesoft ChemDraw Exchange {cdx}');
// 		sb.push('<option value="cdxml">Cambridgesoft ChemDraw XML {cdxml}');
// 		sb.push('<option value="mrv">ChemAxon Marvin Document {mrv}');
// 		sb.push('<option value="cml">Chemical Markup Language {cml}');
// 		sb.push('<option value="smiles">Daylight SMILES {smiles}');
// 		sb.push('<option value="icl" selected>iChemLabs Chemio Document {icl}');
// 		sb.push('<option value="inchi">IUPAC InChI {inchi}');
// 		sb.push('<option value="jdx">IUPAC JCAMP-DX {jdx}');
// 		sb.push('<option value="skc">MDL ISIS Sketch {skc}');
// 		sb.push('<option value="tgf">MDL ISIS Sketch Transportable Graphics File {tgf}');
// 		sb.push('<option value="mol">MDL MOLFile {mol}');
// 		// sb.push('<option value="rdf">MDL RDFile {rdf}');
// 		// sb.push('<option value="rxn">MDL RXNFile {rxn}');
// 		sb.push('<option value="sdf">MDL SDFile {sdf}');
// 		sb.push('<option value="jme">Molinspiration JME String {jme}');
// 		sb.push('<option value="pdb">RCSB Protein Data Bank {pdb}');
// 		sb.push('<option value="mmd">Schr&ouml;dinger Macromodel {mmd}');
// 		sb.push('<option value="mae">Schr&ouml;dinger Maestro {mae}');
// 		sb.push('<option value="smd">Standard Molecular Data {smd}');
// 		sb.push('<option value="mol2">Tripos Mol2 {mol2}');
// 		sb.push('<option value="sln">Tripos SYBYL SLN {sln}');
// 		sb.push('<option value="xyz">XYZ {xyz}');
// 		sb.push('</select>');
// 		sb.push('<button type="button" id="');
// 		sb.push(this.id);
// 		sb.push('_button">');
// 		sb.push('Generate File</button>');
// 		sb.push('<p>When the file is written, a link will appear in the red-bordered box below, right-click on the link and choose the browser\'s <strong>Save As...</strong> function to save the file to your computer.</p>');
// 		sb.push('<div style="width:100%;height:30px;border:1px solid #c10000;text-align:center;" id="');
// 		sb.push(this.id);
// 		sb.push('_link">The file link will appear here.</div>');
// 		sb.push('<p><a href="http://www.chemdoodle.com" target="_blank">How do I use these files?</a></p>');
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		let self = this;
// 		q('#' + this.id + '_button').click(function() {
// 			q('#' + self.id + '_link').html('Generating file, please wait...');
// 			Chemio.iChemLabs.saveFile(self.sketcher.lasso.getFirstMolecule(), {
// 				ext : q('#' + self.id + '_select').val()
// 			}, function(link) {
// 				q('#' + self.id + '_link').html('<a href="' + link + '"><span style="text-decoration:underline;">File is generated. Right-click on this link and Save As...</span></a>');
// 			});
// 		});
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 435,
// 			buttons : self.buttons
// 		});
// 	};
//
// })(Chemio, Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);

// (function(c, io, desktop, templateDepot, q, m, document, JSON, localStorage, undefined) {
// 	'use strict';
//
// 	let INTERPRETER = new io.JSONInterpreter();
// 	let allowedRegex = /[^A-z0-9]|\[|\]/g;
//
// 	desktop.TemplateDialog = function(sketcher, subid) {
// 		this.sketcher = sketcher;
// 		this.id = sketcher.id + subid;
// 	};
// 	let _ = desktop.TemplateDialog.prototype = new desktop.Dialog();
// 	_.title = 'Templates';
// 	_.setup = function() {
// 		let self = this;
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;align-items:center;display:flex;flex-direction:column;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		// Next is the MolGrabberCanvas, whose constructor will be called AFTER
// 		// the elements are in the DOM.
// 		sb.push('<canvas class="ChemioWebComponent" id="');
// 		sb.push(this.id);
// 		sb.push('_buffer" style="display:none;"></canvas>');
// 		sb.push('<canvas class="ChemioWebComponent" id="');
// 		sb.push(this.id);
// 		sb.push('_attachment"></canvas>');
// 		sb.push('<div><select id="');
// 		sb.push(this.id);
// 		sb.push('_select">');
// 		for(let i = 0, ii = templateDepot.length; i<ii; i++){
// 			let group = templateDepot[i];
// 			sb.push('<option value="');
// 			sb.push(group.name);
// 			sb.push('">');
// 			sb.push(group.name);
// 			sb.push('</option>');
// 		}
// 		sb.push('</select>');
// 		sb.push('&nbsp;&nbsp;<button type="button" id="');
// 		sb.push(this.id);
// 		sb.push('_button_add">Add Template</button></div>');
// 		// have to include height for Safari...
// 		sb.push('<div id="');
// 		sb.push(this.id);
// 		sb.push('_scroll" style="width:100%;height:150px;flex-grow:1;overflow-y:scroll;overflow-x:hidden;background:#eee;padding-right:5px;padding-bottom:5px;">');
// 		for(let i = 0, ii = templateDepot.length; i<ii; i++){
// 			let group = templateDepot[i];
// 			group.condensedName = group.name.replace(allowedRegex, '');
// 			sb.push('<div style="display:flex;flex-wrap:wrap;justify-content:center;" id="');
// 			sb.push(this.id);
// 			sb.push('_');
// 			sb.push(group.condensedName);
// 			sb.push('_panel">');
// 			sb.push('</div>');
// 		}
// 		sb.push('</div>');
// 		sb.push('</div>');
// 		if (document.getElementById(this.sketcher.id)) {
// 			let canvas = q('#' + this.sketcher.id);
// 			canvas.before(sb.join(''));
// 		} else {
// 			document.writeln(sb.join(''));
// 		}
// 		this.buffer = new c.ViewerCanvas(this.id + '_buffer', 100, 100);
// 		this.bufferElement = document.getElementById(this.buffer.id);
// 		this.canvas = new c.ViewerCanvas(this.id + '_attachment', 200, 200);
// 		this.canvas.mouseout = function(e){
// 			if(this.molecules.length!==0){
// 				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
// 					this.molecules[0].atoms[i].isHover = false;
// 				}
// 				this.repaint();
// 			}
// 		};
// 		this.canvas.touchend = this.canvas.mouseout;
// 		this.canvas.mousemove = function(e){
// 			if(this.molecules.length!==0){
// 				let closest=undefined;
// 				e.p.x = this.width / 2 + (e.p.x - this.width / 2) / this.styles.scale;
// 				e.p.y = this.height / 2 + (e.p.y - this.height / 2) / this.styles.scale;
// 				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
// 					let a = this.molecules[0].atoms[i];
// 					a.isHover = false;
// 					if(closest===undefined || e.p.distance(a)<e.p.distance(closest)){
// 						closest = a;
// 					}
// 				}
// 				if(e.p.distance(closest)<10){
// 					closest.isHover = true;
// 				}
// 				this.repaint();
// 			}
// 		};
// 		this.canvas.mousedown = function(e){
// 			if(this.molecules.length!==0){
// 				let cont = false;
// 				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
// 					let a = this.molecules[0].atoms[i];
// 					if(a.isHover){
// 						cont = true;
// 						break;
// 					}
// 				}
// 				// if no atom is hovered, then don't continue
// 				if(cont){
// 					for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
// 						let a = this.molecules[0].atoms[i];
// 						a.isSelected_old = false;
// 						if(a.isHover){
// 							a.isSelected_old = true;
// 							a.isHover = false;
// 							self.sketcher.stateManager.STATE_NEW_TEMPLATE.attachPos = i;
// 							self.sketcher.toolbarManager.buttonTemplate.select();
// 							self.sketcher.toolbarManager.buttonTemplate.getElement().click();
// 						}
// 					}
// 				}
// 				this.repaint();
// 			}
// 		};
// 		this.canvas.touchstart = function(e){self.canvas.mousemove(e);self.canvas.mousedown(e);}
// 		this.canvas.drawChildExtras = function(ctx, styles){
// 			ctx.strokeStyle = self.sketcher.styles.colorSelect;
// 			ctx.fillStyle = self.sketcher.styles.colorSelect;
// 			ctx.beginPath();
// 			ctx.arc(8, 8, 7, 0, m.PI * 2, false);
// 			ctx.stroke();
// 			ctx.textAlign = 'left';
// 			ctx.textBaseline = 'middle';
// 			ctx.fillText('Substitution Point', 18, 8);
// 			ctx.save();
// 			ctx.translate(this.width / 2, this.height / 2);
// 			ctx.rotate(styles.rotateAngle);
// 			ctx.scale(styles.scale, styles.scale);
// 			ctx.translate(-this.width / 2, -this.height / 2);
// 			if(this.molecules.length!==0){
// 				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
// 					this.molecules[0].atoms[i].drawDecorations(ctx, self.sketcher.styles);
// 				}
// 			}
// 			ctx.restore();
// 		};
//
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			width : 260,
// 			height : 450,
// 			buttons : self.buttons,
// 			open : function(){
// 				if(!self.populated){
// 					self.populated = true;
// 					self.populate();
// 				}
// 			}
// 		});
//
// 		let select = q('#'+this.id+'_select');
// 		select.change(function(){
// 			let index = this.selectedIndex;
// 			for(let i = 0, ii = templateDepot.length; i<ii; i++){
// 				let group = templateDepot[i];
// 				q('#'+self.id+'_'+group.condensedName+'_panel').hide();
// 			}
// 			q('#'+self.id+'_'+templateDepot[index].condensedName+'_panel').show();
// 			q('#'+self.id+'_scroll').scrollTop(0);
// 			self.loadTemplate(index, 0, true);
// 		});
//
// 		q('#'+this.id+'_button_add').click(function(){
// 			if(self.sketcher.lasso.atoms.length===0){
// 				alert('Please select a structure to define a template.');
// 			}else{
// 				let cont = true;
// 				if(self.sketcher.lasso.atoms.length>1){
// 					let mol = self.sketcher.lasso.getFirstMolecule();
// 					for(let i = 1, ii = self.sketcher.lasso.atoms.length; i<ii; i++){
// 						if(mol!==self.sketcher.getMoleculeByAtom(self.sketcher.lasso.atoms[i])){
// 							cont = false;
// 							alert('Templates may only be defined of a single discrete structure.');
// 							break;
// 						}
// 					}
// 				}
// 				if(cont){
// 					let name = prompt("Please enter the template name:", "My template");
// 					if(name!==null){
// 						let userTemplates = templateDepot[templateDepot.length-1];
// 						let jsonm = INTERPRETER.molTo(self.sketcher.lasso.getFirstMolecule());
// 						let mol = INTERPRETER.molFrom(jsonm);
// 						let panel = q('#'+self.id+'_'+userTemplates.condensedName+'_panel');
// 						if(userTemplates.templates.length===0){
// 							panel.empty();
// 						}
// 						let t = {name:name, data:jsonm};
// 						mol.scaleToAverageBondLength(self.sketcher.styles.bondLength_2D);
// 						self.buffer.loadMolecule(mol);
// 						t.img = self.bufferElement.toDataURL('image/png');
// 						t.condensedName = t.name.replace(allowedRegex, '');
// 						panel.append('<div style="margin-left:5px;margin-top:5px;"><center><img src="'+t.img+'" id="'+self.id+'_'+t.condensedName+'" g="'+(templateDepot.length-1)+'" t="'+userTemplates.templates.length+'"style="width:100px;height:100px;" /><br>'+t.name+'</center></div>');
// 						let img = q('#'+self.id+'_'+t.condensedName);
// 						img.click(function(){
// 							self.loadTemplate(parseInt(this.getAttribute('g')), parseInt(this.getAttribute('t')), true);
// 						});
// 						img.hover(function(){q(this).css({'border':'1px solid '+self.sketcher.styles.colorHover, 'margin':'-1px'});}, function(){q(this).css({'border':'none', 'margin':'0px'});});
// 						userTemplates.templates.push(t);
// 						// IE/Edge doesn't allow localStorage from local files
// 						if(localStorage){
// 							localStorage.setItem('chemdoodle_user_templates', JSON.stringify(templateDepot[templateDepot.length-1].templates));
// 						}
// 					}
// 				}
// 			}
// 		});
// 	};
// 	_.loadTemplate = function(g, t, changeState){
// 		let template = templateDepot[g].templates[t];
// 		if(template){
// 			let loading = INTERPRETER.molFrom(template.data);
// 			loading.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
// 			let first = -1;
// 			let min = Infinity;
// 			for (let i = 0, ii = loading.atoms.length; i<ii; i++) {
// 				let a = loading.atoms[i];
// 				if (a.label==='C' && a.x < min) {
// 					first = i;
// 					min = a.x;
// 				}
// 			}
// 			if (first === -1) {
// 				first = 0;
// 			}
// 			loading.atoms[first].isSelected_old = true;
// 			this.canvas.loadMolecule(loading);
// 			this.sketcher.stateManager.STATE_NEW_TEMPLATE.template = template.data;
// 			this.sketcher.stateManager.STATE_NEW_TEMPLATE.attachPos = first;
// 			if(changeState){
// 				this.sketcher.toolbarManager.buttonTemplate.select();
// 				this.sketcher.toolbarManager.buttonTemplate.getElement().click();
// 			}
// 		}
// 	};
// 	_.populate = function() {
// 		// copy over styles from the sketcher
// 		this.canvas.styles = q.extend({}, this.sketcher.styles);
// 		this.canvas.styles.atoms_implicitHydrogens_2D = false;
// 		this.buffer.styles = q.extend({}, this.sketcher.styles);
// 		this.buffer.styles.atoms_implicitHydrogens_2D = false;
// 		// make template panels
// 		let self = this;
// 		for(let i = 0, ii = templateDepot.length; i<ii; i++){
// 			let group = templateDepot[i];
// 			let panel = q('#'+this.id+'_'+group.condensedName+'_panel');
// 			if(group.templates.length===0){
// 				panel.append('<div style="margin:5px;">There are no templates in this group.</div>');
// 			}else{
// 				for(let j = 0, jj = group.templates.length; j<jj; j++){
// 					let t = group.templates[j];
// 					let mol = INTERPRETER.molFrom(t.data);
// 					mol.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
// 					this.buffer.loadMolecule(mol);
// 					t.img = this.bufferElement.toDataURL('image/png');
// 					t.condensedName = t.name.replace(allowedRegex, '');
// 					panel.append('<div style="margin-left:5px;margin-top:5px;"><center><img src="'+t.img+'" id="'+this.id+'_'+t.condensedName+'" g="'+i+'" t="'+j+'" style="width:100px;height:100px;border-radius:10px;" /><br>'+t.name+'</center></div>');
// 					let img = q('#'+this.id+'_'+t.condensedName);
// 					img.click(function(){
// 						self.loadTemplate(parseInt(this.getAttribute('g')), parseInt(this.getAttribute('t')), true);
// 					});
// 					img.hover(function(){q(this).css({'border':'1px solid '+self.sketcher.styles.colorHover, 'margin':'-1px'});}, function(){q(this).css({'border':'none', 'margin':'0px'});});
// 				}
// 			}
// 			if(i!==0){
// 				panel.hide();
// 			}
// 		}
// 		if(templateDepot.length!==0){
// 			q('#'+this.id+'_'+templateDepot[0].condensedName+'_panel').show();
// 			this.loadTemplate(0, 0, false);
// 		}
// 	};
//
// })(Chemio, Chemio.io, Chemio.uis.gui.desktop, Chemio.uis.gui.templateDepot, Chemio.lib.jQuery, Math, document, JSON, localStorage);

// (function(c, actions, gui, desktop, q, undefined) {
// 	'use strict';
// 	gui.DialogManager = function(sketcher) {
// 		let self = this;
//
// 		if (sketcher.useServices) {
// 			this.saveDialog = new desktop.SaveFileDialog(sketcher.id + '_save_dialog', sketcher);
// 		} else {
// 			this.saveDialog = new desktop.Dialog(sketcher.id, '_save_dialog', 'Save Molecule');
// 			this.saveDialog.message = 'Copy and paste the content of the textarea into a file and save it with the extension <strong>.mol</strong>.';
// 			this.saveDialog.includeTextArea = true;
// 			// You must keep this link displayed at all times to abide by the
// 			// license
// 			// Contact us for permission to remove it,
// 			// http://www.ichemlabs.com/contact-us
// 			this.saveDialog.afterMessage = '<a href="http://www.chemdoodle.com" target="_blank">How do I use MOLFiles?</a>';
// 		}
// 		this.saveDialog.setup();
//
// 		this.openPopup = new desktop.Popover(sketcher, sketcher.id+'_open_popover');
// 		this.openPopup.getContentSource = function(){
// 			let sb = ['<div style="width:320px;">'];
// 			//sb.push('<div width="100%">Open chemical file from your computer:</div><br><form action="demo_form.asp">'];
//   			//sb.push('<input type="file" name="file" accept="image/*">');
//   			//sb.push('<input onclick="alert(\'include your form code here.\');" type="button" value="Open" /*type="submit"*/>');
// 			//sb.push('</form>');
// 			//sb.push('<hr>
// 			// You must keep this link displayed at all times to abide by the
// 			// license
// 			// Contact us for permission to remove it,
// 			// http://www.ichemlabs.com/contact-us
// 			sb.push('<div width="100%">Or paste <em>MOLFile</em> or <em>Chemio JSON</em> text and press the <strong>Load</strong> button.<br><br><center><a href="http://www.chemdoodle.com" target="_blank">Where do I get MOLFiles or Chemio JSON?</a></center><br></div>');
// 			sb.push('<textarea rows="12" id="'+sketcher.id+'_open_text" style="width:100%;"></textarea>');
// 			sb.push('<br><button type="button" style="margin-left:270px;" id="'+sketcher.id+'_open_load">Load</button></div>');
// 			return sb.join('');
// 		};
// 		this.openPopup.setupContent = function(){
// 			q('#'+sketcher.id+'_open_load').click(function(){
// 				self.openPopup.close();
// 				let s = q('#'+sketcher.id+'_open_text').val();
// 				let newContent;
// 				if (s.indexOf('v2000') !== -1 || s.indexOf('V2000') !== -1) {
// 					newContent = {
// 						molecules : [ c.readMOL(s) ],
// 						shapes : []
// 					};
// 				} else if (s.charAt(0) === '{') {
// 					newContent = c.readJSON(s);
// 				}
// 				if (newContent && (newContent.molecules.length > 0 || newContent.shapes.length > 0)) {
// 					sketcher.historyManager.pushUndo(new actions.SwitchContentAction(sketcher, newContent.molecules, newContent.shapes));
// 				} else {
// 					alert('No chemical content was recognized.');
// 				}
// 			});
// 		};
// 		this.openPopup.setup();
//
// 		this.atomQueryDialog = new desktop.AtomQueryDialog(sketcher, '_atom_query_dialog');
// 		this.atomQueryDialog.setup();
//
// 		this.bondQueryDialog = new desktop.BondQueryDialog(sketcher, '_bond_query_dialog');
// 		this.bondQueryDialog.setup();
//
// 		this.templateDialog = new desktop.TemplateDialog(sketcher, '_templates_dialog');
// 		this.templateDialog.setup();
//
// 		this.searchDialog = new desktop.MolGrabberDialog(sketcher.id, '_search_dialog');
// 		this.searchDialog.buttons = {
// 			'Load' : function() {
// 				let newMol = self.searchDialog.canvas.molecules[0];
// 				if (newMol && newMol.atoms.length > 0) {
// 					q(this).dialog('close');
// 					sketcher.historyManager.pushUndo(new actions.AddContentAction(sketcher, self.searchDialog.canvas.molecules, self.searchDialog.canvas.shapes));
// 					sketcher.toolbarManager.buttonLasso.getElement().click();
// 					let atoms = [];
// 					for(let i = 0, ii = self.searchDialog.canvas.molecules.length; i<ii; i++){
// 						atoms = atoms.concat(self.searchDialog.canvas.molecules[i].atoms);
// 					}
// 					sketcher.lasso.select(atoms, self.searchDialog.canvas.shapes);
// 				}else{
// 					alert('After entering a search term, press the "Show Molecule" button to show it before loading. To close this dialog, press the "X" button to the top-right.');
// 				}
// 			}
// 		};
// 		this.searchDialog.setup();
//
// 		if (sketcher.setupScene) {
// 			this.stylesDialog = new desktop.SpecsDialog(sketcher, '_styles_dialog');
// 			this.stylesDialog.buttons = {
// 				'Done' : function() {
// 					q(this).dialog('close');
// 				}
// 			};
// 			this.stylesDialog.setup(this.stylesDialog, sketcher);
// 		}
//
// 		this.periodicTableDialog = new desktop.PeriodicTableDialog(sketcher, '_periodicTable_dialog');
// 		this.periodicTableDialog.buttons = {
// 			'Close' : function() {
// 				q(this).dialog('close');
// 			}
// 		};
// 		this.periodicTableDialog.setup();
//
// 		this.calculateDialog = new desktop.Dialog(sketcher.id, '_calculate_dialog', 'Calculations');
// 		this.calculateDialog.includeTextArea = true;
// 		// You must keep this link displayed at all times to abide by the license
// 		// Contact us for permission to remove it,
// 		// http://www.ichemlabs.com/contact-us
// 		this.calculateDialog.afterMessage = '<a href="http://www.chemdoodle.com" target="_blank">Want more calculations?</a>';
// 		this.calculateDialog.setup();
//
// 		this.inputDialog = new desktop.Dialog(sketcher.id, '_input_dialog', 'Input');
// 		this.inputDialog.message = 'Please input the rgroup number (must be a positive integer). Input "-1" to remove the rgroup.';
// 		this.inputDialog.includeTextField = true;
// 		this.inputDialog.buttons = {
// 			'Done' : function() {
// 				q(this).dialog('close');
// 				if (self.inputDialog.doneFunction) {
// 					self.inputDialog.doneFunction(self.inputDialog.getTextField().val());
// 				}
// 			}
// 		};
// 		this.inputDialog.setup();
//
// 		if(this.makeOtherDialogs){
// 			this.makeOtherDialogs(sketcher);
// 		}
// 	};
//
// })(Chemio, Chemio.uis.actions, Chemio.uis.gui, Chemio.uis.gui.desktop, Chemio.lib.jQuery);

// (function(desktop, imageDepot, q, document, undefined) {
// 	'use strict';
// 	desktop.DropDown = function(id, tooltip, dummy) {
// 		this.id = id;
// 		this.tooltip = tooltip;
// 		this.dummy = dummy;
// 		this.buttonSet = new desktop.ButtonSet(id + '_set');
// 		this.buttonSet.buttonGroup = tooltip;
// 		this.defaultButton = undefined;
// 	};
// 	let _ = desktop.DropDown.prototype;
// 	_.getButtonSource = function() {
// 		let sb = [];
// 		sb.push('<button type="button" id="');
// 		sb.push(this.id);
// 		sb.push('" onclick="return false;" title="');
// 		sb.push(this.tooltip);
// 		sb.push('" style="box-sizing:border-box;margin-top:0px; margin-bottom:1px; padding:0px; height:28px; width:15px;"><img title="');
// 		sb.push(this.tooltip);
// 		sb.push('" width="9" height="20" src="');
// 		sb.push(imageDepot.getURI(imageDepot.ARROW_DOWN));
// 		sb.push('"></button>');
// 		return sb.join('');
// 	};
// 	_.getHiddenSource = function() {
// 		let sb = [];
// 		sb.push('<div style="display:none;position:absolute;z-index:10;border:1px #C1C1C1 solid;background:#F5F5F5;padding:5px;border-bottom-left-radius:5px;-moz-border-radius-bottomleft:5px;border-bottom-right-radius:5px;-moz-border-radius-bottomright:5px;" id="');
// 		sb.push(this.id);
// 		sb.push('_hidden">');
// 		sb.push(this.buttonSet.getSource(this.id + '_popup_set'));
// 		sb.push('</div>');
// 		return sb.join('');
// 	};
// 	_.setup = function() {
// 		if (!this.defaultButton) {
// 			this.defaultButton = this.buttonSet.buttons[0];
// 		}
// 		let tag = '#' + this.id;
// 		let qt = q(tag);
// 		qt.button();
// 		qt.click(function() {
// 			// mobile safari doesn't allow clicks to be triggered
// 			q(document).trigger('click');
// 			let qth = q(tag + '_hidden');
// 			qth.show().position({
// 				my : 'center top',
// 				at : 'center bottom',
// 				of : this,
// 				collision : 'fit'
// 			});
// 			q(document).one('click', function() {
// 				qth.hide();
// 			});
// 			return false;
// 		});
// 		this.buttonSet.setup();
// 		let self = this;
// 		q.each(this.buttonSet.buttons, function(index, value) {
// 			self.buttonSet.buttons[index].getElement().click(function() {
// 				self.dummy.absorb(self.buttonSet.buttons[index]);
// 				// both are needed, the first highlights, the second executes, select should be called first to get the tray to disappear
// 				self.dummy.select();
// 				self.dummy.getElement().click();
// 			});
// 		});
// 		self.dummy.absorb(this.defaultButton);
// 		this.defaultButton.select();
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot, Chemio.lib.jQuery, document);

// (function(desktop, imageDepot, q, undefined) {
// 	'use strict';
// 	desktop.DummyButton = function(id, tooltip) {
// 		this.id = id;
// 		this.toggle = false;
// 		this.tooltip = tooltip ? tooltip : '';
// 		this.func = undefined;
// 	};
// 	let _ = desktop.DummyButton.prototype = new desktop.Button();
// 	_.setup = function() {
// 		let self = this;
// 		this.getElement().click(function() {
// 			self.func();
// 		});
// 	};
// 	_.absorb = function(button) {
// 		q('#' + this.id + '_icon').attr('src', imageDepot.getURI(button.icon));
// 		this.func = button.func;
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot, Chemio.lib.jQuery);

// (function(desktop, q, undefined) {
// 	'use strict';
// 	desktop.TextButton = function(id, tooltip, func) {
// 		this.id = id;
// 		this.toggle = false;
// 		this.tooltip = tooltip ? tooltip : '';
// 		this.func = func ? func : undefined;
// 	};
// 	let _ = desktop.TextButton.prototype = new desktop.Button();
// 	_.getSource = function(buttonGroup) {
// 		let sb = [];
// 		if (this.toggle) {
// 			sb.push('<input type="radio" name="');
// 			sb.push(buttonGroup);
// 			sb.push('" id="');
// 			sb.push(this.id);
// 			sb.push('" title="');
// 			sb.push(this.tooltip);
// 			sb.push('" /><label for="');
// 			sb.push(this.id);
// 			sb.push('">');
// 			sb.push(this.tooltip);
// 			sb.push('</label>');
// 		} else {
// 			sb.push('<button type="button" id="');
// 			sb.push(this.id);
// 			sb.push('" onclick="return false;" title="');
// 			sb.push(this.tooltip);
// 			sb.push('"><label for="');
// 			sb.push(this.id);
// 			sb.push('">');
// 			sb.push(this.tooltip);
// 			sb.push('</label></button>');
// 		}
// 		return sb.join('');
// 	};
//
// 	_.check = function() {
// 		let element = this.getElement();
// 		element.prop('checked', true);
// 		element.button('refresh');
// 	};
//
// 	_.uncheck = function() {
// 		let element = this.getElement();
// 		element.removeAttr('checked');
// 		element.button('refresh');
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.lib.jQuery);

// (function(desktop, imageDepot, q, document, undefined) {
// 	'use strict';
// 	desktop.Tray = function(sketcher, id, dummy, columnCount) {
// 		this.sketcher = sketcher;
// 		this.id = id;
// 		this.tooltip = dummy.tooltip;
// 		this.dummy = dummy;
// 		this.dummy.toggle = true;
// 		this.buttonSet = new desktop.ButtonSet(id + '_set');
// 		this.buttonSet.columnCount = columnCount;
// 		this.buttonSet.buttonGroup = this.tooltip;
// 		this.defaultButton = undefined;
// 	};
// 	let _ = desktop.Tray.prototype;
// 	_.getSource = function(buttonGroup) {
// 		let sb = [];
// 		sb.push(this.dummy.getSource(buttonGroup));
// 		sb.push('<div style="display:none;position:absolute;z-index:11;border:none;background:#F5F5F5;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);" id="');
// 		sb.push(this.id);
// 		sb.push('_hidden">');
// 		sb.push(this.buttonSet.getSource(this.id + '_popup_set'));
// 		sb.push('</div>');
// 		return sb.join('');
// 	};
// 	_.setup = function() {
// 		this.dummy.setup(true);
// 		let button = this.dummy.getElement();
// 		// dummy doesn't call button() because when used in drop downs, the buttonset function is called
// 		// so we have to call it here
// 		button.button();
// 		if (!this.defaultButton) {
// 			this.defaultButton = this.buttonSet.buttons[0];
// 		}
// 		let self = this;
// 		let tag = '#' + this.id;
// 		button.click(function() {
// 			// have to duplicate here as scope makes "this" the button
// 			if(self.sketcher.openTray!==self){
// 				if(self.sketcher.openTray){
// 					self.sketcher.openTray.close();
// 				}
// 				self.sketcher.openTray = self;
// 				// mobile safari doesn't allow clicks to be triggered
// 				q(document).trigger('click');
// 				q(tag + '_hidden').show();
// 			}
// 			self.reposition();
// 		});
// 		this.buttonSet.setup();
// 		q.each(this.buttonSet.buttons, function(index, value) {
// 			self.buttonSet.buttons[index].getElement().click(function() {
// 				self.dummy.absorb(self.buttonSet.buttons[index]);
// 			});
// 		});
// 		this.dummy.absorb(this.defaultButton);
// 		this.defaultButton.select();
// 	};
// 	_.open = function(select) {
// 		if(this.sketcher.openTray!==this){
// 			if(this.sketcher.openTray){
// 				this.sketcher.openTray.close();
// 			}
// 			this.sketcher.openTray = this;
// 			// mobile safari doesn't allow clicks to be triggered
// 			q(document).trigger('click');
// 			q('#'+this.id + '_hidden').show();
// 		}
// 		if(select){
// 			this.dummy.absorb(select);
// 			select.select();
// 		}
// 		this.reposition();
// 	};
// 	_.reposition = function(){
// 		let button = q('#'+this.dummy.id+'_icon');
// 		q('#' + this.id + '_hidden').position({
// 			my : 'right-8 center',
// 			at : 'left center',
// 			of : button,
// 			collision: 'flip none'
// 		});
// 	};
// 	_.close = function(){
// 		q('#' + this.id + '_hidden').hide();
// 		this.sketcher.openTray = undefined;
// 	};
//
// })(Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot, Chemio.lib.jQuery, document);
//endregion
