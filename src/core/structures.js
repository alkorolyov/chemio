// ************************** Structures ******************************
(function(structures, undefined) {
    'use strict';

    // This is a more efficient Queue implementation other than using Array.shift() on each dequeue, which is very expensive
    // this is 2-3x faster

    /*
     * Creates a new Queue. A Queue is a first-in-first-out (FIFO) data
     * structure. Functions of the Queue object allow elements to be
     * enthis.queued and dethis.queued, the first element to be obtained without
     * dequeuing, and for the current size of the Queue and empty/non-empty
     * status to be obtained.
     */
    structures.Queue = function() {
        // the list of elements, initialised to the empty array
        this.queue = [];
    };
    let _ = structures.Queue.prototype;

    // the amount of space at the front of the this.queue, initialised to zero
    _.queueSpace = 0;

    /*
     * Returns the size of this Queue. The size of a Queue is equal to the
     * number of elements that have been enthis.queued minus the number of
     * elements that have been dethis.queued.
     */
    _.getSize = function() {

        // return the number of elements in the this.queue
        return this.queue.length - this.queueSpace;

    };

    /*
     * Returns true if this Queue is empty, and false otherwise. A Queue is
     * empty if the number of elements that have been enthis.queued equals the
     * number of elements that have been dethis.queued.
     */
    _.isEmpty = function() {

        // return true if the this.queue is empty, and false otherwise
        return this.queue.length === 0;

    };

    /*
     * Enthis.queues the specified element in this Queue. The parameter is:
     *
     * element - the element to enthis.queue
     */
    _.enqueue = function(element) {
        this.queue.push(element);
    };

    /*
     * Dethis.queues an element from this Queue. The oldest element in this
     * Queue is removed and returned. If this Queue is empty then undefined is
     * returned.
     */
    _.dequeue = function() {

        // initialise the element to return to be undefined
        let element;

        // check whether the this.queue is empty
        if (this.queue.length) {

            // fetch the oldest element in the this.queue
            element = this.queue[this.queueSpace];

            // update the amount of space and check whether a shift should
            // occur
            if (++this.queueSpace * 2 >= this.queue.length) {

                // set the this.queue equal to the non-empty portion of the
                // this.queue
                this.queue = this.queue.slice(this.queueSpace);

                // reset the amount of space at the front of the this.queue
                this.queueSpace = 0;

            }

        }

        // return the removed element
        return element;

    };

    /*
     * Returns the oldest element in this Queue. If this Queue is empty then
     * undefined is returned. This function returns the same value as the
     * dethis.queue function, but does not remove the returned element from this
     * Queue.
     */
    _.getOldestElement = function() {

        // initialise the element to return to be undefined
        let element;

        // if the this.queue is not element then fetch the oldest element in the
        // this.queue
        if (this.queue.length) {
            element = this.queue[this.queueSpace];
        }

        // return the oldest element
        return element;
    };

})(Chemio.structures);

(function(structures, m, undefined) {
    'use strict';
    structures.Point = function(x, y) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    };
    let _ = structures.Point.prototype;
    _.sub = function(p) {
        this.x -= p.x;
        this.y -= p.y;
    };
    _.add = function(p) {
        this.x += p.x;
        this.y += p.y;
    };
    _.distance = function(p) {
        let dx = p.x - this.x;
        let dy = p.y - this.y;
        return m.sqrt(dx * dx + dy * dy);
    };
    _.angle = function(p) {
        // y is upside down to account for inverted canvas
        let dx = p.x - this.x;
        let dy = this.y - p.y;
        let angle = 0;
        // Calculate angle
        if (dx === 0) {
            if (dy === 0) {
                angle = 0;
            } else if (dy > 0) {
                angle = m.PI / 2;
            } else {
                angle = 3 * m.PI / 2;
            }
        } else if (dy === 0) {
            if (dx > 0) {
                angle = 0;
            } else {
                angle = m.PI;
            }
        } else {
            if (dx < 0) {
                angle = m.atan(dy / dx) + m.PI;
            } else if (dy < 0) {
                angle = m.atan(dy / dx) + 2 * m.PI;
            } else {
                angle = m.atan(dy / dx);
            }
        }
        while (angle < 0) {
            angle += m.PI * 2;
        }
        angle = angle % (m.PI * 2);
        return angle;
    };
})(Chemio.structures, Math);

(function(structures, m, undefined) {
    'use strict';
    structures.Vector = function(p1, p2) {
        this.p1 = new structures.Point(p1.x, p1.y);
        this.p2 = new structures.Point(p2.x, p2.y);
    };
    let _ = structures.Vector.prototype;
    _.distance = function() {
        return p1.distance(p2);
    };
    _.angle = function() {
        return p1.angle(p2);
    };

})(Chemio.structures, Math);

