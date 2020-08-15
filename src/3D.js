


(function(d3, m, undefined) {
    'use strict';
    d3._Mesh = function() {
    };
    let _ = d3._Mesh.prototype;
    _.storeData = function(positionData, normalData, indexData) {
        this.positionData = positionData;
        this.normalData = normalData;
        this.indexData = indexData;
    };
    _.setupBuffers = function(gl) {
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData), gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numItems = this.positionData.length / 3;

        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData), gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = 3;
        this.vertexNormalBuffer.numItems = this.normalData.length / 3;

        if (this.indexData) {
            this.vertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexData), gl.STATIC_DRAW);
            this.vertexIndexBuffer.itemSize = 1;
            this.vertexIndexBuffer.numItems = this.indexData.length;
        }

        if (this.partitions) {
            for ( let i = 0, ii = this.partitions.length; i < ii; i++) {
                let p = this.partitions[i];
                let buffers = this.generateBuffers(gl, p.positionData, p.normalData, p.indexData);
                p.vertexPositionBuffer = buffers[0];
                p.vertexNormalBuffer = buffers[1];
                p.vertexIndexBuffer = buffers[2];
            }
        }
    };
    _.generateBuffers = function(gl, positionData, normalData, indexData) {
        let vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.STATIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numItems = positionData.length / 3;

        let vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
        vertexNormalBuffer.itemSize = 3;
        vertexNormalBuffer.numItems = normalData.length / 3;

        let vertexIndexBuffer;
        if (indexData) {
            vertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
            vertexIndexBuffer.itemSize = 1;
            vertexIndexBuffer.numItems = indexData.length;
        }

        return [ vertexPositionBuffer, vertexNormalBuffer, vertexIndexBuffer ];
    };
    _.bindBuffers = function(gl) {
        if (!this.vertexPositionBuffer) {
            this.setupBuffers(gl);
        }
        // positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, this.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        if (this.vertexIndexBuffer) {
            // indexes
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        }
    };

})(ChemDoodle.structures.d3, Math);

