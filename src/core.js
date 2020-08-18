//
//  Copyright 2006-2010 iChemLabs, LLC.  All rights reserved.
//

let ChemDoodle = (function() {
    'use strict';
    var c = {};

    c.iChemLabs = {};
    c.informatics = {};
    c.io = {};
    c.lib = {};
    c.notations = {};
    c.structures = {};
    c.structures.d2 = {};
    c.structures.d3 = {};

    var VERSION = '7.0.1';

    c.getVersion = function() {
        return VERSION;
    };

    return c;

})();

// Attach external jQuery
ChemDoodle.lib.jQuery = {};

ChemDoodle.animations = (function(window, undefined) {
	'use strict';
	let ext = {};

	// Drop in replace functions for setTimeout() & setInterval() that
	// make use of requestAnimationFrame() for performance where available
	// http://www.joelambert.co.uk

	// Copyright 2011, Joe Lambert.
	// Free to use under the MIT license.
	// http://www.opensource.org/licenses/mit-license.php

	// requestAnimationFrame() shim by Paul Irish
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	window.requestAnimFrame = (function() {
		return  window.requestAnimationFrame       ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / 60);
				};
	})();

	/**
	 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
	 * @param {function} fn The callback function
	 * @param {int} delay The delay in milliseconds
	 */
	ext.requestInterval = function(fn, delay) {
		if( !window.requestAnimationFrame       &&
			!window.webkitRequestAnimationFrame &&
			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
			!window.oRequestAnimationFrame      &&
			!window.msRequestAnimationFrame)
				return window.setInterval(fn, delay);

		let start = new Date().getTime(),
			handle = new Object();

		function loop() {
			let current = new Date().getTime(),
				delta = current - start;

			if(delta >= delay) {
				fn.call();
				start = new Date().getTime();
			}

			handle.value = window.requestAnimFrame(loop);
		};

		handle.value = window.requestAnimFrame(loop);
		return handle;
	};

	/**
	 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
	 * @param {int|object} fn The callback function
	 */
	ext.clearRequestInterval = function(handle) {
	    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
	    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
	    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
	    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
	    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
	    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
	    clearInterval(handle);
	};

	/**
	 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
	 * @param {function} fn The callback function
	 * @param {int} delay The delay in milliseconds
	 */

	ext.requestTimeout = function(fn, delay) {
		if( !window.requestAnimationFrame      	&&
			!window.webkitRequestAnimationFrame &&
			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
			!window.oRequestAnimationFrame      &&
			!window.msRequestAnimationFrame)
				return window.setTimeout(fn, delay);

		let start = new Date().getTime(),
			handle = new Object();

		function loop(){
			let current = new Date().getTime(),
				delta = current - start;

			delta >= delay ? fn.call() : handle.value = window.requestAnimFrame(loop);
		};

		handle.value = window.requestAnimFrame(loop);
		return handle;
	};

	/**
	 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
	 * @param {int|object} fn The callback function
	 */
	ext.clearRequestTimeout = function(handle) {
	    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
	    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
	    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
	    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
	    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
	    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
	    clearTimeout(handle);
	};

	return ext;

})(window);

ChemDoodle.extensions = (function(structures, v3, m, undefined) {
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

})(ChemDoodle.structures, ChemDoodle.lib.vec3, Math);

(function(Object, Math, undefined) {
	'use strict';

	// polyfills exist here, mostly for IE11 support

	// Math.sign used by SESSurface.generate()
	if (!Math.sign) {
	  Math.sign = function(x) {
	    // If x is NaN, the result is NaN.
	    // If x is -0, the result is -0.
	    // If x is +0, the result is +0.
	    // If x is negative and not -0, the result is -1.
	    // If x is positive and not +0, the result is +1.
	    return ((x > 0) - (x < 0)) || +x;
	    // A more aesthetic pseudo-representation:
	    // ( (x > 0) ? 1 : 0 )  // if x is positive, then positive one
	    //          +           // else (because you can't be both - and +)
	    // ( (x < 0) ? -1 : 0 ) // if x is negative, then negative one
	    //         ||           // if x is 0, -0, or NaN, or not a number,
	    //         +x           // then the result will be x, (or) if x is
	    //                      // not a number, then x converts to number
	  };
	}

	// polyfill for Object.assign on IE11
	// used by Styles constructor
	if (typeof Object.assign != 'function') {
	    Object.assign = function (target, varArgs) {
	        'use strict';
	        if (target == null) { // TypeError if undefined or null
	            throw new TypeError('Cannot convert undefined or null to object');
	        }

	        var to = Object(target);

	        for (var index = 1; index < arguments.length; index++) {
	            var nextSource = arguments[index];

	            if (nextSource != null) { // Skip over if undefined or null
	                for (var nextKey in nextSource) {
	                    // Avoid bugs when hasOwnProperty is shadowed
	                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
	                        to[nextKey] = nextSource[nextKey];
	                    }
	                }
	            }
	        }
	        return to;
	    };
	}

	// polyfill for String.startsWith() on IE11
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position){
		  position = position || 0;
		  return this.substr(position, searchString.length) === searchString;
	  };
	}

})(Object, Math);

