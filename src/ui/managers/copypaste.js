//************************ COPY PASTE MANAGER ***********************
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
            //this.sketcher.toolbarManager.buttonPaste.enable();
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

})(Chemio.informatics, Chemio.io, Chemio.structures, Chemio.uis, Chemio.uis.actions);
