// Credit to The Coding Train YouTube channel, the p5js examples on p5js.org,
// Saskia Freeke and Dexter Shepherd (https://blog.kadenze.com/creative-technology/p5-js-crash-course-recreate-art-you-love/),
// and https://github.com/therewasaguy for some inspiration and code for these visualizations

const black = '#010711';      // (1,   7,  17)
const darkGray = '#13171F';   // (19,  23, 31)
const mediumGray = '#1C2026'; // (28,  32, 38)
const lightGray = '#24272D';  // (36,  39, 45)
const lighterGray = '#949ba2';  // (36,  39, 45)
const red = '#94152A';        // (148, 21, 42)
const dullWhite = '#b6b6b6';  // (182, 182, 182)

class Visualization {
  constructor() {
    this.levelHistory = [];
  }

  visualize(level, spectrum) {
  }

  reset() {
    this.levelHistory = [];
  }
}

function smoothPoint(spectrum, index) {
  const neighbors = 2;
  const len = spectrum.length;

  let val = 0;

  const indexMinusNeighbors = index - neighbors;
  let smoothedPoints = 0;

  for (let i = indexMinusNeighbors; i < (index + neighbors) && i < len; i++) {
    if (spectrum[i] !== undefined) {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  return val / smoothedPoints;
}

const CurveVisualization = class extends Visualization {
  visualize(_, spectrum) {
    const length = spectrum.length;

    const highFreqRange = spectrum.slice(779, 860);
    const maxFreq = max(highFreqRange);
    const color = map(maxFreq, 0, 145, 10, 255);
    stroke(148, color, color);

    strokeWeight(1);

    beginShape();
    for (let i = 0; i < length; i++) {
      const point = smoothPoint(spectrum, i);
      const x = map(i, 0, length - 1, 0, width / 2);
      const y = map(point, 0, 255, (height / 2) - 3, 0);

      curveVertex(x, y);
    }
    endShape();
  }
};

const Particle = function (position) {
  this.position = position;
  this.scale = random(0, 1);
  this.speed = createVector(random(0, 10), 0);
};

const ParticleScurryVisualization = class extends Visualization {
  constructor() {
    super();

    this.particles = new Array(256);

    for (let i = 0; i < this.particles.length; i++) {
      const x = random(0, width / 2);
      const y = random(0, height / 4);
      const position = createVector(x, y);
      this.particles[i] = new Particle(position);
    }
  }

  visualize(level, spectrum) {
    noStroke();

    for (let i = 0; i < 256; i++) {
      const thisLevel = map(spectrum[i], 0, 255, 0, 1) * 2.5;

      this.particles[i].position.y = (spectrum[i] * 5) - (height / 8);
      this.particles[i].position.x += this.particles[i].speed.x / (thisLevel);
      if (this.particles[i].position.x > width) this.particles[i].position.x = 0;
      this.particles[i].diameter = map(thisLevel, 0, 1, 0, 100) * this.particles[i].scale;

      const opacity = map(level, 0, 0.5, 100, 150);
      this.particles[i].color = [36, 39, 45, opacity];

      fill(this.particles[i].color);
      ellipse(
        this.particles[i].position.x,
        this.particles[i].position.y,
        this.particles[i].diameter,
        this.particles[i].diameter,
      );
    }
  }
};

const LineVibrationVisualization = class extends Visualization {
  visualize(level) {
    const y = (height / 12) + map(level, 0, 1, 0, 800);

    stroke(red);
    strokeWeight(9);
    line(0, y, width, y);
  }
};

const ArcVisualization = class extends Visualization {
  visualize(level) {
    const size = map(level, 0, 1, 0, 550);

    stroke(lightGray);
    strokeWeight(4);
    ellipse(width / 4, height / 4, (width / 2) + 10, size * 10)
  }
};

const HelixVisualization = class extends Visualization {
  constructor() {
    super();

    this.spacing = 16;
    this.theta = 0.0;
    this.dx = (TWO_PI / 400) * this.spacing;
  }

  visualize(level) {
    angleMode(RADIANS);

    this.theta += map(level, 0, 0.5, 0, 0.3);
    const w = width / 2;
    this.yvalues = new Array(floor(w / this.spacing));

    var x = this.theta;
    for (let i = 0; i < this.yvalues.length; i++) {
      this.yvalues[i] = sin(x) * 75;
      x += this.dx;
    }

    noStroke();
    const color = map(level, 0, 0.25, 2, 255);
    fill(color, color, color);
    for (let i = 0; i < this.yvalues.length; i++) {
      ellipse(i * this.spacing, height / 5 + this.yvalues[i], 16, 16);
      ellipse(i * this.spacing, height / 5 - this.yvalues[i], 16, 16);

    }
  }
};

const RadialVisualization = class extends Visualization {
  visualize(level) {
    const color = level > 0.082 ? dullWhite : red;
    this.levelHistory.push(level);

    stroke(color);
    strokeWeight(2);
    angleMode(DEGREES);

    beginShape();
    for (let i = 1; i < this.levelHistory.length; i++) {
      const r = map(this.levelHistory[i], 0, 0.2, 10, 1000);
      const x = (width / 2) + (r * cos(i + 210));
      const y = (height / 4) + (r * sin(i + 210));

      vertex(x, y);
    }
    endShape();

    if (this.levelHistory.length > 360) {
      this.levelHistory.shift();
    }
  }
};

const SpiralVisualization = class extends Visualization {
  constructor() {
    super();

    this.startingPosition = 0.001;
    this.speed = 0.0005;
  }

  visualize(level) {
    this.levelHistory.push(level * 2);

    const color = map(this.startingPosition, 0, 2, 30, 255);
    stroke(color, color, color);

    strokeWeight(0.3);
    angleMode(DEGREES);

    beginShape();
    for (let i = 1; i < this.levelHistory.length; i++) {
      const r = map(this.levelHistory[i], 0, 0.6, 10, 700);
      const x = (width / 5) + (r * cos(i) * this.startingPosition);
      const y = (height / 4) + (r * sin(i) * this.startingPosition);

      vertex(x, y);
    }
    endShape();
    this.startingPosition += this.speed;
  }

  reset() {
    this.levelHistory = [];
    this.startingPosition = 0.001;
  }
};

const AmpVisualization = class extends Visualization {
  visualize(level) {
    this.levelHistory.push(level * 2);

    stroke(red);
    strokeWeight(2);

    beginShape();
    for (let i = 1; i < this.levelHistory.length; i++) {
      const y = map(this.levelHistory[i], 0, 0.5, height / 2, 0);
      vertex(i, y);
    }
    endShape();

    if (this.levelHistory.length > width / 2) {
      this.levelHistory.shift();
    }
  }
};

const EllipseVisualization = class extends Visualization {
  visualize(level) {
    const weight = level > 0.2 ? 12 : 4;
    const color = level > 0.2 ? dullWhite : lighterGray;
    const size = map(level, 0, 0.3, 0, 200);
    const randomMultiplier = random(-(width / 2), width / 2);
    const x = width / 4;

    stroke(color);
    strokeWeight(weight);
    ellipse(x + randomMultiplier, (height / 4) - (height / 6), size, size);
  }
};

const SnowVisualization = class extends Visualization {
  visualize(level, spectrum) {
    const totalPts = spectrum.length / 2;
    const steps = totalPts + 1;
    let rand = 0;

    for (let i = 1; i < steps; i++) {
      const x = ((width / 2) / steps) * i;
      const y = (height / 12) + random(-rand, rand);
      const color = map(x, 0, width / 2, 80, 240);
      strokeWeight(1);
      stroke(color, color, color);
      point(x, y);

      const range = map(spectrum[i], 0, 200, 1, 25);
      rand += random(-range, range);
    }
  }
};


const RotatingWaveVisualization = class extends Visualization {
  constructor() {
    super();
    this.phase = 0;
  }

  visualize(level, spectrum) {
    angleMode(RADIANS);
    let speed = 0.03;
    let maxCircleSize = 15;
    let numRows = 10;
    let numCols = 16;
    let numStrands = 3;

    let colorA = color(28, 32, 38, 50);
    let colorB = color(120, 120, 120, 50);

    this.phase = frameCount * speed;
    const multiplier = map(level, 0, 0.3, 1, 10);

    for (let strand = 0; strand < numStrands; strand += 1) {
      let strandPhase = this.phase + map(strand, 0, numStrands, 0, TWO_PI);

      for (let col = 0; col < numCols; col += 1) {
        let colOffset = map(col, 0, numCols, 0, TWO_PI);
        let x = map(col, 0, numCols, 50, width - 50);

        for (let row = 0; row < numRows; row += 1) {
          let y = height / 4 + row * 10 + sin(strandPhase + colOffset) * 150;
          let sizeOffset = (cos(strandPhase - (row / numRows) + colOffset) + 1) * 0.7;
          let circleSize = sizeOffset * maxCircleSize * multiplier;

          noStroke();
          fill(lerpColor(colorA, colorB, row / numRows));
          ellipse(x, y, circleSize, circleSize);
        }
      }
    }
  }
};

const FlowerVisualization = class extends Visualization {
  constructor() {
    super();
    this.angle1 = 0;
    this.angle2 = 27;
  }

  visualize(level, spectrum) {
    angleMode(RADIANS);
    const lowSpectrum = spectrum.slice(0, spectrum.length / 2);
    const highSpectrum = spectrum.slice(spectrum.length / 2, spectrum.length);

    const x1 = width / 7;
    const y1 = (height / 4) - (height / 12);
    const x2 = width / 3 + (height / 12);
    const y2 = (height / 3);

    noStroke();
    fill(0, 102);

    this.angle1 += 5;
    this.angle2 += 5;
    const offset1 = map(max(lowSpectrum), 0, 300, 10, 320);
    const offset2 = map(max(highSpectrum), 0, 130, 10, 320);
    const color = map(level, 0, 0.2, 0, 230);
    const val1 = cos(radians(this.angle1)) * offset1;
    const val2 = cos(radians(this.angle2)) * offset2;

    for (let a = 0; a < 360; a += 75) {
      const xoff1 = cos(radians(a)) * val1;
      const yoff1 = sin(radians(a)) * val1;

      fill(148, color, color, 150);
      ellipse(x1 + xoff1, y1 + yoff1, 40, 40);
    }

    for (let a = 0; a < 360; a += 52) {
      const xoff2 = cos(radians(a)) * val2;
      const yoff2 = sin(radians(a)) * val2;

      fill(148, color, color, 120);
      ellipse(x2 + xoff2, y2 + yoff2, 20, 20);
    }

    fill(182, 182, 182, 150);
    ellipse(x1, y1, 2, 2);
    ellipse(x2, y2, 2, 2);
  }
};

const StationaryCircleVisualization = class extends Visualization {
  visualize(level) {
    const size = map(level, 0, 0.5, 0, 300);
    const r = map(level, 0, 0.5, 18, 36 * 3);
    const g = map(level, 0, 0.5, 18, 39 * 3);
    const b = map(level, 0, 0.5, 18, 45 * 3);

    strokeWeight(level * 150);
    stroke(r, g, b);
    ellipse((width / 4), (height / 4), size * 4, size * 4);
    strokeWeight(level * 100);
    ellipse((width / 4), (height / 4), size * 3, size * 3);
    strokeWeight(level * 20);
    ellipse((width / 4), (height / 4), size * 4.5, size * 4.5);
  }
};

const SpectrumVisualization = class extends Visualization {
  visualize(level, spectrum) {
    noStroke();

    for (let i = 0; i < spectrum.length; i++) {
      const x = map(i, 0, spectrum.length, 0, (width / 2));
      const h = -height + map(spectrum[i], 0, 255, height / 2, 0);


      const color = map(i, 0, spectrum.length / 2, 10, 255);
      fill(148, color, color, 120);

      rect(x + i, height, (width / 2) / spectrum.length, h)
    }
  }
};

const VisualizationDefinition = class {
  constructor(visualization, def) {
    this.viz = visualization;
    this.soundDef = def;
    this.active = false;
  }

  isPlaying() {
    return this.active;
  }

  visualize() {
    if (!this.isPlaying()) return;

    const level = masterSound.getLevel();
    const spectrum = masterFFT.analyze();

    if (level || spectrum) {
      noFill();
      this.viz.visualize(level, spectrum);
    }
  }
};

let soundDefinitions;
let recorder;
let soundFile;
let soundDefs;
const defaultFadeDuration = 250;
let soundBoardContainer;
let triggerGroupSize = 7;

let masterSound;
const masterFFT = new p5.FFT();

// preload is called directly before setup()
function preload() {
  soundDefs = {
    lockGroove1: {
      viz: new EllipseVisualization,
      displayIcon: 'images/icon-1.svg',
      charCode: 48,
    },

    lockGroove2: {
      viz: new LineVibrationVisualization,
      displayIcon: 'images/icon-2.svg',
      charCode: 49,
    },

    lockGroove4: {
      viz: new AmpVisualization,
      displayIcon: 'images/icon-4.svg',
      charCode: 50,
    },

    lockGroove5: {
      viz: new SpectrumVisualization,
      displayIcon: 'images/icon-5.svg',
      charCode: 51,
    },

    lockGroove6: {
      viz: new RadialVisualization,
      displayIcon: 'images/icon-6.svg',
      charCode: 52,
    },

    lockGroove7: {
      viz: new ParticleScurryVisualization,
      displayIcon: 'images/icon-7.svg',
      charCode: 53,
    },

    lockGroove8: {
      viz: new CurveVisualization,
      displayIcon: 'images/icon-8.svg',
      charCode: 54,
    },

    lockGroove9: {
      viz: new HelixVisualization,
      displayIcon: 'images/icon-9.svg',
      charCode: 55,
    },

    lockGroove10: {
      viz: new StationaryCircleVisualization,
      displayIcon: 'images/icon-10.svg',
      charCode: 56,
    },

    lockGroove11: {
      viz: new FlowerVisualization,
      displayIcon: 'images/icon-11.svg',
      charCode: 57,
    },
  };


  soundDefinitions = Object.entries(soundDefs).reduce((accum, [key, def]) => {
    accum[key] = new VisualizationDefinition(def.viz, def);

    return accum
  }, {});
}

/**
 *
 * @param {Element} el sound trigger el
 * @param {Boolean} force force active state
 */
const toggleSoundTrigger = (el, force) => {
  el.classList.toggle('active', force);

  if (document.querySelector('.soundTrigger.active')) {
    soundBoardContainer.classList.add('active');
  } else {
    soundBoardContainer.classList.remove('active');
  }
};

function stopAll() {
  Object.values(soundDefinitions).forEach((square) => square.sound.fadeAndStop(defaultFadeDuration, square.viz));
  document.querySelectorAll('.soundTrigger').forEach((el) => toggleSoundTrigger(el, false));
}

function createSoundButton(key, displayIcon, charCode) {
  const container = document.createElement('div');

  container.classList.add('soundTriggerContainer');

  const button = document.createElement('button');

  button.classList.add('soundTrigger');
  button.dataset.charCode = charCode;
  button.dataset.key = key;

  const svgObject = document.createElement('object');

  svgObject.classList.add('svgObject');
  svgObject.type = 'image/svg+xml';
  svgObject.data = displayIcon;

  button.appendChild(svgObject);

  svgObject.addEventListener('load', () => {
    const svgDoc = svgObject.contentDocument;
    const svgItem = svgDoc.querySelector('svg');

    button.appendChild(svgItem);
    button.removeChild(svgObject);
  });

  container.appendChild(button);

  return container
}

function setup() {
  pixelDensity(2);
  createCanvas(window.innerWidth, window.innerHeight);

  soundBoardContainer = document.querySelector('#soundBoardContainer');
  const soundBoardBg = document.querySelector('#soundBoardBg');

  const soundButtons = Object.entries(soundDefs).map(([key, soundDefinition], index) =>
    createSoundButton(key, soundDefinition.displayIcon, soundDefinition.charCode));

  function groupSoundButtons(elements) {
    let layer;

    function createLayer(odd) {
      const el = document.createElement('div');

      el.classList.add('soundBoardTriggerLayer', odd ? 'odd' : 'even');

      return el;
    }

    elements.forEach((el, idx) => {
      if (idx % 5 === 0) {
        layer = createLayer(Boolean((idx + 1) % 2));
        soundBoardContainer.insertBefore(layer, soundBoardBg);
      }

      layer.appendChild(el);
    })
  }

  groupSoundButtons(soundButtons);
  updateSoundBoardLayout();

  // Move canvas into manipulable container
  document.querySelector('#canvasContainer')
    .appendChild(document.querySelector('#defaultCanvas0'));

  setCanvasDimensions();

  initEventListeners();

  document.querySelector('#topLayer').classList.remove('hideUntilLoaded');
  masterSound = new p5.AudioIn();
  masterSound.start();
  masterFFT.setInput(masterSound);
  // masterSound.getSources(function(deviceList) {
  //   console.log('********');
  //   console.log(deviceList);
  //   console.log('********');
  //
  //   masterSound.setSource(2);
  // });
}

function updateSoundBoardLayout() {
  const layerNodeList = document.querySelectorAll('.soundBoardTriggerLayer');
  const layers = Array.prototype.slice.call(layerNodeList);
  const baseTranslationPx = -275;
  const layerDepthPx = 125;

  layers.forEach((layer, idx) => {
    const itemsNodeList = layer.querySelectorAll('.soundTriggerContainer');
    const items = Array.prototype.slice.call(itemsNodeList);

    updateButtonGroup(items, idx)
  });

  function updateButtonGroup(items, groupIndex) {
    const itemCount = items.length;

    items.forEach((item, itemIndex) => {
      const offsetAngle = (360 / itemCount);
      const rotateAngle = offsetAngle * itemIndex + (groupIndex % 2 ? offsetAngle / 2 : 0);
      // #1 translate items to absolute center
      // #2 rotate items to point in spread direction
      // #3 translate to spread items out
      // #4 reorient
      item.style.transform = `
        translate(${((itemCount / 2 - itemIndex) * item.offsetWidth) - item.offsetWidth / 2}px)
        rotate(${rotateAngle}deg)
        translate(0, ${baseTranslationPx - (layerDepthPx * groupIndex)}px)
        rotate(-${rotateAngle}deg)
      `;
    });
  }
};

function setCanvasDimensions() {
  const canvas = document.querySelector('#canvasContainer canvas');

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  canvas.style.height = '100%';
  canvas.style.width = '100%';
}

function stopAll() {
  document.querySelectorAll('.soundTriggerContainer button').forEach((el) => toggleSoundTrigger(el, false));
  Object.values(soundDefinitions).forEach(def => def.active = false)
}

function initEventListeners() {
  window.addEventListener('resize', setCanvasDimensions);
  window.addEventListener('keydown', (event) => {
    getAudioContext().resume();
    
    const keyCode = event.keyCode;
    const button = document.querySelector(`.soundTriggerContainer button[data-char-code="${keyCode}"]`);

    const def = Object.entries(soundDefinitions).find(([key, val]) => {
      return val.soundDef.charCode === keyCode;
    });

    if (def) {
      const [defId] = def;

      soundDefinitions[defId].active = !soundDefinitions[defId].active;
    }

    if (keyCode === 187) {
      stopAll();
    }

    if (button) {
      toggleSoundTrigger(button)
    }
  });
}

function draw() {
  background('black');

  Object.values(soundDefinitions).forEach(viz => viz.visualize());
}
