// ************************** Informatics ******************************

(function(c, ELEMENT, informatics, structures, undefined) {
    'use strict';
    informatics.getPointsPerAngstrom = function() {
        return c.DEFAULT_STYLES.bondLength_2D / c.DEFAULT_STYLES.angstromsPerBondLength;
    };

    informatics.BondDeducer = function() {
    };
    let _ = informatics.BondDeducer.prototype;
    _.margin = 1.1;
    _.deduceCovalentBonds = function(molecule, customPointsPerAngstrom) {
        let pointsPerAngstrom = informatics.getPointsPerAngstrom();
        if (customPointsPerAngstrom) {
            pointsPerAngstrom = customPointsPerAngstrom;
        }
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            for ( let j = i + 1; j < ii; j++) {
                let first = molecule.atoms[i];
                let second = molecule.atoms[j];
                if (first.distance3D(second) < (ELEMENT[first.label].covalentRadius + ELEMENT[second.label].covalentRadius) * pointsPerAngstrom * this.margin) {
                    molecule.bonds.push(new structures.Bond(first, second, 1));
                }
            }
        }
    };

})(Chemio, Chemio.ELEMENT, Chemio.informatics, Chemio.structures);
(function(informatics, structures, undefined) {
    'use strict';
    informatics.HydrogenDeducer = function() {
    };
    let _ = informatics.HydrogenDeducer.prototype;
    _.removeHydrogens = function(molecule, removeStereo) {
        let atoms = [];
        let bonds = [];
        for ( let i = 0, ii = molecule.bonds.length; i < ii; i++) {
            let b = molecule.bonds[i];
            let save = b.a1.label !== 'H' && b.a2.label !== 'H';
            if(!save && (!removeStereo && b.stereo !== structures.Bond.STEREO_NONE)){
                save = true;
            }
            if (save) {
                b.a1.tag = true;
                bonds.push(b);
            }else{
                if(b.a1.label === 'H'){
                    b.a1.remove = true;
                }
                if(b.a2.label === 'H'){
                    b.a2.remove = true;
                }
            }
        }
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            let a = molecule.atoms[i];
            if (a.remove) {
                a.remove = undefined;
            }else{
                atoms.push(a);
            }
        }
        molecule.atoms = atoms;
        molecule.bonds = bonds;
    };

})(Chemio.informatics, Chemio.structures);
(function(informatics, structures, undefined) {
    'use strict';
    informatics.Splitter = function() {
    };
    let _ = informatics.Splitter.prototype;
    _.split = function(molecule) {
        let mols = [];
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            molecule.atoms[i].visited = false;
        }
        for ( let i = 0, ii = molecule.bonds.length; i < ii; i++) {
            molecule.bonds[i].visited = false;
        }
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            let a = molecule.atoms[i];
            if (!a.visited) {
                let newMol = new structures.Molecule();
                newMol.atoms.push(a);
                a.visited = true;
                let q = new structures.Queue();
                q.enqueue(a);
                while (!q.isEmpty()) {
                    let atom = q.dequeue();
                    for ( let j = 0, jj = molecule.bonds.length; j < jj; j++) {
                        let b = molecule.bonds[j];
                        if (b.contains(atom) && !b.visited) {
                            b.visited = true;
                            newMol.bonds.push(b);
                            let neigh = b.getNeighbor(atom);
                            if (!neigh.visited) {
                                neigh.visited = true;
                                newMol.atoms.push(neigh);
                                q.enqueue(neigh);
                            }
                        }
                    }
                }
                mols.push(newMol);
            }
        }
        return mols;
    };

})(Chemio.informatics, Chemio.structures);
(function(informatics, io, structures, undefined) {
    'use strict';
    informatics.StructureBuilder = function() {
    };
    let _ = informatics.StructureBuilder.prototype;
    _.copy = function(molecule) {
        let json = new io.JSONInterpreter();
        return json.molFrom(json.molTo(molecule));
    };

})(Chemio.informatics, Chemio.io, Chemio.structures);
(function(informatics, undefined) {
    'use strict';
    informatics._Counter = function() {
    };
    let _ = informatics._Counter.prototype;
    _.value = 0;
    _.molecule = undefined;
    _.setMolecule = function(molecule) {
        this.value = 0;
        this.molecule = molecule;
        if (this.innerCalculate) {
            this.innerCalculate();
        }
    };
})(Chemio.informatics);
(function(informatics, undefined) {
    'use strict';
    informatics.FrerejacqueNumberCounter = function(molecule) {
        this.setMolecule(molecule);
    };
    let _ = informatics.FrerejacqueNumberCounter.prototype = new informatics._Counter();
    _.innerCalculate = function() {
        this.value = this.molecule.bonds.length - this.molecule.atoms.length + new informatics.NumberOfMoleculesCounter(this.molecule).value;
    };
})(Chemio.informatics);
(function(structures, informatics, undefined) {
    'use strict';
    informatics.NumberOfMoleculesCounter = function(molecule) {
        this.setMolecule(molecule);
    };
    let _ = informatics.NumberOfMoleculesCounter.prototype = new informatics._Counter();
    _.innerCalculate = function() {
        for ( let i = 0, ii = this.molecule.atoms.length; i < ii; i++) {
            this.molecule.atoms[i].visited = false;
        }
        for ( let i = 0, ii = this.molecule.atoms.length; i < ii; i++) {
            if (!this.molecule.atoms[i].visited) {
                this.value++;
                let q = new structures.Queue();
                this.molecule.atoms[i].visited = true;
                q.enqueue(this.molecule.atoms[i]);
                while (!q.isEmpty()) {
                    let atom = q.dequeue();
                    for ( let j = 0, jj = this.molecule.bonds.length; j < jj; j++) {
                        let b = this.molecule.bonds[j];
                        if (b.contains(atom)) {
                            let neigh = b.getNeighbor(atom);
                            if (!neigh.visited) {
                                neigh.visited = true;
                                q.enqueue(neigh);
                            }
                        }
                    }
                }
            }
        }
    };
})(Chemio.structures, Chemio.informatics);