ChemDoodle.math = (function(c, structures, m, undefined) {
	'use strict';
	let pack = {};

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

	pack.angleBetweenLargest = function(angles) {
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

	pack.isBetween = function(x, left, right) {
		if (left > right) {
			let tmp = left;
			left = right;
			right = tmp;
		}
		return x >= left && x <= right;
	};

	pack.getRGB = function(color, multiplier) {
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

	pack.hsl2rgb = function(h, s, l) {
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

	pack.idx2color = function(value) {
		let hex = value.toString(16);

		// add '0' padding
		for ( let i = 0, ii = 6 - hex.length; i < ii; i++) {
			hex = "0" + hex;
		}

		return "#" + hex;
	};

	pack.distanceFromPointToLineInclusive = function(p, l1, l2, retract) {
		let length = l1.distance(l2);
		let angle = l1.angle(l2);
		let angleDif = m.PI / 2 - angle;
		let newAngleP = l1.angle(p) + angleDif;
		let pDist = l1.distance(p);
		let pcopRot = new structures.Point(pDist * m.cos(newAngleP), -pDist * m.sin(newAngleP));
		let pull = retract?retract:0;
		if (pack.isBetween(-pcopRot.y, pull, length-pull)) {
			return m.abs(pcopRot.x);
		}
		return -1;
	};

	pack.calculateDistanceInterior = function(to, from, r) {
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

	pack.intersectLines = function(ax, ay, bx, by, cx, cy, dx, dy) {
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

	pack.clamp = function(value, min, max) {
		return value < min ? min : value > max ? max : value;
	};

	pack.rainbowAt = function(i, ii, colors) {

		// The rainbow colors length must be more than one color
		if (colors.length < 1) {
			colors.push('#000000', '#FFFFFF');
		} else if (colors.length < 2) {
			colors.push('#FFFFFF');
		}

		let step = ii / (colors.length - 1);
		let j = m.floor(i / step);
		let t = (i - j * step) / step;
		let startColor = pack.getRGB(colors[j], 1);
		let endColor = pack.getRGB(colors[j + 1], 1);

		let lerpColor = [ (startColor[0] + (endColor[0] - startColor[0]) * t) * 255, (startColor[1] + (endColor[1] - startColor[1]) * t) * 255, (startColor[2] + (endColor[2] - startColor[2]) * t) * 255 ];

		return 'rgb(' + lerpColor.join(',') + ')';
	};

	pack.angleBounds = function(angle, limitToPi, zeroCenter) {
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

	pack.toDeg = function(angle){
	    return 180*angle/m.PI;
    }

    pack.toRad = function(angle){
	    return angle*m.PI/180;
    }

	pack.isPointInPoly = function(poly, pt) {
		// this function needs var to work properly
		for ( var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		}
		return c;
	};

	pack.center = function(points) {
	    let center = new structures.Point(0, 0);
	    for (let i = 0, ii = points.length; i < ii; i++) {
	        center.x += points[i].x;
            center.y += points[i].y;
        }
	    center.x /= points.length;
        center.y /= points.length;
        return center;
    };

	return pack;

})(ChemDoodle, ChemDoodle.structures, Math);

(function(math, m, undefined) {
	'use strict';
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

})(ChemDoodle.math, Math);

ChemDoodle.featureDetection = (function (document, window, undefined) {
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

// attach jsBezier
jsBezierAttach(ChemDoodle.math);

// all symbols
ChemDoodle.SYMBOLS = [ 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl',
		'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og' ];

ChemDoodle.ELEMENT = (function(SYMBOLS, undefined) {
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

})(ChemDoodle.SYMBOLS);

ChemDoodle.RESIDUE = (function(undefined) {
	'use strict';
	let R = [];

	function Residue(symbol, name, polar, aminoColor, shapelyColor, acidity) {
		this.symbol = symbol;
		this.name = name;
		this.polar = polar;
		this.aminoColor = aminoColor;
		this.shapelyColor = shapelyColor;
		this.acidity = acidity;
	}

	R.Ala = new Residue('Ala', 'Alanine', false, '#C8C8C8', '#8CFF8C', 0);
	R.Arg = new Residue('Arg', 'Arginine', true, '#145AFF', '#00007C', 1);
	R.Asn = new Residue('Asn', 'Asparagine', true, '#00DCDC', '#FF7C70', 0);
	R.Asp = new Residue('Asp', 'Aspartic Acid', true, '#E60A0A', '#A00042', -1);
	R.Cys = new Residue('Cys', 'Cysteine', true, '#E6E600', '#FFFF70', 0);
	R.Gln = new Residue('Gln', 'Glutamine', true, '#00DCDC', '#FF4C4C', 0);
	R.Glu = new Residue('Glu', 'Glutamic Acid', true, '#E60A0A', '#660000', -1);
	R.Gly = new Residue('Gly', 'Glycine', false, '#EBEBEB', '#FFFFFF', 0);
	R.His = new Residue('His', 'Histidine', true, '#8282D2', '#7070FF', 1);
	R.Ile = new Residue('Ile', 'Isoleucine', false, '#0F820F', '#004C00', 0);
	R.Leu = new Residue('Leu', 'Leucine', false, '#0F820F', '#455E45', 0);
	R.Lys = new Residue('Lys', 'Lysine', true, '#145AFF', '#4747B8', 1);
	R.Met = new Residue('Met', 'Methionine', false, '#E6E600', '#B8A042', 0);
	R.Phe = new Residue('Phe', 'Phenylalanine', false, '#3232AA', '#534C52', 0);
	R.Pro = new Residue('Pro', 'Proline', false, '#DC9682', '#525252', 0);
	R.Ser = new Residue('Ser', 'Serine', true, '#FA9600', '#FF7042', 0);
	R.Thr = new Residue('Thr', 'Threonine', true, '#FA9600', '#B84C00', 0);
	R.Trp = new Residue('Trp', 'Tryptophan', true, '#B45AB4', '#4F4600', 0);
	R.Tyr = new Residue('Tyr', 'Tyrosine', true, '#3232AA', '#8C704C', 0);
	R.Val = new Residue('Val', 'Valine', false, '#0F820F', '#FF8CFF', 0);
	R.Asx = new Residue('Asx', 'Asparagine/Aspartic Acid', true, '#FF69B4', '#FF00FF', 0);
	R.Glx = new Residue('Glx', 'Glutamine/Glutamic Acid', true, '#FF69B4', '#FF00FF', 0);
	R['*'] = new Residue('*', 'Other', false, '#BEA06E', '#FF00FF', 0);
	R.A = new Residue('A', 'Adenine', false, '#BEA06E', '#A0A0FF', 0);
	R.G = new Residue('G', 'Guanine', false, '#BEA06E', '#FF7070', 0);
	R.I = new Residue('I', '', false, '#BEA06E', '#80FFFF', 0);
	R.C = new Residue('C', 'Cytosine', false, '#BEA06E', '#FF8C4B', 0);
	R.T = new Residue('T', 'Thymine', false, '#BEA06E', '#A0FFA0', 0);
	R.U = new Residue('U', 'Uracil', false, '#BEA06E', '#FF8080', 0);

	return R;

})();

(function(structures, undefined) {
	'use strict';

	// This is a more efficient Queue implementation other than using Array.shift() on each dequeue, which is very expensive
	// this is 2-3x faster

	/*
	 * Creates a new Queue. A Queue is a first-in-first-out (FIFO) data
	 * structure. Functions of the Queue object allow elements to be
	 * enthis.queued and dethis.queued, the first element to be obtained without
	 * dequeuing, and for the current size of the Queue and empty/non-empty
	 * status to be obtained.
	 */
	structures.Queue = function() {
		// the list of elements, initialised to the empty array
		this.queue = [];
	};
	let _ = structures.Queue.prototype;

	// the amount of space at the front of the this.queue, initialised to zero
	_.queueSpace = 0;

	/*
	 * Returns the size of this Queue. The size of a Queue is equal to the
	 * number of elements that have been enthis.queued minus the number of
	 * elements that have been dethis.queued.
	 */
	_.getSize = function() {

		// return the number of elements in the this.queue
		return this.queue.length - this.queueSpace;

	};

	/*
	 * Returns true if this Queue is empty, and false otherwise. A Queue is
	 * empty if the number of elements that have been enthis.queued equals the
	 * number of elements that have been dethis.queued.
	 */
	_.isEmpty = function() {

		// return true if the this.queue is empty, and false otherwise
		return this.queue.length === 0;

	};

	/*
	 * Enthis.queues the specified element in this Queue. The parameter is:
	 *
	 * element - the element to enthis.queue
	 */
	_.enqueue = function(element) {
		this.queue.push(element);
	};

	/*
	 * Dethis.queues an element from this Queue. The oldest element in this
	 * Queue is removed and returned. If this Queue is empty then undefined is
	 * returned.
	 */
	_.dequeue = function() {

		// initialise the element to return to be undefined
		let element;

		// check whether the this.queue is empty
		if (this.queue.length) {

			// fetch the oldest element in the this.queue
			element = this.queue[this.queueSpace];

			// update the amount of space and check whether a shift should
			// occur
			if (++this.queueSpace * 2 >= this.queue.length) {

				// set the this.queue equal to the non-empty portion of the
				// this.queue
				this.queue = this.queue.slice(this.queueSpace);

				// reset the amount of space at the front of the this.queue
				this.queueSpace = 0;

			}

		}

		// return the removed element
		return element;

	};

	/*
	 * Returns the oldest element in this Queue. If this Queue is empty then
	 * undefined is returned. This function returns the same value as the
	 * dethis.queue function, but does not remove the returned element from this
	 * Queue.
	 */
	_.getOldestElement = function() {

		// initialise the element to return to be undefined
		let element;

		// if the this.queue is not element then fetch the oldest element in the
		// this.queue
		if (this.queue.length) {
			element = this.queue[this.queueSpace];
		}

		// return the oldest element
		return element;
	};

})(ChemDoodle.structures);

(function(structures, m, undefined) {
	'use strict';
	structures.Point = function(x, y) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	};
	let _ = structures.Point.prototype;
	_.sub = function(p) {
		this.x -= p.x;
		this.y -= p.y;
	};
	_.add = function(p) {
		this.x += p.x;
		this.y += p.y;
	};
	_.distance = function(p) {
		let dx = p.x - this.x;
		let dy = p.y - this.y;
		return m.sqrt(dx * dx + dy * dy);
	};
	_.angle = function(p) {
		// y is upside down to account for inverted canvas
		let dx = p.x - this.x;
		let dy = this.y - p.y;
		let angle = 0;
		// Calculate angle
		if (dx === 0) {
			if (dy === 0) {
				angle = 0;
			} else if (dy > 0) {
				angle = m.PI / 2;
			} else {
				angle = 3 * m.PI / 2;
			}
		} else if (dy === 0) {
			if (dx > 0) {
				angle = 0;
			} else {
				angle = m.PI;
			}
		} else {
			if (dx < 0) {
				angle = m.atan(dy / dx) + m.PI;
			} else if (dy < 0) {
				angle = m.atan(dy / dx) + 2 * m.PI;
			} else {
				angle = m.atan(dy / dx);
			}
		}
		while (angle < 0) {
			angle += m.PI * 2;
		}
		angle = angle % (m.PI * 2);
		return angle;
	};

})(ChemDoodle.structures, Math);

(function(extensions, structures, m, undefined) {
	'use strict';

	let COMMA_SPACE_REGEX = /[ ,]+/;
	let COMMA_DASH_REGEX = /\-+/;
	let FONTS = [ 'Helvetica', 'Arial', 'Dialog' ];

	structures.Query = function(type) {
		this.type = type;
		// atom properties
		this.elements = {v:[],not:false};
		this.charge = undefined;
		this.chirality = undefined;
		this.connectivity = undefined;
		this.connectivityNoH = undefined;
		this.hydrogens = undefined;
		this.saturation = undefined;
		// bond properties
		this.orders = {v:[],not:false};
		this.stereo = undefined;
		// generic properties
		this.aromatic = undefined;
		this.ringCount = undefined;
		// cache the string value
		this.cache = undefined;
	};
	structures.Query.TYPE_ATOM = 0;
	structures.Query.TYPE_BOND = 1;
	let _ = structures.Query.prototype;
	_.parseRange = function(range){
		let points = [];
		let splits = range.split(COMMA_SPACE_REGEX);
		for(let i = 0, ii = splits.length; i<ii; i++){
			let t = splits[i];
			let neg = false;
			let neg2 = false;
			if(t.charAt(0)==='-'){
				neg = true;
				t = t.substring(1);
			}
			if (t.indexOf('--')!=-1) {
				neg2 = true;
			}
			if (t.indexOf('-')!=-1) {
				let parts = t.split(COMMA_DASH_REGEX);
				let p = {x:parseInt(parts[0]) * (neg ? -1 : 1),y:parseInt(parts[1]) * (neg2 ? -1 : 1)};
				if (p.y < p.x) {
					let tmp = p.y;
					p.y = p.x;
					p.x = tmp;
				}
				points.push(p);
			} else {
				points.push({x:parseInt(t) * (neg ? -1 : 1)});
			}
		}
		return points;
	};
	_.draw = function(ctx, styles, pos) {
		if(!this.cache){
			this.cache = this.toString();
		}
		let top = this.cache;
		let bottom = undefined;
		let split = top.indexOf('(');
		if(split!=-1){
			top = this.cache.substring(0, split);
			bottom = this.cache.substring(split, this.cache.length);
		}
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = extensions.getFontString(12, FONTS, true, false);
		let tw = ctx.measureText(top).width;
		ctx.fillStyle = styles.backgroundColor;
		ctx.fillRect(pos.x-tw/2, pos.y-6, tw, 12);
		ctx.fillStyle = 'black';
		ctx.fillText(top, pos.x, pos.y);
		if(bottom){
			ctx.font = extensions.getFontString(10, FONTS, false, true);
			tw = ctx.measureText(bottom).width;
			ctx.fillStyle = styles.backgroundColor;
			ctx.fillRect(pos.x-tw/2, pos.y+6, tw, 11);
			ctx.fillStyle = 'black';
			ctx.fillText(bottom, pos.x, pos.y+11);
		}
	};
	_.outputRange = function(array){
		let comma = false;
		let sb = [];
		for(let i = 0, ii = array.length; i<ii; i++){
			if(comma){
				sb.push(',');
			}
			comma = true;
			let p = array[i];
			if(p.y){
				sb.push(p.x);
				sb.push('-');
				sb.push(p.y);
			}else{
				sb.push(p.x);
			}
		}
		return sb.join('');
	};
	_.toString = function() {
		let sb = [];
		let attributes = [];
		if(this.type===structures.Query.TYPE_ATOM){
			if(!this.elements || this.elements.v.length===0){
				sb.push('[a]');
			}else{
				if(this.elements.not){
					sb.push('!');
				}
				sb.push('[');
				sb.push(this.elements.v.join(','));
				sb.push(']');
			}
			if(this.chirality){
				attributes.push((this.chirality.not?'!':'')+'@='+this.chirality.v);
			}
			if(this.aromatic){
				attributes.push((this.aromatic.not?'!':'')+'A');
			}
			if(this.charge){
				attributes.push((this.charge.not?'!':'')+'C='+this.outputRange(this.charge.v));
			}
			if(this.hydrogens){
				attributes.push((this.hydrogens.not?'!':'')+'H='+this.outputRange(this.hydrogens.v));
			}
			if(this.ringCount){
				attributes.push((this.ringCount.not?'!':'')+'R='+this.outputRange(this.ringCount.v));
			}
			if(this.saturation){
				attributes.push((this.saturation.not?'!':'')+'S');
			}
			if(this.connectivity){
				attributes.push((this.connectivity.not?'!':'')+'X='+this.outputRange(this.connectivity.v));
			}
			if(this.connectivityNoH){
				attributes.push((this.connectivityNoH.not?'!':'')+'x='+this.outputRange(this.connectivityNoH.v));
			}
		}else if(this.type===structures.Query.TYPE_BOND){
			if(!this.orders || this.orders.v.length===0){
				sb.push('[a]');
			}else{
				if(this.orders.not){
					sb.push('!');
				}
				sb.push('[');
				sb.push(this.orders.v.join(','));
				sb.push(']');
			}
			if(this.stereo){
				attributes.push((this.stereo.not?'!':'')+'@='+this.stereo.v);
			}
			if(this.aromatic){
				attributes.push((this.aromatic.not?'!':'')+'A');
			}
			if(this.ringCount){
				attributes.push((this.ringCount.not?'!':'')+'R='+this.outputRange(this.ringCount.v));
			}
		}
		if(attributes.length>0){
			sb.push('(');
			sb.push(attributes.join(','));
			sb.push(')');
		}
		return sb.join('');
	};

})(ChemDoodle.extensions, ChemDoodle.structures, Math);

(function (ELEMENT, extensions, math, structures, m, m4, undefined) {
	'use strict';
	let whitespaceRegex = /\s+/g;

	structures.Atom = function (label, x, y, z) {
		this.label = label ? label.trim() : 'C';
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
	};
	let _ = structures.Atom.prototype = new structures.Point(0, 0);
	_.charge = 0;
	_.numLonePair = 0;
	_.numRadical = 0;
	_.mass = -1;
	_.implicitH = -1;
	_.coordinationNumber = 0;
	_.bondNumber = 0;
	_.angleOfLeastInterference = 0;
	_.isHidden = false;
	_.altLabel = undefined;
	_.isLone = false;
	_.isHover = false;
	_.isSelected = false;
	_.add3D = function (p) {
		this.x += p.x;
		this.y += p.y;
		this.z += p.z;
	};
	_.sub3D = function (p) {
		this.x -= p.x;
		this.y -= p.y;
		this.z -= p.z;
	};
	_.distance3D = function (p) {
		let dx = p.x - this.x;
		let dy = p.y - this.y;
		let dz = p.z - this.z;
		return m.sqrt(dx * dx + dy * dy + dz * dz);
	};
	_.draw = function (ctx, styles) {
		if (this.dontDraw) {
			// this is used when the atom shouldn't be visible, such as when the text input field is open over this atom
			return;
		}
		if (this.isLassoed) {
			ctx.fillStyle = styles.colorSelect //grd;
			ctx.beginPath();
			ctx.arc(this.x, this.y, styles.atoms_selectRadius, 0, m.PI * 2, false);
			ctx.fill();
		}
		if (this.query) {
			return;
		}
		this.textBounds = [];
		if (this.styles) {
			styles = this.styles;
		}
		let font = extensions.getFontString(styles.atoms_font_size_2D, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
		ctx.font = font;
		ctx.fillStyle = this.getElementColor(styles.atoms_useJMOLColors, styles.atoms_usePYMOLColors, styles.atoms_color, 2);
		if (this.label === 'H' && styles.atoms_HBlack_2D) {
			ctx.fillStyle = 'black';
		}
		if (this.error) {
			ctx.fillStyle = styles.colorError;
		}
		let hAngle;
		let labelVisible = this.isLabelVisible(styles);
		if (this.isLone && !labelVisible || styles.atoms_circles_2D) {
			// always use carbon gray for lone carbon atom dots
			if (this.isLone) {
				ctx.fillStyle = '#909090';
			}
			ctx.beginPath();
			ctx.arc(this.x, this.y, styles.atoms_circleDiameter_2D / 2, 0, m.PI * 2, false);
			ctx.fill();
			if (styles.atoms_circleBorderWidth_2D > 0) {
				ctx.lineWidth = styles.atoms_circleBorderWidth_2D;
				ctx.strokeStyle = 'black';
				ctx.stroke();
			}
		} else if (labelVisible) {
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			// keep check to undefined here as dev may set altLabel to empty
			// string
			if (this.altLabel !== undefined) {
				// altLabel can be 0, so check if undefined
				ctx.fillText(this.altLabel, this.x, this.y + 1);
				let symbolWidth = ctx.measureText(this.altLabel).width;
				this.textBounds.push({
					x: this.x - symbolWidth / 2,
					y: this.y - styles.atoms_font_size_2D / 2 + 1,
					w: symbolWidth,
					h: styles.atoms_font_size_2D - 2
				});
			} else if (!ELEMENT[this.label]) {
				if (structures.CondensedLabel) {
					if (this.label.match(whitespaceRegex)) {
						// if a space is included in the string, it is reasonable to expect this to be written text and not chemically interpretted
						ctx.textAlign = 'left';
						if (this.error) {
							ctx.fillStyle = styles.colorError;
						}
						ctx.fillText(this.label, this.x, this.y + 1);
						let symbolWidth = ctx.measureText(this.label).width;
						this.textBounds.push({
							x: this.x + 1,
							y: this.y - styles.atoms_font_size_2D / 2 + 1,
							w: symbolWidth,
							h: styles.atoms_font_size_2D - 2
						});
					} else {
						// CondensedLabel is proprietary and not included in the GPL version
						if (!this.condensed || this.condensed.text !== this.label) {
							this.condensed = new structures.CondensedLabel(this, this.label);
						}
						this.condensed.draw(ctx, styles);
					}
				} else {
					ctx.fillText(this.label, this.x, this.y + 1);
					let symbolWidth = ctx.measureText(this.label).width;
					this.textBounds.push({
						x: this.x - symbolWidth / 2,
						y: this.y - styles.atoms_font_size_2D / 2 + 1,
						w: symbolWidth,
						h: styles.atoms_font_size_2D - 2
					});
				}
			} else {
				ctx.fillText(this.label, this.x, this.y + 1);
				let symbolWidth = ctx.measureText(this.label).width;
				this.textBounds.push({
					x: this.x - symbolWidth / 2,
					y: this.y - styles.atoms_font_size_2D / 2 + 1,
					w: symbolWidth,
					h: styles.atoms_font_size_2D - 2
				});
				// mass
				let massWidth = 0;
				if (this.mass !== -1) {
					let fontSave = ctx.font;
					ctx.font = extensions.getFontString(styles.atoms_font_size_2D * .7, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
					massWidth = ctx.measureText(this.mass).width;
					ctx.fillText(this.mass, this.x - massWidth - .5, this.y - styles.atoms_font_size_2D / 2 + 1);
					this.textBounds.push({
						x: this.x - symbolWidth / 2 - massWidth - .5,
						y: this.y - (styles.atoms_font_size_2D * 1.7) / 2 + 1,
						w: massWidth,
						h: styles.atoms_font_size_2D / 2 - 1
					});
					ctx.font = fontSave;
				}
				// implicit hydrogens
				let chargeOffset = symbolWidth / 2;
				let numHs = this.getImplicitHydrogenCount();
				if (styles.atoms_implicitHydrogens_2D && numHs > 0) {
					hAngle = 0;
					let hWidth = ctx.measureText('H').width;
					let moveCharge = true;
					if (numHs > 1) {
						let xoffset = symbolWidth / 2 + hWidth / 2;
						let yoffset = 0;
						let subFont = extensions.getFontString(styles.atoms_font_size_2D * .8, styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
						ctx.font = subFont;
						let numWidth = ctx.measureText(numHs).width;
						if (this.bondNumber === 1) {
							if (this.angleOfLeastInterference > m.PI / 2 && this.angleOfLeastInterference < 3 * m.PI / 2) {
								xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
								moveCharge = false;
								hAngle = m.PI;
							}
						} else {
							if (this.angleOfLeastInterference <= m.PI / 4) {
								// default
							} else if (this.angleOfLeastInterference < 3 * m.PI / 4) {
								xoffset = 0;
								yoffset = -styles.atoms_font_size_2D * .9;
								if (this.charge !== 0) {
									yoffset -= styles.atoms_font_size_2D * .3;
								}
								moveCharge = false;
								hAngle = m.PI / 2;
							} else if (this.angleOfLeastInterference <= 5 * m.PI / 4) {
								xoffset = -symbolWidth / 2 - numWidth - hWidth / 2 - massWidth / 2;
								moveCharge = false;
								hAngle = m.PI;
							} else if (this.angleOfLeastInterference < 7 * m.PI / 4) {
								xoffset = 0;
								yoffset = styles.atoms_font_size_2D * .9;
								moveCharge = false;
								hAngle = 3 * m.PI / 2;
							}
						}
						ctx.font = font;
						ctx.fillText('H', this.x + xoffset, this.y + yoffset + 1);
						ctx.font = subFont;
						ctx.fillText(numHs, this.x + xoffset + hWidth / 2 + numWidth / 2, this.y + yoffset + styles.atoms_font_size_2D * .3);
						this.textBounds.push({
							x: this.x + xoffset - hWidth / 2,
							y: this.y + yoffset - styles.atoms_font_size_2D / 2 + 1,
							w: hWidth,
							h: styles.atoms_font_size_2D - 2
						});
						this.textBounds.push({
							x: this.x + xoffset + hWidth / 2,
							y: this.y + yoffset + styles.atoms_font_size_2D * .3 - styles.atoms_font_size_2D / 2 + 1,
							w: numWidth,
							h: styles.atoms_font_size_2D * .8 - 2
						});
					} else {
						let xoffset = symbolWidth / 2 + hWidth / 2;
						let yoffset = 0;
						if (this.bondNumber === 1) {
							if (this.angleOfLeastInterference > m.PI / 2 && this.angleOfLeastInterference < 3 * m.PI / 2) {
								xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
								moveCharge = false;
								hAngle = m.PI;
							}
						} else {
							if (this.angleOfLeastInterference <= m.PI / 4) {
								// default
							} else if (this.angleOfLeastInterference < 3 * m.PI / 4) {
								xoffset = 0;
								yoffset = -styles.atoms_font_size_2D * .9;
								moveCharge = false;
								hAngle = m.PI / 2;
							} else if (this.angleOfLeastInterference <= 5 * m.PI / 4) {
								xoffset = -symbolWidth / 2 - hWidth / 2 - massWidth / 2;
								moveCharge = false;
								hAngle = m.PI;
							} else if (this.angleOfLeastInterference < 7 * m.PI / 4) {
								xoffset = 0;
								yoffset = styles.atoms_font_size_2D * .9;
								moveCharge = false;
								hAngle = 3 * m.PI / 2;
							}
						}
						ctx.fillText('H', this.x + xoffset, this.y + yoffset + 1);
						this.textBounds.push({
							x: this.x + xoffset - hWidth / 2,
							y: this.y + yoffset - styles.atoms_font_size_2D / 2 + 1,
							w: hWidth,
							h: styles.atoms_font_size_2D - 2
						});
					}
					if (moveCharge) {
						chargeOffset += hWidth;
					}
					// adjust the angles metadata to account for hydrogen
					// placement
					/*
					 * this.angles.push(hAngle); let angleData =
					 * math.angleBetweenLargest(this.angles);
					 * this.angleOfLeastInterference = angleData.angle % (m.PI *
					 * 2); this.largestAngle = angleData.largest;
					 */
				}
				// charge
				if (this.charge !== 0) {
					let s = this.charge.toFixed(0);
					if (s === '1') {
						s = '+';
					} else if (s === '-1') {
						s = '\u2013';
					} else if (s.startsWith('-')) {
						s = s.substring(1) + '\u2013';
					} else {
						s += '+';
					}
					let chargeWidth = ctx.measureText(s).width;
					chargeOffset += chargeWidth / 2;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.font = extensions.getFontString(m.floor(styles.atoms_font_size_2D * .8), styles.atoms_font_families_2D, styles.atoms_font_bold_2D, styles.atoms_font_italic_2D);
					ctx.fillText(s, this.x + chargeOffset - 1, this.y - styles.atoms_font_size_2D / 2 + 1);
					this.textBounds.push({
						x: this.x + chargeOffset - chargeWidth / 2 - 1,
						y: this.y - (styles.atoms_font_size_2D * 1.8) / 2 + 5,
						w: chargeWidth,
						h: styles.atoms_font_size_2D / 2 - 1
					});
				}
			}
		}
		if (this.numLonePair > 0 || this.numRadical > 0) {
			ctx.fillStyle = 'black';
			let as = this.angles.slice(0);
			let ali = this.angleOfLeastInterference;
			let la = this.largestAngle;
			if (hAngle !== undefined) {
				// have to check for undefined here as this number can be 0
				as.push(hAngle);
				as.sort(function (a, b) {
					return a - b;
				});
				let angleData = math.angleBetweenLargest(as);
				ali = angleData.angle % (m.PI * 2);
				la = angleData.largest;
			}
			let things = [];
			for (let i = 0; i < this.numLonePair; i++) {
				things.push({
					t: 2
				});
			}
			for (let i = 0; i < this.numRadical; i++) {
				things.push({
					t: 1
				});
			}
			if (hAngle === undefined && m.abs(la - 2 * m.PI / as.length) < m.PI / 60) {
				let mid = m.ceil(things.length / as.length);
				for (let i = 0, ii = things.length; i < ii; i += mid, ali += la) {
					this.drawElectrons(ctx, styles, things.slice(i, m.min(things.length, i + mid)), ali, la, hAngle);
				}
			} else {
				this.drawElectrons(ctx, styles, things, ali, la, hAngle);
			}
		}
		// for debugging atom label dimensions
		// ctx.strokeStyle = 'red'; for(let i = 0, ii = this.textBounds.length;i<ii; i++){ let r = this.textBounds[i];ctx.beginPath();ctx.rect(r.x, r.y, r.w, r.h); ctx.stroke(); }

	};
	_.drawElectrons = function (ctx, styles, things, angle, largest, hAngle) {
		let segment = largest / (things.length + (this.bonds.length === 0 && hAngle === undefined ? 0 : 1));
		let angleStart = angle - largest / 2 + segment;
		for (let i = 0; i < things.length; i++) {
			let t = things[i];
			let angle = angleStart + i * segment;
			let p1x = this.x + Math.cos(angle) * styles.atoms_lonePairDistance_2D;
			let p1y = this.y - Math.sin(angle) * styles.atoms_lonePairDistance_2D;
			if (t.t === 2) {
				let perp = angle + Math.PI / 2;
				let difx = Math.cos(perp) * styles.atoms_lonePairSpread_2D / 2;
				let dify = -Math.sin(perp) * styles.atoms_lonePairSpread_2D / 2;
				ctx.beginPath();
				ctx.arc(p1x + difx, p1y + dify, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(p1x - difx, p1y - dify, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
				ctx.fill();
			} else if (t.t === 1) {
				ctx.beginPath();
				ctx.arc(p1x, p1y, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
				ctx.fill();
			}
		}
	};
	_.drawDecorations = function (ctx, styles) {
		if (this.isHover || this.isSelected) {
			ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
			ctx.lineWidth = styles.hoverLineWidth;
			ctx.beginPath();
			let radius = this.isHover ? styles.atoms_selectRadius * 1.1 : 15;
			ctx.arc(this.x, this.y, radius, 0, m.PI * 2, false);
			ctx.stroke();
		}
		if (this.isOverlap) {
			ctx.strokeStyle = styles.colorError;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.arc(this.x, this.y, 7, 0, m.PI * 2, false);
			ctx.stroke();
		}
	};
	_.render = function (gl, styles, noColor) {
		if (this.styles) {
			styles = this.styles;
		}
		let transform = m4.translate(m4.identity(), [this.x, this.y, this.z]);
		let radius = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
		if (radius === 0) {
			radius = 1;
		}
		m4.scale(transform, [radius, radius, radius]);

		// colors
		if (!noColor) {
			let color = styles.atoms_color;
			if (styles.atoms_useJMOLColors) {
				color = ELEMENT[this.label].jmolColor;
			} else if (styles.atoms_usePYMOLColors) {
				color = ELEMENT[this.label].pymolColor;
			}
			gl.material.setDiffuseColor(gl, color);
		}

		// render
		gl.shader.setMatrixUniforms(gl, transform);
		let buffer = this.renderAsStar ? gl.starBuffer : gl.sphereBuffer;
		gl.drawElements(gl.TRIANGLES, buffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};
	_.renderHighlight = function (gl, styles) {
		if (this.isSelected || this.isHover) {
			if (this.styles) {
				styles = this.styles;
			}
			let transform = m4.translate(m4.identity(), [this.x, this.y, this.z]);
			let radius = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
			if (radius === 0) {
				radius = 1;
			}
			radius *= 1.3;
			m4.scale(transform, [radius, radius, radius]);

			gl.shader.setMatrixUniforms(gl, transform);
			gl.material.setDiffuseColor(gl, this.isHover ? styles.colorHover : styles.colorSelect);
			let buffer = this.renderAsStar ? gl.starBuffer : gl.sphereBuffer;
			gl.drawElements(gl.TRIANGLES, buffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	};
	_.isLabelVisible = function (styles) {
		if (styles.atoms_displayAllCarbonLabels_2D) {
			// show all carbons
			return true;
		}
		if (this.label !== 'C') {
			// not a carbon
			return true;
		}
		if (this.altLabel || !ELEMENT[this.label]) {
			// there is an alternative or condensed label
			return true;
		}
		if (this.mass !== -1 || this.implicitH !== -1 || this.charge !== 0) {
			// an isotope or charge or implicit hydrogen override designation, so label must be shown
			return true;
		}
		if (styles.atoms_showAttributedCarbons_2D && (this.numRadical !== 0 || this.numLonePair !== 0)) {
			// there are attributes and we want to show the associated label
			return true;
		}
		if (this.isHidden && styles.atoms_showHiddenCarbons_2D) {
			// if it is hidden and we want to show them
			return true;
		}
		if (styles.atoms_displayTerminalCarbonLabels_2D && this.bondNumber === 1) {
			// if it is terminal and we want to show them
			return true;
		}
		return false;
	};
	_.getImplicitHydrogenCount = function () {
		if (!ELEMENT[this.label] || !ELEMENT[this.label].addH) {
			return 0;
		}
		if (this.implicitH !== -1) {
			return this.implicitH;
		}
		if (this.label === 'H') {
			return 0;
		}
		let valence = ELEMENT[this.label].valency;
		let dif = valence - this.coordinationNumber;
		if (this.numRadical > 0) {
			dif = m.max(0, dif - this.numRadical);
		}
		if (this.charge > 0) {
			let vdif = 4 - valence;
			if (this.charge <= vdif) {
				dif += this.charge;
			} else {
				dif = 4 - this.coordinationNumber - this.charge + vdif;
			}
		} else {
			dif += this.charge;
		}
		return dif < 0 ? 0 : m.floor(dif);
	};
	_.getBounds = function () {
		let bounds = new math.Bounds();
		bounds.expand(this.x, this.y);
		if (this.textBounds) {
			for (let i = 0, ii = this.textBounds.length; i < ii; i++) {
				let tb = this.textBounds[i];
				bounds.expand(tb.x, tb.y, tb.x + tb.w, tb.y + tb.h);
			}
		}
		return bounds;
	};
	_.getBounds3D = function () {
		let bounds = new math.Bounds();
		bounds.expand3D(this.x, this.y, this.z);
		return bounds;
	};
	/**
	 * Get Color by atom element.
	 *
	 * @param {boolean}
	 *            useJMOLColors
	 * @param {boolean}
	 *            usePYMOLColors
	 * @param {string}
	 *            color The default color
	 * @param {number}
	 *            dim The render dimension
	 * @return {string} The atom element color
	 */
	_.getElementColor = function (useJMOLColors, usePYMOLColors, color) {
		if (!ELEMENT[this.label]) {
			return '#000';
		}
		if (useJMOLColors) {
			color = ELEMENT[this.label].jmolColor;
		} else if (usePYMOLColors) {
			color = ELEMENT[this.label].pymolColor;
		}
		return color;
	};

})(ChemDoodle.ELEMENT, ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, Math, ChemDoodle.lib.mat4);

(function(ELEMENT, extensions, structures, math, m, m4, v3, undefined) {
	'use strict';
	structures.Bond = function(a1, a2, bondOrder) {
		this.a1 = a1;
		this.a2 = a2;
		// bondOrder can be 0, so need to check against undefined
		this.bondOrder = bondOrder !== undefined ? bondOrder : 1;
	};
	structures.Bond.STEREO_NONE = 'none';
	structures.Bond.STEREO_PROTRUDING = 'protruding';
	structures.Bond.STEREO_RECESSED = 'recessed';
	structures.Bond.STEREO_AMBIGUOUS = 'ambiguous';
	let _ = structures.Bond.prototype;
	_.stereo = structures.Bond.STEREO_NONE;
	_.isHover = false;
	_.ring = undefined;
	_.getCenter = function() {
		return new structures.Point((this.a1.x + this.a2.x) / 2, (this.a1.y + this.a2.y) / 2);
	};
	_.getLength = function() {
		return this.a1.distance(this.a2);
	};
	_.getLength3D = function() {
		return this.a1.distance3D(this.a2);
	};
	_.contains = function(a) {
		return a === this.a1 || a === this.a2;
	};
	_.getNeighbor = function(a) {
		if (a === this.a1) {
			return this.a2;
		} else if (a === this.a2) {
			return this.a1;
		}
		return undefined;
	};
	_.draw = function(ctx, styles) {
		if (this.a1.x === this.a2.x && this.a1.y === this.a2.y) {
			// return, as there is nothing to render, will only cause fill
			// overflows
			return;
		}
		if (this.styles) {
			styles = this.styles;
		}
		let x1 = this.a1.x;
		let x2 = this.a2.x;
		let y1 = this.a1.y;
		let y2 = this.a2.y;
		let dist = this.a1.distance(this.a2);
		let angle = this.a1.angle(this.a2);
		let difX = x2 - x1;
		let difY = y2 - y1;
		if (this.a1.isLassoed && this.a2.isLassoed) {
            let radius = styles.atoms_selectRadius;
            let useDist = radius * 0.5;
			let perpendicular = angle + m.PI / 2;
			let dx = radius * m.sqrt(3) / 2 * m.cos(angle);
			let dy = radius * m.sqrt(3) / 2 * m.sin(angle);
			let mcosp = m.cos(perpendicular);
			let msinp = m.sin(perpendicular);
			let cx1 = x1 - mcosp * useDist + dx;
			let cy1 = y1 + msinp * useDist - dy;
			let cx2 = x1 + mcosp * useDist + dx;
			let cy2 = y1 - msinp * useDist - dy;
			let cx3 = x2 + mcosp * useDist - dx;
			let cy3 = y2 - msinp * useDist + dy;
			let cx4 = x2 - mcosp * useDist - dx;
			let cy4 = y2 + msinp * useDist + dy;

            // debug rounded bonds fill
            // ctx.beginPath();
            // ctx.strokeStyle = 'red';
            // //console.log(cx1, cx2);
            // ctx.arc(cx1, cy1, 0.2, 0, m.PI *2);
            // ctx.stroke();
            // ctx.strokeStyle = 'black';
            // ctx.closePath();
            //
            // ctx.beginPath();
            // ctx.strokeStyle = 'blue';
            // ctx.arc(cx2, cy2, 0.2, 0, m.PI *2);
            // ctx.stroke();
            // ctx.closePath();
            //
            // ctx.beginPath();
            // ctx.strokeStyle = 'green';
            // ctx.arc(cx3, cy3, 0.2, 0, m.PI *2);
            // ctx.stroke();
            // ctx.closePath();
            //
            // ctx.beginPath();
            // ctx.strokeStyle = 'yellow';
            // ctx.arc(cx4, cy4, 0.2, 0, m.PI *2);
            // ctx.stroke();
            // ctx.closePath();

            ctx.moveTo(cx1, cy1);
            ctx.beginPath();
            ctx.fillStyle = styles.colorSelect;
            ctx.arc(x1, y1, radius, -angle - m.PI / 6, -angle + m.PI / 6);
            ctx.lineTo(cx4, cy4);
            ctx.arc(x2, y2, radius, -angle - m.PI * 1/6 + m.PI , -angle + m.PI * 1/6 + m.PI);
            ctx.closePath();
            ctx.fill();
		}
		if (styles.atoms_display && !styles.atoms_circles_2D && this.a1.isLabelVisible(styles) && this.a1.textBounds) {
			let distShrink = 0;
			for ( let i = 0, ii = this.a1.textBounds.length; i < ii; i++) {
				distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a1, this.a2, this.a1.textBounds[i]));
			}
			distShrink += styles.bonds_atomLabelBuffer_2D;
			let perc = distShrink / dist;
			x1 += difX * perc;
			y1 += difY * perc;
		}
		if (styles.atoms_display && !styles.atoms_circles_2D && this.a2.isLabelVisible(styles) && this.a2.textBounds) {
			let distShrink = 0;
			for ( let i = 0, ii = this.a2.textBounds.length; i < ii; i++) {
				distShrink = Math.max(distShrink, math.calculateDistanceInterior(this.a2, this.a1, this.a2.textBounds[i]));
			}
			distShrink += styles.bonds_atomLabelBuffer_2D;
			let perc = distShrink / dist;
			x2 -= difX * perc;
			y2 -= difY * perc;
		}
		if (styles.bonds_clearOverlaps_2D) {
			let xs = x1 + difX * .15;
			let ys = y1 + difY * .15;
			let xf = x2 - difX * .15;
			let yf = y2 - difY * .15;
			ctx.strokeStyle = styles.backgroundColor;
			ctx.lineWidth = styles.bonds_width_2D + styles.bonds_overlapClearWidth_2D * 2;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(xs, ys);
			ctx.lineTo(xf, yf);
			ctx.closePath();
			ctx.stroke();
		}
		ctx.strokeStyle = this.error?styles.colorError:styles.bonds_color;
		ctx.fillStyle = this.error?styles.colorError:styles.bonds_color;
		ctx.lineWidth = styles.bonds_width_2D;
		ctx.lineCap = styles.bonds_ends_2D;
		if (styles.bonds_splitColor) {
			let linearGradient = ctx.createLinearGradient(x1, y1, x2, y2);
			let styles1 = this.a1.styles?this.a1.styles:styles;
			let styles2 = this.a2.styles?this.a2.styles:styles;
			let color1 = this.a1.getElementColor(styles1.atoms_useJMOLColors, styles1.atoms_usePYMOLColors, styles1.atoms_color, 2);
			let color2 = this.a2.getElementColor(styles2.atoms_useJMOLColors, styles2.atoms_usePYMOLColors, styles2.atoms_color, 2);
			linearGradient.addColorStop(0, color1);
			if (!styles.bonds_colorGradient) {
				linearGradient.addColorStop(0.5, color1);
				linearGradient.addColorStop(0.51, color2);
			}
			linearGradient.addColorStop(1, color2);
			ctx.strokeStyle = linearGradient;
			ctx.fillStyle = linearGradient;
		}
		if (styles.bonds_lewisStyle_2D && this.bondOrder % 1 === 0) {
			this.drawLewisStyle(ctx, styles, x1, y1, x2, y2);
		} else {
			switch (this.query?1:this.bondOrder) {
			case 0:{
					let dx = x2 - x1;
					let dy = y2 - y1;
					let innerDist = m.sqrt(dx * dx + dy * dy);
					let num = m.floor(innerDist / styles.bonds_dotSize_2D);
					let remainder = (innerDist - (num - 1) * styles.bonds_dotSize_2D) / 2;
					if (num % 2 === 1) {
						remainder += styles.bonds_dotSize_2D / 4;
					} else {
						remainder -= styles.bonds_dotSize_2D / 4;
						num += 2;
					}
					num /= 2;
					let angle = this.a1.angle(this.a2);
					let xs = x1 + remainder * Math.cos(angle);
					let ys = y1 - remainder * Math.sin(angle);
					ctx.beginPath();
					for ( let i = 0; i < num; i++) {
						ctx.arc(xs, ys, styles.bonds_dotSize_2D / 2, 0, m.PI * 2, false);
						xs += 2 * styles.bonds_dotSize_2D * Math.cos(angle);
						ys -= 2 * styles.bonds_dotSize_2D * Math.sin(angle);
					}
					ctx.fill();
					break;
				}
			case 0.5:{
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.setLineDash([styles.bonds_hashSpacing_2D, styles.bonds_hashSpacing_2D]);
					ctx.stroke();
					ctx.setLineDash([]);
					break;
				}
			case 1:{
					if (!this.query && (this.stereo === structures.Bond.STEREO_PROTRUDING || this.stereo === structures.Bond.STEREO_RECESSED)) {
						let thinSpread = styles.bonds_width_2D / 2;
						let useDist = styles.bonds_wedgeThickness_2D/2;
						let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
						let mcosp = m.cos(perpendicular);
						let msinp = m.sin(perpendicular);
						let cx1 = x1 - mcosp * thinSpread;
						let cy1 = y1 + msinp * thinSpread;
						let cx2 = x1 + mcosp * thinSpread;
						let cy2 = y1 - msinp * thinSpread;
						let cx3 = x2 + mcosp * useDist;
						let cy3 = y2 - msinp * useDist;
						let cx4 = x2 - mcosp * useDist;
						let cy4 = y2 + msinp * useDist;
						ctx.beginPath();
						ctx.moveTo(cx1, cy1);
						ctx.lineTo(cx2, cy2);
						ctx.lineTo(cx3, cy3);
						ctx.lineTo(cx4, cy4);
						ctx.closePath();
						if (this.stereo === structures.Bond.STEREO_PROTRUDING) {
							ctx.fill();
						} else {
							ctx.save();
							ctx.clip();
							ctx.lineWidth = useDist * 2;
							ctx.lineCap = 'butt';
							ctx.beginPath();
							ctx.moveTo(x1, y1);
							// workaround to lengthen distance for Firefox as there is a bug, shouldn't affect rendering or performance
							let dx = x2 - x1;
							let dy = y2 - y1;
							ctx.lineTo(x2+5*dx, y2+5*dy);
							ctx.setLineDash([styles.bonds_hashWidth_2D, styles.bonds_hashSpacing_2D]);
							ctx.stroke();
							ctx.setLineDash([]);
							ctx.restore();
						}
					} else if (!this.query && this.stereo === structures.Bond.STEREO_AMBIGUOUS) {
						// these coordinates are modified to space away from labels AFTER the original difX and difY variables are calculated
						let innerDifX = x2 - x1;
						let innerDifY = y2 - y1;
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						let curves = m.floor(m.sqrt(innerDifX * innerDifX + innerDifY * innerDifY) / styles.bonds_wavyLength_2D);
						let x = x1;
						let y = y1;
						let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
						let mcosp = m.cos(perpendicular);
						let msinp = m.sin(perpendicular);

						let curveX = innerDifX / curves;
						let curveY = innerDifY / curves;
						let cpx, cpy;
						for ( let i = 0; i < curves; i++) {
							x += curveX;
							y += curveY;
							let mult = i % 2 === 0?1:-1;
							cpx = styles.bonds_wavyLength_2D * mcosp * mult + x - curveX * 0.5;
							cpy = styles.bonds_wavyLength_2D * -msinp * mult + y - curveY * 0.5;
							ctx.quadraticCurveTo(cpx, cpy, x, y);
						}
						ctx.stroke();
						break;
					} else {
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						ctx.lineTo(x2, y2);
						ctx.stroke();
						if(this.query){
							this.query.draw(ctx, styles, this.getCenter());
						}
					}
					break;
				}
			case 1.5:
			case 2:{
					let angle = this.a1.angle(this.a2);
					let perpendicular = angle + m.PI / 2;
					let mcosp = m.cos(perpendicular);
					let msinp = m.sin(perpendicular);
					let dist = this.a1.distance(this.a2);
					let useDist = styles.bonds_useAbsoluteSaturationWidths_2D?styles.bonds_saturationWidthAbs_2D/2:dist * styles.bonds_saturationWidth_2D / 2;
					if (this.stereo === structures.Bond.STEREO_AMBIGUOUS) {
						let cx1 = x1 - mcosp * useDist;
						let cy1 = y1 + msinp * useDist;
						let cx2 = x1 + mcosp * useDist;
						let cy2 = y1 - msinp * useDist;
						let cx3 = x2 + mcosp * useDist;
						let cy3 = y2 - msinp * useDist;
						let cx4 = x2 - mcosp * useDist;
						let cy4 = y2 + msinp * useDist;
						ctx.beginPath();
						ctx.moveTo(cx1, cy1);
						ctx.lineTo(cx3, cy3);
						ctx.moveTo(cx2, cy2);
						ctx.lineTo(cx4, cy4);
						ctx.stroke();
					} else if (!styles.bonds_symmetrical_2D && (this.ring || this.a1.label === 'C' && this.a2.label === 'C')) {
						ctx.beginPath();
						ctx.moveTo(x1, y1);
						ctx.lineTo(x2, y2);
						ctx.stroke();
						let clip = 0;
						useDist*=2;
						let clipAngle = styles.bonds_saturationAngle_2D;
						if (clipAngle < m.PI / 2) {
							clip = -(useDist / m.tan(clipAngle));
						}
						if (m.abs(clip) < dist / 2) {
							let xuse1 = x1 - m.cos(angle) * clip;
							let xuse2 = x2 + m.cos(angle) * clip;
							let yuse1 = y1 + m.sin(angle) * clip;
							let yuse2 = y2 - m.sin(angle) * clip;
							let cx1 = xuse1 - mcosp * useDist;
							let cy1 = yuse1 + msinp * useDist;
							let cx2 = xuse1 + mcosp * useDist;
							let cy2 = yuse1 - msinp * useDist;
							let cx3 = xuse2 - mcosp * useDist;
							let cy3 = yuse2 + msinp * useDist;
							let cx4 = xuse2 + mcosp * useDist;
							let cy4 = yuse2 - msinp * useDist;
							let flip = !this.ring || (this.ring.center.angle(this.a1) > this.ring.center.angle(this.a2) && !(this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) > m.PI) || (this.ring.center.angle(this.a1) - this.ring.center.angle(this.a2) < -m.PI));
							ctx.beginPath();
							if (flip) {
								ctx.moveTo(cx1, cy1);
								ctx.lineTo(cx3, cy3);
							} else {
								ctx.moveTo(cx2, cy2);
								ctx.lineTo(cx4, cy4);
							}
							if (this.bondOrder !== 2) {
								ctx.setLineDash([styles.bonds_hashSpacing_2D, styles.bonds_hashSpacing_2D]);
							}
							ctx.stroke();
							ctx.setLineDash([]);
						}
					} else {
						let cx1 = x1 - mcosp * useDist;
						let cy1 = y1 + msinp * useDist;
						let cx2 = x1 + mcosp * useDist;
						let cy2 = y1 - msinp * useDist;
						let cx3 = x2 + mcosp * useDist;
						let cy3 = y2 - msinp * useDist;
						let cx4 = x2 - mcosp * useDist;
						let cy4 = y2 + msinp * useDist;
						ctx.beginPath();
						ctx.moveTo(cx1, cy1);
						ctx.lineTo(cx4, cy4);
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(cx2, cy2);
						ctx.lineTo(cx3, cy3);
						if (this.bondOrder !== 2) {
							ctx.setLineDash([styles.bonds_hashWidth_2D, styles.bonds_hashSpacing_2D]);
						}
						ctx.stroke();
						ctx.setLineDash([]);
					}
					break;
				}
			case 3:{
					let useDist = styles.bonds_useAbsoluteSaturationWidths_2D?styles.bonds_saturationWidthAbs_2D:this.a1.distance(this.a2) * styles.bonds_saturationWidth_2D;
					let perpendicular = this.a1.angle(this.a2) + m.PI / 2;
					let mcosp = m.cos(perpendicular);
					let msinp = m.sin(perpendicular);
					let cx1 = x1 - mcosp * useDist;
					let cy1 = y1 + msinp * useDist;
					let cx2 = x1 + mcosp * useDist;
					let cy2 = y1 - msinp * useDist;
					let cx3 = x2 + mcosp * useDist;
					let cy3 = y2 - msinp * useDist;
					let cx4 = x2 - mcosp * useDist;
					let cy4 = y2 + msinp * useDist;
					ctx.beginPath();
					ctx.moveTo(cx1, cy1);
					ctx.lineTo(cx4, cy4);
					ctx.moveTo(cx2, cy2);
					ctx.lineTo(cx3, cy3);
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
					break;
				}
			}
		}
	};

	_.drawDecorations = function(ctx, styles) {
		if (this.isHover || this.isSelected) {
            let x1 = this.a1.x;
            let x2 = this.a2.x;
            let y1 = this.a1.y;
            let y2 = this.a2.y;

            let angle = this.a1.angle(this.a2);
            let radius = styles.atoms_selectRadius * 1.1;
		    let useDist = radius * 0.5;
            let perpendicular = angle + m.PI / 2;
            let dx = radius * m.sqrt(3) / 2 * m.cos(angle);
            let dy = radius * m.sqrt(3) / 2 * m.sin(angle);
            let mcosp = m.cos(perpendicular);
            let msinp = m.sin(perpendicular);
            let cx1 = x1 - mcosp * useDist + dx;
            let cy1 = y1 + msinp * useDist - dy;
            let cx2 = x1 + mcosp * useDist + dx;
            let cy2 = y1 - msinp * useDist - dy;
            let cx3 = x2 + mcosp * useDist - dx;
            let cy3 = y2 - msinp * useDist + dy;
            let cx4 = x2 - mcosp * useDist - dx;
            let cy4 = y2 + msinp * useDist + dy;

            ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
            ctx.lineWidth = styles.hoverLineWidth;

            ctx.moveTo(cx1, cy1);
            ctx.beginPath();
            ctx.arc(x1, y1, radius, -angle - m.PI / 6, -angle + m.PI / 6, true);
            ctx.lineTo(cx4, cy4);
            ctx.arc(x2, y2, radius, -angle - m.PI * 1/6 + m.PI , -angle + m.PI * 1/6 + m.PI, true);
            ctx.closePath();
            ctx.stroke();
		}
	};
	_.drawLewisStyle = function(ctx, styles, x1, y1, x2, y2) {
		let angle = this.a1.angle(this.a2);
		let perp = angle + m.PI/2;
		let difx = x2 - x1;
		let dify = y2 - y1;
		let increment = m.sqrt(difx * difx + dify * dify) / (this.bondOrder + 1);
		let xi = increment * m.cos(angle);
		let yi = -increment * m.sin(angle);
		let x = x1 + xi;
		let y = y1 + yi;
		for ( let i = 0; i < this.bondOrder; i++) {
			let sep = styles.atoms_lonePairSpread_2D / 2;
			let cx1 = x - m.cos(perp) * sep;
			let cy1 = y + m.sin(perp) * sep;
			let cx2 = x + m.cos(perp) * sep;
			let cy2 = y - m.sin(perp) * sep;
			ctx.beginPath();
			ctx.arc(cx1 - styles.atoms_lonePairDiameter_2D / 2, cy1 - styles.atoms_lonePairDiameter_2D / 2, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(cx2 - styles.atoms_lonePairDiameter_2D / 2, cy2 - styles.atoms_lonePairDiameter_2D / 2, styles.atoms_lonePairDiameter_2D, 0, m.PI * 2, false);
			ctx.fill();
			x += xi;
			y += yi;
		}
	};
	/**
	 *
	 * @param {WegGLRenderingContext}
	 *            gl
	 * @param {structures.Styles}
	 *            styles
	 * @param {boolean}
	 *            asSegments Using cylinder/solid line or segmented pills/dashed
	 *            line
	 * @return {void}
	 */
	_.render = function(gl, styles, asSegments) {
		if (this.styles) {
			styles = this.styles;
		}
		// this is the elongation vector for the cylinder
		let height = this.a1.distance3D(this.a2);
		if (height === 0) {
			// if there is no height, then no point in rendering this bond,
			// just return
			return;
		}

		// scale factor for cylinder/pill radius.
		// when scale pill, the cap will affected too.
		let radiusScale = styles.bonds_cylinderDiameter_3D / 2;

		// atom1 color and atom2 color
		let a1Color = styles.bonds_color;
		let a2Color;

		// transform to the atom as well as the opposite atom (for Jmol and
		// PyMOL
		// color splits)
		let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);
		let transformOpposite;

		// vector from atom1 to atom2
		let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];

		// calculate the rotation
		let y = [ 0, 1, 0 ];
		let ang = 0;
		let axis;
		if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
			axis = [ 0, 0, 1 ];
			if (this.a2.y < this.a1.y) {
				ang = m.PI;
			}
		} else {
			ang = extensions.vec3AngleFrom(y, a2b);
			axis = v3.cross(y, a2b, []);
		}

		// the styles will split color are
		// - Line
		// - Stick
		// - Wireframe
		if (styles.bonds_splitColor) {
			let styles1 = this.a1.styles?this.a1.styles:styles;
			let styles2 = this.a2.styles?this.a2.styles:styles;
			a1Color = this.a1.getElementColor(styles1.atoms_useJMOLColors, styles1.atoms_usePYMOLColors, styles1.atoms_color);
			a2Color = this.a2.getElementColor(styles2.atoms_useJMOLColors, styles2.atoms_usePYMOLColors, styles2.atoms_color);

			// the transformOpposite will use for split color.
			// just make it splited if the color different.
			if (a1Color != a2Color) {
				transformOpposite = m4.translate(m4.identity(), [ this.a2.x, this.a2.y, this.a2.z ]);
			}
		}

		// calculate the translations for unsaturated bonds.
		// represenattio use saturatedCross are
		// - Line
		// - Wireframe
		// - Ball and Stick
		// just Stick will set bonds_showBondOrders_3D to false
		let others = [ 0 ];
		let saturatedCross;

		if (asSegments) { // block for draw bond as segmented line/pill

			if (styles.bonds_showBondOrders_3D && this.bondOrder > 1) {

				// The "0.5" part set here,
				// the other part (1) will render as cylinder
				others = [/*-styles.bonds_cylinderDiameter_3D, */styles.bonds_cylinderDiameter_3D ];

				let z = [ 0, 0, 1 ];
				let inverse = m4.inverse(gl.rotationMatrix, []);
				m4.multiplyVec3(inverse, z);
				saturatedCross = v3.cross(a2b, z, []);
				v3.normalize(saturatedCross);
			}

			let segmentScale = 1;

			let spaceBetweenPill = styles.bonds_pillSpacing_3D;

			let pillHeight = styles.bonds_pillHeight_3D;

			if (this.bondOrder == 0) {

				if (styles.bonds_renderAsLines_3D) {
					pillHeight = spaceBetweenPill;
				} else {
					pillHeight = styles.bonds_pillDiameter_3D;

					// Detect Ball and Stick representation
					if (pillHeight < styles.bonds_cylinderDiameter_3D) {
						pillHeight /= 2;
					}

					segmentScale = pillHeight / 2;
					height /= segmentScale;
					spaceBetweenPill /= segmentScale / 2;
				}

			}

			// total space need for one pill, iclude the space.
			let totalSpaceForPill = pillHeight + spaceBetweenPill;

			// segmented pills for one bond.
			let totalPillsPerBond = height / totalSpaceForPill;

			// segmented one unit pill for one bond
			let pillsPerBond = m.floor(totalPillsPerBond);

			let extraSegmentedSpace = height - totalSpaceForPill * pillsPerBond;

			let paddingSpace = (spaceBetweenPill + styles.bonds_pillDiameter_3D + extraSegmentedSpace) / 2;

			// pillSegmentsLength will change if both atom1 and atom2 color used
			// for rendering
			let pillSegmentsLength = pillsPerBond;

			if (transformOpposite) {
				// floor will effected for odd pills, because one pill at the
				// center
				// will replace with splited pills
				pillSegmentsLength = m.floor(pillsPerBond / 2);
			}

			// render bonds
			for ( let i = 0, ii = others.length; i < ii; i++) {
				let transformUse = m4.set(transform, []);

				if (others[i] !== 0) {
					m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
				}
				if (ang !== 0) {
					m4.rotate(transformUse, ang, axis);
				}

				if (segmentScale != 1) {
					m4.scale(transformUse, [ segmentScale, segmentScale, segmentScale ]);
				}

				// colors
				if (a1Color)
					gl.material.setDiffuseColor(gl, a1Color);

				m4.translate(transformUse, [ 0, paddingSpace, 0 ]);

				for ( let j = 0; j < pillSegmentsLength; j++) {

					if (styles.bonds_renderAsLines_3D) {
						if (this.bondOrder == 0) {
							gl.shader.setMatrixUniforms(gl, transformUse);
							gl.drawArrays(gl.POINTS, 0, 1);
						} else {
							m4.scale(transformUse, [ 1, pillHeight, 1 ]);

							gl.shader.setMatrixUniforms(gl, transformUse);
							gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);

							m4.scale(transformUse, [ 1, 1 / pillHeight, 1 ]);
						}
					} else {
						gl.shader.setMatrixUniforms(gl, transformUse);
						if (this.bondOrder == 0) {
							gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
						} else {
							gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
						}
					}

					m4.translate(transformUse, [ 0, totalSpaceForPill, 0 ]);
				}

				// if rendering segmented pill use atom1 and atom2 color
				if (transformOpposite) {
					// parameter for calculate splited pills
					let scaleY, halfOneMinScaleY;

					if (styles.bonds_renderAsLines_3D) {
						scaleY = pillHeight;
						// if(this.bondOrder != 0) {
						// scaleY -= spaceBetweenPill;
						// }
						scaleY /= 2;
						halfOneMinScaleY = 0;
					} else {
						scaleY = 2 / 3;
						halfOneMinScaleY = (1 - scaleY) / 2;
					}

					// if count of pills per bound is odd,
					// then draw the splited pills of atom1
					if (pillsPerBond % 2 != 0) {

						m4.scale(transformUse, [ 1, scaleY, 1 ]);

						gl.shader.setMatrixUniforms(gl, transformUse);

						if (styles.bonds_renderAsLines_3D) {

							if (this.bondOrder == 0) {
								gl.drawArrays(gl.POINTS, 0, 1);
							} else {
								gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
							}

						} else {

							if (this.bondOrder == 0) {
								gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							} else {
								gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							}

						}

						m4.translate(transformUse, [ 0, totalSpaceForPill * (1 + halfOneMinScaleY), 0 ]);

						m4.scale(transformUse, [ 1, 1 / scaleY, 1 ]);
					}

					// prepare to render the atom2

					m4.set(transformOpposite, transformUse);
					if (others[i] !== 0) {
						m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
					}
					// don't check for 0 here as that means it should be rotated
					// by PI, but PI will be negated
					m4.rotate(transformUse, ang + m.PI, axis);

					if (segmentScale != 1) {
						m4.scale(transformUse, [ segmentScale, segmentScale, segmentScale ]);
					}

					// colors
					if (a2Color){
						gl.material.setDiffuseColor(gl, a2Color);
					}

					m4.translate(transformUse, [ 0, paddingSpace, 0 ]);

					// draw the remain pills which use the atom2 color
					for ( let j = 0; j < pillSegmentsLength; j++) {

						if (styles.bonds_renderAsLines_3D) {
							if (this.bondOrder == 0) {
								gl.shader.setMatrixUniforms(gl, transformUse);
								gl.drawArrays(gl.POINTS, 0, 1);
							} else {
								m4.scale(transformUse, [ 1, pillHeight, 1 ]);

								gl.shader.setMatrixUniforms(gl, transformUse);
								gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);

								m4.scale(transformUse, [ 1, 1 / pillHeight, 1 ]);
							}
						} else {
							gl.shader.setMatrixUniforms(gl, transformUse);
							if (this.bondOrder == 0) {
								gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							} else {
								gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							}
						}

						m4.translate(transformUse, [ 0, totalSpaceForPill, 0 ]);
					}

					// draw the splited center pills of atom2
					if (pillsPerBond % 2 != 0) {

						m4.scale(transformUse, [ 1, scaleY, 1 ]);

						gl.shader.setMatrixUniforms(gl, transformUse);

						if (styles.bonds_renderAsLines_3D) {

							if (this.bondOrder == 0) {
								gl.drawArrays(gl.POINTS, 0, 1);
							} else {
								gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
							}

						} else {

							if (this.bondOrder == 0) {
								gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							} else {
								gl.drawElements(gl.TRIANGLES, gl.pillBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
							}

						}

						m4.translate(transformUse, [ 0, totalSpaceForPill * (1 + halfOneMinScaleY), 0 ]);

						m4.scale(transformUse, [ 1, 1 / scaleY, 1 ]);
					}
				}
			}
		} else {
			// calculate the translations for unsaturated bonds.
			// represenation that use saturatedCross are
			// - Line
			// - Wireframe
			// - Ball and Stick
			// just Stick will set bonds_showBondOrders_3D to false
			if (styles.bonds_showBondOrders_3D) {

				switch (this.bondOrder) {
				// the 0 and 0.5 bond order will draw as segmented pill.
				// so we not set that here.
				// case 0:
				// case 0.5: break;

				case 1.5:
					// The "1" part set here,
					// the other part (0.5) will render as segmented pill
					others = [ -styles.bonds_cylinderDiameter_3D /*
																 * ,
																 * styles.bonds_cylinderDiameter_3D
																 */];
					break;
				case 2:
					others = [ -styles.bonds_cylinderDiameter_3D, styles.bonds_cylinderDiameter_3D ];
					break;
				case 3:
					others = [ -1.2 * styles.bonds_cylinderDiameter_3D, 0, 1.2 * styles.bonds_cylinderDiameter_3D ];
					break;
				}

				// saturatedCross just need for need for bondorder greather than
				// 1
				if (this.bondOrder > 1) {
					let z = [ 0, 0, 1 ];
					let inverse = m4.inverse(gl.rotationMatrix, []);
					m4.multiplyVec3(inverse, z);
					saturatedCross = v3.cross(a2b, z, []);
					v3.normalize(saturatedCross);
				}
			}
			// for Stick representation, we just change the cylinder radius
			else {

				switch (this.bondOrder) {
				case 0:
					radiusScale *= 0.25;
					break;
				case 0.5:
				case 1.5:
					radiusScale *= 0.5;
					break;
				}
			}

			// if transformOpposite is set, the it mean the color must be
			// splited.
			// so the heigh of cylinder will be half.
			// one half for atom1 color the other for atom2 color
			if (transformOpposite) {
				height /= 2;
			}

			// Radius of cylinder already defined when initialize cylinder mesh,
			// so at this rate, the scale just needed for Y to strech
			// cylinder to bond length (height) and X and Z for radius.
			let scaleVector = [ radiusScale, height, radiusScale ];

			// render bonds
			for ( let i = 0, ii = others.length; i < ii; i++) {
				let transformUse = m4.set(transform, []);
				if (others[i] !== 0) {
					m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
				}
				if (ang !== 0) {
					m4.rotate(transformUse, ang, axis);
				}
				m4.scale(transformUse, scaleVector);

				// colors
				if (a1Color)
					gl.material.setDiffuseColor(gl, a1Color);

				// render
				gl.shader.setMatrixUniforms(gl, transformUse);
				if (styles.bonds_renderAsLines_3D) {
					gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
				} else {
					gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
				}

				// if transformOpposite is set, then a2Color also shoudl be
				// seted as well.
				if (transformOpposite) {
					m4.set(transformOpposite, transformUse);
					if (others[i] !== 0) {
						m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
					}
					// don't check for 0 here as that means it should be rotated
					// by PI, but PI will be negated
					m4.rotate(transformUse, ang + m.PI, axis);
					m4.scale(transformUse, scaleVector);

					// colors
					if (a2Color)
						gl.material.setDiffuseColor(gl, a2Color);

					// render
					gl.shader.setMatrixUniforms(gl, transformUse);
					if (styles.bonds_renderAsLines_3D) {
						gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
					} else {
						gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
					}
				}
			}
		}
	};
	_.renderHighlight = function(gl, styles) {
		if (this.isSelected || this.isHover) {
			if (this.styles) {
				styles = this.styles;
			}
			if (this.styles) {
				styles = this.styles;
			}
			// this is the elongation vector for the cylinder
			let height = this.a1.distance3D(this.a2);
			if (height === 0) {
				// if there is no height, then no point in rendering this bond,
				// just return
				return;
			}

			// scale factor for cylinder/pill radius.
			// when scale pill, the cap will affected too.
			let radiusScale = styles.bonds_cylinderDiameter_3D / 1.2;
			let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);

			// vector from atom1 to atom2
			let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];

			// calculate the rotation
			let y = [ 0, 1, 0 ];
			let ang = 0;
			let axis;
			if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
				axis = [ 0, 0, 1 ];
				if (this.a2.y < this.a1.y) {
					ang = m.PI;
				}
			} else {
				ang = extensions.vec3AngleFrom(y, a2b);
				axis = v3.cross(y, a2b, []);
			}
			let scaleVector = [ radiusScale, height, radiusScale ];

			if (ang !== 0) {
				m4.rotate(transform, ang, axis);
			}
			m4.scale(transform, scaleVector);
			gl.shader.setMatrixUniforms(gl, transform);
			gl.material.setDiffuseColor(gl, this.isHover ? styles.colorHover : styles.colorSelect);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
		}
	};
	/**
	 *
	 * @param {WegGLRenderingContext}
	 *            gl
	 * @param {structures.Styles}
	 *            styles
	 * @return {void}
	 */
	_.renderPicker = function(gl, styles) {

		// gl.cylinderBuffer.bindBuffers(gl);
		// gl.material.setDiffuseColor(
		// this.bondOrder == 0 ? '#FF0000' : // merah
		// this.bondOrder == 0.5 ? '#FFFF00' : // kuning
		// this.bondOrder == 1 ? '#FF00FF' : // ungu
		// this.bondOrder == 1.5 ? '#00FF00' : // hijau
		// this.bondOrder == 2 ? '#00FFFF' : // cyan
		// this.bondOrder == 3 ? '#0000FF' : // biru
		// '#FFFFFF');
		// gl.material.setAlpha(1);

		if (this.styles) {
			styles = this.styles;
		}
		// this is the elongation vector for the cylinder
		let height = this.a1.distance3D(this.a2);
		if (height === 0) {
			// if there is no height, then no point in rendering this bond,
			// just return
			return;
		}

		// scale factor for cylinder/pill radius.
		// when scale pill, the cap will affected too.
		let radiusScale = styles.bonds_cylinderDiameter_3D / 2;

		// transform to the atom as well as the opposite atom (for Jmol and
		// PyMOL
		// color splits)
		let transform = m4.translate(m4.identity(), [ this.a1.x, this.a1.y, this.a1.z ]);

		// vector from atom1 to atom2
		let a2b = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];

		// calculate the rotation
		let y = [ 0, 1, 0 ];
		let ang = 0;
		let axis;
		if (this.a1.x === this.a2.x && this.a1.z === this.a2.z) {
			axis = [ 0, 0, 1 ];
			if (this.a2.y < this.a1.y) {
				ang = m.PI;
			}
		} else {
			ang = extensions.vec3AngleFrom(y, a2b);
			axis = v3.cross(y, a2b, []);
		}

		// calculate the translations for unsaturated bonds.
		// represenattio use saturatedCross are
		// - Line
		// - WIreframe
		// - Ball and Stick
		// just Stick will set bonds_showBondOrders_3D to false
		let others = [ 0 ];
		let saturatedCross;

		if (styles.bonds_showBondOrders_3D) {

			if (styles.bonds_renderAsLines_3D) {

				switch (this.bondOrder) {

				case 1.5:
				case 2:
					others = [ -styles.bonds_cylinderDiameter_3D, styles.bonds_cylinderDiameter_3D ];
					break;
				case 3:
					others = [ -1.2 * styles.bonds_cylinderDiameter_3D, 0, 1.2 * styles.bonds_cylinderDiameter_3D ];
					break;
				}

				// saturatedCross just need for need for bondorder greather than
				// 1
				if (this.bondOrder > 1) {
					let z = [ 0, 0, 1 ];
					let inverse = m4.inverse(gl.rotationMatrix, []);
					m4.multiplyVec3(inverse, z);
					saturatedCross = v3.cross(a2b, z, []);
					v3.normalize(saturatedCross);
				}

			} else {

				switch (this.bondOrder) {
				case 1.5:
				case 2:
					radiusScale *= 3;
					break;
				case 3:
					radiusScale *= 3.4;
					break;
				}

			}

		} else {
			// this is for Stick repersentation because Stick not have
			// bonds_showBondOrders_3D

			switch (this.bondOrder) {

			case 0:
				radiusScale *= 0.25;
				break;
			case 0.5:
			case 1.5:
				radiusScale *= 0.5;
				break;
			}

		}

		// Radius of cylinder already defined when initialize cylinder mesh,
		// so at this rate, the scale just needed for Y to strech
		// cylinder to bond length (height) and X and Z for radius.
		let scaleVector = [ radiusScale, height, radiusScale ];

		// render bonds
		for ( let i = 0, ii = others.length; i < ii; i++) {
			let transformUse = m4.set(transform, []);
			if (others[i] !== 0) {
				m4.translate(transformUse, v3.scale(saturatedCross, others[i], []));
			}
			if (ang !== 0) {
				m4.rotate(transformUse, ang, axis);
			}
			m4.scale(transformUse, scaleVector);

			// render
			gl.shader.setMatrixUniforms(gl, transformUse);
			if (styles.bonds_renderAsLines_3D) {
				gl.drawArrays(gl.LINES, 0, gl.lineBuffer.vertexPositionBuffer.numItems);
			} else {
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
			}

		}
	};

})(ChemDoodle.ELEMENT, ChemDoodle.extensions, ChemDoodle.structures, ChemDoodle.math, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3);

(function(structures, m, undefined) {
	'use strict';
	structures.Ring = function() {
		this.atoms = [];
		this.bonds = [];
	};
	let _ = structures.Ring.prototype;
	_.center = undefined;
	_.setupBonds = function() {
		for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
			this.bonds[i].ring = this;
		}
		this.center = this.getCenter();
	};
	_.getCenter = function() {
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			minX = m.min(this.atoms[i].x, minX);
			minY = m.min(this.atoms[i].y, minY);
			maxX = m.max(this.atoms[i].x, maxX);
			maxY = m.max(this.atoms[i].y, maxY);
		}
		return new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
	};

})(ChemDoodle.structures, Math);

(function(c, math, structures, RESIDUE, m, undefined) {
	'use strict';
	structures.Molecule = function() {
		this.atoms = [];
		this.bonds = [];
		this.rings = [];
	};
	let _ = structures.Molecule.prototype;
	// this can be an extensive algorithm for large molecules, you may want
	// to turn this off
	_.findRings = true;
	_.draw = function(ctx, styles) {
		if (this.styles) {
			styles = this.styles;
		}
		// draw
		// need this weird render of atoms before and after, just in case
		// circles are rendered, as those should be on top
		if (styles.atoms_display && !styles.atoms_circles_2D) {
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				this.atoms[i].draw(ctx, styles);
			}
		}
		if (styles.bonds_display) {
			for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
				this.bonds[i].draw(ctx, styles);
			}
		}
		if (styles.atoms_display) {
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				if(styles.atoms_circles_2D){
					a.draw(ctx, styles);
				}
				if(a.query){
					a.query.draw(ctx, styles, a);
				}
			}
		}
	};
	_.render = function(gl, styles) {
		// uncomment this to render the picking frame
		// return this.renderPickFrame(gl, styles, []);
		if (this.styles) {
			styles = this.styles;
		}
		// check explicitly if it is undefined here, since hetatm is a
		// boolean that can be true or false, as long as it is set, it is
		// macro
		let isMacro = this.atoms.length > 0 && this.atoms[0].hetatm !== undefined;
		if (isMacro) {
			if (styles.macro_displayBonds) {
				if (this.bonds.length > 0) {
					if (styles.bonds_renderAsLines_3D && !this.residueSpecs || this.residueSpecs && this.residueSpecs.bonds_renderAsLines_3D) {
						gl.lineWidth(this.residueSpecs ? this.residueSpecs.bonds_width_2D : styles.bonds_width_2D);
						gl.lineBuffer.bindBuffers(gl);
					} else {
						gl.cylinderBuffer.bindBuffers(gl);
					}
					// colors
					gl.material.setTempColors(gl, styles.bonds_materialAmbientColor_3D, undefined, styles.bonds_materialSpecularColor_3D, styles.bonds_materialShininess_3D);
				}
				for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
					let b = this.bonds[i];
					// closestDistance may be 0, so check if undefined
					if (!b.a1.hetatm && (styles.macro_atomToLigandDistance === -1 || (b.a1.closestDistance !== undefined && styles.macro_atomToLigandDistance >= b.a1.closestDistance && styles.macro_atomToLigandDistance >= b.a2.closestDistance))) {
						b.render(gl, this.residueSpecs ? this.residueSpecs : styles);
					}
				}
			}
			if (styles.macro_displayAtoms) {
				if (this.atoms.length > 0) {
					gl.sphereBuffer.bindBuffers(gl);
					// colors
					gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, styles.atoms_materialSpecularColor_3D, styles.atoms_materialShininess_3D);
				}
				for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
					let a = this.atoms[i];
					// closestDistance may be 0, so check if undefined
					if (!a.hetatm && (styles.macro_atomToLigandDistance === -1 || (a.closestDistance !== undefined && styles.macro_atomToLigandDistance >= a.closestDistance))) {
						a.render(gl, this.residueSpecs ? this.residueSpecs : styles);
					}
				}
			}
		}
		if (styles.bonds_display) {
			// Array for Half Bonds. It is needed because Half Bonds use the
			// pill buffer.
			let asPills = [];
			// Array for 0 bond order.
			let asSpheres = [];
			if (this.bonds.length > 0) {
				if (styles.bonds_renderAsLines_3D) {
					gl.lineWidth(styles.bonds_width_2D);
					gl.lineBuffer.bindBuffers(gl);
				} else {
					gl.cylinderBuffer.bindBuffers(gl);
				}
				// colors
				gl.material.setTempColors(gl, styles.bonds_materialAmbientColor_3D, undefined, styles.bonds_materialSpecularColor_3D, styles.bonds_materialShininess_3D);
			}
			for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
				let b = this.bonds[i];
				if (!isMacro || b.a1.hetatm) {
					// Check if render as segmented pill will used.
					if (styles.bonds_showBondOrders_3D) {
						if (b.bondOrder == 0) {
							// 0 bond order
							asSpheres.push(b);
						} else if (b.bondOrder == 0.5) {
							// 0.5 bond order
							asPills.push(b);
						} else {
							if (b.bondOrder == 1.5) {
								// For 1.5 bond order, the "1" part will render
								// as cylinder, and the "0.5" part will render
								// as segmented pills
								asPills.push(b);
							}
							b.render(gl, styles);
						}
					} else {
						// this will render the Stick representation
						b.render(gl, styles);
					}

				}
			}
			// Render the Half Bond
			if (asPills.length > 0) {
				// if bonds_renderAsLines_3D is true, then lineBuffer will
				// binded.
				// so in here we just need to check if we need to change
				// the binding buffer to pillBuffer or not.
				if (!styles.bonds_renderAsLines_3D) {
					gl.pillBuffer.bindBuffers(gl);
				}
				for ( let i = 0, ii = asPills.length; i < ii; i++) {
					asPills[i].render(gl, styles, true);
				}
			}
			// Render zero bond order
			if (asSpheres.length > 0) {
				// if bonds_renderAsLines_3D is true, then lineBuffer will
				// binded.
				// so in here we just need to check if we need to change
				// the binding buffer to pillBuffer or not.
				if (!styles.bonds_renderAsLines_3D) {
					gl.sphereBuffer.bindBuffers(gl);
				}
				for ( let i = 0, ii = asSpheres.length; i < ii; i++) {
					asSpheres[i].render(gl, styles, true);
				}
			}
		}
		if (styles.atoms_display) {
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				a.bondNumber = 0;
				a.renderAsStar = false;
			}
			for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
				let b = this.bonds[i];
				b.a1.bondNumber++;
				b.a2.bondNumber++;
			}
			if (this.atoms.length > 0) {
				gl.sphereBuffer.bindBuffers(gl);
				// colors
				gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, styles.atoms_materialSpecularColor_3D, styles.atoms_materialShininess_3D);
			}
			let asStars = [];
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				if (!isMacro || (a.hetatm && (styles.macro_showWater || !a.isWater))) {
					if (styles.atoms_nonBondedAsStars_3D && a.bondNumber === 0) {
						a.renderAsStar = true;
						asStars.push(a);
					} else {
						a.render(gl, styles);
					}
				}
			}
			if (asStars.length > 0) {
				gl.starBuffer.bindBuffers(gl);
				for ( let i = 0, ii = asStars.length; i < ii; i++) {
					asStars[i].render(gl, styles);
				}
			}
		}
		if (this.chains) {
			// set up the model view matrix, since it won't be modified
			// for macromolecules
			gl.shader.setMatrixUniforms(gl);
			// render chains
			if (styles.proteins_displayRibbon) {
				// proteins
				// colors
				gl.material.setTempColors(gl, styles.proteins_materialAmbientColor_3D, undefined, styles.proteins_materialSpecularColor_3D, styles.proteins_materialShininess_3D);
				let uses = styles.proteins_ribbonCartoonize ? this.cartoons : this.ribbons;
				for ( let j = 0, jj = uses.length; j < jj; j++) {
					let use = uses[j];
					if (styles.proteins_residueColor !== 'none') {
						use.front.bindBuffers(gl);
						let rainbow = (styles.proteins_residueColor === 'rainbow');
						for ( let i = 0, ii = use.front.segments.length; i < ii; i++) {
							if (rainbow) {
								gl.material.setDiffuseColor(gl, math.rainbowAt(i, ii, styles.macro_rainbowColors));
							}
							use.front.segments[i].render(gl, styles);
						}
						use.back.bindBuffers(gl);
						for ( let i = 0, ii = use.back.segments.length; i < ii; i++) {
							if (rainbow) {
								gl.material.setDiffuseColor(gl, math.rainbowAt(i, ii, styles.macro_rainbowColors));
							}
							use.back.segments[i].render(gl, styles);
						}
					} else {
						use.front.render(gl, styles);
						use.back.render(gl, styles);
					}
				}
			}

			if(styles.proteins_displayPipePlank) {
				for ( let j = 0, jj = this.pipePlanks.length; j < jj; j++) {
					this.pipePlanks[j].render(gl, styles);
				}
			}

			if (styles.proteins_displayBackbone) {
				if (!this.alphaCarbonTrace) {
					// cache the alpha carbon trace
					this.alphaCarbonTrace = {
						nodes : [],
						edges : []
					};
					for ( let j = 0, jj = this.chains.length; j < jj; j++) {
						let rs = this.chains[j];
						let isNucleotide = rs.length > 2 && RESIDUE[rs[2].name] && RESIDUE[rs[2].name].aminoColor === '#BEA06E';
						if (!isNucleotide && rs.length > 0) {
							for ( let i = 0, ii = rs.length - 2; i < ii; i++) {
								let n = rs[i].cp1;
								n.chainColor = rs.chainColor;
								this.alphaCarbonTrace.nodes.push(n);
								let b = new structures.Bond(rs[i].cp1, rs[i + 1].cp1);
								b.residueName = rs[i].name;
								b.chainColor = rs.chainColor;
								this.alphaCarbonTrace.edges.push(b);
								if (i === rs.length - 3) {
									n = rs[i + 1].cp1;
									n.chainColor = rs.chainColor;
									this.alphaCarbonTrace.nodes.push(n);
								}
							}
						}
					}
				}
				if (this.alphaCarbonTrace.nodes.length > 0) {
					let traceSpecs = new structures.Styles();
					traceSpecs.atoms_display = true;
					traceSpecs.bonds_display = true;
					traceSpecs.atoms_sphereDiameter_3D = styles.proteins_backboneThickness;
					traceSpecs.bonds_cylinderDiameter_3D = styles.proteins_backboneThickness;
					traceSpecs.bonds_splitColor = false;
					traceSpecs.atoms_color = styles.proteins_backboneColor;
					traceSpecs.bonds_color = styles.proteins_backboneColor;
					traceSpecs.atoms_useVDWDiameters_3D = false;
					// colors
					gl.material.setTempColors(gl, styles.proteins_materialAmbientColor_3D, undefined, styles.proteins_materialSpecularColor_3D, styles.proteins_materialShininess_3D);
					gl.material.setDiffuseColor(gl, styles.proteins_backboneColor);
					for ( let i = 0, ii = this.alphaCarbonTrace.nodes.length; i < ii; i++) {
						let n = this.alphaCarbonTrace.nodes[i];
						if (styles.macro_colorByChain) {
							traceSpecs.atoms_color = n.chainColor;
						}
						gl.sphereBuffer.bindBuffers(gl);
						n.render(gl, traceSpecs);
					}
					for ( let i = 0, ii = this.alphaCarbonTrace.edges.length; i < ii; i++) {
						let e = this.alphaCarbonTrace.edges[i];
						let color;
						let r = RESIDUE[e.residueName] ? RESIDUE[e.residueName] : RESIDUE['*'];
						if (styles.macro_colorByChain) {
							color = e.chainColor;
						} else if (styles.proteins_residueColor === 'shapely') {
							color = r.shapelyColor;
						} else if (styles.proteins_residueColor === 'amino') {
							color = r.aminoColor;
						} else if (styles.proteins_residueColor === 'polarity') {
							if (r.polar) {
								color = '#C10000';
							} else {
								color = '#FFFFFF';
							}
						} else if (styles.proteins_residueColor === 'acidity') {
							if(r.acidity === 1){
								color = '#0000FF';
							}else if(r.acidity === -1){
								color = '#FF0000';
							}else if (r.polar) {
								color = '#FFFFFF';
							} else {
								color = '#773300';
							}
						} else if (styles.proteins_residueColor === 'rainbow') {
							color = math.rainbowAt(i, ii, styles.macro_rainbowColors);
						}
						if (color) {
							traceSpecs.bonds_color = color;
						}
						gl.cylinderBuffer.bindBuffers(gl);
						e.render(gl, traceSpecs);
					}
				}
			}
			if (styles.nucleics_display) {
				// nucleic acids
				// colors
				gl.material.setTempColors(gl, styles.nucleics_materialAmbientColor_3D, undefined, styles.nucleics_materialSpecularColor_3D, styles.nucleics_materialShininess_3D);
				for ( let j = 0, jj = this.tubes.length; j < jj; j++) {
					gl.shader.setMatrixUniforms(gl);
					let use = this.tubes[j];
					use.render(gl, styles);
				}
			}
		}
		if (styles.atoms_display) {
			let highlight = false;
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				if(a.isHover || a.isSelected){
					highlight = true;
					break;
				}
			}
			if(!highlight){
				for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
					let b = this.bonds[i];
					if(b.isHover || b.isSelected){
						highlight = true;
						break;
					}
				}
			}
			if(highlight){
				gl.sphereBuffer.bindBuffers(gl);
				// colors
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
				gl.material.setTempColors(gl, styles.atoms_materialAmbientColor_3D, undefined, '#000000', 0);
				gl.enable(gl.BLEND);
				gl.depthMask(false);
				gl.material.setAlpha(gl, .4);
				gl.sphereBuffer.bindBuffers(gl);
				for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
					let a = this.atoms[i];
					if(a.isHover || a.isSelected){
						a.renderHighlight(gl, styles);
					}
				}
				gl.cylinderBuffer.bindBuffers(gl);
				for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
					let b = this.bonds[i];
					if(b.isHover || b.isSelected){
						b.renderHighlight(gl, styles);
					}
				}
				gl.depthMask(true);
				gl.disable(gl.BLEND);
				gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			}
		}
	};
	_.renderPickFrame = function(gl, styles, objects, includeAtoms, includeBonds) {
		if (this.styles) {
			styles = this.styles;
		}
		let isMacro = this.atoms.length > 0 && this.atoms[0].hetatm !== undefined;
		if (includeBonds && styles.bonds_display) {
			if (this.bonds.length > 0) {
				if (styles.bonds_renderAsLines_3D) {
					gl.lineWidth(styles.bonds_width_2D);
					gl.lineBuffer.bindBuffers(gl);
				} else {
					gl.cylinderBuffer.bindBuffers(gl);
				}
			}
			for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
				let b = this.bonds[i];
				if (!isMacro || b.a1.hetatm) {
					gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
					b.renderPicker(gl, styles);
					objects.push(b);
				}
			}
		}
		if (includeAtoms && styles.atoms_display) {
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				a.bondNumber = 0;
				a.renderAsStar = false;
			}
			for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
				let b = this.bonds[i];
				b.a1.bondNumber++;
				b.a2.bondNumber++;
			}
			if (this.atoms.length > 0) {
				gl.sphereBuffer.bindBuffers(gl);
			}
			let asStars = [];
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				let a = this.atoms[i];
				if (!isMacro || (a.hetatm && (styles.macro_showWater || !a.isWater))) {
					if (styles.atoms_nonBondedAsStars_3D && a.bondNumber === 0) {
						a.renderAsStar = true;
						asStars.push(a);
					} else {
						gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
						a.render(gl, styles, true);
						objects.push(a);
					}
				}
			}
			if (asStars.length > 0) {
				gl.starBuffer.bindBuffers(gl);
				for ( let i = 0, ii = asStars.length; i < ii; i++) {
					let a = asStars[i];
					gl.material.setDiffuseColor(gl, math.idx2color(objects.length));
					a.render(gl, styles, true);
					objects.push(a);
				}
			}
		}
	};
	_.getCenter3D = function() {
		if (this.atoms.length === 1) {
			return new structures.Atom('C', this.atoms[0].x, this.atoms[0].y, this.atoms[0].z);
		}
		let minX = Infinity, minY = Infinity, minZ = Infinity;
		let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
		if (this.chains) {
			// residues
			for ( let i = 0, ii = this.chains.length; i < ii; i++) {
				let chain = this.chains[i];
				for ( let j = 0, jj = chain.length; j < jj; j++) {
					let residue = chain[j];
					minX = m.min(residue.cp1.x, residue.cp2.x, minX);
					minY = m.min(residue.cp1.y, residue.cp2.y, minY);
					minZ = m.min(residue.cp1.z, residue.cp2.z, minZ);
					maxX = m.max(residue.cp1.x, residue.cp2.x, maxX);
					maxY = m.max(residue.cp1.y, residue.cp2.y, maxY);
					maxZ = m.max(residue.cp1.z, residue.cp2.z, maxZ);
				}
			}
		}
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			minX = m.min(this.atoms[i].x, minX);
			minY = m.min(this.atoms[i].y, minY);
			minZ = m.min(this.atoms[i].z, minZ);
			maxX = m.max(this.atoms[i].x, maxX);
			maxY = m.max(this.atoms[i].y, maxY);
			maxZ = m.max(this.atoms[i].z, maxZ);
		}
		return new structures.Atom('C', (maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2);
	};
	_.getCenter = function() {
		if (this.atoms.length === 1) {
			return new structures.Point(this.atoms[0].x, this.atoms[0].y);
		}
		let minX = Infinity, minY = Infinity;
		let maxX = -Infinity, maxY = -Infinity;
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			minX = m.min(this.atoms[i].x, minX);
			minY = m.min(this.atoms[i].y, minY);
			maxX = m.max(this.atoms[i].x, maxX);
			maxY = m.max(this.atoms[i].y, maxY);
		}
		return new structures.Point((maxX + minX) / 2, (maxY + minY) / 2);
	};
	_.getDimension = function() {
		if (this.atoms.length === 1) {
			return new structures.Point(0, 0);
		}
		let minX = Infinity, minY = Infinity;
		let maxX = -Infinity, maxY = -Infinity;
		if (this.chains) {
			for ( let i = 0, ii = this.chains.length; i < ii; i++) {
				let chain = this.chains[i];
				for ( let j = 0, jj = chain.length; j < jj; j++) {
					let residue = chain[j];
					minX = m.min(residue.cp1.x, residue.cp2.x, minX);
					minY = m.min(residue.cp1.y, residue.cp2.y, minY);
					maxX = m.max(residue.cp1.x, residue.cp2.x, maxX);
					maxY = m.max(residue.cp1.y, residue.cp2.y, maxY);
				}
			}
			minX -= 30;
			minY -= 30;
			maxX += 30;
			maxY += 30;
		}
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			minX = m.min(this.atoms[i].x, minX);
			minY = m.min(this.atoms[i].y, minY);
			maxX = m.max(this.atoms[i].x, maxX);
			maxY = m.max(this.atoms[i].y, maxY);
		}
		return new structures.Point(maxX - minX, maxY - minY);
	};
	_.check = function(force) {
		// using force improves efficiency, so changes will not be checked
		// until a render occurs
		// you can force a check by sending true to this function after
		// calling check with a false
		if (force && this.doChecks) {
			// only check if the number of bonds has changed
			if (this.findRings) {
				if (this.bonds.length - this.atoms.length !== this.fjNumCache) {
					// find rings
					this.rings = new c.informatics.SSSRFinder(this).rings;
					for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
						this.bonds[i].ring = undefined;
					}
					for ( let i = 0, ii = this.rings.length; i < ii; i++) {
						this.rings[i].setupBonds();
					}
				} else {
					// update rings if any
					for ( let i = 0, ii = this.rings.length; i < ii; i++) {
						let r = this.rings[i];
						r.center = r.getCenter();
					}
				}
			}
			// find lones
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				this.atoms[i].isLone = false;
				if (this.atoms[i].label === 'C') {
					let counter = 0;
					for ( let j = 0, jj = this.bonds.length; j < jj; j++) {
						if (this.bonds[j].a1 === this.atoms[i] || this.bonds[j].a2 === this.atoms[i]) {
							counter++;
						}
					}
					if (counter === 0) {
						this.atoms[i].isLone = true;
					}
				}
			}
			// sort
			let sort = false;
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				if (this.atoms[i].z !== 0) {
					sort = true;
				}
			}
			if (sort) {
				this.sortAtomsByZ();
				this.sortBondsByZ();
			}
			// setup metadata
			this.setupMetaData();
			this.atomNumCache = this.atoms.length;
			this.bondNumCache = this.bonds.length;
			// fj number cache doesnt care if there are separate molecules,
			// as the change will signal a need to check for rings; the
			// accuracy doesn't matter
			this.fjNumCache = this.bonds.length - this.atoms.length;
		}
		this.doChecks = !force;
	};
	_.getAngles = function(a) {
		let angles = [];
		for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
			if (this.bonds[i].contains(a)) {
				angles.push(a.angle(this.bonds[i].getNeighbor(a)));
			}
		}
		angles.sort(function(a, b) {
			return a - b;
		});
		return angles;
	};
	_.getCoordinationNumber = function(bs) {
		let coordinationNumber = 0;
		for ( let i = 0, ii = bs.length; i < ii; i++) {
			coordinationNumber += bs[i].bondOrder;
		}
		return coordinationNumber;
	};
	_.getBonds = function(a) {
		let bonds = [];
		for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
			if (this.bonds[i].contains(a)) {
				bonds.push(this.bonds[i]);
			}
		}
		return bonds;
	};
	_.sortAtomsByZ = function() {
		for ( let i = 1, ii = this.atoms.length; i < ii; i++) {
			let index = i;
			while (index > 0 && this.atoms[index].z < this.atoms[index - 1].z) {
				let hold = this.atoms[index];
				this.atoms[index] = this.atoms[index - 1];
				this.atoms[index - 1] = hold;
				index--;
			}
		}
	};
	_.sortBondsByZ = function() {
		for ( let i = 1, ii = this.bonds.length; i < ii; i++) {
			let index = i;
			while (index > 0 && (this.bonds[index].a1.z + this.bonds[index].a2.z) < (this.bonds[index - 1].a1.z + this.bonds[index - 1].a2.z)) {
				let hold = this.bonds[index];
				this.bonds[index] = this.bonds[index - 1];
				this.bonds[index - 1] = hold;
				index--;
			}
		}
	};
	_.setupMetaData = function() {
		let center = this.getCenter();
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			let a = this.atoms[i];
			a.bonds = this.getBonds(a);
			a.angles = this.getAngles(a);
			a.isHidden = a.bonds.length === 2 && m.abs(m.abs(a.angles[1] - a.angles[0]) - m.PI) < m.PI / 30 && a.bonds[0].bondOrder === a.bonds[1].bondOrder;
			let angleData = math.angleBetweenLargest(a.angles);
			a.angleOfLeastInterference = angleData.angle % (m.PI * 2);
			a.largestAngle = angleData.largest;
			a.coordinationNumber = this.getCoordinationNumber(a.bonds);
			a.bondNumber = a.bonds.length;
			a.molCenter = center;
		}
		for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
			let b = this.bonds[i];
			b.molCenter = center;
		}
	};
	_.scaleToAverageBondLength = function(length) {
		let avBondLength = this.getAverageBondLength();
		if (avBondLength !== 0) {
			let scale = length / avBondLength;
			for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
				this.atoms[i].x *= scale;
				this.atoms[i].y *= scale;
			}
		}
	};
	_.getAverageBondLength = function() {
		if (this.bonds.length === 0) {
			return 0;
		}
		let tot = 0;
		for ( let i = 0, ii = this.bonds.length; i < ii; i++) {
			tot += this.bonds[i].getLength();
		}
		tot /= this.bonds.length;
		return tot;
	};
	_.getBounds = function() {
		let bounds = new math.Bounds();
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			bounds.expand(this.atoms[i].getBounds());
		}
		if (this.chains) {
			for ( let i = 0, ii = this.chains.length; i < ii; i++) {
				let chain = this.chains[i];
				for ( let j = 0, jj = chain.length; j < jj; j++) {
					let residue = chain[j];
					bounds.expand(residue.cp1.x, residue.cp1.y);
					bounds.expand(residue.cp2.x, residue.cp2.y);
				}
			}
			bounds.minX -= 30;
			bounds.minY -= 30;
			bounds.maxX += 30;
			bounds.maxY += 30;
		}
		return bounds;
	};
	_.getBounds3D = function() {
		let bounds = new math.Bounds();
		for ( let i = 0, ii = this.atoms.length; i < ii; i++) {
			bounds.expand(this.atoms[i].getBounds3D());
		}
		if (this.chains) {
			for ( let i = 0, ii = this.chains.length; i < ii; i++) {
				let chain = this.chains[i];
				for ( let j = 0, jj = chain.length; j < jj; j++) {
					let residue = chain[j];
					bounds.expand3D(residue.cp1.x, residue.cp1.y, residue.cp1.z);
					bounds.expand3D(residue.cp2.x, residue.cp2.y, residue.cp2.z);
				}
			}
		}
		return bounds;
	};
	_.getAtomGroup = function(a) {
		let ring = false;
		for(let i = 0, ii = this.atoms.length; i<ii; i++){
			this.atoms[i].visited = false;
		}
		for(let i = 0, ii = this.bonds.length; i<ii; i++){
			let b = this.bonds[i];
			if(!ring && b.contains(a) && b.ring!==undefined){
				ring = true;
			}
		}
		if(!ring){
			return undefined;
		}
		let set = [a];
		a.visited = true;
		let q = new structures.Queue();
		q.enqueue(a);
		while (!q.isEmpty()) {
			let atom = q.dequeue();
			for(let i = 0, ii = this.bonds.length; i<ii; i++){
				let b = this.bonds[i];
				if(b.contains(atom) && ring===(b.ring!==undefined)){
					let n = b.getNeighbor(atom);
					if(!n.visited){
						n.visited = true;
						set.push(n);
						q.enqueue(n);
					}
				}
			}
		}
		return set;
	};
	_.getBondGroup = function(b) {
		let ring = b.ring!==undefined;
		let contained = false;
		for(let i = 0, ii = this.bonds.length; i<ii; i++){
			let bi = this.bonds[i];
			if(bi===b){
				contained = true;
			}
			bi.visited = false;
		}
		if(!contained){
			// this bond isn't part of the molecule
			return undefined;
		}
		let set = [b];
		b.visited = true;
		let q = new structures.Queue();
		q.enqueue(b);
		while (!q.isEmpty()) {
			let bond = q.dequeue();
			for(let i = 0, ii = this.bonds.length; i<ii; i++){
				let n = this.bonds[i];
				if(!n.visited && (n.a1===bond.a1||n.a2===bond.a1||n.a1===bond.a2||n.a2===bond.a2) && (n.ring!==undefined)===ring){
					n.visited = true;
					set.push(n);
					q.enqueue(n);
				}
			}
		}
		return set;
	};

})(ChemDoodle, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.RESIDUE, Math);

