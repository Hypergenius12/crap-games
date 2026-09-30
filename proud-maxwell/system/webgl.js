const WebGLBG = {
    init: function() {
        const canvas = document.createElement('canvas');
        canvas.id = 'webgl-bg';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        
        document.body.insertBefore(canvas, document.getElementById('desktop'));

        const gl = canvas.getContext('webgl');
        if (!gl) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();

        const vsSource = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;

        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;

            // Simple 2D noise function
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                uv.x *= u_resolution.x / u_resolution.y;

                // Slow, elegant flow
                float t = u_time * 0.1;
                
                float n1 = snoise(uv * 1.5 + vec2(t, t * 0.5));
                float n2 = snoise(uv * 3.0 - vec2(t * 0.8, t * 0.3));
                float n3 = snoise(uv * 5.0 + vec2(-t * 0.5, t));
                
                float totalNoise = n1 * 0.5 + n2 * 0.25 + n3 * 0.125;
                
                // Beautiful dark aurora colors
                vec3 color1 = vec3(0.02, 0.05, 0.1);  // Deep blue
                vec3 color2 = vec3(0.05, 0.15, 0.25); // Teal
                vec3 color3 = vec3(0.1, 0.3, 0.4);    // Cyan
                
                vec3 finalColor = mix(color1, color2, totalNoise + 0.5);
                finalColor = mix(finalColor, color3, smoothstep(0.3, 0.7, totalNoise));
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const timeUniformLocation = gl.getUniformLocation(program, "u_time");
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        const startTime = Date.now();
        WebGLBG.speedMultiplier = 1.0;
        let simulatedTime = 0;
        let lastFrameTime = Date.now();

        const render = () => {
            const now = Date.now();
            const delta = (now - lastFrameTime) * 0.001;
            lastFrameTime = now;
            
            simulatedTime += delta * WebGLBG.speedMultiplier;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
            gl.uniform1f(timeUniformLocation, simulatedTime);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        };

        render();
    }
};

window.WebGLBG = WebGLBG;
