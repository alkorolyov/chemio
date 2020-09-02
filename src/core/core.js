//******************************************************************

//********************************* Core *****************************

//******************************************************************

let Chemio = (function() {
	'use strict';
	let c = {};

	c.informatics = {};
	c.render = {};
	c.io = {};
	c.lib = {};
	c.notations = {};
	c.structures = {};
	c.structures.d2 = {};
	c.structures.d3 = {};

	let VERSION = '7.0.1';

	c.getVersion = function() {
		return VERSION;
	};

	return c;

})();

// Chemio.animations = (function(window, undefined) {
// 	'use strict';
// 	let ext = {};
//
// 	// Drop in replace functions for setTimeout() & setInterval() that
// 	// make use of requestAnimationFrame() for performance where available
// 	// http://www.joelambert.co.uk
//
// 	// Copyright 2011, Joe Lambert.
// 	// Free to use under the MIT license.
// 	// http://www.opensource.org/licenses/mit-license.php
//
// 	// requestAnimationFrame() shim by Paul Irish
// 	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// 	window.requestAnimFrame = (function() {
// 		return  window.requestAnimationFrame       ||
// 				window.webkitRequestAnimationFrame ||
// 				window.mozRequestAnimationFrame    ||
// 				window.oRequestAnimationFrame      ||
// 				window.msRequestAnimationFrame     ||
// 				function(/* function */ callback, /* DOMElement */ element){
// 					window.setTimeout(callback, 1000 / 60);
// 				};
// 	})();
//
// 	/**
// 	 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
// 	 * @param {function} fn The callback function
// 	 * @param {int} delay The delay in milliseconds
// 	 */
// 	ext.requestInterval = function(fn, delay) {
// 		if( !window.requestAnimationFrame       &&
// 			!window.webkitRequestAnimationFrame &&
// 			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
// 			!window.oRequestAnimationFrame      &&
// 			!window.msRequestAnimationFrame)
// 				return window.setInterval(fn, delay);
//
// 		let start = new Date().getTime(),
// 			handle = new Object();
//
// 		function loop() {
// 			let current = new Date().getTime(),
// 				delta = current - start;
//
// 			if(delta >= delay) {
// 				fn.call();
// 				start = new Date().getTime();
// 			}
//
// 			handle.value = window.requestAnimFrame(loop);
// 		};
//
// 		handle.value = window.requestAnimFrame(loop);
// 		return handle;
// 	};
//
// 	/**
// 	 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
// 	 * @param {int|object} fn The callback function
// 	 */
// 	ext.clearRequestInterval = function(handle) {
// 	    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
// 	    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
// 	    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
// 	    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
// 	    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
// 	    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
// 	    clearInterval(handle);
// 	};
//
// 	/**
// 	 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
// 	 * @param {function} fn The callback function
// 	 * @param {int} delay The delay in milliseconds
// 	 */
//
// 	ext.requestTimeout = function(fn, delay) {
// 		if( !window.requestAnimationFrame      	&&
// 			!window.webkitRequestAnimationFrame &&
// 			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
// 			!window.oRequestAnimationFrame      &&
// 			!window.msRequestAnimationFrame)
// 				return window.setTimeout(fn, delay);
//
// 		let start = new Date().getTime(),
// 			handle = new Object();
//
// 		function loop(){
// 			let current = new Date().getTime(),
// 				delta = current - start;
//
// 			delta >= delay ? fn.call() : handle.value = window.requestAnimFrame(loop);
// 		};
//
// 		handle.value = window.requestAnimFrame(loop);
// 		return handle;
// 	};
//
// 	/**
// 	 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
// 	 * @param {int|object} fn The callback function
// 	 */
// 	ext.clearRequestTimeout = function(handle) {
// 	    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
// 	    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
// 	    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
// 	    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
// 	    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
// 	    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
// 	    clearTimeout(handle);
// 	};
//
// 	return ext;
//
// })(window);

Chemio.extensions = (function(structures, v3, m, undefined) {
	'use strict';
	let ext = {};

	ext.vec3AngleFrom = function(v1, v2) {
		let length1 = v3.length(v1);
		let length2 = v3.length(v2);
		let dot = v3.dot(v1, v2);
		let cosine = dot / length1 / length2;
		return m.acos(cosine);
	};

	ext.contextRoundRect = function(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	};

	ext.contextEllipse = function(ctx, x, y, w, h) {
		let kappa = .5522848;
		let ox = (w / 2) * kappa;
		let oy = (h / 2) * kappa;
		let xe = x + w;
		let ye = y + h;
		let xm = x + w / 2;
		let ym = y + h / 2;

		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
	};

	ext.getFontString = function(size, families, bold, italic) {
		let sb = [];
		if (bold) {
			sb.push('bold ');
		}
		if (italic) {
			sb.push('italic ');
		}
		sb.push(size + 'px ');
		for ( let i = 0, ii = families.length; i < ii; i++) {
			let use = families[i];
			if (use.indexOf(' ') !== -1) {
				use = '"' + use + '"';
			}
			sb.push((i !== 0 ? ',' : '') + use);
		}
		return sb.join('');
	};

	return ext;

})(Chemio.structures, Chemio.lib.vec3, Math);