(function(structures, m, m4, v3, undefined) {
	'use strict';
	let SB;
	let lastVerticalResolution = -1;

	function setupMatrices(verticalResolution) {
		let n2 = verticalResolution * verticalResolution;
		let n3 = verticalResolution * verticalResolution * verticalResolution;
		let S = [ 6 / n3, 0, 0, 0, 6 / n3, 2 / n2, 0, 0, 1 / n3, 1 / n2, 1 / verticalResolution, 0, 0, 0, 0, 1 ];
		let Bm = [ -1 / 6, 1 / 2, -1 / 2, 1 / 6, 1 / 2, -1, 1 / 2, 0, -1 / 2, 0, 1 / 2, 0, 1 / 6, 2 / 3, 1 / 6, 0 ];
		SB = m4.multiply(Bm, S, []);
		lastVerticalResolution = verticalResolution;
	}

	structures.Residue = function(resSeq) {
		// number of vertical slashes per segment
		this.resSeq = resSeq;
	};
	let _ = structures.Residue.prototype;
	_.setup = function(nextAlpha, horizontalResolution) {
		this.horizontalResolution = horizontalResolution;
		// define plane
		let A = [ nextAlpha.x - this.cp1.x, nextAlpha.y - this.cp1.y, nextAlpha.z - this.cp1.z ];
		let B = [ this.cp2.x - this.cp1.x, this.cp2.y - this.cp1.y, this.cp2.z - this.cp1.z ];
		let C = v3.cross(A, B, []);
		this.D = v3.cross(C, A, []);
		v3.normalize(C);
		v3.normalize(this.D);
		// generate guide coordinates
		// guides for the narrow parts of the ribbons
		this.guidePointsSmall = [];
		// guides for the wide parts of the ribbons
		this.guidePointsLarge = [];
		// guides for the ribbon part of helix as cylinder model
		let P = [ (nextAlpha.x + this.cp1.x) / 2, (nextAlpha.y + this.cp1.y) / 2, (nextAlpha.z + this.cp1.z) / 2 ];
		if (this.helix) {
			// expand helices
			v3.scale(C, 1.5);
			v3.add(P, C);
		}
		this.guidePointsSmall[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
		for ( let i = 1; i < horizontalResolution; i++) {
			this.guidePointsSmall[i] = new structures.Atom('', this.guidePointsSmall[0].x + this.D[0] * i / horizontalResolution, this.guidePointsSmall[0].y + this.D[1] * i / horizontalResolution, this.guidePointsSmall[0].z + this.D[2] * i / horizontalResolution);
		}
		v3.scale(this.D, 4);
		this.guidePointsLarge[0] = new structures.Atom('', P[0] - this.D[0] / 2, P[1] - this.D[1] / 2, P[2] - this.D[2] / 2);
		for ( let i = 1; i < horizontalResolution; i++) {
			this.guidePointsLarge[i] = new structures.Atom('', this.guidePointsLarge[0].x + this.D[0] * i / horizontalResolution, this.guidePointsLarge[0].y + this.D[1] * i / horizontalResolution, this.guidePointsLarge[0].z + this.D[2] * i / horizontalResolution);
		}
	};
	_.getGuidePointSet = function(type) {
		if (type === 0) {
			return this.helix || this.sheet ? this.guidePointsLarge : this.guidePointsSmall;
		} else if (type === 1) {
			return this.guidePointsSmall;
		} else if (type === 2) {
			return this.guidePointsLarge;
		}
	};
	_.computeLineSegments = function(b2, b1, a1, doCartoon, verticalResolution) {
		this.setVerticalResolution(verticalResolution);
		this.split = a1.helix !== this.helix || a1.sheet !== this.sheet;
		this.lineSegments = this.innerCompute(0, b2, b1, a1, false, verticalResolution);
		if (doCartoon) {
			this.lineSegmentsCartoon = this.innerCompute(this.helix || this.sheet ? 2 : 1, b2, b1, a1, true, verticalResolution);
		}
	};
	_.innerCompute = function(set, b2, b1, a1, useArrows, verticalResolution) {
		let segments = [];
		let use = this.getGuidePointSet(set);
		let useb2 = b2.getGuidePointSet(set);
		let useb1 = b1.getGuidePointSet(set);
		let usea1 = a1.getGuidePointSet(set);
		for ( let l = 0, ll = use.length; l < ll; l++) {
			let G = [ useb2[l].x, useb2[l].y, useb2[l].z, 1, useb1[l].x, useb1[l].y, useb1[l].z, 1, use[l].x, use[l].y, use[l].z, 1, usea1[l].x, usea1[l].y, usea1[l].z, 1 ];
			let M = m4.multiply(G, SB, []);
			let strand = [];
			for ( let k = 0; k < verticalResolution; k++) {
				for ( let i = 3; i > 0; i--) {
					for ( let j = 0; j < 4; j++) {
						M[i * 4 + j] += M[(i - 1) * 4 + j];
					}
				}
				strand[k] = new structures.Atom('', M[12] / M[15], M[13] / M[15], M[14] / M[15]);
			}
			segments[l] = strand;
		}
		if (useArrows && this.arrow) {
			for ( let i = 0, ii = verticalResolution; i < ii; i++) {
				let mult = 1.5 - 1.3 * i / verticalResolution;
				let mid = m.floor(this.horizontalResolution / 2);
				let center = segments[mid];
				for ( let j = 0, jj = segments.length; j < jj; j++) {
					if (j !== mid) {
						let o = center[i];
						let f = segments[j][i];
						let vec = [ f.x - o.x, f.y - o.y, f.z - o.z ];
						v3.scale(vec, mult);
						f.x = o.x + vec[0];
						f.y = o.y + vec[1];
						f.z = o.z + vec[2];
					}
				}
			}
		}
		return segments;
	};
	_.setVerticalResolution = function(verticalResolution) {
		if (verticalResolution !== lastVerticalResolution) {
			setupMatrices(verticalResolution);
		}
	};

})(ChemDoodle.structures, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3);

(function(extensions, structures, math, m, undefined) {
	'use strict';
	structures.Spectrum = function() {
		this.data = [];
		this.metadata = [];
		this.dataDisplay = [];
		this.memory = {
			offsetTop : 0,
			offsetLeft : 0,
			offsetBottom : 0,
			flipXAxis : false,
			scale : 1,
			width : 0,
			height : 0
		};
	};
	let _ = structures.Spectrum.prototype;
	_.title = undefined;
	_.xUnit = undefined;
	_.yUnit = undefined;
	_.continuous = true;
	_.integrationSensitivity = 0.01;
	_.draw = function(ctx, styles, width, height) {
		if (this.styles) {
			styles = this.styles;
		}
		let offsetTop = 5;
		let offsetLeft = 0;
		let offsetBottom = 0;
		// draw decorations
		ctx.fillStyle = styles.text_color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
		if (this.xUnit) {
			offsetBottom += styles.text_font_size;
			ctx.fillText(this.xUnit, width / 2, height - 2);
		}
		if (this.yUnit && styles.plots_showYAxis) {
			offsetLeft += styles.text_font_size;
			ctx.save();
			ctx.translate(styles.text_font_size, height / 2);
			ctx.rotate(-m.PI / 2);
			ctx.fillText(this.yUnit, 0, 0);
			ctx.restore();
		}
		if (this.title) {
			offsetTop += styles.text_font_size;
			ctx.fillText(this.title, width / 2, styles.text_font_size);
		}
		// draw ticks
		ctx.lineCap = 'square';
		offsetBottom += 5 + styles.text_font_size;
		if (styles.plots_showYAxis) {
			offsetLeft += 5 + ctx.measureText('1000').width;
		}
		if (styles.plots_showGrid) {
			ctx.strokeStyle = styles.plots_gridColor;
			ctx.lineWidth = styles.plots_gridLineWidth;
			ctx.strokeRect(offsetLeft, offsetTop, width - offsetLeft, height - offsetBottom - offsetTop);
		}
		ctx.textAlign = 'center';
		ctx.textBaseline = 'top';
		let span = this.maxX - this.minX;
		let t = span / 100;
		let major = .001;
		while (major < t || span / major > 25) {
			major *= 10;
		}
		let counter = 0;
		let overlapX = styles.plots_flipXAxis ? width : 0;
		for ( let i = m.round(this.minX / major) * major; i <= this.maxX; i += major / 2) {
			let x = this.getTransformedX(i, styles, width, offsetLeft);
			if (x > offsetLeft) {
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1;
				if (counter % 2 === 0) {
					ctx.beginPath();
					ctx.moveTo(x, height - offsetBottom);
					ctx.lineTo(x, height - offsetBottom + 2);
					ctx.stroke();
					let s = i.toFixed(5);
					while (s.charAt(s.length - 1) === '0') {
						s = s.substring(0, s.length - 1);
					}
					if (s.charAt(s.length - 1) === '.') {
						s = s.substring(0, s.length - 1);
					}
					// do this to avoid label overlap
					let numWidth = ctx.measureText(s).width;
					if (styles.plots_flipXAxis) {
						numWidth *= -1;
					}
					let ls = x - numWidth / 2;
					if (styles.plots_flipXAxis ? ls < overlapX : ls > overlapX) {
						ctx.fillText(s, x, height - offsetBottom + 2);
						overlapX = x + numWidth / 2;
					}
					if (styles.plots_showGrid) {
						ctx.strokeStyle = styles.plots_gridColor;
						ctx.lineWidth = styles.plots_gridLineWidth;
						ctx.beginPath();
						ctx.moveTo(x, height - offsetBottom);
						ctx.lineTo(x, offsetTop);
						ctx.stroke();
					}
				} else {
					ctx.beginPath();
					ctx.moveTo(x, height - offsetBottom);
					ctx.lineTo(x, height - offsetBottom + 2);
					ctx.stroke();
				}
			}
			counter++;
		}
		if (styles.plots_showYAxis || styles.plots_showGrid) {
			let spany = 1 / styles.scale;
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			for ( let i = 0; i <= 10; i++) {
				let yval = spany / 10 * i;
				let y = offsetTop + (height - offsetBottom - offsetTop) * (1 - yval * styles.scale);
				if (styles.plots_showGrid) {
					ctx.strokeStyle = styles.plots_gridColor;
					ctx.lineWidth = styles.plots_gridLineWidth;
					ctx.beginPath();
					ctx.moveTo(offsetLeft, y);
					ctx.lineTo(width, y);
					ctx.stroke();
				}
				if (styles.plots_showYAxis) {
					ctx.strokeStyle = 'black';
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(offsetLeft, y);
					ctx.lineTo(offsetLeft - 3, y);
					ctx.stroke();
					let val = yval * 100;
					let cutoff = m.max(0, 3 - m.floor(val).toString().length);
					let s = val.toFixed(cutoff);
					if (cutoff > 0) {
						while (s.charAt(s.length - 1) === '0') {
							s = s.substring(0, s.length - 1);
						}
					}
					if (s.charAt(s.length - 1) === '.') {
						s = s.substring(0, s.length - 1);
					}
					ctx.fillText(s, offsetLeft - 3, y);
				}
			}
		}
		// draw axes
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.beginPath();
		// draw x axis
		ctx.moveTo(width, height - offsetBottom);
		ctx.lineTo(offsetLeft, height - offsetBottom);
		// draw y axis
		if (styles.plots_showYAxis) {
			ctx.lineTo(offsetLeft, offsetTop);
		}
		ctx.stroke();
		// draw metadata
		if (this.dataDisplay.length > 0) {
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			let mcount = 0;
			for ( let i = 0, ii = this.dataDisplay.length; i < ii; i++) {
				if (this.dataDisplay[i].value) {
					ctx.fillText([ this.dataDisplay[i].display, ': ', this.dataDisplay[i].value ].join(''), offsetLeft + 10, offsetTop + 10 + mcount * (styles.text_font_size + 5));
					mcount++;
				} else if (this.dataDisplay[i].tag) {
					for ( let j = 0, jj = this.metadata.length; j < jj; j++) {
						if (this.metadata[j].startsWith(this.dataDisplay[i].tag)) {
							let draw = this.metadata[j];
							if (this.dataDisplay[i].display) {
								let index = this.metadata[j].indexOf('=');
								draw = [ this.dataDisplay[i].display, ': ', index > -1 ? this.metadata[j].substring(index + 2) : this.metadata[j] ].join('');
							}
							ctx.fillText(draw, offsetLeft + 10, offsetTop + 10 + mcount * (styles.text_font_size + 5));
							mcount++;
							break;
						}
					}
				}
			}
		}
		this.drawPlot(ctx, styles, width, height, offsetTop, offsetLeft, offsetBottom);
		this.memory.offsetTop = offsetTop;
		this.memory.offsetLeft = offsetLeft;
		this.memory.offsetBottom = offsetBottom;
		this.memory.flipXAxis = styles.plots_flipXAxis;
		this.memory.scale = styles.scale;
		this.memory.width = width;
		this.memory.height = height;
	};
	_.drawPlot = function(ctx, styles, width, height, offsetTop, offsetLeft, offsetBottom) {
		if (this.styles) {
			styles = this.styles;
		}
		ctx.strokeStyle = styles.plots_color;
		ctx.lineWidth = styles.plots_width;
		let integration = [];
		// clip the spectrum display bounds here to not draw over the axes
		// we do this because we want to continue drawing segments to their natural ends to be accurate, but don't want to see them past the display area
		ctx.save();
		ctx.rect(offsetLeft, offsetTop, width-offsetLeft, height-offsetBottom-offsetTop);
		ctx.clip();
		ctx.beginPath();
		if (this.continuous) {
			let started = false;
			let counter = 0;
			let stop = false;
			for ( let i = 0, ii = this.data.length; i < ii; i++) {
				let x = this.getTransformedX(this.data[i].x, styles, width, offsetLeft);
				let xnext;
				if (i < ii && !started && this.data[i+1]) {
					// see if you should render this first segment
					xnext = this.getTransformedX(this.data[i + 1].x, styles, width, offsetLeft);
				}
				// check xnext against undefined as it can be 0/1
				if (x >= offsetLeft && x < width || xnext !== undefined && xnext >= offsetLeft && xnext < width) {
					let y = this.getTransformedY(this.data[i].y, styles, height, offsetBottom, offsetTop);
					if (styles.plots_showIntegration && m.abs(this.data[i].y) > this.integrationSensitivity) {
						integration.push(new structures.Point(this.data[i].x, this.data[i].y));
					}
					if (!started) {
						ctx.moveTo(x, y);
						started = true;
					}
					ctx.lineTo(x, y);
					counter++;
					if (counter % 1000 === 0) {
						// segment the path to avoid crashing safari on mac os x
						ctx.stroke();
						ctx.beginPath();
						ctx.moveTo(x, y);
					}
					if (stop) {
						break;
					}
				} else if (started) {
					// render one more segment
					stop = true;
				}
			}
		} else {
			for ( let i = 0, ii = this.data.length; i < ii; i++) {
				let x = this.getTransformedX(this.data[i].x, styles, width, offsetLeft);
				if (x >= offsetLeft && x < width) {
					ctx.moveTo(x, height - offsetBottom);
					ctx.lineTo(x, this.getTransformedY(this.data[i].y, styles, height, offsetBottom, offsetTop));
				}
			}
		}
		ctx.stroke();
		if (styles.plots_showIntegration && integration.length > 1) {
			ctx.strokeStyle = styles.plots_integrationColor;
			ctx.lineWidth = styles.plots_integrationLineWidth;
			ctx.beginPath();
			let ascending = integration[1].x > integration[0].x;
			let max;
			if (this.flipXAxis && !ascending || !this.flipXAxis && ascending) {
				for ( let i = integration.length - 2; i >= 0; i--) {
					integration[i].y = integration[i].y + integration[i + 1].y;
				}
				max = integration[0].y;
			} else {
				for ( let i = 1, ii = integration.length; i < ii; i++) {
					integration[i].y = integration[i].y + integration[i - 1].y;
				}
				max = integration[integration.length - 1].y;
			}
			for ( let i = 0, ii = integration.length; i < ii; i++) {
				let x = this.getTransformedX(integration[i].x, styles, width, offsetLeft);
				let y = this.getTransformedY(integration[i].y / styles.scale / max, styles, height, offsetBottom, offsetTop);
				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.stroke();
		}
		ctx.restore();
	};
	_.getTransformedY = function(y, styles, height, offsetBottom, offsetTop) {
		return offsetTop + (height - offsetBottom - offsetTop) * (1 - y * styles.scale);
	};
	_.getInverseTransformedY = function(y) {
		// can only be called after a render when memory is set, this
		// function doesn't make sense without a render first anyway
		return (1 - (y - this.memory.offsetTop) / (this.memory.height - this.memory.offsetBottom - this.memory.offsetTop)) / this.memory.scale * 100;
	};
	_.getTransformedX = function(x, styles, width, offsetLeft) {
		let returning = offsetLeft + (x - this.minX) / (this.maxX - this.minX) * (width - offsetLeft);
		if (styles.plots_flipXAxis) {
			returning = width + offsetLeft - returning;
		}
		return returning;
	};
	_.getInverseTransformedX = function(x) {
		// can only be called after a render when memory is set, this
		// function doesn't make sense without a render first anyway
		if (this.memory.flipXAxis) {
			x = this.memory.width + this.memory.offsetLeft - x;
		}
		return (x - this.memory.offsetLeft) * (this.maxX - this.minX) / (this.memory.width - this.memory.offsetLeft) + this.minX;
	};
	_.setup = function() {
		let xmin = Number.MAX_VALUE;
		let xmax = Number.MIN_VALUE;
		let ymax = Number.MIN_VALUE;
		for ( let i = 0, ii = this.data.length; i < ii; i++) {
			xmin = m.min(xmin, this.data[i].x);
			xmax = m.max(xmax, this.data[i].x);
			ymax = m.max(ymax, this.data[i].y);
		}
		if (this.continuous) {
			this.minX = xmin;
			this.maxX = xmax;
		} else {
			this.minX = xmin - 1;
			this.maxX = xmax + 1;
		}
		for ( let i = 0, ii = this.data.length; i < ii; i++) {
			this.data[i].y /= ymax;
		}
	};
	_.zoom = function(pixel1, pixel2, width, rescaleY) {
		let p1 = this.getInverseTransformedX(pixel1);
		let p2 = this.getInverseTransformedX(pixel2);
		this.minX = m.min(p1, p2);
		this.maxX = m.max(p1, p2);
		if (rescaleY) {
			let ymax = Number.MIN_VALUE;
			for ( let i = 0, ii = this.data.length; i < ii; i++) {
				if (math.isBetween(this.data[i].x, this.minX, this.maxX)) {
					ymax = m.max(ymax, this.data[i].y);
				}
			}
			return 1 / ymax;
		}
	};
	_.translate = function(dif, width) {
		let dist = dif / (width - this.memory.offsetLeft) * (this.maxX - this.minX) * (this.memory.flipXAxis ? 1 : -1);
		this.minX += dist;
		this.maxX += dist;
	};
	_.alertMetadata = function() {
		alert(this.metadata.join('\n'));
	};
	_.getInternalCoordinates = function(x, y) {
		return new ChemDoodle.structures.Point(this.getInverseTransformedX(x), this.getInverseTransformedY(y));
	};
	_.getClosestPlotInternalCoordinates = function(x) {
		let xtl = this.getInverseTransformedX(x - 1);
		let xtr = this.getInverseTransformedX(x + 1);
		if (xtl > xtr) {
			let temp = xtl;
			xtl = xtr;
			xtr = temp;
		}
		let highest = -1;
		let max = -Infinity;
		let inRange = false;
		for ( let i = 0, ii = this.data.length; i < ii; i++) {
			let p = this.data[i];
			if (math.isBetween(p.x, xtl, xtr)) {
				if (p.y > max) {
					inRange = true;
					max = p.y;
					highest = i;
				}
			} else if (inRange) {
				break;
			}
		}
		if (highest === -1) {
			return undefined;
		}
		let p = this.data[highest];
		return new ChemDoodle.structures.Point(p.x, p.y * 100);
	};
	_.getClosestPeakInternalCoordinates = function(x) {
		let xt = this.getInverseTransformedX(x);
		let closest = 0;
		let dif = Infinity;
		for ( let i = 0, ii = this.data.length; i < ii; i++) {
			let sub = m.abs(this.data[i].x - xt);
			if (sub <= dif) {
				dif = sub;
				closest = i;
			} else {
				break;
			}
		}
		let highestLeft = closest, highestRight = closest;
		let maxLeft = this.data[closest].y, maxRight = this.data[closest].y;
		for ( let i = closest + 1, ii = this.data.length; i < ii; i++) {
			if (this.data[i].y + .05 > maxRight) {
				maxRight = this.data[i].y;
				highestRight = i;
			} else {
				break;
			}
		}
		for ( let i = closest - 1; i >= 0; i--) {
			if (this.data[i].y + .05 > maxLeft) {
				maxLeft = this.data[i].y;
				highestLeft = i;
			} else {
				break;
			}
		}
		let p = this.data[highestLeft - closest > highestRight - closest ? highestRight : highestLeft];
		return new ChemDoodle.structures.Point(p.x, p.y * 100);
	};

})(ChemDoodle.extensions, ChemDoodle.structures, ChemDoodle.math, Math);

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

})(ChemDoodle.math, ChemDoodle.structures.d2, Math);

