import React, { useEffect, useRef } from 'react';
import { HeroBadge } from './HeroBadge';
import { HiArrowRight as ArrowRightIcon } from 'react-icons/hi';

// Define WebGL-related interfaces
interface WebGLProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    position: number;
  };
  uniformLocations: {
    iTime: WebGLUniformLocation;
    iResolution: WebGLUniformLocation;
  };
}

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const vertexShaderSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0, 1); }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      #define filmGrainIntensity 0.15

      mat2 Rot(float a) {
          float s = sin(a);
          float c = cos(a);
          return mat2(c, -s, s, c);
      }

      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
          return fract(sin(p)*43758.5453);
      }

      float noise(in vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          float n = mix(mix(dot(-1.0+2.0*hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                            dot(-1.0+2.0*hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                      mix(dot(-1.0+2.0*hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                            dot(-1.0+2.0*hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
          return 0.5 + 0.5*n;
      }

      float filmGrainNoise(in vec2 uv) {
          return length(hash(vec2(uv.x, uv.y)));
      }

      void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          vec2 uv = fragCoord / iResolution.xy;
          float aspectRatio = iResolution.x / iResolution.y;

          vec2 tuv = uv - .5;
          float degree = noise(vec2(iTime*.04, tuv.x*tuv.y));
          tuv.y *= 1./aspectRatio;
          tuv = Rot(radians((degree-.5)*720.+180.)) * tuv;
          tuv.y *= aspectRatio;

          float frequency = 4.5;
          float amplitude = 38.;
          float speed = iTime * 1.5;
          tuv.x += sin(tuv.y*frequency+speed)/amplitude;
          tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);

          // Darker, more mystique aurora colors
          vec3 auroraBlack = vec3(10.0, 10.0, 15.0)/255.0;
          vec3 auroraCyan = vec3(35.0, 115.0, 130.0)/255.0;
          vec3 auroraMagenta = vec3(110.0, 50.0, 130.0)/255.0;
          vec3 auroraBlue = vec3(15.0, 30.0, 100.0)/255.0;

          vec3 auroraPurple = vec3(60.0, 30.0, 100.0)/255.0;
          vec3 auroraPink = vec3(130.0, 55.0, 90.0)/255.0;
          vec3 auroraPeach = vec3(255.0, 150.0, 120.0)/255.0;
          vec3 auroraMidnight = vec3(5.0, 15.0, 30.0)/255.0;

          // Animate between two sets of gradients
          float cycle = sin(iTime * 0.35);
          float t = (sign(cycle) * pow(abs(cycle), 0.6) + 1.) / 2.;
          vec3 color1 = mix(auroraBlack, auroraPurple, t);
          vec3 color2 = mix(auroraCyan, auroraMidnight, t);
          vec3 color3 = mix(auroraMagenta, auroraPeach, t);
          vec3 color4 = mix(auroraBlue, auroraPink, t);

          vec3 layer1 = mix(color3, color2, smoothstep(-.3, .2, (Rot(radians(-5.))*tuv).x));
          vec3 layer2 = mix(color4, color1, smoothstep(-.3, .2, (Rot(radians(-5.))*tuv).x));
          vec3 color = mix(layer1, layer2, smoothstep(.5, -.3, tuv.y));

          color = color - filmGrainNoise(uv) * filmGrainIntensity;

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Helper functions for WebGL setup
    const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
      const shader = gl.createShader(type);
      if (!shader) {
        throw new Error('Failed to create shader');
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
      }
      return shader;
    };

    const createProgram = (gl: WebGLRenderingContext, vsrc: string, fsrc: string): WebGLProgram => {
      const vshader = createShader(gl, gl.VERTEX_SHADER, vsrc);
      const fshader = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
      const prog = gl.createProgram();
      if (!prog) {
        throw new Error('Failed to create program');
      }
      gl.attachShader(prog, vshader);
      gl.attachShader(prog, fshader);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || 'Program linking failed');
      }
      return prog;
    };

    // Create program and buffer
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const positionLocation = gl.getAttribLocation(program, 'position');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');

    if (!iTimeLocation || !iResolutionLocation) {
      throw new Error('Could not get uniform locations');
    }

    const programInfo: WebGLProgramInfo = {
      program,
      attribLocations: {
        position: positionLocation,
      },
      uniformLocations: {
        iTime: iTimeLocation,
        iResolution: iResolutionLocation,
      }
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, 1, 1
    ]), gl.STATIC_DRAW);

    // Handle resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    };

    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation frame handler
    const render = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }
      const elapsedTime = time - startTimeRef.current;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(programInfo.attribLocations.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.position,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.uniform1f(programInfo.uniformLocations.iTime, elapsedTime * 0.001);
      gl.uniform2f(
        programInfo.uniformLocations.iResolution,
        canvas.width,
        canvas.height
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestRef.current = requestAnimationFrame(render);
    };

    // Start the animation loop
    requestRef.current = requestAnimationFrame(render);

    // Cleanup function
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative h-screen bg-slate-900">
      {/* WebGL Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-screen z-10" 
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 h-screen z-20 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />
      
      {/* Custom Font Styles */}
      <style>
        {`
          @font-face {
            font-family: 'New York';
            src: url('../NewYork.otf') format('opentype');
            font-weight: 500;
            font-style: normal;
          }
          
          @font-face {
            font-family: 'Satoshi';
            src: url('../Satoshi-Variable.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
          }
          
          .title {
            font-family: 'New York', serif;
            background-image: linear-gradient(to top, rgba(198, 198, 198, 0.9), white);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          
          .subtitle {
            font-family: 'Satoshi', sans-serif;
            letter-spacing: 0.088em;
          }
          
          .arrow-icon {
            transition: transform 0.3s ease;
          }
          
          .hero-badge:hover .arrow-icon {
            transform: translateX(4px);
          }
        `}
      </style>
      
      {/* Content Overlay */}
      <div className="relative z-30 h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="title text-5xl md:text-7xl lg:text-8xl text-white mb-4 -translate-y-[10vh]">
          The Social Proof<br />Foundation
        </h1>
        
        <p className="subtitle pt-10 text-sm md:text-base lg:text-rg text-white/70 -translate-y-[10vh] max-w-[400px] md:max-w-[600px]">
          Researching attention economies that enforce fairness, transparency, and ownership on-chain.
        </p>

        {/* Button positioned 2/3 down the viewport */}
        <div className="absolute top-3/4 transform -translate-y-1/2 mt-16">
          <HeroBadge
            href="https://www.mysocial.network/MySocial.pdf"
            text="Read Our First Paper"
            endIcon={<ArrowRightIcon className="ml-2 w-4 h-4 arrow-icon" />}
            variant="default"
            size="md"
            className="shadow-lg shadow-black/20 hero-badge"
          />
        </div>
      </div>
    </div>
  );
};