(function (ELEMENT, extensions, math, structures, m, m4, undefined) {
    'use strict';
    let whitespaceRegex = /\s+/g;

    structures.Atom = function (label, x, y, z) {
        this.label = label ? label.trim() : 'C';
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.z = z ? z : 0;
    };
    let _ = structures.Atom.prototype = new structures.Point(0, 0);
    // _.parentMol = undefined;
    _.charge = 0;
    _.numLonePair = 0;
    _.numRadical = 0;
    _.mass = -1;
    _.implicitH = -1;
    _.coordinationNumber = 0;
    _.bondNumber = 0;
    _.angleOfLeastInterference = 0;
    _.isHidden = false;
    _.altLabel = undefined;
    _.isLone = false;
    _.isHover = false;
    _.isSelected_old = false;
    _.textBounds = [];
    _.renderMoveCharge = false;
    _.add3D = function (p) {
        this.x += p.x;
        this.y += p.y;
        this.z += p.z;
    };
    _.sub3D = function (p) {
        this.x -= p.x;
        this.y -= p.y;
        this.z -= p.z;
    };
    _.distance3D = function (p) {
        let dx = p.x - this.x;
        let dy = p.y - this.y;
        let dz = p.z - this.z;
        return m.sqrt(dx * dx + dy * dy + dz * dz);
    };
    _.draw = function (ctx, styles) {
        if (this.dontDraw) {
            // this is used when the atom shouldn't be visible, such as when the text input field is open over this atom
            return;
        }
        if (this.isSelected) {
            ctx.fillStyle = styles.colorSelect //grd;
            ctx.beginPath();
            ctx.arc(this.x, this.y, styles.atoms_selectRadius, 0, m.PI * 2, false);
            ctx.fill();
        }
        if (this.query) {
            return;
        }
        this.textBounds = [];
        if (this.styles) {
            styles = this.styles;
        }
        let font = extensions.getFontString(styles.atoms_font_size_2D, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
        ctx.font = font;
        ctx.fillStyle = this.getElementColor(styles.atoms_useJMOLColors, styles.atoms_usePYMOLColors, styles.atoms_color, 2);
        if (this.label === 'H' && styles.atoms_HBlack_2D) {
            ctx.fillStyle = 'black';
        }
        if (this.error) {
            ctx.fillStyle = styles.colorError;
        }
        let hAngle;
        let labelVisible = this.isLabelVisible(styles);
        if (this.isLone && !labelVisible || styles.atoms_circles_2D) {
            // always use carbon gray for lone carbon atom dots
            if (this.isLone) {
                ctx.fillStyle = '#909090';
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, styles.atoms_circleDiameter_2D / 2, 0, m.PI * 2, false);
            ctx.fill();
            if (styles.atoms_circleBorderWidth_2D > 0) {
                ctx.lineWidth = styles.atoms_circleBorderWidth_2D;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        } else if (labelVisible) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // keep check to undefined here as dev may set altLabel to empty
            // string
            if (this.altLabel !== undefined) {
                // altLabel can be 0, so check if undefined
                ctx.fillText(this.altLabel, this.x, this.y + 1);
                let symbolWidth = ctx.measureText(this.altLabel).width;
                this.textBounds.push({
                    x: this.x - symbolWidth / 2,
                    y: this.y - styles.atoms_font_size_2D / 2 + 1,
                    w: symbolWidth,
                    h: styles.atoms_font_size_2D - 2
                });
            } else if (!ELEMENT[this.label]) {
                if (structures.CondensedLabel) {
                    if (this.label.match(whitespaceRegex)) {
                        // if a space is included in the string, it is reasonable to expect this to be written text and not chemically interpretted
                        ctx.textAlign = 'left';
                        if (this.error) {
                            ctx.fillStyle = styles.colorError;
                        }
                        ctx.fillText(this.label, this.x, this.y + 1);
                        let symbolWidth = ctx.measureText(this.label).width;
                        this.textBounds.push({
                            x: this.x + 1,
                            y: this.y - styles.atoms_font_size_2D / 2 + 1,
                            w: symbolWidth,
                            h: styles.atoms_font_size_2D - 2
                        });
                    } else {
                        // CondensedLabel is proprietary and not included in the GPL version
                        if (!this.condensed || this.condensed.text !== this.label) {
                            this.condensed = new structures.CondensedLabel(this, this.label);
                        }
                        this.condensed.draw(ctx, styles);
                    }
                } else {
                    ctx.fillText(this.label, this.x, this.y + 1);
                    let symbolWidth = ctx.measureText(this.label).width;
                    this.textBounds.push({
                        x: this.x - symbolWidth / 2,
                        y: this.y - styles.atoms_font_size_2D / 2 + 1,
                        w: symbolWidth,
                        h: styles.atoms_font_size_2D - 2
                    });
                }
            } else {
                ctx.fillText(this.label, this.x, this.y + 1);
                let symbolWidth = ctx.measureText(this.label).width;
                this.textBounds.push({
                    x: this.x - symbolWidth / 2,
                    y: this.y + 1 - styles.atoms_font_size_2D / 2,
                    w: symbolWidth,
                    h: styles.atoms_font_size_2D - 2
                });
                // mass
                let massWidth = 0;
                if (this.mass !== -1) {
                    let fontSave = ctx.font;
                    ctx.font = extensions.getFontString(styles.atoms_font_size_2D * .7, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
                    massWidth = ctx.measureText(this.mass).width;
                    ctx.fillText(this.mass, this.x - massWidth - .5, this.y - styles.atoms_font_size_2D / 2 + 1);
                    this.textBounds.push({
                        x: this.x - symbolWidth / 2 - massWidth - .5,
                        y: this.y - (styles.atoms_font_size_2D * 1.7) / 2 + 1,
                        w: massWidth,
                        h: styles.atoms_font_size_2D / 2 - 1
                    });
                    ctx.font = fontSave;
                }
                // implicit hydrogens
                let chargeOffset = symbolWidth / 2;
                let numHs = this.getImplicitHydrogenCount();
                if (styles.atoms_implicitHydrogens_2D && numHs > 0) {
                    hAngle = 0;
                    let hWidth = ctx.measureText('H').width;
                    let moveCharge = true;
                    if (numHs > 1) {
                        let xoffset = symbolWidth / 2 + hWidth / 2;
                        let yoffset = 0;
                        let subFont = extensions.getFontString(styles.atoms_font_size_2D * .7, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
                        ctx.font = subFont;
                        let numWidth = ctx.measureText(numHs).width;
                        if (this.bondNumber === 1) {
                            if (this.angleOfLeastInterference > m.PI / 2 && this.angleOfLeastInterference < 3 * m.PI / 2) {
                                xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
                                moveCharge = false;
                                hAngle = m.PI;
                            }
                        } else {
                            if (this.angleOfLeastInterference <= m.PI / 4) {
                                // default
                            } else if (this.angleOfLeastInterference < 3 * m.PI / 4) {
                                xoffset = 0;
                                yoffset = -styles.atoms_font_size_2D * .9;
                                if (this.charge !== 0) {
                                    yoffset -= styles.atoms_font_size_2D * .3;
                                }
                                moveCharge = false;
                                hAngle = m.PI / 2;
                            } else if (this.angleOfLeastInterference <= 5 * m.PI / 4) {
                                xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
                                moveCharge = false;
                                hAngle = m.PI;
                            } else if (this.angleOfLeastInterference < 7 * m.PI / 4) {
                                xoffset = 0;
                                yoffset = styles.atoms_font_size_2D * .9;
                                moveCharge = false;
                                hAngle = 3 * m.PI / 2;
                            }
                        }
                        ctx.font = font;
                        ctx.fillText('H', this.x + xoffset, this.y + yoffset + 1);
                        ctx.font = subFont;
                        ctx.fillText(numHs, this.x + xoffset + hWidth / 2 + numWidth / 2, this.y + yoffset + styles.atoms_font_size_2D * .3);
                        this.textBounds.push({
                            x: this.x + xoffset - hWidth / 2,
                            y: this.y + yoffset + 1 - styles.atoms_font_size_2D / 2,
                            w: hWidth,
                            h: styles.atoms_font_size_2D - 2
                        });
                        this.textBounds.push({
                            x: this.x + xoffset + hWidth / 2,
                            y: this.y + yoffset + styles.atoms_font_size_2D * .3 - styles.atoms_font_size_2D * 0.7 / 2,
                            w: numWidth,
                            h: (styles.atoms_font_size_2D - 2) * 0.7
                        });
                    } else {
                        let xoffset = symbolWidth / 2 + hWidth / 2;
                        let yoffset = 0;
                        if (this.bondNumber === 1) {
                            if (this.angleOfLeastInterference > m.PI / 2 && this.angleOfLeastInterference < 3 * m.PI / 2) {
                                xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
                                moveCharge = false;
                                hAngle = m.PI;
                            }
                        } else {
                            if (this.angleOfLeastInterference <= m.PI / 4) {
                                // default
                            } else if (this.angleOfLeastInterference < 3 * m.PI / 4) {
                                xoffset = 0;
                                yoffset = -styles.atoms_font_size_2D * .9;
                                moveCharge = false;
                                hAngle = m.PI / 2;
                            } else if (this.angleOfLeastInterference <= 5 * m.PI / 4) {
                                xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
                                moveCharge = false;
                                hAngle = m.PI;
                            } else if (this.angleOfLeastInterference < 7 * m.PI / 4) {
                                xoffset = 0;
                                yoffset = styles.atoms_font_size_2D * .9;
                                moveCharge = false;
                                hAngle = 3 * m.PI / 2;
                            }
                        }
                        ctx.fillText('H', this.x + xoffset, this.y + yoffset + 1);
                        this.textBounds.push({
                            x: this.x + xoffset - hWidth / 2,
                            y: this.y + yoffset - styles.atoms_font_size_2D / 2 + 1,
                            w: hWidth,
                            h: styles.atoms_font_size_2D - 2
                        });
                    }
                    if (moveCharge) {
                        chargeOffset += hWidth;
                    }
                    // adjust the angles metadata to account for hydrogen
                    // placement
                    /*
                     * this.angles.push(hAngle); let angleData =
                     * math.angleBetweenLargest(this.angles);
                     * this.angleOfLeastInterference = angleData.angle % (m.PI *
                     * 2); this.largestAngle = angleData.largest;
                     */
                }
                // charge
                if (this.charge !== 0) {
                    let s = this.charge.toFixed(0);
                    if (s === '1') {
                        s = '+';
                    } else if (s === '-1') {
                        s = '\u2013';
                    } else if (s.startsWith('-')) {
                        s = s.substring(1) + '\u2013';
                    } else {
                        s += '+';
                    }
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = extensions.getFontString(styles.atoms_font_size_2D * .8, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
                    let chargeWidth = ctx.measureText(s).width;
                    chargeOffset += chargeWidth / 2;
                    ctx.fillText(s, this.x + chargeOffset + 1, this.y + 1 - styles.atoms_font_size_2D * 0.4);

                    this.textBounds.push({
                        x: this.x + chargeOffset + 1 - chargeWidth / 2,
                        y: this.y + 1 - styles.atoms_font_size_2D * 0.4 - styles.atoms_font_size_2D * .8 / 2,
                        w: chargeWidth,
                        h: (styles.atoms_font_size_2D - 2) * 0.8
                    });
                }
            }
        }

        // if (this.numLonePair > 0 || this.numRadical > 0) {
        //     ctx.fillStyle = 'black';
        //     let as = this.angles.slice(0);
        //     let ali = this.angleOfLeastInterference;
        //     let la = this.largestAngle;
        //     if (hAngle !== undefined) {
        //         // have to check for undefined here as this number can be 0
        //         as.push(hAngle);
        //         as.sort(function (a, b) {
        //             return a - b;
        //         });
        //         let angleData = math.angleBetweenLargest(as);
        //         ali = angleData.angle % (m.PI * 2);
        //         la = angleData.largest;
        //     }
        //     let things = [];
        //     for (let i = 0; i < this.numLonePair; i++) {
        //         things.push({
        //             t: 2
        //         });
        //     }
        //     for (let i = 0; i < this.numRadical; i++) {
        //         things.push({
        //             t: 1
        //         });
        //     }
        //     if (hAngle === undefined && m.abs(la - 2 * m.PI / as.length) < m.PI / 60) {
        //         let mid = m.ceil(things.length / as.length);
        //         for (let i = 0, ii = things.length; i < ii; i += mid, ali += la) {
        //             this.drawElectrons(ctx, styles, things.slice(i, m.min(things.length, i + mid)), ali, la, hAngle);
        //         }
        //     } else {
        //         this.drawElectrons(ctx, styles, things, ali, la, hAngle);
        //     }
        // }

        // for debugging atom label dimensions
        ctx.strokeStyle = 'red'; ctx.lineWidth = 0.05; for(let i = 0, ii = this.textBounds.length;i<ii; i++){ let r = this.textBounds[i];ctx.beginPath();ctx.rect(r.x, r.y, r.w, r.h); ctx.stroke(); }

    };
    _.drawElectrons = function (ctx, styles, things, angle, largest, hAngle) {
        let segment = largest / (things.length + (this.bonds.length === 0 && hAngle === undefined ? 0 : 1));
        let angleStart = angle - largest / 2 + segment;
        for (let i = 0; i < things.length; i++) {
            let t = things[i];
            let angle = angleStart + i * segment;
            let p1x = this.x + Math.cos(angle) * styles.atoms_lonePairDistance_2D;
            let p1y = this.y - Math.sin(angle) * styles.atoms_lonePairDistance_2D;
            if (t.t === 2) {
                let perp = angle + Math.PI / 2;
                let difx = Math.cos(perp) * styles.atoms_lonePairSpread_2D / 2;
                let dify = -Math.sin(perp) * styles.atoms_lonePairSpread_2D / 2;
                ctx.beginPath();
                ctx.arc(p1x + difx, p1y + dify, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p1x - difx, p1y - dify, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
                ctx.fill();
            } else if (t.t === 1) {
                ctx.beginPath();
                ctx.arc(p1x, p1y, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
                ctx.fill();
            }
        }
    };
    _.drawDecorations = function (ctx, styles) {
        // console.log('lassoed: ' + this.isLassoed);
        if (this.isHover || this.isLassoed) {
            ctx.strokeStyle = styles.colorHover;
            ctx.lineWidth = styles.hover_lineWidth;
            ctx.beginPath();
            let radius = styles.atoms_selectRadius;
            ctx.arc(this.x, this.y, radius, 0, m.PI * 2, false);
            ctx.stroke();
        }
        if (this.isOverlap) {
            ctx.strokeStyle = styles.colorError;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 7, 0, m.PI * 2, false);
            ctx.stroke();
        }
    };
    // _.render = function (gl, styles, noColor) {
    //     if (this.styles) {
    //         styles = this.styles;
    //     }
    //     let transform = m4.translate(m4.identity(), [this.x, this.y, this.z]);
    //     let radius = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
    //     if (radius === 0) {
    //         radius = 1;
    //     }
    //     m4.scale(transform, [radius, radius, radius]);
    //
    //     // colors
    //     if (!noColor) {
    //         let color = styles.atoms_color;
    //         if (styles.atoms_useJMOLColors) {
    //             color = ELEMENT[this.label].jmolColor;
    //         } else if (styles.atoms_usePYMOLColors) {
    //             color = ELEMENT[this.label].pymolColor;
    //         }
    //         gl.material.setDiffuseColor(gl, color);
    //     }
    //
    //     // render
    //     gl.shader.setMatrixUniforms(gl, transform);
    //     let buffer = this.renderAsStar ? gl.starBuffer : gl.sphereBuffer;
    //     gl.drawElements(gl.TRIANGLES, buffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    // };
    // _.renderHighlight = function (gl, styles) {
    //     if (this.isSelected_old || this.isHover) {
    //         if (this.styles) {
    //             styles = this.styles;
    //         }
    //         let transform = m4.translate(m4.identity(), [this.x, this.y, this.z]);
    //         let radius = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
    //         if (radius === 0) {
    //             radius = 1;
    //         }
    //         radius *= 1.3;
    //         m4.scale(transform, [radius, radius, radius]);
    //
    //         gl.shader.setMatrixUniforms(gl, transform);
    //         gl.material.setDiffuseColor(gl, this.isHover ? styles.colorHover : styles.colorSelect);
    //         let buffer = this.renderAsStar ? gl.starBuffer : gl.sphereBuffer;
    //         gl.drawElements(gl.TRIANGLES, buffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //     }
    // };
    _.isLabelVisible = function (styles) {
        if (styles.atoms_displayAllCarbonLabels_2D) {
            // show all carbons
            return true;
        }
        if (this.label !== 'C') {
            // not a carbon
            return true;
        }
        if (this.altLabel || !ELEMENT[this.label]) {
            // there is an alternative or condensed label
            return true;
        }
        if (this.mass !== -1 || this.implicitH !== -1 || this.charge !== 0) {
            // an isotope or charge or implicit hydrogen override designation, so label must be shown
            return true;
        }
        if (styles.atoms_showAttributedCarbons_2D && (this.numRadical !== 0 || this.numLonePair !== 0)) {
            // there are attributes and we want to show the associated label
            return true;
        }
        if (this.isHidden && styles.atoms_showHiddenCarbons_2D) {
            // if it is hidden and we want to show them
            return true;
        }
        if (styles.atoms_displayTerminalCarbonLabels_2D && this.bondNumber === 1) {
            // if it is terminal and we want to show them
            return true;
        }
        return false;
    };
    _.getImplicitHydrogenCount = function () {
        if (!ELEMENT[this.label] || !ELEMENT[this.label].addH) {
            return 0;
        }
        if (this.implicitH !== -1) {
            return this.implicitH;
        }
        if (this.label === 'H') {
            return 0;
        }
        let valence = ELEMENT[this.label].valency;
        let dif = valence - this.coordinationNumber;
        if (this.numRadical > 0) {
            dif = m.max(0, dif - this.numRadical);
        }
        if (this.charge > 0) {
            let vdif = 4 - valence;
            if (this.charge <= vdif) {
                dif += this.charge;
            } else {
                dif = 4 - this.coordinationNumber - this.charge + vdif;
            }
        } else {
            dif += this.charge;
        }
        return dif < 0 ? 0 : m.floor(dif);
    };
    _.getBounds = function () {
        let bounds = new math.Bounds();
        bounds.expand(this.x, this.y);
        if (this.textBounds) {
            for (let i = 0, ii = this.textBounds.length; i < ii; i++) {
                let tb = this.textBounds[i];
                bounds.expand(tb.x, tb.y, tb.x + tb.w, tb.y + tb.h);
            }
        }
        return bounds;
    };
    // _.getBounds3D = function () {
    //     let bounds = new math.Bounds();
    //     bounds.expand3D(this.x, this.y, this.z);
    //     return bounds;
    // };
    /**
     * Get Color by atom element.
     *
     * @param {boolean} useJMOLColors
     * @param {boolean} usePYMOLColors
     * @param {string} color The default color
     * @param {number} dim The render dimension
     * @return {string} The atom element color
     */
    _.getElementColor = function (useJMOLColors, usePYMOLColors, color) {
        if (!ELEMENT[this.label]) {
            return '#000';
        }
        if (useJMOLColors) {
            color = ELEMENT[this.label].jmolColor;
        } else if (usePYMOLColors) {
            color = ELEMENT[this.label].pymolColor;
        }
        return color;
    };

})(Chemio.ELEMENT, Chemio.extensions, Chemio.math, Chemio.structures, Math, Chemio.lib.mat4);

(function(ELEMENT, extensions, structures, math, m, m4, v3, undefined) {
    'use strict';
    structures.Bond = function(a1, a2, bondOrder) {
        this.a1 = a1;
        this.a2 = a2;
        // bondOrder can be 0, so need to check against undefined
        this.bondOrder = bondOrder !== undefined ? bondOrder : 1;
    };
    structures.Bond.STEREO_NONE = 'none';
    structures.Bond.STEREO_WEDGED = 'wedged';
    structures.Bond.STEREO_DASHED = 'dashed';
    structures.Bond.STEREO_AMBIGUOUS = 'ambiguous';
    let _ = structures.Bond.prototype;
    _.stereo = structures.Bond.STEREO_NONE;
    _.isHover = false;
    // _.parentMol = undefined;
    _.ring = undefined;
    _.renderVector = undefined;
    _.getCenter = function() {
        return new structures.Point((this.a1.x + this.a2.x) / 2, (this.a1.y + this.a2.y) / 2);
    };
    _.getAngle = function() {
        return this.a1.angle(this.a2);
    }
    _.getLength = function() {
        return this.a1.distance(this.a2);
    };
    // _.getLength3D = function() {
    //     return this.a1.distance3D(this.a2);
    // };
    _.contains = function(a) {
        return a === this.a1 || a === this.a2;
    };
    _.getNeighbor = function(a) {
        if (a === this.a1) {
            return this.a2;
        } else if (a === this.a2) {
            return this.a1;
        }
        return undefined;
    };
    _.draw = function(ctx, styles) {
        if (this.a1.x === this.a2.x && this.a1.y === this.a2.y) {
            // return, as there is nothing to render, will only cause fill
            // overflows
            return;
        }
        if (this.styles) {
            styles = this.styles;
        }
        let x1 = this.a1.x;
        let x2 = this.a2.x;
        let y1 = this.a1.y;
        let y2 = this.a2.y;
        let dist = this.a1.distance(this.a2);
        let angle = this.a1.angle(this.a2);
        let difX = x2 - x1;
        let difY = y2 - y1;
        if (this.a1.isSelected && this.a2.isSelected) {
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
        }

        if (styles.atoms_display && !styles.atoms_circles_2D && this.a1.isLabelVisible(styles) && this.a1.textBounds) {
            let distShrink = 0;
            for ( let i = 0, ii = this.a1.textBounds.length; i < ii; i++) {
                distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a1, this.a2, this.a1.textBounds[i]));
            }
            distShrink += styles.bonds_atomLabelBuffer_2D;
            let perc = distShrink / dist;
            x1 += difX * perc;
            y1 += difY * perc;
        }
        if (styles.atoms_display && !styles.atoms_circles_2D && this.a2.isLabelVisible(styles) && this.a2.textBounds) {
            let distShrink = 0;
            for ( let i = 0, ii = this.a2.textBounds.length; i < ii; i++) {
                distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a2, this.a1, this.a2.textBounds[i]));
            }
            distShrink += styles.bonds_atomLabelBuffer_2D;
            let perc = distShrink / dist;
            x2 -= difX * perc;
            y2 -= difY * perc;
        }
        if (styles.bonds_clearOverlaps_2D) {
            let xs = x1 + difX * .15;
            let ys = y1 + difY * .15;
            let xf = x2 - difX * .15;
            let yf = y2 - difY * .15;
            ctx.strokeStyle = styles.backgroundColor;
            ctx.lineWidth = styles.bonds_width_2D + styles.bonds_overlapClearWidth_2D * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(xs, ys);
            ctx.lineTo(xf, yf);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = this.error?styles.colorError:styles.bonds_color;
        ctx.fillStyle = this.error?styles.colorError:styles.bonds_color;
        ctx.lineWidth = styles.bonds_width_2D;
        ctx.lineCap = styles.bonds_ends_2D;
        if (styles.bonds_splitColor) {
            let linearGradient = ctx.createLinearGradient(x1, y1, x2, y2);
            let styles1 = this.a1.styles?this.a1.styles:styles;
            let styles2 = this.a2.styles?this.a2.styles:styles;
            let color1 = this.a1.getElementColor(styles1.atoms_useJMOLColors, styles1.atoms_usePYMOLColors, styles1.atoms_color, 2);
            let color2 = this.a2.getElementColor(styles2.atoms_useJMOLColors, styles2.atoms_usePYMOLColors, styles2.atoms_color, 2);
            linearGradient.addColorStop(0, color1);
            if (!styles.bonds_colorGradient) {
                linearGradient.addColorStop(0.5, color1);
                linearGradient.addColorStop(0.51, color2);
            }
            linearGradient.addColorStop(1, color2);
            ctx.strokeStyle = linearGradient;
            ctx.fillStyle = linearGradient;
        }
        if (styles.bonds_lewisStyle_2D && this.bondOrder % 1 === 0) {
            this.drawLewisStyle(ctx, styles, x1, y1, x2, y2);
        } else {
            switch (this.query?1:this.bondOrder) {
                case 0:{
                    let dx = x2 - x1;
                    let dy = y2 - y1;
                    let innerDist = m.sqrt(dx * dx + dy * dy);
                    let num = m.floor(innerDist / styles.bonds_dotSize_2D);
                    let remainder = (innerDist - (num - 1) * styles.bonds_dotSize_2D) / 2;
                    if (num % 2 === 1) {
                        remainder += styles.bonds_dotSize_2D / 4;
                    } else {
                        remainder -= styles.bonds_dotSize_2D / 4;
                        num += 2;
                    }
                    num /= 2;
                    let angle = this.a1.angle(this.a2);
                    let xs = x1 + remainder * Math.cos(angle);
                    let ys = y1 - remainder * Math.sin(angle);
                    ctx.beginPath();
                    for ( let i = 0; i < num; i++) {
                        ctx.arc(xs, ys, styles.bonds_dotSize_2D / 2, 0, m.PI * 2, false);
                        xs += 2 * styles.bonds_dotSize_2D * Math.cos(angle);
                        ys -= 2 * styles.bonds_dotSize_2D * Math.sin(angle);
                    }
                    ctx.fill();
                    break;
                }
                case 0.5:{
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.setLineDash([styles.bonds_hashSpacing_2D, styles.bonds_hashSpacing_2D]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    break;
                }
                case 1:{
                    if (!this.query && (this.stereo === structures.Bond.STEREO_WEDGED || this.stereo === structures.Bond.STEREO_DASHED)) {
                        let thinSpread = styles.bonds_width_2D / 2;
                        let useDist = styles.bonds_wedgeThickness_2D/2;
                        let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
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
                        if (this.stereo === structures.Bond.STEREO_WEDGED) {
                            ctx.fill();
                        } else {
                            ctx.save();
                            ctx.clip();
                            ctx.lineWidth = useDist * 2;
                            ctx.lineCap = 'butt';
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            // workaround to lengthen distance for Firefox as there is a bug, shouldn't affect rendering or performance
                            let dx = x2 - x1;
                            let dy = y2 - y1;
                            ctx.lineTo(x2+5*dx, y2+5*dy);
                            ctx.setLineDash([styles.bonds_hashWidth_2D, styles.bonds_hashSpacing_2D]);
                            ctx.stroke();
                            ctx.setLineDash([]);
                            ctx.restore();
                        }
                    } else if (!this.query && this.stereo === structures.Bond.STEREO_AMBIGUOUS) {
                        // these coordinates are modified to space away from labels AFTER the original difX and difY variables are calculated
                        let innerDifX = x2 - x1;
                        let innerDifY = y2 - y1;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        let curves = m.floor(m.sqrt(innerDifX * innerDifX + innerDifY * innerDifY) / styles.bonds_wavyLength_2D);
                        let x = x1;
                        let y = y1;
                        let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
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
                        break;
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        if(this.query){
                            this.query.draw(ctx, styles, this.getCenter());
                        }
                    }
                    break;
                }
                case 1.5:
                case 2:{
                    let angle = this.a1.angle(this.a2);
                    let perpendicular = angle + m.PI / 2;
                    let mcosp = m.cos(perpendicular);
                    let msinp = m.sin(perpendicular);
                    let dist = this.a1.distance(this.a2);
                    let useDist = styles.bonds_useAbsoluteSaturationWidths_2D?styles.bonds_saturationWidthAbs_2D/2:dist * styles.bonds_saturationWidth_2D / 2;
                    if (this.stereo === structures.Bond.STEREO_AMBIGUOUS) {
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
                        ctx.lineTo(cx3, cy3);
                        ctx.moveTo(cx2, cy2);
                        ctx.lineTo(cx4, cy4);
                        ctx.stroke();
                    } else if (!styles.bonds_symmetrical_2D && (this.ring || this.a1.label === 'C' && this.a2.label === 'C')) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        let clip = 0;
                        useDist*=2;
                        let clipAngle = styles.bonds_saturationAngle_2D;
                        if (clipAngle < m.PI / 2) {
                            clip = -(useDist / m.tan(clipAngle));
                        }
                        if (m.abs(clip) < dist / 2) {
                            let xuse1 = x1 - m.cos(angle) * clip;
                            let xuse2 = x2 + m.cos(angle) * clip;
                            let yuse1 = y1 + m.sin(angle) * clip;
                            let yuse2 = y2 - m.sin(angle) * clip;
                            let cx1 = xuse1 - mcosp * useDist;
                            let cy1 = yuse1 + msinp * useDist;
                            let cx2 = xuse1 + mcosp * useDist;
                            let cy2 = yuse1 - msinp * useDist;
                            let cx3 = xuse2 - mcosp * useDist;
                            let cy3 = yuse2 + msinp * useDist;
                            let cx4 = xuse2 + mcosp * useDist;
                            let cy4 = yuse2 - msinp * useDist;
                            let flip = !this.ring || (this.ring.center.angle(this.a1) > this.ring.center.angle(this.a2) && !(this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) > m.PI) || (this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) < -m.PI));
                            ctx.beginPath();
                            if (flip) {
                                ctx.moveTo(cx1, cy1);
                                ctx.lineTo(cx3, cy3);
                            } else {
                                ctx.moveTo(cx2, cy2);
                                ctx.lineTo(cx4, cy4);
                            }
                            if (this.bondOrder !== 2) {
                                ctx.setLineDash([styles.bonds_hashSpacing_2D, styles.bonds_hashSpacing_2D]);
                            }
                            ctx.stroke();
                            ctx.setLineDash([]);
                        }
                    } else {
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
                        if (this.bondOrder !== 2) {
                            ctx.setLineDash([styles.bonds_hashWidth_2D, styles.bonds_hashSpacing_2D]);
                        }
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                    break;
                }
                case 3:{
                    let useDist = styles.bonds_useAbsoluteSaturationWidths_2D?styles.bonds_saturationWidthAbs_2D:this.a1.distance(this.a2) * styles.bonds_saturationWidth_2D;
                    let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
                    let mcosp = m.cos(perpendicular);
                    let msinp = m.sin(perpendicular);
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
                    break;
                }
            }
        }
    };

    _.drawDecorations = function(ctx, styles) {
        if (this.isHover || this.isSelected_old) {
            let x1 = this.a1.x;
            let x2 = this.a2.x;
            let y1 = this.a1.y;
            let y2 = this.a2.y;

            let angle = this.a1.angle(this.a2);
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

            ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
            ctx.lineWidth = styles.hover_lineWidth;

            ctx.moveTo(cx1, cy1);
            ctx.beginPath();
            ctx.arc(x1, y1, radius, -angle - m.PI / 6, -angle + m.PI / 6, true);
            ctx.lineTo(cx4, cy4);
            ctx.arc(x2, y2, radius, -angle - m.PI * 1/6 + m.PI , -angle + m.PI * 1/6 + m.PI, true);
            ctx.closePath();
            ctx.stroke();
        }
    };
    _.drawLewisStyle = function(ctx, styles, x1, y1, x2, y2) {
        let angle = this.a1.angle(this.a2);
        let perp = angle + m.PI/2;
        let difx = x2 - x1;
        let dify = y2 - y1;
        let increment = m.sqrt(difx * difx + dify * dify) / (this.bondOrder + 1);
        let xi = increment * m.cos(angle);
        let yi = -increment * m.sin(angle);
        let x = x1 + xi;
        let y = y1 + yi;
        for ( let i = 0; i < this.bondOrder; i++) {
            let sep = styles.atoms_lonePairSpread_2D / 2;
            let cx1 = x - m.cos(perp) * sep;
            let cy1 = y + m.sin(perp) * sep;
            let cx2 = x + m.cos(perp) * sep;
            let cy2 = y - m.sin(perp) * sep;
            ctx.beginPath();
            ctx.arc(cx1 - styles.atoms_lonePairDiameter_2D / 2, cy1 - styles.atoms_lonePairDiameter_2D / 2, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx2 - styles.atoms_lonePairDiameter_2D / 2, cy2 - styles.atoms_lonePairDiameter_2D / 2, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
            ctx.fill();
            x += xi;
            y += yi;
        }
    };
    // /**
    //  *
    //  * @param {WegGLRenderingContext} gl
    //  * @param {structures.Styles} styles
    //  * @param {boolean} asSegments Using cylinder/solid line or segmented pills/dashed line
    //  * @return {void}
    //  */
    // _.render = function(gl, styles, asSegments) {
    //     if (this.styles) {
    //         styles = this.styles;
    //     }
    //     // this is the elongation vector for the cylinder
    //     let height = this.a1.distance3D(this.a2);
    //     if (height === 0) {
    //         // if there is no height, then no point in rendering this bond,
    //         // just return
    //         return;
    //     }
    //
    //     // scale factor for cylinder/pill radius.
    //     // when scale pill, the cap will affected too.
    //     let radiusScale = styles.bonds_cylinderDiameter_3D / 2;
    //
    //     // atom1 color and atom2 color
    //     let a1Color = styles.bonds_color;
    //     let a2Color;
    //
    //     // transform to the atom as well as the opposite atom (for Jmol and
    //     // PyMOL
    //     // color splits)
    //     let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);
    //     let transformOpposite;
    //
    //     // vector from atom1 to atom2
    //     let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
    //
    //     // calculate the rotation
    //     let y = [ 0, 1, 0 ];
    //     let ang = 0;
    //     let axis;
    //     if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
    //         axis = [ 0, 0, 1 ];
    //         if (this.a2.y < this.a1.y) {
    //             ang = m.PI;
    //         }
    //     } else {
    //         ang = extensions.vec3AngleFrom(y, a2b);
    //         axis = v3.cross(y, a2b, []);
    //     }
    //
    //     // the styles will split color are
    //     // - Line
    //     // - Stick
    //     // - Wireframe
    //     if (styles.bonds_splitColor) {
    //         let styles1 = this.a1.styles?this.a1.styles:styles;
    //         let styles2 = this.a2.styles?this.a2.styles:styles;
    //         a1Color = this.a1.getElementColor(styles1.atoms_useJMOLColors, styles1.atoms_usePYMOLColors, styles1.atoms_color);
    //         a2Color = this.a2.getElementColor(styles2.atoms_useJMOLColors, styles2.atoms_usePYMOLColors, styles2.atoms_color);
    //
    //         // the transformOpposite will use for split color.
    //         // just make it splited if the color different.
    //         if (a1Color != a2Color) {
    //             transformOpposite = m4.translate(m4.identity(), [ this.a2.x, this.a2.y, this.a2.z ]);
    //         }
    //     }
    //
    //     // calculate the translations for unsaturated bonds.
    //     // represenattio use saturatedCross are
    //     // - Line
    //     // - Wireframe
    //     // - Ball and Stick
    //     // just Stick will set bonds_showBondOrders_3D to false
    //     let others = [ 0 ];
    //     let saturatedCross;
    //
    //     if (asSegments) { // block for draw bond as segmented line/pill
    //
    //         if (styles.bonds_showBondOrders_3D && this.bondOrder > 1) {
    //
    //             // The "0.5" part set here,
    //             // the other part (1) will render as cylinder
    //             others = [/*-styles.bonds_cylinderDiameter_3D, */styles.bonds_cylinderDiameter_3D ];
    //
    //             let z = [ 0, 0, 1 ];
    //             let inverse = m4.inverse(gl.rotationMatrix, []);
    //             m4.multiplyVec3(inverse, z);
    //             saturatedCross = v3.cross(a2b, z, []);
    //             v3.normalize(saturatedCross);
    //         }
    //
    //         let segmentScale = 1;
    //
    //         let spaceBetweenPill = styles.bonds_pillSpacing_3D;
    //
    //         let pillHeight = styles.bonds_pillHeight_3D;
    //
    //         if (this.bondOrder == 0) {
    //
    //             if (styles.bonds_renderAsLines_3D) {
    //                 pillHeight = spaceBetweenPill;
    //             } else {
    //                 pillHeight = styles.bonds_pillDiameter_3D;
    //
    //                 // Detect Ball and Stick representation
    //                 if (pillHeight < styles.bonds_cylinderDiameter_3D) {
    //                     pillHeight /= 2;
    //                 }
    //
    //                 segmentScale = pillHeight / 2;
    //                 height /= segmentScale;
    //                 spaceBetweenPill /= segmentScale / 2;
    //             }
    //
    //         }
    //
    //         // total space need for one pill, iclude the space.
    //         let totalSpaceForPill = pillHeight + spaceBetweenPill;
    //
    //         // segmented pills for one bond.
    //         let totalPillsPerBond = height / totalSpaceForPill;
    //
    //         // segmented one unit pill for one bond
    //         let pillsPerBond = m.floor(totalPillsPerBond);
    //
    //         let extraSegmentedSpace = height - totalSpaceForPill * pillsPerBond;
    //
    //         let paddingSpace = (spaceBetweenPill + styles.bonds_pillDiameter_3D + extraSegmentedSpace) / 2;
    //
    //         // pillSegmentsLength will change if both atom1 and atom2 color used
    //         // for rendering
    //         let pillSegmentsLength = pillsPerBond;
    //
    //         if (transformOpposite) {
    //             // floor will effected for odd pills, because one pill at the
    //             // center
    //             // will replace with splited pills
    //             pillSegmentsLength = m.floor(pillsPerBond / 2);
    //         }
    //
    //         // render bonds
    //         for ( let i = 0, ii = others.length; i < ii; i++) {
    //             let transformUse = m4.set(transform, []);
    //
    //             if (others[i] !== 0) {
    //                 m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
    //             }
    //             if (ang !== 0) {
    //                 m4.rotate(transformUse, ang, axis);
    //             }
    //
    //             if (segmentScale != 1) {
    //                 m4.scale(transformUse, [ segmentScale, segmentScale, segmentScale ]);
    //             }
    //
    //             // colors
    //             if (a1Color)
    //                 gl.material.setDiffuseColor(gl, a1Color);
    //
    //             m4.translate(transformUse, [ 0, paddingSpace, 0 ]);
    //
    //             for ( let j = 0; j < pillSegmentsLength; j++) {
    //
    //                 if (styles.bonds_renderAsLines_3D) {
    //                     if (this.bondOrder == 0) {
    //                         gl.shader.setMatrixUniforms(gl, transformUse);
    //                         gl.drawArrays(gl.POINTS, 0, 1);
    //                     } else {
    //                         m4.scale(transformUse, [ 1, pillHeight, 1 ]);
    //
    //                         gl.shader.setMatrixUniforms(gl, transformUse);
    //                         gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //
    //                         m4.scale(transformUse, [ 1, 1 / pillHeight, 1 ]);
    //                     }
    //                 } else {
    //                     gl.shader.setMatrixUniforms(gl, transformUse);
    //                     if (this.bondOrder == 0) {
    //                         gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                     } else {
    //                         gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                     }
    //                 }
    //
    //                 m4.translate(transformUse, [ 0, totalSpaceForPill, 0 ]);
    //             }
    //
    //             // if rendering segmented pill use atom1 and atom2 color
    //             if (transformOpposite) {
    //                 // parameter for calculate splited pills
    //                 let scaleY, halfOneMinScaleY;
    //
    //                 if (styles.bonds_renderAsLines_3D) {
    //                     scaleY = pillHeight;
    //                     // if(this.bondOrder != 0) {
    //                     // scaleY -= spaceBetweenPill;
    //                     // }
    //                     scaleY /= 2;
    //                     halfOneMinScaleY = 0;
    //                 } else {
    //                     scaleY = 2 / 3;
    //                     halfOneMinScaleY = (1 - scaleY) / 2;
    //                 }
    //
    //                 // if count of pills per bound is odd,
    //                 // then draw the splited pills of atom1
    //                 if (pillsPerBond % 2 != 0) {
    //
    //                     m4.scale(transformUse, [ 1, scaleY, 1 ]);
    //
    //                     gl.shader.setMatrixUniforms(gl, transformUse);
    //
    //                     if (styles.bonds_renderAsLines_3D) {
    //
    //                         if (this.bondOrder == 0) {
    //                             gl.drawArrays(gl.POINTS, 0, 1);
    //                         } else {
    //                             gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //                         }
    //
    //                     } else {
    //
    //                         if (this.bondOrder == 0) {
    //                             gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         } else {
    //                             gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         }
    //
    //                     }
    //
    //                     m4.translate(transformUse, [ 0, totalSpaceForPill * (1 + halfOneMinScaleY), 0 ]);
    //
    //                     m4.scale(transformUse, [ 1, 1 / scaleY, 1 ]);
    //                 }
    //
    //                 // prepare to render the atom2
    //
    //                 m4.set(transformOpposite, transformUse);
    //                 if (others[i] !== 0) {
    //                     m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
    //                 }
    //                 // don't check for 0 here as that means it should be rotated
    //                 // by PI, but PI will be negated
    //                 m4.rotate(transformUse, ang + m.PI, axis);
    //
    //                 if (segmentScale != 1) {
    //                     m4.scale(transformUse, [ segmentScale, segmentScale, segmentScale ]);
    //                 }
    //
    //                 // colors
    //                 if (a2Color){
    //                     gl.material.setDiffuseColor(gl, a2Color);
    //                 }
    //
    //                 m4.translate(transformUse, [ 0, paddingSpace, 0 ]);
    //
    //                 // draw the remain pills which use the atom2 color
    //                 for ( let j = 0; j < pillSegmentsLength; j++) {
    //
    //                     if (styles.bonds_renderAsLines_3D) {
    //                         if (this.bondOrder == 0) {
    //                             gl.shader.setMatrixUniforms(gl, transformUse);
    //                             gl.drawArrays(gl.POINTS, 0, 1);
    //                         } else {
    //                             m4.scale(transformUse, [ 1, pillHeight, 1 ]);
    //
    //                             gl.shader.setMatrixUniforms(gl, transformUse);
    //                             gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //
    //                             m4.scale(transformUse, [ 1, 1 / pillHeight, 1 ]);
    //                         }
    //                     } else {
    //                         gl.shader.setMatrixUniforms(gl, transformUse);
    //                         if (this.bondOrder == 0) {
    //                             gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         } else {
    //                             gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         }
    //                     }
    //
    //                     m4.translate(transformUse, [ 0, totalSpaceForPill, 0 ]);
    //                 }
    //
    //                 // draw the splited center pills of atom2
    //                 if (pillsPerBond % 2 != 0) {
    //
    //                     m4.scale(transformUse, [ 1, scaleY, 1 ]);
    //
    //                     gl.shader.setMatrixUniforms(gl, transformUse);
    //
    //                     if (styles.bonds_renderAsLines_3D) {
    //
    //                         if (this.bondOrder == 0) {
    //                             gl.drawArrays(gl.POINTS, 0, 1);
    //                         } else {
    //                             gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //                         }
    //
    //                     } else {
    //
    //                         if (this.bondOrder == 0) {
    //                             gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         } else {
    //                             gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //                         }
    //
    //                     }
    //
    //                     m4.translate(transformUse, [ 0, totalSpaceForPill * (1 + halfOneMinScaleY), 0 ]);
    //
    //                     m4.scale(transformUse, [ 1, 1 / scaleY, 1 ]);
    //                 }
    //             }
    //         }
    //     } else {
    //         // calculate the translations for unsaturated bonds.
    //         // represenation that use saturatedCross are
    //         // - Line
    //         // - Wireframe
    //         // - Ball and Stick
    //         // just Stick will set bonds_showBondOrders_3D to false
    //         if (styles.bonds_showBondOrders_3D) {
    //
    //             switch (this.bondOrder) {
    //                 // the 0 and 0.5 bond order will draw as segmented pill.
    //                 // so we not set that here.
    //                 // case 0:
    //                 // case 0.5: break;
    //
    //                 case 1.5:
    //                     // The "1" part set here,
    //                     // the other part (0.5) will render as segmented pill
    //                     others = [ -styles.bonds_cylinderDiameter_3D /*
	// 															 * ,
	// 															 * styles.bonds_cylinderDiameter_3D
	// 															 */];
    //                     break;
    //                 case 2:
    //                     others = [ -styles.bonds_cylinderDiameter_3D, styles.bonds_cylinderDiameter_3D ];
    //                     break;
    //                 case 3:
    //                     others = [ -1.2 * styles.bonds_cylinderDiameter_3D, 0, 1.2 * styles.bonds_cylinderDiameter_3D ];
    //                     break;
    //             }
    //
    //             // saturatedCross just need for need for bondorder greather than
    //             // 1
    //             if (this.bondOrder > 1) {
    //                 let z = [ 0, 0, 1 ];
    //                 let inverse = m4.inverse(gl.rotationMatrix, []);
    //                 m4.multiplyVec3(inverse, z);
    //                 saturatedCross = v3.cross(a2b, z, []);
    //                 v3.normalize(saturatedCross);
    //             }
    //         }
    //         // for Stick representation, we just change the cylinder radius
    //         else {
    //
    //             switch (this.bondOrder) {
    //                 case 0:
    //                     radiusScale *= 0.25;
    //                     break;
    //                 case 0.5:
    //                 case 1.5:
    //                     radiusScale *= 0.5;
    //                     break;
    //             }
    //         }
    //
    //         // if transformOpposite is set, the it mean the color must be
    //         // splited.
    //         // so the heigh of cylinder will be half.
    //         // one half for atom1 color the other for atom2 color
    //         if (transformOpposite) {
    //             height /= 2;
    //         }
    //
    //         // Radius of cylinder already defined when initialize cylinder mesh,
    //         // so at this rate, the scale just needed for Y to strech
    //         // cylinder to bond length (height) and X and Z for radius.
    //         let scaleVector = [ radiusScale, height, radiusScale ];
    //
    //         // render bonds
    //         for ( let i = 0, ii = others.length; i < ii; i++) {
    //             let transformUse = m4.set(transform, []);
    //             if (others[i] !== 0) {
    //                 m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
    //             }
    //             if (ang !== 0) {
    //                 m4.rotate(transformUse, ang, axis);
    //             }
    //             m4.scale(transformUse, scaleVector);
    //
    //             // colors
    //             if (a1Color)
    //                 gl.material.setDiffuseColor(gl, a1Color);
    //
    //             // render
    //             gl.shader.setMatrixUniforms(gl, transformUse);
    //             if (styles.bonds_renderAsLines_3D) {
    //                 gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //             } else {
    //                 gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
    //             }
    //
    //             // if transformOpposite is set, then a2Color also shoudl be
    //             // seted as well.
    //             if (transformOpposite) {
    //                 m4.set(transformOpposite, transformUse);
    //                 if (others[i] !== 0) {
    //                     m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
    //                 }
    //                 // don't check for 0 here as that means it should be rotated
    //                 // by PI, but PI will be negated
    //                 m4.rotate(transformUse, ang + m.PI, axis);
    //                 m4.scale(transformUse, scaleVector);
    //
    //                 // colors
    //                 if (a2Color)
    //                     gl.material.setDiffuseColor(gl, a2Color);
    //
    //                 // render
    //                 gl.shader.setMatrixUniforms(gl, transformUse);
    //                 if (styles.bonds_renderAsLines_3D) {
    //                     gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //                 } else {
    //                     gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
    //                 }
    //             }
    //         }
    //     }
    // };
    // _.renderHighlight = function(gl, styles) {
    //     if (this.isSelected_old || this.isHover) {
    //         if (this.styles) {
    //             styles = this.styles;
    //         }
    //         if (this.styles) {
    //             styles = this.styles;
    //         }
    //         // this is the elongation vector for the cylinder
    //         let height = this.a1.distance3D(this.a2);
    //         if (height === 0) {
    //             // if there is no height, then no point in rendering this bond,
    //             // just return
    //             return;
    //         }
    //
    //         // scale factor for cylinder/pill radius.
    //         // when scale pill, the cap will affected too.
    //         let radiusScale = styles.bonds_cylinderDiameter_3D / 1.2;
    //         let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);
    //
    //         // vector from atom1 to atom2
    //         let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
    //
    //         // calculate the rotation
    //         let y = [ 0, 1, 0 ];
    //         let ang = 0;
    //         let axis;
    //         if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
    //             axis = [ 0, 0, 1 ];
    //             if (this.a2.y < this.a1.y) {
    //                 ang = m.PI;
    //             }
    //         } else {
    //             ang = extensions.vec3AngleFrom(y, a2b);
    //             axis = v3.cross(y, a2b, []);
    //         }
    //         let scaleVector = [ radiusScale, height, radiusScale ];
    //
    //         if (ang !== 0) {
    //             m4.rotate(transform, ang, axis);
    //         }
    //         m4.scale(transform, scaleVector);
    //         gl.shader.setMatrixUniforms(gl, transform);
    //         gl.material.setDiffuseColor(gl, this.isHover ? styles.colorHover : styles.colorSelect);
    //         gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
    //     }
    // };
    // /**
    //  *
    //  * @param {WegGLRenderingContext}
    //  *            gl
    //  * @param {structures.Styles}
    //  *            styles
    //  * @return {void}
    //  */
    // _.renderPicker = function(gl, styles) {
    //
    //     // gl.cylinderBuffer.bindBuffers(gl);
    //     // gl.material.setDiffuseColor(
    //     // this.bondOrder == 0 ? '#FF0000' : // merah
    //     // this.bondOrder == 0.5 ? '#FFFF00' : // kuning
    //     // this.bondOrder == 1 ? '#FF00FF' : // ungu
    //     // this.bondOrder == 1.5 ? '#00FF00' : // hijau
    //     // this.bondOrder == 2 ? '#00FFFF' : // cyan
    //     // this.bondOrder == 3 ? '#0000FF' : // biru
    //     // '#FFFFFF');
    //     // gl.material.setAlpha(1);
    //
    //     if (this.styles) {
    //         styles = this.styles;
    //     }
    //     // this is the elongation vector for the cylinder
    //     let height = this.a1.distance3D(this.a2);
    //     if (height === 0) {
    //         // if there is no height, then no point in rendering this bond,
    //         // just return
    //         return;
    //     }
    //
    //     // scale factor for cylinder/pill radius.
    //     // when scale pill, the cap will affected too.
    //     let radiusScale = styles.bonds_cylinderDiameter_3D / 2;
    //
    //     // transform to the atom as well as the opposite atom (for Jmol and
    //     // PyMOL
    //     // color splits)
    //     let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);
    //
    //     // vector from atom1 to atom2
    //     let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
    //
    //     // calculate the rotation
    //     let y = [ 0, 1, 0 ];
    //     let ang = 0;
    //     let axis;
    //     if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
    //         axis = [ 0, 0, 1 ];
    //         if (this.a2.y < this.a1.y) {
    //             ang = m.PI;
    //         }
    //     } else {
    //         ang = extensions.vec3AngleFrom(y, a2b);
    //         axis = v3.cross(y, a2b, []);
    //     }
    //
    //     // calculate the translations for unsaturated bonds.
    //     // represenattio use saturatedCross are
    //     // - Line
    //     // - WIreframe
    //     // - Ball and Stick
    //     // just Stick will set bonds_showBondOrders_3D to false
    //     let others = [ 0 ];
    //     let saturatedCross;
    //
    //     if (styles.bonds_showBondOrders_3D) {
    //
    //         if (styles.bonds_renderAsLines_3D) {
    //
    //             switch (this.bondOrder) {
    //
    //                 case 1.5:
    //                 case 2:
    //                     others = [ -styles.bonds_cylinderDiameter_3D, styles.bonds_cylinderDiameter_3D ];
    //                     break;
    //                 case 3:
    //                     others = [ -1.2 * styles.bonds_cylinderDiameter_3D, 0, 1.2 * styles.bonds_cylinderDiameter_3D ];
    //                     break;
    //             }
    //
    //             // saturatedCross just need for need for bondorder greather than
    //             // 1
    //             if (this.bondOrder > 1) {
    //                 let z = [ 0, 0, 1 ];
    //                 let inverse = m4.inverse(gl.rotationMatrix, []);
    //                 m4.multiplyVec3(inverse, z);
    //                 saturatedCross = v3.cross(a2b, z, []);
    //                 v3.normalize(saturatedCross);
    //             }
    //
    //         } else {
    //
    //             switch (this.bondOrder) {
    //                 case 1.5:
    //                 case 2:
    //                     radiusScale *= 3;
    //                     break;
    //                 case 3:
    //                     radiusScale *= 3.4;
    //                     break;
    //             }
    //
    //         }
    //
    //     } else {
    //         // this is for Stick repersentation because Stick not have
    //         // bonds_showBondOrders_3D
    //
    //         switch (this.bondOrder) {
    //
    //             case 0:
    //                 radiusScale *= 0.25;
    //                 break;
    //             case 0.5:
    //             case 1.5:
    //                 radiusScale *= 0.5;
    //                 break;
    //         }
    //
    //     }
    //
    //     // Radius of cylinder already defined when initialize cylinder mesh,
    //     // so at this rate, the scale just needed for Y to strech
    //     // cylinder to bond length (height) and X and Z for radius.
    //     let scaleVector = [ radiusScale, height, radiusScale ];
    //
    //     // render bonds
    //     for ( let i = 0, ii = others.length; i < ii; i++) {
    //         let transformUse = m4.set(transform, []);
    //         if (others[i] !== 0) {
    //             m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
    //         }
    //         if (ang !== 0) {
    //             m4.rotate(transformUse, ang, axis);
    //         }
    //         m4.scale(transformUse, scaleVector);
    //
    //         // render
    //         gl.shader.setMatrixUniforms(gl, transformUse);
    //         if (styles.bonds_renderAsLines_3D) {
    //             gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
    //         } else {
    //             gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
    //         }
    //
    //     }
    // };

})(Chemio.ELEMENT, Chemio.extensions, Chemio.structures, Chemio.math, Math, Chemio.lib.mat4, Chemio.lib.vec3);

(function(structures, m, undefined) {
    'use strict';
    structures.Ring = function() {
        this.atoms = [];
        this.bonds = [];
    };
    let _ = structures.Ring.prototype;
    _.center = undefined;
    _.setupBonds = function() {
        for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
            this.bonds[i].ring = this;
        }
        this.center = this.getCenter();
    };
    _.getCenter = function() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            minX = m.min(this.atoms[i].x, minX);
            minY = m.min(this.atoms[i].y, minY);
            maxX = m.max(this.atoms[i].x, maxX);
            maxY = m.max(this.atoms[i].y, maxY);
        }
        return new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
    };

})(Chemio.structures, Math);