// (function(Object, Math, undefined) {
// 	'use strict';
//
// 	// polyfills exist here, mostly for IE11 support
//
// 	// Math.sign used by SESSurface.generate()
// 	if (!Math.sign) {
// 	  Math.sign = function(x) {
// 	    // If x is NaN, the result is NaN.
// 	    // If x is -0, the result is -0.
// 	    // If x is +0, the result is +0.
// 	    // If x is negative and not -0, the result is -1.
// 	    // If x is positive and not +0, the result is +1.
// 	    return ((x > 0) - (x < 0)) || +x;
// 	    // A more aesthetic pseudo-representation:
// 	    // ( (x > 0) ? 1 : 0 )  // if x is positive, then positive one
// 	    //          +           // else (because you can't be both - and +)
// 	    // ( (x < 0) ? -1 : 0 ) // if x is negative, then negative one
// 	    //         ||           // if x is 0, -0, or NaN, or not a number,
// 	    //         +x           // then the result will be x, (or) if x is
// 	    //                      // not a number, then x converts to number
// 	  };
// 	}
//
// 	// polyfill for Object.assign on IE11
// 	// used by Styles constructor
// 	if (typeof Object.assign != 'function') {
// 	    Object.assign = function (target, varArgs) {
// 	        'use strict';
// 	        if (target == null) { // TypeError if undefined or null
// 	            throw new TypeError('Cannot convert undefined or null to object');
// 	        }
//
// 	        var to = Object(target);
//
// 	        for (var index = 1; index < arguments.length; index++) {
// 	            var nextSource = arguments[index];
//
// 	            if (nextSource != null) { // Skip over if undefined or null
// 	                for (var nextKey in nextSource) {
// 	                    // Avoid bugs when hasOwnProperty is shadowed
// 	                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
// 	                        to[nextKey] = nextSource[nextKey];
// 	                    }
// 	                }
// 	            }
// 	        }
// 	        return to;
// 	    };
// 	}
//
// 	// polyfill for String.startsWith() on IE11
// 	if (!String.prototype.startsWith) {
// 		String.prototype.startsWith = function(searchString, position){
// 		  position = position || 0;
// 		  return this.substr(position, searchString.length) === searchString;
// 	  };
// 	}
//
// })(Object, Math);