(function(d3, undefined) {
    'use strict';
    d3._Measurement = function() {
    };
    let _ = d3._Measurement.prototype = new d3._Mesh();
    _.render = function(gl, styles) {
        gl.shader.setMatrixUniforms(gl);
        // setting the vertex position buffer to undefined resets the buffers, so this shape can be dynamically updated with the molecule
        if(styles.measurement_update_3D){
            this.vertexPositionBuffer = undefined;
            this.text = undefined;
        }
        if(!this.vertexPositionBuffer){
            this.calculateData(styles);
        }
        this.bindBuffers(gl);
        // colors
        gl.material.setDiffuseColor(gl, styles.shapes_color);
        gl.lineWidth(styles.shapes_lineWidth);
        // render
        gl.drawElements(gl.LINES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    };
    _.renderText = function(gl, styles) {
        gl.shader.setMatrixUniforms(gl);
        // render the text
        if(!this.text){
            this.text = this.getText(styles);
        }

        let vertexData = {
            position : [],
            texCoord : [],
            translation : []
        };

        gl.textImage.pushVertexData(this.text.value, this.text.pos, 1, vertexData);
        gl.textMesh.storeData(gl, vertexData.position, vertexData.texCoord, vertexData.translation);

        gl.textImage.useTexture(gl);
        gl.textMesh.render(gl);
    };

})(ChemDoodle.structures.d3);

(function(ELEMENT, extensions, d3, math, m, m4, v3, undefined) {
    'use strict';
    d3.Angle = function(a1, a2, a3) {
        this.a1 = a1;
        this.a2 = a2;
        this.a3 = a3;
    };
    let _ = d3.Angle.prototype = new d3._Measurement();
    _.calculateData = function(styles) {
        let positionData = [];
        let normalData = [];
        let indexData = [];
        let dist1 = this.a2.distance3D(this.a1);
        let dist2 = this.a2.distance3D(this.a3);
        this.distUse = m.min(dist1, dist2) / 2;
        // data for the angle
        this.vec1 = v3.normalize([ this.a1.x - this.a2.x, this.a1.y - this.a2.y, this.a1.z - this.a2.z ]);
        this.vec2 = v3.normalize([ this.a3.x - this.a2.x, this.a3.y - this.a2.y, this.a3.z - this.a2.z ]);
        this.angle = extensions.vec3AngleFrom(this.vec1, this.vec2);

        let axis = v3.normalize(v3.cross(this.vec1, this.vec2, []));
        let vec3 = v3.normalize(v3.cross(axis, this.vec1, []));

        let bands = styles.measurement_angleBands_3D;
        for ( let i = 0; i <= bands; ++i) {
            let theta = this.angle * i / bands;
            let vecCos = v3.scale(this.vec1, m.cos(theta), []);
            let vecSin = v3.scale(vec3, m.sin(theta), []);
            let norm = v3.scale(v3.normalize(v3.add(vecCos, vecSin, [])), this.distUse);

            positionData.push(this.a2.x + norm[0], this.a2.y + norm[1], this.a2.z + norm[2]);
            normalData.push(0, 0, 0);
            if (i < bands) {
                indexData.push(i, i + 1);
            }
        }

        this.storeData(positionData, normalData, indexData);
    };
    _.getText = function(styles) {
        let vecCenter = v3.scale(v3.normalize(v3.add(this.vec1, this.vec2, [])), this.distUse + 0.3);
        return {
            pos : [ this.a2.x + vecCenter[0], this.a2.y + vecCenter[1], this.a2.z + vecCenter[2] ],
            value : [ math.angleBounds(this.angle, true, false).toFixed(2), ' \u00b0' ].join('')
        };
    };

})(ChemDoodle.ELEMENT, ChemDoodle.extensions, ChemDoodle.structures.d3, ChemDoodle.math, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3);

(function(d3, m, undefined) {
    'use strict';
    d3.Arrow = function(radius, longitudeBands) {
        let positionData = [];
        let normalData = [];

        for ( let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let theta = longNumber * 2 * m.PI / longitudeBands;
            let sinTheta = m.sin(theta);
            let cosTheta = m.cos(theta);

            let x = cosTheta;
            let y = sinTheta;

            normalData.push(
                // base cylinder
                0, 0, -1, 0, 0, -1,
                // cylinder
                x, y, 0, x, y, 0,
                // base cone
                0, 0, -1, 0, 0, -1,
                // cone
                x, y, 1, x, y, 1);

            positionData.push(
                // base cylinder
                0, 0, 0, radius * x, radius * y, 0,
                // cylinder
                radius * x, radius * y, 0, radius * x, radius * y, 2,
                // base cone
                radius * x, radius * y, 2, radius * x * 2, radius * y * 2, 2,
                // cone
                radius * x * 2, radius * y * 2, 2, 0, 0, 3);
        }

        let indexData = [];
        for ( let i = 0; i < longitudeBands; i++) {
            let offset = i * 8;
            for ( let j = 0, jj = 7; j < jj; j++) {
                let first = j + offset;
                let second = first + 1;
                let third = first + jj + 2;
                let forth = third - 1;
                indexData.push(first, third, second, third, first, forth);
            }
        }

        this.storeData(positionData, normalData, indexData);
    };
    d3.Arrow.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math);

(function(d3, m, undefined) {
    // this mesh seems to be inverted, used to make the PipePlank model, there the matrix is inverted to correct this...
    'use strict';
    d3.Box = function(width, height, depth) {
        width /= 2;
        depth /= 2;

        let positionData = [];
        let normalData = [];

        // top
        positionData.push(width, height, -depth);
        positionData.push(width, height, -depth);
        positionData.push(-width, height, -depth);
        positionData.push(width, height, depth);
        positionData.push(-width, height, depth);
        positionData.push(-width, height, depth);
        for(let i = 6; i--; normalData.push(0 , 1, 0));

        // front
        positionData.push(-width, height, depth);
        positionData.push(-width, height, depth);
        positionData.push(-width, 0, depth);
        positionData.push(width, height, depth);
        positionData.push(width, 0, depth);
        positionData.push(width, 0, depth);
        for(let i = 6; i--; normalData.push(0 , 0, 1));

        // right
        positionData.push(width, height, depth);
        positionData.push(width, height, depth);
        positionData.push(width, 0, depth);
        positionData.push(width, height, -depth);
        positionData.push(width, 0, -depth);
        positionData.push(width, 0, -depth);
        for(let i = 6; i--; normalData.push(1 , 0, 0));

        // back
        positionData.push(width, height, -depth);
        positionData.push(width, height, -depth);
        positionData.push(width, 0, -depth);
        positionData.push(-width, height, -depth);
        positionData.push(-width, 0, -depth);
        positionData.push(-width, 0, -depth);
        for(let i = 6; i--; normalData.push(0 , 0, -1));

        // left
        positionData.push(-width, height, -depth);
        positionData.push(-width, height, -depth);
        positionData.push(-width, 0, -depth);
        positionData.push(-width, height, depth);
        positionData.push(-width, 0, depth);
        positionData.push(-width, 0, depth);
        for(let i = 6; i--; normalData.push(-1 , 0, 0));

        // bottom
        positionData.push(-width, 0, depth);
        positionData.push(-width, 0, depth);
        positionData.push(-width, 0, -depth);
        positionData.push(width, 0, depth);
        positionData.push(width, 0, -depth);
        positionData.push(width, 0, -depth);
        for(let i = 6; i--; normalData.push(0 , -1, 0));

        this.storeData(positionData, normalData);
    };
    d3.Box.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math);

(function(math, d3, v3, m4, m, undefined) {
    'use strict';
    d3.Camera = function() {
        this.fieldOfView = 45;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 10000;
        this.zoom = 1;
        this.viewMatrix = m4.identity([]);
        this.projectionMatrix = m4.identity([]);
    };
    let _ = d3.Camera.prototype;
    _.perspectiveProjectionMatrix = function() {
        let top = m.tan(this.fieldOfView / 360 * m.PI) * this.near * this.zoom;
        let right = this.aspect * top;
        return m4.frustum(-right, right, -top, top, this.near, this.far, this.projectionMatrix);
    };
    _.orthogonalProjectionMatrix = function() {
        let top = m.tan(this.fieldOfView / 360 * m.PI) * ((this.far - this.near) / 2 + this.near) * this.zoom;
        let right = this.aspect * top;
        return m4.ortho(-right, right, -top, top, this.near, this.far, this.projectionMatrix);
    };
    _.updateProjectionMatrix = function(isPerspective) {
        return isPerspective ? this.perspectiveProjectionMatrix() : this.orthogonalProjectionMatrix();
    };
    _.focalLength = function() {
        return (this.far - this.near) / 2 + this.near;
    };
    _.zoomOut = function() {
        this.zoom = m.min(this.zoom * 1.25, 200);
    };
    _.zoomIn = function() {
        this.zoom = m.max(this.zoom / 1.25, 1 / 400);
    };

})(ChemDoodle.math, ChemDoodle.structures.d3, ChemDoodle.lib.vec3, ChemDoodle.lib.mat4, window.Math);

(function(d3, m, m4, undefined) {
    'use strict';
    d3.LineArrow = function() {
        let d = 2.8;
        let w = 0.1;

        this.storeData([
                0, 0, -3, w, 0, -d,
                0, 0, -3, -w, 0, -d,

                0, 0, -3, 0, 0, 3,

                0, 0, 3, w, 0, d,
                0, 0, 3, -w, 0, d
            ],
            [
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0
            ]);
    };
    d3.LineArrow.prototype = new d3._Mesh();

    d3.Compass = function(gl, styles) {

        // setup text X Y Z
        this.textImage = new d3.TextImage();
        this.textImage.init(gl);
        this.textImage.updateFont(gl, styles.text_font_size, styles.text_font_families, styles.text_font_bold, styles.text_font_italic, styles.text_font_stroke_3D);

        this.textMesh = new d3.TextMesh();
        this.textMesh.init(gl);

        let screenRatioHeight = styles.compass_size_3D / gl.canvas.clientHeight;

        let height = 3 / screenRatioHeight;
        let tanTheta = m.tan(styles.projectionPerspectiveVerticalFieldOfView_3D / 360 * m.PI);
        let depth = height / tanTheta;
        let near = m.max(depth - height, 0.1);
        let far = depth + height;

        let aspec = gl.canvas.clientWidth / gl.canvas.clientHeight;

        let fnProjection, z;

        if (styles.projectionPerspective_3D) {
            z = near;
            fnProjection = m4.frustum;
        } else {
            z = depth;
            fnProjection = m4.ortho;
        }

        let nearRatio = z / gl.canvas.clientHeight * 2 * tanTheta;
        let top = tanTheta * z;
        let bottom = -top;
        let left = aspec * bottom;
        let right = aspec * top;

        if(styles.compass_type_3D === 0) {
            let deltaX = -(gl.canvas.clientWidth - styles.compass_size_3D) / 2 + this.textImage.charHeight;
            let deltaY = -(gl.canvas.clientHeight - styles.compass_size_3D) / 2 + this.textImage.charHeight;

            let x = deltaX * nearRatio;
            let y = deltaY * nearRatio;

            left -= x;
            right -= x;
            bottom -= y;
            top -= y;
        }

        this.projectionMatrix = fnProjection(left, right, bottom, top, near, far);
        this.translationMatrix = m4.translate(m4.identity([]), [ 0, 0, -depth ]);

        // vertex data for X Y Z text label
        let vertexData = {
            position : [],
            texCoord : [],
            translation : []
        };

        // it need to auto calculated somehow
        let textPos = 3.5;

        this.textImage.pushVertexData('X', [ textPos, 0, 0 ], 0, vertexData);
        this.textImage.pushVertexData('Y', [ 0, textPos, 0 ], 0, vertexData);
        this.textImage.pushVertexData('Z', [ 0, 0, textPos ], 0, vertexData);

        this.textMesh.storeData(gl, vertexData.position, vertexData.texCoord, vertexData.translation);
    };

    let _ = d3.Compass.prototype;
    _.renderArrow = function(gl, type, color, mvMatrix) {
        gl.material.setDiffuseColor(gl, color);
        gl.shader.setModelViewMatrix(gl, mvMatrix);
        if(type === 1) {
            gl.drawArrays(gl.LINES, 0, gl.lineArrowBuffer.vertexPositionBuffer.numItems);
        } else {
            gl.drawElements(gl.TRIANGLES, gl.arrowBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    };
    _.render = function(gl, styles) {
        gl.shader.setProjectionMatrix(gl, this.projectionMatrix);
        styles.compass_type_3D === 1 ? gl.lineArrowBuffer.bindBuffers(gl) : gl.arrowBuffer.bindBuffers(gl);

        gl.material.setTempColors(gl, styles.bonds_materialAmbientColor_3D, undefined, styles.bonds_materialSpecularColor_3D, styles.bonds_materialShininess_3D);

        let modelMatrix = m4.multiply(this.translationMatrix, gl.rotationMatrix, []);
        let angle = m.PI / 2;

        // x - axis
        this.renderArrow(gl, styles.compass_type_3D, styles.compass_axisXColor_3D, m4.rotateY(modelMatrix, angle, []));

        // y - axis
        this.renderArrow(gl, styles.compass_type_3D, styles.compass_axisYColor_3D, m4.rotateX(modelMatrix, -angle, []));

        // z - axis
        this.renderArrow(gl, styles.compass_type_3D, styles.compass_axisZColor_3D, modelMatrix);
    };
    _.renderAxis = function(gl) {
        gl.shader.setProjectionMatrix(gl, this.projectionMatrix);
        let mvMatrix = m4.multiply(this.translationMatrix, gl.rotationMatrix, []);
        gl.shader.setModelViewMatrix(gl, mvMatrix);

        this.textImage.useTexture(gl);
        this.textMesh.render(gl);
    };

})(ChemDoodle.structures.d3, Math, ChemDoodle.lib.mat4);

(function(d3, m, undefined) {
    'use strict';
    d3.Cylinder = function(radius, height, bands, closed) {
        let positionData = [];
        let normalData = [];

        if (closed) {
            for (let i = 0; i <= bands; i++) {
                let theta = i % bands * 2 * m.PI / bands;
                let cosTheta = m.cos(theta);
                let sinTheta = m.sin(theta);

                normalData.push(0, -1, 0);
                positionData.push(0, 0, 0);
                normalData.push(0, -1, 0);
                positionData.push(radius * cosTheta, 0, radius * sinTheta);

            }

            for (let i = 0; i <= bands; i++) {
                let theta = i % bands * 2 * m.PI / bands;
                let cosTheta = m.cos(theta);
                let sinTheta = m.sin(theta);

                normalData.push(cosTheta, 0, sinTheta);
                positionData.push(radius * cosTheta, 0, radius * sinTheta);

                normalData.push(cosTheta, 0, sinTheta);
                positionData.push(radius * cosTheta, height, radius * sinTheta);
            }

            for (let i = 0; i <= bands; i++) {
                let theta = i % bands * 2 * m.PI / bands;
                let cosTheta = m.cos(theta);
                let sinTheta = m.sin(theta);

                normalData.push(0, 1, 0);
                positionData.push(radius * cosTheta, height, radius * sinTheta);

                normalData.push(0, 1, 0);
                positionData.push(0, height, 0);
            }
        } else {
            for (let i = 0; i < bands; i++) {
                let theta = i * 2 * m.PI / bands;
                let cosTheta = m.cos(theta);
                let sinTheta = m.sin(theta);
                normalData.push(cosTheta, 0, sinTheta);
                positionData.push(radius * cosTheta, 0, radius * sinTheta);
                normalData.push(cosTheta, 0, sinTheta);
                positionData.push(radius * cosTheta, height, radius * sinTheta);
            }
            normalData.push(1, 0, 0);
            positionData.push(radius, 0, 0);
            normalData.push(1, 0, 0);
            positionData.push(radius, height, 0);
        }

        this.storeData(positionData, normalData);
    };
    d3.Cylinder.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math);

(function(ELEMENT, d3, m, v3, undefined) {
    'use strict';
    d3.Distance = function(a1, a2, node, offset) {
        this.a1 = a1;
        this.a2 = a2;
        this.node = node;
        this.offset = offset ? offset : 0;
    };
    let _ = d3.Distance.prototype = new d3._Measurement();
    _.calculateData = function(styles) {
        let positionData = [ this.a1.x, this.a1.y, this.a1.z, this.a2.x, this.a2.y, this.a2.z ];
        if (this.node) {
            let r1 = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.a1.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
            let r2 = styles.atoms_useVDWDiameters_3D ? ELEMENT[this.a2.label].vdWRadius * styles.atoms_vdwMultiplier_3D : styles.atoms_sphereDiameter_3D / 2;
            this.move = this.offset + m.max(r1, r2);
            this.displacement = [ (this.a1.x + this.a2.x) / 2 - this.node.x, (this.a1.y + this.a2.y) / 2 - this.node.y, (this.a1.z + this.a2.z) / 2 - this.node.z ];
            v3.normalize(this.displacement);
            let change = v3.scale(this.displacement, this.move, []);
            positionData[0] += change[0];
            positionData[1] += change[1];
            positionData[2] += change[2];
            positionData[3] += change[0];
            positionData[4] += change[1];
            positionData[5] += change[2];
        }
        let normalData = [ 0, 0, 0, 0, 0, 0 ];
        let indexData = [ 0, 1 ];
        this.storeData(positionData, normalData, indexData);
    };
    _.getText = function(styles) {
        let dist = this.a1.distance3D(this.a2);
        let center = [ (this.a1.x + this.a2.x) / 2, (this.a1.y + this.a2.y) / 2, (this.a1.z + this.a2.z) / 2 ];
        if (this.node) {
            let change = v3.scale(this.displacement, this.move+.1, []);
            center[0] += change[0];
            center[1] += change[1];
            center[2] += change[2];
        }
        return {
            pos : center,
            value : [ dist.toFixed(2), ' \u212b' ].join('')
        };
    };

})(ChemDoodle.ELEMENT, ChemDoodle.structures.d3, Math, ChemDoodle.lib.vec3);

(function(math, d3, v3, undefined) {
    'use strict';

    d3.Fog = function(color, fogStart, fogEnd, density) {
        this.fogScene(color, fogStart, fogEnd, density);
    };
    let _ = d3.Fog.prototype;
    _.fogScene = function(color, fogStart, fogEnd, density) {
        this.colorRGB = math.getRGB(color, 1);
        this.fogStart = fogStart;
        this.fogEnd = fogEnd;
        this.density = density;
    };

})(ChemDoodle.math, ChemDoodle.structures.d3, ChemDoodle.lib.vec3);

(function(ELEMENT, d3, undefined) {

    d3.Label = function(textImage) {
    };
    let _ = d3.Label.prototype;
    _.updateVerticesBuffer = function(gl, molecules, styles) {
        for ( let i = 0, ii = molecules.length; i < ii; i++) {
            let molecule = molecules[i];
            let moleculeLabel = molecule.labelMesh;
            let atoms = molecule.atoms;
            let vertexData = {
                position : [],
                texCoord : [],
                translation : []
            };

            let isMacro = atoms.length > 0 && atoms[0].hetatm != undefined;

            for ( let j = 0, jj = atoms.length; j < jj; j++) {
                let atom = atoms[j];

                let atomLabel = atom.label;
                let zDepth = 0.05;

                // Sphere or Ball and Stick
                if (styles.atoms_useVDWDiameters_3D) {
                    let add = ELEMENT[atomLabel].vdWRadius * styles.atoms_vdwMultiplier_3D;
                    if (add === 0) {
                        add = 1;
                    }
                    zDepth += add;
                }
                // if Stick or Wireframe
                else if (styles.atoms_sphereDiameter_3D) {
                    zDepth += styles.atoms_sphereDiameter_3D / 2 * 1.5;
                }

                if (isMacro) {
                    if (!atom.hetatm) {
                        if (!styles.macro_displayAtoms) {
                            continue;
                        }
                    } else if (atom.isWater) {
                        if (!styles.macro_showWaters) {
                            continue;
                        }
                    }
                }

                gl.textImage.pushVertexData(atom.altLabel ? atom.altLabel : atom.label, [ atom.x, atom.y, atom.z ], zDepth, vertexData);

            }

            let chains = molecule.chains;

            if (chains && (styles.proteins_displayRibbon || styles.proteins_displayBackbone)) {

                for ( let j = 0, jj = chains.length; j < jj; j++) {
                    let chain = chains[j];

                    for ( let k = 0, kk = chain.length; k < kk; k++) {
                        let residue = chain[k];

                        if (residue.name) {
                            let atom = residue.cp1;
                            gl.textImage.pushVertexData(residue.name, [ atom.x, atom.y, atom.z ], 2, vertexData);
                        }
                    }
                }

            }

            moleculeLabel.storeData(gl, vertexData.position, vertexData.texCoord, vertexData.translation, vertexData.zDepth);
        }
    };
    _.render = function(gl, styles, molecules) {
        // use projection for shader text.
        gl.shader.setMatrixUniforms(gl);

        gl.textImage.useTexture(gl);
        for ( let i = 0, ii = molecules.length; i < ii; i++) {
            if (molecules[i].labelMesh) {
                molecules[i].labelMesh.render(gl);
            }
        }
    };

})(ChemDoodle.ELEMENT, ChemDoodle.structures.d3);

(function(d3, m, undefined) {
    'use strict';
    d3.Sphere = function(radius, latitudeBands, longitudeBands) {
        let positionData = [];
        let normalData = [];
        for ( let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            let theta = latNumber * m.PI / latitudeBands;
            let sinTheta = m.sin(theta);
            let cosTheta = m.cos(theta);

            for ( let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                let phi = longNumber * 2 * m.PI / longitudeBands;
                let sinPhi = m.sin(phi);
                let cosPhi = m.cos(phi);

                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                normalData.push(x, y, z);
                positionData.push(radius * x, radius * y, radius * z);
            }
        }

        let indexData = [];
        longitudeBands += 1;
        for ( let latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for ( let longNumber = 0; longNumber < longitudeBands; longNumber++) {
                let first = (latNumber * longitudeBands) + (longNumber % longitudeBands);
                let second = first + longitudeBands;
                indexData.push(first, first + 1, second);
                if (longNumber < longitudeBands - 1) {
                    indexData.push(second, first + 1, second + 1);
                }
            }
        }

        this.storeData(positionData, normalData, indexData);
    };
    d3.Sphere.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math);

(function(RESIDUE, d3, m, v3, undefined) {
    'use strict';
    let loadPartition = function(gl, p) {
        // positions
        gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexPositionBuffer);
        gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, p.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // normals
        gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexNormalBuffer);
        gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, p.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // indexes
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.vertexIndexBuffer);
    };

    function SubRibbon(entire, name, indexes, pi) {
        this.entire = entire;
        this.name = name;
        this.indexes = indexes;
        this.pi = pi;
    }
    let _2 = SubRibbon.prototype;
    // NOTE: To use rainbow coloring for chains, it needs coloring each residue with total residue count
    // and current index residue in chain parameters.
    _2.getColor = function(styles) {
        if (styles.macro_colorByChain) {
            return this.entire.chainColor;
        } else if (this.name) {
            return this.getResidueColor(RESIDUE[this.name] ? this.name : '*', styles);
        } else if (this.helix) {
            return this.entire.front ? styles.proteins_ribbonCartoonHelixPrimaryColor : styles.proteins_ribbonCartoonHelixSecondaryColor;
        } else if (this.sheet) {
            return styles.proteins_ribbonCartoonSheetColor;
        } else {
            return this.entire.front ? styles.proteins_primaryColor : styles.proteins_secondaryColor;
        }
    };
    _2.getResidueColor = function(name, styles) {
        let r = RESIDUE[name];
        if (styles.proteins_residueColor === 'shapely') {
            return r.shapelyColor;
        } else if (styles.proteins_residueColor === 'amino') {
            return r.aminoColor;
        } else if (styles.proteins_residueColor === 'polarity') {
            if (r.polar) {
                return '#C10000';
            } else {
                return '#FFFFFF';
            }
        } else if (styles.proteins_residueColor === 'acidity') {
            if(r.acidity === 1){
                return '#0000FF';
            }else if(r.acidity === -1){
                return '#FF0000';
            }else if (r.polar) {
                return '#FFFFFF';
            } else {
                return '#773300';
            }
        }
        return '#FFFFFF';
    };
    _2.render = function(gl, styles, noColor) {
        if (this.entire.partitions && this.pi !== this.entire.partitions.lastRender) {
            loadPartition(gl, this.entire.partitions[this.pi]);
            this.entire.partitions.lastRender = this.pi;
        }
        if (!this.vertexIndexBuffer) {
            this.vertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indexes), gl.STATIC_DRAW);
            this.vertexIndexBuffer.itemSize = 1;
            this.vertexIndexBuffer.numItems = this.indexes.length;
        }
        // indexes
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        // colors
        if (!noColor && styles.proteins_residueColor !== 'rainbow') {
            gl.material.setDiffuseColor(gl, this.getColor(styles));
        }
        // render
        gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    };

    d3.Ribbon = function(chain, offset, cartoon) {
        // ribbon meshes build front to back, not side to side, so keep this in
        // mind
        let lineSegmentNum = chain[0].lineSegments.length;
        let lineSegmentLength = chain[0].lineSegments[0].length;
        this.partitions = [];
        this.partitions.lastRender = 0;
        let currentPartition;
        this.front = offset > 0;
        // calculate vertex and normal points
        for ( let i = 0, ii = chain.length; i < ii; i++) {
            if (!currentPartition || currentPartition.positionData.length > 65000) {
                if (this.partitions.length > 0) {
                    i--;
                }
                currentPartition = {
                    count : 0,
                    positionData : [],
                    normalData : []
                };
                this.partitions.push(currentPartition);
            }
            let residue = chain[i];
            currentPartition.count++;
            for ( let j = 0; j < lineSegmentNum; j++) {
                let lineSegment = cartoon ? residue.lineSegmentsCartoon[j] : residue.lineSegments[j];
                let doSide1 = j === 0;
                let doSide2 = false;
                for ( let k = 0; k < lineSegmentLength; k++) {
                    let a = lineSegment[k];
                    // normals
                    let abovei = i;
                    let abovek = k + 1;
                    if (i === chain.length - 1 && k === lineSegmentLength - 1) {
                        abovek--;
                    } else if (k === lineSegmentLength - 1) {
                        abovei++;
                        abovek = 0;
                    }
                    let above = cartoon ? chain[abovei].lineSegmentsCartoon[j][abovek] : chain[abovei].lineSegments[j][abovek];
                    let negate = false;
                    let nextj = j + 1;
                    if (j === lineSegmentNum - 1) {
                        nextj -= 2;
                        negate = true;
                    }
                    let side = cartoon ? residue.lineSegmentsCartoon[nextj][k] : residue.lineSegments[nextj][k];
                    let toAbove = [ above.x - a.x, above.y - a.y, above.z - a.z ];
                    let toSide = [ side.x - a.x, side.y - a.y, side.z - a.z ];
                    let normal = v3.cross(toAbove, toSide, []);
                    // positions
                    if (k === 0) {
                        // tip
                        v3.normalize(toAbove);
                        v3.scale(toAbove, -1);
                        currentPartition.normalData.push(toAbove[0], toAbove[1], toAbove[2]);
                        currentPartition.positionData.push(a.x, a.y, a.z);
                    }
                    if (doSide1 || doSide2) {
                        // sides
                        v3.normalize(toSide);
                        v3.scale(toSide, -1);
                        currentPartition.normalData.push(toSide[0], toSide[1], toSide[2]);
                        currentPartition.positionData.push(a.x, a.y, a.z);
                        if (doSide1 && k === lineSegmentLength - 1) {
                            doSide1 = false;
                            k = -1;
                        }
                    } else {
                        // center strips
                        v3.normalize(normal);
                        if (negate && !this.front || !negate && this.front) {
                            v3.scale(normal, -1);
                        }
                        currentPartition.normalData.push(normal[0], normal[1], normal[2]);
                        v3.scale(normal, m.abs(offset));
                        currentPartition.positionData.push(a.x + normal[0], a.y + normal[1], a.z + normal[2]);
                        if (j === lineSegmentNum - 1 && k === lineSegmentLength - 1) {
                            doSide2 = true;
                            k = -1;
                        }
                    }
                    if (k === -1 || k === lineSegmentLength - 1) {
                        // end
                        v3.normalize(toAbove);
                        currentPartition.normalData.push(toAbove[0], toAbove[1], toAbove[2]);
                        currentPartition.positionData.push(a.x, a.y, a.z);
                    }
                }
            }
        }

        // build mesh connectivity
        // add 2 to lineSegmentNum and lineSegmentLength to account for sides
        // and ends
        lineSegmentNum += 2;
        lineSegmentLength += 2;
        this.segments = [];
        this.partitionSegments = [];
        for ( let n = 0, nn = this.partitions.length; n < nn; n++) {
            let currentPartition = this.partitions[n];
            let partitionSegmentIndexData = [];
            let c = undefined;
            for ( let i = 0, ii = currentPartition.count - 1; i < ii; i++) {
                let chainIndex = i;
                for ( let j = 0; j < n; j++) {
                    chainIndex += this.partitions[j].count - 1;
                }
                c = chain[chainIndex];
                let residueIndexStart = i * lineSegmentNum * lineSegmentLength;
                let individualIndexData = [];
                for ( let j = 0, jj = lineSegmentNum - 1; j < jj; j++) {
                    let segmentIndexStart = residueIndexStart + j * lineSegmentLength;
                    for ( let k = 0; k < lineSegmentLength-1; k++) {
                        let nextRes = 1;
                        if (i === ii) {
                            nextRes = 0;
                        }
                        let add = [ segmentIndexStart + k, segmentIndexStart + lineSegmentLength + k, segmentIndexStart + lineSegmentLength + k + nextRes, segmentIndexStart + k, segmentIndexStart + k + nextRes, segmentIndexStart + lineSegmentLength + k + nextRes ];
                        if (k !== lineSegmentLength - 1) {
                            if (this.front) {
                                individualIndexData.push(add[0], add[1], add[2], add[3], add[5], add[4]);
                            } else {
                                individualIndexData.push(add[0], add[2], add[1], add[3], add[4], add[5]);
                            }
                        }
                        if (k === lineSegmentLength - 2 && !(i === currentPartition.count - 2 && n === this.partitions.length - 1)) {
                            // jump the gap, the other mesh points will be
                            // covered,
                            // so no need to explicitly skip them
                            let jump = lineSegmentNum * lineSegmentLength - k;
                            add[2] += jump;
                            add[4] += jump;
                            add[5] += jump;
                        }
                        if (this.front) {
                            partitionSegmentIndexData.push(add[0], add[1], add[2], add[3], add[5], add[4]);
                        } else {
                            partitionSegmentIndexData.push(add[0], add[2], add[1], add[3], add[4], add[5]);
                        }
                    }
                }

                if (cartoon && c.split) {
                    let sr = new SubRibbon(this, undefined, partitionSegmentIndexData, n);
                    sr.helix = c.helix;
                    sr.sheet = c.sheet;
                    this.partitionSegments.push(sr);
                    partitionSegmentIndexData = [];
                }

                this.segments.push(new SubRibbon(this, c.name, individualIndexData, n));
            }

            let sr = new SubRibbon(this, undefined, partitionSegmentIndexData, n);
            sr.helix = c.helix;
            sr.sheet = c.sheet;
            this.partitionSegments.push(sr);
        }
        this.storeData(this.partitions[0].positionData, this.partitions[0].normalData);
        if (this.partitions.length === 1) {
            // clear partitions to reduce overhead
            this.partitions = undefined;
        }
    };
    let _ = d3.Ribbon.prototype = new d3._Mesh();
    _.render = function(gl, styles) {
        this.bindBuffers(gl);
        // colors
        let color = styles.macro_colorByChain ? this.chainColor : undefined;
        if (!color) {
            color = this.front ? styles.proteins_primaryColor : styles.proteins_secondaryColor;
        }
        gl.material.setDiffuseColor(gl, color);

        for ( let i = 0, ii = this.partitionSegments.length; i < ii; i++) {
            this.partitionSegments[i].render(gl, styles, !styles.proteins_ribbonCartoonize);
        }
    };

})(ChemDoodle.RESIDUE, ChemDoodle.structures.d3, Math, ChemDoodle.lib.vec3);

(function(math, d3, v3, m4, undefined) {
    'use strict';
    d3.Light = function(diffuseColor, specularColor, direction) {
        this.camera = new d3.Camera();
        this.lightScene(diffuseColor, specularColor, direction);
    };
    let _ = d3.Light.prototype;
    _.lightScene = function(diffuseColor, specularColor, direction) {
        this.diffuseRGB = math.getRGB(diffuseColor, 1);
        this.specularRGB = math.getRGB(specularColor, 1);
        this.direction = direction;
        this.updateView();
    };
    _.updateView = function() {
        let lightDir = v3.normalize(this.direction, []);
        let eyePos = v3.scale(lightDir, (this.camera.near - this.camera.far) / 2 - this.camera.near, []);
        let up = v3.equal(lightDir, [0, 1, 0]) ? [0, 0, 1] : [0, 1, 0];
        m4.lookAt(eyePos, [0, 0, 0], up, this.camera.viewMatrix);
        this.camera.orthogonalProjectionMatrix();
    };

})(ChemDoodle.math, ChemDoodle.structures.d3, ChemDoodle.lib.vec3, ChemDoodle.lib.mat4);

(function(d3, undefined) {
    'use strict';
    d3.Line = function() {
        this.storeData([ 0, 0, 0, 0, 1, 0 ], [ 0, 0, 0, 0, 0, 0 ]);
    };
    d3.Line.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3);

(function(math, d3, undefined) {
    'use strict';
    d3.Material = function() {
    };
    let _ = d3.Material.prototype;
    _.setTempColors = function(gl, ambientColor, diffuseColor, specularColor, shininess) {
        if (ambientColor) {
            gl.shader.setMaterialAmbientColor(gl, math.getRGB(ambientColor, 1));
        }
        if (diffuseColor) {
            gl.shader.setMaterialDiffuseColor(gl, math.getRGB(diffuseColor, 1));
        }
        if (specularColor) {
            gl.shader.setMaterialSpecularColor(gl, math.getRGB(specularColor, 1));
        }
        gl.shader.setMaterialShininess(gl, shininess);
        gl.shader.setMaterialAlpha(gl, 1);
    };
    _.setDiffuseColor = function(gl, diffuseColor) {
        gl.shader.setMaterialDiffuseColor(gl, math.getRGB(diffuseColor, 1));
    };
    _.setAlpha = function(gl, alpha) {
        gl.shader.setMaterialAlpha(gl, alpha);
    };

})(ChemDoodle.math, ChemDoodle.structures.d3);

(function(d3, math, document, undefined) {
    'use strict';
    d3.Picker = function() {
    };
    let _ = d3.Picker.prototype;

    _.init = function(gl) {
        // setup for picking system
        this.framebuffer = gl.createFramebuffer();

        // set pick texture
        let texture2D = gl.createTexture();
        let renderbuffer = gl.createRenderbuffer();

        gl.bindTexture(gl.TEXTURE_2D, texture2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

        // set framebuffer and bind the texture and renderbuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2D, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    _.setDimension = function(gl, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // get binded depth attachment renderbuffer
        let renderbuffer = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
        if (gl.isRenderbuffer(renderbuffer)) {
            // set renderbuffer dimension
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }

        // get binded color attachment texture 2d
        let texture2D = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
        if (gl.isTexture(texture2D)) {
            // set texture dimension
            gl.bindTexture(gl.TEXTURE_2D, texture2D);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

})(ChemDoodle.structures.d3, ChemDoodle.math, document);

(function(d3, m, undefined) {
    'use strict';

    d3.Pill = function(radius, height, latitudeBands, longitudeBands) {

        let capHeightScale = 1;
        let capDiameter = 2 * radius;

        height -= capDiameter;

        if (height < 0) {
            capHeightScale = 0;
            height += capDiameter;
        } else if (height < capDiameter) {
            capHeightScale = height / capDiameter;
            height = capDiameter;
        }

        // update latitude and logintude band for two caps.
        // latitudeBands *= 2;
        // longitudeBands *= 2;

        let positionData = [];
        let normalData = [];
        for ( let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
            let theta = latNumber * m.PI / latitudeBands;
            let sinTheta = m.sin(theta);
            let cosTheta = m.cos(theta) * capHeightScale;

            for ( let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                let phi = longNumber * 2 * m.PI / longitudeBands;
                let sinPhi = m.sin(phi);
                let cosPhi = m.cos(phi);

                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                normalData.push(x, y, z);
                positionData.push(radius * x, radius * y + (latNumber < latitudeBands / 2 ? height : 0), radius * z);
            }
        }

        let indexData = [];
        longitudeBands += 1;
        for ( let latNumber = 0; latNumber < latitudeBands; latNumber++) {
            for ( let longNumber = 0; longNumber < longitudeBands; longNumber++) {
                let first = (latNumber * longitudeBands) + (longNumber % longitudeBands);
                let second = first + longitudeBands;
                indexData.push(first, first + 1, second);
                if (longNumber < longitudeBands - 1) {
                    indexData.push(second, first + 1, second + 1);
                }
            }
        }

        this.storeData(positionData, normalData, indexData);
    };
    d3.Pill.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math);

(function(extensions, RESIDUE, structures, d3, m, m4, v3, math, undefined) {
    'use strict';

    function createDummyResidue(x, y, z) {
        let dummyRes = new structures.Residue(-1);
        dummyRes.cp1 = dummyRes.cp2 = new structures.Atom('', x, y, z);
        return dummyRes;
    }

    function Pipe(a1, a2) {
        this.a1 = a1;
        this.a2 = a2;
    };
    let _1 = Pipe.prototype;
    _1.render = function(gl, styles) {
        let p1 = this.a1;
        let p2 = this.a2;
        let height = 1.001 * p1.distance3D(p2);
        let radiusScale = styles.proteins_cylinderHelixDiameter / 2;
        let scaleVector = [ radiusScale, height, radiusScale ];
        let transform = m4.translate(m4.identity(), [ p1.x, p1.y, p1.z ]);
        let y = [ 0, 1, 0 ];
        let ang = 0;
        let axis;
        if (p1.x === p2.x && p1.z === p2.z) {
            axis = [ 0, 0, 1 ];
            if (p2.y < p1.y) {
                ang = m.PI;
            }
        } else {
            let a2b = [ p2.x - p1.x, p2.y - p1.y, p2.z - p1.z ];
            ang = extensions.vec3AngleFrom(y, a2b);
            axis = v3.cross(y, a2b, []);
        }

        if (ang !== 0) {
            m4.rotate(transform, ang, axis);
        }
        m4.scale(transform, scaleVector);
        gl.shader.setMatrixUniforms(gl, transform);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderClosedBuffer.vertexPositionBuffer.numItems);
    };

    function Plank(a1, a2, vx) {
        this.a1 = a1;
        this.a2 = a2;
        this.vx = vx;
    };
    let _2 = Plank.prototype;
    _2.render = function(gl, styles) {
        if (this.styles) {
            styles = this.styles;
        }
        // this is the elongation vector for the plank
        let height = 1.001 * this.a1.distance3D(this.a2);

        let diry = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
        let dirz = v3.cross(diry, this.vx, []);
        let dirx = v3.cross(dirz, diry, []);

        v3.normalize(dirx);
        v3.normalize(diry);
        v3.normalize(dirz);

        let transform = [
            dirx[0], dirx[1], dirx[2], 0,
            diry[0], diry[1], diry[2], 0,
            dirz[0], dirz[1], dirz[2], 0,
            this.a1.x, this.a1.y, this.a1.z, 1
        ];

        let scaleVector = [ styles.proteins_plankSheetWidth, height, styles.proteins_tubeThickness];
        m4.scale(transform, scaleVector);
        gl.shader.setMatrixUniforms(gl, transform);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.boxBuffer.vertexPositionBuffer.numItems);
    };


    d3.PipePlank = function(rs, styles) {
        this.tubes = [];
        this.helixCylinders = [];
        this.sheetPlanks = [];
        this.chainColor = rs.chainColor;

        let chainNoSS = [];
        let noSSResidues = [];
        let helixResidues = [];
        let sheetResidues = [];

        // the first residue just a dummy residue.
        // so at beginning, the secondary structure of second residue must be check
        if(rs.length > 1) {
            let r0 = rs[0];
            let r1 = rs[1];
            if (r1.helix) {
                helixResidues.push(r0);
            } else if(r1.sheet) {
                sheetResidues.push(r0);
            } else {
                noSSResidues.push(r0);
            }
        }

        // iterate residues
        for ( let i = 1, ii = rs.length - 1; i <= ii; i++) {
            let residue = rs[i];
            if(residue.helix) {
                helixResidues.push(residue);

                if(residue.arrow) {
                    let startPoint = v3.create();
                    let endPoint = v3.create();

                    if (helixResidues.length === 1) {
                        // just 1 part in a helix
                        startPoint = [residue.guidePointsSmall[0].x, residue.guidePointsSmall[0].y, residue.guidePointsSmall[0].z];
                        let last = residue.guidePointsSmall[residue.guidePointsSmall.length-1];
                        endPoint = [last.x, last.y, last.z];
                    }else if (helixResidues.length === 2) {
                        // PDB like 2PEC have helix which is just have 2 residues in it.
                        startPoint = [helixResidues[0].cp1.x, helixResidues[0].cp1.y, helixResidues[0].cp1.z];
                        endPoint = [helixResidues[1].cp1.x, helixResidues[1].cp1.y, helixResidues[1].cp1.z];
                    } else {
                        // To get helix axis, we need at least 4 residues.
                        // if residues lenght is 3, then one residue need to be added.
                        // The added residue is residue before helix.
                        if(helixResidues.length === 3) {
                            helixResidues.unshift(rs[m.max(i - 3, 0)]);
                        }

                        let Ps = [];
                        let Vs = [];

                        for (let h = 1, hh = helixResidues.length - 1; h < hh; h++) {
                            let cai = [helixResidues[h].cp1.x, helixResidues[h].cp1.y, helixResidues[h].cp1.z];
                            let A = [helixResidues[h-1].cp1.x, helixResidues[h-1].cp1.y, helixResidues[h-1].cp1.z];
                            let B = [helixResidues[h+1].cp1.x, helixResidues[h+1].cp1.y, helixResidues[h+1].cp1.z];

                            v3.subtract(A, cai);
                            v3.subtract(B, cai);

                            let Al = v3.scale(A, v3.length(B), []);
                            let Bl = v3.scale(B, v3.length(A), []);

                            let V = v3.normalize(v3.add(Al, Bl, []));

                            Ps.push(cai);
                            Vs.push(V);
                        }

                        let axes = [];
                        for (let h = 0, hh = Ps.length - 1; h < hh; h++) {
                            let P1 = Ps[h];
                            let V1 = Vs[h];
                            let P2 = Ps[h+1];
                            let V2 = Vs[h+1];

                            let H = v3.normalize(v3.cross(V1, V2, []));

                            let P2subP1 = v3.subtract(P2, P1, []);
                            let d = v3.dot(P2subP1, H);

                            let dH = v3.scale(H, d, []);

                            let dHl = v3.length(dH);
                            let P2subP1l = v3.length(P2subP1);

                            let r = -(dHl * dHl - P2subP1l * P2subP1l) / (2 * v3.dot(v3.subtract(P1, P2, []), V2));

                            let H1 = v3.add(P1, v3.scale(V1, r, []), []);
                            let H2 = v3.add(P2, v3.scale(V2, r, []), []);

                            axes.push([H1, H2]);
                        }
                        let firstPoint = axes[0][0];
                        let secondPoint = axes[0][1];
                        let secondToFirst = v3.subtract(firstPoint, secondPoint, []);
                        v3.add(firstPoint, secondToFirst, startPoint);

                        firstPoint = axes[axes.length-1][1];
                        secondPoint = axes[axes.length-1][0];
                        secondToFirst = v3.subtract(firstPoint, secondPoint, []);
                        v3.add(firstPoint, secondToFirst, endPoint);

                    }

                    let startAtom = new structures.Atom('', startPoint[0], startPoint[1], startPoint[2]);
                    let endAtom = new structures.Atom('', endPoint[0], endPoint[1], endPoint[2]);

                    this.helixCylinders.push(new Pipe(startAtom, endAtom));

                    helixResidues = [];

                    // get vector direction from Pipe end to start
                    let helixDir = v3.subtract(startPoint, endPoint, []);
                    v3.normalize(helixDir);
                    v3.scale(helixDir, .5);

                    if (noSSResidues.length > 0) {

                        let additionCp = v3.add(startPoint, helixDir, []);
                        let prevResCp = noSSResidues[noSSResidues.length - 1].cp1;
                        let helixDirToPrevRes = v3.subtract([prevResCp.x, prevResCp.y, prevResCp.z], additionCp, []);
                        v3.normalize(helixDirToPrevRes);
                        v3.scale(helixDirToPrevRes, .5);
                        v3.add(additionCp, helixDirToPrevRes);
                        let dummyRes = new structures.Residue(-1);
                        dummyRes.cp1 = dummyRes.cp2 = new structures.Atom('', additionCp[0], additionCp[1], additionCp[2]);
                        noSSResidues.push(dummyRes);

                        // force the non secondary structure spline to end on helix start point.
                        dummyRes = createDummyResidue(startPoint[0], startPoint[1], startPoint[2]);
                        noSSResidues.push(dummyRes);

                        chainNoSS.push(noSSResidues);
                    }

                    noSSResidues = [];

                    // check for next residue
                    if (i < ii) {
                        // force the non secondary structure spline to start on helix end point.
                        let dummyRes = createDummyResidue(endPoint[0], endPoint[1], endPoint[2]);
                        noSSResidues.push(dummyRes);

                        let rm = rs[i + 1];
                        if (rm.sheet) {
                            noSSResidues.push(residue);
                            noSSResidues.push(residue);
                            chainNoSS.push(noSSResidues);
                            noSSResidues = [];

                            sheetResidues.push(residue);
                        } else {
                            // force the non secondary structure spline to start on helix end point.
                            v3.scale(helixDir, -1);
                            let additionCp = v3.add(endPoint, helixDir, []);
                            let nextResCp = rm.cp1;
                            let helixDirToNextRes = v3.subtract([nextResCp.x, nextResCp.y, nextResCp.z], additionCp, []);
                            v3.normalize(helixDirToNextRes);
                            v3.scale(helixDirToNextRes, .5);
                            v3.add(additionCp, helixDirToNextRes);
                            let dummyRes = createDummyResidue(additionCp[0], additionCp[1], additionCp[2]);
                            noSSResidues.push(dummyRes);
                        }
                    }
                }

            } else if(residue.sheet) {

                sheetResidues.push(residue);
                if(residue.arrow) {

                    let p1 = [0, 0, 0];
                    let p2 = [0, 0, 0];
                    let hh = sheetResidues.length;
                    for(let h = 0; h < hh; h++) {
                        let guidePoints = sheetResidues[h].guidePointsLarge;
                        let gp1 = guidePoints[0];
                        let gp2 = guidePoints[guidePoints.length - 1];

                        v3.add(p1, [gp1.x, gp1.y, gp1.z]);
                        v3.add(p2, [gp2.x, gp2.y, gp2.z]);
                    }

                    v3.scale(p1, 1 / hh);
                    v3.scale(p2, 1 / hh);

                    let dirx = v3.subtract(p1, p2);

                    let firstRs = sheetResidues[0];
                    let lastRs = sheetResidues[hh - 1];

                    let firstGuidePoints = firstRs.guidePointsSmall[0];
                    let lastGuidePoints = lastRs.guidePointsSmall[0];

                    this.sheetPlanks.push(new Plank(firstGuidePoints, lastGuidePoints, dirx));

                    sheetResidues = [];

                    if (i < ii) {
                        let rm = rs[i + 1];

                        if (rm.sheet) {
                            sheetResidues.push(residue);
                        } else {
                            let dummyRes = createDummyResidue(lastGuidePoints.x, lastGuidePoints.y, lastGuidePoints.z);
                            noSSResidues.push(dummyRes);
                        }
                    }
                }

            } else {
                noSSResidues.push(residue);

                if (i < ii) {
                    let rm = rs[i + 1];
                    if (rm.sheet) {
                        let guidePoints = residue.guidePointsSmall[0];
                        let dummyRes = createDummyResidue(guidePoints.x, guidePoints.y, guidePoints.z);

                        noSSResidues.push(dummyRes);

                        chainNoSS.push(noSSResidues);
                        noSSResidues = [];

                        sheetResidues.push(residue);
                    }
                }
            }
        }

        if(noSSResidues.length > 1) {
            if(noSSResidues.length == 2) {
                noSSResidues.push(noSSResidues[noSSResidues.length - 1]);
            }
            chainNoSS.push(noSSResidues);
        }
        noSSResidues = [];

        let chainSegments = [];
        for ( let n = 0, nn = chainNoSS.length; n < nn; n++) {
            let nhs = chainNoSS[n];
            let lineSegmentsList = [];

            for ( let i = 0, ii = nhs.length - 1; i <= ii; i++) {
                lineSegmentsList.push(nhs[i].cp1);
            }
            chainSegments.push(lineSegmentsList);
        }

        for (let i = 0, ii = chainSegments.length; i < ii; i++) {
            let t = new d3.CatmullTube(chainSegments[i], styles.proteins_tubeThickness, styles.proteins_tubeResolution_3D, styles.proteins_horizontalResolution);
            t.chainColor = rs.chainColor;
            this.tubes.push(t);
        }
    };
    let _ = d3.PipePlank.prototype = new d3._Mesh();
    _.render = function(gl, styles) {
        gl.material.setTempColors(gl, styles.proteins_materialAmbientColor_3D, undefined, styles.proteins_materialSpecularColor_3D, styles.proteins_materialShininess_3D);

        // colors
        gl.material.setDiffuseColor(gl, styles.macro_colorByChain ? this.chainColor : styles.proteins_tubeColor);
        for ( let j = 0, jj = this.tubes.length; j < jj; j++) {
            gl.shader.setMatrixUniforms(gl);
            this.tubes[j].render(gl, styles);
        }

        if(!styles.macro_colorByChain) {
            gl.material.setDiffuseColor(gl, styles.proteins_ribbonCartoonHelixSecondaryColor);
        }

        gl.cylinderClosedBuffer.bindBuffers(gl);
        for (let j = 0, jj = this.helixCylinders.length; j < jj; j++) {
            this.helixCylinders[j].render(gl, styles);
        }

        if(!styles.macro_colorByChain) {
            gl.material.setDiffuseColor(gl, styles.proteins_ribbonCartoonSheetColor);
        }

        gl.boxBuffer.bindBuffers(gl);
        for (let j = 0, jj = this.sheetPlanks.length; j < jj; j++) {
            this.sheetPlanks[j].render(gl, styles);
        }

    };

})(ChemDoodle.extensions, ChemDoodle.RESIDUE, ChemDoodle.structures, ChemDoodle.structures.d3, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3, ChemDoodle.math);

(function(d3, undefined) {
    'use strict';
    d3.Quad = function() {
        let positionData = [
            -1, 1, 0,
            -1, -1, 0,
            1, 1, 0,
            1, -1, 0
        ];
        let normalData = [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ];
        this.storeData(positionData, normalData);
    };
    d3.Quad.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3);

(function(structures, d3, v3, undefined) {
    'use strict';
    d3.Shape = function(points, thickness) {
        // points must be in the xy-plane, all z-coords must be 0, thickness
        // will be in the z-plane
        let numPoints = points.length;
        let positionData = [];
        let normalData = [];

        // calculate vertex and normal points
        let center = new structures.Point();
        for ( let i = 0, ii = numPoints; i < ii; i++) {
            let next = i + 1;
            if (i === ii - 1) {
                next = 0;
            }
            let z = [ 0, 0, 1 ];
            let currentPoint = points[i];
            let nextPoint = points[next];
            let v = [ nextPoint.x - currentPoint.x, nextPoint.y - currentPoint.y, 0 ];
            let normal = v3.cross(z, v);
            // first four are for the side normal
            // second four will do both the bottom and top triangle normals
            for ( let j = 0; j < 2; j++) {
                positionData.push(currentPoint.x, currentPoint.y, thickness / 2);
                positionData.push(currentPoint.x, currentPoint.y, -thickness / 2);
                positionData.push(nextPoint.x, nextPoint.y, thickness / 2);
                positionData.push(nextPoint.x, nextPoint.y, -thickness / 2);
            }
            // side normals
            for ( let j = 0; j < 4; j++) {
                normalData.push(normal[0], normal[1], normal[2]);
            }
            // top and bottom normals
            normalData.push(0, 0, 1);
            normalData.push(0, 0, -1);
            normalData.push(0, 0, 1);
            normalData.push(0, 0, -1);
            center.add(currentPoint);
        }
        // centers
        center.x /= numPoints;
        center.y /= numPoints;
        normalData.push(0, 0, 1);
        positionData.push(center.x, center.y, thickness / 2);
        normalData.push(0, 0, -1);
        positionData.push(center.x, center.y, -thickness / 2);

        // build mesh connectivity
        let indexData = [];
        let centerIndex = numPoints * 8;
        for ( let i = 0, ii = numPoints; i < ii; i++) {
            let start = i * 8;
            // sides
            indexData.push(start);
            indexData.push(start + 3);
            indexData.push(start + 1);
            indexData.push(start);
            indexData.push(start + 2);
            indexData.push(start + 3);
            // top and bottom
            indexData.push(start + 4);
            indexData.push(centerIndex);
            indexData.push(start + 6);
            indexData.push(start + 5);
            indexData.push(start + 7);
            indexData.push(centerIndex + 1);
        }

        this.storeData(positionData, normalData, indexData);
    };
    d3.Shape.prototype = new d3._Mesh();

})(ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.lib.vec3);

(function(d3, m, v3, undefined) {
    'use strict';
    d3.Star = function() {
        let ps = [ .8944, .4472, 0, .2764, .4472, .8506, .2764, .4472, -.8506, -.7236, .4472, .5257, -.7236, .4472, -.5257, -.3416, .4472, 0, -.1056, .4472, .3249, -.1056, .4472, -.3249, .2764, .4472, .2008, .2764, .4472, -.2008, -.8944, -.4472, 0, -.2764, -.4472, .8506, -.2764, -.4472, -.8506, .7236, -.4472, .5257, .7236, -.4472, -.5257, .3416, -.4472, 0, .1056, -.4472, .3249, .1056, -.4472, -.3249, -.2764, -.4472, .2008, -.2764, -.4472, -.2008, -.5527, .1058, 0, -.1708, .1058, .5527, -.1708,
            .1058, -.5527, .4471, .1058, .3249, .4471, .1058, -.3249, .5527, -.1058, 0, .1708, -.1058, .5527, .1708, -.1058, -.5527, -.4471, -.1058, .3249, -.4471, -.1058, -.3249, 0, 1, 0, 0, -1, 0 ];
        let is = [ 0, 9, 8, 2, 7, 9, 4, 5, 7, 3, 6, 5, 1, 8, 6, 0, 8, 23, 30, 6, 8, 3, 21, 6, 11, 26, 21, 13, 23, 26, 2, 9, 24, 30, 8, 9, 1, 23, 8, 13, 25, 23, 14, 24, 25, 4, 7, 22, 30, 9, 7, 0, 24, 9, 14, 27, 24, 12, 22, 27, 3, 5, 20, 30, 7, 5, 2, 22, 7, 12, 29, 22, 10, 20, 29, 1, 6, 21, 30, 5, 6, 4, 20, 5, 10, 28, 20, 11, 21, 28, 10, 19, 18, 12, 17, 19, 14, 15, 17, 13, 16, 15, 11, 18, 16, 31, 19, 17, 14, 17, 27, 2, 27, 22, 4, 22, 29, 10, 29, 19, 31, 18, 19, 12, 19, 29, 4, 29, 20, 3, 20, 28,
            11, 28, 18, 31, 16, 18, 10, 18, 28, 3, 28, 21, 1, 21, 26, 13, 26, 16, 31, 15, 16, 11, 16, 26, 1, 26, 23, 0, 23, 25, 14, 25, 15, 31, 17, 15, 13, 15, 25, 0, 25, 24, 2, 24, 27, 12, 27, 17 ];

        let positionData = [];
        let normalData = [];
        let indexData = [];
        for ( let i = 0, ii = is.length; i < ii; i += 3) {
            let j1 = is[i] * 3;
            let j2 = is[i + 1] * 3;
            let j3 = is[i + 2] * 3;

            let p1 = [ ps[j1], ps[j1 + 1], ps[j1 + 2] ];
            let p2 = [ ps[j2], ps[j2 + 1], ps[j2 + 2] ];
            let p3 = [ ps[j3], ps[j3 + 1], ps[j3 + 2] ];

            let toAbove = [ p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2] ];
            let toSide = [ p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2] ];
            let normal = v3.cross(toSide, toAbove, []);
            v3.normalize(normal);

            positionData.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
            normalData.push(normal[0], normal[1], normal[2], normal[0], normal[1], normal[2], normal[0], normal[1], normal[2]);
            indexData.push(i, i + 1, i + 2);
        }

        this.storeData(positionData, normalData, indexData);
    };
    d3.Star.prototype = new d3._Mesh();

})(ChemDoodle.structures.d3, Math, ChemDoodle.lib.vec3);

(function(d3, extensions, document, window, undefined) {
    'use strict';
    let ratio = 1;
    if(window.devicePixelRatio){
        ratio = window.devicePixelRatio;
    }

    d3.TextImage = function() {
        this.ctx = document.createElement('canvas').getContext('2d');
        this.data = [];
        this.text = '';
        this.charHeight = 0;
    };

    let _ = d3.TextImage.prototype;

    _.init = function(gl) {
        // init texture
        this.textureImage = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textureImage);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.updateFont(gl, 12, [ 'Sans-serif' ], false, false, false);
    };

    _.charData = function(character) {
        let index = this.text.indexOf(character);
        return index >= 0 ? this.data[index] : null;
    };

    _.updateFont = function(gl, fontSize, fontFamilies, fontBold, fontItalic, fontStroke) {
        let ctx = this.ctx;
        let canvas = this.ctx.canvas;
        let data = [];
        let text = "";
        fontSize *= ratio;
        let contextFont = extensions.getFontString(fontSize, fontFamilies, fontBold, fontItalic);

        ctx.font = contextFont;

        ctx.save();

        let totalWidth = 0;
        let charHeight = fontSize * 1.5;

        for ( let i = 32, ii = 127; i < ii; i++) {

            // skip control characters
            // if(i <= 31 || i == 127) continue;

            let character = String.fromCharCode(i), width = ctx.measureText(character).width;

            data.push({
                text : character,
                width : width,
                height : charHeight
            });

            totalWidth += width * 2;
        }

        // add other characters
        let chars = '\u00b0\u212b\u00AE'.split('');
        for ( let i = 0, ii = chars.length; i < ii; i++) {

            let character = chars[i], width = ctx.measureText(character).width;

            data.push({
                text : character,
                width : width,
                height : charHeight
            });

            totalWidth += width * 2;
        }

        let areaImage = totalWidth * charHeight;
        let sqrtArea = Math.sqrt(areaImage);
        let totalRows = Math.ceil(sqrtArea / charHeight);
        let maxWidth = Math.ceil(totalWidth / (totalRows - 1));

        canvas.width = maxWidth;
        canvas.height = totalRows * charHeight;

        ctx.font = contextFont;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.4;

        ctx.fillStyle = "#fff";

        let offsetRow = 0;
        let posX = 0;
        for ( let i = 0, ii = data.length; i < ii; i++) {
            let charData = data[i];
            let charWidth = charData.width * 2;
            let charHeight = charData.height;
            let charText = charData.text;
            let willWidth = posX + charWidth;

            if (willWidth > maxWidth) {
                offsetRow++;
                posX = 0;
            }

            let posY = offsetRow * charHeight;

            if (fontStroke) {
                // stroke must draw before fill
                ctx.strokeText(charText, posX, posY + (charHeight / 2));
            }

            ctx.fillText(charText, posX, posY + (charHeight / 2));

            charData.x = posX;
            charData.y = posY;

            text += charText;
            posX += charWidth;
        }

        this.text = text;
        this.data = data;
        this.charHeight = charHeight;

        // also update the texture
        gl.bindTexture(gl.TEXTURE_2D, this.textureImage);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    _.pushVertexData = function(text, position, zDepth, data) {
        // characters of string text
        let textPiece = text.toString().split("");

        // height of texture image
        let heightImage = this.getHeight();
        let widthImage = this.getWidth();

        let x1 = -this.textWidth(text) / 2 / ratio;
        let y1 = -this.charHeight / 2 / ratio;

        // iterate each character
        for ( let j = 0, jj = textPiece.length; j < jj; j++) {
            let charData = this.charData(textPiece[j]);

            let width = charData.width;
            let left = charData.x / widthImage;
            let right = left + charData.width * 1.8 / widthImage;
            let top = charData.y / heightImage;
            let bottom = top + charData.height / heightImage;

            let x2 = x1 + width * 1.8 / ratio;
            let y2 = this.charHeight / 2 / ratio;

            data.position.push(
                // left top
                position[0], position[1], position[2],
                // right top
                position[0], position[1], position[2],
                // right bottom
                position[0], position[1], position[2],

                // left top
                position[0], position[1], position[2],
                // left bottom
                position[0], position[1], position[2],
                // right bottom
                position[0], position[1], position[2]);

            data.texCoord.push(
                // left top
                left, top,
                // right bottom
                right, bottom,
                // right top
                right, top,

                // left top
                left, top,
                // left bottom
                left, bottom,
                // right bottom
                right, bottom);

            data.translation.push(
                // left top
                x1, y2, zDepth,
                // right bottom
                x2, y1, zDepth,
                // right top
                x2, y2, zDepth,

                // left top
                x1, y2, zDepth,
                // left bottom
                x1, y1, zDepth,
                // right bottom
                x2, y1, zDepth);

            x1 = x2 + (width - width * 1.8) / ratio;
        }

    };
    _.getCanvas = function() {
        return this.ctx.canvas;
    };
    _.getHeight = function() {
        return this.getCanvas().height;
    };
    _.getWidth = function() {
        return this.getCanvas().width;
    };
    _.textWidth = function(text) {
        return this.ctx.measureText(text).width;
    };
    _.test = function() {
        document.body.appendChild(this.getCanvas());
    };
    _.useTexture = function(gl) {
        gl.bindTexture(gl.TEXTURE_2D, this.textureImage);
    };

})(ChemDoodle.structures.d3, ChemDoodle.extensions, document, window);

(function(d3, m, undefined) {
    'use strict';
    d3.TextMesh = function() {
    };
    let _ = d3.TextMesh.prototype;
    _.init = function(gl) {
        // set vertex buffer
        this.vertexPositionBuffer = gl.createBuffer();
        this.vertexTexCoordBuffer = gl.createBuffer();
        this.vertexTranslationBuffer = gl.createBuffer();
    };
    _.setVertexData = function(gl, vertexBuffer, bufferData, itemSize) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
        vertexBuffer.itemSize = itemSize;
        vertexBuffer.numItems = bufferData.length / itemSize;
    };
    _.storeData = function(gl, vertexPositionData, vertexTexCoordData, vertexTranslationData) {
        this.setVertexData(gl, this.vertexPositionBuffer, vertexPositionData, 3);
        this.setVertexData(gl, this.vertexTexCoordBuffer, vertexTexCoordData, 2);
        this.setVertexData(gl, this.vertexTranslationBuffer, vertexTranslationData, 3);
    };
    _.bindBuffers = function(gl) {
        // positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // texCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
        gl.vertexAttribPointer(gl.shader.vertexTexCoordAttribute, this.vertexTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // translation and z depth
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTranslationBuffer);
        gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, this.vertexTranslationBuffer.itemSize, gl.FLOAT, false, 0, 0);
    };
    _.render = function(gl) {
        let numItems = this.vertexPositionBuffer.numItems;

        if (!numItems) {
            // nothing to do here
            return;
        }

        this.bindBuffers(gl);
        gl.drawArrays(gl.TRIANGLES, 0, numItems);
    };

})(ChemDoodle.structures.d3, Math);

(function(ELEMENT, math, d3, m, m4, v3, undefined) {
    'use strict';
    d3.Torsion = function(a1, a2, a3, a4) {
        this.a1 = a1;
        this.a2 = a2;
        this.a3 = a3;
        this.a4 = a4;
    };
    let _ = d3.Torsion.prototype = new d3._Measurement();
    _.calculateData = function(styles) {
        let positionData = [];
        let normalData = [];
        let indexData = [];
        let dist1 = this.a2.distance3D(this.a1);
        let dist2 = this.a2.distance3D(this.a3);
        this.distUse = m.min(dist1, dist2) / 2;
        // data for the angle
        let b1 = [ this.a2.x - this.a1.x, this.a2.y - this.a1.y, this.a2.z - this.a1.z ];
        let b2 = [ this.a3.x - this.a2.x, this.a3.y - this.a2.y, this.a3.z - this.a2.z ];
        let b3 = [ this.a4.x - this.a3.x, this.a4.y - this.a3.y, this.a4.z - this.a3.z ];
        let cross12 = v3.cross(b1, b2, []);
        let cross23 = v3.cross(b2, b3, []);
        v3.scale(b1, v3.length(b2));
        this.torsion = m.atan2(v3.dot(b1, cross23), v3.dot(cross12, cross23));

        let vec1 = v3.normalize(v3.cross(cross12, b2, []));
        let vec3 = v3.normalize(v3.cross(b2, vec1, []));

        this.pos = v3.add([ this.a2.x, this.a2.y, this.a2.z ], v3.scale(v3.normalize(b2, []), this.distUse));

        let vec0 = [];

        let bands = styles.measurement_angleBands_3D;
        let norm = undefined;
        let i = 0;
        for (i = 0; i <= bands; ++i) {
            let theta = this.torsion * i / bands;
            let vecCos = v3.scale(vec1, m.cos(theta), []);
            let vecSin = v3.scale(vec3, m.sin(theta), []);
            norm = v3.scale(v3.normalize(v3.add(vecCos, vecSin, [])), this.distUse);

            if (i == 0) {
                vec0 = norm;
            }

            positionData.push(this.pos[0] + norm[0], this.pos[1] + norm[1], this.pos[2] + norm[2]);
            normalData.push(0, 0, 0);
            if (i < bands) {
                indexData.push(i, i + 1);
            }
        }

        this.vecText = v3.normalize(v3.add(vec0, norm, []));

        let arrowLength = 0.25;
        let b2Norm = v3.normalize(b2, []);
        v3.scale(b2Norm, arrowLength / 4);

        let theta = this.torsion - m.asin(arrowLength / 2) * 2 * this.torsion / m.abs(this.torsion);
        let vecCos = v3.scale(vec1, m.cos(theta), []);
        let vecSin = v3.scale(vec3, m.sin(theta), []);
        norm = v3.scale(v3.normalize(v3.add(vecCos, vecSin, [])), this.distUse);

        positionData.push(this.pos[0] + b2Norm[0] + norm[0], this.pos[1] + b2Norm[1] + norm[1], this.pos[2] + b2Norm[2] + norm[2]);
        normalData.push(0, 0, 0);

        positionData.push(this.pos[0] - b2Norm[0] + norm[0], this.pos[1] - b2Norm[1] + norm[1], this.pos[2] - b2Norm[2] + norm[2]);
        normalData.push(0, 0, 0);

        indexData.push(--i, i + 1, i, i + 2);

        this.storeData(positionData, normalData, indexData);
    };
    _.getText = function(styles) {
        v3.add(this.pos, v3.scale(this.vecText, this.distUse + 0.3, []));

        return {
            pos : this.pos,
            value : [ math.angleBounds(this.torsion, true, true).toFixed(2), ' \u00b0' ].join('')
        };
    };

})(ChemDoodle.ELEMENT, ChemDoodle.math, ChemDoodle.structures.d3, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3);

(function(extensions, RESIDUE, structures, d3, m, m4, v3, math, undefined) {
    'use strict';
    let loadPartition = function(gl, p) {
        // positions
        gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexPositionBuffer);
        gl.vertexAttribPointer(gl.shader.vertexPositionAttribute, p.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // normals
        gl.bindBuffer(gl.ARRAY_BUFFER, p.vertexNormalBuffer);
        gl.vertexAttribPointer(gl.shader.vertexNormalAttribute, p.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
        // indexes
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.vertexIndexBuffer);
    };

    let PointRotator = function(point, axis, angle) {
        let d = m.sqrt(axis[1] * axis[1] + axis[2] * axis[2]);
        let Rx = [ 1, 0, 0, 0, 0, axis[2] / d, -axis[1] / d, 0, 0, axis[1] / d, axis[2] / d, 0, 0, 0, 0, 1 ];
        let RxT = [ 1, 0, 0, 0, 0, axis[2] / d, axis[1] / d, 0, 0, -axis[1] / d, axis[2] / d, 0, 0, 0, 0, 1 ];
        let Ry = [ d, 0, -axis[0], 0, 0, 1, 0, 0, axis[0], 0, d, 0, 0, 0, 0, 1 ];
        let RyT = [ d, 0, axis[0], 0, 0, 1, 0, 0, -axis[0], 0, d, 0, 0, 0, 0, 1 ];
        let Rz = [ m.cos(angle), -m.sin(angle), 0, 0, m.sin(angle), m.cos(angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
        let matrix = m4.multiply(Rx, m4.multiply(Ry, m4.multiply(Rz, m4.multiply(RyT, RxT, []))));
        this.rotate = function() {
            return m4.multiplyVec3(matrix, point);
        };
    };

    d3.Tube = function(chain, thickness, cylinderResolution) {
        let lineSegmentNum = chain[0].lineSegments[0].length;
        this.partitions = [];
        let currentPartition;
        this.ends = [];
        this.ends.push(chain[0].lineSegments[0][0]);
        this.ends.push(chain[chain.length - 1].lineSegments[0][0]);
        // calculate vertex and normal points
        let last = [ 1, 0, 0 ];
        for ( let i = 0, ii = chain.length; i < ii; i++) {
            if (!currentPartition || currentPartition.positionData.length > 65000) {
                if (this.partitions.length > 0) {
                    i--;
                }
                currentPartition = {
                    count : 0,
                    positionData : [],
                    normalData : [],
                    indexData : []
                };
                this.partitions.push(currentPartition);
            }
            let residue = chain[i];
            currentPartition.count++;
            let min = Infinity;
            let p = new structures.Atom('', chain[i].cp1.x, chain[i].cp1.y, chain[i].cp1.z);
            for ( let j = 0; j < lineSegmentNum; j++) {
                let currentPoint = residue.lineSegments[0][j];
                let nextPoint;
                if (j === lineSegmentNum - 1) {
                    if (i === chain.length - 1) {
                        nextPoint = residue.lineSegments[0][j - 1];
                    } else {
                        nextPoint = chain[i + 1].lineSegments[0][0];
                    }
                } else {
                    nextPoint = residue.lineSegments[0][j + 1];
                }
                let axis = [ nextPoint.x - currentPoint.x, nextPoint.y - currentPoint.y, nextPoint.z - currentPoint.z ];
                v3.normalize(axis);
                if (i === chain.length - 1 && j === lineSegmentNum - 1) {
                    v3.scale(axis, -1);
                }
                let startVector = v3.cross(axis, last, []);
                v3.normalize(startVector);
                v3.scale(startVector, thickness / 2);
                let rotator = new PointRotator(startVector, axis, 2 * Math.PI / cylinderResolution);
                for ( let k = 0, kk = cylinderResolution; k < kk; k++) {
                    let use = rotator.rotate();
                    if (k === m.floor(cylinderResolution / 4)) {
                        last = [ use[0], use[1], use[2] ];
                    }
                    currentPartition.normalData.push(use[0], use[1], use[2]);
                    currentPartition.positionData.push(currentPoint.x + use[0], currentPoint.y + use[1], currentPoint.z + use[2]);
                }
                // find closest point to attach stick to
                if (p) {
                    let dist = currentPoint.distance3D(p);
                    if (dist < min) {
                        min = dist;
                        chain[i].pPoint = currentPoint;
                    }
                }
            }
        }

        // build mesh connectivity
        for ( let n = 0, nn = this.partitions.length; n < nn; n++) {
            let currentPartition = this.partitions[n];
            for ( let i = 0, ii = currentPartition.count - 1; i < ii; i++) {
                let indexStart = i * lineSegmentNum * cylinderResolution;
                for ( let j = 0, jj = lineSegmentNum; j < jj; j++) {
                    let segmentIndexStart = indexStart + j * cylinderResolution;
                    for ( let k = 0; k < cylinderResolution; k++) {
                        let next = 1;
                        let sk = segmentIndexStart + k;
                        currentPartition.indexData.push(sk);
                        currentPartition.indexData.push(sk + cylinderResolution);
                        currentPartition.indexData.push(sk + cylinderResolution + next);
                        currentPartition.indexData.push(sk);
                        currentPartition.indexData.push(sk + cylinderResolution + next);
                        currentPartition.indexData.push(sk + next);
                    }
                }
            }
        }

        this.storeData(this.partitions[0].positionData, this.partitions[0].normalData, this.partitions[0].indexData);

        let ps = [ new structures.Point(2, 0) ];
        for ( let i = 0; i < 60; i++) {
            let ang = i / 60 * m.PI;
            ps.push(new structures.Point(2 * m.cos(ang), -2 * m.sin(ang)));
        }
        ps.push(new structures.Point(-2, 0), new structures.Point(-2, 4), new structures.Point(2, 4));
        let platform = new structures.d3.Shape(ps, 1);

        this.render = function(gl, styles) {
            // draw tube
            this.bindBuffers(gl);
            // colors
            gl.material.setDiffuseColor(gl, styles.macro_colorByChain ? this.chainColor : styles.nucleics_tubeColor);
            // render
            gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            if (this.partitions) {
                for ( let i = 1, ii = this.partitions.length; i < ii; i++) {
                    let p = this.partitions[i];
                    loadPartition(gl, p);
                    // render
                    gl.drawElements(gl.TRIANGLES, p.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                }
            }

            // draw ends
            gl.sphereBuffer.bindBuffers(gl);
            for ( let i = 0; i < 2; i++) {
                let p = this.ends[i];
                let transform = m4.translate(m4.identity(), [ p.x, p.y, p.z ]);
                let radius = thickness / 2;
                m4.scale(transform, [ radius, radius, radius ]);
                // render
                gl.shader.setMatrixUniforms(gl, transform);
                gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            }

            // draw nucleotide handles
            gl.cylinderBuffer.bindBuffers(gl);
            for ( let i = 0, ii = chain.length - 1; i < ii; i++) {
                let residue = chain[i];
                let p1 = residue.pPoint;
                let p2 = new structures.Atom('', residue.cp2.x, residue.cp2.y, residue.cp2.z);
                let height = 1.001 * p1.distance3D(p2);
                let scaleVector = [ thickness / 4, height, thickness / 4 ];
                let transform = m4.translate(m4.identity(), [ p1.x, p1.y, p1.z ]);
                let y = [ 0, 1, 0 ];
                let ang = 0;
                let axis;
                let a2b = [ p2.x - p1.x, p2.y - p1.y, p2.z - p1.z ];
                if (p1.x === p2.x && p1.z === p2.z) {
                    axis = [ 0, 0, 1 ];
                    if (p1.y < p1.y) {
                        ang = m.PI;
                    }
                } else {
                    ang = extensions.vec3AngleFrom(y, a2b);
                    axis = v3.cross(y, a2b, []);
                }
                if (ang !== 0) {
                    m4.rotate(transform, ang, axis);
                }
                m4.scale(transform, scaleVector);
                gl.shader.setMatrixUniforms(gl, transform);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, gl.cylinderBuffer.vertexPositionBuffer.numItems);
            }

            // draw nucleotide platforms
            platform.bindBuffers(gl);
            // colors
            if (styles.nucleics_residueColor === 'none' && !styles.macro_colorByChain) {
                gl.material.setDiffuseColor(gl, styles.nucleics_baseColor);
            }
            for ( let i = 0, ii = chain.length - 1; i < ii; i++) {
                let residue = chain[i];
                let p2 = residue.cp2;
                let transform = m4.translate(m4.identity(), [ p2.x, p2.y, p2.z ]);
                // rotate to direction
                let y = [ 0, 1, 0 ];
                let ang = 0;
                let axis;
                let p3 = residue.cp3;
                if(p3){
                    let a2b = [ p3.x - p2.x, p3.y - p2.y, p3.z - p2.z ];
                    if (p2.x === p3.x && p2.z === p3.z) {
                        axis = [ 0, 0, 1 ];
                        if (p2.y < p2.y) {
                            ang = m.PI;
                        }
                    } else {
                        ang = extensions.vec3AngleFrom(y, a2b);
                        axis = v3.cross(y, a2b, []);
                    }
                    if (ang !== 0) {
                        m4.rotate(transform, ang, axis);
                    }
                    // rotate to orientation
                    let x = [ 1, 0, 0 ];
                    let rM = m4.rotate(m4.identity([]), ang, axis);
                    m4.multiplyVec3(rM, x);
                    let p4 = residue.cp4;
                    let p5 = residue.cp5;
                    if (!(p4.y === p5.y && p4.z === p5.z)) {
                        let pivot = [ p5.x - p4.x, p5.y - p4.y, p5.z - p4.z ];
                        let ang2 = extensions.vec3AngleFrom(x, pivot);
                        if (v3.dot(a2b, v3.cross(x, pivot)) < 0) {
                            ang2 *= -1;
                        }
                        m4.rotateY(transform, ang2);
                    }
                    // color
                    if (!styles.macro_colorByChain) {
                        if (styles.nucleics_residueColor === 'shapely') {
                            if (RESIDUE[residue.name]) {
                                gl.material.setDiffuseColor(gl, RESIDUE[residue.name].shapelyColor);
                            } else {
                                gl.material.setDiffuseColor(gl, RESIDUE['*'].shapelyColor);
                            }
                        } else if (styles.nucleics_residueColor === 'rainbow') {
                            gl.material.setDiffuseColor(gl, math.rainbowAt(i, ii, styles.macro_rainbowColors));
                        }
                    }
                    // render
                    gl.shader.setMatrixUniforms(gl, transform);
                    gl.drawElements(gl.TRIANGLES, platform.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                }
            }

        };
    };
    d3.Tube.prototype = new d3._Mesh();

    d3.CatmullTube = function(chains, thickness, cylinderResolution, horizontalResolution) {
        let chain = [];
        chains.push(chains[chains.length - 1]);
        for ( let i = 0, ii = chains.length - 2; i <= ii; i++) {
            let p0 = chains[i == 0 ? 0 : i - 1];
            let p1 = chains[i + 0];
            let p2 = chains[i + 1];
            let p3 = chains[i == ii ? i + 1 : i + 2];

            let segments = [];

            for(let j = 0; j < horizontalResolution; j++) {

                let t = j / horizontalResolution;
                if(i == ii) {
                    t = j / (horizontalResolution-1);
                }

                let x = 0.5 * ((2 * p1.x) +
                    (p2.x - p0.x) * t +
                    (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t * t +
                    (3*p1.x - p0.x - 3 * p2.x + p3.x) * t * t * t);
                let y = 0.5 * ((2 * p1.y) +
                    (p2.y - p0.y) * t +
                    (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t * t +
                    (3*p1.y -p0.y - 3 * p2.y + p3.y) * t * t * t);
                let z = 0.5 * ((2 * p1.z) +
                    (p2.z - p0.z) * t +
                    (2*p0.z - 5*p1.z + 4*p2.z - p3.z) * t * t +
                    (3*p1.z -p0.z - 3 * p2.z + p3.z) * t * t * t);

                let o = new structures.Atom('C', x, y, z);
                segments.push(o);
            }

            chain.push(segments);
        }

        let lineSegmentNum = chain[0].length;
        this.partitions = [];
        let currentPartition;
        this.ends = [];
        this.ends.push(chain[0][0]);
        this.ends.push(chain[chain.length - 1][0]);

        // calculate vertex and normal points
        let last = [ 1, 0, 0 ];
        for ( let i = 0, ii = chain.length; i < ii; i++) {
            if (!currentPartition || currentPartition.positionData.length > 65000) {
                if (this.partitions.length > 0) {
                    i--;
                }
                currentPartition = {
                    count : 0,
                    positionData : [],
                    normalData : [],
                    indexData : []
                };
                this.partitions.push(currentPartition);
            }

            let residue = chain[i];

            currentPartition.count++;
            let min = Infinity;
            // let p = new structures.Atom('', chain[i].cp1.x, chain[i].cp1.y, chain[i].cp1.z);
            for ( let j = 0; j < lineSegmentNum; j++) {
                let currentPoint = residue[j];
                let nextPoint;
                if (j === lineSegmentNum - 1) {
                    if (i === chain.length - 1) {
                        nextPoint = residue[j - 1];
                    } else {
                        nextPoint = chain[i + 1][0];
                    }
                } else {
                    nextPoint = residue[j + 1];
                }

                let axis = [ nextPoint.x - currentPoint.x, nextPoint.y - currentPoint.y, nextPoint.z - currentPoint.z ];
                v3.normalize(axis);
                if (i === chain.length - 1 && j === lineSegmentNum - 1) {
                    v3.scale(axis, -1);
                }
                let startVector = v3.cross(axis, last, []);
                v3.normalize(startVector);
                v3.scale(startVector, thickness / 2);
                let rotator = new PointRotator(startVector, axis, 2 * Math.PI / cylinderResolution);
                for ( let k = 0, kk = cylinderResolution; k < kk; k++) {
                    let use = rotator.rotate();
                    if (k === m.floor(cylinderResolution / 4)) {
                        last = [ use[0], use[1], use[2] ];
                    }
                    currentPartition.normalData.push(use[0], use[1], use[2]);
                    currentPartition.positionData.push(currentPoint.x + use[0], currentPoint.y + use[1], currentPoint.z + use[2]);
                }
            }
        }

        // build mesh connectivity
        for ( let n = 0, nn = this.partitions.length; n < nn; n++) {
            let currentPartition = this.partitions[n];
            for ( let i = 0, ii = currentPartition.count - 1; i < ii; i++) {
                let indexStart = i * lineSegmentNum * cylinderResolution;
                for ( let j = 0, jj = lineSegmentNum; j < jj; j++) {
                    let segmentIndexStart = indexStart + j * cylinderResolution;
                    for ( let k = 0; k <= cylinderResolution; k++) {
                        let sk = segmentIndexStart + k % cylinderResolution;
                        currentPartition.indexData.push(sk, sk + cylinderResolution);
                    }
                }
            }
        }

        this.storeData(this.partitions[0].positionData, this.partitions[0].normalData, this.partitions[0].indexData);
    };
    let _ = d3.CatmullTube.prototype = new d3._Mesh();
    _.render = function(gl, styles) {
        // draw tube
        this.bindBuffers(gl);

        // render
        for ( let i = 0, ii = this.partitions.length; i < ii; i++) {
            let p = this.partitions[i];
            loadPartition(gl, p);
            // render
            gl.drawElements(gl.TRIANGLE_STRIP, p.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        // draw ends
        gl.sphereBuffer.bindBuffers(gl);
        for ( let i = 0; i < 2; i++) {
            let p = this.ends[i];
            let transform = m4.translate(m4.identity(), [ p.x, p.y, p.z ]);
            let radius = styles.proteins_tubeThickness / 2;
            m4.scale(transform, [ radius, radius, radius ]);
            // render
            gl.shader.setMatrixUniforms(gl, transform);
            gl.drawElements(gl.TRIANGLES, gl.sphereBuffer.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    };

})(ChemDoodle.extensions, ChemDoodle.RESIDUE, ChemDoodle.structures, ChemDoodle.structures.d3, Math, ChemDoodle.lib.mat4, ChemDoodle.lib.vec3, ChemDoodle.math);

(function(d3, v3, undefined) {
    'use strict';
    d3.UnitCell = function(unitCellVectors) {
        this.unitCell = unitCellVectors;
        let positionData = [];
        let normalData = [];
        // calculate vertex and normal points

        let pushSide = function(p1, p2, p3, p4) {
            positionData.push(p1[0], p1[1], p1[2]);
            positionData.push(p2[0], p2[1], p2[2]);
            positionData.push(p3[0], p3[1], p3[2]);
            positionData.push(p4[0], p4[1], p4[2]);
            // push 0s for normals so shader gives them full color
            for ( let i = 0; i < 4; i++) {
                normalData.push(0, 0, 0);
            }
        };
        pushSide(unitCellVectors.o, unitCellVectors.x, unitCellVectors.xy, unitCellVectors.y);
        pushSide(unitCellVectors.o, unitCellVectors.y, unitCellVectors.yz, unitCellVectors.z);
        pushSide(unitCellVectors.o, unitCellVectors.z, unitCellVectors.xz, unitCellVectors.x);
        pushSide(unitCellVectors.yz, unitCellVectors.y, unitCellVectors.xy, unitCellVectors.xyz);
        pushSide(unitCellVectors.xyz, unitCellVectors.xz, unitCellVectors.z, unitCellVectors.yz);
        pushSide(unitCellVectors.xy, unitCellVectors.x, unitCellVectors.xz, unitCellVectors.xyz);

        // build mesh connectivity
        let indexData = [];
        for ( let i = 0; i < 6; i++) {
            let start = i * 4;
            // sides
            indexData.push(start, start + 1, start + 1, start + 2, start + 2, start + 3, start + 3, start);
        }

        this.storeData(positionData, normalData, indexData);
    };
    let _ = d3.UnitCell.prototype = new d3._Mesh();
    _.render = function(gl, styles) {
        gl.shader.setMatrixUniforms(gl);
        this.bindBuffers(gl);
        // colors
        gl.material.setDiffuseColor(gl, styles.shapes_color);
        gl.lineWidth(styles.shapes_lineWidth);
        // render
        gl.drawElements(gl.LINES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.vec3);

(function(d3, math, document, undefined) {
    'use strict';
    d3.Framebuffer = function() {
    };
    let _ = d3.Framebuffer.prototype;

    _.init = function(gl) {
        this.framebuffer = gl.createFramebuffer();
    };

    _.setColorTexture = function(gl, texture, attachment) {
        let i = attachment === undefined ? 0 : attachment;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    _.setColorRenderbuffer = function(gl, renderbuffer, attachment) {
        let i = attachment === undefined ? 0 : attachment;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.RENDERBUFFER, renderbuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    _.setDepthTexture = function(gl, texture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    _.setDepthRenderbuffer = function(gl, renderbuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    _.bind = function(gl, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, width, height);
    };

})(ChemDoodle.structures.d3, ChemDoodle.math, document);

(function(d3, math, document, undefined) {
    'use strict';
    d3.Renderbuffer = function() {
    };
    let _ = d3.Renderbuffer.prototype;

    _.init = function(gl, format) {
        this.renderbuffer = gl.createRenderbuffer();
        this.format = format;
    };

    _.setParameter = function(gl, width, height) {
        this.width = width;
        this.height = height;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.format, this.width, this.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };

})(ChemDoodle.structures.d3, ChemDoodle.math, document);

(function(math, d3, m, undefined) {
    'use strict';
    d3.SSAO = function() {
    };
    let _ = d3.SSAO.prototype;

    _.initSampleKernel = function(kernelSize) {
        let sampleKernel = [];

        for(let i = 0; i < kernelSize; i++) {
            let x = m.random() * 2.0 - 1.0;
            let y = m.random() * 2.0 - 1.0;
            let z = m.random() * 2.0 - 1.0;

            let scale = i / kernelSize;
            let scale2 = scale * scale;
            let lerp = 0.1 + scale2 * 0.9;

            x *= lerp;
            y *= lerp;
            z *= lerp;

            sampleKernel.push(x, y, z);
        }

        this.sampleKernel = new Float32Array(sampleKernel);
    };

    _.initNoiseTexture = function(gl) {
        let noiseSize = 16;
        let ssaoNoise = [];

        for(let i = 0; i < noiseSize; i++) {
            ssaoNoise.push(m.random() * 2 - 1);
            ssaoNoise.push(m.random() * 2 - 1);
            ssaoNoise.push(0.0);
        }

        this.noiseTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 4, 4, 0, gl.RGB, gl.FLOAT, new Float32Array(ssaoNoise));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, null);
    };

})(ChemDoodle.math, ChemDoodle.structures.d3, Math);

(function(d3, math, document, undefined) {
    'use strict';
    d3.Texture = function() {
    };
    let _ = d3.Texture.prototype;

    _.init = function(gl, type, internalFormat, format) {
        this.texture = gl.createTexture();
        this.type = type;
        this.internalFormat = internalFormat;
        this.format = format !== undefined ? format : internalFormat;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    _.setParameter = function(gl, width, height) {
        this.width = width;
        this.height = height;

        // set texture dimension
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

})(ChemDoodle.structures.d3, ChemDoodle.math, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';
    d3._Shader = function() {
    };
    let _ = d3._Shader.prototype;
    _.useShaderProgram = function(gl) {
        gl.useProgram(this.gProgram);
        gl.shader = this;
    };
    _.init = function(gl) {
        let vertexShader = this.getShader(gl, 'vertex-shader');
        if (!vertexShader) {
            vertexShader = this.loadDefaultVertexShader(gl);
        }
        let fragmentShader = this.getShader(gl, 'fragment-shader');
        if (!fragmentShader) {
            fragmentShader = this.loadDefaultFragmentShader(gl);
        }

        this.gProgram = gl.createProgram();

        gl.attachShader(this.gProgram, vertexShader);
        gl.attachShader(this.gProgram, fragmentShader);

        this.onShaderAttached(gl);

        gl.linkProgram(this.gProgram);

        if (!gl.getProgramParameter(this.gProgram, gl.LINK_STATUS)) {
            alert('Could not initialize shaders: ' + gl.getProgramInfoLog(this.gProgram));
        }

        gl.useProgram(this.gProgram);
        this.initUniformLocations(gl);
        gl.useProgram(null);
    };
    _.onShaderAttached = function(gl) {
        // set vertex attributes explicitly
        this.vertexPositionAttribute = 0;
        this.vertexNormalAttribute = 1;

        gl.bindAttribLocation(this.gProgram, this.vertexPositionAttribute, 'a_vertex_position');
        gl.bindAttribLocation(this.gProgram, this.vertexNormalAttribute, 'a_vertex_normal');
    };
    _.getShaderFromStr = function(gl, shaderType, strSrc) {
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, strSrc);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(shaderScript.type + ' ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return undefined;
        }
        return shader;
    };
    _.enableAttribsArray = function(gl) {
        gl.enableVertexAttribArray(this.vertexPositionAttribute);
    };
    _.disableAttribsArray = function(gl) {
        gl.disableVertexAttribArray(this.vertexPositionAttribute);
    };
    _.getShader = function(gl, id) {
        let shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return undefined;
        }
        let sb = [];
        let k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType === 3) {
                sb.push(k.textContent);
            }
            k = k.nextSibling;
        }
        let sdrSrc = sb.join('');
        let shader;
        if (shaderScript.type === 'x-shader/x-fragment') {
            shader = this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sdrSrc);
        } else if (shaderScript.type === 'x-shader/x-vertex') {
            shader = this.getShaderFromStr(gl, gl.VERTEX_SHADER, sdrSrc);
        } else {
            return undefined;
        }
        return shader;
    };
    _.initUniformLocations = function(gl) {
        this.modelViewMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_model_view_matrix');
        this.projectionMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_projection_matrix');
    };
    _.loadDefaultVertexShader = function(gl) {
    };
    _.loadDefaultFragmentShader = function(gl) {
    };
    _.setMatrixUniforms = function(gl, modelMatrix) {
        if(modelMatrix === undefined) {
            this.setModelViewMatrix(gl, gl.modelViewMatrix);
        } else {
            this.setModelViewMatrix(gl, m4.multiply(gl.modelViewMatrix, modelMatrix, []));
        }
    };
    _.setProjectionMatrix = function(gl, matrix) {
        gl.uniformMatrix4fv(this.projectionMatrixUniform, false, matrix);
    };
    _.setModelViewMatrix = function(gl, mvMatrix) {
        gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, mvMatrix);
    };
    _.setMaterialAmbientColor = function(gl, ambient) {
    };
    _.setMaterialDiffuseColor = function(gl, diffuse) {
    };
    _.setMaterialSpecularColor = function(gl, specular) {
    };
    _.setMaterialShininess = function(gl, shininess) {
    };
    _.setMaterialAlpha = function(gl, alpha) {
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.FXAAShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.FXAAShader.prototype = new d3._Shader();
    _.initUniformLocations = function(gl) {
        // assign uniform properties
        _super.initUniformLocations.call(this, gl);
        this.buffersizeUniform = gl.getUniformLocation(this.gProgram, 'u_buffersize');
        this.antialiasUniform = gl.getUniformLocation(this.gProgram, 'u_antialias');

        this.edgeThresholdUniform = gl.getUniformLocation(this.gProgram, 'u_edge_threshold');
        this.edgeThresholdMinUniform = gl.getUniformLocation(this.gProgram, 'u_edge_threshold_min');
        this.searchStepsUniform = gl.getUniformLocation(this.gProgram, 'u_search_steps');
        this.searchThresholdUniform = gl.getUniformLocation(this.gProgram, 'u_search_threshold');
        this.subpixCapUniform = gl.getUniformLocation(this.gProgram, 'u_subpix_cap');
        this.subpixTrimUniform = gl.getUniformLocation(this.gProgram, 'u_subpix_trim');
    };
    _.setBuffersize = function(gl, width, height) {
        gl.uniform2f(this.buffersizeUniform, width, height);
    };
    _.setAntialias = function(gl, val) {
        gl.uniform1f(this.antialiasUniform, val);
    };
    _.setEdgeThreshold = function(gl, val) {
        gl.uniform1f(this.edgeThresholdUniform, val);
    };
    _.setEdgeThresholdMin = function(gl, val) {
        gl.uniform1f(this.edgeThresholdMinUniform, val);
    };
    _.setSearchSteps = function(gl, val) {
        gl.uniform1i(this.searchStepsUniform, val);
    };
    _.setSearchThreshold = function(gl, val) {
        gl.uniform1f(this.searchThresholdUniform, val);
    };
    _.setSubpixCap = function(gl, val) {
        gl.uniform1f(this.subpixCapUniform, val);
    };
    _.setSubpixTrim = function(gl, val) {
        gl.uniform1f(this.subpixTrimUniform, val);
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            'varying vec2 v_texcoord;',

            'void main() {',
            'gl_Position = vec4(a_vertex_position, 1.);',
            'v_texcoord = a_vertex_position.xy * .5 + .5;',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };

    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            'precision mediump float;',

            'const int fxaaMaxSearchSteps = 128;',

            'uniform float u_edge_threshold;',
            'uniform float u_edge_threshold_min;',
            'uniform int u_search_steps;',
            'uniform float u_search_threshold;',
            'uniform float u_subpix_cap;',
            'uniform float u_subpix_trim;',

            'uniform sampler2D u_sampler0;',
            'uniform vec2 u_buffersize;',
            'uniform bool u_antialias;',

            'varying vec2 v_texcoord;',

            'float FxaaLuma(vec3 rgb) {',
            'return rgb.y * (0.587/0.299) + rgb.x;',
            '}',

            'vec3 FxaaLerp3(vec3 a, vec3 b, float amountOfA) {',
            'return (vec3(-amountOfA) * b) + ((a * vec3(amountOfA)) + b);',
            '}',

            'vec4 FxaaTexOff(sampler2D tex, vec2 pos, vec2 off, vec2 rcpFrame) {',
            'return texture2D(tex, pos + off * rcpFrame);',
            '}',

            'vec3 FxaaPixelShader(vec2 pos, sampler2D tex, vec2 rcpFrame) {',
            'float subpix_trim_scale = (1.0/(1.0 - u_subpix_trim));',
            'vec3 rgbN = FxaaTexOff(tex, pos.xy, vec2( 0.,-1.), rcpFrame).xyz;',
            'vec3 rgbW = FxaaTexOff(tex, pos.xy, vec2(-1., 0.), rcpFrame).xyz;',
            'vec3 rgbM = FxaaTexOff(tex, pos.xy, vec2( 0., 0.), rcpFrame).xyz;',
            'vec3 rgbE = FxaaTexOff(tex, pos.xy, vec2( 1., 0.), rcpFrame).xyz;',
            'vec3 rgbS = FxaaTexOff(tex, pos.xy, vec2( 0., 1.), rcpFrame).xyz;',

            'float lumaN = FxaaLuma(rgbN);',
            'float lumaW = FxaaLuma(rgbW);',
            'float lumaM = FxaaLuma(rgbM);',
            'float lumaE = FxaaLuma(rgbE);',
            'float lumaS = FxaaLuma(rgbS);',
            'float rangeMin = min(lumaM, min(min(lumaN, lumaW), min(lumaS, lumaE)));',
            'float rangeMax = max(lumaM, max(max(lumaN, lumaW), max(lumaS, lumaE)));',

            'float range = rangeMax - rangeMin;',
            'if(range < max(u_edge_threshold_min, rangeMax * u_edge_threshold)) {',
            'return rgbM;',
            '}',

            'vec3 rgbL = rgbN + rgbW + rgbM + rgbE + rgbS;',

            'float lumaL = (lumaN + lumaW + lumaE + lumaS) * 0.25;',
            'float rangeL = abs(lumaL - lumaM);',
            'float blendL = max(0.0, (rangeL / range) - u_subpix_trim) * subpix_trim_scale;',
            'blendL = min(u_subpix_cap, blendL);',

            'vec3 rgbNW = FxaaTexOff(tex, pos.xy, vec2(-1.,-1.), rcpFrame).xyz;',
            'vec3 rgbNE = FxaaTexOff(tex, pos.xy, vec2( 1.,-1.), rcpFrame).xyz;',
            'vec3 rgbSW = FxaaTexOff(tex, pos.xy, vec2(-1., 1.), rcpFrame).xyz;',
            'vec3 rgbSE = FxaaTexOff(tex, pos.xy, vec2( 1., 1.), rcpFrame).xyz;',
            'rgbL += (rgbNW + rgbNE + rgbSW + rgbSE);',
            'rgbL *= vec3(1.0/9.0);',

            'float lumaNW = FxaaLuma(rgbNW);',
            'float lumaNE = FxaaLuma(rgbNE);',
            'float lumaSW = FxaaLuma(rgbSW);',
            'float lumaSE = FxaaLuma(rgbSE);',

            'float edgeVert =',
            'abs((0.25 * lumaNW) + (-0.5 * lumaN) + (0.25 * lumaNE)) +',
            'abs((0.50 * lumaW ) + (-1.0 * lumaM) + (0.50 * lumaE )) +',
            'abs((0.25 * lumaSW) + (-0.5 * lumaS) + (0.25 * lumaSE));',
            'float edgeHorz =',
            'abs((0.25 * lumaNW) + (-0.5 * lumaW) + (0.25 * lumaSW)) +',
            'abs((0.50 * lumaN ) + (-1.0 * lumaM) + (0.50 * lumaS )) +',
            'abs((0.25 * lumaNE) + (-0.5 * lumaE) + (0.25 * lumaSE));',

            'bool horzSpan = edgeHorz >= edgeVert;',
            'float lengthSign = horzSpan ? -rcpFrame.y : -rcpFrame.x;',

            'if(!horzSpan) {',
            'lumaN = lumaW;',
            'lumaS = lumaE;',
            '}',

            'float gradientN = abs(lumaN - lumaM);',
            'float gradientS = abs(lumaS - lumaM);',
            'lumaN = (lumaN + lumaM) * 0.5;',
            'lumaS = (lumaS + lumaM) * 0.5;',

            'if (gradientN < gradientS) {',
            'lumaN = lumaS;',
            'lumaN = lumaS;',
            'gradientN = gradientS;',
            'lengthSign *= -1.0;',
            '}',

            'vec2 posN;',
            'posN.x = pos.x + (horzSpan ? 0.0 : lengthSign * 0.5);',
            'posN.y = pos.y + (horzSpan ? lengthSign * 0.5 : 0.0);',

            'gradientN *= u_search_threshold;',

            'vec2 posP = posN;',
            'vec2 offNP = horzSpan ? vec2(rcpFrame.x, 0.0) : vec2(0.0, rcpFrame.y);',
            'float lumaEndN = lumaN;',
            'float lumaEndP = lumaN;',
            'bool doneN = false;',
            'bool doneP = false;',
            'posN += offNP * vec2(-1.0, -1.0);',
            'posP += offNP * vec2( 1.0,  1.0);',

            'for(int i = 0; i < fxaaMaxSearchSteps; i++) {',
            'if(i >= u_search_steps) break;',
            'if(!doneN) {',
            'lumaEndN = FxaaLuma(texture2D(tex, posN.xy).xyz);',
            '}',
            'if(!doneP) {',
            'lumaEndP = FxaaLuma(texture2D(tex, posP.xy).xyz);',
            '}',

            'doneN = doneN || (abs(lumaEndN - lumaN) >= gradientN);',
            'doneP = doneP || (abs(lumaEndP - lumaN) >= gradientN);',

            'if(doneN && doneP) {',
            'break;',
            '}',
            'if(!doneN) {',
            'posN -= offNP;',
            '}',
            'if(!doneP) {',
            'posP += offNP;',
            '}',
            '}',

            'float dstN = horzSpan ? pos.x - posN.x : pos.y - posN.y;',
            'float dstP = horzSpan ? posP.x - pos.x : posP.y - pos.y;',
            'bool directionN = dstN < dstP;',
            'lumaEndN = directionN ? lumaEndN : lumaEndP;',

            'if(((lumaM - lumaN) < 0.0) == ((lumaEndN - lumaN) < 0.0)) {',
            'lengthSign = 0.0;',
            '}',


            'float spanLength = (dstP + dstN);',
            'dstN = directionN ? dstN : dstP;',
            'float subPixelOffset = (0.5 + (dstN * (-1.0/spanLength))) * lengthSign;',
            'vec3 rgbF = texture2D(tex, vec2(',
            'pos.x + (horzSpan ? 0.0 : subPixelOffset),',
            'pos.y + (horzSpan ? subPixelOffset : 0.0))).xyz;',
            'return FxaaLerp3(rgbL, rgbF, blendL);',
            '}',

            'void main() {',
            'gl_FragColor = texture2D(u_sampler0, v_texcoord);',
            'if(u_antialias) {',
            'gl_FragColor.xyz = FxaaPixelShader(v_texcoord, u_sampler0, 1. / u_buffersize).xyz;',
            '}',
            '}'
        ].join('\n');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';
    d3.LabelShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.LabelShader.prototype = new d3._Shader();
    _.initUniformLocations = function(gl) {
        _super.initUniformLocations.call(this, gl);
        this.dimensionUniform = gl.getUniformLocation(this.gProgram, 'u_dimension');
    };
    _.onShaderAttached = function(gl) {
        _super.onShaderAttached.call(this, gl);
        this.vertexTexCoordAttribute = 2;
        gl.bindAttribLocation(this.gProgram, this.vertexTexCoordAttribute, 'a_vertex_texcoord');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',
            'attribute vec3 a_vertex_normal;',
            'attribute vec2 a_vertex_texcoord;',

            // matrices set by gl.setMatrixUniforms
            'uniform mat4 u_model_view_matrix;',
            'uniform mat4 u_projection_matrix;',
            'uniform vec2 u_dimension;',

            // sent to the fragment shader
            'varying vec2 v_texcoord;',

            'void main() {',

            'gl_Position = u_model_view_matrix * vec4(a_vertex_position, 1.);',

            'vec4 depth_pos = vec4(gl_Position);',

            'depth_pos.z += a_vertex_normal.z;',

            'gl_Position = u_projection_matrix * gl_Position;',

            'depth_pos = u_projection_matrix * depth_pos;',

            'gl_Position /= gl_Position.w;',

            'gl_Position.xy += a_vertex_normal.xy / u_dimension * 2.;',

            'gl_Position.z = depth_pos.z / depth_pos.w;',

            'v_texcoord = a_vertex_texcoord;',

            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            // set macro for depth mmap texture
            gl.depthTextureExt ? '#define CWC_DEPTH_TEX\n' : '',

            // set float precision
            'precision mediump float;',

            // texture for draw text nor shadow map
            'uniform sampler2D u_image;',

            // from the vertex shader
            'varying vec2 v_texcoord;',

            'void main(void) {',
            'gl_FragColor = texture2D(u_image, v_texcoord);',
            '}'
        ].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };
    _.enableAttribsArray = function(gl) {
        _super.enableAttribsArray.call(this, gl);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
        gl.enableVertexAttribArray(this.vertexTexCoordAttribute);
    };
    _.disableAttribsArray = function(gl) {
        _super.disableAttribsArray.call(this, gl);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
        gl.disableVertexAttribArray(this.vertexTexCoordAttribute);
    };
    _.setDimension = function(gl, width, height) {
        gl.uniform2f(this.dimensionUniform, width, height);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.LightingShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.LightingShader.prototype = new d3._Shader();

    _.initUniformLocations = function(gl) {
        _super.initUniformLocations.call(this, gl);
        // assign uniform properties
        this.positionSampleUniform = gl.getUniformLocation(this.gProgram, 'u_position_sample');
        this.colorSampleUniform = gl.getUniformLocation(this.gProgram, 'u_color_sample');
        this.ssaoSampleUniform = gl.getUniformLocation(this.gProgram, 'u_ssao_sample');
        this.outlineSampleUniform = gl.getUniformLocation(this.gProgram, 'u_outline_sample');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            // sent to the fragment shader
            'varying vec2 v_texcoord;',

            'void main() {',
            'gl_Position = vec4(a_vertex_position, 1.);',
            'v_texcoord = a_vertex_position.xy * .5 + .5;',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [

            // set float precision
            'precision mediump float;',

            'uniform sampler2D u_position_sample;',
            'uniform sampler2D u_color_sample;',
            'uniform sampler2D u_ssao_sample;',
            'uniform sampler2D u_outline_sample;',

            'varying vec2 v_texcoord;',

            'void main() {',
            'vec4 position = texture2D(u_position_sample, v_texcoord);',
            'vec4 color = texture2D(u_color_sample, v_texcoord);',
            'vec4 ao = texture2D(u_ssao_sample, v_texcoord);',
            'float outline = texture2D(u_outline_sample, v_texcoord).r;',

            // skip background color
            'if(position.w == 0. && outline == 1.) {',
            // 'gl_FragColor = vec4(0., 0., 0., 1.);',
            'return;',
            '}',

            'gl_FragColor = vec4(color.rgb * ao.r * outline, 1.);',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.NormalShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.NormalShader.prototype = new d3._Shader();
    _.initUniformLocations = function(gl) {
        _super.initUniformLocations.call(this, gl);
        // assign uniform properties
        this.normalMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_normal_matrix');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',
            'attribute vec3 a_vertex_normal;',

            // matrices set by gl.setMatrixUniforms
            'uniform mat4 u_model_view_matrix;',
            'uniform mat4 u_projection_matrix;',
            'uniform mat3 u_normal_matrix;',

            // sent to the fragment shader
            'varying vec3 v_normal;',

            'void main() {',

            'v_normal = length(a_vertex_normal)==0. ? a_vertex_normal : u_normal_matrix * a_vertex_normal;',

            'gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.);',

            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [

            // set float precision
            'precision mediump float;',

            'varying vec3 v_normal;',

            'void main(void) {',
            'vec3 normal = length(v_normal)==0. ? vec3(0., 0., 1.) : normalize(v_normal);',
            'gl_FragColor = vec4(normal, 0.);',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };
    _.enableAttribsArray = function(gl) {
        _super.enableAttribsArray.call(this, gl);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
    };
    _.disableAttribsArray = function(gl) {
        _super.disableAttribsArray.call(this, gl);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
    };
    _.setModelViewMatrix = function(gl, mvMatrix) {
        _super.setModelViewMatrix.call(this, gl, mvMatrix);
        // create the normal matrix and push it to the graphics card
        let normalMatrix = m3.transpose(m4.toInverseMat3(mvMatrix, []));
        gl.uniformMatrix3fv(this.normalMatrixUniform, false, normalMatrix);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.OutlineShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.OutlineShader.prototype = new d3._Shader();

    _.initUniformLocations = function(gl) {
        _super.initUniformLocations.call(this, gl);
        this.normalSampleUniform = gl.getUniformLocation(this.gProgram, 'u_normal_sample');
        this.depthSampleUniform = gl.getUniformLocation(this.gProgram, 'u_depth_sample');
        this.gbufferTextureSizeUniform = gl.getUniformLocation(this.gProgram, 'u_gbuffer_texture_size');

        this.normalThresholdUniform = gl.getUniformLocation(this.gProgram, 'u_normal_threshold');
        this.depthThresholdUniform = gl.getUniformLocation(this.gProgram, 'u_depth_threshold');
        this.thicknessUniform = gl.getUniformLocation(this.gProgram, 'u_thickness');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            'varying vec2 v_texcoord;',

            'void main() {',
            'gl_Position = vec4(a_vertex_position, 1.);',
            'v_texcoord = a_vertex_position.xy * .5 + .5;',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            // set float precision
            'precision mediump float;',

            'uniform sampler2D u_normal_sample;',
            'uniform sampler2D u_depth_sample;',

            'uniform float u_normal_threshold;',
            'uniform float u_depth_threshold;',

            'uniform float u_thickness;',

            'uniform vec2 u_gbuffer_texture_size;',


            'varying vec2 v_texcoord;',

            'void main() {',
            'vec3 normal = texture2D(u_normal_sample, v_texcoord).xyz;',
            'float depth = texture2D(u_depth_sample, v_texcoord).r;',

            // check background pixel
            // 'if(depth == 1.) {',
            // 	'return;',
            // '}',

            'vec2 texelSize = u_thickness/u_gbuffer_texture_size * .5;',
            'vec2 offsets[8];',

            'offsets[0] = vec2(-texelSize.x, -texelSize.y);',
            'offsets[1] = vec2(-texelSize.x, 0);',
            'offsets[2] = vec2(-texelSize.x, texelSize.y);',

            'offsets[3] = vec2(0, -texelSize.y);',
            'offsets[4] = vec2(0,  texelSize.y);',

            'offsets[5] = vec2(texelSize.x, -texelSize.y);',
            'offsets[6] = vec2(texelSize.x, 0);',
            'offsets[7] = vec2(texelSize.x, texelSize.y);',

            'float edge = 0.;',

            'for (int i = 0; i < 8; i++) {',
            'vec3 sampleNorm = texture2D(u_normal_sample, v_texcoord + offsets[i]).xyz;',

            'if(normal == vec3(.0, .0, .0)) {',
            'if(sampleNorm != vec3(.0, .0, .0)) {',
            'edge = 1.0;',
            'break;',
            '}',
            'continue;',
            '}',

            'if (dot(sampleNorm, normal) < u_normal_threshold) {',
            'edge = 1.0;',
            'break;',
            '}',

            'float sampleDepth = texture2D(u_depth_sample, v_texcoord + offsets[i]).r;',
            'if (abs(sampleDepth - depth) > u_depth_threshold) {',
            'edge = 1.0;',
            'break;',
            '}',
            '}',

            'edge = 1. - edge;',

            'gl_FragColor = vec4(edge, edge, edge, 1.);',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };
    _.setGbufferTextureSize = function(gl, width, height) {
        gl.uniform2f(this.gbufferTextureSizeUniform, width, height);
    };
    _.setNormalThreshold = function(gl, value) {
        gl.uniform1f(this.normalThresholdUniform, value);
    };
    _.setDepthThreshold = function(gl, value) {
        gl.uniform1f(this.depthThresholdUniform, value);
    };
    _.setThickness = function(gl, value) {
        gl.uniform1f(this.thicknessUniform, value);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.PhongShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.PhongShader.prototype = new d3._Shader();
    _.initUniformLocations = function(gl) {
        _super.initUniformLocations.call(this, gl);
        // assign uniform properties
        this.shadowUniform = gl.getUniformLocation(this.gProgram, 'u_shadow');
        this.flatColorUniform = gl.getUniformLocation(this.gProgram, 'u_flat_color');
        this.normalMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_normal_matrix');

        this.lightModelViewMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_light_model_view_matrix');
        this.lightProjectionMatrixUniform = gl.getUniformLocation(this.gProgram, 'u_light_projection_matrix');

        this.lightDiffuseColorUniform = gl.getUniformLocation(this.gProgram, 'u_light_diffuse_color');
        this.lightSpecularColorUniform = gl.getUniformLocation(this.gProgram, 'u_light_specular_color');
        this.lightDirectionUniform = gl.getUniformLocation(this.gProgram, 'u_light_direction');

        this.materialAmbientColorUniform = gl.getUniformLocation(this.gProgram, 'u_material_ambient_color');
        this.materialDiffuseColorUniform = gl.getUniformLocation(this.gProgram, 'u_material_diffuse_color');
        this.materialSpecularColorUniform = gl.getUniformLocation(this.gProgram, 'u_material_specular_color');
        this.materialShininessUniform = gl.getUniformLocation(this.gProgram, 'u_material_shininess');
        this.materialAlphaUniform = gl.getUniformLocation(this.gProgram, 'u_material_alpha');

        this.fogModeUniform = gl.getUniformLocation(this.gProgram, 'u_fog_mode');
        this.fogColorUniform = gl.getUniformLocation(this.gProgram, 'u_fog_color');
        this.fogStartUniform = gl.getUniformLocation(this.gProgram, 'u_fog_start');
        this.fogEndUniform = gl.getUniformLocation(this.gProgram, 'u_fog_end');
        this.fogDensityUniform = gl.getUniformLocation(this.gProgram, 'u_fog_density');

        // texture for shadow map
        this.shadowDepthSampleUniform = gl.getUniformLocation(this.gProgram, 'u_shadow_depth_sample');
        this.shadowTextureSizeUniform = gl.getUniformLocation(this.gProgram, 'u_shadow_texture_size');
        this.shadowIntensityUniform = gl.getUniformLocation(this.gProgram, 'u_shadow_intensity');

        // gamma correction
        this.gammaCorrectionUniform = gl.getUniformLocation(this.gProgram, 'u_gamma_inverted');

        // point size
        this.pointSizeUniform = gl.getUniformLocation(this.gProgram, 'u_point_size');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',
            'attribute vec3 a_vertex_normal;',

            // scene uniforms
            'uniform vec3 u_light_diffuse_color;',
            'uniform vec3 u_material_ambient_color;',
            'uniform vec3 u_material_diffuse_color;',
            // matrices set by gl.setMatrixUniforms
            'uniform mat4 u_model_view_matrix;',
            'uniform mat4 u_projection_matrix;',
            'uniform mat3 u_normal_matrix;',

            'uniform mat4 u_light_model_view_matrix;',
            'uniform mat4 u_light_projection_matrix;',

            'uniform bool u_shadow;',

            // sent to the fragment shader
            'varying vec3 v_viewpos;',
            'varying vec4 v_shadcoord;',
            'varying vec3 v_diffuse;',
            'varying vec3 v_ambient;',
            'varying vec3 v_normal;',

            'uniform float u_point_size;',

            'void main() {',

            'v_normal = length(a_vertex_normal)==0. ? a_vertex_normal : u_normal_matrix * a_vertex_normal;',
            'v_ambient = u_material_ambient_color;',
            'v_diffuse = u_material_diffuse_color * u_light_diffuse_color;',

            'if(u_shadow) {',
            'v_shadcoord = u_light_projection_matrix * u_light_model_view_matrix * vec4(a_vertex_position, 1.);',
            'v_shadcoord /= v_shadcoord.w;',
            '}',

            'vec4 viewPos = u_model_view_matrix * vec4(a_vertex_position, 1.);',

            'v_viewpos = viewPos.xyz / viewPos.w;',

            'gl_Position = u_projection_matrix * viewPos;',

            // just to make sure the w is 1
            'gl_Position /= gl_Position.w;',
            'gl_PointSize = u_point_size;',

            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            // set macro for depth mmap texture
            gl.depthTextureExt ? '#define CWC_DEPTH_TEX\n' : '',

            // set float precision
            'precision mediump float;',

            // scene uniforms
            'uniform vec3 u_light_specular_color;',
            'uniform vec3 u_light_direction;',

            'uniform vec3 u_material_specular_color;',
            'uniform float u_material_shininess;',
            'uniform float u_material_alpha;',

            'uniform int u_fog_mode;',
            'uniform vec3 u_fog_color;',
            'uniform float u_fog_density;',
            'uniform float u_fog_start;',
            'uniform float u_fog_end;',

            'uniform bool u_shadow;',
            'uniform float u_shadow_intensity;',

            'uniform bool u_flat_color;',

            'uniform float u_gamma_inverted;',

            // texture for shadow map
            'uniform sampler2D u_shadow_depth_sample;',

            'uniform vec2 u_shadow_texture_size;',

            // from the vertex shader
            'varying vec3 v_viewpos;',
            'varying vec4 v_shadcoord;',
            'varying vec3 v_diffuse;',
            'varying vec3 v_ambient;',
            'varying vec3 v_normal;',


            '\n#ifndef CWC_DEPTH_TEX\n',
            'float unpack (vec4 colour) {',
            'const vec4 bitShifts = vec4(1.,',
            '1. / 255.,',
            '1. / (255. * 255.),',
            '1. / (255. * 255. * 255.));',
            'return dot(colour, bitShifts);',
            '}',
            '\n#endif\n',

            'float shadowMapDepth(vec4 shadowMapColor) {',
            'float zShadowMap;',
            '\n#ifdef CWC_DEPTH_TEX\n',
            'zShadowMap = shadowMapColor.r;',
            '\n#else\n',
            'zShadowMap = unpack(shadowMapColor);',
            '\n#endif\n',
            'return zShadowMap;',
            '}',

            'void main(void) {',
            'vec3 color = v_diffuse;',
            'if(length(v_normal)!=0.){',
            'vec3 normal = normalize(v_normal);',
            'vec3 lightDir = normalize(-u_light_direction);',
            'float nDotL = dot(normal, lightDir);',

            'float shadow = 0.0;',
            'if(u_shadow) {',
            'vec3 depthCoord = .5 + v_shadcoord.xyz / v_shadcoord.w * .5;',

            'if(depthCoord.z <= 1. && depthCoord.z >= 0.) {',
            'float bias = max(.05 * (1. - nDotL), .005);',
            'vec2 texelSize = 1. / u_shadow_texture_size;',
            'for(int x = -1; x <= 1; ++x) {',
            'for(int y = -1; y <= 1; ++y)  {',
            'vec4 shadowMapColor = texture2D(u_shadow_depth_sample, depthCoord.xy + vec2(x, y) * texelSize);',
            'float zShadowMap = shadowMapDepth(shadowMapColor);',
            'shadow += zShadowMap + bias < depthCoord.z ? 1. : 0.;',
            '}',
            '}',
            'shadow /= 9.;',
            'shadow *= u_shadow_intensity;',
            '}',
            '}',

            'if(!u_flat_color) {',
            'vec3 viewDir = normalize(-v_viewpos);',
            'vec3 halfDir = normalize(lightDir + viewDir);',
            'float nDotHV = max(dot(halfDir, normal), 0.);',
            'vec3 specular = u_material_specular_color * u_light_specular_color;',
            'color*=max(nDotL, 0.);',
            'color+=specular * pow(nDotHV, u_material_shininess);',
            '}',

            // set the color
            'color = (1.-shadow)*color+v_ambient;',
            '}',

            'gl_FragColor = vec4(pow(color, vec3(u_gamma_inverted)), u_material_alpha);',

            'if(u_fog_mode != 0){',
            'float fogCoord = 1.-clamp((u_fog_end - gl_FragCoord.z/gl_FragCoord.w) / (u_fog_end - u_fog_start), 0., 1.);',
            'float fogFactor = 1.;',

            // linear equation
            'if(u_fog_mode == 1){',
            'fogFactor = 1.-fogCoord;',
            '}',
            // exp equation
            'else if(u_fog_mode == 2) {',
            'fogFactor = clamp(exp(-u_fog_density*fogCoord), 0., 1.);',
            '}',
            // exp2 equation
            'else if(u_fog_mode == 3) {',
            'fogFactor = clamp(exp(-pow(u_fog_density*fogCoord, 2.)), 0., 1.);',
            '}',
            'gl_FragColor = mix(vec4(u_fog_color, 1.), gl_FragColor, fogFactor);',

            // for debugging
            // 'gl_FragColor = vec4(vec3(fogFactor), 1.);',
            '}',
            '}'
        ].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };
    _.enableAttribsArray = function(gl) {
        _super.enableAttribsArray.call(this, gl);
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
    };
    _.disableAttribsArray = function(gl) {
        _super.disableAttribsArray.call(this, gl);
        gl.disableVertexAttribArray(this.vertexNormalAttribute);
    };
    _.setMatrixUniforms = function(gl, modelMatrix) {
        if(modelMatrix === undefined) {
            this.setModelViewMatrix(gl, gl.modelViewMatrix);
            this.setLightModelViewMatrix(gl, gl.lightViewMatrix);
        } else {
            let mvMatrix = m4.multiply(gl.modelViewMatrix, modelMatrix, []);
            let lightModelViewMatrix = m4.multiply(gl.lightViewMatrix, modelMatrix, []);

            this.setModelViewMatrix(gl, mvMatrix);
            this.setLightModelViewMatrix(gl, lightModelViewMatrix);
        }
    };
    _.setModelViewMatrix = function(gl, mvMatrix) {
        _super.setModelViewMatrix.call(this, gl, mvMatrix);
        // create the normal matrix and push it to the graphics card
        let normalMatrix = m3.transpose(m4.toInverseMat3(mvMatrix, []));
        gl.uniformMatrix3fv(this.normalMatrixUniform, false, normalMatrix);
    };
    _.setFlatColor = function(gl, enabled) {
        gl.uniform1i(this.flatColorUniform, enabled);
    };
    _.setShadow = function(gl, enabled) {
        gl.uniform1i(this.shadowUniform, enabled);
    };
    _.setFogMode = function(gl, mode) {
        gl.uniform1i(this.fogModeUniform, mode);
    };
    _.setFogColor = function(gl, color) {
        gl.uniform3fv(this.fogColorUniform, color);
    };
    _.setFogStart = function(gl, fogStart) {
        gl.uniform1f(this.fogStartUniform, fogStart);
    };
    _.setFogEnd = function(gl, fogEnd) {
        gl.uniform1f(this.fogEndUniform, fogEnd);
    };
    _.setFogDensity = function(gl, density) {
        gl.uniform1f(this.fogDensityUniform, density);
    };
    _.setMaterialAmbientColor = function(gl, ambient) {
        gl.uniform3fv(this.materialAmbientColorUniform, ambient);
    };
    _.setMaterialDiffuseColor = function(gl, diffuse) {
        gl.uniform3fv(this.materialDiffuseColorUniform, diffuse);
    };
    _.setMaterialSpecularColor = function(gl, specular) {
        gl.uniform3fv(this.materialSpecularColorUniform, specular);
    };
    _.setMaterialShininess = function(gl, shininess) {
        gl.uniform1f(this.materialShininessUniform, shininess);
    };
    _.setMaterialAlpha = function(gl, alpha) {
        gl.uniform1f(this.materialAlphaUniform, alpha);
    };
    _.setLightDiffuseColor = function(gl, diffuse) {
        gl.uniform3fv(this.lightDiffuseColorUniform, diffuse);
    };
    _.setLightSpecularColor = function(gl, specular) {
        gl.uniform3fv(this.lightSpecularColorUniform, specular);
    };
    _.setLightDirection = function(gl, direction) {
        gl.uniform3fv(this.lightDirectionUniform, direction);
    };
    _.setLightModelViewMatrix = function(gl, mvMatrix) {
        gl.uniformMatrix4fv(this.lightModelViewMatrixUniform, false, mvMatrix);
    };
    _.setLightProjectionMatrix = function(gl, matrix) {
        gl.uniformMatrix4fv(this.lightProjectionMatrixUniform, false, matrix);
    };
    _.setShadowTextureSize = function(gl, width, height) {
        gl.uniform2f(this.shadowTextureSizeUniform, width, height);
    };
    _.setShadowIntensity = function(gl, intensity) {
        gl.uniform1f(this.shadowIntensityUniform, intensity);
    };
    _.setGammaCorrection = function(gl, gammaCorrection) {
        // make sure gamma correction is inverted here as it is more efficient in the shader
        gl.uniform1f(this.gammaCorrectionUniform, 1.0/gammaCorrection);
    };
    _.setPointSize = function(gl, pointSize) {
        gl.uniform1f(this.pointSizeUniform, pointSize);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.PickShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.PickShader.prototype = new d3._Shader();
    _.initUniformLocations = function(gl) {
        // assign uniform properties
        _super.initUniformLocations.call(this, gl);
        this.materialDiffuseColorUniform = gl.getUniformLocation(this.gProgram, 'u_material_diffuse_color');
    };
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            // matrices set by gl.setMatrixUniforms
            'uniform mat4 u_model_view_matrix;',
            'uniform mat4 u_projection_matrix;',

            'void main() {',

            'gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.);',

            // just to make sure the w is 1
            'gl_Position /= gl_Position.w;',

            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            // set macro for depth mmap texture
            gl.depthTextureExt ? '#define CWC_DEPTH_TEX\n' : '',

            // set float precision
            'precision mediump float;',

            'uniform vec3 u_material_diffuse_color;',

            'void main(void) {',
            'gl_FragColor = vec4(u_material_diffuse_color, 1.);',
            '}'
        ].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };
    _.setMaterialDiffuseColor = function(gl, diffuse) {
        gl.uniform3fv(this.materialDiffuseColorUniform, diffuse);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.PositionShader = function() {
    };
    let _super = d3._Shader.prototype;
    let _ = d3.PositionShader.prototype = new d3._Shader();

    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            // matrices set by gl.setMatrixUniforms
            'uniform mat4 u_model_view_matrix;',
            'uniform mat4 u_projection_matrix;',

            'varying vec4 v_position;',

            'void main() {',
            'vec4 viewPos = u_model_view_matrix * vec4(a_vertex_position, 1.);',

            'gl_Position = u_projection_matrix * viewPos;',

            'v_position = viewPos / viewPos.w;',

            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [
            // set float precision
            'precision mediump float;',

            'varying vec4 v_position;',

            'void main(void) {',
            'gl_FragColor = v_position;',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(d3, m3, m4, document, undefined) {
    'use strict';

    d3.QuadShader = function() {
    };
    let _ = d3.QuadShader.prototype = new d3._Shader();
    _.loadDefaultVertexShader = function(gl) {
        let sb = [
            'precision mediump float;',

            // attributes set when rendering objects
            'attribute vec3 a_vertex_position;',

            'varying vec2 v_texcoord;',

            'void main() {',
            'gl_Position = vec4(a_vertex_position, 1.);',
            'v_texcoord = a_vertex_position.xy * .5 + .5;',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.VERTEX_SHADER, sb);
    };
    _.loadDefaultFragmentShader = function(gl) {
        let sb = [

            // set float precision
            'precision mediump float;',

            'uniform sampler2D u_image;',

            'varying vec2 v_texcoord;',

            'void main() {',
            'gl_FragColor = texture2D(u_image, v_texcoord);',
            '}'].join('');

        return this.getShaderFromStr(gl, gl.FRAGMENT_SHADER, sb);
    };

})(ChemDoodle.structures.d3, ChemDoodle.lib.mat3, ChemDoodle.lib.mat4, document);

(function(structures, d3, ELEMENT, MarchingCubes, v3, m, undefined) {
    'use strict';

    let Triangle = function(i1, i2, i3){
        this.i1 = i1;
        this.i2 = i2;
        this.i3 = i3;
    };

    function getRange(atoms, probeRadius) {
        let r = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
        let add = probeRadius + 2;
        for (let i = 0, ii = atoms.length; i<ii; i++) {
            let a = atoms[i];
            r[0] = m.min(r[0], a.x - add);
            r[1] = m.max(r[1], a.x + add);
            r[2] = m.min(r[2], a.y - add);
            r[3] = m.max(r[3], a.y + add);
            r[4] = m.min(r[4], a.z - add);
            r[5] = m.max(r[5], a.z + add);
        }
        return r;
    };

    function addPoint(p, points, xs, ys, zs, step) {
        // transform back into real space
        let px = p[0] * step + xs - step;
        let py = p[1] * step + ys - step;
        let pz = p[2] * step + zs - step;
        // find any previous match
        let index = -1;
        let cutoff = 1E-3;
        for (let j = 0, jj = points.length; j < jj; j++) {
            let pj = points[j];
            if (m.abs(pj.x - px) < cutoff && m.abs(pj.y - py) < cutoff && m.abs(pj.z - pz) < cutoff) {
                index = j;
                break;
            }
        }
        if (index == -1) {
            index = points.length;
            points.push(new structures.Atom('C', px, py, pz));
        }
        return index;
    };

    d3._Surface = function() {
    };
    let _ = d3._Surface.prototype = new d3._Mesh();
    _.generate = function(xdif, ydif, zdif, step, range, xsteps, ysteps, zsteps){
        // generate the function
        let vals = [];
        let z = range[4] - step;
        for (let k = 0; k < zsteps; k++) {
            let y = range[2] - step;
            for (let j = 0; j < ysteps; j++) {
                let x = range[0] - step;
                for (let i = 0; i < xsteps; i++) {
                    vals.push(this.calculate(x, y, z));
                    x += step;
                }
                y += step;
            }
            z += step;
        }
        return vals;
    };
    _.build = function(atoms, probeRadius, resolution) {
        let positionData = [];
        let normalData = [];
        let indexData = [];

        // calculate the range of the function
        let range = getRange(atoms, probeRadius);
        let xdif = range[1] - range[0];
        let ydif = range[3] - range[2];
        let zdif = range[5] - range[4];
        let step = m.min(xdif, m.min(ydif, zdif)) / resolution;

        // generate the function
        let xsteps = 2 + m.ceil(xdif / step);
        let ysteps = 2 + m.ceil(ydif / step);
        let zsteps = 2 + m.ceil(zdif / step);
        let vals = this.generate(xdif, ydif, zdif, step, range, xsteps, ysteps, zsteps);

        // marching cubes
        let mesh = MarchingCubes(vals, [xsteps, ysteps, zsteps]);

        // build surface
        let ps = [];
        let is = [];
        for (let i = 0, ii = mesh.vertices.length; i<ii; i++) {
            is.push(addPoint(mesh.vertices[i], ps, range[0], range[2], range[4], step));
        }

        // triangles
        let triangles = [];
        for (let i = 0, ii = mesh.faces.length; i < ii; i++) {
            let f = mesh.faces[i];
            let i1 = is[f[0]];
            let i2 = is[f[1]];
            let i3 = is[f[2]];
            triangles.push(new Triangle(i1, i2, i3));
            indexData.push(i1, i2, i3);
        }

        // smoothing - 1 pass
        let savedConnections = [];
        for (let i = 0, ii = ps.length; i < ii; i++) {
            let connections = [];
            for (let j = 0, jj = triangles.length; j < jj; j++) {
                let t = triangles[j];
                if (t.i1===i || t.i2===i || t.i3===i) {
                    if (t.i1 != i && connections.indexOf(t.i1)===-1) {
                        connections.push(t.i1);
                    }
                    if (t.i2 != i && connections.indexOf(t.i2)===-1) {
                        connections.push(t.i2);
                    }
                    if (t.i3 != i && connections.indexOf(t.i3)===-1) {
                        connections.push(t.i3);
                    }
                }
            }
            savedConnections.push(connections);
        }
        let tmp = [];
        for (let i = 0, ii = ps.length; i < ii; i++) {
            let pi = ps[i];
            let connections = savedConnections[i];
            let pt = new structures.Atom();
            if (connections.length < 3) {
                pt.x = pi.x;
                pt.y = pi.y;
                pt.z = pi.z;
            } else {
                let wt = 1;
                if (connections.length < 5) {
                    wt = .5;
                }
                for (let j = 0, jj = connections.length; j < jj; j++) {
                    let pc = ps[connections[j]];
                    pt.x+=pc.x;
                    pt.y+=pc.y;
                    pt.z+=pc.z;
                }
                pt.x += pi.x*wt;
                pt.y += pi.y*wt;
                pt.z += pi.z*wt;
                let scale = 1 / (wt + connections.length);
                pt.x*=scale;
                pt.y*=scale;
                pt.z*=scale;
            }
            tmp.push(pt);
        }
        ps = tmp;
        for (let i = 0, ii = ps.length; i < ii; i++) {
            let pi = ps[i];
            positionData.push(pi.x, pi.y, pi.z);
        }

        // normals
        for (let i = 0, ii = triangles.length; i < ii; i++) {
            let t = triangles[i];
            let p1 = ps[t.i1];
            let p2 = ps[t.i2];
            let p3 = ps[t.i3];
            let v12 = [p2.x-p1.x, p2.y-p1.y, p2.z-p1.z];
            let v13 = [p3.x-p1.x, p3.y-p1.y, p3.z-p1.z];
            v3.cross(v12, v13);
            if (isNaN(v12[0])) {
                // for some reason, origin shows up as some points and should be
                // ignored
                v12 = [0,0,0];
            }
            t.normal = v12;
        }
        for (let i = 0, ii = ps.length; i < ii; i++) {
            let sum = [0, 0, 0];
            for (let j = 0, jj = triangles.length; j < jj; j++) {
                let t = triangles[j];
                if (t.i1===i || t.i2===i || t.i3===i) {
                    sum[0]+=t.normal[0];
                    sum[1]+=t.normal[1];
                    sum[2]+=t.normal[2];
                }
            }
            v3.normalize(sum);
            normalData.push(sum[0], sum[1], sum[2]);
        }
        this.storeData(positionData, normalData, indexData);
    };
    _.render = function(gl, styles) {
        if(this.styles){
            styles = this.styles;
        }
        if(!styles.surfaces_display){
            return;
        }
        gl.shader.setMatrixUniforms(gl);
        this.bindBuffers(gl);
        // colors
        gl.material.setTempColors(gl, styles.surfaces_materialAmbientColor_3D, styles.surfaces_color, styles.surfaces_materialSpecularColor_3D, styles.surfaces_materialShininess_3D);
        // alpha must be set after temp colors as that function sets alpha to 1
        gl.material.setAlpha(gl, styles.surfaces_alpha);
        // render
        if(styles.surfaces_style === 'Dots'){
            // dots
            //gl.pointSize(1);
            // pointSize isn't part of WebGL API, so we have to make it a shader uniform in the vertex shader
            gl.shader.setPointSize(gl, styles.shapes_pointSize);
            //gl.drawArrays(gl.POINTS, 0, this.vertexIndexBuffer.numItems);
            gl.drawElements(gl.POINTS, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }else if(styles.surfaces_style === 'Mesh'){
            // mesh
            gl.lineWidth(styles.shapes_lineWidth);
            //gl.polygonMode(gl.FRONT_AND_BACK, gl.LINE);
            gl.drawElements(gl.LINES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            //gl.polygonMode(gl.FRONT_AND_BACK, gl.FILL);
        }else{
            // solid
            gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

    };

})(ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.ELEMENT, ChemDoodle.lib.MarchingCubes, ChemDoodle.lib.vec3, Math);

(function(structures, d3, ELEMENT, m, undefined) {
    'use strict';

    d3.SASSurface = function(atoms, probeRadius, resolution) {
        this.atoms = atoms;
        this.probeRadius = probeRadius;
        this.resolution = resolution;
        this.build(atoms, probeRadius, resolution);
    };
    let _ = d3.SASSurface.prototype = new d3._Surface();
    _.calculate = function(x, y, z) {
        let min = Infinity;
        let p = new structures.Atom('C', x, y, z);
        for (let i = 0, ii = this.atoms.length; i<ii; i++) {
            let a = this.atoms[i];
            let vdwRadius = (ELEMENT[a.label] && ELEMENT[a.label].vdWRadius!==0)?ELEMENT[a.label].vdWRadius:2;
            let distanceCenter = a.distance3D(p) - this.probeRadius;
            let distanceSurface = distanceCenter - vdwRadius;
            min = m.min(min, distanceSurface);
        }
        return min;
    };


})(ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.ELEMENT, Math);

(function(structures, d3, ELEMENT, m, undefined) {
    'use strict';

    d3.VDWSurface = function(atoms, resolution) {
        this.atoms = atoms;
        this.probeRadius = 0;
        this.resolution = resolution;
        this.build(atoms, 0, resolution);
    };
    let _ = d3.VDWSurface.prototype = new d3._Surface();
    _.calculate = function(x, y, z) {
        let min = Infinity;
        let p = new structures.Atom('C', x, y, z);
        for (let i = 0, ii = this.atoms.length; i<ii; i++) {
            let a = this.atoms[i];
            let vdwRadius = (ELEMENT[a.label] && ELEMENT[a.label].vdWRadius!==0)?ELEMENT[a.label].vdWRadius:2;
            let distanceCenter = a.distance3D(p);
            let distanceSurface = distanceCenter - vdwRadius;
            min = m.min(min, distanceSurface);
        }
        return min;
    };


})(ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.ELEMENT, Math);

(function(c, extensions, math, structures, d3, RESIDUE, m, document, m4, m3, v3, q, window, undefined) {
    'use strict';
    c._Canvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
    };
    let _ = c._Canvas3D.prototype = new c._Canvas();
    let _super = c._Canvas.prototype;
    _.rotationMatrix = undefined;
    _.lastPoint = undefined;
    _.emptyMessage = 'WebGL is Unavailable!';
    _.lastPinchScale = 1;
    _.lastGestureRotate = 0;
    _.afterLoadContent = function() {
        let bounds = new math.Bounds();
        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            bounds.expand(this.molecules[i].getBounds3D());
        }
        // build fog parameter
        let maxDimension3D = v3.dist([ bounds.maxX, bounds.maxY, bounds.maxZ ], [ bounds.minX, bounds.minY, bounds.minZ ]) / 2 + 1.5;
        if(maxDimension3D===Infinity){
            // there is no content
            maxDimension3D = 10;
        }

        this.maxDimension = m.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);

        let fov         = m.min(179.9, m.max(this.styles.projectionPerspectiveVerticalFieldOfView_3D, 0.1));
        let theta       = fov / 360 * m.PI;
        let tanTheta    = m.tan(theta) / 0.8;
        let top         = maxDimension3D;
        let focalLength = top / tanTheta;
        let near        = focalLength - top;
        let far         = focalLength + top;
        let aspect      = this.width / this.height;

        this.camera.fieldOfView = fov;
        this.camera.near = near;
        this.camera.far = far;
        this.camera.aspect = aspect;
        m4.translate(m4.identity(this.camera.viewMatrix), [ 0, 0, -focalLength]);

        let lightFocalLength = top / m.tan(theta);

        this.lighting.camera.fieldOfView = fov;
        this.lighting.camera.near = lightFocalLength - top;
        this.lighting.camera.far = lightFocalLength + top;
        this.lighting.updateView();

        this.setupScene();
    };
    _.renderDepthMap = function() {
        if (this.styles.shadow_3D && d3.DepthShader) {

            let cullFaceEnabled = this.gl.isEnabled(this.gl.CULL_FACE);
            if(!cullFaceEnabled) { this.gl.enable(this.gl.CULL_FACE); }

            this.depthShader.useShaderProgram(this.gl);

            // current clear color
            let cs = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);

            this.gl.clearColor(1.0, 1.0, 1.0, 0.0);

            this.lightDepthMapFramebuffer.bind(this.gl, this.shadowTextureSize, this.shadowTextureSize);

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // use light projection matrix to draw the molecule
            this.depthShader.setProjectionMatrix(this.gl, this.lighting.camera.projectionMatrix);

            this.depthShader.enableAttribsArray(this.gl);

            for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                this.molecules[i].render(this.gl, this.styles);
            }

            this.gl.flush();

            this.depthShader.disableAttribsArray(this.gl);

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

            // set back the clear color
            this.gl.clearColor(cs[0], cs[1], cs[2], cs[3]);

            if(!cullFaceEnabled) { this.gl.disable(this.gl.CULL_FACE); }
        }
    };// draw anything those not molecules, example compass, shapes, text etc.
    _.renderExtras = function() {

        this.phongShader.useShaderProgram(this.gl);

        this.phongShader.enableAttribsArray(this.gl);

        let transparentShapes = [];
        for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
            let s = this.shapes[i];
            if(s instanceof d3._Surface && (!s.styles && this.styles.surfaces_alpha!==1 || s.styles && s.styles.surfaces_alpha!==1)){
                transparentShapes.push(s);
            }else{
                s.render(this.gl, this.styles);
            }
        }

        // transparent shapes
        if(transparentShapes.length!==0){
            //this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.enable(this.gl.BLEND);
            this.gl.depthMask(false);
            for ( let i = 0, ii = transparentShapes.length; i < ii; i++) {
                let s = transparentShapes[i];
                s.render(this.gl, this.styles);
            }
            this.gl.depthMask(true);
            this.gl.disable(this.gl.BLEND);
            this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        }


        this.phongShader.setShadow(this.gl, false);
        this.phongShader.setFogMode(this.gl, 0);
        this.phongShader.setFlatColor(this.gl, false);

        // compass use its own model view and projection matrix
        // so it need to use back the default matrix for other
        // rendering process (ex. render arbitrary text).
        if (this.styles.compass_display) {
            this.phongShader.setLightDirection(this.gl, [0, 0, -1]);
            this.compass.render(this.gl, this.styles);
        }

        this.phongShader.disableAttribsArray(this.gl);

        this.gl.flush();

        // enable blend and depth mask set to false
        this.gl.enable(this.gl.BLEND);
        this.gl.depthMask(false);
        this.labelShader.useShaderProgram(this.gl);
        // use back the default model view matrix
        this.labelShader.setMatrixUniforms(this.gl, this.gl.modelViewMatrix);
        // use back the default projection matrix
        this.labelShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);
        this.labelShader.setDimension(this.gl, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // enable vertex for draw text
        this.labelShader.enableAttribsArray(this.gl);

        // draw label molecule
        if (this.styles.atoms_displayLabels_3D) {
            this.label3D.render(this.gl, this.styles, this.getMolecules());
        }
        // draw measurement text
        if(this.styles.measurement_displayText_3D) {
            for ( let i = 0, ii = this.shapes.length; i < ii; i++) {
                let s = this.shapes[i];
                if(s.renderText){
                    s.renderText(this.gl, this.styles);
                }
            }
        }
        // draw compass X Y Z text
        if (this.styles.compass_display && this.styles.compass_displayText_3D) {
            this.compass.renderAxis(this.gl);
        }
        // disable vertex for draw text
        this.labelShader.disableAttribsArray(this.gl);

        // disable blend and depth mask set to true
        this.gl.disable(this.gl.BLEND);
        this.gl.depthMask(true);
        this.gl.flush();

        if (this.drawChildExtras) {
            this.drawChildExtras(this.gl);
        }

        this.gl.flush();
    };
    // molecule colors rendeing will both use on forward and deferred rendering
    _.renderColor = function() {
        this.phongShader.useShaderProgram(this.gl);

        this.gl.uniform1i(this.phongShader.shadowDepthSampleUniform, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.lightDepthMapTexture.texture);

        this.phongShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);
        this.phongShader.setShadow(this.gl, this.styles.shadow_3D);
        this.phongShader.setFlatColor(this.gl, this.styles.flat_color_3D);
        this.phongShader.setGammaCorrection(this.gl, this.styles.gammaCorrection_3D);

        this.phongShader.setShadowTextureSize(this.gl, this.shadowTextureSize, this.shadowTextureSize);
        this.phongShader.setShadowIntensity(this.gl, this.styles.shadow_intensity_3D);

        this.phongShader.setFogMode(this.gl, this.styles.fog_mode_3D);
        this.phongShader.setFogColor(this.gl, this.fogging.colorRGB);
        this.phongShader.setFogStart(this.gl, this.fogging.fogStart);
        this.phongShader.setFogEnd(this.gl, this.fogging.fogEnd);
        this.phongShader.setFogDensity(this.gl, this.fogging.density);

        this.phongShader.setLightProjectionMatrix(this.gl, this.lighting.camera.projectionMatrix);
        this.phongShader.setLightDiffuseColor(this.gl, this.lighting.diffuseRGB);
        this.phongShader.setLightSpecularColor(this.gl, this.lighting.specularRGB);
        this.phongShader.setLightDirection(this.gl, this.lighting.direction);

        this.phongShader.enableAttribsArray(this.gl);

        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            this.molecules[i].render(this.gl, this.styles);
        }

        this.phongShader.disableAttribsArray(this.gl);

        this.gl.flush();
    };
    _.renderPosition = function() {
        this.positionShader.useShaderProgram(this.gl);

        this.positionShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);

        this.positionShader.enableAttribsArray(this.gl);

        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            this.molecules[i].render(this.gl, this.styles);
        }

        this.positionShader.disableAttribsArray(this.gl);

        this.gl.flush();
    };
    _.renderNormal = function() {
        this.normalShader.useShaderProgram(this.gl);
        this.normalShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);

        this.normalShader.enableAttribsArray(this.gl);

        for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
            this.molecules[i].render(this.gl, this.styles);
        }

        this.normalShader.disableAttribsArray(this.gl);

        this.gl.flush();
    };
    _.renderSSAO = function() {
        this.ssaoShader.useShaderProgram(this.gl);

        this.ssaoShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);

        this.ssaoShader.setSampleKernel(this.gl, this.ssao.sampleKernel);

        this.ssaoShader.setKernelRadius(this.gl, this.styles.ssao_kernel_radius);

        this.ssaoShader.setPower(this.gl, this.styles.ssao_power);

        this.ssaoShader.setGbufferTextureSize(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.uniform1i(this.ssaoShader.positionSampleUniform, 0);
        this.gl.uniform1i(this.ssaoShader.normalSampleUniform, 1);
        this.gl.uniform1i(this.ssaoShader.noiseSampleUniform, 2);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.positionTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.ssao.noiseTexture);

        this.gl.activeTexture(this.gl.TEXTURE0);

        this.ssaoShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.ssaoShader.disableAttribsArray(this.gl);

        this.gl.flush();

        // render ssao blur shader
        this.ssaoFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.ssaoBlurShader.useShaderProgram(this.gl);

        this.ssaoBlurShader.setGbufferTextureSize(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.uniform1i(this.ssaoBlurShader.aoSampleUniform, 0);
        this.gl.uniform1i(this.ssaoBlurShader.depthSampleUniform, 1);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture.texture);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture.texture);
        this.gl.activeTexture(this.gl.TEXTURE0);


        this.ssaoBlurShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.ssaoBlurShader.disableAttribsArray(this.gl);

        this.gl.activeTexture(this.gl.TEXTURE0);

        this.gl.flush();
    };
    _.renderOutline = function() {
        this.outlineShader.useShaderProgram(this.gl);

        this.outlineShader.setGbufferTextureSize(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.outlineShader.setNormalThreshold(this.gl, this.styles.outline_normal_threshold);
        this.outlineShader.setDepthThreshold(this.gl, this.styles.outline_depth_threshold);
        this.outlineShader.setThickness(this.gl, this.styles.outline_thickness);

        this.gl.uniform1i(this.outlineShader.normalSampleUniform, 0);
        this.gl.uniform1i(this.outlineShader.depthSampleUniform, 1);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);

        this.outlineShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.outlineShader.disableAttribsArray(this.gl);

        this.gl.flush();
    };
    _.deferredRender = function() {
        // get backdground color
        let bgColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
        // set background to black
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

        // render color
        this.colorFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.renderColor();

        // render position
        this.positionFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.renderPosition();

        // render normals
        this.normalFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.renderNormal();

        // render ssao
        if(this.styles.ssao_3D && d3.SSAOShader) {
            // render ssao shading
            this.quadFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.renderSSAO();
        } else {
            this.ssaoFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }

        // render outline
        this.outlineFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        if(this.styles.outline_3D) {
            this.renderOutline();
        }

        // set back background color
        this.gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
        // composite render
        this.quadFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.lightingShader.useShaderProgram(this.gl);

        this.gl.uniform1i(this.lightingShader.positionSampleUniform, 0);
        this.gl.uniform1i(this.lightingShader.colorSampleUniform, 1);
        this.gl.uniform1i(this.lightingShader.ssaoSampleUniform, 2);
        this.gl.uniform1i(this.lightingShader.outlineSampleUniform, 3);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.positionTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.ssaoTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.outlineTexture.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);

        this.lightingShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.lightingShader.disableAttribsArray(this.gl);

        this.gl.flush();

        // final render
        this.fxaaFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // setup viewport
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture.texture);

        this.fxaaShader.useShaderProgram(this.gl);

        this.fxaaShader.setBuffersize(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.fxaaShader.setAntialias(this.gl, this.styles.antialias_3D);

        this.fxaaShader.setEdgeThreshold(this.gl, this.styles.fxaa_edgeThreshold);
        this.fxaaShader.setEdgeThresholdMin(this.gl, this.styles.fxaa_edgeThresholdMin);
        this.fxaaShader.setSearchSteps(this.gl, this.styles.fxaa_searchSteps);
        this.fxaaShader.setSearchThreshold(this.gl, this.styles.fxaa_searchThreshold);
        this.fxaaShader.setSubpixCap(this.gl, this.styles.fxaa_subpixCap);
        this.fxaaShader.setSubpixTrim(this.gl, this.styles.fxaa_subpixTrim);

        this.fxaaShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.fxaaShader.disableAttribsArray(this.gl);

        this.gl.flush();


        // final render
        this.finalFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.renderExtras();

        // set back background color
        this.gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);

        // last render
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // setup viewport
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.fxaaTexture.texture);

        this.quadShader.useShaderProgram(this.gl);

        this.quadShader.enableAttribsArray(this.gl);

        this.gl.quadBuffer.bindBuffers(this.gl);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.gl.quadBuffer.vertexPositionBuffer.numItems);

        this.quadShader.disableAttribsArray(this.gl);

        this.gl.flush();
    };
    _.forwardRender = function() {
        // last render
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // setup viewport
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        this.renderColor();

        this.renderExtras();
    };
    _.repaint = function() {
        if (this.gl) {
            // set up the model view matrix to the specified transformations
            this.gl.lightViewMatrix = m4.multiply(this.lighting.camera.viewMatrix, this.rotationMatrix, []);
            this.gl.rotationMatrix = this.rotationMatrix;
            this.gl.modelViewMatrix = this.gl.lightViewMatrix;

            this.renderDepthMap();

            this.gl.modelViewMatrix = m4.multiply(this.camera.viewMatrix, this.rotationMatrix, []);

            if(this.isSupportDeferred() && (this.styles.ssao_3D || this.styles.outline_3D)) {
                this.deferredRender();
            } else {
                this.forwardRender();
            }
        }
    };
    _.pick = function(x, y, includeAtoms, includeBonds) {
        if (this.gl) {
            // draw with pick framebuffer
            let xu = x;
            let yu = this.height - y;
            if (this.pixelRatio !== 1) {
                xu *= this.pixelRatio;
                yu *= this.pixelRatio;
            }

            // set up the model view matrix to the specified transformations
            m4.multiply(this.camera.viewMatrix, this.rotationMatrix, this.gl.modelViewMatrix);
            this.gl.rotationMatrix = this.rotationMatrix;

            this.pickShader.useShaderProgram(this.gl);

            // current clear color
            let cs = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);

            this.gl.clearColor(1.0, 1.0, 1.0, 0.0);
            this.pickerFramebuffer.bind(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // use default projection matrix to draw the molecule
            this.pickShader.setProjectionMatrix(this.gl, this.camera.projectionMatrix);

            // not need the normal for diffuse light, we need flat color
            this.pickShader.enableAttribsArray(this.gl);

            let objects = [];

            for ( let i = 0, ii = this.molecules.length; i < ii; i++) {
                this.molecules[i].renderPickFrame(this.gl, this.styles, objects, includeAtoms, includeBonds);
            }

            this.pickShader.disableAttribsArray(this.gl);

            this.gl.flush();

            let rgba = new Uint8Array(4);
            this.gl.readPixels(xu - 2, yu + 2, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);

            let object = undefined;
            let idxMolecule = rgba[3];
            if (idxMolecule > 0) {
                let idxAtom = rgba[2] | (rgba[1] << 8) | (rgba[0] << 16);
                object = objects[idxAtom];
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            // set back the clear color
            this.gl.clearColor(cs[0], cs[1], cs[2], cs[3]);
            return object;
        }
        return undefined;
    };
    _.center = function() {
        let p = new structures.Atom();
        for ( let k = 0, kk = this.molecules.length; k < kk; k++) {
            let m = this.molecules[k];
            p.add3D(m.getCenter3D());
        }
        p.x /= this.molecules.length;
        p.y /= this.molecules.length;
        for ( let k = 0, kk = this.molecules.length; k < kk; k++) {
            let m = this.molecules[k];
            for ( let i = 0, ii = m.atoms.length; i < ii; i++) {
                m.atoms[i].sub3D(p);
            }
            if (m.chains && m.fromJSON) {
                for ( let i = 0, ii = m.chains.length; i < ii; i++) {
                    let chain = m.chains[i];
                    for ( let j = 0, jj = chain.length; j < jj; j++) {
                        let residue = chain[j];
                        residue.cp1.sub3D(p);
                        residue.cp2.sub3D(p);
                        if (residue.cp3) {
                            residue.cp3.sub3D(p);
                            residue.cp4.sub3D(p);
                            residue.cp5.sub3D(p);
                        }
                    }
                }
            }
        }
    };
    _.isSupportDeferred = function() {
        return this.gl.textureFloatExt && this.gl.depthTextureExt;
    };
    _.create = function(id, width, height) {
        _super.create.call(this, id, width, height);
        // setup gl object
        try {
            let canvas = document.getElementById(this.id);
            this.gl = canvas.getContext('webgl');
            if (!this.gl) {
                this.gl = canvas.getContext('experimental-webgl');
            }
        } catch (e) {
        }
        if (this.gl) {

            if (this.pixelRatio !== 1 && this.gl.canvas.width === this.width) {
                this.gl.canvas.style.width = this.width + 'px';
                this.gl.canvas.style.height = this.height + 'px';
                this.gl.canvas.width = this.width * this.pixelRatio;
                this.gl.canvas.height = this.height * this.pixelRatio;
            }

            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.depthFunc(this.gl.LEQUAL);
            this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.clearDepth(1.0);

            // size of texture for render depth map from light view
            this.shadowTextureSize = 1024;
            // setup matrices
            this.rotationMatrix = m4.identity([]);
            // set up camera
            this.camera = new d3.Camera();

            this.label3D = new d3.Label();

            this.lighting = new d3.Light(this.styles.lightDiffuseColor_3D, this.styles.lightSpecularColor_3D, this.styles.lightDirection_3D);

            this.fogging = new d3.Fog(this.styles.fog_color_3D || this.styles.backgroundColor, this.styles.fog_start_3D, this.styles.fog_end_3D, this.styles.fog_density_3D);


            // uncomment this line to see shadow without depth texture extension
            this.gl.depthTextureExt = this.gl.getExtension('WEBGL_depth_texture') || this.gl.getExtension('WEBKIT_WEBGL_depth_texture') || this.gl.getExtension('MOZ_WEBGL_depth_texture');
            this.gl.textureFloatExt = this.gl.getExtension('OES_texture_float') || this.gl.getExtension('WEBKIT_OES_texture_float') || this.gl.getExtension('MOZ_OES_texture_float');
            // this.gl.shaderTextureLodExt = this.gl.getExtension('EXT_shader_texture_lod') || this.gl.getExtension('WEBKIT_EXT_shader_texture_lod') || this.gl.getExtension('MOZ_EXT_shader_texture_lod');
            // this.gl.drawBuffersExt = this.gl.getExtension('WEBGL_draw_buffers');

            this.ssao = new d3.SSAO();

            // set picker color attachment
            this.pickerColorTexture = new d3.Texture();
            this.pickerColorTexture.init(this.gl, this.gl.UNSIGNED_BYTE, this.gl.RGBA, this.gl.RGBA);

            // set picker depth attachment
            this.pickerDepthRenderbuffer = new d3.Renderbuffer();
            this.pickerDepthRenderbuffer.init(this.gl, this.gl.DEPTH_COMPONENT16);

            // set picker framebuffer
            this.pickerFramebuffer = new d3.Framebuffer();
            this.pickerFramebuffer.init(this.gl);
            this.pickerFramebuffer.setColorTexture(this.gl, this.pickerColorTexture.texture);
            this.pickerFramebuffer.setDepthRenderbuffer(this.gl, this.pickerDepthRenderbuffer.renderbuffer);

            // depth map for shadowing
            this.lightDepthMapTexture = new d3.Texture();
            this.lightDepthMapRenderbuffer = new d3.Renderbuffer();
            this.lightDepthMapFramebuffer = new d3.Framebuffer();
            this.lightDepthMapFramebuffer.init(this.gl);

            if(this.gl.depthTextureExt) {
                this.lightDepthMapTexture.init(this.gl, this.gl.UNSIGNED_SHORT, this.gl.DEPTH_COMPONENT);
                this.lightDepthMapRenderbuffer.init(this.gl, this.gl.RGBA4);
                this.lightDepthMapFramebuffer.setColorRenderbuffer(this.gl, this.lightDepthMapRenderbuffer.renderbuffer);
                this.lightDepthMapFramebuffer.setDepthTexture(this.gl, this.lightDepthMapTexture.texture);
            } else {
                this.lightDepthMapTexture.init(this.gl, this.gl.UNSIGNED_BYTE, this.gl.RGBA, this.gl.RGBA);
                this.lightDepthMapRenderbuffer.init(this.gl, this.gl.DEPTH_COMPONENT16);
                this.lightDepthMapFramebuffer.setColorTexture(this.gl, this.lightDepthMapTexture.texture);
                this.lightDepthMapFramebuffer.setDepthRenderbuffer(this.gl, this.lightDepthMapRenderbuffer.renderbuffer);
            }

            // deferred shading textures, renderbuffers, framebuffers and shaders
            if(this.isSupportDeferred()) {
                // g-buffer
                this.depthTexture = new d3.Texture();
                this.depthTexture.init(this.gl, this.gl.UNSIGNED_SHORT, this.gl.DEPTH_COMPONENT);

                this.colorTexture = new d3.Texture();
                this.colorTexture.init(this.gl, this.gl.UNSIGNED_BYTE, this.gl.RGBA);

                this.positionTexture = new d3.Texture();
                this.positionTexture.init(this.gl, this.gl.FLOAT, this.gl.RGBA);

                this.normalTexture = new d3.Texture();
                this.normalTexture.init(this.gl, this.gl.FLOAT, this.gl.RGBA);

                // postprocesing effect
                // ssao
                this.ssaoTexture = new d3.Texture();
                this.ssaoTexture.init(this.gl, this.gl.FLOAT, this.gl.RGBA);

                // outline
                this.outlineTexture = new d3.Texture();
                this.outlineTexture.init(this.gl, this.gl.UNSIGNED_BYTE, this.gl.RGBA);

                this.fxaaTexture = new d3.Texture();
                this.fxaaTexture.init(this.gl, this.gl.FLOAT, this.gl.RGBA);

                // temp texture
                this.imageTexture = new d3.Texture();
                this.imageTexture.init(this.gl, this.gl.FLOAT, this.gl.RGBA);

                // framebuffer
                this.colorFramebuffer = new d3.Framebuffer();
                this.colorFramebuffer.init(this.gl);
                this.colorFramebuffer.setColorTexture(this.gl, this.colorTexture.texture);
                this.colorFramebuffer.setDepthTexture(this.gl, this.depthTexture.texture);

                this.normalFramebuffer = new d3.Framebuffer();
                this.normalFramebuffer.init(this.gl);
                this.normalFramebuffer.setColorTexture(this.gl, this.normalTexture.texture);
                this.normalFramebuffer.setDepthTexture(this.gl, this.depthTexture.texture);

                this.positionFramebuffer = new d3.Framebuffer();
                this.positionFramebuffer.init(this.gl);
                this.positionFramebuffer.setColorTexture(this.gl, this.positionTexture.texture);
                this.positionFramebuffer.setDepthTexture(this.gl, this.depthTexture.texture);

                this.ssaoFramebuffer = new d3.Framebuffer();
                this.ssaoFramebuffer.init(this.gl);
                this.ssaoFramebuffer.setColorTexture(this.gl, this.ssaoTexture.texture);

                this.outlineFramebuffer = new d3.Framebuffer();
                this.outlineFramebuffer.init(this.gl);
                this.outlineFramebuffer.setColorTexture(this.gl, this.outlineTexture.texture);

                this.fxaaFramebuffer = new d3.Framebuffer();
                this.fxaaFramebuffer.init(this.gl);
                this.fxaaFramebuffer.setColorTexture(this.gl, this.fxaaTexture.texture);

                this.quadFramebuffer = new d3.Framebuffer();
                this.quadFramebuffer.init(this.gl);
                this.quadFramebuffer.setColorTexture(this.gl, this.imageTexture.texture);

                this.finalFramebuffer = new d3.Framebuffer();
                this.finalFramebuffer.init(this.gl);
                this.finalFramebuffer.setColorTexture(this.gl, this.fxaaTexture.texture);
                this.finalFramebuffer.setDepthTexture(this.gl, this.depthTexture.texture);

                this.normalShader = new d3.NormalShader();
                this.normalShader.init(this.gl);

                this.positionShader = new d3.PositionShader();
                this.positionShader.init(this.gl);

                if(d3.SSAOShader){
                    this.ssaoShader = new d3.SSAOShader();
                    this.ssaoShader.init(this.gl);

                    this.ssaoBlurShader = new d3.SSAOBlurShader();
                    this.ssaoBlurShader.init(this.gl);
                }

                this.outlineShader = new d3.OutlineShader();
                this.outlineShader.init(this.gl);

                this.lightingShader = new d3.LightingShader();
                this.lightingShader.init(this.gl);

                this.fxaaShader = new d3.FXAAShader();
                this.fxaaShader.init(this.gl);

                this.quadShader = new d3.QuadShader();
                this.quadShader.init(this.gl);
            }

            // this is the shaders
            this.labelShader = new d3.LabelShader();
            this.labelShader.init(this.gl);

            this.pickShader = new d3.PickShader();
            this.pickShader.init(this.gl);

            this.phongShader = new d3.PhongShader();
            this.phongShader.init(this.gl);

            if(d3.DepthShader){
                this.depthShader = new d3.DepthShader();
                this.depthShader.init(this.gl);
            }

            this.textTextImage = new d3.TextImage();
            this.textTextImage.init(this.gl);

            this.gl.textImage = new d3.TextImage();
            this.gl.textImage.init(this.gl);

            this.gl.textMesh = new d3.TextMesh();
            this.gl.textMesh.init(this.gl);

            // set up material
            this.gl.material = new d3.Material();

            this.setupScene();
        } else {
            this.displayMessage();
        }
    };
    _.displayMessage = function() {
        let canvas = document.getElementById(this.id);
        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');
            if (this.styles.backgroundColor) {
                ctx.fillStyle = this.styles.backgroundColor;
                ctx.fillRect(0, 0, this.width, this.height);
            }
            if (this.emptyMessage) {
                ctx.fillStyle = '#737683';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '18px Helvetica, Verdana, Arial, Sans-serif';
                ctx.fillText(this.emptyMessage, this.width / 2, this.height / 2);
            }
        }
    };
    _.renderText = function(text, position) {
        let vertexData = {
            position : [],
            texCoord : [],
            translation : []
        };
        this.textTextImage.pushVertexData(text, position, 0, vertexData);
        this.gl.textMesh.storeData(this.gl, vertexData.position, vertexData.texCoord, vertexData.translation);

        this.textTextImage.useTexture(this.gl);
        this.gl.textMesh.render(this.gl);
    };
    _.setupScene = function() {
        if (this.gl) {
            // clear the canvas
            // set background color for IE's sake, seems like an IE bug where half the repaints don't render a background
            let jqCapsule = q('#' + this.id);
            let backgroundString = this.styles.backgroundColor?this.styles.backgroundColor:'transparent';
            jqCapsule.css('background-color', backgroundString);
            let cs = backgroundString==='transparent'?[0.0,0.0,0.0,0.0]:math.getRGB(backgroundString, 1);
            this.gl.clearColor(cs[0], cs[1], cs[2], cs.length==4?cs[3]:1.0);
            this.styles.cullBackFace_3D ? this.gl.enable(this.gl.CULL_FACE) : this.gl.disable(this.gl.CULL_FACE);
            // here is the sphere buffer to be drawn, make it once, then scale
            // and translate to draw atoms
            this.gl.sphereBuffer = new d3.Sphere(1, this.styles.atoms_resolution_3D, this.styles.atoms_resolution_3D);
            this.gl.starBuffer = new d3.Star();
            this.gl.cylinderBuffer = new d3.Cylinder(1, 1, this.styles.bonds_resolution_3D);
            this.gl.cylinderClosedBuffer = new d3.Cylinder(1, 1, this.styles.bonds_resolution_3D, true);
            this.gl.boxBuffer = new d3.Box(1, 1, 1);
            this.gl.pillBuffer = new d3.Pill(this.styles.bonds_pillDiameter_3D / 2, this.styles.bonds_pillHeight_3D, this.styles.bonds_pillLatitudeResolution_3D, this.styles.bonds_pillLongitudeResolution_3D);
            this.gl.lineBuffer = new d3.Line();
            this.gl.lineArrowBuffer = new d3.LineArrow();
            this.gl.arrowBuffer = new d3.Arrow(0.3, this.styles.compass_resolution_3D);
            this.gl.quadBuffer = new d3.Quad();
            // texture for rendering text
            this.gl.textImage.updateFont(this.gl, this.styles.text_font_size, this.styles.text_font_families, this.styles.text_font_bold, this.styles.text_font_italic, this.styles.text_font_stroke_3D);
            // set up lighting
            this.lighting.lightScene(this.styles.lightDiffuseColor_3D, this.styles.lightSpecularColor_3D, this.styles.lightDirection_3D);
            // set up fogging
            this.fogging.fogScene(this.styles.fog_color_3D || this.styles.backgroundColor, this.styles.fog_start_3D, this.styles.fog_end_3D, this.styles.fog_density_3D);
            // set up compass
            this.compass = new d3.Compass(this.gl, this.styles);

            // set texture and renderbuffer parameter
            this.lightDepthMapTexture.setParameter(this.gl, this.shadowTextureSize, this.shadowTextureSize);
            this.lightDepthMapRenderbuffer.setParameter(this.gl, this.shadowTextureSize, this.shadowTextureSize);

            this.pickerColorTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
            this.pickerDepthRenderbuffer.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

            if(this.isSupportDeferred()) {
                this.depthTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.colorTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.imageTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.positionTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.normalTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.ssaoTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.outlineTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                this.fxaaTexture.setParameter(this.gl, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

                // set SSAO parameter
                this.ssao.initSampleKernel(this.styles.ssao_kernel_samples);

                this.ssao.initNoiseTexture(this.gl);
            }

            this.camera.updateProjectionMatrix(this.styles.projectionPerspective_3D);

            for ( let k = 0, kk = this.molecules.length; k < kk; k++) {
                let mol = this.molecules[k];
                if (!(mol.labelMesh instanceof d3.TextMesh)) {
                    mol.labelMesh = new d3.TextMesh();
                    mol.labelMesh.init(this.gl);
                }
                if (mol.chains) {
                    mol.ribbons = [];
                    mol.cartoons = [];
                    mol.tubes = [];
                    mol.pipePlanks = [];
                    // set up ribbon diagram if available and not already setup
                    for ( let j = 0, jj = mol.chains.length; j < jj; j++) {
                        let rs = mol.chains[j];
                        for ( let i = 0, ii = rs.length - 1; i < ii; i++) {
                            rs[i].Test =i;
                        }
                        let isNucleotide = rs.length > 3 && RESIDUE[rs[3].name] && RESIDUE[rs[3].name].aminoColor === '#BEA06E';
                        if (rs.length > 0 && !rs[0].lineSegments) {
                            for ( let i = 0, ii = rs.length - 1; i < ii; i++) {
                                rs[i].setup(rs[i + 1].cp1, isNucleotide ? 1 : this.styles.proteins_horizontalResolution);
                            }
                            if (!isNucleotide) {
                                for ( let i = 1, ii = rs.length - 1; i < ii; i++) {
                                    // reverse guide points if carbonyl
                                    // orientation flips
                                    if (extensions.vec3AngleFrom(rs[i - 1].D, rs[i].D) > m.PI / 2) {
                                        rs[i].guidePointsSmall.reverse();
                                        rs[i].guidePointsLarge.reverse();
                                        v3.scale(rs[i].D, -1);
                                    }
                                }
                            }
                            for ( let i = 2, ii = rs.length - 3; i < ii; i++) {
                                // compute line segments
                                rs[i].computeLineSegments(rs[i - 2], rs[i - 1], rs[i + 1], !isNucleotide, isNucleotide ? this.styles.nucleics_verticalResolution : this.styles.proteins_verticalResolution);
                            }
                            // remove unneeded dummies
                            rs.pop();
                            rs.pop();
                            rs.pop();
                            rs.shift();
                            rs.shift();
                        }
                        // create the hsl color for the chain
                        let rgb = math.hsl2rgb(jj === 1 ? .5 : j / jj, 1, .5);
                        let chainColor = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                        rs.chainColor = chainColor;
                        if (isNucleotide) {
                            let t = new d3.Tube(rs, this.styles.nucleics_tubeThickness, this.styles.nucleics_tubeResolution_3D);
                            t.chainColor = chainColor;
                            mol.tubes.push(t);
                        } else {
                            let t = new d3.PipePlank(rs, this.styles);
                            mol.pipePlanks.push(t);
                            let res = rs.shift();
                            let r = {
                                front : new d3.Ribbon(rs, this.styles.proteins_ribbonThickness, false),
                                back : new d3.Ribbon(rs, -this.styles.proteins_ribbonThickness, false)
                            };
                            r.front.chainColor = chainColor;
                            r.back.chainColor = chainColor;
                            mol.ribbons.push(r);
                            let d = {
                                front : new d3.Ribbon(rs, this.styles.proteins_ribbonThickness, true),
                                back : new d3.Ribbon(rs, -this.styles.proteins_ribbonThickness, true)
                            };
                            d.front.chainColor = chainColor;
                            d.back.chainColor = chainColor;
                            mol.cartoons.push(d);
                            rs.unshift(res);
                        }
                    }
                }
            }
            this.label3D.updateVerticesBuffer(this.gl, this.getMolecules(), this.styles);
            // the molecules in frame of MovieCanvas3D must be handled
            if (this instanceof c.MovieCanvas3D && this.frames) {
                for ( let i = 0, ii = this.frames.length; i < ii; i++) {
                    let f = this.frames[i];
                    for ( let j = 0, jj = f.mols.length; j < jj; j++) {
                        let mol = f.mols[j];
                        if (!(mol.labelMesh instanceof structures.d3.TextMesh)) {
                            mol.labelMesh = new structures.d3.TextMesh();
                            mol.labelMesh.init(this.gl);
                        }
                    }
                    this.label3D.updateVerticesBuffer(this.gl, f.mols, this.styles);
                }
            }
        }
    };
    _.updateScene = function() {
        this.camera.updateProjectionMatrix(this.styles.projectionPerspective_3D);

        this.lighting.lightScene(this.styles.lightDiffuseColor_3D, this.styles.lightSpecularColor_3D, this.styles.lightDirection_3D);

        this.fogging.fogScene(this.styles.fog_color_3D || this.styles.backgroundColor, this.styles.fog_start_3D, this.styles.fog_end_3D, this.styles.fog_density_3D);

        this.repaint();
    };
    _.mousedown = function(e) {
        this.lastPoint = e.p;
    };
    _.mouseup = function(e) {
        this.lastPoint = undefined;
    };
    _.rightmousedown = function(e) {
        this.lastPoint = e.p;
    };
    _.drag = function(e) {
        if(this.lastPoint){
            if (c.monitor.ALT) {
                let t = new structures.Point(e.p.x, e.p.y);
                t.sub(this.lastPoint);
                let theta = this.camera.fieldOfView / 360 * m.PI;
                let tanTheta = m.tan(theta);
                let topScreen = this.height / 2 / this.camera.zoom;
                let nearScreen = topScreen / tanTheta;
                let nearRatio = this.camera.focalLength() / nearScreen;
                m4.translate(this.camera.viewMatrix, [ t.x * nearRatio, -t.y * nearRatio, 0 ]);
            } else {
                let difx = e.p.x - this.lastPoint.x;
                let dify = e.p.y - this.lastPoint.y;
                let rotation = m4.rotate(m4.identity([]), difx * m.PI / 180.0, [ 0, 1, 0 ]);
                m4.rotate(rotation, dify * m.PI / 180.0, [ 1, 0, 0 ]);
                this.rotationMatrix = m4.multiply(rotation, this.rotationMatrix);
            }
            this.lastPoint = e.p;
            this.repaint();
        }
    };
    _.mousewheel = function(e, delta) {
        delta > 0 ? this.camera.zoomIn() : this.camera.zoomOut();
        this.updateScene();
    };
    _.multitouchmove = function(e, numFingers) {
        if (numFingers === 2) {
            if (this.lastPoint && this.lastPoint.multi) {
                let t = new structures.Point(e.p.x, e.p.y);
                t.sub(this.lastPoint);
                let theta = this.camera.fieldOfView / 360 * m.PI;
                let tanTheta = m.tan(theta);
                let topScreen = this.height / 2 / this.camera.zoom;
                let nearScreen = topScreen / tanTheta;
                let nearRatio = this.camera.focalLength() / nearScreen;
                m4.translate(this.camera.viewMatrix, [ t.x * nearRatio, -t.y * nearRatio, 0 ]);
                this.lastPoint = e.p;
                this.repaint();
            } else {
                this.lastPoint = e.p;
                this.lastPoint.multi = true;
            }
        }
    };
    _.gesturechange = function(e) {
        if (e.originalEvent.scale - this.lastPinchScale !== 0) {
            //let minFov = 0.1;
            //let maxFov = 179.9;
            let dz = -(e.originalEvent.scale / this.lastPinchScale - 1) * 30;
            if(isNaN(dz)){
                // this seems to happen on Android when using multiple fingers
                return;
            }
            dz > 0 ? this.camera.zoomOut() : this.camera.zoomIn();
            this.updateScene();
            this.lastPinchScale = e.originalEvent.scale;
        }
        this.repaint();
    };
    _.gestureend = function(e) {
        this.lastPinchScale = 1;
        this.lastGestureRotate = 0;
    };

})(ChemDoodle, ChemDoodle.extensions, ChemDoodle.math, ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.RESIDUE, Math, document, ChemDoodle.lib.mat4, ChemDoodle.lib.mat3, ChemDoodle.lib.vec3, ChemDoodle.lib.jQuery, window);

(function(c, iChemLabs, q, document, undefined) {
    'use strict';
    c.MolGrabberCanvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
        let sb = [];
        sb.push('<br><input type="text" id="');
        sb.push(id);
        sb.push('_query" size="32" value="" />');
        sb.push('<br><nobr>');
        sb.push('<select id="');
        sb.push(id);
        sb.push('_select">');
        // sb.push('<option value="chemexper">ChemExper');
        // sb.push('<option value="chemspider">ChemSpider');
        sb.push('<option value="pubchem" selected>PubChem');
        sb.push('</select>');
        sb.push('<button type="button" id="');
        sb.push(id);
        sb.push('_submit">Show Molecule</button>');
        sb.push('</nobr>');
        document.writeln(sb.join(''));
        let self = this;
        q('#' + id + '_submit').click(function() {
            self.search();
        });
        q('#' + id + '_query').keypress(function(e) {
            if (e.which === 13) {
                self.search();
            }
        });
    };
    let _ = c.MolGrabberCanvas3D.prototype = new c._Canvas3D();
    _.setSearchTerm = function(term) {
        q('#' + this.id + '_query').val(term);
        this.search();
    };
    _.search = function() {
        let self = this;
        iChemLabs.getMoleculeFromDatabase(q('#' + this.id + '_query').val(), {
            database : q('#' + this.id + '_select').val(),
            dimension : 3
        }, function(mol) {
            self.loadMolecule(mol);
        });
    };

})(ChemDoodle, ChemDoodle.iChemLabs, ChemDoodle.lib.jQuery, document);
(function(c, structures, undefined) {
    'use strict';
    c.MovieCanvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
        this.frames = [];
    };
    c.MovieCanvas3D.PLAY_ONCE = 0;
    c.MovieCanvas3D.PLAY_LOOP = 1;
    c.MovieCanvas3D.PLAY_SPRING = 2;
    let _ = c.MovieCanvas3D.prototype = new c._Canvas3D();
    _.timeout = 50;
    _.frameNumber = 0;
    _.playMode = 2;
    _.reverse = false;
    _.startAnimation = c._AnimatorCanvas.prototype.startAnimation;
    _.stopAnimation = c._AnimatorCanvas.prototype.stopAnimation;
    _.isRunning = c._AnimatorCanvas.prototype.isRunning;
    _.dblclick = c.RotatorCanvas.prototype.dblclick;
    _.nextFrame = function(delta) {
        let f = this.frames[this.frameNumber];
        this.molecules = f.mols;
        this.shapes = f.shapes;
        if (this.playMode === 2 && this.reverse) {
            this.frameNumber--;
            if (this.frameNumber < 0) {
                this.frameNumber = 1;
                this.reverse = false;
            }
        } else {
            this.frameNumber++;
            if (this.frameNumber >= this.frames.length) {
                if (this.playMode === 2) {
                    this.frameNumber -= 2;
                    this.reverse = true;
                } else {
                    this.frameNumber = 0;
                    if (this.playMode === 0) {
                        this.stopAnimation();
                    }
                }
            }
        }
    };
    _.center = function() {
        // override this function to center the entire movie
        let p = new structures.Atom();
        let first = this.frames[0];
        for ( let j = 0, jj = first.mols.length; j < jj; j++) {
            p.add3D(first.mols[j].getCenter3D());
        }
        p.x /= first.mols.length;
        p.y /= first.mols.length;
        let center = new structures.Atom();
        center.sub3D(p);
        for ( let i = 0, ii = this.frames.length; i < ii; i++) {
            let f = this.frames[i];
            for ( let j = 0, jj = f.mols.length; j < jj; j++) {
                let mol = f.mols[j];
                for ( let k = 0, kk = mol.atoms.length; k < kk; k++) {
                    mol.atoms[k].add3D(center);
                }
            }
        }
    };
    _.addFrame = function(molecules, shapes) {
        this.frames.push({
            mols : molecules,
            shapes : shapes
        });
    };

})(ChemDoodle, ChemDoodle.structures);

