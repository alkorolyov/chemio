//**************************** STATES ****************************

(function(math, monitor, actions, states, desktop, imageDepot, structures, d2, SYMBOLS, m, window, undefined) {
    'use strict';
    states._State = function() {
    };
    let _ = states._State.prototype;
    _.setup = function(sketcher) {
        this.sketcher = sketcher;
        this.cursor = '';
        this.defaultCursor = 'default';
    };
    /**
     * Sets new cursor pointer
     *
     * @param {string} cursor POINTER_* ex. POINTER_LASSO, for custom imageDepot cursor icon
     * or predefined cursor icon, ex 'default'
     */
    _.setCursor = function(cursor) {
        this.cursor = cursor;
        let el = document.getElementById(this.sketcher.id);
        if (this.cursor.includes('POINTER'))
            // custom
            el.style.cursor = imageDepot.getCursor(imageDepot[cursor]);
        else
            // predefined
            el.style.cursor = cursor;
    };
    _.clearHover = function() {
        if (this.sketcher.hovering) {
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering.isSelected_old = false;
            this.sketcher.hovering = undefined;
        }
    };
    _.findHoveredObject = function(point, includeAtoms, includeBonds, includeShapes) {
        this.clearHover();
        let min = Infinity;
        let hovering;
        let hoverdist = 10;
        // if (!this.sketcher.isMobile) {
        // 	hoverdist *= this.sketcher.styles.scale;
        // }
        if (includeAtoms) {
            for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                let mol = this.sketcher.molecules[i];
                for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let a = mol.atoms[j];
                    a.isHover = false;
                    let dist = point.distance(a);
                    if (dist < hoverdist && dist < min) {
                        min = dist;
                        hovering = a;
                    }
                }
            }
        }
        if (includeBonds) {
            for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                let mol = this.sketcher.molecules[i];
                for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                    let b = mol.bonds[j];
                    b.isHover = false;
                    let dist = math.distanceFromPointToLineInclusive(point, b.a1, b.a2, hoverdist/2);
                    if (dist !== -1 && dist < hoverdist && dist < min) {
                        min = dist;
                        hovering = b;
                    }
                }
            }
        }
        if (includeShapes) {
            for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
                let s = this.sketcher.shapes[i];
                s.isHover = false;
                s.hoverPoint = undefined;
                // if(this instanceof states.DynamicBracketState && (!(s instanceof d2.DynamicBracket) || !s.contents.flippable)){
                //     continue;
                // }
                let sps = s.getPoints();
                for ( let j = 0, jj = sps.length; j < jj; j++) {
                    let p = sps[j];
                    let dist = point.distance(p);
                    if (dist < hoverdist && dist < min) {
                        min = dist;
                        hovering = s;
                        s.hoverPoint = p;
                    }
                }
                // if(this instanceof states.EraseState && s instanceof d2.VAP){
                //     s.hoverBond = undefined;
                //     // check vap bonds only in the erase state
                //     if(s.substituent){
                //         let att = s.substituent;
                //         let dist = point.distance(new structures.Point((s.asterisk.x + att.x) / 2, (s.asterisk.y + att.y) / 2));
                //         if (dist < hoverdist && dist < min) {
                //             min = dist;
                //             s.hoverBond = att;
                //             hovering = s;
                //         }
                //     }
                //     for ( let j = 0, jj = s.attachments.length; j < jj; j++) {
                //         let att = s.attachments[j];
                //         let dist = point.distance(new structures.Point((s.asterisk.x + att.x) / 2, (s.asterisk.y + att.y) / 2));
                //         if (dist < hoverdist && dist < min) {
                //             min = dist;
                //             s.hoverBond = att;
                //             hovering = s;
                //         }
                //     }
                // }
            }
            if (!hovering) {
                // find smallest shape pointer is over
                for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
                    let s = this.sketcher.shapes[i];
                    if (s.isOver(point, hoverdist)) {
                        hovering = s;
                    }
                }
            }
        }
        if (hovering) {
            hovering.isHover = true;
            this.sketcher.hovering = hovering;
            this.sketcher.renderer.redraw();
        }
    };
    _.getOptimumAngle = function(a, order) {
        let mol = this.sketcher.getMoleculeByAtom(a);
        let angles = mol.getAngles(a);
        let angle = 0;
        if (angles.length === 0) {
            angle = m.PI / 6;
        } else if (angles.length === 1) {
            let b;
            for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                if (mol.bonds[j].contains(this.sketcher.hovering)) {
                    b = mol.bonds[j];
                }
            }
            if (b.bondOrder >= 3 || order>=3) {
                angle = angles[0] + m.PI;
            } else {
                let concerned = angles[0] % m.PI * 2;
                if (math.isBetween(concerned, 0, m.PI / 2) || math.isBetween(concerned, m.PI, 3 * m.PI / 2)) {
                    angle = angles[0] + 2 * m.PI / 3;
                } else {
                    angle = angles[0] - 2 * m.PI / 3;
                }
            }
        } else {
            // avoid inside rings
            let modded;
            for ( let j = 0, jj = mol.rings.length; j < jj; j++) {
                let r = mol.rings[j];
                if(r.atoms.indexOf(a)!==-1){
                    angles.push(a.angle(r.getCenter()));
                    modded = true;
                }
            }
            if(modded){
                angles.sort(function(a, b) {
                    return a - b;
                });
            }
            angle = math.angleBetweenLargest(angles).angle;
        }
        return angle;
    };
    _.removeStartAtom = function() {
        if (this.sketcher.startAtom) {
            this.sketcher.startAtom.x = -10;
            this.sketcher.startAtom.y = -10;
            this.sketcher.renderer.redraw();
        }
    };
    _.placeRequiredAtom = function(e){
        let a = new structures.Atom('C', e.p.x, e.p.y);
        this.sketcher.hovering = a;
        this.sketcher.hovering.isHover = true;
        this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ a ], []));
        this.innermousedown(e);
    };

    _.enter = function() {
        this.setCursor(this.defaultCursor);
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
        this.sketcher.lastPoint = e.p;
        if (this.innermousedown) {
            this.innermousedown(e);
        }
    };
    _.rightmousedown = function(e) {
        if (this.innerrightmousedown) {
            this.innerrightmousedown(e);
        }
        this.sketcher.stateManager.STATE_ERASE.handleDelete();
    };
    _.mousemove = function(e) {
        // lastMousePos is really only used for pasting
        this.sketcher.lastMousePos = e.p;
        if (this.innermousemove) {
            this.innermousemove(e);
        }

        // console.log('selected: ' + this.sketcher.getAllAtoms()[0].isSelected);
        // console.log('lassoed: ' + this.sketcher.getAllAtoms()[0].isLassoed);
        // console.log('hover: ' + this.sketcher.getAllAtoms()[0].isHover);


        // call the repaint here to repaint the help button, also this is called
        // by other functions, so the repaint must be here
        // this.sketcher.repaint();
    };
    _.mouseout = function(e) {
        this.sketcher.lastMousePos = undefined;
        if (this.innermouseout) {
            this.innermouseout(e);
        }
        if (this.sketcher.isHelp) {
            this.sketcher.isHelp = false;
            this.sketcher.renderer.redraw();
        }
        if (this.sketcher.hovering && monitor.CANVAS_DRAGGING != this.sketcher) {
            this.sketcher.hovering = undefined;
            this.sketcher.renderer.redraw();
        }
    };
    _.mouseover = function(e) {
        if (this.innermouseover) {
            this.innermouseover(e);
        }
    };
    _.mouseup = function(e) {
        this.parentAction = undefined;
        if (this.innermouseup) {
            this.innermouseup(e);
        }
    };
    _.rightmouseup = function(e) {
        if (this.innerrightmouseup) {
            this.innerrightmouseup(e);
        }
    };
    _.mousewheel = function(e, delta) {
        if (this.innermousewheel) {
            this.innermousewheel(e);
        }
        this.sketcher.styles.scale *= delta >= 0 ? 1.1 : (1 / 1.1);
        this.sketcher.checkScale();
        this.sketcher.renderer.redraw();
    };
    _.drag = function(e) {
        if (this.innerdrag) {
            this.innerdrag(e);
        }

        // console.log('selected: ' + this.sketcher.getAllAtoms()[0].isSelected);
        // console.log('lassoed: ' + this.sketcher.getAllAtoms()[0].isLassoed);
        // console.log('hover: ' + this.sketcher.getAllAtoms()[0].isHover);


        // if (!this.sketcher.hovering && !this.dontTranslateOnDrag) {
        // 	if (monitor.SHIFT) {
        // 		// rotate structure
        // 		if (this.parentAction) {
        // 			let center = this.parentAction.center;
        // 			let oldAngle = center.angle(this.sketcher.lastPoint);
        // 			let newAngle = center.angle(e.p);
        // 			let rot = newAngle - oldAngle;
        // 			this.parentAction.dif += rot;
        // 			for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
        // 				let a = this.parentAction.ps[i];
        // 				let dist = center.distance(a);
        // 				let angle = center.angle(a) + rot;
        // 				a.x = center.x + dist * m.cos(angle);
        // 				a.y = center.y - dist * m.sin(angle);
        // 			}
        // 			// must check here as change is outside of an action
        // 			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
        // 				this.sketcher.molecules[i].check();
        // 			}
        // 		} else {
        // 			let center = new structures.Point(this.sketcher.width / 2, this.sketcher.height / 2);
        // 			let oldAngle = center.angle(this.sketcher.lastPoint);
        // 			let newAngle = center.angle(e.p);
        // 			let rot = newAngle - oldAngle;
        // 			this.parentAction = new actions.RotateAction(this.sketcher.getAllPoints(), rot, center);
        // 			this.sketcher.historyManager.pushUndo(this.parentAction);
        // 		}
        // 	} else {
        // 		if (!this.sketcher.lastPoint) {
        // 			// this prevents the structure from being rotated and
        // 			// translated at the same time while a gesture is occuring,
        // 			// which is preferable based on use cases since the rotation
        // 			// center is the canvas center
        // 			return;
        // 		}
        // 		// move structure
        // 		let dif = new structures.Point(e.p.x, e.p.y);
        // 		dif.sub(this.sketcher.lastPoint);
        // 		if (this.parentAction) {
        // 			this.parentAction.dif.add(dif);
        // 			for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
        // 				this.parentAction.ps[i].add(dif);
        // 			}
        // 			if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
        // 				this.sketcher.lasso.bounds.minX += dif.x;
        // 				this.sketcher.lasso.bounds.maxX += dif.x;
        // 				this.sketcher.lasso.bounds.minY += dif.y;
        // 				this.sketcher.lasso.bounds.maxY += dif.y;
        // 			}
        // 			// must check here as change is outside of an action
        // 			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
        // 				this.sketcher.molecules[i].check();
        // 			}
        // 		} else {
        // 			this.parentAction = new actions.MoveAction(this.sketcher.getAllPoints(), dif);
        // 			this.sketcher.historyManager.pushUndo(this.parentAction);
        // 		}
        // 	}
        // 	this.sketcher.repaint();
        // }
        this.sketcher.lastPoint = e.p;
    };
    _.keydown = function(e) {
        if (monitor.CANVAS_DRAGGING === this.sketcher) {
            if (this.sketcher.lastPoint) {
                // create a copy, as the drag function may alter the point
                e.p = new structures.Point(this.sketcher.lastPoint.x, this.sketcher.lastPoint.y);
                this.drag(e);
            }
        } else if (monitor.META) {
            if (e.which === 90) {
                // z
                this.sketcher.historyManager.undo();
            } else if (e.which === 89) {
                // y
                this.sketcher.historyManager.redo();
            } else if (e.which === 83) {
                // s
                this.sketcher.toolbarManager.buttonSave.func();
            } else if (e.which === 79) {
                // o
                this.sketcher.toolbarManager.buttonOpen.func();
            } else if (e.which === 65) {
                // a
                this.sketcher.toolbarManager.buttonLasso.getElement().click();
                this.sketcher.lasso.select(this.sketcher.getAllAtoms(), this.sketcher.shapes);
            } else if (e.which === 88) {
                // x
                this.sketcher.copyPasteManager.copy(true);
            } else if (e.which === 67) {
                // c
                this.sketcher.copyPasteManager.copy(false);
            } else if (e.which === 86) {
                // v
                this.sketcher.copyPasteManager.paste();
            }
        } else if (e.which === 32) {
            // space key
            // switch to lasso
            if (this.sketcher.lasso.isActive()) {
                this.sketcher.lasso.empty();
            } else {
                this.sketcher.toolbarManager.buttonLasso.getElement().click();
                this.sketcher.toolbarManager.buttonLasso.func();
            }
        } else if (e.which === 13) {
            // enter or return key
            if(this.sketcher.hovering instanceof structures.Atom && this.sketcher.stateManager.STATE_TEXT_INPUT.lastLabel && this.sketcher.stateManager.STATE_TEXT_INPUT.lastLabel !== this.sketcher.hovering.label){
                this.sketcher.historyManager.pushUndo(new actions.ChangeLabelAction(this.sketcher.hovering, this.sketcher.stateManager.STATE_TEXT_INPUT.lastLabel));
            }
        } else if (e.which === 187 || e.which === 189 || e.which === 61 || e.which === 109) {
            // plus or minus
            if (this.sketcher.hovering && this.sketcher.hovering instanceof structures.Atom) {
                this.sketcher.historyManager.pushUndo(new actions.ChangeChargeAction(this.sketcher.hovering, e.which === 187 || e.which === 61 ? 1 : -1));
            }
        } else if (e.which === 8 || e.which === 46) {
            // delete or backspace
            this.sketcher.stateManager.STATE_ERASE.handleDelete();
        } else if (e.which >= 48 && e.which <= 57) {
            // digits
            let number = e.which - 48;
            if (number == 1) {
                // 1 change state to NewBond
                this.sketcher.toolbarManager.buttonSingle.getElement().click();
            }
            if (this.sketcher.hovering) {
                if (this.sketcher.hovering instanceof structures.Atom) {
                    if (!monitor.SHIFT) {
                        if ( number < 3) {
                            // 1 - 2 attach chain to atom
                            this.sketcher.stateManager.STATE_NEW_BOND.attachChain(this.sketcher.hovering, number);
                        } else if (number > 2 && number < 9) {
                            // 3 -8 attach ring to atom
                            this.sketcher.stateManager.STATE_NEW_RING.attachToAtom(this.sketcher.hovering, number);
                        }
                    }
                } else if (this.sketcher.hovering instanceof structures.Bond) {
                    if (!monitor.SHIFT) {
                        if (number > 0 && number < 4) {
                            // 1 - 3 change bond order
                            this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(this.sketcher.hovering, number, structures.Bond.STEREO_NONE));
                        } else if (number > 3 && number < 9) {
                            // 4 - 8 attach ring to bond
                            this.sketcher.stateManager.STATE_NEW_RING.attachToBond(this.sketcher.hovering, number);
                        }
                    } else if (number == 3) {
                        // shift + 3, attach cyclopropane to bond
                        this.sketcher.stateManager.STATE_NEW_RING.attachToBond(this.sketcher.hovering, number);
                    }
                }
            }
        } else if (e.which >= 65 && e.which <= 90) {
            // alphabet
            if (this.sketcher.hovering) {
                if (this.sketcher.hovering instanceof structures.Atom) {
                    let check = String.fromCharCode(e.which);
                    let firstMatch;
                    let firstAfterMatch;
                    let found = false;
                    for ( let j = 0, jj = SYMBOLS.length; j < jj; j++) {
                        if (this.sketcher.hovering.label.charAt(0) === check) {
                            if (SYMBOLS[j] === this.sketcher.hovering.label) {
                                found = true;
                            } else if (SYMBOLS[j].charAt(0) === check) {
                                if (found && !firstAfterMatch) {
                                    firstAfterMatch = SYMBOLS[j];
                                } else if (!firstMatch) {
                                    firstMatch = SYMBOLS[j];
                                }
                            }
                        } else {
                            if (SYMBOLS[j].charAt(0) === check) {
                                firstMatch = SYMBOLS[j];
                                break;
                            }
                        }
                    }
                    let use = 'C';
                    if (firstAfterMatch) {
                        use = firstAfterMatch;
                    } else if (firstMatch) {
                        use = firstMatch;
                    }
                    if (use !== this.sketcher.hovering.label) {
                        this.sketcher.historyManager.pushUndo(new actions.ChangeLabelAction(this.sketcher.hovering, use));
                    }
                } else if (this.sketcher.hovering instanceof structures.Bond) {
                    if (e.which === 70) {
                        // f
                        this.sketcher.historyManager.pushUndo(new actions.FlipBondAction(this.sketcher.hovering));
                    } else if (e.which === 87) {
                        // w
                        if (this.sketcher.hovering.stereo !== structures.Bond.STEREO_WEDGED)
                            this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(this.sketcher.hovering, 1, structures.Bond.STEREO_WEDGED));
                        else
                            this.sketcher.historyManager.pushUndo(new actions.FlipBondAction(this.sketcher.hovering));
                    } else if (e.which === 72) {
                        // h
                        if (this.sketcher.hovering.stereo !== structures.Bond.STEREO_DASHED)
                            this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(this.sketcher.hovering, 1, structures.Bond.STEREO_DASHED));
                        else
                            this.sketcher.historyManager.pushUndo(new actions.FlipBondAction(this.sketcher.hovering));

                    }
                }
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
        if (monitor.CANVAS_DRAGGING === this.sketcher) {
            if (this.sketcher.lastPoint) {
                // create a copy, as the drag function may alter the point
                e.p = new structures.Point(this.sketcher.lastPoint.x, this.sketcher.lastPoint.y);
                this.sketcher.drag(e);
            }
        }
        if (this.innerkeyup) {
            this.innerkeyup(e);
        }
    };

})(Chemio.math, Chemio.monitor, Chemio.uis.actions, Chemio.uis.states, Chemio.uis.gui.desktop, Chemio.uis.gui.imageDepot, Chemio.structures, Chemio.structures.d2, Chemio.SYMBOLS, Math, window);

