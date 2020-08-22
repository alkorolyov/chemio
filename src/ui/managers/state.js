//************************ STATE MANAGER ***********************
(function(states, imageDepot, undefined) {
    'use strict';
    states.StateManager = function(sketcher) {
        this.STATE_NEW_BOND = new states.NewBondState(sketcher);
        this.STATE_NEW_RING = new states.NewRingState(sketcher);
        this.STATE_NEW_CHAIN = new states.NewChainState(sketcher);
        // this.STATE_NEW_TEMPLATE= new states.NewTemplateState(sketcher);
        // if(states.TextInputState){
        // 	this.STATE_TEXT_INPUT= new states.TextInputState(sketcher);
        // }
        this.STATE_CHARGE = new states.ChargeState(sketcher);
        // this.STATE_LONE_PAIR = new states.LonePairState(sketcher);
        // this.STATE_RADICAL = new states.RadicalState(sketcher);
        this.STATE_MOVE = new states.MoveState(sketcher);
        this.STATE_ERASE = new states.EraseState(sketcher);
        this.STATE_LABEL = new states.LabelState(sketcher);
        this.STATE_LASSO = new states.LassoState(sketcher);
        this.STATE_SHAPE = new states.ShapeState(sketcher);
        // this.STATE_PUSHER = new states.PusherState(sketcher);
        // this.STATE_DYNAMIC_BRACKET = new states.DynamicBracketState(sketcher);
        // this.STATE_VAP = new states.VAPState(sketcher);
        // this.STATE_QUERY = new states.QueryState(sketcher);
        let currentState = this.STATE_NEW_BOND;
        this.setState = function(nextState) {
            if (nextState !== currentState) {
                currentState.exit();
                currentState = nextState;
                currentState.enter();
            }
        };
        this.getCurrentState = function() {
            return currentState;
        };
    };

})(Chemio.uis.states, Chemio.uis.gui.imageDepot);
