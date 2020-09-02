
//************************ LASSO ***********************
(function(math, monitor, structures, tools, undefined) {
    'use strict';
    tools.Lasso = function(sketcher) {
        this.sketcher = sketcher;
        this.atoms = [];
        this.shapes = [];
        this.bounds = undefined;
        this.mode = tools.Lasso.MODE_LASSO;
        this.points = [];
    };
    tools.Lasso.MODE_LASSO = 'lasso';
    //tools.Lasso.MODE_LASSO_SHAPES = 'shapes';
    //tools.Lasso.MODE_RECTANGLE_MARQUEE = 'rectangle';
    let _ = tools.Lasso.prototype;

    _.findLassoed = function() {
        // add atoms, shapes from lasso polygon
        let asAdd = [];
        for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
            let mol = this.sketcher.molecules[i];
            for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                let a = mol.atoms[j];
                if (this.mode === tools.Lasso.MODE_RECTANGLE_MARQUEE) {
                    if (this.points.length === 2) {
                        if (math.isBetween(a.x, this.points[0].x, this.points[1].x) && math.isBetween(a.y, this.points[0].y, this.points[1].y)) {
                            asAdd.push(a);
                        }
                    }
                } else {
                    if (this.points.length > 1) {
                        if (math.isPointInPoly(this.points, a)) {
                            asAdd.push(a);
                        }
                    }
                }
            }
        }
        if (this.atoms.length === 0) {
            this.atoms = asAdd;
        } else {
            let asFinal = [];
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                let a = this.atoms[i];
                if (asAdd.indexOf(a) === -1) {
                    asFinal.push(a);
                } else {
                    a.isSelected = false;
                }
            }
            for ( let i = 0, ii = asAdd.length; i < ii; i++) {
                if (this.atoms.indexOf(asAdd[i]) === -1) {
                    asFinal.push(asAdd[i]);
                }
            }
            this.atoms = asFinal;
        }

        let ssAdd = [];
        for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
            let s = this.sketcher.shapes[i];
            let sps = s.getPoints();
            let contained = sps.length>0;
            for ( let j = 0, jj = sps.length; j < jj; j++) {
                let p = sps[j];
                if (this.mode === tools.Lasso.MODE_RECTANGLE_MARQUEE) {
                    if (this.points.length === 2) {
                        if (!math.isBetween(p.x, this.points[0].x, this.points[1].x) || !math.isBetween(p.y, this.points[0].y, this.points[1].y)) {
                            contained = false;
                            break;
                        }
                    } else {
                        contained = false;
                        break;
                    }
                } else {
                    if (this.points.length > 1) {
                        if (!math.isPointInPoly(this.points, p)) {
                            contained = false;
                            break;
                        }
                    } else {
                        contained = false;
                        break;
                    }
                }
            }
            if (contained) {
                ssAdd.push(s);
            }
        }
        if (this.shapes.length === 0) {
            this.shapes = ssAdd;
        } else {
            let ssFinal = [];
            for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
                let s = this.shapes[i];
                if (ssAdd.indexOf(s) === -1) {
                    ssFinal.push(s);
                } else {
                    s.isSelected = false;
                }
            }
            for ( let i = 0, ii = ssAdd.length; i < ii; i++) {
                if (this.shapes.indexOf(ssAdd[i]) === -1) {
                    ssFinal.push(ssAdd[i]);
                }
            }
            this.shapes = ssFinal;
        }

    }
    _.select = function(atoms, shapes) {
        if (this.block) {
            return;
        }
        if (!monitor.SHIFT) {
            this.empty();
        }
        if (atoms || shapes) {
            // add atoms, shapes as arguments
            for (let i = 0, ii = atoms.length; i < ii; i++) {
                if (this.atoms.indexOf(atoms[i]) === -1) {
                    this.atoms.push(atoms[i]);
                }
            }
            if (shapes) {
                for (let i = 0, ii = shapes.length; i < ii; i++) {
                    if (this.shapes.indexOf(shapes[i]) === -1) {
                        this.shapes.push(shapes[i]);
                    }
                }
            }
        } else {
            this.findLassoed();
        }

        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            this.atoms[i].isLassoed = false;
            this.atoms[i].isSelected = true;
        }
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            this.shapes[i].isLassoed = false;
            this.shapes[i].isSelected = true;
        }

        this.setBounds();
        if (this.bounds && this.bounds.minX === Infinity) {
            this.empty();
        }
        this.points = [];
        this.sketcher.stateManager.STATE_LASSO.clearHover();
        this.sketcher.stateManager.STATE_LASSO.updateCursor(this.sketcher.lastMousePos);
        this.enableButtons();
        this.sketcher.renderer.redraw();
    };
    _.deselect = function(atoms, shapes) {
        let asKeep = [];
        for (let i = 0, ii = this.atoms.length; i < ii; i++) {
            if (atoms.indexOf(this.atoms[i]) === -1) {
                asKeep.push(this.atoms[i]);
            } else {
                this.atoms[i].isSelected = false;
            }
        }
        this.atoms = asKeep;

        let ssKeep = [];
        for (let i = 0, ii = this.shapes.length; i < ii; i++) {
            if (shapes.indexOf(this.shapes[i]) === -1) {
                ssKeep.push(this.shapes[i]);
            } else {
                this.shapes[i].isSelected = false;
            }
        }
        this.shapes = ssKeep;

        this.setBounds();
        this.enableButtons();
        this.sketcher.renderer.redraw();
    };
    _.lasso = function() {
        if (this.block) {
            return;
        }

        if (!monitor.SHIFT) {
            this.empty();
        }

        this.findLassoed();

        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            this.atoms[i].isLassoed = true;
        }
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            this.shapes[i].isLassoed = true;
        }


    }

    _.enableButtons = function() {
        if (this.sketcher.useServices) {
            if (this.atoms.length > 0) {
                this.sketcher.toolbarManager.buttonClean.enable();
                this.sketcher.toolbarManager.buttonCalculate.enable();
            } else {
                this.sketcher.toolbarManager.buttonClean.disable();
                this.sketcher.toolbarManager.buttonCalculate.disable();
            }
        }
        if(this.atoms.length>0 || this.shapes.length>0){
            this.sketcher.toolbarManager.buttonSave.enable();
            // this.sketcher.toolbarManager.buttonCut.enable();
            // this.sketcher.toolbarManager.buttonCopy.enable();
            // this.sketcher.toolbarManager.buttonFlipVert.enable();
            // this.sketcher.toolbarManager.buttonFlipHor.enable();
        }else{
            this.sketcher.toolbarManager.buttonSave.disable();
            //this.sketcher.toolbarManager.buttonCut.disable();
            //this.sketcher.toolbarManager.buttonCopy.disable();
            //this.sketcher.toolbarManager.buttonFlipVert.disable();
            //this.sketcher.toolbarManager.buttonFlipHor.disable();
        }
    };
    _.setBounds = function() {
        if (this.isActive()) {
            this.sketcher.renderer.redraw();
            this.bounds = new math.Bounds();
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                let a = this.atoms[i];
                this.bounds.expand(a.getBounds());
            }
            for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
                this.bounds.expand(this.shapes[i].getBounds());
            }
            let buffer = this.sketcher.styles.atoms_selectRadius;
            this.bounds.minX -= buffer;
            this.bounds.minY -= buffer;
            this.bounds.maxX += buffer;
            this.bounds.maxY += buffer;
        } else {
            this.bounds = undefined;
        }
    };
    _.empty = function() {
        this.deselect(this.atoms, this.shapes);

        // if deselection caused by State change - change to new state default cursor
        let cursor = this.sketcher.stateManager.getCurrentState().defaultCursor;
        this.sketcher.stateManager.getCurrentState().setCursor(cursor);

    };
    _.draw = function(ctx, styles) {
        ctx.strokeStyle = styles.colorHover;
        ctx.lineWidth = styles.lasso_lineWidth / styles.scale;
        ctx.setLineDash([3]);
        if (this.points.length > 0) {
            if (this.mode === tools.Lasso.MODE_RECTANGLE_MARQUEE) {
                if (this.points.length === 2) {
                    let p1 = this.points[0];
                    let p2 = this.points[1];
                    ctx.beginPath();
                    ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                    ctx.stroke();
                }
            } else {
                if (this.points.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.points[0].x, this.points[0].y);
                    for ( let i = 1, ii = this.points.length; i < ii; i++) {
                        ctx.lineTo(this.points[i].x, this.points[i].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
        if (this.bounds) {
            ctx.beginPath();
            ctx.rect(this.bounds.minX, this.bounds.minY, this.bounds.maxX - this.bounds.minX, this.bounds.maxY - this.bounds.minY);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    };
    _.isActive = function() {
        return this.atoms.length > 0 || this.shapes.length > 0;
    };
    _.getFirstMolecule = function() {
        if (this.atoms.length > 0) {
            return this.sketcher.getMoleculeByAtom(this.atoms[0]);
        }
        return undefined;
    };
    _.getBonds = function() {
        let bonds = [];
        if (this.atoms.length > 0) {
            for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
                let m = this.sketcher.molecules[i];
                for ( let j = 0, jj = m.bonds.length; j < jj; j++) {
                    let b = m.bonds[j];
                    if(b.a1.isSelected && b.a2.isSelected){
                        bonds.push(b);
                    }
                }
            }
        }
        return bonds;
    };
    _.getAllPoints = function() {
        let ps = this.atoms;
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            ps = ps.concat(this.shapes[i].getPoints());
        }
        return ps;
    };
    _.addPoint = function(p) {
        if (this.mode === tools.Lasso.MODE_RECTANGLE_MARQUEE) {
            if (this.points.length < 2) {
                this.points.push(p);
            } else {
                let changing = this.points[1];
                changing.x = p.x;
                changing.y = p.y;
            }
        } else {
            this.points.push(p);
        }
    };
    _.selectMolecule = function(mol){
        let attachedShapes = [];
        // also select shape appendages, like repeating groups
        // for(let i = 0, ii = this.sketcher.shapes.length; i<ii; i++){
        //     let s = this.sketcher.shapes[i];
        //     if(s instanceof structures.d2.DynamicBracket && s.contents.length!==0 && mol.atoms.indexOf(s.contents[0])!==-1){
        //         attachedShapes.push(s);
        //     }
        // }
        this.select(mol.atoms, attachedShapes);
    };
    _.deselectMolecule = function(mol) {
        let attachedShapes = [];
        // for(let i = 0, ii = this.sketcher.shapes.length; i<ii; i++){
        //     let s = this.sketcher.shapes[i];
        //     if(s instanceof structures.d2.DynamicBracket && s.contents.length!==0 && mol.atoms.indexOf(s.contents[0])!==-1){
        //         attachedShapes.push(s);
        //     }
        // }
        this.deselect(mol.atoms, attachedShapes);
    };
    _.selectNextMolecule = function(){
        if (this.sketcher.molecules.length > 0) {
            let nextMolIndex = this.sketcher.molecules.length - 1;
            if (this.atoms.length > 0) {
                let curMol = this.sketcher.getMoleculeByAtom(this.atoms[0]);
                nextMolIndex = this.sketcher.molecules.indexOf(curMol) + 1;
            }
            if (nextMolIndex === this.sketcher.molecules.length) {
                nextMolIndex = 0;
            }
            let mol = this.sketcher.molecules[nextMolIndex];
            this.selectMolecule(mol);
        }
    };
    _.selectNextShape = function(){
        if (this.sketcher.shapes.length > 0) {
            let nextShapeIndex = this.sketcher.shapes.length - 1;
            if (this.shapes.length > 0) {
                nextShapeIndex = this.sketcher.shapes.indexOf(this.shapes[0]) + 1;
            }
            if (nextShapeIndex === this.sketcher.shapes.length) {
                nextShapeIndex = 0;
            }
            // have to manually empty because shift modifier key
            // is down
            this.empty();
            this.select([], [ this.sketcher.shapes[nextShapeIndex] ]);
        }
    };

})(Chemio.math, Chemio.monitor, Chemio.structures, Chemio.uis.tools);