(function(c, math, structures, RESIDUE, m, undefined) {
    'use strict';
    structures.Molecule = function() {
        this.atoms = [];
        this.bonds = [];
        this.rings = [];
    };
    let _ = structures.Molecule.prototype;
    // this can be an extensive algorithm for large molecules, you may want
    // to turn this off
    _.findRings = true;
    _.draw = function(ctx, styles) {
        if (this.styles) {
            styles = this.styles;
        }
        // draw
        // need this weird render of atoms before and after, just in case
        // circles are rendered, as those should be on top
        if (styles.atoms_display && !styles.atoms_circles_2D) {
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                this.atoms[i].draw(ctx, styles);
            }
        }
        if (styles.bonds_display) {
            for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
                this.bonds[i].draw(ctx, styles);
            }
        }
        if (styles.atoms_display) {
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                let a = this.atoms[i];
                if(styles.atoms_circles_2D){
                    a.draw(ctx, styles);
                }
                if(a.query){
                    a.query.draw(ctx, styles, a);
                }
            }
        }
    };
    // _.render = function(gl, styles) {
    //     // uncomment this to render the picking frame
    //     // return this.renderPickFrame(gl, styles, []);
    //     if (this.styles) {
    //         styles = this.styles;
    //     }
    //     // check explicitly if it is undefined here, since hetatm is a
    //     // boolean that can be true or false, as long as it is set, it is
    //     // macro
    //     let isMacro = this.atoms.length > 0 && this.atoms[0].hetatm !== undefined;
    //     if (isMacro) {
    //         if (styles.macro_displayBonds) {
    //             if (this.bonds.length > 0) {
    //                 if (styles.bonds_renderAsLines_3D && !this.residueSpecs || this.residueSpecs && this.residueSpecs.bonds_renderAsLines_3D) {
    //                     gl.lineWidth(this.residueSpecs ? this.residueSpecs.bonds_width_2D : styles.bonds_width_2D);
    //                     gl.lineBuffer.bindBuffers(gl);
    //                 } else {
    //                     gl.cylinderBuffer.bindBuffers(gl);
    //                 }
    //                 // colors
    //                 gl.material.setTempColors(gl, styles.bonds_materialAmbientColor_3D, undefined, styles.bonds_materialSpecularColor_3D, styles.bonds_materialShininess_3D);
    //             }
    //             for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //                 let b = this.bonds[i];
    //                 // closestDistance may be 0, so check if undefined
    //                 if (!b.a1.hetatm && (styles.macro_atomToLigandDistance === -1 || (b.a1.closestDistance !== undefined && styles.macro_atomToLigandDistance >= b.a1.closestDistance && styles.macro_atomToLigandDistance >= b.a2.closestDistance))) {
    //                     b.render(gl, this.residueSpecs ? this.residueSpecs : styles);
    //                 }
    //             }
    //         }
    //         if (styles.macro_displayAtoms) {
    //             if (this.atoms.length > 0) {
    //                 gl.sphereBuffer.bindBuffers(gl);
    //                 // colors
    //                 gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, styles.atoms_materialSpecularColor_3D, styles.atoms_materialShininess_3D);
    //             }
    //             for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //                 let a = this.atoms[i];
    //                 // closestDistance may be 0, so check if undefined
    //                 if (!a.hetatm && (styles.macro_atomToLigandDistance === -1 || (a.closestDistance !== undefined && styles.macro_atomToLigandDistance >= a.closestDistance))) {
    //                     a.render(gl, this.residueSpecs ? this.residueSpecs : styles);
    //                 }
    //             }
    //         }
    //     }
    //     if (styles.bonds_display) {
    //         // Array for Half Bonds. It is needed because Half Bonds use the
    //         // pill buffer.
    //         let asPills = [];
    //         // Array for 0 bond order.
    //         let asSpheres = [];
    //         if (this.bonds.length > 0) {
    //             if (styles.bonds_renderAsLines_3D) {
    //                 gl.lineWidth(styles.bonds_width_2D);
    //                 gl.lineBuffer.bindBuffers(gl);
    //             } else {
    //                 gl.cylinderBuffer.bindBuffers(gl);
    //             }
    //             // colors
    //             gl.material.setTempColors(gl, styles.bonds_materialAmbientColor_3D, undefined, styles.bonds_materialSpecularColor_3D, styles.bonds_materialShininess_3D);
    //         }
    //         for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //             let b = this.bonds[i];
    //             if (!isMacro || b.a1.hetatm) {
    //                 // Check if render as segmented pill will used.
    //                 if (styles.bonds_showBondOrders_3D) {
    //                     if (b.bondOrder == 0) {
    //                         // 0 bond order
    //                         asSpheres.push(b);
    //                     } else if (b.bondOrder == 0.5) {
    //                         // 0.5 bond order
    //                         asPills.push(b);
    //                     } else {
    //                         if (b.bondOrder == 1.5) {
    //                             // For 1.5 bond order, the "1" part will render
    //                             // as cylinder, and the "0.5" part will render
    //                             // as segmented pills
    //                             asPills.push(b);
    //                         }
    //                         b.render(gl, styles);
    //                     }
    //                 } else {
    //                     // this will render the Stick representation
    //                     b.render(gl, styles);
    //                 }
    //
    //             }
    //         }
    //         // Render the Half Bond
    //         if (asPills.length > 0) {
    //             // if bonds_renderAsLines_3D is true, then lineBuffer will
    //             // binded.
    //             // so in here we just need to check if we need to change
    //             // the binding buffer to pillBuffer or not.
    //             if (!styles.bonds_renderAsLines_3D) {
    //                 gl.pillBuffer.bindBuffers(gl);
    //             }
    //             for ( let i = 0, ii = asPills.length; i < ii; i++) {
    //                 asPills[i].render(gl, styles, true);
    //             }
    //         }
    //         // Render zero bond order
    //         if (asSpheres.length > 0) {
    //             // if bonds_renderAsLines_3D is true, then lineBuffer will
    //             // binded.
    //             // so in here we just need to check if we need to change
    //             // the binding buffer to pillBuffer or not.
    //             if (!styles.bonds_renderAsLines_3D) {
    //                 gl.sphereBuffer.bindBuffers(gl);
    //             }
    //             for ( let i = 0, ii = asSpheres.length; i < ii; i++) {
    //                 asSpheres[i].render(gl, styles, true);
    //             }
    //         }
    //     }
    //     if (styles.atoms_display) {
    //         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //             let a = this.atoms[i];
    //             a.bondNumber = 0;
    //             a.renderAsStar = false;
    //         }
    //         for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //             let b = this.bonds[i];
    //             b.a1.bondNumber++;
    //             b.a2.bondNumber++;
    //         }
    //         if (this.atoms.length > 0) {
    //             gl.sphereBuffer.bindBuffers(gl);
    //             // colors
    //             gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, styles.atoms_materialSpecularColor_3D, styles.atoms_materialShininess_3D);
    //         }
    //         let asStars = [];
    //         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //             let a = this.atoms[i];
    //             if (!isMacro || (a.hetatm && (styles.macro_showWater || !a.isWater))) {
    //                 if (styles.atoms_nonBondedAsStars_3D && a.bondNumber === 0) {
    //                     a.renderAsStar = true;
    //                     asStars.push(a);
    //                 } else {
    //                     a.render(gl, styles);
    //                 }
    //             }
    //         }
    //         if (asStars.length > 0) {
    //             gl.starBuffer.bindBuffers(gl);
    //             for ( let i = 0, ii = asStars.length; i < ii; i++) {
    //                 asStars[i].render(gl, styles);
    //             }
    //         }
    //     }
    //     if (this.chains) {
    //         // set up the model view matrix, since it won't be modified
    //         // for macromolecules
    //         gl.shader.setMatrixUniforms(gl);
    //         // render chains
    //         if (styles.proteins_displayRibbon) {
    //             // proteins
    //             // colors
    //             gl.material.setTempColors(gl, styles.proteins_materialAmbientColor_3D, undefined, styles.proteins_materialSpecularColor_3D, styles.proteins_materialShininess_3D);
    //             let uses = styles.proteins_ribbonCartoonize ? this.cartoons : this.ribbons;
    //             for ( let j = 0, jj = uses.length; j < jj; j++) {
    //                 let use = uses[j];
    //                 if (styles.proteins_residueColor !== 'none') {
    //                     use.front.bindBuffers(gl);
    //                     let rainbow = (styles.proteins_residueColor === 'rainbow');
    //                     for ( let i = 0, ii = use.front.segments.length; i < ii; i++) {
    //                         if (rainbow) {
    //                             gl.material.setDiffuseColor(gl, math.rainbowAt(i, ii, styles.macro_rainbowColors));
    //                         }
    //                         use.front.segments[i].render(gl, styles);
    //                     }
    //                     use.back.bindBuffers(gl);
    //                     for ( let i = 0, ii = use.back.segments.length; i < ii; i++) {
    //                         if (rainbow) {
    //                             gl.material.setDiffuseColor(gl, math.rainbowAt(i, ii, styles.macro_rainbowColors));
    //                         }
    //                         use.back.segments[i].render(gl, styles);
    //                     }
    //                 } else {
    //                     use.front.render(gl, styles);
    //                     use.back.render(gl, styles);
    //                 }
    //             }
    //         }
    //
    //         if(styles.proteins_displayPipePlank) {
    //             for ( let j = 0, jj = this.pipePlanks.length; j < jj; j++) {
    //                 this.pipePlanks[j].render(gl, styles);
    //             }
    //         }
    //
    //         if (styles.proteins_displayBackbone) {
    //             if (!this.alphaCarbonTrace) {
    //                 // cache the alpha carbon trace
    //                 this.alphaCarbonTrace = {
    //                     nodes : [],
    //                     edges : []
    //                 };
    //                 for ( let j = 0, jj = this.chains.length; j < jj; j++) {
    //                     let rs = this.chains[j];
    //                     let isNucleotide = rs.length > 2 && RESIDUE[rs[2].name] && RESIDUE[rs[2].name].aminoColor === '#BEA06E';
    //                     if (!isNucleotide && rs.length > 0) {
    //                         for ( let i = 0, ii = rs.length - 2; i < ii; i++) {
    //                             let n = rs[i].cp1;
    //                             n.chainColor = rs.chainColor;
    //                             this.alphaCarbonTrace.nodes.push(n);
    //                             let b = new structures.Bond(rs[i].cp1, rs[i + 1].cp1);
    //                             b.residueName = rs[i].name;
    //                             b.chainColor = rs.chainColor;
    //                             this.alphaCarbonTrace.edges.push(b);
    //                             if (i === rs.length - 3) {
    //                                 n = rs[i + 1].cp1;
    //                                 n.chainColor = rs.chainColor;
    //                                 this.alphaCarbonTrace.nodes.push(n);
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //             if (this.alphaCarbonTrace.nodes.length > 0) {
    //                 let traceSpecs = new structures.Styles();
    //                 traceSpecs.atoms_display = true;
    //                 traceSpecs.bonds_display = true;
    //                 traceSpecs.atoms_sphereDiameter_3D = styles.proteins_backboneThickness;
    //                 traceSpecs.bonds_cylinderDiameter_3D = styles.proteins_backboneThickness;
    //                 traceSpecs.bonds_splitColor = false;
    //                 traceSpecs.atoms_color = styles.proteins_backboneColor;
    //                 traceSpecs.bonds_color = styles.proteins_backboneColor;
    //                 traceSpecs.atoms_useVDWDiameters_3D = false;
    //                 // colors
    //                 gl.material.setTempColors(gl, styles.proteins_materialAmbientColor_3D, undefined, styles.proteins_materialSpecularColor_3D, styles.proteins_materialShininess_3D);
    //                 gl.material.setDiffuseColor(gl, styles.proteins_backboneColor);
    //                 for ( let i = 0, ii = this.alphaCarbonTrace.nodes.length; i < ii; i++) {
    //                     let n = this.alphaCarbonTrace.nodes[i];
    //                     if (styles.macro_colorByChain) {
    //                         traceSpecs.atoms_color = n.chainColor;
    //                     }
    //                     gl.sphereBuffer.bindBuffers(gl);
    //                     n.render(gl, traceSpecs);
    //                 }
    //                 for ( let i = 0, ii = this.alphaCarbonTrace.edges.length; i < ii; i++) {
    //                     let e = this.alphaCarbonTrace.edges[i];
    //                     let color;
    //                     let r = RESIDUE[e.residueName] ? RESIDUE[e.residueName] : RESIDUE['*'];
    //                     if (styles.macro_colorByChain) {
    //                         color = e.chainColor;
    //                     } else if (styles.proteins_residueColor === 'shapely') {
    //                         color = r.shapelyColor;
    //                     } else if (styles.proteins_residueColor === 'amino') {
    //                         color = r.aminoColor;
    //                     } else if (styles.proteins_residueColor === 'polarity') {
    //                         if (r.polar) {
    //                             color = '#C10000';
    //                         } else {
    //                             color = '#FFFFFF';
    //                         }
    //                     } else if (styles.proteins_residueColor === 'acidity') {
    //                         if(r.acidity === 1){
    //                             color = '#0000FF';
    //                         }else if(r.acidity === -1){
    //                             color = '#FF0000';
    //                         }else if (r.polar) {
    //                             color = '#FFFFFF';
    //                         } else {
    //                             color = '#773300';
    //                         }
    //                     } else if (styles.proteins_residueColor === 'rainbow') {
    //                         color = math.rainbowAt(i, ii, styles.macro_rainbowColors);
    //                     }
    //                     if (color) {
    //                         traceSpecs.bonds_color = color;
    //                     }
    //                     gl.cylinderBuffer.bindBuffers(gl);
    //                     e.render(gl, traceSpecs);
    //                 }
    //             }
    //         }
    //         if (styles.nucleics_display) {
    //             // nucleic acids
    //             // colors
    //             gl.material.setTempColors(gl, styles.nucleics_materialAmbientColor_3D, undefined, styles.nucleics_materialSpecularColor_3D, styles.nucleics_materialShininess_3D);
    //             for ( let j = 0, jj = this.tubes.length; j < jj; j++) {
    //                 gl.shader.setMatrixUniforms(gl);
    //                 let use = this.tubes[j];
    //                 use.render(gl, styles);
    //             }
    //         }
    //     }
    //     if (styles.atoms_display) {
    //         let highlight = false;
    //         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //             let a = this.atoms[i];
    //             if(a.isHover || a.isSelected_old){
    //                 highlight = true;
    //                 break;
    //             }
    //         }
    //         if(!highlight){
    //             for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //                 let b = this.bonds[i];
    //                 if(b.isHover || b.isSelected_old){
    //                     highlight = true;
    //                     break;
    //                 }
    //             }
    //         }
    //         if(highlight){
    //             gl.sphereBuffer.bindBuffers(gl);
    //             // colors
    //             gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    //             gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, '#000000', 0);
    //             gl.enable(gl.BLEND);
    //             gl.depthMask(false);
    //             gl.material.setAlpha(gl, .4);
    //             gl.sphereBuffer.bindBuffers(gl);
    //             for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //                 let a = this.atoms[i];
    //                 if(a.isHover || a.isSelected_old){
    //                     a.renderHighlight(gl, styles);
    //                 }
    //             }
    //             gl.cylinderBuffer.bindBuffers(gl);
    //             for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //                 let b = this.bonds[i];
    //                 if(b.isHover || b.isSelected_old){
    //                     b.renderHighlight(gl, styles);
    //                 }
    //             }
    //             gl.depthMask(true);
    //             gl.disable(gl.BLEND);
    //             gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //         }
    //     }
    // };
    // _.renderPickFrame = function(gl, styles, objects, includeAtoms, includeBonds) {
    //     if (this.styles) {
    //         styles = this.styles;
    //     }
    //     let isMacro = this.atoms.length > 0 && this.atoms[0].hetatm !== undefined;
    //     if (includeBonds && styles.bonds_display) {
    //         if (this.bonds.length > 0) {
    //             if (styles.bonds_renderAsLines_3D) {
    //                 gl.lineWidth(styles.bonds_width_2D);
    //                 gl.lineBuffer.bindBuffers(gl);
    //             } else {
    //                 gl.cylinderBuffer.bindBuffers(gl);
    //             }
    //         }
    //         for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //             let b = this.bonds[i];
    //             if (!isMacro || b.a1.hetatm) {
    //                 gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
    //                 b.renderPicker(gl, styles);
    //                 objects.push(b);
    //             }
    //         }
    //     }
    //     if (includeAtoms && styles.atoms_display) {
    //         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //             let a = this.atoms[i];
    //             a.bondNumber = 0;
    //             a.renderAsStar = false;
    //         }
    //         for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
    //             let b = this.bonds[i];
    //             b.a1.bondNumber++;
    //             b.a2.bondNumber++;
    //         }
    //         if (this.atoms.length > 0) {
    //             gl.sphereBuffer.bindBuffers(gl);
    //         }
    //         let asStars = [];
    //         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //             let a = this.atoms[i];
    //             if (!isMacro || (a.hetatm && (styles.macro_showWater || !a.isWater))) {
    //                 if (styles.atoms_nonBondedAsStars_3D && a.bondNumber === 0) {
    //                     a.renderAsStar = true;
    //                     asStars.push(a);
    //                 } else {
    //                     gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
    //                     a.render(gl, styles, true);
    //                     objects.push(a);
    //                 }
    //             }
    //         }
    //         if (asStars.length > 0) {
    //             gl.starBuffer.bindBuffers(gl);
    //             for ( let i = 0, ii = asStars.length; i < ii; i++) {
    //                 let a = asStars[i];
    //                 gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
    //                 a.render(gl, styles, true);
    //                 objects.push(a);
    //             }
    //         }
    //     }
    // };
    // _.getCenter3D = function() {
    //     if (this.atoms.length === 1) {
    //         return new structures.Atom('C', this.atoms[0].x, this.atoms[0].y, this.atoms[0].z);
    //     }
    //     let minX = Infinity, minY = Infinity, minZ = Infinity;
    //     let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    //     if (this.chains) {
    //         // residues
    //         for ( let i = 0, ii = this.chains.length; i < ii; i++) {
    //             let chain = this.chains[i];
    //             for ( let j = 0, jj = chain.length; j < jj; j++) {
    //                 let residue = chain[j];
    //                 minX = m.min(residue.cp1.x, residue.cp2.x, minX);
    //                 minY = m.min(residue.cp1.y, residue.cp2.y, minY);
    //                 minZ = m.min(residue.cp1.z, residue.cp2.z, minZ);
    //                 maxX = m.max(residue.cp1.x, residue.cp2.x, maxX);
    //                 maxY = m.max(residue.cp1.y, residue.cp2.y, maxY);
    //                 maxZ = m.max(residue.cp1.z, residue.cp2.z, maxZ);
    //             }
    //         }
    //     }
    //     for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //         minX = m.min(this.atoms[i].x, minX);
    //         minY = m.min(this.atoms[i].y, minY);
    //         minZ = m.min(this.atoms[i].z, minZ);
    //         maxX = m.max(this.atoms[i].x, maxX);
    //         maxY = m.max(this.atoms[i].y, maxY);
    //         maxZ = m.max(this.atoms[i].z, maxZ);
    //     }
    //     return new structures.Atom('C', (maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
    // };
    _.getCenter = function() {
        if (this.atoms.length === 1) {
            return new structures.Point(this.atoms[0].x, this.atoms[0].y);
        }
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            minX = m.min(this.atoms[i].x, minX);
            minY = m.min(this.atoms[i].y, minY);
            maxX = m.max(this.atoms[i].x, maxX);
            maxY = m.max(this.atoms[i].y, maxY);
        }
        return new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
    };
    _.getDimension = function() {
        if (this.atoms.length === 1) {
            return new structures.Point(0, 0);
        }
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        if (this.chains) {
            for ( let i = 0, ii = this.chains.length; i < ii; i++) {
                let chain = this.chains[i];
                for ( let j = 0, jj = chain.length; j < jj; j++) {
                    let residue = chain[j];
                    minX = m.min(residue.cp1.x, residue.cp2.x, minX);
                    minY = m.min(residue.cp1.y, residue.cp2.y, minY);
                    maxX = m.max(residue.cp1.x, residue.cp2.x, maxX);
                    maxY = m.max(residue.cp1.y, residue.cp2.y, maxY);
                }
            }
            minX -= 30;
            minY -= 30;
            maxX += 30;
            maxY += 30;
        }
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            minX = m.min(this.atoms[i].x, minX);
            minY = m.min(this.atoms[i].y, minY);
            maxX = m.max(this.atoms[i].x, maxX);
            maxY = m.max(this.atoms[i].y, maxY);
        }
        return new structures.Point(maxX - minX, maxY - minY);
    };
    _.check = function(force) {
        // using force improves efficiency, so changes will not be checked
        // until a render occurs
        // you can force a check by sending true to this function after
        // calling check with a false
        if (force && this.doChecks) {
            // only check if the number of bonds has changed
            if (this.findRings) {
                if (this.bonds.length - this.atoms.length !== this.fjNumCache) {
                    // find rings
                    this.rings = new c.informatics.SSSRFinder(this).rings;
                    for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
                        this.bonds[i].ring = undefined;
                    }
                    for ( let i = 0, ii = this.rings.length; i < ii; i++) {
                        this.rings[i].setupBonds();
                    }
                } else {
                    // update rings if any
                    for ( let i = 0, ii = this.rings.length; i < ii; i++) {
                        let r = this.rings[i];
                        r.center = r.getCenter();
                    }
                }
            }
            // find lones
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                this.atoms[i].isLone = false;
                if (this.atoms[i].label === 'C') {
                    let counter = 0;
                    for ( let j = 0, jj = this.bonds.length; j < jj; j++) {
                        if (this.bonds[j].a1 === this.atoms[i] || this.bonds[j].a2 === this.atoms[i]) {
                            counter++;
                        }
                    }
                    if (counter === 0) {
                        this.atoms[i].isLone = true;
                    }
                }
            }
            // sort
            let sort = false;
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                if (this.atoms[i].z !== 0) {
                    sort = true;
                }
            }
            if (sort) {
                this.sortAtomsByZ();
                this.sortBondsByZ();
            }
            // setup metadata
            this.setupMetaData();
            this.atomNumCache = this.atoms.length;
            this.bondNumCache = this.bonds.length;
            // fj number cache doesnt care if there are separate molecules,
            // as the change will signal a need to check for rings; the
            // accuracy doesn't matter
            this.fjNumCache = this.bonds.length - this.atoms.length;
        }
        this.doChecks = !force;
    };
    _.getAngles = function(a) {
        let angles = [];
        for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
            if (this.bonds[i].contains(a)) {
                angles.push(a.angle(this.bonds[i].getNeighbor(a)));
            }
        }
        angles.sort(function(a, b) {
            return a - b;
        });
        return angles;
    };
    _.getCoordinationNumber = function(bs) {
        let coordinationNumber = 0;
        for ( let i = 0, ii = bs.length; i < ii; i++) {
            coordinationNumber += bs[i].bondOrder;
        }
        return coordinationNumber;
    };
    _.getBonds = function(a) {
        let bonds = [];
        for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
            if (this.bonds[i].contains(a)) {
                bonds.push(this.bonds[i]);
            }
        }
        return bonds;
    };
    _.sortAtomsByZ = function() {
        for ( let i = 1, ii = this.atoms.length; i < ii; i++) {
            let index = i;
            while (index > 0 && this.atoms[index].z < this.atoms[index - 1].z) {
                let hold = this.atoms[index];
                this.atoms[index] = this.atoms[index - 1];
                this.atoms[index - 1] = hold;
                index--;
            }
        }
    };
    _.sortBondsByZ = function() {
        for ( let i = 1, ii = this.bonds.length; i < ii; i++) {
            let index = i;
            while (index > 0 && (this.bonds[index].a1.z + this.bonds[index].a2.z) < (this.bonds[index - 1].a1.z + this.bonds[index - 1].a2.z)) {
                let hold = this.bonds[index];
                this.bonds[index] = this.bonds[index - 1];
                this.bonds[index - 1] = hold;
                index--;
            }
        }
    };
    _.setupMetaData = function() {
        let center = this.getCenter();
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            let a = this.atoms[i];
            // a.parentMol = this;
            a.bonds = this.getBonds(a);
            a.angles = this.getAngles(a);
            a.isHidden = a.bonds.length === 2 && m.abs(m.abs(a.angles[1] - a.angles[0]) - m.PI) < m.PI / 30 && a.bonds[0].bondOrder === a.bonds[1].bondOrder;
            let angleData = math.angleBetweenLargest(a.angles);
            a.angleOfLeastInterference = angleData.angle % (m.PI * 2);
            a.largestAngle = angleData.largest;
            a.coordinationNumber = this.getCoordinationNumber(a.bonds);
            a.bondNumber = a.bonds.length;
            a.molCenter = center;
        }
        for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
            let b = this.bonds[i];
            // b.parentMol = this;
            b.molCenter = center;
        }
    };
    _.scaleToAverageBondLength = function(length) {
        let avBondLength = this.getAverageBondLength();
        if (avBondLength !== 0) {
            let scale = length / avBondLength;
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                this.atoms[i].x *= scale;
                this.atoms[i].y *= scale;
            }
        }
    };
    _.getAverageBondLength = function() {
        if (this.bonds.length === 0) {
            return 0;
        }
        let tot = 0;
        for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
            tot += this.bonds[i].getLength();
        }
        tot /= this.bonds.length;
        return tot;
    };
    _.getBounds = function() {
        let bounds = new math.Bounds();
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            bounds.expand(this.atoms[i].getBounds());
        }
        if (this.chains) {
            for ( let i = 0, ii = this.chains.length; i < ii; i++) {
                let chain = this.chains[i];
                for ( let j = 0, jj = chain.length; j < jj; j++) {
                    let residue = chain[j];
                    bounds.expand(residue.cp1.x, residue.cp1.y);
                    bounds.expand(residue.cp2.x, residue.cp2.y);
                }
            }
            bounds.minX -= 30;
            bounds.minY -= 30;
            bounds.maxX += 30;
            bounds.maxY += 30;
        }
        return bounds;
    };
    // _.getBounds3D = function() {
    //     let bounds = new math.Bounds();
    //     for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
    //         bounds.expand(this.atoms[i].getBounds3D());
    //     }
    //     if (this.chains) {
    //         for ( let i = 0, ii = this.chains.length; i < ii; i++) {
    //             let chain = this.chains[i];
    //             for ( let j = 0, jj = chain.length; j < jj; j++) {
    //                 let residue = chain[j];
    //                 bounds.expand3D(residue.cp1.x, residue.cp1.y, residue.cp1.z);
    //                 bounds.expand3D(residue.cp2.x, residue.cp2.y, residue.cp2.z);
    //             }
    //         }
    //     }
    //     return bounds;
    // };
    _.getAtomGroup = function(a) {
        let ring = false;
        for(let i = 0, ii = this.atoms.length; i<ii; i++){
            this.atoms[i].visited = false;
        }
        for(let i = 0, ii = this.bonds.length; i<ii; i++){
            let b = this.bonds[i];
            if(!ring && b.contains(a) && b.ring!==undefined){
                ring = true;
            }
        }
        if(!ring){
            return undefined;
        }
        let set = [a];
        a.visited = true;
        let q = new structures.Queue();
        q.enqueue(a);
        while (!q.isEmpty()) {
            let atom = q.dequeue();
            for(let i = 0, ii = this.bonds.length; i<ii; i++){
                let b = this.bonds[i];
                if(b.contains(atom) && ring===(b.ring!==undefined)){
                    let n = b.getNeighbor(atom);
                    if(!n.visited){
                        n.visited = true;
                        set.push(n);
                        q.enqueue(n);
                    }
                }
            }
        }
        return set;
    };
    _.getBondGroup = function(b) {
        let ring = b.ring!==undefined;
        let contained = false;
        for(let i = 0, ii = this.bonds.length; i<ii; i++){
            let bi = this.bonds[i];
            if(bi===b){
                contained = true;
            }
            bi.visited = false;
        }
        if(!contained){
            // this bond isn't part of the molecule
            return undefined;
        }
        let set = [b];
        b.visited = true;
        let q = new structures.Queue();
        q.enqueue(b);
        while (!q.isEmpty()) {
            let bond = q.dequeue();
            for(let i = 0, ii = this.bonds.length; i<ii; i++){
                let n = this.bonds[i];
                if(!n.visited && (n.a1===bond.a1||n.a2===bond.a1||n.a1===bond.a2||n.a2===bond.a2) && (n.ring!==undefined)===ring){
                    n.visited = true;
                    set.push(n);
                    q.enqueue(n);
                }
            }
        }
        return set;
    };

})(Chemio, Chemio.math, Chemio.structures, Chemio.RESIDUE, Math);

