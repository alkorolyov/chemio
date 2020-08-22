//********************************* ACTIONS *****************************

(function(actions, undefined) {
    'use strict';
    actions._Action = function() {
    };
    let _ = actions._Action.prototype;
    _.forward = function(sketcher) {
        this.innerForward();
        this.checks(sketcher);
    };
    _.reverse = function(sketcher) {
        this.innerReverse();
        this.checks(sketcher);
    };
    _.checks = function(sketcher) {
        for ( let i = 0, ii = sketcher.molecules.length; i < ii; i++) {
            sketcher.molecules[i].check();
        }
        if (sketcher.lasso && sketcher.lasso.isActive()) {
            sketcher.lasso.setBounds();
        }
        sketcher.checksOnAction();
        sketcher.repaint();
    };

})(Chemio.uis.actions);
(function(informatics, structures, actions, undefined) {
    'use strict';
    actions.AddAction = function(sketcher, molIdentifier, addedAtoms, addedBonds) {
        this.sketcher = sketcher;
        this.molIdentifier = molIdentifier;
        this.atoms = addedAtoms;
        this.bonds = addedBonds;
    };
    let _ = actions.AddAction.prototype = new actions._Action();
    _.innerForward = function() {
        let mol = this.sketcher.getMoleculeByAtom(this.molIdentifier);
        if (!mol) {
            mol = new structures.Molecule();
            this.sketcher.molecules.push(mol);
        }
        if (this.atoms) {
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                mol.atoms.push(this.atoms[i]);
            }
        }
        if (this.bonds) {
            let merging = [];
            for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
                let b = this.bonds[i];
                if (mol.atoms.indexOf(b.a1) === -1) {
                    let otherMol = this.sketcher.getMoleculeByAtom(b.a1);
                    if (merging.indexOf(otherMol) === -1) {
                        merging.push(otherMol);
                    }
                }
                if (mol.atoms.indexOf(b.a2) === -1) {
                    let otherMol = this.sketcher.getMoleculeByAtom(b.a2);
                    if (merging.indexOf(otherMol) === -1) {
                        merging.push(otherMol);
                    }
                }
                mol.bonds.push(b);
            }
            for ( let i = 0, ii = merging.length; i < ii; i++) {
                let molRemoving = merging[i];
                this.sketcher.removeMolecule(molRemoving);
                mol.atoms = mol.atoms.concat(molRemoving.atoms);
                mol.bonds = mol.bonds.concat(molRemoving.bonds);
            }
        }
    };
    _.innerReverse = function() {
        let mol = this.sketcher.getMoleculeByAtom(this.molIdentifier);
        if (this.atoms) {
            let aKeep = [];
            for ( let i = 0, ii = mol.atoms.length; i < ii; i++) {
                if (this.atoms.indexOf(mol.atoms[i]) === -1) {
                    aKeep.push(mol.atoms[i]);
                }
            }
            mol.atoms = aKeep;
        }
        if (this.bonds) {
            let bKeep = [];
            for ( let i = 0, ii = mol.bonds.length; i < ii; i++) {
                if (this.bonds.indexOf(mol.bonds[i]) === -1) {
                    bKeep.push(mol.bonds[i]);
                }
            }
            mol.bonds = bKeep;
        }
        if (mol.atoms.length === 0) {
            // remove molecule if it is empty
            this.sketcher.removeMolecule(mol);
        } else {
            let split = new informatics.Splitter().split(mol);
            if (split.length > 1) {
                this.sketcher.removeMolecule(mol);
                for ( let i = 0, ii = split.length; i < ii; i++) {
                    // dont' keep single atom molecules
                    if (split[i].atoms.length != 1) {
                        this.sketcher.molecules.push(split[i]);
                    } else {
                        // keep track of deleted single atoms
                        this.atoms.push(split[i].atoms[0]);
                    }
                }
            }
        }
    };

})(Chemio.informatics, Chemio.structures, Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.AddContentAction = function(sketcher, mols, shapes) {
        this.sketcher = sketcher;
        this.mols = mols;
        this.shapes = shapes;
    };
    let _ = actions.AddContentAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.sketcher.molecules = this.sketcher.molecules.concat(this.mols);
        this.sketcher.shapes = this.sketcher.shapes.concat(this.shapes);
    };
    _.innerReverse = function() {
        for(let i = 0, ii = this.mols.length; i<ii; i++){
            this.sketcher.removeMolecule(this.mols[i]);
        }
        for(let i = 0, ii = this.shapes.length; i<ii; i++){
            this.sketcher.removeShape(this.shapes[i]);
        }
    };

})(Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.AddShapeAction = function(sketcher, s) {
        this.sketcher = sketcher;
        this.s = s;
    };
    let _ = actions.AddShapeAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.sketcher.shapes.push(this.s);
    };
    _.innerReverse = function() {
        this.sketcher.removeShape(this.s);
    };

})(Chemio.uis.actions);
(function(actions, Bond, m, undefined) {
    'use strict';
    actions.ChangeBondAction = function(b, orderAfter, stereoAfter) {
        this.b = b;
        this.orderBefore = b.bondOrder;
        this.stereoBefore = b.stereo;
        if (orderAfter) {
            this.orderAfter = orderAfter;
            this.stereoAfter = stereoAfter;
        } else if (b.stereo !== Bond.STEREO_NONE) {
            this.orderAfter = 1;
            this.stereoAfter = Bond.STEREO_NONE;
        } else {
            // make sure to floor so half bond types increment correctly
            this.orderAfter = m.floor(b.bondOrder + 1);
            if (this.orderAfter > 3) {
                this.orderAfter = 1;
            }
            this.stereoAfter = Bond.STEREO_NONE;
        }
    };
    let _ = actions.ChangeBondAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.b.bondOrder = this.orderAfter;
        this.b.stereo = this.stereoAfter;
    };
    _.innerReverse = function() {
        this.b.bondOrder = this.orderBefore;
        this.b.stereo = this.stereoBefore;
    };

})(Chemio.uis.actions, Chemio.structures.Bond, Math);
(function(actions, undefined) {
    'use strict';
    actions.ChangeChargeAction = function(a, delta) {
        this.atom = a;
        this.delta = delta;
    };
    let _ = actions.ChangeChargeAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.atom.charge += this.delta;
    };
    _.innerReverse = function() {
        this.atom.charge -= this.delta;
    };

})(Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.ChangeLabelAction = function(a, after) {
        this.atom = a;
        this.before = a.label;
        this.after = after;
    };
    let _ = actions.ChangeLabelAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.atom.label = this.after;
    };
    _.innerReverse = function() {
        this.atom.label = this.before;
    };

})(Chemio.uis.actions);
(function(structures, actions, undefined) {
    'use strict';
    actions.ClearAction = function(sketcher) {
        this.sketcher = sketcher;
        this.beforeMols = this.sketcher.molecules;
        this.beforeShapes = this.sketcher.shapes;
        this.sketcher.clear();
    };
    let _ = actions.ClearAction.prototype = new actions._Action();
    _.innerForward = function() {
        this.sketcher.molecules = [];
        this.sketcher.shapes = [];
    };
    _.innerReverse = function() {
        this.sketcher.molecules = this.beforeMols;
        this.sketcher.shapes = this.beforeShapes;
    };

})(Chemio.structures, Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.DeleteAction = function(sketcher, molIdentifier, atoms, bonds) {
        this.sketcher = sketcher;
        this.molIdentifier = molIdentifier;
        this.atoms = atoms;
        this.bonds = bonds;
        this.shapes = [];
    };
    let _ = actions.DeleteAction.prototype = new actions._Action();
    _.innerForwardAReverse = actions.AddAction.prototype.innerReverse;
    _.innerReverseAForward = actions.AddAction.prototype.innerForward;
    _.innerForward = function() {
        this.innerForwardAReverse();
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            this.sketcher.removeShape(this.shapes[i]);
        }
    };
    _.innerReverse = function() {
        this.innerReverseAForward();
        if (this.shapes.length > 0) {
            this.sketcher.shapes = this.sketcher.shapes.concat(this.shapes);
        }
    };

})(Chemio.uis.actions);
(function(informatics, actions, undefined) {
    'use strict';
    actions.DeleteContentAction = function(sketcher, atoms, shapes) {
        this.sketcher = sketcher;
        this.atoms = atoms;
        this.shapes = shapes;
        this.bonds = [];
        for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
            let mol = this.sketcher.molecules[i];
            for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                let b = mol.bonds[j];
                if (b.a1.isLassoed || b.a2.isLassoed) {
                    this.bonds.push(b);
                }
            }
        }
    };
    let _ = actions.DeleteContentAction.prototype = new actions._Action();
    _.innerForward = function() {
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            this.sketcher.removeShape(this.shapes[i]);
        }
        let asKeep = [];
        let bsKeep = [];
        for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
            let mol = this.sketcher.molecules[i];
            for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                let a = mol.atoms[j];
                if (this.atoms.indexOf(a) === -1) {
                    asKeep.push(a);
                }
            }
            for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                let b = mol.bonds[j];
                if (this.bonds.indexOf(b) === -1) {
                    bsKeep.push(b);
                }
            }
        }
        this.sketcher.molecules = new informatics.Splitter().split({
            atoms : asKeep,
            bonds : bsKeep
        });
    };
    _.innerReverse = function() {
        this.sketcher.shapes = this.sketcher.shapes.concat(this.shapes);
        let asKeep = [];
        let bsKeep = [];
        for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
            let mol = this.sketcher.molecules[i];
            asKeep = asKeep.concat(mol.atoms);
            bsKeep = bsKeep.concat(mol.bonds);
        }
        this.sketcher.molecules = new informatics.Splitter().split({
            atoms : asKeep.concat(this.atoms),
            bonds : bsKeep.concat(this.bonds)
        });
    };

})(Chemio.informatics, Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.DeleteShapeAction = function(sketcher, s) {
        this.sketcher = sketcher;
        this.s = s;
    };
    let _ = actions.DeleteShapeAction.prototype = new actions._Action();
    _.innerForward = actions.AddShapeAction.prototype.innerReverse;
    _.innerReverse = actions.AddShapeAction.prototype.innerForward;

})(Chemio.uis.actions);
(function(structures, actions, m, undefined) {
    'use strict';
    actions.FlipAction = function(ps, bonds, horizontal) {
        this.ps = ps;
        this.bonds = bonds;
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            minX = m.min(this.ps[i].x, minX);
            minY = m.min(this.ps[i].y, minY);
            maxX = m.max(this.ps[i].x, maxX);
            maxY = m.max(this.ps[i].y, maxY);
        }
        this.center = new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
        this.horizontal = horizontal;
    };
    let _ = actions.FlipAction.prototype = new actions._Action();
    _.innerForward = _.innerReverse = function() {
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            let p = this.ps[i];
            if(this.horizontal){
                p.x += 2*(this.center.x-p.x);
            }else{
                p.y += 2*(this.center.y-p.y);
            }
        }
        for(let i = 0, ii = this.bonds.length; i<ii; i++){
            let b = this.bonds[i];
            if(b.stereo===structures.Bond.STEREO_WEDGED){
                b.stereo = structures.Bond.STEREO_DASHED;
            }else if(b.stereo===structures.Bond.STEREO_DASHED){
                b.stereo = structures.Bond.STEREO_WEDGED;
            }
        }
    };

})(Chemio.structures, Chemio.uis.actions, Math);
(function(actions, undefined) {
    'use strict';
    actions.FlipBondAction = function(b) {
        this.b = b;
    };
    let _ = actions.FlipBondAction.prototype = new actions._Action();
    _.innerForward = function() {
        let temp = this.b.a1;
        this.b.a1 = this.b.a2;
        this.b.a2 = temp;
    };
    _.innerReverse = function() {
        this.innerForward();
    };

})(Chemio.uis.actions);
(function(actions, undefined) {
    'use strict';
    actions.MoveAction = function(ps, dif) {
        this.ps = ps;
        this.dif = dif;
    };
    let _ = actions.MoveAction.prototype = new actions._Action();
    _.innerForward = function() {
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            this.ps[i].add(this.dif);
        }
    };
    _.innerReverse = function() {
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            this.ps[i].sub(this.dif);
        }
    };

})(Chemio.uis.actions);
(function(structures, actions, undefined) {
    'use strict';
    actions.NewMoleculeAction = function(sketcher, atoms, bonds) {
        this.sketcher = sketcher;
        this.atoms = atoms;
        this.bonds = bonds;
    };
    let _ = actions.NewMoleculeAction.prototype = new actions._Action();
    _.innerForward = function() {
        let mol = new structures.Molecule();
        mol.atoms = mol.atoms.concat(this.atoms);
        mol.bonds = mol.bonds.concat(this.bonds);
        mol.check();
        this.sketcher.addMolecule(mol);
    };
    _.innerReverse = function() {
        this.sketcher.removeMolecule(this.sketcher.getMoleculeByAtom(this.atoms[0]));
    };

})(Chemio.structures, Chemio.uis.actions);
(function(actions, m, undefined) {
    'use strict';
    actions.RotateAction = function(ps, dif, center) {
        this.ps = ps;
        this.dif = dif;
        this.center = center;
    };
    let _ = actions.RotateAction.prototype = new actions._Action();
    _.innerForward = function() {
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            let p = this.ps[i];
            let dist = this.center.distance(p);
            let angle = this.center.angle(p) + this.dif;
            p.x = this.center.x + dist * m.cos(angle);
            p.y = this.center.y - dist * m.sin(angle);
        }
    };
    _.innerReverse = function() {
        for ( let i = 0, ii = this.ps.length; i < ii; i++) {
            let p = this.ps[i];
            let dist = this.center.distance(p);
            let angle = this.center.angle(p) - this.dif;
            p.x = this.center.x + dist * m.cos(angle);
            p.y = this.center.y - dist * m.sin(angle);
        }
    };

})(Chemio.uis.actions, Math);


