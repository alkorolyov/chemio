// ************************** Shapes ******************************

(function(math, d2, m, undefined) {
    'use strict';
    d2._Shape = function() {
    };
    let _ = d2._Shape.prototype;
    _.drawDecorations = function(ctx, styles) {
        if (this.isHover) {
            let ps = this.getPoints();
            for ( let i = 0, ii = ps.length; i < ii; i++) {
                let p = ps[i];
                this.drawAnchor(ctx, styles, p, p === this.hoverPoint);
            }
        }
    };
    _.getBounds = function() {
        let bounds = new math.Bounds();
        let ps = this.getPoints();
        for ( let i = 0, ii = ps.length; i < ii; i++) {
            let p = ps[i];
            bounds.expand(p.x, p.y);
        }
        return bounds;
    };
    _.drawAnchor = function(ctx, styles, p, hovered) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(m.PI / 4);
        ctx.scale(1 / styles.scale, 1 / styles.scale);
        let boxRadius = 4;
        let innerRadius = boxRadius / 2;

        ctx.beginPath();
        ctx.moveTo(-boxRadius, -boxRadius);
        ctx.lineTo(boxRadius, -boxRadius);
        ctx.lineTo(boxRadius, boxRadius);
        ctx.lineTo(-boxRadius, boxRadius);
        ctx.closePath();
        if (hovered) {
            ctx.fillStyle = styles.colorHover;
        } else {
            ctx.fillStyle = 'white';
        }
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-boxRadius, -innerRadius);
        ctx.lineTo(-boxRadius, -boxRadius);
        ctx.lineTo(-innerRadius, -boxRadius);
        ctx.moveTo(innerRadius, -boxRadius);
        ctx.lineTo(boxRadius, -boxRadius);
        ctx.lineTo(boxRadius, -innerRadius);
        ctx.moveTo(boxRadius, innerRadius);
        ctx.lineTo(boxRadius, boxRadius);
        ctx.lineTo(innerRadius, boxRadius);
        ctx.moveTo(-innerRadius, boxRadius);
        ctx.lineTo(-boxRadius, boxRadius);
        ctx.lineTo(-boxRadius, innerRadius);
        ctx.moveTo(-boxRadius, -innerRadius);

        ctx.strokeStyle = 'rgba(0,0,0,.2)';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

})(Chemio.math, Chemio.structures.d2, Math);

