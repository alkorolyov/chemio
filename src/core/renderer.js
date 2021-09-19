(function(render,ELEMENT, extensions, structures, math, m, window){
    'use strict';
    /**
     * @param {_Canvas} canvas
     */
    render.Renderer = function(canvas){
        this.canvas = canvas;
        this.options = {};
        this.requestedFrame = false;
        this.renderLoopStarted = false;
        this.debug = true;
    };

    let Rp = render.Renderer.prototype

    /**
     * Main function used to signal for canvas to
     * redraw when animation frame is ready
     * @param options
     */
    Rp.redraw = function(options) {
        if (options) {
            this.options.scaleCenterPosition = options.scaleCenterPosition ? options.scaleCenterPosition : this.options.scaleCenterPosition;
            this.options.mousePosition = options.mousePosition ? options.mousePosition : this.options.mousePosition;
        }
        this.requestedFrame = true;
    };

    /**
     * Starts render loop, through request animation frame
     * with callback render().
     */
    Rp.startRenderLoop = function() {
        if (this.renderLoopStarted) {
            return;
        } else {
            this.renderLoopStarted = true;
        }

        let self = this;
        let renderFn = function() {
            if (self.requestedFrame) {
                self._render();
                self.requestedFrame = false;
            }
            window.requestAnimationFrame(renderFn);
        };

        window.requestAnimationFrame(renderFn);
    };

    /**
     * Actual rendering happens here,
     * we never call this directly, see redraw()
     */
    Rp._render = function(){
        if(!(this.canvas.needRedraw)) return

        let canvas = this.canvas;
        let styles = this.canvas.styles;
        let ctx = this.canvas.context;
        let molecules = this.canvas.molecules;
        let mousePos = this.options.mousePosition;

        if (canvas.pixelRatio !== 1 && canvas.el.width === canvas.width) {
            this._adjustPixelRatio();
        }

        if (molecules.length !== 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();

            this._scale();

            for ( let i = 0, ii = molecules.length; i < ii; i++) {
                molecules[i].check(true);
                this.drawMolecule(molecules[i]);
            }

            // debug mouse position
            if (this.debug && mousePos) { ctx.fillStyle = styles.colorSelect; this.drawPoint(mousePos.x, mousePos.y); }

            ctx.restore();
        }

        // previous rendering comes from here
        // this.canvas.repaint();
    };

    Rp._scale = function() {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;
        let scaleCenter = this.options.scaleCenterPosition;
        // let x = scaleCenter ? scaleCenter.x : this.canvas.width/2;
        // let y = scaleCenter ? scaleCenter.y : this.canvas.height/2;
        let x = this.canvas.width/2;
        let y = this.canvas.height/2;

        ctx.translate(x, y);
        ctx.scale(styles.scale, styles.scale);
        ctx.translate(-x, -y);
    }

    Rp._adjustPixelRatio = function() {
        let canvas = this.canvas;
        let ctx = this.canvas.context;

        canvas.el.width = canvas.width * canvas.pixelRatio;
        canvas.el.height = canvas.height * canvas.pixelRatio;
        ctx.scale(canvas.pixelRatio, canvas.pixelRatio);
    }

    Rp.drawAtom = function(atom) {
        if (atom.isSelected) {
            this.drawAtomSelection(atom);
        }

        let labelVisible = atom.isLabelVisible(this.canvas.styles);

        if (labelVisible) {
            this.drawLabel(atom);
        }

        // debug atom coords
        if (this.debug) {
            let ctx = this.canvas.context; ctx.font = "2px arial"; ctx.fillStyle = 'red'; let coords = 'x:'+ atom.x.toFixed(1) + ' y:' + atom.y.toFixed(1); ctx.fillText(coords, atom.x, atom.y);
        }
    };

    Rp.drawAtomSelection = function(atom) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;
        ctx.fillStyle = styles.colorSelect
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, styles.atoms_selectRadius, 0, m.PI * 2, false);
        ctx.fill();
    };

    /**
     * Draws label including charge, isotope mass and implicit hydrogens
     * @param atom
     */
    Rp.drawLabel = function(atom) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;
        ctx.font = extensions.getFontString(styles.atoms_font_size_2D, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);

        ctx.fillStyle = this.getElementColor(atom.label, styles.atoms_useJMOLColors, styles.atoms_usePYMOLColors, styles.atoms_color);
        if (!ELEMENT[atom.label] || atom.error) {
            ctx.fillStyle = styles.colorError;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        atom.textBounds = {};

        this._drawSymbol(atom);

        if (atom.mass !== -1) {
            this._drawMass(atom);
        }

        if (atom.getImplicitHydrogenCount() > 0 && styles.atoms_implicitHydrogens_2D) {
            this._drawImplicitHs(atom);
        }

        if (atom.charge !== 0) {
            this._drawCharge(atom);
        }

        // debug atom label dimensions
        if (this.debug) {
            ctx.strokeStyle = 'red'; ctx.lineWidth = 0.05; let textBounds = Object.values(atom.textBounds);  for(let i = 0, ii = textBounds.length;i<ii; i++){ let r = textBounds[i];ctx.beginPath();ctx.rect(r.x, r.y, r.w, r.h); ctx.stroke(); }
        }
    };

    /**
     * Draws atom symbol
     * @param atom
     */
    Rp._drawSymbol = function(atom){
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;
        ctx.fillText(atom.label, atom.x, atom.y + 1);
        let symbolWidth = ctx.measureText(atom.label).width;

        atom.textBounds['Symbol'] = {
            x: atom.x - symbolWidth / 2,
            y: atom.y - styles.atoms_font_size_2D / 2 + 1,
            w: symbolWidth,
            h: styles.atoms_font_size_2D - 2
        };
    };

    Rp._drawMass = function(atom){
        let styles = this.canvas.styles;
        let ctx = this.canvas.context;
        let fontSave = ctx.font;
        ctx.font = extensions.getFontString(styles.atoms_font_size_2D * .7, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);

        let massWidth = ctx.measureText(atom.mass).width;
        let symbolWidth = atom.textBounds['Symbol'].w;
        ctx.fillText(atom.mass, atom.x - massWidth - .5, atom.y - styles.atoms_font_size_2D / 2 + 1);
        ctx.font = fontSave;

        atom.textBounds['Mass'] = {
            x: atom.x - symbolWidth / 2 - massWidth - .5,
            y: atom.y - (styles.atoms_font_size_2D * 1.7) / 2 + 1,
            w: massWidth,
            h: styles.atoms_font_size_2D / 2 - 1
        };
    };

    Rp._drawImplicitHs = function(atom) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let hAngle = 0;
        let hWidth = ctx.measureText('H').width;
        let symbolWidth = atom.textBounds['Symbol'].w;
        let massWidth = atom.textBounds['Mass'] ? atom.textBounds['Mass'].w : 0;
        let numHs = atom.getImplicitHydrogenCount();
        let moveCharge = true;

        if (numHs > 1) {
            let xoffset = symbolWidth / 2 + hWidth / 2;
            let yoffset = 0;
            let fontSave = ctx.font;

            let subFont = extensions.getFontString(styles.atoms_font_size_2D * .8, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
            ctx.font = subFont;
            let numWidth = ctx.measureText(numHs).width;
            if (atom.bondNumber === 1) {
                if (atom.angleOfLeastInterference > m.PI / 2 && atom.angleOfLeastInterference < 3 * m.PI / 2) {
                    xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
                    moveCharge = false;
                    hAngle = m.PI;
                }
            } else {
                if (atom.angleOfLeastInterference <= m.PI / 4) {
                    // default
                } else if (atom.angleOfLeastInterference < 3 * m.PI / 4) {
                    xoffset = 0;
                    yoffset = -styles.atoms_font_size_2D * .9;
                    if (atom.charge !== 0) {
                        yoffset -= styles.atoms_font_size_2D * .3;
                    }
                    moveCharge = false;
                    hAngle = m.PI / 2;
                } else if (atom.angleOfLeastInterference <= 5 * m.PI / 4) {
                    xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
                    moveCharge = false;
                    hAngle = m.PI;
                } else if (atom.angleOfLeastInterference < 7 * m.PI / 4) {
                    xoffset = 0;
                    yoffset = styles.atoms_font_size_2D * .9;
                    moveCharge = false;
                    hAngle = 3 * m.PI / 2;
                }
            }

            ctx.font = fontSave;
            ctx.fillText('H', atom.x + xoffset, atom.y + yoffset + 1);
            ctx.font = subFont;
            ctx.fillText(numHs, atom.x + xoffset + hWidth / 2 + numWidth / 2, atom.y + yoffset + styles.atoms_font_size_2D * .3);
            ctx.font = fontSave;

            atom.textBounds['ImplicitH'] = {
                x: atom.x + xoffset - hWidth / 2,
                y: atom.y + yoffset - styles.atoms_font_size_2D / 2 + 1,
                w: hWidth,
                h: styles.atoms_font_size_2D - 2
            };
            atom.textBounds['NumHs'] = {
                x: atom.x + xoffset + hWidth / 2,
                y: atom.y + yoffset + styles.atoms_font_size_2D * .3 - styles.atoms_font_size_2D * 0.7 / 2,
                w: numWidth,
                h: (styles.atoms_font_size_2D - 2) * 0.7
            };
        } else {
            let xoffset = symbolWidth / 2 + hWidth / 2;
            let yoffset = 0;
            if (atom.bondNumber === 1) {
                if (atom.angleOfLeastInterference > m.PI / 2 && atom.angleOfLeastInterference < 3 * m.PI / 2) {
                    xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
                    moveCharge = false;
                    hAngle = m.PI;
                }
            } else {
                if (atom.angleOfLeastInterference <= m.PI / 4) {
                    // default
                } else if (atom.angleOfLeastInterference < 3 * m.PI / 4) {
                    xoffset = 0;
                    yoffset = -styles.atoms_font_size_2D * .9;
                    moveCharge = false;
                    hAngle = m.PI / 2;
                } else if (atom.angleOfLeastInterference <= 5 * m.PI / 4) {
                    xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
                    moveCharge = false;
                    hAngle = m.PI;
                } else if (atom.angleOfLeastInterference < 7 * m.PI / 4) {
                    xoffset = 0;
                    yoffset = styles.atoms_font_size_2D * .9;
                    moveCharge = false;
                    hAngle = 3 * m.PI / 2;
                }
            }
            ctx.fillText('H', atom.x + xoffset, atom.y + yoffset + 1);
            atom.textBounds['ImplicitH'] = {
                x: atom.x + xoffset - hWidth / 2,
                y: atom.y + yoffset - styles.atoms_font_size_2D / 2 + 1,
                w: hWidth,
                h: styles.atoms_font_size_2D - 2
            };
        }
        atom.renderMoveCharge = moveCharge;
    };

    Rp._drawCharge = function(atom) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let fontSave = ctx.font;
        ctx.font = extensions.getFontString(m.floor(styles.atoms_font_size_2D * .8), styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);

        let s = atom.charge.toFixed(0);
        if (s === '1') {
            s = '+';
        } else if (s === '-1') {
            s = '\u2013';
        } else if (s.startsWith('-')) {
            s = s.substring(1) + '\u2013';
        } else {
            s += '+';
        }

        let chargeWidth = ctx.measureText(s).width;
        let symbolWidth = atom.textBounds['Symbol'].w;
        let hWidth = atom.textBounds['ImplicitH'] ? atom.textBounds['ImplicitH'].w : 0;
        let chargeOffset = symbolWidth/2 + chargeWidth/2;
        chargeOffset += atom.renderMoveCharge ? hWidth : 0;

        ctx.fillText(s, atom.x + chargeOffset, atom.y + 1 - styles.atoms_font_size_2D * 0.4);
        ctx.font = fontSave;

        atom.textBounds['Charge'] = {
            x: atom.x + chargeOffset - chargeWidth / 2,
            y: atom.y + 1 - styles.atoms_font_size_2D * 0.4 - styles.atoms_font_size_2D * .8 / 2,
            w: chargeWidth,
            h: (styles.atoms_font_size_2D - 2) * 0.8
        };
    };

    Rp.drawBond = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        if (bond.a1.x === bond.a2.x && bond.a1.y === bond.a2.y) {
            // return, as there is nothing to render, will only cause fill
            // overflows
            return;
        }

        bond.renderVector = new structures.Vector(bond.a1, bond.a2);

        if (bond.a1.isSelected && bond.a2.isSelected) {
            this.drawBondSelection(bond);
        }

        if (styles.atoms_display && bond.a1.isLabelVisible(styles) && bond.a1.textBounds) {
            this._subLabelDistance(bond, 1);
        }

        if (styles.atoms_display && bond.a2.isLabelVisible(styles) && bond.a2.textBounds) {
            this._subLabelDistance(bond, 2);
        }

        // set drawing styles
        this._setBondDrawStyles(bond);

        if (styles.bonds_splitColor) {
            this._setBondSplitColor(bond)
        }

        // draw bonds
        switch (bond.bondOrder) {
            case 0: break;
            case 1:
                if (bond.stereo === structures.Bond.STEREO_NONE) {
                    this._drawSingleBond(bond);
                }
                else {
                    this._drawStereoBond(bond);
                }
                break;
            case 2:
                if (!styles.bonds_symmetrical_2D && (bond.ring || (bond.a1.label === 'C' && bond.a1.label === 'C'))) {
                    this._drawAssymetricDoubleBond(bond)
                } else {
                    this._drawDoubleBond(bond);
                }
                break;

            case 3:
                this._drawTripleBond(bond);
                break;
        }


        // if (this.debug) {
        //     let x1 = bond.renderVector.p1.x;
        //     let x2 = bond.renderVector.p2.x;
        //     let y1 = bond.renderVector.p1.y;
        //     let y2 = bond.renderVector.p2.y;
        //
        //     let x = bond.getCenter().x;
        //     let y = bond.getCenter().y;
        //
        //     let angle = bond.getAngle();
        //     let perpendicular = angle + m.PI / 2;
        //     let mcosp = m.cos(perpendicular);
        //     let msinp = m.sin(perpendicular);
        //     let dist = bond.getLength();
        //
        //     let bond_info = 'a:' + ((angle / m.PI) * 180).toFixed() + ' d:' + dist.toFixed(1)
        //
        //     ctx.font = "2px arial"
        //     ctx.fillStyle = 'red';
        //     ctx.fillText(bond_info, x, y)
        //
        //     ctx.strokeStyle = 'red';
        //     ctx.lineWidth = 0.05;
        //
        //     ctx.beginPath();
        //     ctx.moveTo(x, y);
        //     ctx.lineTo(x + mcosp*5, y - msinp*5);
        //     ctx.stroke();
        // }
    };

    Rp._setBondDrawStyles = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        ctx.strokeStyle = bond.error ? styles.colorError : styles.bonds_color;
        ctx.fillStyle = bond.error ? styles.colorError : styles.bonds_color;
        ctx.lineWidth = styles.bonds_width_2D;
        ctx.lineCap = styles.bonds_ends_2D;
    };

    Rp.drawBondSelection = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;
        let x1 = bond.a1.x;
        let x2 = bond.a2.x;
        let y1 = bond.a1.y;
        let y2 = bond.a2.y;
        let angle = bond.getAngle();

        let radius = styles.atoms_selectRadius;
        let useDist = radius * 0.5;
        let perpendicular = angle + m.PI / 2;
        let dx = radius * m.sqrt(3) / 2 * m.cos(angle);
        let dy = radius * m.sqrt(3) / 2 * m.sin(angle);
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);
        let cx1 = x1 - mcosp * useDist + dx;
        let cy1 = y1 + msinp * useDist - dy;
        let cx2 = x1 + mcosp * useDist + dx;
        let cy2 = y1 - msinp * useDist - dy;
        let cx3 = x2 + mcosp * useDist - dx;
        let cy3 = y2 - msinp * useDist + dy;
        let cx4 = x2 - mcosp * useDist - dx;
        let cy4 = y2 + msinp * useDist + dy;

        // debug rounded bonds fill
        // ctx.beginPath();
        // ctx.strokeStyle = 'red';
        // //console.log(cx1, cx2);
        // ctx.arc(cx1, cy1, 0.2, 0, m.PI *2);
        // ctx.stroke();
        // ctx.closePath();
        //
        // ctx.beginPath();
        // ctx.strokeStyle = 'blue';
        // ctx.arc(cx2, cy2, 0.2, 0, m.PI *2);
        // ctx.stroke();
        // ctx.closePath();
        //
        // ctx.beginPath();
        // ctx.strokeStyle = 'green';
        // ctx.arc(cx3, cy3, 0.2, 0, m.PI *2);
        // ctx.stroke();
        // ctx.closePath();
        //
        // ctx.beginPath();
        // ctx.strokeStyle = 'yellow';
        // ctx.arc(cx4, cy4, 0.2, 0, m.PI *2);
        // ctx.stroke();
        // ctx.closePath();

        ctx.fillStyle = styles.colorSelect;

        ctx.beginPath();
        ctx.moveTo(cx1, cy1);

        ctx.lineTo(cx2, cy2);
        ctx.lineTo(cx3, cy3);
        ctx.lineTo(cx4, cy4);

        // ctx.arc(x1, y1, radius, -angle - m.PI / 6, -angle + m.PI / 6);
        // ctx.lineTo(cx4, cy4);
        // ctx.arc(x2, y2, radius, -angle - m.PI * 1/6 + m.PI , -angle + m.PI * 1/6 + m.PI);

        ctx.closePath();
        ctx.fill();
    };

    Rp._subLabelDistance = function(bond, atomIndex) {
        let atom = atomIndex === 1 ? bond.a1 : bond.a2;
        let styles = this.canvas.styles;
        let rVector = bond.renderVector;

        let distShrink = 0;
        let textBounds = Object.values(atom.textBounds);
        for ( let i = 0, ii = textBounds.length; i < ii; i++) {
            if (atomIndex === 1) {
                distShrink = Math.max(distShrink, math.calculateDistanceInterior(bond.a1, bond.a2, textBounds[i]));
            }
            else {
                distShrink = Math.max(distShrink, math.calculateDistanceInterior(bond.a2, bond.a1, textBounds[i]));
            }

        }
        distShrink += styles.bonds_atomLabelBuffer_2D;
        let distance = bond.getLength();

        let perc = distShrink / distance;
        let difX = bond.a2.x - bond.a1.x;
        let difY = bond.a2.y - bond.a1.y;

        if (atomIndex === 1) {
            rVector.p1.x += difX * perc;
            rVector.p1.y += difY * perc;
        } else {
            rVector.p2.x -= difX * perc;
            rVector.p2.y -= difY * perc;
        }
    };

    Rp._setBondSplitColor = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let linearGradient = ctx.createLinearGradient(bond.a1.x, bond.a1.y, bond.a2.x, bond.a2.y);
        let color1 = bond.a1.getElementColor(styles.atoms_useJMOLColors, styles.atoms_usePYMOLColors, styles.atoms_color);
        let color2 = bond.a2.getElementColor(styles.atoms_useJMOLColors, styles.atoms_usePYMOLColors, styles.atoms_color);

        linearGradient.addColorStop(0, color1);
        if (!styles.bonds_colorGradient) {
            linearGradient.addColorStop(0.5, color1);
            linearGradient.addColorStop(0.51, color2);
        }
        linearGradient.addColorStop(1, color2);

        ctx.strokeStyle = linearGradient;
        ctx.fillStyle = linearGradient;
    };

    Rp._drawSingleBond = function(bond) {
        let ctx = this.canvas.context;
        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    Rp._drawStereoBond = function(bond)  {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        let thinSpread = styles.bonds_width_2D / 2;
        let useDist = styles.bonds_wedgeThickness_2D/2;
        let perpendicular = bond.getAngle() + m.PI / 2;
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);
        let cx1 = x1 - mcosp * thinSpread;
        let cy1 = y1 + msinp * thinSpread;
        let cx2 = x1 + mcosp * thinSpread;
        let cy2 = y1 - msinp * thinSpread;
        let cx3 = x2 + mcosp * useDist;
        let cy3 = y2 - msinp * useDist;
        let cx4 = x2 - mcosp * useDist;
        let cy4 = y2 + msinp * useDist;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.lineTo(cx3, cy3);
        ctx.lineTo(cx4, cy4);
        ctx.closePath();

        if (bond.stereo === structures.Bond.STEREO_WEDGED) {
            ctx.fill();
        } else if (bond.stereo === structures.Bond.STEREO_DASHED) {
            ctx.save();
            ctx.clip();
            ctx.lineWidth = useDist * 2;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.setLineDash([styles.bonds_hashWidth_2D, styles.bonds_hashSpacing_2D]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        } else {
            this._drawStereoAmbiguous(bond);
        }


    }

    Rp._drawStereoAmbiguous = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        // these coordinates are modified to space away from labels AFTER the original difX and difY variables are calculated
        let innerDifX = x2 - x1;
        let innerDifY = y2 - y1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        let curves = m.floor(m.sqrt(innerDifX * innerDifX + innerDifY * innerDifY) / styles.bonds_wavyLength_2D);
        let x = x1;
        let y = y1;
        let perpendicular = bond.getAngle() + m.PI / 2;
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);

        let curveX = innerDifX / curves;
        let curveY = innerDifY / curves;
        let cpx, cpy;
        for ( let i = 0; i < curves; i++) {
            x += curveX;
            y += curveY;
            let mult = i % 2 === 0?1:-1;
            cpx = styles.bonds_wavyLength_2D * mcosp * mult + x - curveX * 0.5;
            cpy = styles.bonds_wavyLength_2D * -msinp * mult + y - curveY * 0.5;
            ctx.quadraticCurveTo(cpx, cpy, x, y);
        }
        ctx.stroke();
    }

    Rp._drawDoubleBond = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        let angle = bond.getAngle();
        let perpendicular = angle + m.PI / 2;
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);

        let dist = bond.getLength();
        let useDist = styles.bonds_useAbsoluteSaturationWidths_2D ? styles.bonds_saturationWidthAbs_2D/2 : dist * styles.bonds_saturationWidth_2D/2;

        let cx1 = x1 - mcosp * useDist;
        let cy1 = y1 + msinp * useDist;
        let cx2 = x1 + mcosp * useDist;
        let cy2 = y1 - msinp * useDist;
        let cx3 = x2 + mcosp * useDist;
        let cy3 = y2 - msinp * useDist;
        let cx4 = x2 - mcosp * useDist;
        let cy4 = y2 + msinp * useDist;

        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx4, cy4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx3, cy3);
        ctx.stroke();
    }

    Rp._drawAssymetricDoubleBond = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        let angle = bond.getAngle();
        let perpendicular = angle + m.PI / 2;
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);

        let dist = bond.getLength();
        let useDist = styles.bonds_useAbsoluteSaturationWidths_2D ? styles.bonds_saturationWidthAbs_2D : dist * styles.bonds_saturationWidth_2D;

        // main bond
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        let clip1 = 0;
        let clip2 = 0;
        let direction = -1;

        let clipAngle1 = styles.bonds_saturationAngle_2D;

        // get clipAngle
        let bissectors = math.getBissectors(bond.a1.angles);
        let rel_bissectors = bissectors.map(a => math.angleBounds(a - angle));
        // console.log(bissectors.map(a => math.toDeg(math.angleBounds(a - angle))));

        // filter bissectors pointing in the same direction as double bond
        let same_direction = rel_bissectors.filter(a => m.sign(a) === direction);

        // get the closest bissector
        // console.log(result.map(a => math.toDeg(a)));
        let result = m.min(...same_direction.map(a => m.abs(a)));
        // console.log(math.toDeg(result));
        clipAngle1 = result;

        // if (clipAngle1 < m.PI / 2 ) {
        //     clip1 = -(useDist / m.tan(clipAngle1));
        // }

        clip1 = -(useDist / m.tan(clipAngle1));

        let xuse1 = x1 - m.cos(angle) * clip1;
        let yuse1 = y1 + m.sin(angle) * clip1;
        let xuse2 = x2 - m.cos(angle) * 0;
        let yuse2 = y2 + m.sin(angle) * 0;

        let db1 = new structures.Point(
            xuse1 + mcosp * useDist * direction,
            yuse1 - msinp * useDist * direction
        );
        let db2 = new structures.Point(
            xuse2 + mcosp * useDist * direction,
            yuse2 - msinp * useDist * direction
        );

        if (m.tan(clipAngle1) < (useDist / (0.8 * bond.getLength())) || clipAngle1 > styles.bonds_saturationAngle_2D) {
            clip1 = -(useDist / m.tan(styles.bonds_saturationAngle_2D));
            let xuse1 = x1 - m.cos(angle) * clip1;
            let yuse1 = y1 + m.sin(angle) * clip1;

            db1.x = xuse1 + mcosp * useDist * direction
            db1.y = yuse1 - msinp * useDist * direction
        }

        ctx.moveTo(db1.x, db1.y);
        ctx.lineTo(db2.x, db2.y);
        ctx.stroke();

        // TODO adjust for assymetric clip from both sides (not single fix clipAngle)
        // let clipAngle1 = styles.bonds_saturationAngle_2D;
        // let clipAngle2 = styles.bonds_saturationAngle_2D;
        //
        // if (clipAngle1 < m.PI / 2) {
        //     clip1 = -(useDist / m.tan(clipAngle1));
        // }
        // if (clipAngle2 < m.PI / 2) {
        //     clip2 = -(useDist / m.tan(clipAngle2));
        // }
        // if (m.abs(clip1) < dist / 2) {
        //     let xuse1 = x1 - m.cos(angle) * clip1;
        //     let xuse2 = x2 + m.cos(angle) * clip2;
        //     let yuse1 = y1 + m.sin(angle) * clip1;
        //     let yuse2 = y2 - m.sin(angle) * clip2;
        //     let cx1 = xuse1 - mcosp * useDist;
        //     let cy1 = yuse1 + msinp * useDist;
        //     let cx2 = xuse1 + mcosp * useDist;
        //     let cy2 = yuse1 - msinp * useDist;
        //     let cx3 = xuse2 - mcosp * useDist;
        //     let cy3 = yuse2 + msinp * useDist;
        //     let cx4 = xuse2 + mcosp * useDist;
        //     let cy4 = yuse2 - msinp * useDist;
        //     let flip = !bond.ring || (bond.ring.center.angle(bond.a1) > bond.ring.center.angle(bond.a2) && !(bond.ring.center.angle(bond.a1) - bond.ring.center.angle(bond.a2) > m.PI) || (bond.ring.center.angle(bond.a1) - bond.ring.center.angle(bond.a2) < -m.PI));
        //     ctx.beginPath();
        //     if (flip) {
        //         ctx.moveTo(cx1, cy1);
        //         ctx.lineTo(cx3, cy3);
        //     } else {
        //         ctx.moveTo(cx2, cy2);
        //         ctx.lineTo(cx4, cy4);
        //     }
        //     if (bond.bondOrder !== 2) {
        //         ctx.setLineDash([styles.bonds_hashSpacing_2D, styles.bonds_hashSpacing_2D]);
        //     }
        //     ctx.stroke();
        //     ctx.setLineDash([]);
        //     ctx.closePath();
        //
        //
        //
        // }

        if (this.debug) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 0.05;

            ctx.beginPath();
            let cx = bond.getCenter().x;
            let cy = bond.getCenter().y;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + mcosp*useDist*direction, cy - msinp*useDist*direction);
            ctx.stroke();
            ctx.closePath();


            // bisectors
            let angles = bond.a1.angles
            let bissectors = math.getBissectors(bond.a1.angles);
            for ( let i = 0, ii = angles.length; i < ii; i++) {

                ctx.lineWidth = 0.1;
                ctx.strokeStyle = 'green';
                ctx.beginPath();
                ctx.moveTo(bond.a1.x, bond.a1.y);
                let cx = bond.a1.x + m.cos(bissectors[i]) * 5;
                let cy = bond.a1.y - m.sin(bissectors[i]) * 5;
                ctx.lineTo(cx, cy);
                ctx.stroke();

                ctx.fillStyle = 'red'
                ctx.fillText(math.toDeg(rel_bissectors[i]).toFixed(), cx, cy);
                ctx.closePath();

            }
        }
    }

    Rp._drawTripleBond = function(bond) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        let x1 = bond.renderVector.p1.x;
        let x2 = bond.renderVector.p2.x;
        let y1 = bond.renderVector.p1.y;
        let y2 = bond.renderVector.p2.y;

        let angle = bond.getAngle();
        let perpendicular = angle + m.PI / 2;
        let mcosp = m.cos(perpendicular);
        let msinp = m.sin(perpendicular);

        let dist = bond.getLength();
        let useDist = styles.bonds_useAbsoluteSaturationWidths_2D ? styles.bonds_saturationWidthAbs_2D : dist * styles.bonds_saturationWidth_2D;

        let cx1 = x1 - mcosp * useDist;
        let cy1 = y1 + msinp * useDist;
        let cx2 = x1 + mcosp * useDist;
        let cy2 = y1 - msinp * useDist;
        let cx3 = x2 + mcosp * useDist;
        let cy3 = y2 - msinp * useDist;
        let cx4 = x2 - mcosp * useDist;
        let cy4 = y2 + msinp * useDist;

        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx4, cy4);
        ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx3, cy3);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    Rp.drawMolecule = function(mol) {
        let ctx = this.canvas.context;
        let styles = this.canvas.styles;

        if (this.debug) {ctx.globalAlpha = 0.5}

        // draw atoms
        for ( let i = 0, ii = mol.atoms.length; i < ii; i++) {
            this.drawAtom(mol.atoms[i], mol);
        }

        // draw bonds
        for ( let i = 0, ii = mol.bonds.length; i < ii; i++) {
            this.drawBond(mol.bonds[i], mol);
        }

    }

    Rp.getElementColor = function (label, useJMOLColors, usePYMOLColors) {
        let color = '#000';
        if (!ELEMENT[label]) {
            return color;
        }
        if (useJMOLColors) {
            color = ELEMENT[label].jmolColor;
        } else if (usePYMOLColors) {
            color = ELEMENT[label].pymolColor;
        }
        return color;
    };

    Rp.drawPoint = function (x, y){
        let ctx = this.canvas.context;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
        ctx.fill();
    }

})(Chemio.render, Chemio.ELEMENT, Chemio.extensions, Chemio.structures, Chemio.math, Math, window);


