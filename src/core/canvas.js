// ************************** Canvases ******************************

(function(c, render, featureDetection, math, monitor, structures, m, document, window, userAgent, undefined) {
    'use strict';
    c._Canvas = function() {
    };
    let _ = c._Canvas.prototype;
    _.molecules = undefined;
    _.shapes = undefined;
    _.emptyMessage = undefined;
    _.needRedraw = true;
    /**
     * @type {render.Renderer}
     */
    _.renderer = undefined;
    _.repaint = function() {
        if (this.test) {
            return;
        }
        let canvas = document.getElementById(this.id);
        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');
            if (this.pixelRatio !== 1 && canvas.width === this.width) {
                canvas.width = this.width * this.pixelRatio;
                canvas.height = this.height * this.pixelRatio;
                ctx.scale(this.pixelRatio, this.pixelRatio);
            }

            // 'transparent' is a keyword for canvas background fills
            // we can't actually use undefined, as the default css will be black, so use 'transparent'
            let colorUse = this.styles.backgroundColor?this.styles.backgroundColor:'transparent';
            // we always have to clearRect() as a rgba color or any color with alpha may be used
            ctx.clearRect(0, 0, this.width, this.height);
            if(this.bgCache !== colorUse) {
                canvas.style.backgroundColor = colorUse;
                this.bgCache = canvas.style.backgroundColor;
            }
            // it is probably more efficient not to paint over only if it is not undefined/'transparent'
            // but we still need to always paint over to make sure there is a background in exported images
            // set background to undefined/'transparent' if no background is desired in output images
            if(colorUse!=='transparent'){
                ctx.fillStyle = colorUse;
                ctx.fillRect(0, 0, this.width, this.height);
            }


            if (this.molecules.length !== 0 || this.shapes.length !== 0) {
                ctx.save();
                ctx.translate(this.width / 2, this.height / 2);
                ctx.rotate(this.styles.rotateAngle);
                ctx.scale(this.styles.scale, this.styles.scale);
                ctx.translate(-this.width / 2, -this.height / 2);
                for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                    this.molecules[i].check(true);
                    this.molecules[i].draw(ctx, this.styles);
                }
                if(this.checksOnAction){
                    // checksOnAction() must be called after checking molecules, as it depends on molecules being correct
                    // this function is only used by the uis
                    this.checksOnAction(true);
                }
                for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
                    this.shapes[i].draw(ctx, this.styles);
                }
                ctx.restore();
            } else if (this.emptyMessage) {
                ctx.fillStyle = '#737683';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '18px Helvetica, Verdana, Arial, Sans-serif';
                ctx.fillText(this.emptyMessage, this.width / 2, this.height / 2);
            }

            if (this.drawChildExtras) {
                this.drawChildExtras(ctx, this.styles);
            }
        }
    };
    _.resize = function(w, h) {

        let cap = document.querySelector('#' + this.id);
        cap.setAttribute('width', w);
        cap.setAttribute('height', h);
        cap.style.width = w;
        cap.style.height = h;

        this.width = w;
        this.height = h;
        if (c._Canvas3D && this instanceof c._Canvas3D) {
            let wu = w;
            let hu = h;
            if (this.pixelRatio !== 1) {
                wu *= this.pixelRatio;
                hu *= this.pixelRatio;
                this.gl.canvas.width = wu;
                this.gl.canvas.height = hu;
            }
            this.gl.viewport(0, 0, wu, hu);
            this.afterLoadContent();
        } else if (this.molecules.length > 0) {
            this.center();
            for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                this.molecules[i].check();
            }
        }
        this.renderer.redraw();
    };
    _.setBackgroundImage = function(path) {
        this.image = new Image(); // Create new Image object
        let self = this;
        this.image.onload = function() {
            self.repaint();
        };
        this.image.src = path; // Set source path
    };
    _.loadMolecule = function(molecule) {
        this.clear();
        this.molecules.push(molecule);
        // do this twice to center based on atom labels, which must be first rendered to be considered in bounds
        for(let i = 0; i<2; i++){
            this.center();
            if (!(c._Canvas3D && this instanceof c._Canvas3D)) {
                molecule.check();
            }
            if (this.afterLoadContent) {
                this.afterLoadContent();
            }
            this.renderer.redraw();
        }
    };
    _.loadContent = function(mols, shapes) {
        this.molecules = mols?mols:[];
        this.shapes = shapes?shapes:[];
        // do this twice to center based on atom labels, which must be first rendered to be considered in bounds
        for(let i = 0; i<2; i++){
            this.center();
            if (!(c._Canvas3D && this instanceof c._Canvas3D)) {
                for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                    this.molecules[i].check();
                }
            }
            if (this.afterLoadContent) {
                this.afterLoadContent();
            }
            this.renderer.redraw();
        }
    };
    _.addMolecule = function(molecule) {
        this.molecules.push(molecule);
        if (!(c._Canvas3D && this instanceof c._Canvas3D)) {
            molecule.check();
        }
        this.renderer.redraw();
    };
    _.removeMolecule = function(mol) {
        this.molecules = this.molecules.filter(function(value) {
            return value !== mol;
        });
        this.renderer.redraw();
    };
    _.getMolecule = function() {
        return this.molecules.length > 0 ? this.molecules[0] : undefined;
    };
    _.getMolecules = function() {
        return this.molecules;
    };
    _.addShape = function(shape) {
        this.shapes.push(shape);
        this.renderer.redraw();
    };
    _.removeShape = function(shape) {
        this.shapes = this.shapes.filter(function(value) {
            return value !== shape;
        });
        this.renderer.redraw();
    };
    _.getShapes = function() {
        return this.shapes;
    };
    _.clear = function() {
        this.molecules = [];
        this.shapes = [];
        this.styles.scale = 1;
        this.renderer.redraw();
    };
    _.center = function() {
        let bounds = this.getContentBounds();
        let center = new structures.Point((this.width - bounds.minX - bounds.maxX) / 2, (this.height - bounds.minY - bounds.maxY) / 2);
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            let mol = this.molecules[i];
            for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
                mol.atoms[j].add(center);
            }
        }
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            let sps = this.shapes[i].getPoints();
            for ( let j = 0, jj = sps.length; j < jj; j++) {
                sps[j].add(center);
            }
        }
        this.styles.scale = 1;
        let difX = bounds.maxX - bounds.minX;
        let difY = bounds.maxY - bounds.minY;
        if (difX > this.width-20 || difY > this.height-20) {
            this.styles.scale = m.min(this.width / difX, this.height / difY) * .85;
        }
    };
    _.bondExists = function(a1, a2) {
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            let mol = this.molecules[i];
            for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                let b = mol.bonds[j];
                if (b.contains(a1) && b.contains(a2)) {
                    return true;
                }
            }
        }
        return false;
    };
    _.getBond = function(a1, a2) {
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            let mol = this.molecules[i];
            for ( let j = 0, jj = mol.bonds.length; j < jj; j++) {
                let b = mol.bonds[j];
                if (b.contains(a1) && b.contains(a2)) {
                    return b;
                }
            }
        }
        return undefined;
    };
    _.getMoleculeByAtom = function(a) {
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            let mol = this.molecules[i];
            if (mol.atoms.indexOf(a) !== -1) {
                return mol;
            }
        }
        // using window.undefined stops Google Closure compiler from breaking this function, I don't know why...
        // I definitely want to just use undefined, but for now...
        return window.undefined;
    };
    _.getAllAtoms = function() {
        let as = [];
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            as = as.concat(this.molecules[i].atoms);
        }
        return as;
    };
    _.getAllBonds = function() {
        let bs = [];
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            bs = bs.concat(this.molecules[i].bonds);
        }
        return bs;
    };
    _.getAllPoints = function() {
        let ps = [];
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            ps = ps.concat(this.molecules[i].atoms);
        }
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            ps = ps.concat(this.shapes[i].getPoints());
        }
        return ps;
    };
    _.getContentBounds = function() {
        let bounds = new math.Bounds();
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            bounds.expand(this.molecules[i].getBounds());
        }
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            bounds.expand(this.shapes[i].getBounds());
        }
        return bounds;
    };
    _.init = function(id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.molecules = [];
        this.shapes = [];

        this.pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
        this.styles = new structures.Styles();
    }
    _.create = function(id, width, height) {
        // input width/height and this.width/height - in css pixels
        // canvas.width/height - in device pixels
        // device pixels = css pixels * devicePixelRatio

        this.init(id, width, height);

        if (!document.getElementById(id)) {
            document.writeln('<canvas class="ChemioWebComponent" id="' + id + '" width="' + width + '" height="' + height + '" alt="Chemio Web Component">This browser does not support HTML5/Canvas.</canvas>');
        } else {
            // if canvas was precreated
            let canvas = document.getElementById(id);
            if (width) {
                canvas.setAttribute('width', width);
            } else {
                this.width = parseInt(canvas.width)/this.pixelRatio;
            }
            if (height) {
                canvas.setAttribute('height', height);
            } else {
                this.height = parseInt(canvas.height)/this.pixelRatio;
            }
            canvas.className = "ChemioWebComponent";
        }

        this.canvas = document.getElementById(this.id);
        let canvas = this.canvas;
        this.context = this.canvas.getContext("2d");


        canvas.style.width = width.toString()+'px';
        canvas.style.height = height.toString()+'px';

        this.renderer = new render.Renderer(this);
        let renderer = this.renderer;
        console.log(renderer);
        console.log(this.renderer);
        console.log(renderer == this.renderer);
        renderer.startRenderLoop();
        renderer.redraw();

        // setup input events
        // make sure prehandle events are only in if statements if handled, so
        // as not to block browser events
        let self = this;

        // normal events
        // some mobile browsers will simulate mouse events, so do not set
        // these
        // events if mobile, or it will interfere with the handling of touch
        // events
        canvas.addEventListener('click', function(e) {
            switch (e.which) {
                case 1:
                    // left mouse button pressed
                    if (self.click) {
                        self.prehandleEvent(e);
                        self.click(e);
                    }
                    break;
                case 2:
                    // middle mouse button pressed
                    if (self.middleclick) {
                        self.prehandleEvent(e);
                        self.middleclick(e);
                    }
                    break;
                case 3:
                    // right mouse button pressed
                    if (self.rightclick) {
                        self.prehandleEvent(e);
                        self.rightclick(e);
                    }
                    break;
            }
        });

        canvas.addEventListener('dblclick', function(e) {
            if (self.dblclick) {
                self.prehandleEvent(e);
                self.dblclick(e);
            }
        });

        canvas.addEventListener('mousedown', function(e) {
            switch (e.which) {
                case 1:
                    // left mouse button pressed
                    monitor.CANVAS_DRAGGING = self;
                    if (self.mousedown) {
                        self.prehandleEvent(e);
                        self.mousedown(e);
                    }
                    break;
                case 2:
                    // middle mouse button pressed
                    if (self.middlemousedown) {
                        self.prehandleEvent(e);
                        self.middlemousedown(e);
                    }
                    break;
                case 3:
                    // right mouse button pressed
                    if (self.rightmousedown) {
                        self.prehandleEvent(e);
                        self.rightmousedown(e);
                    }
                    break;
            }
        });

        canvas.addEventListener('mousemove', function(e) {
            if (!monitor.CANVAS_DRAGGING && self.mousemove) {
                self.prehandleEvent(e);
                self.mousemove(e);
            }
        });

        canvas.addEventListener('mouseout', function(e) {
            monitor.CANVAS_OVER = undefined;
            if (self.mouseout) {
                self.prehandleEvent(e);
                self.mouseout(e);
            }
        });

        canvas.addEventListener('mouseover', function(e) {
            monitor.CANVAS_OVER = self;
            if (self.mouseover) {
                self.prehandleEvent(e);
                self.mouseover(e);
            }
        });

        canvas.addEventListener('mouseup', function(e) {
            switch (e.which) {
                case 1:
                    // left mouse button pressed
                    if (self.mouseup) {
                        self.prehandleEvent(e);
                        self.mouseup(e);
                    }
                    break;
                case 2:
                    // middle mouse button pressed
                    if (self.middlemouseup) {
                        self.prehandleEvent(e);
                        self.middlemouseup(e);
                    }
                    break;
                case 3:
                    // right mouse button pressed
                    if (self.rightmouseup) {
                        self.prehandleEvent(e);
                        self.rightmouseup(e);
                    }
                    break;
            }
        });

        canvas.addEventListener('wheel', function(e) {
            if (self.mousewheel) {
                self.prehandleEvent(e);
                self.mousewheel(e, -e.deltaY);
            }
        });

        if (this.subCreate) {
            this.subCreate();
        }
    };
    _.prehandleEvent = function(e) {
        if(!this.doEventDefault){
            e.preventDefault();
            e.returnValue = false;
        }
        let rect = this.canvas.getBoundingClientRect();
        e.offset = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
        };
        e.p = new structures.Point((e.pageX - e.offset.left), (e.pageY - e.offset.top));
    };

})(Chemio, Chemio.render, Chemio.featureDetection, Chemio.math, Chemio.monitor, Chemio.structures, Math, document, window, navigator.userAgent);