(function(extensions, math, structures, d2, m, undefined) {
	'use strict';

	d2.AtomMapping = function(o1, o2) {
		// these need to be named 'o', not 'a' or the generic erase function won't work for them
		this.o1 = o1;
		this.o2 = o2;
		this.label = '0';
		this.error = false;
	};
	let _ = d2.AtomMapping.prototype = new d2._Shape();
	_.drawDecorations = function(ctx, styles) {
		if (this.isHover || this.isSelected) {
			ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(this.o1.x, this.o1.y);
			ctx.lineTo(this.o2.x, this.o2.y);
			ctx.setLineDash([2]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	};
	_.draw = function(ctx, styles) {
		if (this.o1 && this.o2) {
			let sep = 14;
			this.x1 = this.o1.x+sep*m.cos(this.o1.angleOfLeastInterference);
			this.y1 = this.o1.y-sep*m.sin(this.o1.angleOfLeastInterference);
			this.x2 = this.o2.x+sep*m.cos(this.o2.angleOfLeastInterference);
			this.y2 = this.o2.y-sep*m.sin(this.o2.angleOfLeastInterference);
			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
			let label = this.label;
			let w = ctx.measureText(label).width;
			if (this.isLassoed) {
				ctx.fillStyle = styles.colorHover;
				ctx.fillRect(this.x1-w/2-3, this.y1-styles.text_font_size/2-3, w+6, styles.text_font_size+6);
				ctx.fillRect(this.x2-w/2-3, this.y2-styles.text_font_size/2-3, w+6, styles.text_font_size+6);
			}
			let color = this.error?styles.colorError:styles.shapes_color;
			if (this.isHover || this.isSelected) {
				color = this.isHover ? styles.colorHover : styles.colorSelect;
			}
			ctx.fillStyle = color;
			ctx.fillRect(this.x1-w/2-1, this.y1-styles.text_font_size/2-1, w+2, styles.text_font_size+2);
			ctx.fillRect(this.x2-w/2-1, this.y2-styles.text_font_size/2-1, w+2, styles.text_font_size+2);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = styles.backgroundColor;
			ctx.fillText(label, this.x1, this.y1);
			ctx.fillText(label, this.x2, this.y2);
		}
	};
	_.getPoints = function() {
		return [new structures.Point(this.x1, this.y1), new structures.Point(this.x2, this.y2)];
	};
	_.isOver = function(p, barrier) {
		if(this.x1){
			return p.distance({x:this.x1, y:this.y1})<barrier || p.distance({x:this.x2, y:this.y2})<barrier;
		}
		return false;
	};

})(ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, Math);

(function(extensions, math, structures, d2, m, undefined) {
	'use strict';
	d2.Bracket = function(p1, p2) {
		this.p1 = p1 ? p1 : new structures.Point();
		this.p2 = p2 ? p2 : new structures.Point();
	};
	let _ = d2.Bracket.prototype = new d2._Shape();
	_.charge = 0;
	_.mult = 0;
	_.repeat = 0;
	_.draw = function(ctx, styles) {
		let minX = m.min(this.p1.x, this.p2.x);
		let maxX = m.max(this.p1.x, this.p2.x);
		let minY = m.min(this.p1.y, this.p2.y);
		let maxY = m.max(this.p1.y, this.p2.y);
		let h = maxY - minY;
		let lip = h / 10;
		ctx.beginPath();
		ctx.moveTo(minX + lip, minY);
		ctx.lineTo(minX, minY);
		ctx.lineTo(minX, maxY);
		ctx.lineTo(minX + lip, maxY);
		ctx.moveTo(maxX - lip, maxY);
		ctx.lineTo(maxX, maxY);
		ctx.lineTo(maxX, minY);
		ctx.lineTo(maxX - lip, minY);
		if (this.isLassoed) {
			let grd = ctx.createLinearGradient(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
			grd.addColorStop(0, 'rgba(212, 99, 0, 0)');
			grd.addColorStop(0.5, 'rgba(212, 99, 0, 0.8)');
			grd.addColorStop(1, 'rgba(212, 99, 0, 0)');
			ctx.lineWidth = styles.shapes_lineWidth + 5;
			ctx.strokeStyle = grd;
			ctx.lineJoin = 'miter';
			ctx.lineCap = 'square';
			ctx.stroke();
		}
		ctx.strokeStyle = styles.shapes_color;
		ctx.lineWidth = styles.shapes_lineWidth;
		ctx.lineJoin = 'miter';
		ctx.lineCap = 'butt';
		ctx.stroke();
		if (this.charge !== 0) {
			ctx.fillStyle = styles.text_color;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'alphabetic';
			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
			let s = this.charge.toFixed(0);
			if (s === '1') {
				s = '+';
			} else if (s === '-1') {
				s = '\u2013';
			} else if (s.startsWith('-')) {
				s = s.substring(1) + '\u2013';
			} else {
				s += '+';
			}
			ctx.fillText(s, maxX + 5, minY + 5);
		}
		if (this.mult !== 0) {
			ctx.fillStyle = styles.text_color;
			ctx.textAlign = 'right';
			ctx.textBaseline = 'middle';
			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
			ctx.fillText(this.mult.toFixed(0), minX - 5, minY + h / 2);
		}
		if (this.repeat !== 0) {
			ctx.fillStyle = styles.text_color;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
			let s = this.repeat.toFixed(0);
			ctx.fillText(s, maxX + 5, maxY - 5);
		}
	};
	_.getPoints = function() {
		return [ this.p1, this.p2 ];
	};
	_.isOver = function(p, barrier) {
		return math.isBetween(p.x, this.p1.x, this.p2.x) && math.isBetween(p.y, this.p1.y, this.p2.y);
	};

})(ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, Math);

(function(extensions, math, jsb, structures, d2, m, undefined) {
	'use strict';

	d2.DynamicBracket = function(b1, b2) {
		this.b1 = b1;
		this.b2 = b2;
		this.n1 = 1;
		this.n2 = 4;
		this.contents = [];
		this.ps = [];
	};
	let _ = d2.DynamicBracket.prototype = new d2._Shape();
	_.drawDecorations = function(ctx, styles) {
		if (this.isHover) {
			for(let i = 0, ii = this.contents.length; i<ii; i++){
				let a = this.contents[i];
				let grd = ctx.createRadialGradient(a.x - 1, a.y - 1, 0, a.x, a.y, 7);
				grd.addColorStop(0, 'rgba(212, 99, 0, 0)');
				grd.addColorStop(0.7, 'rgba(212, 99, 0, 0.8)');
				ctx.fillStyle = grd;
				ctx.beginPath();
				ctx.arc(a.x, a.y, 5, 0, m.PI * 2, false);
				ctx.fill();
			}
		}
	};
	let drawEnd = function(ctx, styles, b, b2, contents) {
		let ps = [];
		let stretch = 10;
		let arm = 4;
		let a = contents.length>0?(contents.indexOf(b.a1)===-1?b.a2:b.a1):(b.a1.distance(b2.getCenter())<b.a2.distance(b2.getCenter())?b.a1:b.a2);
		let angle = a.angle(b.getNeighbor(a));
		let perp = angle+m.PI/2;
		let length = b.getLength()/(contents.length>1?4:2);
		let psx = a.x+length*m.cos(angle);
		let psy = a.y-length*m.sin(angle);
		let scos = stretch*m.cos(perp);
		let ssin = stretch*m.sin(perp);
		let p1x = psx+scos;
		let p1y = psy-ssin;
		let p2x = psx-scos;
		let p2y = psy+ssin;
		let acos = -arm*m.cos(angle);
		let asin = -arm*m.sin(angle);
		let p1ax = p1x+acos;
		let p1ay = p1y-asin;
		let p2ax = p2x+acos;
		let p2ay = p2y-asin;
		ctx.beginPath();
		ctx.moveTo(p1ax, p1ay);
		ctx.lineTo(p1x, p1y);
		ctx.lineTo(p2x, p2y);
		ctx.lineTo(p2ax, p2ay);
		ctx.stroke();
		ps.push(new structures.Point(p1x, p1y));
		ps.push(new structures.Point(p2x, p2y));
		return ps;
	};
	_.draw = function(ctx, styles) {
		if (this.b1 && this.b2) {
			let color = this.error?styles.colorError:styles.shapes_color;
			if (this.isHover || this.isSelected) {
				color = this.isHover ? styles.colorHover : styles.colorSelect;
			}
			ctx.strokeStyle = color;
			ctx.fillStyle = ctx.strokeStyle;
			ctx.lineWidth = styles.shapes_lineWidth;
			ctx.lineJoin = 'miter';
			ctx.lineCap = 'butt';
			let ps1 = drawEnd(ctx, styles, this.b1, this.b2, this.contents);
			let ps2 = drawEnd(ctx, styles, this.b2, this.b1, this.contents);
			this.ps = ps1.concat(ps2);
			if(this.b1.getCenter().x>this.b2.getCenter().x){
				if(this.ps[0].x>this.ps[1].x+5){
					this.textPos = this.ps[0];
				}else{
					this.textPos = this.ps[1];
				}
			}else{
				if(this.ps[2].x>this.ps[3].x+5){
					this.textPos = this.ps[2];
				}else{
					this.textPos = this.ps[3];
				}
			}
			if(!this.error && this.contents.length>0){
				ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic);
				ctx.fillStyle = this.isHover?styles.colorHover:styles.text_color;
				ctx.textAlign = 'left';
				ctx.textBaseline = 'bottom';
				ctx.fillText(this.n1+'-'+this.n2, this.textPos.x+2, this.textPos.y+2);
			}
		}
	};
	_.getPoints = function() {
		return this.ps;
	};
	_.isOver = function(p, barrier) {
		return false;
	};
	_.setContents = function(sketcher){
		this.contents = [];
		let m1 = sketcher.getMoleculeByAtom(this.b1.a1);
		let m2 = sketcher.getMoleculeByAtom(this.b2.a1);
		// make sure both b1 and b2 are part of the same molecule
		if(m1 && m1===m2){
			// if either b1 or b2 is in a ring, then stop, as this is a violation
			// unless b1 and b2 are part of the same ring and are part of no other rings
			let c1 = 0;
			let c2 = 0;
			for(let i = 0, ii = m1.rings.length; i<ii; i++){
				let r = m1.rings[i];
				for(let j = 0, jj = r.bonds.length; j<jj; j++){
					let rb = r.bonds[j];
					if(rb===this.b1){
						c1++;
					}else if(rb===this.b2){
						c2++;
					}
				}
			}
			let sameSingleRing = c1===1 && c2===1 && this.b1.ring===this.b2.ring;
			this.contents.flippable = sameSingleRing;
			if(this.b1.ring===undefined && this.b2.ring===undefined || sameSingleRing){
				for(let i = 0, ii = m1.atoms.length; i<ii; i++){
					let reached1 = false;
					let reached2 = false;
					let reachedInner = false;
					for (let j = 0, jj = m1.bonds.length; j<jj; j++) {
						m1.bonds[j].visited = false;
					}
					let q = new structures.Queue();
					let a = m1.atoms[i];
					q.enqueue(a);
					while (!q.isEmpty() && !(reached1 && reached2)) {
						let check = q.dequeue();
						if(sameSingleRing && (!this.flip && check===this.b1.a1 || this.flip && check===this.b1.a2)){
							reachedInner = true;
						}
						for (let j = 0, jj = m1.bonds.length; j<jj; j++) {
							let b = m1.bonds[j];
							if(b.a1===check || b.a2===check){
								if (b === this.b1) {
									reached1 = true;
								} else if (b === this.b2) {
									reached2 = true;
								} else if (!b.visited) {
									b.visited = true;
									q.enqueue(b.getNeighbor(check));
								}
							}
						}
					}
					if(reached1 && reached2 && (!sameSingleRing || reachedInner)){
						this.contents.push(a);
					}
				}
			}
		}
	};

})(ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.lib.jsBezier, ChemDoodle.structures, ChemDoodle.structures.d2, Math);

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
			if (this.arrowType === d2.Line.ARROW_RETROSYNTHETIC) {
				let r2 = m.sqrt(2) * 2;
				let useDist = styles.shapes_arrowLength_2D / r2;
				let angle = this.p1.angle(this.p2);
				let perpendicular = angle + m.PI / 2;
				let retract = styles.shapes_arrowLength_2D / r2;
				let mcosa = m.cos(angle);
				let msina = m.sin(angle);
				let mcosp = m.cos(perpendicular);
				let msinp = m.sin(perpendicular);
				let cx1 = this.p1.x - mcosp * useDist;
				let cy1 = this.p1.y + msinp * useDist;
				let cx2 = this.p1.x + mcosp * useDist;
				let cy2 = this.p1.y - msinp * useDist;
				let cx3 = this.p2.x + mcosp * useDist - mcosa * retract;
				let cy3 = this.p2.y - msinp * useDist + msina * retract;
				let cx4 = this.p2.x - mcosp * useDist - mcosa * retract;
				let cy4 = this.p2.y + msinp * useDist + msina * retract;
				let ax1 = this.p2.x + mcosp * useDist * 2 - mcosa * retract * 2;
				let ay1 = this.p2.y - msinp * useDist * 2 + msina * retract * 2;
				let ax2 = this.p2.x - mcosp * useDist * 2 - mcosa * retract * 2;
				let ay2 = this.p2.y + msinp * useDist * 2 + msina * retract * 2;
				ctx.beginPath();
				ctx.moveTo(cx2, cy2);
				ctx.lineTo(cx3, cy3);
				ctx.moveTo(ax1, ay1);
				ctx.lineTo(this.p2.x, this.p2.y);
				ctx.lineTo(ax2, ay2);
				ctx.moveTo(cx4, cy4);
				ctx.lineTo(cx1, cy1);
				ctx.stroke();
			} else if (this.arrowType === d2.Line.ARROW_EQUILIBRIUM) {
				let r2 = m.sqrt(2) * 2;
				let useDist = styles.shapes_arrowLength_2D / r2 / 2;
				let angle = this.p1.angle(this.p2);
				let perpendicular = angle + m.PI / 2;
				let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
				let mcosa = m.cos(angle);
				let msina = m.sin(angle);
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
				ctx.beginPath();
				ctx.moveTo(cx2, cy2);
				ctx.lineTo(cx3, cy3);
				ctx.moveTo(cx4, cy4);
				ctx.lineTo(cx1, cy1);
				ctx.stroke();
				// right arrow
				let rx1 = cx3 - mcosa * retract * .8;
				let ry1 = cy3 + msina * retract * .8;
				let ax1 = cx3 + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract;
				let ay1 = cy3 - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract;
				ctx.beginPath();
				ctx.moveTo(cx3, cy3);
				ctx.lineTo(ax1, ay1);
				ctx.lineTo(rx1, ry1);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				// left arrow
				rx1 = cx1 + mcosa * retract * .8;
				ry1 = cy1 - msina * retract * .8;
				ax1 = cx1 - mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
				ay1 = cy1 + msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
				ctx.beginPath();
				ctx.moveTo(cx1, cy1);
				ctx.lineTo(ax1, ay1);
				ctx.lineTo(rx1, ry1);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			} else if (this.arrowType === d2.Line.ARROW_SYNTHETIC) {
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
			} else if (this.arrowType === d2.Line.ARROW_RESONANCE) {
				let angle = this.p1.angle(this.p2);
				let perpendicular = angle + m.PI / 2;
				let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
				let mcosa = m.cos(angle);
				let msina = m.sin(angle);
				let mcosp = m.cos(perpendicular);
				let msinp = m.sin(perpendicular);
				ctx.beginPath();
				ctx.moveTo(this.p1.x + mcosa * retract / 2, this.p1.y - msina * retract / 2);
				ctx.lineTo(this.p2.x - mcosa * retract / 2, this.p2.y + msina * retract / 2);
				ctx.stroke();
				// right arrow
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
				// left arrow
				rx1 = this.p1.x + mcosa * retract * .8;
				ry1 = this.p1.y - msina * retract * .8;
				ax1 = this.p1.x - mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
				ay1 = this.p1.y + msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
				ax2 = this.p1.x + mcosp * styles.shapes_arrowLength_2D / 3 + mcosa * retract;
				ay2 = this.p1.y - msinp * styles.shapes_arrowLength_2D / 3 - msina * retract;
				ctx.beginPath();
				ctx.moveTo(this.p1.x, this.p1.y);
				ctx.lineTo(ax2, ay2);
				ctx.lineTo(rx1, ry1);
				ctx.lineTo(ax1, ay1);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			} else {
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

})(ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, Math);

(function(math, jsb, structures, d2, m, undefined) {
	'use strict';
	let getPossibleAngles = function(o) {
		let as = [];
		if (o instanceof structures.Atom) {
			if (o.bondNumber === 0) {
				as.push(m.PI);
			} else if (o.angles) {
				if (o.angles.length === 1) {
					as.push(o.angles[0] + m.PI);
				} else {
					for ( let i = 1, ii = o.angles.length; i < ii; i++) {
						as.push(o.angles[i - 1] + (o.angles[i] - o.angles[i - 1]) / 2);
					}
					let firstIncreased = o.angles[0] + m.PI * 2;
					let last = o.angles[o.angles.length - 1];
					as.push(last + (firstIncreased - last) / 2);
				}
				if (o.largestAngle > m.PI) {
					// always use angle of least interfearence if it is greater
					// than 120
					as = [ o.angleOfLeastInterference ];
				}
				if (o.bonds) {
					// point up towards a carbonyl
					for ( let i = 0, ii = o.bonds.length; i < ii; i++) {
						let b = o.bonds[i];
						if (b.bondOrder === 2) {
							let n = b.getNeighbor(o);
							if (n.label === 'O') {
								as = [ n.angle(o) ];
								break;
							}
						}
					}
				}
			}
		} else {
			let angle = o.a1.angle(o.a2);
			as.push(angle + m.PI / 2);
			as.push(angle + 3 * m.PI / 2);
		}
		for ( let i = 0, ii = as.length; i < ii; i++) {
			while (as[i] > m.PI * 2) {
				as[i] -= m.PI * 2;
			}
			while (as[i] < 0) {
				as[i] += m.PI * 2;
			}
		}
		return as;
	};
	let getPullBack = function(o, styles) {
		let pullback = 3;
		if (o instanceof structures.Atom) {
			if (o.isLabelVisible(styles)) {
				pullback = 8;
			}
			if (o.charge !== 0 || o.numRadical !== 0 || o.numLonePair !== 0) {
				pullback = 13;
			}
		} else if (o instanceof structures.Point) {
			// this is the midpoint of a bond forming pusher
			pullback = 0;
		} else {
			if (o.bondOrder > 1) {
				pullback = 5;
			}
		}
		return pullback;
	};
	let drawPusher = function(ctx, styles, o1, o2, p1, c1, c2, p2, numElectron, caches) {
		let angle1 = c1.angle(p1);
		let angle2 = c2.angle(p2);
		let mcosa = m.cos(angle1);
		let msina = m.sin(angle1);
		// pull back from start
		let pullBack = getPullBack(o1, styles);
		p1.x -= mcosa * pullBack;
		p1.y += msina * pullBack;
		// arrow
		let perpendicular = angle2 + m.PI / 2;
		let retract = styles.shapes_arrowLength_2D * 2 / m.sqrt(3);
		mcosa = m.cos(angle2);
		msina = m.sin(angle2);
		let mcosp = m.cos(perpendicular);
		let msinp = m.sin(perpendicular);
		p2.x -= mcosa * 5;
		p2.y += msina * 5;
		let nap = new structures.Point(p2.x, p2.y);
		// pull back from end
		pullBack = getPullBack(o2, styles) / 3;
		nap.x -= mcosa * pullBack;
		nap.y += msina * pullBack;
		p2.x -= mcosa * (retract * 0.8 + pullBack);
		p2.y += msina * (retract * 0.8 + pullBack);
		let rx1 = nap.x - mcosa * retract * 0.8;
		let ry1 = nap.y + msina * retract * 0.8;
		let a1 = new structures.Point(nap.x + mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract, nap.y - msinp * styles.shapes_arrowLength_2D / 3 + msina * retract);
		let a2 = new structures.Point(nap.x - mcosp * styles.shapes_arrowLength_2D / 3 - mcosa * retract, nap.y + msinp * styles.shapes_arrowLength_2D / 3 + msina * retract);
		let include1 = true, include2 = true;
		if (numElectron === 1) {
			if (a1.distance(c1) > a2.distance(c1)) {
				include2 = false;
			} else {
				include1 = false;
			}
		}
		ctx.beginPath();
		ctx.moveTo(nap.x, nap.y);
		if (include2) {
			ctx.lineTo(a2.x, a2.y);
		}
		ctx.lineTo(rx1, ry1);
		if (include1) {
			ctx.lineTo(a1.x, a1.y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		// bezier
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
		ctx.stroke();
		caches.push([ p1, c1, c2, p2 ]);
	};

	d2.Pusher = function(o1, o2, numElectron) {
		this.o1 = o1;
		this.o2 = o2;
		this.numElectron = numElectron ? numElectron : 1;
	};
	let _ = d2.Pusher.prototype = new d2._Shape();
	_.drawDecorations = function(ctx, styles) {
		if (this.isHover) {
			let p1 = this.o1 instanceof structures.Atom ? new structures.Point(this.o1.x, this.o1.y) : this.o1.getCenter();
			let p2 = this.o2 instanceof structures.Atom ? new structures.Point(this.o2.x, this.o2.y) : this.o2.getCenter();
			let ps = [ p1, p2 ];
			for ( let i = 0, ii = ps.length; i < ii; i++) {
				let p = ps[i];
				this.drawAnchor(ctx, styles, p, p === this.hoverPoint);
			}
		}
	};
	_.draw = function(ctx, styles) {
		if (this.o1 && this.o2) {
			ctx.strokeStyle = styles.shapes_color;
			ctx.fillStyle = styles.shapes_color;
			ctx.lineWidth = styles.shapes_lineWidth;
			ctx.lineJoin = 'miter';
			ctx.lineCap = 'butt';
			let p1 = this.o1 instanceof structures.Atom ? new structures.Point(this.o1.x, this.o1.y) : this.o1.getCenter();
			let p2 = this.o2 instanceof structures.Atom ? new structures.Point(this.o2.x, this.o2.y) : this.o2.getCenter();
			let controlDist = 35;
			let as1 = getPossibleAngles(this.o1);
			let as2 = getPossibleAngles(this.o2);
			let c1, c2;
			let minDif = Infinity;
			for ( let i = 0, ii = as1.length; i < ii; i++) {
				for ( let j = 0, jj = as2.length; j < jj; j++) {
					let c1c = new structures.Point(p1.x + controlDist * m.cos(as1[i]), p1.y - controlDist * m.sin(as1[i]));
					let c2c = new structures.Point(p2.x + controlDist * m.cos(as2[j]), p2.y - controlDist * m.sin(as2[j]));
					let dif = c1c.distance(c2c);
					if (dif < minDif) {
						minDif = dif;
						c1 = c1c;
						c2 = c2c;
					}
				}
			}
			this.caches = [];
			if (this.numElectron === -1) {
				let dist = p1.distance(p2)/2;
				let angle = p1.angle(p2);
				let perp = angle+m.PI/2;
				let mcosa = m.cos(angle);
				let msina = m.sin(angle);
				let m1 = new structures.Point(p1.x+(dist-1)*mcosa, p1.y-(dist-1)*msina);
				let cm1 = new structures.Point(m1.x+m.cos(perp+m.PI/6)*controlDist, m1.y - m.sin(perp+m.PI/6)*controlDist);
				let m2 = new structures.Point(p1.x+(dist+1)*mcosa, p1.y-(dist+1)*msina);
				let cm2 = new structures.Point(m2.x+m.cos(perp-m.PI/6)*controlDist, m2.y - m.sin(perp-m.PI/6)*controlDist);
				drawPusher(ctx, styles, this.o1, m1, p1, c1, cm1, m1, 1, this.caches);
				drawPusher(ctx, styles, this.o2, m2, p2, c2, cm2, m2, 1, this.caches);
			} else {
				if (math.intersectLines(p1.x, p1.y, c1.x, c1.y, p2.x, p2.y, c2.x, c2.y)) {
					let tmp = c1;
					c1 = c2;
					c2 = tmp;
				}
				// try to clean up problems, like loops
				let angle1 = c1.angle(p1);
				let angle2 = c2.angle(p2);
				let angleDif = (m.max(angle1, angle2) - m.min(angle1, angle2));
				if (m.abs(angleDif - m.PI) < .001 && this.o1.molCenter === this.o2.molCenter) {
					// in the case where the control tangents are parallel
					angle1 += m.PI / 2;
					angle2 -= m.PI / 2;
					c1.x = p1.x + controlDist * m.cos(angle1 + m.PI);
					c1.y = p1.y - controlDist * m.sin(angle1 + m.PI);
					c2.x = p2.x + controlDist * m.cos(angle2 + m.PI);
					c2.y = p2.y - controlDist * m.sin(angle2 + m.PI);
				}
				drawPusher(ctx, styles, this.o1, this.o2, p1, c1, c2, p2, this.numElectron, this.caches);
			}
		}
	};
	_.getPoints = function() {
		return [];
	};
	_.isOver = function(p, barrier) {
		for ( let i = 0, ii = this.caches.length; i < ii; i++) {
			let r = jsb.distanceFromCurve(p, this.caches[i]);
			if (r.distance < barrier) {
				return true;
			}
		}
		return false;
	};

})(ChemDoodle.math, ChemDoodle.lib.jsBezier, ChemDoodle.structures, ChemDoodle.structures.d2, Math);

(function(math, structures, d2, m, undefined) {
	'use strict';

	let BOND = new structures.Bond();

	d2.VAP = function(x, y) {
		this.asterisk = new structures.Atom('O', x, y);
		this.substituent;
		this.bondType = 1;
		this.attachments = [];
	};
	let _ = d2.VAP.prototype = new d2._Shape();
	_.drawDecorations = function(ctx, styles) {
		if (this.isHover || this.isSelected) {
			ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
			ctx.lineWidth = 1.2;
			let radius = 7;
			if(this.hoverBond){
				let pi2 = 2 * m.PI;
				let angle = (this.asterisk.angleForStupidCanvasArcs(this.hoverBond) + m.PI / 2) % pi2;
				ctx.strokeStyle = this.isHover ? styles.colorHover : styles.colorSelect;
				ctx.beginPath();
				let angleTo = (angle + m.PI) % pi2;
				angleTo = angleTo % (m.PI * 2);
				ctx.arc(this.asterisk.x, this.asterisk.y, radius, angle, angleTo, false);
				ctx.stroke();
				ctx.beginPath();
				angle += m.PI;
				angleTo = (angle + m.PI) % pi2;
				ctx.arc(this.hoverBond.x, this.hoverBond.y, radius, angle, angleTo, false);
				ctx.stroke();
			}else{
				ctx.beginPath();
				ctx.arc(this.asterisk.x, this.asterisk.y, radius, 0, m.PI * 2, false);
				ctx.stroke();
			}
		}
	};
	_.draw = function(ctx, styles) {
		// asterisk
		ctx.strokeStyle = this.error?styles.colorError:styles.shapes_color;
		ctx.lineWidth = 1;
		let length = 4;
		let sqrt3 = m.sqrt(3)/2;
		ctx.beginPath();
		ctx.moveTo(this.asterisk.x, this.asterisk.y-length);
		ctx.lineTo(this.asterisk.x, this.asterisk.y+length);
		ctx.moveTo(this.asterisk.x-sqrt3*length, this.asterisk.y-length/2);
		ctx.lineTo(this.asterisk.x+sqrt3*length, this.asterisk.y+length/2);
		ctx.moveTo(this.asterisk.x-sqrt3*length, this.asterisk.y+length/2);
		ctx.lineTo(this.asterisk.x+sqrt3*length, this.asterisk.y-length/2);
		ctx.stroke();
		this.asterisk.textBounds = [];
		this.asterisk.textBounds.push({
			x : this.asterisk.x - length,
			y : this.asterisk.y - length,
			w : length*2,
			h : length*2
		});
		let bcsave = styles.bonds_color;
		if(this.error){
			styles.bonds_color = styles.colorError;
		}
		BOND.a1 = this.asterisk;
		// substituent bond
		if(this.substituent){
			BOND.a2 = this.substituent;
			BOND.bondOrder = this.bondType;
			BOND.draw(ctx, styles);
		}
		// attachment bonds
		BOND.bondOrder = 0;
		if(!this.error){
			styles.bonds_color = styles.shapes_color;
		}
		for(let i = 0, ii = this.attachments.length; i<ii; i++){
			BOND.a2 = this.attachments[i];
			BOND.draw(ctx, styles);
		}
		styles.bonds_color = bcsave;
	};
	_.getPoints = function() {
		return [this.asterisk];
	};
	_.isOver = function(p, barrier) {
		return false;
	};

})(ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d2, Math);


(function(structures, extensions, m, undefined) {
	'use strict';
	structures.Plate = function(lanes) {
		this.lanes = new Array(lanes);
		for (let i = 0, ii = lanes; i < ii; i++) {
			this.lanes[i] = [];
		}
	};
	let _ = structures.Plate.prototype;
	_.sort = function() {
		for (let i = 0, ii = this.lanes.length; i < ii; i++) {
			this.lanes[i].sort(function(a, b) {
				return a - b;
			});
		}
	};
	_.draw = function(ctx, styles) {
		// Front and origin
		let width = ctx.canvas.width;
		let height = ctx.canvas.height;
		this.origin = 9 * height / 10;
		this.front = height / 10;
		this.laneLength = this.origin - this.front;
		ctx.strokeStyle = '#000000';
		ctx.beginPath();
		ctx.moveTo(0, this.front);
		ctx.lineTo(width, this.front);
		ctx.setLineDash([3]);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(0, this.origin);
		ctx.lineTo(width, this.origin);
		ctx.closePath();
		ctx.stroke();
		// Lanes
		for (let i = 0, ii = this.lanes.length; i < ii; i++) {
			let laneX = (i + 1) * width / (ii + 1);
			ctx.beginPath();
			ctx.moveTo(laneX, this.origin);
			ctx.lineTo(laneX, this.origin + 3);
			ctx.closePath();
			ctx.stroke();
			// Spots
			for (let s = 0, ss = this.lanes[i].length; s < ss; s++) {
				let spotY = this.origin - (this.laneLength * this.lanes[i][s].rf);
				switch (this.lanes[i][s].type) {
				case 'compact':
					ctx.beginPath();
					ctx.arc(laneX, spotY, 3, 0, 2 * m.PI, false);
					ctx.closePath();
					break;
				case 'expanded':
					ctx.beginPath();
					ctx.arc(laneX, spotY, 7, 0, 2 * m.PI, false);
					ctx.closePath();
					break;
				case 'trailing':
					// trailing
					break;
				case 'widened':
					extensions.contextEllipse(ctx, laneX - 18, spotY - 10, 36, 10);
					break;
				case 'cresent':
					ctx.beginPath();
					ctx.arc(laneX, spotY, 9, 0, m.PI, true);
					ctx.closePath();
					break;
				}
				switch (this.lanes[i][s].style) {
				case 'solid':
					ctx.fillStyle = '#000000';
					ctx.fill();
					break;
				case 'transparent':
					ctx.stroke();
					break;
				case 'gradient':
					// gradient
					break;
				}
			}
		}
	};

	structures.Plate.Spot = function(type, rf, style) {
		this.type = type;
		this.rf = rf;
		this.style = style ? style : 'solid';
	};

})(ChemDoodle.structures, ChemDoodle.extensions, Math);

(function (c, structures, m, JSON, Object, undefined) {
	'use strict';

	c.DEFAULT_STYLES = {
		// default canvas properties

		//backgroundColor:'#FFFFFF',
		scale:1,
		rotateAngle:0,
		lightDirection_3D:[-.1, -.1, -1],
		lightDiffuseColor_3D:'#FFFFFF',
		lightSpecularColor_3D:'#FFFFFF',
		projectionPerspective_3D:true,
		projectionPerspectiveVerticalFieldOfView_3D:45,
		projectionOrthoWidth_3D:40,
		projectionWidthHeightRatio_3D:undefined,
		projectionFrontCulling_3D:.1,
		projectionBackCulling_3D:10000,
		cullBackFace_3D:true,
		fog_mode_3D:0,
		fog_color_3D:'#000000',
		fog_start_3D:0,
		fog_end_3D:1,
		fog_density_3D:1,
		shadow_3D:false,
		shadow_intensity_3D:.85,
		flat_color_3D:false,
		antialias_3D:true,
		gammaCorrection_3D:2.2,
		colorHover:'#0060B2',
		colorSelect:'rgba(0,96,178,0.3)',
		colorError:'#c10000',
		colorPreview:'#cbcbcb',
        hoverLineWidth: 0.5,

		// 3D shaders
		// default ssao
		ssao_3D:false,
		ssao_kernel_radius:17,
		ssao_kernel_samples:32,
		ssao_power:1.0,
		// default outline 3D
		outline_3D:false,
		outline_thickness:1.0,
		outline_normal_threshold:0.85,
		outline_depth_threshold:0.1,
		// defult fxaa antialiasing
		fxaa_edgeThreshold:1.0 / 16.0,
		fxaa_edgeThresholdMin:1.0 / 12.0,
		fxaa_searchSteps:64,
		fxaa_searchThreshold:1.0 / 4.0,
		fxaa_subpixCap:1.0,
		fxaa_subpixTrim:0.0,

        // hover selection


		// default atom properties
		atoms_display:true,
		atoms_color:'#000000',
		atoms_font_size_2D:11,
		atoms_font_families_2D:['Helvetica', 'Arial', 'Dialog'],
		atoms_font_bold_2D:true,
		atoms_font_italic_2D:false,
        atoms_circles_2D:false,
		atoms_circleDiameter_2D:10,
		atoms_circleBorderWidth_2D:1,
		atoms_lonePairDistance_2D:8,
		atoms_lonePairSpread_2D:4,
		atoms_lonePairDiameter_2D:1,
        atoms_selectRadius:6,
		atoms_useJMOLColors:true,
		atoms_usePYMOLColors:false,
		atoms_HBlack_2D:true,
		atoms_implicitHydrogens_2D:true,
		atoms_displayTerminalCarbonLabels_2D:false,
		atoms_showHiddenCarbons_2D:true,
		atoms_showAttributedCarbons_2D:true,
		atoms_displayAllCarbonLabels_2D:false,
		atoms_resolution_3D:30,
		atoms_sphereDiameter_3D:.8,
		atoms_useVDWDiameters_3D:false,
		atoms_vdwMultiplier_3D:1,
		atoms_materialAmbientColor_3D:'#000000',
		atoms_materialSpecularColor_3D:'#555555',
		atoms_materialShininess_3D:32,
		atoms_nonBondedAsStars_3D:false,
		atoms_displayLabels_3D:false,

		// default bond properties
        bondLength_2D:20,
        angstromsPerBondLength:1.25,
		bonds_display:true,
		bonds_color:'#000000',
		bonds_width_2D:1.5,
		bonds_useAbsoluteSaturationWidths_2D:true,
		bonds_saturationWidth_2D:.2,
		bonds_saturationWidthAbs_2D:5,
		bonds_ends_2D:'round',
		bonds_splitColor:false,
		bonds_colorGradient:false,
		bonds_saturationAngle_2D:m.PI / 3,
		bonds_symmetrical_2D:false,
		bonds_clearOverlaps_2D:false,
		bonds_overlapClearWidth_2D:.5,
		bonds_atomLabelBuffer_2D:1,
		bonds_wedgeThickness_2D:6,
		bonds_wavyLength_2D:4,
		bonds_hashWidth_2D:1,
		bonds_hashSpacing_2D:2.5,
		bonds_dotSize_2D:2,
		bonds_lewisStyle_2D:false,
		bonds_showBondOrders_3D:false,
		bonds_resolution_3D:30,
		bonds_renderAsLines_3D:false,
		bonds_cylinderDiameter_3D:.3,
		bonds_pillLatitudeResolution_3D:10,
		bonds_pillLongitudeResolution_3D:20,
		bonds_pillHeight_3D:.3,
		bonds_pillSpacing_3D:.1,
		bonds_pillDiameter_3D:.3,
		bonds_materialAmbientColor_3D:'#000000',
		bonds_materialSpecularColor_3D:'#555555',
		bonds_materialShininess_3D:32,

		// default macromolecular properties
		proteins_displayRibbon:true,
		proteins_displayBackbone:false,
		proteins_backboneThickness:1.5,
		proteins_backboneColor:'#CCCCCC',
		proteins_ribbonCartoonize:false,
		proteins_displayPipePlank:false,
		// shapely, amino, polarity, rainbow, acidity
		proteins_residueColor:'none',
		proteins_primaryColor:'#FF0D0D',
		proteins_secondaryColor:'#FFFF30',
		proteins_ribbonCartoonHelixPrimaryColor:'#00E740',
		proteins_ribbonCartoonHelixSecondaryColor:'#9905FF',
		proteins_ribbonCartoonSheetColor:'#E8BB99',
		proteins_tubeColor:'#FF0D0D',
		proteins_tubeResolution_3D:15,
		proteins_ribbonThickness:.2,
		proteins_tubeThickness:0.5,
		proteins_plankSheetWidth:3.5,
		proteins_cylinderHelixDiameter:4,
		proteins_verticalResolution:8,
		proteins_horizontalResolution:8,
		proteins_materialAmbientColor_3D:'#000000',
		proteins_materialSpecularColor_3D:'#555555',
		proteins_materialShininess_3D:32,
		nucleics_display:true,
		nucleics_tubeColor:'#CCCCCC',
		nucleics_baseColor:'#C10000',
		// shapely, rainbow
		nucleics_residueColor:'none',
		nucleics_tubeThickness:1.5,
		nucleics_tubeResolution_3D:15,
		nucleics_verticalResolution:8,
		nucleics_materialAmbientColor_3D:'#000000',
		nucleics_materialSpecularColor_3D:'#555555',
		nucleics_materialShininess_3D:32,
		macro_displayAtoms:false,
		macro_displayBonds:false,
		macro_atomToLigandDistance:-1,
		macro_showWater:false,
		macro_colorByChain:false,
		macro_rainbowColors:['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],

		// default surface properties
		surfaces_display:true,
		surfaces_alpha:.5,
		surfaces_style:'Solid',
		surfaces_color:'white',
		surfaces_materialAmbientColor_3D:'#000000',
		surfaces_materialSpecularColor_3D:'#000000',
		surfaces_materialShininess_3D:32,

		// default spectrum properties
		plots_color:'#000000',
		plots_width:1,
		plots_showIntegration:false,
		plots_integrationColor:'#c10000',
		plots_integrationLineWidth:1,
		plots_showGrid:false,
		plots_gridColor:'gray',
		plots_gridLineWidth:.5,
		plots_showYAxis:true,
		plots_flipXAxis:false,

		// default shape properties
		text_font_size:12,
		text_font_families:['Helvetica', 'Arial', 'Dialog'],
		text_font_bold:true,
		text_font_italic:false,
		text_font_stroke_3D:true,
		text_color:'#000000',
		shapes_color:'#000000',
		shapes_lineWidth:1,
		shapes_pointSize:2,
		shapes_arrowLength_2D:4,
		compass_display:false,
		compass_axisXColor_3D:'#FF0000',
		compass_axisYColor_3D:'#00FF00',
		compass_axisZColor_3D:'#0000FF',
		compass_size_3D:50,
		compass_resolution_3D:10,
		compass_displayText_3D:true,
		compass_type_3D:0,
		measurement_update_3D:false,
		measurement_angleBands_3D:10,
		measurement_displayText_3D:true
	}

	structures.Styles = function (copy) {
		// use json for a copy of arrays without assigning the same pointers from DEFAULT_STYLES
		Object.assign(this, JSON.parse(JSON.stringify(copy===undefined?c.DEFAULT_STYLES:copy)));
	};
	let _ = structures.Styles.prototype;
	_.set3DRepresentation = function (representation) {
		this.atoms_display = true;
		this.bonds_display = true;
		this.bonds_color = '#777777';
		this.atoms_useVDWDiameters_3D = true;
		this.atoms_useJMOLColors = true;
		this.bonds_splitColor = true;
		this.bonds_showBondOrders_3D = true;
		this.bonds_renderAsLines_3D = false;
		if (representation === 'Ball and Stick') {
			this.atoms_vdwMultiplier_3D = .3;
			this.bonds_splitColor = false;
			this.bonds_cylinderDiameter_3D = .3;
			this.bonds_materialAmbientColor_3D = ChemDoodle.DEFAULT_STYLES.atoms_materialAmbientColor_3D;
			this.bonds_pillDiameter_3D = .15;
		} else if (representation === 'van der Waals Spheres') {
			this.bonds_display = false;
			this.atoms_vdwMultiplier_3D = 1;
		} else if (representation === 'Stick') {
			this.atoms_useVDWDiameters_3D = false;
			this.bonds_showBondOrders_3D = false;
			this.bonds_cylinderDiameter_3D = this.atoms_sphereDiameter_3D = .8;
			this.bonds_materialAmbientColor_3D = this.atoms_materialAmbientColor_3D;
		} else if (representation === 'Wireframe') {
			this.atoms_useVDWDiameters_3D = false;
			this.bonds_cylinderDiameter_3D = this.bonds_pillDiameter_3D = .05;
			this.atoms_sphereDiameter_3D = .15;
			this.bonds_materialAmbientColor_3D = ChemDoodle.DEFAULT_STYLES.atoms_materialAmbientColor_3D;
		} else if (representation === 'Line') {
			this.atoms_display = false;
			this.bonds_renderAsLines_3D = true;
			this.bonds_width_2D = 1;
			this.bonds_cylinderDiameter_3D = .05;
		} else {
			alert('"' + representation + '" is not recognized. Use one of the following strings:\n\n' + '1. Ball and Stick\n' + '2. van der Waals Spheres\n' + '3. Stick\n' + '4. Wireframe\n' + '5. Line\n');
		}
	};
	_.copy = function () {
		return new structures.Styles(this);
	};

})(ChemDoodle, ChemDoodle.structures, Math, JSON, Object);
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

})(ChemDoodle, ChemDoodle.ELEMENT, ChemDoodle.informatics, ChemDoodle.structures);
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

})(ChemDoodle.informatics, ChemDoodle.structures);
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

})(ChemDoodle.informatics, ChemDoodle.structures);
(function(informatics, io, structures, undefined) {
	'use strict';
	informatics.StructureBuilder = function() {
	};
	let _ = informatics.StructureBuilder.prototype;
	_.copy = function(molecule) {
		let json = new io.JSONInterpreter();
		return json.molFrom(json.molTo(molecule));
	};

})(ChemDoodle.informatics, ChemDoodle.io, ChemDoodle.structures);
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
})(ChemDoodle.informatics);
(function(informatics, undefined) {
	'use strict';
	informatics.FrerejacqueNumberCounter = function(molecule) {
		this.setMolecule(molecule);
	};
	let _ = informatics.FrerejacqueNumberCounter.prototype = new informatics._Counter();
	_.innerCalculate = function() {
		this.value = this.molecule.bonds.length - this.molecule.atoms.length + new informatics.NumberOfMoleculesCounter(this.molecule).value;
	};
})(ChemDoodle.informatics);
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
})(ChemDoodle.structures, ChemDoodle.informatics);

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

})(ChemDoodle.informatics);
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

})(ChemDoodle.informatics, ChemDoodle.structures);

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

})(ChemDoodle.informatics);

