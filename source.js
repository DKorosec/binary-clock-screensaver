class LEDClockBits {
    constructor() {
        this._history = null;
        this._hi = null;
        this._lo = null;
        this._count = 0;
    }

    set count(value) {
        if (value < 0 || value > 60) {
            throw new Error('invalid value');
        }
        this._count = value;
    }

    get count() {
        return this._count;
    }

    getOutput() {
        const hi = Math.floor(this.count / 10)
        const lo = this.count % 10;
        return [
            hi.toString(2).padStart(4, '0').split('').map(v => v === '1'),
            lo.toString(2).padStart(4, '0').split('').map(v => v === '1'),
        ]
    }

    bindLEDs(hi, lo) {
        this._hi = hi;
        this._lo = lo;
    }

    showOutputOnLED() {
        if (!this._hi || !this._lo) {
            throw new Error('missing output LEDs');
        }
        const [hi, lo] = this.getOutput();

        const fingerprint = JSON.stringify([hi, lo]);
        if (fingerprint === this._history) {
            return;
        }
        this._history = fingerprint;

        const switchLED = (dom, on) => {
            if (on) {
                dom.classList.add('on');
                dom.classList.remove('off');
            } else {
                // cloud be off from previous state, and calling off again, 
                // causes animation trouble.
                if (dom.classList.contains('on')) {
                    dom.classList.add('off');
                    setTimeout(() => {
                        dom.classList.remove('on');
                        dom.classList.remove('off');
                        // exit 50ms before css animation, to prevent "blink"
                    }, 450);
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            switchLED(this._hi[i], hi[i]);
            switchLED(this._lo[i], lo[i]);
        }
    }

}

const globals = {
    hmsLEDS: null
}

function getSegmentLEDs(segment) {
    const hiLo = [[], []];
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 4; y++) {
            hiLo[x].push(document.getElementById(`px_${y}_${x + segment * 2}`));
        }
    }
    return hiLo;
}

function parseAndDisplayTimeLED(ts) {
    const date = new Date(ts);
    with (globals) {
        hmsLEDS[0].count = date.getHours()
        hmsLEDS[1].count = date.getMinutes();
        hmsLEDS[2].count = date.getSeconds();
        hmsLEDS.forEach(led => led.showOutputOnLED())
    }

    const ms = date.getMilliseconds();
    const dt = ms / 1000 * 2 * Math.PI;
    const dy = Math.floor(Math.sin(dt) * 10);
    const dx = Math.floor(Math.cos(dt) * 10);
    document.body.style.boxShadow = `${dx}px ${dy}px 10px 1px #36752d2e`;
}

function render() {
    parseAndDisplayTimeLED(Date.now());
    requestAnimationFrame(render);
}

function main() {
    setTimeout(() => {
        const electron = require('electron');
        const { ipcRenderer } = electron;
        const msgTerminate = () => ipcRenderer.send('terminate', true);
        // something nasty happens, when windows launches screensaver.
        // this event gets fired multiple times.
        document.addEventListener('keydown', msgTerminate);
        document.addEventListener('mousedown', msgTerminate);
        document.addEventListener('mousemove', msgTerminate);
    }, 1000);

    with (globals) {
        hmsLEDS = [new LEDClockBits(), new LEDClockBits(), new LEDClockBits()];
        for (let i = 0; i < 3; i++) {
            hmsLEDS[i].bindLEDs(...getSegmentLEDs(i))
        }
    }

    render();
}