(function(c, undefined) {
    'use strict';
    c.ViewerCanvas = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
    };
    c.ViewerCanvas.prototype = new c._Canvas();

})(Chemio);

//region Unused canvases

// Spectrum canvas
// (function(c, document, undefined) {
// 	'use strict';
// 	c._SpectrumCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	let _ = c._SpectrumCanvas.prototype = new c._Canvas();
// 	_.spectrum = undefined;
// 	_.emptyMessage = 'No Spectrum Loaded or Recognized';
// 	_.loadMolecule = undefined;
// 	_.getMolecule = undefined;
// 	_.innerRepaint = function(ctx) {
// 		if (this.spectrum && this.spectrum.data.length > 0) {
// 			this.spectrum.draw(ctx, this.styles, this.width, this.height);
// 		} else if (this.emptyMessage) {
// 			ctx.fillStyle = '#737683';
// 			ctx.textAlign = 'center';
// 			ctx.textBaseline = 'middle';
// 			ctx.font = '18px Helvetica, Verdana, Arial, Sans-serif';
// 			ctx.fillText(this.emptyMessage, this.width / 2, this.height / 2);
// 		}
// 	};
// 	_.loadSpectrum = function(spectrum) {
// 		this.spectrum = spectrum;
// 		this.repaint();
// 	};
// 	_.getSpectrum = function() {
// 		return this.spectrum;
// 	};
// 	_.getSpectrumCoordinates = function(x, y) {
// 		return spectrum.getInternalCoordinates(x, y, this.width, this.height);
// 	};
//
// })(Chemio, document);