Chemio.math = (function(c, structures, m, undefined) {
	'use strict';
	let math = {};

	let namedColors = {
		'aliceblue' : '#f0f8ff',
		'antiquewhite' : '#faebd7',
		'aqua' : '#00ffff',
		'aquamarine' : '#7fffd4',
		'azure' : '#f0ffff',
		'beige' : '#f5f5dc',
		'bisque' : '#ffe4c4',
		'black' : '#000000',
		'blanchedalmond' : '#ffebcd',
		'blue' : '#0000ff',
		'blueviolet' : '#8a2be2',
		'brown' : '#a52a2a',
		'burlywood' : '#deb887',
		'cadetblue' : '#5f9ea0',
		'chartreuse' : '#7fff00',
		'chocolate' : '#d2691e',
		'coral' : '#ff7f50',
		'cornflowerblue' : '#6495ed',
		'cornsilk' : '#fff8dc',
		'crimson' : '#dc143c',
		'cyan' : '#00ffff',
		'darkblue' : '#00008b',
		'darkcyan' : '#008b8b',
		'darkgoldenrod' : '#b8860b',
		'darkgray' : '#a9a9a9',
		'darkgreen' : '#006400',
		'darkkhaki' : '#bdb76b',
		'darkmagenta' : '#8b008b',
		'darkolivegreen' : '#556b2f',
		'darkorange' : '#ff8c00',
		'darkorchid' : '#9932cc',
		'darkred' : '#8b0000',
		'darksalmon' : '#e9967a',
		'darkseagreen' : '#8fbc8f',
		'darkslateblue' : '#483d8b',
		'darkslategray' : '#2f4f4f',
		'darkturquoise' : '#00ced1',
		'darkviolet' : '#9400d3',
		'deeppink' : '#ff1493',
		'deepskyblue' : '#00bfff',
		'dimgray' : '#696969',
		'dodgerblue' : '#1e90ff',
		'firebrick' : '#b22222',
		'floralwhite' : '#fffaf0',
		'forestgreen' : '#228b22',
		'fuchsia' : '#ff00ff',
		'gainsboro' : '#dcdcdc',
		'ghostwhite' : '#f8f8ff',
		'gold' : '#ffd700',
		'goldenrod' : '#daa520',
		'gray' : '#808080',
		'green' : '#008000',
		'greenyellow' : '#adff2f',
		'honeydew' : '#f0fff0',
		'hotpink' : '#ff69b4',
		'indianred ' : '#cd5c5c',
		'indigo ' : '#4b0082',
		'ivory' : '#fffff0',
		'khaki' : '#f0e68c',
		'lavender' : '#e6e6fa',
		'lavenderblush' : '#fff0f5',
		'lawngreen' : '#7cfc00',
		'lemonchiffon' : '#fffacd',
		'lightblue' : '#add8e6',
		'lightcoral' : '#f08080',
		'lightcyan' : '#e0ffff',
		'lightgoldenrodyellow' : '#fafad2',
		'lightgrey' : '#d3d3d3',
		'lightgreen' : '#90ee90',
		'lightpink' : '#ffb6c1',
		'lightsalmon' : '#ffa07a',
		'lightseagreen' : '#20b2aa',
		'lightskyblue' : '#87cefa',
		'lightslategray' : '#778899',
		'lightsteelblue' : '#b0c4de',
		'lightyellow' : '#ffffe0',
		'lime' : '#00ff00',
		'limegreen' : '#32cd32',
		'linen' : '#faf0e6',
		'magenta' : '#ff00ff',
		'maroon' : '#800000',
		'mediumaquamarine' : '#66cdaa',
		'mediumblue' : '#0000cd',
		'mediumorchid' : '#ba55d3',
		'mediumpurple' : '#9370d8',
		'mediumseagreen' : '#3cb371',
		'mediumslateblue' : '#7b68ee',
		'mediumspringgreen' : '#00fa9a',
		'mediumturquoise' : '#48d1cc',
		'mediumvioletred' : '#c71585',
		'midnightblue' : '#191970',
		'mintcream' : '#f5fffa',
		'mistyrose' : '#ffe4e1',
		'moccasin' : '#ffe4b5',
		'navajowhite' : '#ffdead',
		'navy' : '#000080',
		'oldlace' : '#fdf5e6',
		'olive' : '#808000',
		'olivedrab' : '#6b8e23',
		'orange' : '#ffa500',
		'orangered' : '#ff4500',
		'orchid' : '#da70d6',
		'palegoldenrod' : '#eee8aa',
		'palegreen' : '#98fb98',
		'paleturquoise' : '#afeeee',
		'palevioletred' : '#d87093',
		'papayawhip' : '#ffefd5',
		'peachpuff' : '#ffdab9',
		'peru' : '#cd853f',
		'pink' : '#ffc0cb',
		'plum' : '#dda0dd',
		'powderblue' : '#b0e0e6',
		'purple' : '#800080',
		'red' : '#ff0000',
		'rosybrown' : '#bc8f8f',
		'royalblue' : '#4169e1',
		'saddlebrown' : '#8b4513',
		'salmon' : '#fa8072',
		'sandybrown' : '#f4a460',
		'seagreen' : '#2e8b57',
		'seashell' : '#fff5ee',
		'sienna' : '#a0522d',
		'silver' : '#c0c0c0',
		'skyblue' : '#87ceeb',
		'slateblue' : '#6a5acd',
		'slategray' : '#708090',
		'snow' : '#fffafa',
		'springgreen' : '#00ff7f',
		'steelblue' : '#4682b4',
		'tan' : '#d2b48c',
		'teal' : '#008080',
		'thistle' : '#d8bfd8',
		'tomato' : '#ff6347',
		'turquoise' : '#40e0d0',
		'violet' : '#ee82ee',
		'wheat' : '#f5deb3',
		'white' : '#ffffff',
		'whitesmoke' : '#f5f5f5',
		'yellow' : '#ffff00',
		'yellowgreen' : '#9acd32'
	};

	math.angleBetweenLargest = function(angles) {
		if (angles.length === 0) {
			return {
				angle : 0,
				largest : m.PI * 2
			};
		}
		if (angles.length === 1) {
			return {
				angle : angles[0] + m.PI,
				largest : m.PI * 2
			};
		}
		let largest = 0;
		let angle = 0;
		for ( let i = 0, ii = angles.length - 1; i < ii; i++) {
			let dif = angles[i + 1] - angles[i];
			if (dif > largest) {
				largest = dif;
				angle = (angles[i + 1] + angles[i]) / 2;
			}
		}
		let last = angles[0] + m.PI * 2 - angles[angles.length - 1];
		if (last > largest) {
			angle = angles[0] - last / 2;
			largest = last;
			if (angle < 0) {
				angle += m.PI * 2;
			}
		}
		return {
			angle : angle,
			largest : largest
		};
	};

	math.isBetween = function(x, left, right) {
		if (left > right) {
			let tmp = left;
			left = right;
			right = tmp;
		}
		return x >= left && x <= right;
	};

	math.getRGB = function(color, multiplier) {
		let err = [ 0, 0, 0 ];
		if (namedColors[color.toLowerCase()]) {
			color = namedColors[color.toLowerCase()];
		}
		if (color.charAt(0) === '#') {
			if (color.length === 4) {
				color = '#' + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
			}
			return [ parseInt(color.substring(1, 3), 16) / 255.0 * multiplier, parseInt(color.substring(3, 5), 16) / 255.0 * multiplier, parseInt(color.substring(5, 7), 16) / 255.0 * multiplier ];
		} else if (color.startsWith('rgba')) {
			// check for rgba before check for rgb
			let cs = color.replace(/rgba\(|\)/g, '').split(',');
			if (cs.length !== 4) {
				return err;
			}
			return [ parseInt(cs[0]) / 255.0 * multiplier, parseInt(cs[1]) / 255.0 * multiplier, parseInt(cs[2]) / 255.0 * multiplier, parseInt(cs[3]) / 255.0 * multiplier ];
		} else if (color.startsWith('rgb')) {
			let cs = color.replace(/rgb\(|\)/g, '').split(',');
			if (cs.length !== 3) {
				return err;
			}
			return [ parseInt(cs[0]) / 255.0 * multiplier, parseInt(cs[1]) / 255.0 * multiplier, parseInt(cs[2]) / 255.0 * multiplier ];
		}
		return err;
	};

	math.hsl2rgb = function(h, s, l) {
		let hue2rgb = function(p, q, t) {
			if (t < 0) {
				t += 1;
			} else if (t > 1) {
				t -= 1;
			}
			if (t < 1 / 6) {
				return p + (q - p) * 6 * t;
			} else if (t < 1 / 2) {
				return q;
			} else if (t < 2 / 3) {
				return p + (q - p) * (2 / 3 - t) * 6;
			}
			return p;
		};
		let r, g, b;
		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			let p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return [ r * 255, g * 255, b * 255 ];
	};

	math.idx2color = function(value) {
		let hex = value.toString(16);

		// add '0' padding
		for ( let i = 0, ii = 6 - hex.length; i < ii; i++) {
			hex = "0" + hex;
		}

		return "#" + hex;
	};

	math.distanceFromPointToLineInclusive = function(p, l1, l2, retract) {
		let length = l1.distance(l2);
		let angle = l1.angle(l2);
		let angleDif = m.PI / 2 - angle;
		let newAngleP = l1.angle(p) + angleDif;
		let pDist = l1.distance(p);
		let pcopRot = new structures.Point(pDist * m.cos(newAngleP), -pDist * m.sin(newAngleP));
		let pull = retract?retract:0;
		if (math.isBetween(-pcopRot.y, pull, length-pull)) {
			return m.abs(pcopRot.x);
		}
		return -1;
	};

	math.calculateDistanceInterior = function(to, from, r) {
		if (this.isBetween(from.x, r.x, r.x + r.w) && this.isBetween(from.y, r.y, r.y + r.h)) {
			return to.distance(from);
		}
		// calculates the distance that a line needs to remove from itself to be
		// outside that rectangle
		let lines = [];
		// top
		lines.push({
			x1 : r.x,
			y1 : r.y,
			x2 : r.x + r.w,
			y2 : r.y
		});
		// bottom
		lines.push({
			x1 : r.x,
			y1 : r.y + r.h,
			x2 : r.x + r.w,
			y2 : r.y + r.h
		});
		// left
		lines.push({
			x1 : r.x,
			y1 : r.y,
			x2 : r.x,
			y2 : r.y + r.h
		});
		// right
		lines.push({
			x1 : r.x + r.w,
			y1 : r.y,
			x2 : r.x + r.w,
			y2 : r.y + r.h
		});

		let intersections = [];
		for ( let i = 0; i < 4; i++) {
			let l = lines[i];
			let p = this.intersectLines(from.x, from.y, to.x, to.y, l.x1, l.y1, l.x2, l.y2);
			if (p) {
				intersections.push(p);
			}
		}
		if (intersections.length === 0) {
			return 0;
		}
		let max = 0;
		for ( let i = 0, ii = intersections.length; i < ii; i++) {
			let p = intersections[i];
			let dx = to.x - p.x;
			let dy = to.y - p.y;
			max = m.max(max, m.sqrt(dx * dx + dy * dy));
		}
		return max;
	};

	math.intersectLines = function(ax, ay, bx, by, cx, cy, dx, dy) {
		// calculate the direction vectors
		bx -= ax;
		by -= ay;
		dx -= cx;
		dy -= cy;

		// are they parallel?
		let denominator = by * dx - bx * dy;
		if (denominator === 0) {
			return false;
		}

		// calculate point of intersection
		let r = (dy * (ax - cx) - dx * (ay - cy)) / denominator;
		let s = (by * (ax - cx) - bx * (ay - cy)) / denominator;
		if ((s >= 0) && (s <= 1) && (r >= 0) && (r <= 1)) {
			return {
				x : (ax + r * bx),
				y : (ay + r * by)
			};
		} else {
			return false;
		}
	};

	math.clamp = function(value, min, max) {
		return value < min ? min : value > max ? max : value;
	};

	math.rainbowAt = function(i, ii, colors) {

		// The rainbow colors length must be more than one color
		if (colors.length < 1) {
			colors.push('#000000', '#FFFFFF');
		} else if (colors.length < 2) {
			colors.push('#FFFFFF');
		}

		let step = ii / (colors.length - 1);
		let j = m.floor(i / step);
		let t = (i - j * step) / step;
		let startColor = math.getRGB(colors[j], 1);
		let endColor = math.getRGB(colors[j + 1], 1);

		let lerpColor = [ (startColor[0] + (endColor[0] - startColor[0]) * t) * 255, (startColor[1] + (endColor[1] - startColor[1]) * t) * 255, (startColor[2] + (endColor[2] - startColor[2]) * t) * 255 ];

		return 'rgb(' + lerpColor.join(',') + ')';
	};

	math.angleBounds = function(angle, limitToPi, zeroCenter) {
		limitToPi = limitToPi === undefined ? true : limitToPi;
		zeroCenter = zeroCenter === undefined ? true : zeroCenter;

		let full = m.PI*2;

		while(angle>full){
			angle-=full;
		}
		while(angle<0){
			angle+=full;
		}

		if (!limitToPi) return angle;

		if(zeroCenter && angle>m.PI){
			angle = angle-full;
		} else if (angle>m.PI) {
			angle = full-angle;
		}

		return angle;
	};

	math.toDeg = function(angle){
		return 180*angle/m.PI;
	}

	math.toRad = function(angle){
		return angle*m.PI/180;
	}

	math.isPointInPoly = function(poly, pt) {
		// this function needs var to work properly
		for ( var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		}
		return c;
	};

	math.center = function(points) {
		let center = new structures.Point(0, 0);
		for (let i = 0, ii = points.length; i < ii; i++) {
			center.x += points[i].x;
			center.y += points[i].y;
		}
		center.x /= points.length;
		center.y /= points.length;
		return center;
	};

	math.Bounds = function() {
	};
	let _ = math.Bounds.prototype;
	_.minX = _.minY = _.minZ = Infinity;
	_.maxX = _.maxY = _.maxZ = -Infinity;
	_.expand = function(x1, y1, x2, y2) {
		if (x1 instanceof math.Bounds) {
			// only need to compare min and max since bounds already has
			// them ordered
			this.minX = m.min(this.minX, x1.minX);
			this.minY = m.min(this.minY, x1.minY);
			this.maxX = m.max(this.maxX, x1.maxX);
			this.maxY = m.max(this.maxY, x1.maxY);
			if(x1.maxZ!==Infinity){
				this.minZ = m.min(this.minZ, x1.minZ);
				this.maxZ = m.max(this.maxZ, x1.maxZ);
			}
		} else {
			this.minX = m.min(this.minX, x1);
			this.maxX = m.max(this.maxX, x1);
			this.minY = m.min(this.minY, y1);
			this.maxY = m.max(this.maxY, y1);
			// these two values could be 0, so check if undefined
			if (x2 !== undefined && y2 !== undefined) {
				this.minX = m.min(this.minX, x2);
				this.maxX = m.max(this.maxX, x2);
				this.minY = m.min(this.minY, y2);
				this.maxY = m.max(this.maxY, y2);
			}
		}
	};
	_.expand3D = function(x1, y1, z1, x2, y2, z2) {
		this.minX = m.min(this.minX, x1);
		this.maxX = m.max(this.maxX, x1);
		this.minY = m.min(this.minY, y1);
		this.maxY = m.max(this.maxY, y1);
		this.minZ = m.min(this.minZ, z1);
		this.maxZ = m.max(this.maxZ, z1);
		// these two values could be 0, so check if undefined
		if (x2 !== undefined && y2 !== undefined && z2 !== undefined) {
			this.minX = m.min(this.minX, x2);
			this.maxX = m.max(this.maxX, x2);
			this.minY = m.min(this.minY, y2);
			this.maxY = m.max(this.maxY, y2);
			this.minZ = m.min(this.minZ, z2);
			this.maxZ = m.max(this.maxZ, z2);
		}
	};

	return math;

})(Chemio, Chemio.structures, Math);