//region Unused Actions
// (function(actions, undefined) {
//     'use strict';
//     actions.ChangeCoordinatesAction = function(atoms, newCoords) {
//         this.atoms = atoms;
//         this.recs = [];
//         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
//             this.recs[i] = {
//                 'xo' : this.atoms[i].x,
//                 'yo' : this.atoms[i].y,
//                 'xn' : newCoords[i].x,
//                 'yn' : newCoords[i].y
//             };
//         }
//     };
//     let _ = actions.ChangeCoordinatesAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
//             this.atoms[i].x = this.recs[i].xn;
//             this.atoms[i].y = this.recs[i].yn;
//         }
//     };
//     _.innerReverse = function() {
//         for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
//             this.atoms[i].x = this.recs[i].xo;
//             this.atoms[i].y = this.recs[i].yo;
//         }
//     };
//
// })(Chemio.uis.actions);

// (function(actions, m, undefined) {
//     'use strict';
//     actions.ChangeDynamicBracketAttributeAction = function(s, type) {
//         this.s = s;
//         this.type = type;
//     };
//     let _ = actions.ChangeDynamicBracketAttributeAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         let c = this.type > 0 ? 1 : -1;
//         switch (m.abs(this.type)) {
//             case 1:
//                 this.s.n1 += c;
//                 break;
//             case 2:
//                 this.s.n2 += c;
//                 break;
//         }
//     };
//     _.innerReverse = function() {
//         let c = this.type > 0 ? -1 : 1;
//         switch (m.abs(this.type)) {
//             case 1:
//                 this.s.n1 += c;
//                 break;
//             case 2:
//                 this.s.n2 += c;
//                 break;
//         }
//     };
//
// })(Chemio.uis.actions, Math);
// (function(actions, m, undefined) {
//     'use strict';
//     actions.ChangeBracketAttributeAction = function(s, type) {
//         this.s = s;
//         this.type = type;
//     };
//     let _ = actions.ChangeBracketAttributeAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         let c = this.type > 0 ? 1 : -1;
//         switch (m.abs(this.type)) {
//             case 1:
//                 this.s.charge += c;
//                 break;
//             case 2:
//                 this.s.repeat += c;
//                 break;
//             case 3:
//                 this.s.mult += c;
//                 break;
//         }
//     };
//     _.innerReverse = function() {
//         let c = this.type > 0 ? -1 : 1;
//         switch (m.abs(this.type)) {
//             case 1:
//                 this.s.charge += c;
//                 break;
//             case 2:
//                 this.s.repeat += c;
//                 break;
//             case 3:
//                 this.s.mult += c;
//                 break;
//         }
//     };
//
// })(Chemio.uis.actions, Math);

