(function(c, math, monitor, actions, states, structures, SYMBOLS, m, m4, undefined) {
    'use strict';
    states._State3D = function() {
    };
    let _ = states._State3D.prototype;
    _.setup = function(editor) {
        this.editor = editor;
    };

    _.enter = function() {
        if (this.innerenter) {
            this.innerenter();
        }
    };
    _.exit = function() {
        if (this.innerexit) {
            this.innerexit();
        }
    };
    _.click = function(e) {
        if (this.innerclick) {
            this.innerclick(e);
        }
    };
    _.rightclick = function(e) {
        if (this.innerrightclick) {
            this.innerrightclick(e);
        }
    };
    _.dblclick = function(e) {
        if (this.innerdblclick) {
            this.innerdblclick(e);
        }
    };
    _.mousedown = function(e) {
        this.editor.defaultmousedown(e);
        // must also check for mobile hits here to the help button
        if (this.editor.isHelp || this.editor.isMobile && e.p.distance(new structures.Point(this.editor.width - 20, 20)) < 10) {
            this.editor.isHelp = false;
            this.editor.lastPoint = undefined;
            this.editor.repaint();
            // window.open doesn't work once Event.preventDefault() has been called
            location.href='https://web.chemdoodle.com/demos/3d-editor';
            //window.open('https://web.chemdoodle.com/demos/3d-editor');
        } else if (this.innermousedown) {
            this.innermousedown(e);
        }
    };
    _.rightmousedown = function(e) {
        if (this.innerrightmousedown) {
            this.innerrightmousedown(e);
        }
        this.editor.defaultrightmousedown(e);
    };
    _.mousemove = function(e) {
        if (this.innermousemove) {
            this.innermousemove(e);
        }
        // call the repaint here to repaint the help button, also this is called
        // by other functions, so the repaint must be here
        this.editor.repaint();
    };
    _.mouseout = function(e) {
        if (this.innermouseout) {
            this.innermouseout(e);
        }
    };
    _.mouseover = function(e) {
        if (this.innermouseover) {
            this.innermouseover(e);
        }
    };
    _.mouseup = function(e) {
        if (this.innermouseup) {
            this.innermouseup(e);
        }
        this.editor.defaultmouseup(e);
    };
    _.rightmouseup = function(e) {
        if (this.innerrightmouseup) {
            this.innerrightmouseup(e);
        }
    };
    _.mousewheel = function(e, delta) {
        if (this.innermousewheel) {
            this.innermousewheel(e);
        } else {
            this.editor.defaultmousewheel(e, delta);
        }
    };
    _.drag = function(e) {
        if (this.innerdrag) {
            this.innerdrag(e);
        } else {
            this.editor.defaultdrag(e);
        }
    };
    _.keydown = function(e) {
        if (monitor.META) {
            if (e.which === 90) {
                // z
                this.editor.historyManager.undo();
            } else if (e.which === 89) {
                // y
                this.editor.historyManager.redo();
            } else if (e.which === 83) {
                // s
                this.editor.toolbarManager.buttonSave.func();
            } else if (e.which === 79) {
                // o
                this.editor.toolbarManager.buttonOpen.func();
            } else if (e.which === 187 || e.which === 61) {
                // +
                this.editor.toolbarManager.buttonScalePlus.func();
            } else if (e.which === 189 || e.which === 109) {
                // -
                this.editor.toolbarManager.buttonScaleMinus.func();
            }
        }
        if (this.innerkeydown) {
            this.innerkeydown(e);
        }
    };
    _.keypress = function(e) {
        if (this.innerkeypress) {
            this.innerkeypress(e);
        }
    };
    _.keyup = function(e) {
        if (this.innerkeyup) {
            this.innerkeyup(e);
        }
    };

})(ChemDoodle, ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.SYMBOLS, Math, ChemDoodle.lib.mat4);
(function(actions, states, structures, d3, q, undefined) {
    'use strict';
    states.MeasureState3D = function(editor) {
        this.setup(editor);
        this.selectedAtoms = [];
    };
    let _ = states.MeasureState3D.prototype = new states._State3D();
    _.numToSelect = 2;

    _.reset = function(){
        for(let i = 0, ii = this.selectedAtoms.length; i<ii; i++){
            this.selectedAtoms[i].isSelected = false;
        }
        this.selectedAtoms = [];
        this.editor.repaint();
    };
    _.innerenter = function(e) {
        this.reset();
    };
    _.innerexit = function(e) {
        this.reset();
    };
    _.innermousemove = function(e) {
        if (this.hoveredAtom) {
            this.hoveredAtom.isHover = false;
            this.hoveredAtom = undefined;
        }
        let obj = this.editor.pick(e.p.x, e.p.y, true, false);
        if (obj && obj instanceof structures.Atom) {
            this.hoveredAtom = obj;
            obj.isHover = true;
        }
        this.editor.repaint();
    };
    _.innermousedown = function(e) {
        // don't use click as that doesn't work on android
        if(this.editor.isMobile){
            this.innermousemove(e);
        }
        if (this.hoveredAtom) {
            this.hoveredAtom.isHover = false;
            if (this.hoveredAtom.isSelected) {
                let a = this.hoveredAtom;
                this.selectedAtoms = q.grep(this.selectedAtoms, function(value) {
                    return value !== a;
                });
            } else {
                this.selectedAtoms.push(this.hoveredAtom);
            }
            this.hoveredAtom.isSelected = !this.hoveredAtom.isSelected;
            this.hoveredAtom = undefined;
            this.editor.repaint();
        }
        if (this.selectedAtoms.length === this.numToSelect) {
            let shape;
            switch(this.numToSelect){
                case 2:
                    shape = new d3.Distance(this.selectedAtoms[0], this.selectedAtoms[1]);
                    break;
                case 3:
                    shape = new d3.Angle(this.selectedAtoms[0], this.selectedAtoms[1], this.selectedAtoms[2]);
                    break;
                case 4:
                    shape = new d3.Torsion(this.selectedAtoms[0], this.selectedAtoms[1], this.selectedAtoms[2], this.selectedAtoms[3]);
                    break;
            }
            this.reset();
            if(shape){
                this.editor.historyManager.pushUndo(new actions.AddShapeAction(this.editor, shape));
            }
        }
    };

})(ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.lib.jQuery);
(function(states, undefined) {
    'use strict';
    states.ViewState3D = function(editor) {
        this.setup(editor);
    };
    let _ = states.ViewState3D.prototype = new states._State3D();

})(ChemDoodle.uis.states);
(function(states, undefined) {
    'use strict';
    states.StateManager3D = function(editor) {
        this.STATE_VIEW = new states.ViewState3D(editor);
        this.STATE_MEASURE = new states.MeasureState3D(editor);
        let currentState = this.STATE_VIEW;
        this.setState = function(nextState) {
            if (nextState !== currentState) {
                currentState.exit();
                currentState = nextState;
                currentState.enter();
            }
        };
        this.getCurrentState = function() {
            return currentState;
        };
    };

})(ChemDoodle.uis.states);
(function(c, iChemLabs, io, structures, actions, gui, imageDepot, desktop, tools, states, q, document, undefined) {
    'use strict';
    gui.ToolbarManager3D = function(editor) {
        this.editor = editor;

        // open
        this.buttonOpen = new desktop.Button(editor.id + '_button_open', imageDepot.OPEN, 'Open', function() {
            editor.dialogManager.openPopup.show();
        });
        // save
        this.buttonSave = new desktop.Button(editor.id + '_button_save', imageDepot.SAVE, 'Save', function() {
            if (editor.useServices) {
                editor.dialogManager.saveDialog.clear();
            } else {
                editor.dialogManager.saveDialog.getTextArea().val(c.writeMOL(editor.molecules[0]));
            }
            editor.dialogManager.saveDialog.open();
        });
        // search
        this.buttonSearch = new desktop.Button(editor.id + '_button_search', imageDepot.SEARCH, 'Search', function() {
            editor.dialogManager.searchDialog.open();
        });
        // calculate
        this.buttonCalculate = new desktop.Button(editor.id + '_button_calculate', imageDepot.CALCULATE, 'Calculate', function() {
            let mol = editor.molecules[0];
            if (mol) {
                iChemLabs.calculate(mol, {
                    descriptors : [ 'mf', 'ef', 'mw', 'miw', 'deg_unsat', 'hba', 'hbd', 'rot', 'electron', 'pol_miller', 'cmr', 'tpsa', 'vabc', 'xlogp2', 'bertz' ]
                }, function(content) {
                    let sb = [];
                    function addDatum(title, value, unit) {
                        sb.push(title);
                        sb.push(': ');
                        for ( let i = title.length + 2; i < 30; i++) {
                            sb.push(' ');
                        }
                        sb.push(value);
                        sb.push(' ');
                        sb.push(unit);
                        sb.push('\n');
                    }
                    addDatum('Molecular Formula', content.mf, '');
                    addDatum('Empirical Formula', content.ef, '');
                    addDatum('Molecular Mass', content.mw, 'amu');
                    addDatum('Monoisotopic Mass', content.miw, 'amu');
                    addDatum('Degree of Unsaturation', content.deg_unsat, '');
                    addDatum('Hydrogen Bond Acceptors', content.hba, '');
                    addDatum('Hydrogen Bond Donors', content.hbd, '');
                    addDatum('Rotatable Bonds', content.rot, '');
                    addDatum('Total Electrons', content.rot, '');
                    addDatum('Molecular Polarizability', content.pol_miller, 'A^3');
                    addDatum('Molar Refractivity', content.cmr, 'cm^3/mol');
                    addDatum('Polar Surface Area', content.tpsa, 'A^2');
                    addDatum('vdW Volume', content.vabc, 'A^3');
                    addDatum('logP', content.xlogp2, '');
                    addDatum('Complexity', content.bertz, '');
                    editor.dialogManager.calculateDialog.getTextArea().val(sb.join(''));
                    editor.dialogManager.calculateDialog.open();
                });
            }
        });

        // transform
        this.buttonTransform = new desktop.Button(editor.id + '_button_transform', imageDepot.PERSPECTIVE, 'Transform', function() {
            editor.stateManager.setState(editor.stateManager.STATE_VIEW);
        });
        this.buttonTransform.toggle = true;

        // visual specifications
        this.buttonSettings = new desktop.Button(editor.id + '_button_specifications', imageDepot.SETTINGS, 'Visual Specifications', function() {
            editor.dialogManager.stylesDialog.update(editor.styles);
            editor.dialogManager.stylesDialog.open();
        });

        // animations
        this.buttonAnimation = new desktop.Button(editor.id + '_button_animation', imageDepot.ANIMATION, 'Animations', function() {
            editor.stateManager.setState(editor.stateManager.STATE_MOVE);
        });

        // clear
        this.buttonClear = new desktop.Button(editor.id + '_button_clear', imageDepot.CLEAR, 'Clear', function() {
            editor.historyManager.pushUndo(new actions.ClearAction(editor));
        });
        // clean
        this.buttonClean = new desktop.Button(editor.id + '_button_clean', imageDepot.OPTIMIZE, 'Clean', function() {
            let mol = editor.molecules[0];
            if (mol) {
                iChemLabs.optimize(mol, {
                    dimension : 3
                }, function(mol) {
                    editor.historyManager.pushUndo(new actions.SwitchMoleculeAction(editor, mol));
                });
            }
        });

        // scale set
        this.makeScaleSet(this);

        // history set
        this.makeHistorySet(this);

        // history set
        this.makeMeasurementsSet(this);
    };
    let _ = gui.ToolbarManager3D.prototype;
    _.write = function() {
        let sb = [ '<div style="font-size:10px;">' ];
        let bg = this.editor.id + '_main_group';
        sb.push(this.historySet.getSource());
        sb.push(this.scaleSet.getSource());
        sb.push(this.buttonOpen.getSource());
        sb.push(this.buttonSave.getSource());
        if (this.editor.useServices) {
            sb.push(this.buttonSearch.getSource());
            sb.push(this.buttonCalculate.getSource());
        }
        sb.push('<br>');
        sb.push(this.buttonTransform.getSource(bg));
        sb.push(this.buttonSettings.getSource());
        //sb.push(this.buttonAnimation.getSource());
        sb.push(this.measurementsSet.getSource(bg));
        sb.push(this.buttonClear.getSource());
        if (this.editor.useServices) {
            sb.push(this.buttonClean.getSource());
        }
        sb.push('</div>');

        if (document.getElementById(this.editor.id)) {
            let canvas = q('#' + this.editor.id);
            canvas.before(sb.join(''));
        } else {
            document.write(sb.join(''));
        }
    };
    _.setup = function() {
        this.buttonTransform.setup(true);
        this.buttonSettings.setup();
        //this.buttonAnimation.setup();
        this.measurementsSet.setup();
        this.buttonClear.setup();
        if (this.editor.useServices) {
            this.buttonClean.setup();
        }
        this.historySet.setup();
        this.scaleSet.setup();
        this.buttonOpen.setup();
        this.buttonSave.setup();
        if (this.editor.useServices) {
            this.buttonSearch.setup();
            this.buttonCalculate.setup();
        }

        this.buttonTransform.getElement().click();
        this.buttonUndo.disable();
        this.buttonRedo.disable();
    };

    _.makeScaleSet = function(self) {
        this.scaleSet = new desktop.ButtonSet(self.editor.id + '_buttons_scale');
        this.scaleSet.toggle = false;
        this.buttonScalePlus = new desktop.Button(self.editor.id + '_button_scale_plus', imageDepot.ZOOM_IN, 'Increase Scale', function() {
            self.editor.mousewheel(null, -10);
        });
        this.scaleSet.buttons.push(this.buttonScalePlus);
        this.buttonScaleMinus = new desktop.Button(self.editor.id + '_button_scale_minus', imageDepot.ZOOM_OUT, 'Decrease Scale', function() {
            self.editor.mousewheel(null, 10);
        });
        this.scaleSet.buttons.push(this.buttonScaleMinus);
    };
    _.makeHistorySet = function(self) {
        this.historySet = new desktop.ButtonSet(self.editor.id + '_buttons_history');
        this.historySet.toggle = false;
        this.buttonUndo = new desktop.Button(self.editor.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
            self.editor.historyManager.undo();
        });
        this.historySet.buttons.push(this.buttonUndo);
        this.buttonRedo = new desktop.Button(self.editor.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
            self.editor.historyManager.redo();
        });
        this.historySet.buttons.push(this.buttonRedo);
    };
    _.makeMeasurementsSet = function(self) {
        this.measurementsSet = new desktop.ButtonSet(self.editor.id + '_buttons_measurements');
        this.buttonDistance = new desktop.Button(self.editor.id + '_button_distance', imageDepot.DISTANCE, 'Distance', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 2;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonDistance);
        this.buttonAngle = new desktop.Button(self.editor.id + '_button_angle', imageDepot.ANGLE, 'Angle', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 3;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonAngle);
        this.buttonTorsion = new desktop.Button(self.editor.id + '_button_torsion', imageDepot.TORSION, 'Torsion', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 4;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonTorsion);
    };

})(ChemDoodle, ChemDoodle.iChemLabs, ChemDoodle.io, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.gui, ChemDoodle.uis.gui.imageDepot, ChemDoodle.uis.gui.desktop, ChemDoodle.uis.tools, ChemDoodle.uis.states, ChemDoodle.lib.jQuery, document);
(function (c, featureDetection, d3, sketcherPack, structures, tools, q, m, m4, window, undefined) {
    'use strict';
    c.EditorCanvas3D = function (id, width, height, options) {
        // keep checks to undefined here as these are booleans
        this.isMobile = options.isMobile === undefined ? featureDetection.supports_touch() : options.isMobile;
        this.useServices = options.useServices === undefined ? false : options.useServices;
        this.includeToolbar = options.includeToolbar === undefined ? true : options.includeToolbar;
        this.oneMolecule = true;
        // toolbar manager needs the editor id to make it unique to this
        // canvas
        this.id = id;
        this.toolbarManager = new sketcherPack.gui.ToolbarManager3D(this);
        if (this.includeToolbar) {
            this.toolbarManager.write();
            // If pre-created, wait until the last button image loads before
            // calling setup.
            let self = this;
            if (document.getElementById(this.id)) {
                q('#' + id + '_button_calculate').load(function () {
                    self.toolbarManager.setup();
                });
            } else {
                q(window).load(function () {
                    self.toolbarManager.setup();
                });
            }
            this.dialogManager = new sketcherPack.gui.DialogManager(this);
        }
        this.stateManager = new sketcherPack.states.StateManager3D(this);
        this.historyManager = new sketcherPack.actions.HistoryManager(this);
        if (id) {
            this.create(id, width, height);
        }
        // styles for draw "help" atom
        let helpSpecs = new structures.Styles();
        helpSpecs.atoms_useVDWDiameters_3D = false;
        helpSpecs.atoms_sphereDiameter_3D = 2;
        this.helpButton = new structures.Atom('C', 0, 0, 0);
        this.helpButton.isHover = true;
        this.helpButton.styles = helpSpecs;
        this.styles.backgroundColor = '#000';
        this.styles.shapes_color = '#fff';
        this.isHelp = false;
        this.setupScene();
        this.repaint();
    };
    let _ = c.EditorCanvas3D.prototype = new c._Canvas3D();
    // saves of default behavior
    _.defaultmousedown = _.mousedown;
    _.defaultmouseup = _.mouseup;
    _.defaultrightmousedown = _.rightmousedown;
    _.defaultdrag = _.drag;
    _.defaultmousewheel = _.mousewheel;
    _.drawChildExtras = function (gl) {

        // NOTE: gl and this.gl is same object because "EditorCanvas3D" inherit
        // from "_Canvas3D"

        gl.disable(gl.DEPTH_TEST);

        let translationMatrix = m4.create();

        let height = this.height / 20;
        let tanTheta = m.tan(this.styles.projectionPerspectiveVerticalFieldOfView_3D / 360 * m.PI);
        let depth = height / tanTheta;
        let near = m.max(depth - height, 0.1);
        let far = depth + height;
        let aspec = this.width / this.height;

        let nearRatio = depth / this.height * tanTheta;
        let top = tanTheta * depth;
        let bottom = -top;
        let left = aspec * bottom;
        let right = aspec * top;

        let projectionMatrix = m4.ortho(left, right, bottom, top, near, far, []);

        this.phongShader.useShaderProgram(gl);

        this.phongShader.setProjectionMatrix(gl, projectionMatrix);

        this.phongShader.setFogMode(gl, 0);

        if (!this.hideHelp) {
            // help and tutorial

            let posX = (this.width - 40) * nearRatio;
            let posY = (this.height - 40) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);

            // setting "help" button color
            gl.material.setTempColors(gl, this.styles.bonds_materialAmbientColor_3D, undefined, this.styles.bonds_materialSpecularColor_3D, this.styles.bonds_materialShininess_3D);
            gl.material.setDiffuseColor(gl, '#00ff00');

            // this "gl.modelViewMatrix" must be set because it used by Atom
            // when rendered
            gl.modelViewMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);

            this.phongShader.enableAttribsArray(gl);

            gl.sphereBuffer.bindBuffers(this.gl);
            this.helpButton.render(gl, undefined, true);
            if (this.isHelp) {
                gl.sphereBuffer.bindBuffers(gl);
                // colors
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.material.setTempColors(gl, '#000000', undefined, '#000000', 0);
                gl.enable(gl.BLEND);
                gl.depthMask(false);
                gl.material.setAlpha(gl, .4);
                this.helpButton.renderHighlight(gl, undefined);
                gl.depthMask(true);
                gl.disable(gl.BLEND);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }

            this.phongShader.disableAttribsArray(gl);

            gl.flush();

            // enable blend and depth mask set to false
            gl.enable(gl.BLEND);
            gl.depthMask(false);

            this.labelShader.useShaderProgram(gl);
            this.labelShader.setProjectionMatrix(gl, projectionMatrix);

            this.textTextImage.updateFont(this.gl, 14.1, ['sans-serif'], false, false, true);

            let modelMatrix = m4.multiply(translationMatrix, m4.identity([]), []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.labelShader.enableAttribsArray(gl);

            this.renderText('?', [0, 0, 0]);

            this.labelShader.disableAttribsArray(gl);

            // disable blend and depth mask set to true
            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }

        if (!this.paidToHideTrademark) {
            // You must keep this name displayed at all times to abide by the license
            // Contact us for permission to remove it,
            // http://www.ichemlabs.com/contact-us
            let x = '\x43\x68\x65\x6D\x44\x6F\x6F\x64\x6C\x65';

            // enable blend for transparancy
            gl.enable(this.gl.BLEND);

            this.labelShader.useShaderProgram(gl);
            this.labelShader.setProjectionMatrix(gl, projectionMatrix);

            this.labelShader.enableAttribsArray(gl);
            // Draw the copyright logo and trademark
            this.textTextImage.updateFont(gl, 14.1, ['sans-serif'], false, false, true);

            let width = this.textTextImage.textWidth(x)/this.pixelRatio;

            let posX = (this.width - width - 30) * nearRatio;
            let posY = (-this.height + 24) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);
            let modelMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.renderText(x, [0, 0, 0]);

            // Draw the (R) part
            posX = (this.width - 18) * nearRatio;
            posY = (-this.height + 30) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);
            modelMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.textTextImage.updateFont(gl, 10, ['sans-serif'], false, false, true);

            this.renderText('\u00AE', [0, 0, 0]);

            // disable vertex for draw text
            this.labelShader.disableAttribsArray(gl);

            // disable blend
            gl.disable(gl.BLEND);
            gl.flush();
        }

        gl.enable(gl.DEPTH_TEST);
    };
    _.checksOnAction = function (force) {
        // using force improves efficiency, so changes will not be checked
        // until a render occurs
        // you can force a check by sending true to this function after
        // calling check with a false
        if (force && this.doChecks) {

        }
        this.doChecks = !force;
    };
    // desktop events
    _.click = function (e) {
        this.stateManager.getCurrentState().click(e);
    };
    _.rightclick = function (e) {
        this.stateManager.getCurrentState().rightclick(e);
    };
    _.dblclick = function (e) {
        this.stateManager.getCurrentState().dblclick(e);
    };
    _.mousedown = function (e) {
        this.stateManager.getCurrentState().mousedown(e);
    };
    _.rightmousedown = function (e) {
        this.stateManager.getCurrentState().rightmousedown(e);
    };
    _.mousemove = function (e) {
        this.isHelp = false;
        if (e.p.distance(new structures.Point(this.width - 20, 20)) < 10) {
            this.isHelp = true;
        }
        this.stateManager.getCurrentState().mousemove(e);
    };
    _.mouseout = function (e) {
        this.stateManager.getCurrentState().mouseout(e);
    };
    _.mouseover = function (e) {
        this.stateManager.getCurrentState().mouseover(e);
    };
    _.mouseup = function (e) {
        this.stateManager.getCurrentState().mouseup(e);
    };
    _.rightmouseup = function (e) {
        this.stateManager.getCurrentState().rightmouseup(e);
    };
    _.mousewheel = function (e, delta) {
        this.stateManager.getCurrentState().mousewheel(e, delta);
    };
    _.drag = function (e) {
        this.stateManager.getCurrentState().drag(e);
    };
    _.keydown = function (e) {
        this.stateManager.getCurrentState().keydown(e);
    };
    _.keypress = function (e) {
        this.stateManager.getCurrentState().keypress(e);
    };
    _.keyup = function (e) {
        this.stateManager.getCurrentState().keyup(e);
    };

})(ChemDoodle, ChemDoodle.featureDetection, ChemDoodle.structures.d3, ChemDoodle.uis, ChemDoodle.structures, ChemDoodle.uis.tools, ChemDoodle.lib.jQuery, Math, ChemDoodle.lib.mat4, window);