(function(informatics, undefined) {
    'use strict';
    informatics._RingFinder = function() {
    };
    let _ = informatics._RingFinder.prototype;
    _.atoms = undefined;
    _.bonds = undefined;
    _.rings = undefined;
    _.reduce = function(molecule) {
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            molecule.atoms[i].visited = false;
        }
        for ( let i = 0, ii = molecule.bonds.length; i < ii; i++) {
            molecule.bonds[i].visited = false;
        }
        let cont = true;
        while (cont) {
            cont = false;
            for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
                let count = 0;
                let bond;
                for ( let j = 0, jj = molecule.bonds.length; j < jj; j++) {
                    if (molecule.bonds[j].contains(molecule.atoms[i]) && !molecule.bonds[j].visited) {
                        count++;
                        if (count === 2) {
                            break;
                        }
                        bond = molecule.bonds[j];
                    }
                }
                if (count === 1) {
                    cont = true;
                    bond.visited = true;
                    molecule.atoms[i].visited = true;
                }
            }
        }
        for ( let i = 0, ii = molecule.atoms.length; i < ii; i++) {
            if (!molecule.atoms[i].visited) {
                this.atoms.push(molecule.atoms[i]);
            }
        }
        for ( let i = 0, ii = molecule.bonds.length; i < ii; i++) {
            if (!molecule.bonds[i].visited) {
                this.bonds.push(molecule.bonds[i]);
            }
        }
        if (this.bonds.length === 0 && this.atoms.length !== 0) {
            this.atoms = [];
        }
    };
    _.setMolecule = function(molecule) {
        this.atoms = [];
        this.bonds = [];
        this.rings = [];
        this.reduce(molecule);
        if (this.atoms.length > 2 && this.innerGetRings) {
            this.innerGetRings();
        }
    };
    _.fuse = function() {
        for ( let i = 0, ii = this.rings.length; i < ii; i++) {
            for ( let j = 0, jj = this.bonds.length; j < jj; j++) {
                if (this.rings[i].atoms.indexOf(this.bonds[j].a1) !== -1 && this.rings[i].atoms.indexOf(this.bonds[j].a2) !== -1) {
                    this.rings[i].bonds.push(this.bonds[j]);
                }
            }
        }
    };

})(Chemio.informatics);

