(function(render, window){
    'use strict';
    /**
     * @param {_Canvas} canvas
     */
    render.Renderer = function(canvas){
        this.canvas = canvas;
        this.requestedFrame = false;
        this.renderLoopStarted = false;
    };

    let _ = render.Renderer.prototype

    _.redraw = function(options){
        this.options = options || {};
        this.requestedFrame = true;
    };

    _.startRenderLoop = function() {
        if (this.renderLoopStarted) {
            return;
        } else {
            this.renderLoopStarted = true;
        }

        let renderFn = () => {
            if (this.requestedFrame) {
                this.render();
                this.requestedFrame = false;
            }
            window.requestAnimationFrame(renderFn);
        };

        window.requestAnimationFrame(renderFn);
    };

    _.render = function() {
        if(!(this.canvas.needRedraw)) return
        console.log('from render');
        this.canvas.repaint();
    }
})(Chemio.render, window);