//region Unused structures
// Spectrum structure
// (function(extensions, structures, math, m, undefined) {
// 	'use strict';
// 	structures.Spectrum = function() {
// 		this.data = [];
// 		this.metadata = [];
// 		this.dataDisplay = [];
// 		this.memory = {
// 			offsetTop : 0,
// 			offsetLeft : 0,
// 			offsetBottom : 0,
// 			flipXAxis : false,
// 			scale : 1,
// 			width : 0,
// 			height : 0
// 		};
// 	};
// 	let _ = structures.Spectrum.prototype;
// 	_.title = undefined;
// 	_.xUnit = undefined;
// 	_.yUnit = undefined;
// 	_.continuous = true;
// 	_.integrationSensitivity = 0.01;
// 	_.draw = function(ctx, styles, width, height) {
// 		if (this.styles) {
// 			styles = this.styles;
// 		}
// 		let offsetTop = 5;
// 		let offsetLeft = 0;
// 		let offsetBottom = 0;
// 		// draw decorations
// 		ctx.fillStyle = styles.text_color;
// 		ctx.textAlign = 'center';
// 		ctx.textBaseline = 'alphabetic';
// 		ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
// 		if (this.xUnit) {
// 			offsetBottom += styles.text_font_size;
// 			ctx.fillText(this.xUnit, width / 2, height - 2);
// 		}
// 		if (this.yUnit && styles.plots_showYAxis) {
// 			offsetLeft += styles.text_font_size;
// 			ctx.save();
// 			ctx.translate(styles.text_font_size, height / 2);
// 			ctx.rotate(-m.PI / 2);
// 			ctx.fillText(this.yUnit, 0, 0);
// 			ctx.restore();
// 		}
// 		if (this.title) {
// 			offsetTop += styles.text_font_size;
// 			ctx.fillText(this.title, width / 2, styles.text_font_size);
// 		}
// 		// draw ticks
// 		ctx.lineCap = 'square';
// 		offsetBottom += 5 + styles.text_font_size;
// 		if (styles.plots_showYAxis) {
// 			offsetLeft += 5 + ctx.measureText('1000').width;
// 		}
// 		if (styles.plots_showGrid) {
// 			ctx.strokeStyle = styles.plots_gridColor;
// 			ctx.lineWidth = styles.plots_gridLineWidth;
// 			ctx.strokeRect(offsetLeft, offsetTop, width - offsetLeft, height - offsetBottom - offsetTop);
// 		}
// 		ctx.textAlign = 'center';
// 		ctx.textBaseline = 'top';
// 		let span = this.maxX - this.minX;
// 		let t = span / 100;
// 		let major = .001;
// 		while (major < t || span / major > 25) {
// 			major *= 10;
// 		}
// 		let counter = 0;
// 		let overlapX = styles.plots_flipXAxis ? width : 0;
// 		for ( let i = m.round(this.minX / major) * major; i <= this.maxX; i += major / 2) {
// 			let x = this.getTransformedX(i, styles, width, offsetLeft);
// 			if (x > offsetLeft) {
// 				ctx.strokeStyle = 'black';
// 				ctx.lineWidth = 1;
// 				if (counter % 2 === 0) {
// 					ctx.beginPath();
// 					ctx.moveTo(x, height - offsetBottom);
// 					ctx.lineTo(x, height - offsetBottom + 2);
// 					ctx.stroke();
// 					let s = i.toFixed(5);
// 					while (s.charAt(s.length - 1) === '0') {
// 						s = s.substring(0, s.length - 1);
// 					}
// 					if (s.charAt(s.length - 1) === '.') {
// 						s = s.substring(0, s.length - 1);
// 					}
// 					// do this to avoid label overlap
// 					let numWidth = ctx.measureText(s).width;
// 					if (styles.plots_flipXAxis) {
// 						numWidth *= -1;
// 					}
// 					let ls = x - numWidth / 2;
// 					if (styles.plots_flipXAxis ? ls < overlapX : ls > overlapX) {
// 						ctx.fillText(s, x, height - offsetBottom + 2);
// 						overlapX = x + numWidth / 2;
// 					}
// 					if (styles.plots_showGrid) {
// 						ctx.strokeStyle = styles.plots_gridColor;
// 						ctx.lineWidth = styles.plots_gridLineWidth;
// 						ctx.beginPath();
// 						ctx.moveTo(x, height - offsetBottom);
// 						ctx.lineTo(x, offsetTop);
// 						ctx.stroke();
// 					}
// 				} else {
// 					ctx.beginPath();
// 					ctx.moveTo(x, height - offsetBottom);
// 					ctx.lineTo(x, height - offsetBottom + 2);
// 					ctx.stroke();
// 				}
// 			}
// 			counter++;
// 		}
// 		if (styles.plots_showYAxis || styles.plots_showGrid) {
// 			let spany = 1 / styles.scale;
// 			ctx.textAlign = 'right';
// 			ctx.textBaseline = 'middle';
// 			for ( let i = 0; i <= 10; i++) {
// 				let yval = spany / 10 * i;
// 				let y = offsetTop + (height - offsetBottom - offsetTop) * (1 - yval * styles.scale);
// 				if (styles.plots_showGrid) {
// 					ctx.strokeStyle = styles.plots_gridColor;
// 					ctx.lineWidth = styles.plots_gridLineWidth;
// 					ctx.beginPath();
// 					ctx.moveTo(offsetLeft, y);
// 					ctx.lineTo(width, y);
// 					ctx.stroke();
// 				}
// 				if (styles.plots_showYAxis) {
// 					ctx.strokeStyle = 'black';
// 					ctx.lineWidth = 1;
// 					ctx.beginPath();
// 					ctx.moveTo(offsetLeft, y);
// 					ctx.lineTo(offsetLeft - 3, y);
// 					ctx.stroke();
// 					let val = yval * 100;
// 					let cutoff = m.max(0, 3 - m.floor(val).toString().length);
// 					let s = val.toFixed(cutoff);
// 					if (cutoff > 0) {
// 						while (s.charAt(s.length - 1) === '0') {
// 							s = s.substring(0, s.length - 1);
// 						}
// 					}
// 					if (s.charAt(s.length - 1) === '.') {
// 						s = s.substring(0, s.length - 1);
// 					}
// 					ctx.fillText(s, offsetLeft - 3, y);
// 				}
// 			}
// 		}
// 		// draw axes
// 		ctx.strokeStyle = 'black';
// 		ctx.lineWidth = 1;
// 		ctx.beginPath();
// 		// draw x axis
// 		ctx.moveTo(width, height - offsetBottom);
// 		ctx.lineTo(offsetLeft, height - offsetBottom);
// 		// draw y axis
// 		if (styles.plots_showYAxis) {
// 			ctx.lineTo(offsetLeft, offsetTop);
// 		}
// 		ctx.stroke();
// 		// draw metadata
// 		if (this.dataDisplay.length > 0) {
// 			ctx.textAlign = 'left';
// 			ctx.textBaseline = 'top';
// 			let mcount = 0;
// 			for ( let i = 0, ii = this.dataDisplay.length; i < ii; i++) {
// 				if (this.dataDisplay[i].value) {
// 					ctx.fillText([ this.dataDisplay[i].display, ': ', this.dataDisplay[i].value ].join(''), offsetLeft + 10, offsetTop + 10 + mcount * (styles.text_font_size + 5));
// 					mcount++;
// 				} else if (this.dataDisplay[i].tag) {
// 					for ( let j = 0, jj = this.metadata.length; j < jj; j++) {
// 						if (this.metadata[j].startsWith(this.dataDisplay[i].tag)) {
// 							let draw = this.metadata[j];
// 							if (this.dataDisplay[i].display) {
// 								let index = this.metadata[j].indexOf('=');
// 								draw = [ this.dataDisplay[i].display, ': ', index > -1 ? this.metadata[j].substring(index + 2) : this.metadata[j] ].join('');
// 							}
// 							ctx.fillText(draw, offsetLeft + 10, offsetTop + 10 + mcount * (styles.text_font_size + 5));
// 							mcount++;
// 							break;
// 						}
// 					}
// 				}
// 			}
// 		}
// 		this.drawPlot(ctx, styles, width, height, offsetTop, offsetLeft, offsetBottom);
// 		this.memory.offsetTop = offsetTop;
// 		this.memory.offsetLeft = offsetLeft;
// 		this.memory.offsetBottom = offsetBottom;
// 		this.memory.flipXAxis = styles.plots_flipXAxis;
// 		this.memory.scale = styles.scale;
// 		this.memory.width = width;
// 		this.memory.height = height;
// 	};
// 	_.drawPlot = function(ctx, styles, width, height, offsetTop, offsetLeft, offsetBottom) {
// 		if (this.styles) {
// 			styles = this.styles;
// 		}
// 		ctx.strokeStyle = styles.plots_color;
// 		ctx.lineWidth = styles.plots_width;
// 		let integration = [];
// 		// clip the spectrum display bounds here to not draw over the axes
// 		// we do this because we want to continue drawing segments to their natural ends to be accurate, but don't want to see them past the display area
// 		ctx.save();
// 		ctx.rect(offsetLeft, offsetTop, width-offsetLeft, height-offsetBottom-offsetTop);
// 		ctx.clip();
// 		ctx.beginPath();
// 		if (this.continuous) {
// 			let started = false;
// 			let counter = 0;
// 			let stop = false;
// 			for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 				let x = this.getTransformedX(this.data[i].x, styles, width, offsetLeft);
// 				let xnext;
// 				if (i < ii && !started && this.data[i+1]) {
// 					// see if you should render this first segment
// 					xnext = this.getTransformedX(this.data[i + 1].x, styles, width, offsetLeft);
// 				}
// 				// check xnext against undefined as it can be 0/1
// 				if (x >= offsetLeft && x < width || xnext !== undefined && xnext >= offsetLeft && xnext < width) {
// 					let y = this.getTransformedY(this.data[i].y, styles, height, offsetBottom, offsetTop);
// 					if (styles.plots_showIntegration && m.abs(this.data[i].y) > this.integrationSensitivity) {
// 						integration.push(new structures.Point(this.data[i].x, this.data[i].y));
// 					}
// 					if (!started) {
// 						ctx.moveTo(x, y);
// 						started = true;
// 					}
// 					ctx.lineTo(x, y);
// 					counter++;
// 					if (counter % 1000 === 0) {
// 						// segment the path to avoid crashing safari on mac os x
// 						ctx.stroke();
// 						ctx.beginPath();
// 						ctx.moveTo(x, y);
// 					}
// 					if (stop) {
// 						break;
// 					}
// 				} else if (started) {
// 					// render one more segment
// 					stop = true;
// 				}
// 			}
// 		} else {
// 			for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 				let x = this.getTransformedX(this.data[i].x, styles, width, offsetLeft);
// 				if (x >= offsetLeft && x < width) {
// 					ctx.moveTo(x, height - offsetBottom);
// 					ctx.lineTo(x, this.getTransformedY(this.data[i].y, styles, height, offsetBottom, offsetTop));
// 				}
// 			}
// 		}
// 		ctx.stroke();
// 		if (styles.plots_showIntegration && integration.length > 1) {
// 			ctx.strokeStyle = styles.plots_integrationColor;
// 			ctx.lineWidth = styles.plots_integrationLineWidth;
// 			ctx.beginPath();
// 			let ascending = integration[1].x > integration[0].x;
// 			let max;
// 			if (this.flipXAxis && !ascending || !this.flipXAxis && ascending) {
// 				for ( let i = integration.length - 2; i >= 0; i--) {
// 					integration[i].y = integration[i].y + integration[i + 1].y;
// 				}
// 				max = integration[0].y;
// 			} else {
// 				for ( let i = 1, ii = integration.length; i < ii; i++) {
// 					integration[i].y = integration[i].y + integration[i - 1].y;
// 				}
// 				max = integration[integration.length - 1].y;
// 			}
// 			for ( let i = 0, ii = integration.length; i < ii; i++) {
// 				let x = this.getTransformedX(integration[i].x, styles, width, offsetLeft);
// 				let y = this.getTransformedY(integration[i].y / styles.scale / max, styles, height, offsetBottom, offsetTop);
// 				if (i === 0) {
// 					ctx.moveTo(x, y);
// 				} else {
// 					ctx.lineTo(x, y);
// 				}
// 			}
// 			ctx.stroke();
// 		}
// 		ctx.restore();
// 	};
// 	_.getTransformedY = function(y, styles, height, offsetBottom, offsetTop) {
// 		return offsetTop + (height - offsetBottom - offsetTop) * (1 - y * styles.scale);
// 	};
// 	_.getInverseTransformedY = function(y) {
// 		// can only be called after a render when memory is set, this
// 		// function doesn't make sense without a render first anyway
// 		return (1 - (y - this.memory.offsetTop) / (this.memory.height - this.memory.offsetBottom - this.memory.offsetTop)) / this.memory.scale * 100;
// 	};
// 	_.getTransformedX = function(x, styles, width, offsetLeft) {
// 		let returning = offsetLeft + (x - this.minX) / (this.maxX - this.minX) * (width - offsetLeft);
// 		if (styles.plots_flipXAxis) {
// 			returning = width + offsetLeft - returning;
// 		}
// 		return returning;
// 	};
// 	_.getInverseTransformedX = function(x) {
// 		// can only be called after a render when memory is set, this
// 		// function doesn't make sense without a render first anyway
// 		if (this.memory.flipXAxis) {
// 			x = this.memory.width + this.memory.offsetLeft - x;
// 		}
// 		return (x - this.memory.offsetLeft) * (this.maxX - this.minX) / (this.memory.width - this.memory.offsetLeft) + this.minX;
// 	};
// 	_.setup = function() {
// 		let xmin = Number.MAX_VALUE;
// 		let xmax = Number.MIN_VALUE;
// 		let ymax = Number.MIN_VALUE;
// 		for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 			xmin = m.min(xmin, this.data[i].x);
// 			xmax = m.max(xmax, this.data[i].x);
// 			ymax = m.max(ymax, this.data[i].y);
// 		}
// 		if (this.continuous) {
// 			this.minX = xmin;
// 			this.maxX = xmax;
// 		} else {
// 			this.minX = xmin - 1;
// 			this.maxX = xmax + 1;
// 		}
// 		for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 			this.data[i].y /= ymax;
// 		}
// 	};
// 	_.zoom = function(pixel1, pixel2, width, rescaleY) {
// 		let p1 = this.getInverseTransformedX(pixel1);
// 		let p2 = this.getInverseTransformedX(pixel2);
// 		this.minX = m.min(p1, p2);
// 		this.maxX = m.max(p1, p2);
// 		if (rescaleY) {
// 			let ymax = Number.MIN_VALUE;
// 			for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 				if (math.isBetween(this.data[i].x, this.minX, this.maxX)) {
// 					ymax = m.max(ymax, this.data[i].y);
// 				}
// 			}
// 			return 1 / ymax;
// 		}
// 	};
// 	_.translate = function(dif, width) {
// 		let dist = dif / (width - this.memory.offsetLeft) * (this.maxX - this.minX) * (this.memory.flipXAxis ? 1 : -1);
// 		this.minX += dist;
// 		this.maxX += dist;
// 	};
// 	_.alertMetadata = function() {
// 		alert(this.metadata.join('\n'));
// 	};
// 	_.getInternalCoordinates = function(x, y) {
// 		return new Chemio.structures.Point(this.getInverseTransformedX(x), this.getInverseTransformedY(y));
// 	};
// 	_.getClosestPlotInternalCoordinates = function(x) {
// 		let xtl = this.getInverseTransformedX(x - 1);
// 		let xtr = this.getInverseTransformedX(x + 1);
// 		if (xtl > xtr) {
// 			let temp = xtl;
// 			xtl = xtr;
// 			xtr = temp;
// 		}
// 		let highest = -1;
// 		let max = -Infinity;
// 		let inRange = false;
// 		for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 			let p = this.data[i];
// 			if (math.isBetween(p.x, xtl, xtr)) {
// 				if (p.y > max) {
// 					inRange = true;
// 					max = p.y;
// 					highest = i;
// 				}
// 			} else if (inRange) {
// 				break;
// 			}
// 		}
// 		if (highest === -1) {
// 			return undefined;
// 		}
// 		let p = this.data[highest];
// 		return new Chemio.structures.Point(p.x, p.y * 100);
// 	};
// 	_.getClosestPeakInternalCoordinates = function(x) {
// 		let xt = this.getInverseTransformedX(x);
// 		let closest = 0;
// 		let dif = Infinity;
// 		for ( let i = 0, ii = this.data.length; i < ii; i++) {
// 			let sub = m.abs(this.data[i].x - xt);
// 			if (sub <= dif) {
// 				dif = sub;
// 				closest = i;
// 			} else {
// 				break;
// 			}
// 		}
// 		let highestLeft = closest, highestRight = closest;
// 		let maxLeft = this.data[closest].y, maxRight = this.data[closest].y;
// 		for ( let i = closest + 1, ii = this.data.length; i < ii; i++) {
// 			if (this.data[i].y + .05 > maxRight) {
// 				maxRight = this.data[i].y;
// 				highestRight = i;
// 			} else {
// 				break;
// 			}
// 		}
// 		for ( let i = closest - 1; i >= 0; i--) {
// 			if (this.data[i].y + .05 > maxLeft) {
// 				maxLeft = this.data[i].y;
// 				highestLeft = i;
// 			} else {
// 				break;
// 			}
// 		}
// 		let p = this.data[highestLeft - closest > highestRight - closest ? highestRight : highestLeft];
// 		return new Chemio.structures.Point(p.x, p.y * 100);
// 	};
//
// })(Chemio.extensions, Chemio.structures, Chemio.math, Math);