(function(c, m, m4, undefined) {
    'use strict';
    // keep these declaration outside the loop to avoid overhead
    let matrix = [];
    let xAxis = [ 1, 0, 0 ];
    let yAxis = [ 0, 1, 0 ];
    let zAxis = [ 0, 0, 1 ];

    c.RotatorCanvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
    };
    let _ = c.RotatorCanvas3D.prototype = new c._Canvas3D();
    _.timeout = 33;
    let increment = m.PI / 15;
    _.xIncrement = increment;
    _.yIncrement = increment;
    _.zIncrement = increment;
    _.startAnimation = c._AnimatorCanvas.prototype.startAnimation;
    _.stopAnimation = c._AnimatorCanvas.prototype.stopAnimation;
    _.isRunning = c._AnimatorCanvas.prototype.isRunning;
    _.dblclick = c.RotatorCanvas.prototype.dblclick;
    _.mousedown = undefined;
    _.rightmousedown = undefined;
    _.drag = undefined;
    _.mousewheel = undefined;
    _.nextFrame = function(delta) {
        if (this.molecules.length === 0 && this.shapes.length === 0) {
            this.stopAnimation();
            return;
        }
        m4.identity(matrix);
        let change = delta / 1000;
        m4.rotate(matrix, this.xIncrement * change, xAxis);
        m4.rotate(matrix, this.yIncrement * change, yAxis);
        m4.rotate(matrix, this.zIncrement * change, zAxis);
        m4.multiply(this.rotationMatrix, matrix);
    };

})(ChemDoodle, Math, ChemDoodle.lib.mat4);
(function(c, undefined) {
    'use strict';
    c.TransformCanvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
    };
    c.TransformCanvas3D.prototype = new c._Canvas3D();

})(ChemDoodle);
(function(c, undefined) {
    'use strict';
    c.ViewerCanvas3D = function(id, width, height) {
        if (id) {
            this.create(id, width, height);
        }
    };
    let _ = c.ViewerCanvas3D.prototype = new c._Canvas3D();
    _.mousedown = undefined;
    _.rightmousedown = undefined;
    _.drag = undefined;
    _.mousewheel = undefined;

})(ChemDoodle);