// (function(c, animations, undefined) {
// 	'use strict';
// 	c._AnimatorCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	let _ = c._AnimatorCanvas.prototype = new c._Canvas();
// 	_.timeout = 33;
// 	_.startAnimation = function() {
// 		this.stopAnimation();
// 		this.lastTime = new Date().getTime();
// 		let self = this;
// 		if (this.nextFrame) {
// 			this.handle = animations.requestInterval(function() {
// 				// advance clock
// 				let timeNow = new Date().getTime();
// 				// update and repaint
// 				self.nextFrame(timeNow - self.lastTime);
// 				self.repaint();
// 				self.lastTime = timeNow;
// 			}, this.timeout);
// 		}
// 	};
// 	_.stopAnimation = function() {
// 		if (this.handle) {
// 			animations.clearRequestInterval(this.handle);
// 			this.handle = undefined;
// 		}
// 	};
// 	_.isRunning = function() {
// 		// must compare to undefined here to return a boolean
// 		return this.handle !== undefined;
// 	};
//
// })(Chemio, Chemio.animations);

// (function(c, document, undefined) {
// 	'use strict';
// 	c.FileCanvas = function(id, width, height, action) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		let form = '<br><form name="FileForm" enctype="multipart/form-data" method="POST" action="' + action + '" target="HiddenFileFrame"><input type="file" name="f" /><input type="submit" name="submitbutton" value="Show File" /></form><iframe id="HFF-' + id + '" name="HiddenFileFrame" height="0" width="0" style="display:none;" onLoad="GetMolFromFrame(\'HFF-' + id + '\', ' + id + ')"></iframe>';
// 		document.writeln(form);
// 		this.emptyMessage = 'Click below to load file';
// 		this.repaint();
// 	};
// 	c.FileCanvas.prototype = new c._Canvas();
//
// })(Chemio, document);

