//************************ TOOLBAR MANAGER ***********************
(function(c, io, structures, actions, gui, imageDepot, desktop, tools, states, document, undefined) {
    'use strict';
    gui.ToolbarManager = function(sketcher) {
        this.sketcher = sketcher;

        // lasso
        this.buttonLasso = new desktop.Button(sketcher.id + '_button_lasso', imageDepot.LASSO, 'Lasso: [Space]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_LASSO);
            sketcher.lasso.mode = tools.Lasso.MODE_LASSO;
            if (!sketcher.lasso.isActive()) {
                sketcher.lasso.selectNextMolecule();
            }
        });
        // delete
        this.buttonErase = new desktop.Button(sketcher.id + '_button_erase', imageDepot.ERASE, 'Delete: [Right Click]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_ERASE);
        });
        // single bond
        this.buttonSingle = new desktop.Button(sketcher.id + '_button_bond_single', imageDepot.BOND_SINGLE, 'Single Bond [1]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
            sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
            sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
            if (sketcher.lasso.isActive()) sketcher.lasso.empty();
        });
        // wedged bond
        this.buttonWedged = new desktop.Button(sketcher.id + '_button_bond_wedged', imageDepot.BOND_WEDGED, 'Wedged Bond [W]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
            sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
            sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_WEDGED;
            if (sketcher.lasso.isActive()) sketcher.lasso.empty();
        });
        // hashed bond
        this.buttonDashed = new desktop.Button(sketcher.id + '_button_bond_dashed', imageDepot.BOND_DASHED, 'Hashed Bond [H]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_BOND);
            sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
            sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_DASHED;
            if (sketcher.lasso.isActive()) sketcher.lasso.empty();
        });
        // chain
        this.buttonChain = new desktop.Button(sketcher.id + '_button_chain', imageDepot.CHAIN_CARBON, 'Chain: [Shift+click]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_CHAIN);
        });
        // charge plus
        this.buttonChargePlus = new desktop.Button(sketcher.id + '_button_attribute_charge_increment', imageDepot.INCREASE_CHARGE, 'Increase Charge [+]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_CHARGE);
            sketcher.stateManager.STATE_CHARGE.delta = 1;
        });
        // charge minus
        this.buttonChargeMinus = new desktop.Button(sketcher.id + '_button_attribute_charge_decrement', imageDepot.DECREASE_CHARGE, 'Decrease Charge [=]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_CHARGE);
            sketcher.stateManager.STATE_CHARGE.delta = -1;
        });
        // arrow
        this.buttonArrowSynthetic = new desktop.Button(sketcher.id + '_button_shape_arrow_synthetic', imageDepot.ARROW_SYNTHETIC, 'Arrow: [Ctrl+click]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_SHAPE);
            sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_SYNTHETIC;
        });

        this.buttonBenzene = new desktop.Button(sketcher.id + '_button_ring_benzene', imageDepot.BENZENE, 'Benzene: [V]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 6;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = true;
        });
        this.buttonCyclohexane = new desktop.Button(sketcher.id + '_button_ring_cyclohexane', imageDepot.CYCLOHEXANE, 'Cyclohexane: [6]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 6;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });
        this.buttonCyclopropane = new desktop.Button(sketcher.id + '_button_ring_cyclopropane', imageDepot.CYCLOPROPANE, 'Cyclopropane: [Shift+3]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 3;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });
        this.buttonCyclobutane = new desktop.Button(sketcher.id + '_button_ring_cyclobutane', imageDepot.CYCLOBUTANE, 'Cyclobutane: [4]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 4;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });
        this.buttonCyclopentane = new desktop.Button(sketcher.id + '_button_ring_cyclopentane', imageDepot.CYCLOPENTANE, 'Cyclopentane: [5]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 5;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });
        this.buttonCycloheptane = new desktop.Button(sketcher.id + '_button_ring_cycloheptane', imageDepot.CYCLOHEPTANE, 'Cycloheptane: [6]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 7;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });
        this.buttonCyclooctane = new desktop.Button(sketcher.id + '_button_ring_cyclooctane', imageDepot.CYCLOOCTANE, 'Cyclooctane: [7]', function() {
            sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_RING);
            sketcher.stateManager.STATE_NEW_RING.numSides = 8;
            sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
        });


        this.leftToolBar =  new desktop.ButtonSet(sketcher.id + '_left_toolbar');

        this.leftToolBar.buttons.push(this.buttonChargePlus);
        this.leftToolBar.buttons.push(this.buttonLasso);

        this.leftToolBar.buttons.push(this.buttonChargeMinus);
        this.leftToolBar.buttons.push(this.buttonErase);

        this.leftToolBar.buttons.push(this.buttonCyclobutane);
        this.leftToolBar.buttons.push(this.buttonSingle);

        this.leftToolBar.buttons.push(this.buttonBenzene);
        this.leftToolBar.buttons.push(this.buttonWedged);


        this.leftToolBar.buttons.push(this.buttonCyclopropane);
        this.leftToolBar.buttons.push(this.buttonDashed);

        this.leftToolBar.buttons.push(this.buttonCyclopentane);
        this.leftToolBar.buttons.push(this.buttonChain);

        this.leftToolBar.buttons.push(this.buttonCyclooctane);
        this.leftToolBar.buttons.push(this.buttonArrowSynthetic);

        this.leftToolBar.buttons.push(this.buttonCycloheptane);
        this.leftToolBar.buttons.push(this.buttonCyclohexane);



        this.leftToolBar.columnCount = 2;

        // clear
        this.buttonClear = new desktop.Button(sketcher.id + '_button_clear', imageDepot.CLEAR, 'Clear', function() {
            let clear = true;
            if (sketcher.oneMolecule) {
                if (sketcher.molecules[0].atoms.length === 1) {
                    let a = sketcher.molecules[0].atoms[0];
                    if (a.label === 'C' && a.charge === 0 && a.mass === -1) {
                        clear = false;
                    }
                }
            } else {
                if (sketcher.molecules.length === 0 && sketcher.shapes.length === 0) {
                    clear = false;
                }
            }
            if (clear) {
                sketcher.stateManager.getCurrentState().clearHover();
                if (sketcher.lasso && sketcher.lasso.isActive()) {
                    sketcher.lasso.empty();
                }
                sketcher.historyManager.pushUndo(new actions.ClearAction(sketcher));
            }
        });
        // center
        this.buttonCenter = new desktop.Button(sketcher.id + '_button_center', imageDepot.CENTER, 'Center: [Space]', function() {
            let dif = new structures.Point(sketcher.width / 2, sketcher.height / 2);
            let bounds = sketcher.getContentBounds();
            dif.x -= (bounds.maxX + bounds.minX) / 2;
            dif.y -= (bounds.maxY + bounds.minY) / 2;
            sketcher.historyManager.pushUndo(new actions.MoveAction(sketcher.getAllPoints(), dif));
        });
        // open
        this.buttonOpen = new desktop.Button(sketcher.id + '_button_open', imageDepot.OPEN, 'Open: [Ctrl + O]', function() {
            sketcher.dialogManager.openPopup.show();
        });
        // save
        this.buttonSave = new desktop.Button(sketcher.id + '_button_save', imageDepot.SAVE, 'Save: [Ctrl + S]', function() {
            if (sketcher.useServices) {
                sketcher.dialogManager.saveDialog.clear();
            } else if (sketcher.lasso.isActive()) {
                sketcher.dialogManager.saveDialog.getTextArea().val(c.writeMOL(sketcher.lasso.getFirstMolecule()));
            }
            sketcher.dialogManager.saveDialog.open();
        });
        // undo
        this.buttonUndo = new desktop.Button(sketcher.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
            sketcher.historyManager.undo();
        });
        // redo
        this.buttonRedo = new desktop.Button(sketcher.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
            sketcher.historyManager.redo();
        });

        this.bottomToolBar = new desktop.ButtonSet(sketcher.id + '_bottom_toolbar');
        this.bottomToolBar.buttons.push(this.buttonClear);
        this.bottomToolBar.buttons.push(this.buttonCenter);
        this.bottomToolBar.buttons.push(this.buttonOpen);
        this.bottomToolBar.buttons.push(this.buttonSave);
        this.bottomToolBar.buttons.push(this.buttonUndo);
        this.bottomToolBar.buttons.push(this.buttonRedo);
        this.bottomToolBar.toggle = false;
        this.bottomToolBar.columnCount = -1;

        // lasso
        // this.buttonLasso = new desktop.Button(sketcher.id + '_button_lasso', imageDepot.LASSO, 'Lasso: [Space]', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_LASSO);
        // 	sketcher.lasso.mode = tools.Lasso.MODE_LASSO;
        // 	if (!sketcher.lasso.isActive()) {
        // 		sketcher.lasso.selectNextMolecule();
        // 	}
        // });

        // open
        // this.buttonOpen = new desktop.Button(sketcher.id + '_button_open', imageDepot.OPEN, 'Open: [Ctrl + O]', function() {
        // 	sketcher.dialogManager.openPopup.show();
        // });

        // save
        // this.buttonSave = new desktop.Button(sketcher.id + '_button_save', imageDepot.SAVE, 'Save: [Ctrl + S]', function() {
        // 	if (sketcher.useServices) {
        // 		sketcher.dialogManager.saveDialog.clear();
        // 	} else if (sketcher.lasso.isActive()) {
        // 		sketcher.dialogManager.saveDialog.getTextArea().val(c.writeMOL(sketcher.lasso.getFirstMolecule()));
        // 	}
        // 	sketcher.dialogManager.saveDialog.open();
        // });

        // template
        // this.buttonTemplate = new desktop.Button(sketcher.id + '_button_template', imageDepot.TEMPLATES, 'Templates', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_TEMPLATE);
        // 	sketcher.dialogManager.templateDialog.open();
        // });
        // this.buttonTemplate.toggle = true;

        // search
        // this.buttonSearch = new desktop.Button(sketcher.id + '_button_search', imageDepot.SEARCH, 'Search', function() {
        // 	sketcher.dialogManager.searchDialog.open();
        // });

        // calculate
        // this.buttonCalculate = new desktop.Button(sketcher.id + '_button_calculate', imageDepot.CALCULATE, 'Calculate', function() {
        // 	let mol = sketcher.lasso.getFirstMolecule();
        // 	if (mol) {
        // 		iChemLabs.calculate(mol, {
        // 			descriptors : [ 'mf', 'ef', 'mw', 'miw', 'deg_unsat', 'hba', 'hbd', 'rot', 'electron', 'pol_miller', 'cmr', 'tpsa', 'vabc', 'xlogp2', 'bertz' ]
        // 		}, function(content) {
        // 			let sb = [];
        // 			function addDatum(title, value, unit) {
        // 				sb.push(title);
        // 				sb.push(': ');
        // 				for ( let i = title.length + 2; i < 30; i++) {
        // 					sb.push(' ');
        // 				}
        // 				sb.push(value);
        // 				sb.push(' ');
        // 				sb.push(unit);
        // 				sb.push('\n');
        // 			}
        // 			addDatum('Molecular Formula', content.mf, '');
        // 			addDatum('Empirical Formula', content.ef, '');
        // 			addDatum('Molecular Mass', content.mw, 'amu');
        // 			addDatum('Monoisotopic Mass', content.miw, 'amu');
        // 			addDatum('Degree of Unsaturation', content.deg_unsat, '');
        // 			addDatum('Hydrogen Bond Acceptors', content.hba, '');
        // 			addDatum('Hydrogen Bond Donors', content.hbd, '');
        // 			addDatum('Rotatable Bonds', content.rot, '');
        // 			addDatum('Total Electrons', content.rot, '');
        // 			addDatum('Molecular Polarizability', content.pol_miller, 'A^3');
        // 			addDatum('Molar Refractivity', content.cmr, 'cm^3/mol');
        // 			addDatum('Polar Surface Area', content.tpsa, 'A^2');
        // 			addDatum('vdW Volume', content.vabc, 'A^3');
        // 			addDatum('logP', content.xlogp2, '');
        // 			addDatum('Complexity', content.bertz, '');
        // 			sketcher.dialogManager.calculateDialog.getTextArea().val(sb.join(''));
        // 			sketcher.dialogManager.calculateDialog.open();
        // 		});
        // 	}
        // });

        // move
        // this.buttonMove = new desktop.Button(sketcher.id + '_button_move', imageDepot.MOVE, 'Move', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_MOVE);
        // });
        // this.buttonMove.toggle = true;

        // erase
        // this.buttonErase = new desktop.Button(sketcher.id + '_button_erase', imageDepot.ERASE, 'Delete: [Right Click]', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_ERASE);
        // });
        // this.buttonErase.toggle = true;

        // center
        // this.buttonCenter = new desktop.Button(sketcher.id + '_button_center', imageDepot.CENTER, 'Center: [Space]', function() {
        // 	let dif = new structures.Point(sketcher.width / 2, sketcher.height / 2);
        // 	let bounds = sketcher.getContentBounds();
        // 	dif.x -= (bounds.maxX + bounds.minX) / 2;
        // 	dif.y -= (bounds.maxY + bounds.minY) / 2;
        // 	sketcher.historyManager.pushUndo(new actions.MoveAction(sketcher.getAllPoints(), dif));
        // });

        // clean
        // this.buttonClean = new desktop.Button(sketcher.id + '_button_clean', imageDepot.OPTIMIZE, 'Clean', function() {
        // 	let mol = sketcher.lasso.getFirstMolecule();
        // 	if (mol) {
        // 		let json = new io.JSONInterpreter();
        // 		iChemLabs._contactServer('optimize', {
        // 			'mol' : json.molTo(mol)
        // 		}, {
        // 			dimension : 2
        // 		}, function(content) {
        // 			let optimized = json.molFrom(content.mol);
        // 			let optCenter = optimized.getCenter();
        // 			let dif = mol.getCenter();
        // 			dif.sub(optCenter);
        // 			for ( let i = 0, ii = optimized.atoms.length; i < ii; i++) {
        // 				optimized.atoms[i].add(dif);
        // 			}
        // 			sketcher.historyManager.pushUndo(new actions.ChangeCoordinatesAction(mol.atoms, optimized.atoms));
        // 		});
        // 	}
        // });

        // sets

        // cut/copy/paste set
        // this.makeCopySet(this);

        // scale set
        // this.makeScaleSet(this);

        // flip set
        // this.makeFlipSet(this);

        // history set
        // this.makeHistorySet(this);

        // label set
        // this.makeLabelSet(this);

        // attribute set
        // this.makeAttributeSet(this);

        // query
        // this.buttonTextInput = new desktop.Button(sketcher.id + '_button_text_input', imageDepot.TEXT, 'Set Atom Label', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_TEXT_INPUT);
        // });
        // this.buttonTextInput.toggle = true;
        // this.buttonQuery = new desktop.Button(sketcher.id + '_button_query', imageDepot.QUERY, 'Set Query to Atom or Bond', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_QUERY);
        // });
        // this.buttonQuery.toggle = true;

        // bond set
        // this.makeBondSet(this);

        // ring set
        // this.makeRingSet(this);

        // chain
        // this.buttonChain = new desktop.Button(sketcher.id + '_button_chain', imageDepot.CHAIN_CARBON, 'Chain: [Shift+click]', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_CHAIN);
        // });
        // this.buttonChain.toggle = true;

        // arrows
        // this.buttonArrowSynthetic = new desktop.Button(sketcher.id + '_button_shape_arrow_synthetic', imageDepot.ARROW_SYNTHETIC, 'Arrow: [Ctrl+click]', function() {
        // 	sketcher.stateManager.setState(sketcher.stateManager.STATE_SHAPE);
        // 	sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_SYNTHETIC;
        // });

        if(this.makeOtherButtons){
            this.makeOtherButtons(this);
        }
    };
    let _ = gui.ToolbarManager.prototype;

    _.write = function() {
        let sb = [];

        sb.push(this.leftToolBar.getSource());
        sb.push('<div class="canvas-group" id="'+ this.sketcher.id + '_canvas_group">');
        sb.push('<canvas class="ChemioWebComponent" id="' + this.sketcher.id + '" alt="Chemio Web Component">This browser does not support HTML5/Canvas.</canvas>');
        sb.push(this.bottomToolBar.getSource());
        sb.push('<div>');

        let container = document.createElement('div');
        container.setAttribute('id', this.sketcher.id + '_container');
        container.innerHTML = sb.join('');

        let currentDOM = document.getElementById('editor');
        currentDOM.parentNode.insertBefore(container, currentDOM);

        // let sb = ['<div style="font-size:10px;">'];
        // let bg = this.sketcher.id + '_main_group';
        // sb.push(this.buttonLasso.getSource());
        // // sb.push(this.buttonErase.getSource(bg));
        // sb.push(this.buttonCenter.getSource());
        //
        // // flipSet
        // sb.push(this.buttonFlipVert.getSource());
        // sb.push(this.buttonFlipHor.getSource());
        //
        // if (this.sketcher.useServices) {
        // 	sb.push(this.buttonClean.getSource());
        // }
        //
        // // history set
        // sb.push(this.buttonUndo.getSource());
        // sb.push(this.buttonRedo.getSource());
        //
        // // copy set
        // sb.push(this.buttonOpen.getSource());
        // sb.push(this.buttonSave.getSource());
        //
        // // sb.push(this.buttonTemplate.getSource(bg));
        //
        // if (this.sketcher.useServices) {
        // 	sb.push(this.buttonSearch.getSource());
        // 	sb.push(this.buttonCalculate.getSource());
        // }
        // sb.push('<br>');
        // if(desktop.TextInput){
        // 	sb.push(this.buttonTextInput.getSource(bg));
        // }
        // sb.push(this.labelSet.getSource(bg));
        // if (this.sketcher.includeQuery) {
        // 	sb.push(this.buttonQuery.getSource(bg));
        // }
        //
        // // attribute set
        // sb.push(this.buttonChargePlus.getSource());
        // sb.push(this.buttonChargeMinus.getSource());
        //
        // sb.push(this.bondSet.getSource(bg));
        // sb.push(this.ringSet.getSource(bg));
        //
        // sb.push(this.buttonChain.getSource(bg));
        // sb.push(this.buttonArrowSynthetic.getSource());
        // sb.push('</div>');
        // if (document.getElementById(this.sketcher.id)) {
        // 	let canvas = q('#' + this.sketcher.id);
        // 	canvas.before(sb.join(''));
        // } else {
        // 	document.write(sb.join(''));
        // }
    };
    _.setup = function() {
        this.leftToolBar.setup('left-toolbar');
        this.bottomToolBar.setup('bottom-toolbar');

        // adjust width/height
        let canvasGroup = document.getElementById(this.sketcher.id + '_canvas_group')
        canvasGroup.style.width = this.sketcher.width.toString()+ 'px';

        let container = document.getElementById(this.sketcher.id + '_container');
        container.style.width = (this.sketcher.width + this.leftToolBar.offsetWidth).toString() + 'px';
        container.style.height = (this.sketcher.height + this.bottomToolBar.offsetHeight).toString() + 'px';

        container.addEventListener('contextmenu', event => event.preventDefault());

        this.buttonSingle.select();

        // this.buttonLasso.setup();
        // // this.buttonErase.setup(true);
        // this.buttonCenter.setup();
        // if (this.sketcher.useServices) {
        // 	this.buttonClean.setup();
        // }
        //
        // // flip set
        // this.buttonFlipVert.setup();
        // this.buttonFlipHor.setup();
        //
        // // history set
        // this.buttonUndo.setup();
        // this.buttonRedo.setup();
        //
        // // this.scaleSet.setup();
        //
        // // copy set
        // this.buttonOpen.setup();
        // this.buttonSave.setup();
        //
        // // this.buttonTemplate.setup(true);
        //
        // if (this.sketcher.useServices) {
        // 	this.buttonSearch.setup();
        // 	this.buttonCalculate.setup();
        // }
        // if(desktop.TextInput){
        // 	this.buttonTextInput.setup(true);
        // }
        // this.labelSet.setup();
        // if (this.sketcher.includeQuery) {
        // 	this.buttonQuery.setup(true);
        // }
        //
        // // attribute set
        // this.buttonChargePlus.setup();
        // this.buttonChargeMinus.setup();
        //
        // this.bondSet.setup();
        // this.ringSet.setup();
        // this.buttonChain.setup(true);
        // this.buttonArrowSynthetic.setup();
        //
        // this.buttonUndo.disable();
        // this.buttonRedo.disable();
        // this.buttonCut.disable();
        // this.buttonCopy.disable();
        // this.buttonPaste.disable();
        // this.buttonFlipVert.disable();
        // this.buttonFlipHor.disable();
        // if (this.sketcher.useServices) {
        // 	this.buttonClean.disable();
        // 	this.buttonCalculate.disable();
        // 	this.buttonSave.disable();
        // }
    };

    // _.makeCopySet = function(self) {
    // 	this.buttonCut = new desktop.Button(self.sketcher.id + '_button_cut', imageDepot.CUT, 'Cut', function() {
    // 		self.sketcher.copyPasteManager.copy(true);
    // 	});
    // 	this.buttonCopy = new desktop.Button(self.sketcher.id + '_button_copy', imageDepot.COPY, 'Copy', function() {
    // 		self.sketcher.copyPasteManager.copy(false);
    // 	});
    // 	this.buttonPaste = new desktop.Button(self.sketcher.id + '_button_paste', imageDepot.PASTE, 'Paste', function() {
    // 		self.sketcher.copyPasteManager.paste();
    // 	});
    //
    // 	// this.copySet = new desktop.ButtonSet(self.sketcher.id + '_buttons_copy');
    // 	// this.copySet.toggle = false;
    // 	// this.copySet.buttons.push(this.buttonCut);
    // 	// this.copySet.buttons.push(this.buttonCopy);
    // 	// this.copySet.buttons.push(this.buttonPaste);
    // };
    // _.makeScaleSet = function(self) {
    // 	this.buttonScalePlus = new desktop.Button(self.sketcher.id + '_button_scale_plus', imageDepot.ZOOM_IN, 'Increase Scale', function() {
    // 		self.sketcher.styles.scale *= 1.5;
    // 		self.sketcher.checkScale();
    // 		self.sketcher.repaint();
    // 	});
    // 	this.buttonScaleMinus = new desktop.Button(self.sketcher.id + '_button_scale_minus', imageDepot.ZOOM_OUT, 'Decrease Scale', function() {
    // 		self.sketcher.styles.scale /= 1.5;
    // 		self.sketcher.checkScale();
    // 		self.sketcher.repaint();
    // 	});
    //
    // 	// this.scaleSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_scale');
    // 	// this.scaleSet.toggle = false;
    // 	// this.scaleSet.buttons.push(this.buttonScalePlus);
    // 	// this.scaleSet.buttons.push(this.buttonScaleMinus);
    // };
    // _.makeFlipSet = function(self) {
    // 	let action = function(horizontal){
    // 		let ps = self.sketcher.lasso.getAllPoints();
    // 		let bonds = [];
    // 		let lbs = self.sketcher.lasso.getBonds();
    // 		for(let i = 0, ii = lbs.length; i<ii; i++){
    // 			let b = lbs[i];
    // 			if(b.bondOrder===1 && (b.stereo===structures.Bond.STEREO_WEDGED || b.stereo===structures.Bond.STEREO_DASHED)){
    // 				bonds.push(b);
    // 			}
    // 		}
    // 		self.sketcher.historyManager.pushUndo(new actions.FlipAction(ps, bonds, horizontal));
    // 	}
    // 	this.buttonFlipVert = new desktop.Button(self.sketcher.id + '_button_flip_hor', imageDepot.FLIP_HOR, 'Flip Horizontally [F]', function() {
    // 		action(true);
    // 	});
    // 	this.buttonFlipHor = new desktop.Button(self.sketcher.id + '_button_flip_ver', imageDepot.FLIP_VER, 'Flip Vertically [Ctrl+F]', function() {
    // 		action(false);
    // 	});
    //
    // 	// this.flipSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_flip');
    // 	// this.flipSet.toggle = false;
    // 	// this.flipSet.buttons.push(this.buttonFlipVert);
    // 	// this.flipSet.buttons.push(this.buttonFlipHor);
    // };
    // _.makeHistorySet = function(self) {
    // 	this.buttonUndo = new desktop.Button(self.sketcher.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
    // 		self.sketcher.historyManager.undo();
    // 	});
    // 	this.buttonRedo = new desktop.Button(self.sketcher.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
    // 		self.sketcher.historyManager.redo();
    // 	});
    //
    // 	// this.historySet = new desktop.ButtonSet(self.sketcher.id + '_buttons_history');
    // 	// this.historySet.toggle = false;
    // 	// this.historySet.buttons.push(this.buttonUndo);
    // 	// this.historySet.buttons.push(this.buttonRedo);
    // };
    // _.makeLabelSet = function(self) {
    // 	this.buttonLabelH = new desktop.Button(self.sketcher.id + '_button_label_h', imageDepot.HYDROGEN, 'Hydrogen', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'H';
    // 	});
    // 	this.buttonLabelC = new desktop.Button(self.sketcher.id + '_button_label_c', imageDepot.CARBON, 'Carbon', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'C';
    // 	});
    // 	this.buttonLabelN = new desktop.Button(self.sketcher.id + '_button_label_n', imageDepot.NITROGEN, 'Nitrogen', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'N';
    // 	});
    // 	this.buttonLabelO = new desktop.Button(self.sketcher.id + '_button_label_o', imageDepot.OXYGEN, 'Oxygen', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'O';
    // 	});
    // 	this.buttonLabelF = new desktop.Button(self.sketcher.id + '_button_label_f', imageDepot.FLUORINE, 'Fluorine', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'F';
    // 	});
    // 	this.buttonLabelCl = new desktop.Button(self.sketcher.id + '_button_label_cl', imageDepot.CHLORINE, 'Chlorine', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'Cl';
    // 	});
    // 	this.buttonLabelBr = new desktop.Button(self.sketcher.id + '_button_label_br', imageDepot.BROMINE, 'Bromine', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'Br';
    // 	});
    // 	this.buttonLabelI = new desktop.Button(self.sketcher.id + '_button_label_i', imageDepot.IODINE, 'Iodine', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'I';
    // 	});
    // 	this.buttonLabelP = new desktop.Button(self.sketcher.id + '_button_label_p', imageDepot.PHOSPHORUS, 'Phosphorus', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'P';
    // 	});
    // 	this.buttonLabelS = new desktop.Button(self.sketcher.id + '_button_label_s', imageDepot.SULFUR, 'Sulfur', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'S';
    // 	});
    // 	this.buttonLabelSi = new desktop.Button(self.sketcher.id + '_button_label_si', imageDepot.SILICON, 'Silicon', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 		self.sketcher.stateManager.STATE_LABEL.label = 'Si';
    // 	});
    // 	this.buttonLabelPT = new desktop.Button(self.sketcher.id + '_button_label_pt', imageDepot.PERIODIC_TABLE, 'Choose Symbol', function() {
    // 		if(self.sketcher.dialogManager.periodicTableDialog.canvas.selected){
    // 			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
    // 			self.sketcher.stateManager.STATE_LABEL.label = self.sketcher.dialogManager.periodicTableDialog.canvas.selected.element.symbol;
    // 		}
    // 		self.sketcher.dialogManager.periodicTableDialog.open();
    // 	});
    //
    // 	this.buttonLabel = new desktop.DummyButton(self.sketcher.id + '_button_label', 'Set Label');
    // 	this.labelSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_label');
    // 	this.labelSet.buttons.push(this.buttonLabel);
    // 	this.labelSet.addDropDown('More Labels');
    // 	this.labelSet.dropDown.defaultButton = this.buttonLabelO;
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelH);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelC);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelN);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelO);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelF);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelCl);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelBr);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelI);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelP);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelS);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelSi);
    // 	this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelPT);
    // };
    // _.makeBondSet = function(self) {
    // 	this.buttonSingle = new desktop.Button(self.sketcher.id + '_button_bond_single', imageDepot.BOND_SINGLE, 'Single Bond [1]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 		self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
    // 		self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 		if (self.sketcher.lasso.isActive()) self.sketcher.lasso.empty();
    // 	});
    // 	this.buttonDashed = new desktop.Button(self.sketcher.id + '_button_bond_dashed', imageDepot.BOND_DASHED, 'Hashed Bond [H]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 		self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
    // 		self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_DASHED;
    // 		if (self.sketcher.lasso.isActive()) self.sketcher.lasso.empty();
    // 	});
    // 	this.buttonWedged = new desktop.Button(self.sketcher.id + '_button_bond_wedged', imageDepot.BOND_WEDGED, 'Wedged Bond [W]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 		self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
    // 		self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_WEDGED;
    // 		if (self.sketcher.lasso.isActive()) self.sketcher.lasso.empty();
    // 	});
    // 	this.buttonDouble = new desktop.Button(self.sketcher.id + '_button_bond_double', imageDepot.BOND_DOUBLE, 'Double Bond', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 		self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 2;
    // 		self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 	});
    // 	// this.buttonZero = new desktop.Button(self.sketcher.id + '_button_bond_zero', imageDepot.BOND_ZERO, 'Zero Bond (Ionic/Hydrogen)', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 0;
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 	// });
    // 	// this.buttonHalf = new desktop.Button(self.sketcher.id + '_button_bond_half', imageDepot.BOND_HALF, 'Half Bond', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 0.5;
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 	// });
    // 	// this.buttonWavy = new desktop.Button(self.sketcher.id + '_button_bond_wavy', imageDepot.BOND_WAVY, 'Wavy Bond', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_AMBIGUOUS;
    // 	// });
    // 	// this.buttonResonance = new desktop.Button(self.sketcher.id + '_button_bond_resonance', imageDepot.BOND_RESONANCE, 'Resonance Bond', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1.5;
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 	// });
    // 	// this.buttonDoubleAmbiguous = new desktop.Button(self.sketcher.id + '_button_bond_ambiguous_double', imageDepot.BOND_DOUBLE_AMBIGUOUS, 'Ambiguous Double Bond', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 2;
    // 	// 	self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_AMBIGUOUS;
    // 	// });
    // 	this.buttonTriple = new desktop.Button(self.sketcher.id + '_button_bond_triple', imageDepot.BOND_TRIPLE, 'Triple Bond', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
    // 		self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 3;
    // 		self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
    // 	});
    //
    // 	this.bondSet = [];
    // 	this.bondSet.push(this.buttonSingle);
    // 	this.bondSet.push(this.buttonDashed);
    // 	this.bondSet.push(this.buttonWedged);
    //
    // 	this.bondSet.setup = function() {
    // 		self.bondSet.forEach(function(element) {
    // 			element.setup();
    // 		});
    // 	};
    // 	this.bondSet.getSource = function() {
    // 		let sb = [];
    // 		self.bondSet.forEach(function(element) {
    // 			sb.push(element.getSource());
    // 		});
    // 		return sb.join('');
    // 	}
    //
    // 	// this.buttonBond = new desktop.DummyButton(self.sketcher.id + '_button_bond', 'Other Bond');
    // 	// this.bondSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_bond');
    // 	// this.bondSet.toggle = false;
    // 	// this.bondSet.buttons.push(this.buttonSingle);
    // 	// this.bondSet.buttons.push(this.buttonWedged);
    // 	// this.bondSet.buttons.push(this.buttonDashed);
    //
    // 	// this.bondSet.buttons.push(this.buttonDouble);
    // 	// this.bondSet.buttons.push(this.buttonBond);
    // 	// this.bondSet.addDropDown('More Bonds');
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonZero);
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonHalf);
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonWavy);
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonResonance);
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonDoubleAmbiguous);
    // 	// this.bondSet.dropDown.buttonSet.buttons.push(this.buttonTriple);
    // 	// this.bondSet.dropDown.defaultButton = this.buttonTriple;
    // };
    // _.makeRingSet = function(self) {
    // 	this.buttonBenzene = new desktop.Button(self.sketcher.id + '_button_ring_benzene', imageDepot.BENZENE, 'Benzene: [V]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 6;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = true;
    // 	});
    // 	this.buttonCyclohexane = new desktop.Button(self.sketcher.id + '_button_ring_cyclohexane', imageDepot.CYCLOHEXANE, 'Cyclohexane: [6]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 6;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	this.buttonCyclopropane = new desktop.Button(self.sketcher.id + '_button_ring_cyclopropane', imageDepot.CYCLOPROPANE, 'Cyclopropane: [Shift+3]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 3;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	this.buttonCyclobutane = new desktop.Button(self.sketcher.id + '_button_ring_cyclobutane', imageDepot.CYCLOBUTANE, 'Cyclobutane: [4]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 4;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	this.buttonCyclopentane = new desktop.Button(self.sketcher.id + '_button_ring_cyclopentane', imageDepot.CYCLOPENTANE, 'Cyclopentane: [5]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 5;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	this.buttonCycloheptane = new desktop.Button(self.sketcher.id + '_button_ring_cycloheptane', imageDepot.CYCLOHEPTANE, 'Cycloheptane: [6]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 7;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	this.buttonCyclooctane = new desktop.Button(self.sketcher.id + '_button_ring_cyclooctane', imageDepot.CYCLOOCTANE, 'Cyclooctane: [7]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 		self.sketcher.stateManager.STATE_NEW_RING.numSides = 8;
    // 		self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	});
    // 	// this.buttonRingArbitrary = new desktop.Button(self.sketcher.id + '_button_ring_arbitrary', imageDepot.RING_ARBITRARY, 'Arbitrary Ring Size Tool', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
    // 	// 	self.sketcher.stateManager.STATE_NEW_RING.numSides = -1;
    // 	// 	self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
    // 	// });
    //
    // 	this.ringSet = [];
    // 	this.ringSet.push(this.buttonBenzene);
    // 	this.ringSet.push(this.buttonCyclohexane);
    // 	this.ringSet.push(this.buttonCyclopropane);
    // 	this.ringSet.push(this.buttonCyclobutane);
    // 	this.ringSet.push(this.buttonCyclopentane);
    // 	this.ringSet.push(this.buttonCycloheptane);
    // 	this.ringSet.push(this.buttonCyclooctane);
    //
    // 	this.ringSet.setup = function() {
    // 		self.ringSet.forEach(function(element) {
    // 			element.setup();
    // 		});
    // 	};
    // 	this.ringSet.getSource = function() {
    // 		let sb = [];
    // 		self.ringSet.forEach(function(element) {
    // 			sb.push(element.getSource());
    // 		});
    // 		return sb.join('');
    // 	}
    //
    // 	// this.buttonRing = new desktop.DummyButton(self.sketcher.id + '_button_ring', 'Other Ring');
    // 	// this.ringSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_ring');
    // 	// this.ringSet.toggle = false;
    // 	// this.ringSet.buttons.push(this.buttonBenzene);
    // 	// this.ringSet.buttons.push(this.buttonCyclohexane);
    // 	// this.ringSet.buttons.push(this.buttonRing);
    // 	// this.ringSet.addDropDown('More Rings');
    // 	// this.ringSet.buttons.push(this.buttonCyclopropane);
    // 	// this.ringSet.buttons.push(this.buttonCyclobutane);
    // 	// this.ringSet.buttons.push(this.buttonCyclopentane);
    // 	// this.ringSet.buttons.push(this.buttonCycloheptane);
    // 	// this.ringSet.buttons.push(this.buttonCyclooctane);
    // 	// this.ringSet.buttons.push(this.buttonRingArbitrary);
    // };
    // _.makeAttributeSet = function(self) {
    // 	this.buttonChargePlus = new desktop.Button(self.sketcher.id + '_button_attribute_charge_increment', imageDepot.INCREASE_CHARGE, 'Increase Charge [+]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_CHARGE);
    // 		self.sketcher.stateManager.STATE_CHARGE.delta = 1;
    // 	});
    // 	this.buttonChargeMinus = new desktop.Button(self.sketcher.id + '_button_attribute_charge_decrement', imageDepot.DECREASE_CHARGE, 'Decrease Charge [=]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_CHARGE);
    // 		self.sketcher.stateManager.STATE_CHARGE.delta = -1;
    // 	});
    // 	// this.buttonPairPlus = new desktop.Button(self.sketcher.id + '_button_attribute_lonePair_increment', imageDepot.ADD_LONE_PAIR, 'Add Lone Pair', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LONE_PAIR);
    // 	// 	self.sketcher.stateManager.STATE_LONE_PAIR.delta = 1;
    // 	// });
    // 	// this.buttonPairMinus = new desktop.Button(self.sketcher.id + '_button_attribute_lonePair_decrement', imageDepot.REMOVE_LONE_PAIR, 'Remove Lone Pair', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LONE_PAIR);
    // 	// 	self.sketcher.stateManager.STATE_LONE_PAIR.delta = -1;
    // 	// });
    // 	// this.buttonRadicalPlus = new desktop.Button(self.sketcher.id + '_button_attribute_radical_increment', imageDepot.ADD_RADICAL, 'Add Radical', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_RADICAL);
    // 	// 	self.sketcher.stateManager.STATE_RADICAL.delta = 1;
    // 	// });
    // 	// this.buttonRadicalMinus = new desktop.Button(self.sketcher.id + '_button_attribute_radical_decrement', imageDepot.REMOVE_RADICAL, 'Remove Radical', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_RADICAL);
    // 	// 	self.sketcher.stateManager.STATE_RADICAL.delta = -1;
    // 	// });
    //
    // 	// this.attributeSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_attribute');
    // 	// this.attributeSet.toggle = false;
    // 	// this.attributeSet.buttons.push(this.buttonChargePlus);
    // 	// this.attributeSet.buttons.push(this.buttonChargeMinus);
    // 	// this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonPairPlus);
    // 	// this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonPairMinus);
    // 	// this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonRadicalPlus);
    // 	// this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonRadicalMinus);
    // };
    // _.makeShapeSet = function(self) {
    // 	this.buttonArrowSynthetic = new desktop.Button(self.sketcher.id + '_button_shape_arrow_synthetic', imageDepot.ARROW_SYNTHETIC, 'Arrow: [Ctrl+click]', function() {
    // 		self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
    // 		self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_SYNTHETIC;
    // 	});
    // 	// this.buttonArrowRetrosynthetic = new desktop.Button(self.sketcher.id + '_button_shape_arrow_retrosynthetic', imageDepot.ARROW_RETROSYNTHETIC, 'Retrosynthetic Arrow', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
    // 	// 	self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_RETROSYNTHETIC;
    // 	// });
    // 	// this.buttonArrowResonance = new desktop.Button(self.sketcher.id + '_button_shape_arrow_resonance', imageDepot.ARROW_RESONANCE, 'Resonance Arrow', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
    // 	// 	self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_RESONANCE;
    // 	// });
    // 	// this.buttonArrowEquilibrum = new desktop.Button(self.sketcher.id + '_button_shape_arrow_equilibrium', imageDepot.ARROW_EQUILIBRIUM, 'Equilibrium Arrow', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
    // 	// 	self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_EQUILIBRIUM;
    // 	// });
    // 	// this.buttonReactionMapping = new desktop.Button(self.sketcher.id + '_button_reaction_mapping', imageDepot.ATOM_REACTION_MAP, 'Reaction Mapping', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
    // 	// 	self.sketcher.stateManager.STATE_PUSHER.numElectron = -10;
    // 	// });
    // 	// this.buttonPusher1 = new desktop.Button(self.sketcher.id + '_button_shape_pusher_1', imageDepot.PUSHER_SINGLE, 'Single Electron Pusher', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
    // 	// 	self.sketcher.stateManager.STATE_PUSHER.numElectron = 1;
    // 	// });
    // 	// this.buttonPusher2 = new desktop.Button(self.sketcher.id + '_button_shape_pusher_2', imageDepot.PUSHER_DOUBLE, 'Electron Pair Pusher', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
    // 	// 	self.sketcher.stateManager.STATE_PUSHER.numElectron = 2;
    // 	// });
    // 	// this.buttonPusherBond = new desktop.Button(self.sketcher.id + '_button_shape_pusher_bond_forming', imageDepot.PUSHER_BOND_FORMING, 'Bond Forming Pusher', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
    // 	// 	self.sketcher.stateManager.STATE_PUSHER.numElectron = -1;
    // 	// });
    // 	// this.buttonReactionMapping = new desktop.Button(self.sketcher.id + '_button_reaction_mapping', imageDepot.ATOM_REACTION_MAP, 'Reaction Mapping', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
    // 	// 	self.sketcher.stateManager.STATE_PUSHER.numElectron = -10;
    // 	// });
    // 	// this.buttonBracket = new desktop.Button(self.sketcher.id + '_button_shape_charge_bracket', imageDepot.BRACKET_CHARGE, 'Bracket', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
    // 	// 	self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.BRACKET;
    // 	// 	self.sketcher.repaint();
    // 	// });
    // 	// this.buttonDynamicBracket = new desktop.Button(self.sketcher.id + '_button_bracket_dynamic', imageDepot.BRACKET_DYNAMIC, 'Repeating Group', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_DYNAMIC_BRACKET);
    // 	// });
    // 	// this.buttonVAP = new desktop.Button(self.sketcher.id + '_button_vap', imageDepot.VARIABLE_ATTACHMENT_POINTS, 'Variable Attachment Points', function() {
    // 	// 	self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_VAP);
    // 	// });
    // 	// this.buttonShape = new desktop.DummyButton(self.sketcher.id + '_button_shape', 'Shapes');
    // 	// this.shapeSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_shape');
    // 	// this.shapeSet.buttons.push(this.buttonShape);
    // 	// this.shapeSet.addDropDown('More Shapes');
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowSynthetic);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowRetrosynthetic);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowResonance);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowEquilibrum);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusher1);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusher2);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusherBond);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonReactionMapping);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonBracket);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonDynamicBracket);
    // 	// this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonVAP);
    // };

})(Chemio, Chemio.io, Chemio.structures, Chemio.uis.actions, Chemio.uis.gui, Chemio.uis.gui.imageDepot, Chemio.uis.gui.desktop, Chemio.uis.tools, Chemio.uis.states, document);
