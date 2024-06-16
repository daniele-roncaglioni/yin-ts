# YIN

Faithful YIN algorithm implementation for fundamental frequency estimation according to the
seminal [paper](http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf)
and nothing else. Deviations from paper are documented in the code.

## Usage
In node.js:
```node
const yin = require("./dist/cjs/yin.js").default;
// sine wave with f0 = 440 Hz and sample rate of 8000 Hz sampled for 1024 samples
let signal = Array.from({length: 8000}, (_, i) => Math.sin(2 * Math.PI * 440 * i / 8000));
console.log(yin(signal, 8000, 0.2))
```
Output:
```
440.64565401846073
```