Chemio.featureDetection = (function (document, window, undefined) {
	'use strict';
	let features = {};

	features.supports_canvas = function () {
		return !!document.createElement('canvas').getContext;
	};

	features.supports_canvas_text = function () {
		if (!features.supports_canvas()) {
			return false;
		}
		let dummy_canvas = document.createElement('canvas');
		let context = dummy_canvas.getContext('2d');
		return typeof context.fillText === 'function';
	};

	features.supports_webgl = function () {
		let dummy_canvas = document.createElement('canvas');
		try {
			if (dummy_canvas.getContext('webgl')) {
				return true;
			}
			if (dummy_canvas.getContext('experimental-webgl')) {
				return true;
			}
		} catch (b) {
		}
		return false;
	};

	features.supports_touch = function () {
		// check the mobile os so we don't interfere with hybrid pcs
		let isMobile = (/iPhone|iPad|iPod|Android|BlackBerry|BB10/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
		return 'ontouchstart' in window && isMobile;
	};

	features.supports_gesture = function () {
		return 'ongesturestart' in window;
	};

	return features;

})(document, window);

// all symbols
Chemio.SYMBOLS = [ 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl',
	'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og' ];

Chemio.ELEMENT = (function(SYMBOLS, undefined) {
	'use strict';
	let E = [];

	function Element(symbol, name, atomicNumber, addH, color, covalentRadius, vdWRadius, valency, mass) {
		this.symbol = symbol;
		this.name = name;
		this.atomicNumber = atomicNumber;
		this.addH = addH;
		this.jmolColor = this.pymolColor = color;
		this.covalentRadius = covalentRadius;
		this.vdWRadius = vdWRadius;
		this.valency = valency;
		this.mass = mass;
	}

	E.H = new Element('H', 'Hydrogen', 1, false, '#FFFFFF', 0.31, 1.1, 1, 1);
	E.He = new Element('He', 'Helium', 2, false, '#D9FFFF', 0.28, 1.4, 0, 4);
	E.Li = new Element('Li', 'Lithium', 3, false, '#CC80FF', 1.28, 1.82, 1, 7);
	E.Be = new Element('Be', 'Beryllium', 4, false, '#C2FF00', 0.96, 1.53, 2, 9);
	E.B = new Element('B', 'Boron', 5, true, '#FFB5B5', 0.84, 1.92, 3, 11);
	E.C = new Element('C', 'Carbon', 6, true, '#909090', 0.76, 1.7, 4, 12);
	E.N = new Element('N', 'Nitrogen', 7, true, '#3050F8', 0.71, 1.55, 3, 14);
	E.O = new Element('O', 'Oxygen', 8, true, '#FF0D0D', 0.66, 1.52, 2, 16);
	E.F = new Element('F', 'Fluorine', 9, true, '#90E050', 0.57, 1.47, 1, 19);
	E.Ne = new Element('Ne', 'Neon', 10, false, '#B3E3F5', 0.58, 1.54, 0, 20);
	E.Na = new Element('Na', 'Sodium', 11, false, '#AB5CF2', 1.66, 2.27, 1, 23);
	E.Mg = new Element('Mg', 'Magnesium', 12, false, '#8AFF00', 1.41, 1.73, 0, 24);
	E.Al = new Element('Al', 'Aluminum', 13, false, '#BFA6A6', 1.21, 1.84, 0, 27);
	E.Si = new Element('Si', 'Silicon', 14, true, '#F0C8A0', 1.11, 2.1, 4, 28);
	E.P = new Element('P', 'Phosphorus', 15, true, '#FF8000', 1.07, 1.8, 3, 31);
	E.S = new Element('S', 'Sulfur', 16, true, '#FFFF30', 1.05, 1.8, 2, 32);
	E.Cl = new Element('Cl', 'Chlorine', 17, true, '#1FF01F', 1.02, 1.75, 1, 35);
	E.Ar = new Element('Ar', 'Argon', 18, false, '#80D1E3', 1.06, 1.88, 0, 40);
	E.K = new Element('K', 'Potassium', 19, false, '#8F40D4', 2.03, 2.75, 0, 39);
	E.Ca = new Element('Ca', 'Calcium', 20, false, '#3DFF00', 1.76, 2.31, 0, 40);
	E.Sc = new Element('Sc', 'Scandium', 21, false, '#E6E6E6', 1.7, 0, 0, 45);
	E.Ti = new Element('Ti', 'Titanium', 22, false, '#BFC2C7', 1.6, 0, 1, 48);
	E.V = new Element('V', 'Vanadium', 23, false, '#A6A6AB', 1.53, 0, 1, 51);
	E.Cr = new Element('Cr', 'Chromium', 24, false, '#8A99C7', 1.39, 0, 2, 52);
	E.Mn = new Element('Mn', 'Manganese', 25, false, '#9C7AC7', 1.39, 0, 3, 55);
	E.Fe = new Element('Fe', 'Iron', 26, false, '#E06633', 1.32, 0, 2, 56);
	E.Co = new Element('Co', 'Cobalt', 27, false, '#F090A0', 1.26, 0, 1, 59);
	E.Ni = new Element('Ni', 'Nickel', 28, false, '#50D050', 1.24, 1.63, 1, 58);
	E.Cu = new Element('Cu', 'Copper', 29, false, '#C88033', 1.32, 1.4, 0, 63);
	E.Zn = new Element('Zn', 'Zinc', 30, false, '#7D80B0', 1.22, 1.39, 0, 64);
	E.Ga = new Element('Ga', 'Gallium', 31, false, '#C28F8F', 1.22, 1.87, 0, 69);
	E.Ge = new Element('Ge', 'Germanium', 32, false, '#668F8F', 1.2, 2.11, 4, 74);
	E.As = new Element('As', 'Arsenic', 33, true, '#BD80E3', 1.19, 1.85, 3, 75);
	E.Se = new Element('Se', 'Selenium', 34, true, '#FFA100', 1.2, 1.9, 2, 80);
	E.Br = new Element('Br', 'Bromine', 35, true, '#A62929', 1.2, 1.85, 1, 79);
	E.Kr = new Element('Kr', 'Krypton', 36, false, '#5CB8D1', 1.16, 2.02, 0, 84);
	E.Rb = new Element('Rb', 'Rubidium', 37, false, '#702EB0', 2.2, 3.03, 0, 85);
	E.Sr = new Element('Sr', 'Strontium', 38, false, '#00FF00', 1.95, 2.49, 0, 88);
	E.Y = new Element('Y', 'Yttrium', 39, false, '#94FFFF', 1.9, 0, 0, 89);
	E.Zr = new Element('Zr', 'Zirconium', 40, false, '#94E0E0', 1.75, 0, 0, 90);
	E.Nb = new Element('Nb', 'Niobium', 41, false, '#73C2C9', 1.64, 0, 1, 93);
	E.Mo = new Element('Mo', 'Molybdenum', 42, false, '#54B5B5', 1.54, 0, 2, 98);
	E.Tc = new Element('Tc', 'Technetium', 43, false, '#3B9E9E', 1.47, 0, 3, 0);
	E.Ru = new Element('Ru', 'Ruthenium', 44, false, '#248F8F', 1.46, 0, 2, 102);
	E.Rh = new Element('Rh', 'Rhodium', 45, false, '#0A7D8C', 1.42, 0, 1, 103);
	E.Pd = new Element('Pd', 'Palladium', 46, false, '#006985', 1.39, 1.63, 0, 106);
	E.Ag = new Element('Ag', 'Silver', 47, false, '#C0C0C0', 1.45, 1.72, 0, 107);
	E.Cd = new Element('Cd', 'Cadmium', 48, false, '#FFD98F', 1.44, 1.58, 0, 114);
	E.In = new Element('In', 'Indium', 49, false, '#A67573', 1.42, 1.93, 0, 115);
	E.Sn = new Element('Sn', 'Tin', 50, false, '#668080', 1.39, 2.17, 4, 120);
	E.Sb = new Element('Sb', 'Antimony', 51, false, '#9E63B5', 1.39, 2.06, 3, 121);
	E.Te = new Element('Te', 'Tellurium', 52, true, '#D47A00', 1.38, 2.06, 2, 130);
	E.I = new Element('I', 'Iodine', 53, true, '#940094', 1.39, 1.98, 1, 127);
	E.Xe = new Element('Xe', 'Xenon', 54, false, '#429EB0', 1.4, 2.16, 0, 132);
	E.Cs = new Element('Cs', 'Cesium', 55, false, '#57178F', 2.44, 3.43, 0, 133);
	E.Ba = new Element('Ba', 'Barium', 56, false, '#00C900', 2.15, 2.68, 0, 138);
	E.La = new Element('La', 'Lanthanum', 57, false, '#70D4FF', 2.07, 0, 0, 139);
	E.Ce = new Element('Ce', 'Cerium', 58, false, '#FFFFC7', 2.04, 0, 0, 140);
	E.Pr = new Element('Pr', 'Praseodymium', 59, false, '#D9FFC7', 2.03, 0, 0, 141);
	E.Nd = new Element('Nd', 'Neodymium', 60, false, '#C7FFC7', 2.01, 0, 0, 142);
	E.Pm = new Element('Pm', 'Promethium', 61, false, '#A3FFC7', 1.99, 0, 0, 0);
	E.Sm = new Element('Sm', 'Samarium', 62, false, '#8FFFC7', 1.98, 0, 0, 152);
	E.Eu = new Element('Eu', 'Europium', 63, false, '#61FFC7', 1.98, 0, 0, 153);
	E.Gd = new Element('Gd', 'Gadolinium', 64, false, '#45FFC7', 1.96, 0, 0, 158);
	E.Tb = new Element('Tb', 'Terbium', 65, false, '#30FFC7', 1.94, 0, 0, 159);
	E.Dy = new Element('Dy', 'Dysprosium', 66, false, '#1FFFC7', 1.92, 0, 0, 164);
	E.Ho = new Element('Ho', 'Holmium', 67, false, '#00FF9C', 1.92, 0, 0, 165);
	E.Er = new Element('Er', 'Erbium', 68, false, '#00E675', 1.89, 0, 0, 166);
	E.Tm = new Element('Tm', 'Thulium', 69, false, '#00D452', 1.9, 0, 0, 169);
	E.Yb = new Element('Yb', 'Ytterbium', 70, false, '#00BF38', 1.87, 0, 0, 174);
	E.Lu = new Element('Lu', 'Lutetium', 71, false, '#00AB24', 1.87, 0, 0, 175);
	E.Hf = new Element('Hf', 'Hafnium', 72, false, '#4DC2FF', 1.75, 0, 0, 180);
	E.Ta = new Element('Ta', 'Tantalum', 73, false, '#4DA6FF', 1.7, 0, 1, 181);
	E.W = new Element('W', 'Tungsten', 74, false, '#2194D6', 1.62, 0, 2, 184);
	E.Re = new Element('Re', 'Rhenium', 75, false, '#267DAB', 1.51, 0, 3, 187);
	E.Os = new Element('Os', 'Osmium', 76, false, '#266696', 1.44, 0, 2, 192);
	E.Ir = new Element('Ir', 'Iridium', 77, false, '#175487', 1.41, 0, 3, 193);
	E.Pt = new Element('Pt', 'Platinum', 78, false, '#D0D0E0', 1.36, 1.75, 0, 195);
	E.Au = new Element('Au', 'Gold', 79, false, '#FFD123', 1.36, 1.66, 1, 197);
	E.Hg = new Element('Hg', 'Mercury', 80, false, '#B8B8D0', 1.32, 1.55, 0, 202);
	E.Tl = new Element('Tl', 'Thallium', 81, false, '#A6544D', 1.45, 1.96, 0, 205);
	E.Pb = new Element('Pb', 'Lead', 82, false, '#575961', 1.46, 2.02, 4, 208);
	E.Bi = new Element('Bi', 'Bismuth', 83, false, '#9E4FB5', 1.48, 2.07, 3, 209);
	E.Po = new Element('Po', 'Polonium', 84, false, '#AB5C00', 1.4, 1.97, 2, 0);
	E.At = new Element('At', 'Astatine', 85, true, '#754F45', 1.5, 2.02, 1, 0);
	E.Rn = new Element('Rn', 'Radon', 86, false, '#428296', 1.5, 2.2, 0, 0);
	E.Fr = new Element('Fr', 'Francium', 87, false, '#420066', 2.6, 3.48, 0, 0);
	E.Ra = new Element('Ra', 'Radium', 88, false, '#007D00', 2.21, 2.83, 0, 0);
	E.Ac = new Element('Ac', 'Actinium', 89, false, '#70ABFA', 2.15, 0, 0, 0);
	E.Th = new Element('Th', 'Thorium', 90, false, '#00BAFF', 2.06, 0, 0, 232);
	E.Pa = new Element('Pa', 'Protactinium', 91, false, '#00A1FF', 2, 0, 0, 231);
	E.U = new Element('U', 'Uranium', 92, false, '#008FFF', 1.96, 1.86, 0, 238);
	E.Np = new Element('Np', 'Neptunium', 93, false, '#0080FF', 1.9, 0, 0, 0);
	E.Pu = new Element('Pu', 'Plutonium', 94, false, '#006BFF', 1.87, 0, 0, 0);
	E.Am = new Element('Am', 'Americium', 95, false, '#545CF2', 1.8, 0, 0, 0);
	E.Cm = new Element('Cm', 'Curium', 96, false, '#785CE3', 1.69, 0, 0, 0);
	E.Bk = new Element('Bk', 'Berkelium', 97, false, '#8A4FE3', 0, 0, 0, 0);
	E.Cf = new Element('Cf', 'Californium', 98, false, '#A136D4', 0, 0, 0, 0);
	E.Es = new Element('Es', 'Einsteinium', 99, false, '#B31FD4', 0, 0, 0, 0);
	E.Fm = new Element('Fm', 'Fermium', 100, false, '#B31FBA', 0, 0, 0, 0);
	E.Md = new Element('Md', 'Mendelevium', 101, false, '#B30DA6', 0, 0, 0, 0);
	E.No = new Element('No', 'Nobelium', 102, false, '#BD0D87', 0, 0, 0, 0);
	E.Lr = new Element('Lr', 'Lawrencium', 103, false, '#C70066', 0, 0, 0, 0);
	E.Rf = new Element('Rf', 'Rutherfordium', 104, false, '#CC0059', 0, 0, 0, 0);
	E.Db = new Element('Db', 'Dubnium', 105, false, '#D1004F', 0, 0, 0, 0);
	E.Sg = new Element('Sg', 'Seaborgium', 106, false, '#D90045', 0, 0, 0, 0);
	E.Bh = new Element('Bh', 'Bohrium', 107, false, '#E00038', 0, 0, 0, 0);
	E.Hs = new Element('Hs', 'Hassium', 108, false, '#E6002E', 0, 0, 0, 0);
	E.Mt = new Element('Mt', 'Meitnerium', 109, false, '#EB0026', 0, 0, 0, 0);
	E.Ds = new Element('Ds', 'Darmstadtium', 110, false, '#000000', 0, 0, 0, 0);
	E.Rg = new Element('Rg', 'Roentgenium', 111, false, '#000000', 0, 0, 0, 0);
	E.Cn = new Element('Cn', 'Copernicium', 112, false, '#000000', 0, 0, 0, 0);
	E.Nh = new Element('Nh', 'Nihonium', 113, false, '#000000', 0, 0, 0, 0);
	E.Fl = new Element('Fl', 'Flerovium', 114, false, '#000000', 0, 0, 0, 0);
	E.Mc = new Element('Mc', 'Moscovium', 115, false, '#000000', 0, 0, 0, 0);
	E.Lv = new Element('Lv', 'Livermorium', 116, false, '#000000', 0, 0, 0, 0);
	E.Ts = new Element('Ts', 'Tennessine', 117, false, '#000000', 0, 0, 0, 0);
	E.Og = new Element('Og', 'Oganesson', 118, false, '#000000', 0, 0, 0, 0);

	E.H.pymolColor = '#E6E6E6';
	E.C.pymolColor = '#33FF33';
	E.N.pymolColor = '#3333FF';
	E.O.pymolColor = '#FF4D4D';
	E.F.pymolColor = '#B3FFFF';
	E.S.pymolColor = '#E6C640';

	return E;

})(Chemio.SYMBOLS);

// Chemio.RESIDUE = (function(undefined) {
// 	'use strict';
// 	let R = [];
//
// 	function Residue(symbol, name, polar, aminoColor, shapelyColor, acidity) {
// 		this.symbol = symbol;
// 		this.name = name;
// 		this.polar = polar;
// 		this.aminoColor = aminoColor;
// 		this.shapelyColor = shapelyColor;
// 		this.acidity = acidity;
// 	}
//
// 	R.Ala = new Residue('Ala', 'Alanine', false, '#C8C8C8', '#8CFF8C', 0);
// 	R.Arg = new Residue('Arg', 'Arginine', true, '#145AFF', '#00007C', 1);
// 	R.Asn = new Residue('Asn', 'Asparagine', true, '#00DCDC', '#FF7C70', 0);
// 	R.Asp = new Residue('Asp', 'Aspartic Acid', true, '#E60A0A', '#A00042', -1);
// 	R.Cys = new Residue('Cys', 'Cysteine', true, '#E6E600', '#FFFF70', 0);
// 	R.Gln = new Residue('Gln', 'Glutamine', true, '#00DCDC', '#FF4C4C', 0);
// 	R.Glu = new Residue('Glu', 'Glutamic Acid', true, '#E60A0A', '#660000', -1);
// 	R.Gly = new Residue('Gly', 'Glycine', false, '#EBEBEB', '#FFFFFF', 0);
// 	R.His = new Residue('His', 'Histidine', true, '#8282D2', '#7070FF', 1);
// 	R.Ile = new Residue('Ile', 'Isoleucine', false, '#0F820F', '#004C00', 0);
// 	R.Leu = new Residue('Leu', 'Leucine', false, '#0F820F', '#455E45', 0);
// 	R.Lys = new Residue('Lys', 'Lysine', true, '#145AFF', '#4747B8', 1);
// 	R.Met = new Residue('Met', 'Methionine', false, '#E6E600', '#B8A042', 0);
// 	R.Phe = new Residue('Phe', 'Phenylalanine', false, '#3232AA', '#534C52', 0);
// 	R.Pro = new Residue('Pro', 'Proline', false, '#DC9682', '#525252', 0);
// 	R.Ser = new Residue('Ser', 'Serine', true, '#FA9600', '#FF7042', 0);
// 	R.Thr = new Residue('Thr', 'Threonine', true, '#FA9600', '#B84C00', 0);
// 	R.Trp = new Residue('Trp', 'Tryptophan', true, '#B45AB4', '#4F4600', 0);
// 	R.Tyr = new Residue('Tyr', 'Tyrosine', true, '#3232AA', '#8C704C', 0);
// 	R.Val = new Residue('Val', 'Valine', false, '#0F820F', '#FF8CFF', 0);
// 	R.Asx = new Residue('Asx', 'Asparagine/Aspartic Acid', true, '#FF69B4', '#FF00FF', 0);
// 	R.Glx = new Residue('Glx', 'Glutamine/Glutamic Acid', true, '#FF69B4', '#FF00FF', 0);
// 	R['*'] = new Residue('*', 'Other', false, '#BEA06E', '#FF00FF', 0);
// 	R.A = new Residue('A', 'Adenine', false, '#BEA06E', '#A0A0FF', 0);
// 	R.G = new Residue('G', 'Guanine', false, '#BEA06E', '#FF7070', 0);
// 	R.I = new Residue('I', '', false, '#BEA06E', '#80FFFF', 0);
// 	R.C = new Residue('C', 'Cytosine', false, '#BEA06E', '#FF8C4B', 0);
// 	R.T = new Residue('T', 'Thymine', false, '#BEA06E', '#A0FFA0', 0);
// 	R.U = new Residue('U', 'Uracil', false, '#BEA06E', '#FF8080', 0);
//
// 	return R;
//
// })();

Chemio.monitor = (function(featureDetection, document, undefined) {
	'use strict';
	let m = {};

	m.CANVAS_DRAGGING = undefined;
	m.CANVAS_OVER = undefined;
	m.ALT = false;
	m.SHIFT = false;
	m.META = false;

	document.addEventListener('DOMContentLoaded', function() {
		// handles dragging beyond the canvas bounds
		document.addEventListener('mousemove', function(e) {
			if (m.CANVAS_DRAGGING) {
				if (m.CANVAS_DRAGGING.drag) {
					m.CANVAS_DRAGGING.prehandleEvent(e);
					m.CANVAS_DRAGGING.drag(e);
				}
			}
		});
		document.addEventListener('mouseup', function(e) {
			if (m.CANVAS_DRAGGING && m.CANVAS_DRAGGING !== m.CANVAS_OVER) {
				if (m.CANVAS_DRAGGING.mouseup) {
					m.CANVAS_DRAGGING.prehandleEvent(e);
					m.CANVAS_DRAGGING.mouseup(e);
				}
			}
			m.CANVAS_DRAGGING = undefined;
		});

		// handles modifier keys from a single keyboard
		document.addEventListener('keydown', function(e) {
			m.SHIFT = e.shiftKey;
			m.ALT = e.altKey;
			m.META = e.metaKey || e.ctrlKey;
			let affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting) {
				if (affecting.keydown) {
					affecting.prehandleEvent(e);
					affecting.keydown(e);
				}
			}
		});
		document.addEventListener('keypress', function(e) {
			let affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting) {
				if (affecting.keypress) {
					affecting.prehandleEvent(e);
					affecting.keypress(e);
				}
			}
		});
		document.addEventListener('keyup', function(e) {
			m.SHIFT = e.shiftKey;
			m.ALT = e.altKey;
			m.META = e.metaKey || e.ctrlKey;
			let affecting = m.CANVAS_OVER;
			if (m.CANVAS_DRAGGING) {
				affecting = m.CANVAS_DRAGGING;
			}
			if (affecting) {
				if (affecting.keyup) {
					affecting.prehandleEvent(e);
					affecting.keyup(e);
				}
			}
		});
	});
	return m;

})(Chemio.featureDetection, document);