(function(c, math, monitor, actions, states, structures, SYMBOLS, m, m4, undefined) {
    'use strict';
    states._State3D = function() {
    };
    let _ = states._State3D.prototype;
    _.setup = function(editor) {
        this.editor = editor;
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
    };
    _.mousedown = function(e) {
        this.editor.defaultmousedown(e);
        // must also check for mobile hits here to the help button
        if (this.editor.isHelp || this.editor.isMobile && e.p.distance(new structures.Point(this.editor.width - 20, 20)) < 10) {
            this.editor.isHelp = false;
            this.editor.lastPoint = undefined;
            this.editor.repaint();
            // window.open doesn't work once Event.preventDefault() has been called
            location.href='https://web.chemdoodle.com/demos/3d-editor';
            //window.open('https://web.chemdoodle.com/demos/3d-editor');
        } else if (this.innermousedown) {
            this.innermousedown(e);
        }
    };
    _.rightmousedown = function(e) {
        if (this.innerrightmousedown) {
            this.innerrightmousedown(e);
        }
        this.editor.defaultrightmousedown(e);
    };
    _.mousemove = function(e) {
        if (this.innermousemove) {
            this.innermousemove(e);
        }
        // call the repaint here to repaint the help button, also this is called
        // by other functions, so the repaint must be here
        this.editor.repaint();
    };
    _.mouseout = function(e) {
        if (this.innermouseout) {
            this.innermouseout(e);
        }
    };
    _.mouseover = function(e) {
        if (this.innermouseover) {
            this.innermouseover(e);
        }
    };
    _.mouseup = function(e) {
        if (this.innermouseup) {
            this.innermouseup(e);
        }
        this.editor.defaultmouseup(e);
    };
    _.rightmouseup = function(e) {
        if (this.innerrightmouseup) {
            this.innerrightmouseup(e);
        }
    };
    _.mousewheel = function(e, delta) {
        if (this.innermousewheel) {
            this.innermousewheel(e);
        } else {
            this.editor.defaultmousewheel(e, delta);
        }
    };
    _.drag = function(e) {
        if (this.innerdrag) {
            this.innerdrag(e);
        } else {
            this.editor.defaultdrag(e);
        }
    };
    _.keydown = function(e) {
        if (monitor.META) {
            if (e.which === 90) {
                // z
                this.editor.historyManager.undo();
            } else if (e.which === 89) {
                // y
                this.editor.historyManager.redo();
            } else if (e.which === 83) {
                // s
                this.editor.toolbarManager.buttonSave.func();
            } else if (e.which === 79) {
                // o
                this.editor.toolbarManager.buttonOpen.func();
            } else if (e.which === 187 || e.which === 61) {
                // +
                this.editor.toolbarManager.buttonScalePlus.func();
            } else if (e.which === 189 || e.which === 109) {
                // -
                this.editor.toolbarManager.buttonScaleMinus.func();
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
        if (this.innerkeyup) {
            this.innerkeyup(e);
        }
    };

})(ChemDoodle, ChemDoodle.math, ChemDoodle.monitor, ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.SYMBOLS, Math, ChemDoodle.lib.mat4);
(function(actions, states, structures, d3, q, undefined) {
    'use strict';
    states.MeasureState3D = function(editor) {
        this.setup(editor);
        this.selectedAtoms = [];
    };
    let _ = states.MeasureState3D.prototype = new states._State3D();
    _.numToSelect = 2;

    _.reset = function(){
        for(let i = 0, ii = this.selectedAtoms.length; i<ii; i++){
            this.selectedAtoms[i].isSelected = false;
        }
        this.selectedAtoms = [];
        this.editor.repaint();
    };
    _.innerenter = function(e) {
        this.reset();
    };
    _.innerexit = function(e) {
        this.reset();
    };
    _.innermousemove = function(e) {
        if (this.hoveredAtom) {
            this.hoveredAtom.isHover = false;
            this.hoveredAtom = undefined;
        }
        let obj = this.editor.pick(e.p.x, e.p.y, true, false);
        if (obj && obj instanceof structures.Atom) {
            this.hoveredAtom = obj;
            obj.isHover = true;
        }
        this.editor.repaint();
    };
    _.innermousedown = function(e) {
        // don't use click as that doesn't work on android
        if(this.editor.isMobile){
            this.innermousemove(e);
        }
        if (this.hoveredAtom) {
            this.hoveredAtom.isHover = false;
            if (this.hoveredAtom.isSelected) {
                let a = this.hoveredAtom;
                this.selectedAtoms = q.grep(this.selectedAtoms, function(value) {
                    return value !== a;
                });
            } else {
                this.selectedAtoms.push(this.hoveredAtom);
            }
            this.hoveredAtom.isSelected = !this.hoveredAtom.isSelected;
            this.hoveredAtom = undefined;
            this.editor.repaint();
        }
        if (this.selectedAtoms.length === this.numToSelect) {
            let shape;
            switch(this.numToSelect){
                case 2:
                    shape = new d3.Distance(this.selectedAtoms[0], this.selectedAtoms[1]);
                    break;
                case 3:
                    shape = new d3.Angle(this.selectedAtoms[0], this.selectedAtoms[1], this.selectedAtoms[2]);
                    break;
                case 4:
                    shape = new d3.Torsion(this.selectedAtoms[0], this.selectedAtoms[1], this.selectedAtoms[2], this.selectedAtoms[3]);
                    break;
            }
            this.reset();
            if(shape){
                this.editor.historyManager.pushUndo(new actions.AddShapeAction(this.editor, shape));
            }
        }
    };

})(ChemDoodle.uis.actions, ChemDoodle.uis.states, ChemDoodle.structures, ChemDoodle.structures.d3, ChemDoodle.lib.jQuery);
(function(states, undefined) {
    'use strict';
    states.ViewState3D = function(editor) {
        this.setup(editor);
    };
    let _ = states.ViewState3D.prototype = new states._State3D();

})(ChemDoodle.uis.states);
(function(states, undefined) {
    'use strict';
    states.StateManager3D = function(editor) {
        this.STATE_VIEW = new states.ViewState3D(editor);
        this.STATE_MEASURE = new states.MeasureState3D(editor);
        let currentState = this.STATE_VIEW;
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

})(ChemDoodle.uis.states);
(function(c, iChemLabs, io, structures, actions, gui, imageDepot, desktop, tools, states, q, document, undefined) {
    'use strict';
    gui.ToolbarManager3D = function(editor) {
        this.editor = editor;

        // open
        this.buttonOpen = new desktop.Button(editor.id + '_button_open', imageDepot.OPEN, 'Open', function() {
            editor.dialogManager.openPopup.show();
        });
        // save
        this.buttonSave = new desktop.Button(editor.id + '_button_save', imageDepot.SAVE, 'Save', function() {
            if (editor.useServices) {
                editor.dialogManager.saveDialog.clear();
            } else {
                editor.dialogManager.saveDialog.getTextArea().val(c.writeMOL(editor.molecules[0]));
            }
            editor.dialogManager.saveDialog.open();
        });
        // search
        this.buttonSearch = new desktop.Button(editor.id + '_button_search', imageDepot.SEARCH, 'Search', function() {
            editor.dialogManager.searchDialog.open();
        });
        // calculate
        this.buttonCalculate = new desktop.Button(editor.id + '_button_calculate', imageDepot.CALCULATE, 'Calculate', function() {
            let mol = editor.molecules[0];
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
                    editor.dialogManager.calculateDialog.getTextArea().val(sb.join(''));
                    editor.dialogManager.calculateDialog.open();
                });
            }
        });

        // transform
        this.buttonTransform = new desktop.Button(editor.id + '_button_transform', imageDepot.PERSPECTIVE, 'Transform', function() {
            editor.stateManager.setState(editor.stateManager.STATE_VIEW);
        });
        this.buttonTransform.toggle = true;

        // visual specifications
        this.buttonSettings = new desktop.Button(editor.id + '_button_specifications', imageDepot.SETTINGS, 'Visual Specifications', function() {
            editor.dialogManager.stylesDialog.update(editor.styles);
            editor.dialogManager.stylesDialog.open();
        });

        // animations
        this.buttonAnimation = new desktop.Button(editor.id + '_button_animation', imageDepot.ANIMATION, 'Animations', function() {
            editor.stateManager.setState(editor.stateManager.STATE_MOVE);
        });

        // clear
        this.buttonClear = new desktop.Button(editor.id + '_button_clear', imageDepot.CLEAR, 'Clear', function() {
            editor.historyManager.pushUndo(new actions.ClearAction(editor));
        });
        // clean
        this.buttonClean = new desktop.Button(editor.id + '_button_clean', imageDepot.OPTIMIZE, 'Clean', function() {
            let mol = editor.molecules[0];
            if (mol) {
                iChemLabs.optimize(mol, {
                    dimension : 3
                }, function(mol) {
                    editor.historyManager.pushUndo(new actions.SwitchMoleculeAction(editor, mol));
                });
            }
        });

        // scale set
        this.makeScaleSet(this);

        // history set
        this.makeHistorySet(this);

        // history set
        this.makeMeasurementsSet(this);
    };
    let _ = gui.ToolbarManager3D.prototype;
    _.write = function() {
        let sb = [ '<div style="font-size:10px;">' ];
        let bg = this.editor.id + '_main_group';
        sb.push(this.historySet.getSource());
        sb.push(this.scaleSet.getSource());
        sb.push(this.buttonOpen.getSource());
        sb.push(this.buttonSave.getSource());
        if (this.editor.useServices) {
            sb.push(this.buttonSearch.getSource());
            sb.push(this.buttonCalculate.getSource());
        }
        sb.push('<br>');
        sb.push(this.buttonTransform.getSource(bg));
        sb.push(this.buttonSettings.getSource());
        //sb.push(this.buttonAnimation.getSource());
        sb.push(this.measurementsSet.getSource(bg));
        sb.push(this.buttonClear.getSource());
        if (this.editor.useServices) {
            sb.push(this.buttonClean.getSource());
        }
        sb.push('</div>');

        if (document.getElementById(this.editor.id)) {
            let canvas = q('#' + this.editor.id);
            canvas.before(sb.join(''));
        } else {
            document.write(sb.join(''));
        }
    };
    _.setup = function() {
        this.buttonTransform.setup(true);
        this.buttonSettings.setup();
        //this.buttonAnimation.setup();
        this.measurementsSet.setup();
        this.buttonClear.setup();
        if (this.editor.useServices) {
            this.buttonClean.setup();
        }
        this.historySet.setup();
        this.scaleSet.setup();
        this.buttonOpen.setup();
        this.buttonSave.setup();
        if (this.editor.useServices) {
            this.buttonSearch.setup();
            this.buttonCalculate.setup();
        }

        this.buttonTransform.getElement().click();
        this.buttonUndo.disable();
        this.buttonRedo.disable();
    };

    _.makeScaleSet = function(self) {
        this.scaleSet = new desktop.ButtonSet(self.editor.id + '_buttons_scale');
        this.scaleSet.toggle = false;
        this.buttonScalePlus = new desktop.Button(self.editor.id + '_button_scale_plus', imageDepot.ZOOM_IN, 'Increase Scale', function() {
            self.editor.mousewheel(null, -10);
        });
        this.scaleSet.buttons.push(this.buttonScalePlus);
        this.buttonScaleMinus = new desktop.Button(self.editor.id + '_button_scale_minus', imageDepot.ZOOM_OUT, 'Decrease Scale', function() {
            self.editor.mousewheel(null, 10);
        });
        this.scaleSet.buttons.push(this.buttonScaleMinus);
    };
    _.makeHistorySet = function(self) {
        this.historySet = new desktop.ButtonSet(self.editor.id + '_buttons_history');
        this.historySet.toggle = false;
        this.buttonUndo = new desktop.Button(self.editor.id + '_button_undo', imageDepot.UNDO, 'Undo', function() {
            self.editor.historyManager.undo();
        });
        this.historySet.buttons.push(this.buttonUndo);
        this.buttonRedo = new desktop.Button(self.editor.id + '_button_redo', imageDepot.REDO, 'Redo', function() {
            self.editor.historyManager.redo();
        });
        this.historySet.buttons.push(this.buttonRedo);
    };
    _.makeMeasurementsSet = function(self) {
        this.measurementsSet = new desktop.ButtonSet(self.editor.id + '_buttons_measurements');
        this.buttonDistance = new desktop.Button(self.editor.id + '_button_distance', imageDepot.DISTANCE, 'Distance', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 2;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonDistance);
        this.buttonAngle = new desktop.Button(self.editor.id + '_button_angle', imageDepot.ANGLE, 'Angle', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 3;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonAngle);
        this.buttonTorsion = new desktop.Button(self.editor.id + '_button_torsion', imageDepot.TORSION, 'Torsion', function() {
            self.editor.stateManager.STATE_MEASURE.numToSelect = 4;
            self.editor.stateManager.STATE_MEASURE.reset();
            self.editor.stateManager.setState(self.editor.stateManager.STATE_MEASURE);
        });
        this.measurementsSet.buttons.push(this.buttonTorsion);
    };

})(ChemDoodle, ChemDoodle.iChemLabs, ChemDoodle.io, ChemDoodle.structures, ChemDoodle.uis.actions, ChemDoodle.uis.gui, ChemDoodle.uis.gui.imageDepot, ChemDoodle.uis.gui.desktop, ChemDoodle.uis.tools, ChemDoodle.uis.states, ChemDoodle.lib.jQuery, document);
(function (c, featureDetection, d3, sketcherPack, structures, tools, q, m, m4, window, undefined) {
    'use strict';
    c.EditorCanvas3D = function (id, width, height, options) {
        // keep checks to undefined here as these are booleans
        this.isMobile = options.isMobile === undefined ? featureDetection.supports_touch() : options.isMobile;
        this.useServices = options.useServices === undefined ? false : options.useServices;
        this.includeToolbar = options.includeToolbar === undefined ? true : options.includeToolbar;
        this.oneMolecule = true;
        // toolbar manager needs the editor id to make it unique to this
        // canvas
        this.id = id;
        this.toolbarManager = new sketcherPack.gui.ToolbarManager3D(this);
        if (this.includeToolbar) {
            this.toolbarManager.write();
            // If pre-created, wait until the last button image loads before
            // calling setup.
            let self = this;
            if (document.getElementById(this.id)) {
                q('#' + id + '_button_calculate').load(function () {
                    self.toolbarManager.setup();
                });
            } else {
                q(window).load(function () {
                    self.toolbarManager.setup();
                });
            }
            this.dialogManager = new sketcherPack.gui.DialogManager(this);
        }
        this.stateManager = new sketcherPack.states.StateManager3D(this);
        this.historyManager = new sketcherPack.actions.HistoryManager(this);
        if (id) {
            this.create(id, width, height);
        }
        // styles for draw "help" atom
        let helpSpecs = new structures.Styles();
        helpSpecs.atoms_useVDWDiameters_3D = false;
        helpSpecs.atoms_sphereDiameter_3D = 2;
        this.helpButton = new structures.Atom('C', 0, 0, 0);
        this.helpButton.isHover = true;
        this.helpButton.styles = helpSpecs;
        this.styles.backgroundColor = '#000';
        this.styles.shapes_color = '#fff';
        this.isHelp = false;
        this.setupScene();
        this.repaint();
    };
    let _ = c.EditorCanvas3D.prototype = new c._Canvas3D();
    // saves of default behavior
    _.defaultmousedown = _.mousedown;
    _.defaultmouseup = _.mouseup;
    _.defaultrightmousedown = _.rightmousedown;
    _.defaultdrag = _.drag;
    _.defaultmousewheel = _.mousewheel;
    _.drawChildExtras = function (gl) {

        // NOTE: gl and this.gl is same object because "EditorCanvas3D" inherit
        // from "_Canvas3D"

        gl.disable(gl.DEPTH_TEST);

        let translationMatrix = m4.create();

        let height = this.height / 20;
        let tanTheta = m.tan(this.styles.projectionPerspectiveVerticalFieldOfView_3D / 360 * m.PI);
        let depth = height / tanTheta;
        let near = m.max(depth - height, 0.1);
        let far = depth + height;
        let aspec = this.width / this.height;

        let nearRatio = depth / this.height * tanTheta;
        let top = tanTheta * depth;
        let bottom = -top;
        let left = aspec * bottom;
        let right = aspec * top;

        let projectionMatrix = m4.ortho(left, right, bottom, top, near, far, []);

        this.phongShader.useShaderProgram(gl);

        this.phongShader.setProjectionMatrix(gl, projectionMatrix);

        this.phongShader.setFogMode(gl, 0);

        if (!this.hideHelp) {
            // help and tutorial

            let posX = (this.width - 40) * nearRatio;
            let posY = (this.height - 40) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);

            // setting "help" button color
            gl.material.setTempColors(gl, this.styles.bonds_materialAmbientColor_3D, undefined, this.styles.bonds_materialSpecularColor_3D, this.styles.bonds_materialShininess_3D);
            gl.material.setDiffuseColor(gl, '#00ff00');

            // this "gl.modelViewMatrix" must be set because it used by Atom
            // when rendered
            gl.modelViewMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);

            this.phongShader.enableAttribsArray(gl);

            gl.sphereBuffer.bindBuffers(this.gl);
            this.helpButton.render(gl, undefined, true);
            if (this.isHelp) {
                gl.sphereBuffer.bindBuffers(gl);
                // colors
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.material.setTempColors(gl, '#000000', undefined, '#000000', 0);
                gl.enable(gl.BLEND);
                gl.depthMask(false);
                gl.material.setAlpha(gl, .4);
                this.helpButton.renderHighlight(gl, undefined);
                gl.depthMask(true);
                gl.disable(gl.BLEND);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            }

            this.phongShader.disableAttribsArray(gl);

            gl.flush();

            // enable blend and depth mask set to false
            gl.enable(gl.BLEND);
            gl.depthMask(false);

            this.labelShader.useShaderProgram(gl);
            this.labelShader.setProjectionMatrix(gl, projectionMatrix);

            this.textTextImage.updateFont(this.gl, 14.1, ['sans-serif'], false, false, true);

            let modelMatrix = m4.multiply(translationMatrix, m4.identity([]), []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.labelShader.enableAttribsArray(gl);

            this.renderText('?', [0, 0, 0]);

            this.labelShader.disableAttribsArray(gl);

            // disable blend and depth mask set to true
            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }

        if (!this.paidToHideTrademark) {
            // You must keep this name displayed at all times to abide by the license
            // Contact us for permission to remove it,
            // http://www.ichemlabs.com/contact-us
            let x = '\x43\x68\x65\x6D\x44\x6F\x6F\x64\x6C\x65';

            // enable blend for transparancy
            gl.enable(this.gl.BLEND);

            this.labelShader.useShaderProgram(gl);
            this.labelShader.setProjectionMatrix(gl, projectionMatrix);

            this.labelShader.enableAttribsArray(gl);
            // Draw the copyright logo and trademark
            this.textTextImage.updateFont(gl, 14.1, ['sans-serif'], false, false, true);

            let width = this.textTextImage.textWidth(x)/this.pixelRatio;

            let posX = (this.width - width - 30) * nearRatio;
            let posY = (-this.height + 24) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);
            let modelMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.renderText(x, [0, 0, 0]);

            // Draw the (R) part
            posX = (this.width - 18) * nearRatio;
            posY = (-this.height + 30) * nearRatio;

            m4.translate(m4.identity([]), [posX, posY, -depth], translationMatrix);
            modelMatrix = m4.multiply(translationMatrix, gl.rotationMatrix, []);
            this.labelShader.setModelViewMatrix(gl, modelMatrix);

            this.textTextImage.updateFont(gl, 10, ['sans-serif'], false, false, true);

            this.renderText('\u00AE', [0, 0, 0]);

            // disable vertex for draw text
            this.labelShader.disableAttribsArray(gl);

            // disable blend
            gl.disable(gl.BLEND);
            gl.flush();
        }

        gl.enable(gl.DEPTH_TEST);
    };
    _.checksOnAction = function (force) {
        // using force improves efficiency, so changes will not be checked
        // until a render occurs
        // you can force a check by sending true to this function after
        // calling check with a false
        if (force && this.doChecks) {

        }
        this.doChecks = !force;
    };
    // desktop events
    _.click = function (e) {
        this.stateManager.getCurrentState().click(e);
    };
    _.rightclick = function (e) {
        this.stateManager.getCurrentState().rightclick(e);
    };
    _.dblclick = function (e) {
        this.stateManager.getCurrentState().dblclick(e);
    };
    _.mousedown = function (e) {
        this.stateManager.getCurrentState().mousedown(e);
    };
    _.rightmousedown = function (e) {
        this.stateManager.getCurrentState().rightmousedown(e);
    };
    _.mousemove = function (e) {
        this.isHelp = false;
        if (e.p.distance(new structures.Point(this.width - 20, 20)) < 10) {
            this.isHelp = true;
        }
        this.stateManager.getCurrentState().mousemove(e);
    };
    _.mouseout = function (e) {
        this.stateManager.getCurrentState().mouseout(e);
    };
    _.mouseover = function (e) {
        this.stateManager.getCurrentState().mouseover(e);
    };
    _.mouseup = function (e) {
        this.stateManager.getCurrentState().mouseup(e);
    };
    _.rightmouseup = function (e) {
        this.stateManager.getCurrentState().rightmouseup(e);
    };
    _.mousewheel = function (e, delta) {
        this.stateManager.getCurrentState().mousewheel(e, delta);
    };
    _.drag = function (e) {
        this.stateManager.getCurrentState().drag(e);
    };
    _.keydown = function (e) {
        this.stateManager.getCurrentState().keydown(e);
    };
    _.keypress = function (e) {
        this.stateManager.getCurrentState().keypress(e);
    };
    _.keyup = function (e) {
        this.stateManager.getCurrentState().keyup(e);
    };

})(ChemDoodle, ChemDoodle.featureDetection, ChemDoodle.structures.d3, ChemDoodle.uis, ChemDoodle.structures, ChemDoodle.uis.tools, ChemDoodle.lib.jQuery, Math, ChemDoodle.lib.mat4, window);