// (function(c, undefined) {
// 	'use strict';
// 	c.HyperlinkCanvas = function(id, width, height, urlOrFunction, color, size) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		this.urlOrFunction = urlOrFunction;
// 		this.color = color ? color : 'blue';
// 		this.size = size ? size : 2;
// 	};
// 	let _ = c.HyperlinkCanvas.prototype = new c._Canvas();
// 	_.openInNewWindow = true;
// 	_.hoverImage = undefined;
// 	_.drawChildExtras = function(ctx) {
// 		if (this.e) {
// 			if (this.hoverImage) {
// 				ctx.drawImage(this.hoverImage, 0, 0);
// 			} else {
// 				ctx.strokeStyle = this.color;
// 				ctx.lineWidth = this.size * 2;
// 				ctx.strokeRect(0, 0, this.width, this.height);
// 			}
// 		}
// 	};
// 	_.setHoverImage = function(url) {
// 		this.hoverImage = new Image();
// 		this.hoverImage.src = url;
// 	};
// 	_.click = function(p) {
// 		this.e = undefined;
// 		this.repaint();
// 		if (this.urlOrFunction instanceof Function) {
// 			this.urlOrFunction();
// 		} else {
// 			if (this.openInNewWindow) {
// 				window.open(this.urlOrFunction);
// 			} else {
// 				location.href = this.urlOrFunction;
// 			}
// 		}
// 	};
// 	_.mouseout = function(e) {
// 		this.e = undefined;
// 		this.repaint();
// 	};
// 	_.mouseover = function(e) {
// 		this.e = e;
// 		this.repaint();
// 	};
//
// })(Chemio);
//
// (function(c, iChemLabs, q, document, undefined) {
// 	'use strict';
// 	c.MolGrabberCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		let sb = [];
// 		sb.push('<br><input type="text" id="');
// 		sb.push(id);
// 		sb.push('_query" size="32" value="" />');
// 		sb.push(this.getInputFields());
//
// 		// Don't use document.writeln here, it breaks the whole page after
// 		// document is closed.
// 		document.getElementById(id);
// 		let canvas = q('#' + id);
// 		canvas.after(sb.join(''));
//
// 		let self = this;
// 		q('#' + id + '_submit').click(function() {
// 			self.search();
// 		});
// 		q('#' + id + '_query').keypress(function(e) {
// 			if (e.which === 13) {
// 				self.search();
// 			}
// 		});
// 		this.emptyMessage = 'Enter search term below';
// 		this.repaint();
// 	};
// 	let _ = c.MolGrabberCanvas.prototype = new c._Canvas();
// 	_.setSearchTerm = function(term) {
// 		q('#' + this.id + '_query').val(term);
// 		this.search();
// 	};
// 	_.getInputFields = function(){
// 		let sb = [];
// 		sb.push('<br><nobr>');
// 		sb.push('<select id="');
// 		sb.push(this.id);
// 		sb.push('_select">');
// 		sb.push('<option value="chemexper">ChemExper');
// 		sb.push('<option value="chemspider">ChemSpider');
// 		sb.push('<option value="pubchem" selected>PubChem');
// 		sb.push('</select>');
// 		sb.push('<button type="button" id="');
// 		sb.push(this.id);
// 		sb.push('_submit">Show Molecule</button>');
// 		sb.push('</nobr>');
// 		return sb.join('');
// 	};
// 	_.search = function() {
// 		this.emptyMessage = 'Searching...';
// 		this.clear();
// 		let self = this;
// 		iChemLabs.getMoleculeFromDatabase(q('#' + this.id + '_query').val(), {
// 			database : q('#' + this.id + '_select').val()
// 		}, function(mol) {
// 			self.loadMolecule(mol);
// 		});
// 	};
//
// })(Chemio, Chemio.iChemLabs, Chemio.lib.jQuery, document);

// (function(c, m, m4, undefined) {
// 	'use strict';
// 	// keep these declaration outside the loop to avoid overhead
// 	let matrix = [];
// 	let xAxis = [ 1, 0, 0 ];
// 	let yAxis = [ 0, 1, 0 ];
// 	let zAxis = [ 0, 0, 1 ];
//
// 	c.RotatorCanvas = function(id, width, height, rotate3D) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		this.rotate3D = rotate3D;
// 	};
// 	let _ = c.RotatorCanvas.prototype = new c._AnimatorCanvas();
// 	let increment = m.PI / 15;
// 	_.xIncrement = increment;
// 	_.yIncrement = increment;
// 	_.zIncrement = increment;
// 	_.nextFrame = function(delta) {
// 		if (this.molecules.length === 0 && this.shapes.length === 0) {
// 			this.stopAnimation();
// 			return;
// 		}
// 		let change = delta / 1000;
// 		if (this.rotate3D) {
// 			m4.identity(matrix);
// 			m4.rotate(matrix, this.xIncrement * change, xAxis);
// 			m4.rotate(matrix, this.yIncrement * change, yAxis);
// 			m4.rotate(matrix, this.zIncrement * change, zAxis);
// 			for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
// 				let m = this.molecules[i];
// 				for ( let j = 0, jj = m.atoms.length; j < jj; j++) {
// 					let a = m.atoms[j];
// 					let p = [ a.x - this.width / 2, a.y - this.height / 2, a.z ];
// 					m4.multiplyVec3(matrix, p);
// 					a.x = p[0] + this.width / 2;
// 					a.y = p[1] + this.height / 2;
// 					a.z = p[2];
// 				}
// 				for ( let j = 0, jj = m.rings.length; j < jj; j++) {
// 					m.rings[j].center = m.rings[j].getCenter();
// 				}
// 				if (this.styles.atoms_display && this.styles.atoms_circles_2D) {
// 					m.sortAtomsByZ();
// 				}
// 				if (this.styles.bonds_display && this.styles.bonds_clearOverlaps_2D) {
// 					m.sortBondsByZ();
// 				}
// 			}
// 			for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
// 				let sps = this.shapes[i].getPoints();
// 				for ( let j = 0, jj = sps.length; j < jj; j++) {
// 					let a = sps[j];
// 					let p = [ a.x - this.width / 2, a.y - this.height / 2, 0 ];
// 					m4.multiplyVec3(matrix, p);
// 					a.x = p[0] + this.width / 2;
// 					a.y = p[1] + this.height / 2;
// 				}
// 			}
// 		} else {
// 			this.styles.rotateAngle += this.zIncrement * change;
// 		}
// 	};
// 	_.dblclick = function(e) {
// 		if (this.isRunning()) {
// 			this.stopAnimation();
// 		} else {
// 			this.startAnimation();
// 		}
// 	};
//
// })(Chemio, Math, Chemio.lib.mat4);