(function(actions, states, undefined) {
    'use strict';
    states.ChargeState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.ChargeState.prototype = new states._State();
    _.delta = 1;
    _.innermouseup = function(e) {
        if (this.sketcher.hovering) {
            this.sketcher.historyManager.pushUndo(new actions.ChangeChargeAction(this.sketcher.hovering, this.delta));
        }
    };
    _.innermousemove = function(e) {
        this.findHoveredObject(e.p, true, false);
    };

})(Chemio.uis.actions, Chemio.uis.states);


(function(actions, states, structures, d2, undefined) {
    'use strict';
    states.EraseState = function(sketcher) {
        this.setup(sketcher);
        this.defaultCursor = 'POINTER_ERASE';
    };
    let _ = states.EraseState.prototype = new states._State();
    _.handleDelete = function() {
        let action;
        if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
            action = new actions.DeleteContentAction(this.sketcher, this.sketcher.lasso.atoms, this.sketcher.lasso.shapes);
            this.sketcher.lasso.empty();
        } else if (this.sketcher.hovering) {
            if (this.sketcher.hovering instanceof structures.Atom) {
                if (this.sketcher.hovering.label != 'C') {
                    this.sketcher.historyManager.pushUndo(new actions.ChangeLabelAction(this.sketcher.hovering, 'C'));
                } else {
                    let mol = this.sketcher.getMoleculeByAtom(this.sketcher.hovering);
                    action = new actions.DeleteAction(this.sketcher, mol.atoms[0], [ this.sketcher.hovering ], mol.getBonds(this.sketcher.hovering));
                }
            } else if (this.sketcher.hovering instanceof structures.Bond) {
                action = new actions.DeleteAction(this.sketcher, this.sketcher.hovering.a1, [], [ this.sketcher.hovering ]);
            } else if (this.sketcher.hovering instanceof d2._Shape) {
                let s = this.sketcher.hovering;
                action = new actions.DeleteShapeAction(this.sketcher, s);

                // if(s.hoverBond){
                //     // delete only the hovered bond in the VAP
                //     action = new actions.DeleteVAPConnectionAction(s, s.hoverBond);
                // }else
                //     action = new actions.DeleteShapeAction(this.sketcher, s);
                // }
            }
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering = undefined;
            this.sketcher.renderer.redraw();
        }
        if(action){
            this.sketcher.historyManager.pushUndo(action);
            // check shapes to see if they should be removed
            // for ( let i = this.sketcher.shapes.length - 1; i >= 0; i--) {
            //     let s = this.sketcher.shapes[i];
            //     if (s instanceof d2.Pusher || s instanceof d2.AtomMapping) {
            //         let remains1 = false, remains2 = false;
            //         for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
            //             let mol = this.sketcher.molecules[j];
            //             for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
            //                 let a = mol.atoms[k];
            //                 if (a === s.o1) {
            //                     remains1 = true;
            //                 } else if (a === s.o2) {
            //                     remains2 = true;
            //                 }
            //             }
            //             for ( let k = 0, kk = mol.bonds.length; k < kk; k++) {
            //                 let b = mol.bonds[k];
            //                 if (b === s.o1) {
            //                     remains1 = true;
            //                 } else if (b === s.o2) {
            //                     remains2 = true;
            //                 }
            //             }
            //         }
            //         if (!remains1 || !remains2) {
            //             action.shapes.push(s);
            //             this.sketcher.removeShape(s);
            //         }
            //     }
            //     if (s instanceof d2.DynamicBracket) {
            //         let remains1 = false, remains2 = false;
            //         for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
            //             let mol = this.sketcher.molecules[j];
            //             for ( let k = 0, kk = mol.bonds.length; k < kk; k++) {
            //                 let b = mol.bonds[k];
            //                 if (b === s.b1) {
            //                     remains1 = true;
            //                 } else if (b === s.b2) {
            //                     remains2 = true;
            //                 }
            //             }
            //         }
            //         if (!remains1 || !remains2) {
            //             action.shapes.push(s);
            //             this.sketcher.removeShape(s);
            //         }
            //     }
            //     if (s instanceof d2.VAP) {
            //         let broken = false;
            //         for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
            //             let mol = this.sketcher.molecules[j];
            //             for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
            //                 mol.atoms[k].present = true;
            //             }
            //         }
            //         if(s.substituent && !s.substituent.present){
            //             broken = true;
            //         }
            //         if(!broken){
            //             for(let j = 0, jj = s.attachments.length; j < jj; j++){
            //                 if(!s.attachments[j].present){
            //                     broken = true;
            //                     break;
            //                 }
            //             }
            //         }
            //         for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
            //             let mol = this.sketcher.molecules[j];
            //             for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
            //                 mol.atoms[k].present = undefined;
            //             }
            //         }
            //         if (broken) {
            //             action.shapes.push(s);
            //             this.sketcher.removeShape(s);
            //         }
            //     }
            // }
            this.sketcher.checksOnAction();
            this.sketcher.renderer.redraw();
        }
    };
    _.innermouseup = function(e) {
        this.handleDelete();
    };
    _.innermousemove = function(e) {
        this.findHoveredObject(e.p, true, true, true);
    };

})(Chemio.uis.actions, Chemio.uis.states, Chemio.structures, Chemio.structures.d2);
(function(monitor, structures, actions, states, m, undefined) {
    'use strict';
    states.LabelState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.LabelState.prototype = new states._State();
    _.label = 'C';
    _.innermousedown = function(e) {
        this.downPoint = e.p;
        this.newMolAllowed = true;
        if(this.sketcher.hovering){
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering.isSelected_old = true;
            this.sketcher.renderer.redraw();
        }
    };
    _.innermouseup = function(e) {
        this.downPoint = undefined;
        if (this.sketcher.hovering) {
            this.sketcher.hovering.isSelected_old = false;
            if(this.sketcher.tempAtom){
                let b = new structures.Bond(this.sketcher.hovering, this.sketcher.tempAtom);
                this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, b.a1, [b.a2], [b]));
                this.sketcher.tempAtom = undefined;
            }else if (this.label !== this.sketcher.hovering.label) {
                this.sketcher.historyManager.pushUndo(new actions.ChangeLabelAction(this.sketcher.hovering, this.label));
            }
        } else if (this.newMolAllowed) {
            this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom(this.label, e.p.x, e.p.y) ], []));
        }
        if (!this.sketcher.isMobile) {
            this.mousemove(e);
        }
    };
    _.innermousemove = function(e) {
        this.findHoveredObject(e.p, true, false);
    };
    _.innerdrag = function(e) {
        if(this.downPoint && this.downPoint.distance(e.p)>3){
            // give it a little allowance, but if we move too much, then don't place a lone atom
            this.newMolAllowed = false;
        }
        if(this.sketcher.hovering){
            let dist = this.sketcher.hovering.distance(e.p);
            if(dist<9){
                this.sketcher.tempAtom = undefined;
            }else if (e.p.distance(this.sketcher.hovering) < 15) {
                let angle = this.getOptimumAngle(this.sketcher.hovering);
                let x = this.sketcher.hovering.x + this.sketcher.styles.bondLength_2D * m.cos(angle);
                let y = this.sketcher.hovering.y - this.sketcher.styles.bondLength_2D * m.sin(angle);
                this.sketcher.tempAtom = new structures.Atom(this.label, x, y, 0);
            } else {
                if (monitor.ALT && monitor.SHIFT) {
                    this.sketcher.tempAtom = new structures.Atom(this.label, e.p.x, e.p.y, 0);
                } else {
                    let angle = this.sketcher.hovering.angle(e.p);
                    let length = this.sketcher.hovering.distance(e.p);
                    if (!monitor.SHIFT) {
                        length = this.sketcher.styles.bondLength_2D;
                    }
                    if (!monitor.ALT) {
                        let increments = m.floor((angle + m.PI / 12) / (m.PI / 6));
                        angle = increments * m.PI / 6;
                    }
                    this.sketcher.tempAtom = new structures.Atom(this.label, this.sketcher.hovering.x + length * m.cos(angle), this.sketcher.hovering.y - length * m.sin(angle), 0);
                }
            }
            this.sketcher.renderer.redraw();
        }
    };

})(Chemio.monitor, Chemio.structures, Chemio.uis.actions, Chemio.uis.states, Math);
(function(math, monitor, structures, d2, actions, states, tools, imageDepot, m, undefined) {
    'use strict';
    let TRANSLATE = 1;
    let ROTATE = 2;
    let transformType = undefined;
    /**
     * Buffer size in px for rotate area
     * @type {number}
     */
    let rotateBufferConst = 25;
    /**
     * Flag to repaint rotate area
     * @type {boolean}
     */
    let paintRotate = false;

    let rotateDif = 0;
    let initialPoints = [];
    let delta = math.toRad(6);
    let angleChanged = false;

    states.LassoState = function(sketcher) {
        this.setup(sketcher);
        this.dontTranslateOnDrag = true;
        this.defaultCursor = 'POINTER_LASSO';
    };
    let _ = states.LassoState.prototype = new states._State();
    /**
     * Checks if point inside rotate area boundaries
     *  of selected objects. Including inner space.
     *
     * @param {Point} point
     * @return {boolean} result
     */
    _.inRotateBoundaries = function(point, rotateBuffer) {
        if (!this.sketcher.lasso.isActive()) return false;
        return (math.isBetween(point.x, this.sketcher.lasso.bounds.minX - rotateBuffer, this.sketcher.lasso.bounds.maxX + rotateBuffer)
            && math.isBetween(point.y, this.sketcher.lasso.bounds.minY - rotateBuffer, this.sketcher.lasso.bounds.maxY + rotateBuffer))
    };
    /**
     * Checks if point inside drag area boundaries
     *  of selected objects.
     *
     * @param {Point} point
     * @return {boolean} result
     */
    _.inDragBoundaries = function(point) {
        if (!this.sketcher.lasso.isActive()) return false;
        return (math.isBetween(point.x, this.sketcher.lasso.bounds.minX, this.sketcher.lasso.bounds.maxX)
            && math.isBetween(point.y, this.sketcher.lasso.bounds.minY, this.sketcher.lasso.bounds.maxY))
    };
    /**
     * Updates cursor when it doesn't correspond to area,
     * repaints in rotation area
     *
     * @param {Point} point
     */
    _.updateCursor = function(point) {
        let rotateBuffer = rotateBufferConst / this.sketcher.styles.scale;
        if (!point) {
            this.setCursor('POINTER_LASSO');
            return;
        }
        if (!monitor.SHIFT) {
            if (this.inDragBoundaries(point) && this.cursor !== 'POINTER_DRAG') {
                this.setCursor('POINTER_DRAG');
                this.clearHover();
                paintRotate = false;
            }
            else if (!this.inDragBoundaries(point) && this.inRotateBoundaries(point, rotateBuffer)
                && this.cursor !== 'POINTER_ROTATE') {
                this.setCursor('POINTER_ROTATE');
                this.clearHover();
                paintRotate = true;
                this.sketcher.renderer.redraw();
            }
            else if (!this.inRotateBoundaries(point, rotateBuffer)) {
                this.updateHoverCursor(point);
            }
        } else {
            this.updateHoverCursor(point);
        }
    };
    /**
     * Updates cursor for hovering objects,
     * repaints in rotation boundaries
     *
     * @param {Point} point
     */
    _.updateHoverCursor = function(point) {
        if (!point) {
            this.setCursor('POINTER_LASSO');
            return;
        }
        this.findHoveredObject(point, true, true, true);
        if (this.sketcher.hovering && this.cursor !== 'default') {
            this.setCursor('default');
        } else if (!this.sketcher.hovering && this.cursor !== 'POINTER_LASSO') {
            this.setCursor('POINTER_LASSO');
            paintRotate = false;
            this.sketcher.renderer.redraw();
        }
    };

    _.innerenter = function() {
        this.updateCursor(this.sketcher.lastPoint);
    };
    _.innerexit = function() {
        if (this.sketcher.lasso.isActive()) {
            this.sketcher.lasso.empty();
        }
    };
    _.innerdrag = function(e) {
        this.inDrag = true;
        if (this.sketcher.lasso.isActive() && transformType)  {
            if (!this.sketcher.lastPoint) {
                // this prevents the structure from being rotated and
                // translated at the same time while a gesture is occurring,
                // which is preferable based on use cases since the rotation
                // center is the canvas center
                return;
            }
            if (transformType === TRANSLATE) {
                let dif = new structures.Point(e.p.x, e.p.y);
                dif.sub(this.sketcher.lastPoint);
                if (this.parentAction) {
                    this.parentAction.dif.add(dif);
                    for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
                        this.parentAction.ps[i].add(dif);
                    }
                    // must check here as change is outside of an action
                    this.parentAction.checks(this.sketcher);
                } else {
                    this.parentAction = new actions.MoveAction(this.sketcher.lasso.getAllPoints(), dif);
                    this.sketcher.historyManager.pushUndo(this.parentAction);
                }
            } else if (transformType === ROTATE) {
                if (this.parentAction) {
                    let center = this.parentAction.center;
                    let oldAngle = center.angle(this.sketcher.lastPoint);
                    let newAngle = center.angle(e.p);
                    let rot = math.angleBounds(newAngle - oldAngle);
                    rotateDif = math.angleBounds(rotateDif + rot);
                    if (!monitor.ALT) {
                        let deltaDif =  m.floor(rotateDif / delta) - m.floor(this.parentAction.dif / delta);
                        if (deltaDif != 0) {
                            this.parentAction.dif = m.floor(rotateDif / delta) * delta;
                            rot = deltaDif * delta;
                            angleChanged = true;
                        } else {
                            rot = 0;
                            angleChanged = false;
                        }
                    } else {
                        this.parentAction.dif = rotateDif;
                        angleChanged = true;
                    }
                    if (angleChanged) {
                        for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
                            let newAngle = center.angle(initialPoints[i]) + this.parentAction.dif;
                            let dist = center.distance(initialPoints[i]);
                            this.parentAction.ps[i].x = center.x + dist * m.cos(newAngle);
                            this.parentAction.ps[i].y = center.y - dist * m.sin(newAngle);
                        }
                    }
                    // must check here as change is outside of an action
                    this.parentAction.checks(this.sketcher);
                } else {
                    let points = this.sketcher.lasso.getAllPoints();
                    let center = math.center(points);
                    let oldAngle = center.angle(this.sketcher.lastPoint);
                    let newAngle = center.angle(e.p);
                    let rot = math.angleBounds(newAngle - oldAngle);
                    rotateDif = rot;

                    // save initial points
                    initialPoints = [];
                    for ( let i = 0, ii = points.length; i < ii; i++) {
                        initialPoints.push(new structures.Point(points[i].x, points[i].y));
                    };

                    this.parentAction = new actions.RotateAction(points, m.floor(rotateDif/delta)*delta, center);
                    this.sketcher.historyManager.pushUndo(this.parentAction);
                }
            }
        } else if (this.sketcher.hovering) {
            if (!this.sketcher.lastPoint) {
                // this prevents the structure from being rotated and
                // translated at the same time while a gesture is occurring,
                // which is preferable based on use cases since the rotation
                // center is the canvas center
                return;
            }
            // move hovering part
            let dif = new structures.Point(e.p.x, e.p.y);
            dif.sub(this.sketcher.lastPoint);
            if (!this.parentAction) {
                let ps;
                if (this.sketcher.hovering instanceof structures.Atom) {
                    ps = [ this.sketcher.hovering ];
                } else if (this.sketcher.hovering instanceof structures.Bond) {
                    ps =  [ this.sketcher.hovering.a1, this.sketcher.hovering.a2 ];
                } else if (this.sketcher.hovering instanceof d2._Shape) {
                    ps = this.sketcher.hovering.hoverPoint ? [ this.sketcher.hovering.hoverPoint ] : this.sketcher.hovering.getPoints();
                }
                this.parentAction = new actions.MoveAction(ps, dif);
                this.sketcher.historyManager.pushUndo(this.parentAction);
            } else {
                this.parentAction.dif.add(dif);
                for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
                    this.parentAction.ps[i].add(dif);
                }
                // must check here as change is outside of an action
                this.parentAction.checks(this.sketcher);
            }
        } else {
            // must check against undefined as lastGestureRotate can be 0, in
            // mobile mode it is set during gestures, don't use lasso
            this.sketcher.lasso.addPoint(e.p);
            this.sketcher.lasso.lasso();
            this.sketcher.renderer.redraw();
        }
    };
    _.innermousedown = function(e) {
        this.inDrag = false;
        transformType = undefined;
        if (this.sketcher.lasso.isActive() && !monitor.SHIFT) {
            let rotateBuffer = rotateBufferConst / this.sketcher.styles.scale;
            if (this.inDragBoundaries(e.p)) {
                transformType = TRANSLATE;
            } else if (!this.inDragBoundaries(e.p) && this.inRotateBoundaries(e.p, rotateBuffer)) {
                transformType = ROTATE;
            }
        } else if (!this.sketcher.hovering) {
            this.sketcher.lastPoint = undefined;
            this.sketcher.lasso.addPoint(e.p);
            this.sketcher.renderer.redraw();
        }
    };
    _.innermouseup = function(e) {
        if (!transformType && !this.sketcher.hovering) {
            this.sketcher.lasso.select();
        }
        this.updateCursor(e.p);
    };
    _.innerclick = function(e) {
        if (!transformType && this.sketcher.hovering) {
            let atoms = [];
            let shapes = [];
            if (this.sketcher.hovering instanceof structures.Atom) {
                let a = this.sketcher.hovering;
                a.isSelected ? this.sketcher.lasso.deselect([a]) : atoms.push(a);
            } else if (this.sketcher.hovering instanceof structures.Bond) {
                let a1 = this.sketcher.hovering.a1;
                let a2 = this.sketcher.hovering.a2;
                if (a1.isSelected && a2.isSelected) {
                    this.sketcher.lasso.deselect([a1]);
                    this.sketcher.lasso.deselect([a2]);
                } else {
                    atoms.push(a1);
                    atoms.push(a2);
                }
            } else if (this.sketcher.hovering instanceof d2._Shape) {
                let s = this.sketcher.hovering;
                s.isSelected ? this.sketcher.lasso.deselect([], [s]) : shapes.push(s);
            }
            this.sketcher.lasso.select(atoms, shapes);
        } else if (this.sketcher.lasso.isActive() && !this.inDrag && !monitor.SHIFT) {
            this.sketcher.lasso.empty();
        }
        this.updateCursor(e.p);
        transformType = undefined;
    };
    _.innermousemove = function(e) {
        this.updateCursor(e.p);
    };
    _.innerkeydown = function(e) {
        this.updateCursor(this.sketcher.lastMousePos);
    };
    _.innerkeyup = function(e) {
        this.updateCursor(this.sketcher.lastMousePos);
    };
    _.innerdblclick = function(e) {
        this.findHoveredObject(e.p, true, true, true);
        let hovering = this.sketcher.hovering;
        let mol;
        if(hovering && hovering instanceof structures.Bond ) {
            mol = this.sketcher.getMoleculeByAtom(hovering.a1);
            this.sketcher.lasso.selectMolecule(mol);
        } else if (hovering && hovering instanceof structures.Atom) {
            mol = this.sketcher.getMoleculeByAtom(hovering);
            this.sketcher.lasso.selectMolecule(mol);
        }
        this.clearHover();
    };
    _.draw = function(ctx, styles) {
        if (paintRotate && this.sketcher.lasso.bounds) {
            ctx.fillStyle = styles.colorSelect;
            ctx.globalAlpha = .1;
            let rotateBuffer = rotateBufferConst / this.sketcher.styles.scale;
            let b = this.sketcher.lasso.bounds;
            ctx.beginPath();
            ctx.rect(b.minX - rotateBuffer, b.minY - rotateBuffer, b.maxX - b.minX + 2 * rotateBuffer, rotateBuffer);
            ctx.rect(b.minX - rotateBuffer, b.maxY, b.maxX - b.minX + 2 * rotateBuffer, rotateBuffer);
            ctx.rect(b.minX - rotateBuffer, b.minY, rotateBuffer, b.maxY - b.minY);
            ctx.rect(b.maxX, b.minY, rotateBuffer, b.maxY - b.minY);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    };


})(Chemio.math, Chemio.monitor, Chemio.structures, Chemio.structures.d2, Chemio.uis.actions, Chemio.uis.states, Chemio.uis.tools, Chemio.uis.gui.imageDepot, Math);