attachIO(ChemDoodle);

ChemDoodle.monitor = (function(featureDetection, document, undefined) {
	'use strict';
	let m = {};

	m.CANVAS_DRAGGING = undefined;
	m.CANVAS_OVER = undefined;
	m.ALT = false;
	m.SHIFT = false;
	m.META = false;

	if (!featureDetection.supports_touch()) {
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

			// TODO remove jQuery after testing
			// q(document).mousemove(function(e) {
			// 	if (m.CANVAS_DRAGGING) {
			// 		if (m.CANVAS_DRAGGING.drag) {
			// 			m.CANVAS_DRAGGING.prehandleEvent(e);
			// 			m.CANVAS_DRAGGING.drag(e);
			// 		}
			// 	}
			// });

			// q(document).mouseup(function(e) {
			// 	if (m.CANVAS_DRAGGING && m.CANVAS_DRAGGING !== m.CANVAS_OVER) {
			// 		if (m.CANVAS_DRAGGING.mouseup) {
			// 			m.CANVAS_DRAGGING.prehandleEvent(e);
			// 			m.CANVAS_DRAGGING.mouseup(e);
			// 		}
			// 	}
			// 	m.CANVAS_DRAGGING = undefined;
			// });

			// handles modifier keys from a single keyboard

			// q(document).keydown(function(e) {
			// 	m.SHIFT = e.shiftKey;
			// 	m.ALT = e.altKey;
			// 	m.META = e.metaKey || e.ctrlKey;
			// 	let affecting = m.CANVAS_OVER;
			// 	if (m.CANVAS_DRAGGING) {
			// 		affecting = m.CANVAS_DRAGGING;
			// 	}
			// 	if (affecting) {
			// 		if (affecting.keydown) {
			// 			affecting.prehandleEvent(e);
			// 			affecting.keydown(e);
			// 		}
			// 	}
			// });

			// q(document).keypress(function(e) {
			// 	let affecting = m.CANVAS_OVER;
			// 	if (m.CANVAS_DRAGGING) {
			// 		affecting = m.CANVAS_DRAGGING;
			// 	}
			// 	if (affecting) {
			// 		if (affecting.keypress) {
			// 			affecting.prehandleEvent(e);
			// 			affecting.keypress(e);
			// 		}
			// 	}
			// });

			//q(document).keyup(function(e) {
			// 	m.SHIFT = e.shiftKey;
			// 	m.ALT = e.altKey;
			// 	m.META = e.metaKey || e.ctrlKey;
			// 	let affecting = m.CANVAS_OVER;
			// 	if (m.CANVAS_DRAGGING) {
			// 		affecting = m.CANVAS_DRAGGING;
			// 	}
			// 	if (affecting) {
			// 		if (affecting.keyup) {
			// 			affecting.prehandleEvent(e);
			// 			affecting.keyup(e);
			// 		}
			// 	}
			// });
		});
	}

	return m;

})(ChemDoodle.featureDetection, document);