// (function(c, animations, math, undefined) {
// 	'use strict';
// 	c.SlideshowCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	let _ = c.SlideshowCanvas.prototype = new c._AnimatorCanvas();
// 	_.frames = [];
// 	_.curIndex = 0;
// 	_.timeout = 5000;
// 	_.alpha = 0;
// 	_.innerHandle = undefined;
// 	_.phase = 0;
// 	_.drawChildExtras = function(ctx) {
// 		let rgb = math.getRGB(this.styles.backgroundColor, 255);
// 		ctx.fillStyle = 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + this.alpha + ')';
// 		ctx.fillRect(0, 0, this.width, this.height);
// 	};
// 	_.nextFrame = function(delta) {
// 		if (this.frames.length === 0) {
// 			this.stopAnimation();
// 			return;
// 		}
// 		this.phase = 0;
// 		let self = this;
// 		let count = 1;
// 		this.innerHandle = setInterval(function() {
// 			self.alpha = count / 15;
// 			self.repaint();
// 			if (count === 15) {
// 				self.breakInnerHandle();
// 			}
// 			count++;
// 		}, 33);
// 	};
// 	_.breakInnerHandle = function() {
// 		if (this.innerHandle) {
// 			clearInterval(this.innerHandle);
// 			this.innerHandle = undefined;
// 		}
// 		if (this.phase === 0) {
// 			this.curIndex++;
// 			if (this.curIndex > this.frames.length - 1) {
// 				this.curIndex = 0;
// 			}
// 			this.alpha = 1;
// 			let f = this.frames[this.curIndex];
// 			this.loadContent(f.mols, f.shapes);
// 			this.phase = 1;
// 			let self = this;
// 			let count = 1;
// 			this.innerHandle = setInterval(function() {
// 				self.alpha = (15 - count) / 15;
// 				self.repaint();
// 				if (count === 15) {
// 					self.breakInnerHandle();
// 				}
// 				count++;
// 			}, 33);
// 		} else if (this.phase === 1) {
// 			this.alpha = 0;
// 			this.repaint();
// 		}
// 	};
// 	_.addFrame = function(molecules, shapes) {
// 		if (this.frames.length === 0) {
// 			this.loadContent(molecules, shapes);
// 		}
// 		this.frames.push({
// 			mols : molecules,
// 			shapes : shapes
// 		});
// 	};
//
// })(Chemio, Chemio.animations, Chemio.math);

// (function(c, monitor, structures, m, m4, undefined) {
// 	'use strict';
// 	c.TransformCanvas = function(id, width, height, rotate3D) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		this.rotate3D = rotate3D;
// 	};
// 	let _ = c.TransformCanvas.prototype = new c._Canvas();
// 	_.lastPoint = undefined;
// 	_.rotationMultMod = 1.3;
// 	_.lastPinchScale = 1;
// 	_.lastGestureRotate = 0;
// 	_.mousedown = function(e) {
// 		this.lastPoint = e.p;
// 	};
// 	_.dblclick = function(e) {
// 		// center structure
// 		this.center();
// 		this.repaint();
// 	};
// 	_.drag = function(e) {
// 		if (!this.lastPoint.multi) {
// 			if (monitor.ALT) {
// 				let t = new structures.Point(e.p.x, e.p.y);
// 				t.sub(this.lastPoint);
// 				for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
// 					let mol = this.molecules[i];
// 					for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
// 						mol.atoms[j].add(t);
// 					}
// 					mol.check();
// 				}
// 				for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
// 					let sps = this.shapes[i].getPoints();
// 					for ( let j = 0, jj = sps.length; j < jj; j++) {
// 						sps[j].add(t);
// 					}
// 				}
// 				this.lastPoint = e.p;
// 				this.repaint();
// 			} else {
// 				if (this.rotate3D === true) {
// 					let diameter = m.max(this.width / 4, this.height / 4);
// 					let difx = e.p.x - this.lastPoint.x;
// 					let dify = e.p.y - this.lastPoint.y;
// 					let yIncrement = difx / diameter * this.rotationMultMod;
// 					let xIncrement = -dify / diameter * this.rotationMultMod;
// 					let matrix = [];
// 					m4.identity(matrix);
// 					m4.rotate(matrix, xIncrement, [ 1, 0, 0 ]);
// 					m4.rotate(matrix, yIncrement, [ 0, 1, 0 ]);
// 					for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
// 						let mol = this.molecules[i];
// 						for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
// 							let a = mol.atoms[j];
// 							let p = [ a.x - this.width / 2, a.y - this.height / 2, a.z ];
// 							m4.multiplyVec3(matrix, p);
// 							a.x = p[0] + this.width / 2;
// 							a.y = p[1] + this.height / 2;
// 							a.z = p[2];
// 						}
// 						for ( let i = 0, ii = mol.rings.length; i < ii; i++) {
// 							mol.rings[i].center = mol.rings[i].getCenter();
// 						}
// 						this.lastPoint = e.p;
// 						if (this.styles.atoms_display && this.styles.atoms_circles_2D) {
// 							mol.sortAtomsByZ();
// 						}
// 						if (this.styles.bonds_display && this.styles.bonds_clearOverlaps_2D) {
// 							mol.sortBondsByZ();
// 						}
// 					}
// 					this.repaint();
// 				} else {
// 					let center = new structures.Point(this.width / 2, this.height / 2);
// 					let before = center.angle(this.lastPoint);
// 					let after = center.angle(e.p);
// 					this.styles.rotateAngle -= (after - before);
// 					this.lastPoint = e.p;
// 					this.repaint();
// 				}
// 			}
// 		}
// 	};
// 	_.mousewheel = function(e, delta) {
// 		this.styles.scale += delta / 50;
// 		if (this.styles.scale < .01) {
// 			this.styles.scale = .01;
// 		}
// 		this.repaint();
// 	};
// 	_.multitouchmove = function(e, numFingers) {
// 		if (numFingers === 2) {
// 			if (this.lastPoint.multi) {
// 				let t = new structures.Point(e.p.x, e.p.y);
// 				t.sub(this.lastPoint);
// 				for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
// 					let m = this.molecules[i];
// 					for ( let j = 0, jj = m.atoms.length; j < jj; j++) {
// 						m.atoms[j].add(t);
// 					}
// 					m.check();
// 				}
// 				for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
// 					let sps = this.shapes[i].getPoints();
// 					for ( let j = 0, jj = sps.length; j < jj; j++) {
// 						sps[j].add(t);
// 					}
// 				}
// 				this.lastPoint = e.p;
// 				this.lastPoint.multi = true;
// 				this.repaint();
// 			} else {
// 				this.lastPoint = e.p;
// 				this.lastPoint.multi = true;
// 			}
// 		}
// 	};
// 	_.gesturechange = function(e) {
// 		if (e.originalEvent.scale - this.lastPinchScale !== 0) {
// 			this.styles.scale *= e.originalEvent.scale / this.lastPinchScale;
// 			if (this.styles.scale < .01) {
// 				this.styles.scale = .01;
// 			}
// 			this.lastPinchScale = e.originalEvent.scale;
// 		}
// 		if (this.lastGestureRotate - e.originalEvent.rotation !== 0) {
// 			let rot = (this.lastGestureRotate - e.originalEvent.rotation) / 180 * m.PI;
// 			let center = new structures.Point(this.width / 2, this.height / 2);
// 			for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
// 				let mol = this.molecules[i];
// 				for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
// 					let a = mol.atoms[j];
// 					let dist = center.distance(a);
// 					let angle = center.angle(a) + rot;
// 					a.x = center.x + dist * m.cos(angle);
// 					a.y = center.y - dist * m.sin(angle);
// 				}
// 				mol.check();
// 			}
// 			this.lastGestureRotate = e.originalEvent.rotation;
// 		}
// 		this.repaint();
// 	};
// 	_.gestureend = function(e) {
// 		this.lastPinchScale = 1;
// 		this.lastGestureRotate = 0;
// 	};
//
// })(Chemio, Chemio.monitor, Chemio.structures, Math, Chemio.lib.mat4);