(function(informatics, structures, undefined) {
    'use strict';
    function Finger(a, from) {
        this.atoms = [];
        if (from) {
            for ( let i = 0, ii = from.atoms.length; i < ii; i++) {
                this.atoms[i] = from.atoms[i];
            }
        }
        this.atoms.push(a);
    }
    let _2 = Finger.prototype;
    _2.grow = function(bonds, blockers) {
        let last = this.atoms[this.atoms.length - 1];
        let neighs = [];
        for ( let i = 0, ii = bonds.length; i < ii; i++) {
            if (bonds[i].contains(last)) {
                let neigh = bonds[i].getNeighbor(last);
                if (blockers.indexOf(neigh) === -1) {
                    neighs.push(neigh);
                }
            }
        }
        let returning = [];
        for ( let i = 0, ii = neighs.length; i < ii; i++) {
            returning.push(new Finger(neighs[i], this));
        }
        return returning;
    };
    _2.check = function(bonds, finger, a) {
        // check that they dont contain similar parts
        for ( let i = 0, ii = finger.atoms.length - 1; i < ii; i++) {
            if (this.atoms.indexOf(finger.atoms[i]) !== -1) {
                return undefined;
            }
        }
        let ring;
        // check if fingers meet at tips
        if (finger.atoms[finger.atoms.length - 1] === this.atoms[this.atoms.length - 1]) {
            ring = new structures.Ring();
            ring.atoms[0] = a;
            for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
                ring.atoms.push(this.atoms[i]);
            }
            for ( let i = finger.atoms.length - 2; i >= 0; i--) {
                ring.atoms.push(finger.atoms[i]);
            }
        } else {
            // check if fingers meet at bond
            let endbonds = [];
            for ( let i = 0, ii = bonds.length; i < ii; i++) {
                if (bonds[i].contains(finger.atoms[finger.atoms.length - 1])) {
                    endbonds.push(bonds[i]);
                }
            }
            for ( let i = 0, ii = endbonds.length; i < ii; i++) {
                if ((finger.atoms.length === 1 || !endbonds[i].contains(finger.atoms[finger.atoms.length - 2])) && endbonds[i].contains(this.atoms[this.atoms.length - 1])) {
                    ring = new structures.Ring();
                    ring.atoms[0] = a;
                    for ( let j = 0, jj = this.atoms.length; j < jj; j++) {
                        ring.atoms.push(this.atoms[j]);
                    }
                    for ( let j = finger.atoms.length - 1; j >= 0; j--) {
                        ring.atoms.push(finger.atoms[j]);
                    }
                    break;
                }
            }
        }
        return ring;
    };

    informatics.EulerFacetRingFinder = function(molecule) {
        this.setMolecule(molecule);
    };
    let _ = informatics.EulerFacetRingFinder.prototype = new informatics._RingFinder();
    _.fingerBreak = 5;
    _.innerGetRings = function() {
        for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
            let neigh = [];
            for ( let j = 0, jj = this.bonds.length; j < jj; j++) {
                if (this.bonds[j].contains(this.atoms[i])) {
                    neigh.push(this.bonds[j].getNeighbor(this.atoms[i]));
                }
            }
            for ( let j = 0, jj = neigh.length; j < jj; j++) {
                // weird that i can't optimize this loop without breaking a test
                // case...
                for ( let k = j + 1; k < neigh.length; k++) {
                    let fingers = [];
                    fingers[0] = new Finger(neigh[j]);
                    fingers[1] = new Finger(neigh[k]);
                    let blockers = [];
                    blockers[0] = this.atoms[i];
                    for ( let l = 0, ll = neigh.length; l < ll; l++) {
                        if (l !== j && l !== k) {
                            blockers.push(neigh[l]);
                        }
                    }
                    let found = [];
                    // check for 3 membered ring
                    let three = fingers[0].check(this.bonds, fingers[1], this.atoms[i]);
                    if (three) {
                        found[0] = three;
                    }
                    while (found.length === 0 && fingers.length > 0 && fingers[0].atoms.length < this.fingerBreak) {
                        let newfingers = [];
                        for ( let l = 0, ll = fingers.length; l < ll; l++) {
                            let adding = fingers[l].grow(this.bonds, blockers);
                            for ( let m = 0, mm = adding.length; m < mm; m++) {
                                newfingers.push(adding[m]);
                            }
                        }
                        fingers = newfingers;
                        for ( let l = 0, ll = fingers.length; l < ll; l++) {
                            for ( let m = l + 1; m < ll; m++) {
                                let r = fingers[l].check(this.bonds, fingers[m], this.atoms[i]);
                                if (r) {
                                    found.push(r);
                                }
                            }
                        }
                        if (found.length === 0) {
                            let newBlockers = [];
                            for ( let l = 0, ll = blockers.length; l < ll; l++) {
                                for ( let m = 0, mm = this.bonds.length; m < mm; m++) {
                                    if (this.bonds[m].contains(blockers[l])) {
                                        let neigh = this.bonds[m].getNeighbor(blockers[l]);
                                        if (blockers.indexOf(neigh) === -1 && newBlockers.indexOf(neigh) === -1) {
                                            newBlockers.push(neigh);
                                        }
                                    }
                                }
                            }
                            for ( let l = 0, ll = newBlockers.length; l < ll; l++) {
                                blockers.push(newBlockers[l]);
                            }
                        }
                    }
                    if (found.length > 0) {
                        // this undefined is required...weird, don't know why
                        let use = undefined;
                        for ( let l = 0, ll = found.length; l < ll; l++) {
                            if (!use || use.atoms.length > found[l].atoms.length) {
                                use = found[l];
                            }
                        }
                        let already = false;
                        for ( let l = 0, ll = this.rings.length; l < ll; l++) {
                            let all = true;
                            for ( let m = 0, mm = use.atoms.length; m < mm; m++) {
                                if (this.rings[l].atoms.indexOf(use.atoms[m]) === -1) {
                                    all = false;
                                    break;
                                }
                            }
                            if (all) {
                                already = true;
                                break;
                            }
                        }
                        if (!already) {
                            this.rings.push(use);
                        }
                    }
                }
            }
        }
        this.fuse();
    };

})(Chemio.informatics, Chemio.structures);

(function(informatics, undefined) {
    'use strict';
    informatics.SSSRFinder = function(molecule) {
        this.rings = [];
        if (molecule.atoms.length > 0) {
            let frerejacqueNumber = new informatics.FrerejacqueNumberCounter(molecule).value;
            let all = new informatics.EulerFacetRingFinder(molecule).rings;
            all.sort(function(a, b) {
                return a.atoms.length - b.atoms.length;
            });
            for ( let i = 0, ii = molecule.bonds.length; i < ii; i++) {
                molecule.bonds[i].visited = false;
            }
            for ( let i = 0, ii = all.length; i < ii; i++) {
                let use = false;
                for ( let j = 0, jj = all[i].bonds.length; j < jj; j++) {
                    if (!all[i].bonds[j].visited) {
                        use = true;
                        break;
                    }
                }
                if (use) {
                    for ( let j = 0, jj = all[i].bonds.length; j < jj; j++) {
                        all[i].bonds[j].visited = true;
                    }
                    this.rings.push(all[i]);
                }
                if (this.rings.length === frerejacqueNumber) {
                    break;
                }
            }
        }
    };

})(Chemio.informatics);