(function(c, featureDetection, math, monitor, structures, m, document, window, userAgent, undefined) {
	'use strict';
	c._Canvas = function() {
	};
	let _ = c._Canvas.prototype;
	_.molecules = undefined;
	_.shapes = undefined;
	_.emptyMessage = undefined;
	_.image = undefined;
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
			if (!this.image) {
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
			} else {
				ctx.drawImage(this.image, 0, 0);
			}
			if (this.innerRepaint) {
				this.innerRepaint(ctx);
			} else {
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

		// TODO remove jQuery after testing
		// let cap = q('#' + this.id);
		// cap.attr({
		// 	width : w,
		// 	height : h
		// });
		// cap.css('width', w);
		// cap.css('height', h);

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
		this.repaint();
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
			this.repaint();
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
			this.repaint();
		}
	};
	_.addMolecule = function(molecule) {
		this.molecules.push(molecule);
		if (!(c._Canvas3D && this instanceof c._Canvas3D)) {
			molecule.check();
		}
		this.repaint();
	};
	_.removeMolecule = function(mol) {
		this.molecules = this.molecules.filter(function(value) {
			return value !== mol;
		});
		// TODO remove jQuery after testing
		// this.molecules = q.grep(this.molecules, function(value) {
		// 	return value !== mol;
		// });
		this.repaint();
	};
	_.getMolecule = function() {
		return this.molecules.length > 0 ? this.molecules[0] : undefined;
	};
	_.getMolecules = function() {
		return this.molecules;
	};
	_.addShape = function(shape) {
		this.shapes.push(shape);
		this.repaint();
	};
	_.removeShape = function(shape) {
		this.shapes = this.shapes.filter(function(value) {
			return value !== shape;
		});
		// TODO remove jQuery after testing
		// this.shapes = q.grep(this.shapes, function(value) {
		// 	return value !== shape;
		// });
		this.repaint();
	};
	_.getShapes = function() {
		return this.shapes;
	};
	_.clear = function() {
		this.molecules = [];
		this.shapes = [];
		this.styles.scale = 1;
		this.repaint();
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
			document.writeln('<canvas class="ChemDoodleWebComponent" id="' + id + '" width="' + width + '" height="' + height + '" alt="ChemDoodle Web Component">This browser does not support HTML5/Canvas.</canvas>');
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
			canvas.className = "ChemDoodleWebComponent";
		}

		let canvas = document.getElementById(id);
		canvas.style.width = width.toString()+'px';
		canvas.style.height = height.toString()+'px';
		this.repaint();

		// setup input events
		// make sure prehandle events are only in if statements if handled, so
		// as not to block browser events
		let self = this;
		if (featureDetection.supports_touch()) {
			// for iPhone OS and Android devices (and other mobile browsers that
			// support mobile events)
			jqCapsule.bind('touchstart', function(e) {
				let time = new Date().getTime();
				if (!featureDetection.supports_gesture() && e.originalEvent.touches.length === 2) {
					// on some platforms, like Android, there is no gesture
					// support, so we have to implement it
					let ts = e.originalEvent.touches;
					let p1 = new structures.Point(ts[0].pageX, ts[0].pageY);
					let p2 = new structures.Point(ts[1].pageX, ts[1].pageY);
					self.implementedGestureDist = p1.distance(p2);
					self.implementedGestureAngle = p1.angle(p2);
					if (self.gesturestart) {
						self.prehandleEvent(e);
						self.gesturestart(e);
					}
				}
				if (self.lastTouch && e.originalEvent.touches.length === 1 && (time - self.lastTouch) < 500) {
					if (self.dbltap) {
						self.prehandleEvent(e);
						self.dbltap(e);
					} else if (self.dblclick) {
						self.prehandleEvent(e);
						self.dblclick(e);
					} else if (self.touchstart) {
						self.prehandleEvent(e);
						self.touchstart(e);
					} else if (self.mousedown) {
						self.prehandleEvent(e);
						self.mousedown(e);
					}
				} else if (self.touchstart) {
					self.prehandleEvent(e);
					self.touchstart(e);
					if (this.hold) {
						clearTimeout(this.hold);
					}
					if (this.touchhold) {
						this.hold = setTimeout(function() {
							self.touchhold(e);
						}, 1000);
					}
				} else if (self.mousedown) {
					self.prehandleEvent(e);
					self.mousedown(e);
				}
				self.lastTouch = time;
			});
			jqCapsule.bind('touchmove', function(e) {
				if (this.hold) {
					clearTimeout(this.hold);
					this.hold = undefined;
				}
				if (!featureDetection.supports_gesture() && e.originalEvent.touches.length === 2) {
					// on some platforms, like Android, there is no gesture
					// support, so we have to implement it
					if (self.gesturechange) {
						let ts = e.originalEvent.touches;
						let p1 = new structures.Point(ts[0].pageX, ts[0].pageY);
						let p2 = new structures.Point(ts[1].pageX, ts[1].pageY);
						let newDist = p1.distance(p2);
						let newAngle = p1.angle(p2);
						e.originalEvent.scale = newDist / self.implementedGestureDist;
						e.originalEvent.rotation = 180 * (self.implementedGestureAngle - newAngle) / m.PI;
						self.prehandleEvent(e);
						self.gesturechange(e);
					}
				}
				if (e.originalEvent.touches.length > 1 && self.multitouchmove) {
					let numFingers = e.originalEvent.touches.length;
					self.prehandleEvent(e);
					let center = new structures.Point(-e.offset.left * numFingers, -e.offset.top * numFingers);
					for ( let i = 0; i < numFingers; i++) {
						center.x += e.originalEvent.changedTouches[i].pageX;
						center.y += e.originalEvent.changedTouches[i].pageY;
					}
					center.x /= numFingers;
					center.y /= numFingers;
					e.p = center;
					self.multitouchmove(e, numFingers);
				} else if (self.touchmove) {
					self.prehandleEvent(e);
					self.touchmove(e);
				} else if (self.drag) {
					self.prehandleEvent(e);
					self.drag(e);
				}
			});
			jqCapsule.bind('touchend', function(e) {
				if (this.hold) {
					clearTimeout(this.hold);
					this.hold = undefined;
				}
				if (!featureDetection.supports_gesture() && self.implementedGestureDist) {
					// on some platforms, like Android, there is no gesture
					// support, so we have to implement it
					self.implementedGestureDist = undefined;
					self.implementedGestureAngle = undefined;
					if (self.gestureend) {
						self.prehandleEvent(e);
						self.gestureend(e);
					}
				}
				if (self.touchend) {
					self.prehandleEvent(e);
					self.touchend(e);
				} else if (self.mouseup) {
					self.prehandleEvent(e);
					self.mouseup(e);
				}
				if ((new Date().getTime() - self.lastTouch) < 250) {
					if (self.tap) {
						self.prehandleEvent(e);
						self.tap(e);
					} else if (self.click) {
						self.prehandleEvent(e);
						self.click(e);
					}
				}
			});
			jqCapsule.bind('gesturestart', function(e) {
				if (self.gesturestart) {
					self.prehandleEvent(e);
					self.gesturestart(e);
				}
			});
			jqCapsule.bind('gesturechange', function(e) {
				if (self.gesturechange) {
					self.prehandleEvent(e);
					self.gesturechange(e);
				}
			});
			jqCapsule.bind('gestureend', function(e) {
				if (self.gestureend) {
					self.prehandleEvent(e);
					self.gestureend(e);
				}
			});
		} else {
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

			// jqCapsule.click(function(e) {
			// 	switch (e.which) {
			// 	case 1:
			// 		// left mouse button pressed
			// 		if (self.click) {
			// 			self.prehandleEvent(e);
			// 			self.click(e);
			// 		}
			// 		break;
			// 	case 2:
			// 		// middle mouse button pressed
			// 		if (self.middleclick) {
			// 			self.prehandleEvent(e);
			// 			self.middleclick(e);
			// 		}
			// 		break;
			// 	case 3:
			// 		// right mouse button pressed
			// 		if (self.rightclick) {
			// 			self.prehandleEvent(e);
			// 			self.rightclick(e);
			// 		}
			// 		break;
			// 	}
			// });

			// jqCapsule.dblclick(function(e) {
			// 	if (self.dblclick) {
			// 		self.prehandleEvent(e);
			// 		self.dblclick(e);
			// 	}
			// });

			// jqCapsule.mousedown(function(e) {
			// 	switch (e.which) {
			// 	case 1:
			// 		// left mouse button pressed
			// 		monitor.CANVAS_DRAGGING = self;
			// 		if (self.mousedown) {
			// 			self.prehandleEvent(e);
			// 			self.mousedown(e);
			// 		}
			// 		break;
			// 	case 2:
			// 		// middle mouse button pressed
			// 		if (self.middlemousedown) {
			// 			self.prehandleEvent(e);
			// 			self.middlemousedown(e);
			// 		}
			// 		break;
			// 	case 3:
			// 		// right mouse button pressed
			// 		if (self.rightmousedown) {
			// 			self.prehandleEvent(e);
			// 			self.rightmousedown(e);
			// 		}
			// 		break;
			// 	}
			// });

			// jqCapsule.mousemove(function(e) {
			// 	if (!monitor.CANVAS_DRAGGING && self.mousemove) {
			// 		self.prehandleEvent(e);
			// 		self.mousemove(e);
			// 	}
			// });

			// jqCapsule.mouseout(function(e) {
			// 	monitor.CANVAS_OVER = undefined;
			// 	if (self.mouseout) {
			// 		self.prehandleEvent(e);
			// 		self.mouseout(e);
			// 	}
			// });

			// jqCapsule.mouseover(function(e) {
			// 	monitor.CANVAS_OVER = self;
			// 	if (self.mouseover) {
			// 		self.prehandleEvent(e);
			// 		self.mouseover(e);
			// 	}
			// });

			// jqCapsule.mouseup(function(e) {
			// 	switch (e.which) {
			// 	case 1:
			// 		// left mouse button pressed
			// 		if (self.mouseup) {
			// 			self.prehandleEvent(e);
			// 			self.mouseup(e);
			// 		}
			// 		break;
			// 	case 2:
			// 		// middle mouse button pressed
			// 		if (self.middlemouseup) {
			// 			self.prehandleEvent(e);
			// 			self.middlemouseup(e);
			// 		}
			// 		break;
			// 	case 3:
			// 		// right mouse button pressed
			// 		if (self.rightmouseup) {
			// 			self.prehandleEvent(e);
			// 			self.rightmouseup(e);
			// 		}
			// 		break;
			// 	}
			// });

			// jqCapsule.mousewheel(function(e, delta) {
			// 	if (self.mousewheel) {
			// 		self.prehandleEvent(e);
			// 		self.mousewheel(e, delta);
			// 	}
			// });
		}
		if (this.subCreate) {
			this.subCreate();
		}
	};
	_.prehandleEvent = function(e) {
		if(!this.doEventDefault){
			e.preventDefault();
			e.returnValue = false;
		}
		let rect = document.getElementById(this.id).getBoundingClientRect();
		e.offset = {
			top: rect.top + window.scrollY,
			left: rect.left + window.scrollX,
		};
		// TODO remove jQuery after testing
		//e.offset = q('#' + this.id).offset();
		// e.p = new structures.Point(e.pageX - e.offsetX, e.pageY - e.offsetY);

		e.p = new structures.Point((e.pageX - e.offset.left), (e.pageY - e.offset.top));
	};

})(ChemDoodle, ChemDoodle.featureDetection, ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.structures, Math, document, window, navigator.userAgent);