(function(actions, states, structures, undefined) {
    'use strict';
    states.MoveState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.MoveState.prototype = new states._State();
    _.action = undefined;
    _.innerdrag = function(e) {
        if (this.sketcher.hovering) {
            if (!this.action) {
                let ps = [];
                let dif = new structures.Point(e.p.x, e.p.y);
                if (this.sketcher.hovering instanceof structures.Atom) {
                    dif.sub(this.sketcher.hovering);
                    ps[0] = this.sketcher.hovering;
                } else if (this.sketcher.hovering instanceof structures.Bond) {
                    dif.sub(this.sketcher.lastPoint);
                    ps[0] = this.sketcher.hovering.a1;
                    ps[1] = this.sketcher.hovering.a2;
                }
                this.action = new actions.MoveAction(ps, dif);
                this.sketcher.historyManager.pushUndo(this.action);
            } else {
                let dif = new structures.Point(e.p.x, e.p.y);
                dif.sub(this.sketcher.lastPoint);
                this.action.dif.add(dif);
                for ( let i = 0, ii = this.action.ps.length; i < ii; i++) {
                    this.action.ps[i].add(dif);
                }
                for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                    this.sketcher.molecules[i].check();
                }
                this.sketcher.renderer.redraw();
            }
        }
    };
    _.innermousemove = function(e) {
        this.findHoveredObject(e.p, true, true);
    };
    _.innermouseup = function(e) {
        this.action = undefined;
    };

})(Chemio.uis.actions, Chemio.uis.states, Chemio.structures);
(function(monitor, actions, states, structures, m, undefined) {
    'use strict';
    states.NewBondState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.NewBondState.prototype = new states._State();
    _.bondOrder = 1;
    _.stereo = structures.Bond.STEREO_NONE;
    _.incrementBondOrder = function(b) {
        this.newMolAllowed = false;
        if (this.bondOrder === 1 && this.stereo === structures.Bond.STEREO_NONE) {
            this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(b));
        } else {
            if (b.bondOrder === this.bondOrder && b.stereo === this.stereo) {
                if (b.bondOrder === 1 && b.stereo !== structures.Bond.STEREO_NONE || b.bondOrder === 2 && b.stereo === structures.Bond.STEREO_NONE) {
                    this.sketcher.historyManager.pushUndo(new actions.FlipBondAction(b));
                }
            } else {
                this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(b, this.bondOrder, this.stereo));
            }
        }
    };
    _.attachChain = function(atom, lengthChain) {
        let molIdentifier = atom;
        let atoms = [];
        let bonds = [];

        let p = new structures.Point(atom.x, atom.y);
        let a = this.getOptimumAngle(atom);
        let prev = atom;
        for ( let k = 0; k < lengthChain; k++) {
            let ause = a + (k % 2 === 1 ? m.PI / 3 : 0);
            p.x += this.sketcher.styles.bondLength_2D * m.cos(ause);
            p.y -= this.sketcher.styles.bondLength_2D * m.sin(ause);
            let use = new structures.Atom('C', p.x, p.y);
            let minDist = Infinity;
            let closest;
            for (let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                let mol = this.sketcher.molecules[i];
                for (let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let at = mol.atoms[j];
                    let dist = at.distance(use);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = at;
                    }
                }
            }
            if (minDist < 5) {
                use = closest;
            } else {
                atoms.push(use);
            }
            if (!this.sketcher.bondExists(prev, use)) {
                bonds.push(new structures.Bond(prev, use));
            }
            prev = use;
        }

        this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, molIdentifier, atoms, bonds));

    };
    _.innerexit = function() {
        this.removeStartAtom();
    };
    _.innerdrag = function(e) {
        this.newMolAllowed = false;
        this.removeStartAtom();
        if (this.sketcher.hovering instanceof structures.Atom) {
            if (e.p.distance(this.sketcher.hovering) < 15) {
                let angle = this.getOptimumAngle(this.sketcher.hovering, this.bondOrder);
                let x = this.sketcher.hovering.x + this.sketcher.styles.bondLength_2D * m.cos(angle);
                let y = this.sketcher.hovering.y - this.sketcher.styles.bondLength_2D * m.sin(angle);
                this.sketcher.tempAtom = new structures.Atom('C', x, y, 0);
            } else {
                let closest;
                let distMin = 1000;
                for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                    let mol = this.sketcher.molecules[i];
                    for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                        let a = mol.atoms[j];
                        let dist = a.distance(e.p);
                        if (dist < 5 && (!closest || dist < distMin)) {
                            closest = a;
                            distMin = dist;
                        }
                    }
                }
                if (closest) {
                    this.sketcher.tempAtom = new structures.Atom('C', closest.x, closest.y, 0);
                } else if (monitor.ALT && monitor.SHIFT) {
                    this.sketcher.tempAtom = new structures.Atom('C', e.p.x, e.p.y, 0);
                } else {
                    let angle = this.sketcher.hovering.angle(e.p);
                    let length = this.sketcher.hovering.distance(e.p);
                    if (!monitor.SHIFT) {
                        length = this.sketcher.styles.bondLength_2D;
                    }
                    if (!monitor.ALT) {
                        let increments = m.floor((angle + m.PI / 12) / (m.PI / 6));
                        angle = increments * m.PI / 6;
                    }
                    this.sketcher.tempAtom = new structures.Atom('C', this.sketcher.hovering.x + length * m.cos(angle), this.sketcher.hovering.y - length * m.sin(angle), 0);
                }
            }
            for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                let mol = this.sketcher.molecules[i];
                for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let a = mol.atoms[j];
                    if (a.distance(this.sketcher.tempAtom) < 5) {
                        this.sketcher.tempAtom.x = a.x;
                        this.sketcher.tempAtom.y = a.y;
                        this.sketcher.tempAtom.isOverlap = true;
                    }
                }
            }
            this.sketcher.renderer.redraw();
        }
    };
    _.innerclick = function(e) {
        if (!this.sketcher.hovering && this.newMolAllowed) {
            this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom('C', e.p.x, e.p.y) ], []));
            if (!this.sketcher.isMobile) {
                this.mousemove(e);
            }
            this.newMolAllowed = false;
        }
    };
    _.innermousedown = function(e) {
        this.newMolAllowed = true;
        if (this.sketcher.hovering instanceof structures.Atom) {
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering.isSelected_old = true;
            this.drag(e);
        } else if (this.sketcher.hovering instanceof structures.Bond) {
            this.sketcher.hovering.isHover = false;
            this.incrementBondOrder(this.sketcher.hovering);
            for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                this.sketcher.molecules[i].check();
            }
            this.sketcher.renderer.redraw();
        }else if(!this.sketcher.hovering && !this.sketcher.requireStartingAtom){
            this.placeRequiredAtom(e);
        }
    };
    _.innermouseup = function(e) {
        if (this.sketcher.tempAtom && this.sketcher.hovering) {
            let atoms = [];
            let bonds = [];
            let makeBond = true;
            if (this.sketcher.tempAtom.isOverlap) {
                for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                    let mol = this.sketcher.molecules[i];
                    for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                        let a = mol.atoms[j];
                        if (a.distance(this.sketcher.tempAtom) < 5) {
                            this.sketcher.tempAtom = a;
                        }
                    }
                }
                let bond = this.sketcher.getBond(this.sketcher.hovering, this.sketcher.tempAtom);
                if (bond) {
                    this.incrementBondOrder(bond);
                    makeBond = false;
                }
            } else {
                atoms.push(this.sketcher.tempAtom);
            }
            if (makeBond) {
                bonds[0] = new structures.Bond(this.sketcher.hovering, this.sketcher.tempAtom, this.bondOrder);
                bonds[0].stereo = this.stereo;
                this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, bonds[0].a1, atoms, bonds));
            }
        }
        this.sketcher.tempAtom = undefined;
        if (!this.sketcher.isMobile) {
            this.mousemove(e);
        }
    };
    _.innermousemove = function(e) {
        if (this.sketcher.tempAtom) {
            return;
        }
        this.findHoveredObject(e.p, true, true);
        if (this.sketcher.startAtom) {
            if (this.sketcher.hovering) {
                this.sketcher.startAtom.x = -10;
                this.sketcher.startAtom.y = -10;
            } else {
                this.sketcher.startAtom.x = e.p.x;
                this.sketcher.startAtom.y = e.p.y;
            }
        }
    };
    _.innermouseout = function(e) {
        this.removeStartAtom();
    };

})(Chemio.monitor, Chemio.uis.actions, Chemio.uis.states, Chemio.structures, Math);
(function(math, monitor, actions, states, structures, m, undefined) {
    'use strict';
    states.NewChainState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.NewChainState.prototype = new states._State();
    _.getChain = function(pivot, end) {
        if (monitor.SHIFT) {
            let difx = end.x - pivot.x;
            let dify = end.y - pivot.y;
            if (m.abs(difx) > m.abs(dify)) {
                end.x = pivot.x+difx;
                end.y = pivot.y;
            } else {
                end.x = pivot.x;
                end.y = pivot.y+dify;
            }
        }
        let chain = [];
        let beginning = pivot;
        let angle = 2 * m.PI - pivot.angle(end);
        if(!monitor.SHIFT && !monitor.ALT){
            let remainder = angle % (m.PI / 24);
            angle -= remainder;
        }
        let blength = this.sketcher.styles.bondLength_2D;
        let length =  m.floor(pivot.distance(end) / (blength * m.cos(m.PI / 6)));
        let flip = m.round(angle / (m.PI / 24)) % 2 == 1;
        if (flip) {
            angle -= m.PI / 24;
        }
        if (this.flipOverride) {
            flip = !flip;
        }
        for (let i = 0; i < length; i++) {
            let angleAdd = m.PI / 6 * (flip ? 1 : -1);
            if ((i & 1) == 1) {
                angleAdd *= -1;
            }
            let newX = beginning.x + blength * m.cos(angle + angleAdd);
            let newY = beginning.y + blength * m.sin(angle + angleAdd);
            beginning = new structures.Atom('C', newX, newY);
            chain.push(beginning);
        }

        let allAs = this.sketcher.getAllAtoms();
        for ( let i = 0, ii = allAs.length; i < ii; i++) {
            allAs[i].isOverlap = false;
        }
        for ( let i = 0, ii = chain.length; i < ii; i++) {
            let minDist = Infinity;
            let closest;
            for ( let k = 0, kk = allAs.length; k < kk; k++) {
                let dist = allAs[k].distance(chain[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closest = allAs[k];
                }
            }
            if (minDist < 5) {
                chain[i] = closest;
                closest.isOverlap = true;
            }
        }
        return chain;
    };

    _.innerexit = function() {
        this.removeStartAtom();
    };
    _.innerdrag = function(e) {
        this.newMolAllowed = false;
        this.removeStartAtom();
        if (this.sketcher.hovering) {
            // send in a copy of e.p as the getChain function does change the point if shift is held
            this.sketcher.tempChain = this.getChain(this.sketcher.hovering, new structures.Point(e.p.x, e.p.y));
            this.sketcher.renderer.redraw();
        }
    };
    _.innerclick = function(e) {
        if (!this.sketcher.hovering && this.newMolAllowed) {
            this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom('C', e.p.x, e.p.y) ], []));
            if (!this.sketcher.isMobile) {
                this.mousemove(e);
            }
            this.newMolAllowed = false;
        }
    };
    _.innermousedown = function(e) {
        this.newMolAllowed = true;
        if (this.sketcher.hovering) {
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering.isSelected_old = true;
            this.drag(e);
        }else if(!this.sketcher.requireStartingAtom){
            this.placeRequiredAtom(e);
        }
    };
    _.innermouseup = function(e) {
        if (this.sketcher.tempChain && this.sketcher.hovering && this.sketcher.tempChain.length!==0) {
            let atoms = [];
            let bonds = [];
            let allAs = this.sketcher.getAllAtoms();
            for ( let i = 0, ii = this.sketcher.tempChain.length; i < ii; i++) {
                if (allAs.indexOf(this.sketcher.tempChain[i]) === -1) {
                    atoms.push(this.sketcher.tempChain[i]);
                }
                if (i!=0 && !this.sketcher.bondExists(this.sketcher.tempChain[i - 1], this.sketcher.tempChain[i])) {
                    bonds.push(new structures.Bond(this.sketcher.tempChain[i - 1], this.sketcher.tempChain[i]));
                }
            }
            if (!this.sketcher.bondExists(this.sketcher.tempChain[0], this.sketcher.hovering)) {
                bonds.push(new structures.Bond(this.sketcher.tempChain[0], this.sketcher.hovering));
            }
            if (atoms.length !== 0 || bonds.length !== 0) {
                this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, this.sketcher.hovering, atoms, bonds));
            }
            for ( let j = 0, jj = allAs.length; j < jj; j++) {
                allAs[j].isOverlap = false;
            }
        }
        this.sketcher.tempChain = undefined;
        if (!this.sketcher.isMobile) {
            this.mousemove(e);
        }
    };
    _.innermousemove = function(e) {
        if (this.sketcher.tempAtom) {
            return;
        }
        this.findHoveredObject(e.p, true);
        if (this.sketcher.startAtom) {
            if (this.sketcher.hovering) {
                this.sketcher.startAtom.x = -10;
                this.sketcher.startAtom.y = -10;
            } else {
                this.sketcher.startAtom.x = e.p.x;
                this.sketcher.startAtom.y = e.p.y;
            }
        }
    };
    _.innermouseout = function(e) {
        this.removeStartAtom();
    };

})(Chemio.math, Chemio.monitor, Chemio.uis.actions, Chemio.uis.states, Chemio.structures, Math);
(function(math, monitor, actions, states, structures, m, undefined) {
    'use strict';
    states.NewRingState = function(sketcher) {
        this.setup(sketcher);
    };
    let _ = states.NewRingState.prototype = new states._State();
    _.numSides = 6;
    _.unsaturated = false;
    _.getRing = function(a, numSides, bondLength, angle, setOverlaps) {
        let innerAngle = m.PI - 2 * m.PI / numSides;
        angle += innerAngle / 2;
        let ring = [];
        for ( let i = 0; i < numSides - 1; i++) {
            let p = i === 0 ? new structures.Atom('C', a.x, a.y) : new structures.Atom('C', ring[ring.length - 1].x, ring[ring.length - 1].y);
            p.x += bondLength * m.cos(angle);
            p.y -= bondLength * m.sin(angle);
            ring.push(p);
            angle += m.PI + innerAngle;
        }
        for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
            let mol = this.sketcher.molecules[i];
            for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                mol.atoms[j].isOverlap = false;
            }
        }
        for ( let i = 0, ii = ring.length; i < ii; i++) {
            let minDist = Infinity;
            let closest;
            for ( let k = 0, kk = this.sketcher.molecules.length; k < kk; k++) {
                let mol = this.sketcher.molecules[k];
                for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let dist = mol.atoms[j].distance(ring[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = mol.atoms[j];
                    }
                }
            }
            if (minDist < 5) {
                ring[i] = closest;
                if (setOverlaps) {
                    closest.isOverlap = true;
                }
            }
        }
        return ring;
    };
    _.getOptimalRing = function(b, numSides) {
        let innerAngle = m.PI / 2 - m.PI / numSides;
        let bondLength = b.a1.distance(b.a2);
        let ring1 = this.getRing(b.a1, numSides, bondLength, b.a1.angle(b.a2) - innerAngle, false);
        let ring2 = this.getRing(b.a2, numSides, bondLength, b.a2.angle(b.a1) - innerAngle, false);
        let dist1 = 0, dist2 = 0;
        for ( let i = 1, ii = ring1.length; i < ii; i++) {
            for ( let k = 0, kk = this.sketcher.molecules.length; k < kk; k++) {
                let mol = this.sketcher.molecules[k];
                for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                    let d1 = mol.atoms[j].distance(ring1[i]);
                    let d2 = mol.atoms[j].distance(ring2[i]);
                    dist1 += m.min(1E8, 1 / (d1 * d1));
                    dist2 += m.min(1E8, 1 / (d2 * d2));
                }
            }
        }
        if (dist1 < dist2) {
            return ring1;
        } else {
            return ring2;
        }
    };
    _.attachToBond = function(b, numSides) {
        let molIdentifier = b.a1;
        let atoms = [];
        let bonds = [];
        let ring = this.sketcher.stateManager.STATE_NEW_RING.getOptimalRing(b, numSides);
        let start = b.a2;
        let end = b.a1;
        let mol = this.sketcher.getMoleculeByAtom(start);
        if (ring[0] === b.a1) {
            start = b.a1;
            end = b.a2;
        }
        if (mol.atoms.indexOf(ring[1]) === -1) {
            atoms.push(ring[1]);
        }
        if (!this.sketcher.bondExists(start, ring[1])) {
            bonds.push(new structures.Bond(start, ring[1]));
        }
        for ( let i = 2, ii = ring.length; i < ii; i++) {
            if (mol.atoms.indexOf(ring[i]) === -1) {
                atoms.push(ring[i]);
            }
            if (!this.sketcher.bondExists(ring[i - 1], ring[i])) {
                bonds.push(new structures.Bond(ring[i - 1], ring[i]));
            }
        }
        if (!this.sketcher.bondExists(ring[ring.length - 1], end)) {
            bonds.push(new structures.Bond(ring[ring.length - 1], end));
        }
        if (atoms.length !== 0 || bonds.length !== 0) {
            this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, molIdentifier, atoms, bonds));
        }
    };
    _.attachToAtom = function (a, numSides) {
        let molIdentifier = this.sketcher.hovering;
        let atoms = [];
        let bonds = [];
        let mol = this.sketcher.getMoleculeByAtom(this.sketcher.hovering);
        let angles = mol.getAngles(this.sketcher.hovering);
        let angle = 3 * m.PI / 2;
        if (angles.length !== 0) {
            angle = math.angleBetweenLargest(angles).angle;
        }
        let ring = this.getRing(this.sketcher.hovering, numSides, this.sketcher.styles.bondLength_2D, angle, false);
        if (mol.atoms.indexOf(ring[0]) === -1) {
            atoms.push(ring[0]);
        }
        if (!this.sketcher.bondExists(this.sketcher.hovering, ring[0])) {
            bonds.push(new structures.Bond(this.sketcher.hovering, ring[0]));
        }
        for ( let i = 1, ii = ring.length; i < ii; i++) {
            if (mol.atoms.indexOf(ring[i]) === -1) {
                atoms.push(ring[i]);
            }
            if (!this.sketcher.bondExists(ring[i - 1], ring[i])) {
                bonds.push(new structures.Bond(ring[i - 1], ring[i]));
            }
        }
        if (!this.sketcher.bondExists(ring[ring.length - 1], this.sketcher.hovering)) {
            bonds.push(new structures.Bond(ring[ring.length - 1], this.sketcher.hovering));
        }
        if (atoms.length !== 0 || bonds.length !== 0) {
            this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, molIdentifier, atoms, bonds));
        }
    };

    _.innerexit = function() {
        this.removeStartAtom();
    };
    _.innerdrag = function(e) {
        this.newMolAllowed = false;
        this.removeStartAtom();
        function getHeight(n, startFromSide, standardLength) {
            let mpn = m.PI / n;
            let r = standardLength/ 2 / m.sin(mpn);
            let a = r * m.cos(mpn);
            let odd = n % 2 == 1;
            return odd ? a + r : startFromSide ? 2 * a : 2 * r;
        };
        if (this.sketcher.hovering instanceof structures.Atom) {
            let a = 0;
            let l = 0;
            let n = this.numSides;
            if(n === -1){
                a = this.sketcher.hovering.angle(e.p);
                l = this.sketcher.styles.bondLength_2D;
                n = 3;
                let dist = this.sketcher.hovering.distance(e.p);
                while (dist > getHeight(n + 1, false, l)) {
                    n++;
                }
                if (!monitor.ALT) {
                    let increments = m.floor((a + m.PI / 12) / (m.PI / 6));
                    a = increments * m.PI / 6;
                }
            }else if (e.p.distance(this.sketcher.hovering) < 15) {
                let angles = this.sketcher.getMoleculeByAtom(this.sketcher.hovering).getAngles(this.sketcher.hovering);
                if (angles.length === 0) {
                    a = 3 * m.PI / 2;
                } else {
                    a = math.angleBetweenLargest(angles).angle;
                }
                l = this.sketcher.styles.bondLength_2D;
            } else {
                a = this.sketcher.hovering.angle(e.p);
                l = this.sketcher.hovering.distance(e.p);
                if (!(monitor.ALT && monitor.SHIFT)) {
                    if (!monitor.SHIFT) {
                        l = this.sketcher.styles.bondLength_2D;
                    }
                    if (!monitor.ALT) {
                        let increments = m.floor((a + m.PI / 12) / (m.PI / 6));
                        a = increments * m.PI / 6;
                    }
                }
            }
            this.sketcher.tempRing = this.getRing(this.sketcher.hovering, n, l, a, true);
            this.sketcher.renderer.redraw();
        } else if (this.sketcher.hovering instanceof structures.Bond) {
            let dist = math.distanceFromPointToLineInclusive(e.p, this.sketcher.hovering.a1, this.sketcher.hovering.a2);
            let ringUse;
            let n = this.numSides;
            if(n === -1){
                n = 3;
                let dist = this.sketcher.hovering.getCenter().distance(e.p);
                let bondLength = this.sketcher.hovering.a1.distance(this.sketcher.hovering.a2);
                while (dist > getHeight(n + 1, true, bondLength)) {
                    n++;
                }
            }
            if (dist !== -1 && dist <= 7) {
                ringUse = this.getOptimalRing(this.sketcher.hovering, n);
            } else {
                let innerAngle = m.PI / 2 - m.PI / n;
                let bondLength = this.sketcher.hovering.a1.distance(this.sketcher.hovering.a2);
                let ring1 = this.getRing(this.sketcher.hovering.a1, n, bondLength, this.sketcher.hovering.a1.angle(this.sketcher.hovering.a2) - innerAngle, false);
                let ring2 = this.getRing(this.sketcher.hovering.a2, n, bondLength, this.sketcher.hovering.a2.angle(this.sketcher.hovering.a1) - innerAngle, false);
                let center1 = new structures.Point();
                let center2 = new structures.Point();
                for ( let i = 1, ii = ring1.length; i < ii; i++) {
                    center1.add(ring1[i]);
                    center2.add(ring2[i]);
                }
                center1.x /= (ring1.length - 1);
                center1.y /= (ring1.length - 1);
                center2.x /= (ring2.length - 1);
                center2.y /= (ring2.length - 1);
                let dist1 = center1.distance(e.p);
                let dist2 = center2.distance(e.p);
                ringUse = ring2;
                if (dist1 < dist2) {
                    ringUse = ring1;
                }
            }
            for ( let j = 1, jj = ringUse.length; j < jj; j++) {
                if (this.sketcher.getAllAtoms().indexOf(ringUse[j]) !== -1) {
                    ringUse[j].isOverlap = true;
                }
            }
            this.sketcher.tempRing = ringUse;
            this.sketcher.renderer.redraw();
        }
    };
    _.innerclick = function(e) {
        if (!this.sketcher.hovering && this.newMolAllowed) {
            this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom('C', e.p.x, e.p.y) ], []));
            if (!this.sketcher.isMobile) {
                this.mousemove(e);
            }
            this.newMolAllowed = false;
        }
    };
    _.innermousedown = function(e) {
        this.newMolAllowed = true;
        if (this.sketcher.hovering) {
            this.sketcher.hovering.isHover = false;
            this.sketcher.hovering.isSelected_old = true;
            this.drag(e);
        }else if(!this.sketcher.requireStartingAtom){
            this.placeRequiredAtom(e);
        }
    };
    _.innermouseup = function(e) {
        if (this.sketcher.tempRing && this.sketcher.hovering) {
            let atoms = [];
            let bonds = [];
            let allAs = this.sketcher.getAllAtoms();
            let unsat = this.unsaturated || this.numSides===-1 && monitor.SHIFT;
            if (this.sketcher.hovering instanceof structures.Atom) {
                if (allAs.indexOf(this.sketcher.tempRing[0]) === -1) {
                    atoms.push(this.sketcher.tempRing[0]);
                }
                if (!this.sketcher.bondExists(this.sketcher.hovering, this.sketcher.tempRing[0])) {
                    bonds.push(new structures.Bond(this.sketcher.hovering, this.sketcher.tempRing[0]));
                }
                for ( let i = 1, ii = this.sketcher.tempRing.length; i < ii; i++) {
                    let ai = this.sketcher.tempRing[i];
                    let aip = this.sketcher.tempRing[i-1];
                    if (allAs.indexOf(ai) === -1) {
                        atoms.push(ai);
                    }
                    if (!this.sketcher.bondExists(aip, ai)) {
                        bonds.push(new structures.Bond(aip, ai, unsat && i % 2 === 1 && ai.getImplicitHydrogenCount()>1 && aip.getImplicitHydrogenCount()>1 ? 2 : 1));
                    }
                }
                if (!this.sketcher.bondExists(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], this.sketcher.hovering)) {
                    bonds.push(new structures.Bond(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], this.sketcher.hovering, unsat && this.sketcher.tempRing.length%2===1 && this.sketcher.tempRing[this.sketcher.tempRing.length - 1].getImplicitHydrogenCount()>1 && this.sketcher.hovering.getImplicitHydrogenCount()>1 ? 2 : 1));
                }
            } else if (this.sketcher.hovering instanceof structures.Bond) {
                let start = this.sketcher.hovering.a2;
                let end = this.sketcher.hovering.a1;
                if (this.sketcher.tempRing[0] === this.sketcher.hovering.a1) {
                    start = this.sketcher.hovering.a1;
                    end = this.sketcher.hovering.a2;
                }
                if (allAs.indexOf(this.sketcher.tempRing[1]) === -1) {
                    atoms.push(this.sketcher.tempRing[1]);
                }
                if (!this.sketcher.bondExists(start, this.sketcher.tempRing[1])) {
                    bonds.push(new structures.Bond(start, this.sketcher.tempRing[1]));
                }
                for ( let i = 2, ii = this.sketcher.tempRing.length; i < ii; i++) {
                    let ai = this.sketcher.tempRing[i];
                    let aip = this.sketcher.tempRing[i - 1];
                    if (allAs.indexOf(ai) === -1) {
                        atoms.push(ai);
                    }
                    if (!this.sketcher.bondExists(aip, ai)) {
                        bonds.push(new structures.Bond(aip, ai, unsat && i % 2 === 0 && ai.getImplicitHydrogenCount()>1 && aip.getImplicitHydrogenCount()>1 ? 2 : 1));
                    }
                }
                if (!this.sketcher.bondExists(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], end)) {
                    bonds.push(new structures.Bond(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], end, unsat && this.sketcher.tempRing.length % 2 === 0 && this.sketcher.tempRing[this.sketcher.tempRing.length - 1].getImplicitHydrogenCount()>1 && end.getImplicitHydrogenCount()>1 ? 2 : 1));
                }
            }
            if (atoms.length !== 0 || bonds.length !== 0) {
                this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, bonds[0].a1, atoms, bonds));
            }
            for ( let j = 0, jj = allAs.length; j < jj; j++) {
                allAs[j].isOverlap = false;
            }
        }
        this.sketcher.tempRing = undefined;
        if (!this.sketcher.isMobile) {
            this.mousemove(e);
        }
    };
    _.innermousemove = function(e) {
        if (this.sketcher.tempAtom) {
            return;
        }
        this.findHoveredObject(e.p, true, true);
        if (this.sketcher.startAtom) {
            if (this.sketcher.hovering) {
                this.sketcher.startAtom.x = -10;
                this.sketcher.startAtom.y = -10;
            } else {
                this.sketcher.startAtom.x = e.p.x;
                this.sketcher.startAtom.y = e.p.y;
            }
        }
    };
    _.innermouseout = function(e) {
        this.removeStartAtom();
    };

})(Chemio.math, Chemio.monitor, Chemio.uis.actions, Chemio.uis.states, Chemio.structures, Math);
(function(math, monitor, structures, d2, actions, states, m, undefined) {
    'use strict';
    states.ShapeState = function(sketcher) {
        this.setup(sketcher);
        this.dontTranslateOnDrag = true;
    };
    let _ = states.ShapeState.prototype = new states._State();
    _.shapeType = states.ShapeState.ARROW_SYNTHETIC;
    _.superDoubleClick = _.dblclick;
    _.dblclick = function(e) {
        // override double click not to center when editing shapes
        if (!this.control) {
            this.superDoubleClick(e);
        }
    };
    _.innerexit = function(e) {
        // set it back to line to remove graphical controls for other shapes
        this.shapeType = states.ShapeState.LINE;
        this.sketcher.renderer.redraw();
    };
    _.innermousemove = function(e) {
        this.control = undefined;
        // if (this.shapeType === states.ShapeState.BRACKET) {
        //     let size = 6;
        //     for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
        //         let s = this.sketcher.shapes[i];
        //         if (s instanceof d2.Bracket) {
        //             let minX = m.min(s.p1.x, s.p2.x);
        //             let maxX = m.max(s.p1.x, s.p2.x);
        //             let minY = m.min(s.p1.y, s.p2.y);
        //             let maxY = m.max(s.p1.y, s.p2.y);
        //             let hits = [];
        //             hits.push({
        //                 x : maxX + 5,
        //                 y : minY + 15,
        //                 v : 1
        //             });
        //             hits.push({
        //                 x : maxX + 5,
        //                 y : maxY + 15,
        //                 v : 2
        //             });
        //             hits.push({
        //                 x : minX - 17,
        //                 y : (minY + maxY) / 2 + 15,
        //                 v : 3
        //             });
        //             for ( let j = 0, jj = hits.length; j < jj; j++) {
        //                 let h = hits[j];
        //                 if (math.isBetween(e.p.x, h.x, h.x + size * 2) && math.isBetween(e.p.y, h.y - size, h.y)) {
        //                     this.control = {
        //                         s : s,
        //                         t : h.v
        //                     };
        //                     break;
        //                 } else if (math.isBetween(e.p.x, h.x, h.x + size * 2) && math.isBetween(e.p.y, h.y + size, h.y + size * 2)) {
        //                     this.control = {
        //                         s : s,
        //                         t : -1 * h.v
        //                     };
        //                     break;
        //                 }
        //             }
        //             if (this.control) {
        //                 break;
        //             }
        //         }
        //     }
        //     this.sketcher.repaint();
        // }
    };
    _.innermousedown = function(e) {
        if (this.control) {
            // this.sketcher.historyManager.pushUndo(new actions.ChangeBracketAttributeAction(this.control.s, this.control.t));
            this.sketcher.renderer.redraw();
        } else {
            this.start = new structures.Point(e.p.x, e.p.y);
            this.end = this.start;
        }
    };
    _.innerdrag = function(e) {
        this.end = new structures.Point(e.p.x, e.p.y);
        if (this.shapeType === states.ShapeState.BRACKET) {
            if (monitor.SHIFT) {
                let difx = this.end.x - this.start.x;
                let dify = this.end.y - this.start.y;
                if (difx < 0 && dify > 0) {
                    dify *= -1;
                } else if (difx > 0 && dify < 0) {
                    difx *= -1;
                }
                let difuse = dify;
                if (m.abs(difx) < m.abs(dify)) {
                    difuse = difx;
                }
                this.end.x = this.start.x + difuse;
                this.end.y = this.start.y + difuse;
            }
        } else {
            if (!monitor.ALT) {
                let angle = this.start.angle(this.end);
                let length = this.start.distance(this.end);
                if (!monitor.ALT) {
                    let increments = m.floor((angle + m.PI / 12) / (m.PI / 6));
                    angle = increments * m.PI / 6;
                }
                this.end.x = this.start.x + length * m.cos(angle);
                this.end.y = this.start.y - length * m.sin(angle);
            }
        }
        this.sketcher.renderer.redraw();
    };
    _.innermouseup = function(e) {
        if (this.start && this.end) {
            let shape;
            if (this.start.distance(this.end) > 5) {
                if (this.shapeType >= states.ShapeState.LINE && this.shapeType <= states.ShapeState.ARROW_EQUILIBRIUM) {
                    shape = new d2.Line(this.start, this.end);
                    if (this.shapeType === states.ShapeState.ARROW_SYNTHETIC) {
                        shape.arrowType = d2.Line.ARROW_SYNTHETIC;
                    } else if (this.shapeType === states.ShapeState.ARROW_RETROSYNTHETIC) {
                        shape.arrowType = d2.Line.ARROW_RETROSYNTHETIC;
                    } else if (this.shapeType === states.ShapeState.ARROW_RESONANCE) {
                        shape.arrowType = d2.Line.ARROW_RESONANCE;
                    } else if (this.shapeType === states.ShapeState.ARROW_EQUILIBRIUM) {
                        shape.arrowType = d2.Line.ARROW_EQUILIBRIUM;
                    }
                } else if (this.shapeType === states.ShapeState.BRACKET) {
                    shape = new d2.Bracket(this.start, this.end);
                }
            }
            this.start = undefined;
            this.end = undefined;
            if (shape) {
                this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, shape));
            }
        }
    };
    // function drawBracketControl(ctx, styles, x, y, control, type) {
    //     let size = 6;
    //     if (control && m.abs(control.t) === type) {
    //         ctx.fillStyle = styles.colorHover;
    //         ctx.beginPath();
    //         if (control.t > 0) {
    //             ctx.moveTo(x, y);
    //             ctx.lineTo(x + size, y - size);
    //             ctx.lineTo(x + size * 2, y);
    //         } else {
    //             ctx.moveTo(x, y + size);
    //             ctx.lineTo(x + size, y + size * 2);
    //             ctx.lineTo(x + size * 2, y + size);
    //         }
    //         ctx.closePath();
    //         ctx.fill();
    //     }
    //     ctx.strokeStyle = 'blue';
    //     ctx.beginPath();
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(x + size, y - size);
    //     ctx.lineTo(x + size * 2, y);
    //     ctx.moveTo(x, y + size);
    //     ctx.lineTo(x + size, y + size * 2);
    //     ctx.lineTo(x + size * 2, y + size);
    //     ctx.stroke();
    // }
    _.draw = function(ctx, styles) {
        if (this.start && this.end) {
            ctx.strokeStyle = styles.colorPreview;
            ctx.fillStyle = styles.colorPreview;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.start.x, this.start.y);
            // if (this.shapeType === states.ShapeState.BRACKET) {
            //     ctx.lineTo(this.end.x, this.start.y);
            //     ctx.lineTo(this.end.x, this.end.y);
            //     ctx.lineTo(this.start.x, this.end.y);
            //     ctx.lineTo(this.start.x, this.start.y);
            // } else
            {
                ctx.lineTo(this.end.x, this.end.y);
            }
            ctx.setLineDash([2]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // else if (this.shapeType === states.ShapeState.BRACKET) {
        //     ctx.lineWidth = 2;
        //     ctx.lineJoin = 'miter';
        //     ctx.lineCap = 'butt';
        //     for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
        //         let s = this.sketcher.shapes[i];
        //         if (s instanceof d2.Bracket) {
        //             let minX = m.min(s.p1.x, s.p2.x);
        //             let maxX = m.max(s.p1.x, s.p2.x);
        //             let minY = m.min(s.p1.y, s.p2.y);
        //             let maxY = m.max(s.p1.y, s.p2.y);
        //             let c = this.control && this.control.s === s ? this.control : undefined;
        //             drawBracketControl(ctx, styles, maxX + 5, minY + 15, c, 1);
        //             drawBracketControl(ctx, styles, maxX + 5, maxY + 15, c, 2);
        //             drawBracketControl(ctx, styles, minX - 17, (minY + maxY) / 2 + 15, c, 3);
        //         }
        //     }
        // }

    };

    states.ShapeState.LINE = 1;
    states.ShapeState.ARROW_SYNTHETIC = 2;
    states.ShapeState.ARROW_RETROSYNTHETIC = 3;
    states.ShapeState.ARROW_RESONANCE = 4;
    states.ShapeState.ARROW_EQUILIBRIUM = 5;
    states.ShapeState.BRACKET = 10;

})(Chemio.math, Chemio.monitor, Chemio.structures, Chemio.structures.d2, Chemio.uis.actions, Chemio.uis.states, Math);

