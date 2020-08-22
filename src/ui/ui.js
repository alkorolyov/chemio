//******************************************************************

//********************************* UI *****************************

//******************************************************************

Chemio.uis = (function(undefined) {
	'use strict';

	let p = {};

	p.actions = {};
	p.gui = {};
	p.gui.desktop = {};
	p.gui.mobile = {};
	p.states = {};
	p.tools = {};

	return p;

})();

// (function(c, desktop, q, document, undefined) {
// 	'use strict';
// 	desktop.SpecsDialog = function(editor, subid) {
// 		this.editor = editor;
// 		this.id = this.editor.id + subid;
// 	};
// 	let _ = desktop.SpecsDialog.prototype = new desktop.Dialog();
// 	_.title = 'Visual Specifications';
//
// 	_.makeProjectionSet = function(self) {
// 		this.projectionSet = new desktop.ButtonSet(self.id + '_projection_group');
// 		this.buttonPerspective = new desktop.TextButton(self.id + '_button_Perspective', 'Perspective',function() {
// 			self.editor.styles.projectionPerspective_3D = true;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.projectionSet.buttons.push(this.buttonPerspective);
// 		this.buttonOrthographic = new desktop.TextButton(self.id + '_button_Orthographic', 'Orthographic',function() {
// 			self.editor.styles.projectionPerspective_3D = false;
// 			self.editor.updateScene(self);
// 			self.update(editor.styles);
// 		});
// 		this.projectionSet.buttons.push(this.buttonOrthographic);
// 	};
//
// 	_.makeAtomColorSet = function(self) {
// 		this.atomColorSet = new desktop.ButtonSet(self.id + '_atom_color_group');
// 		this.atomColorSet.toggle = true;
// 		this.buttonJmolColors = new desktop.TextButton(self.id + '_button_Jmol_Colors', 'Jmol', function() {
// 			self.editor.styles.atoms_useJMOLColors = true;
// 			self.editor.styles.atoms_usePYMOLColors = false;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.atomColorSet.buttons.push(this.buttonJmolColors);
// 		this.buttonPymolColors = new desktop.TextButton(self.id + '_button_PyMOL_Colors', 'PyMOL', function() {
// 			self.editor.styles.atoms_usePYMOLColors = true;
// 			self.editor.styles.atoms_useJMOLColors = false;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.atomColorSet.buttons.push(this.buttonPymolColors);
// 	};
//
// 	_.makeBondColorSet = function(self) {
// 		this.bondColorSet = new desktop.ButtonSet(self.id + '_bond_color_group');
// 		this.bondColorSet.toggle = true;
// 		this.buttonJmolBondColors = new desktop.TextButton(self.id + '_button_Jmol_Bond_Colors', 'Jmol', function() {
// 			self.editor.styles.bonds_useJMOLColors = true;
// 			self.editor.styles.bonds_usePYMOLColors = false;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.bondColorSet.buttons.push(this.buttonJmolBondColors);
// 		this.buttonPymolBondColors = new desktop.TextButton(self.id + '_button_PyMOL_Bond_Colors', 'PyMOL', function() {
// 			self.editor.styles.bonds_usePYMOLColors = true;
// 			self.editor.styles.bonds_useJMOLColors = false;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.bondColorSet.buttons.push(this.buttonPymolBondColors);
// 	};
//
// 	_.makeCompassPositionSet = function(self) {
// 		this.compassPositionSet = new desktop.ButtonSet(self.id + '_compass_position_group');
// 		this.buttonCompassCorner = new desktop.TextButton(self.id + '_button_compass_corner', 'Corner',function() {
// 			self.editor.styles.compass_type_3D = 0;
// 			self.editor.styles.compass_size_3D = 50;
// 			self.editor.setupScene();
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.compassPositionSet.buttons.push(this.buttonCompassCorner);
// 		this.buttonCompassOrigin = new desktop.TextButton(self.id + '_button_compass_origin', 'Origin',function() {
// 			self.editor.styles.compass_type_3D = 1;
// 			self.editor.styles.compass_size_3D = 150;
// 			self.editor.setupScene();
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.compassPositionSet.buttons.push(this.buttonCompassOrigin);
// 	};
//
// 	_.makeFogModeSet = function(self) {
// 		this.fogModeSet = new desktop.ButtonSet(self.id + '_fog_mode_group');
// 		this.buttonFogMode0 = new desktop.TextButton(self.id + '_button_fog_mode_0', 'No Fogging', function() {
// 			self.editor.styles.fog_mode_3D = 0;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.fogModeSet.buttons.push(this.buttonFogMode0);
// 		this.buttonFogMode1 = new desktop.TextButton(self.id + '_button_fog_mode_1', 'Linear', function() {
// 			self.editor.styles.fog_mode_3D = 1;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.fogModeSet.buttons.push(this.buttonFogMode1);
// 		this.buttonFogMode2 = new desktop.TextButton(self.id + '_button_fog_mode_2', 'Exponential', function() {
// 			self.editor.styles.fog_mode_3D = 2;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.fogModeSet.buttons.push(this.buttonFogMode2);
// 		this.buttonFogMode3 = new desktop.TextButton(self.id + '_button_fog_mode_3', 'Exponential&sup2;', function() {
// 			self.editor.styles.fog_mode_3D = 3;
// 			self.editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		this.fogModeSet.buttons.push(this.buttonFogMode3);
// 	};
//
// 	_.setup = function(self, editor) {
// 		// canvas
// 		this.makeProjectionSet(this);
// 		this.bgcolor = new desktop.ColorPicker(this.id + '_bgcolor', 'Background Color: ', function(hex) {editor.styles.backgroundColor = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
// 		this.makeFogModeSet(this);
// 		this.fogcolor = new desktop.ColorPicker(this.id + '_fogcolor', 'Fog Color: ', function(hex) {editor.styles.fog_color_3D = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
//
// 		// atoms
// 		this.atomsDisplayToggle = new desktop.CheckBox(this.id + '_atoms_display_toggle', 'Display atoms', function() { editor.styles.atoms_display=!editor.styles.atoms_display;editor.updateScene();self.update(editor.styles);}, true);
// 		this.atomcolor = new desktop.ColorPicker(this.id + '_atomcolor', 'Atom Color: ', function(hex) {editor.styles.atoms_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
// 		this.makeAtomColorSet(this);
// 		this.atomColorSetToggle = new desktop.CheckBox(this.id + '_atom_color_group_toggle', 'Color Schemes', function() {
// 				if (self.buttonJmolColors.getElement().prop('disabled')) {
// 					self.atomColorSet.enable();
// 					editor.styles.atoms_useJMOLColors = true;
// 				} else {
// 					self.atomColorSet.disable();
// 					editor.styles.atoms_useJMOLColors = false;
// 					editor.styles.atoms_usePYMOLColors = false;
// 					self.buttonJmolColors.uncheck();
// 					self.buttonPymolColors.uncheck();
// 				}
// 				editor.updateScene();
// 				self.update(editor.styles);
// 			}, false);
// 		this.vdwToggle = new desktop.CheckBox(this.id + '_vdw_toggle', 'Use VDW Diameters', function() { editor.styles.atoms_useVDWDiameters_3D=!editor.styles.atoms_useVDWDiameters_3D;editor.updateScene();self.update(editor.styles); }, false);
// 		this.atomsNonBondedAsStarsToggle = new desktop.CheckBox(this.id + '_non_bonded_as_stars_toggle', 'Non-bonded as stars', function() { editor.styles.atoms_nonBondedAsStars_3D=!editor.styles.atoms_nonBondedAsStars_3D;editor.updateScene();self.update(editor.styles); }, false);
// 		this.displayLabelsToggle = new desktop.CheckBox(this.id + '_display_labels_toggle', 'Atom labels', function() { editor.styles.atoms_displayLabels_3D=!editor.styles.atoms_displayLabels_3D;editor.updateScene();self.update(editor.styles); }, false);
//
// 		//bonds
// 		this.bondsDisplayToggle = new desktop.CheckBox(this.id + '_bonds_display_toggle', 'Display bonds', function() { editor.styles.bonds_display=!editor.styles.bonds_display;editor.updateScene();self.update(editor.styles);}, true);
// 		this.bondcolor = new desktop.ColorPicker(this.id + '_bondcolor', 'Bond Color: ', function(hex) {editor.styles.bonds_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
// 		this.makeBondColorSet(this);
// 		this.bondColorSetToggle =  new desktop.CheckBox(this.id + '_bond_color_group_toggle', 'Color Schemes', function() {
// 			if (self.buttonJmolBondColors.getElement().prop('disabled')) {
// 				self.bondColorSet.enable();
// 				editor.styles.bonds_useJMOLColors = true;
// 			} else {
// 				self.bondColorSet.disable();
// 				editor.styles.bonds_useJMOLColors = false;
// 				editor.styles.bonds_usePYMOLColors = false;
// 				self.buttonJmolBondColors.uncheck();
// 				self.buttonPymolBondColors.uncheck();
//
// 			}
// 			editor.updateScene();
// 			self.update(editor.styles);
// 		}, false);
// 		this.bondOrderToggle = new desktop.CheckBox(this.id + '_bond_order_toggle', 'Show order', function() { editor.styles.bonds_showBondOrders_3D=!editor.styles.bonds_showBondOrders_3D;editor.updateScene();self.update(editor.styles); }, false);
// 		this.bondsRenderAsLinesToggle = new desktop.CheckBox(this.id + '_bonds_render_as_lines_toggle', 'Render as lines', function() { editor.styles.bonds_renderAsLines_3D=!editor.styles.bonds_renderAsLines_3D;editor.updateScene();self.update(editor.styles);}, false);
//
// 		// proteins
// 		this.ribbonsToggle = new desktop.CheckBox(this.id + '_ribbons_toggle', 'Ribbons', function() { editor.styles.proteins_displayRibbon=!editor.styles.proteins_displayRibbon;editor.updateScene();self.update(editor.styles); }, false);
// 		this.backboneToggle = new desktop.CheckBox(this.id + '_backbone_toggle', 'Backbone', function() { editor.styles.proteins_displayBackbone=!editor.styles.proteins_displayBackbone;editor.updateScene();self.update(editor.styles); }, false);
// 		this.pipeplankToggle = new desktop.CheckBox(this.id + '_pipeplank_toggle', 'Pipe and Plank', function() { editor.styles.proteins_displayPipePlank=!editor.styles.proteins_displayPipePlank;editor.updateScene();self.update(editor.styles); }, false);
// 		this.cartoonizeToggle = new desktop.CheckBox(this.id + '_cartoonize_toggle', 'Cartoonize', function() { editor.styles.proteins_ribbonCartoonize=!editor.styles.proteins_ribbonCartoonize;editor.updateScene();self.update(editor.styles); }, false);
// 		this.colorByChainToggle = new desktop.CheckBox(this.id + '_color_by_chain_toggle', 'Color by Chain', function() { editor.styles.macro_colorByChain=!editor.styles.macro_colorByChain;editor.updateScene();self.update(editor.styles); }, false);
// 		this.proteinColorToggle = new desktop.CheckBox(this.id + '_protein_color_toggle', 'Color by Segment', function() {
// 			if (self.proteinColorToggle.checked) {
// 				editor.styles.proteins_residueColor = 'none';
// 				self.proteinColorToggle.uncheck();
// 				q('#proteinColors').prop('disabled', true);
// 			} else {
// 				self.proteinColorToggle.check();
// 				q('#proteinColors').removeAttr('disabled');
// 				editor.styles.proteins_residueColor = q('#proteinColors').val();
// 			}
// 			editor.updateScene();
// 			self.update(editor.styles);}, false);
//
// 		//nucleics
// 		this.nucleicAcidColorToggle = new desktop.CheckBox(this.id + '_nucleic_acid_color_toggle', 'Color by Segment', function() {
// 			if (self.nucleicAcidColorToggle.checked) {
// 				editor.styles.nucleics_residueColor = 'none';
// 				self.nucleicAcidColorToggle.uncheck();
// 				q('#nucleicColors').prop('disabled', true);
// 			} else {
// 				self.nucleicAcidColorToggle.check();
// 				q('#nucleicColors').removeAttr('disabled');
// 				editor.styles.nucleics_residueColor = q('#nucleicColors').val();
// 			}
// 			editor.updateScene();
// 			self.update(editor.styles);}, false);
//
// 		// text
// 		//this.boldTextToggle = new desktop.CheckBox(this.id + '_bold_text_toggle', 'Bold', function() { editor.styles.text_font_bold=!editor.styles.text_font_bold;editor.updateScene();self.update(editor.styles); }, false);
// 		//this.italicTextToggle = new desktop.CheckBox(this.id + '_italic_text_toggle', 'Italic', function() { editor.styles.text_font_italics=!editor.styles.text_font_italics;editor.updateScene();self.update(editor.styles); }, false);
//
// 		// shapes
// 		this.shapecolor = new desktop.ColorPicker(this.id + '_shapecolor', 'Shape Color: ', function(hex) {editor.styles.shapes_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
//
// 		// compass
// 		this.displayCompassToggle = new desktop.CheckBox(this.id + '_display_compass_toggle', 'Display Compass', function() {
// 			if (self.displayCompassToggle.checked) {
// 				editor.styles.compass_display = false;
// 				editor.setupScene();
// 				editor.updateScene();
// 				self.compassPositionSet.disable();
// 				self.buttonCompassCorner.uncheck();
// 				self.displayCompassToggle.uncheck();
// 				self.update(editor.styles);
// 			} else {
// 				editor.styles.compass_display = true;
// 				editor.styles.compass_type_3D = 0;
// 				editor.styles.compass_size_3D = 50;
// 				self.compassPositionSet.enable();
// 				self.displayCompassToggle.check();
// 				self.buttonCompassCorner.check();
// 				editor.setupScene();
// 				editor.updateScene();
// 				self.update(editor.styles);
// 			}
// 		}, false);
// 		this.makeCompassPositionSet(this);
// 		//this.axisLabelsToggle = new desktop.CheckBox(this.id + '_axis_labels_toggle', 'Axis Labels', function() { editor.styles.compass_displayText_3D=!editor.styles.compass_displayText_3D;editor.updateScene();self.update(editor.styles); }, false);
//
// 		let sb = [];
// 		sb.push('<div style="font-size:12px;text-align:left;overflow-y:scroll;height:300px;" id="');
// 		sb.push(this.id);
// 		sb.push('" title="');
// 		sb.push(this.title);
// 		sb.push('">');
// 		if (this.message) {
// 			sb.push('<p>');
// 			sb.push(this.message);
// 			sb.push('</p>');
// 		}
// 		sb.push('<p><strong>Representation</strong>');
// 		sb.push('<p><select id="reps"><option value="Ball and Stick">Ball and Stick</option><option value="van der Waals Spheres">vdW Spheres</option><option value="Stick">Stick</option><option value="Wireframe">Wireframe</option><option value="Line">Line</option></select></p>');
// 		sb.push('<hr><strong>Canvas</strong>');
// 		sb.push(this.bgcolor.getSource());
// 		sb.push('<p>Projection: ');
// 		sb.push(this.projectionSet.getSource(this.id + '_projection_group'));
// 		sb.push('</p><p>Fog Mode: ');
// 		sb.push(this.fogModeSet.getSource(this.id + '_fog_mode_group'));
// 		sb.push(this.fogcolor.getSource());
// 		sb.push('</p><p>Fog start: <input type="number" id="fogstart" min="0" max="100" value="0"> %</p>');
// 		sb.push('</p><p>Fog end: <input type="number" id="fogend" min="0" max="100" value="100"> %</p>');
// 		sb.push('</p><p>Fog density: <input type="number" id="fogdensity" min="0" max="100" value="100"> %</p>');
// 		sb.push('<hr><strong>Atoms</strong><p>');
// 		sb.push(this.atomsDisplayToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.atomcolor.getSource());
// 		sb.push('</p><p>Sphere diameter: <input type="number" id="spherediameter" min="0" max="40" value="0.8" step="0.01"> Angstroms</p>');
// 		sb.push(this.vdwToggle.getSource());
// 		sb.push('</p><p>VDW Multiplier: <input type="number" id="vdwMultiplier" min="0" max="100" value="100"> %</p>');
// 		sb.push(this.atomsNonBondedAsStarsToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.displayLabelsToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.atomColorSetToggle.getSource());
// 		sb.push(': ');
// 		sb.push(this.atomColorSet.getSource(this.id + '_atom_color_group'));
// 		sb.push('</p><hr><strong>Bonds</strong><p>');
// 		sb.push(this.bondsDisplayToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.bondcolor.getSource());
// 		sb.push(this.bondColorSetToggle.getSource());
// 		sb.push(': ');
// 		sb.push(this.bondColorSet.getSource(this.id + '_bond_color_group'));
// 		sb.push('</p><p>');
// 		sb.push(this.bondOrderToggle.getSource());
// 		sb.push('</p><p>Cylinder diameter: <input type="number" id="cylinderdiameter" min="0" max="40" value="0.3" step="0.01"> Angstroms</p>');
// 		sb.push('</p><hr><strong>Proteins</strong>');
// 		sb.push('<p>');
// 		sb.push(this.ribbonsToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.backboneToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.pipeplankToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.cartoonizeToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.colorByChainToggle.getSource());
// 		sb.push('</p><p>');
// 		sb.push(this.proteinColorToggle.getSource());
// 		sb.push('<select id="proteinColors" disabled><option value="amino">Amino</option><option value="shapely">Shapely</option><option value="polarity">Polarity</option><option value="rainbow">Rainbow</option><option value="acidity">Acidity</option></select></p>');
// 		sb.push('<hr><strong>Nucleic Acids</strong><p>');
// 		sb.push(this.nucleicAcidColorToggle.getSource());
// 		sb.push(': ');
// 		sb.push('<select id="nucleicColors" disabled><option value="shapely">Shapely</option><option value="rainbow">Rainbow</option></select></p>');
// 		//sb.push('<hr><strong>Text</strong>');
// 		//sb.push('<p><table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td><p>Text Color: </p></td><td><input id="textcolor" name="textcolor" class="simple_color" value="#000000" /></td></tr></table></p>');
// 		//sb.push('<p>Font Styles: ');
// 		//sb.push(this.boldTextToggle.getSource());
// 		//sb.push(this.italicTextToggle.getSource());
// 		//sb.push('</p>');
// 		sb.push('<hr><strong>Shapes</strong><p>');
// 		sb.push(this.shapecolor.getSource());
// 		sb.push('</p><hr><strong>Compass</strong>');
// 		sb.push('<p>');
// 		sb.push(this.displayCompassToggle.getSource());
// 		sb.push(': ');
// 		sb.push(this.compassPositionSet.getSource(this.id + '_compass_position_group'));
// 		//sb.push('</p><p>');
// 		sb.push('</p>');
// 		//sb.push(this.axisLabelsToggle.getSource());
// 		//sb.push('</p><table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td>Axis Colors: </td><td><label for="xaxis">X</label></td><td><input id="xaxis" name="xaxis" class="simple_color" value="#FF0000" /></td><td><label for="yaxis">Y</label></td><td><input id="yaxis" name="yaxis" class="simple_color" value="#00FF00" /></td><td><label for="zaxis">Z</label></td><td><input id="zaxis" name="zaxis" class="simple_color" value="#0000FF" /></td></tr></table>');
// 		sb.push('</div>');
// 		if (this.afterMessage) {
// 			sb.push('<p>');
// 			sb.push(this.afterMessage);
// 			sb.push('</p>');
// 		}
// 		document.writeln(sb.join(''));
// 		this.getElement().dialog({
// 			autoOpen : false,
// 			position : {my: "center", at:"center", of:document },
// 			buttons : self.buttons,
// 			width : 500,
// 			height: 300,
// 			open : function(event, ui) {
// 				q(this).height(300);
// 				q(this).width(478);
// 				q(this).dialog('option', 'position', 'center');
// 			}
// 		});
// 		this.bgcolor.setup();
// 		this.fogcolor.setup();
// 		this.atomcolor.setup();
// 		this.bondcolor.setup();
// 		this.shapecolor.setup();
// 		q('#reps').change(function() {
// 			let i = this.selectedIndex;
// 			let ops = this.options;
// 			editor.styles.set3DRepresentation(ops[i].value);
// 			editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		q('#proteinColors').change(function() {
// 			let i = this.selectedIndex;
// 			switch(i) {
// 			case 0:
// 				editor.styles.proteins_residueColor = 'amino';
// 				break;
// 			case 1:
// 				editor.styles.proteins_residueColor = 'shapely';
// 				break;
// 			case 2:
// 				editor.styles.proteins_residueColor = 'polarity';
// 				break;
// 			case 3:
// 				editor.styles.proteins_residueColor = 'rainbow';
// 				break;
// 			case 4:
// 				editor.styles.proteins_residueColor = 'acidity';
// 				break;
// 			}
//
// 			editor.updateScene();
// 			self.update(editor.styles);
// 		});
// 		q('#nucleicColors').change(function() {
// 			let i = this.selectedIndex;
// 			switch(i) {
// 			case 0:
// 				editor.styles.nucleics_residueColor = 'shapely';
// 				break;
// 			case 1:
// 				editor.styles.nucleics_residueColor = 'rainbow';
// 				break;
// 			}
//
// 			editor.updateScene();
// 			self.update(editor.styles);
// 		});
//
// 		q('#fogstart').change(function() {
// 			editor.styles.fog_start_3D = parseInt(this.value)/100;
// 			editor.updateScene();
// 		});
// 		q('#fogend').change(function() {
// 			editor.styles.fog_end_3D = parseInt(this.value)/100;
// 			editor.updateScene();
// 		});
// 		q('#fogdensity').change(function() {
// 			editor.styles.fog_density_3D = parseInt(this.value)/100;
// 			editor.updateScene();
// 		});
// 		q('#vdwMultiplier').change(function() {
// 			editor.styles.atoms_vdwMultiplier_3D = parseInt(this.value)/100;
// 			editor.updateScene();
// 		});
// 		q('#spherediameter').change(function() {
// 			editor.styles.atoms_sphereDiameter_3D = parseFloat(this.value);
// 			editor.updateScene();
// 		});
// 		q('#cylinderdiameter').change(function() {
// 			editor.styles.bonds_cylinderDiameter_3D = parseFloat(this.value);
// 			editor.updateScene();
// 		});
//
// 		this.projectionSet.setup();
// 		this.fogModeSet.setup();
// 		this.atomsDisplayToggle.setup();
// 		this.vdwToggle.setup();
// 		this.atomsNonBondedAsStarsToggle.setup();
// 		this.displayLabelsToggle.setup();
// 		this.atomColorSet.setup();
// 		this.atomColorSet.disable();
// 		this.atomColorSetToggle.setup();
// 		this.bondsDisplayToggle.setup();
// 		this.bondColorSet.setup();
// 		this.bondColorSet.disable();
// 		this.bondColorSetToggle.setup();
// 		this.bondOrderToggle.setup();
// 		this.ribbonsToggle.setup();
// 		this.backboneToggle.setup();
// 		this.pipeplankToggle.setup();
// 		this.cartoonizeToggle.setup();
// 		this.colorByChainToggle.setup();
// 		this.proteinColorToggle.setup();
// 		this.nucleicAcidColorToggle.setup();
// 		//this.boldTextToggle.setup();
// 		//this.italicTextToggle.setup();
// 		this.displayCompassToggle.setup();
// 		this.compassPositionSet.setup();
// 		this.compassPositionSet.disable();
// 		//this.axisLabelsToggle.setup();
// 	};
// 	_.update = function(styles){
// 		this.bgcolor.setColor(styles.backgroundColor);
// 		this.fogcolor.setColor(styles.fog_color_3D);
// 		this.atomcolor.setColor(styles.atoms_color);
// 		this.bondcolor.setColor(styles.bonds_color);
// 		this.shapecolor.setColor(styles.shapes_color);
// 		if (styles.projectionPerspective_3D) {
// 			this.buttonPerspective.select();
// 		} else {
// 			this.buttonOrthographic.select();
// 		}
// 		switch(styles.fog_mode_3D) {
// 		case 1:
// 			this.buttonFogMode0.uncheck();
// 			this.buttonFogMode1.check();
// 			this.buttonFogMode2.uncheck();
// 			this.buttonFogMode3.uncheck();
// 			break;
// 		case 2:
// 			this.buttonFogMode0.uncheck();
// 			this.buttonFogMode1.uncheck();
// 			this.buttonFogMode2.check();
// 			this.buttonFogMode3.uncheck();
// 			break;
// 		case 3:
// 			this.buttonFogMode0.uncheck();
// 			this.buttonFogMode1.uncheck();
// 			this.buttonFogMode2.uncheck();
// 			this.buttonFogMode3.check();
// 			break;
// 		default:
// 			this.buttonFogMode0.check();
// 			this.buttonFogMode1.uncheck();
// 			this.buttonFogMode2.uncheck();
// 			this.buttonFogMode3.uncheck();
// 			break;
// 		}
// 		q('#fogstart').val(styles.fog_start_3D * 100);
// 		q('#fogend').val(styles.fog_end_3D * 100);
// 		q('#fogdensity').val(styles.fog_density_3D * 100);
// 		if (styles.atoms_display) {
// 			this.atomsDisplayToggle.check();
// 		} else {
// 			this.atomsDisplayToggle.uncheck();
// 		}
// 		if (styles.atoms_useVDWDiameters_3D) {
// 			this.vdwToggle.check();
// 			q('#spherediameter').prop('disabled', true);
// 			q('#vdwMultiplier').prop('disabled', false);
// 			q('#vdwMultiplier').val(styles.atoms_vdwMultiplier_3D * 100);
// 		} else {
// 			this.vdwToggle.uncheck();
// 			q('#spherediameter').prop('disabled', false);
// 			q('#spherediameter').val(styles.atoms_sphereDiameter_3D);
// 			q('#vdwMultiplier').prop('disabled', true);
// 		}
// 		if (styles.atoms_useJMOLColors || styles.atoms_usePYMOLColors) {
// 			this.atomColorSetToggle.check();
// 			this.atomColorSet.enable();
// 			if (styles.atoms_useJMOLColors) {
// 				this.buttonJmolColors.check();
// 				this.buttonPymolColors.uncheck();
// 			} else if (styles.atoms_usePYMOLColors) {
// 				this.buttonJmolColors.uncheck();
// 				this.buttonPymolColors.check();
// 			}
// 		} else {
// 			this.atomColorSetToggle.uncheck();
// 			this.buttonPymolColors.uncheck();
// 			this.buttonJmolColors.uncheck();
// 			this.atomColorSet.disable();
// 		}
// 		if (styles.atoms_nonBondedAsStars_3D) {
// 			this.atomsNonBondedAsStarsToggle.check();
// 		} else {
// 			this.atomsNonBondedAsStarsToggle.uncheck();
// 		}
// 		if (styles.atoms_displayLabels_3D) {
// 			this.displayLabelsToggle.check();
// 		} else {
// 			this.displayLabelsToggle.uncheck();
// 		}
// 		if (styles.bonds_display) {
// 			this.bondsDisplayToggle.check();
// 		} else {
// 			this.bondsDisplayToggle.uncheck();
// 		}
// 		if (styles.bonds_useJMOLColors || styles.bonds_usePYMOLColors) {
// 			this.bondColorSetToggle.check();
// 			this.bondColorSet.enable();
// 			if (styles.bonds_useJMOLColors) {
// 				this.buttonJmolBondColors.check();
// 				this.buttonPymolBondColors.uncheck();
// 			} else if (styles.atoms_usePYMOLColors) {
// 				this.buttonJmolBondColors.uncheck();
// 				this.buttonPymolBondColors.check();
// 			}
// 		} else {
// 			this.bondColorSetToggle.uncheck();
// 			this.buttonPymolBondColors.uncheck();
// 			this.buttonJmolBondColors.uncheck();
// 			this.bondColorSet.disable();
// 		}
// 		if (styles.bonds_showBondOrders_3D) {
// 			this.bondOrderToggle.check();
// 		} else {
// 			this.bondOrderToggle.uncheck();
// 		}
// 		q('#cylinderdiameter').val(styles.bonds_cylinderDiameter_3D);
// 		if (styles.proteins_displayRibbon) {
// 			this.ribbonsToggle.check();
// 		} else {
// 			this.ribbonsToggle.uncheck();
// 		}
// 		if (styles.proteins_displayBackbone) {
// 			this.backboneToggle.check();
// 		} else {
// 			this.backboneToggle.uncheck();
// 		}
// 		if (styles.proteins_displayPipePlank) {
// 			this.pipeplankToggle.check();
// 		} else {
// 			this.pipeplankToggle.uncheck();
// 		}
// 		if (styles.proteins_ribbonCartoonize) {
// 			this.cartoonizeToggle.check();
// 		} else {
// 			this.cartoonizeToggle.uncheck();
// 		}
// 		if (styles.macro_colorByChain) {
// 			this.colorByChainToggle.check();
// 		} else {
// 			this.colorByChainToggle.uncheck();
// 		}
// 		switch (styles.proteins_residueColor) {
// 		case 'amino':
// 			this.proteinColorToggle.check();
// 			q('#proteinColors').val('amino');
// 			break;
// 		case 'shapely':
// 			this.proteinColorToggle.check();
// 			q('#proteinColors').val('shapely');
// 			break;
// 		case 'polarity':
// 			this.proteinColorToggle.check();
// 			q('#proteinColors').val('polarity');
// 			break;
// 		case 'rainbow':
// 			this.proteinColorToggle.check();
// 			q('#proteinColors').val('rainbow');
// 			break;
// 		case 'acidity':
// 			this.proteinColorToggle.check();
// 			q('#proteinColors').val('acidity');
// 			break;
// 		case 'none':
// 		default:
// 			this.proteinColorToggle.uncheck();
// 			q('#proteinColors').prop('disabled', true);
// 			break;
// 		}
// 		switch (styles.nucleics_residueColor) {
// 		case 'shapely':
// 			this.nucleicAcidColorToggle.check();
// 			q('#nucleicColors').val('shapely');
// 			break;
// 		case 'rainbow':
// 			this.nucleicAcidColorToggle.check();
// 			q('#nucleicColors').val('rainbow');
// 			break;
// 		case 'none':
// 		default:
// 			this.nucleicAcidColorToggle.uncheck();
// 			q('#nucleicColors').prop('disabled', true);
// 			break;
// 		}
// 		/*
// 		if (styles.text_font_bold) {
// 			this.boldTextToggle.check();
// 		}
// 		if (styles.text_font_italic) {
// 			this.italicTextToggle.check();
// 		}*/
// 		if (styles.compass_display == true) {
// 			this.compassPositionSet.enable();
// 			if (styles.compass_type_3D == 0) {
// 				this.buttonCompassCorner.check();
// 				this.buttonCompassOrigin.uncheck();
// 			} else {
// 				this.buttonCompassOrigin.check();
// 				this.buttonCompassCorner.uncheck();
// 			}
// 		} else {
// 			this.compassPositionSet.disable();
// 			this.buttonCompassCorner.uncheck();
// 			this.buttonCompassOrigin.uncheck();
// 		}
// 		/*if (styles.compass_display_text_3D) {
// 			this.axisLabelsToggle.check();
// 		} else {
// 			this.axisLabelsToggle.uncheck();
// 		} */
// 	};
//
// })(Chemio, Chemio.uis.gui.desktop, Chemio.lib.jQuery, document);
//endregion