(function(extensions, math, structures, d2, m, undefined) {
    'use strict';
    d2.Line = function(p1, p2) {
        this.p1 = p1 ? p1 : new structures.Point();
        this.p2 = p2 ? p2 : new structures.Point();
    };
    d2.Line.ARROW_SYNTHETIC = 'synthetic';
    d2.Line.ARROW_RETROSYNTHETIC = 'retrosynthetic';
    d2.Line.ARROW_RESONANCE = 'resonance';
    d2.Line.ARROW_EQUILIBRIUM = 'equilibrium';
    let _ = d2.Line.prototype = new d2._Shape();
    _.arrowType = undefined;
    _.topText = undefined;
    _.bottomText = undefined;
    _.draw = function(ctx, styles) {
        if (this.isLassoed) {
            let useDist = 2.5;
            let perpendicular = this.p1.angle(this.p2) + m.PI / 2;
            let mcosp = m.cos(perpendicular);
            let msinp = m.sin(perpendicular);
            let cx1 = this.p1.x - mcosp * useDist;
            let cy1 = this.p1.y + msinp * useDist;
            let cx2 = this.p1.x + mcosp * useDist;
            let cy2 = this.p1.y - msinp * useDist;
            let cx3 = this.p2.x + mcosp * useDist;
            let cy3 = this.p2.y - msinp * useDist;
            let cx4 = this.p2.x - mcosp * useDist;
            let cy4 = this.p2.y + msinp * useDist;
            ctx.fillStyle = styles.colorSelect;
            ctx.beginPath();
            ctx.moveTo(cx1, cy1);
            ctx.lineTo(cx2, cy2);
            ctx.lineTo(cx3, cy3);
            ctx.lineTo(cx4, cy4);
            ctx.closePath();
            ctx.fill();
        }
        ctx.strokeStyle = styles.shapes_color;
        ctx.fillStyle = styles.shapes_color;
        ctx.lineWidth = styles.shapes_lineWidth;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';
        if (this.p1.x !== this.p2.x || this.p1.y !== this.p2.y) {
            // only render if the points are different, otherwise this will
            // cause fill overflows

            // if (this.arrowType === d2.Line.ARROW_RETROSYNTHETIC) {
            //     let r2 = m.sqrt(2) * 2;
            //     let useDist = styles.shapes_arrowLength_2D / r2;
            //     let angle = this.p1.angle(this.p2);
            //     let perpendicular = angle + m.PI / 2;
            //     let retract = styles.shapes_arrowLength_2D / r2;
            //     let mcosa = m.cos(angle);
            //     let msina = m.sin(angle);
            //     let mcosp = m.cos(perpendicular);
            //     let msinp = m.sin(perpendicular);
            //     let cx1 = this.p1.x - mcosp * useDist;
            //     let cy1 = this.p1.y + msinp * useDist;
            //     let cx2 = this.p1.x + mcosp * useDist;
            //     let cy2 = this.p1.y - msinp * useDist;
            //     let cx3 = this.p2.x + mcosp * useDist - mcosa * retract;
            //     let cy3 = this.p2.y - msinp * useDist + msina * retract;
            //     let cx4 = this.p2.x - mcosp * useDist - mcosa * retract;
            //     let cy4 = this.p2.y + msinp * useDist + msina * retract;
            //     let ax1 = this.p2.x + mcosp * useDist * 2 - mcosa * retract * 2;
            //     let ay1 = this.p2.y - msinp * useDist * 2 + msina * retract * 2;
            //     let ax2 = this.p2.x - mcosp * useDist * 2 - mcosa * retract * 2;
            //     let ay2 = this.p2.y + msinp * useDist * 2 + msina * retract * 2;
            //     ctx.beginPath();
            //     ctx.moveTo(cx2, cy2);
            //     ctx.lineTo(cx3, cy3);
            //     ctx.moveTo(ax1, ay1);
            //     ctx.lineTo(this.p2.x, this.p2.y);
            //     ctx.lineTo(ax2, ay2);
            //     ctx.moveTo(cx4, cy4);
            //     ctx.lineTo(cx1, cy1);
            //     ctx.stroke();
            // } else if (this.arrowType === d2.Line.ARROW_EQUILIBRIUM) {
            //     let r2 = m.sqrt(2) * 2;
            //     let useDist = styles.shapes_arrowLength_2D / r2 / 2;
            //     let angle = this.p1.angle(this.p2);
            //     let perpendicular = angle + m.PI / 2;
            //     let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
            //     let mcosa = m.cos(angle);
            //     let msina = m.sin(angle);
            //     let mcosp = m.cos(perpendicular);
            //     let msinp = m.sin(perpendicular);
            //     let cx1 = this.p1.x - mcosp * useDist;
            //     let cy1 = this.p1.y + msinp * useDist;
            //     let cx2 = this.p1.x + mcosp * useDist;
            //     let cy2 = this.p1.y - msinp * useDist;
            //     let cx3 = this.p2.x + mcosp * useDist;
            //     let cy3 = this.p2.y - msinp * useDist;
            //     let cx4 = this.p2.x - mcosp * useDist;
            //     let cy4 = this.p2.y + msinp * useDist;
            //     ctx.beginPath();
            //     ctx.moveTo(cx2, cy2);
            //     ctx.lineTo(cx3, cy3);
            //     ctx.moveTo(cx4, cy4);
            //     ctx.lineTo(cx1, cy1);
            //     ctx.stroke();
            //     // right arrow
            //     let rx1 = cx3 - mcosa * retract * .8;
            //     let ry1 = cy3 + msina * retract * .8;
            //     let ax1 = cx3 + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
            //     let ay1 = cy3 - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
            //     ctx.beginPath();
            //     ctx.moveTo(cx3, cy3);
            //     ctx.lineTo(ax1, ay1);
            //     ctx.lineTo(rx1, ry1);
            //     ctx.closePath();
            //     ctx.fill();
            //     ctx.stroke();
            //     // left arrow
            //     rx1 = cx1 + mcosa * retract * .8;
            //     ry1 = cy1 - msina * retract * .8;
            //     ax1 = cx1 - mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
            //     ay1 = cy1 + msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
            //     ctx.beginPath();
            //     ctx.moveTo(cx1, cy1);
            //     ctx.lineTo(ax1, ay1);
            //     ctx.lineTo(rx1, ry1);
            //     ctx.closePath();
            //     ctx.fill();
            //     ctx.stroke();
            // } else
            if (this.arrowType === d2.Line.ARROW_SYNTHETIC) {
                let angle = this.p1.angle(this.p2);
                let perpendicular = angle + m.PI / 2;
                let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
                let mcosa = m.cos(angle);
                let msina = m.sin(angle);
                let mcosp = m.cos(perpendicular);
                let msinp = m.sin(perpendicular);
                ctx.beginPath();
                ctx.moveTo(this.p1.x, this.p1.y);
                ctx.lineTo(this.p2.x - mcosa * retract / 2, this.p2.y + msina * retract / 2);
                ctx.stroke();
                let rx1 = this.p2.x - mcosa * retract * .8;
                let ry1 = this.p2.y + msina * retract * .8;
                let ax1 = this.p2.x + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
                let ay1 = this.p2.y - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
                let ax2 = this.p2.x - mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
                let ay2 = this.p2.y + msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
                ctx.beginPath();
                ctx.moveTo(this.p2.x, this.p2.y);
                ctx.lineTo(ax2, ay2);
                ctx.lineTo(rx1, ry1);
                ctx.lineTo(ax1, ay1);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            //     else if (this.arrowType === d2.Line.ARROW_RESONANCE) {
            //     let angle = this.p1.angle(this.p2);
            //     let perpendicular = angle + m.PI / 2;
            //     let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
            //     let mcosa = m.cos(angle);
            //     let msina = m.sin(angle);
            //     let mcosp = m.cos(perpendicular);
            //     let msinp = m.sin(perpendicular);
            //     ctx.beginPath();
            //     ctx.moveTo(this.p1.x + mcosa * retract / 2, this.p1.y - msina * retract / 2);
            //     ctx.lineTo(this.p2.x - mcosa * retract / 2, this.p2.y + msina * retract / 2);
            //     ctx.stroke();
            //     // right arrow
            //     let rx1 = this.p2.x - mcosa * retract * .8;
            //     let ry1 = this.p2.y + msina * retract * .8;
            //     let ax1 = this.p2.x + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
            //     let ay1 = this.p2.y - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
            //     let ax2 = this.p2.x - mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
            //     let ay2 = this.p2.y + msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
            //     ctx.beginPath();
            //     ctx.moveTo(this.p2.x, this.p2.y);
            //     ctx.lineTo(ax2, ay2);
            //     ctx.lineTo(rx1, ry1);
            //     ctx.lineTo(ax1, ay1);
            //     ctx.closePath();
            //     ctx.fill();
            //     ctx.stroke();
            //     // left arrow
            //     rx1 = this.p1.x + mcosa * retract * .8;
            //     ry1 = this.p1.y - msina * retract * .8;
            //     ax1 = this.p1.x - mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
            //     ay1 = this.p1.y + msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
            //     ax2 = this.p1.x + mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
            //     ay2 = this.p1.y - msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
            //     ctx.beginPath();
            //     ctx.moveTo(this.p1.x, this.p1.y);
            //     ctx.lineTo(ax2, ay2);
            //     ctx.lineTo(rx1, ry1);
            //     ctx.lineTo(ax1, ay1);
            //     ctx.closePath();
            //     ctx.fill();
            //     ctx.stroke();
            // }
                else {
                ctx.beginPath();
                ctx.moveTo(this.p1.x, this.p1.y);
                ctx.lineTo(this.p2.x, this.p2.y);
                ctx.stroke();
            }
            if(this.topText || this.bottomText){
                ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
                ctx.fillStyle = styles.text_color;
            }
            if(this.topText){
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(this.topText, (this.p1.x+this.p2.x)/2, this.p1.y-5);
            }
            if(this.bottomText){
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(this.bottomText, (this.p1.x+this.p2.x)/2, this.p1.y+5);
            }
        }
    };
    _.getPoints = function() {
        return [ this.p1, this.p2 ];
    };
    _.isOver = function(p, barrier) {
        let dist = math.distanceFromPointToLineInclusive(p, this.p1, this.p2);
        return dist !== -1 && dist < barrier;
    };

})(Chemio.extensions, Chemio.math, Chemio.structures, Chemio.structures.d2, Math);

//region Unused shapes
// (function(extensions, math, structures, d2, m, undefined) {
// 	'use strict';
//
// 	d2.AtomMapping = function(o1, o2) {
// 		// these need to be named 'o', not 'a' or the generic erase function won't work for them
// 		this.o1 = o1;
// 		this.o2 = o2;
// 		this.label = '0';
// 		this.error = false;
// 	};
// 	let _ = d2.AtomMapping.prototype = new d2._Shape();
// 	_.drawDecorations = function(ctx, styles) {
// 		if (this.isHover || this.isSelected) {
// 			ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
// 			ctx.lineWidth = 1;
// 			ctx.beginPath();
// 			ctx.moveTo(this.o1.x, this.o1.y);
// 			ctx.lineTo(this.o2.x, this.o2.y);
// 			ctx.setLineDash([2]);
// 			ctx.stroke();
// 			ctx.setLineDash([]);
// 		}
// 	};
// 	_.draw = function(ctx, styles) {
// 		if (this.o1 && this.o2) {
// 			let sep = 14;
// 			this.x1 = this.o1.x+sep*m.cos(this.o1.angleOfLeastInterference);
// 			this.y1 = this.o1.y-sep*m.sin(this.o1.angleOfLeastInterference);
// 			this.x2 = this.o2.x+sep*m.cos(this.o2.angleOfLeastInterference);
// 			this.y2 = this.o2.y-sep*m.sin(this.o2.angleOfLeastInterference);
// 			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
// 			let label = this.label;
// 			let w = ctx.measureText(label).width;
// 			if (this.isLassoed) {
// 				ctx.fillStyle = styles.colorHover;
// 				ctx.fillRect(this.x1-w/2-3, this.y1-styles.text_font_size/2-3, w+6, styles.text_font_size+6);
// 				ctx.fillRect(this.x2-w/2-3, this.y2-styles.text_font_size/2-3, w+6, styles.text_font_size+6);
// 			}
// 			let color = this.error?styles.colorError:styles.shapes_color;
// 			if (this.isHover || this.isSelected) {
// 				color = this.isHover ? styles.colorHover : styles.colorSelect;
// 			}
// 			ctx.fillStyle = color;
// 			ctx.fillRect(this.x1-w/2-1, this.y1-styles.text_font_size/2-1, w+2, styles.text_font_size+2);
// 			ctx.fillRect(this.x2-w/2-1, this.y2-styles.text_font_size/2-1, w+2, styles.text_font_size+2);
// 			ctx.textAlign = 'center';
// 			ctx.textBaseline = 'middle';
// 			ctx.fillStyle = styles.backgroundColor;
// 			ctx.fillText(label, this.x1, this.y1);
// 			ctx.fillText(label, this.x2, this.y2);
// 		}
// 	};
// 	_.getPoints = function() {
// 		return [new structures.Point(this.x1, this.y1), new structures.Point(this.x2, this.y2)];
// 	};
// 	_.isOver = function(p, barrier) {
// 		if(this.x1){
// 			return p.distance({x:this.x1, y:this.y1})<barrier || p.distance({x:this.x2, y:this.y2})<barrier;
// 		}
// 		return false;
// 	};
//
// })(Chemio.extensions, Chemio.math, Chemio.structures, Chemio.structures.d2, Math);

// (function(extensions, math, structures, d2, m, undefined) {
// 	'use strict';
// 	d2.Bracket = function(p1, p2) {
// 		this.p1 = p1 ? p1 : new structures.Point();
// 		this.p2 = p2 ? p2 : new structures.Point();
// 	};
// 	let _ = d2.Bracket.prototype = new d2._Shape();
// 	_.charge = 0;
// 	_.mult = 0;
// 	_.repeat = 0;
// 	_.draw = function(ctx, styles) {
// 		let minX = m.min(this.p1.x, this.p2.x);
// 		let maxX = m.max(this.p1.x, this.p2.x);
// 		let minY = m.min(this.p1.y, this.p2.y);
// 		let maxY = m.max(this.p1.y, this.p2.y);
// 		let h = maxY - minY;
// 		let lip = h / 10;
// 		ctx.beginPath();
// 		ctx.moveTo(minX + lip, minY);
// 		ctx.lineTo(minX, minY);
// 		ctx.lineTo(minX, maxY);
// 		ctx.lineTo(minX + lip, maxY);
// 		ctx.moveTo(maxX - lip, maxY);
// 		ctx.lineTo(maxX, maxY);
// 		ctx.lineTo(maxX, minY);
// 		ctx.lineTo(maxX - lip, minY);
// 		if (this.isLassoed) {
// 			let grd = ctx.createLinearGradient(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
// 			grd.addColorStop(0, 'rgba(212, 99, 0, 0)');
// 			grd.addColorStop(0.5, 'rgba(212, 99, 0, 0.8)');
// 			grd.addColorStop(1, 'rgba(212, 99, 0, 0)');
// 			ctx.lineWidth = styles.shapes_lineWidth + 5;
// 			ctx.strokeStyle = grd;
// 			ctx.lineJoin = 'miter';
// 			ctx.lineCap = 'square';
// 			ctx.stroke();
// 		}
// 		ctx.strokeStyle = styles.shapes_color;
// 		ctx.lineWidth = styles.shapes_lineWidth;
// 		ctx.lineJoin = 'miter';
// 		ctx.lineCap = 'butt';
// 		ctx.stroke();
// 		if (this.charge !== 0) {
// 			ctx.fillStyle = styles.text_color;
// 			ctx.textAlign = 'left';
// 			ctx.textBaseline = 'alphabetic';
// 			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
// 			let s = this.charge.toFixed(0);
// 			if (s === '1') {
// 				s = '+';
// 			} else if (s === '-1') {
// 				s = '\u2013';
// 			} else if (s.startsWith('-')) {
// 				s = s.substring(1) + '\u2013';
// 			} else {
// 				s += '+';
// 			}
// 			ctx.fillText(s, maxX + 5, minY + 5);
// 		}
// 		if (this.mult !== 0) {
// 			ctx.fillStyle = styles.text_color;
// 			ctx.textAlign = 'right';
// 			ctx.textBaseline = 'middle';
// 			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
// 			ctx.fillText(this.mult.toFixed(0), minX - 5, minY + h / 2);
// 		}
// 		if (this.repeat !== 0) {
// 			ctx.fillStyle = styles.text_color;
// 			ctx.textAlign = 'left';
// 			ctx.textBaseline = 'top';
// 			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
// 			let s = this.repeat.toFixed(0);
// 			ctx.fillText(s, maxX + 5, maxY - 5);
// 		}
// 	};
// 	_.getPoints = function() {
// 		return [ this.p1, this.p2 ];
// 	};
// 	_.isOver = function(p, barrier) {
// 		return math.isBetween(p.x, this.p1.x, this.p2.x) && math.isBetween(p.y, this.p1.y, this.p2.y);
// 	};
//
// })(Chemio.extensions, Chemio.math, Chemio.structures, Chemio.structures.d2, Math);

// (function(extensions, math, jsb, structures, d2, m, undefined) {
// 	'use strict';
//
// 	d2.DynamicBracket = function(b1, b2) {
// 		this.b1 = b1;
// 		this.b2 = b2;
// 		this.n1 = 1;
// 		this.n2 = 4;
// 		this.contents = [];
// 		this.ps = [];
// 	};
// 	let _ = d2.DynamicBracket.prototype = new d2._Shape();
// 	_.drawDecorations = function(ctx, styles) {
// 		if (this.isHover) {
// 			for(let i = 0, ii = this.contents.length; i<ii; i++){
// 				let a = this.contents[i];
// 				let grd = ctx.createRadialGradient(a.x - 1, a.y - 1, 0, a.x, a.y, 7);
// 				grd.addColorStop(0, 'rgba(212, 99, 0, 0)');
// 				grd.addColorStop(0.7, 'rgba(212, 99, 0, 0.8)');
// 				ctx.fillStyle = grd;
// 				ctx.beginPath();
// 				ctx.arc(a.x, a.y, 5, 0, m.PI * 2, false);
// 				ctx.fill();
// 			}
// 		}
// 	};
// 	let drawEnd = function(ctx, styles, b, b2, contents) {
// 		let ps = [];
// 		let stretch = 10;
// 		let arm = 4;
// 		let a = contents.length>0?(contents.indexOf(b.a1)===-1?b.a2:b.a1):(b.a1.distance(b2.getCenter())<b.a2.distance(b2.getCenter())?b.a1:b.a2);
// 		let angle = a.angle(b.getNeighbor(a));
// 		let perp = angle+m.PI/2;
// 		let length = b.getLength()/(contents.length>1?4:2);
// 		let psx = a.x+length*m.cos(angle);
// 		let psy = a.y-length*m.sin(angle);
// 		let scos = stretch*m.cos(perp);
// 		let ssin = stretch*m.sin(perp);
// 		let p1x = psx+scos;
// 		let p1y = psy-ssin;
// 		let p2x = psx-scos;
// 		let p2y = psy+ssin;
// 		let acos = -arm*m.cos(angle);
// 		let asin = -arm*m.sin(angle);
// 		let p1ax = p1x+acos;
// 		let p1ay = p1y-asin;
// 		let p2ax = p2x+acos;
// 		let p2ay = p2y-asin;
// 		ctx.beginPath();
// 		ctx.moveTo(p1ax, p1ay);
// 		ctx.lineTo(p1x, p1y);
// 		ctx.lineTo(p2x, p2y);
// 		ctx.lineTo(p2ax, p2ay);
// 		ctx.stroke();
// 		ps.push(new structures.Point(p1x, p1y));
// 		ps.push(new structures.Point(p2x, p2y));
// 		return ps;
// 	};
// 	_.draw = function(ctx, styles) {
// 		if (this.b1 && this.b2) {
// 			let color = this.error?styles.colorError:styles.shapes_color;
// 			if (this.isHover || this.isSelected) {
// 				color = this.isHover ? styles.colorHover : styles.colorSelect;
// 			}
// 			ctx.strokeStyle = color;
// 			ctx.fillStyle = ctx.strokeStyle;
// 			ctx.lineWidth = styles.shapes_lineWidth;
// 			ctx.lineJoin = 'miter';
// 			ctx.lineCap = 'butt';
// 			let ps1 = drawEnd(ctx, styles, this.b1, this.b2, this.contents);
// 			let ps2 = drawEnd(ctx, styles, this.b2, this.b1, this.contents);
// 			this.ps = ps1.concat(ps2);
// 			if(this.b1.getCenter().x>this.b2.getCenter().x){
// 				if(this.ps[0].x>this.ps[1].x+5){
// 					this.textPos = this.ps[0];
// 				}else{
// 					this.textPos = this.ps[1];
// 				}
// 			}else{
// 				if(this.ps[2].x>this.ps[3].x+5){
// 					this.textPos = this.ps[2];
// 				}else{
// 					this.textPos = this.ps[3];
// 				}
// 			}
// 			if(!this.error && this.contents.length>0){
// 				ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
// 				ctx.fillStyle = this.isHover?styles.colorHover:styles.text_color;
// 				ctx.textAlign = 'left';
// 				ctx.textBaseline = 'bottom';
// 				ctx.fillText(this.n1+'-'+this.n2, this.textPos.x+2, this.textPos.y+2);
// 			}
// 		}
// 	};
// 	_.getPoints = function() {
// 		return this.ps;
// 	};
// 	_.isOver = function(p, barrier) {
// 		return false;
// 	};
// 	_.setContents = function(sketcher){
// 		this.contents = [];
// 		let m1 = sketcher.getMoleculeByAtom(this.b1.a1);
// 		let m2 = sketcher.getMoleculeByAtom(this.b2.a1);
// 		// make sure both b1 and b2 are part of the same molecule
// 		if(m1 && m1===m2){
// 			// if either b1 or b2 is in a ring, then stop, as this is a violation
// 			// unless b1 and b2 are part of the same ring and are part of no other rings
// 			let c1 = 0;
// 			let c2 = 0;
// 			for(let i = 0, ii = m1.rings.length; i<ii; i++){
// 				let r = m1.rings[i];
// 				for(let j = 0, jj = r.bonds.length; j<jj; j++){
// 					let rb = r.bonds[j];
// 					if(rb===this.b1){
// 						c1++;
// 					}else if(rb===this.b2){
// 						c2++;
// 					}
// 				}
// 			}
// 			let sameSingleRing = c1===1 && c2===1 && this.b1.ring===this.b2.ring;
// 			this.contents.flippable = sameSingleRing;
// 			if(this.b1.ring===undefined && this.b2.ring===undefined || sameSingleRing){
// 				for(let i = 0, ii = m1.atoms.length; i<ii; i++){
// 					let reached1 = false;
// 					let reached2 = false;
// 					let reachedInner = false;
// 					for (let j = 0, jj = m1.bonds.length; j<jj; j++) {
// 						m1.bonds[j].visited = false;
// 					}
// 					let q = new structures.Queue();
// 					let a = m1.atoms[i];
// 					q.enqueue(a);
// 					while (!q.isEmpty() && !(reached1 && reached2)) {
// 						let check = q.dequeue();
// 						if(sameSingleRing && (!this.flip && check===this.b1.a1 || this.flip && check===this.b1.a2)){
// 							reachedInner = true;
// 						}
// 						for (let j = 0, jj = m1.bonds.length; j<jj; j++) {
// 							let b = m1.bonds[j];
// 							if(b.a1===check || b.a2===check){
// 								if (b === this.b1) {
// 									reached1 = true;
// 								} else if (b === this.b2) {
// 									reached2 = true;
// 								} else if (!b.visited) {
// 									b.visited = true;
// 									q.enqueue(b.getNeighbor(check));
// 								}
// 							}
// 						}
// 					}
// 					if(reached1 && reached2 && (!sameSingleRing || reachedInner)){
// 						this.contents.push(a);
// 					}
// 				}
// 			}
// 		}
// 	};
//
// })(Chemio.extensions, Chemio.math, Chemio.lib.jsBezier, Chemio.structures, Chemio.structures.d2, Math);

// (function(math, jsb, structures, d2, m, undefined) {
//     'use strict';
//     let getPossibleAngles = function(o) {
//         let as = [];
//         if (o instanceof structures.Atom) {
//             if (o.bondNumber === 0) {
//                 as.push(m.PI);
//             } else if (o.angles) {
//                 if (o.angles.length === 1) {
//                     as.push(o.angles[0] + m.PI);
//                 } else {
//                     for ( let i = 1, ii = o.angles.length; i < ii; i++) {
//                         as.push(o.angles[i - 1] + (o.angles[i] - o.angles[i - 1]) / 2);
//                     }
//                     let firstIncreased = o.angles[0] + m.PI * 2;
//                     let last = o.angles[o.angles.length - 1];
//                     as.push(last + (firstIncreased - last) / 2);
//                 }
//                 if (o.largestAngle > m.PI) {
//                     // always use angle of least interfearence if it is greater
//                     // than 120
//                     as = [ o.angleOfLeastInterference ];
//                 }
//                 if (o.bonds) {
//                     // point up towards a carbonyl
//                     for ( let i = 0, ii = o.bonds.length; i < ii; i++) {
//                         let b = o.bonds[i];
//                         if (b.bondOrder === 2) {
//                             let n = b.getNeighbor(o);
//                             if (n.label === 'O') {
//                                 as = [ n.angle(o) ];
//                                 break;
//                             }
//                         }
//                     }
//                 }
//             }
//         } else {
//             let angle = o.a1.angle(o.a2);
//             as.push(angle + m.PI / 2);
//             as.push(angle + 3 * m.PI / 2);
//         }
//         for ( let i = 0, ii = as.length; i < ii; i++) {
//             while (as[i] > m.PI * 2) {
//                 as[i] -= m.PI * 2;
//             }
//             while (as[i] < 0) {
//                 as[i] += m.PI * 2;
//             }
//         }
//         return as;
//     };
//     let getPullBack = function(o, styles) {
//         let pullback = 3;
//         if (o instanceof structures.Atom) {
//             if (o.isLabelVisible(styles)) {
//                 pullback = 8;
//             }
//             if (o.charge !== 0 || o.numRadical !== 0 || o.numLonePair !== 0) {
//                 pullback = 13;
//             }
//         } else if (o instanceof structures.Point) {
//             // this is the midpoint of a bond forming pusher
//             pullback = 0;
//         } else {
//             if (o.bondOrder > 1) {
//                 pullback = 5;
//             }
//         }
//         return pullback;
//     };
//     let drawPusher = function(ctx, styles, o1, o2, p1, c1, c2, p2, numElectron, caches) {
//         let angle1 = c1.angle(p1);
//         let angle2 = c2.angle(p2);
//         let mcosa = m.cos(angle1);
//         let msina = m.sin(angle1);
//         // pull back from start
//         let pullBack = getPullBack(o1, styles);
//         p1.x -= mcosa * pullBack;
//         p1.y += msina * pullBack;
//         // arrow
//         let perpendicular = angle2 + m.PI / 2;
//         let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
//         mcosa = m.cos(angle2);
//         msina = m.sin(angle2);
//         let mcosp = m.cos(perpendicular);
//         let msinp = m.sin(perpendicular);
//         p2.x -= mcosa * 5;
//         p2.y += msina * 5;
//         let nap = new structures.Point(p2.x, p2.y);
//         // pull back from end
//         pullBack = getPullBack(o2, styles) / 3;
//         nap.x -= mcosa * pullBack;
//         nap.y += msina * pullBack;
//         p2.x -= mcosa * (retract * 0.8 + pullBack);
//         p2.y += msina * (retract * 0.8 + pullBack);
//         let rx1 = nap.x - mcosa * retract * 0.8;
//         let ry1 = nap.y + msina * retract * 0.8;
//         let a1 = new structures.Point(nap.x + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract, nap.y - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract);
//         let a2 = new structures.Point(nap.x - mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract, nap.y + msinp * styles.shapes_arrowLength_2D / 3 + msina * retract);
//         let include1 = true, include2 = true;
//         if (numElectron === 1) {
//             if (a1.distance(c1) > a2.distance(c1)) {
//                 include2 = false;
//             } else {
//                 include1 = false;
//             }
//         }
//         ctx.beginPath();
//         ctx.moveTo(nap.x, nap.y);
//         if (include2) {
//             ctx.lineTo(a2.x, a2.y);
//         }
//         ctx.lineTo(rx1, ry1);
//         if (include1) {
//             ctx.lineTo(a1.x, a1.y);
//         }
//         ctx.closePath();
//         ctx.fill();
//         ctx.stroke();
//         // bezier
//         ctx.beginPath();
//         ctx.moveTo(p1.x, p1.y);
//         ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
//         ctx.stroke();
//         caches.push([ p1, c1, c2, p2 ]);
//     };
//
//     d2.Pusher = function(o1, o2, numElectron) {
//         this.o1 = o1;
//         this.o2 = o2;
//         this.numElectron = numElectron ? numElectron : 1;
//     };
//     let _ = d2.Pusher.prototype = new d2._Shape();
//     _.drawDecorations = function(ctx, styles) {
//         if (this.isHover) {
//             let p1 = this.o1 instanceof structures.Atom ? new structures.Point(this.o1.x, this.o1.y) : this.o1.getCenter();
//             let p2 = this.o2 instanceof structures.Atom ? new structures.Point(this.o2.x, this.o2.y) : this.o2.getCenter();
//             let ps = [ p1, p2 ];
//             for ( let i = 0, ii = ps.length; i < ii; i++) {
//                 let p = ps[i];
//                 this.drawAnchor(ctx, styles, p, p === this.hoverPoint);
//             }
//         }
//     };
//     _.draw = function(ctx, styles) {
//         if (this.o1 && this.o2) {
//             ctx.strokeStyle = styles.shapes_color;
//             ctx.fillStyle = styles.shapes_color;
//             ctx.lineWidth = styles.shapes_lineWidth;
//             ctx.lineJoin = 'miter';
//             ctx.lineCap = 'butt';
//             let p1 = this.o1 instanceof structures.Atom ? new structures.Point(this.o1.x, this.o1.y) : this.o1.getCenter();
//             let p2 = this.o2 instanceof structures.Atom ? new structures.Point(this.o2.x, this.o2.y) : this.o2.getCenter();
//             let controlDist = 35;
//             let as1 = getPossibleAngles(this.o1);
//             let as2 = getPossibleAngles(this.o2);
//             let c1, c2;
//             let minDif = Infinity;
//             for ( let i = 0, ii = as1.length; i < ii; i++) {
//                 for ( let j = 0, jj = as2.length; j < jj; j++) {
//                     let c1c = new structures.Point(p1.x + controlDist * m.cos(as1[i]), p1.y - controlDist * m.sin(as1[i]));
//                     let c2c = new structures.Point(p2.x + controlDist * m.cos(as2[j]), p2.y - controlDist * m.sin(as2[j]));
//                     let dif = c1c.distance(c2c);
//                     if (dif < minDif) {
//                         minDif = dif;
//                         c1 = c1c;
//                         c2 = c2c;
//                     }
//                 }
//             }
//             this.caches = [];
//             if (this.numElectron === -1) {
//                 let dist = p1.distance(p2)/2;
//                 let angle = p1.angle(p2);
//                 let perp = angle+m.PI/2;
//                 let mcosa = m.cos(angle);
//                 let msina = m.sin(angle);
//                 let m1 = new structures.Point(p1.x+(dist-1)*mcosa, p1.y-(dist-1)*msina);
//                 let cm1 = new structures.Point(m1.x+m.cos(perp+m.PI/6)*controlDist, m1.y - m.sin(perp+m.PI/6)*controlDist);
//                 let m2 = new structures.Point(p1.x+(dist+1)*mcosa, p1.y-(dist+1)*msina);
//                 let cm2 = new structures.Point(m2.x+m.cos(perp-m.PI/6)*controlDist, m2.y - m.sin(perp-m.PI/6)*controlDist);
//                 drawPusher(ctx, styles, this.o1, m1, p1, c1, cm1, m1, 1, this.caches);
//                 drawPusher(ctx, styles, this.o2, m2, p2, c2, cm2, m2, 1, this.caches);
//             } else {
//                 if (math.intersectLines(p1.x, p1.y, c1.x, c1.y, p2.x, p2.y, c2.x, c2.y)) {
//                     let tmp = c1;
//                     c1 = c2;
//                     c2 = tmp;
//                 }
//                 // try to clean up problems, like loops
//                 let angle1 = c1.angle(p1);
//                 let angle2 = c2.angle(p2);
//                 let angleDif = (m.max(angle1, angle2) - m.min(angle1, angle2));
//                 if (m.abs(angleDif - m.PI) < .001 && this.o1.molCenter === this.o2.molCenter) {
//                     // in the case where the control tangents are parallel
//                     angle1 += m.PI / 2;
//                     angle2 -= m.PI / 2;
//                     c1.x = p1.x + controlDist * m.cos(angle1 + m.PI);
//                     c1.y = p1.y - controlDist * m.sin(angle1 + m.PI);
//                     c2.x = p2.x + controlDist * m.cos(angle2 + m.PI);
//                     c2.y = p2.y - controlDist * m.sin(angle2 + m.PI);
//                 }
//                 drawPusher(ctx, styles, this.o1, this.o2, p1, c1, c2, p2, this.numElectron, this.caches);
//             }
//         }
//     };
//     _.getPoints = function() {
//         return [];
//     };
//     _.isOver = function(p, barrier) {
//         for ( let i = 0, ii = this.caches.length; i < ii; i++) {
//             let r = jsb.distanceFromCurve(p, this.caches[i]);
//             if (r.distance < barrier) {
//                 return true;
//             }
//         }
//         return false;
//     };
//
// })(Chemio.math, Chemio.lib.jsBezier, Chemio.structures, Chemio.structures.d2, Math);

// (function(math, structures, d2, m, undefined) {
// 	'use strict';
//
// 	let BOND = new structures.Bond();
//
// 	d2.VAP = function(x, y) {
// 		this.asterisk = new structures.Atom('O', x, y);
// 		this.substituent;
// 		this.bondType = 1;
// 		this.attachments = [];
// 	};
// 	let _ = d2.VAP.prototype = new d2._Shape();
// 	_.drawDecorations = function(ctx, styles) {
// 		if (this.isHover || this.isSelected) {
// 			ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
// 			ctx.lineWidth = 1.2;
// 			let radius = 7;
// 			if(this.hoverBond){
// 				let pi2 = 2 * m.PI;
// 				let angle = (this.asterisk.angleForStupidCanvasArcs(this.hoverBond) + m.PI / 2) % pi2;
// 				ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
// 				ctx.beginPath();
// 				let angleTo = (angle + m.PI) % pi2;
// 				angleTo = angleTo % (m.PI * 2);
// 				ctx.arc(this.asterisk.x, this.asterisk.y, radius, angle, angleTo, false);
// 				ctx.stroke();
// 				ctx.beginPath();
// 				angle += m.PI;
// 				angleTo = (angle + m.PI) % pi2;
// 				ctx.arc(this.hoverBond.x, this.hoverBond.y, radius, angle, angleTo, false);
// 				ctx.stroke();
// 			}else{
// 				ctx.beginPath();
// 				ctx.arc(this.asterisk.x, this.asterisk.y, radius, 0, m.PI * 2, false);
// 				ctx.stroke();
// 			}
// 		}
// 	};
// 	_.draw = function(ctx, styles) {
// 		// asterisk
// 		ctx.strokeStyle = this.error?styles.colorError:styles.shapes_color;
// 		ctx.lineWidth = 1;
// 		let length = 4;
// 		let sqrt3 = m.sqrt(3)/2;
// 		ctx.beginPath();
// 		ctx.moveTo(this.asterisk.x, this.asterisk.y-length);
// 		ctx.lineTo(this.asterisk.x, this.asterisk.y+length);
// 		ctx.moveTo(this.asterisk.x-sqrt3*length, this.asterisk.y-length/2);
// 		ctx.lineTo(this.asterisk.x+sqrt3*length, this.asterisk.y+length/2);
// 		ctx.moveTo(this.asterisk.x-sqrt3*length, this.asterisk.y+length/2);
// 		ctx.lineTo(this.asterisk.x+sqrt3*length, this.asterisk.y-length/2);
// 		ctx.stroke();
// 		this.asterisk.textBounds = [];
// 		this.asterisk.textBounds.push({
// 			x : this.asterisk.x - length,
// 			y : this.asterisk.y - length,
// 			w : length*2,
// 			h : length*2
// 		});
// 		let bcsave = styles.bonds_color;
// 		if(this.error){
// 			styles.bonds_color = styles.colorError;
// 		}
// 		BOND.a1 = this.asterisk;
// 		// substituent bond
// 		if(this.substituent){
// 			BOND.a2 = this.substituent;
// 			BOND.bondOrder = this.bondType;
// 			BOND.draw(ctx, styles);
// 		}
// 		// attachment bonds
// 		BOND.bondOrder = 0;
// 		if(!this.error){
// 			styles.bonds_color = styles.shapes_color;
// 		}
// 		for(let i = 0, ii = this.attachments.length; i<ii; i++){
// 			BOND.a2 = this.attachments[i];
// 			BOND.draw(ctx, styles);
// 		}
// 		styles.bonds_color = bcsave;
// 	};
// 	_.getPoints = function() {
// 		return [this.asterisk];
// 	};
// 	_.isOver = function(p, barrier) {
// 		return false;
// 	};
//
// })(Chemio.math, Chemio.structures, Chemio.structures.d2, Math);

// (function(structures, extensions, m, undefined) {
// 	'use strict';
// 	structures.Plate = function(lanes) {
// 		this.lanes = new Array(lanes);
// 		for (let i = 0, ii = lanes; i < ii; i++) {
// 			this.lanes[i] = [];
// 		}
// 	};
// 	let _ = structures.Plate.prototype;
// 	_.sort = function() {
// 		for (let i = 0, ii = this.lanes.length; i < ii; i++) {
// 			this.lanes[i].sort(function(a, b) {
// 				return a - b;
// 			});
// 		}
// 	};
// 	_.draw = function(ctx, styles) {
// 		// Front and origin
// 		let width = ctx.canvas.width;
// 		let height = ctx.canvas.height;
// 		this.origin = 9 * height / 10;
// 		this.front = height / 10;
// 		this.laneLength = this.origin - this.front;
// 		ctx.strokeStyle = '#000000';
// 		ctx.beginPath();
// 		ctx.moveTo(0, this.front);
// 		ctx.lineTo(width, this.front);
// 		ctx.setLineDash([3]);
// 		ctx.stroke();
// 		ctx.setLineDash([]);
// 		ctx.beginPath();
// 		ctx.moveTo(0, this.origin);
// 		ctx.lineTo(width, this.origin);
// 		ctx.closePath();
// 		ctx.stroke();
// 		// Lanes
// 		for (let i = 0, ii = this.lanes.length; i < ii; i++) {
// 			let laneX = (i + 1) * width / (ii + 1);
// 			ctx.beginPath();
// 			ctx.moveTo(laneX, this.origin);
// 			ctx.lineTo(laneX, this.origin + 3);
// 			ctx.closePath();
// 			ctx.stroke();
// 			// Spots
// 			for (let s = 0, ss = this.lanes[i].length; s < ss; s++) {
// 				let spotY = this.origin - (this.laneLength * this.lanes[i][s].rf);
// 				switch (this.lanes[i][s].type) {
// 				case 'compact':
// 					ctx.beginPath();
// 					ctx.arc(laneX, spotY, 3, 0, 2 * m.PI, false);
// 					ctx.closePath();
// 					break;
// 				case 'expanded':
// 					ctx.beginPath();
// 					ctx.arc(laneX, spotY, 7, 0, 2 * m.PI, false);
// 					ctx.closePath();
// 					break;
// 				case 'trailing':
// 					// trailing
// 					break;
// 				case 'widened':
// 					extensions.contextEllipse(ctx, laneX - 18, spotY - 10, 36, 10);
// 					break;
// 				case 'cresent':
// 					ctx.beginPath();
// 					ctx.arc(laneX, spotY, 9, 0, m.PI, true);
// 					ctx.closePath();
// 					break;
// 				}
// 				switch (this.lanes[i][s].style) {
// 				case 'solid':
// 					ctx.fillStyle = '#000000';
// 					ctx.fill();
// 					break;
// 				case 'transparent':
// 					ctx.stroke();
// 					break;
// 				case 'gradient':
// 					// gradient
// 					break;
// 				}
// 			}
// 		}
// 	};
//
// 	structures.Plate.Spot = function(type, rf, style) {
// 		this.type = type;
// 		this.rf = rf;
// 		this.style = style ? style : 'solid';
// 	};
//
// })(Chemio.structures, Chemio.extensions, Math);
//endregion