//region Unused states
// (function(extensions, math, structures, d2, actions, states, m, undefined) {
// 	'use strict';
// 	let controlsize = 4;
//
// 	states.DynamicBracketState = function(sketcher) {
// 		this.setup(sketcher);
// 		this.dontTranslateOnDrag = true;
// 	};
// 	let _ = states.DynamicBracketState.prototype = new states._State();
// 	_.superDoubleClick = _.dblclick;
// 	_.dblclick = function(e) {
// 		// override double click not to center when editing controls
// 		if (!this.control) {
// 			this.superDoubleClick(e);
// 		}
// 	};
// 	_.innermousedown = function(e) {
// 		if (this.control) {
// 			// this part controls the limits
// 			let cont = true;
// 			let c = this.control.t > 0 ? 1 : -1;
// 			switch (m.abs(this.control.t)) {
// 			case 1:{
// 					let nn = this.control.s.n1 + c;
// 					if(nn<0 || nn>this.control.s.n2){
// 						cont = false;
// 					}
// 					break;
// 				}
// 			case 2:{
// 					let nn = this.control.s.n2 + c;
// 					if(nn>20 || nn<this.control.s.n1){
// 						cont = false;
// 					}
// 					break;
// 				}
// 			}
// 			if(cont){
// 				this.sketcher.historyManager.pushUndo(new actions.ChangeDynamicBracketAttributeAction(this.control.s, this.control.t));
// 				this.sketcher.repaint();
// 			}
// 		} else if (this.sketcher.hovering && this.start!==this.sketcher.hovering && this.sketcher.hovering instanceof structures.Bond) {
// 			if(!this.start){
// 				this.start = this.sketcher.hovering;
// 			}
// 		}else{
// 			this.start = undefined;
// 			this.end = undefined;
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innerdrag = function(e) {
// 		this.control = undefined;
// 		if (this.start) {
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 			this.findHoveredObject(e.p, false, true);
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innermouseup = function(e) {
// 		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
// 			let dup;
// 			let remove = false;
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if (s instanceof d2.DynamicBracket) {
// 					if (s.b1 === this.start && s.b2 === this.sketcher.hovering || s.b2 === this.start && s.b1 === this.sketcher.hovering) {
// 						dup = s;
// 						remove = true;
// 					}
// 				}
// 			}
// 			if (dup) {
// 				if (remove) {
// 					this.sketcher.historyManager.pushUndo(new actions.DeleteShapeAction(this.sketcher, dup));
// 				}
// 				this.start = undefined;
// 				this.end = undefined;
// 				this.sketcher.repaint();
// 			} else {
// 				let shape = new d2.DynamicBracket(this.start, this.sketcher.hovering);
// 				this.start = undefined;
// 				this.end = undefined;
// 				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, shape));
// 			}
// 		} else if(this.sketcher.hovering instanceof d2.DynamicBracket){
// 			this.sketcher.historyManager.pushUndo(new actions.FlipDynamicBracketAction(this.sketcher.hovering));
// 		} else {
// 			//this.start = undefined;
// 			//this.end = undefined;
// 			//this.sketcher.repaint();
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		this.control = undefined;
// 		if(this.start){
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 		}else{
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if (s instanceof d2.DynamicBracket && !s.error) {
// 					let hits = [];
// 					hits.push({
// 						x : s.textPos.x-1,
// 						y : s.textPos.y+6,
// 						v : 1
// 					});
// 					hits.push({
// 						x : s.textPos.x+13,
// 						y : s.textPos.y+6,
// 						v : 2
// 					});
// 					for ( let j = 0, jj = hits.length; j < jj; j++) {
// 						let h = hits[j];
// 						if (math.isBetween(e.p.x, h.x, h.x + controlsize * 2) && math.isBetween(e.p.y, h.y - controlsize, h.y+3)) {
// 							this.control = {
// 								s : s,
// 								t : h.v
// 							};
// 							break;
// 						} else if (math.isBetween(e.p.x, h.x, h.x + controlsize * 2) && math.isBetween(e.p.y, h.y + controlsize-2, h.y + controlsize * 2+3)) {
// 							this.control = {
// 								s : s,
// 								t : -1 * h.v
// 							};
// 							break;
// 						}
// 					}
// 					if (this.control) {
// 						break;
// 					}
// 				}
// 			}
// 		}
// 		if(this.control){
// 			this.clearHover();
// 		}else{
// 			this.findHoveredObject(e.p, false, true, true);
// 			if(this.sketcher.hovering && this.sketcher.hovering instanceof d2._Shape && !(this.sketcher.hovering instanceof d2.DynamicBracket)){
// 				this.clearHover();
// 			}
// 		}
// 		this.sketcher.repaint();
// 	};
// 	function drawBracketControl(ctx, styles, x, y, control, type) {
// 		if (control && m.abs(control.t) === type) {
// 			ctx.fillStyle = styles.colorHover;
// 			ctx.beginPath();
// 			if (control.t > 0) {
// 				ctx.moveTo(x, y);
// 				ctx.lineTo(x + controlsize, y - controlsize);
// 				ctx.lineTo(x + controlsize * 2, y);
// 			} else {
// 				ctx.moveTo(x, y + controlsize);
// 				ctx.lineTo(x + controlsize, y + controlsize * 2);
// 				ctx.lineTo(x + controlsize * 2, y + controlsize);
// 			}
// 			ctx.closePath();
// 			ctx.fill();
// 		}
// 		ctx.strokeStyle = 'blue';
// 		ctx.beginPath();
// 		ctx.moveTo(x, y);
// 		ctx.lineTo(x + controlsize, y - controlsize);
// 		ctx.lineTo(x + controlsize * 2, y);
// 		ctx.moveTo(x, y + controlsize);
// 		ctx.lineTo(x + controlsize, y + controlsize * 2);
// 		ctx.lineTo(x + controlsize * 2, y + controlsize);
// 		ctx.stroke();
// 	}
// 	_.draw = function(ctx, styles) {
// 		if (this.start && this.end) {
// 			ctx.strokeStyle = styles.colorPreview;
// 			ctx.fillStyle = styles.colorPreview;
// 			ctx.lineWidth = 1;
// 			let p1 = this.start.getCenter();
// 			let p2 = this.end;
// 			if (this.sketcher.hovering && this.sketcher.hovering !== this.start) {
// 				p2 = this.sketcher.hovering.getCenter();
// 			}
// 			ctx.beginPath();
// 			ctx.moveTo(p1.x, p1.y);
// 			ctx.lineTo(p2.x, p2.y);
// 			ctx.setLineDash([2]);
// 			ctx.stroke();
// 			ctx.setLineDash([]);
// 		}else {
// 			// controls
// 			ctx.lineWidth = 2;
// 			ctx.lineJoin = 'miter';
// 			ctx.lineCap = 'butt';
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if (s instanceof d2.DynamicBracket && !s.error) {
// 					let c = this.control && this.control.s === s ? this.control : undefined;
// 					drawBracketControl(ctx, styles, s.textPos.x-1, s.textPos.y+6, c, 1);
// 					drawBracketControl(ctx, styles, s.textPos.x+13, s.textPos.y+6, c, 2);
// 				}
// 			}
// 			if(this.sketcher.hovering && this.sketcher.hovering instanceof d2.DynamicBracket && this.sketcher.hovering.contents.flippable){
// 				let s = this.sketcher.hovering;
// 				ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
// 				ctx.fillStyle = styles.colorPreview;
// 				ctx.textAlign = 'left';
// 				ctx.textBaseline = 'bottom';
// 				ctx.fillText('flip?', s.textPos.x+(s.error?0:20), s.textPos.y);
// 			}
// 		}
// 	};
//
// })(Chemio.extensions, Chemio.math, Chemio.structures, Chemio.structures.d2, Chemio.uis.actions, Chemio.uis.states, Math);

// (function(actions, states, undefined) {
// 	'use strict';
// 	states.LonePairState = function(sketcher) {
// 		this.setup(sketcher);
// 	};
// 	let _ = states.LonePairState.prototype = new states._State();
// 	_.delta = 1;
// 	_.innermouseup = function(e) {
// 		if (this.delta < 0 && this.sketcher.hovering.numLonePair < 1) {
// 			return;
// 		}
// 		if (this.sketcher.hovering) {
// 			this.sketcher.historyManager.pushUndo(new actions.ChangeLonePairAction(this.sketcher.hovering, this.delta));
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		this.findHoveredObject(e.p, true, false);
// 	};
//
// })(Chemio.uis.actions, Chemio.uis.states);

// (function(math, monitor, actions, states, io, structures, m, undefined) {
// 	'use strict';
//
// 	let INTERPRETER = new io.JSONInterpreter();
//
// 	states.NewTemplateState = function(sketcher) {
// 		this.setup(sketcher);
// 		this.template = {"a":[{"x":270,"i":"a0","y":105},{"x":252.6795,"i":"a1","y":115},{"x":252.6795,"i":"a2","y":135},{"x":270,"i":"a3","y":145},{"x":287.3205,"i":"a4","y":135},{"x":287.3205,"i":"a5","y":115},{"x":270,"i":"a6","y":85},{"x":287.3205,"i":"a7","y":75},{"x":270,"i":"a8","y":165,"l":"O"},{"x":252.6795,"i":"a9","y":175},{"x":252.6795,"i":"a10","y":195},{"x":252.6795,"i":"a11","y":215},{"x":252.6795,"i":"a12","y":235,"l":"Si"},{"x":272.6795,"i":"a13","y":235},{"x":232.6795,"i":"a14","y":235},{"x":252.6795,"i":"a15","y":255}],"b":[{"b":0,"e":1,"i":"b0","o":2},{"b":1,"e":2,"i":"b1"},{"b":2,"e":3,"i":"b2","o":2},{"b":3,"e":4,"i":"b3"},{"b":4,"e":5,"i":"b4","o":2},{"b":5,"e":0,"i":"b5"},{"b":0,"e":6,"i":"b6"},{"b":6,"e":7,"i":"b7","o":2},{"b":3,"e":8,"i":"b8"},{"b":8,"e":9,"i":"b9"},{"b":9,"e":10,"i":"b10"},{"b":10,"e":11,"i":"b11","o":3},{"b":11,"e":12,"i":"b12"},{"b":12,"e":13,"i":"b13"},{"b":12,"e":14,"i":"b14"},{"b":12,"e":15,"i":"b15"}]};
// 		this.attachPos = 0;
// 	};
// 	let _ = states.NewTemplateState.prototype = new states._State();
// 	_.getTemplate = function(p) {
// 		let origin = this.sketcher.hovering;
// 		let newMol = INTERPRETER.molFrom(this.template);
// 		newMol.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
// 		let pivot = newMol.atoms[this.attachPos];
// 		let thrad = origin.angle(p);
// 		let rotate = true;
// 		if (!monitor.ALT) {
// 			if (origin.distance(p) < 15) {
// 				let angles = this.sketcher.getMoleculeByAtom(this.sketcher.hovering).getAngles(this.sketcher.hovering);
// 				if (angles.length === 0) {
// 					thrad = 0;
// 					rotate = false;
// 				} else if (angles.length === 1) {
// 					thrad = angles[0] + m.PI;
// 				} else {
// 					thrad = math.angleBetweenLargest(angles).angle;
// 				}
// 				let angles2 = newMol.getAngles(pivot);
// 				if (angles2.length === 1) {
// 					thrad -= angles2[0] + (angles.length === 1 ? m.PI / 3 : 0);
// 				} else {
// 					thrad -= math.angleBetweenLargest(angles2).angle + m.PI;
// 				}
// 			} else {
// 				let divider = m.round(thrad / (m.PI / 6));
// 				thrad = divider * m.PI / 6;
// 			}
// 		}
// 		let difx = origin.x-pivot.x;
// 		let dify = origin.y-pivot.y;
// 		for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
// 			let a = newMol.atoms[i];
// 			a.x+=difx;
// 			a.y+=dify;
// 		}
// 		if (rotate) {
// 			for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
// 				let a = newMol.atoms[i];
// 				let angleUse = a.angle(origin) + thrad;
// 				let distance = pivot.distance(a);
// 				if (monitor.SHIFT) {
// 					distance *= origin.distance(p) / this.sketcher.styles.bondLength_2D;
// 				}
// 				a.x = origin.x - m.cos(angleUse) * distance;
// 				a.y = origin.y + m.sin(angleUse) * distance;
// 			}
// 		}
// 		let allAs = this.sketcher.getAllAtoms();
// 		let allBs = this.sketcher.getAllBonds();
// 		for ( let j = 0, jj = allAs.length; j < jj; j++) {
// 			let a2 = allAs[j];
// 			a2.isOverlap = false;
// 			let hits = [];
// 			for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
// 				let a = newMol.atoms[i];
// 				if (a2.distance(a) < 5) {
// 					hits.push(i);
// 				}
// 			}
// 			// make sure to look for the closest, as several atoms may
// 			// try to merge onto a single atom...
// 			let closest = -1;
// 			for(let i = 0, ii = hits.length; i<ii; i++){
// 				let h = hits[i];
// 				if (closest === -1 || a2.distance(newMol.atoms[h]) < a2.distance(newMol.atoms[closest])) {
// 					closest = h;
// 				}
// 			}
// 			if (closest !== -1) {
// 				let a = newMol.atoms[closest];
// 				newMol.atoms.splice(closest,1);
// 				if (a2.x!==pivot.x || a2.y!==pivot.y) {
// 					a2.isOverlap = true;
// 				}
// 				for(let i = 0, ii = newMol.bonds.length; i<ii; i++){
// 					let b = newMol.bonds[i];
// 					if(b.a1===a){
// 						b.a1 = a2;
// 						b.tmpreplace1 = true;
// 					}else if(b.a2===a){
// 						b.a2 = a2;
// 						b.tmpreplace2 = true;
// 					}
// 					if(b.tmpreplace1 && b.tmpreplace2){
// 						// get rid of the bond if both atoms are overlapping
// 						// just double check that that bond doesn't exist even if the atoms have both been replaced
// 						let match = false;
// 						for(let k = 0, kk = allBs.length; k<kk; k++){
// 							let b2 = allBs[k];
// 							if(b.a1===b2.a1 && b.a2===b2.a2 || b.a2===b2.a1 && b.a1===b2.a2){
// 								match = true;
// 								break;
// 							}
// 						}
// 						if(match){
// 							newMol.bonds.splice(i--,1);
// 							ii--;
// 						}
// 					}
// 				}
// 			}
// 		}
// 		newMol.check();
// 		newMol.check(true);
// 		return newMol;
// 	};
//
// 	_.innerexit = function() {
// 		this.removeStartAtom();
// 	};
// 	_.innerdrag = function(e) {
// 		this.newMolAllowed = false;
// 		this.removeStartAtom();
// 		if (this.sketcher.hovering) {
// 			this.sketcher.tempTemplate = this.getTemplate(e.p);
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innerclick = function(e) {
// 		if (!this.sketcher.hovering && this.newMolAllowed) {
// 			this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom('C', e.p.x, e.p.y) ], []));
// 			if (!this.sketcher.isMobile) {
// 				this.mousemove(e);
// 			}
// 			this.newMolAllowed = false;
// 		}
// 	};
// 	_.innermousedown = function(e) {
// 		this.newMolAllowed = true;
// 		if (this.sketcher.hovering) {
// 			this.sketcher.hovering.isHover = false;
// 			this.sketcher.hovering.isSelected_old = true;
// 			this.drag(e);
// 		}else if(!this.sketcher.requireStartingAtom){
// 			this.placeRequiredAtom(e);
// 		}
// 	};
// 	_.innermouseup = function(e) {
// 		if (this.sketcher.hovering && this.sketcher.tempTemplate) {
// 			if(this.sketcher.tempTemplate.atoms.length!==0){
// 				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, this.sketcher.hovering, this.sketcher.tempTemplate.atoms, this.sketcher.tempTemplate.bonds));
// 			}
// 			let allAs = this.sketcher.getAllAtoms();
// 			for ( let i = 0, ii = allAs.length; i < ii; i++) {
// 				allAs[i].isOverlap = false;
// 			}
// 			this.sketcher.tempTemplate = undefined;
// 		}
// 		if (!this.sketcher.isMobile) {
// 			this.mousemove(e);
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		if (this.sketcher.tempAtom) {
// 			return;
// 		}
// 		this.findHoveredObject(e.p, true);
// 		if (this.sketcher.startAtom) {
// 			if (this.sketcher.hovering) {
// 				this.sketcher.startAtom.x = -10;
// 				this.sketcher.startAtom.y = -10;
// 			} else {
// 				this.sketcher.startAtom.x = e.p.x;
// 				this.sketcher.startAtom.y = e.p.y;
// 			}
// 		}
// 	};
// 	_.innermouseout = function(e) {
// 		this.removeStartAtom();
// 	};
//
// })(Chemio.math, Chemio.monitor, Chemio.uis.actions, Chemio.uis.states, Chemio.io, Chemio.structures, Math);

// (function(structures, d2, actions, states, undefined) {
// 	'use strict';
// 	states.PusherState = function(sketcher) {
// 		this.setup(sketcher);
// 		this.dontTranslateOnDrag = true;
// 	};
// 	let _ = states.PusherState.prototype = new states._State();
// 	_.numElectron = 1;
// 	_.innermousedown = function(e) {
// 		if (this.sketcher.hovering && this.start!==this.sketcher.hovering) {
// 			if(!this.start){
// 				this.start = this.sketcher.hovering;
// 			}
// 		}else{
// 			this.start = undefined;
// 			this.end = undefined;
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innerdrag = function(e) {
// 		if (this.start) {
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 			this.findHoveredObject(e.p, true, this.numElectron!=-10);
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innermouseup = function(e) {
// 		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
// 			let dup;
// 			let remove = false;
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if (s instanceof d2.Pusher) {
// 					if (s.o1 === this.start && s.o2 === this.sketcher.hovering) {
// 						dup = s;
// 					} else if (s.o2 === this.start && s.o1 === this.sketcher.hovering) {
// 						dup = s;
// 						remove = true;
// 					}
// 				}else if (s instanceof d2.AtomMapping) {
// 					if (s.o1 === this.start && s.o2 === this.sketcher.hovering || s.o2 === this.start && s.o1 === this.sketcher.hovering) {
// 						dup = s;
// 						remove = true;
// 					}
// 				}
// 			}
// 			if (dup) {
// 				if (remove) {
// 					this.sketcher.historyManager.pushUndo(new actions.DeleteShapeAction(this.sketcher, dup));
// 				}
// 				this.start = undefined;
// 				this.end = undefined;
// 				this.sketcher.repaint();
// 			} else {
// 				let shape;
// 				if(this.numElectron==-10){
// 					shape = new d2.AtomMapping(this.start, this.sketcher.hovering);
// 				}else{
// 					shape = new d2.Pusher(this.start, this.sketcher.hovering, this.numElectron);
// 				}
// 				this.start = undefined;
// 				this.end = undefined;
// 				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, shape));
// 			}
// 		} else {
// 			//this.start = undefined;
// 			//this.end = undefined;
// 			//this.sketcher.repaint();
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		if(this.start){
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 		}
// 		this.findHoveredObject(e.p, true, this.numElectron!=-10);
// 		this.sketcher.repaint();
// 	};
// 	_.draw = function(ctx, styles) {
// 		if (this.start && this.end) {
// 			ctx.strokeStyle = styles.colorPreview;
// 			ctx.fillStyle = styles.colorPreview;
// 			ctx.lineWidth = 1;
// 			let p1 = this.start instanceof structures.Atom ? this.start : this.start.getCenter();
// 			let p2 = this.end;
// 			if (this.sketcher.hovering && this.sketcher.hovering !== this.start) {
// 				p2 = this.sketcher.hovering instanceof structures.Atom ? this.sketcher.hovering : this.sketcher.hovering.getCenter();
// 			}
// 			ctx.beginPath();
// 			ctx.moveTo(p1.x, p1.y);
// 			ctx.lineTo(p2.x, p2.y);
// 			ctx.setLineDash([2]);
// 			ctx.stroke();
// 			ctx.setLineDash([]);
// 		}
// 	};
//
// })(Chemio.structures, Chemio.structures.d2, Chemio.uis.actions, Chemio.uis.states);

// (function(actions, states, structures, d2, undefined) {
// 	'use strict';
// 	states.QueryState = function(sketcher) {
// 		this.setup(sketcher);
// 	};
// 	let _ = states.QueryState.prototype = new states._State();
// 	_.innermouseup = function(e) {
// 		if (this.sketcher.hovering) {
// 			if(this.sketcher.hovering instanceof structures.Atom){
// 				this.sketcher.dialogManager.atomQueryDialog.setAtom(this.sketcher.hovering);
// 				this.sketcher.dialogManager.atomQueryDialog.open();
// 			}else if(this.sketcher.hovering instanceof structures.Bond){
// 				this.sketcher.dialogManager.bondQueryDialog.setBond(this.sketcher.hovering);
// 				this.sketcher.dialogManager.bondQueryDialog.open();
// 			}
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		this.findHoveredObject(e.p, true, true, false);
// 	};
//
// })(Chemio.uis.actions, Chemio.uis.states, Chemio.structures, Chemio.structures.d2);

// (function(actions, states, undefined) {
// 	'use strict';
// 	states.RadicalState = function(sketcher) {
// 		this.setup(sketcher);
// 	};
// 	let _ = states.RadicalState.prototype = new states._State();
// 	_.delta = 1;
// 	_.innermouseup = function(e) {
// 		if (this.delta < 0 && this.sketcher.hovering.numRadical < 1) {
// 			return;
// 		}
// 		if (this.sketcher.hovering) {
// 			this.sketcher.historyManager.pushUndo(new actions.ChangeRadicalAction(this.sketcher.hovering, this.delta));
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		this.findHoveredObject(e.p, true, false);
// 	};
//
// })(Chemio.uis.actions, Chemio.uis.states);

// (function(math, structures, d2, actions, states, undefined) {
// 	'use strict';
// 	states.VAPState = function(sketcher) {
// 		this.setup(sketcher);
// 		this.dontTranslateOnDrag = true;
// 	};
// 	let _ = states.VAPState.prototype = new states._State();
// 	_.innermousedown = function(e) {
// 		if(!this.sketcher.hovering && (!this.start || !(this.start instanceof d2.VAP))){
// 			// out of convenience, since the user cannot drag from the VAP asterisk and may accidentally try to, don't allow placement of another vap within 30 pixels
// 			let add = true;
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if(s instanceof d2.VAP && s.asterisk.distance(e.p)<30){
// 					add = false;
// 				}
// 			}
// 			if(add){
// 				let vap = new d2.VAP(e.p.x, e.p.y);
// 				if (!this.sketcher.isMobile) {
// 					vap.isHover = true;
// 					this.sketcher.hovering = vap;
// 				}
// 				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, vap));
// 			}
// 		}else if (this.sketcher.hovering && this.start!==this.sketcher.hovering) {
// 			if(this.sketcher.hovering.hoverBond){
// 				let vap = this.sketcher.hovering;
// 				if(vap.hoverBond===vap.substituent){
// 					let nbo = 1;
// 					if(vap.bondType===1 || vap.bondType===2){
// 						nbo = vap.bondType+1;
// 					}else if(vap.bondType===3){
// 						nbo = .5;
// 					}
// 					this.sketcher.historyManager.pushUndo(new actions.ChangeVAPOrderAction(vap, nbo));
// 				}else {
// 					this.sketcher.historyManager.pushUndo(new actions.ChangeVAPSubstituentAction(vap, this.sketcher.hovering.hoverBond));
// 				}
// 			}else if(!this.start){
// 				this.start = this.sketcher.hovering;
// 			}
// 		}else{
// 			this.start = undefined;
// 			this.end = undefined;
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innerdrag = function(e) {
// 		if (this.start) {
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 			this.findHoveredObject(e.p, this.start instanceof d2.VAP, false, this.start instanceof structures.Atom);
// 			this.sketcher.repaint();
// 		}
// 	};
// 	_.innermouseup = function(e) {
// 		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
// 			let vap = this.sketcher.hovering;
// 			let attach = this.start;
// 			if(attach instanceof d2.VAP){
// 				let tmp = vap;
// 				vap = attach;
// 				attach = tmp;
// 			}
// 			if(vap.substituent!==attach && vap.attachments.indexOf(attach)===-1){
// 				this.sketcher.historyManager.pushUndo(new actions.AddVAPAttachementAction(vap, attach, vap.substituent===undefined));
// 			}
// 			this.start = undefined;
// 			this.end = undefined;
// 			this.sketcher.repaint();
// 		} else {
// 			//this.start = undefined;
// 			//this.end = undefined;
// 			//this.sketcher.repaint();
// 		}
// 	};
// 	_.innermousemove = function(e) {
// 		if(this.start){
// 			this.end = new structures.Point(e.p.x, e.p.y);
// 			this.findHoveredObject(e.p, this.start instanceof d2.VAP, false, this.start instanceof structures.Atom);
// 		}else{
// 			this.findHoveredObject(e.p, true, true, true);
// 		}
// 		this.sketcher.repaint();
// 	};
// 	_.draw = function(ctx, styles) {
// 		if (this.start && this.end) {
// 			ctx.strokeStyle = styles.colorPreview;
// 			ctx.fillStyle = styles.colorPreview;
// 			ctx.lineWidth = 1;
// 			let p1 = this.start;
// 			let p2 = this.end;
// 			if (this.sketcher.hovering) {
// 				p2 = this.sketcher.hovering;
// 			}
// 			if(p1 instanceof d2.VAP){
// 				p1 = p1.asterisk;
// 			}
// 			if(p2 instanceof d2.VAP){
// 				p2 = p2.asterisk;
// 			}
// 			ctx.beginPath();
// 			ctx.moveTo(p1.x, p1.y);
// 			ctx.lineTo(p2.x, p2.y);
// 			ctx.setLineDash([2]);
// 			ctx.stroke();
// 			ctx.setLineDash([]);
// 		}
// 	};
// 	_.findHoveredObject = function(e, includeAtoms, includeVAPsBonds, includeVAPsAsterisks) {
// 		this.clearHover();
// 		let min = Infinity;
// 		let hovering;
// 		let hoverdist = 10;
// 		if (!this.sketcher.isMobile) {
// 			hoverdist /= this.sketcher.styles.scale;
// 		}
// 		if (includeAtoms) {
// 			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
// 				let mol = this.sketcher.molecules[i];
// 				for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
// 					let a = mol.atoms[j];
// 					a.isHover = false;
// 					let dist = e.p.distance(a);
// 					if (dist < hoverdist && dist < min) {
// 						min = dist;
// 						hovering = a;
// 					}
// 				}
// 			}
// 		}
// 		if (includeVAPsBonds) {
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if(s instanceof d2.VAP){
// 					s.hoverBond = undefined;
// 					if(s.substituent){
// 						let att = s.substituent;
// 						let dist = math.distanceFromPointToLineInclusive(e.p, s.asterisk, att, hoverdist/2);
// 						if (dist !== -1 && dist < hoverdist && dist < min) {
// 							min = dist;
// 							s.hoverBond = att;
// 							hovering = s;
// 						}
// 					}
// 					for ( let j = 0, jj = s.attachments.length; j < jj; j++) {
// 						let att = s.attachments[j];
// 						let dist = math.distanceFromPointToLineInclusive(e.p, s.asterisk, att, hoverdist/2);
// 						if (dist !== -1 && dist < hoverdist && dist < min) {
// 							min = dist;
// 							s.hoverBond = att;
// 							hovering = s;
// 						}
// 					}
// 				}
// 			}
// 		}
// 		if (includeVAPsAsterisks) {
// 			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
// 				let s = this.sketcher.shapes[i];
// 				if(s instanceof d2.VAP){
// 					s.isHover = false;
// 					let dist = e.p.distance(s.asterisk);
// 					if (dist < hoverdist && dist < min) {
// 						min = dist;
// 						hovering = s;
// 					}
// 				}
// 			}
// 		}
// 		if (hovering) {
// 			hovering.isHover = true;
// 			this.sketcher.hovering = hovering;
// 		}
// 	};
//
// })(Chemio.math, Chemio.structures, Chemio.structures.d2, Chemio.uis.actions, Chemio.uis.states);

//endregion