// (function(actions, undefined) {
//     'use strict';
//     actions.ChangeLonePairAction = function(a, delta) {
//         this.atom = a;
//         this.delta = delta;
//     };
//     let _ = actions.ChangeLonePairAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.atom.numLonePair += this.delta;
//     };
//     _.innerReverse = function() {
//         this.atom.numLonePair -= this.delta;
//     };
//
// })(Chemio.uis.actions);
// (function(actions, undefined) {
//     'use strict';
//     actions.ChangeQueryAction = function(o, after) {
//         this.o = o;
//         this.before = o.query;
//         this.after = after;
//     };
//     let _ = actions.ChangeQueryAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.o.query = this.after;
//     };
//     _.innerReverse = function() {
//         this.o.query = this.before;
//     };
//
// })(Chemio.uis.actions);
// (function(actions, undefined) {
//     'use strict';
//     actions.ChangeRadicalAction = function(a, delta) {
//         this.atom = a;
//         this.delta = delta;
//     };
//     let _ = actions.ChangeRadicalAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.atom.numRadical += this.delta;
//     };
//     _.innerReverse = function() {
//         this.atom.numRadical -= this.delta;
//     };
//
// })(Chemio.uis.actions);
// (function(actions, Bond, m, undefined) {
//     'use strict';
//     actions.ChangeVAPOrderAction = function(vap, orderAfter) {
//         this.vap = vap;
//         this.orderBefore = vap.bondType;
//         this.orderAfter = orderAfter;
//     };
//     let _ = actions.ChangeVAPOrderAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.vap.bondType = this.orderAfter;
//     };
//     _.innerReverse = function() {
//         this.vap.bondType = this.orderBefore;
//     };
//
// })(Chemio.uis.actions, Chemio.structures.Bond, Math);
// (function(actions, Bond, m, undefined) {
//     'use strict';
//     actions.ChangeVAPSubstituentAction = function(vap, nsub) {
//         this.vap = vap;
//         this.nsub = nsub;
//         this.orderBefore = vap.bondType;
//         this.osub = vap.substituent;
//     };
//     let _ = actions.ChangeVAPSubstituentAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.vap.bondType = 1;
//         this.vap.substituent = this.nsub;
//         this.vap.attachments.splice(this.vap.attachments.indexOf(this.nsub), 1);
//         if(this.osub){
//             this.vap.attachments.push(this.osub);
//         }
//     };
//     _.innerReverse = function() {
//         this.vap.bondType = this.orderBefore;
//         this.vap.substituent = this.osub;
//         if(this.osub){
//             this.vap.attachments.pop();
//         }
//         this.vap.attachments.push(this.nsub);
//     };
//
// })(Chemio.uis.actions, Chemio.structures.Bond, Math);