// (function(c, undefined) {
// 	'use strict';
// 	c.ObserverCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	c.ObserverCanvas.prototype = new c._SpectrumCanvas();
//
// })(Chemio);

// (function(c, undefined) {
// 	'use strict';
// 	c.OverlayCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	let _ = c.OverlayCanvas.prototype = new c._SpectrumCanvas();
// 	_.overlaySpectra = [];
// 	_.superRepaint = _.innerRepaint;
// 	_.innerRepaint = function(ctx) {
// 		this.superRepaint(ctx);
// 		if (this.spectrum && this.spectrum.data.length > 0) {
// 			for ( let i = 0, ii = this.overlaySpectra.length; i < ii; i++) {
// 				let s = this.overlaySpectra[i];
// 				if (s && s.data.length > 0) {
// 					s.minX = this.spectrum.minX;
// 					s.maxX = this.spectrum.maxX;
// 					s.drawPlot(ctx, this.styles, this.width, this.height, this.spectrum.memory.offsetTop, this.spectrum.memory.offsetLeft, this.spectrum.memory.offsetBottom);
// 				}
// 			}
// 		}
// 	};
// 	_.addSpectrum = function(spectrum) {
// 		if (!this.spectrum) {
// 			this.spectrum = spectrum;
// 		} else {
// 			this.overlaySpectra.push(spectrum);
// 		}
// 	};
//
// })(Chemio);

