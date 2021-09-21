// Sketcher canvas
(function(c, extensions, featureDetection, sketcherPack, structures, d2, tools, m, window, undefined) {
    'use strict';
    c.SketcherCanvas = function(id, width, height, options) {
        // save the original options object
        options = options === undefined ? {} : options;
        this.originalOptions = options;
        // keep checks to undefined here as these are booleans
        this.isMobile = options.isMobile === undefined ? featureDetection.supports_touch() : options.isMobile;
        this.useServices = options.useServices === undefined ? false : options.useServices;
        this.requireStartingAtom = options.requireStartingAtom === undefined ? false : options.requireStartingAtom;
        this.includeToolbar = options.includeToolbar === undefined ? true : options.includeToolbar;
        this.resizable = options.resizable === undefined ? false : options.resizable;
        this.includeQuery = options.includeQuery === undefined ? false : options.includeQuery;
        this.hideHelp = options.hideHelp === undefined ? true : options.hideHelp;
        // toolbar manager needs the sketcher id to make it unique to this
        // canvas, width and height
        this.init(id, width, height);
        this.toolbarManager = new sketcherPack.gui.ToolbarManager(this);
        if (this.includeToolbar) {
            this.toolbarManager.write();
            let self = this;
            document.addEventListener("DOMContentLoaded", function() {
                self.toolbarManager.setup();
            });
            this.dialogManager = {}; //new sketcherPack.gui.DialogManager(this);
        }
        // if(sketcherPack.gui.desktop.TextInput){
        //     this.textInput = new sketcherPack.gui.desktop.TextInput(this, this.id+'_textInput');
        // }
        this.stateManager = new sketcherPack.states.StateManager(this);
        this.historyManager = new sketcherPack.actions.HistoryManager(this);
        this.copyPasteManager = new sketcherPack.CopyPasteManager(this);

        if (id) {
            this.create(id, width, height);
        }

        // styles is now created and available
        this.styles.atoms_circleDiameter_2D = 7;
        this.styles.atoms_circleBorderWidth_2D = 0;
        this.isHelp = false;
        this.lastPinchScale = 1;
        this.lastGestureRotate = 0;
        this.inGesture = false;
        this.startAtom = new structures.Atom('C', -10, -10);
        this.startAtom.isLone = true;
        this.lasso = new tools.Lasso(this);
        // TODO remove jquery dependece
        // if(this.resizable){
        //     let jqsk = q('#'+this.id);
        //     let self = this;
        //     jqsk.resizable({
        //         resize: function( event, ui ) {
        //             self.resize(jqsk.innerWidth(), jqsk.innerHeight());
        //         }
        //     });
        // }
    };
    let _ = c.SketcherCanvas.prototype = new c._Canvas();
    _.drawSketcherDecorations = function(ctx, styles) {
        ctx.save();
        ctx.translate(this.width / 2, this.height / 2);
        ctx.rotate(styles.rotateAngle);
        ctx.scale(styles.scale, styles.scale);
        ctx.translate(-this.width / 2, -this.height / 2);
        // draw hovering
        if (this.hovering) {
            this.hovering.drawDecorations(ctx, styles);
        }
        if (this.startAtom && this.startAtom.x != -10 && !this.isMobile) {
            this.startAtom.draw(ctx, styles);
        }
        if (this.tempAtom) {
            ctx.strokeStyle = styles.colorPreview;
            ctx.fillStyle = styles.colorPreview;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.hovering.x, this.hovering.y);
            ctx.lineTo(this.tempAtom.x, this.tempAtom.y);
            ctx.setLineDash([2]);
            ctx.stroke();
            ctx.setLineDash([]);
            if (this.tempAtom.label === 'C') {
                ctx.beginPath();
                ctx.arc(this.tempAtom.x, this.tempAtom.y, 3, 0, m.PI * 2, false);
                ctx.fill();
            }else{
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = extensions.getFontString(styles.atoms_font_size_2D, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
                ctx.fillText(this.tempAtom.label, this.tempAtom.x, this.tempAtom.y);
            }
            if (this.tempAtom.isOverlap) {
                ctx.strokeStyle = styles.colorError;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(this.tempAtom.x, this.tempAtom.y, 7, 0, m.PI * 2, false);
                ctx.stroke();
            }
        }
        if (this.tempRing) {
            ctx.strokeStyle = styles.colorPreview;
            ctx.fillStyle = styles.colorPreview;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (this.hovering instanceof structures.Atom) {
                ctx.moveTo(this.hovering.x, this.hovering.y);
                ctx.lineTo(this.tempRing[0].x, this.tempRing[0].y);
                for ( let i = 1, ii = this.tempRing.length; i < ii; i++) {
                    ctx.lineTo(this.tempRing[i].x, this.tempRing[i].y);
                }
                ctx.lineTo(this.hovering.x, this.hovering.y);
            } else if (this.hovering instanceof structures.Bond) {
                let start = this.hovering.a2;
                let end = this.hovering.a1;
                if (this.tempRing[0] === this.hovering.a1) {
                    start = this.hovering.a1;
                    end = this.hovering.a2;
                }
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(this.tempRing[1].x, this.tempRing[1].y);
                for ( let i = 2, ii = this.tempRing.length; i < ii; i++) {
                    ctx.lineTo(this.tempRing[i].x, this.tempRing[i].y);
                }
                ctx.lineTo(end.x, end.y);
            }
            ctx.setLineDash([2]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = styles.colorError;
            ctx.lineWidth = 1.2;
            for ( let i = 0, ii = this.tempRing.length; i < ii; i++) {
                if (this.tempRing[i].isOverlap) {
                    ctx.beginPath();
                    ctx.arc(this.tempRing[i].x, this.tempRing[i].y, 7, 0, m.PI * 2, false);
                    ctx.stroke();
                }
            }
            // arbitrary ring size number
            if(this.stateManager.STATE_NEW_RING.numSides===-1){
                let midx = 0;
                let midy = 0;
                if (this.hovering instanceof structures.Atom) {
                    midx+=this.hovering.x;
                    midy+=this.hovering.y;
                } else if (this.hovering instanceof structures.Bond) {
                    let start = this.hovering.a1;
                    if (this.tempRing[0] === this.hovering.a1) {
                        start = this.hovering.a2;
                    }
                    midx+=start.x;
                    midy+=start.y;
                }
                let ii = this.tempRing.length;
                for ( let i = 0; i < ii; i++) {
                    midx += this.tempRing[i].x;
                    midy += this.tempRing[i].y;
                }
                ii++;
                midx /= ii;
                midy /= ii;
                ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText(ii, midx, midy);
            }
        }
        if (this.tempChain && this.tempChain.length>0) {
            ctx.strokeStyle = styles.colorPreview;
            ctx.fillStyle = styles.colorPreview;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.hovering.x, this.hovering.y);
            ctx.lineTo(this.tempChain[0].x, this.tempChain[0].y);
            for ( let i = 1, ii = this.tempChain.length; i < ii; i++) {
                ctx.lineTo(this.tempChain[i].x, this.tempChain[i].y);
            }
            ctx.setLineDash([2]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = styles.colorError;
            ctx.lineWidth = 1.2;
            for ( let i = 0, ii = this.tempChain.length; i < ii; i++) {
                if (this.tempChain[i].isOverlap) {
                    ctx.beginPath();
                    ctx.arc(this.tempChain[i].x, this.tempChain[i].y, 7, 0, m.PI * 2, false);
                    ctx.stroke();
                }
            }
            ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            let size = this.tempChain.length;
            ctx.fillStyle = 'black';
            ctx.fillText(size, this.tempChain[size-1].x+10, this.tempChain[size-1].y-10);
        }
        if (this.tempTemplate) {
            if(this.tempTemplate.atoms.length>0){
                let spec1 = styles.atoms_color;
                let spec2 = styles.atoms_useJMOLColors;
                let spec3 = styles.atoms_usePYMOLColors;
                let spec4 = styles.bonds_color;
                let spec5 = styles.atoms_HBlack_2D;
                styles.atoms_color = styles.colorPreview;
                styles.atoms_useJMOLColors = false;
                styles.atoms_usePYMOLColors = false;
                styles.bonds_color = styles.colorPreview;
                styles.atoms_HBlack_2D = false;
                this.tempTemplate.draw(ctx, styles);
                styles.atoms_color = spec1;
                styles.atoms_useJMOLColors = spec2;
                styles.atoms_usePYMOLColors = spec3;
                styles.bonds_color = spec4;
                styles.atoms_HBlack_2D = spec5;
            }
            ctx.strokeStyle = styles.colorError;
            ctx.lineWidth = 1.2;
            for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                let mol = this.molecules[i];
                for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let a = mol.atoms[j];
                    if (a.isOverlap) {
                        ctx.beginPath();
                        ctx.arc(a.x, a.y, 7, 0, m.PI * 2, false);
                        ctx.stroke();
                    }
                }
            }
        }
        if (this.lasso) {
            this.lasso.draw(ctx, styles);
        }
        if (this.stateManager.getCurrentState().draw) {
            this.stateManager.getCurrentState().draw(ctx, styles);
        }
        ctx.restore();
    };
    _.checksOnAction = function(force){
        // using force improves efficiency, so changes will not be checked
        // until a render occurs
        // you can force a check by sending true to this function after
        // calling check with a false
        // if (force && this.doChecks) {
        //     // setup data for atom mappings
        //     let arrow;
        //     let mappings = [];
        //     let brackets = [];
        //     let vaps = [];
        //     for(let i = 0, ii = this.shapes.length; i<ii; i++){
        //         let s = this.shapes[i];
        //         if(s instanceof d2.Line && !arrow) {
        //             // make sure arrow isn't defined, just to make sure we use the first arrow
        //             arrow = s;
        //         }
        //         else if(s instanceof d2.AtomMapping){
        //             s.error = false;
        //             mappings.push(s);
        //         }else if(s instanceof d2.Line && !arrow){
        //             // make sure arrow isn't defined, just to make sure we use the first arrow
        //             arrow = s;
        //         }else if(s instanceof d2.DynamicBracket){
        //             s.error = false;
        //             brackets.push(s);
        //         }else if(s instanceof d2.VAP){
        //             s.error = false;
        //             vaps.push(s);
        //         }
        //     }
        //     for(let i = 0, ii = mappings.length; i<ii; i++){
        //         let si = mappings[i];
        //         si.label = (i+1).toString();
        //         for(let j = i+1, jj = mappings.length; j<jj; j++){
        //             let sj = mappings[j];
        //             if(si.o1===sj.o1 || si.o2===sj.o1 || si.o1===sj.o2 || si.o2===sj.o2){
        //                 si.error = true;
        //                 sj.error = true;
        //             }
        //         }
        //         // different labels
        //         if(!si.error && si.o1.label !== si.o2.label){
        //             si.error = true;
        //         }
        //         // same structure
        //         if(!si.error && this.getMoleculeByAtom(si.o1) === this.getMoleculeByAtom(si.o2)){
        //             si.error = true;
        //         }
        //     }
        //
        //     if(brackets.length!==0){
        //         let allAs = this.getAllAtoms();
        //         for(let i = 0, ii = allAs.length; i<ii; i++){
        //             allAs[i].inBracket = false;
        //         }
        //         for(let i = 0, ii = brackets.length; i<ii; i++){
        //             let si = brackets[i];
        //             si.setContents(this);
        //             if(si.contents.length===0){
        //                 // user error
        //                 si.error = true;
        //             }else{
        //                 for(let j = 0, jj = si.contents.length; j<jj; j++){
        //                     if(si.contents[j].inBracket){
        //                         si.error = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //             for(let j = 0, jj = si.contents.length; j<jj; j++){
        //                 si.contents[j].inBracket = true;
        //             }
        //         }
        //     }
        //
        //     for(let i = 0, ii = vaps.length; i<ii; i++){
        //         let vap = vaps[i];
        //         if(!vap.substituent){
        //             // no substituent
        //             vap.error = true;
        //         }else if(vap.attachments.length===0){
        //             // no attachments
        //             vap.error = true;
        //         }
        //         if(!vap.error){
        //             // check that all attachments are part of the same molecule
        //             let m = this.getMoleculeByAtom(vap.attachments[0]);
        //             vap.substituent.present = undefined;
        //             for(let j = 0, jj = m.atoms.length; j<jj; j++){
        //                 m.atoms[j].present = true;
        //             }
        //             // also make sure the substituent is NOT part of the same molecule
        //             if(vap.substituent.present){
        //                 vap.error = true;
        //             }
        //             if(!vap.error){
        //                 for(let j = 0, jj = vap.attachments.length; j<jj; j++){
        //                     if(!vap.attachments[j].present){
        //                         vap.error = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //             for(let j = 0, jj = m.atoms.length; j<jj; j++){
        //                 m.atoms[j].present = undefined;
        //             }
        //         }
        //     }
        // }
        this.doChecks = !force;
    };
    _.drawChildExtras = function(ctx, styles) {
        this.drawSketcherDecorations(ctx, styles);
        if (!this.hideHelp) {
            // help and tutorial
            let helpPos = new structures.Point(this.width - 20, 20);
            let radgrad = ctx.createRadialGradient(helpPos.x, helpPos.y, 10, helpPos.x, helpPos.y, 2);
            radgrad.addColorStop(0, '#00680F');
            radgrad.addColorStop(1, '#01DF01');
            ctx.fillStyle = radgrad;
            ctx.beginPath();
            ctx.arc(helpPos.x, helpPos.y, 10, 0, m.PI * 2, false);
            ctx.fill();
            ctx.lineWidth = 2;
            if (this.isHelp) {
                ctx.strokeStyle = styles.colorHover;
                ctx.stroke();
            }
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '14px sans-serif';
            ctx.strokeText('?', helpPos.x, helpPos.y);
            ctx.fillText('?', helpPos.x, helpPos.y);
        }
        if (!this.paidToHideTrademark) {
            // You must keep this name displayed at all times to abide by the license
            // Contact us for permission to remove it,
            // http://www.ichemlabs.com/contact-us
            ctx.font = '14px sans-serif';
            let x = '\x43\x68\x65\x6D\x44\x6F\x6F\x64\x6C\x65';
            let width = ctx.measureText(x).width;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = 'rgba(60, 60, 60, 0.5)';
            ctx.fillText(x, this.width - width - 13, this.height - 4);
            ctx.font = '10px sans-serif';
            ctx.fillText('\u00AE', this.width - 13, this.height - 12);
        }
    };
    _.scaleEvent = function(e) {
        e.op = new structures.Point(e.p.x, e.p.y);
        if (this.styles.scale !== 1)
        {
            e.p.x = this.width / 2 + (e.p.x - this.width / 2) / this.styles.scale;
            e.p.y = this.height / 2 + (e.p.y - this.height / 2) / this.styles.scale;
        }
    };
    _.checkScale = function() {
        if (this.styles.scale < .5) {
            this.styles.scale = .5;
        } else if (this.styles.scale > 10) {
            this.styles.scale = 10;
        }
    };
    // desktop events
    _.click = function(e) {
        this.scaleEvent(e);
        if(this.modal){
            // for modal popovers, close requires a true value to state that is was cancelled
            // for text input, the event is required
            this.modal.close(e);
            return false;
        }
        this.stateManager.getCurrentState().click(e);
    };
    _.rightclick = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().rightclick(e);
    };
    _.dblclick = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().dblclick(e);
    };
    _.mousedown = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mousedown(e);
    };
    _.rightmousedown = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().rightmousedown(e);
    };
    _.mousemove = function(e) {
        if(this.modal){
            return false;
        }
        // link to tutorial
        this.isHelp = false;
        if (e.p.distance(new structures.Point(this.width - 20, 20)) < 10) {
            this.isHelp = true;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mousemove(e);
        // repaint is called in the state mousemove event
    };
    _.mouseout = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mouseout(e);
    };
    _.mouseover = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mouseover(e);
    };
    _.mouseup = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mouseup(e);
    };
    _.rightmouseup = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().rightmouseup(e);
    };
    _.mousewheel = function(e, delta) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mousewheel(e, delta);
    };
    _.drag = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().drag(e);
    };
    _.keydown = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().keydown(e);
    };
    _.keypress = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().keypress(e);
    };
    _.keyup = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().keyup(e);
    };
    // mobile events
    _.touchstart = function(e) {
        if(this.modal){
            return false;
        }
        if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
            if (this.tempAtom || this.tempRing) {
                this.tempAtom = undefined;
                this.tempRing = undefined;
                this.hovering = undefined;
                this.repaint();
            }
            this.lastPoint = undefined;
        } else {
            this.scaleEvent(e);
            this.stateManager.getCurrentState().mousemove(e);
            this.stateManager.getCurrentState().mousedown(e);
        }
    };
    _.touchmove = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        if (!this.inGesture && this.lastPoint.distance(e.p)>5) {
            this.stateManager.getCurrentState().drag(e);
        }
    };
    _.touchend = function(e) {
        if(this.modal){
            return false;
        }
        this.scaleEvent(e);
        this.stateManager.getCurrentState().mouseup(e);
        if (this.hovering) {
            this.stateManager.getCurrentState().clearHover();
            this.repaint();
        }
    };
    _.gesturechange = function(e) {
        if(this.modal){
            return false;
        }
        this.inGesture = true;
        // set no new mols to form to stop actions in label state
        this.stateManager.getCurrentState().newMolAllowed = false;
        if (e.originalEvent.scale - this.lastPinchScale !== 1) {
            if (!(this.lasso && this.lasso.isActive())) {
                this.styles.scale *= e.originalEvent.scale / this.lastPinchScale;
                this.checkScale();
            }
            this.lastPinchScale = e.originalEvent.scale;
        }
        if (this.lastGestureRotate - e.originalEvent.rotation !== 0) {
            let rot = (this.lastGestureRotate - e.originalEvent.rotation) / 180 * m.PI;
            if (!this.parentAction) {
                let ps = (this.lasso && this.lasso.isActive()) ? this.lasso.getAllPoints() : this.getAllPoints();
                let center = (this.lasso && this.lasso.isActive()) ? new structures.Point((this.lasso.bounds.minX + this.lasso.bounds.maxX) / 2, (this.lasso.bounds.minY + this.lasso.bounds.maxY) / 2) : new structures.Point(this.width / 2, this.height / 2);
                this.parentAction = new sketcherPack.actions.RotateAction(ps, rot, center);
                this.historyManager.pushUndo(this.parentAction);
            } else {
                this.parentAction.dif += rot;
                for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
                    let p = this.parentAction.ps[i];
                    let dist = this.parentAction.center.distance(p);
                    let angle = this.parentAction.center.angle(p) + rot;
                    p.x = this.parentAction.center.x + dist * m.cos(angle);
                    p.y = this.parentAction.center.y - dist * m.sin(angle);
                }
                // must check here as change is outside of an action
                for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                    this.molecules[i].check();
                }
                if (this.lasso && this.lasso.isActive()) {
                    this.lasso.setBounds();
                }
            }
            this.lastGestureRotate = e.originalEvent.rotation;
        }
        this.repaint();
    };
    _.gestureend = function(e) {
        if(this.modal){
            return false;
        }
        this.inGesture = false;
        this.lastPinchScale = 1;
        this.lastGestureRotate = 0;
        this.parentAction = undefined;
    };

})(Chemio, Chemio.extensions, Chemio.featureDetection, Chemio.uis, Chemio.structures, Chemio.structures.d2, Chemio.uis.tools, Math, window);