// (function(actions, undefined) {
//     'use strict';
//     actions.DeleteVAPConnectionAction = function(vap, connection) {
//         this.vap = vap;
//         this.connection = connection;
//         this.substituent = vap.substituent===connection;
//     };
//     let _ = actions.DeleteVAPConnectionAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         if(this.substituent){
//             this.vap.substituent = undefined;
//         }else{
//             this.vap.attachments.splice(this.vap.attachments.indexOf(this.connection), 1);
//         }
//     };
//     _.innerReverse = function() {
//         if(this.substituent){
//             this.vap.substituent = this.connection;
//         }else{
//             this.vap.attachments.push(this.connection);
//         }
//     };
//
// })(Chemio.uis.actions);

// (function(actions, undefined) {
//     'use strict';
//     actions.FlipDynamicBracketAction = function(b) {
//         this.b = b;
//     };
//     let _ = actions.FlipDynamicBracketAction.prototype = new actions._Action();
//     _.innerReverse = _.innerForward = function() {
//         this.b.flip = !this.b.flip;
//     };
//
// })(Chemio.uis.actions);

// (function(actions, undefined) {
//     'use strict';
//     actions.AddVAPAttachementAction = function(vap, a, substituent) {
//         this.vap = vap;
//         this.atom = a;
//         this.substituent = substituent;
//     };
//     let _ = actions.AddVAPAttachementAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         if(this.substituent){
//             this.vap.substituent = this.atom;
//         }else{
//             this.vap.attachments.push(this.atom);
//         }
//     };
//     _.innerReverse = function() {
//         if(this.substituent){
//             this.vap.substituent = undefined;
//         }else{
//             this.vap.attachments.pop();
//         }
//     };
//
// })(Chemio.uis.actions);

