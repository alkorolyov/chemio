//************************ HISTORY MANAGER ***********************
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

})(Chemio.uis.actions);