(function(c, animations, undefined) {
	'use strict';
	c._AnimatorCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	let _ = c._AnimatorCanvas.prototype = new c._Canvas();
	_.timeout = 33;
	_.startAnimation = function() {
		this.stopAnimation();
		this.lastTime = new Date().getTime();
		let self = this;
		if (this.nextFrame) {
			this.handle = animations.requestInterval(function() {
				// advance clock
				let timeNow = new Date().getTime();
				// update and repaint
				self.nextFrame(timeNow - self.lastTime);
				self.repaint();
				self.lastTime = timeNow;
			}, this.timeout);
		}
	};
	_.stopAnimation = function() {
		if (this.handle) {
			animations.clearRequestInterval(this.handle);
			this.handle = undefined;
		}
	};
	_.isRunning = function() {
		// must compare to undefined here to return a boolean
		return this.handle !== undefined;
	};

})(ChemDoodle, ChemDoodle.animations);

(function(c, document, undefined) {
	'use strict';
	c.FileCanvas = function(id, width, height, action) {
		if (id) {
			this.create(id, width, height);
		}
		let form = '<br><form name="FileForm" enctype="multipart/form-data" method="POST" action="' + action + '" target="HiddenFileFrame"><input type="file" name="f" /><input type="submit" name="submitbutton" value="Show File" /></form><iframe id="HFF-' + id + '" name="HiddenFileFrame" height="0" width="0" style="display:none;" onLoad="GetMolFromFrame(\'HFF-' + id + '\', ' + id + ')"></iframe>';
		document.writeln(form);
		this.emptyMessage = 'Click below to load file';
		this.repaint();
	};
	c.FileCanvas.prototype = new c._Canvas();

})(ChemDoodle, document);

