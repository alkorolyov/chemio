// tutorial 1
// let message = 'version:' + ChemDoodle.getVersion();
// console.log(message);
//
// function logMolecule(mol) {
//     let message = 'Atoms count:' + mol.atoms.length + '\n'
//     + 'Bond count:' + mol.bonds.length;
//     console.log(message);
// };
//
// let mol = new ChemDoodle.structures.Molecule();
// logMolecule(mol);
//
// // tutorial 2
// function createNewMol() {
//     let mol = new ChemDoodle.structures.Molecule();
//     let carbon = new ChemDoodle.structures.Atom('C');
//     let oxygen = new ChemDoodle.structures.Atom('O');
//     let hydrogen = new ChemDoodle.structures.Atom('H');
//     let bond = new ChemDoodle.structures.Bond(carbon, oxygen, 2);
//     mol.atoms[0] = carbon;
//     mol.atoms[1] = oxygen;
//     mol.bonds[0] = bond;
//     return mol;
// };
//
// let mol2 = createNewMol();
// logMolecule(mol2);
//
// // tutorial 3
// let pyridineMolFile = 'Molecule Name\n  CHEMDOOD01011121543D 0   0.00000     0.00000     0\n[Insert Comment Here]\n  6  6  0  0  0  0  0  0  0  0  1 V2000\n    0.0000    1.0000    0.0000   N 0  0  0  0  0  0  0  0  0  0  0  0\n   -0.8660    0.5000    0.0000   C 0  0  0  0  0  0  0  0  0  0  0  0\n   -0.8660   -0.5000    0.0000   C 0  0  0  0  0  0  0  0  0  0  0  0\n    0.0000   -1.0000    0.0000   C 0  0  0  0  0  0  0  0  0  0  0  0\n    0.8660   -0.5000    0.0000   C 0  0  0  0  0  0  0  0  0  0  0  0\n    0.8660    0.5000    0.0000   C 0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  2  0  0  0  0\n  2  3  1  0  0  0  0\n  3  4  2  0  0  0  0\n  4  5  1  0  0  0  0\n  5  6  2  0  0  0  0\n  6  1  1  0  0  0  0\nM  END';
// let pyridine = ChemDoodle.readMOL(pyridineMolFile);
// logMolecule(pyridine);
//
// set defaults
ChemDoodle.DEFAULT_STYLES.bonds_width_2D = 2;
ChemDoodle.DEFAULT_STYLES.bonds_saturationWidthAbs_2D = 5;
ChemDoodle.DEFAULT_STYLES.bonds_hashSpacing_2D = 2.5;
ChemDoodle.DEFAULT_STYLES.atoms_font_size_2D = 13;
ChemDoodle.DEFAULT_STYLES.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
ChemDoodle.DEFAULT_STYLES.atoms_font_bold_2D = true;
ChemDoodle.DEFAULT_STYLES.atoms_displayTerminalCarbonLabels_2D = false;
ChemDoodle.DEFAULT_STYLES.atoms_useJMOLColors = false;
ChemDoodle.DEFAULT_STYLES.colorHover= '#0060B2';
//
//
// let myCanvas = new ChemDoodle.ViewerCanvas('id', 150, 150);
//
// // pyridine.scaleToAverageBondLength(10)
// myCanvas.loadMolecule(pyridine);
//
// // tutorial 4
// HideAndSeekCanvas = function (id, width, height, color) {
//     this.color = color;
//     this.fillOverlay = true;
//     this.mouseover = function () {
//         this.fillOverlay = false;
//         this.repaint();
//     }
//     this.mouseout = function () {
//         this.fillOverlay = true;
//         this.repaint();
//     }
//     this.drawChildExtras = function (ctx) {
//         if(this.fillOverlay) {
//             ctx.fillStyle = this.color;
//             ctx.fillRect(0, 0, this.width, this.height);
//         }
//     }
//     this.create(id, width, height);
// }
//
// HideAndSeekCanvas.prototype = new ChemDoodle._Canvas();
// let hideAndSeekCanvas = new HideAndSeekCanvas('hideAndSeek', 100, 100, '#49A3FC');
//
// hideAndSeekCanvas.loadMolecule(pyridine);

// tutorial 5
let sketcherCanvas = new ChemDoodle.SketcherCanvas('sketcher', 600, 400, {hideHelp: true});