// (function(extensions, structures, m, undefined) {
// 	'use strict';
//
// 	let COMMA_SPACE_REGEX = /[ ,]+/;
// 	let COMMA_DASH_REGEX = /\-+/;
// 	let FONTS = [ 'Helvetica', 'Arial', 'Dialog' ];
//
// 	structures.Query = function(type) {
// 		this.type = type;
// 		// atom properties
// 		this.elements = {v:[],not:false};
// 		this.charge = undefined;
// 		this.chirality = undefined;
// 		this.connectivity = undefined;
// 		this.connectivityNoH = undefined;
// 		this.hydrogens = undefined;
// 		this.saturation = undefined;
// 		// bond properties
// 		this.orders = {v:[],not:false};
// 		this.stereo = undefined;
// 		// generic properties
// 		this.aromatic = undefined;
// 		this.ringCount = undefined;
// 		// cache the string value
// 		this.cache = undefined;
// 	};
// 	structures.Query.TYPE_ATOM = 0;
// 	structures.Query.TYPE_BOND = 1;
// 	let _ = structures.Query.prototype;
// 	_.parseRange = function(range){
// 		let points = [];
// 		let splits = range.split(COMMA_SPACE_REGEX);
// 		for(let i = 0, ii = splits.length; i<ii; i++){
// 			let t = splits[i];
// 			let neg = false;
// 			let neg2 = false;
// 			if(t.charAt(0)==='-'){
// 				neg = true;
// 				t = t.substring(1);
// 			}
// 			if (t.indexOf('--')!=-1) {
// 				neg2 = true;
// 			}
// 			if (t.indexOf('-')!=-1) {
// 				let parts = t.split(COMMA_DASH_REGEX);
// 				let p = {x:parseInt(parts[0]) * (neg ? -1 : 1),y:parseInt(parts[1]) * (neg2 ? -1 : 1)};
// 				if (p.y < p.x) {
// 					let tmp = p.y;
// 					p.y = p.x;
// 					p.x = tmp;
// 				}
// 				points.push(p);
// 			} else {
// 				points.push({x:parseInt(t) * (neg ? -1 : 1)});
// 			}
// 		}
// 		return points;
// 	};
// 	_.draw = function(ctx, styles, pos) {
// 		if(!this.cache){
// 			this.cache = this.toString();
// 		}
// 		let top = this.cache;
// 		let bottom = undefined;
// 		let split = top.indexOf('(');
// 		if(split!=-1){
// 			top = this.cache.substring(0, split);
// 			bottom = this.cache.substring(split, this.cache.length);
// 		}
// 		ctx.textAlign = 'center';
// 		ctx.textBaseline = 'middle';
// 		ctx.font = extensions.getFontString(12, FONTS, true, false);
// 		let tw = ctx.measureText(top).width;
// 		ctx.fillStyle = styles.backgroundColor;
// 		ctx.fillRect(pos.x-tw/2, pos.y-6, tw, 12);
// 		ctx.fillStyle = 'black';
// 		ctx.fillText(top, pos.x, pos.y);
// 		if(bottom){
// 			ctx.font = extensions.getFontString(10, FONTS, false, true);
// 			tw = ctx.measureText(bottom).width;
// 			ctx.fillStyle = styles.backgroundColor;
// 			ctx.fillRect(pos.x-tw/2, pos.y+6, tw, 11);
// 			ctx.fillStyle = 'black';
// 			ctx.fillText(bottom, pos.x, pos.y+11);
// 		}
// 	};
// 	_.outputRange = function(array){
// 		let comma = false;
// 		let sb = [];
// 		for(let i = 0, ii = array.length; i<ii; i++){
// 			if(comma){
// 				sb.push(',');
// 			}
// 			comma = true;
// 			let p = array[i];
// 			if(p.y){
// 				sb.push(p.x);
// 				sb.push('-');
// 				sb.push(p.y);
// 			}else{
// 				sb.push(p.x);
// 			}
// 		}
// 		return sb.join('');
// 	};
// 	_.toString = function() {
// 		let sb = [];
// 		let attributes = [];
// 		if(this.type===structures.Query.TYPE_ATOM){
// 			if(!this.elements || this.elements.v.length===0){
// 				sb.push('[a]');
// 			}else{
// 				if(this.elements.not){
// 					sb.push('!');
// 				}
// 				sb.push('[');
// 				sb.push(this.elements.v.join(','));
// 				sb.push(']');
// 			}
// 			if(this.chirality){
// 				attributes.push((this.chirality.not?'!':'')+'@='+this.chirality.v);
// 			}
// 			if(this.aromatic){
// 				attributes.push((this.aromatic.not?'!':'')+'A');
// 			}
// 			if(this.charge){
// 				attributes.push((this.charge.not?'!':'')+'C='+this.outputRange(this.charge.v));
// 			}
// 			if(this.hydrogens){
// 				attributes.push((this.hydrogens.not?'!':'')+'H='+this.outputRange(this.hydrogens.v));
// 			}
// 			if(this.ringCount){
// 				attributes.push((this.ringCount.not?'!':'')+'R='+this.outputRange(this.ringCount.v));
// 			}
// 			if(this.saturation){
// 				attributes.push((this.saturation.not?'!':'')+'S');
// 			}
// 			if(this.connectivity){
// 				attributes.push((this.connectivity.not?'!':'')+'X='+this.outputRange(this.connectivity.v));
// 			}
// 			if(this.connectivityNoH){
// 				attributes.push((this.connectivityNoH.not?'!':'')+'x='+this.outputRange(this.connectivityNoH.v));
// 			}
// 		}else if(this.type===structures.Query.TYPE_BOND){
// 			if(!this.orders || this.orders.v.length===0){
// 				sb.push('[a]');
// 			}else{
// 				if(this.orders.not){
// 					sb.push('!');
// 				}
// 				sb.push('[');
// 				sb.push(this.orders.v.join(','));
// 				sb.push(']');
// 			}
// 			if(this.stereo){
// 				attributes.push((this.stereo.not?'!':'')+'@='+this.stereo.v);
// 			}
// 			if(this.aromatic){
// 				attributes.push((this.aromatic.not?'!':'')+'A');
// 			}
// 			if(this.ringCount){
// 				attributes.push((this.ringCount.not?'!':'')+'R='+this.outputRange(this.ringCount.v));
// 			}
// 		}
// 		if(attributes.length>0){
// 			sb.push('(');
// 			sb.push(attributes.join(','));
// 			sb.push(')');
// 		}
// 		return sb.join('');
// 	};
//
// })(Chemio.extensions, Chemio.structures, Math);