// (function(c, monitor, m, undefined) {
// 	'use strict';
// 	c.PerspectiveCanvas = function(id, width, height) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 	};
// 	let _ = c.PerspectiveCanvas.prototype = new c._SpectrumCanvas();
// 	_.dragRange = undefined;
// 	_.rescaleYAxisOnZoom = true;
// 	_.lastPinchScale = 1;
// 	_.mousedown = function(e) {
// 		this.dragRange = new c.structures.Point(e.p.x, e.p.x);
// 	};
// 	_.mouseup = function(e) {
// 		if (this.dragRange && this.dragRange.x !== this.dragRange.y) {
// 			if (!this.dragRange.multi) {
// 				let newScale = this.spectrum.zoom(this.dragRange.x, e.p.x, this.width, this.rescaleYAxisOnZoom);
// 				if (this.rescaleYAxisOnZoom) {
// 					this.styles.scale = newScale;
// 				}
// 			}
// 			this.dragRange = undefined;
// 			this.repaint();
// 		}
// 	};
// 	_.drag = function(e) {
// 		if (this.dragRange) {
// 			if (this.dragRange.multi) {
// 				this.dragRange = undefined;
// 			} else if (monitor.SHIFT) {
// 				this.spectrum.translate(e.p.x - this.dragRange.x, this.width);
// 				this.dragRange.x = e.p.x;
// 				this.dragRange.y = e.p.x;
// 			} else {
// 				this.dragRange.y = e.p.x;
// 			}
// 			this.repaint();
// 		}
// 	};
// 	_.drawChildExtras = function(ctx) {
// 		if (this.dragRange) {
// 			let xs = m.min(this.dragRange.x, this.dragRange.y);
// 			let xe = m.max(this.dragRange.x, this.dragRange.y);
// 			ctx.strokeStyle = 'gray';
// 			ctx.lineStyle = 1;
// 			ctx.beginPath();
// 			ctx.moveTo(xs, this.height / 2);
// 			for ( let i = xs; i <= xe; i++) {
// 				if (i % 10 < 5) {
// 					ctx.lineTo(i, m.round(this.height / 2));
// 				} else {
// 					ctx.moveTo(i, m.round(this.height / 2));
// 				}
// 			}
// 			ctx.stroke();
// 		}
// 	};
// 	_.mousewheel = function(e, delta) {
// 		this.styles.scale -= delta / 10;
// 		if (this.styles.scale < .01) {
// 			this.styles.scale = .01;
// 		}
// 		this.repaint();
// 	};
// 	_.dblclick = function(e) {
// 		this.spectrum.setup();
// 		this.styles.scale = 1;
// 		this.repaint();
// 	};
// 	_.multitouchmove = function(e, numFingers) {
// 		if (numFingers === 2) {
// 			if (!this.dragRange || !this.dragRange.multi) {
// 				this.dragRange = new c.structures.Point(e.p.x, e.p.x);
// 				this.dragRange.multi = true;
// 			} else {
// 				this.spectrum.translate(e.p.x - this.dragRange.x, this.width);
// 				this.dragRange.x = e.p.x;
// 				this.dragRange.y = e.p.x;
// 				this.repaint();
// 			}
// 		}
// 	};
// 	_.gesturechange = function(e) {
// 		this.styles.scale *= e.originalEvent.scale / this.lastPinchScale;
// 		if (this.styles.scale < .01) {
// 			this.styles.scale = .01;
// 		}
// 		this.lastPinchScale = e.originalEvent.scale;
// 		this.repaint();
// 	};
// 	_.gestureend = function(e) {
// 		this.lastPinchScale = 1;
// 	};
//
// })(Chemio, Chemio.monitor, Math);

// (function(c, extensions, m, undefined) {
// 	'use strict';
// 	c.SeekerCanvas = function(id, width, height, seekType) {
// 		if (id) {
// 			this.create(id, width, height);
// 		}
// 		this.seekType = seekType;
// 	};
// 	let _ = c.SeekerCanvas.prototype = new c._SpectrumCanvas();
// 	_.superRepaint = _.innerRepaint;
// 	_.innerRepaint = function(ctx) {
// 		this.superRepaint(ctx);
// 		if (this.spectrum && this.spectrum.data.length > 0 && this.p) {
// 			// set up coords
// 			let renderP;
// 			let internalP;
// 			if (this.seekType === c.SeekerCanvas.SEEK_POINTER) {
// 				renderP = this.p;
// 				internalP = this.spectrum.getInternalCoordinates(renderP.x, renderP.y);
// 			} else if (this.seekType === c.SeekerCanvas.SEEK_PLOT || this.seekType === c.SeekerCanvas.SEEK_PEAK) {
// 				internalP = this.seekType === c.SeekerCanvas.SEEK_PLOT ? this.spectrum.getClosestPlotInternalCoordinates(this.p.x) : this.spectrum.getClosestPeakInternalCoordinates(this.p.x);
// 				if (!internalP) {
// 					return;
// 				}
// 				renderP = {
// 					x : this.spectrum.getTransformedX(internalP.x, this.styles, this.width, this.spectrum.memory.offsetLeft),
// 					y : this.spectrum.getTransformedY(internalP.y / 100, this.styles, this.height, this.spectrum.memory.offsetBottom, this.spectrum.memory.offsetTop)
// 				};
// 			}
// 			// draw point
// 			ctx.fillStyle = 'white';
// 			ctx.strokeStyle = this.styles.plots_color;
// 			ctx.lineWidth = this.styles.plots_width;
// 			ctx.beginPath();
// 			ctx.arc(renderP.x, renderP.y, 3, 0, m.PI * 2, false);
// 			ctx.fill();
// 			ctx.stroke();
// 			// draw internal coordinates
// 			ctx.font = extensions.getFontString(this.styles.text_font_size, this.styles.text_font_families);
// 			ctx.textAlign = 'left';
// 			ctx.textBaseline = 'bottom';
// 			let s = 'x:' + internalP.x.toFixed(3) + ', y:' + internalP.y.toFixed(3);
// 			let x = renderP.x + 3;
// 			let w = ctx.measureText(s).width;
// 			if (x + w > this.width - 2) {
// 				x -= 6 + w;
// 			}
// 			let y = renderP.y;
// 			if (y - this.styles.text_font_size - 2 < 0) {
// 				y += this.styles.text_font_size;
// 			}
// 			ctx.fillRect(x, y - this.styles.text_font_size, w, this.styles.text_font_size);
// 			ctx.fillStyle = 'black';
// 			ctx.fillText(s, x, y);
// 		}
// 	};
// 	_.mouseout = function(e) {
// 		this.p = undefined;
// 		this.repaint();
// 	};
// 	_.mousemove = function(e) {
// 		this.p = {
// 			x : e.p.x - 2,
// 			y : e.p.y - 3
// 		};
// 		this.repaint();
// 	};
// 	_.touchstart = function(e) {
// 		this.mousemove(e);
// 	};
// 	_.touchmove = function(e) {
// 		this.mousemove(e);
// 	};
// 	_.touchend = function(e) {
// 		this.mouseout(e);
// 	};
// 	c.SeekerCanvas.SEEK_POINTER = 'pointer';
// 	c.SeekerCanvas.SEEK_PLOT = 'plot';
// 	c.SeekerCanvas.SEEK_PEAK = 'peak';
//
// })(Chemio, Chemio.extensions, Math);

