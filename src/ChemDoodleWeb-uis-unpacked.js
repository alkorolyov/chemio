//
// ChemDoodle Web Components 9.1.0
//
// https://web.chemdoodle.com
//
// Copyright 2009-2020 iChemLabs, LLC.  All rights reserved.
//
// The ChemDoodle Web Components library is licensed under version 3
// of the GNU GENERAL PUBLIC LICENSE.
//
// You may redistribute it and/or modify it under the terms of the
// GNU General Public License as published by the Free Software Foundation,
// either version 3 of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// Please contact iChemLabs <https://www.ichemlabs.com/contact-us> for
// alternate licensing options.
//

ChemDoodle.uis = (function(iChemLabs, q, undefined) {
	'use strict';

	iChemLabs.INFO.v_jQuery_ui = q.ui.version;

	let p = {};

	p.actions = {};
	p.gui = {};
	p.gui.desktop = {};
	p.gui.mobile = {};
	p.states = {};
	p.tools = {};

	return p;

})(ChemDoodle.iChemLabs, ChemDoodle.lib.jQuery);

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

})(ChemDoodle.uis.actions);

(function(informatics, structures, actions, undefined) {
	'use strict';
	actions.AddAction = function(sketcher, a, as, bs) {
		this.sketcher = sketcher;
		this.a = a;
		this.as = as;
		this.bs = bs;
	};
	let _ = actions.AddAction.prototype = new actions._Action();
	_.innerForward = function() {
		let mol = this.sketcher.getMoleculeByAtom(this.a);
		if (!mol) {
			mol = new structures.Molecule();
			this.sketcher.molecules.push(mol);
		}
		if (this.as) {
			for ( let i = 0, ii = this.as.length; i < ii; i++) {
				mol.atoms.push(this.as[i]);
			}
		}
		if (this.bs) {
			let merging = [];
			for ( let i = 0, ii = this.bs.length; i < ii; i++) {
				let b = this.bs[i];
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
		let mol = this.sketcher.getMoleculeByAtom(this.a);
		if (this.as) {
			let aKeep = [];
			for ( let i = 0, ii = mol.atoms.length; i < ii; i++) {
				if (this.as.indexOf(mol.atoms[i]) === -1) {
					aKeep.push(mol.atoms[i]);
				}
			}
			mol.atoms = aKeep;
		}
		if (this.bs) {
			let bKeep = [];
			for ( let i = 0, ii = mol.bonds.length; i < ii; i++) {
				if (this.bs.indexOf(mol.bonds[i]) === -1) {
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
					this.sketcher.molecules.push(split[i]);
				}
			}
		}
	};

})(ChemDoodle.informatics, ChemDoodle.structures, ChemDoodle.uis.actions);

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

})(ChemDoodle.uis.actions);

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

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.AddVAPAttachementAction = function(vap, a, substituent) {
		this.vap = vap;
		this.a = a;
		this.substituent = substituent;
	};
	let _ = actions.AddVAPAttachementAction.prototype = new actions._Action();
	_.innerForward = function() {
		if(this.substituent){
			this.vap.substituent = this.a;
		}else{
			this.vap.attachments.push(this.a);
		}
	};
	_.innerReverse = function() {
		if(this.substituent){
			this.vap.substituent = undefined;
		}else{
			this.vap.attachments.pop();
		}
	};

})(ChemDoodle.uis.actions);
(function(actions, Bond, m, undefined) {
	'use strict';
	actions.ChangeBondAction = function(b, orderAfter, stereoAfter) {
		this.b = b;
		this.orderBefore = b.bondOrder;
		this.stereoBefore = b.stereo;
		if (orderAfter) {
			this.orderAfter = orderAfter;
			this.stereoAfter = stereoAfter;
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

})(ChemDoodle.uis.actions, ChemDoodle.structures.Bond, Math);
(function(actions, m, undefined) {
	'use strict';
	actions.ChangeDynamicBracketAttributeAction = function(s, type) {
		this.s = s;
		this.type = type;
	};
	let _ = actions.ChangeDynamicBracketAttributeAction.prototype = new actions._Action();
	_.innerForward = function() {
		let c = this.type > 0 ? 1 : -1;
		switch (m.abs(this.type)) {
		case 1:
			this.s.n1 += c;
			break;
		case 2:
			this.s.n2 += c;
			break;
		}
	};
	_.innerReverse = function() {
		let c = this.type > 0 ? -1 : 1;
		switch (m.abs(this.type)) {
		case 1:
			this.s.n1 += c;
			break;
		case 2:
			this.s.n2 += c;
			break;
		}
	};

})(ChemDoodle.uis.actions, Math);
(function(actions, m, undefined) {
	'use strict';
	actions.ChangeBracketAttributeAction = function(s, type) {
		this.s = s;
		this.type = type;
	};
	let _ = actions.ChangeBracketAttributeAction.prototype = new actions._Action();
	_.innerForward = function() {
		let c = this.type > 0 ? 1 : -1;
		switch (m.abs(this.type)) {
		case 1:
			this.s.charge += c;
			break;
		case 2:
			this.s.repeat += c;
			break;
		case 3:
			this.s.mult += c;
			break;
		}
	};
	_.innerReverse = function() {
		let c = this.type > 0 ? -1 : 1;
		switch (m.abs(this.type)) {
		case 1:
			this.s.charge += c;
			break;
		case 2:
			this.s.repeat += c;
			break;
		case 3:
			this.s.mult += c;
			break;
		}
	};

})(ChemDoodle.uis.actions, Math);
(function(actions, undefined) {
	'use strict';
	actions.ChangeChargeAction = function(a, delta) {
		this.a = a;
		this.delta = delta;
	};
	let _ = actions.ChangeChargeAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.a.charge += this.delta;
	};
	_.innerReverse = function() {
		this.a.charge -= this.delta;
	};

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.ChangeCoordinatesAction = function(as, newCoords) {
		this.as = as;
		this.recs = [];
		for ( let i = 0, ii = this.as.length; i < ii; i++) {
			this.recs[i] = {
				'xo' : this.as[i].x,
				'yo' : this.as[i].y,
				'xn' : newCoords[i].x,
				'yn' : newCoords[i].y
			};
		}
	};
	let _ = actions.ChangeCoordinatesAction.prototype = new actions._Action();
	_.innerForward = function() {
		for ( let i = 0, ii = this.as.length; i < ii; i++) {
			this.as[i].x = this.recs[i].xn;
			this.as[i].y = this.recs[i].yn;
		}
	};
	_.innerReverse = function() {
		for ( let i = 0, ii = this.as.length; i < ii; i++) {
			this.as[i].x = this.recs[i].xo;
			this.as[i].y = this.recs[i].yo;
		}
	};

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.ChangeLabelAction = function(a, after) {
		this.a = a;
		this.before = a.label;
		this.after = after;
	};
	let _ = actions.ChangeLabelAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.a.label = this.after;
	};
	_.innerReverse = function() {
		this.a.label = this.before;
	};

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.ChangeLonePairAction = function(a, delta) {
		this.a = a;
		this.delta = delta;
	};
	let _ = actions.ChangeLonePairAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.a.numLonePair += this.delta;
	};
	_.innerReverse = function() {
		this.a.numLonePair -= this.delta;
	};

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.ChangeQueryAction = function(o, after) {
		this.o = o;
		this.before = o.query;
		this.after = after;
	};
	let _ = actions.ChangeQueryAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.o.query = this.after;
	};
	_.innerReverse = function() {
		this.o.query = this.before;
	};

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.ChangeRadicalAction = function(a, delta) {
		this.a = a;
		this.delta = delta;
	};
	let _ = actions.ChangeRadicalAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.a.numRadical += this.delta;
	};
	_.innerReverse = function() {
		this.a.numRadical -= this.delta;
	};

})(ChemDoodle.uis.actions);
(function(actions, Bond, m, undefined) {
	'use strict';
	actions.ChangeVAPOrderAction = function(vap, orderAfter) {
		this.vap = vap;
		this.orderBefore = vap.bondType;
		this.orderAfter = orderAfter;
	};
	let _ = actions.ChangeVAPOrderAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.vap.bondType = this.orderAfter;
	};
	_.innerReverse = function() {
		this.vap.bondType = this.orderBefore;
	};

})(ChemDoodle.uis.actions, ChemDoodle.structures.Bond, Math);
(function(actions, Bond, m, undefined) {
	'use strict';
	actions.ChangeVAPSubstituentAction = function(vap, nsub) {
		this.vap = vap;
		this.nsub = nsub;
		this.orderBefore = vap.bondType;
		this.osub = vap.substituent;
	};
	let _ = actions.ChangeVAPSubstituentAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.vap.bondType = 1;
		this.vap.substituent = this.nsub;
		this.vap.attachments.splice(this.vap.attachments.indexOf(this.nsub), 1);
		if(this.osub){
			this.vap.attachments.push(this.osub);
		}
	};
	_.innerReverse = function() {
		this.vap.bondType = this.orderBefore;
		this.vap.substituent = this.osub;
		if(this.osub){
			this.vap.attachments.pop();
		}
		this.vap.attachments.push(this.nsub);
	};

})(ChemDoodle.uis.actions, ChemDoodle.structures.Bond, Math);
(function(structures, actions, undefined) {
	'use strict';
	actions.ClearAction = function(sketcher) {
		this.sketcher = sketcher;
		this.beforeMols = this.sketcher.molecules;
		this.beforeShapes = this.sketcher.shapes;
		this.sketcher.clear();
		if (this.sketcher.oneMolecule && !this.sketcher.setupScene) {
			this.afterMol = new structures.Molecule();
			this.afterMol.atoms.push(new structures.Atom());
			this.sketcher.molecules.push(this.afterMol);
			this.sketcher.center();
			this.sketcher.repaint();
		}
	};
	let _ = actions.ClearAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.sketcher.molecules = [];
		this.sketcher.shapes = [];
		if (this.sketcher.oneMolecule && !this.sketcher.setupScene) {
			this.sketcher.molecules.push(this.afterMol);
		}
	};
	_.innerReverse = function() {
		this.sketcher.molecules = this.beforeMols;
		this.sketcher.shapes = this.beforeShapes;
	};

})(ChemDoodle.structures, ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.DeleteAction = function(sketcher, a, as, bs) {
		this.sketcher = sketcher;
		this.a = a;
		this.as = as;
		this.bs = bs;
		this.ss = [];
	};
	let _ = actions.DeleteAction.prototype = new actions._Action();
	_.innerForwardAReverse = actions.AddAction.prototype.innerReverse;
	_.innerReverseAForward = actions.AddAction.prototype.innerForward;
	_.innerForward = function() {
		this.innerForwardAReverse();
		for ( let i = 0, ii = this.ss.length; i < ii; i++) {
			this.sketcher.removeShape(this.ss[i]);
		}
	};
	_.innerReverse = function() {
		this.innerReverseAForward();
		if (this.ss.length > 0) {
			this.sketcher.shapes = this.sketcher.shapes.concat(this.ss);
		}
	};

})(ChemDoodle.uis.actions);

(function(informatics, actions, undefined) {
	'use strict';
	actions.DeleteContentAction = function(sketcher, as, ss) {
		this.sketcher = sketcher;
		this.as = as;
		this.ss = ss;
		this.bs = [];
		for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
			let mol = this.sketcher.molecules[i];
			for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
				let b = mol.bonds[j];
				if (b.a1.isLassoed || b.a2.isLassoed) {
					this.bs.push(b);
				}
			}
		}
	};
	let _ = actions.DeleteContentAction.prototype = new actions._Action();
	_.innerForward = function() {
		for ( let i = 0, ii = this.ss.length; i < ii; i++) {
			this.sketcher.removeShape(this.ss[i]);
		}
		let asKeep = [];
		let bsKeep = [];
		for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
			let mol = this.sketcher.molecules[i];
			for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
				let a = mol.atoms[j];
				if (this.as.indexOf(a) === -1) {
					asKeep.push(a);
				}
			}
			for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
				let b = mol.bonds[j];
				if (this.bs.indexOf(b) === -1) {
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
		this.sketcher.shapes = this.sketcher.shapes.concat(this.ss);
		let asKeep = [];
		let bsKeep = [];
		for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
			let mol = this.sketcher.molecules[i];
			asKeep = asKeep.concat(mol.atoms);
			bsKeep = bsKeep.concat(mol.bonds);
		}
		this.sketcher.molecules = new informatics.Splitter().split({
			atoms : asKeep.concat(this.as),
			bonds : bsKeep.concat(this.bs)
		});
	};

})(ChemDoodle.informatics, ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.DeleteShapeAction = function(sketcher, s) {
		this.sketcher = sketcher;
		this.s = s;
	};
	let _ = actions.DeleteShapeAction.prototype = new actions._Action();
	_.innerForward = actions.AddShapeAction.prototype.innerReverse;
	_.innerReverse = actions.AddShapeAction.prototype.innerForward;

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.DeleteVAPConnectionAction = function(vap, connection) {
		this.vap = vap;
		this.connection = connection;
		this.substituent = vap.substituent===connection;
	};
	let _ = actions.DeleteVAPConnectionAction.prototype = new actions._Action();
	_.innerForward = function() {
		if(this.substituent){
			this.vap.substituent = undefined;
		}else{
			this.vap.attachments.splice(this.vap.attachments.indexOf(this.connection), 1);
		}
	};
	_.innerReverse = function() {
		if(this.substituent){
			this.vap.substituent = this.connection;
		}else{
			this.vap.attachments.push(this.connection);
		}
	};

})(ChemDoodle.uis.actions);
(function(structures, actions, m, undefined) {
	'use strict';
	actions.FlipAction = function(ps, bs, horizontal) {
		this.ps = ps;
		this.bs = bs;
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
		for(let i = 0, ii = this.bs.length; i<ii; i++){
			let b = this.bs[i];
			if(b.stereo===structures.Bond.STEREO_PROTRUDING){
				b.stereo = structures.Bond.STEREO_RECESSED;
			}else if(b.stereo===structures.Bond.STEREO_RECESSED){
				b.stereo = structures.Bond.STEREO_PROTRUDING;
			}
		}
	};

})(ChemDoodle.structures, ChemDoodle.uis.actions, Math);
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

})(ChemDoodle.uis.actions);
(function(actions, undefined) {
	'use strict';
	actions.FlipDynamicBracketAction = function(b) {
		this.b = b;
	};
	let _ = actions.FlipDynamicBracketAction.prototype = new actions._Action();
	_.innerReverse = _.innerForward = function() {
		this.b.flip = !this.b.flip;
	};

})(ChemDoodle.uis.actions);
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

})(ChemDoodle.uis.actions);

(function(structures, actions, undefined) {
	'use strict';
	actions.NewMoleculeAction = function(sketcher, as, bs) {
		this.sketcher = sketcher;
		this.as = as;
		this.bs = bs;
	};
	let _ = actions.NewMoleculeAction.prototype = new actions._Action();
	_.innerForward = function() {
		let mol = new structures.Molecule();
		mol.atoms = mol.atoms.concat(this.as);
		mol.bonds = mol.bonds.concat(this.bs);
		mol.check();
		this.sketcher.addMolecule(mol);
	};
	_.innerReverse = function() {
		this.sketcher.removeMolecule(this.sketcher.getMoleculeByAtom(this.as[0]));
	};

})(ChemDoodle.structures, ChemDoodle.uis.actions);
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

})(ChemDoodle.uis.actions, Math);

(function(actions, undefined) {
	'use strict';
	actions.SwitchContentAction = function(sketcher, mols, shapes) {
		this.sketcher = sketcher;
		this.beforeMols = this.sketcher.molecules;
		this.beforeShapes = this.sketcher.shapes;
		this.molsA = mols;
		this.shapesA = shapes;
	};
	let _ = actions.SwitchContentAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.sketcher.loadContent(this.molsA, this.shapesA);
	};
	_.innerReverse = function() {
		this.sketcher.molecules = this.beforeMols;
		this.sketcher.shapes = this.beforeShapes;
	};

})(ChemDoodle.uis.actions);

(function(actions, undefined) {
	'use strict';
	actions.SwitchMoleculeAction = function(sketcher, mol) {
		this.sketcher = sketcher;
		this.beforeMols = this.sketcher.molecules;
		this.beforeShapes = this.sketcher.shapes;
		this.molA = mol;
	};
	let _ = actions.SwitchMoleculeAction.prototype = new actions._Action();
	_.innerForward = function() {
		this.sketcher.loadMolecule(this.molA);
	};
	_.innerReverse = function() {
		this.sketcher.molecules = this.beforeMols;
		this.sketcher.shapes = this.beforeShapes;
	};

})(ChemDoodle.uis.actions);

(function(actions, undefined) {
	'use strict';
	actions.HistoryManager = function(sketcher) {
		this.sketcher = sketcher;
		this.undoStack = [];
		this.redoStack = [];
	};
	let _ = actions.HistoryManager.prototype;
	_.undo = function() {
		if (this.undoStack.length !== 0) {
			if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
				this.sketcher.lasso.empty();
			}
			let a = this.undoStack.pop();
			a.reverse(this.sketcher);
			this.redoStack.push(a);
			if (this.undoStack.length === 0) {
				this.sketcher.toolbarManager.buttonUndo.disable();
			}
			this.sketcher.toolbarManager.buttonRedo.enable();
		}
	};
	_.redo = function() {
		if (this.redoStack.length !== 0) {
			if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
				this.sketcher.lasso.empty();
			}
			let a = this.redoStack.pop();
			a.forward(this.sketcher);
			this.undoStack.push(a);
			this.sketcher.toolbarManager.buttonUndo.enable();
			if (this.redoStack.length === 0) {
				this.sketcher.toolbarManager.buttonRedo.disable();
			}
		}
	};
	_.pushUndo = function(a) {
		a.forward(this.sketcher);
		this.undoStack.push(a);
		if (this.redoStack.length !== 0) {
			this.redoStack = [];
		}
		this.sketcher.toolbarManager.buttonUndo.enable();
		this.sketcher.toolbarManager.buttonRedo.disable();
	};
	_.clear = function() {
		if (this.undoStack.length !== 0) {
			this.undoStack = [];
			this.sketcher.toolbarManager.buttonUndo.disable();
		}
		if (this.redoStack.length !== 0) {
			this.redoStack = [];
			this.sketcher.toolbarManager.buttonRedo.disable();
		}
	};

})(ChemDoodle.uis.actions);

(function(math, monitor, actions, states, desktop, structures, d2, SYMBOLS, m, window, undefined) {
	'use strict';
	states._State = function() {
	};
	let _ = states._State.prototype;
	_.setup = function(sketcher) {
		this.sketcher = sketcher;
	};

	_.clearHover = function() {
		if (this.sketcher.hovering) {
			this.sketcher.hovering.isHover = false;
			this.sketcher.hovering.isSelected = false;
			this.sketcher.hovering = undefined;
		}
	};
	_.findHoveredObject = function(e, includeAtoms, includeBonds, includeShapes) {
		this.clearHover();
		let min = Infinity;
		let hovering;
		let hoverdist = 10;
		if (!this.sketcher.isMobile) {
			hoverdist /= this.sketcher.styles.scale;
		}
		if (includeAtoms) {
			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
				let mol = this.sketcher.molecules[i];
				for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
					let a = mol.atoms[j];
					a.isHover = false;
					let dist = e.p.distance(a);
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
					let dist = math.distanceFromPointToLineInclusive(e.p, b.a1, b.a2, hoverdist/2);
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
				if(this instanceof states.DynamicBracketState && (!(s instanceof d2.DynamicBracket) || !s.contents.flippable)){
					continue;
				}
				let sps = s.getPoints();
				for ( let j = 0, jj = sps.length; j < jj; j++) {
					let p = sps[j];
					let dist = e.p.distance(p);
					if (dist < hoverdist && dist < min) {
						min = dist;
						hovering = s;
						s.hoverPoint = p;
					}
				}
				if(this instanceof states.EraseState && s instanceof d2.VAP){
					s.hoverBond = undefined;
					// check vap bonds only in the erase state
					if(s.substituent){
						let att = s.substituent;
						let dist = e.p.distance(new structures.Point((s.asterisk.x + att.x) / 2, (s.asterisk.y + att.y) / 2));
						if (dist < hoverdist && dist < min) {
							min = dist;
							s.hoverBond = att;
							hovering = s;
						}
					}
					for ( let j = 0, jj = s.attachments.length; j < jj; j++) {
						let att = s.attachments[j];
						let dist = e.p.distance(new structures.Point((s.asterisk.x + att.x) / 2, (s.asterisk.y + att.y) / 2));
						if (dist < hoverdist && dist < min) {
							min = dist;
							s.hoverBond = att;
							hovering = s;
						}
					}
				}
			}
			if (!hovering) {
				// find smallest shape pointer is over
				for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
					let s = this.sketcher.shapes[i];
					if (s.isOver(e.p, hoverdist)) {
						hovering = s;
					}
				}
			}
		}
		if (hovering) {
			hovering.isHover = true;
			this.sketcher.hovering = hovering;
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
			this.sketcher.repaint();
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
        if (this.sketcher.lasso.isActive()) {
            this.findHoveredObject(e, true, true, true);
            let hovering = this.sketcher.hovering;
            let mol;
            if(hovering && hovering instanceof structures.Bond ) {
                mol = this.sketcher.getMoleculeByAtom(hovering.a1);
            } else if (hovering && hovering instanceof structures.Atom) {
                mol = this.sketcher.getMoleculeByAtom(hovering);
            }
            this.sketcher.lasso.selectMolecule(mol);
            this.clearHover();
        }
    };
	_.mousedown = function(e) {
		this.sketcher.lastPoint = e.p;
		// must also check for mobile hits here to the help button
		if (this.sketcher.isHelp || this.sketcher.isMobile && e.op.distance(new structures.Point(this.sketcher.width - 20, 20)) < 10) {
			this.sketcher.isHelp = false;
			this.sketcher.lastPoint = undefined;
			this.sketcher.repaint();
			// window.open doesn't work once Event.preventDefault() has been called
			location.href='https://web.chemdoodle.com/demos/2d-sketcher';
			//window.open('https://web.chemdoodle.com/demos/2d-sketcher', '_blank');
		} else if (this.innermousedown) {
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
		// call the repaint here to repaint the help button, also this is called
		// by other functions, so the repaint must be here
		this.sketcher.repaint();
	};
	_.mouseout = function(e) {
		this.sketcher.lastMousePos = undefined;
		if (this.innermouseout) {
			this.innermouseout(e);
		}
		if (this.sketcher.isHelp) {
			this.sketcher.isHelp = false;
			this.sketcher.repaint();
		}
		if (this.sketcher.hovering && monitor.CANVAS_DRAGGING != this.sketcher) {
			this.sketcher.hovering = undefined;
			this.sketcher.repaint();
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
		this.sketcher.styles.scale += delta / 10;
		this.sketcher.checkScale();
		this.sketcher.repaint();
	};
	_.drag = function(e) {
		if (this.innerdrag) {
			this.innerdrag(e);
		}
		if (!this.sketcher.hovering && !this.dontTranslateOnDrag) {
			if (monitor.SHIFT) {
				// rotate structure
				if (this.parentAction) {
					let center = this.parentAction.center;
					let oldAngle = center.angle(this.sketcher.lastPoint);
					let newAngle = center.angle(e.p);
					let rot = newAngle - oldAngle;
					this.parentAction.dif += rot;
					for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
						let a = this.parentAction.ps[i];
						let dist = center.distance(a);
						let angle = center.angle(a) + rot;
						a.x = center.x + dist * m.cos(angle);
						a.y = center.y - dist * m.sin(angle);
					}
					// must check here as change is outside of an action
					for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
						this.sketcher.molecules[i].check();
					}
				} else {
					let center = new structures.Point(this.sketcher.width / 2, this.sketcher.height / 2);
					let oldAngle = center.angle(this.sketcher.lastPoint);
					let newAngle = center.angle(e.p);
					let rot = newAngle - oldAngle;
					this.parentAction = new actions.RotateAction(this.sketcher.getAllPoints(), rot, center);
					this.sketcher.historyManager.pushUndo(this.parentAction);
				}
			} else {
				if (!this.sketcher.lastPoint) {
					// this prevents the structure from being rotated and
					// translated at the same time while a gesture is occuring,
					// which is preferable based on use cases since the rotation
					// center is the canvas center
					return;
				}
				// move structure
				let dif = new structures.Point(e.p.x, e.p.y);
				dif.sub(this.sketcher.lastPoint);
				if (this.parentAction) {
					this.parentAction.dif.add(dif);
					for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
						this.parentAction.ps[i].add(dif);
					}
					if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
						this.sketcher.lasso.bounds.minX += dif.x;
						this.sketcher.lasso.bounds.maxX += dif.x;
						this.sketcher.lasso.bounds.minY += dif.y;
						this.sketcher.lasso.bounds.maxY += dif.y;
					}
					// must check here as change is outside of an action
					for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
						this.sketcher.molecules[i].check();
					}
				} else {
					this.parentAction = new actions.MoveAction(this.sketcher.getAllPoints(), dif);
					this.sketcher.historyManager.pushUndo(this.parentAction);
				}
			}
			this.sketcher.repaint();
		}
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
				if (!this.sketcher.oneMolecule) {
					this.sketcher.toolbarManager.buttonLasso.select();
					this.sketcher.toolbarManager.buttonLasso.getElement().click();
					this.sketcher.lasso.select(this.sketcher.getAllAtoms(), this.sketcher.shapes);
				}
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
            if (!this.sketcher.oneMolecule) {
                // center and select all
                this.sketcher.toolbarManager.buttonLasso.getElement().select();
                this.sketcher.toolbarManager.buttonLasso.getElement().click();
                this.sketcher.lasso.select(this.sketcher.getAllAtoms(), this.sketcher.shapes);
                this.sketcher.toolbarManager.buttonCenter.func();
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
			if (this.sketcher.hovering) {
				let number = e.which - 48;
				let molIdentifier;
				let as = [];
				let bs = [];
				if (this.sketcher.hovering instanceof structures.Atom) {
					molIdentifier = this.sketcher.hovering;
					if (monitor.SHIFT) {
						if (number > 2 && number < 9) {
							let mol = this.sketcher.getMoleculeByAtom(this.sketcher.hovering);
							let angles = mol.getAngles(this.sketcher.hovering);
							let angle = 3 * m.PI / 2;
							if (angles.length !== 0) {
								angle = math.angleBetweenLargest(angles).angle;
							}
							let ring = this.sketcher.stateManager.STATE_NEW_RING.getRing(this.sketcher.hovering, number, this.sketcher.styles.bondLength_2D, angle, false);
							if (mol.atoms.indexOf(ring[0]) === -1) {
								as.push(ring[0]);
							}
							if (!this.sketcher.bondExists(this.sketcher.hovering, ring[0])) {
								bs.push(new structures.Bond(this.sketcher.hovering, ring[0]));
							}
							for ( let i = 1, ii = ring.length; i < ii; i++) {
								if (mol.atoms.indexOf(ring[i]) === -1) {
									as.push(ring[i]);
								}
								if (!this.sketcher.bondExists(ring[i - 1], ring[i])) {
									bs.push(new structures.Bond(ring[i - 1], ring[i]));
								}
							}
							if (!this.sketcher.bondExists(ring[ring.length - 1], this.sketcher.hovering)) {
								bs.push(new structures.Bond(ring[ring.length - 1], this.sketcher.hovering));
							}
						}
					} else {
						if (number === 0) {
							number = 10;
						}
						let p = new structures.Point(this.sketcher.hovering.x, this.sketcher.hovering.y);
						let a = this.getOptimumAngle(this.sketcher.hovering);
						let prev = this.sketcher.hovering;
						for ( let k = 0; k < number; k++) {
							let ause = a + (k % 2 === 1 ? m.PI / 3 : 0);
							p.x += this.sketcher.styles.bondLength_2D * m.cos(ause);
							p.y -= this.sketcher.styles.bondLength_2D * m.sin(ause);
							let use = new structures.Atom('C', p.x, p.y);
							let minDist = Infinity;
							let closest;
							for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
								let mol = this.sketcher.molecules[i];
								for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
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
								as.push(use);
							}
							if (!this.sketcher.bondExists(prev, use)) {
								bs.push(new structures.Bond(prev, use));
							}
							prev = use;
						}
					}
				} else if (this.sketcher.hovering instanceof structures.Bond) {
					molIdentifier = this.sketcher.hovering.a1;
					if (monitor.SHIFT) {
						if (number > 2 && number < 9) {
							let ring = this.sketcher.stateManager.STATE_NEW_RING.getOptimalRing(this.sketcher.hovering, number);
							let start = this.sketcher.hovering.a2;
							let end = this.sketcher.hovering.a1;
							let mol = this.sketcher.getMoleculeByAtom(start);
							if (ring[0] === this.sketcher.hovering.a1) {
								start = this.sketcher.hovering.a1;
								end = this.sketcher.hovering.a2;
							}
							if (mol.atoms.indexOf(ring[1]) === -1) {
								as.push(ring[1]);
							}
							if (!this.sketcher.bondExists(start, ring[1])) {
								bs.push(new structures.Bond(start, ring[1]));
							}
							for ( let i = 2, ii = ring.length; i < ii; i++) {
								if (mol.atoms.indexOf(ring[i]) === -1) {
									as.push(ring[i]);
								}
								if (!this.sketcher.bondExists(ring[i - 1], ring[i])) {
									bs.push(new structures.Bond(ring[i - 1], ring[i]));
								}
							}
							if (!this.sketcher.bondExists(ring[ring.length - 1], end)) {
								bs.push(new structures.Bond(ring[ring.length - 1], end));
							}
						}
					} else if (number > 0 && number < 4 && this.sketcher.hovering.bondOrder !== number) {
						this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(this.sketcher.hovering, number, structures.Bond.STEREO_NONE));
					} else if (number === 7 || number === 8) {
						let stereo = structures.Bond.STEREO_RECESSED;
						if(number===7){
							stereo = structures.Bond.STEREO_PROTRUDING;
						}
						this.sketcher.historyManager.pushUndo(new actions.ChangeBondAction(this.sketcher.hovering, 1, stereo));
					}
				}
				if (as.length !== 0 || bs.length !== 0) {
					this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, molIdentifier, as, bs));
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.uis.gui.desktop, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.SYMBOLS, Math, window);

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
		this.findHoveredObject(e, true, false);
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states);

(function(extensions, math, structures, d2, actions, states, m, undefined) {
	'use strict';
	let controlsize = 4;

	states.DynamicBracketState = function(sketcher) {
		this.setup(sketcher);
		this.dontTranslateOnDrag = true;
	};
	let _ = states.DynamicBracketState.prototype = new states._State();
	_.superDoubleClick = _.dblclick;
	_.dblclick = function(e) {
		// override double click not to center when editing controls
		if (!this.control) {
			this.superDoubleClick(e);
		}
	};
	_.innermousedown = function(e) {
		if (this.control) {
			// this part controls the limits
			let cont = true;
			let c = this.control.t > 0 ? 1 : -1;
			switch (m.abs(this.control.t)) {
			case 1:{
					let nn = this.control.s.n1 + c;
					if(nn<0 || nn>this.control.s.n2){
						cont = false;
					}
					break;
				}
			case 2:{
					let nn = this.control.s.n2 + c;
					if(nn>20 || nn<this.control.s.n1){
						cont = false;
					}
					break;
				}
			}
			if(cont){
				this.sketcher.historyManager.pushUndo(new actions.ChangeDynamicBracketAttributeAction(this.control.s, this.control.t));
				this.sketcher.repaint();
			}
		} else if (this.sketcher.hovering && this.start!==this.sketcher.hovering && this.sketcher.hovering instanceof structures.Bond) {
			if(!this.start){
				this.start = this.sketcher.hovering;
			}
		}else{
			this.start = undefined;
			this.end = undefined;
			this.sketcher.repaint();
		}
	};
	_.innerdrag = function(e) {
		this.control = undefined;
		if (this.start) {
			this.end = new structures.Point(e.p.x, e.p.y);
			this.findHoveredObject(e, false, true);
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
			let dup;
			let remove = false;
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.DynamicBracket) {
					if (s.b1 === this.start && s.b2 === this.sketcher.hovering || s.b2 === this.start && s.b1 === this.sketcher.hovering) {
						dup = s;
						remove = true;
					}
				}
			}
			if (dup) {
				if (remove) {
					this.sketcher.historyManager.pushUndo(new actions.DeleteShapeAction(this.sketcher, dup));
				}
				this.start = undefined;
				this.end = undefined;
				this.sketcher.repaint();
			} else {
				let shape = new d2.DynamicBracket(this.start, this.sketcher.hovering);
				this.start = undefined;
				this.end = undefined;
				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, shape));
			}
		} else if(this.sketcher.hovering instanceof d2.DynamicBracket){
			this.sketcher.historyManager.pushUndo(new actions.FlipDynamicBracketAction(this.sketcher.hovering));
		} else {
			//this.start = undefined;
			//this.end = undefined;
			//this.sketcher.repaint();
		}
	};
	_.innermousemove = function(e) {
		this.control = undefined;
		if(this.start){
			this.end = new structures.Point(e.p.x, e.p.y);
		}else{
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.DynamicBracket && !s.error) {
					let hits = [];
					hits.push({
						x : s.textPos.x-1,
						y : s.textPos.y+6,
						v : 1
					});
					hits.push({
						x : s.textPos.x+13,
						y : s.textPos.y+6,
						v : 2
					});
					for ( let j = 0, jj = hits.length; j < jj; j++) {
						let h = hits[j];
						if (math.isBetween(e.p.x, h.x, h.x + controlsize * 2) && math.isBetween(e.p.y, h.y - controlsize, h.y+3)) {
							this.control = {
								s : s,
								t : h.v
							};
							break;
						} else if (math.isBetween(e.p.x, h.x, h.x + controlsize * 2) && math.isBetween(e.p.y, h.y + controlsize-2, h.y + controlsize * 2+3)) {
							this.control = {
								s : s,
								t : -1 * h.v
							};
							break;
						}
					}
					if (this.control) {
						break;
					}
				}
			}
		}
		if(this.control){
			this.clearHover();
		}else{
			this.findHoveredObject(e, false, true, true);
			if(this.sketcher.hovering && this.sketcher.hovering instanceof d2._Shape && !(this.sketcher.hovering instanceof d2.DynamicBracket)){
				this.clearHover();
			}
		}
		this.sketcher.repaint();
	};
	function drawBracketControl(ctx, styles, x, y, control, type) {
		if (control && m.abs(control.t) === type) {
			ctx.fillStyle = styles.colorHover;
			ctx.beginPath();
			if (control.t > 0) {
				ctx.moveTo(x, y);
				ctx.lineTo(x + controlsize, y - controlsize);
				ctx.lineTo(x + controlsize * 2, y);
			} else {
				ctx.moveTo(x, y + controlsize);
				ctx.lineTo(x + controlsize, y + controlsize * 2);
				ctx.lineTo(x + controlsize * 2, y + controlsize);
			}
			ctx.closePath();
			ctx.fill();
		}
		ctx.strokeStyle = 'blue';
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + controlsize, y - controlsize);
		ctx.lineTo(x + controlsize * 2, y);
		ctx.moveTo(x, y + controlsize);
		ctx.lineTo(x + controlsize, y + controlsize * 2);
		ctx.lineTo(x + controlsize * 2, y + controlsize);
		ctx.stroke();
	}
	_.draw = function(ctx, styles) {
		if (this.start && this.end) {
			ctx.strokeStyle = styles.colorPreview;
			ctx.fillStyle = styles.colorPreview;
			ctx.lineWidth = 1;
			let p1 = this.start.getCenter();
			let p2 = this.end;
			if (this.sketcher.hovering && this.sketcher.hovering !== this.start) {
				p2 = this.sketcher.hovering.getCenter();
			}
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.setLineDash([2]);
			ctx.stroke();
			ctx.setLineDash([]);
		}else {
			// controls
			ctx.lineWidth = 2;
			ctx.lineJoin = 'miter';
			ctx.lineCap = 'butt';
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.DynamicBracket && !s.error) {
					let c = this.control && this.control.s === s ? this.control : undefined;
					drawBracketControl(ctx, styles, s.textPos.x-1, s.textPos.y+6, c, 1);
					drawBracketControl(ctx, styles, s.textPos.x+13, s.textPos.y+6, c, 2);
				}
			}
			if(this.sketcher.hovering && this.sketcher.hovering instanceof d2.DynamicBracket && this.sketcher.hovering.contents.flippable){
				let s = this.sketcher.hovering;
				ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
				ctx.fillStyle = styles.colorPreview;
				ctx.textAlign = 'left';
				ctx.textBaseline = 'bottom';
				ctx.fillText('flip?', s.textPos.x+(s.error?0:20), s.textPos.y);
			}
		}
	};

})(ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.actions, ChemDoodle.uis.states, Math);

(function(actions, states, structures, d2, undefined) {
	'use strict';
	states.EraseState = function(sketcher) {
		this.setup(sketcher);
	};
	let _ = states.EraseState.prototype = new states._State();
	_.handleDelete = function() {
		let action;
		if (this.sketcher.lasso && this.sketcher.lasso.isActive()) {
			action = new actions.DeleteContentAction(this.sketcher, this.sketcher.lasso.atoms, this.sketcher.lasso.shapes);
			this.sketcher.lasso.empty();
		} else if (this.sketcher.hovering) {
			if (this.sketcher.hovering instanceof structures.Atom) {
				if (this.sketcher.oneMolecule) {
					let mol = this.sketcher.molecules[0];
					for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
						mol.atoms[j].visited = false;
					}
					let connectionsA = [];
					let connectionsB = [];
					this.sketcher.hovering.visited = true;
					for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
						let bj = mol.bonds[j];
						if (bj.contains(this.sketcher.hovering)) {
							let atoms = [];
							let bonds = [];
							let q = new structures.Queue();
							q.enqueue(bj.getNeighbor(this.sketcher.hovering));
							while (!q.isEmpty()) {
								let a = q.dequeue();
								if (!a.visited) {
									a.visited = true;
									atoms.push(a);
									for ( let k = 0, kk = mol.bonds.length; k < kk; k++) {
										let bk = mol.bonds[k];
										if (bk.contains(a) && !bk.getNeighbor(a).visited) {
											q.enqueue(bk.getNeighbor(a));
											bonds.push(bk);
										}
									}
								}
							}
							connectionsA.push(atoms);
							connectionsB.push(bonds);
						}
					}
					let largest = -1;
					let index = -1;
					for ( let j = 0, jj = connectionsA.length; j < jj; j++) {
						if (connectionsA[j].length > largest) {
							index = j;
							largest = connectionsA[j].length;
						}
					}
					if (index > -1) {
						let as = [];
						let bs = [];
						let hold;
						for ( let i = 0, ii = mol.atoms.length; i < ii; i++) {
							let a = mol.atoms[i];
							if (connectionsA[index].indexOf(a) === -1) {
								as.push(a);
							} else if (!hold) {
								hold = a;
							}
						}
						for ( let i = 0, ii = mol.bonds.length; i < ii; i++) {
							let b = mol.bonds[i];
							if (connectionsB[index].indexOf(b) === -1) {
								bs.push(b);
							}
						}
						action = new actions.DeleteAction(this.sketcher, hold, as, bs);
					} else {
						action = new actions.ClearAction(this.sketcher);
					}
				} else {
					let mol = this.sketcher.getMoleculeByAtom(this.sketcher.hovering);
					action = new actions.DeleteAction(this.sketcher, mol.atoms[0], [ this.sketcher.hovering ], mol.getBonds(this.sketcher.hovering));
				}
			} else if (this.sketcher.hovering instanceof structures.Bond) {
				if (!this.sketcher.oneMolecule || this.sketcher.hovering.ring) {
					action = new actions.DeleteAction(this.sketcher, this.sketcher.hovering.a1, undefined, [ this.sketcher.hovering ]);
				}
			} else if (this.sketcher.hovering instanceof d2._Shape) {
				let s = this.sketcher.hovering;
				if(s.hoverBond){
					// delete only the hovered bond in the VAP
					action = new actions.DeleteVAPConnectionAction(s, s.hoverBond);
				}else{
					action = new actions.DeleteShapeAction(this.sketcher, s);
				}
			}
			this.sketcher.hovering.isHover = false;
			this.sketcher.hovering = undefined;
			this.sketcher.repaint();
		}
		if(action){
			this.sketcher.historyManager.pushUndo(action);
			// check shapes to see if they should be removed
			for ( let i = this.sketcher.shapes.length - 1; i >= 0; i--) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.Pusher || s instanceof d2.AtomMapping) {
					let remains1 = false, remains2 = false;
					for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
						let mol = this.sketcher.molecules[j];
						for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
							let a = mol.atoms[k];
							if (a === s.o1) {
								remains1 = true;
							} else if (a === s.o2) {
								remains2 = true;
							}
						}
						for ( let k = 0, kk = mol.bonds.length; k < kk; k++) {
							let b = mol.bonds[k];
							if (b === s.o1) {
								remains1 = true;
							} else if (b === s.o2) {
								remains2 = true;
							}
						}
					}
					if (!remains1 || !remains2) {
						action.ss.push(s);
						this.sketcher.removeShape(s);
					}
				}
				if (s instanceof d2.DynamicBracket) {
					let remains1 = false, remains2 = false;
					for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
						let mol = this.sketcher.molecules[j];
						for ( let k = 0, kk = mol.bonds.length; k < kk; k++) {
							let b = mol.bonds[k];
							if (b === s.b1) {
								remains1 = true;
							} else if (b === s.b2) {
								remains2 = true;
							}
						}
					}
					if (!remains1 || !remains2) {
						action.ss.push(s);
						this.sketcher.removeShape(s);
					}
				}
				if (s instanceof d2.VAP) {
					let broken = false;
					for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
						let mol = this.sketcher.molecules[j];
						for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
							mol.atoms[k].present = true;
						}
					}
					if(s.substituent && !s.substituent.present){
						broken = true;
					}
					if(!broken){
						for(let j = 0, jj = s.attachments.length; j < jj; j++){
							if(!s.attachments[j].present){
								broken = true;
								break;
							}
						}
					}
					for ( let j = 0, jj = this.sketcher.molecules.length; j < jj; j++) {
						let mol = this.sketcher.molecules[j];
						for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
							mol.atoms[k].present = undefined;
						}
					}
					if (broken) {
						action.ss.push(s);
						this.sketcher.removeShape(s);
					}
				}
			}
			this.sketcher.checksOnAction();
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		this.handleDelete();
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, true, true);
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.structures.d2);
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
			this.sketcher.hovering.isSelected = true;
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		this.downPoint = undefined;
		if (this.sketcher.hovering) {
			this.sketcher.hovering.isSelected = false;
			if(this.sketcher.tempAtom){
				let b = new structures.Bond(this.sketcher.hovering, this.sketcher.tempAtom);
				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, b.a1, [b.a2], [b]));
				this.sketcher.tempAtom = undefined;
			}else if (this.label !== this.sketcher.hovering.label) {
				this.sketcher.historyManager.pushUndo(new actions.ChangeLabelAction(this.sketcher.hovering, this.label));
			}
		} else if (!this.sketcher.oneMolecule && this.newMolAllowed) {
			this.sketcher.historyManager.pushUndo(new actions.NewMoleculeAction(this.sketcher, [ new structures.Atom(this.label, e.p.x, e.p.y) ], []));
		}
		if (!this.sketcher.isMobile) {
			this.mousemove(e);
		}
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, false);
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
			this.sketcher.repaint();
		}
	};

})(ChemDoodle.monitor, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.states, Math);
(function(math, monitor, structures, d2, actions, states, tools, m, undefined) {
	'use strict';
	let TRANSLATE = 1;
	let ROTATE = 2;
	//let SCALE = 3;
	let transformType = undefined;
	let paintRotate = false;

	states.LassoState = function(sketcher) {
		this.setup(sketcher);
		this.dontTranslateOnDrag = true;
	};
	let _ = states.LassoState.prototype = new states._State();
	_.innerdrag = function(e) {
		this.inDrag = true;
		if (this.sketcher.lasso.isActive() && transformType) {
			if (!this.sketcher.lastPoint) {
				// this prevents the structure from being rotated and
				// translated at the same time while a gesture is occurring,
				// which is preferable based on use cases since the rotation
				// center is the canvas center
				return;
			}
			if (transformType === TRANSLATE) {
				// move selection
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
				// rotate structure
				if (this.parentAction) {
					let center = this.parentAction.center;
					let oldAngle = center.angle(this.sketcher.lastPoint);
					let newAngle = center.angle(e.p);
					let rot = newAngle - oldAngle;
					this.parentAction.dif += rot;
					for ( let i = 0, ii = this.parentAction.ps.length; i < ii; i++) {
						let a = this.parentAction.ps[i];
						let dist = center.distance(a);
						let angle = center.angle(a) + rot;
						a.x = center.x + dist * m.cos(angle);
						a.y = center.y - dist * m.sin(angle);
					}
					// must check here as change is outside of an action
					this.parentAction.checks(this.sketcher);
				} else {
					let center = new structures.Point((this.sketcher.lasso.bounds.minX + this.sketcher.lasso.bounds.maxX) / 2, (this.sketcher.lasso.bounds.minY + this.sketcher.lasso.bounds.maxY) / 2);
					let oldAngle = center.angle(this.sketcher.lastPoint);
					let newAngle = center.angle(e.p);
					let rot = newAngle - oldAngle;
					this.parentAction = new actions.RotateAction(this.sketcher.lasso.getAllPoints(), rot, center);
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
			// move structure
			let dif = new structures.Point(e.p.x, e.p.y);
			dif.sub(this.sketcher.lastPoint);
			if (!this.parentAction) {
				let ps;
				if (this.sketcher.hovering instanceof structures.Atom) {
					ps = monitor.SHIFT ? [ this.sketcher.hovering ] : this.sketcher.getMoleculeByAtom(this.sketcher.hovering).atoms;
				} else if (this.sketcher.hovering instanceof structures.Bond) {
					ps =  monitor.SHIFT ? [ this.sketcher.hovering.a1, this.sketcher.hovering.a2 ] : this.sketcher.getMoleculeByAtom(this.sketcher.hovering.a1).atoms;
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
			this.sketcher.repaint();
		}
	};
	_.innermousedown = function(e) {
		this.inDrag = false;
		transformType = undefined;
		if (this.sketcher.lasso.isActive() && !monitor.SHIFT) {
			let rotateBuffer = 25 / this.sketcher.styles.scale;
			if (math.isBetween(e.p.x, this.sketcher.lasso.bounds.minX, this.sketcher.lasso.bounds.maxX) && math.isBetween(e.p.y, this.sketcher.lasso.bounds.minY, this.sketcher.lasso.bounds.maxY)) {
				transformType = TRANSLATE;
			} else if (math.isBetween(e.p.x, this.sketcher.lasso.bounds.minX - rotateBuffer, this.sketcher.lasso.bounds.maxX + rotateBuffer) && math.isBetween(e.p.y, this.sketcher.lasso.bounds.minY - rotateBuffer, this.sketcher.lasso.bounds.maxY + rotateBuffer)) {
				transformType = ROTATE;
			}
		} else if (!this.sketcher.hovering) {
			this.sketcher.lastPoint = undefined;
			this.sketcher.lasso.addPoint(e.p);
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		if (!transformType) {
			if (!this.sketcher.hovering) {
				this.sketcher.lasso.select();
			}
		}
		this.innermousemove(e);
	};
	_.innerclick = function(e) {
		if (!transformType && !this.inDrag) {
			if (this.sketcher.hovering) {
				let as = [];
				let ss = [];
				if (this.sketcher.hovering instanceof structures.Atom) {
					as.push(this.sketcher.hovering);
				} else if (this.sketcher.hovering instanceof structures.Bond) {
					as.push(this.sketcher.hovering.a1);
					as.push(this.sketcher.hovering.a2);
				} else if (this.sketcher.hovering instanceof d2._Shape) {
					ss.push(this.sketcher.hovering);
				}
				this.sketcher.lasso.select(as, ss);
			} else if (this.sketcher.lasso.isActive()) {
				this.sketcher.lasso.empty();
			}
		}
		transformType = undefined;
	};
	_.innermousemove = function(e) {
		if (!this.sketcher.lasso.isActive()) {
			let includeMol = this.sketcher.lasso.mode !== tools.Lasso.MODE_LASSO_SHAPES;
			this.findHoveredObject(e, includeMol, includeMol, true);
		} else if (!monitor.SHIFT) {
			let p = false;
			let rotateBuffer = 25 / this.sketcher.styles.scale;
			if (!(math.isBetween(e.p.x, this.sketcher.lasso.bounds.minX, this.sketcher.lasso.bounds.maxX) && math.isBetween(e.p.y, this.sketcher.lasso.bounds.minY, this.sketcher.lasso.bounds.maxY)) && math.isBetween(e.p.x, this.sketcher.lasso.bounds.minX - rotateBuffer, this.sketcher.lasso.bounds.maxX + rotateBuffer) && math.isBetween(e.p.y, this.sketcher.lasso.bounds.minY - rotateBuffer, this.sketcher.lasso.bounds.maxY + rotateBuffer)) {
				p = true;
			}
			if (p != paintRotate) {
				paintRotate = p;
				this.sketcher.repaint();
			}
		}
	};
	_.innerdblclick = function(e) {
		// if (this.sketcher.lasso.isActive()) {
		// 	this.sketcher.lasso.empty();
		// }
	};
	_.draw = function(ctx, styles) {
		if (paintRotate && this.sketcher.lasso.bounds) {
			ctx.fillStyle = styles.colorSelect;
			ctx.globalAlpha = .1;
			let rotateBuffer = 25 / this.sketcher.styles.scale;
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.uis.tools, Math);

(function(actions, states, undefined) {
	'use strict';
	states.LonePairState = function(sketcher) {
		this.setup(sketcher);
	};
	let _ = states.LonePairState.prototype = new states._State();
	_.delta = 1;
	_.innermouseup = function(e) {
		if (this.delta < 0 && this.sketcher.hovering.numLonePair < 1) {
			return;
		}
		if (this.sketcher.hovering) {
			this.sketcher.historyManager.pushUndo(new actions.ChangeLonePairAction(this.sketcher.hovering, this.delta));
		}
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, false);
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states);
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
				this.sketcher.repaint();
			}
		}
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, true);
	};
	_.innermouseup = function(e) {
		this.action = undefined;
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures);
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
			this.sketcher.repaint();
		}
	};
	_.innerclick = function(e) {
		if (!this.sketcher.hovering && !this.sketcher.oneMolecule && this.newMolAllowed) {
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
			this.sketcher.hovering.isSelected = true;
			this.drag(e);
		} else if (this.sketcher.hovering instanceof structures.Bond) {
			this.sketcher.hovering.isHover = false;
			this.incrementBondOrder(this.sketcher.hovering);
			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
				this.sketcher.molecules[i].check();
			}
			this.sketcher.repaint();
		}else if(!this.sketcher.hovering && !this.sketcher.requireStartingAtom){
			this.placeRequiredAtom(e);
		}
	};
	_.innermouseup = function(e) {
		if (this.sketcher.tempAtom && this.sketcher.hovering) {
			let as = [];
			let bs = [];
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
				as.push(this.sketcher.tempAtom);
			}
			if (makeBond) {
				bs[0] = new structures.Bond(this.sketcher.hovering, this.sketcher.tempAtom, this.bondOrder);
				bs[0].stereo = this.stereo;
				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, bs[0].a1, as, bs));
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
		this.findHoveredObject(e, true, true);
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

})(ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, Math);
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
			this.sketcher.repaint();
		}
	};
	_.innerclick = function(e) {
		if (!this.sketcher.hovering && !this.sketcher.oneMolecule && this.newMolAllowed) {
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
			this.sketcher.hovering.isSelected = true;
			this.drag(e);
		}else if(!this.sketcher.requireStartingAtom){
			this.placeRequiredAtom(e);
		}
	};
	_.innermouseup = function(e) {
		if (this.sketcher.tempChain && this.sketcher.hovering && this.sketcher.tempChain.length!==0) {
			let as = [];
			let bs = [];
			let allAs = this.sketcher.getAllAtoms();
			for ( let i = 0, ii = this.sketcher.tempChain.length; i < ii; i++) {
				if (allAs.indexOf(this.sketcher.tempChain[i]) === -1) {
					as.push(this.sketcher.tempChain[i]);
				}
				if (i!=0 && !this.sketcher.bondExists(this.sketcher.tempChain[i - 1], this.sketcher.tempChain[i])) {
					bs.push(new structures.Bond(this.sketcher.tempChain[i - 1], this.sketcher.tempChain[i]));
				}
			}
			if (!this.sketcher.bondExists(this.sketcher.tempChain[0], this.sketcher.hovering)) {
				bs.push(new structures.Bond(this.sketcher.tempChain[0], this.sketcher.hovering));
			}
			if (as.length !== 0 || bs.length !== 0) {
				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, this.sketcher.hovering, as, bs));
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
		this.findHoveredObject(e, true);
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, Math);
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
			this.sketcher.repaint();
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
			this.sketcher.repaint();
		}
	};
	_.innerclick = function(e) {
		if (!this.sketcher.hovering && !this.sketcher.oneMolecule && this.newMolAllowed) {
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
			this.sketcher.hovering.isSelected = true;
			this.drag(e);
		}else if(!this.sketcher.requireStartingAtom){
			this.placeRequiredAtom(e);
		}
	};
	_.innermouseup = function(e) {
		if (this.sketcher.tempRing && this.sketcher.hovering) {
			let as = [];
			let bs = [];
			let allAs = this.sketcher.getAllAtoms();
			let unsat = this.unsaturated || this.numSides===-1 && monitor.SHIFT;
			if (this.sketcher.hovering instanceof structures.Atom) {
				if (allAs.indexOf(this.sketcher.tempRing[0]) === -1) {
					as.push(this.sketcher.tempRing[0]);
				}
				if (!this.sketcher.bondExists(this.sketcher.hovering, this.sketcher.tempRing[0])) {
					bs.push(new structures.Bond(this.sketcher.hovering, this.sketcher.tempRing[0]));
				}
				for ( let i = 1, ii = this.sketcher.tempRing.length; i < ii; i++) {
					let ai = this.sketcher.tempRing[i];
					let aip = this.sketcher.tempRing[i-1];
					if (allAs.indexOf(ai) === -1) {
						as.push(ai);
					}
					if (!this.sketcher.bondExists(aip, ai)) {
						bs.push(new structures.Bond(aip, ai, unsat && i % 2 === 1 && ai.getImplicitHydrogenCount()>1 && aip.getImplicitHydrogenCount()>1 ? 2 : 1));
					}
				}
				if (!this.sketcher.bondExists(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], this.sketcher.hovering)) {
					bs.push(new structures.Bond(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], this.sketcher.hovering, unsat && this.sketcher.tempRing.length%2===1 && this.sketcher.tempRing[this.sketcher.tempRing.length - 1].getImplicitHydrogenCount()>1 && this.sketcher.hovering.getImplicitHydrogenCount()>1 ? 2 : 1));
				}
			} else if (this.sketcher.hovering instanceof structures.Bond) {
				let start = this.sketcher.hovering.a2;
				let end = this.sketcher.hovering.a1;
				if (this.sketcher.tempRing[0] === this.sketcher.hovering.a1) {
					start = this.sketcher.hovering.a1;
					end = this.sketcher.hovering.a2;
				}
				if (allAs.indexOf(this.sketcher.tempRing[1]) === -1) {
					as.push(this.sketcher.tempRing[1]);
				}
				if (!this.sketcher.bondExists(start, this.sketcher.tempRing[1])) {
					bs.push(new structures.Bond(start, this.sketcher.tempRing[1]));
				}
				for ( let i = 2, ii = this.sketcher.tempRing.length; i < ii; i++) {
					let ai = this.sketcher.tempRing[i];
					let aip = this.sketcher.tempRing[i - 1];
					if (allAs.indexOf(ai) === -1) {
						as.push(ai);
					}
					if (!this.sketcher.bondExists(aip, ai)) {
						bs.push(new structures.Bond(aip, ai, unsat && i % 2 === 0 && ai.getImplicitHydrogenCount()>1 && aip.getImplicitHydrogenCount()>1 ? 2 : 1));
					}
				}
				if (!this.sketcher.bondExists(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], end)) {
					bs.push(new structures.Bond(this.sketcher.tempRing[this.sketcher.tempRing.length - 1], end, unsat && this.sketcher.tempRing.length % 2 === 0 && this.sketcher.tempRing[this.sketcher.tempRing.length - 1].getImplicitHydrogenCount()>1 && end.getImplicitHydrogenCount()>1 ? 2 : 1));
				}
			}
			if (as.length !== 0 || bs.length !== 0) {
				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, bs[0].a1, as, bs));
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
		this.findHoveredObject(e, true, true);
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, Math);
(function(math, monitor, actions, states, io, structures, m, undefined) {
	'use strict';

	let INTERPRETER = new io.JSONInterpreter();

	states.NewTemplateState = function(sketcher) {
		this.setup(sketcher);
		this.template = {"a":[{"x":270,"i":"a0","y":105},{"x":252.6795,"i":"a1","y":115},{"x":252.6795,"i":"a2","y":135},{"x":270,"i":"a3","y":145},{"x":287.3205,"i":"a4","y":135},{"x":287.3205,"i":"a5","y":115},{"x":270,"i":"a6","y":85},{"x":287.3205,"i":"a7","y":75},{"x":270,"i":"a8","y":165,"l":"O"},{"x":252.6795,"i":"a9","y":175},{"x":252.6795,"i":"a10","y":195},{"x":252.6795,"i":"a11","y":215},{"x":252.6795,"i":"a12","y":235,"l":"Si"},{"x":272.6795,"i":"a13","y":235},{"x":232.6795,"i":"a14","y":235},{"x":252.6795,"i":"a15","y":255}],"b":[{"b":0,"e":1,"i":"b0","o":2},{"b":1,"e":2,"i":"b1"},{"b":2,"e":3,"i":"b2","o":2},{"b":3,"e":4,"i":"b3"},{"b":4,"e":5,"i":"b4","o":2},{"b":5,"e":0,"i":"b5"},{"b":0,"e":6,"i":"b6"},{"b":6,"e":7,"i":"b7","o":2},{"b":3,"e":8,"i":"b8"},{"b":8,"e":9,"i":"b9"},{"b":9,"e":10,"i":"b10"},{"b":10,"e":11,"i":"b11","o":3},{"b":11,"e":12,"i":"b12"},{"b":12,"e":13,"i":"b13"},{"b":12,"e":14,"i":"b14"},{"b":12,"e":15,"i":"b15"}]};
		this.attachPos = 0;
	};
	let _ = states.NewTemplateState.prototype = new states._State();
	_.getTemplate = function(p) {
		let origin = this.sketcher.hovering;
		let newMol = INTERPRETER.molFrom(this.template);
		newMol.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
		let pivot = newMol.atoms[this.attachPos];
		let thrad = origin.angle(p);
		let rotate = true;
		if (!monitor.ALT) {
			if (origin.distance(p) < 15) {
				let angles = this.sketcher.getMoleculeByAtom(this.sketcher.hovering).getAngles(this.sketcher.hovering);
				if (angles.length === 0) {
					thrad = 0;
					rotate = false;
				} else if (angles.length === 1) {
					thrad = angles[0] + m.PI;
				} else {
					thrad = math.angleBetweenLargest(angles).angle;
				}
				let angles2 = newMol.getAngles(pivot);
				if (angles2.length === 1) {
					thrad -= angles2[0] + (angles.length === 1 ? m.PI / 3 : 0);
				} else {
					thrad -= math.angleBetweenLargest(angles2).angle + m.PI;
				}
			} else {
				let divider = m.round(thrad / (m.PI / 6));
				thrad = divider * m.PI / 6;
			}
		}
		let difx = origin.x-pivot.x;
		let dify = origin.y-pivot.y;
		for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
			let a = newMol.atoms[i];
			a.x+=difx;
			a.y+=dify;
		}
		if (rotate) {
			for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
				let a = newMol.atoms[i];
				let angleUse = a.angle(origin) + thrad;
				let distance = pivot.distance(a);
				if (monitor.SHIFT) {
					distance *= origin.distance(p) / this.sketcher.styles.bondLength_2D;
				}
				a.x = origin.x - m.cos(angleUse) * distance;
				a.y = origin.y + m.sin(angleUse) * distance;
			}
		}
		let allAs = this.sketcher.getAllAtoms();
		let allBs = this.sketcher.getAllBonds();
		for ( let j = 0, jj = allAs.length; j < jj; j++) {
			let a2 = allAs[j];
			a2.isOverlap = false;
			let hits = [];
			for(let i = 0, ii = newMol.atoms.length; i<ii; i++){
				let a = newMol.atoms[i];
				if (a2.distance(a) < 5) {
					hits.push(i);
				}
			}
			// make sure to look for the closest, as several atoms may
			// try to merge onto a single atom...
			let closest = -1;
			for(let i = 0, ii = hits.length; i<ii; i++){
				let h = hits[i];
				if (closest === -1 || a2.distance(newMol.atoms[h]) < a2.distance(newMol.atoms[closest])) {
					closest = h;
				}
			}
			if (closest !== -1) {
				let a = newMol.atoms[closest];
				newMol.atoms.splice(closest,1);
				if (a2.x!==pivot.x || a2.y!==pivot.y) {
					a2.isOverlap = true;
				}
				for(let i = 0, ii = newMol.bonds.length; i<ii; i++){
					let b = newMol.bonds[i];
					if(b.a1===a){
						b.a1 = a2;
						b.tmpreplace1 = true;
					}else if(b.a2===a){
						b.a2 = a2;
						b.tmpreplace2 = true;
					}
					if(b.tmpreplace1 && b.tmpreplace2){
						// get rid of the bond if both atoms are overlapping
						// just double check that that bond doesn't exist even if the atoms have both been replaced
						let match = false;
						for(let k = 0, kk = allBs.length; k<kk; k++){
							let b2 = allBs[k];
							if(b.a1===b2.a1 && b.a2===b2.a2 || b.a2===b2.a1 && b.a1===b2.a2){
								match = true;
								break;
							}
						}
						if(match){
							newMol.bonds.splice(i--,1);
							ii--;
						}
					}
				}
			}
		}
		newMol.check();
		newMol.check(true);
		return newMol;
	};

	_.innerexit = function() {
		this.removeStartAtom();
	};
	_.innerdrag = function(e) {
		this.newMolAllowed = false;
		this.removeStartAtom();
		if (this.sketcher.hovering) {
			this.sketcher.tempTemplate = this.getTemplate(e.p);
			this.sketcher.repaint();
		}
	};
	_.innerclick = function(e) {
		if (!this.sketcher.hovering && !this.sketcher.oneMolecule && this.newMolAllowed) {
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
			this.sketcher.hovering.isSelected = true;
			this.drag(e);
		}else if(!this.sketcher.requireStartingAtom){
			this.placeRequiredAtom(e);
		}
	};
	_.innermouseup = function(e) {
		if (this.sketcher.hovering && this.sketcher.tempTemplate) {
			if(this.sketcher.tempTemplate.atoms.length!==0){
				this.sketcher.historyManager.pushUndo(new actions.AddAction(this.sketcher, this.sketcher.hovering, this.sketcher.tempTemplate.atoms, this.sketcher.tempTemplate.bonds));
			}
			let allAs = this.sketcher.getAllAtoms();
			for ( let i = 0, ii = allAs.length; i < ii; i++) {
				allAs[i].isOverlap = false;
			}
			this.sketcher.tempTemplate = undefined;
		}
		if (!this.sketcher.isMobile) {
			this.mousemove(e);
		}
	};
	_.innermousemove = function(e) {
		if (this.sketcher.tempAtom) {
			return;
		}
		this.findHoveredObject(e, true);
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.io, ChemDoodle.structures, Math);

(function(structures, d2, actions, states, undefined) {
	'use strict';
	states.PusherState = function(sketcher) {
		this.setup(sketcher);
		this.dontTranslateOnDrag = true;
	};
	let _ = states.PusherState.prototype = new states._State();
	_.numElectron = 1;
	_.innermousedown = function(e) {
		if (this.sketcher.hovering && this.start!==this.sketcher.hovering) {
			if(!this.start){
				this.start = this.sketcher.hovering;
			}
		}else{
			this.start = undefined;
			this.end = undefined;
			this.sketcher.repaint();
		}
	};
	_.innerdrag = function(e) {
		if (this.start) {
			this.end = new structures.Point(e.p.x, e.p.y);
			this.findHoveredObject(e, true, this.numElectron!=-10);
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
			let dup;
			let remove = false;
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.Pusher) {
					if (s.o1 === this.start && s.o2 === this.sketcher.hovering) {
						dup = s;
					} else if (s.o2 === this.start && s.o1 === this.sketcher.hovering) {
						dup = s;
						remove = true;
					}
				}else if (s instanceof d2.AtomMapping) {
					if (s.o1 === this.start && s.o2 === this.sketcher.hovering || s.o2 === this.start && s.o1 === this.sketcher.hovering) {
						dup = s;
						remove = true;
					}
				}
			}
			if (dup) {
				if (remove) {
					this.sketcher.historyManager.pushUndo(new actions.DeleteShapeAction(this.sketcher, dup));
				}
				this.start = undefined;
				this.end = undefined;
				this.sketcher.repaint();
			} else {
				let shape;
				if(this.numElectron==-10){
					shape = new d2.AtomMapping(this.start, this.sketcher.hovering);
				}else{
					shape = new d2.Pusher(this.start, this.sketcher.hovering, this.numElectron);
				}
				this.start = undefined;
				this.end = undefined;
				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, shape));
			}
		} else {
			//this.start = undefined;
			//this.end = undefined;
			//this.sketcher.repaint();
		}
	};
	_.innermousemove = function(e) {
		if(this.start){
			this.end = new structures.Point(e.p.x, e.p.y);
		}
		this.findHoveredObject(e, true, this.numElectron!=-10);
		this.sketcher.repaint();
	};
	_.draw = function(ctx, styles) {
		if (this.start && this.end) {
			ctx.strokeStyle = styles.colorPreview;
			ctx.fillStyle = styles.colorPreview;
			ctx.lineWidth = 1;
			let p1 = this.start instanceof structures.Atom ? this.start : this.start.getCenter();
			let p2 = this.end;
			if (this.sketcher.hovering && this.sketcher.hovering !== this.start) {
				p2 = this.sketcher.hovering instanceof structures.Atom ? this.sketcher.hovering : this.sketcher.hovering.getCenter();
			}
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.setLineDash([2]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	};

})(ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.actions, ChemDoodle.uis.states);

(function(actions, states, structures, d2, undefined) {
	'use strict';
	states.QueryState = function(sketcher) {
		this.setup(sketcher);
	};
	let _ = states.QueryState.prototype = new states._State();
	_.innermouseup = function(e) {
		if (this.sketcher.hovering) {
			if(this.sketcher.hovering instanceof structures.Atom){
				this.sketcher.dialogManager.atomQueryDialog.setAtom(this.sketcher.hovering);
				this.sketcher.dialogManager.atomQueryDialog.open();
			}else if(this.sketcher.hovering instanceof structures.Bond){
				this.sketcher.dialogManager.bondQueryDialog.setBond(this.sketcher.hovering);
				this.sketcher.dialogManager.bondQueryDialog.open();
			}
		}
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, true, false);
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.structures.d2);

(function(actions, states, undefined) {
	'use strict';
	states.RadicalState = function(sketcher) {
		this.setup(sketcher);
	};
	let _ = states.RadicalState.prototype = new states._State();
	_.delta = 1;
	_.innermouseup = function(e) {
		if (this.delta < 0 && this.sketcher.hovering.numRadical < 1) {
			return;
		}
		if (this.sketcher.hovering) {
			this.sketcher.historyManager.pushUndo(new actions.ChangeRadicalAction(this.sketcher.hovering, this.delta));
		}
	};
	_.innermousemove = function(e) {
		this.findHoveredObject(e, true, false);
	};

})(ChemDoodle.uis.actions, ChemDoodle.uis.states);

(function(math, monitor, structures, d2, actions, states, m, undefined) {
	'use strict';
	states.ShapeState = function(sketcher) {
		this.setup(sketcher);
		this.dontTranslateOnDrag = true;
	};
	let _ = states.ShapeState.prototype = new states._State();
	_.shapeType = states.ShapeState.LINE;
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
		this.sketcher.repaint();
	};
	_.innermousemove = function(e) {
		this.control = undefined;
		if (this.shapeType === states.ShapeState.BRACKET) {
			let size = 6;
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.Bracket) {
					let minX = m.min(s.p1.x, s.p2.x);
					let maxX = m.max(s.p1.x, s.p2.x);
					let minY = m.min(s.p1.y, s.p2.y);
					let maxY = m.max(s.p1.y, s.p2.y);
					let hits = [];
					hits.push({
						x : maxX + 5,
						y : minY + 15,
						v : 1
					});
					hits.push({
						x : maxX + 5,
						y : maxY + 15,
						v : 2
					});
					hits.push({
						x : minX - 17,
						y : (minY + maxY) / 2 + 15,
						v : 3
					});
					for ( let j = 0, jj = hits.length; j < jj; j++) {
						let h = hits[j];
						if (math.isBetween(e.p.x, h.x, h.x + size * 2) && math.isBetween(e.p.y, h.y - size, h.y)) {
							this.control = {
								s : s,
								t : h.v
							};
							break;
						} else if (math.isBetween(e.p.x, h.x, h.x + size * 2) && math.isBetween(e.p.y, h.y + size, h.y + size * 2)) {
							this.control = {
								s : s,
								t : -1 * h.v
							};
							break;
						}
					}
					if (this.control) {
						break;
					}
				}
			}
			this.sketcher.repaint();
		}
	};
	_.innermousedown = function(e) {
		if (this.control) {
			this.sketcher.historyManager.pushUndo(new actions.ChangeBracketAttributeAction(this.control.s, this.control.t));
			this.sketcher.repaint();
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
		this.sketcher.repaint();
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
	function drawBracketControl(ctx, styles, x, y, control, type) {
		let size = 6;
		if (control && m.abs(control.t) === type) {
			ctx.fillStyle = styles.colorHover;
			ctx.beginPath();
			if (control.t > 0) {
				ctx.moveTo(x, y);
				ctx.lineTo(x + size, y - size);
				ctx.lineTo(x + size * 2, y);
			} else {
				ctx.moveTo(x, y + size);
				ctx.lineTo(x + size, y + size * 2);
				ctx.lineTo(x + size * 2, y + size);
			}
			ctx.closePath();
			ctx.fill();
		}
		ctx.strokeStyle = 'blue';
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + size, y - size);
		ctx.lineTo(x + size * 2, y);
		ctx.moveTo(x, y + size);
		ctx.lineTo(x + size, y + size * 2);
		ctx.lineTo(x + size * 2, y + size);
		ctx.stroke();
	}
	_.draw = function(ctx, styles) {
		if (this.start && this.end) {
			ctx.strokeStyle = styles.colorPreview;
			ctx.fillStyle = styles.colorPreview;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(this.start.x, this.start.y);
			if (this.shapeType === states.ShapeState.BRACKET) {
				ctx.lineTo(this.end.x, this.start.y);
				ctx.lineTo(this.end.x, this.end.y);
				ctx.lineTo(this.start.x, this.end.y);
				ctx.lineTo(this.start.x, this.start.y);
			} else {
				ctx.lineTo(this.end.x, this.end.y);
			}
			ctx.setLineDash([2]);
			ctx.stroke();
			ctx.setLineDash([]);
		} else if (this.shapeType === states.ShapeState.BRACKET) {
			ctx.lineWidth = 2;
			ctx.lineJoin = 'miter';
			ctx.lineCap = 'butt';
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if (s instanceof d2.Bracket) {
					let minX = m.min(s.p1.x, s.p2.x);
					let maxX = m.max(s.p1.x, s.p2.x);
					let minY = m.min(s.p1.y, s.p2.y);
					let maxY = m.max(s.p1.y, s.p2.y);
					let c = this.control && this.control.s === s ? this.control : undefined;
					drawBracketControl(ctx, styles, maxX + 5, minY + 15, c, 1);
					drawBracketControl(ctx, styles, maxX + 5, maxY + 15, c, 2);
					drawBracketControl(ctx, styles, minX - 17, (minY + maxY) / 2 + 15, c, 3);
				}
			}
		}

	};

	states.ShapeState.LINE = 1;
	states.ShapeState.ARROW_SYNTHETIC = 2;
	states.ShapeState.ARROW_RETROSYNTHETIC = 3;
	states.ShapeState.ARROW_RESONANCE = 4;
	states.ShapeState.ARROW_EQUILIBRIUM = 5;
	states.ShapeState.BRACKET = 10;

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.actions, ChemDoodle.uis.states, Math);

(function(math, structures, d2, actions, states, undefined) {
	'use strict';
	states.VAPState = function(sketcher) {
		this.setup(sketcher);
		this.dontTranslateOnDrag = true;
	};
	let _ = states.VAPState.prototype = new states._State();
	_.innermousedown = function(e) {
		if(!this.sketcher.hovering && (!this.start || !(this.start instanceof d2.VAP))){
			// out of convenience, since the user cannot drag from the VAP asterisk and may accidentally try to, don't allow placement of another vap within 30 pixels
			let add = true;
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if(s instanceof d2.VAP && s.asterisk.distance(e.p)<30){
					add = false;
				}
			}
			if(add){
				let vap = new d2.VAP(e.p.x, e.p.y);
				if (!this.sketcher.isMobile) {
					vap.isHover = true;
					this.sketcher.hovering = vap;
				}
				this.sketcher.historyManager.pushUndo(new actions.AddShapeAction(this.sketcher, vap));
			}
		}else if (this.sketcher.hovering && this.start!==this.sketcher.hovering) {
			if(this.sketcher.hovering.hoverBond){
				let vap = this.sketcher.hovering;
				if(vap.hoverBond===vap.substituent){
					let nbo = 1;
					if(vap.bondType===1 || vap.bondType===2){
						nbo = vap.bondType+1;
					}else if(vap.bondType===3){
						nbo = .5;
					}
					this.sketcher.historyManager.pushUndo(new actions.ChangeVAPOrderAction(vap, nbo));
				}else {
					this.sketcher.historyManager.pushUndo(new actions.ChangeVAPSubstituentAction(vap, this.sketcher.hovering.hoverBond));
				}
			}else if(!this.start){
				this.start = this.sketcher.hovering;
			}
		}else{
			this.start = undefined;
			this.end = undefined;
			this.sketcher.repaint();
		}
	};
	_.innerdrag = function(e) {
		if (this.start) {
			this.end = new structures.Point(e.p.x, e.p.y);
			this.findHoveredObject(e, this.start instanceof d2.VAP, false, this.start instanceof structures.Atom);
			this.sketcher.repaint();
		}
	};
	_.innermouseup = function(e) {
		if (this.start && this.sketcher.hovering && this.sketcher.hovering !== this.start) {
			let vap = this.sketcher.hovering;
			let attach = this.start;
			if(attach instanceof d2.VAP){
				let tmp = vap;
				vap = attach;
				attach = tmp;
			}
			if(vap.substituent!==attach && vap.attachments.indexOf(attach)===-1){
				this.sketcher.historyManager.pushUndo(new actions.AddVAPAttachementAction(vap, attach, vap.substituent===undefined));
			}
			this.start = undefined;
			this.end = undefined;
			this.sketcher.repaint();
		} else {
			//this.start = undefined;
			//this.end = undefined;
			//this.sketcher.repaint();
		}
	};
	_.innermousemove = function(e) {
		if(this.start){
			this.end = new structures.Point(e.p.x, e.p.y);
			this.findHoveredObject(e, this.start instanceof d2.VAP, false, this.start instanceof structures.Atom);
		}else{
			this.findHoveredObject(e, true, true, true);
		}
		this.sketcher.repaint();
	};
	_.draw = function(ctx, styles) {
		if (this.start && this.end) {
			ctx.strokeStyle = styles.colorPreview;
			ctx.fillStyle = styles.colorPreview;
			ctx.lineWidth = 1;
			let p1 = this.start;
			let p2 = this.end;
			if (this.sketcher.hovering) {
				p2 = this.sketcher.hovering;
			}
			if(p1 instanceof d2.VAP){
				p1 = p1.asterisk;
			}
			if(p2 instanceof d2.VAP){
				p2 = p2.asterisk;
			}
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.setLineDash([2]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	};
	_.findHoveredObject = function(e, includeAtoms, includeVAPsBonds, includeVAPsAsterisks) {
		this.clearHover();
		let min = Infinity;
		let hovering;
		let hoverdist = 10;
		if (!this.sketcher.isMobile) {
			hoverdist /= this.sketcher.styles.scale;
		}
		if (includeAtoms) {
			for ( let i = 0, ii = this.sketcher.molecules.length; i < ii; i++) {
				let mol = this.sketcher.molecules[i];
				for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
					let a = mol.atoms[j];
					a.isHover = false;
					let dist = e.p.distance(a);
					if (dist < hoverdist && dist < min) {
						min = dist;
						hovering = a;
					}
				}
			}
		}
		if (includeVAPsBonds) {
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if(s instanceof d2.VAP){
					s.hoverBond = undefined;
					if(s.substituent){
						let att = s.substituent;
						let dist = math.distanceFromPointToLineInclusive(e.p, s.asterisk, att, hoverdist/2);
						if (dist !== -1 && dist < hoverdist && dist < min) {
							min = dist;
							s.hoverBond = att;
							hovering = s;
						}
					}
					for ( let j = 0, jj = s.attachments.length; j < jj; j++) {
						let att = s.attachments[j];
						let dist = math.distanceFromPointToLineInclusive(e.p, s.asterisk, att, hoverdist/2);
						if (dist !== -1 && dist < hoverdist && dist < min) {
							min = dist;
							s.hoverBond = att;
							hovering = s;
						}
					}
				}
			}
		}
		if (includeVAPsAsterisks) {
			for ( let i = 0, ii = this.sketcher.shapes.length; i < ii; i++) {
				let s = this.sketcher.shapes[i];
				if(s instanceof d2.VAP){
					s.isHover = false;
					let dist = e.p.distance(s.asterisk);
					if (dist < hoverdist && dist < min) {
						min = dist;
						hovering = s;
					}
				}
			}
		}
		if (hovering) {
			hovering.isHover = true;
			this.sketcher.hovering = hovering;
		}
	};

})(ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.actions, ChemDoodle.uis.states);

(function(states, q, undefined) {
	'use strict';
	states.StateManager = function(sketcher) {
		this.STATE_NEW_BOND = new states.NewBondState(sketcher);
		this.STATE_NEW_RING = new states.NewRingState(sketcher);
		this.STATE_NEW_CHAIN = new states.NewChainState(sketcher);
		this.STATE_NEW_TEMPLATE= new states.NewTemplateState(sketcher);
		if(states.TextInputState){
			this.STATE_TEXT_INPUT= new states.TextInputState(sketcher);
		}
		this.STATE_CHARGE = new states.ChargeState(sketcher);
		this.STATE_LONE_PAIR = new states.LonePairState(sketcher);
		this.STATE_RADICAL = new states.RadicalState(sketcher);
		this.STATE_MOVE = new states.MoveState(sketcher);
		this.STATE_ERASE = new states.EraseState(sketcher);
		this.STATE_LABEL = new states.LabelState(sketcher);
		this.STATE_LASSO = new states.LassoState(sketcher);
		this.STATE_SHAPE = new states.ShapeState(sketcher);
		this.STATE_PUSHER = new states.PusherState(sketcher);
		this.STATE_DYNAMIC_BRACKET = new states.DynamicBracketState(sketcher);
		this.STATE_VAP = new states.VAPState(sketcher);
		this.STATE_QUERY = new states.QueryState(sketcher);
		let currentState = this.STATE_NEW_BOND;
		this.setState = function(nextState) {
			if (nextState !== currentState) {
				currentState.exit();
				currentState = nextState;
				currentState.enter();
			}
			if(sketcher.openTray && q('#'+sketcher.openTray.dummy.id+'_label').attr('aria-pressed')==='false'){
				// due to weirdness in how radio buttons in groups, but outside of jquery ui buttonsets are treated, we check for the aria-pressed attribute on the button label to determine select state
				sketcher.openTray.close();
			}
		};
		this.getCurrentState = function() {
			return currentState;
		};
	};

})(ChemDoodle.uis.states, ChemDoodle.lib.jQuery);

ChemDoodle.uis.gui.imageDepot = (function (ext, undefined) {
	'use strict';
	let d = {};
	d.getURI = function (s) {
		// for PNG, but all internal images are SVG now
		//return 'data:image/png;base64,' + s;
		// for SVG
		return 'data:image/svg+xml;base64,' + s;
	};

	d.ADD_LONE_PAIR = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjIiIGN4PSI2IiBjeT0iMTAiIHN0cm9rZT0ibm9uZSIgICAgICAvPjxjaXJjbGUgcj0iMiIgY3g9IjE0IiBjeT0iMTAiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.ADD_RADICAL = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjIiIGN4PSIxMCIgY3k9IjEwIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.ANGLE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxwYXRoIHN0eWxlPSJmaWxsOiNGNzkzMUU7c3Ryb2tlOiM3NzFFMUU7c3Ryb2tlLXdpZHRoOjIuNzU0MTsiIGQ9Ik05OC41MTUsODIuOTY1Yy0yLjc2LTg1Ljg0NC05NC40NjktODUuODQ0LTk3LjIyNywwCQlDMi43MzcsODMuMDgsOTYuODI1LDgzLjEwNCw5OC41MTUsODIuOTY1eiBNODMuNzExLDcyLjIxN0gxNi41MzZDMjQuNDM4LDE4Ljg1Nyw3NS44MSwxOC44NTcsODMuNzExLDcyLjIxN3oiLz4JPGc+CQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyLjMyMzsiIGQ9Ik0xMC43MTYsNjUuNzk3Yy0xLjk0Mi0xLjAxLTQuODk4LTIuODk4LTYuODQxLTMuOTA4Ii8+CQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyLjMyMzsiIGQ9Ik0xNC41OTQsNDYuNTE1Yy0wLjgyMS0wLjkyMS0yLjQ2My0zLjEwMS0zLjI4My00LjAyMiIvPgkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6Mi4zMjM7IiBkPSJNMjYuMzA5LDM3LjMwN2MtMS4xNjQtMi40MDktMi45NTQtNi4wOTQtNC4xMTYtOC41MDIiLz4JCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjIuMzIzOyIgZD0iTTM2Ljg1OCwyNi4yNzNjLTAuMzAyLTEuMzk1LTAuODU0LTQuNDEzLTEuMTU3LTUuODA3Ii8+CQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyLjMyMzsiIGQ9Ik01MC4xNTEsMjcuODcyYzAuMDEyLTIuODAyLDAuMDI0LTcuMjUzLDAuMDM3LTEwLjA1NCIvPgkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6Mi4zMjM7IiBkPSJNNjMuNDU3LDI2LjQ3NWMwLjMxMi0xLjM5MSwwLjc0MS00LjQ1OSwxLjA1NC01Ljg0OCIvPgkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6Mi4zMjM7IiBkPSJNNzMuOTQ1LDM3LjYxOWMxLjE1NC0yLjMzMywzLjAxMy02LjAyMSw0LjE2OS04LjM1NSIvPgkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6Mi4zMjM7IiBkPSJNODUuNTQ0LDQ3LjEyM2MwLjgzLTAuOTA2LDIuNjM3LTIuNzg1LDMuNDY4LTMuNjk0Ii8+CQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDoyLjMyMzsiIGQ9Ik04OS4zOTEsNjYuNDkyYzEuODk3LTAuOTQ5LDMuNzk2LTEuODkxLDUuNjkyLTIuODQiLz4JPC9nPjwvZz48Zz4JPHBhdGggZD0iTTY2LjA0OSw1MS41MjVjMCw5LjM3My00Ljc0NSwxOC4xODItMTUuODE1LDE4LjE4MmMtMTAuNzUzLDAtMTYuMjA4LTYuMDYyLTE2LjIwOC0xOC4xMDIJCWMwLTkuNzczLDguMDY2LTE2LjE1OSwxNS41NzctMTYuMTU5QzU4LjkzMSwzNS40NDYsNjYuMDQ5LDQzLjI4Myw2Ni4wNDksNTEuNTI1eiBNNTkuMjUsNTIuNDE0YzAtNy42NzYtMy4yNDUtMTUuNDMyLTguOTM3LTE1LjQzMgkJYy03LjY2OSwwLTkuMTcyLDkuMzczLTkuMTcyLDE1Ljk5N2MwLDguNDg0LDMuMzIxLDE0LjcwNyw5LjMzLDE0LjcwN0M1Ni4wMDUsNjcuNjg2LDU5LjI1LDYyLjM1Miw1OS4yNSw1Mi40MTR6Ii8+PC9nPjxnPgk8cGF0aCBkPSJNNDMuMDYzLDQ3Ljk2N2gwLjkwOGMwLDEuNDA3LDAuMjY1LDIuMTEsMC44LDIuMTFsMS4xMzIsMC4wNjhoOC41MjhsMS4xNDItMC4wNjhjMC41MjUsMCwwLjc5MS0wLjcwMywwLjc5MS0yLjExaDAuOTA3CQl2OC45NjloLTAuOTA3YzAtMS40MDYtMC4yNjYtMi4xMTEtMC43OTEtMi4xMTFsLTEuMTQyLTAuMDY4aC04LjUyOGwtMS4xMzIsMC4wNjhjLTAuNTM2LDAtMC44LDAuNzA1LTAuOCwyLjExMWgtMC45MDhWNDcuOTY3eiIvPjwvZz48cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNzcxRTFFO3N0cm9rZS13aWR0aDoyLjc1NDE7IiBkPSJNOTguNTE1LDgyLjk2NWMtMi43Ni04NS44NDQtOTQuNDY5LTg1Ljg0NC05Ny4yMjcsMAlDNC4wMjcsODMuMTg2LDk1LjYyMyw4My4xOTksOTguNTE1LDgyLjk2NXoiLz48L3N2Zz4=';
	d.ANIMATION = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwLjA4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwLjA4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPHBhdGggc3R5bGU9ImZpbGw6IzMzMzMzMztzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC43NDA0OyIgZD0iTTQwLjE4NCw0MS44MDd2LTEuMzk2YzAsMCwzLjMxMi0xLjY1Niw1LjIyNy0yLjk3NwkJCQljMS45MTgtMS4zMTksMy42NjMtNi4xMDgsMy42NjMtNi4xMDhoMi4yNjJjMCwwLDEuNTY5LDQuNjI3LDIuOTYsNS42MTRjMS4zOTYsMC45OSw1LjQwMywzLjEzNiw1LjQwMywzLjEzNnYxLjczMUg0MC4xODR6Ii8+CQkJCQkJCTxyZWN0IHg9IjIxLjc2MyIgeT0iNTEuODIyIiB0cmFuc2Zvcm09Im1hdHJpeCgxIC0wLjAwMzkgMC4wMDM5IDEgLTAuMjIwNSAwLjEwMDEpIiBzdHlsZT0iZmlsbDojMzMzMzMzO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc0MDQ7IiB3aWR0aD0iOC4wNzgiIGhlaWdodD0iMTAuNjkxIi8+CQkJPHBvbHlnb24gcG9pbnRzPSIyMS43NDMsNTEuODM4IDEzLjY0OCw0Ny45NDYgMTMuNzQsNjYuNDM2IDIxLjc4NCw2Mi41MjkgCQkJIi8+CQkJCQkJCTxyZWN0IHg9IjY4LjYwMSIgeT0iNDYuMDM0IiB0cmFuc2Zvcm09Im1hdHJpeCgxIC0wLjAwNCAwLjAwNCAxIC0wLjE5NyAwLjI4NjcpIiBzdHlsZT0ic3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuOTI1NTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiB3aWR0aD0iNC45OTMiIGhlaWdodD0iNi4wNDciLz4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDojMzMzMzMzO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc0MDQ7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgcG9pbnRzPSIJCQkJNjguNTkyLDQ2LjAzMyA3My41ODMsNDYuMDMzIDczLjYwNCw1Mi4wNzEgNjguNjA5LDUyLjA5MiAJCQkiLz4JCQk8cG9seWdvbiBzdHlsZT0ic3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuOTI1NTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBwb2ludHM9IjczLjU4Myw0Ni4wMjQgCQkJCTc4LjU3MSw0My43OTcgNzguNTk3LDU0LjI1OSA3My42MDQsNTIuMDcxIAkJCSIvPgkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0yOTMuNzY5NSIgeTE9IjQ1LjI4MTkiIHgyPSItMjkzLjc2OTUiIHkyPSI1NS44MjE5IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC0wLjk0ODEgMC4wMDMzIDAuMDAzNCAxIC0xOTkuMDI1NCAtMC41MzkpIj4JCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0RFREVERSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjE4NjgiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4zOTAxIiBzdHlsZT0ic3RvcC1jb2xvcjojOTM5MzkzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNDY5MSIgc3R5bGU9InN0b3AtY29sb3I6Izg5ODk4OSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjYwMzYiIHN0eWxlPSJzdG9wLWNvbG9yOiM2RTZFNkUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC43Nzc0IiBzdHlsZT0ic3RvcC1jb2xvcjojNDI0MjQyIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuOTgxNyIgc3R5bGU9InN0b3AtY29sb3I6IzA2MDYwNiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwIi8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzFfKTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC43NDA0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQkJCTc4LjUzLDQzLjc3NyA4MC43NzIsNDMuNzcyIDgwLjgwNyw1NC4zMSA3OC41OTcsNTQuMzEzIAkJCSIvPgkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOiMzMzMzMzM7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuNzQwNDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBwb2ludHM9IgkJCQk3My41ODMsNDYuMDI0IDc4LjU3MSw0My43OTcgNzguNTk3LDU0LjI1OSA3My42MDQsNTIuMDcxIAkJCSIvPgkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjE1My4yNTQ5IiB5MT0iNDkuNzI5NSIgeDI9IjE1My4yNTQ5IiB5Mj0iNjguMjQ3MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLjk0ODEgLTAuMDAzMyAwLjAwMzQgMSAtMTMzLjU3NTggLTEuMjk3NSkiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojREVERURFIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjUyNyIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY2NDgiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MzkzOTMiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC43MDgyIiBzdHlsZT0ic3RvcC1jb2xvcjojODk4OTg5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNzgyMiIgc3R5bGU9InN0b3AtY29sb3I6IzZFNkU2RSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjg3NzciIHN0eWxlPSJzdG9wLWNvbG9yOiM0MjQyNDIiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC45OSIgc3R5bGU9InN0b3AtY29sb3I6IzA2MDYwNiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwIi8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzJfKTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC43NDA0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQkJCTEzLjcyNCw0Ny45MiAxMC4xMjMsNDcuOTM1IDEwLjEyOCw2Ni40NSAxMy43MjksNjYuNDM2IAkJCSIvPgkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOiMzMzMzMzM7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuNzQwNDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBwb2ludHM9IgkJCQkyMS43NDMsNTEuODM4IDEzLjY0OCw0Ny45NDYgMTMuNzQsNjYuNDM2IDIxLjc4NCw2Mi41MjkgCQkJIi8+CQkJPHBhdGggc3R5bGU9ImZpbGw6IzMzMzMzMztzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC43NDA0OyIgZD0iTTcwLjQ5Niw3MC4xOTdjMCwwLjk1NS0wLjc3OSwxLjczMS0xLjczNiwxLjczMUgzMC41NDQJCQkJYy0wLjk2LDAtMS43MzYtMC43NzYtMS43MzYtMS43MzFWNDUuMjk4YzAtMC45NiwwLjc3Ni0xLjczNCwxLjczNi0xLjczNEg2OC43NmMwLjk1NywwLDEuNzM2LDAuNzc0LDEuNzM2LDEuNzM0VjcwLjE5N3oiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDojMzMzMzMzO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc0MDQ7IiBkPSJNNTUuMDA3LDcyLjU0OWMwLDAuOTExLTAuNzM1LDEuNjQ2LTEuNjQ1LDEuNjQ2aC03LjQwNQkJCQljLTAuOTEsMC0xLjY0NS0wLjczNS0xLjY0NS0xLjY0NnYtMS42NDJjMC0wLjkwOSwwLjczNS0xLjY1LDEuNjQ1LTEuNjVoNy40MDVjMC45MDksMCwxLjY0NSwwLjc0MSwxLjY0NSwxLjY1VjcyLjU0OXoiLz4JCQk8Zz4JCQkJPHBhdGggc3R5bGU9ImZpbGw6IzMzMzMzMztzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC43NDA0OyIgZD0iTTQxLjE5MSw5NC44ODNjLTAuMTgsMC0wLjM2MS0wLjAyNi0wLjU0MS0wLjA4MQkJCQkJYy0wLjk3OC0wLjI5OC0xLjUyOS0xLjMzMy0xLjIzLTIuMzExbDUuOTk4LTE5LjY1N2MwLjI5OC0wLjk3OSwxLjM0LTEuNTMsMi4zMS0xLjIzYzAuOTc4LDAuMjk5LDEuNTI5LDEuMzMzLDEuMjMsMi4zMTEJCQkJCUw0Mi45Niw5My41NzFDNDIuNzE3LDk0LjM2OSw0MS45ODMsOTQuODgzLDQxLjE5MSw5NC44ODNMNDEuMTkxLDk0Ljg4M3oiLz4JCQk8L2c+CQkJPGc+CQkJCTxwYXRoIHN0eWxlPSJmaWxsOiMzMzMzMzM7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuNzQwNDsiIGQ9Ik01Ny44MzksOTQuNDU3Yy0wLjc5OCwwLTEuNTM1LTAuNTIxLTEuNzc0LTEuMzI1CQkJCQlsLTUuNzA5LTE5LjIzYy0wLjI5MS0wLjk4LDAuMjY5LTIuMDEyLDEuMjQ4LTIuMzAyYzAuOTc5LTAuMjg3LDIuMDExLDAuMjY3LDIuMzAyLDEuMjQ3bDUuNzA5LDE5LjIzMQkJCQkJYzAuMjkxLDAuOTc5LTAuMjY4LDIuMDExLTEuMjQ4LDIuMzAyQzU4LjE5LDk0LjQzMyw1OC4wMTQsOTQuNDU3LDU3LjgzOSw5NC40NTdMNTcuODM5LDk0LjQ1N3oiLz4JCQk8L2c+CQk8L2c+CTwvZz4JPGc+CQk8cGF0aCBzdHlsZT0iZmlsbDojNjY2NjY2O3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjc0MDQ7IiBkPSJNMjguMTMxLDAuNDI3Yy0xMS4zMzcsMC0yMC41MzIsOS4xODUtMjAuNTMyLDIwLjUzMgkJCWMwLDExLjMzNyw5LjE5NSwyMC41MjEsMjAuNTMyLDIwLjUyMWMxMS4zMzYsMCwyMC41MzItOS4xODQsMjAuNTMyLTIwLjUyMUM0OC42NjMsOS42MTIsMzkuNDY3LDAuNDI3LDI4LjEzMSwwLjQyN3oJCQkgTTM3Ljc0OSw2LjI3NmMzLjY4NCwwLDYuNjY3LDIuOTg4LDYuNjY3LDYuNjY2YzAsMi4yMzktMS4xMDcsNC4yMTUtMi43OTUsNS40MjdjLTEuMDk1LDAuNzc1LTIuNDI2LDEuMjM5LTMuODcyLDEuMjM5CQkJYy0wLjU4MSwwLTEuMTQ0LTAuMDc2LTEuNjg4LTAuMjE5Yy0yLjg2NC0wLjc0NC00Ljk3Ny0zLjM0Ni00Ljk3Ny02LjQ0N0MzMS4wODMsOS4yNjQsMzQuMDY2LDYuMjc2LDM3Ljc0OSw2LjI3NnogTTIzLjQwNCwyLjU2MQkJCWMzLjY4NSwwLDYuNjY3LDIuOTg4LDYuNjY3LDYuNjY2YzAsMi4yMzktMS4xMDcsNC4yMTUtMi43OTUsNS40MjdjLTEuMDk1LDAuNzc2LTIuNDI2LDEuMjQtMy44NzIsMS4yNAkJCWMtMC41ODEsMC0xLjE0My0wLjA3Ni0xLjY4OC0wLjIxOWMtMi44NjMtMC43NDQtNC45NzctMy4zNDYtNC45NzctNi40NDdDMTYuNzM5LDUuNTQ4LDE5LjcyMiwyLjU2MSwyMy40MDQsMi41NjF6IE0zMC42NDcsMjAuODI4CQkJYzAsMS40NTEtMS4xNzYsMi42MjctMi42MjcsMi42MjdjLTEuNDUxLDAtMi42MjctMS4xNzYtMi42MjctMi42MjdjMC0xLjQ1MSwxLjE3Ni0yLjYyNywyLjYyNy0yLjYyNwkJCUMyOS40NzEsMTguMjAxLDMwLjY0NywxOS4zNzcsMzAuNjQ3LDIwLjgyOHogTTEzLjcxNSwyOC4wMDhjLTIuODY0LTAuNzQ0LTQuOTc3LTMuMzQ2LTQuOTc3LTYuNDQ3CQkJYzAtMy42NzgsMi45ODItNi42NjYsNi42NjUtNi42NjZjMy42ODQsMCw2LjY2NiwyLjk4OCw2LjY2Niw2LjY2NmMwLDIuMjM5LTEuMTA3LDQuMjE1LTIuNzk1LDUuNDI3CQkJYy0xLjA5NSwwLjc3Ni0yLjQyNiwxLjI0LTMuODcyLDEuMjRDMTQuODIyLDI4LjIyOCwxNC4yNiwyOC4xNTIsMTMuNzE1LDI4LjAwOHogTTI4LjU4MiwzOC4zMjgJCQljLTEuMDk1LDAuNzc2LTIuNDI2LDEuMjQtMy44NzIsMS4yNGMtMC41ODEsMC0xLjE0My0wLjA3Ni0xLjY4OC0wLjIyYy0yLjg2NC0wLjc0NC00Ljk3Ny0zLjM0Ni00Ljk3Ny02LjQ0NwkJCWMwLTMuNjc4LDIuOTgyLTYuNjY2LDYuNjY1LTYuNjY2YzMuNjg0LDAsNi42NjcsMi45ODgsNi42NjcsNi42NjZDMzEuMzc3LDM1LjE0LDMwLjI3LDM3LjExNiwyOC41ODIsMzguMzI4eiBNNDIuMzU4LDMzLjMzMQkJCWMtMS4wOTUsMC43NzYtMi40MjYsMS4yNC0zLjg3MiwxLjI0Yy0wLjU4MSwwLTEuMTQ0LTAuMDc2LTEuNjg4LTAuMjJjLTIuODY0LTAuNzQ0LTQuOTc3LTMuMzQ2LTQuOTc3LTYuNDQ3CQkJYzAtMy42NzgsMi45ODItNi42NjYsNi42NjUtNi42NjZjMy42ODQsMCw2LjY2NywyLjk4OCw2LjY2Nyw2LjY2NkM0NS4xNTMsMzAuMTQzLDQ0LjA0NiwzMi4xMTksNDIuMzU4LDMzLjMzMXoiLz4JPC9nPgk8Zz4JCTxwYXRoIHN0eWxlPSJmaWxsOiM2NjY2NjY7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuNzQwNDsiIGQ9Ik03Mi4xMiwwLjQyN2MtMTEuMzM3LDAtMjAuNTMyLDkuMTg1LTIwLjUzMiwyMC41MzIJCQljMCwxMS4zMzcsOS4xOTUsMjAuNTIxLDIwLjUzMiwyMC41MjFjMTEuMzM2LDAsMjAuNTMyLTkuMTg0LDIwLjUzMi0yMC41MjFDOTIuNjUyLDkuNjEyLDgzLjQ1NiwwLjQyNyw3Mi4xMiwwLjQyN3ogTTgxLjczNyw2LjI3NgkJCWMzLjY4NSwwLDYuNjY3LDIuOTg4LDYuNjY3LDYuNjY2YzAsMi4yMzktMS4xMDcsNC4yMTUtMi43OTUsNS40MjdjLTEuMDk2LDAuNzc1LTIuNDI3LDEuMjM5LTMuODcyLDEuMjM5CQkJYy0wLjU4MSwwLTEuMTQzLTAuMDc2LTEuNjg4LTAuMjE5Yy0yLjg2NC0wLjc0NC00Ljk3Ny0zLjM0Ni00Ljk3Ny02LjQ0N0M3NS4wNzIsOS4yNjQsNzguMDU1LDYuMjc2LDgxLjczNyw2LjI3NnogTTY3LjM5MywyLjU2MQkJCWMzLjY4NSwwLDYuNjY3LDIuOTg4LDYuNjY3LDYuNjY2YzAsMi4yMzktMS4xMDcsNC4yMTUtMi43OTUsNS40MjdjLTEuMDk1LDAuNzc2LTIuNDI3LDEuMjQtMy44NzIsMS4yNAkJCWMtMC41ODEsMC0xLjE0NC0wLjA3Ni0xLjY4OC0wLjIxOWMtMi44NjQtMC43NDQtNC45NzgtMy4zNDYtNC45NzgtNi40NDdDNjAuNzI4LDUuNTQ4LDYzLjcxLDIuNTYxLDY3LjM5MywyLjU2MXogTTc0LjYzNiwyMC44MjgJCQljMCwxLjQ1MS0xLjE3NiwyLjYyNy0yLjYyNywyLjYyN2MtMS40NTEsMC0yLjYyOC0xLjE3Ni0yLjYyOC0yLjYyN2MwLTEuNDUxLDEuMTc3LTIuNjI3LDIuNjI4LTIuNjI3CQkJQzczLjQ2LDE4LjIwMSw3NC42MzYsMTkuMzc3LDc0LjYzNiwyMC44Mjh6IE01Ny43MDQsMjguMDA4Yy0yLjg2My0wLjc0NC00Ljk3Ny0zLjM0Ni00Ljk3Ny02LjQ0NwkJCWMwLTMuNjc4LDIuOTgyLTYuNjY2LDYuNjY1LTYuNjY2YzMuNjg0LDAsNi42NjYsMi45ODgsNi42NjYsNi42NjZjMCwyLjIzOS0xLjEwNiw0LjIxNS0yLjc5NSw1LjQyNwkJCWMtMS4wOTUsMC43NzYtMi40MjYsMS4yNC0zLjg3MSwxLjI0QzU4LjgxMiwyOC4yMjgsNTguMjQ4LDI4LjE1Miw1Ny43MDQsMjguMDA4eiBNNzIuNTcxLDM4LjMyOAkJCWMtMS4wOTYsMC43NzYtMi40MjcsMS4yNC0zLjg3MiwxLjI0Yy0wLjU4MSwwLTEuMTQ0LTAuMDc2LTEuNjg4LTAuMjJjLTIuODY0LTAuNzQ0LTQuOTc4LTMuMzQ2LTQuOTc4LTYuNDQ3CQkJYzAtMy42NzgsMi45ODItNi42NjYsNi42NjUtNi42NjZjMy42ODUsMCw2LjY2NywyLjk4OCw2LjY2Nyw2LjY2NkM3NS4zNjYsMzUuMTQsNzQuMjU5LDM3LjExNiw3Mi41NzEsMzguMzI4eiBNODYuMzQ3LDMzLjMzMQkJCWMtMS4wOTUsMC43NzYtMi40MjcsMS4yNC0zLjg3MiwxLjI0Yy0wLjU4MSwwLTEuMTQ0LTAuMDc2LTEuNjg4LTAuMjJjLTIuODY0LTAuNzQ0LTQuOTc4LTMuMzQ2LTQuOTc4LTYuNDQ3CQkJYzAtMy42NzgsMi45ODItNi42NjYsNi42NjUtNi42NjZjMy42ODUsMCw2LjY2NywyLjk4OCw2LjY2Nyw2LjY2NkM4OS4xNDIsMzAuMTQzLDg4LjAzNCwzMi4xMTksODYuMzQ3LDMzLjMzMXoiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.ARROW_DOWN = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCA5IDIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA5IDIwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBvbHlnb24gc3R5bGU9InN0cm9rZTojMDAwMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwOyIgcG9pbnRzPSIxLjI3OCw3LjY5NSA3LjcyMiw3LjY5NSA0LjYwNSwxMi4zMDUgIi8+PC9zdmc+';
	d.ARROW_EQUILIBRIUM = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiAgICA+PGxpbmUgeTI9IjguNSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxOSIgeTE9IjguNSIgICAgICAvPjxsaW5lIHkyPSIxMS41IiBmaWxsPSJub25lIiB4MT0iMSIgeDI9IjE5IiB5MT0iMTEuNSIgICAgICAvPjxwYXRoIGQ9Ik0xIDExLjUgTDYuNzU3IDEzLjE5MDQgQzYuNzU3IDEzLjE5MDQgNS42MDU2IDEyLjg1MjMgNS42MDU2IDExLjUgWiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlPSJub25lIiAgICAgIC8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTEgMTEuNSBMNi43NTcgMTMuMTkwNCBDNi43NTcgMTMuMTkwNCA1LjYwNTYgMTIuODUyMyA1LjYwNTYgMTEuNSBaIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAgICAgIC8+PHBhdGggZD0iTTE5IDguNSBMMTMuMjQzIDYuODA5NiBDMTMuMjQzIDYuODA5NiAxNC4zOTQ0IDcuMTQ3NyAxNC4zOTQ0IDguNSBaIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTkgOC41IEwxMy4yNDMgNi44MDk2IEMxMy4yNDMgNi44MDk2IDE0LjM5NDQgNy4xNDc3IDE0LjM5NDQgOC41IFoiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.ARROW_RESONANCE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMTAiIGZpbGw9Im5vbmUiIHgxPSIyIiB4Mj0iMTgiIHkxPSIxMCIgICAgICAvPjxwYXRoIGQ9Ik0xOSAxMC41IEwxNC4yMDI1IDExLjkwODcgQzE0LjIwMjUgMTEuOTA4NyAxNS4xNjIgMTEuNjI2OSAxNS4xNjIgMTAuNSBDMTUuMTYyIDkuMzczMSAxNC4yMDI1IDkuMDkxMyAxNC4yMDI1IDkuMDkxMyBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTkgMTAuNSBMMTQuMjAyNSAxMS45MDg3IEMxNC4yMDI1IDExLjkwODcgMTUuMTYyIDExLjYyNjkgMTUuMTYyIDEwLjUgQzE1LjE2MiA5LjM3MzEgMTQuMjAyNSA5LjA5MTMgMTQuMjAyNSA5LjA5MTMgWiIgICAgICAvPjxwYXRoIGQ9Ik0xIDEwLjUgTDUuNzk3NSA5LjA5MTMgQzUuNzk3NSA5LjA5MTMgNC44MzggOS4zNzMxIDQuODM4IDEwLjUgQzQuODM4IDExLjYyNjkgNS43OTc1IDExLjkwODcgNS43OTc1IDExLjkwODcgWiIgc3Ryb2tlPSJub25lIiAgICAgIC8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTEgMTAuNSBMNS43OTc1IDkuMDkxMyBDNS43OTc1IDkuMDkxMyA0LjgzOCA5LjM3MzEgNC44MzggMTAuNSBDNC44MzggMTEuNjI2OSA1Ljc5NzUgMTEuOTA4NyA1Ljc5NzUgMTEuOTA4NyBaIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.ARROW_RETROSYNTHETIC = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiAgICA+PGxpbmUgeTI9IjEyLjUiIGZpbGw9Im5vbmUiIHgxPSIxIiB4Mj0iMTYuNSIgeTE9IjEyLjUiICAgICAgLz48bGluZSB5Mj0iNy41IiBmaWxsPSJub25lIiB4MT0iMSIgeDI9IjE2LjUiIHkxPSI3LjUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTEuOTI4OSAxNy4wNzExIEwxOSAxMCBMMTEuOTI4OSAyLjkyODkiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.ARROW_SYNTHETIC = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMTAiIGZpbGw9Im5vbmUiIHgxPSIxIiB4Mj0iMTgiIHkxPSIxMCIgICAgICAvPjxwYXRoIGQ9Ik0xOSAxMC41IEwxMy4yOTM3IDEyLjM1NDEgQzEzLjI5MzcgMTIuMzU0MSAxNC40MzQ5IDExLjk4MzMgMTQuNDM0OSAxMC41IEMxNC40MzQ5IDkuMDE2NyAxMy4yOTM3IDguNjQ1OSAxMy4yOTM3IDguNjQ1OSBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTkgMTAuNSBMMTMuMjkzNyAxMi4zNTQxIEMxMy4yOTM3IDEyLjM1NDEgMTQuNDM0OSAxMS45ODMzIDE0LjQzNDkgMTAuNSBDMTQuNDM0OSA5LjAxNjcgMTMuMjkzNyA4LjY0NTkgMTMuMjkzNyA4LjY0NTkgWiIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.ATOM_REACTION_MAP = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMTUiIGZpbGw9Im5vbmUiIHgxPSIxIiB4Mj0iMTgiIHkxPSIxNSIgICAgICAvPjxwYXRoIGQ9Ik0xOSAxNS41IEwxMy4yOTM3IDE3LjM1NDEgQzEzLjI5MzcgMTcuMzU0MSAxNC40MzQ5IDE2Ljk4MzMgMTQuNDM0OSAxNS41IEMxNC40MzQ5IDE0LjAxNjcgMTMuMjkzNyAxMy42NDU5IDEzLjI5MzcgMTMuNjQ1OSBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTkgMTUuNSBMMTMuMjkzNyAxNy4zNTQxIEMxMy4yOTM3IDE3LjM1NDEgMTQuNDM0OSAxNi45ODMzIDE0LjQzNDkgMTUuNSBDMTQuNDM0OSAxNC4wMTY3IDEzLjI5MzcgMTMuNjQ1OSAxMy4yOTM3IDEzLjY0NTkgWiIgICAgICAvPjxyZWN0IGZpbGw9ImdyYXkiIHg9IjEiIHdpZHRoPSI2IiBoZWlnaHQ9IjgiIHk9IjQiIHN0cm9rZT0ibm9uZSIgICAgICAvPjxyZWN0IGZpbGw9ImdyYXkiIHg9IjEzIiB3aWR0aD0iNiIgaGVpZ2h0PSI4IiB5PSI0IiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICAgID48ZyBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmb250LWZhbWlseT0iJmFwb3M7THVjaWRhIEdyYW5kZSZhcG9zOyIgc3Ryb2tlPSJ3aGl0ZSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiAgICA+PHBhdGggZD0iTTIuNzAzMSAxMSBMMi43MDMxIDEwLjQyMTkgTDMuODU5NCAxMC40MjE5IEwzLjg1OTQgNS44NTk0IEwyLjcwMzEgNi4xNDg0IEwyLjcwMzEgNS41NTQ3IEw0LjYzMjggNS4wNzQyIEw0LjYzMjggMTAuNDIxOSBMNS43ODkxIDEwLjQyMTkgTDUuNzg5MSAxMSBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBkPSJNMTQuNzAzMSAxMSBMMTQuNzAzMSAxMC40MjE5IEwxNS44NTk0IDEwLjQyMTkgTDE1Ljg1OTQgNS44NTk0IEwxNC43MDMxIDYuMTQ4NCBMMTQuNzAzMSA1LjU1NDcgTDE2LjYzMjggNS4wNzQyIEwxNi42MzI4IDEwLjQyMTkgTDE3Ljc4OTEgMTAuNDIxOSBMMTcuNzg5MSAxMSBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BENZENE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSI1LjUiIGZpbGw9Im5vbmUiIHgxPSItNC43NjMxIiB4Mj0iLTAiIHkxPSIyLjc1IiAgICAgIC8+PGxpbmUgeTI9Ii0yLjc1IiBmaWxsPSJub25lIiB4MT0iNC43NjMxIiB4Mj0iNC43NjMxIiB5MT0iMi43NSIgICAgICAvPjxsaW5lIHkyPSItMi43NSIgZmlsbD0ibm9uZSIgeDE9IjAiIHgyPSItNC43NjMxIiB5MT0iLTUuNSIgICAgICAvPjxsaW5lIHkyPSI4LjUiIGZpbGw9Im5vbmUiIHgxPSItNy4zNjEyIiB4Mj0iLTAiIHkxPSI0LjI1IiAgICAgIC8+PGxpbmUgeTI9IjQuMjUiIGZpbGw9Im5vbmUiIHgxPSItMCIgeDI9IjcuMzYxMiIgeTE9IjguNSIgICAgICAvPjxsaW5lIHkyPSItNC4yNSIgZmlsbD0ibm9uZSIgeDE9IjcuMzYxMiIgeDI9IjcuMzYxMiIgeTE9IjQuMjUiICAgICAgLz48bGluZSB5Mj0iLTguNSIgZmlsbD0ibm9uZSIgeDE9IjcuMzYxMiIgeDI9IjAiIHkxPSItNC4yNSIgICAgICAvPjxsaW5lIHkyPSItNC4yNSIgZmlsbD0ibm9uZSIgeDE9IjAiIHgyPSItNy4zNjEyIiB5MT0iLTguNSIgICAgICAvPjxsaW5lIHkyPSI0LjI1IiBmaWxsPSJub25lIiB4MT0iLTcuMzYxMiIgeDI9Ii03LjM2MTIiIHkxPSItNC4yNSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BOND_ANY = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZGVmcyBpZD0iZGVmczEiICAgID48Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDEiICAgICAgPjxwYXRoIGQ9Ik0wIDAgTDAgMjAgTDIwIDIwIEwyMCAxNCBMMSAxNCBMMSA3IEwyMCA3IEwyMCAwIFoiICAgICAgLz48L2NsaXBQYXRoICAgICAgPjxjbGlwUGF0aCBjbGlwUGF0aFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImNsaXBQYXRoMiIgICAgICA+PHBhdGggZD0iTTAgMCBMMjAgMCBMMjAgMjAgTDAgMjAgTDAgMCBaIiAgICAgIC8+PC9jbGlwUGF0aCAgICA+PC9kZWZzICAgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBmb250LXNpemU9IjgiIGZvbnQtZmFtaWx5PSImYXBvcztMdWNpZGEgR3JhbmRlJmFwb3M7IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMiIgZmlsbD0ibm9uZSIgeDE9IjIiIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDEpIiB4Mj0iMTgiIHkxPSIxOCIgICAgICAvPjxwYXRoIGQ9Ik01LjY3NTggMTEuNzg5MSBMNC42OTE0IDkuMjk2OSBMMy43MDMxIDExLjc4OTEgWk02LjU0MyAxNCBMNS45MTQxIDEyLjM5ODQgTDMuNDY0OCAxMi4zOTg0IEwyLjgyODEgMTQgTDIuMDY2NCAxNCBMNC4zNTk0IDguMjE4OCBMNS4xNzE5IDguMjE4OCBMNy40Mjk3IDE0IFpNOC43NDYxIDE0IEw4Ljc0NjEgOC4yMTg4IEw5LjU1MDggOC4yMTg4IEwxMi40NjA5IDEyLjY4MzYgTDEyLjQ2MDkgOC4yMTg4IEwxMy4xNjQxIDguMjE4OCBMMTMuMTY0MSAxNCBMMTIuMzYzMyAxNCBMOS40NDkyIDkuNTM1MiBMOS40NDkyIDE0IFpNMTUuOTk2MSAxNCBMMTUuOTk2MSAxMS41ODU5IEwxNC4wNjY0IDguMjE4OCBMMTUuMDAzOSA4LjIxODggTDE2LjUwMzkgMTAuODI4MSBMMTguMTIxMSA4LjIxODggTDE4Ljg4MjggOC4yMTg4IEwxNi44MTY0IDExLjU3MDMgTDE2LjgxNjQgMTQgWiIgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoMikiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BOND_DOUBLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxNyIgeTE9IjE3IiAgICAgIC8+PGxpbmUgeTI9IjMiIGZpbGw9Im5vbmUiIHgxPSIzIiB4Mj0iMTkiIHkxPSIxOSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BOND_DOUBLE_AMBIGUOUS = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMyIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxOSIgeTE9IjE3IiAgICAgIC8+PGxpbmUgeTI9IjEiIGZpbGw9Im5vbmUiIHgxPSIzIiB4Mj0iMTciIHkxPSIxOSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BOND_HALF = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBzdHJva2UtZGFzaG9mZnNldD0iMSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgc3Ryb2tlLWRhc2hhcnJheT0iMSwxLDQsNCw0LDQsNCw0LDQsMSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2UtbWl0ZXJsaW1pdD0iMSIgICAgPjxsaW5lIHkyPSIyIiBmaWxsPSJub25lIiB4MT0iMiIgeDI9IjE4IiB5MT0iMTgiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BOND_PROTRUDING = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48cG9seWdvbiBwb2ludHM9IiAyIDE4IDE2IDAgMjAgNCIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.BOND_QUADRUPLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxMyIgeTE9IjEzIiAgICAgIC8+PGxpbmUgeTI9IjciIGZpbGw9Im5vbmUiIHgxPSI3IiB4Mj0iMTkiIHkxPSIxOSIgICAgICAvPjxsaW5lIHkyPSIzIiBmaWxsPSJub25lIiB4MT0iMyIgeDI9IjE1IiB5MT0iMTUiICAgICAgLz48bGluZSB5Mj0iNSIgZmlsbD0ibm9uZSIgeDE9IjUiIHgyPSIxNyIgeTE9IjE3IiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.BOND_QUINTUPLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxMSIgeTE9IjExIiAgICAgIC8+PGxpbmUgeTI9IjkiIGZpbGw9Im5vbmUiIHgxPSI5IiB4Mj0iMTkiIHkxPSIxOSIgICAgICAvPjxsaW5lIHkyPSIzIiBmaWxsPSJub25lIiB4MT0iMyIgeDI9IjEzIiB5MT0iMTMiICAgICAgLz48bGluZSB5Mj0iNyIgZmlsbD0ibm9uZSIgeDE9IjciIHgyPSIxNyIgeTE9IjE3IiAgICAgIC8+PGxpbmUgeTI9IjUiIGZpbGw9Im5vbmUiIHgxPSI1IiB4Mj0iMTUiIHkxPSIxNSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BOND_RECESSED = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZGVmcyBpZD0iZGVmczEiICAgID48Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDEiICAgICAgPjxwYXRoIGQ9Ik0yIDE4IEwxNiAwIEwyMCA0IFoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgICAgICAvPjwvY2xpcFBhdGggICAgPjwvZGVmcyAgICA+PGcgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1kYXNob2Zmc2V0PSIxLjIxIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBzdHJva2UtbGluZWpvaW49ImJldmVsIiBzdHJva2UtZGFzaGFycmF5PSIxLjIxLDMiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgc3Ryb2tlLXdpZHRoPSI2LjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxIiAgICA+PGxpbmUgeTI9IjIiIGZpbGw9Im5vbmUiIHgxPSIyIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgxKSIgeDI9IjE4IiB5MT0iMTgiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BOND_RESONANCE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxNyIgeTE9IjE3IiAgICAvPjwvZyAgICA+PGcgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEiIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIHN0cm9rZS1saW5lam9pbj0iYmV2ZWwiIHN0cm9rZS1kYXNoYXJyYXk9IjEsMSw0LDQsNCw0LDQsNCw0LDEiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEiICAgID48bGluZSB5Mj0iMyIgZmlsbD0ibm9uZSIgeDE9IjMiIHgyPSIxOSIgeTE9IjE5IiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.BOND_SEXTUPLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSI5IiB5MT0iOSIgICAgICAvPjxsaW5lIHkyPSIxMSIgZmlsbD0ibm9uZSIgeDE9IjExIiB4Mj0iMTkiIHkxPSIxOSIgICAgICAvPjxsaW5lIHkyPSIzIiBmaWxsPSJub25lIiB4MT0iMyIgeDI9IjExIiB5MT0iMTEiICAgICAgLz48bGluZSB5Mj0iOSIgZmlsbD0ibm9uZSIgeDE9IjkiIHgyPSIxNyIgeTE9IjE3IiAgICAgIC8+PGxpbmUgeTI9IjUiIGZpbGw9Im5vbmUiIHgxPSI1IiB4Mj0iMTMiIHkxPSIxMyIgICAgICAvPjxsaW5lIHkyPSI3IiBmaWxsPSJub25lIiB4MT0iNyIgeDI9IjE1IiB5MT0iMTUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BOND_SINGLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMiIgZmlsbD0ibm9uZSIgeDE9IjIiIHgyPSIxOCIgeTE9IjE4IiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.BOND_TRIPLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxNSIgeTE9IjE1IiAgICAgIC8+PGxpbmUgeTI9IjMiIGZpbGw9Im5vbmUiIHgxPSIzIiB4Mj0iMTciIHkxPSIxNyIgICAgICAvPjxsaW5lIHkyPSI1IiBmaWxsPSJub25lIiB4MT0iNSIgeDI9IjE5IiB5MT0iMTkiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BOND_WAVY = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48cGF0aCBmaWxsPSJub25lIiBkPSJNMiAxOCBRNy4zMDMzIDE5Ljc2NzggNS41MzU1IDE0LjQ2NDUgUTMuNzY3OCA5LjE2MTIgOS4wNzExIDEwLjkyODkgUTE0LjM3NDQgMTIuNjk2NyAxMi42MDY2IDcuMzkzNCBRMTAuODM4OCAyLjA5MDEgMTYuMTQyMSAzLjg1NzkiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BOND_ZERO = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjEiIGN4PSI1IiBjeT0iMTYiIHN0cm9rZT0ibm9uZSIgICAgICAvPjxjaXJjbGUgcj0iMSIgY3g9IjkiIGN5PSIxMiIgc3Ryb2tlPSJub25lIiAgICAgIC8+PGNpcmNsZSByPSIxIiBjeD0iMTMiIGN5PSI4IiBzdHJva2U9Im5vbmUiICAgICAgLz48Y2lyY2xlIHI9IjEiIGN4PSIxNyIgY3k9IjQiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.BRACKET_CHARGE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiAgICA+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTMgMyBMMSAzIEwxIDE3IEwzIDE3IE05IDE3IEwxMSAxNyBMMTEgMyBMOSAzIiAgICAgIC8+PHBhdGggZD0iTTEzLjMwMDggMTAgTDEzLjMwMDggOS4xMzI4IEwyMC4yMzgzIDkuMTMyOCBMMjAuMjM4MyAxMCBaTTE2LjMzNTkgOC4yNjU2IEwxNi4zMzU5IDYuMDk3NyBMMTMuMzAwOCA2LjA5NzcgTDEzLjMwMDggNS4yMzA1IEwxNi4zMzU5IDUuMjMwNSBMMTYuMzM1OSAzLjA2MjUgTDE3LjIwMzEgMy4wNjI1IEwxNy4yMDMxIDUuMjMwNSBMMjAuMjM4MyA1LjIzMDUgTDIwLjIzODMgNi4wOTc3IEwxNy4yMDMxIDYuMDk3NyBMMTcuMjAzMSA4LjI2NTYgWiIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.BRACKET_DYNAMIC = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZGVmcyBpZD0iZGVmczEiICAgID48bGluZWFyR3JhZGllbnQgeDE9IjE1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDI9IjIwIiB5MT0iMTUiIHkyPSIyMCIgaWQ9ImxpbmVhckdyYWRpZW50MSIgc3ByZWFkTWV0aG9kPSJwYWQiICAgICAgPjxzdG9wIHN0b3Atb3BhY2l0eT0iMSIgc3RvcC1jb2xvcj0iYmx1ZSIgb2Zmc2V0PSIwJSIgICAgICAgIC8+PHN0b3Agc3RvcC1vcGFjaXR5PSIxIiBzdG9wLWNvbG9yPSJibGFjayIgb2Zmc2V0PSIxMDAlIiAgICAgIC8+PC9saW5lYXJHcmFkaWVudCAgICA+PC9kZWZzICAgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIzIiB5MT0iMSIgICAgICAvPjxsaW5lIHkyPSIxNiIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIxIiB5MT0iMSIgICAgICAvPjxsaW5lIHkyPSIxNiIgZmlsbD0ibm9uZSIgeDE9IjEiIHgyPSIzIiB5MT0iMTYiICAgICAgLz48bGluZSB5Mj0iMSIgZmlsbD0ibm9uZSIgeDE9IjEwIiB4Mj0iOCIgeTE9IjEiICAgICAgLz48bGluZSB5Mj0iMTYiIGZpbGw9Im5vbmUiIHgxPSIxMCIgeDI9IjEwIiB5MT0iMSIgICAgICAvPjxsaW5lIHkyPSIxNiIgZmlsbD0ibm9uZSIgeDE9IjEwIiB4Mj0iOCIgeTE9IjE2IiAgICAvPjwvZyAgICA+PGcgZm9udC1zaXplPSIxNSIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDEpIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmb250LWZhbWlseT0ic2VyaWYiIHN0cm9rZT0idXJsKCNsaW5lYXJHcmFkaWVudDEpIiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGZvbnQtd2VpZ2h0PSJib2xkIiAgICA+PHBhdGggZD0iTTEyLjI0MTcgMTguNjQxMSBRMTIuNjUxOSAxOC41ODk4IDEyLjg0NTkgMTguNDE3NyBRMTMuMDQgMTguMjQ1NiAxMy4wNCAxNy43MzI5IEwxMy4wNCAxMy4zMjM3IFExMy4wNCAxMi44Njk2IDEyLjg4MjYgMTIuNjkzOCBRMTIuNzI1MSAxMi41MTgxIDEyLjI0MTcgMTIuNDU5NSBMMTIuMjQxNyAxMi4wOTMzIEwxNS4wODM1IDEyLjA5MzMgTDE1LjA4MzUgMTMuMTY5OSBRMTUuNDQyNCAxMi42Mjc5IDE1Ljk5NTQgMTIuMjcyNyBRMTYuNTQ4MyAxMS45MTc1IDE3LjIyMjIgMTEuOTE3NSBRMTguMTg5IDExLjkxNzUgMTguNzIgMTIuNDE1NSBRMTkuMjUxIDEyLjkxMzYgMTkuMjUxIDE0LjE2NiBMMTkuMjUxIDE3Ljc5MTUgUTE5LjI1MSAxOC4yOTY5IDE5LjQyMzEgMTguNDQzNCBRMTkuNTk1MiAxOC41ODk4IDE5Ljk5OCAxOC42NDExIEwxOS45OTggMTkgTDE2LjQ3NTEgMTkgTDE2LjQ3NTEgMTguNjQxMSBRMTYuODc3OSAxOC41NjA1IDE3LjAyNDQgMTguNDIxNCBRMTcuMTcwOSAxOC4yODIyIDE3LjE3MDkgMTcuNzkxNSBMMTcuMTcwOSAxNC4xNTg3IFExNy4xNzA5IDEzLjY0NiAxNy4wNjg0IDEzLjM4OTYgUTE2Ljg5MjYgMTIuOTI4MiAxNi4zNzI2IDEyLjkyODIgUTE1Ljk4NDQgMTIuOTI4MiAxNS42NTg0IDEzLjIxMDIgUTE1LjMzMjUgMTMuNDkyMiAxNS4xNTY3IDEzLjc3NzggTDE1LjE1NjcgMTcuNzkxNSBRMTUuMTU2NyAxOC4yODIyIDE1LjMwMzIgMTguNDIxNCBRMTUuNDQ5NyAxOC41NjA1IDE1Ljg1MjUgMTguNjQxMSBMMTUuODUyNSAxOSBMMTIuMjQxNyAxOSBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.BROMINE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMTY2LDQxLDQxKSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDE2Niw0MSw0MSkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik00LjMwNTcgMTUgTDQuMzA1NyA0Ljg4MjggTDYuOTMwNyA0Ljg4MjggUTguNDQ4MiA0Ljg4MjggOS4yNTgzIDUuNDU3IFExMC4wNjg0IDYuMDMxMiAxMC4wNjg0IDcuMTExMyBRMTAuMDY4NCA4Ljk1MDIgNy45OTAyIDkuNzI5NSBRMTAuNDcxNyAxMC40ODgzIDEwLjQ3MTcgMTIuNDcwNyBRMTAuNDcxNyAxMy43MDEyIDkuNjUxNCAxNC4zNTA2IFE4LjgzMTEgMTUgNy4yODYxIDE1IFpNNS43Mjc1IDEzLjkyNjggTDYuMDIxNSAxMy45MjY4IFE3LjYwMDYgMTMuOTI2OCA4LjA2NTQgMTMuNzI4NSBROC45NTQxIDEzLjM1MjUgOC45NTQxIDEyLjMzNCBROC45NTQxIDExLjQzMTYgOC4xNDc1IDEwLjgzMzUgUTcuMzQwOCAxMC4yMzU0IDYuMTMwOSAxMC4yMzU0IEw1LjcyNzUgMTAuMjM1NCBaTTUuNzI3NSA5LjMyNjIgTDYuMTg1NSA5LjMyNjIgUTcuMzM0IDkuMzI2MiA3Ljk2NjMgOC44MzQgUTguNTk4NiA4LjM0MTggOC41OTg2IDcuNDQ2MyBROC41OTg2IDUuOTU2MSA2LjI4ODEgNS45NTYxIEw1LjcyNzUgNS45NTYxIFpNMTIuMzQ2NyAxNSBMMTIuMzQ2NyA3LjU3NjIgTDEzLjY5MzQgNy41NzYyIEwxMy42OTM0IDguOTcwNyBRMTQuNDkzMiA3LjQxMjEgMTYuMDE3NiA3LjQxMjEgUTE2LjIyMjcgNy40MTIxIDE2LjQ0ODIgNy40NDYzIEwxNi40NDgyIDguNzA0MSBRMTYuMDk5NiA4LjU4NzkgMTUuODMzIDguNTg3OSBRMTQuNTU0NyA4LjU4NzkgMTMuNjkzNCAxMC4xMDU1IEwxMy42OTM0IDE1IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.CALCULATE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGRlZnM+CQkJCTxwYXRoIGlkPSJTVkdJRF8xXyIgZD0iTTc0LjgzMSwzMi41MzdjMCwyLjc2Mi0yLjM1Nyw0Ljk5Ni01LjI3LDQuOTk2SDI4LjM4NmMtMi45MDIsMC01LjI1OC0yLjIzNC01LjI1OC00Ljk5NlYxNS4zOTEJCQkJCWMwLTIuNzYyLDIuMzU2LTQuOTkyLDUuMjU4LTQuOTkyaDQxLjE3NmMyLjkxMiwwLDUuMjcsMi4yMzEsNS4yNyw0Ljk5MlYzMi41Mzd6Ii8+CQkJPC9kZWZzPgkJCTxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPgkJCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8xXyIgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPgkJCTwvY2xpcFBhdGg+CQk8L2c+CTwvZz4JPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxNy4wODIiIHkxPSI0OS45MDg1IiB4Mj0iODEuNjY2IiB5Mj0iNDkuOTA4NSI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQzJDMkMyIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjIwMjUiIHN0eWxlPSJzdG9wLWNvbG9yOiNDNUMyQzIiLz4JCTxzdG9wICBvZmZzZXQ9IjAuMjc0NiIgc3R5bGU9InN0b3AtY29sb3I6I0Q3RDVENSIvPgkJPHN0b3AgIG9mZnNldD0iMC40MDkiIHN0eWxlPSJzdG9wLWNvbG9yOiNGNEY0RjQiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNDg0NyIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPgkJPHN0b3AgIG9mZnNldD0iMC41MzQ4IiBzdHlsZT0ic3RvcC1jb2xvcjojRjhGOEY4Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjYwNjkiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUU1RTUiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNjkyNCIgc3R5bGU9InN0b3AtY29sb3I6I0M2QzZDNiIvPgkJPHN0b3AgIG9mZnNldD0iMC43ODc0IiBzdHlsZT0ic3RvcC1jb2xvcjojOUI5QjlCIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjgyNDIiIHN0eWxlPSJzdG9wLWNvbG9yOiM4ODg4ODgiLz4JCTxzdG9wICBvZmZzZXQ9IjAuODY4MSIgc3R5bGU9InN0b3AtY29sb3I6IzhCOEI4QiIvPgkJPHN0b3AgIG9mZnNldD0iMC45MDM1IiBzdHlsZT0ic3RvcC1jb2xvcjojOTU5NTk1Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjkzNTgiIHN0eWxlPSJzdG9wLWNvbG9yOiNBNkE2QTYiLz4JCTxzdG9wICBvZmZzZXQ9IjAuOTY2MyIgc3R5bGU9InN0b3AtY29sb3I6I0JFQkVCRSIvPgkJPHN0b3AgIG9mZnNldD0iMC45OTUzIiBzdHlsZT0ic3RvcC1jb2xvcjojRENEQ0RDIi8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRTJFMkUyIi8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfM18pO3N0cm9rZTojM0MzQzNDO3N0cm9rZS13aWR0aDoxLjA0MDQ7IiBkPSJNODEuNjY2LDg4LjA2NWMwLDUuODQ2LTQuNzM4LDEwLjU4NC0xMC41ODQsMTAuNTg0CQlIMjcuNjY2Yy01Ljg0NiwwLTEwLjU4NC00LjczOC0xMC41ODQtMTAuNTg0VjExLjc1MmMwLTUuODQ1LDQuNzM4LTEwLjU4NCwxMC41ODQtMTAuNTg0aDQzLjQxNgkJYzUuODQ2LDAsMTAuNTg0LDQuNzM5LDEwLjU4NCwxMC41ODRWODguMDY1eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNjE2MTYxO3N0cm9rZS13aWR0aDoyLjQ4MjsiIGQ9Ik04MS42NjYsODguMDY1YzAsNS44NDYtNC43MzgsMTAuNTg0LTEwLjU4NCwxMC41ODRIMjcuNjY2CQljLTUuODQ2LDAtMTAuNTg0LTQuNzM4LTEwLjU4NC0xMC41ODRWMTEuNzUyYzAtNS44NDUsNC43MzgtMTAuNTg0LDEwLjU4NC0xMC41ODRoNDMuNDE2YzUuODQ2LDAsMTAuNTg0LDQuNzM5LDEwLjU4NCwxMC41ODQJCVY4OC4wNjV6Ii8+CTxwYXRoIHN0eWxlPSJmaWxsOiM0RDRENEQ7IiBkPSJNMzYuNjg4LDUyLjg4NGMwLDAuNzg5LTAuNjM3LDEuNDQxLTEuNDMsMS40NDFoLTguODI2Yy0wLjc4NywwLTEuNDI2LTAuNjUyLTEuNDI2LTEuNDQxdi01Ljk3NgkJYzAtMC44MDIsMC42MzktMS40MzksMS40MjYtMS40MzloOC44MjZjMC43OTMsMCwxLjQzLDAuNjM4LDEuNDMsMS40MzlWNTIuODg0eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDojNEQ0RDREOyIgZD0iTTU1LjYxMiw1Mi44ODRjMCwwLjc4OS0wLjY0NiwxLjQ0MS0xLjQzOCwxLjQ0MWgtOC44MmMtMC43ODUsMC0xLjQzLTAuNjUyLTEuNDMtMS40NDF2LTUuOTc2CQljMC0wLjgwMiwwLjY0NS0xLjQzOSwxLjQzLTEuNDM5aDguODJjMC43OTEsMCwxLjQzOCwwLjYzOCwxLjQzOCwxLjQzOVY1Mi44ODR6Ii8+CTxwYXRoIHN0eWxlPSJmaWxsOiM0RDRENEQ7IiBkPSJNNzQuNDk3LDUyLjg4NGMwLDAuNzg5LTAuNjI5LDEuNDQxLTEuNDI4LDEuNDQxaC04LjgyYy0wLjc5MSwwLTEuNDMtMC42NTItMS40My0xLjQ0MXYtNS45NzYJCWMwLTAuODAyLDAuNjM5LTEuNDM5LDEuNDMtMS40MzloOC44MmMwLjc5OSwwLDEuNDI4LDAuNjM4LDEuNDI4LDEuNDM5VjUyLjg4NHoiLz4JPHBhdGggc3R5bGU9ImZpbGw6IzRENEQ0RDsiIGQ9Ik03My4wNjksNjMuOTU2aC04LjgyYy0wLjc5MSwwLTEuNDMsMC42NDEtMS40MywxLjQ0NXYyMy40MjZjMCwwLjc5LDAuNjM5LDEuNDQ1LDEuNDMsMS40NDVoOC44MgkJYzAuNzk5LDAsMS40MjgtMC42NTUsMS40MjgtMS40NDVWNjUuNDAxQzc0LjQ5Nyw2NC41OTcsNzMuODY4LDYzLjk1Niw3My4wNjksNjMuOTU2eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDojNEQ0RDREOyIgZD0iTTM2LjY4OCw3MS4xNTdjMCwwLjc5My0wLjYzNywxLjQ0My0xLjQzLDEuNDQzaC04LjgyNmMtMC43ODcsMC0xLjQyNi0wLjY1LTEuNDI2LTEuNDQzdi01LjQ2MwkJYzAtMC44MDUsMC42MzktMS40NTMsMS40MjYtMS40NTNoOC44MjZjMC43OTMsMCwxLjQzLDAuNjQ4LDEuNDMsMS40NTNWNzEuMTU3eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDojNEQ0RDREOyIgZD0iTTU1LjYxMiw3MS4xNTdjMCwwLjc5My0wLjY0NiwxLjQ0My0xLjQzOCwxLjQ0M2gtOC44MmMtMC43ODUsMC0xLjQzLTAuNjUtMS40My0xLjQ0M3YtNS40NjMJCWMwLTAuODA1LDAuNjQ1LTEuNDUzLDEuNDMtMS40NTNoOC44MmMwLjc5MSwwLDEuNDM4LDAuNjQ4LDEuNDM4LDEuNDUzVjcxLjE1N3oiLz4JPHBhdGggc3R5bGU9ImZpbGw6IzRENEQ0RDsiIGQ9Ik0zNi42ODgsODkuNTExYzAsMC43ODktMC42MzcsMS40NC0xLjQzLDEuNDRoLTguODI2Yy0wLjc4NywwLTEuNDI2LTAuNjUtMS40MjYtMS40NHYtNS45OAkJYzAtMC43OTcsMC42MzktMS40NDUsMS40MjYtMS40NDVoOC44MjZjMC43OTMsMCwxLjQzLDAuNjQ4LDEuNDMsMS40NDVWODkuNTExeiIvPgk8cGF0aCBzdHlsZT0iZmlsbDojNEQ0RDREOyIgZD0iTTU1LjYxMiw4OS41MTFjMCwwLjc4OS0wLjY0NiwxLjQ0LTEuNDM4LDEuNDRoLTguODJjLTAuNzg1LDAtMS40My0wLjY1LTEuNDMtMS40NHYtNS45OAkJYzAtMC43OTcsMC42NDUtMS40NDUsMS40My0xLjQ0NWg4LjgyYzAuNzkxLDAsMS40MzgsMC42NDgsMS40MzgsMS40NDVWODkuNTExeiIvPgk8Zz4JCTxkZWZzPgkJCTxwYXRoIGlkPSJTVkdJRF80XyIgZD0iTTc0LjgzMiwzMi41MzdjMCwyLjc2Mi0yLjM1Nyw0Ljk5Ni01LjI3LDQuOTk2SDI4LjM4N2MtMi45MDIsMC01LjI1OC0yLjIzNC01LjI1OC00Ljk5NlYxNS4zOTEJCQkJYzAtMi43NjIsMi4zNTUtNC45OTIsNS4yNTgtNC45OTJoNDEuMTc2YzIuOTEyLDAsNS4yNywyLjIzMSw1LjI3LDQuOTkyVjMyLjUzN3oiLz4JCTwvZGVmcz4JCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMjMuMTI4OSIgeTE9IjIzLjk2NiIgeDI9Ijc0LjgzMiIgeTI9IjIzLjk2NiI+CQkJPHN0b3AgIG9mZnNldD0iMC4wMTEiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QkI4RDYiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjAyNjUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4NkIxRDQiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjA5NzYiIHN0eWxlPSJzdG9wLWNvbG9yOiM3Mzk2Q0UiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjE2OTgiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NjgyQzkiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjI0MjkiIHN0eWxlPSJzdG9wLWNvbG9yOiM1RTc3QzYiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjMxODciIHN0eWxlPSJzdG9wLWNvbG9yOiM1QjczQzUiLz4JCQk8c3RvcCAgb2Zmc2V0PSIwLjY5MjMiIHN0eWxlPSJzdG9wLWNvbG9yOiM1REExQ0UiLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNDg3RENEIi8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfNF8iICBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTtmaWxsOnVybCgjU1ZHSURfNV8pOyIvPgkJPGNsaXBQYXRoIGlkPSJTVkdJRF82XyI+CQkJPHVzZSB4bGluazpocmVmPSIjU1ZHSURfNF8iICBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiLz4JCTwvY2xpcFBhdGg+CQk8cGF0aCBzdHlsZT0iY2xpcC1wYXRoOnVybCgjU1ZHSURfNl8pO2ZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2Utd2lkdGg6MS45NDI0OyIgZD0iTTE0LjY1MywzMy4zMDUJCQljNy4wMjMtMC42MDIsNy4wMjItMjAuNDc3LDE0LjA0Ni0xOS4yNzJjNy4wMjMsMS4yMDUsNS4xMDcsMTguNjcsMTEuNDkzLDE5LjI3MmgxLjAyM2M3LjAyMi0wLjYwMiw3LjAyMS0yMC40NzcsMTQuMDQ2LTE5LjI3MgkJCWM3LjAyMywxLjIwNSw1LjEwNywxOC42NywxMS40OTMsMTkuMjcyaC0wLjE3OUg2Ny42YzcuMDIyLTAuNjAyLDcuMDIxLTIwLjQ3NywxNC4wNDYtMTkuMjcyCQkJYzcuMDIzLDEuMjA1LDUuMTA3LDE4LjY3LDExLjQ5MywxOS4yNzIiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.CARBON = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMTQ0LDE0NCwxNDQpIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmb250LWZhbWlseT0iJmFwb3M7THVjaWRhIEdyYW5kZSZhcG9zOyIgc3Ryb2tlPSJyZ2IoMTQ0LDE0NCwxNDQpIiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiICAgID48cGF0aCBkPSJNMTAuNjM5NiAxNS4yNTI5IFE4LjI4MTIgMTUuMjUyOSA2Ljk5NjEgMTMuODY4NyBRNS43MTA5IDEyLjQ4NDQgNS43MTA5IDkuOTQ4MiBRNS43MTA5IDcuNDE4OSA3LjAyIDYuMDI0NCBROC4zMjkxIDQuNjI5OSAxMC43MDggNC42Mjk5IFExMi4wNjg0IDQuNjI5OSAxMy44OTM2IDUuMDc0MiBMMTMuODkzNiA2LjQyMDkgUTExLjgxNTQgNS43MDMxIDEwLjY4NzUgNS43MDMxIFE5LjA0IDUuNzAzMSA4LjEzNzcgNi44MTc0IFE3LjIzNTQgNy45MzE2IDcuMjM1NCA5Ljk2MTkgUTcuMjM1NCAxMS44OTY1IDguMTk5MiAxMy4wMTQyIFE5LjE2MzEgMTQuMTMxOCAxMC44MzExIDE0LjEzMTggUTEyLjI2NjYgMTQuMTMxOCAxMy45MDcyIDEzLjI1IEwxMy45MDcyIDE0LjQ4MDUgUTEyLjQxMDIgMTUuMjUyOSAxMC42Mzk2IDE1LjI1MjkgWiIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.CENTER = 'PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjwvZGVmcz48Zz48cGF0aCBkPSJNIDIyLjg1IDEzIEMgMjIuODUgMTguNDQwMDA0Nzg1ODMzMzEzIDE4LjQ0MDAwNDc4NTgzMzMxNyAyMi44NSAxMyAyMi44NSA3LjU1OTk5NTIxNDE2NjY4NyAyMi44NSAzLjE1MDAwMDAwMDAwMDAwMiAxOC40NDAwMDQ3ODU4MzMzMTcgMy4xNTAwMDAwMDAwMDAwMDA0IDEzLjAwMDAwMDAwMDAwMDAwMiAzLjE1MDAwMDAwMDAwMDAwMDQgNy41NTk5OTUyMTQxNjY2ODcgNy41NTk5OTUyMTQxNjY2ODMgMy4xNTAwMDAwMDAwMDAwMDIgMTIuOTk5OTk5OTk5OTk5OTk4IDMuMTUwMDAwMDAwMDAwMDAwNCAxOC40NDAwMDQ3ODU4MzMzMTMgMy4xNTAwMDAwMDAwMDAwMDA0IDIyLjg1IDcuNTU5OTk1MjE0MTY2NjgzIDIyLjg1IDEyLjk5OTk5OTk5OTk5OTk5OCBNIDMuMTUwMDAwMDAwMDAwMDAwNCAxMyBMIDkuMDYgMTMgTSAxMyAzLjE1MDAwMDAwMDAwMDAwMDQgTCAxMyA5LjA2IE0gMjIuODUgMTMgTCAxNi45Mzk5OTk5OTk5OTk5OTggMTMgTSAxMyAyMi44NSBMIDEzIDE2LjkzOTk5OTk5OTk5OTk5OCIgc3Ryb2tlPSIjNDQ0NDQ0IiBzdHJva2Utd2lkdGg9IjIuMyIgZmlsbD0ibm9uZSI+PC9wYXRoPjwvZz48L3N2Zz4=';
	d.CHAIN_CARBON = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZGVmcyBpZD0iZGVmczEiICAgID48bGluZWFyR3JhZGllbnQgeDE9IjE1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDI9IjIwIiB5MT0iMTUiIHkyPSIyMCIgaWQ9ImxpbmVhckdyYWRpZW50MSIgc3ByZWFkTWV0aG9kPSJwYWQiICAgICAgPjxzdG9wIHN0b3Atb3BhY2l0eT0iMSIgc3RvcC1jb2xvcj0iYmx1ZSIgb2Zmc2V0PSIwJSIgICAgICAgIC8+PHN0b3Agc3RvcC1vcGFjaXR5PSIxIiBzdG9wLWNvbG9yPSJibGFjayIgb2Zmc2V0PSIxMDAlIiAgICAgIC8+PC9saW5lYXJHcmFkaWVudCAgICA+PC9kZWZzICAgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48cGF0aCBmaWxsPSJub25lIiBkPSJNMCAxOSBMNSAxNiBMNSAxMSBMOSA4IEw5IDMgTDEzIDAiICAgIC8+PC9nICAgID48ZyBmb250LXNpemU9IjE1IiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50MSkiIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGZvbnQtZmFtaWx5PSJzZXJpZiIgc3Ryb2tlPSJ1cmwoI2xpbmVhckdyYWRpZW50MSkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgZm9udC13ZWlnaHQ9ImJvbGQiICAgID48cGF0aCBkPSJNMTIuMjQxNyAxNy42NDExIFExMi42NTE5IDE3LjU4OTggMTIuODQ1OSAxNy40MTc3IFExMy4wNCAxNy4yNDU2IDEzLjA0IDE2LjczMjkgTDEzLjA0IDEyLjMyMzcgUTEzLjA0IDExLjg2OTYgMTIuODgyNiAxMS42OTM4IFExMi43MjUxIDExLjUxODEgMTIuMjQxNyAxMS40NTk1IEwxMi4yNDE3IDExLjA5MzMgTDE1LjA4MzUgMTEuMDkzMyBMMTUuMDgzNSAxMi4xNjk5IFExNS40NDI0IDExLjYyNzkgMTUuOTk1NCAxMS4yNzI3IFExNi41NDgzIDEwLjkxNzUgMTcuMjIyMiAxMC45MTc1IFExOC4xODkgMTAuOTE3NSAxOC43MiAxMS40MTU1IFExOS4yNTEgMTEuOTEzNiAxOS4yNTEgMTMuMTY2IEwxOS4yNTEgMTYuNzkxNSBRMTkuMjUxIDE3LjI5NjkgMTkuNDIzMSAxNy40NDM0IFExOS41OTUyIDE3LjU4OTggMTkuOTk4IDE3LjY0MTEgTDE5Ljk5OCAxOCBMMTYuNDc1MSAxOCBMMTYuNDc1MSAxNy42NDExIFExNi44Nzc5IDE3LjU2MDUgMTcuMDI0NCAxNy40MjE0IFExNy4xNzA5IDE3LjI4MjIgMTcuMTcwOSAxNi43OTE1IEwxNy4xNzA5IDEzLjE1ODcgUTE3LjE3MDkgMTIuNjQ2IDE3LjA2ODQgMTIuMzg5NiBRMTYuODkyNiAxMS45MjgyIDE2LjM3MjYgMTEuOTI4MiBRMTUuOTg0NCAxMS45MjgyIDE1LjY1ODQgMTIuMjEwMiBRMTUuMzMyNSAxMi40OTIyIDE1LjE1NjcgMTIuNzc3OCBMMTUuMTU2NyAxNi43OTE1IFExNS4xNTY3IDE3LjI4MjIgMTUuMzAzMiAxNy40MjE0IFExNS40NDk3IDE3LjU2MDUgMTUuODUyNSAxNy42NDExIEwxNS44NTI1IDE4IEwxMi4yNDE3IDE4IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.CHLORINE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMzEsMjQwLDMxKSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDMxLDI0MCwzMSkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik04LjYzOTYgMTUuMjUyOSBRNi4yODEyIDE1LjI1MjkgNC45OTYxIDEzLjg2ODcgUTMuNzEwOSAxMi40ODQ0IDMuNzEwOSA5Ljk0ODIgUTMuNzEwOSA3LjQxODkgNS4wMiA2LjAyNDQgUTYuMzI5MSA0LjYyOTkgOC43MDggNC42Mjk5IFExMC4wNjg0IDQuNjI5OSAxMS44OTM2IDUuMDc0MiBMMTEuODkzNiA2LjQyMDkgUTkuODE1NCA1LjcwMzEgOC42ODc1IDUuNzAzMSBRNy4wNCA1LjcwMzEgNi4xMzc3IDYuODE3NCBRNS4yMzU0IDcuOTMxNiA1LjIzNTQgOS45NjE5IFE1LjIzNTQgMTEuODk2NSA2LjE5OTIgMTMuMDE0MiBRNy4xNjMxIDE0LjEzMTggOC44MzExIDE0LjEzMTggUTEwLjI2NjYgMTQuMTMxOCAxMS45MDcyIDEzLjI1IEwxMS45MDcyIDE0LjQ4MDUgUTEwLjQxMDIgMTUuMjUyOSA4LjYzOTYgMTUuMjUyOSBaTTE0LjM0NjcgMTUgTDE0LjM0NjcgNC4yMDYxIEwxNS42OTM0IDQuMjA2MSBMMTUuNjkzNCAxNSBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.CLEAR = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6IzQ1NDVBRDsiIGQ9Ik00NC43NzUsMjYuMzMzIi8+CTwvZz4JPGc+CQk8Zz4JCQk8Zz4JCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzMy43Nzc2IiB5MT0iNjQuMTY3NSIgeDI9Ijc5LjM4MjUiIHkyPSI2NC4xNjc1Ij4JCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDMwNyIgc3R5bGU9InN0b3AtY29sb3I6I0YwRTBEOCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC41MDMxIiBzdHlsZT0ic3RvcC1jb2xvcjojRjVGMkYwIi8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQ0FCOEFEIi8+CQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTc3LjE3MSwzOC4wODdjLTIuOTU2LTMuNzYtNy43ODItNC4wNDUtOC41MTUtNS4zMDkJCQkJCWMtMC43MzItMS4yNTMtMC4yNTEtMy4wMzQtMC4yNTEtMy4wMzRINDQuNzU4YzAsMCwwLjQ4LDEuNzgxLTAuMjUsMy4wMzRjLTAuNzM2LDEuMjY0LTUuNTY2LDEuNTQ4LTguNTE1LDUuMzA5CQkJCQljLTIuNDM3LDMuMDkxLTIuMjEsOC42NDctMi4yMSw4LjY0N3Y0Ny4xMzVjMS4zOTQsNi4wMTYsNDQuMDU3LDYuNTY4LDQ1LjU4NSwwbDAuMDA5LTQ3LjEzNQkJCQkJQzc5LjM3Nyw0Ni43MzQsNzkuNjAzLDQxLjE3OCw3Ny4xNzEsMzguMDg3eiIvPgkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjMzLjc4MzIiIHkxPSI3OS4zMzIzIiB4Mj0iNzkuMzc3IiB5Mj0iNzkuMzMyMyI+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQTlFM0ZCIi8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjgzNDQiIHN0eWxlPSJzdG9wLWNvbG9yOiMzNTkxQ0IiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMzNTYyQ0IiLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8yXyk7IiBkPSJNMzMuNzgzLDYwLjA3NHYzMy43OTVjMS4zOTQsNi4wMTYsNDQuMDU3LDYuNTY4LDQ1LjU4NSwwbDAuMDA5LTMzLjc5NUgzMy43ODN6Ii8+CQkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMzNjM2MzY7c3Ryb2tlLXdpZHRoOjIuOTczOTsiIGQ9Ik03Ny4xNzEsMzguMDg3Yy0yLjk1Ni0zLjc2LTcuNzgyLTQuMDQ1LTguNTE1LTUuMzA5CQkJCQljLTAuNzMyLTEuMjUzLTAuMjUxLTMuMDM0LTAuMjUxLTMuMDM0SDQ0Ljc1OGMwLDAsMC40OCwxLjc4MS0wLjI1LDMuMDM0Yy0wLjczNiwxLjI2NC01LjU2NiwxLjU0OC04LjUxNSw1LjMwOQkJCQkJYy0yLjQzNywzLjA5MS0yLjIxLDguNjQ3LTIuMjEsOC42NDd2NDcuMTM1YzEuMzk0LDYuMDE2LDQ0LjA1Nyw2LjU2OCw0NS41ODUsMGwwLjAwOS00Ny4xMzUJCQkJCUM3OS4zNzcsNDYuNzM0LDc5LjYwMyw0MS4xNzgsNzcuMTcxLDM4LjA4N3oiLz4JCQk8L2c+CQkJPGc+CQkJCTxwYXRoIGQ9Ik01OS4yNDYsNy4yMjFjLTAuMDcyLTAuNTAxLTAuODcyLTQuOTM3LTUuMjQ3LTYuNTc3Yy0zLjI3Ni0xLjIyOS03LjMxMi0wLjM5OS0xMS45NjYsMi40NzMJCQkJCWMtMTMuNjI0LDguNDA0LTMxLjYwMiwyMC44NzctMzEuNjc5LDIwLjkyMWMtMC41MjIsMC4zMTktMC42NjYsMC45NDgtMC4yOSwxLjQxYzAuMzY3LDAuNDYsMS4wOTksMC41NzUsMS42MjksMC4yNTYJCQkJCWMwLjA3NC0wLjA0NCwyMC4zMjItMTAuNzAzLDMzLjc0OS0xOC40NjdjMy45NjYtMi4yOTEsNS42MzQtMi4xNjQsNi4yMS0xLjk1NGMxLjAxMiwwLjM2NiwxLjU4OCwxLjc1NywxLjc0MiwyLjQ3MXYxMy41NDQJCQkJCXYwLjY4OGMwLDAsMC4yMDcsMS4zNzIsMy4yNiwxLjQ3N2MzLjA1NSwwLjEwNSwyLjYxNi0xLjQ3NywyLjYxNi0xLjQ3N1Y3LjU1QzU5LjI3MSw3LjQ0LDU5LjI2MSw3LjMzLDU5LjI0Niw3LjIyMXoiLz4JCQk8L2c+CQkJPHBhdGggZD0iTTcxLjM4NCwyOC4yMjNjMCwxLjYxMy0xLjcxOCwyLjkyOS0zLjg0OCwyLjkyOUg0NS4xOWMtMi4xMjYsMC0zLjg0OS0xLjMxNi0zLjg0OS0yLjkyOXYtMy43MjYJCQkJYzAtMS42MTcsMS43MjMtMi45MjYsMy44NDktMi45MjZoMjIuMzQ2YzIuMTMsMCwzLjg0OCwxLjMxLDMuODQ4LDIuOTI2VjI4LjIyM3oiLz4JCQkJCQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2Utd2lkdGg6Mi45OTk0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHgxPSI0Ny4wNzkiIHkxPSIyOC4yNjIiIHgyPSI0Ny4wNzkiIHkyPSIyNC41MjMiLz4JCTwvZz4JPC9nPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMzYzNjM2O3N0cm9rZS13aWR0aDoyLjk3Mzk7IiB4MT0iNDYuOTYxIiB5MT0iNDkuMDY3IiB4Mj0iMzUuMTkxIiB5Mj0iNDkuMDY3Ii8+CTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMzNjM2MzY7c3Ryb2tlLXdpZHRoOjIuOTczOTsiIHgxPSI0Ni45NjEiIHkxPSI2Ni4wNjQiIHgyPSIzNS4xOTEiIHkyPSI2Ni4wNjQiLz4JPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzM2MzYzNjtzdHJva2Utd2lkdGg6Mi45NzM5OyIgeDE9IjQ2Ljk2MSIgeTE9IjgzLjA2MSIgeDI9IjM1LjE5MSIgeTI9IjgzLjA2MSIvPjwvZz48L3N2Zz4=';
	d.COPY = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGc+CQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItMjM0LjM3OTIiIHkxPSI3MC41MDM2IiB4Mj0iLTE4NS41NjY0IiB5Mj0iMTUuMDAyIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMjkyLjczMDUgMCkiPgkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZFRkRFRCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC40Mzg0IiBzdHlsZT0ic3RvcC1jb2xvcjojRkVGNUJGIi8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDMiIHN0eWxlPSJzdG9wLWNvbG9yOiNCNUE4NUQiLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8xXyk7IiBwb2ludHM9Ijk3Ljg3NSw0NS44MjMgNzguMzEyLDIzLjgwMiAzNi4xMDMsMjMuNTEzIDM2LjEwMyw5Ny44NTMgOTcuODc1LDk3Ljg1MyAJCQkJIi8+CQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItMjI1Ljc0MTciIHkxPSI0OC40NTczIiB4Mj0iLTIyNS43NDE3IiB5Mj0iOTcuODUyNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIDI5Mi43MzA1IDApIj4JCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGQkJCMzgiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZFOTciLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8yXyk7IiBkPSJNMzYuMTAzLDcyLjk4NHYyNC44NjhoNjEuNzcyVjQ4LjU2OGMwLDAtMTAuMjY1LTAuOTMtMjMuNTI5LDIuNTkJCQkJCUM0Ny45MDIsNTguMTczLDM2LjEwMyw3Mi45ODQsMzYuMTAzLDcyLjk4NHoiLz4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzcwNTUwMDtzdHJva2Utd2lkdGg6My45ODk2O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQkJCQk5Ny44NzUsNDUuODIzIDc4LjMxMiwyMy44MDIgMzYuMTAzLDIzLjgwMiAzNi4xMDMsOTcuODUzIDk3Ljg3NSw5Ny44NTMgCQkJCSIvPgkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTIxNC40MTkiIHkxPSIzNC44MTI1IiB4Mj0iLTE5NC44NTU1IiB5Mj0iMzQuODEyNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIDI5Mi43MzA1IDApIj4JCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUZERUQiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUY1QkYiLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7IiBwb2ludHM9Ijc4LjMxMiwyMy44MDIgODkuMjYxLDMyLjc1NCA5Ny44NzUsNDUuODIzIDg4LjIxNiwzOS40NzkgNzguNTQ2LDQwLjYwMSAJCQkJIi8+CQkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM3MDU1MDA7c3Ryb2tlLXdpZHRoOjIuOTkyMjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNNzguMzEyLDIzLjgwMgkJCQkJYzAsMCwyLjA2MywwLjA3MywxMC40ODIsOC40MTdjNS40NDQsNS4zOTYsOS4wODEsMTMuNjA0LDkuMDgxLDEzLjYwNHMtNS40MzgtNC45NTYtMTAuNDc0LTUuNzI5CQkJCQljLTUuODg3LTAuOTA1LTYuMTkxLDAuMDA0LTkuMTE0LDAuNTU3TDc4LjMxMiwyMy44MDJ6Ii8+CQkJCTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRkZGRkZGO3N0cm9rZS13aWR0aDozLjE2MjQ7IiBwb2ludHM9IjM4LjM3NCw5Ni4zMyAzOC4zNzQsMjUuODA3IDc2Ljc5LDI1LjgwNyAJCQkJIi8+CQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGQkJCMzg7c3Ryb2tlLXdpZHRoOjIuNzgyNjsiIHgxPSI5NS42MDIiIHkxPSI5NS43NjMiIHgyPSIzNi43NzEiIHkyPSI5NS43NjMiLz4JCQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JBN0QwMDtzdHJva2Utd2lkdGg6Mi43ODI2OyIgeDE9Ijk1Ljk1OCIgeTE9IjQ4LjQ3NiIgeDI9Ijk1Ljk1OCIgeTI9Ijk3LjE0OSIvPgkJCQk8Zz4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOiNCNUE4NUQ7IiBkPSJNOTcuMDcxLDQ4LjQ5MmwtMi40NzUtMC4wMDlsMC4wMzQtMy4zMzVjMCwwLDAuMzI1LDAuMTk0LDEuMzUyLDAuOTUzCQkJCQkJYzAuOTEzLDAuNjc0LDEuMzc3LDEsMS4zNzcsMWwtMC4wNCwxLjM3NUw5Ny4wNzEsNDguNDkyeiIvPgkJCQk8L2c+CQkJPC9nPgkJPC9nPgk8L2c+CTxnPgkJPGc+CQkJPGc+CQkJCTxyZWN0IHg9IjM2LjczNiIgeT0iMjQuMjA0IiBzdHlsZT0iZmlsbDojOEY3NjQ4OyIgd2lkdGg9IjI2Ljk0MiIgaGVpZ2h0PSI1My4zMzQiLz4JCQkJPGc+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjQ4ODM7IiBwb2ludHM9IjY3LjAwNSw5MC40NjYgNDcuMDUxLDc4LjY3OSA0Ny4wNTEsNTUuMzU1IAkJCQkJCTY3LjI4OCw0My44MTggODcuMjM1LDU1LjYwNCA4Ny4yMzUsNzguOTI5IAkJCQkJIi8+CQkJCQkJCQkJCQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjQ4ODM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7IiB4MT0iNTUuMTYiIHkxPSI2MS44MTciIHgyPSI2OC41MjYiIHkyPSI1NC4yMTQiLz4JCQkJCQkJCQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuNDg4MztzdHJva2UtbGluZWNhcDpyb3VuZDsiIHgxPSI2OC4wMDYiIHkxPSI3OS44OTYiIHgyPSI1NS4zOTQiIHkyPSI3Mi4zODciLz4JCQkJCQkJCQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuNDg4MztzdHJva2UtbGluZWNhcDpyb3VuZDsiIHgxPSI3Ny44MTIiIHkxPSI1OS40NzQiIHgyPSI3Ny41NzYiIHkyPSI3NC43MyIvPgkJCQk8L2c+CQkJPC9nPgkJPC9nPgk8L2c+CTxnPgkJPGc+CQkJPGc+CQkJCTxnPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItMjY4LjEyOTciIHkxPSI0OS4xMzY1IiB4Mj0iLTIxOC45NTQiIHkyPSItNi43Nzc5IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMjkyLjczMDUgMCkiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUZERUQiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjQzODQiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUY1QkYiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDMiIHN0eWxlPSJzdG9wLWNvbG9yOiNCNUE4NUQiLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzRfKTsiIHBvaW50cz0iNjQuMjQ2LDI0LjM3NSA0NC42ODMsMi4wNjUgMi4xNSwyLjA2NSAyLjE1LDc2LjY1NyA2NC4yNDYsNzYuNjU3IAkJCQkJIi8+CQkJCQkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzVfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0yNTkuNTMyMyIgeTE9IjI3LjAwOSIgeDI9Ii0yNTkuNTMyMyIgeTI9Ijc2LjY1NzIiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgMSAyOTIuNzMwNSAwKSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZCQkIzOCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZFOTciLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzVfKTsiIGQ9Ik0yLjE1LDUxLjUzNnYyNS4xMjFoNjIuMDk2VjI3LjEyYzAsMC0xMC41ODgtMC45My0yMy44NTMsMi41OQkJCQkJCUMxMy45NSwzNi43MjUsMi4xNSw1MS41MzYsMi4xNSw1MS41MzZ6Ii8+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNzA1NTAwO3N0cm9rZS13aWR0aDozLjk4OTY7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgcG9pbnRzPSIJCQkJCQk2NC4yNDYsMjQuMzc1IDQ0LjY4MywyLjA2NSAyLjE1LDIuMDY1IDIuMTUsNzYuNjU3IDY0LjI0Niw3Ni42NTcgCQkJCQkiLz4JCQkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTI0OC4wNDc0IiB5MT0iMTMuMjE5OCIgeDI9Ii0yMjguNDg0NCIgeTI9IjEzLjIxOTgiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgMSAyOTIuNzMwNSAwKSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZFRkRFRCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUY1QkYiLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzZfKTsiIHBvaW50cz0iNDQuNjgzLDIuMDY1IDU1LjYzMiwxMS4zMDYgNjQuMjQ2LDI0LjM3NSA1NC41ODcsMTguMDMxIDQ0LjkxNywxOS4xNTIgCQkJCQkiLz4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM3MDU1MDA7c3Ryb2tlLXdpZHRoOjIuOTkyMjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNNDQuNjgzLDIuMDY1CQkJCQkJYzAsMCw1LjM5NCwyLjk3NiwxMC40ODMsOC43MDZjNS4wOSw1LjczLDkuMDgsMTMuNjA0LDkuMDgsMTMuNjA0cy01LjQzOS00Ljk1Ni0xMC40NzQtNS43MjkJCQkJCQljLTUuODg3LTAuOTA1LTYuMTkyLDAuMDA0LTkuMTE0LDAuNTU3TDQ0LjY4MywyLjA2NXoiLz4JCQkJCTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRkZGRkZGO3N0cm9rZS13aWR0aDozLjE2MjQ7IiBwb2ludHM9IjQuNDIyLDc1LjEzNSA0LjQyMiw0LjM1OCA0My4xOTcsNC4zNTggCQkJCQkiLz4JCQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGQkJCMzg7c3Ryb2tlLXdpZHRoOjIuNzgyNjsiIHgxPSI2MS45NzMiIHkxPSI3NC41NjciIHgyPSIyLjgxOCIgeTI9Ijc0LjU2NyIvPgkJCQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JBN0QwMDtzdHJva2Utd2lkdGg6Mi43ODI2OyIgeDE9IjYyLjMyOSIgeTE9IjI3LjAyNyIgeDI9IjYyLjMyOSIgeTI9Ijc1Ljk5Ii8+CQkJCQk8Zz4JCQkJCQk8cGF0aCBzdHlsZT0iZmlsbDojQjVBODVEOyIgZD0iTTYzLjQ0MiwyNy4wNDRsLTIuNDg3LDAuMDA0bDAuMDMxLTMuNDA5YzAsMCwwLjYwNCwwLjM4MiwxLjQxNCwwLjg1OQkJCQkJCQljMC43NjQsMC40NSwxLjMyMSwwLjc2NiwxLjMyMSwwLjc2NmwtMC4wMDMsMS43OEg2My40NDJ6Ii8+CQkJCQk8L2c+CQkJCTwvZz4JCQk8L2c+CQk8L2c+CTwvZz4JPGc+CQk8cG9seWdvbiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjQ4ODM7IiBwb2ludHM9IjMyLjUyNiw2OC43ODkgMTIuNTcyLDU3LjAwMiAxMi41NzIsMzMuNjc5IAkJCTMyLjgwOSwyMi4xNDIgNTIuNzU3LDMzLjkyOCA1Mi43NTcsNTcuMjUyIAkJIi8+CQkJCQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjQ4ODM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7IiB4MT0iMjAuNjgyIiB5MT0iNDAuMTQxIiB4Mj0iMzQuMDQ4IiB5Mj0iMzIuNTM3Ii8+CQkJCQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0LjQ4ODM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7IiB4MT0iMzMuNTI3IiB5MT0iNTguMjE5IiB4Mj0iMjAuOTE1IiB5Mj0iNTAuNzEiLz4JCQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuNDg4MztzdHJva2UtbGluZWNhcDpyb3VuZDsiIHgxPSI0My4zMzMiIHkxPSIzNy43OTciIHgyPSI0My4wOTgiIHkyPSI1My4wNTQiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.CUT = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzOC40NDgyIiB5MT0iMzguNzc1NCIgeDI9Ijk4LjEyNCIgeTI9IjM4Ljc3NTQiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRTNFMURFIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNEQkQ4RDUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4wNjMiIHN0eWxlPSJzdG9wLWNvbG9yOiNDQ0M5QzgiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4xODMzIiBzdHlsZT0ic3RvcC1jb2xvcjojQTVBM0E2Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjY0IiBzdHlsZT0ic3RvcC1jb2xvcjojODg4NjhDIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNTIyNSIgc3R5bGU9InN0b3AtY29sb3I6I0YzRjNGNCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjU4NDYiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUU0RTYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC43MDM5IiBzdHlsZT0ic3RvcC1jb2xvcjojQkZCREMwIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODY3IiBzdHlsZT0ic3RvcC1jb2xvcjojODI3RjgzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODc2NCIgc3R5bGU9InN0b3AtY29sb3I6IzdFN0I3RiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDBEMUQzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNBNkE4QUEiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTM4LjQ0OCw0Mi4xNDFsMS4xMDQsOS45NWwxNC43OS0zLjkzbDEuNzM3LDAuMDE3YzAsMCwyMy43NDgtNi45MzEsMjguMzExLTguNTcJCQkJYzQuNTYzLTEuNjM5LDcuMjQ2LTIuMTc2LDEwLjAwOC00LjE4YzIuNzYzLTIuMDA2LDMuNzI3LTkuOTY4LDMuNzI3LTkuOTY4TDM4LjQ0OCw0Mi4xNDF6Ii8+CQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2Utd2lkdGg6Mi4zNTQ7IiB4MT0iOTcuNzQ1IiB5MT0iMjcuMDExIiB4Mj0iMzkuMjQ5IiB5Mj0iNDQuNCIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMzNjM2MzY7c3Ryb2tlLXdpZHRoOjM7IiBkPSJNMzguNDQ4LDQyLjE0MWwxLjEwNCw5Ljk1bDE0Ljc5LTMuOTNsMS43MzcsMC4wMTcJCQkJYzAsMCwyMy43NDgtNi45MzEsMjguMzExLTguNTdjNC41NjMtMS42MzksNy4yNDYtMi4xNzYsMTAuMDA4LTQuMThjMi43NjMtMi4wMDYsMy43MjctOS45NjgsMy43MjctOS45NjhMMzguNDQ4LDQyLjE0MXoiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjQ1LjMyMzIiIHkxPSIzMS40MTE3IiB4Mj0iODUuMzQ3NyIgeTI9IjMxLjQxMTciPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRTNFMURFIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNEQkQ4RDUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4wNjMiIHN0eWxlPSJzdG9wLWNvbG9yOiNDQ0M5QzgiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4xODMzIiBzdHlsZT0ic3RvcC1jb2xvcjojQTVBM0E2Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjY0IiBzdHlsZT0ic3RvcC1jb2xvcjojODg4NjhDIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNTIyNSIgc3R5bGU9InN0b3AtY29sb3I6I0YzRjNGNCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjU4NDYiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUU0RTYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC43MDM5IiBzdHlsZT0ic3RvcC1jb2xvcjojQkZCREMwIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODY3IiBzdHlsZT0ic3RvcC1jb2xvcjojODI3RjgzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODc2NCIgc3R5bGU9InN0b3AtY29sb3I6IzdFN0I3RiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDBEMUQzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNBNkE4QUEiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMl8pOyIgZD0iTTU1LjM0NSw1OS40NzJsLTkuMDczLTIuMTc5bC0wLjk0OC0xNi43N2MwLDAsMjIuMTYtMjYuODcxLDI0LjEyNi0yOS40NDMJCQkJYzEuOTY3LTIuNTczLDIuMjk5LTIuNjQsNS42MDgtNS40ODFjMy4zMDQtMi44NDEsMTAuMjktMi4xODIsMTAuMjktMi4xODJMNTUuMzQ1LDU5LjQ3MnoiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRkZGRkZGO3N0cm9rZS13aWR0aDoyLjM1NDsiIGQ9Ik04My45NDksNS4xNjhjMCwwLTYuNTYyLDAtMTEuODkzLDUuODc4CQkJCWMtNS4zMzEsNS44NzgtMjYuNTYxLDMyLjUzOC0yNi41NjEsMzIuNTM4Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzM2MzYzNjtzdHJva2Utd2lkdGg6MzsiIGQ9Ik01NS4zNDUsNTkuNDcybC05LjA3My0yLjE3OWwtMC45NDgtMTYuNzcJCQkJYzAsMCwyMi4xNi0yNi44NzEsMjQuMTI2LTI5LjQ0M2MxLjk2Ny0yLjU3MywyLjI5OS0yLjY0LDUuNjA4LTUuNDgxYzMuMzA0LTIuODQxLDEwLjI5LTIuMTgyLDEwLjI5LTIuMTgyTDU1LjM0NSw1OS40NzJ6Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6I0MxMjcyRDsiIGQ9Ik0yMC41ODksNDAuMTU4YzMuNzM3LDEuMTgzLDEwLjk3NCwyLjM5MSwxNS4wNTgsMS45MzhjMS4zNDctMC4xNDgsMi43NDQtMC4xODgsMi43NDQtMC4xODgJCQkJbDEuMDMxLDEwLjY5MmMwLDAtMy41MDMsMC44MzgtNC41NDEsMC44ODJjLTEuMDM1LDAuMDQ3LTIuMzkxLDAuMzc2LTIuOTU5LDEuMTg1Yy0wLjU2NywwLjgxNC0yLjI0MiwzLjMyMS00LjM1MSw1LjA3NwkJCQljLTIuMjYyLDEuODkzLTQuMzgsNC40NDktMTIuMjQsNi42NzZjLTcuODU4LDIuMjMtMTAuOTg2LTIuNjA4LTEyLjA4Mi00LjY5MmMtMS4wOTMtMi4wODYtMi4yODEtNC4zMjUtMS4xOTctOS44MTcJCQkJYzEuMDgtNS40ODgsNi4zMzgtOC43OTEsOC40NzktMTAuMjIzQzEyLjU0Niw0MC4zNDEsMTYuODU0LDM4Ljk3NSwyMC41ODksNDAuMTU4eiBNNi42ODIsNTkuMjE1CQkJCWMxLjMxMSwzLjAyMSwzLjQ0Niw0LjE5Myw4LjIyNywxLjg2MmM0LjUxMi0yLjIwNiw5Ljc4Ni01LjQ2OSwxMS4yMDUtNy41MDNjMS40MTktMi4wMywxLjI5Ny0zLjY4NiwwLjU4LTUuMTU0CQkJCWMtMC43MjEtMS40NjktMi4zMTgtMy4yMTYtNi4yNzMtMy41OTZjLTMuOTU5LTAuMzg2LTQuNTI0LTAuNDQxLTguMTc4LDJjLTMuNjUsMi40NDUtMy43NDYsMy4xNTUtNS4yMjcsNS42NjkJCQkJQzUuNTMsNTUuMDAyLDYuMDI5LDU3LjcxMiw2LjY4Miw1OS4yMTV6Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6I0MxMjcyRDsiIGQ9Ik00OC42OTEsOTAuOTQ0Yy0xLjc0LDEuOTQxLTYuMTg1LDYuMzYtMTEuNTM3LDYuMTE3Yy01LjM0OC0wLjIzNC03LjEzMS0xLjk4Ny04Ljc5OS0zLjYwOAkJCQljLTEuNjYtMS42MTYtNS4zODMtNS45Ny0xLjQtMTMuNDFjMy45NzgtNy40NDEsNy4wMTgtOS4xMDQsOS4xNjQtMTAuODAyYzIuNDI2LTEuOTMyLDQuODc1LTIuODAzLDUuNzYzLTMuMTg0CQkJCWMwLjg5Mi0wLjM3OCwyLjY2NC0xLjM3MywyLjk1OC0yLjQxNmMwLjI5Ni0xLjA0Mi0wLjA4NC00LjcwOS0wLjA4NC00LjcwOWwxLjY0NC0xLjYxM2w4Ljg1MiwyLjA1NmMwLDAtMC4wODEsMS40Ny0xLjE4OCw0Ljk1NwkJCQljLTEuNTgsNC45OTItMS40MjksMTIuNzI5LTEuNTA0LDE2Ljc3MkM1Mi40ODIsODUuMzkyLDUwLjYzLDg4Ljc5LDQ4LjY5MSw5MC45NDR6IE0zOC4yMzIsOTIuMjY5CQkJCWMyLjY1Mi0xLjAwMiwzLjMzNy0wLjk1NSw2LjM3My00LjE5MWMzLjAzOS0zLjIzNiwzLjEtMy44MzIsMy41NTYtNy45NjFjMC40Ni00LjEzMy0wLjg0Ny02LjEzMS0yLjA3Mi03LjE2OQkJCQljLTEuMjI0LTEuMDM3LTIuNzQzLTEuNTAyLTQuOTM4LTAuNDdjLTIuMTkzLDEuMDM3LTYuMzI4LDUuNzY1LTkuMzE1LDkuOTM3Yy0zLjE2OSw0LjQxOS0yLjUwOSw2Ljg0NCwwLjA0NCw4LjgxMQkJCQlDMzMuMTQ3LDkyLjIwMSwzNS41OCw5My4yNjksMzguMjMyLDkyLjI2OXoiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDojRkNFRTIxO3N0cm9rZTojNjM1RTBEO3N0cm9rZS13aWR0aDoxLjQyODc7IiBkPSJNNTQuNzY4LDQyLjY4M2MxLjMwMiwxLjQ0MywxLjIzNCwzLjcyLTAuMTQ2LDUuMDgxCQkJCWMtMS4zODMsMS4zNjMtMy41NTcsMS4yOTktNC44NTQtMC4xNDFjLTEuMy0xLjQ0Ni0xLjIzMy0zLjcxOSwwLjE0Ni01LjA3OUM1MS4yOTcsNDEuMTc3LDUzLjQ3MSw0MS4yNDIsNTQuNzY4LDQyLjY4M3oiLz4JCQk8Zz4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6IzYzNUUwRDsiIHBvaW50cz0iNDguNzU0LDQ2LjEzNiA1NS44MjksNDYuMjM0IDU1Ljg4Miw0NC4yODMgNDguODEsNDQuMTg1IAkJCQkiLz4JCQk8L2c+CQk8L2c+CTwvZz4JPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzLjAyOTMiIHkxPSI0OC4zNjU1IiB4Mj0iMzcuNzc5MyIgeTI9IjU4LjMyOTkiPgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0EyMUE0OSIvPgkJPHN0b3AgIG9mZnNldD0iMC4yNCIgc3R5bGU9InN0b3AtY29sb3I6I0EyMTk0RSIvPgkJPHN0b3AgIG9mZnNldD0iMC4yNTI4IiBzdHlsZT0ic3RvcC1jb2xvcjojQTIxOTRFIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQzMjYiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUFDQUMiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNDY5MiIgc3R5bGU9InN0b3AtY29sb3I6I0Q2OTc5QyIvPgkJPHN0b3AgIG9mZnNldD0iMC41NjAyIiBzdHlsZT0ic3RvcC1jb2xvcjojQjQ2QTc5Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjY1MTYiIHN0eWxlPSJzdG9wLWNvbG9yOiM5ODQ0NUMiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNzQxOSIgc3R5bGU9InN0b3AtY29sb3I6IzgzMjY0NSIvPgkJPHN0b3AgIG9mZnNldD0iMC44MzA4IiBzdHlsZT0ic3RvcC1jb2xvcjojNzMxMTM1Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjkxNzYiIHN0eWxlPSJzdG9wLWNvbG9yOiM2QTA0MkIiLz4JCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NzAwMjgiLz4JPC9saW5lYXJHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7c3Ryb2tlOiM0QTA3MTY7c3Ryb2tlLXdpZHRoOjM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgZD0iTTIwLjU4OSw0MC4xNTgJCWMzLjczNywxLjE4MywxMC45NzQsMi4zOTEsMTUuMDU4LDEuOTM4YzEuMzQ3LTAuMTQ4LDIuNzQ0LTAuMTg4LDIuNzQ0LTAuMTg4bDEuMDMxLDEwLjY5MmMwLDAtMy41MDMsMC44MzgtNC41NDEsMC44ODIJCWMtMS4wMzUsMC4wNDctMi4zOTEsMC4zNzYtMi45NTksMS4xODVjLTAuNTY3LDAuODE0LTIuMjQyLDMuMzIxLTQuMzUxLDUuMDc3Yy0yLjI2MiwxLjg5My00LjM4LDQuNDQ5LTEyLjI0LDYuNjc2CQljLTcuODU4LDIuMjMtMTAuOTg2LTIuNjA4LTEyLjA4Mi00LjY5MmMtMS4wOTMtMi4wODYtMi4yODEtNC4zMjUtMS4xOTctOS44MTdjMS4wOC01LjQ4OCw2LjMzOC04Ljc5MSw4LjQ3OS0xMC4yMjMJCUMxMi41NDYsNDAuMzQxLDE2Ljg1NCwzOC45NzUsMjAuNTg5LDQwLjE1OHogTTYuNjgyLDU5LjIxNWMxLjMxMSwzLjAyMSwzLjQ0Niw0LjE5Myw4LjIyNywxLjg2MgkJYzQuNTEyLTIuMjA2LDkuNzg2LTUuNDY5LDExLjIwNS03LjUwM2MxLjQxOS0yLjAzLDEuMjk3LTMuNjg2LDAuNTgtNS4xNTRjLTAuNzIxLTEuNDY5LTIuMzE4LTMuMjE2LTYuMjczLTMuNTk2CQljLTMuOTU5LTAuMzg2LTQuNTI0LTAuNDQxLTguMTc4LDJjLTMuNjUsMi40NDUtMy43NDYsMy4xNTUtNS4yMjcsNS42NjlDNS41Myw1NS4wMDIsNi4wMjksNTcuNzEyLDYuNjgyLDU5LjIxNXoiLz4JPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzMS4zMjA5IiB5MT0iNzEuNDY1NyIgeDI9IjUzLjQ0MDkiIHkyPSI4Mi43MzYzIj4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMjFBNDkiLz4JCTxzdG9wICBvZmZzZXQ9IjAuMjQiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMjE5NEUiLz4JCTxzdG9wICBvZmZzZXQ9IjAuMjUyOCIgc3R5bGU9InN0b3AtY29sb3I6I0EyMTk0RSIvPgkJPHN0b3AgIG9mZnNldD0iMC40MzI2IiBzdHlsZT0ic3RvcC1jb2xvcjojRTVBQ0FDIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQ2OTIiIHN0eWxlPSJzdG9wLWNvbG9yOiNENjk3OUMiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNTYwMiIgc3R5bGU9InN0b3AtY29sb3I6I0I0NkE3OSIvPgkJPHN0b3AgIG9mZnNldD0iMC42NTE2IiBzdHlsZT0ic3RvcC1jb2xvcjojOTg0NDVDIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjc0MTkiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MzI2NDUiLz4JCTxzdG9wICBvZmZzZXQ9IjAuODMwOCIgc3R5bGU9InN0b3AtY29sb3I6IzczMTEzNSIvPgkJPHN0b3AgIG9mZnNldD0iMC45MTc2IiBzdHlsZT0ic3RvcC1jb2xvcjojNkEwNDJCIi8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojNjcwMDI4Ii8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pO3N0cm9rZTojNEEwNzE2O3N0cm9rZS13aWR0aDozO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik00OC42OTEsOTAuOTQ0CQljLTEuNzQsMS45NDEtNi4xODUsNi4zNi0xMS41MzcsNi4xMTdjLTUuMzQ4LTAuMjM0LTcuMTMxLTEuOTg3LTguNzk5LTMuNjA4Yy0xLjY2LTEuNjE2LTUuMzgzLTUuOTctMS40LTEzLjQxCQljMy45NzgtNy40NDEsNy4wMTgtOS4xMDQsOS4xNjQtMTAuODAyYzIuNDI2LTEuOTMyLDQuODc1LTIuODAzLDUuNzYzLTMuMTg0YzAuODkyLTAuMzc4LDIuNjY0LTEuMzczLDIuOTU4LTIuNDE2CQljMC4yOTYtMS4wNDItMC4wODQtNC43MDktMC4wODQtNC43MDlsMS42NDQtMS42MTNsOC44NTIsMi4wNTZjMCwwLTAuMDgxLDEuNDctMS4xODgsNC45NTdjLTEuNTgsNC45OTItMS40MjksMTIuNzI5LTEuNTA0LDE2Ljc3MgkJQzUyLjQ4Miw4NS4zOTIsNTAuNjMsODguNzksNDguNjkxLDkwLjk0NHogTTM4LjIzMiw5Mi4yNjljMi42NTItMS4wMDIsMy4zMzctMC45NTUsNi4zNzMtNC4xOTFjMy4wMzktMy4yMzYsMy4xLTMuODMyLDMuNTU2LTcuOTYxCQljMC40Ni00LjEzMy0wLjg0Ny02LjEzMS0yLjA3Mi03LjE2OWMtMS4yMjQtMS4wMzctMi43NDMtMS41MDItNC45MzgtMC40N2MtMi4xOTMsMS4wMzctNi4zMjgsNS43NjUtOS4zMTUsOS45MzcJCWMtMy4xNjksNC40MTktMi41MDksNi44NDQsMC4wNDQsOC44MTFDMzMuMTQ3LDkyLjIwMSwzNS41OCw5My4yNjksMzguMjMyLDkyLjI2OXoiLz48L2c+PC9zdmc+';
	d.CYCLOBUTANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSI5IiBmaWxsPSJub25lIiB4MT0iLTkiIHgyPSItMCIgeTE9IjAiICAgICAgLz48bGluZSB5Mj0iMCIgZmlsbD0ibm9uZSIgeDE9Ii0wIiB4Mj0iOSIgeTE9IjkiICAgICAgLz48bGluZSB5Mj0iLTkiIGZpbGw9Im5vbmUiIHgxPSI5IiB4Mj0iMCIgeTE9IjAiICAgICAgLz48bGluZSB5Mj0iMCIgZmlsbD0ibm9uZSIgeDE9IjAiIHgyPSItOSIgeTE9Ii05IiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.CYCLOHEPTANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSItNS42MTE0IiBmaWxsPSJub25lIiB4MT0iLTAiIHgyPSItNy4wMzY1IiB5MT0iLTkiICAgICAgLz48bGluZSB5Mj0iMi4wMDI3IiBmaWxsPSJub25lIiB4MT0iLTcuMDM2NSIgeDI9Ii04Ljc3NDQiIHkxPSItNS42MTE0IiAgICAgIC8+PGxpbmUgeTI9IjguMTA4NyIgZmlsbD0ibm9uZSIgeDE9Ii04Ljc3NDQiIHgyPSItMy45MDUiIHkxPSIyLjAwMjciICAgICAgLz48bGluZSB5Mj0iOC4xMDg3IiBmaWxsPSJub25lIiB4MT0iLTMuOTA1IiB4Mj0iMy45MDUiIHkxPSI4LjEwODciICAgICAgLz48bGluZSB5Mj0iMi4wMDI3IiBmaWxsPSJub25lIiB4MT0iMy45MDUiIHgyPSI4Ljc3NDQiIHkxPSI4LjEwODciICAgICAgLz48bGluZSB5Mj0iLTUuNjExNCIgZmlsbD0ibm9uZSIgeDE9IjguNzc0NCIgeDI9IjcuMDM2NSIgeTE9IjIuMDAyNyIgICAgICAvPjxsaW5lIHkyPSItOSIgZmlsbD0ibm9uZSIgeDE9IjcuMDM2NSIgeDI9Ii0wIiB5MT0iLTUuNjExNCIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.CYCLOHEXANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSI4LjUiIGZpbGw9Im5vbmUiIHgxPSItNy4zNjEyIiB4Mj0iLTAiIHkxPSI0LjI1IiAgICAgIC8+PGxpbmUgeTI9IjQuMjUiIGZpbGw9Im5vbmUiIHgxPSItMCIgeDI9IjcuMzYxMiIgeTE9IjguNSIgICAgICAvPjxsaW5lIHkyPSItNC4yNSIgZmlsbD0ibm9uZSIgeDE9IjcuMzYxMiIgeDI9IjcuMzYxMiIgeTE9IjQuMjUiICAgICAgLz48bGluZSB5Mj0iLTguNSIgZmlsbD0ibm9uZSIgeDE9IjcuMzYxMiIgeDI9IjAiIHkxPSItNC4yNSIgICAgICAvPjxsaW5lIHkyPSItNC4yNSIgZmlsbD0ibm9uZSIgeDE9IjAiIHgyPSItNy4zNjEyIiB5MT0iLTguNSIgICAgICAvPjxsaW5lIHkyPSI0LjI1IiBmaWxsPSJub25lIiB4MT0iLTcuMzYxMiIgeDI9Ii03LjM2MTIiIHkxPSItNC4yNSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.CYCLOOCTANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSI2LjM2NCIgZmlsbD0ibm9uZSIgeDE9Ii05IiB4Mj0iLTYuMzY0IiB5MT0iMCIgICAgICAvPjxsaW5lIHkyPSI5IiBmaWxsPSJub25lIiB4MT0iLTYuMzY0IiB4Mj0iLTAiIHkxPSI2LjM2NCIgICAgICAvPjxsaW5lIHkyPSI2LjM2NCIgZmlsbD0ibm9uZSIgeDE9Ii0wIiB4Mj0iNi4zNjQiIHkxPSI5IiAgICAgIC8+PGxpbmUgeTI9IjAiIGZpbGw9Im5vbmUiIHgxPSI2LjM2NCIgeDI9IjkiIHkxPSI2LjM2NCIgICAgICAvPjxsaW5lIHkyPSItNi4zNjQiIGZpbGw9Im5vbmUiIHgxPSI5IiB4Mj0iNi4zNjQiIHkxPSIwIiAgICAgIC8+PGxpbmUgeTI9Ii05IiBmaWxsPSJub25lIiB4MT0iNi4zNjQiIHgyPSIwIiB5MT0iLTYuMzY0IiAgICAgIC8+PGxpbmUgeTI9Ii02LjM2NCIgZmlsbD0ibm9uZSIgeDE9IjAiIHgyPSItNi4zNjQiIHkxPSItOSIgICAgICAvPjxsaW5lIHkyPSIwIiBmaWxsPSJub25lIiB4MT0iLTYuMzY0IiB4Mj0iLTkiIHkxPSItNi4zNjQiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.CYCLOPENTANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgICAgPjxsaW5lIHkyPSItMi43ODEyIiBmaWxsPSJub25lIiB4MT0iLTAiIHgyPSItOC41NTk1IiB5MT0iLTkiICAgICAgLz48bGluZSB5Mj0iNy4yODEyIiBmaWxsPSJub25lIiB4MT0iLTguNTU5NSIgeDI9Ii01LjI5MDEiIHkxPSItMi43ODEyIiAgICAgIC8+PGxpbmUgeTI9IjcuMjgxMiIgZmlsbD0ibm9uZSIgeDE9Ii01LjI5MDEiIHgyPSI1LjI5MDEiIHkxPSI3LjI4MTIiICAgICAgLz48bGluZSB5Mj0iLTIuNzgxMiIgZmlsbD0ibm9uZSIgeDE9IjUuMjkwMSIgeDI9IjguNTU5NSIgeTE9IjcuMjgxMiIgICAgICAvPjxsaW5lIHkyPSItOSIgZmlsbD0ibm9uZSIgeDE9IjguNTU5NSIgeDI9Ii0wIiB5MT0iLTIuNzgxMiIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.CYCLOPROPANE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwxMCkgcm90YXRlKDkwKSB0cmFuc2xhdGUoMiwwKSIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiAgICA+PGxpbmUgeTI9IjcuNzk0MiIgZmlsbD0ibm9uZSIgeDE9Ii05IiB4Mj0iNC41IiB5MT0iMCIgICAgICAvPjxsaW5lIHkyPSItNy43OTQyIiBmaWxsPSJub25lIiB4MT0iNC41IiB4Mj0iNC41IiB5MT0iNy43OTQyIiAgICAgIC8+PGxpbmUgeTI9IjAiIGZpbGw9Im5vbmUiIHgxPSI0LjUiIHgyPSItOSIgeTE9Ii03Ljc5NDIiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.DECREASE_CHARGE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBzdHJva2UtbGluZWNhcD0iYnV0dCIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2Utd2lkdGg9IjEuMiIgICAgPjxsaW5lIHkyPSIxMCIgZmlsbD0ibm9uZSIgeDE9IjYiIHgyPSIxNCIgeTE9IjEwIiAgICAgIC8+PGNpcmNsZSBmaWxsPSJub25lIiByPSI2IiBjeD0iMTAiIGN5PSIxMCIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.DISTANCE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHJlY3QgeD0iMS43NyIgeT0iODEuNjMzIiBzdHlsZT0iZmlsbDojRjc5MzFFO3N0cm9rZTojNzcxRTFFO3N0cm9rZS13aWR0aDozLjY2ODQ7IiB3aWR0aD0iOTYuMTk5IiBoZWlnaHQ9IjE2LjM2MyIvPgkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6My4wOTQxOyIgeDE9IjkuOTI3IiB5MT0iOTMuNjQxIiB4Mj0iOS45MjciIHkyPSI4My44OTgiLz4JCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjMuMDk0MTsiIHgxPSIxOS45NjYiIHkxPSI5MC4wNiIgeDI9IjE5Ljk2NiIgeTI9IjgzLjk1NyIvPgkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6My4wOTQxOyIgeDE9IjMwLjAwMiIgeTE9IjkzLjQ3NSIgeDI9IjMwLjAwMiIgeTI9IjgzLjc4MSIvPgkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6My4wOTQxOyIgeDE9IjQwLjAzMyIgeTE9IjkwLjA2IiB4Mj0iNDAuMDMzIiB5Mj0iODMuOTU3Ii8+CQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDozLjA5NDE7IiB4MT0iNTAuMDY5IiB5MT0iOTMuMzYyIiB4Mj0iNTAuMDY5IiB5Mj0iODMuOTU3Ii8+CQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDozLjA5NDE7IiB4MT0iNjAuMTA0IiB5MT0iOTAuMDYiIHgyPSI2MC4xMDQiIHkyPSI4My45NTciLz4JCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjMuMDk0MTsiIHgxPSI3MC4xNDEiIHkxPSI5My4zNjIiIHgyPSI3MC4xNDEiIHkyPSI4My45NTciLz4JCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjMuMDk0MTsiIHgxPSI4MC4xNzMiIHkxPSI5MC4wNiIgeDI9IjgwLjE3MyIgeTI9IjgzLjk1NyIvPgkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6My4wOTQxOyIgeDE9IjkwLjIwMyIgeTE9IjkzLjM2MiIgeDI9IjkwLjIwMyIgeTI9IjgzLjk1NyIvPgk8L2c+PC9nPjxnPgk8Zz4JCTxwYXRoIGQ9Ik00MC4zNjcsNTcuNDMybC01LjQyOSwxNi40MTdoLTYuOThsMTcuNzYxLTUyLjE5M2g4LjE0NGwxNy44MzksNTIuMTkzaC03LjIxM2wtNS41ODQtMTYuNDE3SDQwLjM2N3ogTTU3LjUwOCw1Mi4xNjYJCQlsLTUuMTE5LTE1LjAyM2MtMS4xNjMtMy40MDgtMS45MzgtNi41MDUtMi43MTQtOS41MjVINDkuNTJjLTAuNzc2LDMuMDk3LTEuNjI5LDYuMjcyLTIuNjM3LDkuNDQ3bC01LjExOSwxNS4xMDFINTcuNTA4eiIvPgk8L2c+PC9nPjxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjUuMzk3MzsiIGQ9Ik02MS4xNTcsMTMuNDdjMCw1Ljk2LTQuODM0LDEwLjc5NC0xMC43OTQsMTAuNzk0CWMtNS45NjMsMC0xMC43OTctNC44MzUtMTAuNzk3LTEwLjc5NGMwLTUuOTYsNC44MzQtMTAuNzk1LDEwLjc5Ny0xMC43OTVDNTYuMzIzLDIuNjc1LDYxLjE1Nyw3LjUxLDYxLjE1NywxMy40N3oiLz48L3N2Zz4=';
	d.ERASE = 'PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjwvZGVmcz48Zz48cGF0aCBkPSJNIDE5Ljg5NTAwMDAwMDAwMDAwMyA2LjEwNSBMIDYuMTA1IDE5Ljg5NTAwMDAwMDAwMDAwMyBNIDYuMTA1IDYuMTA1IEwgMTkuODk1MDAwMDAwMDAwMDAzIDE5Ljg5NTAwMDAwMDAwMDAwMyBNIDIyLjg1IDEzIEMgMjIuODUgMTguNDQwMDA0Nzg1ODMzMzEzIDE4LjQ0MDAwNDc4NTgzMzMxNyAyMi44NSAxMyAyMi44NSA3LjU1OTk5NTIxNDE2NjY4NyAyMi44NSAzLjE1MDAwMDAwMDAwMDAwMiAxOC40NDAwMDQ3ODU4MzMzMTcgMy4xNTAwMDAwMDAwMDAwMDA0IDEzLjAwMDAwMDAwMDAwMDAwMiAzLjE1MDAwMDAwMDAwMDAwMDQgNy41NTk5OTUyMTQxNjY2ODcgNy41NTk5OTUyMTQxNjY2ODMgMy4xNTAwMDAwMDAwMDAwMDIgMTIuOTk5OTk5OTk5OTk5OTk4IDMuMTUwMDAwMDAwMDAwMDAwNCAxOC40NDAwMDQ3ODU4MzMzMTMgMy4xNTAwMDAwMDAwMDAwMDA0IDIyLjg1IDcuNTU5OTk1MjE0MTY2NjgzIDIyLjg1IDEyLjk5OTk5OTk5OTk5OTk5OCIgc3Ryb2tlPSIjNDQ0NDQ0IiBzdHJva2Utd2lkdGg9IjIuMyIgZmlsbD0ibm9uZSI+PC9wYXRoPjwvZz48L3N2Zz4=';
	d.FLIP_HOR = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6IzFCNzVCODsiIGQ9Ik04Mi44MjgsNjIuNjQ4TDU1LjQzLDUzLjA3VjIyLjY0M2wyNy4zOTgtOS41NzhsMTYuNzQsMjQuNzkyTDgyLjgyOCw2Mi42NDhMODIuODI4LDYyLjY0OHoJCQkgTTYyLjQ5OCw0OC4wNTNsMTcuNTIxLDYuMTI1bDExLjAyMS0xNi4zMjFMODAuMDE5LDIxLjUzNUw2Mi40OTgsMjcuNjZWNDguMDUzTDYyLjQ5OCw0OC4wNTN6Ii8+CTwvZz4JPGc+CQk8cGF0aCBzdHlsZT0iZmlsbDojMUI3NUI4OyIgZD0iTTE4LjAzOSw2Mi42NDhMMS4yOTcsMzcuODU2bDE2Ljc0Mi0yNC43OTJsMjcuMzk5LDkuNTc4VjUzLjA3TDE4LjAzOSw2Mi42NDhMMTguMDM5LDYyLjY0OHoJCQkgTTkuODI3LDM3Ljg1NmwxMS4wMjIsMTYuMzIxbDE3LjUyMS02LjEyNVYyNy42NmwtMTcuNTIxLTYuMTI1TDkuODI3LDM3Ljg1Nkw5LjgyNywzNy44NTZ6Ii8+CTwvZz4JPGc+CQk8cGF0aCBkPSJNNTIuODY4LDY4LjQyOWgtNS4xODdWNTQuOTQ0aDUuMTg3VjY4LjQyOUw1Mi44NjgsNjguNDI5eiBNNTIuODY4LDQxLjQ2aC01LjE4N1YyNy45NzVoNS4xODdWNDEuNDZMNTIuODY4LDQxLjQ2egkJCSBNNTIuODY4LDE0LjQ5aC01LjE4N1YxLjAwNmg1LjE4N1YxNC40OUw1Mi44NjgsMTQuNDl6Ii8+CTwvZz4JPGc+CQk8cG9seWdvbiBwb2ludHM9IjU5LjUyNyw3Ny41MDcgOTEuNjgyLDY2LjI2NiA4My40MTQsOTguMzgxIAkJIi8+CTwvZz4JPGc+CQk8cGF0aCBkPSJNNDYuODEyLDk5LjYzNGMtMi4wODYsMC00LjI4Ny0wLjEwMS02LjYxMi0wLjMxOEMyMC40MTcsOTcuNDYsNy43OCw4Mi4xOTEsNy4yNTEsODEuNTQzbDYuOTk0LTUuNjkzCQkJYzAuMSwwLjEyMSwxMC44NTUsMTIuOTkyLDI2Ljc5NywxNC40ODdjMjEuNzU2LDIuMDQxLDMwLjAwNS03Ljg5MiwzMC4wODMtNy45OTJsNy4xNjUsNS40NzcJCQlDNzcuODg5LDg4LjM0Niw2OC45ODEsOTkuNjM0LDQ2LjgxMiw5OS42MzRMNDYuODEyLDk5LjYzNHoiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.FLIP_VER = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6IzFCNzVCODsiIGQ9Ik01My4yMjEsNDQuODdIMjIuNzkzbC05LjU3OC0yNy4zOThsMjQuNzkyLTE2Ljc0bDI0Ljc5MiwxNi43NEw1My4yMjEsNDQuODdMNTMuMjIxLDQ0Ljg3egkJCSBNMjcuODEsMzcuODAyaDIwLjM5M2w2LjEyNC0xNy41MkwzOC4wMDcsOS4yNjFMMjEuNjg2LDIwLjI4MkwyNy44MSwzNy44MDJMMjcuODEsMzcuODAyeiIvPgk8L2c+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6IzFCNzVCODsiIGQ9Ik0zOC4wMDcsOTkuMDAzTDEzLjIxNSw4Mi4yNjFsOS41NzgtMjcuMzk4aDMwLjQyOGw5LjU3OCwyNy4zOThMMzguMDA3LDk5LjAwM0wzOC4wMDcsOTkuMDAzegkJCSBNMjEuNjg2LDc5LjQ1MWwxNi4zMjEsMTEuMDIybDE2LjMyMS0xMS4wMjJsLTYuMTI1LTE3LjUyMUgyNy44MUwyMS42ODYsNzkuNDUxTDIxLjY4Niw3OS40NTF6Ii8+CTwvZz4JPGc+CQk8cGF0aCBkPSJNNjguNTgsNTIuNjE4SDU1LjA5NnYtNS4xODZINjguNThWNTIuNjE4TDY4LjU4LDUyLjYxOHogTTQxLjYxLDUyLjYxOEgyOC4xMjV2LTUuMTg2SDQxLjYxVjUyLjYxOEw0MS42MSw1Mi42MTh6CQkJIE0xNC42NDEsNTIuNjE4SDEuMTU2di01LjE4NmgxMy40ODRWNTIuNjE4TDE0LjY0MSw1Mi42MTh6Ii8+CTwvZz4JPGc+CQk8cG9seWdvbiBwb2ludHM9Ijc3LjY1Niw0MC43NzMgNjYuNDE2LDguNjE4IDk4LjUzMSwxNi44ODYgCQkiLz4JPC9nPgk8Zz4JCTxwYXRoIGQ9Ik04MS42OTMsOTMuMDQ5TDc2LDg2LjA1NWMwLjEyMS0wLjEsMTIuOTkyLTEwLjg1NSwxNC40ODgtMjYuNzk3YzIuMDQxLTIxLjc2Mi03Ljg5My0zMC4wMDYtNy45OTQtMzAuMDgzbDUuNDc3LTcuMTY0CQkJYzAuNTc0LDAuNDM4LDE0LjAzMSwxMS4wNTcsMTEuNDk2LDM4LjA4OUM5Ny42MDksNzkuODg0LDgyLjM0Miw5Mi41MjEsODEuNjkzLDkzLjA0OUw4MS42OTMsOTMuMDQ5eiIvPgk8L2c+PC9nPjwvc3ZnPg==';
	d.FLUORINE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMTQ0LDIyNCw4MCkiIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGZvbnQtZmFtaWx5PSImYXBvcztMdWNpZGEgR3JhbmRlJmFwb3M7IiBzdHJva2U9InJnYigxNDQsMjI0LDgwKSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiAgICA+PHBhdGggZD0iTTcuMzA1NyAxNSBMNy4zMDU3IDQuODgyOCBMMTIuOTU5IDQuODgyOCBMMTIuOTU5IDUuOTU2MSBMOC43NDEyIDUuOTU2MSBMOC43NDEyIDkuMzQ2NyBMMTIuMjgyMiA5LjM0NjcgTDEyLjI4MjIgMTAuNDA2MiBMOC43NDEyIDEwLjQwNjIgTDguNzQxMiAxNSBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.HYDROGEN = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iJmFwb3M7THVjaWRhIEdyYW5kZSZhcG9zOyIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiAgICA+PHBhdGggZD0iTTYuMzA1NyAxNSBMNi4zMDU3IDQuODgyOCBMNy43NDEyIDQuODgyOCBMNy43NDEyIDkuMTQ4NCBMMTIuNTUzNyA5LjE0ODQgTDEyLjU1MzcgNC44ODI4IEwxMy45ODkzIDQuODgyOCBMMTMuOTg5MyAxNSBMMTIuNTUzNyAxNSBMMTIuNTUzNyAxMC4yMjE3IEw3Ljc0MTIgMTAuMjIxNyBMNy43NDEyIDE1IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.INCREASE_CHARGE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBzdHJva2UtbGluZWNhcD0iYnV0dCIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgY29sb3ItcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBzdHJva2Utd2lkdGg9IjEuMiIgICAgPjxsaW5lIHkyPSIxMCIgZmlsbD0ibm9uZSIgeDE9IjYiIHgyPSIxNCIgeTE9IjEwIiAgICAgIC8+PGxpbmUgeTI9IjE0IiBmaWxsPSJub25lIiB4MT0iMTAiIHgyPSIxMCIgeTE9IjYiICAgICAgLz48Y2lyY2xlIGZpbGw9Im5vbmUiIHI9IjYiIGN4PSIxMCIgY3k9IjEwIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.IODINE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMTQ4LDAsMTQ4KSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDE0OCwwLDE0OCkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik05LjI5ODggMTUgTDkuMjk4OCA0Ljg4MjggTDEwLjczNDQgNC44ODI4IEwxMC43MzQ0IDE1IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
    d.LASSO = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGc+PHBhdGggZD0iTSAyMi44NSAxMS41MjI0OTk5OTk5OTk5OTkgQyAyMi44NSAxNS4zMzA1MDMzNTAwODMzMTkgMTguNDQwMDA0Nzg1ODMzMzE3IDE4LjQxNzUgMTMgMTguNDE3NSA3LjU1OTk5NTIxNDE2NjY4NyAxOC40MTc1IDMuMTUwMDAwMDAwMDAwMDAyIDE1LjMzMDUwMzM1MDA4MzMyIDMuMTUwMDAwMDAwMDAwMDAwNCAxMS41MjI0OTk5OTk5OTk5OTkgMy4xNTAwMDAwMDAwMDAwMDA0IDcuNzE0NDk2NjQ5OTE2NjggNy41NTk5OTUyMTQxNjY2ODMgNC42Mjc1IDEyLjk5OTk5OTk5OTk5OTk5OCA0LjYyNzQ5OTk5OTk5OTk5OTUgMTguNDQwMDA0Nzg1ODMzMzEzIDQuNjI3NDk5OTk5OTk5OTk5NSAyMi44NSA3LjcxNDQ5NjY0OTkxNjY3OCAyMi44NSAxMS41MjI0OTk5OTk5OTk5OTcgTSA1LjEyIDIxLjM3MjUgTCA4LjA3NSAxNy40MzI1IiBzdHJva2U9IiM0NDQ0NDQiIHN0cm9rZS13aWR0aD0iMi4zIiBmaWxsPSJub25lIj48L3BhdGg+PC9nPjwvc3ZnPg==';
	d.LASSO_SHAPES = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6NC4wNTMxO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik05Ny42NDUsMjUuMzEJCQlDOTUuNzkxLDExLjcyNyw3OS4zODksMi4yMyw1Ny43NDIsMi4yM2MtMy44MzUsMC03Ljc2NywwLjMwNC0xMS42ODQsMC44OTdDMTkuMzcsNy4xNzcsMC4yMTksMjMuMjYsMi40NjMsMzkuNzQJCQljMC42MDcsNC40NzMsMi44MTMsOC40ODksNi4yNCwxMS44NzdjLTEuNTk5LDEuMDQxLTMuMTc0LDIuNDQtNC4yOTMsNC40MTNjLTEuOTM3LDMuNDA5LTIuMTM4LDkuODc2LDAuNzI4LDEyLjUwNAkJCWM2LjAwNyw1LjQ5MSwxMS44MDIsNS42MzksMTUuOTc0LDQuNTU2YzAuNjU1LDIuMjA2LDEuMDUyLDYuMjktMi45MjUsMTAuNDgzYy02Ljc1NCw3LjEzMy0xMy45NTgsNy41ODUtMTQuMDQ2LDcuNjE5CQkJYy0xLjM5NSwwLjU4OS0yLjAxLDMuMzY1LTEuNDUzLDQuODM3YzAuNDI2LDEuMTE1LDEuNDUzLDEuODAzLDIuNTI5LDEuODAzYzAuMzMzLDAsMC42NzUtMC4wNjgsMS4wMDctMC4yMDYJCQljMC4zOTYtMC4xNjYsOS42OTQtMi4yODQsMTcuMjU5LTEwLjI4MmM1LjgtNi4xMTksNS4zMzUtMTMuMDU5LDMuODQ5LTE3LjI0bDAsMGMtMC4wMS0wLjAxLDUuNDQ4LTIuNzc2LDYuNzU0LTcuNzc4CQkJYzIuNjU1LDAuMzIsNS40MTgsMC40OTYsOC4yOCwwLjQ5NmMzLjgzNCwwLDcuNzY2LTAuMzA0LDExLjY3OS0wLjg5NkM4MC43MzcsNTcuODgsOTkuODg1LDQxLjc5Niw5Ny42NDUsMjUuMzF6IE0yNi40MTMsNjIuNzQ4CQkJYy0wLjY5OSwxLjU2OC0yLjYxMSwyLjIzNS0zLjc5LDIuNmwtNC4xODEtMC4zODRjLTYuMTE5LTEuNTkzLTQuMTU4LTYuODExLTMuNDc4LTguNjAyYzMuMzk4LDEuOTczLDcuMzksMy41MzYsMTEuODIsNC42MzYJCQlDMjYuNzI2LDYxLjU5NSwyNi42NjMsNjIuMTkzLDI2LjQxMyw2Mi43NDh6IE01My4xODksNTUuNjAzYy0zLjU2MSwwLjU0LTcuMTMxLDAuODE1LTEwLjYyNCwwLjgxNQkJCWMtMy4yNDcsMC02LjM1Ny0wLjI0Ni05LjMwNi0wLjdjLTAuNjU1LTEuMzU0LTEuNjI4LTIuNzk2LTMuMDE4LTQuMzE1Yy0zLjMyNS0zLjYyLTkuNjI5LTQuNzc2LTE0LjU3OC0yLjUyNmwtMC4xMzMsMC4wMjQJCQljLTMuNjgzLTIuODE2LTYuMDMtNi4yNzctNi41NjQtMTAuMTQxQzcuMjcxLDI2LjI1MSwyNC42NDMsMTIuODIxLDQ2LjkxNCw5LjQ0N2MzLjU2NS0wLjU0LDcuMTM2LTAuODE0LDEwLjYyMy0wLjgxNAkJCWMxOC4wNywwLDMyLjE5OSw3LjQzNCwzMy41OTgsMTcuNjYyQzkyLjgzNywzOC44MSw3NS40NjEsNTIuMjI2LDUzLjE4OSw1NS42MDN6Ii8+CQk8Zz4JCQk8Zz4JCQkJPHBhdGggc3R5bGU9ImZpbGw6I0Y3QUIxRTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6Mi4yMzc1OyIgZD0iTTUuMjE3LDk3LjgzMmMtMS4wNzYsMC0yLjEwMy0wLjY4OC0yLjUyOS0xLjgwMwkJCQkJYy0wLjU1Ny0xLjQ3MiwwLjA1OC00LjI0OCwxLjQ1My00LjgzN2MwLjA4OC0wLjAzNCw3LjI5Mi0wLjQ4NiwxNC4wNDYtNy42MTljNS40OTgtNS44MDcsMi42NS0xMS40NDksMi4yNzktMTIuMTA2CQkJCQljLTAuNzU4LTEuMzU4LDAuOTE1LTMuNjYzLDIuMjAxLTQuNDgyYzEuMjc3LTAuODA4LDIuOTM1LTAuMzkzLDMuNzE4LDAuOTUxYzIuMDI5LDMuNTEyLDQuMDQ4LDEyLjA3Ny0yLjkwMSwxOS40MDgJCQkJCUMxNS45MTcsOTUuMzQyLDYuNjIsOTcuNDYsNi4yMjQsOTcuNjI2QzUuODkyLDk3Ljc2NCw1LjU0OSw5Ny44MzIsNS4yMTcsOTcuODMyTDUuMjE3LDk3LjgzMnogTTQyLjM2Niw2Mi44MjEJCQkJCWMtMjEuNjQ2LDAtMzguMDU5LTkuNDg4LTM5LjkwMy0yMy4wODFDMC4yMTksMjMuMjYsMTkuMzcsNy4xNzcsNDYuMDU4LDMuMTI2YzMuOTE3LTAuNTkzLDcuODQ5LTAuODk3LDExLjY4NC0wLjg5NwkJCQkJYzIxLjY0NywwLDM4LjA0OSw5LjQ5OCwzOS45MDIsMjMuMDgxYzIuMjQsMTYuNDg1LTE2LjkwNywzMi41NjktNDMuNiwzNi42MTRDNTAuMTMyLDYyLjUxOCw0Ni4yLDYyLjgyMSw0Mi4zNjYsNjIuODIxCQkJCQlMNDIuMzY2LDYyLjgyMXogTTU3LjUzNyw4LjYzM2MtMy40ODcsMC03LjA1OCwwLjI3NS0xMC42MjMsMC44MTRDMjQuNjQzLDEyLjgyMSw3LjI3MSwyNi4yNTEsOC45NjcsMzguNzYJCQkJCWMxLjM5OSwxMC4yMzQsMTUuNTIzLDE3LjY1OCwzMy41OTksMTcuNjU4YzMuNDkyLDAsNy4wNjMtMC4yNzUsMTAuNjI0LTAuODE1YzIyLjI3MS0zLjM3NywzOS42NDctMTYuNzkzLDM3Ljk0NS0yOS4zMDgJCQkJCUM4OS43MzYsMTYuMDY3LDc1LjYwNyw4LjYzMyw1Ny41MzcsOC42MzNMNTcuNTM3LDguNjMzeiIvPgkJCTwvZz4JCQk8Zz4JCQkJPHBhdGggc3R5bGU9ImZpbGw6I0Y3QUIxRTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6Mi4yMzc1OyIgZD0iTTUuMTM4LDY4LjUzNEMyLjI3Miw2NS45MDYsMi40NzMsNTkuNDM5LDQuNDEsNTYuMDMJCQkJCWMzLjMzLTUuODU1LDEwLjYzNy03LjAwMywxMC45NTEtNy4wOTZsMC4zMDMtMC4wNThjNC45NDktMi4yNSwxMS4yNTMtMS4wOTQsMTQuNTc4LDIuNTI2CQkJCQljMTAuNzg1LDExLjc4My0yLjkyOSwxOC42ODctMi45MSwxOC43MDFDMjcuMzMyLDcwLjEwNCwxNi41ODcsNzkuMDA4LDUuMTM4LDY4LjUzNHogTTE0Ljk2NCw1Ni4zNTcJCQkJCWMtMC43OTgsMi4xLTMuNCw4LjkzOSw3LjM5LDkuMDgzYzEuMTM1LTAuMzU0LDMuMzExLTEuMDExLDQuMDU5LTIuNjkyYzEuMjI3LTIuNzYyLTAuMjItNi41MjYtMS4yMjMtNy4zNTUJCQkJCUMxOC41MDQsNDkuNzkzLDE1LjAyMiw1Ni4yMTIsMTQuOTY0LDU2LjM1N3oiLz4JCQk8L2c+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTM2LjU2MSw2Mi41ODZjMCwwLDUuMjg3LTEuMDExLDUuODA2LTUuNTEyIi8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTQ5LjY0NCw2My4yMzNjMCwwLDYuNTQzLTAuNDQ3LDUuMzYtNy4yODYiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNNjYuNTg5LDU5LjA3YzAsMCwzLjUxNy0yLjI4LDIuMzE4LTYuNjQiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNNzguNzQyLDUyLjg5N2MwLDAsNC42NTYtMC42NDMsMS41OC02Ljk2MyIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik05MC44MDgsNDQuNzcyYzAsMCwxLjk1Ni01LjcwMy0yLjY2MS03LjYyNiIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik05Ny41ODEsMzAuMjU3YzAsMC0xLjEyNC02LjE1My02LjAwNS01LjIxOCIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik05MS43MjcsMTMuMTg0YzAsMC01LjEwNS0xLjMzMy02LjEyMiwzLjc5Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTgxLjM1OCw2LjU4NGMwLDAtNS44OTctMS4xNjctNS41OCw0LjA2NCIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik02Ny4wMDUsMy4wNjJjMCwwLTUuOTY2LDAuNjYyLTQuMjU0LDUuNTc1Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTUyLjE1MSwyLjM5NWMwLDAtNS43MjcsMS45NjItNC4wMDUsNi44NzYiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMzguMTUsNC42MjdjMCwwLTQuODkxLDIuOTc2LTIuMjIxLDcuNDA0Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTI1LjI1OCw5Ljc0MmMwLDAtNS4zOTQsMi43ODYtMi4xNzYsNi43ODEiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMTMuODE5LDE2LjkyNWMwLDAtNC4xNTIsNC41OSwwLjE3MSw3LjE2NSIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik00LjU4MSwyOS4yNzFjMCwwLTAuNjA2LDYuMTAxLDQuMzMzLDYuNTcyIi8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTQuMTExLDQ1LjE1YzAsMCwzLjcyMiw0Ljk3Nyw2Ljc0LDAuODA4Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTIzLjMwOCw1NC4zNzNjMCwwLDQuNjYsNi4yMTIsOC40MjYsMS4wMDQiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMjguMjA3LDc1LjgzMWMwLDAtNC44MDctMy44MDItNi43MDksMS4wMzQiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMjIuOTE2LDg4Ljc2MmMwLDAsMS4xNTktNS4yNDgtMy42NjgtNi40NDQiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMTIuNjgsOTYuNTYyYzAsMCwzLjU5OS01LjA4MS0wLjk4My03LjA5Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6MC45MzIzOyIgZD0iTTIyLjM1NCw2NS40NGMwLDAtMC45NzMsNi41MjksNC45NzksNC42NjMiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojNTUyRjAyO3N0cm9rZS13aWR0aDowLjkzMjM7IiBkPSJNMTAuMTg2LDY0LjM4MWMwLDAtMy45NzIsNi4zNCwyLjA2OSw3Ljg0MSIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiM1NTJGMDI7c3Ryb2tlLXdpZHRoOjAuOTMyMzsiIGQ9Ik04Ljg5NCw1Ny44MjljMCwwLTUuNTQ2LTIuNDIyLTYuMTAzLDQuMTAxIi8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6Mi4yMzc1O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik0xMC4wODMsNjQuMTk0CQkJCWMwLDAsNi4xMTMsNS4xMDQsMTMuMDkyLDEuMjA3Ii8+CQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzU1MkYwMjtzdHJva2Utd2lkdGg6Mi4yMzc1O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik05LjYyOCw2My45NQkJCQljLTIuOTYzLTIuOTU3LTEuODI5LTkuODg4LDQuMjg0LTE0LjE0OCIvPgkJPC9nPgk8L2c+CTxnPgkJPGc+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzMS41NDc5IiB5MT0iNjQuNjY3MiIgeDI9Ijk2LjEyMyIgeTI9IjY0LjY2NzIiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMzZCRDAwIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMDU2NyIgc3R5bGU9InN0b3AtY29sb3I6IzJCQkMxOCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjE4MjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNEJCNDkiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4yNzc2IiBzdHlsZT0ic3RvcC1jb2xvcjojMDVCQTY4Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMzMxMyIgc3R5bGU9InN0b3AtY29sb3I6IzAwQkE3MyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjM5MDgiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMUFGNjAiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC41MTA4IiBzdHlsZT0ic3RvcC1jb2xvcjojMDI5NDJGIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNjEzNSIgc3R5bGU9InN0b3AtY29sb3I6IzA0N0EwMCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjcyNTYiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNDc4MDMiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC44MTU2IiBzdHlsZT0ic3RvcC1jb2xvcjojMDM3MTBEIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODk3OSIgc3R5bGU9InN0b3AtY29sb3I6IzAyNjUxRSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjk3NTIiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMTU1MzYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNEYzRiIvPgkJCTwvbGluZWFyR3JhZGllbnQ+CQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8xXyk7c3Ryb2tlOiMwMDY4Mzc7c3Ryb2tlLXdpZHRoOjIuODUwNjsiIHBvaW50cz0iOTYuMTIzLDk0LjIwMyAzMS41NDgsOTQuMjAzIDYzLjg0LDM1LjEzMSAJCQkJNjMuODQsMzUuMTMxIAkJCSIvPgkJCTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojOENDNjNGO3N0cm9rZS13aWR0aDo0LjAxMTc7IiBwb2ludHM9IjY0LjU3NCwzOS45NTcgMzYuOTcyLDkxLjYwMSA5NC41ODgsOTEuNzAzIAkJCSIvPgkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDY4Mzc7c3Ryb2tlLXdpZHRoOjQuMjQ2OTsiIHBvaW50cz0iOTYuMTIzLDk0LjIwMyAzMS41NDgsOTQuMjAzIDYzLjg0LDM1LjEzMSA2My44NCwzNS4xMzEgCQkJCQkJCSIvPgkJPC9nPgk8L2c+PC9nPjwvc3ZnPg==';
	d.MARQUEE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNC42NzA5IiB5MT0iNDkuODc3NCIgeDI9Ijk0LjU5MjgiIHkyPSI0OS44Nzc0Ij4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3M0MyRjEiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNSIgc3R5bGU9InN0b3AtY29sb3I6IzAwQUNFQiIvPgkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNzNBNiIvPgk8L2xpbmVhckdyYWRpZW50Pgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzFfKTtzdHJva2U6IzAwNkZGRjtzdHJva2Utd2lkdGg6MjsiIGQ9Ik05NC41OTMsOTQuODc1aC0xNC41M3YtNC42ODhoOS44NDN2LTguOTA2aDQuNjg4Vjk0Ljg3NQkJTDk0LjU5Myw5NC44NzV6IE02MC44NDcsOTQuODc1SDQwLjIyM3YtNC42ODhoMjAuNjI0Vjk0Ljg3NUw2MC44NDcsOTQuODc1eiBNOTQuNTkzLDYwLjY1N2gtNC42ODhWNDAuMDM0aDQuNjg4VjYwLjY1NwkJTDk0LjU5Myw2MC42NTd6IE05NC41OTMsMTkuNDFoLTQuNjg4VjkuNTY2aC05Ljg0M1Y0Ljg4aDE0LjUzVjE5LjQxTDk0LjU5MywxOS40MXogTTQuNjcxLDk0Ljg3NVY4MS4yODFoNC42ODh2OC45MDZoOS44NDN2NC42ODgJCUg0LjY3MUw0LjY3MSw5NC44NzV6IE00LjY3MSw2MC42NTdWNDAuMDM0aDQuNjg4djIwLjYyM0g0LjY3MUw0LjY3MSw2MC42NTd6IE00LjY3MSwxOS40MVY0Ljg4aDE0LjUzdjQuNjg2SDkuMzU4djkuODQ0SDQuNjcxCQlMNC42NzEsMTkuNDF6IE02My4xODgsOS41NjZINDIuNTY0VjQuODhoMjAuNjI0VjkuNTY2TDYzLjE4OCw5LjU2NnoiLz48L2c+PC9zdmc+';
	d.MOVE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGRlZnM+CQkJPGVsbGlwc2UgaWQ9IlNWR0lEXzFfIiBjeD0iNTMuMDIzIiBjeT0iMzkuNjAyIiByeD0iNjIuNzQiIHJ5PSI2MC4yNjYiLz4JCTwvZGVmcz4JCTxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzFfIiAgc3R5bGU9Im92ZXJmbG93OnZpc2libGU7Ii8+CQk8L2NsaXBQYXRoPgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzLjc4NTYiIHkxPSI2Ni42NzI2IiB4Mj0iOTIuNjgyOCIgeTI9IjY2LjY3MjYiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNERUFCODgiLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQzc4QTYyIi8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImNsaXAtcGF0aDp1cmwoI1NWR0lEXzJfKTtmaWxsOnVybCgjU1ZHSURfM18pOyIgZD0iTTI5Ljg4Nyw2My40MWMtMS43MTgtMC44MjktNC4xMDItMy40MzctNi4xNTctNi42NzkJCQljLTEuNDc4LTIuMzQ2LTMuMTczLTUuMTk0LTUuNzA4LTguMzM5Yy0yLjUzNi0zLjEzMy05LjM2NC04LjY3Mi0xMy41MzEtNC4yMTFjLTIuMjUxLDIuNDA1LDEuNTcxLDUuMDUzLDEuOTk4LDUuNjc2CQkJYzUuNTM5LDcuOSw3Ljk2OSwxNC43NTUsMTEuODE3LDIxLjg5NGMzLjg1MSw3LjE0Miw4LjkxMywxMy43MjMsMTQuNjIzLDE4Ljc4MWMzLjExNSwyLjczNi05LjEwNCwzNC43MzQtMy44ODYsMzYuNDc4CQkJYzQuNzg3LDEuNTkyLDIzLjA5LDExLjkxOCwzMy41MjctMy4xMDFjMS4zMDEtMS44NjUsNC41OS0yOC45NTUsNi43NzYtMzAuNjI1YzguNDg2LTYuNDU5LDEyLjA0My0yOS41MiwxMS45NjktMzIuMzk1CQkJYy0wLjA3NC0yLjg3NCw0LjkyNS0xMy4wNTEsNS41MTUtMTUuODg4YzAuNTc2LTIuNzk0LDYuNjQzLTE0LjI4MSw1Ljc2OC0xNy41ODNjLTAuNjg1LTIuNjAxLTMuMjQyLTQuMTAyLTUuNDQ2LTIuMzM3CQkJYy0yLjIxOCwxLjc2Ny00LjYwNCw4LjI2Ni02LjQ3OCwxMi43MzNjLTEuODc0LDQuNDY1LTUuNTY3LDEyLjc2My03LjQ4NSwxMi44OTNjLTEuNzgyLDAuMTE4LTIuMzY3LTEuNzg2LTIuMjY3LTQuNDA2CQkJYzAuMTAyLTIuNjE5LDIuMDk4LTI5LjA2NSwxLjY4My0zMi40NWMtMC40MjItMy4zODUtMS4xNTEtNi4yOTktNC4xMDQtNi41MzdjLTIuNDY5LTAuMTg4LTQuNTg2LDEuMDgyLTUuMzMyLDkuOTU0CQkJYy0wLjc1Miw4Ljg3My0xLjM0OCwyMy4zMjMtMS42MzUsMjYuNzgxYy0wLjM5LDQuODMtMS44NTEsNC43MDMtMi44Niw0LjUwMWMtMC42MDMtMC4xMTktMS42NTgtMS40NzUtMS42MjgtNC43NjkJCQljMC4wMS0zLjMwMi0xLjkxMy0zMi4wMTgtMi4xNTktMzUuMTQ1Yy0wLjI0LTMuMTMzLTAuODY1LTcuMTg5LTQuMTI2LTcuMjM5Yy01LjI2MS0wLjA4Mi01LjIxNCw1LjU5OC01LjA3OCw5Ljc3NgkJCWMwLjE4NCw0Ljk5NiwxLjcwNiwyMy4wMDYsMS43ODcsMjYuOTczYzAuMSw0LjY3LTAuMTk0LDcuMjU0LTIuMDU5LDYuODc5Yy0xLjU4MS0wLjMyLTIuMDQtMy43NDYtMi42LTcuNTc2CQkJYy0wLjQzNy0zLjEwMi00LjI0OC0yMS45MDEtNC45NTgtMjQuOTU2Yy0wLjc4My0zLjMyNi0yLjUwNi02LjYwNS01Ljg3LTUuNzgxYy0zLjIxNywwLjc4Mi0zLjk4NywzLjE0Ni00LjAwNCw3LjUzOAkJCWMtMC4wMjMsNC4zOTQsNC42MzQsMjguMjE2LDUuMTY3LDMxLjk5MmMwLjU3Niw0LjE2MywyLjI3NSwxMi4wMTksMS44MjYsMTQuMTI3QzM0LjUxNiw2Mi40NzksMzEuOTYxLDY0LjQwNywyOS44ODcsNjMuNDF6Ii8+CQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjE4Ljc2MTUiIHkxPSI2NC4yOTc4IiB4Mj0iMTguNzYxNSIgeTI9IjQyLjUxMDkiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNCRDgwNTciLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojREVBNTgxIi8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImNsaXAtcGF0aDp1cmwoI1NWR0lEXzJfKTtmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTMzLjAzMiw2My4wNTdjLTAuOTU0LDAuNjItMi4xMSwwLjg1My0zLjE0NSwwLjM1NAkJCWMtMS43MTgtMC44MjktNC4xMDItMy40MzctNi4xNTctNi42NzljLTEuNDc4LTIuMzQ2LTMuMTczLTUuMTk0LTUuNzA4LTguMzM5Yy0yLjUzNi0zLjEzMy05LjM2NC04LjY3Mi0xMy41MzEtNC4yMTEJCQljMCwwLDMuNS0yLjQ2LDkuNTcyLDMuNDQ1YzMuMTA0LDMuMDE4LDQuNTk1LDExLjMxNiw4LjIsMTQuOTI3QzI1Ljg2Nyw2Ni4xNTksMzMuMDMyLDYzLjA1NywzMy4wMzIsNjMuMDU3eiIvPgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzOC42OTUzIiB5MT0iNi41ODI4IiB4Mj0iMzguNjk1MyIgeTI9IjQ1LjAyMzkiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNDNzk1NzUiLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQzQ3RjUxIi8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImNsaXAtcGF0aDp1cmwoI1NWR0lEXzJfKTtmaWxsOnVybCgjU1ZHSURfNV8pOyIgZD0iTTQ1LjQwOSw0NS4wMjRjLTEuNTgxLTAuMzItMi4wNC0zLjc0Ni0yLjYtNy41NzYJCQljLTAuNDM3LTMuMTAyLTQuMjQ4LTIxLjkwMS00Ljk1OC0yNC45NTZjLTAuNzgzLTMuMzI2LTIuNTA2LTYuNjA1LTUuODctNS43ODFjMCwwLDIuNTg0LDMuMDMyLDIuOTA2LDUuMzI4CQkJYzAuMzI5LDIuMjkzLDMuOTM2LDI1LjI1Niw1LjU3NiwyOS4wMjNDNDIuMTA1LDQ0LjgzOCw0NS40MDksNDUuMDI0LDQ1LjQwOSw0NS4wMjR6Ii8+CQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzZfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjU0LjcxNTQiIHkxPSI0OC43MTc4IiB4Mj0iNTQuNzE1NCIgeTI9IjEuMzk2NSI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0JEODA1NyIvPgkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNDNzgyNTYiLz4JCTwvbGluZWFyR3JhZGllbnQ+CQk8cGF0aCBzdHlsZT0iY2xpcC1wYXRoOnVybCgjU1ZHSURfMl8pO2ZpbGw6dXJsKCNTVkdJRF82Xyk7IiBkPSJNNTguNjcyLDQ4LjU1Yy0wLjYwMy0wLjExOS0xLjY1OC0xLjQ3NS0xLjYyOC00Ljc2OQkJCWMwLjAxLTMuMzAyLTEuOTEzLTMyLjAxOC0yLjE1OS0zNS4xNDVjLTAuMjQtMy4xMzMtMC44NjUtNy4xODktNC4xMjYtNy4yMzljMCwwLDIuMDA2LDIuNjA5LDIuODI4LDE4LjE4NgkJCWMwLjgyMywxNS41ODMsMC44MjMsMjMuNzc5LDIuNDY0LDI2Ljg5NkM1Ny42OTEsNDkuNTkzLDU4LjY3Miw0OC41NSw1OC42NzIsNDguNTV6Ii8+CQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzdfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjcwLjU3OTYiIHkxPSI1MC41NjMiIHgyPSI3MC41Nzk2IiB5Mj0iNy4zMTQiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNCRDgwNTciLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQzc4MjU2Ii8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImNsaXAtcGF0aDp1cmwoI1NWR0lEXzJfKTtmaWxsOnVybCgjU1ZHSURfN18pOyIgZD0iTTcyLjI4NSw1MC41NjNjLTEuMDgtMC40OTYtMS40NDUtMi4xNDgtMS4zNjQtNC4yNjIJCQljMC4xMDItMi42MTksMi4wOTgtMjkuMDY1LDEuNjgzLTMyLjQ1Yy0wLjQyMi0zLjM4NS0xLjE1MS02LjI5OS00LjEwNC02LjUzN2MwLDAsMi4xNDYsMy4yNDYsMi4xNDYsOC4wMDUJCQljMCw0Ljc1Ni0yLjQ2MywyNi41NjYtMS42NDUsMjkuNTE5QzY5LjgyMiw0Ny43OSw3Mi4yODUsNTAuNTYzLDcyLjI4NSw1MC41NjN6Ii8+CQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzhfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjcwLjgzODUiIHkxPSIxMzEuODgyOCIgeDI9IjcwLjgzODUiIHkyPSIyNC44MDE5Ij4JCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQUQ3NTUwIi8+CQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0JBN0E1MCIvPgkJPC9saW5lYXJHcmFkaWVudD4JCTxwYXRoIHN0eWxlPSJjbGlwLXBhdGg6dXJsKCNTVkdJRF8yXyk7ZmlsbDp1cmwoI1NWR0lEXzhfKTsiIGQ9Ik00OC45OTQsMTMxLjg4M2M0Ljg4NC0wLjM3NSw5Ljc1NC0yLjQ3MiwxMy41NzUtNy45NzQJCQljMS4zMDEtMS44NjUsNC41OS0yOC45NTUsNi43NzYtMzAuNjI1YzguNDg2LTYuNDU5LDEyLjA0My0yOS41MiwxMS45NjktMzIuMzk1Yy0wLjA3NC0yLjg3NCw0LjkyNS0xMy4wNTEsNS41MTUtMTUuODg4CQkJYzAuNTc2LTIuNzk0LDYuNjQzLTE0LjI4MSw1Ljc2OC0xNy41ODNjLTAuMzA5LTEuMTMyLTAuOTU3LTIuMDYxLTEuNzgxLTIuNTk3YzAsMCwyLjk1LTAuOTcxLTEuOTY3LDEwLjk5OAkJCWMtNC45MiwxMS45NzItOS42ODYsMTkuNTE1LTEwLjE3MSwyMy42MTVjLTAuNDk0LDQuMDk5LTIuNDYxLDE3Ljg3Ni01LjQwOCwyMS45NzRjLTIuOTU5LDQuMTAzLTE0LjU5OCw3LjA1Ny0xNC43NjMsMTEuODEyCQkJQzU4LjM0LDk3Ljk3OCw0OC45OTQsMTMxLjg4Myw0OC45OTQsMTMxLjg4M3oiLz4JCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfOV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzIuMzczNSIgeTE9Ijk1LjkwMTkiIHgyPSI2OS4zNDU3IiB5Mj0iOTUuOTAxOSI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0RFQUI4OCIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuNDc4NSIgc3R5bGU9InN0b3AtY29sb3I6I0M3OEE2MiIvPgkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM5OTZBNEIiLz4JCTwvbGluZWFyR3JhZGllbnQ+CQk8cGF0aCBzdHlsZT0iY2xpcC1wYXRoOnVybCgjU1ZHSURfMl8pO2ZpbGw6dXJsKCNTVkdJRF85Xyk7IiBkPSJNMzIuOTI5LDkwLjUzMmMwLDAsNS41NzMsNS4xNDcsMTQuMDkzLDQuNDkyCQkJYzguNTMzLTAuNjU3LDUuOTExLTEuMzE0LDExLjE1NC0xLjMxNGM1LjI0OSwwLDMuODEyLDAuODc1LDcuMjIyLDAuNjU3YzMuNDAxLTAuMjE2LDMuOTQ4LTEuMDgzLDMuOTQ4LTEuMDgzCQkJcy0wLjgzNywxLjQ2My0xLjE2MywyLjcwM2MtMC4zMjEsMS4yMzQtMC45OSw1LjI4NC0wLjk5LDUuMjg0bC0zNC44MTktMS42NWMwLDAsMS4zNDctMy42MjIsMS4yMDItNS41ODQJCQlDMzMuNDMzLDkyLjA3OSwzMi45MjksOTAuNTMyLDMyLjkyOSw5MC41MzJ6Ii8+CQk8cGF0aCBzdHlsZT0iY2xpcC1wYXRoOnVybCgjU1ZHSURfMl8pO2ZpbGw6bm9uZTtzdHJva2U6IzdENTczMztzdHJva2Utd2lkdGg6Mi40NzsiIGQ9Ik0yOS44ODcsNjMuNDEJCQljLTEuNzE4LTAuODI5LTQuMTAyLTMuNDM3LTYuMTU3LTYuNjc5Yy0xLjQ3OC0yLjM0Ni0zLjE3My01LjE5NC01LjcwOC04LjMzOWMtMi41MzYtMy4xMzMtOS4zNjQtOC42NzItMTMuNTMxLTQuMjExCQkJYy0yLjI1MSwyLjQwNSwxLjU3MSw1LjA1MywxLjk5OCw1LjY3NmM1LjUzOSw3LjksNy45NjksMTQuNzU1LDExLjgxNywyMS44OTRjMy44NTEsNy4xNDIsOC45MTMsMTMuNzIzLDE0LjYyMywxOC43ODEJCQljMy4xMTUsMi43MzYtOS4xMDQsMzQuNzM0LTMuODg2LDM2LjQ3OGM0Ljc4NywxLjU5MiwyMy4wOSwxMS45MTgsMzMuNTI3LTMuMTAxYzEuMzAxLTEuODY1LDQuNTktMjguOTU1LDYuNzc2LTMwLjYyNQkJCWM4LjQ4Ni02LjQ1OSwxMi4wNDMtMjkuNTIsMTEuOTY5LTMyLjM5NWMtMC4wNzQtMi44NzQsNC45MjUtMTMuMDUxLDUuNTE1LTE1Ljg4OGMwLjU3Ni0yLjc5NCw2LjY0My0xNC4yODEsNS43NjgtMTcuNTgzCQkJYy0wLjY4NS0yLjYwMS0zLjI0Mi00LjEwMi01LjQ0Ni0yLjMzN2MtMi4yMTgsMS43NjctNC42MDQsOC4yNjYtNi40NzgsMTIuNzMzYy0xLjg3NCw0LjQ2NS01LjU2NywxMi43NjMtNy40ODUsMTIuODkzCQkJYy0xLjc4MiwwLjExOC0yLjM2Ny0xLjc4Ni0yLjI2Ny00LjQwNmMwLjEwMi0yLjYxOSwyLjA5OC0yOS4wNjUsMS42ODMtMzIuNDVjLTAuNDIyLTMuMzg1LTEuMTUxLTYuMjk5LTQuMTA0LTYuNTM3CQkJYy0yLjQ2OS0wLjE4OC00LjU4NiwxLjA4Mi01LjMzMiw5Ljk1NGMtMC43NTIsOC44NzMtMS4zNDgsMjMuMzIzLTEuNjM1LDI2Ljc4MWMtMC4zOSw0LjgzLTEuODUxLDQuNzAzLTIuODYsNC41MDEJCQljLTAuNjAzLTAuMTE5LTEuNjU4LTEuNDc1LTEuNjI4LTQuNzY5YzAuMDEtMy4zMDItMS45MTMtMzIuMDE4LTIuMTU5LTM1LjE0NWMtMC4yNC0zLjEzMy0wLjg2NS03LjE4OS00LjEyNi03LjIzOQkJCWMtNS4yNjEtMC4wODItNS4yMTQsNS41OTgtNS4wNzgsOS43NzZjMC4xODQsNC45OTYsMS43MDYsMjMuMDA2LDEuNzg3LDI2Ljk3M2MwLjEsNC42Ny0wLjE5NCw3LjI1NC0yLjA1OSw2Ljg3OQkJCWMtMS41ODEtMC4zMi0yLjA0LTMuNzQ2LTIuNi03LjU3NmMtMC40MzctMy4xMDItNC4yNDgtMjEuOTAxLTQuOTU4LTI0Ljk1NmMtMC43ODMtMy4zMjYtMi41MDYtNi42MDUtNS44Ny01Ljc4MQkJCWMtMy4yMTcsMC43ODItMy45ODcsMy4xNDYtNC4wMDQsNy41MzhjLTAuMDIzLDQuMzk0LDQuNjM0LDI4LjIxNiw1LjE2NywzMS45OTJjMC41NzYsNC4xNjMsMi4yNzUsMTIuMDE5LDEuODI2LDE0LjEyNwkJCUMzNC41MTYsNjIuNDc5LDMxLjk2MSw2NC40MDcsMjkuODg3LDYzLjQxeiIvPgk8L2c+CTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMTBfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjQ1LjQ4NDciIHkxPSI4Ny42NDE2IiB4Mj0iNDUuNDg0NyIgeTI9IjY3Ljk1OCI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQkQ4MDU3Ii8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQzc4MjU2Ii8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMTBfKTsiIGQ9Ik0zOS4zMTYsNjcuOTU4YzAsMCw3LjgyNywxLjMwMywxMC4xNzEsNi41NjZjMy45Myw4Ljg1MiwxLjMxMiwxMy4xMTcsMS4zMTIsMTMuMTE3CQlzLTAuNzU3LTguNzYxLTUuNjUyLTE0LjUyOUM0MS4zOTMsNjguNjkxLDM5LjMxNiw2Ny45NTgsMzkuMzE2LDY3Ljk1OHoiLz4JPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNTcuOCIgeTE9IjY1LjI4MzUiIHgyPSI1Ny44IiB5Mj0iNTcuNzM2MyI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQkQ4MDU3Ii8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQzc4MjU2Ii8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMTFfKTsiIGQ9Ik00MS42NDgsNTcuNzM2YzAsMCwxLjY0LDIuNjQyLDUuMzc0LDMuMTc2YzUuMDU2LDAuNzE0LDguNTYyLTAuNTU2LDguNTYyLTAuNTU2CQlzLTAuMDA0LDIuNDY0LDQuNTk2LDMuMTE3YzQuNTkxLDAuNjU2LDguMzYtMC40OTEsOC4zNi0wLjQ5MXMxLjMxNSwyLjQ2LDMuMTE2LDIuMjkzYzEuOC0wLjE2MiwyLjI5Ni0wLjk4MiwyLjI5Ni0wLjk4MgkJcy0xLjY0LDAuNDkzLTIuNDU3LTAuMTYzYy0wLjgyNi0wLjY1Ni0yLjk1NS0yLjc5My0yLjk1NS0yLjc5M3MtNC43NTgsMC45ODgtNy4yMTUsMGMtMi40NjQtMC45OC01LjA4My0zLjExMS01LjA4My0zLjExMQkJcy01LjY3LDAuOTgxLTguMzY3LDAuODIzQzQzLjQyLDU4Ljc4MSw0MS42NDgsNTcuNzM2LDQxLjY0OCw1Ny43MzZ6Ii8+PC9nPjwvc3ZnPg==';
	d.NITROGEN = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoNDgsODAsMjQ4KSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDQ4LDgwLDI0OCkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik02LjMwNTcgMTUgTDYuMzA1NyA0Ljg4MjggTDcuNzEzOSA0Ljg4MjggTDEyLjgwNjYgMTIuNjk2MyBMMTIuODA2NiA0Ljg4MjggTDE0LjAzNzEgNC44ODI4IEwxNC4wMzcxIDE1IEwxMi42MzU3IDE1IEw3LjUzNjEgNy4xODY1IEw3LjUzNjEgMTUgWiIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.OPEN = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNDUuMTAyIiB5MT0iMTIuMDcyMyIgeDI9IjQ1LjEwMiIgeTI9Ijg3Ljg0MzciPgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0Q2QTUwNiIvPgkJPHN0b3AgIG9mZnNldD0iMC4yODg3IiBzdHlsZT0ic3RvcC1jb2xvcjojRDNBMzA2Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQ5MjgiIHN0eWxlPSJzdG9wLWNvbG9yOiNDQTlDMDYiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNjcwNyIgc3R5bGU9InN0b3AtY29sb3I6I0JBOTAwNSIvPgkJPHN0b3AgIG9mZnNldD0iMC44MzM3IiBzdHlsZT0ic3RvcC1jb2xvcjojQTQ3RTA1Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjk4NTIiIHN0eWxlPSJzdG9wLWNvbG9yOiM4ODY4MDQiLz4JCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM4NTY2MDQiLz4JPC9saW5lYXJHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8xXyk7c3Ryb2tlOiM5OTZFMDA7c3Ryb2tlLXdpZHRoOjIuNDgzNztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSIJCU00NC4zNDEsMTguNDk1bC0wLjU4NC0yLjUwOGMtMC40MjItMS43NzYtMC45MDctMi44NzQtMS40NDctMy4yOTJjLTAuNTI4LTAuNDEyLTEuNzM3LTAuNjIzLTMuNjAxLTAuNjIzSDIwLjYwNAkJYy0yLjA4OSwwLTMuNDk1LDAuMjE5LTQuMTk4LDAuNjUyYy0wLjczMiwwLjQ3NC0xLjI3NywxLjQ5MS0xLjY2NywzLjA1MmwtMC42LDIuNTA1Yy0wLjUxNywyLjA2Ni0xLjEwMSwzLjM0LTEuNzM1LDMuODExCQljLTAuNjM0LDAuNDcyLTIuMDQxLDAuNzAyLTQuMjM0LDAuNzAySDUuMTUzYy0xLjU4NCwwLTIuNjA2LDAuMjY3LTMuMTE0LDAuNzk0Yy0wLjUxLDAuNTIxLTAuNzY0LDEuNjI5LTAuNzY0LDMuMzM0bDIuMzIsNjAuOTIyCQlsMjEuNDk5LTQ2LjgyN2MxLjUzMi0zLjI5MSwyLjUzNy00LjExMywzLjM4Ni00LjY2MmMwLjgyOC0wLjUzMyw0LjU0MS0wLjY1OCw4LjA5LTAuNjU4aDUyLjM1OGwtMC4zNjItOC43MzUJCWMwLTIuNzc4LTEuMjExLTQuMTY3LTMuNjc4LTQuMTY3SDUxLjc5Yy0zLjA3NiwwLTQuOTQ5LTAuMTk4LTUuNjgxLTAuNTkyQzQ1LjM4NiwyMS43OTcsNDQuOCwyMC41Nyw0NC4zNDEsMTguNDk1Ii8+CTxnPgkJPGc+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzLjU5MDgiIHkxPSI2MS43NjE1IiB4Mj0iOTguNjYwMiIgeTI9IjYxLjc2MTUiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGNjk0Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNDcyNCIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRTkwMCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjYzNTkiIHN0eWxlPSJzdG9wLWNvbG9yOiNGOUU0MDAiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC44NDkxIiBzdHlsZT0ic3RvcC1jb2xvcjojRTlENTAwIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNEOUM2MDAiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMl8pO3N0cm9rZTojRkJDNzAwO3N0cm9rZS13aWR0aDoyLjQ4Mzc7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgZD0iCQkJCU0zLjU5MSw4Ny44OTRoNzIuNDc1bDIxLjUzOC00OC4xOTJjMC43MDItMS43MzcsMS4wNTctMi43MDksMS4wNTctMi45MzFjLTAuMTA5LTAuNzU0LTEuMDk1LTEuMTQxLTMuMDI2LTEuMTQxSDMxLjgzOAkJCQljLTEuODczLDAtMy4xOTEsMC4yNDMtMy45MDMsMC43MDVjLTAuNzEzLDAuNDctMS40MzUsMS41NDEtMi4xODcsMy4yMDVMMy41OTEsODcuODk0eiIvPgkJPC9nPgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI3LjMyMDMiIHkxPSI2MS42NTU5IiB4Mj0iOTYuMjI5NiIgeTI9IjYxLjY1NTkiPgkJCTxzdG9wICBvZmZzZXQ9IjAuMDA2MSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuNDg0NyIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkJDOSIvPgkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkY0ODIiLz4JCTwvbGluZWFyR3JhZGllbnQ+CQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzNfKTsiIGQ9Ik03LjMyLDg1LjMwM2MwLDAsMTkuMzE0LTQyLjUwNywxOS42ODctNDMuNTU5YzAuMzc4LTEuMDQxLDAuOTc0LTIuMzM3LDIuMjI1LTMuMTMxCQkJYzEuMjQ4LTAuNzgsMi40MzgtMC42NTQsMy42OTctMC42NTRjMS4yNjMsMCw2MS4yNjgsMC4xMDksNjEuMjY4LDAuMTA5czEuMjYxLDAsMS42NDIsMC4zODhjMS42MzksMS43MzUtMi4zMjUsMS43MzctMy44MTgsMS43NjEJCQljLTEuMDA1LDAuMDItNTYuNzctMC4xMzUtNTguMjgsMC4yNjJjLTEuNTE0LDAuMzg5LTIuMTU1LTAuMTUzLTIuOTE5LDAuNDk5Yy0wLjc2MSwwLjY1OC0xLjEzLDEuMzA3LTEuNTE0LDIuMDkzCQkJQzI4Ljk0LDQzLjg1NCw5Ljc4Nyw4NS4zNiw5Ljc4Nyw4NS4zNkw3LjMyLDg1LjMwM3oiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.OPTIMIZE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0NS45NzExIiB5MT0iMTA4LjY4NDQiIHgyPSIxNDAuMzA2NyIgeTI9IjEwOC42ODQ0IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTk1MSAwLjA5ODkgLTAuMDk4OSAwLjk5NTEgLTMyLjE4MTcgLTQyLjU0MzkpIj4JCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGRkZGIi8+CQkJPHN0b3AgIG9mZnNldD0iMC4yNTE1IiBzdHlsZT0ic3RvcC1jb2xvcjojODE4MTgxIi8+CQkJPHN0b3AgIG9mZnNldD0iMC40NDc5IiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGRkZGIi8+CQkJPHN0b3AgIG9mZnNldD0iMC44NDY2IiBzdHlsZT0ic3RvcC1jb2xvcjojNDk0OTQ5Ii8+CQkJPHN0b3AgIG9mZnNldD0iMC45ODE2IiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGRkZGIi8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8xXyk7c3Ryb2tlOiM1ODU4NTg7c3Ryb2tlLXdpZHRoOjM7IiBkPSJNMS4yMzMsODcuNjA5YzAsMC0wLjQ5NS01Ljc1NywzLjgwMi0xMy43NDQJCQljNC4zMTItNy45ODksMTIuMTg4LTE0LjA5OSwxMi4xODgtMTQuMDk5czI0LjEzMiw2Ljk1OCw0MC4xNiw1Ljk2N2MyMS43NDEtMS4zNDIsMzYuNDc3LTYuNzM5LDM2LjQ3Ny02LjczOQkJCXM0LjQ1NCw2LjQ5NywzLjU2OCwxMi45NDdjLTAuODg1LDYuNDQ1LTI1LjUzMSwxNS40NDUtNDguNTY0LDE5LjgwMUMyNS4yMDUsOTYuMjE4LDEuMjMzLDg3LjYwOSwxLjIzMyw4Ny42MDl6Ii8+CQk8cGF0aCBkPSJNMTQuMjU5LDYyLjQ0M2MwLDAsMjYuNTk0LDcuMzk2LDQyLjYyMiw2LjQwNUM3OC42MjIsNjcuNTA3LDk5LjUsNTkuMDI5LDk5LjUsNTkuMDI5czAuNDczLTMuNjc5LTIuMTA4LTguODYJCQljLTIuNTg0LTUuMTc4LTYuNTU3LTcuOTA0LTYuNTU3LTcuOTA0cy04LjMxMi02LjAxNS0yMS4yNTItNS40NTJjLTEzLjc4NSwwLjU5Ni0zMS4xODgsMy41NS00MC41NzEsMTAuMzAyCQkJQzE5LjYwNiw1My44NjgsMTQuMjU5LDYyLjQ0MywxNC4yNTksNjIuNDQzeiIvPgkJPHBhdGggZD0iTTc5LjU4OCwzNS40NTVjMCwwLTAuNjQxLDIuNzg1LDMuNzIyLDcuNDM1YzQuNTQsNC44NCwxMS4yMywyLjkyLDExLjIzLDIuOTJzLTMuODkxLTkuMzc1LTYuMTg4LTE2LjcwNwkJCUM4Ni4wNywyMS43NzEsODcuNDMsMi43ODYsNjcuODM1LDQuNDE3Yy0xOS42MTksMS42MjktMjcuMjIzLDcuODgxLTI5Ljk2MiwxMC43MTFjLTcuODU3LDguMTE3LTcuMjQzLDEyLjA1OS0xMS42NjksMTUuNjUyCQkJYy00LjQzLDMuNTk1LTcuMTk3LDYuMTM5LTkuNjcyLDEyLjczNWMtMi40ODIsNi41ODgtNC4yMTcsMTYuODkzLTEuODQ4LDE4LjI4MWMyLjM3MywxLjM3OCw4LjI2OSwzLjgyNywxNS45NDUtMC45NjkJCQljNy42NjgtNC43OTUsMTEuNjAxLTExLjQ1NiwxMC43MzktMTUuNjgxYy0wLjg2NS00LjIzMy0wLjg2NS00LjIzMy0wLjg2NS00LjIzM3MtMC45NjgtMTAuNjE1LDQuNzc4LTE0LjU2OQkJCWM1Ljc0NC0zLjk2NiwyMS4wMDgtOC45NjQsMjYuNjgyLTcuMTUyQzgwLjgzMiwyMi4wMzQsNzkuNTg4LDM1LjQ1NSw3OS41ODgsMzUuNDU1eiIvPgkJPHBhdGggZD0iTTMzLjI1MywyOS42MTRjLTAuMjU3LDMuMzExLTIuNTYzLDUuNjk2LTUuMTgxLDUuMzIybDAsMGMtMi42Mi0wLjM2OC00LjUyOS0zLjM1Ny00LjI4OS02LjY3bDAuMzk2LTUuMTM4CQkJYzAuMjUxLTMuMzEyLDIuNTY2LTUuNjk1LDUuMTc3LTUuMzJsMCwwYzIuNjE1LDAuMzc1LDQuNTI4LDMuMzYyLDQuMjc1LDYuNjdMMzMuMjUzLDI5LjYxNHoiLz4JPC9nPgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRjdGQUZBO3N0cm9rZS13aWR0aDo0LjEyNTE7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgZD0iTTE2LjQzMSw2NS40NTUJCWMwLDAtNS4wNjEsNS4yMDUtNy41NTcsOS41MTJjLTMuNzIxLDYuNDM4LTMuNjAyLDguNzM1LTMuNjAyLDguNzM1czE5LjUwNCw2Ljg2NiwzOS4wMjEsMy4zNDIJCWM0MS4zOTMtNy40NzUsNDkuMjA5LTE2LjQ1OSw0OS4yMDktMTYuNDU5Ii8+CTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNDOEM4Qzg7c3Ryb2tlLXdpZHRoOjQuMTI1MTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNMjguOTYsMzcuNTI5CQljMCwwLTMuMzMyLDEuNi02LjI4MSw5Ljc2MWMtMi45NDgsOC4xNjItMi4wOTMsMTEuMTYzLTIuMDkzLDExLjE2MyIvPjwvZz48L3N2Zz4=';
	d.OXYGEN = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMjU1LDEzLDEzKSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDI1NSwxMywxMykiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik0xMC4zNzk5IDE1LjI1MjkgUTguMjc0NCAxNS4yNTI5IDYuOTkyNyAxMy43OTM1IFE1LjcxMDkgMTIuMzM0IDUuNzEwOSA5LjkzNDYgUTUuNzEwOSA3LjUyMTUgNi45OTk1IDYuMDc1NyBROC4yODgxIDQuNjI5OSAxMC40NDE0IDQuNjI5OSBRMTIuNTg3OSA0LjYyOTkgMTMuODc5OSA2LjA3MjMgUTE1LjE3MTkgNy41MTQ2IDE1LjE3MTkgOS45MjA5IFExNS4xNzE5IDEyLjM3NSAxMy44Nzk5IDEzLjgxNCBRMTIuNTg3OSAxNS4yNTI5IDEwLjM3OTkgMTUuMjUyOSBaTTEwLjQwMDQgMTQuMTc5NyBRMTEuOTUyMSAxNC4xNzk3IDEyLjc5OTggMTMuMDYyIFExMy42NDc1IDExLjk0NDMgMTMuNjQ3NSA5LjkwNzIgUTEzLjY0NzUgNy45MzE2IDEyLjc5NjQgNi44MTc0IFExMS45NDUzIDUuNzAzMSAxMC40NDE0IDUuNzAzMSBROC45MzA3IDUuNzAzMSA4LjA4MyA2LjgyMDggUTcuMjM1NCA3LjkzODUgNy4yMzU0IDkuOTI3NyBRNy4yMzU0IDExLjkxMDIgOC4wNzYyIDEzLjA0NDkgUTguOTE3IDE0LjE3OTcgMTAuNDAwNCAxNC4xNzk3IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.PASTE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGc+CQkJCTxnPgkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIyOC4wMDQ1IiB5MT0iMTYuNzY3IiB4Mj0iNDEuNjAwOCIgeTI9Ijk1LjAxNjIiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM3QTc1QjMiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjIxMjIiIHN0eWxlPSJzdG9wLWNvbG9yOiM3NjcxQjEiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjQzNCIgc3R5bGU9InN0b3AtY29sb3I6IzY5NjZBQSIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNSIgc3R5bGU9InN0b3AtY29sb3I6IzY0NjFBNyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNTM3OSIgc3R5bGU9InN0b3AtY29sb3I6IzVFNUFBMyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNjQ1OSIgc3R5bGU9InN0b3AtY29sb3I6IzUxNEM5QiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNzc3NyIgc3R5bGU9InN0b3AtY29sb3I6IzQ5NDQ5NiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM0NzQxOTUiLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzFfKTsiIHBvaW50cz0iNDkuMzQ3LDE1LjU5NCA2Ny42MTksMTUuNTk0IDY3LjYxOSw5NS4wMzIgMS43ODUsOTUuMDMyIDEuNzg1LDE1LjU5NCAJCQkJCQkxOS43NDIsMTUuNTk0IDE2LjUxNiwyMy45NSA1Mi41NzUsMjMuOTUgCQkJCQkiLz4JCQkJCTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojQTFBMUZGO3N0cm9rZS13aWR0aDoyLjk4NzE7IiBwb2ludHM9IjY2LjM0NCwxNy41MjEgNC40NywxNy41MjEgNC40Nyw5NS4wMzIgCQkJCQkiLz4JCQkJCTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMzczNzhBO3N0cm9rZS13aWR0aDoyLjk4NzE7IiBwb2ludHM9IjY0LjkyMiwxOS4wODUgNjQuOTIyLDkyLjMzOSAyLjg4Myw5Mi4zMzkgCQkJCQkiLz4JCQkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMxQjE0NjQ7c3Ryb2tlLXdpZHRoOjIuOTg3MTsiIHBvaW50cz0iNDkuMzQ3LDE1LjU5NCA2Ny42MTksMTUuNTk0IDY3LjYxOSw5NS4wMzIgCQkJCQkJMS43ODUsOTUuMDMyIDEuNzg1LDE1LjU5NCAxOS43NDIsMTUuNTk0IDE2LjQyNCwyMy4xNjYgNTIuNjM1LDIzLjIzNCAJCQkJCSIvPgkJCQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTsiIGQ9Ik0zNi43OTUsNi40NjVDMzYuNzk1LDcuODY3LDM1LjY2LDksMzQuMjYsOWMtMS4zOTcsMC0yLjUzLTEuMTMzLTIuNTMtMi41MzUJCQkJCQljMC0xLjQwNCwxLjEzMy0yLjUzNywyLjUzLTIuNTM3QzM1LjY2LDMuOTI4LDM2Ljc5NSw1LjA2MSwzNi43OTUsNi40NjV6Ii8+CQkJCTwvZz4JCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxNi40OTQxIiB5MT0iMTIuMjQ0IiB4Mj0iNTIuNDkwMiIgeTI9IjEyLjI0NCI+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRTNFMURFIi8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojREJEOEQ1Ii8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjA2MyIgc3R5bGU9InN0b3AtY29sb3I6I0NDQzlDOCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC4xODMzIiBzdHlsZT0ic3RvcC1jb2xvcjojQTVBM0E2Ii8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjI2NCIgc3R5bGU9InN0b3AtY29sb3I6Izg4ODY4QyIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC41MjI1IiBzdHlsZT0ic3RvcC1jb2xvcjojRjNGM0Y0Ii8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjU4NDYiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNUU0RTYiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjAuNzAzOSIgc3R5bGU9InN0b3AtY29sb3I6I0JGQkRDMCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC44NjciIHN0eWxlPSJzdG9wLWNvbG9yOiM4MjdGODMiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjAuODc2NCIgc3R5bGU9InN0b3AtY29sb3I6IzdFN0I3RiIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0QwRDFEMyIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0E2QThBQSIvPgkJCQk8L2xpbmVhckdyYWRpZW50PgkJCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzJfKTtzdHJva2U6IzRENEQ0RDtzdHJva2Utd2lkdGg6Mi45ODcxOyIgZD0iTTE2LjQ5NCwyMi44OTJsMy4zOTEtNy43MDRsNC4yMzktMC44NWwwLjU5Ny00LjA1CQkJCQljMCwwLDAuMDkyLTEuMDA5LDAuNzMyLTEuNTYyYzAuNjU3LTAuNTYyLDEuNDctMC4zMjMsMS40Ny0wLjMyM2gxLjEwMWwwLjA5Mi0yLjcwN2MxLjgzOS0zLjYxOSw0LjMwOS00LjAxNiw2LjY1Mi00LjA5NgkJCQkJYzMuNzEzLTAuMTMzLDYuMTA0LDQuMDM5LDYuMTA0LDQuMDM5djIuNzY0aDEuMTg4YzAsMCwxLjAzNC0wLjA5MiwxLjU1OCwwLjUwOGMwLjUyNCwwLjYwMSwwLjY3OCwxLjQ3NiwwLjY3OCwxLjQ3NgkJCQkJbDAuNTY1LDMuOTUxbDQuMjQsMC44NWwzLjM5MSw3LjcwNEgzNC43NjZIMTYuNDk0eiBNMzQuNTM2LDUuMzU2Yy0xLjQsMC0yLjUzMywxLjEzNC0yLjUzMywyLjUzNwkJCQkJYzAsMS40MDIsMS4xMzMsMi41MzYsMi41MzMsMi41MzZjMS4zOTYsMCwyLjUzMi0xLjEzNCwyLjUzMi0yLjUzNkMzNy4wNjgsNi40ODksMzUuOTMzLDUuMzU2LDM0LjUzNiw1LjM1NnoiLz4JCQk8L2c+CQk8L2c+CTwvZz4JPGc+CQk8Zz4JCQk8Zz4JCQkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzNfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0yMzEuNTI0NCIgeTE9IjcyLjYxOTMiIHgyPSItMTg2LjIzNzgiIHkyPSIyMS4xMjcxIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMjkyLjczMDUgMCkiPgkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZFRkRFRCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMC40Mzg0IiBzdHlsZT0ic3RvcC1jb2xvcjojRkVGNUJGIi8+CQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDMiIHN0eWxlPSJzdG9wLWNvbG9yOiNCNUE4NUQiLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7IiBwb2ludHM9Ijk3Ljc5Miw0OS44MjIgNzkuNzMzLDI5LjMgNDAuNDc0LDI5LjMgNDAuNDc0LDk3LjkxMyA5Ny43OTIsOTcuOTEzIAkJCQkiLz4JCQkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0yMjMuNTk3NyIgeTE9IjUyLjI0NDUiIHgyPSItMjIzLjU5NzciIHkyPSI5Ny45MTMxIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMjkyLjczMDUgMCkiPgkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0ZCQkIzOCIvPgkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkU5NyIvPgkJCQk8L2xpbmVhckdyYWRpZW50PgkJCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzRfKTsiIGQ9Ik00MC40NzQsNzQuODA3djIzLjEwNmg1Ny4zMThWNTIuMzQ3YzAsMC05Ljc3My0wLjg1NS0yMi4wMTgsMi4zODMJCQkJCUM1MS4zNjcsNjEuMTgzLDQwLjQ3NCw3NC44MDcsNDAuNDc0LDc0LjgwN3oiLz4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzhBNjgwMDtzdHJva2Utd2lkdGg6My45ODI4O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQkJCQk5Ny43OTIsNDkuODIyIDc5LjczMywyOS4zIDQwLjQ3NCwyOS4zIDQwLjQ3NCw5Ny45MTMgOTcuNzkyLDk3LjkxMyAJCQkJIi8+CQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItMjEyLjk5NzEiIHkxPSIzOS41NjExIiB4Mj0iLTE5NC45Mzg1IiB5Mj0iMzkuNTYxMSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAxIDI5Mi43MzA1IDApIj4JCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUZERUQiLz4JCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRUY1QkYiLz4JCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJPHBvbHlnb24gc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF81Xyk7IiBwb2ludHM9Ijc5LjczMywyOS4zIDg5Ljg0LDM3LjggOTcuNzkyLDQ5LjgyMiA4OC44NzcsNDMuOTg2IDc5Ljk1MSw0NS4wMTggCQkJCSIvPgkJCQk8Zz4JCQkJCTxnPgkJCQkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuNDU5NjsiIHBvaW50cz0iNjguNTc0LDkxLjI2OSA0OS4xMjMsNzkuODE4IDQ5LjEyMyw1Ny4xNjMgCQkJCQkJCTY4Ljg1LDQ1Ljk1NSA4OC4yOTUsNTcuNDA0IDg4LjI5NSw4MC4wNjIgCQkJCQkJIi8+CQkJCQkJCQkJCQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjQuOTU1MTtzdHJva2UtbGluZWNhcDpyb3VuZDsiIHgxPSI1Ny4wMjgiIHkxPSI2My40MzkiIHgyPSI3MC4wNTkiIHkyPSI1Ni4wNTQiLz4JCQkJCQkJCQkJCQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6NC45NTUxO3N0cm9rZS1saW5lY2FwOnJvdW5kOyIgeDE9IjY5LjU1MSIgeTE9IjgxLjAwMSIgeDI9IjU3LjI1NiIgeTI9IjczLjcwNyIvPgkJCQkJCQkJCQkJCQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo0Ljk1NTE7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7IiB4MT0iNzkuMTA5IiB5MT0iNjEuMTYzIiB4Mj0iNzguODgyIiB5Mj0iNzUuOTgzIi8+CQkJCQk8L2c+CQkJCTwvZz4JCQkJPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzhBNjgwMDtzdHJva2Utd2lkdGg6Mi45ODcxO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik03OS43MzMsMjkuMwkJCQkJYzAsMCw0Ljk3OSwyLjczOCw5LjY3OCw4LjAwOWM0LjY5Nyw1LjI3MSw4LjM4MSwxMi41MTQsOC4zODEsMTIuNTE0cy01LjAyMS00LjU2LTkuNjY5LTUuMjcxCQkJCQljLTUuNDMyLTAuODMzLTUuNzE0LDAuMDA0LTguNDEyLDAuNTEyTDc5LjczMywyOS4zeiIvPgkJCQk8cG9seWxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2Utd2lkdGg6My4xNTc7IiBwb2ludHM9IjQyLjU3LDk2LjUxMiA0Mi41NywzMS40MDkgNzguMTk5LDMxLjQwOSAJCQkJIi8+CQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGQkJCMzg7c3Ryb2tlLXdpZHRoOjIuNzc3ODsiIHgxPSI5NS42OTMiIHkxPSI5NS45OSIgeDI9IjQwLjk4NCIgeTI9Ijk1Ljk5Ii8+CQkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNCQTdEMDA7c3Ryb2tlLXdpZHRoOjIuNzc3ODsiIHgxPSI5Ni4wMjEiIHkxPSI1Mi4yNjIiIHgyPSI5Ni4wMjEiIHkyPSI5Ny4zNzIiLz4JCQkJPGc+CQkJCQk8cGF0aCBzdHlsZT0iZmlsbDojQjVBODVEOyIgZD0iTTk3LjA1LDUyLjI3N2wtMi4zNjcsMC4wMDNsLTAuMDA5LTIuOTI4YzAsMCwwLjczNiwwLjQ2NSwxLjQxNCwxLjAwNgkJCQkJCWMwLjgzOCwwLjY2OSwxLjIyLDEuMTAyLDEuMjIsMS4xMDJsLTAuMDAyLDAuODE3SDk3LjA1eiIvPgkJCQk8L2c+CQkJPC9nPgkJPC9nPgk8L2c+PC9nPjwvc3ZnPg==';
	d.PERIODIC_TABLE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxwb2x5Z29uIHN0eWxlPSJmaWxsOiNGNzkzMUU7IiBwb2ludHM9IjEyLjUxLDkuNTY4IDYuMjEyLDkuNTY4IDYuMjEyLDkuNTQgNi4yMTIsMCAtMC4yMTksMCAtMC4yMTksOS41NCAtMC4yMTksNzAuODUgCQkxMi41MSw3MC44NSAJIi8+CTxwb2x5Z29uIHN0eWxlPSJmaWxsOiMyOUFCRTI7IiBwb2ludHM9IjkzLjE3LDAgOTMuMTcsMTAuMzYyIDY3LjQ0NywxMC4zNjIgNjcuNDQ3LDcwLjg1IDY4LjIxOSw3MC44NSA5OS45MDEsNzAuODUgOTkuOTAxLDAgCSIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDA3MUJDO3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iOTcuNDY3IiB5MT0iNjguNTMyIiB4Mj0iOTcuNDY3IiB5Mj0iMi4xOSIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDA3MUJDO3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iNzAuNTk4IiB5MT0iNjguNTMyIiB4Mj0iOTguOTMxIiB5Mj0iNjguNTMyIi8+CTxwb2x5bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDBGRkZGO3N0cm9rZS13aWR0aDozLjAxMzQ7IiBwb2ludHM9IjY5LjM3NSw3MC44NSA2OS4zNzUsMTIuMjc4IDk1LjE0MiwxMi4yNzggOTUuMTQyLDEuNzk2IAkJOTkuMjI2LDEuODA1IAkiLz4JPHJlY3QgeD0iMTIuNTA1IiB5PSIzMC4yOTgiIHN0eWxlPSJmaWxsOiNFRDFDMjQ7IiB3aWR0aD0iNTQuODcxIiBoZWlnaHQ9IjQwLjYwOCIvPgk8cmVjdCB4PSI1Ljc3IiB5PSI4MC4xMDciIHN0eWxlPSJmaWxsOiM4Q0M2M0Y7IiB3aWR0aD0iODcuMTQ2IiBoZWlnaHQ9IjE5Ljg5MyIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRjE1QTI0O3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iMS43NiIgeTE9IjY4LjM1NiIgeDI9IjExLjUxIiB5Mj0iNjguMzU2Ii8+CTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGQkQyM0I7c3Ryb2tlLXdpZHRoOjMuMDEzNDsiIHgxPSIxLjc2IiB5MT0iMCIgeDI9IjEuNzYiIHkyPSI3MC44NSIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRjE1QTI0O3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iMTAuMjUiIHkxPSI5LjYwNCIgeDI9IjEwLjI1IiB5Mj0iNzAuODUiLz4JPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JEMUMyNDtzdHJva2Utd2lkdGg6My4wMTM0OyIgeDE9IjEzLjkxNyIgeTE9IjY4LjUzMiIgeDI9IjY2LjU4MyIgeTI9IjY4LjUzMiIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRjY3N0NBO3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iMTUuMDA2IiB5MT0iMzAuNzI5IiB4Mj0iMTUuMDA2IiB5Mj0iNzAuODUiLz4JPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JEMUMyNDtzdHJva2Utd2lkdGg6My4wMTM0OyIgeDE9IjY1LjI1IiB5MT0iMzAuNzI5IiB4Mj0iNjUuMjUiIHkyPSI3MC44NSIvPgk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojRkJEMjNCO3N0cm9rZS13aWR0aDozLjAxMzQ7IiB4MT0iNS4zODkiIHkxPSIxMi4wNjQiIHgyPSIxMi41MSIgeTI9IjEyLjA2NCIvPgk8cGF0aCBzdHlsZT0iZmlsbDojRUQxQzI0OyIgZD0iTTUuMjA4LDEuMDA0djguNTYzdjEuMDA0aDEuMDA0aDUuMjkzdjU5LjI3MkgwLjc4NlY5LjU0VjEuMDA0SDUuMjA4IE02LjIxMiwwaC02LjQzMXY5LjU0djYxLjMxCQlIMTIuNTFWOS41NjhINi4yMTJWOS41NFYwTDYuMjEyLDB6Ii8+CTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGNjc3Q0E7c3Ryb2tlLXdpZHRoOjMuMDEzNDsiIHgxPSIxMy45MTciIHkxPSIzMi44MzgiIHgyPSI2Ni41ODMiIHkyPSIzMi44MzgiLz4JPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JEMUMyNDtzdHJva2Utd2lkdGg6My4wMTM0OyIgZD0iTTY2LjU4Myw2OC41MzIiLz4JPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0JEMUMyNDtzdHJva2Utd2lkdGg6My4wMTM0OyIgZD0iTTEzLjkxNyw2OC41MzIiLz4JPHBhdGggc3R5bGU9ImZpbGw6IzlBMDAwMDsiIGQ9Ik02Ni4zNzEsMzEuMzAydjM4LjU5OUgxMy41MDlWMzEuMzAySDY2LjM3MSBNNjcuMzc2LDMwLjI5OEgxMi41MDV2NDAuNjA4aDU0Ljg3MVYzMC4yOTgJCUw2Ny4zNzYsMzAuMjk4eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDojMDA0RUJDOyIgZD0iTTk4Ljg5NiwxLjAwNHY2OC44NEg2OC40NTJWMTEuMzY3SDkzLjE3aDEuMDA1di0xLjAwNFYxLjAwNEg5OC44OTYgTTk5LjkwMSwwSDkzLjE3djEwLjM2Mkg2Ny40NDcJCVY3MC44NWgwLjc3MWgzMS42ODNWMEw5OS45MDEsMHoiLz4JPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwOTI0NTtzdHJva2Utd2lkdGg6My4wMTM0OyIgeDE9IjYuOTE3IiB5MT0iOTcuOTYyIiB4Mj0iOTIuOTE2IiB5Mj0iOTcuOTYyIi8+CTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNEOUUwMjE7c3Ryb2tlLXdpZHRoOjMuMDEzNDsiIHgxPSI4LjE4NyIgeTE9IjgwLjU0MiIgeDI9IjguMTg3IiB5Mj0iMTAwIi8+CTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDkyNDU7c3Ryb2tlLXdpZHRoOjMuMDEzNDsiIHgxPSI5MC40MzEiIHkxPSI4MC41NDIiIHgyPSI5MC40MzEiIHkyPSIxMDAiLz4JPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0Q5RTAyMTtzdHJva2Utd2lkdGg6My4wMTM0OyIgeDE9IjYuOTE3IiB5MT0iODIuMTQxIiB4Mj0iOTIuOTE2IiB5Mj0iODIuMTQxIi8+CTxwYXRoIHN0eWxlPSJmaWxsOiMwMDY4Mzc7IiBkPSJNOTEuOTExLDgxLjExMnYxNy44ODNINi43NzRWODEuMTEySDkxLjkxMSBNOTIuOTE2LDgwLjEwN0g1Ljc3VjEwMGg4Ny4xNDZWODAuMTA3TDkyLjkxNiw4MC4xMDd6IgkJLz48L2c+PC9zdmc+';
	d.PERSPECTIVE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPHBhdGggc3R5bGU9ImZpbGw6I0VEMUMyNDsiIGQ9Ik05MC41MTksNDUuMjIxYy0wLjYyNiwwLTEuMjYtMC4xNDctMS44NTItMC40NTZjLTEuOTU4LTEuMDIyLTIuNzE0LTMuNDM0LTEuNjg5LTUuMzg3CQkJYzAuMDIxLTAuMDQyLDMuMzA0LTYuNjczLDEuMTUyLTE1LjY4NmMtMS44NDMtNy43MjQtMTAuNDUtOS40MDEtMTAuODE1LTkuNDY5Yy0yLjE2My0wLjQtMy42MDctMi40NzItMy4yMTktNC42MzMJCQljMC4zOS0yLjE2MSw0LjcxOC00LjE3Myw2Ljg3OS0zLjc4OWMwLjU3NSwwLjEsMTEuOTQ3LDUuNjQ3LDE0LjkzOCwxNi4wNDJjMy40MjIsMTEuODkzLTEuNjUzLDIwLjg2Ny0xLjg0OCwyMS4yMzYJCQlDOTMuMzUxLDQ0LjQ0Miw5MS45NTksNDUuMjIxLDkwLjUxOSw0NS4yMjFMOTAuNTE5LDQ1LjIyMXoiLz4JPC9nPgkJCTxyYWRpYWxHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGN4PSItMTM0LjEzNjIiIGN5PSItOTIuMDg1NCIgcj0iNTMuMTUyNyIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLjkzMyAwIDAgMC44NDQ0IDE3NC44MzUxIDEyNy42OTE3KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgkJPHN0b3AgIG9mZnNldD0iMC4wMDYxIiBzdHlsZT0ic3RvcC1jb2xvcjojRjBGQkZGIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjM1NTgiIHN0eWxlPSJzdG9wLWNvbG9yOiNCOURFRUQiLz4JCTxzdG9wICBvZmZzZXQ9IjAuOTk0NCIgc3R5bGU9InN0b3AtY29sb3I6IzNGNzZBMSIvPgk8L3JhZGlhbEdyYWRpZW50Pgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzFfKTsiIGQ9Ik05NC45NzQsNzYuMDI1TDQ5LjY1OCw5OC4zNTdsLTAuNDM5LTQ5Ljk4MWw0NS43NTUtMjMuMDJWNzYuMDI1eiBNNC41NjQsMjUuMWw0NC42NTQsMjMuMjc2CQlsNDUuODEtMjMuMTUzTDUxLjI1NSwxLjUxMkw0LjU2NCwyNS4xeiBNNC4zNDMsNzYuMDI1bDQ1LjMxNSwyMi4zMzJsLTAuNDM5LTQ5Ljk4MUw0LjM0MywyNS4zNTZWNzYuMDI1eiIvPgk8cG9seWxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwNkJCRjtzdHJva2Utd2lkdGg6My41NTA0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQk1MC41ODQsOTUuMzM0IDkyLjU3LDc1LjExNyA5Mi40MTUsMjcuNTUgCSIvPgk8cG9seWdvbiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMUI4MENGO3N0cm9rZS13aWR0aDoyLjk5Njk7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgcG9pbnRzPSIJCTk0Ljk3NCw3Ni4wMjUgNDkuNjU4LDk4LjM1NyA0OS4yMTksNDguMzc2IDk0Ljk3NCwyNS4zNTYgCSIvPgk8cG9seWxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzhGQ0RFMztzdHJva2Utd2lkdGg6My41NTA0O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iCQk1MS45ODEsMi44NTMgNi45NjIsMjYuNDk2IDYuMjYzLDc2LjEwNCAJIi8+CTxwb2x5Z29uIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMxQjgwQ0Y7c3Ryb2tlLXdpZHRoOjIuOTk2OTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBwb2ludHM9IjUxLjI1NSwxLjUxMiAJCTk1LjAyOSwyNS4yMjMgNDkuMjE5LDQ4LjM3NiA0LjU2NCwyNS4xIAkiLz4JPHBvbHlnb24gc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzFCODBDRjtzdHJva2Utd2lkdGg6Mi45OTY5O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHBvaW50cz0iNC4zNDMsNzYuMDI1IAkJNDkuNjU4LDk4LjM1NyA0OS4yMTksNDguMzc2IDQuMzQzLDI1LjM1NiAJIi8+CTxnPgkJPHBvbHlnb24gcG9pbnRzPSIxMS41NTQsNDguNjEzIDQxLjcxOSw2Mi41MzYgMjMuNTksODcuMTM1IAkJIi8+CTwvZz4JPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6Ny45OTE2O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIGQ9Ik03OC4wMjEsMTAuMjkzCQljMCwwLTE3LjYtNC41LTM3LjEsMjIuNzc2Yy05LjUsMTMuNjM3LTEzLjMzNCw0MC4wODMtMTMuMzM0LDQwLjA4MyIvPgk8Zz4JCTxwb2x5Z29uIHN0eWxlPSJmaWxsOiNFRDFDMjQ7IiBwb2ludHM9IjkuNzk0LDQ1LjY0MSAzOS4zNTcsNjAuNzk2IDIwLjIyNiw4NC42MjYgCQkiLz4JPC9nPgk8Zz4JCTxwYXRoIHN0eWxlPSJmaWxsOiNFRDFDMjQ7IiBkPSJNMjIuODAzLDcyLjgzMWMtMC4xODQsMC0wLjM3LTAuMDE0LTAuNTU4LTAuMDRjLTIuMTg4LTAuMzA0LTQuNDM1LTE3Ljg4OC00Ljc0LTE1LjcwNAkJCWMtMC41MzcsMy44NDEsMC41ODMtMTkuMzYxLDguMTQ5LTMxLjU4NEM1MC4yODEtMTQuMjgxLDgxLjM5Niw1LjY3OCw4Mi4yNTYsNi4xMjZjNC42MDMsMi40LDguMDY1LDcuMjU3LDcuMTE5LDkuMjUJCQljLTAuOTQxLDEuOTc5LTEwLjc4Ny0wLjU0MS0xMi43NzQtMS40NTZjLTAuNzU5LTAuMzMtMTYuNjc5LTUuNzk3LTM0LjM0NiwxNy44MTljLTkuMzExLDE0LjU5MS0xMy43MjQsMzMuMjQ2LTEwLjA2NiwyOS45MTcJCQlDMzAuNDMzLDYyLjY1MiwyNC43NjcsNzIuODMxLDIyLjgwMyw3Mi44MzFMMjIuODAzLDcyLjgzMXoiLz4JPC9nPjwvZz48L3N2Zz4=';
	d.PHOSPHORUS = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMjU1LDEyOCwwKSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDI1NSwxMjgsMCkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik03LjMwNTcgMTUgTDcuMzA1NyA0Ljg4MjggTDEwLjA2MDUgNC44ODI4IFExMS44OTI2IDQuODgyOCAxMi42OTI0IDUuNTAxNSBRMTMuNDkyMiA2LjEyMDEgMTMuNDkyMiA3LjUzNTIgUTEzLjQ5MjIgOS4xNDg0IDEyLjM5ODQgMTAuMDY0NSBRMTEuMzA0NyAxMC45ODA1IDkuMzYzMyAxMC45ODA1IEw4LjcyNzUgMTAuOTgwNSBMOC43Mjc1IDE1IFpNOC43Mjc1IDkuODkzNiBMOS4zMDg2IDkuODkzNiBRMTAuNTg2OSA5Ljg5MzYgMTEuMjg0MiA5LjMwNTcgUTExLjk4MTQgOC43MTc4IDExLjk4MTQgNy42NDQ1IFExMS45ODE0IDYuNzM1NCAxMS40MzQ2IDYuMzQ1NyBRMTAuODg3NyA1Ljk1NjEgOS42MDk0IDUuOTU2MSBMOC43Mjc1IDUuOTU2MSBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.PUSHER_BOND_FORMING = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjEiIGN4PSIyIiBjeT0iOCIgc3Ryb2tlPSJub25lIiAgICAgIC8+PGNpcmNsZSByPSIxIiBjeD0iMTkiIGN5PSI4IiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMiA1IEMyIC0zIDYgLTMgNiAxMSIgICAgICAvPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xOCA1IEMxOCAtMyAxNCAtMyAxNCAxMSIgICAgICAvPjxwYXRoIGQ9Ik02IDE1IEw5IDkuODAzOCBDOSA5LjgwMzggOC40IDEwLjg0MzEgNiAxMC44NDMxIFoiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49ImJldmVsIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNNiAxNSBMOSA5LjgwMzggQzkgOS44MDM4IDguNCAxMC44NDMxIDYgMTAuODQzMSBaIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgICAgICAvPjxwYXRoIGQ9Ik0xNCAxNSBMMTEuNzAzOSA5LjQ1NjcgQzExLjcwMzkgOS40NTY3IDEyLjE2MzEgMTAuNTY1NCAxNCAxMC41NjU0IFoiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49ImJldmVsIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTQgMTUgTDExLjcwMzkgOS40NTY3IEMxMS43MDM5IDkuNDU2NyAxMi4xNjMxIDEwLjU2NTQgMTQgMTAuNTY1NCBaIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgICAgICAvPjxsaW5lIHN0cm9rZS1saW5lY2FwPSJidXR0IiBmaWxsPSJub25lIiB4MT0iMSIgeDI9IjE5IiB5MT0iMTgiIHkyPSIxOCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgICAgICAvPjxsaW5lIHN0cm9rZS1saW5lY2FwPSJidXR0IiBmaWxsPSJub25lIiB4MT0iMSIgeDI9IjE5IiB5MT0iMTkiIHkyPSIxOSIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.PUSHER_DOUBLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjEiIGN4PSIxIiBjeT0iMTkiIHN0cm9rZT0ibm9uZSIgICAgICAvPjxjaXJjbGUgcj0iMSIgY3g9IjUiIGN5PSIxOSIgc3Ryb2tlPSJub25lIiAgICAgIC8+PHBhdGggZmlsbD0ibm9uZSIgZD0iTTIgMTYgQzIgLTMgMTYgLTMgMTYgMTUiICAgICAgLz48cGF0aCBkPSJNMTYgMTcgTDE0LjE0NTkgMTEuMjkzNyBDMTQuMTQ1OSAxMS4yOTM3IDE0LjUxNjcgMTIuNDM0OSAxNiAxMi40MzQ5IEMxNy40ODMzIDEyLjQzNDkgMTcuODU0MSAxMS4yOTM3IDE3Ljg1NDEgMTEuMjkzNyBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTYgMTcgTDE0LjE0NTkgMTEuMjkzNyBDMTQuMTQ1OSAxMS4yOTM3IDE0LjUxNjcgMTIuNDM0OSAxNiAxMi40MzQ5IEMxNy40ODMzIDEyLjQzNDkgMTcuODU0MSAxMS4yOTM3IDE3Ljg1NDEgMTEuMjkzNyBaIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.PUSHER_SINGLE = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIHI9IjEiIGN4PSIzIiBjeT0iMTkiIHN0cm9rZT0ibm9uZSIgICAgICAvPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0yIDE2IEMyIC0zIDE2IC0zIDE2IDE1IiAgICAgIC8+PHBhdGggZD0iTTE2IDE3IEwxOC4yOTYxIDExLjQ1NjcgQzE4LjI5NjEgMTEuNDU2NyAxNy44MzY5IDEyLjU2NTQgMTYgMTIuNTY1NCBaIiBzdHJva2U9Im5vbmUiICAgICAgLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTYgMTcgTDE4LjI5NjEgMTEuNDU2NyBDMTguMjk2MSAxMS40NTY3IDE3LjgzNjkgMTIuNTY1NCAxNiAxMi41NjU0IFoiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.QUERY = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxLjQ0MzQiIHkxPSI2My4wMzI1IiB4Mj0iNjIuMTM2OSIgeTI9IjYzLjAzMjUiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMDE5MUNCIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDU2OUIiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTU1LjQ0LDY5LjI1N2M0LjQ2NC03LjU0OSw2LjY5Ni0xNi40MzEsNi42OTYtMjYuNjQ5YzAtNS40NC0wLjYyMS0xMC40NTUtMS44NDgtMTUuMDU0CQkJCWMtMS43NDQsMi4yMDctMy43NzUsNC41NTItNi4xMzgsNy4wNDVjLTIuNDA2LDIuNTM5LTQuODA4LDQuODQ4LTcuMTkzLDYuOTQ5YzAuMDEsMC44MjEsMC4wMTUsMS42NTcsMC4wMTUsMi41MTEJCQkJYzAsMTIuODEyLTEuNzI2LDIyLjQxLTUuMTc5LDI4Ljc5NmMtMi4zODcsNC40NTEtNS43MTQsNi42NzctOS45ODMsNi42NzdjLTQuMjQsMC03LjU2Ny0yLjI2NS05Ljk4Mi02Ljc5MgkJCQljLTEuODk0LTMuNTY5LTMuMjY2LTguMTk0LTQuMTIyLTEzLjg2Yy00Ljk1LDEuNjU5LTkuMzkxLDIuNTUtMTMuMTA2LDMuMDA2YzAuODgzLDIuNDIzLDEuOTI3LDQuNzM0LDMuMTgzLDYuOTA3CQkJCWM0LjIyNSw3LjMxMyw5Ljc5MiwxMS45NzksMTYuNjk5LDEzLjk5YzIuMDc5LDYuODEyLDMuMDUzLDYuOTIyLDcuMTY1LDEwLjQ0M2M0LjExNCwzLjUyMiw4Ljc4Myw1LjI4NCwxNC4wMDYsNS4yODQJCQkJYzMuMzQxLDAsNy4xMzItMC43MzYsMTEuMzctMi4yMDZ2LTMuNTQyYy0xLjI2MywwLjMxMS0yLjQ1NiwwLjQ2NC0zLjU3OSwwLjQ2NGMtNC4wOTksMC03LjUxLTEuMjk2LTEwLjIzMy0zLjg4OAkJCQljLTIuNzI0LTIuNTk1LTIuNjEyLTEuNDA3LTMuOTAyLTYuNTU2QzQ1LjU5Nyw4MS4zMTIsNTAuOTc2LDc2LjgwNCw1NS40NCw2OS4yNTd6Ii8+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxLjQ0MjkiIHkxPSIzMS43MjQxIiB4Mj0iNjIuMTM3NSIgeTI9IjMxLjcyNDEiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMDE5MUNCIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDU2OUIiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMl8pOyIgZD0iTTE2LjY0OSw0Mi43ODJjMC0xMS4yMjQsMS4xNTEtMTkuODc0LDMuNDUzLTI1Ljk1MUMyMi44NTQsOS41OTUsMjYuNzU3LDUuOTc1LDMxLjgxLDUuOTc1CQkJCWM1LjI1LDAsOS4yMjUsMy41NjEsMTEuOTIsMTAuNjgzYzIuMDE2LDUuMjY4LDMuMDksMTMuNTY3LDMuMjI4LDI0Ljg5MWMyLjM4NS0yLjEwMiw0Ljc4Ny00LjQxMSw3LjE5My02Ljk0OQkJCQljMi4zNjMtMi40OTMsNC4zOTMtNC44MzgsNi4xMzgtNy4wNDVjLTEuNDE4LTUuMzE0LTMuNjQ3LTEwLjA3My02LjcwMi0xNC4yNjRjLTUuNy03LjgxNy0xMi45NDUtMTEuNzI3LTIxLjczNC0xMS43MjcJCQkJYy04LjgxNiwwLTE2LjA4OSwzLjktMjEuODE3LDExLjY5OUM0LjMwOCwyMS4wNiwxLjQ0MywzMC44NDMsMS40NDMsNDIuNjA4YzAsNy4xMywxLjA2OCwxMy41NDUsMy4xNTcsMTkuMjc4CQkJCWMzLjcxNS0wLjQ1Niw4LjE1Ni0xLjM0NywxMy4xMDYtMy4wMDZDMTcuMDAzLDU0LjIyMiwxNi42NDksNDguODYsMTYuNjQ5LDQyLjc4MnoiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzNfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjEuNDQyOSIgeTE9IjMxLjcyNDEiIHgyPSI2Mi4xMzc1IiB5Mj0iMzEuNzI0MSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMTkxQ0IiLz4JCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNTY5QiIvPgkJCTwvbGluZWFyR3JhZGllbnQ+CQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7IiBkPSJNMTYuNjQ5LDQyLjc4MmMwLTExLjIyNCwxLjE1MS0xOS44NzQsMy40NTMtMjUuOTUxQzIyLjg1NCw5LjU5NSwyNi43NTcsNS45NzUsMzEuODEsNS45NzUJCQkJYzUuMjUsMCw5LjIyNSwzLjU2MSwxMS45MiwxMC42ODNjMi4wMTYsNS4yNjgsMy4wOSwxMy41NjcsMy4yMjgsMjQuODkxYzIuMzg1LTIuMTAyLDQuNzg3LTQuNDExLDcuMTkzLTYuOTQ5CQkJCWMyLjM2My0yLjQ5Myw0LjM5My00LjgzOCw2LjEzOC03LjA0NWMtMS40MTgtNS4zMTQtMy42NDctMTAuMDczLTYuNzAyLTE0LjI2NGMtNS43LTcuODE3LTEyLjk0NS0xMS43MjctMjEuNzM0LTExLjcyNwkJCQljLTguODE2LDAtMTYuMDg5LDMuOS0yMS44MTcsMTEuNjk5QzQuMzA4LDIxLjA2LDEuNDQzLDMwLjg0MywxLjQ0Myw0Mi42MDhjMCw3LjEzLDEuMDY4LDEzLjU0NSwzLjE1NywxOS4yNzgJCQkJYzMuNzE1LTAuNDU2LDguMTU2LTEuMzQ3LDEzLjEwNi0zLjAwNkMxNy4wMDMsNTQuMjIyLDE2LjY0OSw0OC44NiwxNi42NDksNDIuNzgyeiIvPgkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNF8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iLTcuMTQiIHkxPSIzMS43MjQxIiB4Mj0iNjkuNTAzMSIgeTI9IjMxLjcyNDEiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMEFDRUZEIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMTkxQ0IiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTE2LjY0OSw0Mi43ODJjMC0xMS4yMjQsMS4xNTEtMTkuODc0LDMuNDUzLTI1Ljk1MUMyMi44NTQsOS41OTUsMjYuNzU3LDUuOTc1LDMxLjgxLDUuOTc1CQkJCWM1LjI1LDAsOS4yMjUsMy41NjEsMTEuOTIsMTAuNjgzYzIuMDE2LDUuMjY4LDMuMDksMTMuNTY3LDMuMjI4LDI0Ljg5MWMyLjM4NS0yLjEwMiw0Ljc4Ny00LjQxMSw3LjE5My02Ljk0OQkJCQljMi4zNjMtMi40OTMsNC4zOTMtNC44MzgsNi4xMzgtNy4wNDVjLTEuNDE4LTUuMzE0LTMuNjQ3LTEwLjA3My02LjcwMi0xNC4yNjRjLTUuNy03LjgxNy0xMi45NDUtMTEuNzI3LTIxLjczNC0xMS43MjcJCQkJYy04LjgxNiwwLTE2LjA4OSwzLjktMjEuODE3LDExLjY5OUM0LjMwOCwyMS4wNiwxLjQ0MywzMC44NDMsMS40NDMsNDIuNjA4YzAsNy4xMywxLjA2OCwxMy41NDUsMy4xNTcsMTkuMjc4CQkJCWMzLjcxNS0wLjQ1Niw4LjE1Ni0xLjM0NywxMy4xMDYtMy4wMDZDMTcuMDAzLDU0LjIyMiwxNi42NDksNDguODYsMTYuNjQ5LDQyLjc4MnoiLz4JCTwvZz4JCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDREOEE7c3Ryb2tlLXdpZHRoOjIuNTg3MjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNNDMuMjExLDg5LjMzOQkJCWMtMi43MjQtMi41OTUtMi42MTItMS40MDctMy45MDItNi41NTZjNi4yODktMS40NzEsMTEuNjY3LTUuOTc5LDE2LjEzMi0xMy41MjZjNC40NjQtNy41NDksNi42OTYtMTYuNDMxLDYuNjk2LTI2LjY0OQkJCWMwLTUuNDQtMC42MjEtMTAuNDU1LTEuODQ4LTE1LjA1NGMtMS40MTgtNS4zMTQtMy42NDctMTAuMDczLTYuNzAyLTE0LjI2NGMtNS43LTcuODE3LTEyLjk0NS0xMS43MjctMjEuNzM0LTExLjcyNwkJCWMtOC44MTYsMC0xNi4wODksMy45LTIxLjgxNywxMS42OTlDNC4zMDgsMjEuMDYsMS40NDMsMzAuODQzLDEuNDQzLDQyLjYwOGMwLDcuMTMsMS4wNjgsMTMuNTQ1LDMuMTU3LDE5LjI3OAkJCWMwLjg4MywyLjQyMywxLjkyNyw0LjczNCwzLjE4Myw2LjkwN2M0LjIyNSw3LjMxMyw5Ljc5MiwxMS45NzksMTYuNjk5LDEzLjk5YzIuMDc5LDYuODEyLDMuMDUzLDYuOTIyLDcuMTY1LDEwLjQ0MwkJCWM0LjExNCwzLjUyMiw4Ljc4Myw1LjI4NCwxNC4wMDYsNS4yODRjMy4zNDEsMCw3LjEzMi0wLjczNiwxMS4zNy0yLjIwNnYtMy41NDJjLTEuMjYzLDAuMzExLTIuNDU2LDAuNDY0LTMuNTc5LDAuNDY0CQkJQzQ5LjM0NSw5My4yMjcsNDUuOTM0LDkxLjkzMSw0My4yMTEsODkuMzM5eiBNMzEuODEsNzkuNTMyYy00LjI0LDAtNy41NjctMi4yNjUtOS45ODItNi43OTIJCQljLTEuODk0LTMuNTY5LTMuMjY2LTguMTk0LTQuMTIyLTEzLjg2Yy0wLjcwMy00LjY1OC0xLjA1Ny0xMC4wMi0xLjA1Ny0xNi4wOThjMC0xMS4yMjQsMS4xNTEtMTkuODc0LDMuNDUzLTI1Ljk1MQkJCUMyMi44NTQsOS41OTUsMjYuNzU3LDUuOTc1LDMxLjgxLDUuOTc1YzUuMjUsMCw5LjIyNSwzLjU2MSwxMS45MiwxMC42ODNjMi4wMTYsNS4yNjgsMy4wOSwxMy41NjcsMy4yMjgsMjQuODkxCQkJYzAuMDEsMC44MjEsMC4wMTUsMS42NTcsMC4wMTUsMi41MTFjMCwxMi44MTItMS43MjYsMjIuNDEtNS4xNzksMjguNzk2QzM5LjQwNyw3Ny4zMDcsMzYuMDgsNzkuNTMyLDMxLjgxLDc5LjUzMnoiLz4JPC9nPgk8Zz4JCTxwYXRoIGQ9Ik04NS4wMDMsNTMuMzMxYy0xLjE5NSwyLjczMi0xLjMyOCw1LjI3Ni0xLjMyOCw3LjcyNnYxLjYwMmgtOS40MzN2LTEuNjAyYzAtMy42NzUsMC43OTctNy4yNTYsMS45MjctOS44CQkJYzMuOTE4LTguNDgsMTQuMzQ4LTguOTUyLDE0LjM0OC0xOC44NDVjMC03LjA2Ny01LjQ0Ny05LjMyOS0xMC44OTQtOS4zMjljLTQuOTgyLDAtNy41OTcsMS44ODUtMTIuNDQ2LDQuOTk0di05LjYxMQkJCWM0Ljc4Mi0zLjAxNSw3LjQ2NC00LjI0LDEyLjM3OS00LjI0YzEwLjIzLDAsMjAuMzk0LDUuMTgzLDIwLjM5NCwxNi45NjFDOTkuOTQ5LDQzLjQzNyw4OC43ODksNDUuMDM5LDg1LjAwMyw1My4zMzF6CQkJIE03NC4yNDIsODQuMDQ5VjcwLjY2OGg5LjQzM3YxMy4zODFINzQuMjQyeiIvPgk8L2c+PC9nPjwvc3ZnPg==';
	d.REDO = 'PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjwvZGVmcz48Zz48cGF0aCBkPSJNIDIwLjYzMDQzNDc4MjYwODY5NSAxMy43MTk1NjUyMTczOTEzMDQgQyAyMC42MzA0MzQ3ODI2MDg2OTUgMTguMjA5ODgwMzU3MzE5OTI1IDE2Ljk5MDMxNTEzOTkyODYyNiAyMS44NSAxMi41IDIxLjg1IDguMDA5Njg0ODYwMDcxMzc4IDIxLjg1IDQuMzY5NTY1MjE3MzkxMzA2IDE4LjIwOTg4MDM1NzMxOTkzIDQuMzY5NTY1MjE3MzkxMzA1IDEzLjcxOTU2NTIxNzM5MTMwNiA0LjM2OTU2NTIxNzM5MTMwNSA5LjIyOTI1MDA3NzQ2MjY4IDguMDA5Njg0ODYwMDcxMzc0IDUuNTg5MTMwNDM0NzgyNjExIDEyLjQ5OTk5OTk5OTk5OTk5OCA1LjU4OTEzMDQzNDc4MjYwOSBNIDEyLjUgMy4xNTAwMDAwMDAwMDAwMDA0IEwgMTcuMzc4MjYwODY5NTY1MjE3IDUuNTg5MTMwNDM0NzgyNjA5IDEyLjUgOC4wMjgyNjA4Njk1NjUyMTggWiIgc3Ryb2tlPSIjODg4ODg4IiBzdHJva2Utd2lkdGg9IjIuMyIgZmlsbD0ibm9uZSI+PC9wYXRoPjwvZz48L3N2Zz4=';
	d.REMOVE_LONE_PAIR = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIGZpbGw9Im5vbmUiIHI9IjIiIGN4PSI2IiBjeT0iMTAiICAgICAgLz48Y2lyY2xlIGZpbGw9Im5vbmUiIHI9IjIiIGN4PSIxNCIgY3k9IjEwIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.REMOVE_RADICAL = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIGZpbGw9Im5vbmUiIHI9IjIiIGN4PSIxMCIgY3k9IjEwIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.RING_ARBITRARY = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZGVmcyBpZD0iZGVmczEiICAgID48bGluZWFyR3JhZGllbnQgeDE9IjE1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDI9IjIwIiB5MT0iMTUiIHkyPSIyMCIgaWQ9ImxpbmVhckdyYWRpZW50MSIgc3ByZWFkTWV0aG9kPSJwYWQiICAgICAgPjxzdG9wIHN0b3Atb3BhY2l0eT0iMSIgc3RvcC1jb2xvcj0iYmx1ZSIgb2Zmc2V0PSIwJSIgICAgICAgIC8+PHN0b3Agc3RvcC1vcGFjaXR5PSIxIiBzdG9wLWNvbG9yPSJibGFjayIgb2Zmc2V0PSIxMDAlIiAgICAgIC8+PC9saW5lYXJHcmFkaWVudCAgICA+PC9kZWZzICAgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48Y2lyY2xlIGZpbGw9Im5vbmUiIHI9IjkiIGN4PSIxMCIgY3k9IjEwIiAgICAvPjwvZyAgICA+PGcgZm9udC1zaXplPSIxNCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudDEpIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmb250LWZhbWlseT0ic2VyaWYiIHN0cm9rZT0idXJsKCNsaW5lYXJHcmFkaWVudDEpIiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiIGZvbnQtd2VpZ2h0PSJib2xkIiAgICA+PHBhdGggZD0iTTcuMjI1NiAxMy42NjUgUTcuNjA4NCAxMy42MTcyIDcuNzg5NiAxMy40NTY1IFE3Ljk3MDcgMTMuMjk1OSA3Ljk3MDcgMTIuODE3NCBMNy45NzA3IDguNzAyMSBRNy45NzA3IDguMjc4MyA3LjgyMzcgOC4xMTQzIFE3LjY3NjggNy45NTAyIDcuMjI1NiA3Ljg5NTUgTDcuMjI1NiA3LjU1MzcgTDkuODc3OSA3LjU1MzcgTDkuODc3OSA4LjU1ODYgUTEwLjIxMjkgOC4wNTI3IDEwLjcyOSA3LjcyMTIgUTExLjI0NTEgNy4zODk2IDExLjg3NCA3LjM4OTYgUTEyLjc3NjQgNy4zODk2IDEzLjI3MiA3Ljg1NDUgUTEzLjc2NzYgOC4zMTkzIDEzLjc2NzYgOS40ODgzIEwxMy43Njc2IDEyLjg3MjEgUTEzLjc2NzYgMTMuMzQzOCAxMy45MjgyIDEzLjQ4MDUgUTE0LjA4ODkgMTMuNjE3MiAxNC40NjQ4IDEzLjY2NSBMMTQuNDY0OCAxNCBMMTEuMTc2OCAxNCBMMTEuMTc2OCAxMy42NjUgUTExLjU1MjcgMTMuNTg5OCAxMS42ODk1IDEzLjQ2IFExMS44MjYyIDEzLjMzMDEgMTEuODI2MiAxMi44NzIxIEwxMS44MjYyIDkuNDgxNCBRMTEuODI2MiA5LjAwMjkgMTEuNzMwNSA4Ljc2MzcgUTExLjU2NjQgOC4zMzMgMTEuMDgxMSA4LjMzMyBRMTAuNzE4OCA4LjMzMyAxMC40MTQ2IDguNTk2MiBRMTAuMTEwNCA4Ljg1OTQgOS45NDYzIDkuMTI2IEw5Ljk0NjMgMTIuODcyMSBROS45NDYzIDEzLjMzMDEgMTAuMDgzIDEzLjQ2IFExMC4yMTk3IDEzLjU4OTggMTAuNTk1NyAxMy42NjUgTDEwLjU5NTcgMTQgTDcuMjI1NiAxNCBaIiBzdHJva2U9Im5vbmUiICAgIC8+PC9nICA+PC9nPjwvc3ZnPg==';
	d.SAVE = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxLjYyNiIgeTE9IjQ5Ljk3MjEiIHgyPSI5OC40NjA5IiB5Mj0iNDkuOTcyMSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMDExIiBzdHlsZT0ic3RvcC1jb2xvcjojOEJCOEQ2Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMDI2NSIgc3R5bGU9InN0b3AtY29sb3I6Izg2QjFENCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjA5NzYiIHN0eWxlPSJzdG9wLWNvbG9yOiM3Mzk2Q0UiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4xNjk4IiBzdHlsZT0ic3RvcC1jb2xvcjojNjY4MkM5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjQyOSIgc3R5bGU9InN0b3AtY29sb3I6IzVFNzdDNiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjMxODciIHN0eWxlPSJzdG9wLWNvbG9yOiM1QjczQzUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42OTIzIiBzdHlsZT0ic3RvcC1jb2xvcjojNURBMUNFIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ODdEQ0QiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pO3N0cm9rZTojMDA3M0JGO3N0cm9rZS13aWR0aDozLjA0MTk7IiBwb2ludHM9IjgyLjg3NSwxLjYzMiA3Ljc1OSwxLjYzMiAxLjYyNiw3LjQ5MSAJCQkJMS42MjYsOTIuMDk4IDguMjcyLDk4LjMxMiA5Mi41OCw5OC4zMTIgOTguNDYxLDkyLjgxNiA5OC40NjEsMTUuNjE3IAkJCSIvPgkJCTxyZWN0IHg9IjIzLjA5IiB5PSIxLjY4OCIgc3R5bGU9ImZpbGw6IzAwNjM5RjsiIHdpZHRoPSI1Ni43MjIiIGhlaWdodD0iMzEuNjEzIi8+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzNC44NDM4IiB5MT0iMTcuNDk3IiB4Mj0iNzkuNDE4OSIgeTI9IjE3LjQ5NyI+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMDExIiBzdHlsZT0ic3RvcC1jb2xvcjojQjlCOUI5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMDc0NiIgc3R5bGU9InN0b3AtY29sb3I6I0M4QzhDOCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjE1NjYiIHN0eWxlPSJzdG9wLWNvbG9yOiNEM0QzRDMiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4yNDE4IiBzdHlsZT0ic3RvcC1jb2xvcjojRDdEN0Q3Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNzc5MSIgc3R5bGU9InN0b3AtY29sb3I6IzgxODE4MSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMzgzODNCIi8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzJfKTsiIHBvaW50cz0iNzkuNDE5LDMyLjc2MiAzNC44NzgsMzIuNzYyIDM0Ljg0NCwyLjIzMiA3OS4zNzksMi4yMzIgCQkJIi8+CQkJPHJlY3QgeD0iNjIuOTQ1IiB5PSI3LjQ5MSIgd2lkdGg9IjExLjI0NSIgaGVpZ2h0PSIxOS4xMjMiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzNfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwLjk0MTQiIHkxPSI0OS4zMzg5IiB4Mj0iNTAuOTQxNCIgeTI9Ijk3LjEzNzciPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRDFEMkQyIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNTY3MyIgc3R5bGU9InN0b3AtY29sb3I6I0M5QzlDOCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjYwOTkiIHN0eWxlPSJzdG9wLWNvbG9yOiNDOEM4QzciLz4JCQkJPHN0b3AgIG9mZnNldD0iMC45ODkiIHN0eWxlPSJzdG9wLWNvbG9yOiNBMkEyQTEiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxyZWN0IHg9IjIyLjA3MSIgeT0iNDkuMzM5IiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzNfKTsiIHdpZHRoPSI1Ny43NCIgaGVpZ2h0PSI0Ny43OTkiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjUwLjk0MTQiIHkxPSI0OS4zMzg5IiB4Mj0iNTAuOTQxNCIgeTI9IjczLjMwNTQiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZGRkZGIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMzE4NiIgc3R5bGU9InN0b3AtY29sb3I6I0Y1RjVGNSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjg1OTQiIHN0eWxlPSJzdG9wLWNvbG9yOiNEQ0RDREEiLz4JCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0Q0RDREMiIvPgkJCTwvbGluZWFyR3JhZGllbnQ+CQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF80Xyk7IiBkPSJNNzkuODEyLDU4LjY3MXYtOS4zMzJoLTU3Ljc0djIzLjM0OGMyLjI3OSwwLjg2MywxOS43OTUsMS41MTIsMjUuNzg5LTMuMDE4CQkJCWMzLjc5LTIuODU2LDEzLjM2OC0xMC45OTgsMjAuMjgyLTExLjg1N0M3NS4wNjIsNTYuOTUsNzkuODEyLDU4LjY3MSw3OS44MTIsNTguNjcxeiIvPgkJCTxyZWN0IHg9Ijg1LjQzMiIgeT0iODUuODg1IiB3aWR0aD0iNi4xMzIiIGhlaWdodD0iNC43NzkiLz4JCQk8cmVjdCB4PSI5LjMiIHk9Ijg1Ljg4NSIgd2lkdGg9IjYuMTI1IiBoZWlnaHQ9IjQuNzc5Ii8+CQk8L2c+CTwvZz48L2c+PC9zdmc+';
	d.SEARCH = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0MzMzLjY3OTIiIHkxPSI1OTI2Ljg5NSIgeDI9IjQzNjkuMDEwNyIgeTI9IjU5NTYuNjI2IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC0wLjk4ODQgMC4xNTE2IC0wLjE1MTYgLTAuOTg4NCA1MjI0LjQ2MTQgNTI2NC4yNTU5KSI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzAwNzU2MyIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuMTExMSIgc3R5bGU9InN0b3AtY29sb3I6IzEzOTA1MyIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuMjc3NiIgc3R5bGU9InN0b3AtY29sb3I6IzJDQjEzRiIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuNDQ4NCIgc3R5bGU9InN0b3AtY29sb3I6IzNGQ0MzMCIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuNjIzIiBzdHlsZT0ic3RvcC1jb2xvcjojNENERTI1Ii8+CQkJPHN0b3AgIG9mZnNldD0iMC44MDM3IiBzdHlsZT0ic3RvcC1jb2xvcjojNTRFOTFFIi8+CQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzU3RUQxQyIvPgkJPC9saW5lYXJHcmFkaWVudD4JCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTQwLjc2Niw0Mi4yMmMyLjcyOC0wLjQxOCw1LjI3MiwxLjQxOCw1LjY4Miw0LjEwMkw0OC4wMTEsNTYuNQkJCWMwLjQxMSwyLjY4NS0xLjQ2Niw1LjE5OS00LjE5Myw1LjYybC0wLjAzOSwwLjAwMWwtMTEuOTYyLDEuNzQybDAuNTM2LDMuNzA5YzAuNDAzLDIuNzk5LTEuMzcsNC4yMTctMy45MzksMy4xNTNMMi44MDksNjAuMDM5CQkJYy0yLjUyNC0xLjE3MS0yLjcyOC0zLjQ5LTAuNDU3LTUuMTU0bDIxLjI2My0xNi45NjFjMi4yMDItMS43NTYsNC4zMzMtMC45MDQsNC43MzYsMS44OTNsMC41OTEsNC4wOTRsMTEuNzg0LTEuNjg5TDQwLjc2Niw0Mi4yMnoJCQkiLz4JCTxnPgkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xNDUuODIzNSIgeTE9Ii01LjAyNDMiIHgyPSItOTguOTYxMSIgeTI9Ii01LjAyNDMiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMC45ODg0IC0wLjE1MTYgMC4xNTE2IDAuOTg4NCAxNDQuNTgyMyAzMy40MDQ0KSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNDN0ZGN0QiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42OTk0IiBzdHlsZT0ic3RvcC1jb2xvcjojNDZERTVCIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuOTg3NyIgc3R5bGU9InN0b3AtY29sb3I6IzNGQzc1MiIvPgkJCTwvbGluZWFyR3JhZGllbnQ+CQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8yXyk7IiBkPSJNNDYuOTU1LDQ5LjYxNmwtMC41MDYtMy4yOTRjLTAuNDEtMi42ODQtMi45NTQtNC41MjEtNS42ODItNC4xMDJsLTAuMDQsMC4wMDIJCQkJbC0xMS43ODQsMS42ODlsLTAuNTkxLTQuMDk0Yy0wLjQwMy0yLjc5Ny0yLjUzNC0zLjY0OS00LjczNi0xLjg5M0wyLjM1Myw1NC44ODVjLTEuNDk2LDEuMDk2LTEuOTE4LDIuNDc2LTEuMzExLDMuNjI2CQkJCWMwLDAsMTMuMDgyLDEuMzE0LDIyLjk4LTMuODY0YzkuODk4LTUuMTgyLDEzLjk5My02LjUyNiwxNy41OTctNi4zNjNDNDUuMjI2LDQ4LjQ0Niw0Ni45NTUsNDkuNjE2LDQ2Ljk1NSw0OS42MTZ6Ii8+CQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNDY4LjAyNzEiIHkxPSI2MTk5LjI3NjkiIHgyPSI0NjguMDI3MSIgeTI9IjYyMzcuNzI2MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC4zMTA4IDAuOTUwNSAtMC45NTA1IC0wLjMxMDggNjA3OS43NzgzIDE1MzguOTEzNSkiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQTZFQjRCIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOEZGQzkiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfM18pOyIgZD0iTTMxLjczLDQ1Ljk2NmMtMi41NjQsMC40LTMuMDY3LDAuNjM2LTQuMDExLDAuNjA4Yy0wLjUzNi0wLjAxNS0xLjE0LTAuNDQxLTEuMzUzLTEuODczCQkJCWMtMC4xNzEtMS4xNjctMC4zNzUtMS43OTEtMC41OTEtMy41OTNjLTAuMTUxLTEuMjM2LTAuOTU2LTAuNzk5LTEuMTU4LTAuNjYxQzIzLjU3MSw0MS4xNjgsMi42NzUsNTcuNDQ1LDQuMjU5LDU2LjE0MgkJCQljMC4wMTYtMC4wMTQtMS44NjYsMS4zOTYtMi41MjEsMi4yMDZjLTAuNTM4LDAuNjY1LTAuODgxLTEuOTY5LDEuMjUxLTMuMzVjMS4xMzctMC43MzYsMTkuNjM1LTE2LjAwMywyMC4zNTItMTYuNTMzCQkJCWMwLjg0NS0wLjYyOCwxLjg5NC0xLjQ0MywyLjgwMy0xLjE4N2MwLjkwOSwwLjI1NiwxLjY0NiwxLjI5MywxLjg4NiwyLjE4YzAuMjQxLDAuODg0LDEuMDEzLDQuNzc5LDEuMDEzLDQuNzc5bDEyLjMyOS0xLjYxMQkJCQljMCwwLDEuNDg4LDAuMjQ5LDIuMTYzLDAuNjUzYzAuNjc0LDAuNDA3LDIuMjQ4LDEuODk0LDIuMjQ4LDEuODk0cy0xLjAzNC0wLjM1OS0yLjM4MS0wLjQ3CQkJCUM0Mi40Niw0NC42MjMsNDAuMjA4LDQ0LjY0MywzMS43Myw0NS45NjZ6Ii8+CQk8L2c+CQk8Zz4JCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItMTQ1LjA1MzIiIHkxPSIxMS40MDg4IiB4Mj0iLTk5LjY0MjMiIHkyPSIxMS40MDg4IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTg4NCAtMC4xNTE2IDAuMTUxNiAwLjk4ODQgMTQ0LjU4MjMgMzMuNDA0NCkiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjAxMjMiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEQ2NjUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC40NTQiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDkyNDUiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42MTY1IiBzdHlsZT0ic3RvcC1jb2xvcjojMDA4QjQzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODUyOCIgc3R5bGU9InN0b3AtY29sb3I6IzAwNzgzQyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMDA2ODM3Ii8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzRfKTsiIGQ9Ik0zNC42NCw2MC43OTdjLTIuNTU4LDAuNDM1LTMuMDgsMC41NjktMy45NDQsMC45NTJjLTAuNDg5LDAuMjE3LTAuODE0LDAuODI0LTAuNTQxLDIuMjQ1CQkJCWMwLjIzNiwxLjI1LDAuMjc0LDEuNzk3LDAuNTc2LDMuNTg3YzAuMjE2LDEuMjc5LTAuODg1LDEuMTU4LTEuMTIzLDEuMTA2Yy0xLjI0Mi0wLjI3LTI2LjY4Mi05LjYwMy0yNC43NzktOC44MzYJCQkJYzAuMDIxLDAuMDExLTIuMTk4LTAuNzcxLTMuMDY1LTEuMzQ3Yy0wLjMyOS0wLjIxOCwwLjU1MywxLjk1MSwyLjUzNSwyLjUwMmMyLjMwOSwwLjY0MSwyMy41OTYsOS4zNTUsMjQuNjQxLDkuNTU0CQkJCWMxLjAzNCwwLjE5NywyLjQyNCwwLjM3LDMuMTY5LTAuMjA5YzAuNzQ1LTAuNTgsMC43MzItMS4zNjksMC42MjEtMi4yNzljLTAuMTEyLTAuOTA5LTEuMDI5LTQuNjI2LTEuMDI5LTQuNjI2bDEyLjM1Ni0yLjE1OAkJCQljMCwwLDEuNTc2LTAuMzQ0LDIuMDk3LTAuOTM1YzAuNTIxLTAuNTg4LDEuNDU3LTEuOTY5LDEuNDU3LTEuOTY5cy0xLjYxNiwwLjYwNi0zLjYwMSwwLjkwOQkJCQlDNDIuNTU5LDU5LjUxNywzOS40NTIsNTkuOTc4LDM0LjY0LDYwLjc5N3oiLz4JCTwvZz4JCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMzQTYxNUE7c3Ryb2tlLXdpZHRoOjEuNDE2MztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNNDAuNzY2LDQyLjIyCQkJYzIuNzI4LTAuNDE4LDUuMjcyLDEuNDE4LDUuNjgyLDQuMTAyTDQ4LjAxMSw1Ni41YzAuNDExLDIuNjg1LTEuNDY2LDUuMTk5LTQuMTkzLDUuNjJsLTAuMDM5LDAuMDAxbC0xMS45NjIsMS43NDJsMC41MzYsMy43MDkJCQljMC40MDMsMi43OTktMS4zNyw0LjIxNy0zLjkzOSwzLjE1M0wyLjgwOSw2MC4wMzljLTIuNTI0LTEuMTcxLTIuNzI4LTMuNDktMC40NTctNS4xNTRsMjEuMjYzLTE2Ljk2MQkJCWMyLjIwMi0xLjc1Niw0LjMzMy0wLjkwNCw0LjczNiwxLjg5M2wwLjU5MSw0LjA5NGwxMS43ODQtMS42ODlMNDAuNzY2LDQyLjIyeiIvPgk8L2c+CTxnPgkJPGc+CQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzY2LjQ1NjMiIHkxPSI0Ny4zNzQ1IiB4Mj0iMzY2LjQ1NjMiIHkyPSI1NS43NDM5IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTM3MiAwLjM0ODcgLTAuMzQ4NyAwLjkzNzIgLTI2Ny4xMzA5IC0xNTEuMzU2MykiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojOTk5OTk5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMTEzIiBzdHlsZT0ic3RvcC1jb2xvcjojQzhDOEM4Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjAxNyIgc3R5bGU9InN0b3AtY29sb3I6I0U3RTdFNyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjI1MTUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGMkYyRjIiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4yNzg4IiBzdHlsZT0ic3RvcC1jb2xvcjojRTRFNEU0Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMzkzMyIgc3R5bGU9InN0b3AtY29sb3I6I0FGQUZBRiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwMDMiIHN0eWxlPSJzdG9wLWNvbG9yOiM4NDg0ODQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC41OTY0IiBzdHlsZT0ic3RvcC1jb2xvcjojNjY2NjY2Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNjc4MyIgc3R5bGU9InN0b3AtY29sb3I6IzU0NTQ1NCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjczNjIiIHN0eWxlPSJzdG9wLWNvbG9yOiM0RDRENEQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC45OTM5IiBzdHlsZT0ic3RvcC1jb2xvcjojOTk5OTk5Ii8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzVfKTsiIHBvaW50cz0iNzcuMTA3LDM2LjEyMiAzNi42NSwyMS4xNDYgMzkuNTU4LDEzLjM3NiA4MC4wMTcsMjguMzUxIAkJCSIvPgkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzZfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii04My45MzQ0IiB5MT0iLTYzNi43NDkxIiB4Mj0iLTgzLjkzNDQiIHkyPSItNjI3LjAzNjYiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMC40NTYgLTAuODkgMC44OSAwLjQ1NiA2NjcuMzgyOSAyNzQuMTA3OCkiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojOTk5OTk5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMTEzIiBzdHlsZT0ic3RvcC1jb2xvcjojQzhDOEM4Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMjAxNyIgc3R5bGU9InN0b3AtY29sb3I6I0U3RTdFNyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjI1MTUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGMkYyRjIiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4yNzg4IiBzdHlsZT0ic3RvcC1jb2xvcjojRTRFNEU0Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMzkzMyIgc3R5bGU9InN0b3AtY29sb3I6I0FGQUZBRiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjUwMDMiIHN0eWxlPSJzdG9wLWNvbG9yOiM4NDg0ODQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC41OTY0IiBzdHlsZT0ic3RvcC1jb2xvcjojNjY2NjY2Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNjc4MyIgc3R5bGU9InN0b3AtY29sb3I6IzU0NTQ1NCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjczNjIiIHN0eWxlPSJzdG9wLWNvbG9yOiM0RDRENEQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC45OTM5IiBzdHlsZT0ic3RvcC1jb2xvcjojOTk5OTk5Ii8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzZfKTsiIHBvaW50cz0iODAuNjgxLDQ0LjA3NyA2MC40NjcsODAuOTI2IDUyLjc2OCw3Ny4yNTYgNzIuOTg2LDQwLjQwNiAJCQkiLz4JCQkJCQkJPHJhZGlhbEdyYWRpZW50IGlkPSJTVkdJRF83XyIgY3g9IjU0LjUxMzciIGN5PSItOC45MjkiIHI9IjE1LjkwNjEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMS4wMjk2IC0wLjA4MDUgMC4wODUyIDAuOTcyNyAyNy42MDQ2IDQ0LjU1NjYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MEUwRUYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC40OTY5IiBzdHlsZT0ic3RvcC1jb2xvcjojNjVCMUQ5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNjA2NSIgc3R5bGU9InN0b3AtY29sb3I6IzVGQTZEMyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjgwMTIiIHN0eWxlPSJzdG9wLWNvbG9yOiM0RDg3QzIiLz4JCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM4NjJBRSIvPgkJCTwvcmFkaWFsR3JhZGllbnQ+CQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF83Xyk7IiBkPSJNOTkuMjcyLDM0LjQyNGMwLjc0OCw4LjU0Ny01Ljk3NSwxNi4wNDctMTUuMDIxLDE2Ljc1MQkJCQljLTkuMDQ4LDAuNzExLTE2Ljk4NS01LjY0NS0xNy43MzUtMTQuMTg5Yy0wLjc0Ni04LjU0NSw1Ljk3Ny0xNi4wNDksMTUuMDI2LTE2Ljc1NEM5MC41ODYsMTkuNTIxLDk4LjUyNSwyNS44NzgsOTkuMjcyLDM0LjQyNHoiCQkJCS8+CQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfOF8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNTAuMTg2IiB5MT0iLTYuMzA2OCIgeDI9IjUwLjE4NiIgeTI9Ii0yMy41MTk3IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTk2NiAtMC4wODI1IDAuMDgyNSAwLjk5NjYgMzMuNjE4NiA0OS4wNjQ2KSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NUIxRDkiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC4xNTk2IiBzdHlsZT0ic3RvcC1jb2xvcjojNkRCQ0RFIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNDQyNCIgc3R5bGU9InN0b3AtY29sb3I6IzgxREJFRCIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDIiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MkY0RjkiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfOF8pOyIgZD0iTTk0LjI2NiwyOS41OTRjMC4zOTEsNC40ODUtNC41ODEsOC41MzItMTEuMTExLDkuMDQyCQkJCWMtNi41MzQsMC41MS0xMi4xNDItMi43MTEtMTIuNTM3LTcuMTkzYy0wLjM5MS00LjQ4Nyw0LjYxNC05LjQ1MiwxMS4xNDUtOS45NjNDODguMjk0LDIwLjk3MSw5My44NzIsMjUuMTEsOTQuMjY2LDI5LjU5NHoiLz4JCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMkUzMTkyO3N0cm9rZS13aWR0aDoxLjQyNzg7IiBkPSJNOTkuMjcyLDM0LjQyNGMwLjc0OCw4LjU0Ny01Ljk3NSwxNi4wNDctMTUuMDIxLDE2Ljc1MQkJCQljLTkuMDQ4LDAuNzExLTE2Ljk4NS01LjY0NS0xNy43MzUtMTQuMTg5Yy0wLjc0Ni04LjU0NSw1Ljk3Ny0xNi4wNDksMTUuMDI2LTE2Ljc1NEM5MC41ODYsMTkuNTIxLDk4LjUyNSwyNS44NzgsOTkuMjcyLDM0LjQyNHoiCQkJCS8+CQkJCQkJCTxyYWRpYWxHcmFkaWVudCBpZD0iU1ZHSURfOV8iIGN4PSIyNS43MzY4IiBjeT0iMzUuNzQxOCIgcj0iMTUuOTA2MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxLjAyOTYgLTAuMDgwNSAwLjA4NTIgMC45NzI3IDI3LjYwNDYgNDQuNTU2NikiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4JCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzgwRTBFRiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjQ5NjkiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NUIxRDkiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42MDY1IiBzdHlsZT0ic3RvcC1jb2xvcjojNUZBNkQzIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuODAxMiIgc3R5bGU9InN0b3AtY29sb3I6IzREODdDMiIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMzg2MkFFIi8+CQkJPC9yYWRpYWxHcmFkaWVudD4JCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzlfKTsiIGQ9Ik03My40NSw4MC4xOTJjMC43NDYsOC41NDYtNS45NzcsMTYuMDQ1LTE1LjAyMiwxNi43NQkJCQljLTkuMDQ4LDAuNzEtMTYuOTg2LTUuNjQ1LTE3LjczNS0xNC4xODlDMzkuOTQ2LDc0LjIwOCw0Ni42Nyw2Ni43MDQsNTUuNzE5LDY2QzY0Ljc2Myw2NS4yOSw3Mi43MDEsNzEuNjQ2LDczLjQ1LDgwLjE5MnoiLz4JCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xMF8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMjAuNjc0NiIgeTE9IjM3LjE3MzMiIHgyPSIyMC42NzQ2IiB5Mj0iMTkuOTYxNiIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLjk5NjYgLTAuMDgyNSAwLjA4MjUgMC45OTY2IDMzLjYxODYgNDkuMDY0NikiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVCMUQ5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMTU5NiIgc3R5bGU9InN0b3AtY29sb3I6IzZEQkNERSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjQ0MjQiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MURCRUQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42NDQyIiBzdHlsZT0ic3RvcC1jb2xvcjojOTJGNEY5Ii8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzEwXyk7IiBkPSJNNjguNDQyLDc1LjM2MWMwLjM5Miw0LjQ4NC00LjU4Miw4LjUzMy0xMS4xMTIsOS4wNDEJCQkJYy02LjUzNCwwLjUxMS0xMi4xNDEtMi43MS0xMi41MzgtNy4xOTJjLTAuMzktNC40ODYsNC42MTUtOS40NTEsMTEuMTQ2LTkuOTYzQzYyLjQ3MSw2Ni43MzgsNjguMDQ4LDcwLjg3OCw2OC40NDIsNzUuMzYxeiIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMyRTMxOTI7c3Ryb2tlLXdpZHRoOjEuNDI3ODsiIGQ9Ik03My40NSw4MC4xOTJjMC43NDYsOC41NDYtNS45NzcsMTYuMDQ1LTE1LjAyMiwxNi43NQkJCQljLTkuMDQ4LDAuNzEtMTYuOTg2LTUuNjQ1LTE3LjczNS0xNC4xODlDMzkuOTQ2LDc0LjIwOCw0Ni42Nyw2Ni43MDQsNTUuNzE5LDY2QzY0Ljc2Myw2NS4yOSw3Mi43MDEsNzEuNjQ2LDczLjQ1LDgwLjE5MnoiLz4JCQkJCQkJPHJhZGlhbEdyYWRpZW50IGlkPSJTVkdJRF8xMV8iIGN4PSIxMC45MjgyIiBjeT0iLTMxLjgwMzIiIHI9IjE1LjkwNjYiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMS4wMjk2IC0wLjA4MDUgMC4wODUyIDAuOTcyNyAyNy42MDQ2IDQ0LjU1NjYpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MEUwRUYiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC40OTY5IiBzdHlsZT0ic3RvcC1jb2xvcjojNjVCMUQ5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuNjA2NSIgc3R5bGU9InN0b3AtY29sb3I6IzVGQTZEMyIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjgwMTIiIHN0eWxlPSJzdG9wLWNvbG9yOiM0RDg3QzIiLz4JCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM4NjJBRSIvPgkJCTwvcmFkaWFsR3JhZGllbnQ+CQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8xMV8pOyIgZD0iTTUyLjQ0OCwxNS42ODNjMC43NDcsOC41NDctNS45NzUsMTYuMDQ3LTE1LjAyMSwxNi43NTIJCQkJYy05LjA0NywwLjcwOC0xNi45ODUtNS42NDYtMTcuNzM1LTE0LjE5QzE4Ljk0NSw5LjcsMjUuNjY5LDIuMTk1LDM0LjcxOCwxLjQ5QzQzLjc2MiwwLjc4LDUxLjcsNy4xMzcsNTIuNDQ4LDE1LjY4M3oiLz4JCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xMl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNS4wNjY3IiB5MT0iLTI4Ljg0NzEiIHgyPSI1LjA2NjciIHkyPSItNDYuMDU5OCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgwLjk5NjYgLTAuMDgyNSAwLjA4MjUgMC45OTY2IDMzLjYxODYgNDkuMDY0NikiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVCMUQ5Ii8+CQkJCTxzdG9wICBvZmZzZXQ9IjAuMTU5NiIgc3R5bGU9InN0b3AtY29sb3I6IzZEQkNERSIvPgkJCQk8c3RvcCAgb2Zmc2V0PSIwLjQ0MjQiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MURCRUQiLz4JCQkJPHN0b3AgIG9mZnNldD0iMC42NDQyIiBzdHlsZT0ic3RvcC1jb2xvcjojOTJGNEY5Ii8+CQkJPC9saW5lYXJHcmFkaWVudD4JCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzEyXyk7IiBkPSJNNDcuNDQsMTAuODUyYzAuMzkyLDQuNDg0LTQuNTgxLDguNTMzLTExLjExMiw5LjA0MQkJCQljLTYuNTM0LDAuNTEtMTIuMTQtMi43MTEtMTIuNTM3LTcuMTkzYy0wLjM5LTQuNDg3LDQuNjE1LTkuNDUyLDExLjE0Ni05Ljk2M0M0MS40NjksMi4yMyw0Ny4wNDgsNi4zNjksNDcuNDQsMTAuODUyeiIvPgkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMyRTMxOTI7c3Ryb2tlLXdpZHRoOjEuNDI3ODsiIGQ9Ik01Mi40NDgsMTUuNjgzYzAuNzQ3LDguNTQ3LTUuOTc1LDE2LjA0Ny0xNS4wMjEsMTYuNzUyCQkJCWMtOS4wNDcsMC43MDgtMTYuOTg1LTUuNjQ2LTE3LjczNS0xNC4xOUMxOC45NDUsOS43LDI1LjY2OSwyLjE5NSwzNC43MTgsMS40OUM0My43NjIsMC43OCw1MS43LDcuMTM3LDUyLjQ0OCwxNS42ODN6Ii8+CQk8L2c+CTwvZz48L2c+PC9zdmc+';
	d.SETTINGS = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxLjIyOSIgeTE9IjUwLjAyNzYiIHgyPSI5OC43OTMiIHkyPSI1MC4wMjc2Ij4JCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMjI5M0NCIi8+CQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzA1NTc5QSIvPgkJPC9saW5lYXJHcmFkaWVudD4JCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTg4LjA4LDQ4Yy0wLjE3Ni0zLjI1My0wLjc1NS02LjM5NC0xLjY5MS05LjM3OWw4LjE4Mi04Ljc3MgkJCWMtMi4wMTgtNC40NC00LjY3OS04LjUyOC03Ljg2NC0xMi4xMzhsLTExLjA0MSw0LjE0NGMtMi41NDctMi4zMTktNS40MDctNC4yOTctOC41MTEtNS44NjFsMC4zODgtMTEuNjE4CQkJYy00LjQ5My0xLjcyMy05LjI5OC0yLjgwNi0xNC4zMTItMy4xMzNsLTUuMDUzLDEwLjczMWMtMy40MywwLjE2NC02Ljc0OCwwLjc3OS05Ljg4MiwxLjc5MmwtNy42ODQtOC42MzMJCQljLTQuODA2LDIuMDc5LTkuMjEsNC45MDctMTMuMDY5LDguMzM2bDQuNSwxMC42NzhjLTIuMzAzLDIuNDgzLTQuMjc4LDUuMjc2LTUuODU3LDguMzA3TDQuNTM1LDMyCQkJYy0xLjc5LDQuNTA1LTIuOTMsOS4zNC0zLjMwNiwxNC4zODdsMTAuNzAzLDUuNWMwLjE1MSwzLjE3OSwwLjY5MSw2LjI1NCwxLjU3Miw5LjE4MWwtOC42MzIsNy44NjUJCQljMS45NzEsNC43MDcsNC42NTgsOS4wNCw3LjkyMiwxMi44NjFsMTAuNzI2LTQuMzNjMi41MjksMi40NDYsNS4zOTUsNC41NDUsOC41MjMsNi4yMThsLTAuNTYxLDExLjY1MwkJCWM0LjU2OSwxLjg3Myw5LjQ4MywzLjA3MSwxNC42MjEsMy40NzhsNS4wNTctMTAuNjUzYzMuNTc2LTAuMTA3LDcuMDI2LTAuNzA2LDEwLjI5Mi0xLjcyOWw3LjU1Niw4LjcxMwkJCWM0Ljk1Ni0yLjA5NSw5LjQ5My00Ljk3NSwxMy40NTgtOC40OTNMNzcuNzIzLDc2LjIzYzIuMzE4LTIuNDUyLDQuMzEzLTUuMjEyLDUuOTE4LTguMjFsMTEuODUxLDAuMDc0CQkJYzEuNzg3LTQuNTA1LDIuOTI4LTkuMzQzLDMuMzAyLTE0LjM5M0w4OC4wOCw0OHogTTUwLjAxMyw2My42MDNjLTcuNDg0LDAtMTMuNTUyLTYuMDY3LTEzLjU1Mi0xMy41NTEJCQljMC03LjQ4MSw2LjA2Ny0xMy41NDcsMTMuNTUyLTEzLjU0N2M3LjQ4MSwwLDEzLjU0OCw2LjA2NiwxMy41NDgsMTMuNTQ3QzYzLjU2MSw1Ny41MzUsNTcuNDk0LDYzLjYwMyw1MC4wMTMsNjMuNjAzeiIvPgk8L2c+CTxnPgkJPGRlZnM+CQkJPHBhdGggaWQ9IlNWR0lEXzJfIiBkPSJNLTIzLjc5LDM0LjkzOWMwLDAsMzIuNTg3LDIwLjM2Nyw3Ny4zOTYsMTAuMTg0YzQ0LjgwOC0xMC4xODQsNTkuMDY0LTMwLjU1LDU5LjA2NC0zMC41NUw5NC4zMzktMTUuOTc5CQkJCUwtMTkuNzE2LDYuNDI1TC0yMy43OSwzNC45Mzl6Ii8+CQk8L2RlZnM+CQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzNfIj4JCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF8yXyIgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPgkJPC9jbGlwUGF0aD4JCTxnIHN0eWxlPSJjbGlwLXBhdGg6dXJsKCNTVkdJRF8zXyk7Ij4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjEuMjI5IiB5MT0iNTAuMDI3NiIgeDI9Ijk4Ljc5MyIgeTI9IjUwLjAyNzYiPgkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNzJEMEZGIi8+CQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMjkzQ0IiLz4JCQk8L2xpbmVhckdyYWRpZW50PgkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTg4LjA4LDQ4Yy0wLjE3Ni0zLjI1My0wLjc1NS02LjM5NC0xLjY5MS05LjM3OWw4LjE4Mi04Ljc3MgkJCQljLTIuMDE4LTQuNDQtNC42NzktOC41MjgtNy44NjQtMTIuMTM4bC0xMS4wNDEsNC4xNDRjLTIuNTQ3LTIuMzE5LTUuNDA3LTQuMjk3LTguNTExLTUuODYxbDAuMzg4LTExLjYxOAkJCQljLTQuNDkzLTEuNzIzLTkuMjk4LTIuODA2LTE0LjMxMi0zLjEzM2wtNS4wNTMsMTAuNzMxYy0zLjQzLDAuMTY0LTYuNzQ4LDAuNzc5LTkuODgyLDEuNzkybC03LjY4NC04LjYzMwkJCQljLTQuODA2LDIuMDc5LTkuMjEsNC45MDctMTMuMDY5LDguMzM2bDQuNSwxMC42NzhjLTIuMzAzLDIuNDgzLTQuMjc4LDUuMjc2LTUuODU3LDguMzA3TDQuNTM1LDMyCQkJCWMtMS43OSw0LjUwNS0yLjkzLDkuMzQtMy4zMDYsMTQuMzg3bDEwLjcwMyw1LjVjMC4xNTEsMy4xNzksMC42OTEsNi4yNTQsMS41NzIsOS4xODFsLTguNjMyLDcuODY1CQkJCWMxLjk3MSw0LjcwNyw0LjY1OCw5LjA0LDcuOTIyLDEyLjg2MWwxMC43MjYtNC4zM2MyLjUyOSwyLjQ0Niw1LjM5NSw0LjU0NSw4LjUyMyw2LjIxOGwtMC41NjEsMTEuNjUzCQkJCWM0LjU2OSwxLjg3Myw5LjQ4MywzLjA3MSwxNC42MjEsMy40NzhsNS4wNTctMTAuNjUzYzMuNTc2LTAuMTA3LDcuMDI2LTAuNzA2LDEwLjI5Mi0xLjcyOWw3LjU1Niw4LjcxMwkJCQljNC45NTYtMi4wOTUsOS40OTMtNC45NzUsMTMuNDU4LTguNDkzTDc3LjcyMyw3Ni4yM2MyLjMxOC0yLjQ1Miw0LjMxMy01LjIxMiw1LjkxOC04LjIxbDExLjg1MSwwLjA3NAkJCQljMS43ODctNC41MDUsMi45MjgtOS4zNDMsMy4zMDItMTQuMzkzTDg4LjA4LDQ4eiBNNTAuMDEzLDYzLjYwM2MtNy40ODQsMC0xMy41NTItNi4wNjctMTMuNTUyLTEzLjU1MQkJCQljMC03LjQ4MSw2LjA2Ny0xMy41NDcsMTMuNTUyLTEzLjU0N2M3LjQ4MSwwLDEzLjU0OCw2LjA2NiwxMy41NDgsMTMuNTQ3QzYzLjU2MSw1Ny41MzUsNTcuNDk0LDYzLjYwMyw1MC4wMTMsNjMuNjAzeiIvPgkJPC9nPgk8L2c+CTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNDMkVCRkY7c3Ryb2tlLXdpZHRoOjMuMDU1MTsiIGQ9Ik02Ny44ODksNy40NjJjMCwwLTIuNTM3LTEuODE3LTYuNjc1LTIuNTkzCQljLTQuMTM5LTAuNzc3LTYuNDUtMC45MzctNi40NS0wLjkzN0w1MC4wODksMTQuNDRjMCwwLTIuNjM1LDAuMTM0LTUuNjkxLDAuNTU1Yy0yLjgyMywwLjM4OS01LjQzNCwxLjI1Ny01LjQzNCwxLjI1NyIvPgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojQzJFQkZGO3N0cm9rZS13aWR0aDozLjA1NTE7IiBkPSJNMzEuODM0LDYuOTc5YzAsMC0zLjA1NiwwLjYyNy02LjQzOCwzLjEzNAkJYy0zLjM4MiwyLjUxLTUuMDcxLDQuMDk5LTUuMDcxLDQuMDk5bDQuNTM0LDEwLjU2OWMwLDAtMS44MDMsMS45NDgtMy41NzIsNC40NzljLTEuNjMzLDIuMzM1LTMuMTI3LDQuNDgzLTMuMTI3LDQuNDgzIi8+CTxnPgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIyLjA0NjQiIHkxPSI0Ni4yMzA5IiB4Mj0iMTcuNjA5OSIgeTI9IjQ2LjIzMDkiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNDMkVCRkYiLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMkRCQkU2Ii8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF81Xyk7IiBkPSJNMTQuNzI1LDYxLjMxOWMtMC4wMzgtMC4xMTEtMC45NTYtMi43NjMtMS40MDItNS42ODZjLTAuMzA0LTIuMDExLTAuNDgyLTMuODI1LTAuNTcyLTQuODc1CQkJTDIuMDQ2LDQ2LjE3MmwwLjA1OS0xLjA2N2MwLjAwNi0wLjA5OSwwLjE0Mi0yLjQ1MiwwLjg2Ni02LjY0MWMwLjc2OS00LjQzMywyLjY3My03LjIwNSwyLjc1NC03LjMyMWwyLjUwOSwxLjc0MwkJCWMtMC4wMTYsMC4wMjItMS42MDYsMi4zNzMtMi4yNTMsNi4xMDJjLTAuNDE3LDIuNDA4LTAuNjMxLDQuMTkyLTAuNzM2LDUuMjMybDEwLjQyMSw0LjQ2NWwwLjA2LDAuOTM3CQkJYzAuMDAyLDAuMDI1LDAuMTcsMi42MDcsMC42MTYsNS41NTNjMC40MDIsMi42NDYsMS4yNTgsNS4xMTMsMS4yNjcsNS4xMzhMMTQuNzI1LDYxLjMxOUwxNC43MjUsNjEuMzE5eiIvPgk8L2c+CTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMxNzRCNzU7c3Ryb2tlLXdpZHRoOjIuMDM2NzsiIGQ9Ik04OC4wOCw0OGMtMC4xNzYtMy4yNTMtMC43NTUtNi4zOTQtMS42OTEtOS4zNzlsOC4xODItOC43NzIJCWMtMi4wMTgtNC40NC00LjY3OS04LjUyOC03Ljg2NC0xMi4xMzhsLTExLjA0MSw0LjE0NGMtMi41NDctMi4zMTktNS40MDctNC4yOTctOC41MTEtNS44NjFsMC4zODgtMTEuNjE4CQljLTQuNDkzLTEuNzIzLTkuMjk4LTIuODA2LTE0LjMxMi0zLjEzM2wtNS4wNTMsMTAuNzMxYy0zLjQzLDAuMTY0LTYuNzQ4LDAuNzc5LTkuODgyLDEuNzkybC03LjY4NC04LjYzMwkJYy00LjgwNiwyLjA3OS05LjIxLDQuOTA3LTEzLjA2OSw4LjMzNmw0LjUsMTAuNjc4Yy0yLjMwMywyLjQ4My00LjI3OCw1LjI3Ni01Ljg1Nyw4LjMwN0w0LjUzNSwzMgkJYy0xLjc5LDQuNTA1LTIuOTMsOS4zNC0zLjMwNiwxNC4zODdsMTAuNzAzLDUuNWMwLjE1MSwzLjE3OSwwLjY5MSw2LjI1NCwxLjU3Miw5LjE4MWwtOC42MzIsNy44NjUJCWMxLjk3MSw0LjcwNyw0LjY1OCw5LjA0LDcuOTIyLDEyLjg2MWwxMC43MjYtNC4zM2MyLjUyOSwyLjQ0Niw1LjM5NSw0LjU0NSw4LjUyMyw2LjIxOGwtMC41NjEsMTEuNjUzCQljNC41NjksMS44NzMsOS40ODMsMy4wNzEsMTQuNjIxLDMuNDc4bDUuMDU3LTEwLjY1M2MzLjU3Ni0wLjEwNyw3LjAyNi0wLjcwNiwxMC4yOTItMS43MjlsNy41NTYsOC43MTMJCWM0Ljk1Ni0yLjA5NSw5LjQ5My00Ljk3NSwxMy40NTgtOC40OTNMNzcuNzIzLDc2LjIzYzIuMzE4LTIuNDUyLDQuMzEzLTUuMjEyLDUuOTE4LTguMjFsMTEuODUxLDAuMDc0CQljMS43ODctNC41MDUsMi45MjgtOS4zNDMsMy4zMDItMTQuMzkzTDg4LjA4LDQ4eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMTc0Qjc1O3N0cm9rZS13aWR0aDoyLjAzNjc7IiBkPSJNNTAuMDEzLDYzLjYwM2MtNy40ODQsMC0xMy41NTItNi4wNjctMTMuNTUyLTEzLjU1MQkJYzAtNy40ODEsNi4wNjctMTMuNTQ3LDEzLjU1Mi0xMy41NDdjNy40ODEsMCwxMy41NDgsNi4wNjYsMTMuNTQ4LDEzLjU0N0M2My41NjEsNTcuNTM1LDU3LjQ5NCw2My42MDMsNTAuMDEzLDYzLjYwM3oiLz4JPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwNDk2RTtzdHJva2Utd2lkdGg6MS4zMzY4OyIgZD0iTTc4LjQ4Niw1MC4wNTFjMCwxNS4yMi0xMi43NTIsMjcuNTYtMjguNDc0LDI3LjU2CQljLTE1LjcyOSwwLTI4LjQ3OC0xMi4zNC0yOC40NzgtMjcuNTZjMC0xNS4yMTcsMTIuNzQ5LTI3LjU1NSwyOC40NzgtMjcuNTU1QzY1LjczNCwyMi40OTYsNzguNDg2LDM0LjgzNCw3OC40ODYsNTAuMDUxeiIvPjwvZz48L3N2Zz4=';
	d.SILICON = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMjQwLDIwMCwxNjApIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiIGNvbG9yLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmb250LWZhbWlseT0iJmFwb3M7THVjaWRhIEdyYW5kZSZhcG9zOyIgc3Ryb2tlPSJyZ2IoMjQwLDIwMCwxNjApIiBjb2xvci1pbnRlcnBvbGF0aW9uPSJsaW5lYXJSR0IiICAgID48cGF0aCBkPSJNNy4yODgxIDE1LjI1MjkgUTYuMjY5NSAxNS4yNTI5IDQuNjgzNiAxNC44MDg2IEw0LjY4MzYgMTMuMzg2NyBRNi4zOTI2IDE0LjE3OTcgNy40OTMyIDE0LjE3OTcgUTguMzQwOCAxNC4xNzk3IDguODU2OSAxMy43MzU0IFE5LjM3MyAxMy4yOTEgOS4zNzMgMTIuNTY2NCBROS4zNzMgMTEuOTcxNyA5LjAzNDcgMTEuNTU0NyBROC42OTYzIDExLjEzNzcgNy43ODcxIDEwLjYyNSBMNy4wODk4IDEwLjIyMTcgUTUuNzk3OSA5LjQ4MzQgNS4yNjgxIDguODMwNiBRNC43MzgzIDguMTc3NyA0LjczODMgNy4zMDk2IFE0LjczODMgNi4xNDA2IDUuNTg1OSA1LjM4NTMgUTYuNDMzNiA0LjYyOTkgNy43NDYxIDQuNjI5OSBROC45MTUgNC42Mjk5IDEwLjIxMzkgNS4wMTk1IEwxMC4yMTM5IDYuMzMyIFE4LjYxNDMgNS43MDMxIDcuODI4MSA1LjcwMzEgUTcuMDgzIDUuNzAzMSA2LjU5NzcgNi4wOTk2IFE2LjExMjMgNi40OTYxIDYuMTEyMyA3LjA5NzcgUTYuMTEyMyA3LjYwMzUgNi40Njc4IDcuOTkzMiBRNi44MjMyIDguMzgyOCA3Ljc2NjYgOC45MjI5IEw4LjQ5MTIgOS4zMzMgUTkuODAzNyAxMC4wNzgxIDEwLjMyMzIgMTAuNzQxMiBRMTAuODQyOCAxMS40MDQzIDEwLjg0MjggMTIuMzM0IFExMC44NDI4IDEzLjY1MzMgOS44Njg3IDE0LjQ1MzEgUTguODk0NSAxNS4yNTI5IDcuMjg4MSAxNS4yNTI5IFpNMTMuMzQ2NyAxNSBMMTMuMzQ2NyA3LjU3NjIgTDE0LjY5MzQgNy41NzYyIEwxNC42OTM0IDE1IFpNMTMuMzQ2NyA2LjIyOTUgTDEzLjM0NjcgNC44ODI4IEwxNC42OTM0IDQuODgyOCBMMTQuNjkzNCA2LjIyOTUgWiIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.SULFUR = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2IoMjA0LDEwMiwwKSIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVNwZWVkIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZm9udC1mYW1pbHk9IiZhcG9zO0x1Y2lkYSBHcmFuZGUmYXBvczsiIHN0cm9rZT0icmdiKDIwNCwxMDIsMCkiIGNvbG9yLWludGVycG9sYXRpb249ImxpbmVhclJHQiIgICAgPjxwYXRoIGQ9Ik05LjI4ODEgMTUuMjUyOSBROC4yNjk1IDE1LjI1MjkgNi42ODM2IDE0LjgwODYgTDYuNjgzNiAxMy4zODY3IFE4LjM5MjYgMTQuMTc5NyA5LjQ5MzIgMTQuMTc5NyBRMTAuMzQwOCAxNC4xNzk3IDEwLjg1NjkgMTMuNzM1NCBRMTEuMzczIDEzLjI5MSAxMS4zNzMgMTIuNTY2NCBRMTEuMzczIDExLjk3MTcgMTEuMDM0NyAxMS41NTQ3IFExMC42OTYzIDExLjEzNzcgOS43ODcxIDEwLjYyNSBMOS4wODk4IDEwLjIyMTcgUTcuNzk3OSA5LjQ4MzQgNy4yNjgxIDguODMwNiBRNi43MzgzIDguMTc3NyA2LjczODMgNy4zMDk2IFE2LjczODMgNi4xNDA2IDcuNTg1OSA1LjM4NTMgUTguNDMzNiA0LjYyOTkgOS43NDYxIDQuNjI5OSBRMTAuOTE1IDQuNjI5OSAxMi4yMTM5IDUuMDE5NSBMMTIuMjEzOSA2LjMzMiBRMTAuNjE0MyA1LjcwMzEgOS44MjgxIDUuNzAzMSBROS4wODMgNS43MDMxIDguNTk3NyA2LjA5OTYgUTguMTEyMyA2LjQ5NjEgOC4xMTIzIDcuMDk3NyBROC4xMTIzIDcuNjAzNSA4LjQ2NzggNy45OTMyIFE4LjgyMzIgOC4zODI4IDkuNzY2NiA4LjkyMjkgTDEwLjQ5MTIgOS4zMzMgUTExLjgwMzcgMTAuMDc4MSAxMi4zMjMyIDEwLjc0MTIgUTEyLjg0MjggMTEuNDA0MyAxMi44NDI4IDEyLjMzNCBRMTIuODQyOCAxMy42NTMzIDExLjg2ODcgMTQuNDUzMSBRMTAuODk0NSAxNS4yNTI5IDkuMjg4MSAxNS4yNTI5IFoiIHN0cm9rZT0ibm9uZSIgICAgLz48L2cgID48L2c+PC9zdmc+';
	d.TEMPLATES = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItNzkuNTkzNCIgeTE9Ii04NzUuODg3NyIgeDI9Ii0yNC4wNTUyIiB5Mj0iLTg3NS44ODc3IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTM5IC0wLjM0MzkgMC4zNDM5IDAuOTM5IDM3Ni4xMzA4IDg2OC44MTQxKSI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzdBNzVCMyIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuMjEyMiIgc3R5bGU9InN0b3AtY29sb3I6Izc2NzFCMSIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuNDM0IiBzdHlsZT0ic3RvcC1jb2xvcjojNjk2NkFBIi8+CQkJPHN0b3AgIG9mZnNldD0iMC41IiBzdHlsZT0ic3RvcC1jb2xvcjojNjQ2MUE3Ii8+CQkJPHN0b3AgIG9mZnNldD0iMC41Mzc5IiBzdHlsZT0ic3RvcC1jb2xvcjojNUU1QUEzIi8+CQkJPHN0b3AgIG9mZnNldD0iMC42NDU5IiBzdHlsZT0ic3RvcC1jb2xvcjojNTE0QzlCIi8+CQkJPHN0b3AgIG9mZnNldD0iMC43Nzc3IiBzdHlsZT0ic3RvcC1jb2xvcjojNDk0NDk2Ii8+CQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzQ3NDE5NSIvPgkJPC9saW5lYXJHcmFkaWVudD4JCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pOyIgZD0iTTQ2LjE3Nyw2Ny45MjVjMCwwLTAuMTksMS44MSwwLjI5MSwyLjU5NmMwLjQ3OSwwLjc4NCwxLjQwNiwxLjIxMywxLjQwNiwxLjIxMwkJCWMxLjUxNSwwLjk4MiwyLjU5MiwwLjA5NSwyLjU5MiwwLjA5NWMxLjE0NS0xLjE0NywyLjUyMy0xLjY0MywzLjYxMS0xLjE0OGMxLjY0MSwwLjc0NSwxLjc4MiwzLjA4LDAuNTk5LDUuNjc1CQkJYy0xLjE4NiwyLjU5My0zLjIzNiw0LjQ2LTQuODgyLDMuNzE4Yy0xLjE4NS0wLjUzNy0xLjcxMS0yLjEwOC0xLjQ1NS0zLjkxN2MwLDAsMC4yNzQtMS42MjEtMS45MzYtMS44NjgJCQljMCwwLTAuODE3LTAuMjg1LTEuNzc3LTAuMTIxYy0wLjk5NSwwLjE3NS0xLjkxMSwxLjEwOC0xLjkxMSwxLjEwOGwtNy4xNTEsMTUuMDA4TDAuMDgsNzMuNDY4bDE2Ljg1NC0zNS4zOTNsMTIuNjAzLDUuOTY4CQkJYzAsMCwxLjU1OCwwLjU5LDEuMzc4LDEuNDI0Yy0wLjExLDAuNTE1LTAuODk3LDAuNjQ2LTAuODk3LDAuNjQ2Yy0yLjM2MS0wLjItNC4zNjQsMC41NC01LjEwOSwyLjExNAkJCWMtMS4xMjQsMi4zNzIsMS4wMTksNS43MzgsNC43ODYsNy41MTdjMy43NjQsMS43NzYsNy43MjgsMS4yOTcsOC44NTYtMS4wNzRjMC44MTctMS43MjEtMC4wODItMy45Ni0yLjA3LTUuNzQyCQkJYzAsMC0wLjYwMy0wLjk1MiwwLjU5Ni0xLjFjMC43MjctMC4wOTIsMS40NjEsMC40ODMsMS40NjEsMC40ODNsMTMuODg0LDYuNTc3TDQ2LjE3Nyw2Ny45MjV6Ii8+CQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzJfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii00OS41NzM2IiB5MT0iLTkwNS4xNDYyIiB4Mj0iNS45NjQ3IiB5Mj0iLTkwNS4xNDYyIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTM5IC0wLjM0MzkgMC4zNDM5IDAuOTM5IDM3Ni4xMzA4IDg2OC44MTQxKSI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzU3RUQxQyIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuMTk2MyIgc3R5bGU9InN0b3AtY29sb3I6IzU0RTkxRSIvPgkJCTxzdG9wICBvZmZzZXQ9IjAuMzc3IiBzdHlsZT0ic3RvcC1jb2xvcjojNENERTI1Ii8+CQkJPHN0b3AgIG9mZnNldD0iMC41NTE2IiBzdHlsZT0ic3RvcC1jb2xvcjojM0ZDQzMwIi8+CQkJPHN0b3AgIG9mZnNldD0iMC43MjI0IiBzdHlsZT0ic3RvcC1jb2xvcjojMkNCMTNGIi8+CQkJPHN0b3AgIG9mZnNldD0iMC44ODg5IiBzdHlsZT0ic3RvcC1jb2xvcjojMTM5MDUzIi8+CQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNzU2MyIvPgkJPC9saW5lYXJHcmFkaWVudD4JCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMl8pOyIgZD0iTTY0LjExLDMwLjQ1NmMwLDAtMC44MDQsMS40NDctMC4xMzMsMS45NjhjMC40MTgsMC4zMjMsMS4xMDEtMC4wODMsMS4xMDEtMC4wODMJCQljMS42NzUtMS42NzUsMy42ODEtMi4zOTgsNS4yNzEtMS42NzdjMi4zOTQsMS4wODksMi45MzgsNS4wMzUsMS4yMTYsOC44MThjLTEuNzI3LDMuNzgzLTUuMDY3LDUuOTczLTcuNDY0LDQuODg4CQkJYy0xLjczMy0wLjc4Ny0yLjQ5My0zLjA3Ny0yLjEyNS01LjcxOWMwLDAtMC4xNjYtMS4xMTItMS4xNzQtMC40NTNjLTAuNjEzLDAuMzk1LTAuODM3LDEuMjY0LTAuODM3LDEuMjY0bC02LjI3MywxMy4wMjMJCQljMC0wLjAwMi0xNC45MzEtNy4wNzYtMTQuOTMxLTcuMDc2cy0xLjMwMi0wLjIxOS0yLjE3OSwwLjI5MmMtMC44MzksMC40OS0xLjI3OCwxLjIzNC0xLjI3OCwxLjIzNAkJCWMtMS41MjYsMS42MTUtMC4yNjYsMi42Ny0wLjI2NiwyLjY3YzEuMzY2LDEuMjIxLDEuOTc5LDIuNzU3LDEuNDIsMy45MzRjLTAuNzcsMS42MjctMy41NSwxLjUyNS02LjEzNCwwLjMwOQkJCWMtMi41NzgtMS4yMjEtMy45ODQtMy4wOTUtMy4yMTMtNC43MjFjMC41MS0xLjA4LDEuODgzLTEuNTg5LDMuNDk4LTEuNDVjMCwwLDEuMzk5LTAuMDE1LDEuOTE5LTEuNzQxYzAsMCwwLjQzLTAuOTI5LDAuMjkxLTEuODM2CQkJYy0wLjE0Ni0wLjkwOS0xLjQ1Mi0yLjE5Mi0xLjQ1Mi0yLjE5MmwtMTMuMTYzLTYuMjM5TDM1LjA2NCwwLjI3NGwxMi4yNjIsNS44MTJsLTAuMDA5LDAuMDU3YzAsMCwxLjU1OCwwLjU4LDEuMzkzLDEuNDE2CQkJYy0wLjEwNSwwLjUxNS0wLjg5NCwwLjY1MS0wLjg5NCwwLjY1MWMtMi4zNTktMC4xOC00LjM1MiwwLjU3Ni01LjA4NSwyLjE1OGMtMS4xMDksMi4zNzgsMS4wNTksNS43MjcsNC44NCw3LjQ3NAkJCWMzLjc4MSwxLjc0Niw3Ljc0MywxLjIzMyw4Ljg1Mi0xLjE0OGMwLjgwNi0xLjcyNi0wLjEyMy0zLjk1Ny0yLjEyLTUuNzJjMCwwLTAuNjEtMC45NDYsMC41ODYtMS4xMDYJCQljMC43MjUtMC4wOTksMS40MywwLjQ2MywxLjQzLDAuNDYzbDAsMGwxNC4yMjcsNi43NTdMNjQuMTEsMzAuNDU2eiIvPgkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2MzAuMDQ2NCIgeTE9Ii0yNjI3LjA3MiIgeDI9IjY4NS41MDk5IiB5Mj0iLTI2MjcuMDcyIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuNTkwMSAtMC44MDczIDAuODA3MyAwLjU5MDEgMTgxMC4zOTUzIDIxNTcuOTcxMikiPgkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRDFDMjQiLz4JCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQTEwMzA5Ii8+CQk8L2xpbmVhckdyYWRpZW50PgkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7IiBkPSJNNzguNjEzLDU2Ljc1OGMwLDAtMS41ODEsMC4zMzctMS44OTYtMC40NTRjLTAuMTk3LTAuNDg3LDAuMzgyLTEuMDMsMC4zODItMS4wMwkJCWMyLjA3Ni0xLjE0MywzLjMzMi0yLjg2NiwzLjA3My00LjU4OGMtMC4zODItMi41OTctNC4wMzktNC4yMDYtOC4xNjMtMy42Yy00LjEyLDAuNjA0LTcuMTUzLDMuMjAyLTYuNzY3LDUuNzk4CQkJYzAuMjc3LDEuODgzLDIuMjcxLDMuMjQ2LDQuOTE5LDMuNjIzYzAsMCwxLjAyOSwwLjQ2MiwwLjExNCwxLjI0OWMtMC41NTEsMC40NzYtMS40NjcsMC40MjktMS40NjcsMC40MjlsLTEzLjM3LDEuOTc1CQkJbDIuMDE1LDEzLjY1YzAsMCwwLjE0NywxLjYyMywwLjk5NiwxLjY4NmMwLjUyNSwwLjAzNSwwLjg3LTAuNjc5LDAuODctMC42NzljMC40NjItMi4zMjYsMS43MjgtNC4wMzksMy40NTItNC4zMTcJCQljMi41OTItMC40MTksNS4yNDUsMi41NjMsNS45MTcsNi42NjNjMC42NjksNC4xMDQtMC44ODksNy43NzMtMy40ODcsOC4xOTVjLTEuODgzLDAuMzA4LTMuNzg5LTEuMTc2LTQuOTU1LTMuNTc1CQkJYzAsMC0wLjc1Mi0wLjgzOS0xLjIyNiwwLjI2N2MtMC4yODksMC42NzEtMC4xMTgsMS41OTMtMC4xMTgsMS41OTNsMi4yMTUsMTUuMjg5bDM4Ljg3Mi01LjY2NGwtNS42NzgtMzguNzcyCQkJQzk0LjMxMiw1NC40OTQsODUuODEsNTUuNzA3LDc4LjYxMyw1Ni43NTh6Ii8+CTwvZz4JCQk8cmFkaWFsR3JhZGllbnQgaWQ9IlNWR0lEXzRfIiBjeD0iMjkzNC4xMDUyIiBjeT0iLTMyOTYuMjg5OCIgcj0iMTAuNTczOCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC41NTIgLTAuODEzOCAwLjgwNzcgLTAuNTU2MiA0MzA2LjUxMzIgNjIzLjE3MTgpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojODBFMEVGIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQ5NjkiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NUIxRDkiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNjA2NSIgc3R5bGU9InN0b3AtY29sb3I6IzVGQTZEMyIvPgkJPHN0b3AgIG9mZnNldD0iMC44MDEyIiBzdHlsZT0ic3RvcC1jb2xvcjojNEQ4N0MyIi8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMzg2MkFFIi8+CTwvcmFkaWFsR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTE4LjYzNiw2MC4xODhjNC43Mi0zLjI0OCwxMS4xNTMtMi4wMzEsMTQuMzc2LDIuNzIyYzMuMjE4LDQuNzU1LDIuMDE4LDExLjIzOC0yLjcsMTQuNDg3CQljLTQuNzEsMy4yNDUtMTEuMTU0LDIuMDI4LTE0LjM4NC0yLjczQzEyLjcwNiw2OS45MjEsMTMuOTIyLDYzLjQzMiwxOC42MzYsNjAuMTg4eiIvPgk8cGF0aCBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMkUzMTkyO3N0cm9rZS13aWR0aDowLjkyODsiIGQ9Ik0xOC42MzYsNjAuMTg4YzQuNzItMy4yNDgsMTEuMTUzLTIuMDMxLDE0LjM3NiwyLjcyMgkJYzMuMjE4LDQuNzU1LDIuMDE4LDExLjIzOC0yLjcsMTQuNDg3Yy00LjcxLDMuMjQ1LTExLjE1NCwyLjAyOC0xNC4zODQtMi43M0MxMi43MDYsNjkuOTIxLDEzLjkyMiw2My40MzIsMTguNjM2LDYwLjE4OHoiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzVfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii00NjQuMDkzOCIgeTE9IjM0NS42MjEiIHgyPSItNDY0LjA5MzgiIHkyPSIzMzQuMDE0IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuOTk5NiAwLjAyNzEgLTAuMDI3MSAwLjk5OTYgNDk3Ljc0MDUgLTI2MS4yNTk4KSI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNjVCMUQ5Ii8+CQk8c3RvcCAgb2Zmc2V0PSIwLjE1OTYiIHN0eWxlPSJzdG9wLWNvbG9yOiM2REJDREUiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNDQyNCIgc3R5bGU9InN0b3AtY29sb3I6IzgxREJFRCIvPgkJPHN0b3AgIG9mZnNldD0iMC42NDQyIiBzdHlsZT0ic3RvcC1jb2xvcjojOTJGNEY5Ii8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNV8pOyIgZD0iTTMyLjYyNCw2Ni4zOThjLTAuMDY5LDMuMDQzLTMuNzA4LDUuMzgzLTguMTM4LDUuMjQ4Yy00LjQyLTAuMTQxLTcuOTQ1LTIuNzE2LTcuODgtNS43NDMJCWMwLjA2NS0zLjAzOSwzLjc5Ni01Ljk5OSw4LjIxNS01Ljg1OEMyOS4yNDcsNjAuMTgzLDMyLjY5OCw2My4zNjksMzIuNjI0LDY2LjM5OHoiLz4JCQk8cmFkaWFsR3JhZGllbnQgaWQ9IlNWR0lEXzZfIiBjeD0iMjk1NS40MjY1IiBjeT0iLTMyNTkuODE3OSIgcj0iMTAuNTczOSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC41NTIgLTAuODEzOCAwLjgwNzcgLTAuNTU2MiA0MzA2LjUxMzIgNjIzLjE3MTgpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojODBFMEVGIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQ5NjkiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NUIxRDkiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNjA2NSIgc3R5bGU9InN0b3AtY29sb3I6IzVGQTZEMyIvPgkJPHN0b3AgIG9mZnNldD0iMC44MDEyIiBzdHlsZT0ic3RvcC1jb2xvcjojNEQ4N0MyIi8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMzg2MkFFIi8+CTwvcmFkaWFsR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNl8pOyIgZD0iTTM2LjMyNSwyMi41NTFjNC43Mi0zLjI0OCwxMS4xNTMtMi4wMzEsMTQuMzc3LDIuNzIzYzMuMjE3LDQuNzUzLDIuMDE3LDExLjIzOC0yLjcsMTQuNDg2CQljLTQuNzExLDMuMjQ3LTExLjE1NCwyLjAyOC0xNC4zODQtMi43MjlDMzAuMzk2LDMyLjI4NCwzMS42MTIsMjUuNzk1LDM2LjMyNSwyMi41NTF6Ii8+CTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMyRTMxOTI7c3Ryb2tlLXdpZHRoOjAuOTI4OyIgZD0iTTM2LjMyNSwyMi41NTFjNC43Mi0zLjI0OCwxMS4xNTMtMi4wMzEsMTQuMzc3LDIuNzIzCQljMy4yMTcsNC43NTMsMi4wMTcsMTEuMjM4LTIuNywxNC40ODZjLTQuNzExLDMuMjQ3LTExLjE1NCwyLjAyOC0xNC4zODQtMi43MjlDMzAuMzk2LDMyLjI4NCwzMS42MTIsMjUuNzk1LDM2LjMyNSwyMi41NTF6Ii8+CQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF83XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSItNDQ3LjQzIiB5MT0iMzA3LjUxNjUiIHgyPSItNDQ3LjQzIiB5Mj0iMjk1LjkwOTUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMC45OTk2IDAuMDI3MSAtMC4wMjcxIDAuOTk5NiA0OTcuNzQwNSAtMjYxLjI1OTgpIj4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NUIxRDkiLz4JCTxzdG9wICBvZmZzZXQ9IjAuMTU5NiIgc3R5bGU9InN0b3AtY29sb3I6IzZEQkNERSIvPgkJPHN0b3AgIG9mZnNldD0iMC40NDI0IiBzdHlsZT0ic3RvcC1jb2xvcjojODFEQkVEIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDIiIHN0eWxlPSJzdG9wLWNvbG9yOiM5MkY0RjkiLz4JPC9saW5lYXJHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF83Xyk7IiBkPSJNNTAuMzEzLDI4Ljc2MmMtMC4wNjksMy4wNDItMy43MDgsNS4zODMtOC4xMzgsNS4yNDdjLTQuNDItMC4xNDEtNy45NDYtMi43MTQtNy44NzktNS43NDIJCWMwLjA2NS0zLjAzOSwzLjc5Ni01Ljk5OSw4LjIxNC01Ljg1OUM0Ni45MzgsMjIuNTQ1LDUwLjM4NiwyNS43MzMsNTAuMzEzLDI4Ljc2MnoiLz4JCQk8cmFkaWFsR3JhZGllbnQgaWQ9IlNWR0lEXzhfIiBjeD0iNDQ4Mi40MTM2IiBjeT0iLTIxNTEuMTcxNiIgcj0iMTAuNTczNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC45MTIxIC0wLjM3MTIgMC4zNjIzIC0wLjkwOTkgNDk0OS41MjkzIC0yMTcuNTA5MykiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MEUwRUYiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNDk2OSIgc3R5bGU9InN0b3AtY29sb3I6IzY1QjFEOSIvPgkJPHN0b3AgIG9mZnNldD0iMC42MDY1IiBzdHlsZT0ic3RvcC1jb2xvcjojNUZBNkQzIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjgwMTIiIHN0eWxlPSJzdG9wLWNvbG9yOiM0RDg3QzIiLz4JCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMzODYyQUUiLz4JPC9yYWRpYWxHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF84Xyk7IiBkPSJNNzIuMTA1LDcyLjA0NGMyLjExNy01LjMxMiw4LjE0Ni03Ljg2MiwxMy40NzUtNS42OTRjNS4zMjEsMi4xNzMsNy45MzEsOC4yMzEsNS44MTUsMTMuNTQ1CQljLTIuMTEyLDUuMzA5LTguMTQ5LDcuODYzLTEzLjQ4Miw1LjY5MkM3Mi41ODksODMuNDI1LDY5Ljk4OSw3Ny4zNTMsNzIuMTA1LDcyLjA0NHoiLz4JPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzJFMzE5MjtzdHJva2Utd2lkdGg6MC45Mjg7IiBkPSJNNzIuMTA1LDcyLjA0NGMyLjExNy01LjMxMiw4LjE0Ni03Ljg2MiwxMy40NzUtNS42OTQJCWM1LjMyMSwyLjE3Myw3LjkzMSw4LjIzMSw1LjgxNSwxMy41NDVjLTIuMTEyLDUuMzA5LTguMTQ5LDcuODYzLTEzLjQ4Miw1LjY5MkM3Mi41ODksODMuNDI1LDY5Ljk4OSw3Ny4zNTMsNzIuMTA1LDcyLjA0NHoiLz4JCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzlfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii00NDYuMzcwNiIgeTE9Ii0xNTQ3LjI5NzkiIHgyPSItNDQ2LjM3MDYiIHkyPSItMTU1OC45MTIxIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDAuODQ2NSAtMC41MzI0IDAuNTMyNCAwLjg0NjUgMTI4NC45NTg3IDExNTAuNDkwOCkiPgkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzY1QjFEOSIvPgkJPHN0b3AgIG9mZnNldD0iMC4xNTk2IiBzdHlsZT0ic3RvcC1jb2xvcjojNkRCQ0RFIi8+CQk8c3RvcCAgb2Zmc2V0PSIwLjQ0MjQiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MURCRUQiLz4JCTxzdG9wICBvZmZzZXQ9IjAuNjQ0MiIgc3R5bGU9InN0b3AtY29sb3I6IzkyRjRGOSIvPgk8L2xpbmVhckdyYWRpZW50Pgk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzlfKTsiIGQ9Ik04Ny4xOTUsNjkuNDY3YzEuNjM3LDIuNTY1LTAuMDg2LDYuNTMtMy44NDksOC44N2MtMy43NTYsMi4zMjktOC4xMTksMi4xNDItOS43NS0wLjQxNQkJYy0xLjYzNy0yLjU2Mi0wLjE4LTcuMDksMy41NzEtOS40MTlDODAuOTI5LDY2LjE2Niw4NS41NzEsNjYuOTA2LDg3LjE5NSw2OS40Njd6Ii8+PC9nPjwvc3ZnPg==';
	d.TEXT = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGRlZnM+CQkJPHBhdGggaWQ9IlNWR0lEXzFfIiBkPSJNMS4zODIsODEuOTM3bC0wLjAxMSwwLjAwMnY1LjA5NGgwLjAxMVY4MS45MzciLz4JCTwvZGVmcz4JCTxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPgkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzFfIiAgc3R5bGU9Im92ZXJmbG93OnZpc2libGU7Ii8+CQk8L2NsaXBQYXRoPgk8L2c+CTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMS4zODE4IiB5MT0iNTAuMTM5NiIgeDI9IjczLjM1NjQiIHkyPSI1MC4xMzk2Ij4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMjkzQ0IiLz4JCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTU3OUEiLz4JPC9saW5lYXJHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7IiBkPSJNMjAuNTk2LDYzLjlsOS44OS0yNy45NTJMNDAuODY0LDYzLjlIMjAuNTk2IE0zOS43NzgsOC4yMzZoLTUuNzc1TDEwLjI2OSw3NS45MzYJCWwtMi4wNCw1LjEzMWMtMS4zNTksMy40Mi0yLjk0Nyw1LjI1Ny00Ljc3MSw1LjUxNGwtMi4wNzYsMC4yMzd2NS4yMjZoMTcuODgxdi01LjIyNGMtMy41NjksMC01LjM1NC0wLjc5OS01LjM1NC0yLjM5OQkJYzAtMS4wODgsMC44MDMtMy45MDQsMi40MTYtOC40NTRsMi40Mi02Ljg0MmgyNC4wNmwyLjUyNCw2LjgwMmMxLjY5OCw0LjU3MywyLjU0Nyw3LjQwMSwyLjU0Nyw4LjQ5YzAsMS42MDQtMi4yLDIuNDAzLTYuNTk4LDIuNDAzCQl2NS4yMjRoMzIuMDc3di01LjIyNGMtMi44NjctMC4wNDYtNC45MzMtMS42MTEtNi4xOTktNC42OThsLTIuNTc3LTYuMTM3TDM5Ljc3OCw4LjIzNiIvPgk8Zz4JCTxnPgkJCTxwYXRoIGQ9Ik04OS4zMTYsOTEuMzMyYy0xLjk2NSwwLTMuNTU0LTEuNTctMy41NTQtMy41MDZWMTMuNjIzYzAtMS45MzYsMS41ODktMy41MDYsMy41NTQtMy41MDZjMS45NjEsMCwzLjU1MywxLjU3LDMuNTUzLDMuNTA2CQkJCXY3NC4yMDNDOTIuODY5LDg5Ljc2Miw5MS4yNzcsOTEuMzMyLDg5LjMxNiw5MS4zMzJMODkuMzE2LDkxLjMzMnoiLz4JCTwvZz4JPC9nPgk8Zz4JCTxkZWZzPgkJCTxwYXRoIGlkPSJTVkdJRF80XyIgZD0iTTQuMzA5LDY1LjM3NWMwLDAsNDIuMjI3LTMuMDgyLDUxLjk3Mi0yMC4wMzFjOS43NDItMTYuOTQ4LTkuNzQ3LTUzLjkyNi05Ljc0Ny01My45MjZMMTUuNjc3LDYuODI0CQkJCUw0LjMwOSw2NS4zNzV6Ii8+CQk8L2RlZnM+CQk8Y2xpcFBhdGggaWQ9IlNWR0lEXzVfIj4JCQk8dXNlIHhsaW5rOmhyZWY9IiNTVkdJRF80XyIgIHN0eWxlPSJvdmVyZmxvdzp2aXNpYmxlOyIvPgkJPC9jbGlwUGF0aD4JCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfNl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMjAuNTk0NyIgeTE9IjUwLjEzOTYiIHgyPSI0MC44NjQyIiB5Mj0iNTAuMTM5NiI+CQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzcyRDBGRiIvPgkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMjkzQ0IiLz4JCTwvbGluZWFyR3JhZGllbnQ+CQk8cGF0aCBzdHlsZT0iY2xpcC1wYXRoOnVybCgjU1ZHSURfNV8pO2ZpbGw6dXJsKCNTVkdJRF82Xyk7IiBkPSJNMjAuNTk2LDYzLjlsOS44OS0yNy45NTJMNDAuODY0LDYzLjlIMjAuNTk2IE0zOS43NzgsOC4yMzYJCQloLTUuNzc1TDEwLjI2OSw3NS45MzZsLTIuMDQsNS4xMzFjLTEuMzU5LDMuNDItMi45NDcsNS4yNTctNC43NzEsNS41MTRsLTIuMDc2LDAuMjM3djUuMjI2aDE3Ljg4MXYtNS4yMjQJCQljLTMuNTY5LDAtNS4zNTQtMC43OTktNS4zNTQtMi4zOTljMC0xLjA4OCwwLjgwMy0zLjkwNCwyLjQxNi04LjQ1NGwyLjQyLTYuODQyaDI0LjA2bDIuNTI0LDYuODAyCQkJYzEuNjk4LDQuNTczLDIuNTQ3LDcuNDAxLDIuNTQ3LDguNDljMCwxLjYwNC0yLjIsMi40MDMtNi41OTgsMi40MDN2NS4yMjRoMzIuMDc3di01LjIyNGMtMi44NjctMC4wNDYtNC45MzMtMS42MTEtNi4xOTktNC42OTgJCQlsLTIuNTc3LTYuMTM3TDM5Ljc3OCw4LjIzNiIvPgk8L2c+CTxwYXRoIGQ9Ik05OS44MzQsOTIuMjRjMCwwLTUuNjAxLDEuMjk1LTYuOTE0LTQuNzc0Yy0xLjMxNC02LjA2OS02LjE2Ni00Ljc4OC02LjkxNSwwYy0wLjg1Myw1LjQ1MS02LjkxNSw0Ljc3NC02LjkxNSw0Ljc3NHY3LjUwNAkJaDIwLjc0NFY5Mi4yNHoiLz4JPHBhdGggZD0iTTk5LjgzNCw3LjgzM2MwLDAtNS42MDEtMS4yOTUtNi45MTQsNC43NzRjLTEuMzE0LDYuMDY5LTYuMTY2LDQuNzg4LTYuOTE1LDBjLTAuODUzLTUuNDUxLTYuOTE1LTQuNzc0LTYuOTE1LTQuNzc0VjAuMzMJCWgyMC43NDRWNy44MzN6Ii8+CTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMyOTRFOEE7c3Ryb2tlLXdpZHRoOjIuNTIxMjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSJNMjAuNTk2LDYzLjkJCWw5Ljg5LTI3Ljk1Mkw0MC44NjQsNjMuOUgyMC41OTYgTTM5Ljc3OCw4LjIzNmgtNS43NzVMMTAuMjY5LDc1LjkzNmwtMi4wNCw1LjEzMWMtMS4zNTksMy40Mi0yLjk0Nyw1LjI1Ny00Ljc3MSw1LjUxNAkJbC0yLjA3NiwwLjIzN3Y1LjIyNmgxNy44ODF2LTUuMjI0Yy0zLjU2OSwwLTUuMzU0LTAuNzk5LTUuMzU0LTIuMzk5YzAtMS4wODgsMC44MDMtMy45MDQsMi40MTYtOC40NTRsMi40Mi02Ljg0MmgyNC4wNgkJbDIuNTI0LDYuODAyYzEuNjk4LDQuNTczLDIuNTQ3LDcuNDAxLDIuNTQ3LDguNDljMCwxLjYwNC0yLjIsMi40MDMtNi41OTgsMi40MDN2NS4yMjRoMzIuMDc3di01LjIyNAkJYy0yLjg2Ny0wLjA0Ni00LjkzMy0xLjYxMS02LjE5OS00LjY5OGwtMi41NzctNi4xMzdMMzkuNzc4LDguMjM2Ii8+PC9nPjwvc3ZnPg==';
	d.TORSION = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxwb2x5Z29uIHN0eWxlPSJmaWxsOiNDMTI3MkQ7c3Ryb2tlOiMzRjA5MDA7c3Ryb2tlLXdpZHRoOjEuNDY3NztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBwb2ludHM9IgkJMTUuODg2LDY3LjUxIDkuNTY3LDk1Ljk0NCAwLjY5NCw3Ni41MjQgNy4wMTIsNDkuMTMyIAkiLz4JPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI3LjAxMjIiIHkxPSI1OC4yNDc0IiB4Mj0iNDUuNTQ4MyIgeTI9IjU4LjI0NzQiPgkJPHN0b3AgIG9mZnNldD0iMC4yMDg1IiBzdHlsZT0ic3RvcC1jb2xvcjojMUM5REVEIi8+CQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMDM0N0ExIi8+CTwvbGluZWFyR3JhZGllbnQ+CTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pO3N0cm9rZTojMDAzODZGO3N0cm9rZS13aWR0aDoxLjQ2Nzc7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgZD0iCQlNNDUuNTQ4LDYwLjA5OGMtNC4yNTIsMi4yNTQtOC4wODMsNC4yOTItMTMuMjU5LDUuNTA0Yy0xMC4zNTIsMi40My0xNi40MDMsMS45MDgtMTYuNDAzLDEuOTA4TDcuMDEyLDQ5LjEzMgkJYzAsMCw4LjA2Ny0xLjIxNCwxOC42ODksMi40MjdDMzYuMzIyLDU1LjE5OSw0NS41NDgsNjAuMDk4LDQ1LjU0OCw2MC4wOTh6Ii8+CTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNTIuMjA4IiB5MT0iODIuNDg3NiIgeDI9Ijk5LjEwNTUiIHkyPSI4Mi40ODc2Ij4JCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMzQ3QTEiLz4JCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMxQzlERUQiLz4JPC9saW5lYXJHcmFkaWVudD4JPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8yXyk7c3Ryb2tlOiMwMDM4NkY7c3Ryb2tlLXdpZHRoOjEuNDY3NztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSIJCU05OS4xMDUsNjguMzc3YzAsMC0xNi43NTgtMi4yOTEtMjguMzY3LDMuOTg3Yy03LjIyNCwzLjkwNi0xMi41NjEsOC45MTEtMTguNTMsMTMuMTc5YzAsMCwxNi45MTgsNy4yNzgsMjkuOTU3LDkuODgJCWMxMy4wNDIsMi42MDEsMTEuMDI1LDEuMjE0LDExLjAyNSwxLjIxNEw5OS4xMDUsNjguMzc3eiIvPjwvZz48bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzNfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjkuNTY2OSIgeTE9IjcyLjkwNTciIHgyPSI5OS4xMDU1IiB5Mj0iNzIuOTA1NyI+CTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGQ0VFMjEiLz4JPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQjcwMCIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF8zXyk7c3Ryb2tlOiMzRjI5MDA7c3Ryb2tlLXdpZHRoOjEuNDY3NztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiBkPSIJTTkuNTY3LDk1Ljk0NGw2LjMxOS0yOC40MzVjMCwwLDYuMDUxLDAuNTIxLDE2LjQwMy0xLjkwOGMxMC4zNTEtMi40MjYsMTUuMzI3LTguMTQ5LDI5LjA0LTEyLjMwOAljMTMuNzExLTQuMTYyLDI4LjM2NC0zLjQ2OCwyOC4zNjQtMy40NjhsOS40MTIsMTguNTUxYzAsMC0xNi43NTgtMi4yOTEtMjguMzY3LDMuOTg3Yy0xMi41MDMsNi43Ni0xOS4zNTksMTYuODE4LTMzLjYxMSwyMC42MzMJQzIyLjg3Nyw5Ni44MSw5LjU2Nyw5NS45NDQsOS41NjcsOTUuOTQ0eiIvPjxwYXRoIHN0eWxlPSJmaWxsOiMwMDU2OEY7IiBkPSJNNjguNzE1LDMuNzM2Yy0xLjY2NS0wLjk5OS0zLjUwNi0xLjMzNS01LjMxMy0xLjMxMWMtNy41NjIsMC4zMTYtMTIuNzE5LDYuNTA3LTE1Ljc3MywxMi4xNTgJYy0yLjksNS43NTgtNSwxMS42NS02LjY3NCwxNy42MzdjLTMuODE1LTEuMzg0LTUuNjQ4LTYuMzcxLTYuMDQ2LTExLjMxYy0wLjU0Ny01LjM2OCwxLjk2LTExLjAxNiw1LjA2LTE1Ljc3OAljLTYuMTMzLDQuNzUzLTguMjc2LDEwLjQyNS04LjA3NiwxNi4xMzljMC4wNzMsNS4wNTUsMy4yOTUsMTEuNjQzLDguMjgyLDEzLjg1N2MtMS4zOTIsNS40MzItMi40ODEsMTAuOTM1LTMuNTMxLDE2LjQ4bDguMjcsMC45NjkJYzAuNjkyLTUuMzE0LDEuNDg2LTEwLjc2NywyLjU2My0xNi4xMDljNC4xODksMC4wMDIsNy43NDMtMC40OCwxMi4zMjctMy4wNzRDNjkuNjIsMjcuODM3LDc3LjcwOCw5LjYwNyw2OC43MTUsMy43MzZ6CSBNNjYuMzkzLDE3LjUzOEM2Mi45NDEsMzEuNTc5LDUxLjc5NiwzMy4xNjUsNDguMTgsMzMuMTg4YzEuMjYzLTUuNTU5LDIuODc1LTEwLjk0MSw1LjA1NC0xNS44NTUJYzIuMzAzLTUuMDU5LDYuMjk5LTkuNDc1LDEwLjQ3My05LjcxM0M2Ny45OSw3LjM4Niw2Ny4wNTYsMTQuODQzLDY2LjM5MywxNy41Mzh6Ii8+PC9zdmc+';
	d.UNDO = 'PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjwvZGVmcz48Zz48cGF0aCBkPSJNIDEyLjk5OTk5OTk5OTk5OTk5OCA1LjcxOTU2NTIxNzM5MTMwNCBDIDE3LjczMDQzODk0NDIwMjg4IDUuNzE5NTY1MjE3MzkxMzA0IDIxLjU2NTIxNzM5MTMwNDM0NCA5LjU1NDM0MzY2NDQ5Mjc2OCAyMS41NjUyMTczOTEzMDQzNDggMTQuMjg0NzgyNjA4Njk1NjUgMjEuNTY1MjE3MzkxMzA0MzQ4IDE5LjAxNTIyMTU1Mjg5ODUzIDE3LjczMDQzODk0NDIwMjg4NCAyMi44NSAxMy4wMDAwMDAwMDAwMDAwMDIgMjIuODUgOC4yNjk1NjEwNTU3OTcxMiAyMi44NSA0LjQzNDc4MjYwODY5NTY1NCAxOS4wMTUyMjE1NTI4OTg1MzggNC40MzQ3ODI2MDg2OTU2NTIgMTQuMjg0NzgyNjA4Njk1NjU0IE0gMTIuOTk5OTk5OTk5OTk5OTk4IDMuMTUwMDAwMDAwMDAwMDAwNCBMIDcuODYwODY5NTY1MjE3MzkgNS43MTk1NjUyMTczOTEzMDQgMTIuOTk5OTk5OTk5OTk5OTk4IDguMjg5MTMwNDM0NzgyNjA4IFoiIHN0cm9rZT0iIzQ0NDQ0NCIgc3Ryb2tlLXdpZHRoPSIyLjMiIGZpbGw9Im5vbmUiPjwvcGF0aD48L2c+PC9zdmc+';
	d.VARIABLE_ATTACHMENT_POINTS = 'PHN2ZyBmaWxsLW9wYWNpdHk9IjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBjb2xvci1yZW5kZXJpbmc9ImF1dG8iIGNvbG9yLWludGVycG9sYXRpb249ImF1dG8iIHRleHQtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2U9ImJsYWNrIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB3aWR0aD0iMjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc2hhcGUtcmVuZGVyaW5nPSJhdXRvIiBzdHJva2Utb3BhY2l0eT0iMSIgZmlsbD0iYmxhY2siIHN0cm9rZS1kYXNoYXJyYXk9Im5vbmUiIGZvbnQtd2VpZ2h0PSJub3JtYWwiIHN0cm9rZS13aWR0aD0iMSIgdmlld0JveD0iMCAwIDIwLjAgMjAuMCIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmb250LWZhbWlseT0iJmFwb3M7RGlhbG9nJmFwb3M7IiBmb250LXN0eWxlPSJub3JtYWwiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGZvbnQtc2l6ZT0iMTIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBpbWFnZS1yZW5kZXJpbmc9ImF1dG8iPjxkZWZzIGlkPSJnZW5lcmljRGVmcyIgIC8+PGcgID48ZyB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBjb2xvci1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY29sb3ItaW50ZXJwb2xhdGlvbj0ibGluZWFyUkdCIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplU3BlZWQiICAgID48cGF0aCBmaWxsPSJub25lIiBkPSJNNyA2IEwxMyAxMCBMMTMgMTYgTDcgMjAgTDEgMTYgTDEgMTAgWiIgICAgICAvPjxjaXJjbGUgZmlsbD0ibm9uZSIgcj0iMyIgY3g9IjciIGN5PSIxMyIgICAgICAvPjxsaW5lIHkyPSI3IiBmaWxsPSJub25lIiB4MT0iNyIgeDI9IjEzIiB5MT0iMTMiICAgICAgLz48cGF0aCBkPSJNMTQuMjE1MyA2IEwxNi4yOTgzIDIuNzk2NCBMMTQuMzA3NiAtMC41MDM5IEwxNS44ODUzIC0wLjUwMzkgTDE3LjIwOCAxLjY4NDYgTDE4LjY0MDYgLTAuNTAzOSBMMTkuNzM0OSAtMC41MDM5IEwxNy43Mzk3IDIuNTYzNSBMMTkuODA1MiA2IEwxOC4yMzE5IDYgTDE2LjgyMTMgMy42NzUzIEwxNS4zMDk2IDYgWiIgc3Ryb2tlPSJub25lIiAgICAvPjwvZyAgPjwvZz48L3N2Zz4=';
	d.ZOOM_IN = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAyMCAyMCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjAgMjA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz4JPGc+CQk8Zz4JCQk8Zz4JCQkJPGc+CQkJCQkJCQkJCQk8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjM0OS4wOTE0IiB5MT0iLTE0OS4xNzQiIHgyPSIzNTEuNzk4IiB5Mj0iLTE0OS4xNzQiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTAuNjgyNiAwLjczMDggMC43MzA4IDAuNjgyNiAzNTkuOTUyMSAtMTQyLjEzNDMpIj4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjA5MzQiIHN0eWxlPSJzdG9wLWNvbG9yOiNDNUMyQzIiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjE3MTciIHN0eWxlPSJzdG9wLWNvbG9yOiNDRkNDQ0MiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjMwNjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNFOUU4RTgiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjM5ODgiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkZGRkYiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjUyOTUiIHN0eWxlPSJzdG9wLWNvbG9yOiNCN0I3QjciLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY0NDQiIHN0eWxlPSJzdG9wLWNvbG9yOiM3RDdEN0QiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY5OTQiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NzY3NjciLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cG9seWdvbiBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzFfKTtzdHJva2U6IzhEOEQ4RDtzdHJva2Utd2lkdGg6MC40MDAxOyIgcG9pbnRzPSIxMy4xNjksMTUuMzM2IDE1LjAxMywxMy4zNjYgMTAuMjc2LDguOTUzIAkJCQkJCTguNDMyLDEwLjkyMyAJCQkJCSIvPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzNDguNTQzOCIgeTE9Ii0xNDIuNzAwNiIgeDI9IjM1Mi4zMzA0IiB5Mj0iLTE0Mi43MDA2IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC0wLjY4MjYgMC43MzA4IDAuNzMwOCAwLjY4MjYgMzU5Ljk1MjEgLTE0Mi4xMzQzKSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzM2QkQwMCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDU2NyIgc3R5bGU9InN0b3AtY29sb3I6IzJCQkMxOCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMTgyMSIgc3R5bGU9InN0b3AtY29sb3I6IzE0QkI0OSIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMjc3NiIgc3R5bGU9InN0b3AtY29sb3I6IzA1QkE2OCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzMxMyIgc3R5bGU9InN0b3AtY29sb3I6IzAwQkE3MyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzkwOCIgc3R5bGU9InN0b3AtY29sb3I6IzAxQUY2MCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNTEwOCIgc3R5bGU9InN0b3AtY29sb3I6IzAyOTQyRiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNjEzNSIgc3R5bGU9InN0b3AtY29sb3I6IzA0N0EwMCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNzI1NiIgc3R5bGU9InN0b3AtY29sb3I6IzA0NzgwMyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuODE1NiIgc3R5bGU9InN0b3AtY29sb3I6IzAzNzEwRCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuODk3OSIgc3R5bGU9InN0b3AtY29sb3I6IzAyNjUxRSIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuOTc1MiIgc3R5bGU9InN0b3AtY29sb3I6IzAxNTUzNiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDRGM0YiLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzJfKTsiIGQ9Ik0xNS4wODYsMTIuNjk3bDQuNTQyLDQuMjI5YzAuNDM2LDAuNDA2LDAuNDU5LDEuMDg5LDAuMDUxLDEuNTI0bC0xLjEwNiwxLjE4MgkJCQkJCWMtMC40MDUsMC40MzQtMS4wOTIsMC40NTctMS41MjUsMC4wNTNsLTQuNTQyLTQuMjNMMTUuMDg2LDEyLjY5N3oiLz4JCQkJPC9nPgkJCQk8Zz4JCQkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNDI3LjI0MDUiIHkxPSItNDUuMTE5MiIgeDI9IjQ0MC45Mzg4IiB5Mj0iLTQ1LjExOTIiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTAuOTcyOCAwLjIzMTQgMC4yMzE0IDAuOTcyOCA0MzkuODA3OCAtNDkuNTA5OSkiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDExIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2MzYzIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4wNDY0IiBzdHlsZT0ic3RvcC1jb2xvcjojNTc1NzU3Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4xNDI0IiBzdHlsZT0ic3RvcC1jb2xvcjojM0IzQjNCIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4yMjYyIiBzdHlsZT0ic3RvcC1jb2xvcjojMkEyQTJBIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4yODgzIiBzdHlsZT0ic3RvcC1jb2xvcjojMjQyNDI0Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC40ODc2IiBzdHlsZT0ic3RvcC1jb2xvcjojNjk2OTY5Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC42NTAzIiBzdHlsZT0ic3RvcC1jb2xvcjojOUU5RTlFIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM2MzYzNiIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfM18pO3N0cm9rZTojOEQ4RDhEO3N0cm9rZS13aWR0aDowLjQwMDE7IiBkPSJNMC40LDguNTM2YzAuODI2LDMuNjg0LDQuNDg4LDYuMDAxLDguMTgsNS4xNzgJCQkJCQljMy42OTEtMC44MjYsNi4wMTQtNC40NzcsNS4xODktOC4xNjJjLTAuODI1LTMuNjc4LTQuNDg3LTUuOTk1LTguMTgtNS4xNzNDMS44OTYsMS4yMDUtMC40MjYsNC44NTUsMC40LDguNTM2eiIvPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0MzQuMDg3NyIgeTE9Ii01MC40OTQxIiB4Mj0iNDM0LjA4NzciIHkyPSItMzkuNzQ3MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC45NzI4IDAuMjMxNCAwLjIzMTQgMC45NzI4IDQzOS44MDc4IC00OS41MDk5KSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0RCRUJGNCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMTE3NiIgc3R5bGU9InN0b3AtY29sb3I6I0QyRTdGMyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzA1OSIgc3R5bGU9InN0b3AtY29sb3I6I0JCREFFRiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNTQxMyIgc3R5bGU9InN0b3AtY29sb3I6Izk1QzZFOSIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuODEyIiBzdHlsZT0ic3RvcC1jb2xvcjojNjFBQkUxIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM4OTZEQiIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTEuODI5LDguMjE4YzAuNjQ3LDIuODk1LDMuNTI3LDQuNzE3LDYuNDMxLDQuMDdjMi45MDQtMC42NDYsNC43MzEtMy41MTksNC4wODQtNi40MTYJCQkJCQljLTAuNjUxLTIuODk0LTMuNTMyLTQuNzE1LTYuNDM1LTQuMDY5QzMuMDAzLDIuNDUxLDEuMTc4LDUuMzIzLDEuODI5LDguMjE4eiIvPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0MzQuMDg3NSIgeTE9Ii01MC40OTQxIiB4Mj0iNDM0LjA4NzUiIHkyPSItNDQuNzU2MyIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC45NzI4IDAuMjMxNCAwLjIzMTQgMC45NzI4IDQzOS44MDc4IC00OS41MDk5KSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0YzRkFGRiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNBRkQzRjIiLz4JCQkJCTwvbGluZWFyR3JhZGllbnQ+CQkJCQk8cGF0aCBzdHlsZT0iZmlsbDp1cmwoI1NWR0lEXzVfKTsiIGQ9Ik0xLjgyOSw4LjIxOGMtMC42NTEtMi44OTUsMS4xNzQtNS43NjgsNC4wOC02LjQxNmMyLjkwMy0wLjY0Niw1Ljc4NCwxLjE3NSw2LjQzNSw0LjA2OQkJCQkJCWMwLDAtMS4xLDAuOTMyLTMuMDE1LDAuNzEzQzcuNDE1LDYuMzY3LDUuODc1LDUuNzEsNC4xOTEsNi40MThTMS44MjksOC4yMTgsMS44MjksOC4yMTh6Ii8+CQkJCQk8cGF0aCBzdHlsZT0iZmlsbDpub25lOyIgZD0iTTEuODI5LDguMjE4YzAuNjQ3LDIuODk1LDMuNTI3LDQuNzE3LDYuNDMxLDQuMDdjMi45MDQtMC42NDYsNC43MzEtMy41MTksNC4wODQtNi40MTYJCQkJCQljLTAuNjUxLTIuODk0LTMuNTMyLTQuNzE1LTYuNDM1LTQuMDY5QzMuMDAzLDIuNDUxLDEuMTc4LDUuMzIzLDEuODI5LDguMjE4eiIvPgkJCQk8L2c+CQkJPC9nPgkJPC9nPgkJPGc+CQkJPHJlY3QgeD0iNS44MzMiIHk9IjMuMDU4IiB3aWR0aD0iMi4yODUiIGhlaWdodD0iNy45NzkiLz4JCQk8cmVjdCB4PSIyLjk3MyIgeT0iNS45MDkiIHdpZHRoPSI4LjAwNCIgaGVpZ2h0PSIyLjI4Ii8+CQk8L2c+CTwvZz4JCQk8bGluZSBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojQ0ZGRkQ3O3N0cm9rZS13aWR0aDowLjYwMDE7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kOyIgeDE9IjE5LjE0NSIgeTE9IjE3LjU3NyIgeDI9IjE0LjkzOSIgeTI9IjEzLjczMSIvPgkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjAuNjAwMTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiB4MT0iMTMuODE0IiB5MT0iMTMuNDU4IiB4Mj0iMTIuNDMzIiB5Mj0iMTIuMTkyIi8+PC9nPjwvc3ZnPg==';
	d.ZOOM_OUT = 'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+CTxnPgkJPGc+CQkJPGc+CQkJCTxnPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzODUuMjIxNiIgeTE9Ii05OC4zNjk1IiB4Mj0iMzk4Ljc4NDgiIHkyPSItOTguMzY5NSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC42ODI2IDAuNzMwOCAwLjczMDggMC42ODI2IDM5OC4wMjQxIC0xNTguNjcwMykiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDkzNCIgc3R5bGU9InN0b3AtY29sb3I6I0M1QzJDMiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMTcxNyIgc3R5bGU9InN0b3AtY29sb3I6I0NGQ0NDQyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzA2MSIgc3R5bGU9InN0b3AtY29sb3I6I0U5RThFOCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzk4OCIgc3R5bGU9InN0b3AtY29sb3I6I0ZGRkZGRiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNTI5NSIgc3R5bGU9InN0b3AtY29sb3I6I0I3QjdCNyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNjQ0NCIgc3R5bGU9InN0b3AtY29sb3I6IzdEN0Q3RCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNjk5NCIgc3R5bGU9InN0b3AtY29sb3I6IzY3Njc2NyIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwb2x5Z29uIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMV8pO3N0cm9rZTojNUE1QTVBO3N0cm9rZS13aWR0aDoyLjAwMDU7IiBwb2ludHM9IjY1Ljc5NCw3Ni42MDQgNzUuMDI4LDY2Ljc2NSA1MS4zMTUsNDQuNzE0IAkJCQkJCTQyLjA4NCw1NC41NTMgCQkJCQkiLz4JCQkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMzgyLjQ1NzUiIHkxPSItNjUuOTk4MiIgeDI9IjQwMS40MTY1IiB5Mj0iLTY1Ljk5ODIiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTAuNjgyNiAwLjczMDggMC43MzA4IDAuNjgyNiAzOTguMDI0MSAtMTU4LjY3MDMpIj4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMzZCRDAwIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4wNTY3IiBzdHlsZT0ic3RvcC1jb2xvcjojMkJCQzE4Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4xODIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMTRCQjQ5Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4yNzc2IiBzdHlsZT0ic3RvcC1jb2xvcjojMDVCQTY4Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4zMzEzIiBzdHlsZT0ic3RvcC1jb2xvcjojMDBCQTczIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4zOTA4IiBzdHlsZT0ic3RvcC1jb2xvcjojMDFBRjYwIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC41MTA4IiBzdHlsZT0ic3RvcC1jb2xvcjojMDI5NDJGIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC42MTM1IiBzdHlsZT0ic3RvcC1jb2xvcjojMDQ3QTAwIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC43MjU2IiBzdHlsZT0ic3RvcC1jb2xvcjojMDQ3ODAzIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC44MTU2IiBzdHlsZT0ic3RvcC1jb2xvcjojMDM3MTBEIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC44OTc5IiBzdHlsZT0ic3RvcC1jb2xvcjojMDI2NTFFIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC45NzUyIiBzdHlsZT0ic3RvcC1jb2xvcjojMDE1NTM2Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzAwNEYzRiIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfMl8pOyIgZD0iTTc1LjM4Myw2My40MTRMOTguMTE5LDg0LjU1YzIuMTgyLDIuMDM1LDIuMyw1LjQ0LDAuMjU4LDcuNjE0bC01LjU0LDUuODk5CQkJCQkJYy0yLjAzNCwyLjE3NC01LjQ2LDIuMjg4LTcuNjM3LDAuMjYyTDYyLjQ2Miw3Ny4xODhMNzUuMzgzLDYzLjQxNHoiLz4JCQkJPC9nPgkJCQk8Zz4JCQkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNDQ4LjQ5MTUiIHkxPSItMTkuMzc2MyIgeDI9IjUxNy4wNDg0IiB5Mj0iLTE5LjM3NjIiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTAuOTcyOCAwLjIzMTQgMC4yMzE0IDAuOTcyOCA1MDkuNDYzOCAtNTcuNjc3OSkiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDExIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2MzYzIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4wNDY0IiBzdHlsZT0ic3RvcC1jb2xvcjojNTc1NzU3Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4xNDI0IiBzdHlsZT0ic3RvcC1jb2xvcjojM0IzQjNCIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4yMjYyIiBzdHlsZT0ic3RvcC1jb2xvcjojMkEyQTJBIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC4yODgzIiBzdHlsZT0ic3RvcC1jb2xvcjojMjQyNDI0Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC40ODc2IiBzdHlsZT0ic3RvcC1jb2xvcjojNjk2OTY5Ii8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMC42NTAzIiBzdHlsZT0ic3RvcC1jb2xvcjojOUU5RTlFIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM2MzYzNiIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfM18pO3N0cm9rZTojNTg1ODU4O3N0cm9rZS13aWR0aDoyLjAwMDU7IiBkPSJNMS44ODMsNDIuNjM3CQkJCQkJQzYuMDIsNjEuMDMzLDI0LjM0Niw3Mi42MDQsNDIuODI1LDY4LjQ5MWMxOC40ODEtNC4xMTksMzAuMS0yMi4zNjQsMjUuOTcyLTQwLjc2MkM2NC42NjUsOS4zNDUsNDYuMzM0LTIuMjI5LDI3Ljg1LDEuODgJCQkJCQlDOS4zNzYsNS45OTQtMi4yNSwyNC4yMzksMS44ODMsNDIuNjM3eiIvPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0ODIuNzU5MiIgeTE9Ii00Ni4yMzAzIiB4Mj0iNDgyLjc1OTIiIHkyPSI3LjQ3MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtMC45NzI4IDAuMjMxNCAwLjIzMTQgMC45NzI4IDUwOS40NjM4IC01Ny42Nzc5KSI+CQkJCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0RCRUJGNCIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMTE3NiIgc3R5bGU9InN0b3AtY29sb3I6I0QyRTdGMyIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMzA1OSIgc3R5bGU9InN0b3AtY29sb3I6I0JCREFFRiIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuNTQxMyIgc3R5bGU9InN0b3AtY29sb3I6Izk1QzZFOSIvPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuODEyIiBzdHlsZT0ic3RvcC1jb2xvcjojNjFBQkUxIi8+CQkJCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzM4OTZEQiIvPgkJCQkJPC9saW5lYXJHcmFkaWVudD4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOnVybCgjU1ZHSURfNF8pOyIgZD0iTTkuMDM5LDQxLjA0MmMzLjIzOCwxNC40NzIsMTcuNjU0LDIzLjU3MiwzMi4xODQsMjAuMzM2CQkJCQkJYzE0LjU0LTMuMjQyLDIzLjY3NC0xNy41ODMsMjAuNDQyLTMyLjA2M0M1OC40MDEsMTQuODU4LDQzLjk4NCw1Ljc1OCwyOS40NTYsOC45ODdDMTQuOTE2LDEyLjIyOSw1Ljc3OCwyNi41NzgsOS4wMzksNDEuMDQyeiIJCQkJCQkvPgkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF81XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI0ODIuNzU4IiB5MT0iLTQ2LjIzMDMiIHgyPSI0ODIuNzU4IiB5Mj0iLTE3LjU1MzciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTAuOTcyOCAwLjIzMTQgMC4yMzE0IDAuOTcyOCA1MDkuNDYzOCAtNTcuNjc3OSkiPgkJCQkJCTxzdG9wICBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNGM0ZBRkYiLz4JCQkJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojQUZEM0YyIi8+CQkJCQk8L2xpbmVhckdyYWRpZW50PgkJCQkJPHBhdGggc3R5bGU9ImZpbGw6dXJsKCNTVkdJRF81Xyk7IiBkPSJNOS4wMzksNDEuMDQyQzUuNzc4LDI2LjU3OCwxNC45MTYsMTIuMjI5LDI5LjQ1Niw4Ljk4NwkJCQkJCWMxNC41MjgtMy4yMjksMjguOTQ1LDUuODcxLDMyLjIwOCwyMC4zMjljMCwwLTUuNDk5LDQuNjU4LTE1LjA4OCwzLjU2NWMtOS41ODQtMS4wODctMTcuMjg4LTQuMzc2LTI1LjcxOS0wLjgzNgkJCQkJCUMxMi40MywzNS41ODMsOS4wMzksNDEuMDQyLDkuMDM5LDQxLjA0MnoiLz4JCQkJCTxwYXRoIHN0eWxlPSJmaWxsOm5vbmU7IiBkPSJNOS4wMzksNDEuMDQyYzMuMjM4LDE0LjQ3MiwxNy42NTQsMjMuNTcyLDMyLjE4NCwyMC4zMzZjMTQuNTQtMy4yNDIsMjMuNjc0LTE3LjU4MywyMC40NDItMzIuMDYzCQkJCQkJQzU4LjQwMSwxNC44NTgsNDMuOTg0LDUuNzU4LDI5LjQ1Niw4Ljk4N0MxNC45MTYsMTIuMjI5LDUuNzc4LDI2LjU3OCw5LjAzOSw0MS4wNDJ6Ii8+CQkJCTwvZz4JCQk8L2c+CQk8L2c+CQk8Zz4JCQk8cmVjdCB4PSIxNC43NjYiIHk9IjI5LjUwMiIgd2lkdGg9IjQwLjA1OCIgaGVpZ2h0PSIxMS4zOTMiLz4JCTwvZz4JPC9nPgkJCTxsaW5lIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNEOUZGRDk7c3Ryb2tlLXdpZHRoOjMuMDAwNztzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7IiB4MT0iOTUuNzA0IiB5MT0iODcuNzk3IiB4Mj0iNzQuNjU4IiB5Mj0iNjguNTg2Ii8+CQkJPGxpbmUgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2Utd2lkdGg6My4wMDA3O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHgxPSI2OS40MDMiIHkxPSI2Ni45NzQiIHgyPSI2Mi40NzUiIHkyPSI2MC42NDciLz48L2c+PC9zdmc+';

	return d;

})(ChemDoodle.extensions);

ChemDoodle.uis.gui.templateDepot = (function(JSON, localStorage, undefined) {
	'use strict';
	let d = [];

	let group = {name:'Amino Acids', templates:[]};
	group.templates.push({
		name: 'Alanine <b>Ala</b> <i>A</i>',
		data: {"a":[{"x":195.34,"y":269},{"x":195.34,"y":289,"l":"N"},{"x":178.018,"y":259},{"x":212.66,"y":259},{"x":212.66,"y":239,"l":"O"},{"x":229.982,"y":269,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":1},{"b":3,"e":5},{"b":3,"e":4,"o":2}]}
	});
	group.templates.push({
		name: 'Alanine <i>chain</i>',
		data: {"a":[{"x":-29.9995,"y":0,"l":"N"},{"x":-9.9989,"y":0},{"x":9.9989,"y":0},{"x":-9.9989,"y":20.0006},{"x":29.9995,"y":0,"l":"O"},{"x":9.9989,"y":-20.0006,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":2,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Alanine <i>side chain</i>',
		data: {"a":[{"x":-10,"y":0},{"x":10,"y":0}],"b":[{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Arginine <b>Arg</b> <i>R</i>',
		data: {"a":[{"x":134.718,"y":269,"l":"N"},{"x":152.04,"y":259},{"x":169.36,"y":269,"l":"N"},{"x":152.04,"y":239,"l":"N"},{"x":186.68,"y":259},{"x":204,"y":269},{"x":221.322,"y":259},{"x":238.642,"y":269},{"x":255.962,"y":259},{"x":238.642,"y":289,"l":"N"},{"x":273.282,"y":269,"l":"O"},{"x":255.962,"y":239,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3,"o":2},{"b":2,"e":4},{"b":4,"e":5},{"b":5,"e":6},{"b":7,"e":6},{"b":7,"e":8},{"b":7,"e":9},{"b":8,"e":10},{"b":8,"e":11,"o":2}]}
	});
	group.templates.push({
		name: 'Arginine <i>chain</i>',
		data: {"a":[{"x":-30.0001,"y":-49.9998,"l":"N"},{"x":-9.9991,"y":-49.9998},{"x":9.9991,"y":-49.9998},{"x":-9.9991,"y":-29.9988},{"x":9.9991,"y":-70.0007,"l":"O"},{"x":30.0001,"y":-49.9998,"l":"O"},{"x":-9.9991,"y":-10.0005},{"x":-9.9991,"y":10.0005},{"x":-9.9991,"y":29.9987,"l":"N"},{"x":-9.9991,"y":49.9997},{"x":-9.9991,"y":70.0007,"l":"N"},{"x":9.9991,"y":49.9997,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":5},{"b":2,"e":4,"o":2},{"b":3,"e":6},{"b":6,"e":7},{"b":7,"e":8},{"b":8,"e":9},{"b":9,"e":10},{"b":9,"e":11,"o":2}]}
	});
	group.templates.push({
		name: 'Arginine <i>side chain</i>',
		data: {"a":[{"x":-59.9973,"y":9.9986},{"x":-39.9973,"y":9.9986},{"x":-20,"y":9.9986},{"x":-0,"y":9.9986},{"x":19.9972,"y":9.9986,"l":"N"},{"x":39.9973,"y":9.9986},{"x":39.9973,"y":-9.9986,"l":"N"},{"x":59.9973,"y":9.9986,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":4},{"b":4,"e":5},{"b":5,"e":7},{"b":5,"e":6,"o":2}]}
	});
	group.templates.push({
		name: 'Asparagine <b>Asn</b> <i>N</i>',
		data: {"a":[{"x":178.02,"y":269},{"x":178.02,"y":289,"l":"N"},{"x":160.698,"y":259,"l":"O"},{"x":195.34,"y":259},{"x":212.66,"y":269},{"x":229.98,"y":259},{"x":212.66,"y":289,"l":"N"},{"x":247.302,"y":269,"l":"O"},{"x":229.98,"y":239,"l":"O"}],"b":[{"b":0,"e":3},{"b":0,"e":2,"o":2},{"b":0,"e":1},{"b":4,"e":3},{"b":4,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":5,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Asparagine <i>chain</i>',
		data: {"a":[{"x":-30.0002,"y":-19.9996,"l":"N"},{"x":-9.9991,"y":-19.9996},{"x":-9.9991,"y":0.0014},{"x":9.9991,"y":-19.9996},{"x":-9.9991,"y":19.9996},{"x":9.9991,"y":-40.0007,"l":"O"},{"x":30.0002,"y":-19.9997,"l":"O"},{"x":-9.9991,"y":40.0007,"l":"N"},{"x":9.9991,"y":19.9996,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":6},{"b":3,"e":5,"o":2},{"b":2,"e":4},{"b":4,"e":7},{"b":4,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Asparagine <i>side chain</i>',
		data: {"a":[{"x":-29.9986,"y":9.9986},{"x":-9.9986,"y":9.9986},{"x":9.9986,"y":9.9986},{"x":29.9986,"y":9.9986,"l":"N"},{"x":9.9986,"y":-9.9986,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":2,"e":4,"o":2}]}
	});
	group.templates.push({
		name: 'Aspartic Acid <b>Asp</b> <i>D</i>',
		data: {"a":[{"x":178.02,"y":269},{"x":178.02,"y":289,"l":"O"},{"x":195.34,"y":259},{"x":160.698,"y":259,"l":"O"},{"x":212.66,"y":269},{"x":229.98,"y":259},{"x":212.66,"y":289,"l":"N"},{"x":229.98,"y":239,"l":"O"},{"x":247.302,"y":269,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":3,"o":2},{"b":0,"e":1},{"b":4,"e":2},{"b":4,"e":5},{"b":4,"e":6},{"b":5,"e":8},{"b":5,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Aspartic Acid <i>chain</i>',
		data: {"a":[{"x":-30.0002,"y":-19.9997,"l":"N"},{"x":-9.9991,"y":-19.9997},{"x":-9.9991,"y":0.0014},{"x":9.9991,"y":-19.9997},{"x":-9.9991,"y":19.9996},{"x":30.0002,"y":-19.9997,"l":"O"},{"x":9.9991,"y":-40.0007,"l":"O"},{"x":-9.9991,"y":40.0007,"l":"O"},{"x":9.9991,"y":19.9996,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":5},{"b":3,"e":6,"o":2},{"b":2,"e":4},{"b":4,"e":7},{"b":4,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Aspartic Acid <i>side chain</i>',
		data: {"a":[{"x":-29.9986,"y":9.9986},{"x":-9.9986,"y":9.9986},{"x":9.9986,"y":9.9986},{"x":9.9986,"y":-9.9986,"l":"O"},{"x":29.9986,"y":9.9986,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":4},{"b":2,"e":3,"o":2}]}
	});
	group.templates.push({
		name: 'Cysteine <b>Cys</b> <i>C</i>',
		data: {"a":[{"x":169.358,"y":269,"l":"S"},{"x":186.678,"y":259},{"x":203.998,"y":269},{"x":221.32,"y":259},{"x":203.998,"y":289,"l":"N"},{"x":221.32,"y":239,"l":"O"},{"x":238.642,"y":269,"l":"O"}],"b":[{"b":0,"e":1},{"b":2,"e":1},{"b":2,"e":3},{"b":2,"e":4},{"b":3,"e":6},{"b":3,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Cysteine <i>chain</i>',
		data: {"a":[{"x":-30,"y":-9.9991,"l":"N"},{"x":-9.9991,"y":-9.9991},{"x":-9.9991,"y":10.0019},{"x":9.9991,"y":-9.9991},{"x":-9.9991,"y":30,"l":"S"},{"x":30,"y":-9.9991,"l":"O"},{"x":9.9991,"y":-30,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":5},{"b":3,"e":6,"o":2},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Cysteine <i>side chain</i>',
		data: {"a":[{"x":-19.9986,"y":0},{"x":0.0014,"y":0},{"x":19.9986,"y":0,"l":"S"}],"b":[{"b":0,"e":1},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Glutamic Acid <b>Glu</b> <i>E</i>',
		data: {"a":[{"x":152.038,"y":269,"l":"O"},{"x":169.358,"y":259},{"x":186.68,"y":269},{"x":169.358,"y":239,"l":"O"},{"x":204,"y":259},{"x":221.32,"y":269},{"x":238.642,"y":259},{"x":221.32,"y":289,"l":"N"},{"x":255.962,"y":269,"l":"O"},{"x":238.642,"y":239,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3,"o":2},{"b":2,"e":4},{"b":5,"e":4},{"b":5,"e":6},{"b":5,"e":7},{"b":6,"e":8},{"b":6,"e":9,"o":2}]}
	});
	group.templates.push({
		name: 'Glutamic Acid <i>chain</i>',
		data: {"a":[{"x":-30.0005,"y":-29.9991,"l":"N"},{"x":-9.9992,"y":-29.9991},{"x":-9.9992,"y":-9.9978},{"x":9.9993,"y":-29.9991},{"x":-9.9992,"y":10.0006},{"x":9.9992,"y":-50.0003,"l":"O"},{"x":30.0005,"y":-29.9991,"l":"O"},{"x":-9.9992,"y":30.0018},{"x":-9.9992,"y":50.0003,"l":"O"},{"x":9.9992,"y":30.0018,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":6},{"b":3,"e":5,"o":2},{"b":2,"e":4},{"b":4,"e":7},{"b":7,"e":8},{"b":7,"e":9,"o":2}]}
	});
	group.templates.push({
		name: 'Glutamic Acid <i>side chain</i>',
		data: {"a":[{"x":-40.0028,"y":10},{"x":-20,"y":10},{"x":0,"y":10},{"x":20.0028,"y":10},{"x":40.0028,"y":10,"l":"O"},{"x":20.0028,"y":-10,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":4},{"b":3,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Glutamine <b>Gln</b> <i>Q</i>',
		data: {"a":[{"x":152.038,"y":269,"l":"N"},{"x":169.358,"y":259},{"x":186.68,"y":269},{"x":169.358,"y":239,"l":"O"},{"x":204,"y":259},{"x":221.32,"y":269},{"x":238.642,"y":259},{"x":221.32,"y":289,"l":"N"},{"x":238.642,"y":239,"l":"O"},{"x":255.962,"y":269,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3,"o":2},{"b":2,"e":4},{"b":5,"e":4},{"b":5,"e":6},{"b":5,"e":7},{"b":6,"e":9},{"b":6,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Glutamine <i>chain</i>',
		data: {"a":[{"x":-30.0005,"y":-29.9991,"l":"N"},{"x":-9.9992,"y":-29.9991},{"x":9.9992,"y":-29.9991},{"x":-9.9992,"y":-9.9979},{"x":9.9992,"y":-50.0003,"l":"O"},{"x":30.0005,"y":-29.9991,"l":"O"},{"x":-9.9992,"y":10.0006},{"x":-9.9992,"y":30.0018},{"x":-9.9992,"y":50.0003,"l":"N"},{"x":9.9992,"y":30.0018,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":5},{"b":2,"e":4,"o":2},{"b":3,"e":6},{"b":6,"e":7},{"b":7,"e":8},{"b":7,"e":9,"o":2}]}
	});
	group.templates.push({
		name: 'Glutamine <i>side chain</i>',
		data: {"a":[{"x":-40.0028,"y":10},{"x":-20,"y":10},{"x":0,"y":10},{"x":20.0028,"y":10},{"x":40.0027,"y":10,"l":"N"},{"x":20.0028,"y":-10,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":4},{"b":3,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Glycine <b>Gly</b> <i>G</i>',
		data: {"a":[{"x":186.678,"y":269},{"x":204,"y":259},{"x":186.678,"y":289,"l":"N"},{"x":221.322,"y":269,"l":"O"},{"x":204,"y":239,"l":"O"}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":1,"e":4,"o":2}]}
	});
	group.templates.push({
		name: 'Glycine <i>chain</i>',
		data: {"a":[{"x":-29.9995,"y":0,"l":"N"},{"x":-9.9989,"y":0},{"x":9.9989,"y":0},{"x":-9.9989,"y":20.0005,"l":"H"},{"x":29.9995,"y":0,"l":"O"},{"x":9.9989,"y":-20.0005,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":2,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Glycine <i>side chain</i>',
		data: {"a":[{"x":-10,"y":0},{"x":10,"y":0,"l":"H"}],"b":[{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Histidine <b>His</b> <i>H</i>',
		data: {"a":[{"x":185.186,"y":266.976},{"x":166.914,"y":258.84,"l":"N"},{"x":183.094,"y":286.866},{"x":202.506,"y":256.976},{"x":153.532,"y":273.704},{"x":163.532,"y":291.024,"l":"N"},{"x":219.826,"y":266.976},{"x":219.826,"y":286.976,"l":"N"},{"x":237.146,"y":256.976},{"x":254.468,"y":266.976,"l":"O"},{"x":237.146,"y":236.976,"l":"O"}],"b":[{"b":0,"e":3},{"b":0,"e":2,"o":2},{"b":0,"e":1},{"b":6,"e":3},{"b":2,"e":5},{"b":4,"e":1,"o":2},{"b":5,"e":4},{"b":6,"e":8},{"b":6,"e":7},{"b":8,"e":9},{"b":8,"e":10,"o":2}]}
	});
	group.templates.push({
		name: 'Histidine <i>chain</i>',
		data: {"a":[{"x":-30.009,"y":-25.4208,"l":"N"},{"x":-10.0021,"y":-25.4208},{"x":10.0021,"y":-25.4208},{"x":-10.0021,"y":-5.4138},{"x":30.009,"y":-25.4208,"l":"O"},{"x":10.0021,"y":-45.4277,"l":"O"},{"x":-10.0021,"y":14.5903},{"x":6.1209,"y":26.4104},{"x":-26.1636,"y":26.4104,"l":"N"},{"x":0.0179,"y":45.4277,"l":"N"},{"x":-19.9532,"y":45.4277}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":2,"e":5,"o":2},{"b":3,"e":6},{"b":6,"e":8},{"b":8,"e":10,"o":2},{"b":10,"e":9},{"b":9,"e":7},{"b":6,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Histidine <i>side chain</i>',
		data: {"a":[{"x":-35.4168,"y":-0.0193},{"x":-15.4141,"y":-0.0193},{"x":4.5859,"y":-0.0193},{"x":16.4035,"y":16.1389,"l":"N"},{"x":16.4035,"y":-16.1389},{"x":35.4168,"y":9.9297},{"x":35.4168,"y":-10.0372,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":5,"o":2},{"b":5,"e":6},{"b":6,"e":4},{"b":2,"e":4,"o":2}]}
	});
	group.templates.push({
		name: 'Isoleucine <b>Ile</b> <i>I</i>',
		data: {"a":[{"x":178.02,"y":269},{"x":160.698,"y":259},{"x":195.34,"y":259},{"x":212.66,"y":269},{"x":195.34,"y":239},{"x":212.66,"y":289,"l":"N"},{"x":229.98,"y":259},{"x":247.302,"y":269,"l":"O"},{"x":229.98,"y":239,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":3},{"b":2,"e":4},{"b":3,"e":6},{"b":3,"e":5},{"b":6,"e":7},{"b":6,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Isoleucine <i>chain</i>',
		data: {"a":[{"x":-30.0002,"y":-19.9997,"l":"N"},{"x":-9.9991,"y":-19.9997},{"x":-9.9991,"y":0.0014},{"x":9.9991,"y":-19.9997},{"x":9.9991,"y":0.0014},{"x":-9.9991,"y":19.9997},{"x":9.9991,"y":-40.0007,"l":"O"},{"x":30.0002,"y":-19.9997,"l":"O"},{"x":-9.9991,"y":40.0007}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":7},{"b":3,"e":6,"o":2},{"b":2,"e":4},{"b":2,"e":5},{"b":5,"e":8}]}
	});
	group.templates.push({
		name: 'Isoleucine <i>side chain</i>',
		data: {"a":[{"x":-27.0711,"y":2.5882},{"x":-7.0711,"y":2.5882},{"x":7.0711,"y":16.7303},{"x":-1.8947,"y":-16.7303,"l":"H"},{"x":7.0711,"y":-11.554},{"x":27.0711,"y":16.7303}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":2},{"b":2,"e":5},{"b":1,"e":3}]}
	});
	group.templates.push({
		name: 'Leucine <b>Leu</b> <i>L</i>',
		data: {"a":[{"x":178.02,"y":269},{"x":178.02,"y":289},{"x":160.698,"y":259},{"x":195.34,"y":259},{"x":212.66,"y":269},{"x":212.66,"y":289,"l":"N"},{"x":229.98,"y":259},{"x":247.302,"y":269,"l":"O"},{"x":229.98,"y":239,"l":"O"}],"b":[{"b":0,"e":3},{"b":0,"e":2},{"b":0,"e":1},{"b":4,"e":3},{"b":4,"e":6},{"b":4,"e":5},{"b":6,"e":7},{"b":6,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Leucine <i>chain</i>',
		data: {"a":[{"x":-30.0002,"y":-19.9997,"l":"N"},{"x":-9.9991,"y":-19.9997},{"x":-9.9991,"y":0.0013},{"x":9.9991,"y":-19.9997},{"x":-9.9991,"y":19.9996},{"x":9.9991,"y":-40.0007,"l":"O"},{"x":30.0002,"y":-19.9997,"l":"O"},{"x":-9.9992,"y":40.0007},{"x":9.9991,"y":19.9996}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":6},{"b":3,"e":5,"o":2},{"b":2,"e":4},{"b":4,"e":8},{"b":4,"e":7}]}
	});
	group.templates.push({
		name: 'Leucine <i>side chain</i>',
		data: {"a":[{"x":-29.9986,"y":9.9986},{"x":-9.9986,"y":9.9986},{"x":9.9986,"y":9.9986},{"x":29.9986,"y":9.9986},{"x":9.9986,"y":-9.9986}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":4},{"b":2,"e":3}]}
	});
	group.templates.push({
		name: 'Lysine <b>Lys</b> <i>K</i>',
		data: {"a":[{"x":160.698,"y":269},{"x":143.378,"y":259,"l":"N"},{"x":178.02,"y":259},{"x":195.34,"y":269},{"x":212.66,"y":259},{"x":229.98,"y":269},{"x":247.302,"y":259},{"x":229.98,"y":289,"l":"N"},{"x":264.622,"y":269,"l":"O"},{"x":247.302,"y":239,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":3},{"b":3,"e":4},{"b":5,"e":4},{"b":5,"e":6},{"b":5,"e":7},{"b":6,"e":8},{"b":6,"e":9,"o":2}]}
	});
	group.templates.push({
		name: 'Lysine <i>chain</i>',
		data: {"a":[{"x":-30,"y":-39.9991,"l":"N"},{"x":-9.9991,"y":-39.9991},{"x":-9.9991,"y":-19.9982},{"x":9.9991,"y":-39.9991},{"x":-9.9991,"y":-0},{"x":30,"y":-39.9991,"l":"O"},{"x":9.9991,"y":-60,"l":"O"},{"x":-9.9991,"y":20.0009},{"x":-9.9991,"y":39.9991},{"x":-9.9991,"y":60.0001,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":5},{"b":3,"e":6,"o":2},{"b":2,"e":4},{"b":4,"e":7},{"b":7,"e":8},{"b":8,"e":9}]}
	});
	group.templates.push({
		name: 'Lysine <i>side chain</i>',
		data: {"a":[{"x":-49.9973,"y":0},{"x":-29.9973,"y":0},{"x":-10,"y":0},{"x":10,"y":0},{"x":29.9973,"y":0},{"x":49.9973,"y":0,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":4},{"b":4,"e":5}]}
	});
	group.templates.push({
		name: 'Methionine <b>Met</b> <i>M</i>',
		data: {"a":[{"x":169.36,"y":259,"l":"S"},{"x":152.038,"y":269},{"x":186.68,"y":269},{"x":204,"y":259},{"x":221.32,"y":269},{"x":221.32,"y":289,"l":"N"},{"x":238.642,"y":259},{"x":255.962,"y":269,"l":"O"},{"x":238.642,"y":239,"l":"O"}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":2,"e":3},{"b":4,"e":3},{"b":4,"e":6},{"b":4,"e":5},{"b":6,"e":7},{"b":6,"e":8,"o":2}]}
	});
	group.templates.push({
		name: 'Methionine <i>chain</i>',
		data: {"a":[{"x":-30.0002,"y":-29.9989,"l":"N"},{"x":-9.9992,"y":-29.9989},{"x":9.9991,"y":-29.9989},{"x":-9.9991,"y":-9.9978},{"x":9.9991,"y":-49.9999,"l":"O"},{"x":30.0002,"y":-29.9989,"l":"O"},{"x":-9.9991,"y":10.0004},{"x":-9.9991,"y":30.0015,"l":"S"},{"x":-9.9992,"y":49.9998}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":5},{"b":2,"e":4,"o":2},{"b":3,"e":6},{"b":6,"e":7},{"b":7,"e":8}]}
	});
	group.templates.push({
		name: 'Methionine <i>side chain</i>',
		data: {"a":[{"x":-39.9972,"y":0},{"x":-19.9972,"y":0},{"x":0,"y":0},{"x":20,"y":0,"l":"S"},{"x":39.9972,"y":0}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: 'Phenylalanine <b>Phe</b> <i>F</i>',
		data: {"a":[{"x":186.678,"y":264},{"x":169.358,"y":254},{"x":186.678,"y":284},{"x":204,"y":254},{"x":152.04,"y":264},{"x":169.358,"y":294},{"x":221.322,"y":264},{"x":152.04,"y":284},{"x":238.64,"y":254},{"x":221.322,"y":284,"l":"N"},{"x":255.96,"y":264,"l":"O"},{"x":238.64,"y":234,"l":"O"}],"b":[{"b":0,"e":2,"o":2},{"b":0,"e":1},{"b":0,"e":3},{"b":2,"e":5},{"b":4,"e":1,"o":2},{"b":6,"e":3},{"b":5,"e":7,"o":2},{"b":7,"e":4},{"b":6,"e":8},{"b":6,"e":9},{"b":8,"e":10},{"b":8,"e":11,"o":2}]}
	});
	group.templates.push({
		name: 'Phenylalanine <i>chain</i>',
		data: {"a":[{"x":-29.9902,"y":-30.0426,"l":"N"},{"x":-9.9958,"y":-30.0426},{"x":-9.9958,"y":-10.0482},{"x":9.9958,"y":-30.0426},{"x":-9.9958,"y":9.9435},{"x":29.9902,"y":-30.0426,"l":"O"},{"x":9.9958,"y":-50.037,"l":"O"},{"x":-27.3098,"y":19.993},{"x":7.2823,"y":19.993},{"x":-27.3098,"y":40.0232},{"x":7.2823,"y":40.0232},{"x":-9.9958,"y":50.037}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":5},{"b":3,"e":6,"o":2},{"b":2,"e":4},{"b":4,"e":7,"o":2},{"b":7,"e":9},{"b":9,"e":11,"o":2},{"b":11,"e":10},{"b":10,"e":8,"o":2},{"b":4,"e":8}]}
	});
	group.templates.push({
		name: 'Phenylalanine <i>side chain</i>',
		data: {"a":[{"x":-40.0373,"y":-0.0179},{"x":-20.0442,"y":-0.0179},{"x":-0.0537,"y":-0.0179},{"x":9.9952,"y":17.295},{"x":9.9952,"y":-17.295},{"x":30.0242,"y":17.295},{"x":30.0242,"y":-17.295},{"x":40.0373,"y":-0.0179}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3,"o":2},{"b":3,"e":5},{"b":5,"e":7,"o":2},{"b":7,"e":6},{"b":6,"e":4,"o":2},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Proline <b>Pro</b> <i>P</i>',
		data: {"a":[{"x":202.506,"y":266.976},{"x":184.236,"y":258.84},{"x":200.414,"y":286.866,"l":"N"},{"x":219.828,"y":256.976},{"x":170.854,"y":273.704},{"x":180.854,"y":291.024},{"x":237.148,"y":266.976,"l":"O"},{"x":219.828,"y":236.976,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":0,"e":3},{"b":2,"e":5},{"b":4,"e":1},{"b":5,"e":4},{"b":3,"e":6},{"b":3,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Proline <i>chain</i>',
		data: {"a":[{"x":14.9378,"y":29.9651},{"x":14.9378,"y":9.9874},{"x":-4.0875,"y":36.1665},{"x":-4.0875,"y":3.786},{"x":-15.8902,"y":19.9597,"l":"N"},{"x":-4.0875,"y":-16.1888},{"x":15.8902,"y":-16.1888,"l":"O"},{"x":-4.0875,"y":-36.1665,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":4},{"b":4,"e":2},{"b":0,"e":2},{"b":3,"e":5},{"b":5,"e":6},{"b":5,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Proline <i>side chain</i>',
		data: {"a":[{"x":15.4059,"y":9.9836},{"x":15.4059,"y":-9.9836},{"x":-3.6094,"y":16.1817},{"x":-3.6094,"y":-16.1817},{"x":-15.4059,"y":-0.0165}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":4,"e":2},{"b":0,"e":2}]}
	});
	group.templates.push({
		name: 'Serine <b>Ser</b> <i>S</i>',
		data: {"a":[{"x":204.002,"y":269},{"x":221.322,"y":259},{"x":186.678,"y":259},{"x":204.002,"y":289,"l":"N"},{"x":238.642,"y":269,"l":"O"},{"x":221.322,"y":239,"l":"O"},{"x":169.358,"y":269,"l":"O"}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":0,"e":3},{"b":2,"e":6},{"b":1,"e":4},{"b":1,"e":5,"o":2}]}
	});
	group.templates.push({
		name: 'Serine <i>chain</i>',
		data: {"a":[{"x":-30,"y":-9.9991,"l":"N"},{"x":-9.9991,"y":-9.9991},{"x":9.9991,"y":-9.9991},{"x":-9.9991,"y":10.0019},{"x":30,"y":-9.9991,"l":"O"},{"x":9.9991,"y":-29.9999,"l":"O"},{"x":-9.9991,"y":30,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":2,"e":5,"o":2},{"b":3,"e":6}]}
	});
	group.templates.push({
		name: 'Serine <i>side chain</i>',
		data: {"a":[{"x":-19.9986,"y":0},{"x":0.0014,"y":0},{"x":19.9986,"y":0,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Threonine <b>Thr</b> <i>T</i>',
		data: {"a":[{"x":204.002,"y":269},{"x":221.322,"y":259},{"x":204.002,"y":289,"l":"N"},{"x":186.68,"y":259},{"x":221.322,"y":239,"l":"O"},{"x":238.642,"y":269,"l":"O"},{"x":186.68,"y":239,"l":"O"},{"x":169.358,"y":269}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":4,"o":2},{"b":1,"e":5},{"b":3,"e":7},{"b":3,"e":6}]}
	});
	group.templates.push({
		name: 'Threonine <i>chain</i>',
		data: {"a":[{"x":-30.0004,"y":-9.9993,"l":"N"},{"x":-9.9992,"y":-9.9993},{"x":-9.9992,"y":10.002},{"x":9.9992,"y":-9.9993},{"x":-9.9992,"y":30.0004},{"x":9.9992,"y":10.002,"l":"O"},{"x":30.0004,"y":-9.9992,"l":"O"},{"x":9.9992,"y":-30.0004,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":6},{"b":3,"e":7,"o":2},{"b":2,"e":5},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Threonine <i>side chain</i>',
		data: {"a":[{"x":-17.0711,"y":0.999},{"x":2.9289,"y":0.999},{"x":8.1053,"y":-18.3195,"l":"H"},{"x":12.9289,"y":18.3195},{"x":17.0711,"y":-13.1431,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":3},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Tryptophan <b>Trp</b> <i>W</i>',
		data: {"a":[{"x":232.89,"y":267.526},{"x":232.89,"y":287.526,"l":"N"},{"x":250.21,"y":257.526},{"x":215.57,"y":257.526},{"x":267.532,"y":267.526,"l":"O"},{"x":250.21,"y":237.526,"l":"O"},{"x":198.248,"y":267.526},{"x":196.158,"y":287.418},{"x":179.98,"y":259.392},{"x":176.596,"y":291.576,"l":"N"},{"x":173.23,"y":240.256},{"x":166.596,"y":274.254},{"x":153.6,"y":236.424},{"x":146.968,"y":270.424},{"x":140.468,"y":251.51}],"b":[{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":1},{"b":2,"e":4},{"b":2,"e":5,"o":2},{"b":3,"e":6},{"b":6,"e":7,"o":2},{"b":6,"e":8},{"b":7,"e":9},{"b":11,"e":8,"o":2},{"b":10,"e":8},{"b":9,"e":11},{"b":11,"e":13},{"b":12,"e":10,"o":2},{"b":13,"e":14,"o":2},{"b":14,"e":12}]}
	});
	group.templates.push({
		name: 'Tryptophan <i>chain</i>',
		data: {"a":[{"x":-34.5594,"y":-32.7962,"l":"N"},{"x":-14.5632,"y":-32.7962},{"x":-14.5632,"y":-12.8},{"x":5.4302,"y":-32.7962},{"x":-14.5632,"y":7.1934},{"x":25.4264,"y":-32.7962,"l":"O"},{"x":5.4302,"y":-52.7924,"l":"O"},{"x":-30.7519,"y":18.8666},{"x":1.5511,"y":18.8666},{"x":-24.6495,"y":37.8737,"l":"N"},{"x":-4.6891,"y":37.8737},{"x":21.1946,"y":14.7065},{"x":8.6757,"y":52.7924},{"x":34.5594,"y":29.6581},{"x":28.2834,"y":48.7011}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":5},{"b":3,"e":6,"o":2},{"b":2,"e":4},{"b":4,"e":7,"o":2},{"b":7,"e":9},{"b":9,"e":10},{"b":10,"e":8,"o":2},{"b":4,"e":8},{"b":10,"e":12},{"b":12,"e":14,"o":2},{"b":14,"e":13},{"b":13,"e":11,"o":2},{"b":8,"e":11}]}
	});
	group.templates.push({
		name: 'Tryptophan <i>side chain</i>',
		data: {"a":[{"x":-42.876,"y":16.3756},{"x":-22.8416,"y":16.3756},{"x":-2.81,"y":16.3756},{"x":9.0262,"y":0.2305},{"x":9.0262,"y":32.5593},{"x":4.9631,"y":-19.0972},{"x":28.0696,"y":6.3418},{"x":28.0696,"y":26.3403,"l":"N"},{"x":19.6976,"y":-32.5593},{"x":42.876,"y":-7.0485},{"x":38.6693,"y":-26.517}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":4,"o":2},{"b":4,"e":7},{"b":7,"e":6},{"b":6,"e":3,"o":2},{"b":2,"e":3},{"b":6,"e":9},{"b":9,"e":10,"o":2},{"b":10,"e":8},{"b":8,"e":5,"o":2},{"b":3,"e":5}]}
	});
	group.templates.push({
		name: 'Tyrosine <b>Tyr</b> <i>Y</i>',
		data: {"a":[{"x":247.3,"y":254},{"x":247.3,"y":234,"l":"O"},{"x":229.98,"y":264},{"x":264.622,"y":264,"l":"O"},{"x":212.66,"y":254},{"x":229.98,"y":284,"l":"N"},{"x":195.34,"y":264},{"x":195.34,"y":284},{"x":178.018,"y":254},{"x":178.018,"y":294},{"x":160.698,"y":264},{"x":160.698,"y":284},{"x":143.378,"y":294,"l":"O"}],"b":[{"b":0,"e":1,"o":2},{"b":0,"e":3},{"b":0,"e":2},{"b":2,"e":4},{"b":2,"e":5},{"b":4,"e":6},{"b":6,"e":7,"o":2},{"b":6,"e":8},{"b":7,"e":9},{"b":10,"e":8,"o":2},{"b":9,"e":11,"o":2},{"b":11,"e":10},{"b":11,"e":12}]}
	});
	group.templates.push({
		name: 'Tyrosine <i>chain</i>',
		data: {"a":[{"x":-29.9912,"y":-40.0397,"l":"N"},{"x":-9.9962,"y":-40.0397},{"x":9.9961,"y":-40.0397},{"x":-9.9962,"y":-20.0447},{"x":29.9911,"y":-40.0397,"l":"O"},{"x":9.9961,"y":-60.0347,"l":"O"},{"x":-9.9962,"y":-0.0524},{"x":7.2826,"y":9.9976},{"x":-27.3107,"y":9.9976},{"x":7.2826,"y":30.0284},{"x":-27.3107,"y":30.0285},{"x":-9.9962,"y":40.0424},{"x":-9.9962,"y":60.0347,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":2,"e":5,"o":2},{"b":3,"e":6},{"b":6,"e":8,"o":2},{"b":8,"e":10},{"b":10,"e":11,"o":2},{"b":11,"e":9},{"b":9,"e":7,"o":2},{"b":6,"e":7},{"b":11,"e":12}]}
	});
	group.templates.push({
		name: 'Tyrosine <i>side chain</i>',
		data: {"a":[{"x":-50.0496,"y":-0.0179},{"x":-30.0496,"y":-0.0179},{"x":-10.0524,"y":-0.0179},{"x":0,"y":17.3009},{"x":0,"y":-17.3009},{"x":20.0358,"y":17.3009},{"x":20.0358,"y":-17.3009},{"x":30.0524,"y":-0.0179},{"x":50.0496,"y":-0.0179,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3,"o":2},{"b":3,"e":5},{"b":5,"e":7,"o":2},{"b":7,"e":6},{"b":6,"e":4,"o":2},{"b":2,"e":4},{"b":7,"e":8}]}
	});
	group.templates.push({
		name: 'Valine <b>Val</b> <i>V</i>',
		data: {"a":[{"x":204,"y":269},{"x":204,"y":289,"l":"N"},{"x":186.678,"y":259},{"x":221.322,"y":259},{"x":186.678,"y":239},{"x":169.36,"y":269},{"x":238.64,"y":269,"l":"O"},{"x":221.322,"y":239,"l":"O"}],"b":[{"b":0,"e":3},{"b":0,"e":2},{"b":0,"e":1},{"b":3,"e":6},{"b":3,"e":7,"o":2},{"b":2,"e":5},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Valine <i>chain</i>',
		data: {"a":[{"x":-30.0004,"y":-9.9992,"l":"N"},{"x":-9.9992,"y":-9.9992},{"x":-9.9992,"y":10.0019},{"x":9.9992,"y":-9.9992},{"x":9.9992,"y":10.0019},{"x":-9.9992,"y":30.0004},{"x":30.0004,"y":-9.9992,"l":"O"},{"x":9.9992,"y":-30.0005,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":3,"e":6},{"b":3,"e":7,"o":2},{"b":2,"e":4},{"b":2,"e":5}]}
	});
	group.templates.push({
		name: 'Valine <i>side chain</i>',
		data: {"a":[{"x":-20.0014,"y":10},{"x":0.0014,"y":10},{"x":20.0014,"y":10},{"x":0.0014,"y":-10}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2}]}
	});
	d.push(group);

	group = {name:'Cyclic Terpenes', templates:[]};
	group.templates.push({
		name: 'Bornane',
		data: {"a":[{"x":-1.0324,"y":-18.324},{"x":9.6351,"y":-4.5595},{"x":-16.3453,"y":-28.3032},{"x":-5.3337,"y":12.4741},{"x":14.1611,"y":-27.0959},{"x":-10.8395,"y":1.8066},{"x":25.2923,"y":1.8066},{"x":-14.2806,"y":28.3032},{"x":-25.2923,"y":15.9152},{"x":14.7968,"y":16.6035}],"b":[{"b":0,"e":4},{"b":0,"e":2},{"b":0,"e":1},{"b":1,"e":6},{"b":6,"e":9},{"b":9,"e":3},{"b":3,"e":7},{"b":8,"e":3},{"b":8,"e":5},{"b":5,"e":1},{"b":0,"e":3}]}
	});
	group.templates.push({
		name: 'Carane',
		data: {"a":[{"x":-19.9985,"y":-39.643},{"x":-9.9992,"y":-22.3243},{"x":-19.9985,"y":-5.0056},{"x":9.9992,"y":-22.3242},{"x":-9.9992,"y":12.3151},{"x":19.9985,"y":-5.0056},{"x":0,"y":29.6437},{"x":9.9992,"y":12.3151},{"x":-17.3187,"y":39.643},{"x":17.3187,"y":39.643}],"b":[{"b":4,"e":6},{"b":7,"e":6},{"b":6,"e":9},{"b":6,"e":8},{"b":4,"e":7},{"b":4,"e":2},{"b":7,"e":5},{"b":2,"e":1},{"b":5,"e":3},{"b":1,"e":3},{"b":1,"e":0}]}
	});
	group.templates.push({
		name: 'Menthane',
		data: {"a":[{"x":-17.3202,"y":-5.0001},{"x":-17.3203,"y":15.0002},{"x":0,"y":-15.0002},{"x":0,"y":25.0003},{"x":17.3203,"y":-5.0001},{"x":0,"y":-35.0005},{"x":17.3202,"y":15.0002},{"x":0,"y":45.0006},{"x":-17.3203,"y":-45.0006},{"x":17.3202,"y":-45.0006}],"b":[{"b":2,"e":0},{"b":2,"e":4},{"b":2,"e":5},{"b":0,"e":1},{"b":4,"e":6},{"b":3,"e":6},{"b":3,"e":1},{"b":3,"e":7},{"b":5,"e":9},{"b":5,"e":8}]}
	});
	group.templates.push({
		name: 'Norbornane 1',
		data: {"a":[{"x":-0.995,"y":-16.8329},{"x":-5.1411,"y":12.8527},{"x":9.2871,"y":-3.5656},{"x":-24.3787,"y":16.1695},{"x":14.2624,"y":16.8329},{"x":-10.448,"y":2.5705},{"x":24.3787,"y":2.5705}],"b":[{"b":0,"e":2},{"b":2,"e":6},{"b":6,"e":4},{"b":4,"e":1},{"b":3,"e":1},{"b":3,"e":5},{"b":5,"e":2},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Norbornane 2',
		data: {"a":[{"x":0,"y":-19.7533},{"x":-6.3211,"y":0},{"x":17.1069,"y":-9.8766},{"x":-17.1069,"y":-9.8766},{"x":0,"y":19.7533},{"x":17.1069,"y":9.8767},{"x":-17.1069,"y":9.8767}],"b":[{"b":0,"e":3},{"b":3,"e":6},{"b":6,"e":4},{"b":4,"e":5},{"b":5,"e":2},{"b":2,"e":0},{"b":4,"e":1},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Norcarane',
		data: {"a":[{"x":9.9989,"y":-25.983},{"x":19.9977,"y":-8.665},{"x":-9.9989,"y":-25.983},{"x":9.9989,"y":8.653},{"x":-19.9977,"y":-8.665},{"x":0,"y":25.9831},{"x":-9.9989,"y":8.653}],"b":[{"b":3,"e":6},{"b":3,"e":5},{"b":3,"e":1},{"b":6,"e":5},{"b":6,"e":4},{"b":1,"e":0},{"b":4,"e":2},{"b":0,"e":2}]}
	});
	group.templates.push({
		name: 'Norpinane',
		data: {"a":[{"x":-9.0329,"y":-16.7698},{"x":-14.1777,"y":-0.5106},{"x":-5.027,"y":9.1507},{"x":3.6889,"y":3.8049},{"x":-24.1925,"y":16.7698},{"x":15.081,"y":13.8636},{"x":24.1925,"y":0.3535}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":6},{"b":6,"e":5},{"b":5,"e":2},{"b":4,"e":2},{"b":4,"e":1},{"b":0,"e":2}]}
	});
	group.templates.push({
		name: 'Pinane',
		data: {"a":[{"x":-9.3626,"y":-10.136},{"x":-24.0985,"y":-22.6738},{"x":3.2566,"y":-24.6277},{"x":-5.2105,"y":16.7306},{"x":-14.6952,"y":6.7166},{"x":15.6315,"y":21.6154},{"x":-25.0755,"y":24.6277},{"x":5.5362,"y":2.646},{"x":25.0755,"y":7.6122},{"x":13.3519,"y":-10.6245}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":0,"e":4},{"b":4,"e":7},{"b":7,"e":9},{"b":7,"e":8},{"b":8,"e":5},{"b":5,"e":3},{"b":6,"e":3},{"b":6,"e":4},{"b":0,"e":3}]}
	});
	group.templates.push({
		name: 'Thujane',
		data: {"a":[{"x":-24.0519,"y":2.3998},{"x":-12.2969,"y":-13.7808},{"x":-12.2969,"y":18.5784},{"x":6.7214,"y":-7.5993},{"x":6.7214,"y":12.399},{"x":-18.4764,"y":37.5967},{"x":6.7214,"y":-27.5976},{"x":24.0519,"y":2.3998},{"x":24.0419,"y":-37.5967},{"x":-10.5971,"y":-37.5967}],"b":[{"b":3,"e":4},{"b":3,"e":7},{"b":3,"e":1},{"b":3,"e":6},{"b":4,"e":7},{"b":4,"e":2},{"b":2,"e":0},{"b":2,"e":5},{"b":1,"e":0},{"b":6,"e":8},{"b":6,"e":9}]}
	});
	d.push(group);

	group = {name:'Cycloalkanes', templates:[]};
	group.templates.push({
		name: '<a></a><b>9</b> Nonane <i>packed</i>',
		data: {"a":[{"x":236.708,"y":264},{"x":224.954,"y":247.82},{"x":224.954,"y":280.178},{"x":205.932,"y":254},{"x":205.932,"y":273.998},{"x":188.612,"y":244},{"x":188.612,"y":284},{"x":171.29,"y":254},{"x":171.29,"y":273.998}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":7}]}
	});
	group.templates.push({
		name: '<a></a><b>9</b> Nonane <i>unpacked</i>',
		data: {"a":[{"x":175.644,"y":274},{"x":175.644,"y":254},{"x":188.5,"y":289.32},{"x":188.5,"y":238.68},{"x":208.196,"y":292.794},{"x":208.196,"y":235.206},{"x":225.516,"y":282.794},{"x":225.516,"y":245.206},{"x":232.356,"y":264}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":7}]}
	});
	group.templates.push({
		name: '<b>10</b> Decane <i>packed</i>',
		data: {"a":[{"x":186.678,"y":244},{"x":169.36,"y":254},{"x":204,"y":254},{"x":169.36,"y":274},{"x":221.32,"y":244},{"x":186.678,"y":284},{"x":238.642,"y":254},{"x":204,"y":274},{"x":238.642,"y":274},{"x":221.32,"y":284}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":5,"e":3},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":9},{"b":9,"e":7}]}
	});
	group.templates.push({
		name: '<b>10</b> Decane <i>unpacked</i>',
		data: {"a":[{"x":173.224,"y":274},{"x":184.978,"y":290.18},{"x":173.224,"y":254},{"x":204,"y":296.36},{"x":184.978,"y":237.82},{"x":223.022,"y":290.18},{"x":204,"y":231.64},{"x":234.776,"y":274},{"x":223.022,"y":237.82},{"x":234.776,"y":254}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":9,"e":8}]}
	});
	group.templates.push({
		name: '<b>11</b> Undecane <i>packed</i>',
		data: {"a":[{"x":169.358,"y":243.61},{"x":169.358,"y":263.612},{"x":186.678,"y":233.612},{"x":186.678,"y":273.61},{"x":204,"y":243.61},{"x":193.998,"y":294.388},{"x":221.318,"y":233.612},{"x":213.998,"y":294.388},{"x":238.64,"y":243.61},{"x":221.318,"y":273.61},{"x":238.64,"y":263.612}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":5,"e":3},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":9}]}
	});
	group.templates.push({
		name: '<b>11</b> Undecane <i>unpacked</i>',
		data: {"a":[{"x":169.224,"y":274},{"x":180.038,"y":290.826},{"x":169.224,"y":254},{"x":198.23,"y":299.134},{"x":180.038,"y":237.174},{"x":218.026,"y":296.288},{"x":198.23,"y":228.866},{"x":233.142,"y":283.19},{"x":218.026,"y":231.712},{"x":238.776,"y":264},{"x":233.142,"y":244.81}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":10}]}
	});
	group.templates.push({
		name: '<b>12</b> Dodecane <i>packed</i>',
		data: {"a":[{"x":204,"y":229},{"x":186.678,"y":239},{"x":221.32,"y":239},{"x":186.678,"y":259},{"x":221.32,"y":259},{"x":169.358,"y":269},{"x":238.64,"y":269},{"x":169.358,"y":289},{"x":238.64,"y":289},{"x":186.678,"y":299},{"x":221.32,"y":299},{"x":204,"y":289}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":11},{"b":11,"e":9}]}
	});
	group.templates.push({
		name: '<b>12</b> Dodecane <i>unpacked</i>',
		data: {"a":[{"x":166.68,"y":274},{"x":176.68,"y":291.32},{"x":166.68,"y":254},{"x":194,"y":301.32},{"x":176.68,"y":236.68},{"x":214,"y":301.32},{"x":194,"y":226.68},{"x":231.32,"y":291.32},{"x":214,"y":226.68},{"x":241.32,"y":274},{"x":231.32,"y":236.68},{"x":241.32,"y":254}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":11,"e":10}]}
	});
	group.templates.push({
		name: '<b>13</b> Tridecane <i>packed</i>',
		data: {"a":[{"x":204,"y":218.612},{"x":221.322,"y":228.614},{"x":186.68,"y":228.614},{"x":221.322,"y":248.612},{"x":186.68,"y":248.612},{"x":238.64,"y":258.614},{"x":169.358,"y":258.614},{"x":238.64,"y":278.612},{"x":169.358,"y":278.612},{"x":221.322,"y":288.614},{"x":186.68,"y":288.614},{"x":214.002,"y":309.388},{"x":194,"y":309.388}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":12}]}
	});
	group.templates.push({
		name: '<b>13</b> Tridecane <i>unpacked</i>',
		data: {"a":[{"x":162.822,"y":274},{"x":172.116,"y":291.71},{"x":162.822,"y":254},{"x":188.576,"y":303.07},{"x":172.116,"y":236.29},{"x":208.43,"y":305.482},{"x":188.576,"y":224.93},{"x":227.13,"y":298.39},{"x":208.43,"y":222.518},{"x":240.392,"y":283.418},{"x":227.13,"y":229.61},{"x":245.178,"y":264},{"x":240.392,"y":244.582}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":12}]}
	});
	group.templates.push({
		name: '<b>14</b> Tetradecane <i>packed</i>',
		data: {"a":[{"x":204,"y":214},{"x":186.68,"y":224},{"x":221.32,"y":224},{"x":186.68,"y":244},{"x":221.32,"y":244},{"x":169.358,"y":254},{"x":238.642,"y":254},{"x":169.358,"y":274},{"x":238.642,"y":274},{"x":186.68,"y":284},{"x":221.32,"y":284},{"x":186.68,"y":304},{"x":221.32,"y":304},{"x":204,"y":314}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":5,"e":3},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":13},{"b":13,"e":11}]}
	});
	group.templates.push({
		name: '<b>14</b> Tetradecane <i>unpacked</i>',
		data: {"a":[{"x":160.188,"y":274},{"x":168.864,"y":292.02},{"x":160.188,"y":254},{"x":184.502,"y":304.49},{"x":168.864,"y":235.98},{"x":204,"y":308.94},{"x":184.502,"y":223.51},{"x":223.498,"y":304.49},{"x":204,"y":219.06},{"x":239.136,"y":292.02},{"x":223.498,"y":223.51},{"x":247.812,"y":274},{"x":239.136,"y":235.98},{"x":247.812,"y":254}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":13},{"b":13,"e":12}]}
	});
	group.templates.push({
		name: '<b>15</b> Pendecane <i>packed</i>',
		data: {"a":[{"x":184,"y":251.23},{"x":164,"y":251.23},{"x":186.226,"y":233.358},{"x":154,"y":268.548},{"x":204.306,"y":224.808},{"x":164,"y":285.87},{"x":222.264,"y":233.61},{"x":184,"y":285.87},{"x":224,"y":251.23},{"x":194,"y":303.192},{"x":244,"y":251.23},{"x":214,"y":303.192},{"x":254,"y":268.548},{"x":224,"y":285.87},{"x":244,"y":285.87}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":3,"e":1},{"b":2,"e":4},{"b":5,"e":3},{"b":4,"e":6},{"b":7,"e":5},{"b":6,"e":8},{"b":9,"e":7},{"b":8,"e":10},{"b":11,"e":9},{"b":10,"e":12},{"b":13,"e":11},{"b":12,"e":14},{"b":14,"e":13}]}
	});
	group.templates.push({
		name: '<b>15</b> Pendecane <i>unpacked</i>',
		data: {"a":[{"x":156.428,"y":274},{"x":164.562,"y":292.27},{"x":156.428,"y":254},{"x":179.426,"y":305.654},{"x":164.562,"y":235.728},{"x":198.446,"y":311.834},{"x":179.426,"y":222.346},{"x":218.338,"y":309.744},{"x":198.446,"y":216.166},{"x":235.658,"y":299.744},{"x":218.338,"y":218.256},{"x":247.414,"y":283.562},{"x":235.658,"y":228.256},{"x":251.572,"y":264},{"x":247.414,"y":244.438}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":3,"e":1},{"b":2,"e":4},{"b":5,"e":3},{"b":4,"e":6},{"b":7,"e":5},{"b":6,"e":8},{"b":9,"e":7},{"b":8,"e":10},{"b":11,"e":9},{"b":10,"e":12},{"b":13,"e":11},{"b":12,"e":14},{"b":14,"e":13}]}
	});
	group.templates.push({
		name: '<b>16</b> Hexadecane <i>packed</i>',
		data: {"a":[{"x":186.68,"y":229},{"x":204.002,"y":239},{"x":169.36,"y":239},{"x":221.32,"y":229},{"x":169.36,"y":259},{"x":238.642,"y":239},{"x":152.038,"y":269},{"x":238.642,"y":259},{"x":152.038,"y":289},{"x":255.962,"y":269},{"x":169.36,"y":299},{"x":255.962,"y":289},{"x":186.68,"y":289},{"x":238.642,"y":299},{"x":204.002,"y":299},{"x":221.32,"y":289}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":13},{"b":14,"e":12},{"b":15,"e":13},{"b":15,"e":14}]}
	});
	group.templates.push({
		name: '<b>16</b> Hexadecane <i>unpacked</i>',
		data: {"a":[{"x":153.726,"y":274},{"x":161.38,"y":292.478},{"x":153.726,"y":254},{"x":175.522,"y":306.62},{"x":161.38,"y":235.522},{"x":194,"y":314.274},{"x":175.522,"y":221.38},{"x":214,"y":314.274},{"x":194,"y":213.726},{"x":232.478,"y":306.62},{"x":214,"y":213.726},{"x":246.62,"y":292.478},{"x":232.478,"y":221.38},{"x":254.274,"y":274},{"x":246.62,"y":235.522},{"x":254.274,"y":254}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":13},{"b":14,"e":12},{"b":15,"e":13},{"b":15,"e":14}]}
	});
	group.templates.push({
		name: '<b>17</b> Heptadecane <i>packed</i>',
		data: {"a":[{"x":152.038,"y":228.614},{"x":152.038,"y":248.612},{"x":169.358,"y":218.612},{"x":169.358,"y":258.614},{"x":186.68,"y":228.614},{"x":169.358,"y":278.612},{"x":203.998,"y":218.612},{"x":186.68,"y":288.614},{"x":221.32,"y":228.614},{"x":194,"y":309.388},{"x":238.64,"y":218.612},{"x":214,"y":309.388},{"x":255.962,"y":228.614},{"x":221.32,"y":288.614},{"x":255.962,"y":248.612},{"x":238.64,"y":278.612},{"x":238.64,"y":258.614}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":5,"e":3},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":15}]}
	});
	group.templates.push({
		name: '<b>17</b> Heptadecane <i>unpacked</i>',
		data: {"a":[{"x":150.042,"y":274},{"x":150.042,"y":254},{"x":157.266,"y":292.65},{"x":157.266,"y":235.35},{"x":170.74,"y":307.43},{"x":170.74,"y":220.57},{"x":188.644,"y":316.344},{"x":188.644,"y":211.656},{"x":208.558,"y":318.19},{"x":208.558,"y":209.81},{"x":227.794,"y":312.716},{"x":227.794,"y":215.284},{"x":243.754,"y":300.664},{"x":243.754,"y":227.336},{"x":254.284,"y":283.66},{"x":254.284,"y":244.34},{"x":257.958,"y":264}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":5,"e":3},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":15}]}
	});
	group.templates.push({
		name: '<b>18</b> Octodecane <i>packed</i>',
		data: {"a":[{"x":186.68,"y":214},{"x":169.36,"y":224},{"x":204.002,"y":224},{"x":169.36,"y":244},{"x":221.32,"y":214},{"x":152.038,"y":254},{"x":238.642,"y":224},{"x":152.038,"y":274},{"x":238.642,"y":244},{"x":169.36,"y":284},{"x":255.962,"y":254},{"x":169.36,"y":304},{"x":255.962,"y":274},{"x":186.68,"y":314},{"x":238.642,"y":284},{"x":204.002,"y":304},{"x":238.642,"y":304},{"x":221.32,"y":314}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":17},{"b":17,"e":15}]}
	});
	group.templates.push({
		name: '<b>18</b> Octodecane <i>unpacked</i>',
		data: {"a":[{"x":147.288,"y":274},{"x":147.288,"y":254},{"x":154.128,"y":292.794},{"x":154.128,"y":235.206},{"x":166.984,"y":308.114},{"x":166.984,"y":219.886},{"x":184.304,"y":318.114},{"x":184.304,"y":209.886},{"x":204,"y":321.588},{"x":204,"y":206.412},{"x":223.696,"y":318.114},{"x":223.696,"y":209.886},{"x":241.016,"y":308.114},{"x":241.016,"y":219.886},{"x":253.872,"y":292.794},{"x":253.872,"y":235.206},{"x":260.712,"y":274},{"x":260.712,"y":254}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":17},{"b":17,"e":15}]}
	});
	group.templates.push({
		name: '<b>19</b> Enneadecane <i>packed</i>',
		data: {"a":[{"x":186.68,"y":203.612},{"x":169.36,"y":213.61},{"x":203.998,"y":213.61},{"x":169.36,"y":233.612},{"x":221.32,"y":203.612},{"x":152.038,"y":243.61},{"x":238.642,"y":213.61},{"x":152.038,"y":263.612},{"x":238.642,"y":233.612},{"x":169.36,"y":273.61},{"x":255.962,"y":243.61},{"x":169.36,"y":293.612},{"x":255.962,"y":263.612},{"x":186.68,"y":303.61},{"x":238.642,"y":273.61},{"x":194,"y":324.388},{"x":238.64,"y":293.612},{"x":214,"y":324.388},{"x":221.32,"y":303.61}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":11,"e":9},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":18},{"b":17,"e":15},{"b":18,"e":17}]}
	});
	group.templates.push({
		name: '<b>19</b> Enneadecane <i>unpacked</i>',
		data: {"a":[{"x":143.658,"y":274},{"x":150.152,"y":292.916},{"x":143.658,"y":254},{"x":162.438,"y":308.7},{"x":150.154,"y":235.084},{"x":179.18,"y":319.638},{"x":162.438,"y":219.3},{"x":198.568,"y":324.548},{"x":179.18,"y":208.362},{"x":218.5,"y":322.896},{"x":198.568,"y":203.452},{"x":236.816,"y":314.862},{"x":218.5,"y":205.104},{"x":251.53,"y":301.316},{"x":236.816,"y":213.138},{"x":261.05,"y":283.728},{"x":251.53,"y":226.684},{"x":264.342,"y":264},{"x":261.05,"y":244.272}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":12,"e":10},{"b":11,"e":13},{"b":14,"e":12},{"b":13,"e":15},{"b":16,"e":14},{"b":15,"e":17},{"b":18,"e":16},{"b":17,"e":18}]}
	});
	group.templates.push({
		name: '<b>20</b> Icosane <i>packed</i>',
		data: {"a":[{"x":139.36,"y":264},{"x":149.358,"y":281.318},{"x":149.358,"y":246.682},{"x":169.36,"y":281.318},{"x":169.36,"y":246.682},{"x":169.36,"y":301.32},{"x":169.36,"y":226.68},{"x":186.678,"y":311.318},{"x":186.678,"y":216.682},{"x":204,"y":301.32},{"x":204,"y":226.68},{"x":221.322,"y":311.318},{"x":221.322,"y":216.682},{"x":238.642,"y":301.32},{"x":238.642,"y":226.68},{"x":238.642,"y":281.318},{"x":238.642,"y":246.682},{"x":258.642,"y":281.318},{"x":258.642,"y":246.682},{"x":268.64,"y":264}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":6},{"b":3,"e":5},{"b":6,"e":8},{"b":7,"e":5},{"b":8,"e":10},{"b":9,"e":7},{"b":10,"e":12},{"b":9,"e":11},{"b":12,"e":14},{"b":13,"e":11},{"b":14,"e":16},{"b":15,"e":13},{"b":16,"e":18},{"b":17,"e":15},{"b":18,"e":19},{"b":19,"e":17}]}
	});
	group.templates.push({
		name: '<b>20</b> Icosane <i>unpacked</i>',
		data: {"a":[{"x":140.862,"y":274},{"x":147.042,"y":293.02},{"x":140.862,"y":254},{"x":158.798,"y":309.202},{"x":147.042,"y":234.98},{"x":174.978,"y":320.958},{"x":158.798,"y":218.798},{"x":194,"y":327.138},{"x":174.978,"y":207.042},{"x":214,"y":327.138},{"x":194,"y":200.862},{"x":233.022,"y":320.958},{"x":214,"y":200.862},{"x":249.202,"y":309.202},{"x":233.02,"y":207.042},{"x":260.958,"y":293.02},{"x":249.202,"y":218.798},{"x":267.138,"y":274},{"x":260.958,"y":234.978},{"x":267.138,"y":254}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":4,"e":6},{"b":5,"e":7},{"b":8,"e":6},{"b":7,"e":9},{"b":10,"e":8},{"b":9,"e":11},{"b":10,"e":12},{"b":11,"e":13},{"b":14,"e":12},{"b":13,"e":15},{"b":16,"e":14},{"b":15,"e":17},{"b":18,"e":16},{"b":17,"e":19},{"b":19,"e":18}]}
	});
	d.push(group);

	group = {name:'Functional Groups', templates:[]};
	group.templates.push({
		name: 'Alkenyl',
		data: {"a":[{"x":194.002,"y":263.998},{"x":214,"y":263.998},{"x":184,"y":246.68},{"x":184,"y":281.32},{"x":224.002,"y":281.32},{"x":224.002,"y":246.68}],"b":[{"b":0,"e":1,"o":2},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":5},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Alkynyl',
		data: {"a":[{"x":193.998,"y":264},{"x":174,"y":264},{"x":213.998,"y":264},{"x":234,"y":264}],"b":[{"b":0,"e":2,"o":3},{"b":0,"e":1},{"b":2,"e":3}]}
	});
	group.templates.push({
		name: 'Amine',
		data: {"a":[{"x":204.002,"y":259.002,"l":"N"},{"x":221.32,"y":249},{"x":204.002,"y":279},{"x":186.68,"y":249}],"b":[{"b":0,"e":1},{"b":0,"e":3},{"b":0,"e":2}]}
	});
	group.templates.push({
		name: 'Ammonium',
		data: {"a":[{"c":1,"x":203.998,"y":265.342,"l":"N"},{"x":186.68,"y":275.34},{"x":203.998,"y":245.34},{"x":194,"y":282.66},{"x":221.32,"y":275.34}],"b":[{"b":0,"e":2},{"b":0,"e":4},{"b":0,"e":1},{"b":0,"e":3}]}
	});
	group.templates.push({
		name: 'Azide',
		data: {"a":[{"x":178.02,"y":263.998},{"x":195.34,"y":254,"l":"N"},{"c":1,"x":212.662,"y":263.998,"l":"N"},{"c":-1,"x":229.98,"y":274,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":3,"o":2}]}
	});
	group.templates.push({
		name: 'Azo',
		data: {"a":[{"x":184,"y":246.68},{"x":194,"y":264.002,"l":"N"},{"x":214,"y":264.002,"l":"N"},{"x":224,"y":281.32}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":3}]}
	});
	group.templates.push({
		name: 'Benzyl',
		data: {"a":[{"x":169.36,"y":254},{"x":186.678,"y":244},{"x":204,"y":254},{"x":204,"y":274},{"x":221.32,"y":244},{"x":221.32,"y":284},{"x":238.64,"y":254},{"x":238.64,"y":274}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":4,"o":2},{"b":2,"e":3},{"b":4,"e":6},{"b":5,"e":3,"o":2},{"b":6,"e":7,"o":2},{"b":7,"e":5}]}
	});
	group.templates.push({
		name: 'Carbonate Ester',
		data: {"a":[{"x":186.678,"y":279,"l":"O"},{"x":169.36,"y":269.002},{"x":204,"y":269.002},{"x":221.32,"y":279,"l":"O"},{"x":204,"y":249,"l":"O"},{"x":238.642,"y":269.002}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":4,"o":2},{"b":2,"e":3},{"b":3,"e":5}]}
	});
	group.templates.push({
		name: 'Carbonyl',
		data: {"a":[{"x":186.68,"y":279},{"x":204.002,"y":268.998},{"x":204.002,"y":249,"l":"O"},{"x":221.32,"y":279}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":1,"e":3}]}
	});
	group.templates.push({
		name: 'Carboxamide',
		data: {"a":[{"x":178.02,"y":269},{"x":195.34,"y":259},{"x":195.34,"y":239,"l":"O"},{"x":212.662,"y":269,"l":"N"},{"x":212.662,"y":289},{"x":229.98,"y":259}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":1,"e":3},{"b":3,"e":5},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: 'Cyanate',
		data: {"a":[{"x":178.02,"y":263.998},{"x":195.338,"y":254,"l":"O"},{"x":212.66,"y":263.998},{"x":229.98,"y":274,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3,"o":3}]}
	});
	group.templates.push({
		name: 'Disulfide',
		data: {"a":[{"x":184,"y":246.68},{"x":194,"y":263.998,"l":"S"},{"x":214,"y":263.998,"l":"S"},{"x":224,"y":281.32}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3}]}
	});
	group.templates.push({
		name: 'Ester',
		data: {"a":[{"x":178.02,"y":279},{"x":195.34,"y":269.002},{"x":212.66,"y":279,"l":"O"},{"x":195.34,"y":249,"l":"O"},{"x":229.98,"y":269.002}],"b":[{"b":0,"e":1},{"b":1,"e":3,"o":2},{"b":1,"e":2},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Ether',
		data: {"a":[{"x":186.68,"y":269},{"x":204.002,"y":259,"l":"O"},{"x":221.32,"y":269}],"b":[{"b":0,"e":1},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Imide',
		data: {"a":[{"x":169.36,"y":269.002},{"x":186.678,"y":258.998},{"x":186.678,"y":239.002,"l":"O"},{"x":204,"y":269.002,"l":"N"},{"x":204,"y":288.998},{"x":221.32,"y":258.998},{"x":238.64,"y":269.002},{"x":221.32,"y":239.002,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2,"o":2},{"b":3,"e":5},{"b":3,"e":4},{"b":5,"e":6},{"b":5,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Isocyanate',
		data: {"a":[{"x":178.02,"y":264.002},{"x":195.34,"y":254,"l":"N"},{"x":212.662,"y":264.002},{"x":229.98,"y":274,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":3,"o":2}]}
	});
	group.templates.push({
		name: 'Isocyanide',
		data: {"a":[{"x":184,"y":264},{"c":1,"x":204.002,"y":264,"l":"N"},{"c":-1,"x":224,"y":264}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":3}]}
	});
	group.templates.push({
		name: 'Isothiocyanate',
		data: {"a":[{"x":178.02,"y":264},{"x":195.34,"y":254,"l":"N"},{"x":212.662,"y":264},{"x":229.98,"y":274,"l":"S"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":3,"o":2}]}
	});
	group.templates.push({
		name: 'Ketimine',
		data: {"a":[{"x":204,"y":273.998},{"x":204,"y":254.002,"l":"N"},{"x":221.32,"y":284.002},{"x":186.68,"y":284.002},{"x":221.32,"y":243.998}],"b":[{"b":0,"e":1,"o":2},{"b":0,"e":3},{"b":0,"e":2},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Nitrate',
		data: {"a":[{"x":178.02,"y":269},{"x":195.338,"y":279,"l":"O"},{"c":1,"x":212.66,"y":269,"l":"N"},{"c":-1,"x":229.98,"y":279,"l":"O"},{"x":212.66,"y":249,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":2,"e":4,"o":2}]}
	});
	group.templates.push({
		name: 'Nitrile',
		data: {"a":[{"x":184,"y":264},{"x":204.002,"y":264},{"x":224,"y":264,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":3}]}
	});
	group.templates.push({
		name: 'Nitro',
		data: {"a":[{"x":189,"y":263.998},{"c":1,"x":209.002,"y":263.998,"l":"N"},{"c":-1,"x":219,"y":281.32,"l":"O"},{"x":219,"y":246.68,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3,"o":2},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Nitroso',
		data: {"a":[{"x":186.68,"y":269},{"x":203.998,"y":259,"l":"N"},{"x":221.32,"y":269,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2}]}
	});
	group.templates.push({
		name: 'Nitrosooxy',
		data: {"a":[{"x":178.018,"y":259},{"x":195.34,"y":269,"l":"O"},{"x":212.66,"y":259,"l":"N"},{"x":229.982,"y":269,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3,"o":2}]}
	});
	group.templates.push({
		name: 'Peroxy',
		data: {"a":[{"x":183.998,"y":246.68},{"x":194.002,"y":264.002,"l":"O"},{"x":213.998,"y":264.002,"l":"O"},{"x":224.002,"y":281.32}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3}]}
	});
	group.templates.push({
		name: 'Phosphate',
		data: {"a":[{"x":204,"y":265.342,"l":"P"},{"x":221.322,"y":275.34,"l":"O"},{"x":204,"y":245.34,"l":"O"},{"x":186.682,"y":275.34,"l":"O"},{"x":194.002,"y":282.66,"l":"O"},{"x":238.642,"y":265.342},{"x":169.36,"y":265.342},{"x":174,"y":282.66}],"b":[{"b":0,"e":2,"o":2},{"b":0,"e":1},{"b":0,"e":3},{"b":0,"e":4},{"b":1,"e":5},{"b":3,"e":6},{"b":4,"e":7}]}
	});
	group.templates.push({
		name: 'Phosphino',
		data: {"a":[{"x":204,"y":255.34,"l":"P"},{"x":194.002,"y":272.66},{"x":186.678,"y":265.34},{"x":221.322,"y":265.34}],"b":[{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Pyridyl',
		data: {"a":[{"x":178.018,"y":244},{"x":195.34,"y":254},{"x":212.66,"y":244},{"x":195.34,"y":274},{"x":229.982,"y":254},{"x":212.66,"y":284},{"x":229.982,"y":274,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":1,"e":3},{"b":2,"e":4},{"b":5,"e":3,"o":2},{"b":4,"e":6,"o":2},{"b":6,"e":5}]}
	});
	group.templates.push({
		name: 'Sulfide',
		data: {"a":[{"x":203.998,"y":259,"l":"S"},{"x":186.68,"y":269},{"x":221.32,"y":269}],"b":[{"b":0,"e":1},{"b":0,"e":2}]}
	});
	group.templates.push({
		name: 'Sulfinyl',
		data: {"a":[{"x":186.68,"y":279},{"x":203.998,"y":268.998,"l":"S"},{"x":203.998,"y":249,"l":"O"},{"x":221.32,"y":279}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2,"o":2}]}
	});
	group.templates.push({
		name: 'Sulfonyl',
		data: {"a":[{"x":204,"y":267.66,"l":"S"},{"x":194.002,"y":250.342,"l":"O"},{"x":213.998,"y":250.342,"l":"O"},{"x":186.68,"y":277.658},{"x":221.32,"y":277.658}],"b":[{"b":0,"e":3},{"b":0,"e":4},{"b":0,"e":1,"o":2},{"b":0,"e":2,"o":2}]}
	});
	group.templates.push({
		name: 'Thiocyanate',
		data: {"a":[{"x":178.018,"y":264.002},{"x":195.34,"y":254,"l":"S"},{"x":212.66,"y":264.002},{"x":229.982,"y":274,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":3,"o":3}]}
	});
	d.push(group);

	group = {name:'Sugars (Hexoses)', templates:[]};
	group.templates.push({
		name: 'Allose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":0,"y":-10},{"x":20,"y":-30,"l":"O"},{"x":-20,"y":-30,"l":"H"},{"x":-20,"y":-10,"l":"H"},{"x":20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":20,"y":10,"l":"O"},{"x":-20,"y":10,"l":"H"},{"x":0,"y":30},{"x":-20,"y":30,"l":"H"},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":5},{"b":2,"e":6},{"b":2,"e":7},{"b":7,"e":9},{"b":7,"e":8},{"b":7,"e":10},{"b":10,"e":11},{"b":10,"e":12},{"b":10,"e":13}]}
	});
	group.templates.push({
		name: 'Allose <i>Furanose Form</i>',
		data: {"a":[{"x":7.3205,"y":-13.6239,"l":"O"},{"x":-27.7677,"y":-1.3055},{"x":42.4087,"y":-1.3055},{"x":-14.3652,"y":18.6261},{"x":-27.7677,"y":-21.3055},{"x":-27.7677,"y":18.6945,"l":"H"},{"x":29.0062,"y":18.6261},{"x":62.4087,"y":-1.3055,"l":"O"},{"x":-14.3652,"y":38.6261,"l":"O"},{"x":-14.3652,"y":-1.3739,"l":"H"},{"x":-17.7677,"y":-38.6261,"l":"O"},{"x":-45.0882,"y":-31.3055},{"x":-9.2969,"y":-28.9755,"l":"H"},{"x":29.0062,"y":38.6261,"l":"O"},{"x":29.0062,"y":-1.3739,"l":"H"},{"x":-62.4087,"y":-21.3055,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":6,"o":1},{"b":2,"e":6},{"b":2,"e":0},{"b":3,"e":9},{"b":3,"e":8},{"b":6,"e":14},{"b":6,"e":13},{"b":1,"e":4},{"b":1,"e":5},{"b":4,"e":11},{"b":11,"e":15},{"b":4,"e":10},{"b":4,"e":12},{"b":2,"e":7,"o":1}]}
	});
	group.templates.push({
		name: 'Allose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-22.0845,"y":15.5237},{"x":-36.6654,"y":-29.7292,"l":"H"},{"x":-8.6254,"y":-2.3409},{"x":-54.1679,"y":-0.0514,"l":"O"},{"x":-22.0845,"y":35.5237,"l":"O"},{"x":-41.6882,"y":11.5623,"l":"H"},{"x":6.1279,"y":8.1324},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":-23.6658,"y":-15.5237},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":34.1679,"y":15.5237},{"x":6.1279,"y":-11.8676,"l":"H"},{"x":20.3041,"y":22.2404,"l":"O"},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":1},{"b":3,"e":0},{"b":10,"e":3},{"b":11,"e":7},{"b":11,"e":10},{"b":3,"e":8},{"b":7,"e":12},{"b":7,"e":13},{"b":3,"e":9},{"b":9,"e":14},{"b":0,"e":2},{"b":0,"e":4},{"b":1,"e":5},{"b":1,"e":6},{"b":1,"e":7,"o":1},{"b":11,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Altrose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":-20,"y":-30,"l":"O"},{"x":0,"y":-10},{"x":20,"y":-30,"l":"H"},{"x":-20,"y":-10,"l":"H"},{"x":20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":20,"y":10,"l":"O"},{"x":-20,"y":10,"l":"H"},{"x":0,"y":30},{"x":-20,"y":30,"l":"H"},{"x":0,"y":50,"l":"CH2OH"},{"x":20,"y":30,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":4},{"b":1,"e":3},{"b":3,"e":5},{"b":3,"e":6},{"b":3,"e":7},{"b":7,"e":9},{"b":7,"e":8},{"b":7,"e":10},{"b":10,"e":11},{"b":10,"e":13},{"b":10,"e":12}]}
	});
	group.templates.push({
		name: 'Altrose <i>Furanose Form</i>',
		data: {"a":[{"x":7.3205,"y":-13.6239,"l":"O"},{"x":-27.7677,"y":-1.3055},{"x":42.4087,"y":-1.3055},{"x":-27.7677,"y":18.6945,"l":"H"},{"x":-14.3652,"y":18.6261},{"x":-27.7677,"y":-21.3055},{"x":29.0062,"y":18.6261},{"x":62.4087,"y":-1.3055,"l":"O"},{"x":-14.3652,"y":38.6261,"l":"O"},{"x":-14.3652,"y":-1.3739,"l":"H"},{"x":-9.2969,"y":-28.9755,"l":"H"},{"x":-45.0882,"y":-31.3055},{"x":-17.7677,"y":-38.6261,"l":"O"},{"x":29.0062,"y":-1.3739,"l":"O"},{"x":29.0062,"y":38.6261,"l":"H"},{"x":-62.4087,"y":-21.3055,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":4,"e":6,"o":1},{"b":2,"e":6},{"b":2,"e":0},{"b":4,"e":9},{"b":4,"e":8},{"b":6,"e":13},{"b":6,"e":14},{"b":1,"e":5},{"b":1,"e":3},{"b":5,"e":11},{"b":11,"e":15},{"b":5,"e":12},{"b":5,"e":10},{"b":2,"e":7,"o":1}]}
	});
	group.templates.push({
		name: 'Altrose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-22.0845,"y":15.5237},{"x":-36.6654,"y":-29.7292,"l":"H"},{"x":-8.6254,"y":-2.3409},{"x":-54.1679,"y":-0.0514,"l":"O"},{"x":-22.0845,"y":35.5237,"l":"O"},{"x":6.1279,"y":8.1324},{"x":-41.6882,"y":11.5623,"l":"H"},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-23.6658,"y":-15.5237},{"x":20.3041,"y":22.2404,"l":"H"},{"x":34.1679,"y":15.5237},{"x":6.1279,"y":-11.8676,"l":"O"},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":1},{"b":3,"e":0},{"b":9,"e":3},{"b":12,"e":6},{"b":12,"e":9},{"b":3,"e":8},{"b":6,"e":13},{"b":6,"e":11},{"b":3,"e":10},{"b":10,"e":14},{"b":0,"e":2},{"b":0,"e":4},{"b":1,"e":5},{"b":1,"e":7},{"b":1,"e":6,"o":1},{"b":12,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Galactose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":20,"y":-30,"l":"O"},{"x":0,"y":-10},{"x":-20,"y":-30,"l":"H"},{"x":-20,"y":-10,"l":"O"},{"x":20,"y":-10,"l":"H"},{"x":0,"y":10},{"x":-20,"y":10,"l":"O"},{"x":20,"y":10,"l":"H"},{"x":0,"y":30},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"},{"x":-20,"y":30,"l":"H"}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":2},{"b":1,"e":3},{"b":3,"e":5},{"b":3,"e":6},{"b":3,"e":7},{"b":7,"e":8},{"b":7,"e":9},{"b":7,"e":10},{"b":10,"e":13},{"b":10,"e":11},{"b":10,"e":12}]}
	});
	group.templates.push({
		name: 'Galactose <i>Furanose Form</i>',
		data: {"a":[{"x":8.6603,"y":-22.3184,"l":"O"},{"x":43.7485,"y":-10},{"x":-26.428,"y":-10},{"x":30.346,"y":9.9316},{"x":63.7485,"y":-10,"l":"O"},{"x":-43.7485,"y":0},{"x":-13.0255,"y":9.9316},{"x":-26.428,"y":-30,"l":"H"},{"x":30.346,"y":-10.0684,"l":"H"},{"x":30.346,"y":29.9316,"l":"O"},{"x":-63.7485,"y":0,"l":"O"},{"x":-53.7485,"y":-17.3205,"l":"H"},{"x":-43.7485,"y":20},{"x":-13.0255,"y":-10.0684,"l":"O"},{"x":-13.0255,"y":29.9316,"l":"H"},{"x":-61.069,"y":30,"l":"O"}],"b":[{"b":6,"e":3,"o":1},{"b":1,"e":3},{"b":1,"e":0},{"b":6,"e":13},{"b":6,"e":14},{"b":3,"e":8},{"b":3,"e":9},{"b":1,"e":4,"o":1},{"b":0,"e":2},{"b":2,"e":6},{"b":2,"e":7},{"b":2,"e":5},{"b":5,"e":12},{"b":12,"e":15},{"b":5,"e":11},{"b":5,"e":10}]}
	});
	group.templates.push({
		name: 'Galactose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-36.6654,"y":-29.7292,"l":"O"},{"x":-54.1679,"y":-0.0514,"l":"H"},{"x":-22.0845,"y":15.5237},{"x":-8.6254,"y":-2.3409},{"x":-41.6882,"y":11.5623,"l":"O"},{"x":6.1279,"y":8.1324},{"x":-22.0845,"y":35.5237,"l":"H"},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":-23.6658,"y":-15.5237},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":34.1679,"y":15.5237},{"x":6.1279,"y":-11.8676,"l":"H"},{"x":20.3041,"y":22.2404,"l":"O"},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":3},{"b":4,"e":0},{"b":10,"e":4},{"b":11,"e":6},{"b":11,"e":10},{"b":4,"e":8},{"b":6,"e":12},{"b":6,"e":13},{"b":4,"e":9},{"b":9,"e":14},{"b":0,"e":1},{"b":0,"e":2},{"b":3,"e":7},{"b":3,"e":5},{"b":3,"e":6,"o":1},{"b":11,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Glucose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":-20,"y":-30,"l":"H"},{"x":20,"y":-30,"l":"O"},{"x":0,"y":-10},{"x":20,"y":-10,"l":"H"},{"x":-20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":-20,"y":10,"l":"H"},{"x":20,"y":10,"l":"O"},{"x":0,"y":30},{"x":-20,"y":30,"l":"H"},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":1,"e":4},{"b":4,"e":6},{"b":4,"e":5},{"b":4,"e":7},{"b":7,"e":8},{"b":7,"e":9},{"b":7,"e":10},{"b":10,"e":11},{"b":10,"e":12},{"b":10,"e":13}]}
	});
	group.templates.push({
		name: 'Glucose <i>Furanose Form</i>',
		data: {"a":[{"x":7.3205,"y":-13.6239,"l":"O"},{"x":42.4087,"y":-1.3055},{"x":-27.7677,"y":-1.3055},{"x":29.0062,"y":18.6261},{"x":62.4087,"y":-1.3055,"l":"O"},{"x":-27.7677,"y":18.6945,"l":"H"},{"x":-14.3652,"y":18.6261},{"x":-27.7677,"y":-21.3055},{"x":29.0062,"y":38.6261,"l":"O"},{"x":29.0062,"y":-1.3739,"l":"H"},{"x":-14.3652,"y":38.6261,"l":"H"},{"x":-14.3652,"y":-1.3739,"l":"O"},{"x":-9.2969,"y":-28.9755,"l":"H"},{"x":-17.7677,"y":-38.6261,"l":"O"},{"x":-45.0882,"y":-31.3055},{"x":-62.4087,"y":-21.3055,"l":"O"}],"b":[{"b":0,"e":2},{"b":2,"e":6},{"b":6,"e":3,"o":1},{"b":1,"e":3},{"b":1,"e":0},{"b":6,"e":11},{"b":6,"e":10},{"b":3,"e":9},{"b":3,"e":8},{"b":2,"e":7},{"b":2,"e":5},{"b":7,"e":14},{"b":14,"e":15},{"b":7,"e":13},{"b":7,"e":12},{"b":1,"e":4,"o":1}]}
	});
	group.templates.push({
		name: 'Glucose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-54.1679,"y":-0.0514,"l":"O"},{"x":-36.6654,"y":-29.7292,"l":"H"},{"x":-8.6254,"y":-2.3409},{"x":-22.0845,"y":15.5237},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":-23.6658,"y":-15.5237},{"x":-22.0845,"y":35.5237,"l":"H"},{"x":6.1279,"y":8.1324},{"x":-41.6882,"y":11.5623,"l":"O"},{"x":34.1679,"y":15.5237},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":20.3041,"y":22.2404,"l":"O"},{"x":6.1279,"y":-11.8676,"l":"H"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":4},{"b":3,"e":0},{"b":5,"e":3},{"b":11,"e":9},{"b":11,"e":5},{"b":3,"e":6},{"b":9,"e":14},{"b":9,"e":13},{"b":3,"e":7},{"b":7,"e":12},{"b":0,"e":2},{"b":0,"e":1},{"b":4,"e":8},{"b":4,"e":10},{"b":4,"e":9,"o":1},{"b":11,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Gulose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":-20,"y":-30,"l":"H"},{"x":20,"y":-30,"l":"O"},{"x":0,"y":-10},{"x":-20,"y":-10,"l":"H"},{"x":20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":-20,"y":10,"l":"O"},{"x":20,"y":10,"l":"H"},{"x":0,"y":30},{"x":-20,"y":30,"l":"H"},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":1,"e":4},{"b":4,"e":5},{"b":4,"e":6},{"b":4,"e":7},{"b":7,"e":8},{"b":7,"e":9},{"b":7,"e":10},{"b":10,"e":11},{"b":10,"e":12},{"b":10,"e":13}]}
	});
	group.templates.push({
		name: 'Gulose <i>Furanose Form</i>',
		data: {"a":[{"x":8.6603,"y":-22.3184,"l":"O"},{"x":43.7485,"y":-10},{"x":-26.428,"y":-10},{"x":63.7485,"y":-10,"l":"O"},{"x":30.346,"y":9.9316},{"x":-43.7485,"y":0},{"x":-13.0255,"y":9.9316},{"x":-26.428,"y":-30,"l":"H"},{"x":30.346,"y":29.9316,"l":"O"},{"x":30.346,"y":-10.0684,"l":"H"},{"x":-43.7485,"y":20},{"x":-53.7485,"y":-17.3205,"l":"H"},{"x":-63.7485,"y":0,"l":"O"},{"x":-13.0255,"y":29.9316,"l":"O"},{"x":-13.0255,"y":-10.0684,"l":"H"},{"x":-61.069,"y":30,"l":"O"}],"b":[{"b":6,"e":4,"o":1},{"b":1,"e":4},{"b":1,"e":0},{"b":6,"e":14},{"b":6,"e":13},{"b":4,"e":9},{"b":4,"e":8},{"b":1,"e":3,"o":1},{"b":0,"e":2},{"b":2,"e":6},{"b":2,"e":7},{"b":2,"e":5},{"b":5,"e":10},{"b":10,"e":15},{"b":5,"e":11},{"b":5,"e":12}]}
	});
	group.templates.push({
		name: 'Gulose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-22.0845,"y":15.5237},{"x":-36.6654,"y":-29.7292,"l":"O"},{"x":-54.1679,"y":-0.0514,"l":"H"},{"x":-8.6254,"y":-2.3409},{"x":-41.6882,"y":11.5623,"l":"H"},{"x":-22.0845,"y":35.5237,"l":"O"},{"x":6.1279,"y":8.1324},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-23.6658,"y":-15.5237},{"x":34.1679,"y":15.5237},{"x":6.1279,"y":-11.8676,"l":"H"},{"x":20.3041,"y":22.2404,"l":"O"},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":1},{"b":4,"e":0},{"b":9,"e":4},{"b":11,"e":7},{"b":11,"e":9},{"b":4,"e":8},{"b":7,"e":12},{"b":7,"e":13},{"b":4,"e":10},{"b":10,"e":14},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":6},{"b":1,"e":5},{"b":1,"e":7,"o":1},{"b":11,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Idose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":0,"y":-10},{"x":20,"y":-30,"l":"H"},{"x":-20,"y":-30,"l":"O"},{"x":0,"y":10},{"x":-20,"y":-10,"l":"H"},{"x":20,"y":-10,"l":"O"},{"x":0,"y":30},{"x":-20,"y":10,"l":"O"},{"x":20,"y":10,"l":"H"},{"x":-20,"y":30,"l":"H"},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":6},{"b":2,"e":7},{"b":2,"e":5},{"b":5,"e":9},{"b":5,"e":10},{"b":5,"e":8},{"b":8,"e":11},{"b":8,"e":12},{"b":8,"e":13}]}
	});
	group.templates.push({
		name: 'Idose <i>Furanose Form</i>',
		data: {"a":[{"x":8.6603,"y":-22.3184,"l":"O"},{"x":43.7485,"y":-10},{"x":-26.428,"y":-10},{"x":30.346,"y":9.9316},{"x":63.7485,"y":-10,"l":"O"},{"x":-43.7485,"y":0},{"x":-13.0255,"y":9.9316},{"x":-26.428,"y":-30,"l":"H"},{"x":30.346,"y":-10.0684,"l":"O"},{"x":30.346,"y":29.9316,"l":"H"},{"x":-53.7485,"y":-17.3205,"l":"H"},{"x":-43.7485,"y":20},{"x":-63.7485,"y":0,"l":"O"},{"x":-13.0255,"y":-10.0684,"l":"H"},{"x":-13.0255,"y":29.9316,"l":"O"},{"x":-61.069,"y":30,"l":"O"}],"b":[{"b":6,"e":3,"o":1},{"b":1,"e":3},{"b":1,"e":0},{"b":6,"e":13},{"b":6,"e":14},{"b":3,"e":8},{"b":3,"e":9},{"b":1,"e":4,"o":1},{"b":0,"e":2},{"b":2,"e":6},{"b":2,"e":7},{"b":2,"e":5},{"b":5,"e":11},{"b":11,"e":15},{"b":5,"e":10},{"b":5,"e":12}]}
	});
	group.templates.push({
		name: 'Idose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-22.0845,"y":15.5237},{"x":-54.1679,"y":-0.0514,"l":"H"},{"x":-8.6254,"y":-2.3409},{"x":-36.6654,"y":-29.7292,"l":"O"},{"x":-41.6882,"y":11.5623,"l":"H"},{"x":-22.0845,"y":35.5237,"l":"O"},{"x":6.1279,"y":8.1324},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-23.6658,"y":-15.5237},{"x":20.3041,"y":22.2404,"l":"H"},{"x":6.1279,"y":-11.8676,"l":"O"},{"x":34.1679,"y":15.5237},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":1},{"b":3,"e":0},{"b":9,"e":3},{"b":13,"e":7},{"b":13,"e":9},{"b":3,"e":8},{"b":7,"e":12},{"b":7,"e":11},{"b":3,"e":10},{"b":10,"e":14},{"b":0,"e":4},{"b":0,"e":2},{"b":1,"e":6},{"b":1,"e":5},{"b":1,"e":7,"o":1},{"b":13,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Mannose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":20,"y":-30,"l":"H"},{"x":-20,"y":-30,"l":"O"},{"x":0,"y":-10},{"x":20,"y":-10,"l":"H"},{"x":-20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":0,"y":30},{"x":-20,"y":10,"l":"H"},{"x":20,"y":10,"l":"O"},{"x":-20,"y":30,"l":"H"},{"x":0,"y":50,"l":"CH2OH"},{"x":20,"y":30,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":1,"e":4},{"b":4,"e":6},{"b":4,"e":5},{"b":4,"e":7},{"b":7,"e":9},{"b":7,"e":10},{"b":7,"e":8},{"b":8,"e":11},{"b":8,"e":13},{"b":8,"e":12}]}
	});
	group.templates.push({
		name: 'Mannose <i>Furanose Form</i>',
		data: {"a":[{"x":7.3205,"y":-13.6239,"l":"O"},{"x":42.4087,"y":-1.3055},{"x":-27.7677,"y":-1.3055},{"x":29.0062,"y":18.6261},{"x":62.4087,"y":-1.3055,"l":"O"},{"x":-14.3652,"y":18.6261},{"x":-27.7677,"y":18.6945,"l":"H"},{"x":-27.7677,"y":-21.3055},{"x":29.0062,"y":38.6261,"l":"H"},{"x":29.0062,"y":-1.3739,"l":"O"},{"x":-14.3652,"y":-1.3739,"l":"O"},{"x":-14.3652,"y":38.6261,"l":"H"},{"x":-9.2969,"y":-28.9755,"l":"H"},{"x":-45.0882,"y":-31.3055},{"x":-17.7677,"y":-38.6261,"l":"O"},{"x":-62.4087,"y":-21.3055,"l":"O"}],"b":[{"b":0,"e":2},{"b":2,"e":5},{"b":5,"e":3,"o":1},{"b":1,"e":3},{"b":1,"e":0},{"b":5,"e":10},{"b":5,"e":11},{"b":3,"e":9},{"b":3,"e":8},{"b":2,"e":7},{"b":2,"e":6},{"b":7,"e":13},{"b":13,"e":15},{"b":7,"e":14},{"b":7,"e":12},{"b":1,"e":4,"o":1}]}
	});
	group.templates.push({
		name: 'Mannose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-8.6254,"y":-2.3409},{"x":-36.6654,"y":-29.7292,"l":"H"},{"x":-54.1679,"y":-0.0514,"l":"O"},{"x":-22.0845,"y":15.5237},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":-23.6658,"y":-15.5237},{"x":6.1279,"y":8.1324},{"x":-22.0845,"y":35.5237,"l":"H"},{"x":-41.6882,"y":11.5623,"l":"O"},{"x":34.1679,"y":15.5237},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":6.1279,"y":-11.8676,"l":"O"},{"x":20.3041,"y":22.2404,"l":"H"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":4},{"b":1,"e":0},{"b":5,"e":1},{"b":11,"e":8},{"b":11,"e":5},{"b":1,"e":6},{"b":8,"e":13},{"b":8,"e":14},{"b":1,"e":7},{"b":7,"e":12},{"b":0,"e":2},{"b":0,"e":3},{"b":4,"e":9},{"b":4,"e":10},{"b":4,"e":8,"o":1},{"b":11,"e":15,"o":1}]}
	});
	group.templates.push({
		name: 'Talose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-50,"l":"CHO"},{"x":0,"y":-30},{"x":0,"y":-10},{"x":-20,"y":-30,"l":"O"},{"x":20,"y":-30,"l":"H"},{"x":-20,"y":-10,"l":"O"},{"x":20,"y":-10,"l":"H"},{"x":0,"y":10},{"x":20,"y":10,"l":"H"},{"x":0,"y":30},{"x":-20,"y":10,"l":"O"},{"x":20,"y":30,"l":"O"},{"x":0,"y":50,"l":"CH2OH"},{"x":-20,"y":30,"l":"H"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":4},{"b":1,"e":2},{"b":2,"e":5},{"b":2,"e":6},{"b":2,"e":7},{"b":7,"e":10},{"b":7,"e":8},{"b":7,"e":9},{"b":9,"e":13},{"b":9,"e":11},{"b":9,"e":12}]}
	});
	group.templates.push({
		name: 'Talose <i>Furanose Form</i>',
		data: {"a":[{"x":8.6603,"y":-22.3184,"l":"O"},{"x":43.7485,"y":-10},{"x":-26.428,"y":-10},{"x":30.346,"y":9.9316},{"x":63.7485,"y":-10,"l":"O"},{"x":-13.0255,"y":9.9316},{"x":-26.428,"y":-30,"l":"H"},{"x":-43.7485,"y":0},{"x":30.346,"y":29.9316,"l":"H"},{"x":30.346,"y":-10.0684,"l":"O"},{"x":-13.0255,"y":29.9316,"l":"H"},{"x":-13.0255,"y":-10.0684,"l":"O"},{"x":-43.7485,"y":20},{"x":-53.7485,"y":-17.3205,"l":"H"},{"x":-63.7485,"y":0,"l":"O"},{"x":-61.069,"y":30,"l":"O"}],"b":[{"b":5,"e":3,"o":1},{"b":1,"e":3},{"b":1,"e":0},{"b":5,"e":11},{"b":5,"e":10},{"b":3,"e":9},{"b":3,"e":8},{"b":1,"e":4,"o":1},{"b":0,"e":2},{"b":2,"e":5},{"b":2,"e":6},{"b":2,"e":7},{"b":7,"e":12},{"b":12,"e":15},{"b":7,"e":13},{"b":7,"e":14}]}
	});
	group.templates.push({
		name: 'Talose <i>Pyranose Form</i>',
		data: {"a":[{"x":-36.6654,"y":-9.7292},{"x":-22.0845,"y":15.5237},{"x":-54.1679,"y":-0.0514,"l":"H"},{"x":-36.6654,"y":-29.7292,"l":"O"},{"x":-8.6254,"y":-2.3409},{"x":-41.6882,"y":11.5623,"l":"O"},{"x":-22.0845,"y":35.5237,"l":"H"},{"x":6.1279,"y":8.1324},{"x":19.5899,"y":-9.7292,"l":"O"},{"x":-8.6254,"y":24.8818,"l":"H"},{"x":-23.6658,"y":-15.5237},{"x":34.1679,"y":15.5237},{"x":20.3041,"y":22.2404,"l":"H"},{"x":6.1279,"y":-11.8676,"l":"O"},{"x":-23.6658,"y":-35.5237,"l":"O"},{"x":54.1679,"y":15.5237,"l":"O"}],"b":[{"b":0,"e":1},{"b":4,"e":0},{"b":8,"e":4},{"b":11,"e":7},{"b":11,"e":8},{"b":4,"e":9},{"b":7,"e":13},{"b":7,"e":12},{"b":4,"e":10},{"b":10,"e":14},{"b":0,"e":3},{"b":0,"e":2},{"b":1,"e":6},{"b":1,"e":5},{"b":1,"e":7,"o":1},{"b":11,"e":15,"o":1}]}
	});
	d.push(group);

	group = {name:'Sugars (Other Monosaccharides)', templates:[]};
	group.templates.push({
		name: 'Glyceraldehyde <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":0},{"x":0,"y":-20,"l":"CHO"},{"x":0,"y":20,"l":"CH2OH"},{"x":-20,"y":0,"l":"H"},{"x":20,"y":0,"l":"O"}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":4}]}
	});
	group.templates.push({
		name: 'Erythrose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-30,"l":"CHO"},{"x":0,"y":-10},{"x":20,"y":-10,"l":"O"},{"x":0,"y":10},{"x":-20,"y":-10,"l":"H"},{"x":20,"y":10,"l":"O"},{"x":0,"y":30,"l":"CH2OH"},{"x":-20,"y":10,"l":"H"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":6},{"b":3,"e":5},{"b":1,"e":2},{"b":1,"e":4},{"b":3,"e":7}]}
	});
	group.templates.push({
		name: 'Threose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-30,"l":"CHO"},{"x":0,"y":-10},{"x":0,"y":10},{"x":20,"y":-10,"l":"H"},{"x":-20,"y":-10,"l":"O"},{"x":-20,"y":10,"l":"H"},{"x":20,"y":10,"l":"O"},{"x":0,"y":30,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":2,"e":7},{"b":2,"e":6},{"b":1,"e":3},{"b":1,"e":4},{"b":2,"e":5}]}
	});
	group.templates.push({
		name: 'Ribose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-20},{"x":20,"y":-20,"l":"O"},{"x":0,"y":0},{"x":0,"y":-40,"l":"CHO"},{"x":-20,"y":-20,"l":"H"},{"x":20,"y":0,"l":"O"},{"x":-20,"y":0,"l":"H"},{"x":0,"y":20},{"x":0,"y":40,"l":"CH2OH"},{"x":20,"y":20,"l":"O"},{"x":-20,"y":20,"l":"H"}],"b":[{"b":0,"e":3},{"b":0,"e":2},{"b":2,"e":7},{"b":7,"e":8},{"b":0,"e":4},{"b":0,"e":1},{"b":2,"e":6},{"b":2,"e":5},{"b":7,"e":10},{"b":7,"e":9}]}
	});
	group.templates.push({
		name: 'Arabinose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-20},{"x":0,"y":-40,"l":"CHO"},{"x":-20,"y":-20,"l":"O"},{"x":0,"y":0},{"x":20,"y":-20,"l":"H"},{"x":-20,"y":0,"l":"H"},{"x":20,"y":0,"l":"O"},{"x":0,"y":20},{"x":0,"y":40,"l":"CH2OH"},{"x":-20,"y":20,"l":"H"},{"x":20,"y":20,"l":"O"}],"b":[{"b":0,"e":1},{"b":0,"e":3},{"b":3,"e":7},{"b":7,"e":8},{"b":0,"e":2},{"b":0,"e":4},{"b":3,"e":5},{"b":3,"e":6},{"b":7,"e":9},{"b":7,"e":10}]}
	});
	group.templates.push({
		name: 'Xylose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-20},{"x":0,"y":-40,"l":"CHO"},{"x":0,"y":0},{"x":-20,"y":-20,"l":"H"},{"x":20,"y":-20,"l":"O"},{"x":20,"y":0,"l":"H"},{"x":0,"y":20},{"x":-20,"y":0,"l":"O"},{"x":20,"y":20,"l":"O"},{"x":-20,"y":20,"l":"H"},{"x":0,"y":40,"l":"CH2OH"}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":2,"e":6},{"b":6,"e":10},{"b":0,"e":3},{"b":0,"e":4},{"b":2,"e":7},{"b":2,"e":5},{"b":6,"e":9},{"b":6,"e":8}]}
	});
	group.templates.push({
		name: 'Lyxose <i>Fisher Projection</i>',
		data: {"a":[{"x":0,"y":-20},{"x":-20,"y":-20,"l":"O"},{"x":0,"y":-40,"l":"CHO"},{"x":20,"y":-20,"l":"H"},{"x":0,"y":0},{"x":20,"y":0,"l":"H"},{"x":0,"y":20},{"x":-20,"y":0,"l":"O"},{"x":20,"y":20,"l":"O"},{"x":-20,"y":20,"l":"H"},{"x":0,"y":40,"l":"CH2OH"}],"b":[{"b":0,"e":2},{"b":0,"e":4},{"b":4,"e":6},{"b":6,"e":10},{"b":0,"e":1},{"b":0,"e":3},{"b":4,"e":7},{"b":4,"e":5},{"b":6,"e":9},{"b":6,"e":8}]}
	});
	d.push(group);

	group = {name:'Nucleotides', templates:[]};
	group.templates.push({
		name: 'Adenine',
		data: {"a":[{"x":-32.709,"y":10},{"x":-20.9532,"y":26.1804,"l":"N"},{"x":-20.9532,"y":-6.1803,"l":"N"},{"x":-1.9321,"y":20},{"x":-1.9321,"y":0},{"x":15.3884,"y":30.0001,"l":"N"},{"x":15.3884,"y":-10},{"x":32.709,"y":20},{"x":15.3884,"y":-30,"l":"N"},{"x":32.709,"y":0,"l":"N"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":4,"o":2},{"b":4,"e":2},{"b":2,"e":0,"o":2},{"b":3,"e":5},{"b":5,"e":7,"o":2},{"b":7,"e":9},{"b":9,"e":6,"o":2},{"b":6,"e":4},{"b":6,"e":8}]}
	});
	group.templates.push({
		name: 'Guanine',
		data: {"a":[{"x":-41.3692,"y":10},{"x":-29.6135,"y":-6.1804,"l":"N"},{"x":-29.6135,"y":26.1803,"l":"N"},{"x":-10.5924,"y":-0},{"x":-10.5924,"y":20},{"x":6.7282,"y":-10.0001},{"x":6.7282,"y":30,"l":"N"},{"x":6.7282,"y":-30,"l":"O"},{"x":24.0487,"y":-0,"l":"N"},{"x":24.0487,"y":20},{"x":41.3692,"y":30,"l":"N"}],"b":[{"b":0,"e":2},{"b":2,"e":4},{"b":4,"e":3,"o":2},{"b":3,"e":1},{"b":1,"e":0,"o":2},{"b":4,"e":6},{"b":6,"e":9,"o":2},{"b":9,"e":8},{"b":8,"e":5},{"b":5,"e":3},{"b":5,"e":7,"o":2},{"b":9,"e":10}]}
	});
	group.templates.push({
		name: 'Cytosine',
		data: {"a":[{"x":-8.6603,"y":-10},{"x":-8.6603,"y":-30,"l":"N"},{"x":-25.9808,"y":0},{"x":8.6603,"y":0,"l":"N"},{"x":-25.9808,"y":20},{"x":8.6603,"y":20},{"x":-8.6603,"y":30,"l":"N"},{"x":25.9808,"y":30,"l":"O"}],"b":[{"b":0,"e":2},{"b":2,"e":4,"o":2},{"b":4,"e":6},{"b":6,"e":5},{"b":5,"e":3},{"b":3,"e":0,"o":2},{"b":5,"e":7,"o":2},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Thymine',
		data: {"a":[{"x":0,"y":-10},{"x":17.3205,"y":0,"l":"N"},{"x":0,"y":-30,"l":"O"},{"x":-17.3205,"y":0},{"x":17.3205,"y":20},{"x":-17.3205,"y":20},{"x":-34.641,"y":-10},{"x":34.641,"y":30,"l":"O"},{"x":0,"y":30,"l":"N"}],"b":[{"b":0,"e":3},{"b":3,"e":5,"o":2},{"b":5,"e":8},{"b":8,"e":4},{"b":4,"e":1},{"b":1,"e":0},{"b":0,"e":2,"o":2},{"b":3,"e":6},{"b":4,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Uracil',
		data: {"a":[{"x":-8.6603,"y":-10},{"x":-25.9808,"y":0},{"x":-8.6603,"y":-30,"l":"O"},{"x":8.6603,"y":0,"l":"N"},{"x":-25.9808,"y":20},{"x":8.6603,"y":20},{"x":-8.6603,"y":30,"l":"N"},{"x":25.9808,"y":30,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":4,"o":2},{"b":4,"e":6},{"b":6,"e":5},{"b":5,"e":3},{"b":3,"e":0},{"b":0,"e":2,"o":2},{"b":5,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Ribonucleoside',
		data: {"a":[{"x":-14.2796,"y":-14.9551},{"c":-1,"x":-34.2796,"y":-14.9551,"l":"O"},{"x":-14.2796,"y":5.0449},{"x":9.5513,"y":-2.7359,"l":"O"},{"x":-5.177,"y":17.6345},{"x":33.3822,"y":5.045},{"x":24.2796,"y":17.6345},{"x":-15.177,"y":34.955,"l":"O"},{"x":33.3822,"y":-34.955,"l":"N"},{"x":34.2796,"y":34.955,"l":"O"}],"b":[{"b":3,"e":2},{"b":2,"e":4},{"b":4,"e":6,"o":1},{"b":5,"e":6},{"b":5,"e":3},{"b":4,"e":7},{"b":5,"e":8},{"b":2,"e":0},{"b":0,"e":1},{"b":6,"e":9}]}
	});
	group.templates.push({
		name: 'Ribonucleoside Monophosphate',
		data: {"a":[{"x":5.7204,"y":-14.955},{"x":-14.2796,"y":-14.955,"l":"O"},{"x":5.7204,"y":5.045},{"x":-34.2796,"y":-14.955,"l":"P"},{"x":14.823,"y":17.6345},{"x":29.5513,"y":-2.7358,"l":"O"},{"c":-1,"x":-54.2796,"y":-14.9551,"l":"O"},{"x":-34.2796,"y":-34.955,"l":"O"},{"c":-1,"x":-34.2796,"y":5.045,"l":"O"},{"x":4.823,"y":34.955,"l":"O"},{"x":44.2796,"y":17.6345},{"x":53.3822,"y":5.045},{"x":54.2796,"y":34.955,"l":"O"},{"x":53.3822,"y":-34.955,"l":"N"}],"b":[{"b":5,"e":2},{"b":2,"e":4},{"b":4,"e":10,"o":1},{"b":11,"e":10},{"b":11,"e":5},{"b":4,"e":9},{"b":11,"e":13},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":6},{"b":3,"e":7,"o":2},{"b":3,"e":8},{"b":10,"e":12}]}
	});
	group.templates.push({
		name: 'Ribonucleoside Diphosphate',
		data: {"a":[{"x":25.7204,"y":-14.955},{"x":5.7204,"y":-14.955,"l":"O"},{"x":25.7204,"y":5.045},{"x":-14.2796,"y":-14.955,"l":"P"},{"x":49.5513,"y":-2.7358,"l":"O"},{"x":34.823,"y":17.6345},{"c":-1,"x":-14.2796,"y":5.045,"l":"O"},{"x":-14.2796,"y":-34.955,"l":"O"},{"x":-34.2796,"y":-14.955,"l":"O"},{"x":73.3822,"y":5.045},{"x":64.2796,"y":17.6345},{"x":24.823,"y":34.955,"l":"O"},{"x":-54.2796,"y":-14.955,"l":"P"},{"x":73.3822,"y":-34.955,"l":"N"},{"x":74.2796,"y":34.9551,"l":"O"},{"c":-1,"x":-54.2796,"y":5.045,"l":"O"},{"x":-54.2796,"y":-34.955,"l":"O"},{"c":-1,"x":-74.2796,"y":-14.955,"l":"O"}],"b":[{"b":4,"e":2},{"b":2,"e":5},{"b":5,"e":10,"o":1},{"b":9,"e":10},{"b":9,"e":4},{"b":5,"e":11},{"b":9,"e":13},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":8},{"b":3,"e":7,"o":2},{"b":3,"e":6},{"b":10,"e":14},{"b":8,"e":12},{"b":12,"e":17},{"b":12,"e":16,"o":2},{"b":12,"e":15}]}
	});
	group.templates.push({
		name: 'Ribonucleoside Triphosphate',
		data: {"a":[{"x":45.7204,"y":-14.955},{"x":45.7204,"y":5.045},{"x":25.7204,"y":-14.955,"l":"O"},{"x":54.823,"y":17.6345},{"x":69.5513,"y":-2.7358,"l":"O"},{"x":5.7204,"y":-14.955,"l":"P"},{"x":44.823,"y":34.955,"l":"O"},{"x":84.2796,"y":17.6345},{"x":93.3822,"y":5.045},{"c":-1,"x":5.7204,"y":5.045,"l":"O"},{"x":-14.2796,"y":-14.955,"l":"O"},{"x":5.7204,"y":-34.955,"l":"O"},{"x":94.2796,"y":34.9551,"l":"O"},{"x":93.3822,"y":-34.955,"l":"N"},{"x":-34.2796,"y":-14.955,"l":"P"},{"c":-1,"x":-34.2796,"y":5.045,"l":"O"},{"x":-34.2796,"y":-34.955,"l":"O"},{"x":-54.2796,"y":-14.955,"l":"O"},{"x":-74.2796,"y":-14.955,"l":"P"},{"x":-74.2796,"y":-34.955,"l":"O"},{"c":-1,"x":-94.2796,"y":-14.955,"l":"O"},{"c":-1,"x":-74.2796,"y":5.045,"l":"O"}],"b":[{"b":4,"e":1},{"b":1,"e":3},{"b":3,"e":7,"o":1},{"b":8,"e":7},{"b":8,"e":4},{"b":3,"e":6},{"b":8,"e":13},{"b":1,"e":0},{"b":0,"e":2},{"b":2,"e":5},{"b":5,"e":10},{"b":5,"e":11,"o":2},{"b":5,"e":9},{"b":7,"e":12},{"b":10,"e":14},{"b":14,"e":17},{"b":14,"e":16,"o":2},{"b":14,"e":15},{"b":17,"e":18},{"b":18,"e":20},{"b":18,"e":19,"o":2},{"b":18,"e":21}]}
	});
	group.templates.push({
		name: 'Ribonucleotide chain form',
		data: {"a":[{"x":-13.8309,"y":-36.2948},{"x":-33.8309,"y":-36.2948,"l":"O"},{"x":-13.8309,"y":-16.2948},{"x":10,"y":-24.0756,"l":"O"},{"x":-4.7283,"y":-3.7052},{"x":33.8309,"y":-16.2948},{"x":24.7283,"y":-3.7052},{"x":-4.7283,"y":16.2948,"l":"O"},{"x":33.8309,"y":-56.2948,"l":"N"},{"x":24.7283,"y":16.2948,"l":"O"},{"x":-4.7283,"y":36.2948,"l":"P"},{"c":-1,"x":-4.7283,"y":56.2948,"l":"O"},{"c":-1,"x":15.2717,"y":36.2948,"l":"O"},{"x":-24.7283,"y":36.2948,"l":"O"}],"b":[{"b":3,"e":2},{"b":2,"e":4},{"b":4,"e":6,"o":1},{"b":5,"e":6},{"b":5,"e":3},{"b":4,"e":7},{"b":5,"e":8},{"b":2,"e":0},{"b":0,"e":1},{"b":6,"e":9},{"b":7,"e":10},{"b":10,"e":12},{"b":10,"e":13,"o":2},{"b":10,"e":11}]}
	});
	group.templates.push({
		name: 'Deoxyribonucleoside',
		data: {"a":[{"x":-13.8309,"y":-14.9551},{"c":-1,"x":-33.8309,"y":-14.9551,"l":"O"},{"x":-13.8309,"y":5.0449},{"x":10,"y":-2.7359,"l":"O"},{"x":-4.7283,"y":17.6345},{"x":33.8309,"y":5.045},{"x":24.7283,"y":17.6345},{"x":-14.7283,"y":34.955,"l":"O"},{"x":33.8309,"y":-34.955,"l":"N"}],"b":[{"b":3,"e":2},{"b":2,"e":4},{"b":4,"e":6,"o":1},{"b":5,"e":6},{"b":5,"e":3},{"b":4,"e":7},{"b":5,"e":8},{"b":2,"e":0},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Deoxyribonucleoside Monophosphate',
		data: {"a":[{"x":6.1691,"y":-14.955},{"x":-13.8309,"y":-14.955,"l":"O"},{"x":6.1691,"y":5.045},{"x":-33.8309,"y":-14.955,"l":"P"},{"x":30,"y":-2.7358,"l":"O"},{"x":15.2717,"y":17.6345},{"x":-33.8309,"y":-34.955,"l":"O"},{"c":-1,"x":-53.8309,"y":-14.9551,"l":"O"},{"c":-1,"x":-33.8309,"y":5.045,"l":"O"},{"x":53.8309,"y":5.045},{"x":5.2717,"y":34.955,"l":"O"},{"x":44.7283,"y":17.6345},{"x":53.8309,"y":-34.955,"l":"N"}],"b":[{"b":4,"e":2},{"b":2,"e":5},{"b":5,"e":11,"o":1},{"b":9,"e":11},{"b":9,"e":4},{"b":5,"e":10},{"b":9,"e":12},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":7},{"b":3,"e":6,"o":2},{"b":3,"e":8}]}
	});
	group.templates.push({
		name: 'Deoxyribonucleoside Diphosphate',
		data: {"a":[{"x":26.1691,"y":-14.955},{"x":6.1691,"y":-14.955,"l":"O"},{"x":26.1691,"y":5.045},{"x":-13.8309,"y":-14.955,"l":"P"},{"x":50,"y":-2.7358,"l":"O"},{"x":35.2717,"y":17.6345},{"c":-1,"x":-13.8309,"y":5.045,"l":"O"},{"x":-13.8309,"y":-34.955,"l":"O"},{"x":-33.8309,"y":-14.955,"l":"O"},{"x":73.8309,"y":5.045},{"x":64.7283,"y":17.6345},{"x":25.2717,"y":34.955,"l":"O"},{"x":-53.8309,"y":-14.955,"l":"P"},{"x":73.8309,"y":-34.955,"l":"N"},{"x":-53.8309,"y":-34.955,"l":"O"},{"c":-1,"x":-53.8309,"y":5.045,"l":"O"},{"c":-1,"x":-73.8309,"y":-14.955,"l":"O"}],"b":[{"b":4,"e":2},{"b":2,"e":5},{"b":5,"e":10,"o":1},{"b":9,"e":10},{"b":9,"e":4},{"b":5,"e":11},{"b":9,"e":13},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":8},{"b":3,"e":7,"o":2},{"b":3,"e":6},{"b":8,"e":12},{"b":12,"e":16},{"b":12,"e":14,"o":2},{"b":12,"e":15}]}
	});
	group.templates.push({
		name: 'Deoxyribonucleoside Triphosphate',
		data: {"a":[{"x":46.1691,"y":-14.955},{"x":26.1691,"y":-14.955,"l":"O"},{"x":46.1691,"y":5.045},{"x":6.1691,"y":-14.955,"l":"P"},{"x":70,"y":-2.7358,"l":"O"},{"x":55.2717,"y":17.6345},{"c":-1,"x":6.1691,"y":5.045,"l":"O"},{"x":-13.8309,"y":-14.955,"l":"O"},{"x":6.1691,"y":-34.955,"l":"O"},{"x":93.8309,"y":5.045},{"x":84.7283,"y":17.6345},{"x":45.2717,"y":34.955,"l":"O"},{"x":-33.8309,"y":-14.955,"l":"P"},{"x":93.8309,"y":-34.955,"l":"N"},{"x":-33.8309,"y":-34.955,"l":"O"},{"c":-1,"x":-33.8309,"y":5.045,"l":"O"},{"x":-53.8309,"y":-14.955,"l":"O"},{"x":-73.8309,"y":-14.955,"l":"P"},{"x":-73.8309,"y":-34.955,"l":"O"},{"c":-1,"x":-93.8309,"y":-14.955,"l":"O"},{"c":-1,"x":-73.8309,"y":5.045,"l":"O"}],"b":[{"b":4,"e":2},{"b":2,"e":5},{"b":5,"e":10,"o":1},{"b":9,"e":10},{"b":9,"e":4},{"b":5,"e":11},{"b":9,"e":13},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":7},{"b":3,"e":8,"o":2},{"b":3,"e":6},{"b":7,"e":12},{"b":12,"e":16},{"b":12,"e":14,"o":2},{"b":12,"e":15},{"b":16,"e":17},{"b":17,"e":19},{"b":17,"e":18,"o":2},{"b":17,"e":20}]}
	});
	group.templates.push({
		name: 'Deoxyribonucleotide chain form',
		data: {"a":[{"x":-13.8309,"y":-36.2948},{"x":-13.8309,"y":-16.2948},{"x":-33.8309,"y":-36.2948,"l":"O"},{"x":10,"y":-24.0756,"l":"O"},{"x":-4.7284,"y":-3.7052},{"x":33.8309,"y":-16.2948},{"x":24.7283,"y":-3.7052},{"x":-4.7284,"y":16.2948,"l":"O"},{"x":33.8309,"y":-56.2948,"l":"N"},{"x":-4.7284,"y":36.2948,"l":"P"},{"x":-24.7284,"y":36.2948,"l":"O"},{"c":-1,"x":-4.7284,"y":56.2948,"l":"O"},{"c":-1,"x":15.2716,"y":36.2948,"l":"O"}],"b":[{"b":3,"e":1},{"b":1,"e":4},{"b":4,"e":6,"o":1},{"b":5,"e":6},{"b":5,"e":3},{"b":4,"e":7},{"b":5,"e":8},{"b":1,"e":0},{"b":0,"e":2},{"b":7,"e":9},{"b":9,"e":12},{"b":9,"e":10,"o":2},{"b":9,"e":11}]}
	});
	group.templates.push({
		name: 'Phosphate',
		data: {"a":[{"x":-18.6602,"y":-0.6571,"l":"O"},{"x":1.3398,"y":-0.6571,"l":"P"},{"c":-1,"x":8.6025,"y":17.9776,"l":"O"},{"x":11.3398,"y":-17.9776,"l":"O"},{"c":-1,"x":18.6603,"y":9.3429,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3,"o":2},{"b":1,"e":4}]}
	});
	d.push(group);

	group = {name:'Other', templates:[]};
	group.templates.push({
		name: 'Adamantane',
		data: {"a":[{"x":-23.2311,"y":23.1027},{"x":-5.451,"y":14.1461},{"x":-12.329,"y":4.0241},{"x":12.3291,"y":23.1027},{"x":-5.451,"y":-4.0241},{"x":5.451,"y":13.1092},{"x":-12.329,"y":-14.1461},{"x":23.2311,"y":4.0241},{"x":5.451,"y":-23.1027},{"x":23.2311,"y":-14.1461}],"b":[{"b":0,"e":1},{"b":4,"e":8},{"b":8,"e":6},{"b":6,"e":2},{"b":0,"e":2},{"b":2,"e":5},{"b":5,"e":7},{"b":7,"e":3},{"b":1,"e":3},{"b":7,"e":9},{"b":8,"e":9},{"b":4,"e":1}]}
	});
	group.templates.push({
		name: 'Basketane',
		data: {"a":[{"x":8.0624,"y":-6.6984,"z":0.0009},{"x":-10.9369,"y":7.243,"z":0.0009},{"x":6.1745,"y":-24.4805,"z":0.0007},{"x":21.1864,"y":7.5359,"z":0.0002},{"x":4.6483,"y":26.1053,"z":0.0005},{"x":-21.1864,"y":5.6242,"z":-0.0003},{"x":-4.1138,"y":-26.1053,"z":-0.0005},{"x":10.9373,"y":5.9171,"z":-0.001},{"x":-5.8568,"y":24.4464,"z":-0.0007},{"x":-7.126,"y":-9.0969,"z":-0.0009}],"b":[{"b":0,"e":3},{"b":0,"e":2},{"b":0,"e":1},{"b":3,"e":7},{"b":3,"e":4},{"b":7,"e":8},{"b":7,"e":9},{"b":8,"e":4},{"b":8,"e":5},{"b":4,"e":1},{"b":1,"e":5},{"b":5,"e":9},{"b":9,"e":6},{"b":6,"e":2}]}
	});
	group.templates.push({
		name: 'Bishomotwistane',
		data: {"a":[{"x":-9.3245,"y":9.3434,"z":0.0012},{"x":-3.4592,"y":27.6792,"z":0.0006},{"x":-27.685,"y":3.7727,"z":0.0006},{"x":9.1603,"y":-9.3884,"z":0.0012},{"x":3.7793,"y":27.6792,"z":-0.0006},{"x":-27.6729,"y":-3.3575,"z":-0.0006},{"x":27.5776,"y":-3.773,"z":0.0006},{"x":3.3516,"y":-27.6792,"z":0.0006},{"x":9.4006,"y":9.313,"z":-0.0012},{"x":-9.3316,"y":-9.1718,"z":-0.0012},{"x":27.6851,"y":3.4533,"z":-0.0006},{"x":-3.7669,"y":-27.5837,"z":-0.0006}],"b":[{"b":0,"e":3},{"b":0,"e":1},{"b":3,"e":7},{"b":9,"e":8},{"b":9,"e":11},{"b":8,"e":4},{"b":1,"e":4},{"b":7,"e":11},{"b":0,"e":2},{"b":2,"e":5},{"b":5,"e":9},{"b":8,"e":10},{"b":10,"e":6},{"b":6,"e":3}]}
	});
	group.templates.push({
		name: 'Cuneane',
		data: {"a":[{"x":1.9228,"y":16.1562,"z":0.0003},{"x":-17.4892,"y":4.2593,"z":0.0007},{"x":21.6967,"y":1.7764,"z":0.0004},{"x":-1.9533,"y":6.9712,"z":-0.0008},{"x":-21.6967,"y":-5.7118,"z":-0.0004},{"x":-10.3535,"y":-14.8421,"z":0.0004},{"x":10.3842,"y":-16.1562,"z":0.0002},{"x":17.4892,"y":-8.1944,"z":-0.0007}],"b":[{"b":0,"e":3},{"b":0,"e":1},{"b":0,"e":2},{"b":3,"e":4},{"b":3,"e":7},{"b":1,"e":4},{"b":1,"e":5},{"b":2,"e":7},{"b":2,"e":6},{"b":4,"e":5},{"b":7,"e":6},{"b":5,"e":6}]}
	});
	group.templates.push({
		name: 'Diademan',
		data: {"a":[{"x":-13.929,"y":-20.6479,"z":-0.0001},{"x":-14.1084,"y":-8.6671,"z":0.0009},{"x":-23.7135,"y":3.8281,"z":0},{"x":7.2834,"y":-23.6595,"z":-0.0005},{"x":8.8036,"y":0.6176,"z":0.0009},{"x":-10.952,"y":21.9588,"z":-0.0002},{"x":22.0579,"y":-2.6695,"z":-0.0008},{"x":23.7134,"y":-14.0348,"z":0.0002},{"x":8.6453,"y":23.6595,"z":0.0004},{"x":13.6064,"y":18.472,"z":-0.0007}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":2},{"b":1,"e":4},{"b":2,"e":5},{"b":3,"e":7},{"b":3,"e":6},{"b":4,"e":7},{"b":4,"e":8},{"b":5,"e":8},{"b":5,"e":9},{"b":7,"e":6},{"b":6,"e":9},{"b":8,"e":9}]}
	});
	group.templates.push({
		name: 'Diamantane',
		data: {"a":[{"x":-14.141,"y":21.12,"z":0},{"x":-29.3361,"y":18.0407,"z":0.0006},{"x":10.8073,"y":19.3824,"z":0.0006},{"x":-10.7711,"y":6.3888,"z":-0.0011},{"x":-27.8889,"y":-9.1493,"z":0.001},{"x":25.7558,"y":25.458,"z":0.0001},{"x":10.7709,"y":-6.3887,"z":0.0011},{"x":-10.8074,"y":-19.3824,"z":-0.0006},{"x":2.5813,"y":11.5032,"z":-0.0017},{"x":-25.7559,"y":-25.458,"z":-0.0001},{"x":-2.5814,"y":-11.5031,"z":0.0017},{"x":27.8887,"y":9.1493,"z":-0.001},{"x":14.1409,"y":-21.12,"z":-0},{"x":29.3361,"y":-18.0406,"z":-0.0006}],"b":[{"b":0,"e":3},{"b":0,"e":2},{"b":0,"e":1},{"b":3,"e":7},{"b":3,"e":8},{"b":2,"e":6},{"b":2,"e":5},{"b":7,"e":12},{"b":7,"e":9},{"b":6,"e":12},{"b":6,"e":10},{"b":12,"e":13},{"b":4,"e":1},{"b":4,"e":9},{"b":4,"e":10},{"b":11,"e":8},{"b":11,"e":5},{"b":11,"e":13}]}
	});
	group.templates.push({
		name: 'Dihomocubane',
		data: {"a":[{"x":-1.8424,"y":-19.703,"z":-0.0007},{"x":-16.4495,"y":-15.2664,"z":0.0004},{"x":19.0463,"y":-14.4468,"z":0.0001},{"x":-4.0421,"y":5.4673,"z":-0.0011},{"x":4.0428,"y":-5.4672,"z":0.0011},{"x":-29.925,"y":-0.6907,"z":0.0003},{"x":29.9251,"y":0.6911,"z":-0.0003},{"x":-19.0462,"y":14.4468,"z":-0.0001},{"x":16.4496,"y":15.2664,"z":-0.0004},{"x":1.8432,"y":19.703,"z":0.0007}],"b":[{"b":0,"e":3},{"b":0,"e":1},{"b":0,"e":2},{"b":3,"e":7},{"b":3,"e":8},{"b":4,"e":9},{"b":4,"e":1},{"b":4,"e":2},{"b":9,"e":7},{"b":9,"e":8},{"b":1,"e":5},{"b":2,"e":6},{"b":7,"e":5},{"b":8,"e":6}]}
	});
	group.templates.push({
		name: 'Homoadamantane',
		data: {"a":[{"x":-18.7389,"y":6.0639,"z":-0.0008},{"x":3.5456,"y":9.9613,"z":-0.0015},{"x":-25.4634,"y":21.2769,"z":0.0001},{"x":-23.4106,"y":-20.1097,"z":-0.0006},{"x":21.6364,"y":2.2969,"z":-0.0006},{"x":-9.571,"y":14.4702,"z":0.0011},{"x":-4.1032,"y":-23.0779,"z":0.0003},{"x":25.4634,"y":17.5276,"z":0.0002},{"x":19.5509,"y":-21.9076,"z":-0.0002},{"x":11.2348,"y":23.0779,"z":0.001},{"x":-9.4581,"y":-10.5918,"z":0.0014}],"b":[{"b":0,"e":3},{"b":0,"e":1},{"b":0,"e":2},{"b":6,"e":3},{"b":6,"e":8},{"b":6,"e":10},{"b":4,"e":1},{"b":4,"e":8},{"b":4,"e":7},{"b":5,"e":2},{"b":5,"e":10},{"b":5,"e":9},{"b":7,"e":9}]}
	});
	group.templates.push({
		name: 'Homocubane',
		data: {"a":[{"x":6.7729,"y":18.8807,"z":0.0007},{"x":7.3705,"y":-7.6566,"z":0.001},{"x":17.1692,"y":14.1707,"z":-0.0004},{"x":-18.1844,"y":14.3742,"z":0.0002},{"x":-16.6906,"y":-8.9747,"z":0.0006},{"x":18.1844,"y":-12.5556,"z":-0.0001},{"x":-7.3703,"y":9.4751,"z":-0.001},{"x":-15.1701,"y":-18.8807,"z":-0.0001},{"x":-3.1609,"y":-15.1039,"z":-0.0008}],"b":[{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":1},{"b":2,"e":6},{"b":2,"e":5},{"b":3,"e":6},{"b":3,"e":4},{"b":1,"e":5},{"b":1,"e":4},{"b":6,"e":8},{"b":5,"e":8},{"b":4,"e":7},{"b":8,"e":7}]}
	});
	group.templates.push({
		name: 'Pagodane',
		data: {"a":[{"x":-14.2104,"y":6.7147,"z":0.0011},{"x":-20.5671,"y":-2.7196,"z":-0.0008},{"x":20.5671,"y":2.7185,"z":0.0008},{"x":-21.1215,"y":-15.4349,"z":0.0015},{"x":-17.4963,"y":31.478,"z":0.0009},{"x":-28.3797,"y":-26.2067,"z":-0.0006},{"x":-24.7543,"y":20.706,"z":-0.0012},{"x":14.2099,"y":-6.7158,"z":-0.0011},{"x":28.3797,"y":26.2067,"z":0.0006},{"x":24.7543,"y":-20.706,"z":0.0012},{"x":-33.3155,"y":-26.6568,"z":0.0006},{"x":0.1614,"y":-37.1774,"z":0.0016},{"x":6.6932,"y":47.3504,"z":0.0004},{"x":-28.6453,"y":33.7758,"z":-0.0002},{"x":-6.6932,"y":-47.3504,"z":-0.0004},{"x":-0.1614,"y":37.1774,"z":-0.0016},{"x":17.4963,"y":-31.478,"z":-0.0009},{"x":21.1215,"y":15.4349,"z":-0.0015},{"x":33.3155,"y":26.6568,"z":-0.0006},{"x":28.6453,"y":-33.7758,"z":0.0002}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":4},{"b":1,"e":7},{"b":1,"e":5},{"b":1,"e":6},{"b":2,"e":7},{"b":2,"e":9},{"b":2,"e":8},{"b":7,"e":16},{"b":7,"e":17},{"b":3,"e":11},{"b":3,"e":10},{"b":4,"e":12},{"b":4,"e":13},{"b":5,"e":14},{"b":5,"e":10},{"b":6,"e":15},{"b":6,"e":13},{"b":9,"e":11},{"b":9,"e":19},{"b":8,"e":12},{"b":8,"e":18},{"b":16,"e":14},{"b":16,"e":19},{"b":17,"e":15},{"b":17,"e":18},{"b":11,"e":14},{"b":12,"e":15}]}
	});
	group.templates.push({
		name: 'Peristylane',
		data: {"a":[{"x":-15.3409,"y":-17.2723,"z":-0.0002},{"x":4.8361,"y":-19.4524,"z":-0.0006},{"x":-13.4583,"y":-10.0681,"z":0.0008},{"x":-29.1197,"y":-8.9382,"z":-0.0008},{"x":7.9832,"y":-12.9467,"z":-0.0016},{"x":19.1897,"y":-13.5953,"z":0.0001},{"x":7.8828,"y":-7.7953,"z":0.001},{"x":-25.658,"y":4.3094,"z":0.0011},{"x":-13.5287,"y":-2.0397,"z":-0.0017},{"x":-34.3758,"y":8.6531,"z":-0},{"x":25.8177,"y":2.1503,"z":-0.0012},{"x":34.3758,"y":-2.1764,"z":-0.0001},{"x":13.585,"y":8.4881,"z":0.0015},{"x":-7.912,"y":19.4523,"z":0.0014},{"x":29.2903,"y":15.4332,"z":0.0007}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":5},{"b":1,"e":4},{"b":2,"e":6},{"b":2,"e":7},{"b":5,"e":6},{"b":5,"e":11},{"b":6,"e":12},{"b":3,"e":8},{"b":3,"e":9},{"b":4,"e":8},{"b":4,"e":10},{"b":7,"e":9},{"b":7,"e":13},{"b":11,"e":10},{"b":11,"e":14},{"b":12,"e":13},{"b":12,"e":14}]}
	});
	group.templates.push({
		name: 'Porphine',
		data: {"a":[{"x":40.7025,"y":17.8205},{"x":20.9488,"y":20.9488,"l":"N"},{"x":49.7832,"y":-0},{"x":49.7817,"y":35.6396},{"x":17.8205,"y":40.7024},{"x":40.7025,"y":-17.8205},{"x":35.6396,"y":49.7817},{"x":0,"y":49.7832},{"x":49.7817,"y":-35.6396},{"x":20.9487,"y":-20.9487,"l":"N"},{"x":-17.8205,"y":40.7025},{"x":35.6396,"y":-49.7818},{"x":17.8205,"y":-40.7025},{"x":-35.6396,"y":49.7818},{"x":-20.9487,"y":20.9488,"l":"N"},{"x":-0,"y":-49.7832},{"x":-49.7817,"y":35.6396},{"x":-40.7025,"y":17.8205},{"x":-17.8205,"y":-40.7025},{"x":-49.7832,"y":0},{"x":-35.6396,"y":-49.7817},{"x":-20.9488,"y":-20.9487,"l":"N"},{"x":-40.7024,"y":-17.8205},{"x":-49.7818,"y":-35.6396}],"b":[{"b":0,"e":2},{"b":2,"e":5,"o":2},{"b":5,"e":8},{"b":8,"e":11,"o":2},{"b":5,"e":9},{"b":9,"e":12},{"b":12,"e":11},{"b":12,"e":15,"o":2},{"b":0,"e":1,"o":2},{"b":1,"e":4},{"b":4,"e":6},{"b":6,"e":3,"o":2},{"b":3,"e":0},{"b":4,"e":7,"o":2},{"b":7,"e":10},{"b":10,"e":13,"o":2},{"b":13,"e":16},{"b":16,"e":17,"o":2},{"b":17,"e":19},{"b":19,"e":22,"o":2},{"b":22,"e":23},{"b":23,"e":20,"o":2},{"b":20,"e":18},{"b":18,"e":15},{"b":18,"e":21,"o":2},{"b":21,"e":22},{"b":17,"e":14},{"b":14,"e":10}]}
	});
	group.templates.push({
		name: 'Propellaprismane',
		data: {"a":[{"x":15.8061,"y":23.5917,"z":0.0008},{"x":26.2297,"y":29.8832,"z":0.0014},{"x":23.1528,"y":15.0751,"z":-0.001},{"x":-23.3446,"y":21.8447,"z":0.0005},{"x":15.998,"y":-13.3281,"z":0.0013},{"x":32.9326,"y":10.6278,"z":0.0022},{"x":-15.998,"y":13.3281,"z":-0.0013},{"x":23.3446,"y":-21.8447,"z":-0.0005},{"x":38.3971,"y":15.7753,"z":-0.0015},{"x":-23.1528,"y":-15.0751,"z":0.001},{"x":-38.6203,"y":26.9893,"z":0.0009},{"x":26.452,"y":-12.882,"z":0.002},{"x":-26.452,"y":12.882,"z":-0.002},{"x":-15.8061,"y":-23.5917,"z":-0.0008},{"x":38.6192,"y":-26.9897,"z":-0.0009},{"x":48.1469,"y":-7.0099,"z":-0.0015},{"x":-38.3981,"y":-15.7758,"z":0.0015},{"x":-48.1469,"y":7.0099,"z":0.0015},{"x":-32.9318,"y":-10.628,"z":-0.0022},{"x":-26.2297,"y":-29.8832,"z":-0.0014}],"b":[{"b":0,"e":2},{"b":0,"e":3},{"b":0,"e":4},{"b":0,"e":1},{"b":4,"e":7},{"b":4,"e":9},{"b":4,"e":11},{"b":7,"e":13},{"b":7,"e":14},{"b":7,"e":2},{"b":2,"e":6},{"b":2,"e":8},{"b":3,"e":6},{"b":3,"e":10},{"b":3,"e":9},{"b":9,"e":13},{"b":9,"e":16},{"b":13,"e":6},{"b":13,"e":19},{"b":6,"e":12},{"b":14,"e":15},{"b":15,"e":8},{"b":11,"e":5},{"b":5,"e":1},{"b":10,"e":17},{"b":17,"e":16},{"b":12,"e":18},{"b":18,"e":19}]}
	});
	group.templates.push({
		name: 'Pyramidane',
		data: {"a":[{"x":-17.2378,"y":6.685,"z":0.0002},{"x":-4.7779,"y":2.0713,"z":-0.0009},{"x":1.0091,"y":-10.8859,"z":0.0002},{"x":4.7776,"y":10.8859,"z":0.0008},{"x":17.2379,"y":6.2731,"z":-0.0003}],"b":[{"b":0,"e":3},{"b":3,"e":4},{"b":4,"e":1},{"b":1,"e":0},{"b":0,"e":2},{"b":2,"e":1},{"b":4,"e":2},{"b":3,"e":2}]}
	});
	group.templates.push({
		name: 'Secocubane',
		data: {"a":[{"x":-12.7876,"y":0.469,"z":0.0009},{"x":-17.3436,"y":-13.3054,"z":0.0001},{"x":-3.3968,"y":18.2664,"z":0.0006},{"x":1.8735,"y":-18.2664,"z":-0.0005},{"x":-18.1791,"y":9.8903,"z":-0.0003},{"x":15.8203,"y":13.3053,"z":-0},{"x":18.1791,"y":-7.5251,"z":-0.0001},{"x":2.5011,"y":4.5517,"z":-0.001}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":4},{"b":1,"e":3},{"b":3,"e":6},{"b":3,"e":7},{"b":6,"e":5},{"b":2,"e":4},{"b":2,"e":5},{"b":4,"e":7},{"b":7,"e":5}]}
	});
	group.templates.push({
		name: 'Snoutane',
		data: {"a":[{"x":-6.3364,"y":20.3269,"z":-0.0001},{"x":7.6179,"y":19.8849,"z":0.0003},{"x":-8.926,"y":7.7702,"z":-0.0008},{"x":-20.0203,"y":9.1351,"z":0.0002},{"x":8.926,"y":8.2183,"z":0.001},{"x":20.0203,"y":6.8534,"z":0},{"x":8.4811,"y":-3.8285,"z":-0.0007},{"x":-9.6143,"y":-1.6023,"z":0.001},{"x":3.4219,"y":-20.3269,"z":-0.0003},{"x":-6.3552,"y":-19.124,"z":0.0006}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":5},{"b":1,"e":4},{"b":2,"e":3},{"b":2,"e":6},{"b":3,"e":7},{"b":5,"e":4},{"b":5,"e":6},{"b":4,"e":7},{"b":6,"e":8},{"b":7,"e":9},{"b":8,"e":9}]}
	});
	group.templates.push({
		name: 'Tetraasterane',
		data: {"a":[{"x":7.9814,"y":-4.7005,"z":-0.0012},{"x":4.5426,"y":16.8926,"z":-0.0011},{"x":7.4295,"y":-23.9433,"z":-0.0007},{"x":16.8749,"y":22.9377,"z":0.0001},{"x":-19.7619,"y":17.8982,"z":-0.0005},{"x":19.7619,"y":-17.8982,"z":0.0005},{"x":-16.8749,"y":-22.9377,"z":-0.0001},{"x":24.425,"y":3.3596,"z":0.0004},{"x":-7.4295,"y":23.9433,"z":0.0007},{"x":-24.425,"y":-3.3596,"z":-0.0004},{"x":-4.5426,"y":-16.8926,"z":0.0011},{"x":-7.9814,"y":4.7005,"z":0.0012}],"b":[{"b":0,"e":2},{"b":0,"e":1},{"b":2,"e":6},{"b":2,"e":5},{"b":1,"e":4},{"b":1,"e":3},{"b":6,"e":9},{"b":6,"e":10},{"b":4,"e":9},{"b":4,"e":8},{"b":7,"e":5},{"b":7,"e":3},{"b":5,"e":10},{"b":3,"e":8},{"b":10,"e":11},{"b":8,"e":11}]}
	});
	group.templates.push({
		name: 'Triptycene',
		data: {"a":[{"x":-1.8416,"y":33.5953},{"x":-22.0802,"y":39.915},{"x":15.2565,"y":41.2332},{"x":-1.8416,"y":7.8124},{"x":-11.7283,"y":24.3677},{"x":-40.1864,"y":47.0877},{"x":25.5308,"y":24.329},{"x":29.5243,"y":50.9648},{"x":9.2469,"y":-6.8431},{"x":-10.1774,"y":-11.9997},{"x":-32.4321,"y":21.9251},{"x":9.2469,"y":15.1014},{"x":-57.6334,"y":41.2332},{"x":45.3042,"y":24.329},{"x":46.9713,"y":50.9648},{"x":14.0546,"y":-29.4079},{"x":-6.3003,"y":-36.1929},{"x":-47.9406,"y":27.7409},{"x":57.6334,"y":35.4563},{"x":8.045,"y":-50.9648}],"b":[{"b":0,"e":1},{"b":1,"e":4,"o":2},{"b":4,"e":11},{"b":0,"e":3},{"b":3,"e":8,"o":2},{"b":11,"e":8},{"b":11,"e":6},{"b":0,"e":2},{"b":6,"e":2,"o":2},{"b":2,"e":7},{"b":7,"e":14,"o":2},{"b":14,"e":18},{"b":18,"e":13,"o":2},{"b":6,"e":13},{"b":4,"e":10},{"b":10,"e":17,"o":2},{"b":17,"e":12},{"b":12,"e":5,"o":2},{"b":1,"e":5},{"b":3,"e":9},{"b":9,"e":16,"o":2},{"b":16,"e":19},{"b":19,"e":15,"o":2},{"b":8,"e":15}]}
	});
	group.templates.push({
		name: 'Twistane',
		data: {"a":[{"x":-9.5219,"y":-26.0012},{"x":7.2133,"y":-26.1571},{"x":-14.5434,"y":-10.0357},{"x":12.5334,"y":-10.2879},{"x":-28.325,"y":0.1651},{"x":13.5307,"y":10.0357},{"x":28.325,"y":-1.1706},{"x":-13.5501,"y":10.2879},{"x":8.5073,"y":26.0012},{"x":-8.228,"y":26.1571}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":3,"e":6},{"b":6,"e":5},{"b":5,"e":8},{"b":8,"e":9},{"b":9,"e":7},{"b":7,"e":3},{"b":7,"e":4},{"b":4,"e":2},{"b":2,"e":0},{"b":2,"e":5}]}
	});
	d.push(group);

	group = {name:'Platonic Solids', templates:[]};
	group.templates.push({
		name: 'Cubane',
		data: {"a":[{"x":6.8116,"y":7.3797,"z":-0.001},{"x":15.7836,"y":14.3051,"z":0.0002},{"x":-16.3582,"y":9.4716,"z":-0.0005},{"x":7.3866,"y":-16.3971,"z":-0.0006},{"x":-7.3865,"y":16.3971,"z":0.0006},{"x":16.3582,"y":-9.4716,"z":0.0005},{"x":-15.7838,"y":-14.3053,"z":-0.0002},{"x":-6.8118,"y":-7.38,"z":0.001}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":4,"e":2},{"b":2,"e":0},{"b":0,"e":3},{"b":2,"e":6},{"b":4,"e":7},{"b":1,"e":5},{"b":6,"e":3},{"b":3,"e":5},{"b":5,"e":7},{"b":7,"e":6}]}
	});
	group.templates.push({
		name: 'Dodecahedrane',
		data: {"a":[{"x":5.5634,"y":23.4684,"z":-0.0013},{"x":16.1591,"y":0.9427,"z":-0.0016},{"x":-19.3759,"y":19.7391,"z":-0.0011},{"x":15.6559,"y":31.7957,"z":-0.0002},{"x":-2.2312,"y":-16.7085,"z":-0.0016},{"x":32.801,"y":-4.6523,"z":-0.0007},{"x":-24.6961,"y":25.7614,"z":0.0001},{"x":-24.1925,"y":-5.0917,"z":-0.0013},{"x":32.4899,"y":14.4157,"z":0.0002},{"x":-3.0451,"y":33.2128,"z":0.0006},{"x":3.0451,"y":-33.2128,"z":-0.0006},{"x":24.6961,"y":-25.7618,"z":-0.0001},{"x":-32.801,"y":4.6523,"z":0.0007},{"x":-32.4904,"y":-14.4156,"z":-0.0002},{"x":24.1925,"y":5.0917,"z":0.0013},{"x":2.2307,"y":16.7087,"z":0.0016},{"x":-15.6564,"y":-31.7956,"z":0.0002},{"x":19.3759,"y":-19.7394,"z":0.0011},{"x":-16.1591,"y":-0.9427,"z":0.0016},{"x":-5.5634,"y":-23.4684,"z":0.0013}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":0,"e":3},{"b":1,"e":4},{"b":1,"e":5},{"b":2,"e":7},{"b":2,"e":6},{"b":3,"e":8},{"b":3,"e":9},{"b":4,"e":7},{"b":4,"e":10},{"b":5,"e":8},{"b":5,"e":11},{"b":7,"e":13},{"b":6,"e":9},{"b":6,"e":12},{"b":8,"e":14},{"b":9,"e":15},{"b":10,"e":11},{"b":10,"e":16},{"b":11,"e":17},{"b":13,"e":12},{"b":13,"e":16},{"b":12,"e":18},{"b":14,"e":15},{"b":14,"e":17},{"b":15,"e":18},{"b":16,"e":19},{"b":17,"e":19},{"b":18,"e":19}]}
	});
	group.templates.push({
		name: 'Icosahedrane',
		data: {"a":[{"x":-2.1935,"y":16.5915,"z":0.0009},{"x":19.041,"y":14.7651,"z":0.0002},{"x":-2.7246,"y":23.1426,"z":-0.0004},{"x":-12.2778,"y":-6.837,"z":0.001},{"x":13.1368,"y":-3.7632,"z":0.001},{"x":-22.0806,"y":9.7916,"z":0.0002},{"x":12.2777,"y":6.837,"z":-0.001},{"x":22.0806,"y":-9.7917,"z":-0.0002},{"x":-13.1371,"y":3.7632,"z":-0.001},{"x":2.7243,"y":-23.1426,"z":0.0004},{"x":-19.0411,"y":-14.7652,"z":-0.0002},{"x":2.1933,"y":-16.5915,"z":-0.0009}],"b":[{"b":0,"e":4},{"b":4,"e":7},{"b":7,"e":6},{"b":6,"e":2},{"b":2,"e":0},{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":6},{"b":1,"e":7},{"b":1,"e":4},{"b":11,"e":8},{"b":8,"e":5},{"b":5,"e":3},{"b":3,"e":9},{"b":9,"e":11},{"b":11,"e":10},{"b":10,"e":9},{"b":10,"e":8},{"b":10,"e":5},{"b":10,"e":3},{"b":0,"e":3,"o":2},{"b":0,"e":5},{"b":5,"e":2},{"b":2,"e":8},{"b":8,"e":6},{"b":6,"e":11},{"b":11,"e":7},{"b":7,"e":9},{"b":9,"e":4},{"b":4,"e":3}]}
	});
	group.templates.push({
		name: 'Octahedrane',
		data: {"a":[{"x":17.605,"y":1.6441,"z":0.0003},{"x":-0.3217,"y":18.0965,"z":-0.0002},{"x":0.3216,"y":-18.0965,"z":0.0002},{"x":5.9408,"y":-3.8922,"z":-0.0009},{"x":-5.941,"y":3.8922,"z":0.0009},{"x":-17.605,"y":-1.6443,"z":-0.0003}],"b":[{"b":0,"e":1},{"b":1,"e":5},{"b":5,"e":2},{"b":2,"e":0},{"b":2,"e":4},{"b":1,"e":4},{"b":0,"e":3},{"b":2,"e":3},{"b":1,"e":3},{"b":5,"e":3},{"b":5,"e":4},{"b":0,"e":4}]}
	});
	group.templates.push({
		name: 'Tetrahedrane',
		data: {"a":[{"x":-10.8801,"y":10.377,"z":-0.0003},{"x":9.7747,"y":11.0081,"z":0.0004},{"x":-2.0447,"y":-11.0081,"z":0.0002},{"x":10.8801,"y":0.3176,"z":-0.0007}],"b":[{"b":0,"e":1},{"b":0,"e":3},{"b":3,"e":1},{"b":1,"e":2},{"b":2,"e":3},{"b":2,"e":0}]}
	});
	d.push(group);

	group = {name:'Ring Conformers', templates:[]};
	group.templates.push({
		name: '<b>4</b> Cyclobutane',
		data: {"a":[{"x":188,"y":262},{"x":198,"y":260},{"x":208,"y":272},{"x":220,"y":256}],"b":[{"b":0,"e":2},{"b":1,"e":0},{"b":2,"e":3},{"b":3,"e":1}]}
	});
	group.templates.push({
		name: '<b>5</b> Cyclopentane <i>Parallel Pentagon</i>',
		data: {"a":[{"x":204,"y":249},{"x":186.68,"y":259},{"x":221.32,"y":259},{"x":186.68,"y":279},{"x":221.32,"y":279}],"b":[{"b":0,"e":1},{"b":0,"e":2},{"b":1,"e":3},{"b":2,"e":4},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: '<b>5</b> Cyclopentane',
		data: {"a":[{"x":187.5,"y":256},{"x":182.5,"y":272},{"x":214.5,"y":259},{"x":202.5,"y":265},{"x":225.5,"y":263}],"b":[{"b":0,"e":1},{"b":2,"e":0},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: '<b>6</b> Cyclohexane <i>Boat</i>',
		data: {"a":[{"x":185.5,"y":254.5},{"x":201.5,"y":265.5},{"x":189.5,"y":273.5},{"x":222.5,"y":264.5},{"x":208.5,"y":273.5},{"x":220.5,"y":254.5}],"b":[{"b":0,"e":2},{"b":1,"e":0},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":5},{"b":5,"e":3}]}
	});
	group.templates.push({
		name: '<b>6</b> Cyclohexane <i>Chair 1</i>',
		data: {"a":[{"x":179.754,"y":255.356},{"x":198.95,"y":260.414},{"x":189.736,"y":272.644},{"x":218.266,"y":255.356},{"x":209.05,"y":267.584},{"x":228.246,"y":272.644}],"b":[{"b":0,"e":2},{"b":1,"e":0},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":5},{"b":5,"e":3}]}
	});
	group.templates.push({
		name: '<b>6</b> Cyclohexane <i>Chair 2</i>',
		data: {"a":[{"x":189.736,"y":255.356},{"x":209.05,"y":260.84},{"x":179.752,"y":272.644},{"x":228.248,"y":255.356},{"x":198.95,"y":267.158},{"x":218.262,"y":272.644}],"b":[{"b":0,"e":2},{"b":1,"e":0},{"b":2,"e":4},{"b":3,"e":1},{"b":4,"e":5},{"b":5,"e":3}]}
	});
	group.templates.push({
		name: '<b>6</b> Cyclohexane <i>Twist Boat</i>',
		data: {"a":[{"x":183.5,"y":258},{"x":196.5,"y":267},{"x":190.5,"y":274},{"x":219.5,"y":268},{"x":208.5,"y":265},{"x":224.5,"y":254}],"b":[{"b":0,"e":1},{"b":2,"e":0},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":5,"e":4}]}
	});
	group.templates.push({
		name: '<b>7</b> Cycloheptane',
		data: {"a":[{"x":178,"y":254.5},{"x":177,"y":275.5},{"x":196,"y":256.5},{"x":201,"y":284.5},{"x":218,"y":243.5},{"x":217,"y":261.5},{"x":231,"y":257.5}],"b":[{"b":0,"e":1},{"b":2,"e":0},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":6}]}
	});
	group.templates.push({
		name: '<b>8</b> Cyclooctane',
		data: {"a":[{"x":188.5,"y":239},{"x":171.5,"y":260},{"x":205.5,"y":248},{"x":180.5,"y":274},{"x":229.5,"y":245},{"x":201.5,"y":289},{"x":236.5,"y":270},{"x":223.5,"y":273}],"b":[{"b":0,"e":1},{"b":2,"e":0},{"b":1,"e":3},{"b":4,"e":2},{"b":3,"e":5},{"b":6,"e":4},{"b":5,"e":7},{"b":7,"e":6}]}
	});
	d.push(group);

	group = {name:'Stereocenters and Geometries', templates:[]};
	group.templates.push({
		name: 'Bent Away',
		data: {"a":[{"x":195.34,"y":279},{"x":212.66,"y":269.002},{"x":212.66,"y":249}],"b":[{"b":0,"e":1},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Bent Towards',
		data: {"a":[{"x":195.338,"y":279},{"x":212.66,"y":269.002},{"x":212.66,"y":249}],"b":[{"b":0,"e":1},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Generic Diastereocenter',
		data: {"a":[{"x":181.68,"y":268.998},{"x":198.998,"y":258.998},{"x":216.32,"y":268.998},{"x":209,"y":241.68},{"x":189,"y":241.68},{"x":206.322,"y":286.32},{"x":226.32,"y":286.32}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":4},{"b":1,"e":3},{"b":2,"e":5},{"b":2,"e":6}]}
	});
	group.templates.push({
		name: 'Generic Stereocenter',
		data: {"a":[{"x":190.34,"y":277.66},{"x":207.662,"y":267.662},{"x":217.66,"y":250.34},{"x":197.66,"y":250.34}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2}]}
	});
	group.templates.push({
		name: 'Heptavalent 1',
		data: {"a":[{"x":185.34,"y":263.998},{"x":205.338,"y":263.998},{"x":205.338,"y":284},{"x":222.66,"y":254},{"x":197.34,"y":252.68},{"x":199.338,"y":276.32},{"x":205.338,"y":244},{"x":222.66,"y":274}],"b":[{"b":0,"e":1},{"b":1,"e":6},{"b":1,"e":2},{"b":1,"e":3},{"b":1,"e":7},{"b":1,"e":4},{"b":1,"e":5}]}
	});
	group.templates.push({
		name: 'Heptavalent 2',
		data: {"a":[{"x":186.68,"y":252.66},{"x":204.002,"y":262.658},{"x":221.32,"y":252.66},{"x":186.68,"y":272.658},{"x":194.002,"y":245.34},{"x":221.32,"y":272.658},{"x":214,"y":245.34},{"x":204.002,"y":282.66}],"b":[{"b":1,"e":0},{"b":1,"e":2},{"b":1,"e":5},{"b":1,"e":3},{"b":1,"e":4},{"b":1,"e":6},{"b":1,"e":7}]}
	});
	group.templates.push({
		name: 'Hexavalent',
		data: {"a":[{"x":203.998,"y":263.998},{"x":186.68,"y":274},{"x":221.32,"y":274},{"x":214,"y":281.32},{"x":194,"y":246.68},{"x":214,"y":246.68},{"x":194,"y":281.32}],"b":[{"b":0,"e":4},{"b":0,"e":5},{"b":0,"e":1},{"b":0,"e":6},{"b":0,"e":2},{"b":0,"e":3}]}
	});
	group.templates.push({
		name: 'Incomplete Diastereocenter 1',
		data: {"a":[{"x":186.68,"y":269},{"x":203.998,"y":259},{"x":203.998,"y":239},{"x":221.32,"y":269},{"x":221.32,"y":289}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: 'Incomplete Diastereocenter 2',
		data: {"a":[{"x":186.68,"y":269.002},{"x":203.998,"y":258.998},{"x":221.32,"y":269.002},{"x":203.998,"y":239.002},{"x":221.32,"y":288.998}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Incomplete Diastereocenter 3',
		data: {"a":[{"x":186.68,"y":269},{"x":203.998,"y":259},{"x":221.32,"y":269},{"x":203.998,"y":239},{"x":221.32,"y":289}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":4}]}
	});
	group.templates.push({
		name: 'Incomplete Diastereocenter 4',
		data: {"a":[{"x":186.68,"y":269},{"x":204.002,"y":259},{"x":204.002,"y":239},{"x":221.32,"y":269},{"x":221.32,"y":289}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":3,"e":4}]}
	});
	group.templates.push({
		name: 'Octahedral',
		data: {"a":[{"x":203.998,"y":244},{"x":203.998,"y":264},{"x":186.68,"y":254},{"x":186.68,"y":274},{"x":203.998,"y":284},{"x":221.32,"y":254},{"x":221.32,"y":274}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":5},{"b":1,"e":3},{"b":1,"e":6},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Octavalent 1',
		data: {"a":[{"x":204,"y":264.002},{"x":194,"y":281.32},{"x":221.322,"y":254},{"x":213.998,"y":246.68},{"x":213.998,"y":281.32},{"x":186.678,"y":254},{"x":186.678,"y":274},{"x":221.322,"y":274},{"x":194,"y":246.68}],"b":[{"b":0,"e":5},{"b":0,"e":6},{"b":0,"e":2},{"b":0,"e":7},{"b":0,"e":8},{"b":0,"e":3},{"b":0,"e":1},{"b":0,"e":4}]}
	});
	group.templates.push({
		name: 'Octavalent 2',
		data: {"a":[{"x":183.998,"y":264},{"x":204,"y":264},{"x":194.002,"y":246.682},{"x":221.32,"y":274},{"x":213.998,"y":281.318},{"x":186.68,"y":274},{"x":213.998,"y":246.682},{"x":224.002,"y":264},{"x":194.002,"y":281.318}],"b":[{"b":0,"e":1},{"b":1,"e":7},{"b":1,"e":2},{"b":1,"e":6},{"b":1,"e":5},{"b":1,"e":3},{"b":1,"e":8},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Square Planar',
		data: {"a":[{"x":186.68,"y":254},{"x":203.998,"y":264.002},{"x":186.68,"y":274},{"x":221.32,"y":254},{"x":221.32,"y":274}],"b":[{"b":1,"e":0},{"b":1,"e":2},{"b":1,"e":3},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Square Pyramidal',
		data: {"a":[{"x":204.002,"y":249},{"x":204.002,"y":268.998},{"x":186.68,"y":259},{"x":221.32,"y":259},{"x":221.32,"y":279},{"x":186.68,"y":279}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3},{"b":1,"e":4},{"b":1,"e":5}]}
	});
	group.templates.push({
		name: 'Tetrahedral',
		data: {"a":[{"x":204.002,"y":265.338},{"x":221.32,"y":275.34},{"x":204.002,"y":245.34},{"x":214,"y":282.66},{"x":186.68,"y":275.34}],"b":[{"b":0,"e":2},{"b":0,"e":4},{"b":0,"e":1},{"b":0,"e":3}]}
	});
	group.templates.push({
		name: 'Trigonal Bipyramidal',
		data: {"a":[{"x":185.338,"y":263.998},{"x":205.34,"y":263.998},{"x":205.34,"y":284},{"x":222.662,"y":274},{"x":205.34,"y":244},{"x":222.662,"y":254}],"b":[{"b":0,"e":1},{"b":1,"e":4},{"b":1,"e":2},{"b":1,"e":5},{"b":1,"e":3}]}
	});
	group.templates.push({
		name: 'Trigonal Planar',
		data: {"a":[{"x":185.338,"y":263.998},{"x":205.34,"y":263.998},{"x":222.662,"y":254},{"x":222.662,"y":274}],"b":[{"b":0,"e":1},{"b":1,"e":2},{"b":1,"e":3}]}
	});
	group.templates.push({
		name: 'Trigonal Pyramidal',
		data: {"a":[{"x":186.68,"y":265.34},{"x":204.002,"y":255.34},{"x":214,"y":272.66},{"x":221.32,"y":265.34}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2}]}
	});
	d.push(group);

	group = {name:'Vitamins', templates:[]};
	group.templates.push({
		name: 'Vitamin A',
		data: {"a":[{"x":51.9615,"y":33.6602},{"x":51.9615,"y":13.6602},{"x":69.282,"y":3.6602},{"x":34.641,"y":3.6602},{"x":86.6025,"y":13.6602},{"x":17.3205,"y":13.6602},{"x":103.9231,"y":3.6602,"l":"OH"},{"x":0,"y":3.6602},{"x":-17.3205,"y":13.6602},{"x":-17.3205,"y":33.6602},{"x":-34.641,"y":3.6602},{"x":-51.9615,"y":13.6602},{"x":-69.2821,"y":3.6602},{"x":-86.6025,"y":13.6602},{"x":-69.2821,"y":-16.3398},{"x":-86.6025,"y":33.6602},{"x":-103.9231,"y":3.6602},{"x":-49.2821,"y":-16.3398},{"x":-59.2821,"y":-33.6603},{"x":-86.6025,"y":-26.3398},{"x":-103.9231,"y":-16.3398}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":4},{"b":4,"e":6},{"b":1,"e":3},{"b":3,"e":5,"o":2},{"b":5,"e":7},{"b":7,"e":8,"o":2},{"b":8,"e":9},{"b":8,"e":10},{"b":10,"e":11,"o":2},{"b":11,"e":12},{"b":12,"e":13,"o":2},{"b":13,"e":15},{"b":13,"e":16},{"b":16,"e":20},{"b":20,"e":19},{"b":19,"e":14},{"b":12,"e":14},{"b":14,"e":18},{"b":14,"e":17}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>12</sub> (Cyanocobalamin)',
		data: {"a":[{"c":1,"x":3.3371,"y":-66.8596,"l":"Co"},{"x":3.3371,"y":-101.4081,"l":"CN"},{"x":23.0279,"y":-45.765,"l":"N"},{"x":-11.166,"y":-45.6584,"l":"N"},{"x":19.8359,"y":-89.7705,"l":"N"},{"x":-3.2171,"y":38.9619,"l":"N"},{"x":-14.0155,"y":-84.9408,"l":"N"},{"x":23.0322,"y":-25.5761},{"x":41.9322,"y":-51.4369},{"x":-28.8696,"y":-53.9362},{"x":-11.8939,"y":-26.1046},{"x":39.3607,"y":-86.886},{"x":16.9262,"y":-109.7484},{"x":-14.614,"y":55.3971},{"x":15.9353,"y":44.7225},{"x":-17.558,"y":-104.1851},{"x":-30.3391,"y":-74.1948},{"x":41.9009,"y":-19.2102},{"x":5.5664,"y":-16.0075},{"x":53.7886,"y":-35.3435},{"x":49.8682,"y":-69.8304},{"x":-42.1304,"y":-38.4984},{"x":-42.2629,"y":-57.2596,"l":"H"},{"x":-31.6747,"y":-21.3799},{"x":48.7705,"y":-104.5222},{"x":34.6787,"y":-118.7709},{"x":-1.7374,"y":-116.6962},{"x":-2.5054,"y":71.3148,"l":"N"},{"x":16.3752,"y":64.7177},{"x":33.0317,"y":34.344},{"x":-37.8135,"y":-106.0053},{"x":-45.6892,"y":-87.5572},{"x":-49.3397,"y":-67.9516},{"x":47.9104,"y":-0.1344},{"x":5.3354,"y":3.9912},{"x":62.8086,"y":-17.493},{"x":73.7887,"y":-35.3435},{"x":-62.0654,"y":-40.1103},{"x":-24.2744,"y":-2.7994},{"x":-48.9952,"y":-11.3799},{"x":68.5611,"y":-107.4094},{"x":44.6789,"y":-136.0914},{"x":24.6787,"y":-136.0914},{"x":-4.8522,"y":-136.4521},{"x":-2.5054,"y":127.7894},{"x":33.9115,"y":74.3343},{"x":50.5679,"y":43.9606},{"x":-48.0763,"y":-123.1714},{"x":-62.2078,"y":-76.2816},{"x":-63.5787,"y":-96.4996},{"x":67.3099,"y":4.73},{"x":-73.4289,"y":-23.6522,"l":"CONH2"},{"x":-48.9952,"y":8.6201},{"x":80.9568,"y":-91.7139},{"x":64.6788,"y":-136.0914,"l":"CONH2"},{"x":-21.4629,"y":133.9404,"l":"O"},{"x":-11.6748,"y":118.62},{"x":51.0078,"y":63.9557},{"x":67.6643,"y":33.5821},{"x":-38.0763,"y":-140.4919},{"x":-80.2678,"y":-85.4781,"l":"CONH2"},{"x":81.2223,"y":-9.6382,"l":"CONH2"},{"x":-66.3158,"y":18.6201},{"x":100.9568,"y":-91.7139,"l":"CONH2"},{"x":-40.8672,"y":127.8124},{"x":-31.6748,"y":118.62},{"x":-11.6748,"y":98.62,"l":"O"},{"x":68.5441,"y":73.5724},{"x":-48.0763,"y":-157.8124,"l":"CONH2"},{"x":-83.6363,"y":8.6201,"l":"O"},{"x":-66.3158,"y":38.62,"l":"N"},{"x":-40.8672,"y":147.8124},{"x":-31.6748,"y":98.62,"l":"O"},{"x":-83.6363,"y":48.62},{"x":-58.1877,"y":157.8124,"l":"O"},{"x":-48.9953,"y":88.62,"l":"P"},{"x":-83.6363,"y":68.62},{"x":-38.9953,"y":71.2995,"l":"O"},{"x":-66.3158,"y":78.62,"l":"O"},{"x":-58.9953,"y":105.9405,"l":"O"},{"x":-100.9568,"y":78.62}],"b":[{"b":20,"e":11},{"b":8,"e":20,"o":2},{"b":11,"e":4,"o":2},{"b":11,"e":24},{"b":19,"e":8},{"b":2,"e":8},{"b":4,"e":0,"o":0},{"b":12,"e":4},{"b":24,"e":40},{"b":24,"e":25},{"b":19,"e":36},{"b":17,"e":19},{"b":19,"e":35},{"b":2,"e":0,"o":0},{"b":2,"e":7,"o":2},{"b":3,"e":0},{"b":6,"e":0,"o":0},{"b":25,"e":12},{"b":12,"e":26,"o":2},{"b":40,"e":53},{"b":25,"e":41},{"b":25,"e":42},{"b":17,"e":33},{"b":7,"e":17},{"b":18,"e":7},{"b":3,"e":10},{"b":3,"e":9},{"b":15,"e":6,"o":2},{"b":6,"e":16},{"b":15,"e":26},{"b":26,"e":43},{"b":53,"e":63},{"b":41,"e":54},{"b":33,"e":50},{"b":18,"e":34},{"b":23,"e":10},{"b":9,"e":21},{"b":9,"e":22},{"b":9,"e":16},{"b":30,"e":15},{"b":16,"e":32},{"b":16,"e":31},{"b":50,"e":61},{"b":21,"e":23},{"b":23,"e":39},{"b":23,"e":38},{"b":21,"e":37},{"b":31,"e":30},{"b":30,"e":47},{"b":31,"e":48},{"b":31,"e":49},{"b":39,"e":52},{"b":37,"e":51},{"b":47,"e":59},{"b":49,"e":60},{"b":52,"e":62},{"b":59,"e":68},{"b":62,"e":70},{"b":62,"e":69,"o":2},{"b":70,"e":73},{"b":73,"e":76},{"b":76,"e":80},{"b":76,"e":78},{"b":78,"e":75},{"b":75,"e":72},{"b":75,"e":77,"o":2},{"b":75,"e":79},{"b":72,"e":65},{"b":65,"e":56},{"b":56,"e":66},{"b":56,"e":44},{"b":65,"e":64},{"b":64,"e":55},{"b":44,"e":55},{"b":64,"e":71},{"b":71,"e":74},{"b":44,"e":27},{"b":27,"e":28},{"b":28,"e":14},{"b":14,"e":5},{"b":5,"e":13,"o":2},{"b":13,"e":27},{"b":28,"e":45,"o":2},{"b":45,"e":57},{"b":57,"e":46,"o":2},{"b":46,"e":29},{"b":29,"e":14,"o":2},{"b":46,"e":58},{"b":57,"e":67},{"b":0,"e":5,"o":0},{"b":10,"e":18,"o":2},{"b":0,"e":1}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>1</sub>',
		data: {"a":[{"x":24.1354,"y":-28.8488},{"x":19.9771,"y":-9.2859},{"x":33.3597,"y":5.577},{"c":1,"x":1.7062,"y":-1.1512,"l":"N"},{"x":53.2502,"y":3.4865},{"x":23.3597,"y":22.8975,"l":"S"},{"x":3.7968,"y":18.7393},{"x":-15.6143,"y":-11.1512},{"x":65.0059,"y":19.6668},{"x":-32.9348,"y":-1.1512},{"x":84.8963,"y":17.5762,"l":"OH"},{"x":-32.9348,"y":18.8488},{"x":-50.2553,"y":-11.1512},{"x":-50.2553,"y":28.8488,"l":"N"},{"x":-15.6143,"y":28.8488,"l":"NH2"},{"x":-67.5758,"y":-1.1512,"l":"N"},{"x":-67.5758,"y":18.8488},{"x":-84.8963,"y":28.8488}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":4},{"b":4,"e":8},{"b":8,"e":10},{"b":2,"e":5},{"b":5,"e":6},{"b":6,"e":3,"o":2},{"b":1,"e":3},{"b":3,"e":7},{"b":7,"e":9},{"b":9,"e":11,"o":2},{"b":11,"e":14},{"b":11,"e":13},{"b":13,"e":16,"o":2},{"b":16,"e":17},{"b":16,"e":15},{"b":15,"e":12,"o":2},{"b":9,"e":12}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>3</sub> (Niacin)',
		data: {"a":[{"x":-17.3205,"y":30,"l":"N"},{"x":0,"y":20},{"x":-34.641,"y":20},{"x":0,"y":0},{"x":-34.641,"y":0},{"x":-17.3205,"y":-10},{"x":17.3205,"y":-10},{"x":17.3205,"y":-30,"l":"O"},{"x":34.641,"y":0}],"b":[{"b":0,"e":1,"o":2},{"b":1,"e":3},{"b":3,"e":5,"o":2},{"b":5,"e":4},{"b":4,"e":2,"o":2},{"b":2,"e":0},{"b":3,"e":6},{"b":6,"e":8},{"b":6,"e":7,"o":2}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>5</sub>',
		data: {"a":[{"x":-15.9808,"y":23.6603,"l":"H"},{"x":-25.9808,"y":6.3397},{"x":-8.6603,"y":-3.6603},{"x":-35.9808,"y":23.6603,"l":"OH"},{"x":-43.3013,"y":-3.6603},{"x":-8.6603,"y":-23.6603,"l":"O"},{"x":8.6602,"y":6.3397,"l":"NH"},{"x":-53.3013,"y":-20.9808},{"x":-60.6218,"y":6.3397},{"x":-33.3013,"y":-20.9808},{"x":25.9807,"y":-3.6603},{"x":-77.9423,"y":-3.6603,"l":"OH"},{"x":43.3012,"y":6.3397},{"x":60.6218,"y":-3.6603},{"x":77.9423,"y":6.3397,"l":"OH"},{"x":60.6218,"y":-23.6603,"l":"O"}],"b":[{"b":1,"e":0},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":5,"o":2},{"b":2,"e":6},{"b":6,"e":10},{"b":10,"e":12},{"b":12,"e":13},{"b":13,"e":14},{"b":13,"e":15,"o":2},{"b":1,"e":4},{"b":4,"e":9},{"b":4,"e":7},{"b":4,"e":8},{"b":8,"e":11}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>6</sub>',
		data: {"a":[{"x":-43.3012,"y":-10},{"x":-25.9808,"y":0},{"x":-25.9808,"y":20,"l":"N"},{"x":-8.6602,"y":-10},{"x":-8.6602,"y":30},{"x":8.6602,"y":0},{"x":-8.6602,"y":-30,"l":"OH"},{"x":8.6602,"y":20},{"x":25.9808,"y":-10},{"x":25.9808,"y":30},{"x":43.3012,"y":0,"l":"OH"},{"x":43.3012,"y":20,"l":"OH"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":4},{"b":4,"e":7,"o":2},{"b":7,"e":9},{"b":9,"e":11},{"b":7,"e":5},{"b":5,"e":8},{"b":8,"e":10},{"b":5,"e":3,"o":2},{"b":1,"e":3},{"b":3,"e":6}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>7</sub>',
		data: {"a":[{"x":-65.6493,"y":26.9066,"l":"H"},{"x":-52.2667,"y":12.0436},{"x":-42.2667,"y":29.3641},{"x":-38.8841,"y":-2.8193},{"x":-70.5376,"y":3.9089,"l":"NH"},{"x":-22.7037,"y":25.2059,"l":"S"},{"x":-48.8841,"y":-20.1398,"l":"NH"},{"x":-25.5015,"y":-17.6822,"l":"H"},{"x":-20.6132,"y":5.3155},{"x":-68.447,"y":-15.9815},{"x":-3.2927,"y":-4.6845},{"x":-83.3099,"y":-29.3641,"l":"O"},{"x":14.0278,"y":5.3155},{"x":31.3483,"y":-4.6845},{"x":48.6689,"y":5.3155},{"x":65.9894,"y":-4.6845},{"x":65.9894,"y":-24.6845,"l":"O"},{"x":83.3099,"y":5.3155,"l":"OH"}],"b":[{"b":1,"e":0},{"b":1,"e":2},{"b":2,"e":5},{"b":5,"e":8},{"b":8,"e":10},{"b":10,"e":12},{"b":12,"e":13},{"b":13,"e":14},{"b":14,"e":15},{"b":15,"e":17},{"b":15,"e":16,"o":2},{"b":8,"e":3},{"b":1,"e":3},{"b":3,"e":7},{"b":3,"e":6},{"b":6,"e":9},{"b":9,"e":11,"o":2},{"b":9,"e":4},{"b":1,"e":4}]}
	});
	group.templates.push({
		name: 'Vitamin B<sub>9</sub>',
		data: {"a":[{"x":-147.2244,"y":50,"l":"NH2"},{"x":-129.9039,"y":40},{"x":-129.9039,"y":20,"l":"N"},{"x":-112.5833,"y":50,"l":"N"},{"x":-112.5833,"y":10},{"x":-95.2628,"y":40},{"x":-95.2628,"y":20},{"x":-112.5833,"y":-10,"l":"OH"},{"x":-77.9423,"y":50,"l":"N"},{"x":-77.9423,"y":10,"l":"N"},{"x":-60.6218,"y":40},{"x":-60.6218,"y":20},{"x":-43.3013,"y":10},{"x":-25.9808,"y":20,"l":"NH"},{"x":-8.6603,"y":10},{"x":-8.6603,"y":-10},{"x":8.6602,"y":20},{"x":8.6602,"y":-20},{"x":25.9808,"y":10},{"x":25.9808,"y":-10},{"x":43.3013,"y":-20},{"x":43.3013,"y":-40,"l":"O"},{"x":60.6218,"y":-10,"l":"NH"},{"x":77.9423,"y":-20},{"x":95.2628,"y":-10},{"x":77.9423,"y":-40},{"x":112.5834,"y":-20},{"x":60.6218,"y":-50,"l":"O"},{"x":95.2628,"y":-50,"l":"OH"},{"x":129.9038,"y":-10},{"x":147.2244,"y":-20,"l":"OH"},{"x":129.9038,"y":10,"l":"O"}],"b":[{"b":0,"e":1},{"b":1,"e":2,"o":2},{"b":2,"e":4},{"b":4,"e":7},{"b":4,"e":6,"o":2},{"b":6,"e":9},{"b":9,"e":11,"o":2},{"b":11,"e":12},{"b":12,"e":13},{"b":13,"e":14},{"b":14,"e":15,"o":2},{"b":15,"e":17},{"b":17,"e":19,"o":2},{"b":19,"e":18},{"b":18,"e":16,"o":2},{"b":14,"e":16},{"b":19,"e":20},{"b":20,"e":21,"o":2},{"b":20,"e":22},{"b":22,"e":23},{"b":23,"e":24},{"b":24,"e":26},{"b":26,"e":29},{"b":29,"e":30},{"b":29,"e":31,"o":2},{"b":23,"e":25},{"b":25,"e":28},{"b":25,"e":27,"o":2},{"b":11,"e":10},{"b":10,"e":8,"o":2},{"b":8,"e":5},{"b":6,"e":5},{"b":5,"e":3,"o":2},{"b":1,"e":3}]}
	});
	group.templates.push({
		name: 'Vitamin C',
		data: {"a":[{"x":14.8183,"y":-7.3993,"l":"H"},{"x":-2.5022,"y":2.6007},{"x":-14.2579,"y":18.781,"l":"O"},{"x":-14.2579,"y":-13.5797},{"x":14.8183,"y":12.6007},{"x":-33.279,"y":12.6007},{"x":-33.2791,"y":-7.3993},{"x":-8.0775,"y":-32.6008,"l":"OH"},{"x":32.1389,"y":2.6007},{"x":14.8183,"y":32.6007,"l":"OH"},{"x":-49.4593,"y":24.3563,"l":"O"},{"x":-49.4593,"y":-19.155,"l":"OH"},{"x":49.4594,"y":12.6007,"l":"OH"}],"b":[{"b":1,"e":0},{"b":1,"e":2},{"b":2,"e":5},{"b":5,"e":10,"o":2},{"b":5,"e":6},{"b":6,"e":11},{"b":6,"e":3,"o":2},{"b":1,"e":3},{"b":3,"e":7},{"b":1,"e":4},{"b":4,"e":9},{"b":4,"e":8},{"b":8,"e":12}]}
	});
	group.templates.push({
		name: 'Vitamin D<sub>3</sub>',
		data: {"a":[{"x":-177.0877,"y":20.5302},{"x":-153.0316,"y":34.4191},{"x":-153.0316,"y":62.1969},{"x":-128.9753,"y":20.5302},{"x":-104.9189,"y":34.4191},{"x":-80.8628,"y":20.5302},{"x":-56.8066,"y":34.4191},{"x":-32.7503,"y":20.5302},{"x":-56.8066,"y":62.1969},{"x":-56.8065,"y":6.6413,"l":"H"},{"x":-29.8467,"y":-7.0957},{"x":-7.3741,"y":31.8285},{"x":-2.6759,"y":-12.871},{"x":-28.0168,"y":50.415},{"x":11.213,"y":11.185},{"x":1.2099,"y":58.2465},{"x":27.5404,"y":-11.2874,"l":"H"},{"x":38.3838,"y":16.961},{"x":28.3806,"y":64.0218},{"x":46.9676,"y":43.379},{"x":56.9707,"y":-3.6825},{"x":84.1414,"y":2.0928},{"x":103.7833,"y":-17.549},{"x":130.6146,"y":-10.359},{"x":96.5939,"y":-44.38},{"x":150.2565,"y":-30.0015},{"x":69.7627,"y":-51.5693},{"x":116.2357,"y":-64.0218},{"x":177.0877,"y":-22.8116,"l":"OH"},{"x":143.0669,"y":-56.8325}],"b":[{"b":14,"e":16},{"b":14,"e":12},{"b":12,"e":10},{"b":10,"e":7},{"b":7,"e":6},{"b":6,"e":8},{"b":6,"e":5},{"b":5,"e":4},{"b":4,"e":3},{"b":3,"e":1},{"b":1,"e":2},{"b":1,"e":0},{"b":7,"e":11},{"b":14,"e":11},{"b":11,"e":13},{"b":11,"e":15},{"b":15,"e":18},{"b":18,"e":19},{"b":19,"e":17},{"b":14,"e":17},{"b":17,"e":20,"o":2},{"b":20,"e":21},{"b":21,"e":22,"o":2},{"b":22,"e":23},{"b":23,"e":25},{"b":25,"e":28},{"b":25,"e":29},{"b":29,"e":27},{"b":27,"e":24},{"b":22,"e":24},{"b":24,"e":26,"o":2},{"b":7,"e":9}]}
	});
	group.templates.push({
		name: 'Vitamin D<sub>4</sub>',
		data: {"a":[{"x":-150.3688,"y":57.1289},{"x":-126.3125,"y":71.0178},{"x":-102.2562,"y":57.1289},{"x":-126.3125,"y":98.7956},{"x":-78.1999,"y":71.0178},{"x":-102.2562,"y":29.3511},{"x":-54.1437,"y":57.1289},{"x":-30.0875,"y":71.0178},{"x":-30.0875,"y":98.7956},{"x":-6.0311,"y":57.1289},{"x":-6.0311,"y":84.9067,"l":"H"},{"x":-17.3294,"y":31.7532},{"x":21.5944,"y":54.2257},{"x":3.3135,"y":13.166},{"x":42.2374,"y":72.8122},{"x":27.3697,"y":27.0549},{"x":13.0107,"y":80.6437},{"x":68.6556,"y":64.2287},{"x":30.2734,"y":-0.571,"l":"H"},{"x":53.788,"y":18.4706},{"x":74.4309,"y":37.0578},{"x":59.5634,"y":-8.6995},{"x":85.9816,"y":-17.2838},{"x":91.7569,"y":-44.4546},{"x":118.1751,"y":-53.0382},{"x":71.114,"y":-63.0412},{"x":123.9505,"y":-80.209},{"x":76.8894,"y":-90.212},{"x":44.6957,"y":-54.4576},{"x":150.3688,"y":-88.7926,"l":"OH"},{"x":103.3076,"y":-98.7956}],"b":[{"b":9,"e":10},{"b":9,"e":11},{"b":11,"e":13},{"b":13,"e":15},{"b":15,"e":18},{"b":15,"e":19},{"b":19,"e":20},{"b":20,"e":17},{"b":17,"e":14},{"b":14,"e":12},{"b":9,"e":12},{"b":15,"e":12},{"b":12,"e":16},{"b":19,"e":21,"o":2},{"b":21,"e":22},{"b":22,"e":23,"o":2},{"b":23,"e":24},{"b":24,"e":26},{"b":26,"e":29},{"b":26,"e":30},{"b":30,"e":27},{"b":27,"e":25},{"b":23,"e":25},{"b":25,"e":28,"o":2},{"b":9,"e":7},{"b":7,"e":8},{"b":7,"e":6},{"b":6,"e":4},{"b":4,"e":2},{"b":2,"e":5},{"b":2,"e":1},{"b":1,"e":3},{"b":1,"e":0}]}
	});
	group.templates.push({
		name: 'Vitamin D<sub>5</sub>',
		data: {"a":[{"x":-150.3688,"y":57.1289},{"x":-126.3126,"y":71.0178},{"x":-102.2563,"y":57.1289},{"x":-102.2563,"y":29.3511},{"x":-78.2,"y":71.0178},{"x":-78.2,"y":15.4622},{"x":-126.3126,"y":15.4622},{"x":-54.1438,"y":57.1289},{"x":-30.0875,"y":71.0178},{"x":-6.0311,"y":57.1289},{"x":-30.0875,"y":98.7956},{"x":-17.3294,"y":31.7532},{"x":-6.0311,"y":84.9067,"l":"H"},{"x":21.5944,"y":54.2257},{"x":3.3135,"y":13.166},{"x":42.2374,"y":72.8122},{"x":27.3698,"y":27.0549},{"x":13.0106,"y":80.6437},{"x":68.6556,"y":64.2287},{"x":30.2734,"y":-0.571,"l":"H"},{"x":53.788,"y":18.4713},{"x":74.4308,"y":37.0578},{"x":59.5634,"y":-8.6995},{"x":85.9816,"y":-17.2838},{"x":91.7569,"y":-44.4546},{"x":118.1751,"y":-53.0382},{"x":71.1139,"y":-63.0412},{"x":123.9505,"y":-80.209},{"x":76.8894,"y":-90.212},{"x":44.6957,"y":-54.4576},{"x":103.3076,"y":-98.7956},{"x":150.3688,"y":-88.7926,"l":"OH"}],"b":[{"b":9,"e":12},{"b":9,"e":11},{"b":11,"e":14},{"b":14,"e":16},{"b":16,"e":19},{"b":16,"e":20},{"b":20,"e":21},{"b":21,"e":18},{"b":18,"e":15},{"b":15,"e":13},{"b":9,"e":13},{"b":16,"e":13},{"b":13,"e":17},{"b":20,"e":22,"o":2},{"b":22,"e":23},{"b":23,"e":24,"o":2},{"b":24,"e":25},{"b":25,"e":27},{"b":27,"e":31},{"b":27,"e":30},{"b":30,"e":28},{"b":28,"e":26},{"b":24,"e":26},{"b":26,"e":29,"o":2},{"b":9,"e":8},{"b":8,"e":10},{"b":8,"e":7},{"b":7,"e":4},{"b":4,"e":2},{"b":2,"e":1},{"b":1,"e":0},{"b":2,"e":3},{"b":3,"e":6},{"b":3,"e":5}]}
	});
	group.templates.push({
		name: 'Vitamin E',
		data: {"a":[{"x":138.5641,"y":-10},{"x":138.5641,"y":10},{"x":121.2436,"y":20},{"x":155.8846,"y":20},{"x":103.9231,"y":10},{"x":86.6026,"y":20},{"x":69.282,"y":10},{"x":69.282,"y":-10},{"x":51.9615,"y":20},{"x":34.641,"y":10},{"x":17.3205,"y":20},{"x":0,"y":10},{"x":0,"y":-10},{"x":-17.3205,"y":20},{"x":-34.641,"y":10},{"x":-51.9615,"y":20},{"x":-69.2821,"y":10},{"x":-69.2821,"y":30},{"x":-69.2821,"y":-10},{"x":-86.6026,"y":20,"l":"O"},{"x":-86.6026,"y":-20},{"x":-103.9231,"y":10},{"x":-103.9231,"y":-10},{"x":-121.2436,"y":20},{"x":-121.2436,"y":-20},{"x":-138.5641,"y":10},{"x":-121.2436,"y":40},{"x":-121.2436,"y":-40},{"x":-138.5641,"y":-10},{"x":-155.8846,"y":20},{"x":-155.8846,"y":-20,"l":"OH"}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":4},{"b":4,"e":5},{"b":5,"e":6},{"b":6,"e":7},{"b":6,"e":8},{"b":8,"e":9},{"b":9,"e":10},{"b":10,"e":11},{"b":11,"e":12},{"b":11,"e":13},{"b":13,"e":14},{"b":14,"e":15},{"b":15,"e":16},{"b":16,"e":17},{"b":16,"e":18},{"b":18,"e":20},{"b":20,"e":22},{"b":22,"e":24,"o":2},{"b":24,"e":27},{"b":24,"e":28},{"b":28,"e":30},{"b":28,"e":25,"o":2},{"b":25,"e":29},{"b":25,"e":23},{"b":23,"e":26},{"b":23,"e":21,"o":2},{"b":22,"e":21},{"b":21,"e":19},{"b":16,"e":19}]}
	});
	group.templates.push({
		name: 'Vitamin K<sub>1</sub>',
		data: {"a":[{"x":-155.8846,"y":40},{"x":-155.8846,"y":20},{"x":-138.5641,"y":10},{"x":-173.2051,"y":10},{"x":-121.2436,"y":20},{"x":-103.9231,"y":10},{"x":-86.6025,"y":20},{"x":-86.6025,"y":40},{"x":-69.2821,"y":10},{"x":-51.9615,"y":20},{"x":-34.641,"y":10},{"x":-17.3205,"y":20},{"x":0,"y":10},{"x":-17.3205,"y":40},{"x":17.3205,"y":20},{"x":34.641,"y":10},{"x":51.9615,"y":20},{"x":69.2821,"y":10},{"x":51.9615,"y":40},{"x":86.6026,"y":20},{"x":103.9231,"y":10},{"x":121.2437,"y":20},{"x":103.9231,"y":-10},{"x":138.5641,"y":10},{"x":121.2437,"y":40,"l":"O"},{"x":121.2437,"y":-20},{"x":86.6026,"y":-20},{"x":155.8847,"y":20},{"x":138.5641,"y":-10},{"x":121.2437,"y":-40,"l":"O"},{"x":173.2051,"y":10},{"x":155.8847,"y":-20},{"x":173.2051,"y":-10}],"b":[{"b":0,"e":1},{"b":1,"e":3},{"b":1,"e":2},{"b":2,"e":4},{"b":4,"e":5},{"b":5,"e":6},{"b":6,"e":7},{"b":6,"e":8},{"b":8,"e":9},{"b":9,"e":10},{"b":10,"e":11},{"b":11,"e":13},{"b":11,"e":12},{"b":12,"e":14},{"b":14,"e":15},{"b":15,"e":16},{"b":16,"e":18},{"b":16,"e":17,"o":2},{"b":17,"e":19},{"b":19,"e":20},{"b":20,"e":22,"o":2},{"b":22,"e":26},{"b":22,"e":25},{"b":25,"e":29,"o":2},{"b":25,"e":28},{"b":28,"e":23,"o":2},{"b":23,"e":27},{"b":27,"e":30,"o":2},{"b":30,"e":32},{"b":32,"e":31,"o":2},{"b":28,"e":31},{"b":23,"e":21},{"b":20,"e":21},{"b":21,"e":24,"o":2}]}
	});
	d.push(group);

	// this is the user's template group, don't remove this or the templates widget won't work
	// IE/Edge doesn't allow localStorage from local files
	let saved;
	if(localStorage){
		// load from local storage
		saved = localStorage.getItem('chemdoodle_user_templates');
	}
	group = {name:'My Templates', templates:!saved||saved===null?[]:JSON.parse(saved)};
	d.push(group);

	return d;

})(JSON, localStorage);

(function(desktop, imageDepot, q, undefined) {
	'use strict';
	desktop.Button = function(id, icon, tooltip, func) {
		this.id = id;
		this.icon = icon;
		this.toggle = false;
		this.tooltip = tooltip ? tooltip : '';
		this.func = func ? func : undefined;
	};
	let _ = desktop.Button.prototype;
	_.getElement = function() {
		return q('#' + this.id);
	};
	_.getLabelElement = function() {
		if(this.toggle){
			return q('#' + this.id + '_label');
		}
		return undefined;
	};
	_.getSource = function(buttonGroup) {
		let sb = [];
		let spacingStyles = 'box-sizing:border-box;margin-top:0px; margin-bottom:1px; padding:0px; height:28px; width:28px;';
		if (this.toggle) {
			sb.push('<input type="radio" name="');
			sb.push(buttonGroup);
			sb.push('" id="');
			sb.push(this.id);
			sb.push('" title="');
			sb.push(this.tooltip);
			sb.push('" /><label id="');
			sb.push(this.id);
			sb.push('_label" for="');
			sb.push(this.id);
			sb.push('" style="');
			sb.push(spacingStyles);
			sb.push('"><img id="');
			sb.push(this.id);
			sb.push('_icon" title="');
			sb.push(this.tooltip);
			sb.push('" width="20" height="20');
			if(this.icon){
				sb.push('" src="');
				sb.push(imageDepot.getURI(this.icon));
			}
			sb.push('"></label>');
		} else {
			sb.push('<button type="button" id="');
			sb.push(this.id);
			sb.push('" onclick="return false;" title="');
			sb.push(this.tooltip);
			sb.push('" style="');
			sb.push(spacingStyles);
			sb.push('"><img title="');
			sb.push(this.tooltip);
			sb.push('" width="20" height="20');
			if(this.icon){
				sb.push('" src="');
				sb.push(imageDepot.getURI(this.icon));
			}
			sb.push('"></button>');
		}
		return sb.join('');
	};
	_.setup = function(lone) {
		let element = this.getElement();
		if (!this.toggle || lone) {
			element.button();
		}
		element.click(this.func);
	};
	_.disable = function() {
		let element = this.getElement();
		element.mouseout();
		element.button('disable');
	};
	_.enable = function() {
		this.getElement().button('enable');
	};
	_.select = function() {
		// WARNING: this function will autofocus the element and move the page view to the button, use click() instead to avoid this behavior
		// getElement().click() - executes its function (same as just calling .func())
		// getLabelElement().click() - selects a toggle button (based on radio), similar to this call
		let element = this.getElement();
		element.attr('checked', true);
		element.button('refresh');
		if(this.toggle){
			this.getLabelElement().click();
		}
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot, ChemDoodle.lib.jQuery);
(function(desktop, q, undefined) {
	'use strict';
	desktop.ButtonSet = function(id) {
		this.id = id;
		this.buttons = [];
		this.toggle = true;
		this.columnCount = -1;
	};
	let _ = desktop.ButtonSet.prototype;
	_.getElement = function() {
		return q('#' + this.id);
	};
	_.getSource = function(buttonGroup) {
		let sb = [];
		if(this.columnCount===-1){
			sb.push('<span id="');
			sb.push(this.id);
			sb.push('">');
			for ( let i = 0, ii = this.buttons.length; i < ii; i++) {
				if (this.toggle) {
					this.buttons[i].toggle = true;
				}
				sb.push(this.buttons[i].getSource(buttonGroup));
			}
			if (this.dropDown) {
				sb.push(this.dropDown.getButtonSource());
			}
			sb.push('</span>');
			if (this.dropDown) {
				sb.push(this.dropDown.getHiddenSource());
			}
		}else{
			sb.push('<table cellspacing="0" style="margin:1px -2px 0px 1px;">');
			let c = 0;
			for ( let i = 0, ii = this.buttons.length; i < ii; i++) {
				if (this.toggle) {
						this.buttons[i].toggle = true;
				}
				if(c===0){
					sb.push('<tr>');
				}
				sb.push('<td style="padding:0px;">');
				sb.push(this.buttons[i].getSource(buttonGroup));
				sb.push('</td>');
				c++;
				if(c===this.columnCount){
					sb.push('</tr>');
					c = 0;
				}
			}
			sb.push('</table>');
		}
		return sb.join('');
	};
	_.setup = function() {
		if(this.columnCount===-1){
			this.getElement().buttonset();
		}
		for ( let i = 0, ii = this.buttons.length; i < ii; i++) {
			this.buttons[i].setup(this.columnCount!==-1);
		}
		if (this.dropDown) {
			this.dropDown.setup();
		}
	};
	_.addDropDown = function(tooltip) {
		this.dropDown = new desktop.DropDown(this.id + '_dd', tooltip, this.buttons[this.buttons.length - 1]);
	};

	_.disable = function() {
		for (let i = 0, ii = this.buttons.length; i < ii; i++) {
			this.buttons[i].disable();
		}
	};

	_.enable = function() {
		for (let i = 0, ii = this.buttons.length; i < ii; i++) {
			this.buttons[i].enable();
		}
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);
(function(desktop, q, undefined) {
	'use strict';
	desktop.CheckBox = function(id, tooltip, func, checked) {
		this.id = id;
		this.checked = checked ? checked : false;
		this.tooltip = tooltip ? tooltip : '';
		this.func = func ? func : undefined;
	};
	let _ = desktop.CheckBox.prototype = new desktop.Button();
	_.getSource = function() {
		let sb = [];
		sb.push('<input type="checkbox" id="');
		sb.push(this.id);
		sb.push('" ');
		if (this.checked) {
			sb.push('checked="" ');
		}
		sb.push('><label for="');
		sb.push(this.id);
		sb.push('">');
		sb.push(this.tooltip);
		sb.push('</label>');
		return sb.join('');
	};
	_.setup = function() {
		this.getElement().click(this.func);
	};

	_.check = function() {
		this.checked = true;
		this.getElement().prop('checked', true);
	};

	_.uncheck = function() {
		this.checked = false;
		this.getElement().removeAttr('checked');
	};
})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);
(function(desktop, q, undefined) {
	'use strict';
	desktop.ColorPicker = function (id, tooltip, func) {
		this.id = id;
		this.tooltip = tooltip ? tooltip : '';
		this.func = func ? func : undefined;
	};
	let _ = desktop.ColorPicker.prototype;
	_.getElement = function() {
		return q('#' + this.id);
	};
	_.getSource = function() {
		let sb = [];
		sb.push('<table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td><p>');
		sb.push(this.tooltip);
		sb.push('</p></td><td><input id="');
		sb.push(this.id);
		sb.push('" class="simple_color" value="#000000" /></td></tr></table>');
		return sb.join('');
	};
	_.setup = function() {
		this.getElement().simpleColor({
			boxWidth : 20,
			livePreview : true,
			chooserCSS: { 'z-index' : '900'},
			onSelect : this.func });
	};
	_.setColor = function(color) {
		this.getElement().setColor(color);
	};
})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);

(function(desktop, q, document, undefined) {
	'use strict';
	desktop.Dialog = function(sketcherid, subid, title) {
		// sketcherid is the DOM element id everything will be anchored around
		// when adding dynamically.
		this.sketcherid = sketcherid;
		this.id = sketcherid + subid;
		this.title = title ? title : 'Information';
	};
	let _ = desktop.Dialog.prototype;
	_.buttons = undefined;
	_.message = undefined;
	_.afterMessage = undefined;
	_.includeTextArea = false;
	_.includeTextField = false;
	_.getElement = function() {
		return q('#' + this.id);
	};
	_.getTextArea = function() {
		return q('#' + this.id + '_ta');
	};
	_.getTextField = function() {
		return q('#' + this.id + '_tf');
	};
	_.setup = function() {
		let sb = [];
		sb.push('<div style="font-size:12px;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		if (this.message) {
			sb.push('<p>');
			sb.push(this.message);
			sb.push('</p>');
		}
		if (this.includeTextField) {
			sb.push('<input type="text" style="font-family:\'Courier New\';" id="');
			sb.push(this.id);
			sb.push('_tf" autofocus></input>');
		}
		if (this.includeTextArea) {
			sb.push('<textarea style="font-family:\'Courier New\';" id="');
			sb.push(this.id);
			sb.push('_ta" cols="55" rows="10"></textarea>');
		}
		if (this.afterMessage) {
			sb.push('<p>');
			sb.push(this.afterMessage);
			sb.push('</p>');
		}
		sb.push('</div>');
		if (document.getElementById(this.sketcherid)) {
			let canvas = q('#' + this.sketcherid);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		let self = this;
		this.getElement().dialog({
			autoOpen : false,
			width : 435,
			buttons : self.buttons
		});
	};
	_.open = function() {
		this.getElement().dialog('open');
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);
(function(desktop, q, undefined) {
	'use strict';
	desktop.FloatingToolbar = function(sketcher) {
		this.sketcher = sketcher;
		this.components = [];
	};
	let _ = desktop.FloatingToolbar.prototype;
	_.getElement = function() {
		return q('#' + this.id);
	};
	_.getSource = function(buttonGroup) {
		let sb = [];
		sb.push('<div id="');
		sb.push(this.sketcher.id);
		sb.push('_floating_toolbar" style="position:absolute;left:-50px;z-index:10;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);border:1px #C1C1C1 solid;background:#F5F5F5;padding:2px;">');
		sb.push('<div id="');
		sb.push(this.sketcher.id);
		// box-sizing makes the browser include borders and padding in width and height
		sb.push('_floating_toolbar_handle" style="height:14px;"><div style="box-sizing:border-box;padding:0px;height:4px;border-top:1px solid #999;border-bottom:1px solid #999;">');
		sb.push('</div></div>');
		for ( let i = 0, ii = this.components.length; i < ii; i++) {
			sb.push(this.components[i].getSource(buttonGroup));
			sb.push('<br>');
		}
		sb.push('</div>');
		return sb.join('');
	};
	_.setup = function() {
		let self = this;
		q('#'+this.sketcher.id+'_floating_toolbar').draggable({handle:'#'+this.sketcher.id+'_floating_toolbar_handle', drag:function(){
			if(self.sketcher.openTray){
				self.sketcher.openTray.reposition();
			}
		}, containment:'document'});
		for ( let i = 0, ii = this.components.length; i < ii; i++) {
			this.components[i].setup(true);
		}
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);

(function(c, structures, actions, desktop, q, document, undefined) {
	'use strict';

	let makeRow = function(id, name, tag, description, component) {
		let sb = ['<tr>'];
		// checkbox for include
		sb.push('<td>');
		if(id.indexOf('_elements')===-1){
			sb.push('<input type="checkbox" id="');
			sb.push(id);
			sb.push('_include">');
		}
		sb.push('</td>');
		// name and tag
		sb.push('<td>');
		sb.push(name);
		if(tag){
			sb.push('<br>(<strong>');
			sb.push(tag);
			sb.push('</strong>)');
		}
		sb.push('</td>');
		// component
		sb.push('<td style="padding-left:20px;padding-right:20px;">');
		sb.push(description);
		if(component){
			if(component===1){
				sb.push('<br>');
				sb.push('<input type="text" id="');
				sb.push(id);
				sb.push('_value">');
			}else{
				sb.push(component);
			}
		}
		sb.push('</td>');
		// checkbox for not
		sb.push('<td><input type="checkbox" id="');
		sb.push(id);
		sb.push('_not"><br><strong>NOT</strong>');
		sb.push('</td>');
		// close
		sb.push('</tr>');
		return sb.join('');
	};

	desktop.AtomQueryDialog = function(sketcher, subid) {
		this.sketcher = sketcher;
		this.id = sketcher.id + subid;
	};
	let _ = desktop.AtomQueryDialog.prototype = new desktop.Dialog();
	_.title = 'Atom Query';
	_.setAtom = function(a) {
		this.a = a;
		let use = a.query;
		if(!use){
			use = new structures.Query(structures.Query.TYPE_ATOM);
			use.elements.v.push(a.label);
		}
		for(let i = 0, ii = this.periodicTable.cells.length; i<ii; i++){
			this.periodicTable.cells[i].selected = use.elements.v.indexOf(this.periodicTable.cells[i].element.symbol)!==-1;
		}
		this.periodicTable.repaint();
		q('#'+this.id+'_el_any').prop("checked", use.elements.v.indexOf('a')!==-1);
		q('#'+this.id+'_el_noth').prop("checked", use.elements.v.indexOf('r')!==-1);
		q('#'+this.id+'_el_het').prop("checked", use.elements.v.indexOf('q')!==-1);
		q('#'+this.id+'_el_hal').prop("checked", use.elements.v.indexOf('x')!==-1);
		q('#'+this.id+'_el_met').prop("checked", use.elements.v.indexOf('m')!==-1);
		q('#'+this.id+'_elements_not').prop("checked", use.elements.not);

		q('#'+this.id+'_aromatic_include').prop("checked", use.aromatic!==undefined);
		q('#'+this.id+'_aromatic_not').prop("checked", use.aromatic!==undefined&&use.aromatic.not);
		q('#'+this.id+'_charge_include').prop("checked", use.charge!==undefined);
		q('#'+this.id+'_charge_value').val(use.charge?use.outputRange(use.charge.v):'');
		q('#'+this.id+'_charge_not').prop("checked", use.charge!==undefined&&use.charge.not);
		q('#'+this.id+'_hydrogens_include').prop("checked", use.hydrogens!==undefined);
		q('#'+this.id+'_hydrogens_value').val(use.hydrogens?use.outputRange(use.hydrogens.v):'');
		q('#'+this.id+'_hydrogens_not').prop("checked", use.charge!==undefined&&use.charge.not);
		q('#'+this.id+'_ringCount_include').prop("checked", use.ringCount!==undefined);
		q('#'+this.id+'_ringCount_value').val(use.ringCount?use.outputRange(use.ringCount.v):'');
		q('#'+this.id+'_ringCount_not').prop("checked", use.ringCount!==undefined&&use.ringCount.not);
		q('#'+this.id+'_saturation_include').prop("checked", use.saturation!==undefined);
		q('#'+this.id+'_saturation_not').prop("checked", use.saturation!==undefined&&use.saturation.not);
		q('#'+this.id+'_connectivity_include').prop("checked", use.connectivity!==undefined);
		q('#'+this.id+'_connectivity_value').val(use.connectivity?use.outputRange(use.connectivity.v):'');
		q('#'+this.id+'_connectivity_not').prop("checked", use.connectivity!==undefined&&use.connectivity.not);
		q('#'+this.id+'_connectivityNoH_include').prop("checked", use.connectivityNoH!==undefined);
		q('#'+this.id+'_connectivityNoH_value').val(use.connectivityNoH?use.outputRange(use.connectivityNoH.v):'');
		q('#'+this.id+'_connectivityNoH_not').prop("checked", use.connectivityNoH!==undefined&&use.connectivityNoH.not);
		q('#'+this.id+'_chirality_include').prop("checked", use.chirality!==undefined);
		if(!use.chirality || use.chirality.v === 'R'){
			q('#'+this.id+'_chiral_r').prop('checked', true).button('refresh');
		}else if(!use.chirality || use.chirality.v === 'S'){
			q('#'+this.id+'_chiral_s').prop('checked', true).button('refresh');
		}else if(!use.chirality || use.chirality.v === 'A'){
			q('#'+this.id+'_chiral_a').prop('checked', true).button('refresh');
		}
		q('#'+this.id+'_chirality_not').prop("checked", use.chirality!==undefined&&use.chirality.not);
	};
	_.setup = function() {
		let sb = [];
		sb.push('<div style="font-size:12px;text-align:center;height:300px;overflow-y:scroll;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		sb.push('<p>Set the following form to define the atom query.</p>');
		sb.push('<table>');
		sb.push(makeRow(this.id+'_elements', 'Identity', undefined, 'Select any number of elements and/or wildcards.', '<canvas class="ChemDoodleWebComponent" id="'+this.id+'_pt"></canvas><br><input type="checkbox" id="'+this.id+'_el_any">Any (a)<input type="checkbox" id="'+this.id+'_el_noth">!Hydrogen (r)<input type="checkbox" id="'+this.id+'_el_het">Heteroatom (q)<br><input type="checkbox" id="'+this.id+'_el_hal">Halide (x)<input type="checkbox" id="'+this.id+'_el_met">Metal (m)'));
		sb.push('<tr><td colspan="4"><hr style="width:100%"></td></tr>');
		sb.push(makeRow(this.id+'_aromatic', 'Aromatic', 'A', 'Specifies that the matched atom should be aromatic. Use the NOT modifier to specify not aromatic or anti-aromatic.'));
		sb.push(makeRow(this.id+'_charge', 'Charge', 'C', 'Defines the allowed charge for the matched atom.', 1));
		sb.push(makeRow(this.id+'_hydrogens', 'Hydrogens', 'H', 'Defines the total number of hydrogens attached to the atom, implicit and explicit.', 1));
		sb.push(makeRow(this.id+'_ringCount', 'Ring Count', 'R', 'Defines the total number of rings this atom is a member of. (SSSR)', 1));
		sb.push(makeRow(this.id+'_saturation', 'Saturation', 'S', 'Specifies that the matched atom should be saturated. Use the NOT modifier to specify unsaturation.'));
		sb.push(makeRow(this.id+'_connectivity', 'Connectivity', 'X', 'Defines the total number of bonds connected to the atom, including all hydrogens.', 1));
		sb.push(makeRow(this.id+'_connectivityNoH', 'Connectivity (No H)', 'x', 'Defines the total number of bonds connected to the atom, excluding all hydrogens.', 1));
		sb.push(makeRow(this.id+'_chirality', 'Chirality', '@', 'Defines the stereochemical configuration of the atom.', '<div id="'+this.id+'_radio"><input type="radio" id="'+this.id+'_chiral_a" name="radio"><label for="'+this.id+'_chiral_a">Any (A)</label><input type="radio" id="'+this.id+'_chiral_r" name="radio"><label for="'+this.id+'_chiral_r">Rectus (R)</label><input type="radio" id="'+this.id+'_chiral_s" name="radio"><label for="'+this.id+'_chiral_s">Sinestra (S)</label></div>'));
		sb.push('</table>');
		sb.push('</div>');
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		this.periodicTable = new c.PeriodicTableCanvas(this.id + '_pt', 16);
		this.periodicTable.allowMultipleSelections = true;
		this.periodicTable.drawCell = function(ctx, styles, cell){
		    //if hovered, then show a red background
		    if(this.hovered===cell){
		      ctx.fillStyle='blue';
		      ctx.fillRect(cell.x, cell.y, cell.dimension, cell.dimension);
		    }else if(cell.selected){
			    ctx.fillStyle='#c10000';
			    ctx.fillRect(cell.x, cell.y, cell.dimension, cell.dimension);
			}
		    //draw the main cells
		    ctx.strokeStyle='black';
		    ctx.strokeRect(cell.x, cell.y, cell.dimension, cell.dimension);
		    ctx.font = '10px Sans-serif';
		    ctx.fillStyle='black';
		    ctx.textAlign = 'center';
		    ctx.textBaseline = 'middle';
		    ctx.fillText(cell.element.symbol, cell.x+cell.dimension/2, cell.y+cell.dimension/2);
		};
		this.periodicTable.repaint();
		let self = this;
		function setNewQuery(){
			let query = new structures.Query(structures.Query.TYPE_ATOM);

			if(q('#'+self.id+'_el_any').is(':checked')){
				query.elements.v.push('a');
			}
			if(q('#'+self.id+'_el_noth').is(':checked')){
				query.elements.v.push('r');
			}
			if(q('#'+self.id+'_el_het').is(':checked')){
				query.elements.v.push('q');
			}
			if(q('#'+self.id+'_el_hal').is(':checked')){
				query.elements.v.push('x');
			}
			if(q('#'+self.id+'_el_met').is(':checked')){
				query.elements.v.push('m');
			}
			for(let i = 0, ii = self.periodicTable.cells.length; i<ii; i++){
				if(self.periodicTable.cells[i].selected){
					query.elements.v.push(self.periodicTable.cells[i].element.symbol);
				}
			}
			if(q('#'+self.id+'_elements_not').is(':checked')){
				query.elements.not = true;
			}

			if(q('#'+self.id+'_aromatic_include').is(':checked')){
				query.aromatic = {v:true,not:q('#'+self.id+'_aromatic_not').is(':checked')};
			}
			if(q('#'+self.id+'_charge_include').is(':checked')){
				query.charge = {v:query.parseRange(q('#'+self.id+'_charge_value').val()),not:q('#'+self.id+'_charge_not').is(':checked')};
			}
			if(q('#'+self.id+'_hydrogens_include').is(':checked')){
				query.hydrogens = {v:query.parseRange(q('#'+self.id+'_hydrogens_value').val()),not:q('#'+self.id+'_hydrogens_not').is(':checked')};
			}
			if(q('#'+self.id+'_ringCount_include').is(':checked')){
				query.ringCount = {v:query.parseRange(q('#'+self.id+'_ringCount_value').val()),not:q('#'+self.id+'_ringCount_not').is(':checked')};
			}
			if(q('#'+self.id+'_saturation_include').is(':checked')){
				query.saturation = {v:true,not:q('#'+self.id+'_saturation_not').is(':checked')};
			}
			if(q('#'+self.id+'_connectivity_include').is(':checked')){
				query.connectivity = {v:query.parseRange(q('#'+self.id+'_connectivity_value').val()),not:q('#'+self.id+'_connectivity_not').is(':checked')};
			}
			if(q('#'+self.id+'_connectivityNoH_include').is(':checked')){
				query.connectivityNoH = {v:query.parseRange(q('#'+self.id+'_connectivityNoH_value').val()),not:q('#'+self.id+'_connectivityNoH_not').is(':checked')};
			}
			if(q('#'+self.id+'_chirality_include').is(':checked')){
				let val = 'R';
				if(q('#'+self.id+'_chiral_a').is(':checked')){
					val = 'A';
				}else if(q('#'+self.id+'_chiral_s').is(':checked')){
					val = 'S';
				}
				query.chirality = {v:val,not:q('#'+self.id+'_chirity_not').is(':checked')};
			}

			self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.a, query));
			q(this).dialog('close');
		};
		q('#'+this.id+'_radio').buttonset();
		this.getElement().dialog({
			autoOpen : false,
			width : 500,
			height: 300,
			buttons : {
				'Cancel' : function(){q(this).dialog('close');},
				'Remove' : function(){self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.a));q(this).dialog('close');},
				'Set' : setNewQuery
			},
			open : function(event, ui) {
				q("#"+self.id).animate({ scrollTop: 0 }, "fast");
			}
		});
	};

})(ChemDoodle, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);

(function(c, structures, actions, desktop, imageDepot, q, document, undefined) {
	'use strict';

	let makeRow = function(id, name, tag, description, component) {
		let sb = ['<tr>'];
		// checkbox for include
		sb.push('<td>');
		if(id.indexOf('_orders')===-1){
			sb.push('<input type="checkbox" id="');
			sb.push(id);
			sb.push('_include">');
		}
		sb.push('</td>');
		// name and tag
		sb.push('<td>');
		sb.push(name);
		if(tag){
			sb.push('<br>(<strong>');
			sb.push(tag);
			sb.push('</strong>)');
		}
		sb.push('</td>');
		// component
		sb.push('<td style="padding-left:20px;padding-right:20px;">');
		sb.push(description);
		if(component){
			if(component===1){
				sb.push('<br>');
				sb.push('<input type="text" id="');
				sb.push(id);
				sb.push('_value">');
			}else{
				sb.push(component);
			}
		}
		sb.push('</td>');
		// checkbox for not
		sb.push('<td><input type="checkbox" id="');
		sb.push(id);
		sb.push('_not"><br><strong>NOT</strong>');
		sb.push('</td>');
		// close
		sb.push('</tr>');
		return sb.join('');
	};

	desktop.BondQueryDialog = function(sketcher, subid) {
		this.sketcher = sketcher;
		this.id = sketcher.id + subid;
	};
	let _ = desktop.BondQueryDialog.prototype = new desktop.Dialog();
	_.title = 'Bond Query';
	_.setBond = function(b) {
		this.b = b;
		let use = b.query;
		if(!use){
			use = new structures.Query(structures.Query.TYPE_BOND);
			switch(b.bondOrder){
			case 0:
				use.orders.v.push('0');
				break;
			case 0.5:
				use.orders.v.push('h');
				break;
			case 1:
				use.orders.v.push('1');
				break;
			case 1.5:
				use.orders.v.push('r');
				break;
			case 2:
				use.orders.v.push('2');
				break;
			case 3:
				use.orders.v.push('3');
				break;
			}
		}

		q('#'+this.id+'_type_0').prop("checked", use.orders.v.indexOf('0')!==-1).button('refresh');
		q('#'+this.id+'_type_1').prop("checked", use.orders.v.indexOf('1')!==-1).button('refresh');
		q('#'+this.id+'_type_2').prop("checked", use.orders.v.indexOf('2')!==-1).button('refresh');
		q('#'+this.id+'_type_3').prop("checked", use.orders.v.indexOf('3')!==-1).button('refresh');
		q('#'+this.id+'_type_4').prop("checked", use.orders.v.indexOf('4')!==-1).button('refresh');
		q('#'+this.id+'_type_5').prop("checked", use.orders.v.indexOf('5')!==-1).button('refresh');
		q('#'+this.id+'_type_6').prop("checked", use.orders.v.indexOf('6')!==-1).button('refresh');
		q('#'+this.id+'_type_h').prop("checked", use.orders.v.indexOf('h')!==-1).button('refresh');
		q('#'+this.id+'_type_r').prop("checked", use.orders.v.indexOf('r')!==-1).button('refresh');
		q('#'+this.id+'_type_a').prop("checked", use.orders.v.indexOf('a')!==-1).button('refresh');
		q('#'+this.id+'_orders_not').prop("checked", use.orders.not);

		q('#'+this.id+'_aromatic_include').prop("checked", use.aromatic!==undefined);
		q('#'+this.id+'_aromatic_not').prop("checked", use.aromatic!==undefined&&use.aromatic.not);
		q('#'+this.id+'_ringCount_include').prop("checked", use.ringCount!==undefined);
		q('#'+this.id+'_ringCount_value').val(use.ringCount?use.outputRange(use.ringCount.v):'');
		q('#'+this.id+'_ringCount_not').prop("checked", use.ringCount!==undefined&&use.ringCount.not);
		q('#'+this.id+'_stereo_include').prop("checked", use.stereo!==undefined);
		if(!use.stereo || use.stereo.v === 'E'){
			q('#'+this.id+'_stereo_e').prop('checked', true).button('refresh');
		}else if(!use.stereo || use.stereo.v === 'Z'){
			q('#'+this.id+'_stereo_z').prop('checked', true).button('refresh');
		}else if(!use.stereo || use.stereo.v === 'A'){
			q('#'+this.id+'_stereo_a').prop('checked', true).button('refresh');
		}
		q('#'+this.id+'_stereo_not').prop("checked", use.stereo!==undefined&&use.stereo.not);
	};
	_.setup = function() {
		let sb = [];
		sb.push('<div style="font-size:12px;text-align:center;height:300px;overflow-y:scroll;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		sb.push('<p>Set the following form to define the bond query.</p>');
		sb.push('<table>');
		sb.push(makeRow(this.id+'_orders', 'Identity', undefined, 'Select any number of bond types.', '<div id="'+this.id+'_radioTypes"><input type="checkbox" id="'+this.id+'_type_0"><label for="'+this.id+'_type_0"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_ZERO)+'" /></label><input type="checkbox" id="'+this.id+'_type_1"><label for="'+this.id+'_type_1"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_SINGLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_2"><label for="'+this.id+'_type_2"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_DOUBLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_3"><label for="'+this.id+'_type_3"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_TRIPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_4"><label for="'+this.id+'_type_4"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_QUADRUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_5"><label for="'+this.id+'_type_5"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_QUINTUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_6"><label for="'+this.id+'_type_6"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_SEXTUPLE)+'" /></label><input type="checkbox" id="'+this.id+'_type_h"><label for="'+this.id+'_type_h"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_HALF)+'" /></label><input type="checkbox" id="'+this.id+'_type_r"><label for="'+this.id+'_type_r"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_RESONANCE)+'" /></label><input type="checkbox" id="'+this.id+'_type_a"><label for="'+this.id+'_type_a"><img width="20" height="20" src="'+imageDepot.getURI(imageDepot.BOND_ANY)+'" /></label></div>'));
		sb.push('<tr><td colspan="4"><hr style="width:100%"></td></tr>');
		sb.push(makeRow(this.id+'_aromatic', 'Aromatic', 'A', 'Specifies that the matched bond should be aromatic. Use the NOT modifier to specify not aromatic or anti-aromatic.'));
		sb.push(makeRow(this.id+'_ringCount', 'Ring Count', 'R', 'Defines the total number of rings this bond is a member of. (SSSR)', 1));
		sb.push(makeRow(this.id+'_stereo', 'Stereochemistry', '@', 'Defines the stereochemical configuration of the bond.', '<div id="'+this.id+'_radio"><input type="radio" id="'+this.id+'_stereo_a" name="radio"><label for="'+this.id+'_stereo_a">Any (A)</label><input type="radio" id="'+this.id+'_stereo_e" name="radio"><label for="'+this.id+'_stereo_e">Entgegen (E)</label><input type="radio" id="'+this.id+'_stereo_z" name="radio"><label for="'+this.id+'_stereo_z">Zusammen (Z)</label></div>'));
		sb.push('</table>');
		sb.push('</div>');
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		let self = this;
		function setNewQuery(){
			let query = new structures.Query(structures.Query.TYPE_BOND);

			if(q('#'+self.id+'_type_0').is(':checked')){
				query.orders.v.push('0');
			}
			if(q('#'+self.id+'_type_1').is(':checked')){
				query.orders.v.push('1');
			}
			if(q('#'+self.id+'_type_2').is(':checked')){
				query.orders.v.push('2');
			}
			if(q('#'+self.id+'_type_3').is(':checked')){
				query.orders.v.push('3');
			}
			if(q('#'+self.id+'_type_4').is(':checked')){
				query.orders.v.push('4');
			}
			if(q('#'+self.id+'_type_5').is(':checked')){
				query.orders.v.push('5');
			}
			if(q('#'+self.id+'_type_6').is(':checked')){
				query.orders.v.push('6');
			}
			if(q('#'+self.id+'_type_h').is(':checked')){
				query.orders.v.push('h');
			}
			if(q('#'+self.id+'_type_r').is(':checked')){
				query.orders.v.push('r');
			}
			if(q('#'+self.id+'_type_a').is(':checked')){
				query.orders.v.push('a');
			}
			if(q('#'+self.id+'_orders_not').is(':checked')){
				query.orders.not = true;
			}

			if(q('#'+self.id+'_aromatic_include').is(':checked')){
				query.aromatic = {v:true,not:q('#'+self.id+'_aromatic_not').is(':checked')};
			}
			if(q('#'+self.id+'_ringCount_include').is(':checked')){
				query.ringCount = {v:query.parseRange(q('#'+self.id+'_ringCount_value').val()),not:q('#'+self.id+'_ringCount_not').is(':checked')};
			}
			if(q('#'+self.id+'_stereo_include').is(':checked')){
				let val = 'E';
				if(q('#'+self.id+'_stereo_a').is(':checked')){
					val = 'A';
				}else if(q('#'+self.id+'_stereo_z').is(':checked')){
					val = 'Z';
				}
				query.stereo = {v:val,not:q('#'+self.id+'_stereo_not').is(':checked')};
			}

			self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.b, query));
			q(this).dialog('close');
		};
		q('#'+this.id+'_radioTypes').buttonset();
		q('#'+this.id+'_radio').buttonset();
		this.getElement().dialog({
			autoOpen : false,
			width : 520,
			height: 300,
			buttons : {
				'Cancel' : function(){q(this).dialog('close');},
				'Remove' : function(){self.sketcher.historyManager.pushUndo(new actions.ChangeQueryAction(self.b));q(this).dialog('close');},
				'Set' : setNewQuery
			},
			open : function(event, ui) {
				q("#"+self.id).animate({ scrollTop: 0 }, "fast");
			}
		});
	};

})(ChemDoodle, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot, ChemDoodle.lib.jQuery, document);

(function(c, desktop, q, document, undefined) {
	'use strict';
	desktop.MolGrabberDialog = function(sketcherid, subid) {
		this.sketcherid = sketcherid;
		this.id = sketcherid + subid;
	};
	let _ = desktop.MolGrabberDialog.prototype = new desktop.Dialog();
	_.title = 'MolGrabber';
	_.setup = function() {
		let sb = [];
		sb.push('<div style="font-size:12px;text-align:center;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		if (this.message) {
			sb.push('<p>');
			sb.push(this.message);
			sb.push('</p>');
		}
		// Next is the MolGrabberCanvas, whose constructor will be called AFTER
		// the elements are in the DOM.
		sb.push('<canvas class="ChemDoodleWebComponent" id="');
		sb.push(this.id);
		sb.push('_mg"></canvas>');
		if (this.afterMessage) {
			sb.push('<p>');
			sb.push(this.afterMessage);
			sb.push('</p>');
		}
		sb.push('</div>');
		if (document.getElementById(this.sketcherid)) {
			let canvas = q('#' + this.sketcherid);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		this.canvas = new c.MolGrabberCanvas(this.id + '_mg', 200, 200);
		this.canvas.styles.backgroundColor = '#fff';
		this.canvas.repaint();
		let self = this;
		this.getElement().dialog({
			autoOpen : false,
			width : 250,
			buttons : self.buttons
		});
	};

})(ChemDoodle, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);

(function(c, desktop, q, document, undefined) {
	'use strict';
	desktop.PeriodicTableDialog = function(sketcher, subid) {
		this.sketcher = sketcher;
		this.id = sketcher.id + subid;
	};
	let _ = desktop.PeriodicTableDialog.prototype = new desktop.Dialog();
	_.title = 'Periodic Table';
	_.setup = function() {
		let sb = [];
		sb.push('<div style="text-align:center;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		sb.push('<canvas class="ChemDoodleWebComponents" id="');
		sb.push(this.id);
		sb.push('_pt"></canvas></div>');
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		this.canvas = new ChemDoodle.PeriodicTableCanvas(this.id + '_pt', 20);
		// set default to oxygen
		this.canvas.selected = this.canvas.cells[7];
		this.canvas.repaint();
		let self = this;
		this.canvas.click = function(evt) {
			if (this.hovered) {
				this.selected = this.hovered;
				let e = this.getHoveredElement();
				self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
				self.sketcher.stateManager.STATE_LABEL.label = e.symbol;
				if(self.sketcher.floatDrawTools){
					self.sketcher.toolbarManager.labelTray.open(self.sketcher.toolbarManager.buttonLabelPT);
				}else{
					self.sketcher.toolbarManager.buttonLabel.absorb(self.sketcher.toolbarManager.buttonLabelPT);
				}
				self.sketcher.toolbarManager.buttonLabel.select();
				this.repaint();
			}
		};
		this.getElement().dialog({
			autoOpen : false,
			width : 400,
			buttons : self.buttons
		});
	};

})(ChemDoodle, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);
(function(desktop, q, document, undefined) {
	'use strict';
	desktop.Popover = function(sketcher, id, free, onclose) {
		this.sketcher = sketcher;
		this.id = id;
		this.free = free;
		this.onclose = onclose;
	};
	let _ = desktop.Popover.prototype;
	_.getHiddenSource = function() {
		let sb = [];
		sb.push('<div style="display:none;position:absolute;z-index:10;border:1px #C1C1C1 solid;background:#F5F5F5;padding:5px;');
		if(this.free){
			// if free, round all edges
			sb.push('border-radius:5px;-moz-border-radius:5px;');
		}else{
			sb.push('border-bottom-left-radius:5px;-moz-border-radius-bottomleft:5px;border-bottom-right-radius:5px;-moz-border-radius-bottomright:5px;border-top-color:black;');
		}
		sb.push('" id="');
		sb.push(this.id);
		sb.push('">');
		sb.push(this.getContentSource());
		sb.push('</div>');
		return sb.join('');
	};
	_.setup = function() {
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(this.getHiddenSource());
		} else {
			document.writeln(this.getHiddenSource());
		}
		let tag = '#' + this.id;
		q(tag).hide();
		if(this.setupContent){
			this.setupContent();
		}
	};
	_.show = function(e){
		if(this.sketcher.modal){
			// apparently there is already another popover up, this shouldn't happen
			return false;
		}
		this.sketcher.modal = this;
		this.sketcher.doEventDefault = true;
		let component = q('#' + this.id);
		let self = this;
		if(this.free){
			component.fadeIn(200).position({
				my : 'center bottom',
				at : 'center top',
				of : e,
				collision : 'fit'
			});
		}else{
			component.slideDown(400).position({
				my : 'center top',
				at : 'center top',
				of : q('#' + this.sketcher.id),
				collision : 'fit'
			});
		}
		return false;
	};
	_.close = function(cancel){
		let component = q('#' + this.id);
		if(this.free){
			component.hide(0);
		}else{
			component.slideUp(400);
		}
		if(this.onclose){
			this.onclose(cancel);
		}
		this.sketcher.modal = undefined;
		this.sketcher.doEventDefault = false;
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);

(function(c, desktop, q, document, undefined) {
	'use strict';
	desktop.SaveFileDialog = function(id, sketcher) {
		this.id = id;
		this.sketcher = sketcher;
	};
	let _ = desktop.SaveFileDialog.prototype = new desktop.Dialog();
	_.title = 'Save File';
	_.clear = function() {
		q('#' + this.id + '_link').html('The file link will appear here.');
	};
	_.setup = function() {
		let sb = [];
		sb.push('<div style="font-size:12px;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		sb.push('<p>Select the file format to save your structure to and click on the <strong>Generate File</strong> button.</p>');
		sb.push('<select id="');
		sb.push(this.id);
		sb.push('_select">');
		sb.push('<option value="sk2">ACD/ChemSketch Document {sk2}');
		sb.push('<option value="ros">Beilstein ROSDAL {ros}');
		sb.push('<option value="cdx">Cambridgesoft ChemDraw Exchange {cdx}');
		sb.push('<option value="cdxml">Cambridgesoft ChemDraw XML {cdxml}');
		sb.push('<option value="mrv">ChemAxon Marvin Document {mrv}');
		sb.push('<option value="cml">Chemical Markup Language {cml}');
		sb.push('<option value="smiles">Daylight SMILES {smiles}');
		sb.push('<option value="icl" selected>iChemLabs ChemDoodle Document {icl}');
		sb.push('<option value="inchi">IUPAC InChI {inchi}');
		sb.push('<option value="jdx">IUPAC JCAMP-DX {jdx}');
		sb.push('<option value="skc">MDL ISIS Sketch {skc}');
		sb.push('<option value="tgf">MDL ISIS Sketch Transportable Graphics File {tgf}');
		sb.push('<option value="mol">MDL MOLFile {mol}');
		// sb.push('<option value="rdf">MDL RDFile {rdf}');
		// sb.push('<option value="rxn">MDL RXNFile {rxn}');
		sb.push('<option value="sdf">MDL SDFile {sdf}');
		sb.push('<option value="jme">Molinspiration JME String {jme}');
		sb.push('<option value="pdb">RCSB Protein Data Bank {pdb}');
		sb.push('<option value="mmd">Schr&ouml;dinger Macromodel {mmd}');
		sb.push('<option value="mae">Schr&ouml;dinger Maestro {mae}');
		sb.push('<option value="smd">Standard Molecular Data {smd}');
		sb.push('<option value="mol2">Tripos Mol2 {mol2}');
		sb.push('<option value="sln">Tripos SYBYL SLN {sln}');
		sb.push('<option value="xyz">XYZ {xyz}');
		sb.push('</select>');
		sb.push('<button type="button" id="');
		sb.push(this.id);
		sb.push('_button">');
		sb.push('Generate File</button>');
		sb.push('<p>When the file is written, a link will appear in the red-bordered box below, right-click on the link and choose the browser\'s <strong>Save As...</strong> function to save the file to your computer.</p>');
		sb.push('<div style="width:100%;height:30px;border:1px solid #c10000;text-align:center;" id="');
		sb.push(this.id);
		sb.push('_link">The file link will appear here.</div>');
		sb.push('<p><a href="http://www.chemdoodle.com" target="_blank">How do I use these files?</a></p>');
		sb.push('</div>');
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		let self = this;
		q('#' + this.id + '_button').click(function() {
			q('#' + self.id + '_link').html('Generating file, please wait...');
			ChemDoodle.iChemLabs.saveFile(self.sketcher.oneMolecule ? self.sketcher.molecules[0] : self.sketcher.lasso.getFirstMolecule(), {
				ext : q('#' + self.id + '_select').val()
			}, function(link) {
				q('#' + self.id + '_link').html('<a href="' + link + '"><span style="text-decoration:underline;">File is generated. Right-click on this link and Save As...</span></a>');
			});
		});
		this.getElement().dialog({
			autoOpen : false,
			width : 435,
			buttons : self.buttons
		});
	};

})(ChemDoodle, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);

(function(c, io, desktop, templateDepot, q, m, document, JSON, localStorage, undefined) {
	'use strict';

	let INTERPRETER = new io.JSONInterpreter();
	let allowedRegex = /[^A-z0-9]|\[|\]/g;

	desktop.TemplateDialog = function(sketcher, subid) {
		this.sketcher = sketcher;
		this.id = sketcher.id + subid;
	};
	let _ = desktop.TemplateDialog.prototype = new desktop.Dialog();
	_.title = 'Templates';
	_.setup = function() {
		let self = this;
		let sb = [];
		sb.push('<div style="font-size:12px;align-items:center;display:flex;flex-direction:column;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		// Next is the MolGrabberCanvas, whose constructor will be called AFTER
		// the elements are in the DOM.
		sb.push('<canvas class="ChemDoodleWebComponent" id="');
		sb.push(this.id);
		sb.push('_buffer" style="display:none;"></canvas>');
		sb.push('<canvas class="ChemDoodleWebComponent" id="');
		sb.push(this.id);
		sb.push('_attachment"></canvas>');
		sb.push('<div><select id="');
		sb.push(this.id);
		sb.push('_select">');
		for(let i = 0, ii = templateDepot.length; i<ii; i++){
			let group = templateDepot[i];
			sb.push('<option value="');
			sb.push(group.name);
			sb.push('">');
			sb.push(group.name);
			sb.push('</option>');
		}
		sb.push('</select>');
		sb.push('&nbsp;&nbsp;<button type="button" id="');
		sb.push(this.id);
		sb.push('_button_add">Add Template</button></div>');
		// have to include height for Safari...
		sb.push('<div id="');
		sb.push(this.id);
		sb.push('_scroll" style="width:100%;height:150px;flex-grow:1;overflow-y:scroll;overflow-x:hidden;background:#eee;padding-right:5px;padding-bottom:5px;">');
		for(let i = 0, ii = templateDepot.length; i<ii; i++){
			let group = templateDepot[i];
			group.condensedName = group.name.replace(allowedRegex, '');
			sb.push('<div style="display:flex;flex-wrap:wrap;justify-content:center;" id="');
			sb.push(this.id);
			sb.push('_');
			sb.push(group.condensedName);
			sb.push('_panel">');
			sb.push('</div>');
		}
		sb.push('</div>');
		sb.push('</div>');
		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.writeln(sb.join(''));
		}
		this.buffer = new c.ViewerCanvas(this.id + '_buffer', 100, 100);
		this.bufferElement = document.getElementById(this.buffer.id);
		this.canvas = new c.ViewerCanvas(this.id + '_attachment', 200, 200);
		this.canvas.mouseout = function(e){
			if(this.molecules.length!==0){
				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
					this.molecules[0].atoms[i].isHover = false;
				}
				this.repaint();
			}
		};
		this.canvas.touchend = this.canvas.mouseout;
		this.canvas.mousemove = function(e){
			if(this.molecules.length!==0){
				let closest=undefined;
				e.p.x = this.width / 2 + (e.p.x - this.width / 2) / this.styles.scale;
				e.p.y = this.height / 2 + (e.p.y - this.height / 2) / this.styles.scale;
				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
					let a = this.molecules[0].atoms[i];
					a.isHover = false;
					if(closest===undefined || e.p.distance(a)<e.p.distance(closest)){
						closest = a;
					}
				}
				if(e.p.distance(closest)<10){
					closest.isHover = true;
				}
				this.repaint();
			}
		};
		this.canvas.mousedown = function(e){
			if(this.molecules.length!==0){
				let cont = false;
				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
					let a = this.molecules[0].atoms[i];
					if(a.isHover){
						cont = true;
						break;
					}
				}
				// if no atom is hovered, then don't continue
				if(cont){
					for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
						let a = this.molecules[0].atoms[i];
						a.isSelected = false;
						if(a.isHover){
							a.isSelected = true;
							a.isHover = false;
							self.sketcher.stateManager.STATE_NEW_TEMPLATE.attachPos = i;
							self.sketcher.toolbarManager.buttonTemplate.select();
							self.sketcher.toolbarManager.buttonTemplate.getElement().click();
						}
					}
				}
				this.repaint();
			}
		};
		this.canvas.touchstart = function(e){self.canvas.mousemove(e);self.canvas.mousedown(e);}
		this.canvas.drawChildExtras = function(ctx, styles){
			ctx.strokeStyle = self.sketcher.styles.colorSelect;
			ctx.fillStyle = self.sketcher.styles.colorSelect;
			ctx.beginPath();
			ctx.arc(8, 8, 7, 0, m.PI * 2, false);
			ctx.stroke();
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText('Substitution Point', 18, 8);
			ctx.save();
			ctx.translate(this.width / 2, this.height / 2);
			ctx.rotate(styles.rotateAngle);
			ctx.scale(styles.scale, styles.scale);
			ctx.translate(-this.width / 2, -this.height / 2);
			if(this.molecules.length!==0){
				for(let i = 0, ii = this.molecules[0].atoms.length; i<ii; i++){
					this.molecules[0].atoms[i].drawDecorations(ctx, self.sketcher.styles);
				}
			}
			ctx.restore();
		};

		this.getElement().dialog({
			autoOpen : false,
			width : 260,
			height : 450,
			buttons : self.buttons,
			open : function(){
				if(!self.populated){
					self.populated = true;
					self.populate();
				}
			}
		});

		let select = q('#'+this.id+'_select');
		select.change(function(){
			let index = this.selectedIndex;
			for(let i = 0, ii = templateDepot.length; i<ii; i++){
				let group = templateDepot[i];
				q('#'+self.id+'_'+group.condensedName+'_panel').hide();
			}
			q('#'+self.id+'_'+templateDepot[index].condensedName+'_panel').show();
			q('#'+self.id+'_scroll').scrollTop(0);
			self.loadTemplate(index, 0, true);
		});

		q('#'+this.id+'_button_add').click(function(){
			if(self.sketcher.lasso.atoms.length===0){
				alert('Please select a structure to define a template.');
			}else{
				let cont = true;
				if(self.sketcher.lasso.atoms.length>1){
					let mol = self.sketcher.lasso.getFirstMolecule();
					for(let i = 1, ii = self.sketcher.lasso.atoms.length; i<ii; i++){
						if(mol!==self.sketcher.getMoleculeByAtom(self.sketcher.lasso.atoms[i])){
							cont = false;
							alert('Templates may only be defined of a single discrete structure.');
							break;
						}
					}
				}
				if(cont){
					let name = prompt("Please enter the template name:", "My template");
					if(name!==null){
						let userTemplates = templateDepot[templateDepot.length-1];
						let jsonm = INTERPRETER.molTo(self.sketcher.lasso.getFirstMolecule());
						let mol = INTERPRETER.molFrom(jsonm);
						let panel = q('#'+self.id+'_'+userTemplates.condensedName+'_panel');
						if(userTemplates.templates.length===0){
							panel.empty();
						}
						let t = {name:name, data:jsonm};
						mol.scaleToAverageBondLength(self.sketcher.styles.bondLength_2D);
						self.buffer.loadMolecule(mol);
						t.img = self.bufferElement.toDataURL('image/png');
						t.condensedName = t.name.replace(allowedRegex, '');
						panel.append('<div style="margin-left:5px;margin-top:5px;"><center><img src="'+t.img+'" id="'+self.id+'_'+t.condensedName+'" g="'+(templateDepot.length-1)+'" t="'+userTemplates.templates.length+'"style="width:100px;height:100px;" /><br>'+t.name+'</center></div>');
						let img = q('#'+self.id+'_'+t.condensedName);
						img.click(function(){
							self.loadTemplate(parseInt(this.getAttribute('g')), parseInt(this.getAttribute('t')), true);
						});
						img.hover(function(){q(this).css({'border':'1px solid '+self.sketcher.styles.colorHover, 'margin':'-1px'});}, function(){q(this).css({'border':'none', 'margin':'0px'});});
						userTemplates.templates.push(t);
						// IE/Edge doesn't allow localStorage from local files
						if(localStorage){
							localStorage.setItem('chemdoodle_user_templates', JSON.stringify(templateDepot[templateDepot.length-1].templates));
						}
					}
				}
			}
		});
	};
	_.loadTemplate = function(g, t, changeState){
		let template = templateDepot[g].templates[t];
		if(template){
			let loading = INTERPRETER.molFrom(template.data);
			loading.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
			let first = -1;
			let min = Infinity;
			for (let i = 0, ii = loading.atoms.length; i<ii; i++) {
				let a = loading.atoms[i];
				if (a.label==='C' && a.x < min) {
					first = i;
					min = a.x;
				}
			}
			if (first === -1) {
				first = 0;
			}
			loading.atoms[first].isSelected = true;
			this.canvas.loadMolecule(loading);
			this.sketcher.stateManager.STATE_NEW_TEMPLATE.template = template.data;
			this.sketcher.stateManager.STATE_NEW_TEMPLATE.attachPos = first;
			if(changeState){
				this.sketcher.toolbarManager.buttonTemplate.select();
				this.sketcher.toolbarManager.buttonTemplate.getElement().click();
			}
		}
	};
	_.populate = function() {
		// copy over styles from the sketcher
		this.canvas.styles = q.extend({}, this.sketcher.styles);
		this.canvas.styles.atoms_implicitHydrogens_2D = false;
		this.buffer.styles = q.extend({}, this.sketcher.styles);
		this.buffer.styles.atoms_implicitHydrogens_2D = false;
		// make template panels
		let self = this;
		for(let i = 0, ii = templateDepot.length; i<ii; i++){
			let group = templateDepot[i];
			let panel = q('#'+this.id+'_'+group.condensedName+'_panel');
			if(group.templates.length===0){
				panel.append('<div style="margin:5px;">There are no templates in this group.</div>');
			}else{
				for(let j = 0, jj = group.templates.length; j<jj; j++){
					let t = group.templates[j];
					let mol = INTERPRETER.molFrom(t.data);
					mol.scaleToAverageBondLength(this.sketcher.styles.bondLength_2D);
					this.buffer.loadMolecule(mol);
					t.img = this.bufferElement.toDataURL('image/png');
					t.condensedName = t.name.replace(allowedRegex, '');
					panel.append('<div style="margin-left:5px;margin-top:5px;"><center><img src="'+t.img+'" id="'+this.id+'_'+t.condensedName+'" g="'+i+'" t="'+j+'" style="width:100px;height:100px;border-radius:10px;" /><br>'+t.name+'</center></div>');
					let img = q('#'+this.id+'_'+t.condensedName);
					img.click(function(){
						self.loadTemplate(parseInt(this.getAttribute('g')), parseInt(this.getAttribute('t')), true);
					});
					img.hover(function(){q(this).css({'border':'1px solid '+self.sketcher.styles.colorHover, 'margin':'-1px'});}, function(){q(this).css({'border':'none', 'margin':'0px'});});
				}
			}
			if(i!==0){
				panel.hide();
			}
		}
		if(templateDepot.length!==0){
			q('#'+this.id+'_'+templateDepot[0].condensedName+'_panel').show();
			this.loadTemplate(0, 0, false);
		}
	};

})(ChemDoodle, ChemDoodle.io, ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.templateDepot, ChemDoodle.lib.jQuery, Math, document, JSON, localStorage);

(function(c, actions, gui, desktop, q, undefined) {
	'use strict';
	gui.DialogManager = function(sketcher) {
		let self = this;

		if (sketcher.useServices) {
			this.saveDialog = new desktop.SaveFileDialog(sketcher.id + '_save_dialog', sketcher);
		} else {
			this.saveDialog = new desktop.Dialog(sketcher.id, '_save_dialog', 'Save Molecule');
			this.saveDialog.message = 'Copy and paste the content of the textarea into a file and save it with the extension <strong>.mol</strong>.';
			this.saveDialog.includeTextArea = true;
			// You must keep this link displayed at all times to abide by the
			// license
			// Contact us for permission to remove it,
			// http://www.ichemlabs.com/contact-us
			this.saveDialog.afterMessage = '<a href="http://www.chemdoodle.com" target="_blank">How do I use MOLFiles?</a>';
		}
		this.saveDialog.setup();

		this.openPopup = new desktop.Popover(sketcher, sketcher.id+'_open_popover');
		this.openPopup.getContentSource = function(){
			let sb = ['<div style="width:320px;">'];
			//sb.push('<div width="100%">Open chemical file from your computer:</div><br><form action="demo_form.asp">'];
  			//sb.push('<input type="file" name="file" accept="image/*">');
  			//sb.push('<input onclick="alert(\'include your form code here.\');" type="button" value="Open" /*type="submit"*/>');
			//sb.push('</form>');
			//sb.push('<hr>
			// You must keep this link displayed at all times to abide by the
			// license
			// Contact us for permission to remove it,
			// http://www.ichemlabs.com/contact-us
			sb.push('<div width="100%">Or paste <em>MOLFile</em> or <em>ChemDoodle JSON</em> text and press the <strong>Load</strong> button.<br><br><center><a href="http://www.chemdoodle.com" target="_blank">Where do I get MOLFiles or ChemDoodle JSON?</a></center><br></div>');
			sb.push('<textarea rows="12" id="'+sketcher.id+'_open_text" style="width:100%;"></textarea>');
			sb.push('<br><button type="button" style="margin-left:270px;" id="'+sketcher.id+'_open_load">Load</button></div>');
			return sb.join('');
		};
		this.openPopup.setupContent = function(){
			q('#'+sketcher.id+'_open_load').click(function(){
				self.openPopup.close();
				let s = q('#'+sketcher.id+'_open_text').val();
				let newContent;
				if (s.indexOf('v2000') !== -1 || s.indexOf('V2000') !== -1) {
					newContent = {
						molecules : [ c.readMOL(s) ],
						shapes : []
					};
				} else if (s.charAt(0) === '{') {
					newContent = c.readJSON(s);
				}
				if (sketcher.oneMolecule && newContent && newContent.molecules.length > 0 && newContent.molecules[0].atoms.length > 0) {
					sketcher.historyManager.pushUndo(new actions.SwitchMoleculeAction(sketcher, newContent.molecules[0]));
				} else if (!sketcher.oneMolecule && newContent && (newContent.molecules.length > 0 || newContent.shapes.length > 0)) {
					sketcher.historyManager.pushUndo(new actions.SwitchContentAction(sketcher, newContent.molecules, newContent.shapes));
				} else {
					alert('No chemical content was recognized.');
				}
			});
		};
		this.openPopup.setup();

		this.atomQueryDialog = new desktop.AtomQueryDialog(sketcher, '_atom_query_dialog');
		this.atomQueryDialog.setup();

		this.bondQueryDialog = new desktop.BondQueryDialog(sketcher, '_bond_query_dialog');
		this.bondQueryDialog.setup();

		this.templateDialog = new desktop.TemplateDialog(sketcher, '_templates_dialog');
		this.templateDialog.setup();

		this.searchDialog = new desktop.MolGrabberDialog(sketcher.id, '_search_dialog');
		this.searchDialog.buttons = {
			'Load' : function() {
				let newMol = self.searchDialog.canvas.molecules[0];
				if (newMol && newMol.atoms.length > 0) {
					q(this).dialog('close');
					if (sketcher.oneMolecule) {
						if (newMol !== sketcher.molecule) {
							sketcher.historyManager.pushUndo(new actions.SwitchMoleculeAction(sketcher, newMol));
						}
					} else {
						sketcher.historyManager.pushUndo(new actions.AddContentAction(sketcher, self.searchDialog.canvas.molecules, self.searchDialog.canvas.shapes));
						sketcher.toolbarManager.buttonLasso.select();
						sketcher.toolbarManager.buttonLasso.getElement().click();
						let as = [];
						for(let i = 0, ii = self.searchDialog.canvas.molecules.length; i<ii; i++){
							as = as.concat(self.searchDialog.canvas.molecules[i].atoms);
						}
						sketcher.lasso.select(as, self.searchDialog.canvas.shapes);
					}
				}else{
					alert('After entering a search term, press the "Show Molecule" button to show it before loading. To close this dialog, press the "X" button to the top-right.');
				}
			}
		};
		this.searchDialog.setup();

		if (sketcher.setupScene) {
			this.stylesDialog = new desktop.SpecsDialog(sketcher, '_styles_dialog');
			this.stylesDialog.buttons = {
				'Done' : function() {
					q(this).dialog('close');
				}
			};
			this.stylesDialog.setup(this.stylesDialog, sketcher);
		}

		this.periodicTableDialog = new desktop.PeriodicTableDialog(sketcher, '_periodicTable_dialog');
		this.periodicTableDialog.buttons = {
			'Close' : function() {
				q(this).dialog('close');
			}
		};
		this.periodicTableDialog.setup();

		this.calculateDialog = new desktop.Dialog(sketcher.id, '_calculate_dialog', 'Calculations');
		this.calculateDialog.includeTextArea = true;
		// You must keep this link displayed at all times to abide by the license
		// Contact us for permission to remove it,
		// http://www.ichemlabs.com/contact-us
		this.calculateDialog.afterMessage = '<a href="http://www.chemdoodle.com" target="_blank">Want more calculations?</a>';
		this.calculateDialog.setup();

		this.inputDialog = new desktop.Dialog(sketcher.id, '_input_dialog', 'Input');
		this.inputDialog.message = 'Please input the rgroup number (must be a positive integer). Input "-1" to remove the rgroup.';
		this.inputDialog.includeTextField = true;
		this.inputDialog.buttons = {
			'Done' : function() {
				q(this).dialog('close');
				if (self.inputDialog.doneFunction) {
					self.inputDialog.doneFunction(self.inputDialog.getTextField().val());
				}
			}
		};
		this.inputDialog.setup();

		if(this.makeOtherDialogs){
			this.makeOtherDialogs(sketcher);
		}
	};

})(ChemDoodle, ChemDoodle.uis.actions, ChemDoodle.uis.gui, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);
(function(desktop, imageDepot, q, document, undefined) {
	'use strict';
	desktop.DropDown = function(id, tooltip, dummy) {
		this.id = id;
		this.tooltip = tooltip;
		this.dummy = dummy;
		this.buttonSet = new desktop.ButtonSet(id + '_set');
		this.buttonSet.buttonGroup = tooltip;
		this.defaultButton = undefined;
	};
	let _ = desktop.DropDown.prototype;
	_.getButtonSource = function() {
		let sb = [];
		sb.push('<button type="button" id="');
		sb.push(this.id);
		sb.push('" onclick="return false;" title="');
		sb.push(this.tooltip);
		sb.push('" style="box-sizing:border-box;margin-top:0px; margin-bottom:1px; padding:0px; height:28px; width:15px;"><img title="');
		sb.push(this.tooltip);
		sb.push('" width="9" height="20" src="');
		sb.push(imageDepot.getURI(imageDepot.ARROW_DOWN));
		sb.push('"></button>');
		return sb.join('');
	};
	_.getHiddenSource = function() {
		let sb = [];
		sb.push('<div style="display:none;position:absolute;z-index:10;border:1px #C1C1C1 solid;background:#F5F5F5;padding:5px;border-bottom-left-radius:5px;-moz-border-radius-bottomleft:5px;border-bottom-right-radius:5px;-moz-border-radius-bottomright:5px;" id="');
		sb.push(this.id);
		sb.push('_hidden">');
		sb.push(this.buttonSet.getSource(this.id + '_popup_set'));
		sb.push('</div>');
		return sb.join('');
	};
	_.setup = function() {
		if (!this.defaultButton) {
			this.defaultButton = this.buttonSet.buttons[0];
		}
		let tag = '#' + this.id;
		let qt = q(tag);
		qt.button();
		qt.click(function() {
			// mobile safari doesn't allow clicks to be triggered
			q(document).trigger('click');
			let qth = q(tag + '_hidden');
			qth.show().position({
				my : 'center top',
				at : 'center bottom',
				of : this,
				collision : 'fit'
			});
			q(document).one('click', function() {
				qth.hide();
			});
			return false;
		});
		this.buttonSet.setup();
		let self = this;
		q.each(this.buttonSet.buttons, function(index, value) {
			self.buttonSet.buttons[index].getElement().click(function() {
				self.dummy.absorb(self.buttonSet.buttons[index]);
				// both are needed, the first highlights, the second executes, select should be called first to get the tray to disappear
				self.dummy.select();
				self.dummy.getElement().click();
			});
		});
		self.dummy.absorb(this.defaultButton);
		this.defaultButton.select();
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot, ChemDoodle.lib.jQuery, document);

(function(desktop, imageDepot, q, undefined) {
	'use strict';
	desktop.DummyButton = function(id, tooltip) {
		this.id = id;
		this.toggle = false;
		this.tooltip = tooltip ? tooltip : '';
		this.func = undefined;
	};
	let _ = desktop.DummyButton.prototype = new desktop.Button();
	_.setup = function() {
		let self = this;
		this.getElement().click(function() {
			self.func();
		});
	};
	_.absorb = function(button) {
		q('#' + this.id + '_icon').attr('src', imageDepot.getURI(button.icon));
		this.func = button.func;
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot, ChemDoodle.lib.jQuery);
(function(desktop, q, undefined) {
	'use strict';
	desktop.TextButton = function(id, tooltip, func) {
		this.id = id;
		this.toggle = false;
		this.tooltip = tooltip ? tooltip : '';
		this.func = func ? func : undefined;
	};
	let _ = desktop.TextButton.prototype = new desktop.Button();
	_.getSource = function(buttonGroup) {
		let sb = [];
		if (this.toggle) {
			sb.push('<input type="radio" name="');
			sb.push(buttonGroup);
			sb.push('" id="');
			sb.push(this.id);
			sb.push('" title="');
			sb.push(this.tooltip);
			sb.push('" /><label for="');
			sb.push(this.id);
			sb.push('">');
			sb.push(this.tooltip);
			sb.push('</label>');
		} else {
			sb.push('<button type="button" id="');
			sb.push(this.id);
			sb.push('" onclick="return false;" title="');
			sb.push(this.tooltip);
			sb.push('"><label for="');
			sb.push(this.id);
			sb.push('">');
			sb.push(this.tooltip);
			sb.push('</label></button>');
		}
		return sb.join('');
	};

	_.check = function() {
		let element = this.getElement();
		element.prop('checked', true);
		element.button('refresh');
	};

	_.uncheck = function() {
		let element = this.getElement();
		element.removeAttr('checked');
		element.button('refresh');
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery);
(function(desktop, imageDepot, q, document, undefined) {
	'use strict';
	desktop.Tray = function(sketcher, id, dummy, columnCount) {
		this.sketcher = sketcher;
		this.id = id;
		this.tooltip = dummy.tooltip;
		this.dummy = dummy;
		this.dummy.toggle = true;
		this.buttonSet = new desktop.ButtonSet(id + '_set');
		this.buttonSet.columnCount = columnCount;
		this.buttonSet.buttonGroup = this.tooltip;
		this.defaultButton = undefined;
	};
	let _ = desktop.Tray.prototype;
	_.getSource = function(buttonGroup) {
		let sb = [];
		sb.push(this.dummy.getSource(buttonGroup));
		sb.push('<div style="display:none;position:absolute;z-index:11;border:none;background:#F5F5F5;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);" id="');
		sb.push(this.id);
		sb.push('_hidden">');
		sb.push(this.buttonSet.getSource(this.id + '_popup_set'));
		sb.push('</div>');
		return sb.join('');
	};
	_.setup = function() {
		this.dummy.setup(true);
		let button = this.dummy.getElement();
		// dummy doesn't call button() because when used in drop downs, the buttonset function is called
		// so we have to call it here
		button.button();
		if (!this.defaultButton) {
			this.defaultButton = this.buttonSet.buttons[0];
		}
		let self = this;
		let tag = '#' + this.id;
		button.click(function() {
			// have to duplicate here as scope makes "this" the button
			if(self.sketcher.openTray!==self){
				if(self.sketcher.openTray){
					self.sketcher.openTray.close();
				}
				self.sketcher.openTray = self;
				// mobile safari doesn't allow clicks to be triggered
				q(document).trigger('click');
				q(tag + '_hidden').show();
			}
			self.reposition();
		});
		this.buttonSet.setup();
		q.each(this.buttonSet.buttons, function(index, value) {
			self.buttonSet.buttons[index].getElement().click(function() {
				self.dummy.absorb(self.buttonSet.buttons[index]);
			});
		});
		this.dummy.absorb(this.defaultButton);
		this.defaultButton.select();
	};
	_.open = function(select) {
		if(this.sketcher.openTray!==this){
			if(this.sketcher.openTray){
				this.sketcher.openTray.close();
			}
			this.sketcher.openTray = this;
			// mobile safari doesn't allow clicks to be triggered
			q(document).trigger('click');
			q('#'+this.id + '_hidden').show();
		}
		if(select){
			this.dummy.absorb(select);
			select.select();
		}
		this.reposition();
	};
	_.reposition = function(){
		let button = q('#'+this.dummy.id+'_icon');
		q('#' + this.id + '_hidden').position({
			my : 'right-8 center',
			at : 'left center',
			of : button,
			collision: 'flip none'
		});
	};
	_.close = function(){
		q('#' + this.id + '_hidden').hide();
		this.sketcher.openTray = undefined;
	};

})(ChemDoodle.uis.gui.desktop, ChemDoodle.uis.gui.imageDepot, ChemDoodle.lib.jQuery, document);
(function(c, iChemLabs, io, structures, actions, gui, imageDepot, desktop, tools, states, q, document, undefined) {
	'use strict';
	gui.ToolbarManager = function(sketcher) {
		this.sketcher = sketcher;

		if(this.sketcher.floatDrawTools){
			this.drawTools = new desktop.FloatingToolbar(sketcher);
		}

		// open
		this.buttonOpen = new desktop.Button(sketcher.id + '_button_open', imageDepot.OPEN, 'Open', function() {
			sketcher.dialogManager.openPopup.show();
		});

        // save
		this.buttonSave = new desktop.Button(sketcher.id + '_button_save', imageDepot.SAVE, 'Save', function() {
			if (sketcher.useServices) {
				sketcher.dialogManager.saveDialog.clear();
			} else if (sketcher.oneMolecule) {
				sketcher.dialogManager.saveDialog.getTextArea().val(c.writeMOL(sketcher.molecules[0]));
			} else if (sketcher.lasso.isActive()) {
				sketcher.dialogManager.saveDialog.getTextArea().val(c.writeMOL(sketcher.lasso.getFirstMolecule()));
			}
			sketcher.dialogManager.saveDialog.open();
		});
		// template
		this.buttonTemplate = new desktop.Button(sketcher.id + '_button_template', imageDepot.TEMPLATES, 'Templates', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_TEMPLATE);
			sketcher.dialogManager.templateDialog.open();
		});
		this.buttonTemplate.toggle = true;
		// search
		this.buttonSearch = new desktop.Button(sketcher.id + '_button_search', imageDepot.SEARCH, 'Search', function() {
			sketcher.dialogManager.searchDialog.open();
		});
		// calculate
		this.buttonCalculate = new desktop.Button(sketcher.id + '_button_calculate', imageDepot.CALCULATE, 'Calculate', function() {
			let mol = sketcher.oneMolecule ? sketcher.molecules[0] : sketcher.lasso.getFirstMolecule();
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
					sketcher.dialogManager.calculateDialog.getTextArea().val(sb.join(''));
					sketcher.dialogManager.calculateDialog.open();
				});
			}
		});

		// move
		this.buttonMove = new desktop.Button(sketcher.id + '_button_move', imageDepot.MOVE, 'Move', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_MOVE);
		});
		this.buttonMove.toggle = true;
		// erase
		this.buttonErase = new desktop.Button(sketcher.id + '_button_erase', imageDepot.ERASE, 'Erase', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_ERASE);
		});
		this.buttonErase.toggle = true;
		// center
		this.buttonCenter = new desktop.Button(sketcher.id + '_button_center', imageDepot.CENTER, 'Center', function() {
			let dif = new structures.Point(sketcher.width / 2, sketcher.height / 2);
			let bounds = sketcher.getContentBounds();
			dif.x -= (bounds.maxX + bounds.minX) / 2;
			dif.y -= (bounds.maxY + bounds.minY) / 2;
			sketcher.historyManager.pushUndo(new actions.MoveAction(sketcher.getAllPoints(), dif));
		});

		this.buttonClean = new desktop.Button(sketcher.id + '_button_clean', imageDepot.OPTIMIZE, 'Clean', function() {
			let mol = sketcher.oneMolecule ? sketcher.molecules[0] : sketcher.lasso.getFirstMolecule();
			if (mol) {
				let json = new io.JSONInterpreter();
				iChemLabs._contactServer('optimize', {
					'mol' : json.molTo(mol)
				}, {
					dimension : 2
				}, function(content) {
					let optimized = json.molFrom(content.mol);
					let optCenter = optimized.getCenter();
					let dif = sketcher.oneMolecule ? new structures.Point(sketcher.width / 2, sketcher.height / 2) : mol.getCenter();
					dif.sub(optCenter);
					for ( let i = 0, ii = optimized.atoms.length; i < ii; i++) {
						optimized.atoms[i].add(dif);
					}
					sketcher.historyManager.pushUndo(new actions.ChangeCoordinatesAction(mol.atoms, optimized.atoms));
				});
			}
		});

		// lasso set
		this.makeLassoSet(this);

		// cut/copy/paste set
		this.makeCopySet(this);

		// scale set
		this.makeScaleSet(this);

		// flip set
		this.makeFlipSet(this);

		// history set
		this.makeHistorySet(this);

		// label set
		this.makeLabelSet(this);

		// query
		this.buttonTextInput = new desktop.Button(sketcher.id + '_button_text_input', imageDepot.TEXT, 'Set Atom Label', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_TEXT_INPUT);
		});
		this.buttonTextInput.toggle = true;
		this.buttonQuery = new desktop.Button(sketcher.id + '_button_query', imageDepot.QUERY, 'Set Query to Atom or Bond', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_QUERY);
		});
		this.buttonQuery.toggle = true;

		// bond set
		this.makeBondSet(this);

		// ring set
		this.makeRingSet(this);

		// chain
		this.buttonChain = new desktop.Button(sketcher.id + '_button_chain', imageDepot.CHAIN_CARBON, 'Add Carbon Chain', function() {
			sketcher.stateManager.setState(sketcher.stateManager.STATE_NEW_CHAIN);
		});
		this.buttonChain.toggle = true;

		// attribute set
		this.makeAttributeSet(this);

		// shape set
		this.makeShapeSet(this);

		if(this.makeOtherButtons){
			this.makeOtherButtons(this);
		}
	};
	let _ = gui.ToolbarManager.prototype;
	_.write = function() {
		let sb = ['<div style="font-size:10px;">'];
		let bg = this.sketcher.id + '_main_group';
		if (this.sketcher.oneMolecule) {
			sb.push(this.buttonMove.getSource(bg));
		} else {
			sb.push(this.buttonLasso.getSource(bg));
		}
		sb.push(this.buttonErase.getSource(bg));
		sb.push(this.buttonCenter.getSource());
		if (this.sketcher.useServices) {
			sb.push(this.buttonClean.getSource());
		}
		sb.push(this.flipSet.getSource());
		sb.push(this.historySet.getSource());
		if (!this.sketcher.oneMolecule) {
			sb.push(this.copySet.getSource());
		}
		sb.push(this.scaleSet.getSource());
		sb.push(this.buttonOpen.getSource());
		sb.push(this.buttonSave.getSource());
		sb.push(this.buttonTemplate.getSource(bg));
		if (this.sketcher.useServices) {
			sb.push(this.buttonSearch.getSource());
			sb.push(this.buttonCalculate.getSource());
		}
		if(!this.sketcher.floatDrawTools){
			sb.push('<br>');
			if(desktop.TextInput){
				sb.push(this.buttonTextInput.getSource(bg));
			}
			sb.push(this.labelSet.getSource(bg));
			if (this.sketcher.includeQuery) {
				sb.push(this.buttonQuery.getSource(bg));
			}
			sb.push(this.attributeSet.getSource(bg));
			sb.push(this.bondSet.getSource(bg));
			sb.push(this.ringSet.getSource(bg));
			sb.push(this.buttonChain.getSource(bg));
			if (!this.sketcher.oneMolecule) {
				sb.push(this.shapeSet.getSource(bg));
			}
		}
		sb.push('</div>');
		if(this.sketcher.floatDrawTools){
			if(desktop.TextInput){
				this.drawTools.components.splice(0, 0, this.buttonTextInput);
			}
			if (this.sketcher.includeQuery) {
				this.drawTools.components.splice((desktop.TextInput?1:0), 0, this.buttonQuery);
			}
			this.drawTools.components.splice(this.drawTools.components.length-(this.sketcher.oneMolecule?1:3), 0, this.buttonChain);
			if (!this.sketcher.oneMolecule) {
				this.drawTools.components.push(this.buttonVAP);
			}
			sb.push(this.drawTools.getSource(bg));
		}

		if (document.getElementById(this.sketcher.id)) {
			let canvas = q('#' + this.sketcher.id);
			canvas.before(sb.join(''));
		} else {
			document.write(sb.join(''));
		}
	};
	_.setup = function() {
		if (this.sketcher.oneMolecule) {
			this.buttonMove.setup(true);
		} else {
			this.buttonLasso.setup();
		}
		this.buttonErase.setup(true);
		this.buttonCenter.setup();
		if (this.sketcher.useServices) {
			this.buttonClean.setup();
		}
		this.flipSet.setup();
		this.historySet.setup();
		if (!this.sketcher.oneMolecule) {
			this.copySet.setup();
		}
		this.scaleSet.setup();
		this.buttonOpen.setup();
		this.buttonSave.setup();
		this.buttonTemplate.setup(true);
		if (this.sketcher.useServices) {
			this.buttonSearch.setup();
			this.buttonCalculate.setup();
		}
		if(this.sketcher.floatDrawTools){
			this.drawTools.setup();
			this.buttonBond.getElement().click();
		}else{
			if(desktop.TextInput){
				this.buttonTextInput.setup(true);
			}
			this.labelSet.setup();
			if (this.sketcher.includeQuery) {
				this.buttonQuery.setup(true);
			}
			this.attributeSet.setup();
			this.bondSet.setup();
			this.ringSet.setup();
			this.buttonChain.setup(true);
			if (!this.sketcher.oneMolecule) {
				this.shapeSet.setup();
			}
			this.buttonSingle.getElement().click();
		}

		this.buttonUndo.disable();
		this.buttonRedo.disable();
		if (!this.sketcher.oneMolecule) {
			this.buttonCut.disable();
			this.buttonCopy.disable();
			this.buttonPaste.disable();
			this.buttonFlipVert.disable();
			this.buttonFlipHor.disable();
			if (this.sketcher.useServices) {
				this.buttonClean.disable();
				this.buttonCalculate.disable();
				this.buttonSave.disable();
			}
		}
	};

	_.makeCopySet = function(self) {
		this.buttonCut = new desktop.Button(self.sketcher.id + '_button_cut', imageDepot.CUT, 'Cut', function() {
			self.sketcher.copyPasteManager.copy(true);
		});
		this.buttonCopy = new desktop.Button(self.sketcher.id + '_button_copy', imageDepot.COPY, 'Copy', function() {
			self.sketcher.copyPasteManager.copy(false);
		});
		this.buttonPaste = new desktop.Button(self.sketcher.id + '_button_paste', imageDepot.PASTE, 'Paste', function() {
			self.sketcher.copyPasteManager.paste();
		});

		this.copySet = new desktop.ButtonSet(self.sketcher.id + '_buttons_copy');
		this.copySet.toggle = false;
		this.copySet.buttons.push(this.buttonCut);
		this.copySet.buttons.push(this.buttonCopy);
		this.copySet.buttons.push(this.buttonPaste);
	};
	_.makeScaleSet = function(self) {
		this.buttonScalePlus = new desktop.Button(self.sketcher.id + '_button_scale_plus', imageDepot.ZOOM_IN, 'Increase Scale', function() {
			self.sketcher.styles.scale *= 1.5;
			self.sketcher.checkScale();
			self.sketcher.repaint();
		});
		this.buttonScaleMinus = new desktop.Button(self.sketcher.id + '_button_scale_minus', imageDepot.ZOOM_OUT, 'Decrease Scale', function() {
			self.sketcher.styles.scale /= 1.5;
			self.sketcher.checkScale();
			self.sketcher.repaint();
		});

		this.scaleSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_scale');
		this.scaleSet.toggle = false;
		this.scaleSet.buttons.push(this.buttonScalePlus);
		this.scaleSet.buttons.push(this.buttonScaleMinus);
	};
	_.makeLassoSet = function(self) {
		this.buttonLasso = new desktop.Button(self.sketcher.id + '_button_lasso_lasso', imageDepot.LASSO, 'Lasso Tool', function() {
            self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LASSO);
            self.sketcher.lasso.mode = tools.Lasso.MODE_LASSO;
            if (!self.sketcher.lasso.isActive()) {
                self.sketcher.lasso.selectNextMolecule();
            }
        });
	};
	_.makeFlipSet = function(self) {
		let action = function(horizontal){
			let ps = self.sketcher.oneMolecule?self.sketcher.getAllPoints():self.sketcher.lasso.getAllPoints();
			let bs = [];
			let lbs = self.sketcher.oneMolecule?self.sketcher.getAllBonds():self.sketcher.lasso.getBonds();
			for(let i = 0, ii = lbs.length; i<ii; i++){
				let b = lbs[i];
				if(b.bondOrder===1 && (b.stereo===structures.Bond.STEREO_PROTRUDING || b.stereo===structures.Bond.STEREO_RECESSED)){
					bs.push(b);
				}
			}
			self.sketcher.historyManager.pushUndo(new actions.FlipAction(ps, bs, horizontal));
		}
		this.buttonFlipVert = new desktop.Button(self.sketcher.id + '_button_flip_hor', imageDepot.FLIP_HOR, 'Flip Horizontally', function() {
			action(true);
		});
		this.buttonFlipHor = new desktop.Button(self.sketcher.id + '_button_flip_ver', imageDepot.FLIP_VER, 'Flip Vertically', function() {
			action(false);
		});

		this.flipSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_flip');
		this.flipSet.toggle = false;
		this.flipSet.buttons.push(this.buttonFlipVert);
		this.flipSet.buttons.push(this.buttonFlipHor);
	};
	_.makeHistorySet = function(self) {
		this.buttonUndo = new desktop.Button(self.sketcher.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
			self.sketcher.historyManager.undo();
		});
		this.buttonRedo = new desktop.Button(self.sketcher.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
			self.sketcher.historyManager.redo();
		});

		this.historySet = new desktop.ButtonSet(self.sketcher.id + '_buttons_history');
		this.historySet.toggle = false;
		this.historySet.buttons.push(this.buttonUndo);
		this.historySet.buttons.push(this.buttonRedo);
	};
	_.makeLabelSet = function(self) {
		this.buttonLabelH = new desktop.Button(self.sketcher.id + '_button_label_h', imageDepot.HYDROGEN, 'Hydrogen', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'H';
		});
		this.buttonLabelC = new desktop.Button(self.sketcher.id + '_button_label_c', imageDepot.CARBON, 'Carbon', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'C';
		});
		this.buttonLabelN = new desktop.Button(self.sketcher.id + '_button_label_n', imageDepot.NITROGEN, 'Nitrogen', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'N';
		});
		this.buttonLabelO = new desktop.Button(self.sketcher.id + '_button_label_o', imageDepot.OXYGEN, 'Oxygen', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'O';
		});
		this.buttonLabelF = new desktop.Button(self.sketcher.id + '_button_label_f', imageDepot.FLUORINE, 'Fluorine', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'F';
		});
		this.buttonLabelCl = new desktop.Button(self.sketcher.id + '_button_label_cl', imageDepot.CHLORINE, 'Chlorine', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'Cl';
		});
		this.buttonLabelBr = new desktop.Button(self.sketcher.id + '_button_label_br', imageDepot.BROMINE, 'Bromine', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'Br';
		});
		this.buttonLabelI = new desktop.Button(self.sketcher.id + '_button_label_i', imageDepot.IODINE, 'Iodine', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'I';
		});
		this.buttonLabelP = new desktop.Button(self.sketcher.id + '_button_label_p', imageDepot.PHOSPHORUS, 'Phosphorus', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'P';
		});
		this.buttonLabelS = new desktop.Button(self.sketcher.id + '_button_label_s', imageDepot.SULFUR, 'Sulfur', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'S';
		});
		this.buttonLabelSi = new desktop.Button(self.sketcher.id + '_button_label_si', imageDepot.SILICON, 'Silicon', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
			self.sketcher.stateManager.STATE_LABEL.label = 'Si';
		});
		this.buttonLabelPT = new desktop.Button(self.sketcher.id + '_button_label_pt', imageDepot.PERIODIC_TABLE, 'Choose Symbol', function() {
			if(self.sketcher.dialogManager.periodicTableDialog.canvas.selected){
				self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LABEL);
				self.sketcher.stateManager.STATE_LABEL.label = self.sketcher.dialogManager.periodicTableDialog.canvas.selected.element.symbol;
			}
			self.sketcher.dialogManager.periodicTableDialog.open();
		});

		this.buttonLabel = new desktop.DummyButton(self.sketcher.id + '_button_label', 'Set Label');
		if(self.sketcher.floatDrawTools){
			this.labelTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_label', this.buttonLabel, 3);
			this.labelTray.defaultButton = this.buttonLabelO;
			this.labelTray.buttonSet.buttons.push(this.buttonLabelH);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelC);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelN);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelO);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelF);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelCl);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelBr);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelI);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelP);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelS);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelSi);
			this.labelTray.buttonSet.buttons.push(this.buttonLabelPT);
			this.drawTools.components.push(this.labelTray);
		}else{
			this.labelSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_label');
			this.labelSet.buttons.push(this.buttonLabel);
			this.labelSet.addDropDown('More Labels');
			this.labelSet.dropDown.defaultButton = this.buttonLabelO;
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelH);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelC);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelN);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelO);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelF);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelCl);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelBr);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelI);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelP);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelS);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelSi);
			this.labelSet.dropDown.buttonSet.buttons.push(this.buttonLabelPT);
		}
	};
	_.makeBondSet = function(self) {
		this.buttonSingle = new desktop.Button(self.sketcher.id + '_button_bond_single', imageDepot.BOND_SINGLE, 'Single Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});
		this.buttonRecessed = new desktop.Button(self.sketcher.id + '_button_bond_recessed', imageDepot.BOND_RECESSED, 'Recessed Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_RECESSED;
		});
		this.buttonProtruding = new desktop.Button(self.sketcher.id + '_button_bond_protruding', imageDepot.BOND_PROTRUDING, 'Protruding Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_PROTRUDING;
		});
		this.buttonDouble = new desktop.Button(self.sketcher.id + '_button_bond_double', imageDepot.BOND_DOUBLE, 'Double Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 2;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});
		this.buttonZero = new desktop.Button(self.sketcher.id + '_button_bond_zero', imageDepot.BOND_ZERO, 'Zero Bond (Ionic/Hydrogen)', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 0;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});
		this.buttonHalf = new desktop.Button(self.sketcher.id + '_button_bond_half', imageDepot.BOND_HALF, 'Half Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 0.5;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});
		this.buttonWavy = new desktop.Button(self.sketcher.id + '_button_bond_wavy', imageDepot.BOND_WAVY, 'Wavy Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_AMBIGUOUS;
		});
		this.buttonResonance = new desktop.Button(self.sketcher.id + '_button_bond_resonance', imageDepot.BOND_RESONANCE, 'Resonance Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 1.5;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});
		this.buttonDoubleAmbiguous = new desktop.Button(self.sketcher.id + '_button_bond_ambiguous_double', imageDepot.BOND_DOUBLE_AMBIGUOUS, 'Ambiguous Double Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 2;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_AMBIGUOUS;
		});
		this.buttonTriple = new desktop.Button(self.sketcher.id + '_button_bond_triple', imageDepot.BOND_TRIPLE, 'Triple Bond', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_BOND);
			self.sketcher.stateManager.STATE_NEW_BOND.bondOrder = 3;
			self.sketcher.stateManager.STATE_NEW_BOND.stereo = structures.Bond.STEREO_NONE;
		});

		this.buttonBond = new desktop.DummyButton(self.sketcher.id + '_button_bond', self.sketcher.floatDrawTools?'Draw Bond':'Other Bond');
		if(self.sketcher.floatDrawTools){
			this.bondTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_bond', this.buttonBond, 2);
			this.bondTray.defaultButton = this.buttonSingle;
			this.bondTray.buttonSet.buttons.push(this.buttonZero);
			this.bondTray.buttonSet.buttons.push(this.buttonHalf);
			this.bondTray.buttonSet.buttons.push(this.buttonWavy);
			this.bondTray.buttonSet.buttons.push(this.buttonSingle);
			this.bondTray.buttonSet.buttons.push(this.buttonRecessed);
			this.bondTray.buttonSet.buttons.push(this.buttonProtruding);
			this.bondTray.buttonSet.buttons.push(this.buttonDoubleAmbiguous);
			this.bondTray.buttonSet.buttons.push(this.buttonDouble);
			this.bondTray.buttonSet.buttons.push(this.buttonResonance);
			this.bondTray.buttonSet.buttons.push(this.buttonTriple);
			this.drawTools.components.push(this.bondTray);
		}else{
			this.bondSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_bond');
			this.bondSet.buttons.push(this.buttonSingle);
			this.bondSet.buttons.push(this.buttonRecessed);
			this.bondSet.buttons.push(this.buttonProtruding);
			this.bondSet.buttons.push(this.buttonDouble);
			this.bondSet.buttons.push(this.buttonBond);
			this.bondSet.addDropDown('More Bonds');
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonZero);
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonHalf);
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonWavy);
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonResonance);
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonDoubleAmbiguous);
			this.bondSet.dropDown.buttonSet.buttons.push(this.buttonTriple);
			this.bondSet.dropDown.defaultButton = this.buttonTriple;
		}
	};
	_.makeRingSet = function(self) {
		this.buttonCyclohexane = new desktop.Button(self.sketcher.id + '_button_ring_cyclohexane', imageDepot.CYCLOHEXANE, 'Cyclohexane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 6;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonBenzene = new desktop.Button(self.sketcher.id + '_button_ring_benzene', imageDepot.BENZENE, 'Benzene Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 6;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = true;
		});
		this.buttonCyclopropane = new desktop.Button(self.sketcher.id + '_button_ring_cyclopropane', imageDepot.CYCLOPROPANE, 'Cyclopropane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 3;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonCyclobutane = new desktop.Button(self.sketcher.id + '_button_ring_cyclobutane', imageDepot.CYCLOBUTANE, 'Cyclobutane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 4;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonCyclopentane = new desktop.Button(self.sketcher.id + '_button_ring_cyclopentane', imageDepot.CYCLOPENTANE, 'Cyclopentane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 5;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonCycloheptane = new desktop.Button(self.sketcher.id + '_button_ring_cycloheptane', imageDepot.CYCLOHEPTANE, 'Cycloheptane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 7;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonCyclooctane = new desktop.Button(self.sketcher.id + '_button_ring_cyclooctane', imageDepot.CYCLOOCTANE, 'Cyclooctane Ring', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = 8;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});
		this.buttonRingArbitrary = new desktop.Button(self.sketcher.id + '_button_ring_arbitrary', imageDepot.RING_ARBITRARY, 'Arbitrary Ring Size Tool', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_NEW_RING);
			self.sketcher.stateManager.STATE_NEW_RING.numSides = -1;
			self.sketcher.stateManager.STATE_NEW_RING.unsaturated = false;
		});

		this.buttonRing = new desktop.DummyButton(self.sketcher.id + '_button_ring', self.sketcher.floatDrawTools?'Draw Ring':'Other Ring');
		if(self.sketcher.floatDrawTools){
			this.ringTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_ring', this.buttonRing, 2);
			this.ringTray.defaultButton = this.buttonCyclohexane;
			this.ringTray.buttonSet.buttons.push(this.buttonCyclopropane);
			this.ringTray.buttonSet.buttons.push(this.buttonCyclobutane);
			this.ringTray.buttonSet.buttons.push(this.buttonCyclopentane);
			this.ringTray.buttonSet.buttons.push(this.buttonCyclohexane);
			this.ringTray.buttonSet.buttons.push(this.buttonCycloheptane);
			this.ringTray.buttonSet.buttons.push(this.buttonCyclooctane);
			this.ringTray.buttonSet.buttons.push(this.buttonBenzene);
			this.ringTray.buttonSet.buttons.push(this.buttonRingArbitrary);
			this.drawTools.components.push(this.ringTray);
		}else{
			this.ringSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_ring');
			this.ringSet.buttons.push(this.buttonCyclohexane);
			this.ringSet.buttons.push(this.buttonBenzene);
			this.ringSet.buttons.push(this.buttonRing);
			this.ringSet.addDropDown('More Rings');
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonCyclopropane);
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonCyclobutane);
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonCyclopentane);
			this.ringSet.dropDown.defaultButton = this.buttonCyclopentane;
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonCycloheptane);
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonCyclooctane);
			this.ringSet.dropDown.buttonSet.buttons.push(this.buttonRingArbitrary);
		}
	};
	_.makeAttributeSet = function(self) {
		this.buttonChargePlus = new desktop.Button(self.sketcher.id + '_button_attribute_charge_increment', imageDepot.INCREASE_CHARGE, 'Increase Charge', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_CHARGE);
			self.sketcher.stateManager.STATE_CHARGE.delta = 1;
		});
		this.buttonChargeMinus = new desktop.Button(self.sketcher.id + '_button_attribute_charge_decrement', imageDepot.DECREASE_CHARGE, 'Decrease Charge', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_CHARGE);
			self.sketcher.stateManager.STATE_CHARGE.delta = -1;
		});
		this.buttonPairPlus = new desktop.Button(self.sketcher.id + '_button_attribute_lonePair_increment', imageDepot.ADD_LONE_PAIR, 'Add Lone Pair', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LONE_PAIR);
			self.sketcher.stateManager.STATE_LONE_PAIR.delta = 1;
		});
		this.buttonPairMinus = new desktop.Button(self.sketcher.id + '_button_attribute_lonePair_decrement', imageDepot.REMOVE_LONE_PAIR, 'Remove Lone Pair', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_LONE_PAIR);
			self.sketcher.stateManager.STATE_LONE_PAIR.delta = -1;
		});
		this.buttonRadicalPlus = new desktop.Button(self.sketcher.id + '_button_attribute_radical_increment', imageDepot.ADD_RADICAL, 'Add Radical', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_RADICAL);
			self.sketcher.stateManager.STATE_RADICAL.delta = 1;
		});
		this.buttonRadicalMinus = new desktop.Button(self.sketcher.id + '_button_attribute_radical_decrement', imageDepot.REMOVE_RADICAL, 'Remove Radical', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_RADICAL);
			self.sketcher.stateManager.STATE_RADICAL.delta = -1;
		});

		this.buttonAttribute = new desktop.DummyButton(self.sketcher.id + '_button_attribute', 'Attributes');
		if(self.sketcher.floatDrawTools){
			this.attributeTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_attribute', this.buttonAttribute, 2);
			this.attributeTray.defaultButton = this.buttonChargePlus;
			this.attributeTray.buttonSet.buttons.push(this.buttonChargeMinus);
			this.attributeTray.buttonSet.buttons.push(this.buttonChargePlus);
			this.attributeTray.buttonSet.buttons.push(this.buttonPairMinus);
			this.attributeTray.buttonSet.buttons.push(this.buttonPairPlus);
			this.attributeTray.buttonSet.buttons.push(this.buttonRadicalMinus);
			this.attributeTray.buttonSet.buttons.push(this.buttonRadicalPlus);
			this.drawTools.components.push(this.attributeTray);
		}else{
			this.attributeSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_attribute');
			this.attributeSet.buttons.push(this.buttonAttribute);
			this.attributeSet.addDropDown('More Attributes');
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonChargePlus);
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonChargeMinus);
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonPairPlus);
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonPairMinus);
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonRadicalPlus);
			this.attributeSet.dropDown.buttonSet.buttons.push(this.buttonRadicalMinus);
		}
	};
	_.makeShapeSet = function(self) {
		this.buttonArrowSynthetic = new desktop.Button(self.sketcher.id + '_button_shape_arrow_synthetic', imageDepot.ARROW_SYNTHETIC, 'Synthetic Arrow', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
			self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_SYNTHETIC;
		});
		this.buttonArrowRetrosynthetic = new desktop.Button(self.sketcher.id + '_button_shape_arrow_retrosynthetic', imageDepot.ARROW_RETROSYNTHETIC, 'Retrosynthetic Arrow', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
			self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_RETROSYNTHETIC;
		});
		this.buttonArrowResonance = new desktop.Button(self.sketcher.id + '_button_shape_arrow_resonance', imageDepot.ARROW_RESONANCE, 'Resonance Arrow', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
			self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_RESONANCE;
		});
		this.buttonArrowEquilibrum = new desktop.Button(self.sketcher.id + '_button_shape_arrow_equilibrium', imageDepot.ARROW_EQUILIBRIUM, 'Equilibrium Arrow', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
			self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.ARROW_EQUILIBRIUM;
		});
		this.buttonReactionMapping = new desktop.Button(self.sketcher.id + '_button_reaction_mapping', imageDepot.ATOM_REACTION_MAP, 'Reaction Mapping', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
			self.sketcher.stateManager.STATE_PUSHER.numElectron = -10;
		});
		this.buttonPusher1 = new desktop.Button(self.sketcher.id + '_button_shape_pusher_1', imageDepot.PUSHER_SINGLE, 'Single Electron Pusher', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
			self.sketcher.stateManager.STATE_PUSHER.numElectron = 1;
		});
		this.buttonPusher2 = new desktop.Button(self.sketcher.id + '_button_shape_pusher_2', imageDepot.PUSHER_DOUBLE, 'Electron Pair Pusher', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
			self.sketcher.stateManager.STATE_PUSHER.numElectron = 2;
		});
		this.buttonPusherBond = new desktop.Button(self.sketcher.id + '_button_shape_pusher_bond_forming', imageDepot.PUSHER_BOND_FORMING, 'Bond Forming Pusher', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
			self.sketcher.stateManager.STATE_PUSHER.numElectron = -1;
		});
		this.buttonReactionMapping = new desktop.Button(self.sketcher.id + '_button_reaction_mapping', imageDepot.ATOM_REACTION_MAP, 'Reaction Mapping', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_PUSHER);
			self.sketcher.stateManager.STATE_PUSHER.numElectron = -10;
		});
		this.buttonBracket = new desktop.Button(self.sketcher.id + '_button_shape_charge_bracket', imageDepot.BRACKET_CHARGE, 'Bracket', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_SHAPE);
			self.sketcher.stateManager.STATE_SHAPE.shapeType = states.ShapeState.BRACKET;
			self.sketcher.repaint();
		});
		this.buttonDynamicBracket = new desktop.Button(self.sketcher.id + '_button_bracket_dynamic', imageDepot.BRACKET_DYNAMIC, 'Repeating Group', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_DYNAMIC_BRACKET);
		});
		this.buttonVAP = new desktop.Button(self.sketcher.id + '_button_vap', imageDepot.VARIABLE_ATTACHMENT_POINTS, 'Variable Attachment Points', function() {
			self.sketcher.stateManager.setState(self.sketcher.stateManager.STATE_VAP);
		});

		if(!this.sketcher.oneMolecule){
			this.buttonShape = new desktop.DummyButton(self.sketcher.id + '_button_shape', self.sketcher.floatDrawTools?'Reactions':'Shapes');
			if(self.sketcher.floatDrawTools){
				// we have to set toggle to true for buttons we are including as parent options
				this.buttonVAP.toggle = true;
				this.shapeTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_shape', this.buttonShape, 4);
				this.shapeTray.defaultButton = this.buttonArrowSynthetic;
				this.shapeTray.buttonSet.buttons.push(this.buttonArrowSynthetic);
				this.shapeTray.buttonSet.buttons.push(this.buttonArrowRetrosynthetic);
				this.shapeTray.buttonSet.buttons.push(this.buttonArrowResonance);
				this.shapeTray.buttonSet.buttons.push(this.buttonArrowEquilibrum);
				this.shapeTray.buttonSet.buttons.push(this.buttonPusher1);
				this.shapeTray.buttonSet.buttons.push(this.buttonPusher2);
				this.shapeTray.buttonSet.buttons.push(this.buttonPusherBond);
				this.shapeTray.buttonSet.buttons.push(this.buttonReactionMapping);
				this.drawTools.components.push(this.shapeTray);
				this.buttonBrackets = new desktop.DummyButton(self.sketcher.id + '_button_bracket', 'Brackets');
				this.bracketTray = new desktop.Tray(self.sketcher, self.sketcher.id + '_buttons_bracket', this.buttonBrackets, 2);
				this.bracketTray.buttonSet.buttons.push(this.buttonBracket);
				this.bracketTray.buttonSet.buttons.push(this.buttonDynamicBracket);
				this.drawTools.components.push(this.bracketTray);
			}else{
				this.shapeSet = new desktop.ButtonSet(self.sketcher.id + '_buttons_shape');
				this.shapeSet.buttons.push(this.buttonShape);
				this.shapeSet.addDropDown('More Shapes');
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowSynthetic);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowRetrosynthetic);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowResonance);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonArrowEquilibrum);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusher1);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusher2);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonPusherBond);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonReactionMapping);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonBracket);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonDynamicBracket);
				this.shapeSet.dropDown.buttonSet.buttons.push(this.buttonVAP);
			}
		}
	};

})(ChemDoodle, ChemDoodle.iChemLabs, ChemDoodle.io, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.gui, ChemDoodle.uis.gui.imageDepot, ChemDoodle.uis.gui.desktop, ChemDoodle.uis.tools, ChemDoodle.uis.states, ChemDoodle.lib.jQuery, document);

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
	tools.Lasso.MODE_LASSO_SHAPES = 'shapes';
	tools.Lasso.MODE_RECTANGLE_MARQUEE = 'rectangle';
	let _ = tools.Lasso.prototype;
	_.select = function(atoms, shapes) {
		if (this.block) {
			return;
		}
		if (!monitor.SHIFT) {
			this.empty();
		}
		if (atoms) {
			this.atoms = atoms.slice(0);
			this.shapes = shapes.slice(0);
		} else {
			if (this.mode !== tools.Lasso.MODE_LASSO_SHAPES) {
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
							a.isLassoed = false;
						}
					}
					for ( let i = 0, ii = asAdd.length; i < ii; i++) {
						if (this.atoms.indexOf(asAdd[i]) === -1) {
							asFinal.push(asAdd[i]);
						}
					}
					this.atoms = asFinal;
				}
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
						asFinal.push(s);
					} else {
						s.isLassoed = false;
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
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			this.atoms[i].isLassoed = true;
		}
		for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
			this.shapes[i].isLassoed = true;
		}
		this.setBounds();
		if (this.bounds && this.bounds.minX === Infinity) {
			this.empty();
		}
		this.points = [];
		this.sketcher.stateManager.getCurrentState().clearHover();
		this.enableButtons();
		this.sketcher.repaint();
	};
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
			this.sketcher.toolbarManager.buttonCut.enable();
			this.sketcher.toolbarManager.buttonCopy.enable();
			this.sketcher.toolbarManager.buttonFlipVert.enable();
			this.sketcher.toolbarManager.buttonFlipHor.enable();
		}else{
			this.sketcher.toolbarManager.buttonSave.disable();
			this.sketcher.toolbarManager.buttonCut.disable();
			this.sketcher.toolbarManager.buttonCopy.disable();
			this.sketcher.toolbarManager.buttonFlipVert.disable();
			this.sketcher.toolbarManager.buttonFlipHor.disable();
		}
	};
	_.setBounds = function() {
		if (this.isActive()) {
			this.sketcher.repaint();
			this.bounds = new math.Bounds();
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				this.bounds.expand(a.getBounds());
			}
			for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
				this.bounds.expand(this.shapes[i].getBounds());
			}
			let buffer = 5;
			this.bounds.minX -= buffer;
			this.bounds.minY -= buffer;
			this.bounds.maxX += buffer;
			this.bounds.maxY += buffer;
		} else {
			this.bounds = undefined;
		}
	};
	_.empty = function() {
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			this.atoms[i].isLassoed = false;
		}
		for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
			this.shapes[i].isLassoed = false;
		}
		this.atoms = [];
		this.shapes = [];
		this.bounds = undefined;
		this.enableButtons();
		this.sketcher.repaint();
	};
	_.draw = function(ctx, styles) {
		ctx.strokeStyle = styles.colorSelect;
		ctx.lineWidth = 0.5 / styles.scale;
		ctx.setLineDash([5]);
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
					if(b.a1.isLassoed && b.a2.isLassoed){
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
        for(let i = 0, ii = this.sketcher.shapes.length; i<ii; i++){
            let s = this.sketcher.shapes[i];
            if(s instanceof structures.d2.DynamicBracket && s.contents.length!==0 && mol.atoms.indexOf(s.contents[0])!==-1){
                attachedShapes.push(s);
            }
        }
        this.select(mol.atoms, attachedShapes);
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

})(ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.structures, ChemDoodle.uis.tools);

(function(informatics, io, structures, uis, actions, undefined) {
	'use strict';

	let SPLITTER = new informatics.Splitter();

	uis.CopyPasteManager = function(sketcher) {
		this.sketcher = sketcher;
		this.data = undefined;
	};
	let _ = uis.CopyPasteManager.prototype;
	_.interpreter = new io.JSONInterpreter();
	_.copy = function(remove) {
		if (this.sketcher.lasso.isActive()) {
			let mols = SPLITTER.split({atoms:this.sketcher.lasso.atoms, bonds:this.sketcher.lasso.getBonds()});
			let shapes = this.sketcher.lasso.shapes;
			this.data = this.interpreter.contentTo(mols, shapes);
			if(remove){
				this.sketcher.stateManager.STATE_ERASE.handleDelete();
			}
			this.sketcher.toolbarManager.buttonPaste.enable();
		}
	};
	_.paste = function() {
		if(this.data){
			let content = this.interpreter.contentFrom(this.data);
			if(content.molecules.length!==0 || content.shapes.length!==0){
				let atoms = [];
				for(let i = 0, ii = content.molecules.length; i<ii; i++){
					atoms = atoms.concat(content.molecules[i].atoms);
				}
				let c;
				if(this.sketcher.lastMousePos){
					// you need to create a copy here as c is modified below
					c = new structures.Point(this.sketcher.lastMousePos.x, this.sketcher.lastMousePos.y);
				}else if(this.sketcher.lasso.isActive()){
					this.sketcher.lasso.setBounds();
					let b = this.sketcher.lasso.bounds;
					c = new structures.Point((b.minX+b.maxX)/2+50, (b.minY+b.maxY)/2+50);
				}else{
					c = new structures.Point(this.sketcher.width / 2, this.sketcher.height / 2);
				}
				this.sketcher.historyManager.pushUndo(new actions.AddContentAction(this.sketcher, content.molecules, content.shapes));
				this.sketcher.lasso.empty();
				this.sketcher.lasso.select(atoms, content.shapes);
				this.sketcher.lasso.setBounds();
				let b2 = this.sketcher.lasso.bounds;
				c.sub(new structures.Point((b2.minX+b2.maxX)/2+10, (b2.minY+b2.maxY)/2+10));
				new actions.MoveAction(this.sketcher.lasso.getAllPoints(), c).forward(this.sketcher);
				this.sketcher.repaint();
			}
		}
	};

})(ChemDoodle.informatics, ChemDoodle.io, ChemDoodle.structures, ChemDoodle.uis, ChemDoodle.uis.actions);

(function(c, extensions, featureDetection, sketcherPack, structures, d2, tools, q, m, window, undefined) {
	'use strict';
	c.SketcherCanvas = function(id, width, height, options) {
		// keep checks to undefined here as these are booleans
		this.isMobile = options.isMobile === undefined ? featureDetection.supports_touch() : options.isMobile;
		this.useServices = options.useServices === undefined ? false : options.useServices;
		this.oneMolecule = options.oneMolecule === undefined ? false : options.oneMolecule;
		this.requireStartingAtom = options.requireStartingAtom === undefined ? true : options.requireStartingAtom;
		this.includeToolbar = options.includeToolbar === undefined ? true : options.includeToolbar;
		this.floatDrawTools = options.floatDrawTools === undefined ? false : options.floatDrawTools;
		this.resizable = options.resizable === undefined ? false : options.resizable;
		this.includeQuery = options.includeQuery === undefined ? false : options.includeQuery;
		// save the original options object
		this.originalOptions = options;
		// toolbar manager needs the sketcher id to make it unique to this
		// canvas
		this.id = id;
		this.toolbarManager = new sketcherPack.gui.ToolbarManager(this);
		if (this.includeToolbar) {
			this.toolbarManager.write();
			// If pre-created, wait until the last button image loads before
			// calling setup.
			let self = this;
			if (document.getElementById(this.id)) {
				q('#' + id + '_button_chain_icon').load(function() {
					self.toolbarManager.setup();
				});
			} else {
				q(window).load(function() {
					self.toolbarManager.setup();
				});
			}
			this.dialogManager = new sketcherPack.gui.DialogManager(this);
		}
		if(sketcherPack.gui.desktop.TextInput){
			this.textInput = new sketcherPack.gui.desktop.TextInput(this, this.id+'_textInput');
		}
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
		if (this.oneMolecule) {
			let startMol = new structures.Molecule();
			startMol.atoms.push(new structures.Atom());
			this.loadMolecule(startMol);
		} else {
			this.startAtom = new structures.Atom('C', -10, -10);
			this.startAtom.isLone = true;
			this.lasso = new tools.Lasso(this);
		}
		if(this.resizable){
			let jqsk = q('#'+this.id);
			let self = this;
			jqsk.resizable({
				resize: function( event, ui ) {
					self.resize(jqsk.innerWidth(), jqsk.innerHeight());
				}
			});
		}
	};
	let _ = c.SketcherCanvas.prototype = new c._Canvas();
	_.drawSketcherDecorations = function(ctx, styles) {
		ctx.save();
		ctx.translate(this.width / 2, this.height / 2);
		ctx.rotate(styles.rotateAngle);
		ctx.scale(styles.scale, styles.scale);
		ctx.translate(-this.width / 2, -this.height / 2);
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
		if (force && this.doChecks) {
			// setup data for atom mappings
			let arrow;
			let mappings = [];
			let brackets = [];
			let vaps = [];
			for(let i = 0, ii = this.shapes.length; i<ii; i++){
				let s = this.shapes[i];
				if(s instanceof d2.AtomMapping){
					s.error = false;
					mappings.push(s);
				}else if(s instanceof d2.Line && !arrow){
					// make sure arrow isn't defined, just to make sure we use the first arrow
					arrow = s;
				}else if(s instanceof d2.DynamicBracket){
					s.error = false;
					brackets.push(s);
				}else if(s instanceof d2.VAP){
					s.error = false;
					vaps.push(s);
				}
			}
			for(let i = 0, ii = mappings.length; i<ii; i++){
				let si = mappings[i];
				si.label = (i+1).toString();
				for(let j = i+1, jj = mappings.length; j<jj; j++){
					let sj = mappings[j];
					if(si.o1===sj.o1 || si.o2===sj.o1 || si.o1===sj.o2 || si.o2===sj.o2){
						si.error = true;
						sj.error = true;
					}
				}
				// different labels
				if(!si.error && si.o1.label !== si.o2.label){
					si.error = true;
				}
				// same structure
				if(!si.error && this.getMoleculeByAtom(si.o1) === this.getMoleculeByAtom(si.o2)){
					si.error = true;
				}
			}
			if(brackets.length!==0){
				let allAs = this.getAllAtoms();
				for(let i = 0, ii = allAs.length; i<ii; i++){
					allAs[i].inBracket = false;
				}
				for(let i = 0, ii = brackets.length; i<ii; i++){
					let si = brackets[i];
					si.setContents(this);
					if(si.contents.length===0){
						// user error
						si.error = true;
					}else{
						for(let j = 0, jj = si.contents.length; j<jj; j++){
							if(si.contents[j].inBracket){
								si.error = true;
								break;
							}
						}
					}
					for(let j = 0, jj = si.contents.length; j<jj; j++){
						si.contents[j].inBracket = true;
					}
				}
			}
			for(let i = 0, ii = vaps.length; i<ii; i++){
				let vap = vaps[i];
				if(!vap.substituent){
					// no substituent
					vap.error = true;
				}else if(vap.attachments.length===0){
					// no attachments
					vap.error = true;
				}
				if(!vap.error){
					// check that all attachments are part of the same molecule
					let m = this.getMoleculeByAtom(vap.attachments[0]);
					vap.substituent.present = undefined;
					for(let j = 0, jj = m.atoms.length; j<jj; j++){
						m.atoms[j].present = true;
					}
					// also make sure the substituent is NOT part of the same molecule
					if(vap.substituent.present){
						vap.error = true;
					}
					if(!vap.error){
						for(let j = 0, jj = vap.attachments.length; j<jj; j++){
							if(!vap.attachments[j].present){
								vap.error = true;
								break;
							}
						}
					}
					for(let j = 0, jj = m.atoms.length; j<jj; j++){
						m.atoms[j].present = undefined;
					}
				}
			}
		}
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
		if (this.styles.scale !== 1) {
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

})(ChemDoodle, ChemDoodle.extensions, ChemDoodle.featureDetection, ChemDoodle.uis, ChemDoodle.structures, ChemDoodle.structures.d2, ChemDoodle.uis.tools, ChemDoodle.lib.jQuery, Math, window);

(function(c, desktop, q, document, undefined) {
	'use strict';
	desktop.SpecsDialog = function(editor, subid) {
		this.editor = editor;
		this.id = this.editor.id + subid;
	};
	let _ = desktop.SpecsDialog.prototype = new desktop.Dialog();
	_.title = 'Visual Specifications';

	_.makeProjectionSet = function(self) {
		this.projectionSet = new desktop.ButtonSet(self.id + '_projection_group');
		this.buttonPerspective = new desktop.TextButton(self.id + '_button_Perspective', 'Perspective',function() {
			self.editor.styles.projectionPerspective_3D = true;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.projectionSet.buttons.push(this.buttonPerspective);
		this.buttonOrthographic = new desktop.TextButton(self.id + '_button_Orthographic', 'Orthographic',function() {
			self.editor.styles.projectionPerspective_3D = false;
			self.editor.updateScene(self);
			self.update(editor.styles);
		});
		this.projectionSet.buttons.push(this.buttonOrthographic);
	};

	_.makeAtomColorSet = function(self) {
		this.atomColorSet = new desktop.ButtonSet(self.id + '_atom_color_group');
		this.atomColorSet.toggle = true;
		this.buttonJmolColors = new desktop.TextButton(self.id + '_button_Jmol_Colors', 'Jmol', function() {
			self.editor.styles.atoms_useJMOLColors = true;
			self.editor.styles.atoms_usePYMOLColors = false;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.atomColorSet.buttons.push(this.buttonJmolColors);
		this.buttonPymolColors = new desktop.TextButton(self.id + '_button_PyMOL_Colors', 'PyMOL', function() {
			self.editor.styles.atoms_usePYMOLColors = true;
			self.editor.styles.atoms_useJMOLColors = false;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.atomColorSet.buttons.push(this.buttonPymolColors);
	};

	_.makeBondColorSet = function(self) {
		this.bondColorSet = new desktop.ButtonSet(self.id + '_bond_color_group');
		this.bondColorSet.toggle = true;
		this.buttonJmolBondColors = new desktop.TextButton(self.id + '_button_Jmol_Bond_Colors', 'Jmol', function() {
			self.editor.styles.bonds_useJMOLColors = true;
			self.editor.styles.bonds_usePYMOLColors = false;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.bondColorSet.buttons.push(this.buttonJmolBondColors);
		this.buttonPymolBondColors = new desktop.TextButton(self.id + '_button_PyMOL_Bond_Colors', 'PyMOL', function() {
			self.editor.styles.bonds_usePYMOLColors = true;
			self.editor.styles.bonds_useJMOLColors = false;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.bondColorSet.buttons.push(this.buttonPymolBondColors);
	};

	_.makeCompassPositionSet = function(self) {
		this.compassPositionSet = new desktop.ButtonSet(self.id + '_compass_position_group');
		this.buttonCompassCorner = new desktop.TextButton(self.id + '_button_compass_corner', 'Corner',function() {
			self.editor.styles.compass_type_3D = 0;
			self.editor.styles.compass_size_3D = 50;
			self.editor.setupScene();
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.compassPositionSet.buttons.push(this.buttonCompassCorner);
		this.buttonCompassOrigin = new desktop.TextButton(self.id + '_button_compass_origin', 'Origin',function() {
			self.editor.styles.compass_type_3D = 1;
			self.editor.styles.compass_size_3D = 150;
			self.editor.setupScene();
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.compassPositionSet.buttons.push(this.buttonCompassOrigin);
	};

	_.makeFogModeSet = function(self) {
		this.fogModeSet = new desktop.ButtonSet(self.id + '_fog_mode_group');
		this.buttonFogMode0 = new desktop.TextButton(self.id + '_button_fog_mode_0', 'No Fogging', function() {
			self.editor.styles.fog_mode_3D = 0;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.fogModeSet.buttons.push(this.buttonFogMode0);
		this.buttonFogMode1 = new desktop.TextButton(self.id + '_button_fog_mode_1', 'Linear', function() {
			self.editor.styles.fog_mode_3D = 1;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.fogModeSet.buttons.push(this.buttonFogMode1);
		this.buttonFogMode2 = new desktop.TextButton(self.id + '_button_fog_mode_2', 'Exponential', function() {
			self.editor.styles.fog_mode_3D = 2;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.fogModeSet.buttons.push(this.buttonFogMode2);
		this.buttonFogMode3 = new desktop.TextButton(self.id + '_button_fog_mode_3', 'Exponential&sup2;', function() {
			self.editor.styles.fog_mode_3D = 3;
			self.editor.updateScene();
			self.update(editor.styles);
		});
		this.fogModeSet.buttons.push(this.buttonFogMode3);
	};

	_.setup = function(self, editor) {
		// canvas
		this.makeProjectionSet(this);
		this.bgcolor = new desktop.ColorPicker(this.id + '_bgcolor', 'Background Color: ', function(hex) {editor.styles.backgroundColor = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
		this.makeFogModeSet(this);
		this.fogcolor = new desktop.ColorPicker(this.id + '_fogcolor', 'Fog Color: ', function(hex) {editor.styles.fog_color_3D = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});

		// atoms
		this.atomsDisplayToggle = new desktop.CheckBox(this.id + '_atoms_display_toggle', 'Display atoms', function() { editor.styles.atoms_display=!editor.styles.atoms_display;editor.updateScene();self.update(editor.styles);}, true);
		this.atomcolor = new desktop.ColorPicker(this.id + '_atomcolor', 'Atom Color: ', function(hex) {editor.styles.atoms_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
		this.makeAtomColorSet(this);
		this.atomColorSetToggle = new desktop.CheckBox(this.id + '_atom_color_group_toggle', 'Color Schemes', function() {
				if (self.buttonJmolColors.getElement().prop('disabled')) {
					self.atomColorSet.enable();
					editor.styles.atoms_useJMOLColors = true;
				} else {
					self.atomColorSet.disable();
					editor.styles.atoms_useJMOLColors = false;
					editor.styles.atoms_usePYMOLColors = false;
					self.buttonJmolColors.uncheck();
					self.buttonPymolColors.uncheck();
				}
				editor.updateScene();
				self.update(editor.styles);
			}, false);
		this.vdwToggle = new desktop.CheckBox(this.id + '_vdw_toggle', 'Use VDW Diameters', function() { editor.styles.atoms_useVDWDiameters_3D=!editor.styles.atoms_useVDWDiameters_3D;editor.updateScene();self.update(editor.styles); }, false);
		this.atomsNonBondedAsStarsToggle = new desktop.CheckBox(this.id + '_non_bonded_as_stars_toggle', 'Non-bonded as stars', function() { editor.styles.atoms_nonBondedAsStars_3D=!editor.styles.atoms_nonBondedAsStars_3D;editor.updateScene();self.update(editor.styles); }, false);
		this.displayLabelsToggle = new desktop.CheckBox(this.id + '_display_labels_toggle', 'Atom labels', function() { editor.styles.atoms_displayLabels_3D=!editor.styles.atoms_displayLabels_3D;editor.updateScene();self.update(editor.styles); }, false);

		//bonds
		this.bondsDisplayToggle = new desktop.CheckBox(this.id + '_bonds_display_toggle', 'Display bonds', function() { editor.styles.bonds_display=!editor.styles.bonds_display;editor.updateScene();self.update(editor.styles);}, true);
		this.bondcolor = new desktop.ColorPicker(this.id + '_bondcolor', 'Bond Color: ', function(hex) {editor.styles.bonds_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});
		this.makeBondColorSet(this);
		this.bondColorSetToggle =  new desktop.CheckBox(this.id + '_bond_color_group_toggle', 'Color Schemes', function() {
			if (self.buttonJmolBondColors.getElement().prop('disabled')) {
				self.bondColorSet.enable();
				editor.styles.bonds_useJMOLColors = true;
			} else {
				self.bondColorSet.disable();
				editor.styles.bonds_useJMOLColors = false;
				editor.styles.bonds_usePYMOLColors = false;
				self.buttonJmolBondColors.uncheck();
				self.buttonPymolBondColors.uncheck();

			}
			editor.updateScene();
			self.update(editor.styles);
		}, false);
		this.bondOrderToggle = new desktop.CheckBox(this.id + '_bond_order_toggle', 'Show order', function() { editor.styles.bonds_showBondOrders_3D=!editor.styles.bonds_showBondOrders_3D;editor.updateScene();self.update(editor.styles); }, false);
		this.bondsRenderAsLinesToggle = new desktop.CheckBox(this.id + '_bonds_render_as_lines_toggle', 'Render as lines', function() { editor.styles.bonds_renderAsLines_3D=!editor.styles.bonds_renderAsLines_3D;editor.updateScene();self.update(editor.styles);}, false);

		// proteins
		this.ribbonsToggle = new desktop.CheckBox(this.id + '_ribbons_toggle', 'Ribbons', function() { editor.styles.proteins_displayRibbon=!editor.styles.proteins_displayRibbon;editor.updateScene();self.update(editor.styles); }, false);
		this.backboneToggle = new desktop.CheckBox(this.id + '_backbone_toggle', 'Backbone', function() { editor.styles.proteins_displayBackbone=!editor.styles.proteins_displayBackbone;editor.updateScene();self.update(editor.styles); }, false);
		this.pipeplankToggle = new desktop.CheckBox(this.id + '_pipeplank_toggle', 'Pipe and Plank', function() { editor.styles.proteins_displayPipePlank=!editor.styles.proteins_displayPipePlank;editor.updateScene();self.update(editor.styles); }, false);
		this.cartoonizeToggle = new desktop.CheckBox(this.id + '_cartoonize_toggle', 'Cartoonize', function() { editor.styles.proteins_ribbonCartoonize=!editor.styles.proteins_ribbonCartoonize;editor.updateScene();self.update(editor.styles); }, false);
		this.colorByChainToggle = new desktop.CheckBox(this.id + '_color_by_chain_toggle', 'Color by Chain', function() { editor.styles.macro_colorByChain=!editor.styles.macro_colorByChain;editor.updateScene();self.update(editor.styles); }, false);
		this.proteinColorToggle = new desktop.CheckBox(this.id + '_protein_color_toggle', 'Color by Segment', function() {
			if (self.proteinColorToggle.checked) {
				editor.styles.proteins_residueColor = 'none';
				self.proteinColorToggle.uncheck();
				q('#proteinColors').prop('disabled', true);
			} else {
				self.proteinColorToggle.check();
				q('#proteinColors').removeAttr('disabled');
				editor.styles.proteins_residueColor = q('#proteinColors').val();
			}
			editor.updateScene();
			self.update(editor.styles);}, false);

		//nucleics
		this.nucleicAcidColorToggle = new desktop.CheckBox(this.id + '_nucleic_acid_color_toggle', 'Color by Segment', function() {
			if (self.nucleicAcidColorToggle.checked) {
				editor.styles.nucleics_residueColor = 'none';
				self.nucleicAcidColorToggle.uncheck();
				q('#nucleicColors').prop('disabled', true);
			} else {
				self.nucleicAcidColorToggle.check();
				q('#nucleicColors').removeAttr('disabled');
				editor.styles.nucleics_residueColor = q('#nucleicColors').val();
			}
			editor.updateScene();
			self.update(editor.styles);}, false);

		// text
		//this.boldTextToggle = new desktop.CheckBox(this.id + '_bold_text_toggle', 'Bold', function() { editor.styles.text_font_bold=!editor.styles.text_font_bold;editor.updateScene();self.update(editor.styles); }, false);
		//this.italicTextToggle = new desktop.CheckBox(this.id + '_italic_text_toggle', 'Italic', function() { editor.styles.text_font_italics=!editor.styles.text_font_italics;editor.updateScene();self.update(editor.styles); }, false);

		// shapes
		this.shapecolor = new desktop.ColorPicker(this.id + '_shapecolor', 'Shape Color: ', function(hex) {editor.styles.shapes_color = hex;editor.setupScene();editor.repaint();self.update(editor.styles);});

		// compass
		this.displayCompassToggle = new desktop.CheckBox(this.id + '_display_compass_toggle', 'Display Compass', function() {
			if (self.displayCompassToggle.checked) {
				editor.styles.compass_display = false;
				editor.setupScene();
				editor.updateScene();
				self.compassPositionSet.disable();
				self.buttonCompassCorner.uncheck();
				self.displayCompassToggle.uncheck();
				self.update(editor.styles);
			} else {
				editor.styles.compass_display = true;
				editor.styles.compass_type_3D = 0;
				editor.styles.compass_size_3D = 50;
				self.compassPositionSet.enable();
				self.displayCompassToggle.check();
				self.buttonCompassCorner.check();
				editor.setupScene();
				editor.updateScene();
				self.update(editor.styles);
			}
		}, false);
		this.makeCompassPositionSet(this);
		//this.axisLabelsToggle = new desktop.CheckBox(this.id + '_axis_labels_toggle', 'Axis Labels', function() { editor.styles.compass_displayText_3D=!editor.styles.compass_displayText_3D;editor.updateScene();self.update(editor.styles); }, false);

		let sb = [];
		sb.push('<div style="font-size:12px;text-align:left;overflow-y:scroll;height:300px;" id="');
		sb.push(this.id);
		sb.push('" title="');
		sb.push(this.title);
		sb.push('">');
		if (this.message) {
			sb.push('<p>');
			sb.push(this.message);
			sb.push('</p>');
		}
		sb.push('<p><strong>Representation</strong>');
		sb.push('<p><select id="reps"><option value="Ball and Stick">Ball and Stick</option><option value="van der Waals Spheres">vdW Spheres</option><option value="Stick">Stick</option><option value="Wireframe">Wireframe</option><option value="Line">Line</option></select></p>');
		sb.push('<hr><strong>Canvas</strong>');
		sb.push(this.bgcolor.getSource());
		sb.push('<p>Projection: ');
		sb.push(this.projectionSet.getSource(this.id + '_projection_group'));
		sb.push('</p><p>Fog Mode: ');
		sb.push(this.fogModeSet.getSource(this.id + '_fog_mode_group'));
		sb.push(this.fogcolor.getSource());
		sb.push('</p><p>Fog start: <input type="number" id="fogstart" min="0" max="100" value="0"> %</p>');
		sb.push('</p><p>Fog end: <input type="number" id="fogend" min="0" max="100" value="100"> %</p>');
		sb.push('</p><p>Fog density: <input type="number" id="fogdensity" min="0" max="100" value="100"> %</p>');
		sb.push('<hr><strong>Atoms</strong><p>');
		sb.push(this.atomsDisplayToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.atomcolor.getSource());
		sb.push('</p><p>Sphere diameter: <input type="number" id="spherediameter" min="0" max="40" value="0.8" step="0.01"> Angstroms</p>');
		sb.push(this.vdwToggle.getSource());
		sb.push('</p><p>VDW Multiplier: <input type="number" id="vdwMultiplier" min="0" max="100" value="100"> %</p>');
		sb.push(this.atomsNonBondedAsStarsToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.displayLabelsToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.atomColorSetToggle.getSource());
		sb.push(': ');
		sb.push(this.atomColorSet.getSource(this.id + '_atom_color_group'));
		sb.push('</p><hr><strong>Bonds</strong><p>');
		sb.push(this.bondsDisplayToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.bondcolor.getSource());
		sb.push(this.bondColorSetToggle.getSource());
		sb.push(': ');
		sb.push(this.bondColorSet.getSource(this.id + '_bond_color_group'));
		sb.push('</p><p>');
		sb.push(this.bondOrderToggle.getSource());
		sb.push('</p><p>Cylinder diameter: <input type="number" id="cylinderdiameter" min="0" max="40" value="0.3" step="0.01"> Angstroms</p>');
		sb.push('</p><hr><strong>Proteins</strong>');
		sb.push('<p>');
		sb.push(this.ribbonsToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.backboneToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.pipeplankToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.cartoonizeToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.colorByChainToggle.getSource());
		sb.push('</p><p>');
		sb.push(this.proteinColorToggle.getSource());
		sb.push('<select id="proteinColors" disabled><option value="amino">Amino</option><option value="shapely">Shapely</option><option value="polarity">Polarity</option><option value="rainbow">Rainbow</option><option value="acidity">Acidity</option></select></p>');
		sb.push('<hr><strong>Nucleic Acids</strong><p>');
		sb.push(this.nucleicAcidColorToggle.getSource());
		sb.push(': ');
		sb.push('<select id="nucleicColors" disabled><option value="shapely">Shapely</option><option value="rainbow">Rainbow</option></select></p>');
		//sb.push('<hr><strong>Text</strong>');
		//sb.push('<p><table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td><p>Text Color: </p></td><td><input id="textcolor" name="textcolor" class="simple_color" value="#000000" /></td></tr></table></p>');
		//sb.push('<p>Font Styles: ');
		//sb.push(this.boldTextToggle.getSource());
		//sb.push(this.italicTextToggle.getSource());
		//sb.push('</p>');
		sb.push('<hr><strong>Shapes</strong><p>');
		sb.push(this.shapecolor.getSource());
		sb.push('</p><hr><strong>Compass</strong>');
		sb.push('<p>');
		sb.push(this.displayCompassToggle.getSource());
		sb.push(': ');
		sb.push(this.compassPositionSet.getSource(this.id + '_compass_position_group'));
		//sb.push('</p><p>');
		sb.push('</p>');
		//sb.push(this.axisLabelsToggle.getSource());
		//sb.push('</p><table style="font-size:12px;text-align:left;border-spacing:0px"><tr><td>Axis Colors: </td><td><label for="xaxis">X</label></td><td><input id="xaxis" name="xaxis" class="simple_color" value="#FF0000" /></td><td><label for="yaxis">Y</label></td><td><input id="yaxis" name="yaxis" class="simple_color" value="#00FF00" /></td><td><label for="zaxis">Z</label></td><td><input id="zaxis" name="zaxis" class="simple_color" value="#0000FF" /></td></tr></table>');
		sb.push('</div>');
		if (this.afterMessage) {
			sb.push('<p>');
			sb.push(this.afterMessage);
			sb.push('</p>');
		}
		document.writeln(sb.join(''));
		this.getElement().dialog({
			autoOpen : false,
			position : {my: "center", at:"center", of:document },
			buttons : self.buttons,
			width : 500,
			height: 300,
			open : function(event, ui) {
				q(this).height(300);
				q(this).width(478);
				q(this).dialog('option', 'position', 'center');
			}
		});
		this.bgcolor.setup();
		this.fogcolor.setup();
		this.atomcolor.setup();
		this.bondcolor.setup();
		this.shapecolor.setup();
		q('#reps').change(function() {
			let i = this.selectedIndex;
			let ops = this.options;
			editor.styles.set3DRepresentation(ops[i].value);
			editor.updateScene();
			self.update(editor.styles);
		});
		q('#proteinColors').change(function() {
			let i = this.selectedIndex;
			switch(i) {
			case 0:
				editor.styles.proteins_residueColor = 'amino';
				break;
			case 1:
				editor.styles.proteins_residueColor = 'shapely';
				break;
			case 2:
				editor.styles.proteins_residueColor = 'polarity';
				break;
			case 3:
				editor.styles.proteins_residueColor = 'rainbow';
				break;
			case 4:
				editor.styles.proteins_residueColor = 'acidity';
				break;
			}

			editor.updateScene();
			self.update(editor.styles);
		});
		q('#nucleicColors').change(function() {
			let i = this.selectedIndex;
			switch(i) {
			case 0:
				editor.styles.nucleics_residueColor = 'shapely';
				break;
			case 1:
				editor.styles.nucleics_residueColor = 'rainbow';
				break;
			}

			editor.updateScene();
			self.update(editor.styles);
		});

		q('#fogstart').change(function() {
			editor.styles.fog_start_3D = parseInt(this.value)/100;
			editor.updateScene();
		});
		q('#fogend').change(function() {
			editor.styles.fog_end_3D = parseInt(this.value)/100;
			editor.updateScene();
		});
		q('#fogdensity').change(function() {
			editor.styles.fog_density_3D = parseInt(this.value)/100;
			editor.updateScene();
		});
		q('#vdwMultiplier').change(function() {
			editor.styles.atoms_vdwMultiplier_3D = parseInt(this.value)/100;
			editor.updateScene();
		});
		q('#spherediameter').change(function() {
			editor.styles.atoms_sphereDiameter_3D = parseFloat(this.value);
			editor.updateScene();
		});
		q('#cylinderdiameter').change(function() {
			editor.styles.bonds_cylinderDiameter_3D = parseFloat(this.value);
			editor.updateScene();
		});

		this.projectionSet.setup();
		this.fogModeSet.setup();
		this.atomsDisplayToggle.setup();
		this.vdwToggle.setup();
		this.atomsNonBondedAsStarsToggle.setup();
		this.displayLabelsToggle.setup();
		this.atomColorSet.setup();
		this.atomColorSet.disable();
		this.atomColorSetToggle.setup();
		this.bondsDisplayToggle.setup();
		this.bondColorSet.setup();
		this.bondColorSet.disable();
		this.bondColorSetToggle.setup();
		this.bondOrderToggle.setup();
		this.ribbonsToggle.setup();
		this.backboneToggle.setup();
		this.pipeplankToggle.setup();
		this.cartoonizeToggle.setup();
		this.colorByChainToggle.setup();
		this.proteinColorToggle.setup();
		this.nucleicAcidColorToggle.setup();
		//this.boldTextToggle.setup();
		//this.italicTextToggle.setup();
		this.displayCompassToggle.setup();
		this.compassPositionSet.setup();
		this.compassPositionSet.disable();
		//this.axisLabelsToggle.setup();
	};
	_.update = function(styles){
		this.bgcolor.setColor(styles.backgroundColor);
		this.fogcolor.setColor(styles.fog_color_3D);
		this.atomcolor.setColor(styles.atoms_color);
		this.bondcolor.setColor(styles.bonds_color);
		this.shapecolor.setColor(styles.shapes_color);
		if (styles.projectionPerspective_3D) {
			this.buttonPerspective.select();
		} else {
			this.buttonOrthographic.select();
		}
		switch(styles.fog_mode_3D) {
		case 1:
			this.buttonFogMode0.uncheck();
			this.buttonFogMode1.check();
			this.buttonFogMode2.uncheck();
			this.buttonFogMode3.uncheck();
			break;
		case 2:
			this.buttonFogMode0.uncheck();
			this.buttonFogMode1.uncheck();
			this.buttonFogMode2.check();
			this.buttonFogMode3.uncheck();
			break;
		case 3:
			this.buttonFogMode0.uncheck();
			this.buttonFogMode1.uncheck();
			this.buttonFogMode2.uncheck();
			this.buttonFogMode3.check();
			break;
		default:
			this.buttonFogMode0.check();
			this.buttonFogMode1.uncheck();
			this.buttonFogMode2.uncheck();
			this.buttonFogMode3.uncheck();
			break;
		}
		q('#fogstart').val(styles.fog_start_3D * 100);
		q('#fogend').val(styles.fog_end_3D * 100);
		q('#fogdensity').val(styles.fog_density_3D * 100);
		if (styles.atoms_display) {
			this.atomsDisplayToggle.check();
		} else {
			this.atomsDisplayToggle.uncheck();
		}
		if (styles.atoms_useVDWDiameters_3D) {
			this.vdwToggle.check();
			q('#spherediameter').prop('disabled', true);
			q('#vdwMultiplier').prop('disabled', false);
			q('#vdwMultiplier').val(styles.atoms_vdwMultiplier_3D * 100);
		} else {
			this.vdwToggle.uncheck();
			q('#spherediameter').prop('disabled', false);
			q('#spherediameter').val(styles.atoms_sphereDiameter_3D);
			q('#vdwMultiplier').prop('disabled', true);
		}
		if (styles.atoms_useJMOLColors || styles.atoms_usePYMOLColors) {
			this.atomColorSetToggle.check();
			this.atomColorSet.enable();
			if (styles.atoms_useJMOLColors) {
				this.buttonJmolColors.check();
				this.buttonPymolColors.uncheck();
			} else if (styles.atoms_usePYMOLColors) {
				this.buttonJmolColors.uncheck();
				this.buttonPymolColors.check();
			}
		} else {
			this.atomColorSetToggle.uncheck();
			this.buttonPymolColors.uncheck();
			this.buttonJmolColors.uncheck();
			this.atomColorSet.disable();
		}
		if (styles.atoms_nonBondedAsStars_3D) {
			this.atomsNonBondedAsStarsToggle.check();
		} else {
			this.atomsNonBondedAsStarsToggle.uncheck();
		}
		if (styles.atoms_displayLabels_3D) {
			this.displayLabelsToggle.check();
		} else {
			this.displayLabelsToggle.uncheck();
		}
		if (styles.bonds_display) {
			this.bondsDisplayToggle.check();
		} else {
			this.bondsDisplayToggle.uncheck();
		}
		if (styles.bonds_useJMOLColors || styles.bonds_usePYMOLColors) {
			this.bondColorSetToggle.check();
			this.bondColorSet.enable();
			if (styles.bonds_useJMOLColors) {
				this.buttonJmolBondColors.check();
				this.buttonPymolBondColors.uncheck();
			} else if (styles.atoms_usePYMOLColors) {
				this.buttonJmolBondColors.uncheck();
				this.buttonPymolBondColors.check();
			}
		} else {
			this.bondColorSetToggle.uncheck();
			this.buttonPymolBondColors.uncheck();
			this.buttonJmolBondColors.uncheck();
			this.bondColorSet.disable();
		}
		if (styles.bonds_showBondOrders_3D) {
			this.bondOrderToggle.check();
		} else {
			this.bondOrderToggle.uncheck();
		}
		q('#cylinderdiameter').val(styles.bonds_cylinderDiameter_3D);
		if (styles.proteins_displayRibbon) {
			this.ribbonsToggle.check();
		} else {
			this.ribbonsToggle.uncheck();
		}
		if (styles.proteins_displayBackbone) {
			this.backboneToggle.check();
		} else {
			this.backboneToggle.uncheck();
		}
		if (styles.proteins_displayPipePlank) {
			this.pipeplankToggle.check();
		} else {
			this.pipeplankToggle.uncheck();
		}
		if (styles.proteins_ribbonCartoonize) {
			this.cartoonizeToggle.check();
		} else {
			this.cartoonizeToggle.uncheck();
		}
		if (styles.macro_colorByChain) {
			this.colorByChainToggle.check();
		} else {
			this.colorByChainToggle.uncheck();
		}
		switch (styles.proteins_residueColor) {
		case 'amino':
			this.proteinColorToggle.check();
			q('#proteinColors').val('amino');
			break;
		case 'shapely':
			this.proteinColorToggle.check();
			q('#proteinColors').val('shapely');
			break;
		case 'polarity':
			this.proteinColorToggle.check();
			q('#proteinColors').val('polarity');
			break;
		case 'rainbow':
			this.proteinColorToggle.check();
			q('#proteinColors').val('rainbow');
			break;
		case 'acidity':
			this.proteinColorToggle.check();
			q('#proteinColors').val('acidity');
			break;
		case 'none':
		default:
			this.proteinColorToggle.uncheck();
			q('#proteinColors').prop('disabled', true);
			break;
		}
		switch (styles.nucleics_residueColor) {
		case 'shapely':
			this.nucleicAcidColorToggle.check();
			q('#nucleicColors').val('shapely');
			break;
		case 'rainbow':
			this.nucleicAcidColorToggle.check();
			q('#nucleicColors').val('rainbow');
			break;
		case 'none':
		default:
			this.nucleicAcidColorToggle.uncheck();
			q('#nucleicColors').prop('disabled', true);
			break;
		}
		/*
		if (styles.text_font_bold) {
			this.boldTextToggle.check();
		}
		if (styles.text_font_italic) {
			this.italicTextToggle.check();
		}*/
		if (styles.compass_display == true) {
			this.compassPositionSet.enable();
			if (styles.compass_type_3D == 0) {
				this.buttonCompassCorner.check();
				this.buttonCompassOrigin.uncheck();
			} else {
				this.buttonCompassOrigin.check();
				this.buttonCompassCorner.uncheck();
			}
		} else {
			this.compassPositionSet.disable();
			this.buttonCompassCorner.uncheck();
			this.buttonCompassOrigin.uncheck();
		}
		/*if (styles.compass_display_text_3D) {
			this.axisLabelsToggle.check();
		} else {
			this.axisLabelsToggle.uncheck();
		} */
	};

})(ChemDoodle, ChemDoodle.uis.gui.desktop, ChemDoodle.lib.jQuery, document);