(function(c, undefined) {
	'use strict';
	c.HyperlinkCanvas = function(id, width, height, urlOrFunction, color, size) {
		if (id) {
			this.create(id, width, height);
		}
		this.urlOrFunction = urlOrFunction;
		this.color = color ? color : 'blue';
		this.size = size ? size : 2;
	};
	let _ = c.HyperlinkCanvas.prototype = new c._Canvas();
	_.openInNewWindow = true;
	_.hoverImage = undefined;
	_.drawChildExtras = function(ctx) {
		if (this.e) {
			if (this.hoverImage) {
				ctx.drawImage(this.hoverImage, 0, 0);
			} else {
				ctx.strokeStyle = this.color;
				ctx.lineWidth = this.size * 2;
				ctx.strokeRect(0, 0, this.width, this.height);
			}
		}
	};
	_.setHoverImage = function(url) {
		this.hoverImage = new Image();
		this.hoverImage.src = url;
	};
	_.click = function(p) {
		this.e = undefined;
		this.repaint();
		if (this.urlOrFunction instanceof Function) {
			this.urlOrFunction();
		} else {
			if (this.openInNewWindow) {
				window.open(this.urlOrFunction);
			} else {
				location.href = this.urlOrFunction;
			}
		}
	};
	_.mouseout = function(e) {
		this.e = undefined;
		this.repaint();
	};
	_.mouseover = function(e) {
		this.e = e;
		this.repaint();
	};

})(ChemDoodle);

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
// })(ChemDoodle, ChemDoodle.iChemLabs, ChemDoodle.lib.jQuery, document);

(function(c, m, m4, undefined) {
	'use strict';
	// keep these declaration outside the loop to avoid overhead
	let matrix = [];
	let xAxis = [ 1, 0, 0 ];
	let yAxis = [ 0, 1, 0 ];
	let zAxis = [ 0, 0, 1 ];

	c.RotatorCanvas = function(id, width, height, rotate3D) {
		if (id) {
			this.create(id, width, height);
		}
		this.rotate3D = rotate3D;
	};
	let _ = c.RotatorCanvas.prototype = new c._AnimatorCanvas();
	let increment = m.PI / 15;
	_.xIncrement = increment;
	_.yIncrement = increment;
	_.zIncrement = increment;
	_.nextFrame = function(delta) {
		if (this.molecules.length === 0 && this.shapes.length === 0) {
			this.stopAnimation();
			return;
		}
		let change = delta / 1000;
		if (this.rotate3D) {
			m4.identity(matrix);
			m4.rotate(matrix, this.xIncrement * change, xAxis);
			m4.rotate(matrix, this.yIncrement * change, yAxis);
			m4.rotate(matrix, this.zIncrement * change, zAxis);
			for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
				let m = this.molecules[i];
				for ( let j = 0, jj = m.atoms.length; j < jj; j++) {
					let a = m.atoms[j];
					let p = [ a.x - this.width / 2, a.y - this.height / 2, a.z ];
					m4.multiplyVec3(matrix, p);
					a.x = p[0] + this.width / 2;
					a.y = p[1] + this.height / 2;
					a.z = p[2];
				}
				for ( let j = 0, jj = m.rings.length; j < jj; j++) {
					m.rings[j].center = m.rings[j].getCenter();
				}
				if (this.styles.atoms_display && this.styles.atoms_circles_2D) {
					m.sortAtomsByZ();
				}
				if (this.styles.bonds_display && this.styles.bonds_clearOverlaps_2D) {
					m.sortBondsByZ();
				}
			}
			for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
				let sps = this.shapes[i].getPoints();
				for ( let j = 0, jj = sps.length; j < jj; j++) {
					let a = sps[j];
					let p = [ a.x - this.width / 2, a.y - this.height / 2, 0 ];
					m4.multiplyVec3(matrix, p);
					a.x = p[0] + this.width / 2;
					a.y = p[1] + this.height / 2;
				}
			}
		} else {
			this.styles.rotateAngle += this.zIncrement * change;
		}
	};
	_.dblclick = function(e) {
		if (this.isRunning()) {
			this.stopAnimation();
		} else {
			this.startAnimation();
		}
	};

})(ChemDoodle, Math, ChemDoodle.lib.mat4);

(function(c, animations, math, undefined) {
	'use strict';
	c.SlideshowCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	let _ = c.SlideshowCanvas.prototype = new c._AnimatorCanvas();
	_.frames = [];
	_.curIndex = 0;
	_.timeout = 5000;
	_.alpha = 0;
	_.innerHandle = undefined;
	_.phase = 0;
	_.drawChildExtras = function(ctx) {
		let rgb = math.getRGB(this.styles.backgroundColor, 255);
		ctx.fillStyle = 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + this.alpha + ')';
		ctx.fillRect(0, 0, this.width, this.height);
	};
	_.nextFrame = function(delta) {
		if (this.frames.length === 0) {
			this.stopAnimation();
			return;
		}
		this.phase = 0;
		let self = this;
		let count = 1;
		this.innerHandle = setInterval(function() {
			self.alpha = count / 15;
			self.repaint();
			if (count === 15) {
				self.breakInnerHandle();
			}
			count++;
		}, 33);
	};
	_.breakInnerHandle = function() {
		if (this.innerHandle) {
			clearInterval(this.innerHandle);
			this.innerHandle = undefined;
		}
		if (this.phase === 0) {
			this.curIndex++;
			if (this.curIndex > this.frames.length - 1) {
				this.curIndex = 0;
			}
			this.alpha = 1;
			let f = this.frames[this.curIndex];
			this.loadContent(f.mols, f.shapes);
			this.phase = 1;
			let self = this;
			let count = 1;
			this.innerHandle = setInterval(function() {
				self.alpha = (15 - count) / 15;
				self.repaint();
				if (count === 15) {
					self.breakInnerHandle();
				}
				count++;
			}, 33);
		} else if (this.phase === 1) {
			this.alpha = 0;
			this.repaint();
		}
	};
	_.addFrame = function(molecules, shapes) {
		if (this.frames.length === 0) {
			this.loadContent(molecules, shapes);
		}
		this.frames.push({
			mols : molecules,
			shapes : shapes
		});
	};

})(ChemDoodle, ChemDoodle.animations, ChemDoodle.math);

(function(c, monitor, structures, m, m4, undefined) {
	'use strict';
	c.TransformCanvas = function(id, width, height, rotate3D) {
		if (id) {
			this.create(id, width, height);
		}
		this.rotate3D = rotate3D;
	};
	let _ = c.TransformCanvas.prototype = new c._Canvas();
	_.lastPoint = undefined;
	_.rotationMultMod = 1.3;
	_.lastPinchScale = 1;
	_.lastGestureRotate = 0;
	_.mousedown = function(e) {
		this.lastPoint = e.p;
	};
	_.dblclick = function(e) {
		// center structure
		this.center();
		this.repaint();
	};
	_.drag = function(e) {
		if (!this.lastPoint.multi) {
			if (monitor.ALT) {
				let t = new structures.Point(e.p.x, e.p.y);
				t.sub(this.lastPoint);
				for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
					let mol = this.molecules[i];
					for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
						mol.atoms[j].add(t);
					}
					mol.check();
				}
				for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
					let sps = this.shapes[i].getPoints();
					for ( let j = 0, jj = sps.length; j < jj; j++) {
						sps[j].add(t);
					}
				}
				this.lastPoint = e.p;
				this.repaint();
			} else {
				if (this.rotate3D === true) {
					let diameter = m.max(this.width / 4, this.height / 4);
					let difx = e.p.x - this.lastPoint.x;
					let dify = e.p.y - this.lastPoint.y;
					let yIncrement = difx / diameter * this.rotationMultMod;
					let xIncrement = -dify / diameter * this.rotationMultMod;
					let matrix = [];
					m4.identity(matrix);
					m4.rotate(matrix, xIncrement, [ 1, 0, 0 ]);
					m4.rotate(matrix, yIncrement, [ 0, 1, 0 ]);
					for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
						let mol = this.molecules[i];
						for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
							let a = mol.atoms[j];
							let p = [ a.x - this.width / 2, a.y - this.height / 2, a.z ];
							m4.multiplyVec3(matrix, p);
							a.x = p[0] + this.width / 2;
							a.y = p[1] + this.height / 2;
							a.z = p[2];
						}
						for ( let i = 0, ii = mol.rings.length; i < ii; i++) {
							mol.rings[i].center = mol.rings[i].getCenter();
						}
						this.lastPoint = e.p;
						if (this.styles.atoms_display && this.styles.atoms_circles_2D) {
							mol.sortAtomsByZ();
						}
						if (this.styles.bonds_display && this.styles.bonds_clearOverlaps_2D) {
							mol.sortBondsByZ();
						}
					}
					this.repaint();
				} else {
					let center = new structures.Point(this.width / 2, this.height / 2);
					let before = center.angle(this.lastPoint);
					let after = center.angle(e.p);
					this.styles.rotateAngle -= (after - before);
					this.lastPoint = e.p;
					this.repaint();
				}
			}
		}
	};
	_.mousewheel = function(e, delta) {
		this.styles.scale += delta / 50;
		if (this.styles.scale < .01) {
			this.styles.scale = .01;
		}
		this.repaint();
	};
	_.multitouchmove = function(e, numFingers) {
		if (numFingers === 2) {
			if (this.lastPoint.multi) {
				let t = new structures.Point(e.p.x, e.p.y);
				t.sub(this.lastPoint);
				for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
					let m = this.molecules[i];
					for ( let j = 0, jj = m.atoms.length; j < jj; j++) {
						m.atoms[j].add(t);
					}
					m.check();
				}
				for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
					let sps = this.shapes[i].getPoints();
					for ( let j = 0, jj = sps.length; j < jj; j++) {
						sps[j].add(t);
					}
				}
				this.lastPoint = e.p;
				this.lastPoint.multi = true;
				this.repaint();
			} else {
				this.lastPoint = e.p;
				this.lastPoint.multi = true;
			}
		}
	};
	_.gesturechange = function(e) {
		if (e.originalEvent.scale - this.lastPinchScale !== 0) {
			this.styles.scale *= e.originalEvent.scale / this.lastPinchScale;
			if (this.styles.scale < .01) {
				this.styles.scale = .01;
			}
			this.lastPinchScale = e.originalEvent.scale;
		}
		if (this.lastGestureRotate - e.originalEvent.rotation !== 0) {
			let rot = (this.lastGestureRotate - e.originalEvent.rotation) / 180 * m.PI;
			let center = new structures.Point(this.width / 2, this.height / 2);
			for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
				let mol = this.molecules[i];
				for ( let j = 0, jj = mol.atoms.length; j < jj; j++) {
					let a = mol.atoms[j];
					let dist = center.distance(a);
					let angle = center.angle(a) + rot;
					a.x = center.x + dist * m.cos(angle);
					a.y = center.y - dist * m.sin(angle);
				}
				mol.check();
			}
			this.lastGestureRotate = e.originalEvent.rotation;
		}
		this.repaint();
	};
	_.gestureend = function(e) {
		this.lastPinchScale = 1;
		this.lastGestureRotate = 0;
	};

})(ChemDoodle, ChemDoodle.monitor, ChemDoodle.structures, Math, ChemDoodle.lib.mat4);

(function(c, undefined) {
	'use strict';
	c.ViewerCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	c.ViewerCanvas.prototype = new c._Canvas();

})(ChemDoodle);

(function(c, document, undefined) {
	'use strict';
	c._SpectrumCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	let _ = c._SpectrumCanvas.prototype = new c._Canvas();
	_.spectrum = undefined;
	_.emptyMessage = 'No Spectrum Loaded or Recognized';
	_.loadMolecule = undefined;
	_.getMolecule = undefined;
	_.innerRepaint = function(ctx) {
		if (this.spectrum && this.spectrum.data.length > 0) {
			this.spectrum.draw(ctx, this.styles, this.width, this.height);
		} else if (this.emptyMessage) {
			ctx.fillStyle = '#737683';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = '18px Helvetica, Verdana, Arial, Sans-serif';
			ctx.fillText(this.emptyMessage, this.width / 2, this.height / 2);
		}
	};
	_.loadSpectrum = function(spectrum) {
		this.spectrum = spectrum;
		this.repaint();
	};
	_.getSpectrum = function() {
		return this.spectrum;
	};
	_.getSpectrumCoordinates = function(x, y) {
		return spectrum.getInternalCoordinates(x, y, this.width, this.height);
	};

})(ChemDoodle, document);

(function(c, undefined) {
	'use strict';
	c.ObserverCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	c.ObserverCanvas.prototype = new c._SpectrumCanvas();

})(ChemDoodle);

(function(c, undefined) {
	'use strict';
	c.OverlayCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	let _ = c.OverlayCanvas.prototype = new c._SpectrumCanvas();
	_.overlaySpectra = [];
	_.superRepaint = _.innerRepaint;
	_.innerRepaint = function(ctx) {
		this.superRepaint(ctx);
		if (this.spectrum && this.spectrum.data.length > 0) {
			for ( let i = 0, ii = this.overlaySpectra.length; i < ii; i++) {
				let s = this.overlaySpectra[i];
				if (s && s.data.length > 0) {
					s.minX = this.spectrum.minX;
					s.maxX = this.spectrum.maxX;
					s.drawPlot(ctx, this.styles, this.width, this.height, this.spectrum.memory.offsetTop, this.spectrum.memory.offsetLeft, this.spectrum.memory.offsetBottom);
				}
			}
		}
	};
	_.addSpectrum = function(spectrum) {
		if (!this.spectrum) {
			this.spectrum = spectrum;
		} else {
			this.overlaySpectra.push(spectrum);
		}
	};

})(ChemDoodle);

(function(c, monitor, m, undefined) {
	'use strict';
	c.PerspectiveCanvas = function(id, width, height) {
		if (id) {
			this.create(id, width, height);
		}
	};
	let _ = c.PerspectiveCanvas.prototype = new c._SpectrumCanvas();
	_.dragRange = undefined;
	_.rescaleYAxisOnZoom = true;
	_.lastPinchScale = 1;
	_.mousedown = function(e) {
		this.dragRange = new c.structures.Point(e.p.x, e.p.x);
	};
	_.mouseup = function(e) {
		if (this.dragRange && this.dragRange.x !== this.dragRange.y) {
			if (!this.dragRange.multi) {
				let newScale = this.spectrum.zoom(this.dragRange.x, e.p.x, this.width, this.rescaleYAxisOnZoom);
				if (this.rescaleYAxisOnZoom) {
					this.styles.scale = newScale;
				}
			}
			this.dragRange = undefined;
			this.repaint();
		}
	};
	_.drag = function(e) {
		if (this.dragRange) {
			if (this.dragRange.multi) {
				this.dragRange = undefined;
			} else if (monitor.SHIFT) {
				this.spectrum.translate(e.p.x - this.dragRange.x, this.width);
				this.dragRange.x = e.p.x;
				this.dragRange.y = e.p.x;
			} else {
				this.dragRange.y = e.p.x;
			}
			this.repaint();
		}
	};
	_.drawChildExtras = function(ctx) {
		if (this.dragRange) {
			let xs = m.min(this.dragRange.x, this.dragRange.y);
			let xe = m.max(this.dragRange.x, this.dragRange.y);
			ctx.strokeStyle = 'gray';
			ctx.lineStyle = 1;
			ctx.beginPath();
			ctx.moveTo(xs, this.height / 2);
			for ( let i = xs; i <= xe; i++) {
				if (i % 10 < 5) {
					ctx.lineTo(i, m.round(this.height / 2));
				} else {
					ctx.moveTo(i, m.round(this.height / 2));
				}
			}
			ctx.stroke();
		}
	};
	_.mousewheel = function(e, delta) {
		this.styles.scale -= delta / 10;
		if (this.styles.scale < .01) {
			this.styles.scale = .01;
		}
		this.repaint();
	};
	_.dblclick = function(e) {
		this.spectrum.setup();
		this.styles.scale = 1;
		this.repaint();
	};
	_.multitouchmove = function(e, numFingers) {
		if (numFingers === 2) {
			if (!this.dragRange || !this.dragRange.multi) {
				this.dragRange = new c.structures.Point(e.p.x, e.p.x);
				this.dragRange.multi = true;
			} else {
				this.spectrum.translate(e.p.x - this.dragRange.x, this.width);
				this.dragRange.x = e.p.x;
				this.dragRange.y = e.p.x;
				this.repaint();
			}
		}
	};
	_.gesturechange = function(e) {
		this.styles.scale *= e.originalEvent.scale / this.lastPinchScale;
		if (this.styles.scale < .01) {
			this.styles.scale = .01;
		}
		this.lastPinchScale = e.originalEvent.scale;
		this.repaint();
	};
	_.gestureend = function(e) {
		this.lastPinchScale = 1;
	};

})(ChemDoodle, ChemDoodle.monitor, Math);

(function(c, extensions, m, undefined) {
	'use strict';
	c.SeekerCanvas = function(id, width, height, seekType) {
		if (id) {
			this.create(id, width, height);
		}
		this.seekType = seekType;
	};
	let _ = c.SeekerCanvas.prototype = new c._SpectrumCanvas();
	_.superRepaint = _.innerRepaint;
	_.innerRepaint = function(ctx) {
		this.superRepaint(ctx);
		if (this.spectrum && this.spectrum.data.length > 0 && this.p) {
			// set up coords
			let renderP;
			let internalP;
			if (this.seekType === c.SeekerCanvas.SEEK_POINTER) {
				renderP = this.p;
				internalP = this.spectrum.getInternalCoordinates(renderP.x, renderP.y);
			} else if (this.seekType === c.SeekerCanvas.SEEK_PLOT || this.seekType === c.SeekerCanvas.SEEK_PEAK) {
				internalP = this.seekType === c.SeekerCanvas.SEEK_PLOT ? this.spectrum.getClosestPlotInternalCoordinates(this.p.x) : this.spectrum.getClosestPeakInternalCoordinates(this.p.x);
				if (!internalP) {
					return;
				}
				renderP = {
					x : this.spectrum.getTransformedX(internalP.x, this.styles, this.width, this.spectrum.memory.offsetLeft),
					y : this.spectrum.getTransformedY(internalP.y / 100, this.styles, this.height, this.spectrum.memory.offsetBottom, this.spectrum.memory.offsetTop)
				};
			}
			// draw point
			ctx.fillStyle = 'white';
			ctx.strokeStyle = this.styles.plots_color;
			ctx.lineWidth = this.styles.plots_width;
			ctx.beginPath();
			ctx.arc(renderP.x, renderP.y, 3, 0, m.PI * 2, false);
			ctx.fill();
			ctx.stroke();
			// draw internal coordinates
			ctx.font = extensions.getFontString(this.styles.text_font_size, this.styles.text_font_families);
			ctx.textAlign = 'left';
			ctx.textBaseline = 'bottom';
			let s = 'x:' + internalP.x.toFixed(3) + ', y:' + internalP.y.toFixed(3);
			let x = renderP.x + 3;
			let w = ctx.measureText(s).width;
			if (x + w > this.width - 2) {
				x -= 6 + w;
			}
			let y = renderP.y;
			if (y - this.styles.text_font_size - 2 < 0) {
				y += this.styles.text_font_size;
			}
			ctx.fillRect(x, y - this.styles.text_font_size, w, this.styles.text_font_size);
			ctx.fillStyle = 'black';
			ctx.fillText(s, x, y);
		}
	};
	_.mouseout = function(e) {
		this.p = undefined;
		this.repaint();
	};
	_.mousemove = function(e) {
		this.p = {
			x : e.p.x - 2,
			y : e.p.y - 3
		};
		this.repaint();
	};
	_.touchstart = function(e) {
		this.mousemove(e);
	};
	_.touchmove = function(e) {
		this.mousemove(e);
	};
	_.touchend = function(e) {
		this.mouseout(e);
	};
	c.SeekerCanvas.SEEK_POINTER = 'pointer';
	c.SeekerCanvas.SEEK_PLOT = 'plot';
	c.SeekerCanvas.SEEK_PEAK = 'peak';

})(ChemDoodle, ChemDoodle.extensions, Math);

(function(c, extensions, math, document, undefined) {
	'use strict';
	function PeriodicCell(element, x, y, dimension) {
		this.element = element;
		this.x = x;
		this.y = y;
		this.dimension = dimension;
		this.allowMultipleSelections = false;
	}

	c.PeriodicTableCanvas = function(id, cellDimension) {
		this.padding = 5;
		if (id) {
			this.create(id, cellDimension * 18 + this.padding * 2, cellDimension * 10 + this.padding * 2);
		}
		this.cellDimension = cellDimension ? cellDimension : 20;
		this.setupTable();
		this.repaint();
	};
	let _ = c.PeriodicTableCanvas.prototype = new c._Canvas();
	_.loadMolecule = undefined;
	_.getMolecule = undefined;
	_.getHoveredElement = function() {
		if (this.hovered) {
			return this.hovered.element;
		}
		return undefined;
	};
	_.innerRepaint = function(ctx) {
		for ( let i = 0, ii = this.cells.length; i < ii; i++) {
			this.drawCell(ctx, this.styles, this.cells[i]);
		}
		if (this.hovered) {
			this.drawCell(ctx, this.styles, this.hovered);
		}
		if (this.selected) {
			this.drawCell(ctx, this.styles, this.selected);
		}
	};
	_.setupTable = function() {
		this.cells = [];
		let x = this.padding;
		let y = this.padding;
		let count = 0;
		for ( let i = 0, ii = c.SYMBOLS.length; i < ii; i++) {
			if (count === 18) {
				count = 0;
				y += this.cellDimension;
				x = this.padding;
			}
			let e = c.ELEMENT[c.SYMBOLS[i]];
			if (e.atomicNumber === 2) {
				x += 16 * this.cellDimension;
				count += 16;
			} else if (e.atomicNumber === 5 || e.atomicNumber === 13) {
				x += 10 * this.cellDimension;
				count += 10;
			}
			if ((e.atomicNumber < 58 || e.atomicNumber > 71 && e.atomicNumber < 90 || e.atomicNumber > 103) && e.atomicNumber <= 118) {
				this.cells.push(new PeriodicCell(e, x, y, this.cellDimension));
				x += this.cellDimension;
				count++;
			}
		}
		y += 2 * this.cellDimension;
		x = 3 * this.cellDimension + this.padding;
		for ( let i = 57; i < 104; i++) {
			let e = c.ELEMENT[c.SYMBOLS[i]];
			if (e.atomicNumber === 90) {
				y += this.cellDimension;
				x = 3 * this.cellDimension + this.padding;
			}
			if (e.atomicNumber >= 58 && e.atomicNumber <= 71 || e.atomicNumber >= 90 && e.atomicNumber <= 103) {
				this.cells.push(new PeriodicCell(e, x, y, this.cellDimension));
				x += this.cellDimension;
			}
		}
	};
	_.drawCell = function(ctx, styles, cell) {
		let radgrad = ctx.createRadialGradient(cell.x + cell.dimension / 3, cell.y + cell.dimension / 3, cell.dimension * 1.5, cell.x + cell.dimension / 3, cell.y + cell.dimension / 3, cell.dimension / 10);
		radgrad.addColorStop(0, '#000000');
		radgrad.addColorStop(.7, cell.element.jmolColor);
		radgrad.addColorStop(1, '#FFFFFF');
		ctx.fillStyle = radgrad;
		extensions.contextRoundRect(ctx, cell.x, cell.y, cell.dimension, cell.dimension, cell.dimension / 8);
		if (cell === this.hovered || cell === this.selected || cell.selected) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#c10000';
			ctx.stroke();
			ctx.fillStyle = 'white';
		}
		ctx.fill();
		ctx.font = extensions.getFontString(styles.text_font_size, styles.text_font_families);
		ctx.fillStyle = styles.text_color;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(cell.element.symbol, cell.x + cell.dimension / 2, cell.y + cell.dimension / 2);
	};
	_.click = function(e) {
		if (this.hovered) {
			if(this.allowMultipleSelections){
				this.hovered.selected = !this.hovered.selected;
			}else{
				this.selected = this.hovered;
			}
			this.repaint();
		}
	};
	_.touchstart = function(e){
		// try to hover an element
		this.mousemove(e);
	};
	_.mousemove = function(e) {
		let x = e.p.x;
		let y = e.p.y;
		this.hovered = undefined;
		for ( let i = 0, ii = this.cells.length; i < ii; i++) {
			let c = this.cells[i];
			if (math.isBetween(x, c.x, c.x + c.dimension) && math.isBetween(y, c.y, c.y + c.dimension)) {
				this.hovered = c;
				break;
			}
		}
		this.repaint();
	};
	_.mouseout = function(e) {
		this.hovered = undefined;
		this.repaint();
	};

})(ChemDoodle, ChemDoodle.extensions, ChemDoodle.math, document);