// (function(c, extensions, math, document, undefined) {
// 	'use strict';
// 	function PeriodicCell(element, x, y, dimension) {
// 		this.element = element;
// 		this.x = x;
// 		this.y = y;
// 		this.dimension = dimension;
// 		this.allowMultipleSelections = false;
// 	}
//
// 	c.PeriodicTableCanvas = function(id, cellDimension) {
// 		this.padding = 5;
// 		if (id) {
// 			this.create(id, cellDimension * 18 + this.padding * 2, cellDimension * 10 + this.padding * 2);
// 		}
// 		this.cellDimension = cellDimension ? cellDimension : 20;
// 		this.setupTable();
// 		this.repaint();
// 	};
// 	let _ = c.PeriodicTableCanvas.prototype = new c._Canvas();
// 	_.loadMolecule = undefined;
// 	_.getMolecule = undefined;
// 	_.getHoveredElement = function() {
// 		if (this.hovered) {
// 			return this.hovered.element;
// 		}
// 		return undefined;
// 	};
// 	_.innerRepaint = function(ctx) {
// 		for ( let i = 0, ii = this.cells.length; i < ii; i++) {
// 			this.drawCell(ctx, this.styles, this.cells[i]);
// 		}
// 		if (this.hovered) {
// 			this.drawCell(ctx, this.styles, this.hovered);
// 		}
// 		if (this.selected) {
// 			this.drawCell(ctx, this.styles, this.selected);
// 		}
// 	};
// 	_.setupTable = function() {
// 		this.cells = [];
// 		let x = this.padding;
// 		let y = this.padding;
// 		let count = 0;
// 		for ( let i = 0, ii = c.SYMBOLS.length; i < ii; i++) {
// 			if (count === 18) {
// 				count = 0;
// 				y += this.cellDimension;
// 				x = this.padding;
// 			}
// 			let e = c.ELEMENT[c.SYMBOLS[i]];
// 			if (e.atomicNumber === 2) {
// 				x += 16 * this.cellDimension;
// 				count += 16;
// 			} else if (e.atomicNumber === 5 || e.atomicNumber === 13) {
// 				x += 10 * this.cellDimension;
// 				count += 10;
// 			}
// 			if ((e.atomicNumber < 58 || e.atomicNumber > 71 && e.atomicNumber < 90 || e.atomicNumber > 103) && e.atomicNumber <= 118) {
// 				this.cells.push(new PeriodicCell(e, x, y, this.cellDimension));
// 				x += this.cellDimension;
// 				count++;
// 			}
// 		}
// 		y += 2 * this.cellDimension;
// 		x = 3 * this.cellDimension + this.padding;
// 		for ( let i = 57; i < 104; i++) {
// 			let e = c.ELEMENT[c.SYMBOLS[i]];
// 			if (e.atomicNumber === 90) {
// 				y += this.cellDimension;
// 				x = 3 * this.cellDimension + this.padding;
// 			}
// 			if (e.atomicNumber >= 58 && e.atomicNumber <= 71 || e.atomicNumber >= 90 && e.atomicNumber <= 103) {
// 				this.cells.push(new PeriodicCell(e, x, y, this.cellDimension));
// 				x += this.cellDimension;
// 			}
// 		}
// 	};
// 	_.drawCell = function(ctx, styles, cell) {
// 		let radgrad = ctx.createRadialGradient(cell.x + cell.dimension / 3, cell.y + cell.dimension / 3, cell.dimension * 1.5, cell.x + cell.dimension / 3, cell.y + cell.dimension / 3, cell.dimension / 10);
// 		radgrad.addColorStop(0, '#000000');
// 		radgrad.addColorStop(.7, cell.element.jmolColor);
// 		radgrad.addColorStop(1, '#FFFFFF');
// 		ctx.fillStyle = radgrad;
// 		extensions.contextRoundRect(ctx, cell.x, cell.y, cell.dimension, cell.dimension, cell.dimension / 8);
// 		if (cell === this.hovered || cell === this.selected || cell.selected) {
// 			ctx.lineWidth = 2;
// 			ctx.strokeStyle = '#c10000';
// 			ctx.stroke();
// 			ctx.fillStyle = 'white';
// 		}
// 		ctx.fill();
// 		ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
// 		ctx.fillStyle = styles.text_color;
// 		ctx.textAlign = 'center';
// 		ctx.textBaseline = 'middle';
// 		ctx.fillText(cell.element.symbol, cell.x + cell.dimension / 2, cell.y + cell.dimension / 2);
// 	};
// 	_.click = function(e) {
// 		if (this.hovered) {
// 			if(this.allowMultipleSelections){
// 				this.hovered.selected = !this.hovered.selected;
// 			}else{
// 				this.selected = this.hovered;
// 			}
// 			this.repaint();
// 		}
// 	};
// 	_.touchstart = function(e){
// 		// try to hover an element
// 		this.mousemove(e);
// 	};
// 	_.mousemove = function(e) {
// 		let x = e.p.x;
// 		let y = e.p.y;
// 		this.hovered = undefined;
// 		for ( let i = 0, ii = this.cells.length; i < ii; i++) {
// 			let c = this.cells[i];
// 			if (math.isBetween(x, c.x, c.x + c.dimension) && math.isBetween(y, c.y, c.y + c.dimension)) {
// 				this.hovered = c;
// 				break;
// 			}
// 		}
// 		this.repaint();
// 	};
// 	_.mouseout = function(e) {
// 		this.hovered = undefined;
// 		this.repaint();
// 	};
//
// })(Chemio, Chemio.extensions, Chemio.math, document);

//endregion