// (function(actions, undefined) {
//     'use strict';
//     actions.SwitchContentAction = function(sketcher, mols, shapes) {
//         this.sketcher = sketcher;
//         this.beforeMols = this.sketcher.molecules;
//         this.beforeShapes = this.sketcher.shapes;
//         this.molsA = mols;
//         this.shapesA = shapes;
//     };
//     let _ = actions.SwitchContentAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.sketcher.loadContent(this.molsA, this.shapesA);
//     };
//     _.innerReverse = function() {
//         this.sketcher.molecules = this.beforeMols;
//         this.sketcher.shapes = this.beforeShapes;
//     };
//
// })(Chemio.uis.actions);

// (function(actions, undefined) {
//     'use strict';
//     actions.SwitchMoleculeAction = function(sketcher, mol) {
//         this.sketcher = sketcher;
//         this.beforeMols = this.sketcher.molecules;
//         this.beforeShapes = this.sketcher.shapes;
//         this.molA = mol;
//     };
//     let _ = actions.SwitchMoleculeAction.prototype = new actions._Action();
//     _.innerForward = function() {
//         this.sketcher.loadMolecule(this.molA);
//     };
//     _.innerReverse = function() {
//         this.sketcher.molecules = this.beforeMols;
//         this.sketcher.shapes = this.beforeShapes;
//     };
//
// })(Chemio.uis.actions);
//endregion