// (function(structures, m, m4, v3, undefined) {
// 	'use strict';
// 	let SB;
// 	let lastVerticalResolution = -1;
//
// 	function setupMatrices(verticalResolution) {
// 		let n2 = verticalResolution * verticalResolution;
// 		let n3 = verticalResolution * verticalResolution * verticalResolution;
// 		let S = [ 6 / n3, 0, 0, 0, 6 / n3, 2 / n2, 0, 0, 1 / n3, 1 / n2, 1 / verticalResolution, 0, 0, 0, 0, 1 ];
// 		let Bm = [ -1 / 6, 1 / 2, -1 / 2, 1 / 6, 1 / 2, -1, 1 / 2, 0, -1 / 2, 0, 1 / 2, 0, 1 / 6, 2 / 3, 1 / 6, 0 ];
// 		SB = m4.multiply(Bm, S, []);
// 		lastVerticalResolution = verticalResolution;
// 	}
//
// 	structures.Residue = function(resSeq) {
// 		// number of vertical slashes per segment
// 		this.resSeq = resSeq;
// 	};
// 	let _ = structures.Residue.prototype;
// 	_.setup = function(nextAlpha, horizontalResolution) {
// 		this.horizontalResolution = horizontalResolution;
// 		// define plane
// 		let A = [ nextAlpha.x - this.cp1.x, nextAlpha.y - this.cp1.y, nextAlpha.z - this.cp1.z ];
// 		let B = [ this.cp2.x - this.cp1.x, this.cp2.y - this.cp1.y, this.cp2.z - this.cp1.z ];
// 		let C = v3.cross(A, B, []);
// 		this.D = v3.cross(C, A, []);
// 		v3.normalize(C);
// 		v3.normalize(this.D);
// 		// generate guide coordinates
// 		// guides for the narrow parts of the ribbons
// 		this.guidePointsSmall = [];
// 		// guides for the wide parts of the ribbons
// 		this.guidePointsLarge = [];
// 		// guides for the ribbon part of helix as cylinder model
// 		let P = [ (nextAlpha.x + this.cp1.x) / 2, (nextAlpha.y + this.cp1.y) / 2, (nextAlpha.z + this.cp1.z) / 2 ];
// 		if (this.helix) {
// 			// expand helices
// 			v3.scale(C, 1.5);
// 			v3.add(P, C);
// 		}
// 		this.guidePointsSmall[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
// 		for ( let i = 1; i < horizontalResolution; i++) {
// 			this.guidePointsSmall[i] = new structures.Atom('', this.guidePointsSmall[0].x + this.D[0] * i / horizontalResolution, this.guidePointsSmall[0].y + this.D[1] * i / horizontalResolution, this.guidePointsSmall[0].z + this.D[2] * i / horizontalResolution);
// 		}
// 		v3.scale(this.D, 4);
// 		this.guidePointsLarge[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
// 		for ( let i = 1; i < horizontalResolution; i++) {
// 			this.guidePointsLarge[i] = new structures.Atom('', this.guidePointsLarge[0].x + this.D[0] * i / horizontalResolution, this.guidePointsLarge[0].y + this.D[1] * i / horizontalResolution, this.guidePointsLarge[0].z + this.D[2] * i / horizontalResolution);
// 		}
// 	};
// 	_.getGuidePointSet = function(type) {
// 		if (type === 0) {
// 			return this.helix || this.sheet ? this.guidePointsLarge : this.guidePointsSmall;
// 		} else if (type === 1) {
// 			return this.guidePointsSmall;
// 		} else if (type === 2) {
// 			return this.guidePointsLarge;
// 		}
// 	};
// 	_.computeLineSegments = function(b2, b1, a1, doCartoon, verticalResolution) {
// 		this.setVerticalResolution(verticalResolution);
// 		this.split = a1.helix !== this.helix || a1.sheet !== this.sheet;
// 		this.lineSegments = this.innerCompute(0, b2, b1, a1, false, verticalResolution);
// 		if (doCartoon) {
// 			this.lineSegmentsCartoon = this.innerCompute(this.helix || this.sheet ? 2 : 1, b2, b1, a1, true, verticalResolution);
// 		}
// 	};
// 	_.innerCompute = function(set, b2, b1, a1, useArrows, verticalResolution) {
// 		let segments = [];
// 		let use = this.getGuidePointSet(set);
// 		let useb2 = b2.getGuidePointSet(set);
// 		let useb1 = b1.getGuidePointSet(set);
// 		let usea1 = a1.getGuidePointSet(set);
// 		for ( let l = 0, ll = use.length; l < ll; l++) {
// 			let G = [ useb2[l].x, useb2[l].y, useb2[l].z, 1, useb1[l].x, useb1[l].y, useb1[l].z, 1, use[l].x, use[l].y, use[l].z, 1, usea1[l].x, usea1[l].y, usea1[l].z, 1 ];
// 			let M = m4.multiply(G, SB, []);
// 			let strand = [];
// 			for ( let k = 0; k < verticalResolution; k++) {
// 				for ( let i = 3; i > 0; i--) {
// 					for ( let j = 0; j < 4; j++) {
// 						M[i * 4 + j] += M[(i - 1) * 4 + j];
// 					}
// 				}
// 				strand[k] = new structures.Atom('', M[12] / M[15], M[13] / M[15], M[14] / M[15]);
// 			}
// 			segments[l] = strand;
// 		}
// 		if (useArrows && this.arrow) {
// 			for ( let i = 0, ii = verticalResolution; i < ii; i++) {
// 				let mult = 1.5 - 1.3 * i / verticalResolution;
// 				let mid = m.floor(this.horizontalResolution / 2);
// 				let center = segments[mid];
// 				for ( let j = 0, jj = segments.length; j < jj; j++) {
// 					if (j !== mid) {
// 						let o = center[i];
// 						let f = segments[j][i];
// 						let vec = [ f.x - o.x, f.y - o.y, f.z - o.z ];
// 						v3.scale(vec, mult);
// 						f.x = o.x + vec[0];
// 						f.y = o.y + vec[1];
// 						f.z = o.z + vec[2];
// 					}
// 				}
// 			}
// 		}
// 		return segments;
// 	};
// 	_.setVerticalResolution = function(verticalResolution) {
// 		if (verticalResolution !== lastVerticalResolution) {
// 			setupMatrices(verticalResolution);
// 		}
// 	};
//
// })(Chemio.structures, Math, Chemio.lib.mat4, Chemio.lib.vec3);
//endregion
