import fs from 'fs';
import init, { parse_poem_wasm } from './tamil-seiyul-alagi/pkg/thepulimaangani_parser.js';

const testText = `ஏர்மலர் நறுங்கோதை எருத்தலைப்ப இறைஞ்சித்தன்
வார்மலர்த் தடங்கண்ணார் வலைப்பட்டு வருந்தியவென்
தார்வரை அகன்மார்பன் தனிமையை அறியுங்கொல்
சீர்மலி கொடியிடை கற்றது`; // last word altered to test

async function test() {
    const wasmBuffer = fs.readFileSync('./tamil-seiyul-alagi/pkg/thepulimaangani_parser_bg.wasm');
    await init(wasmBuffer);
    console.log("Testing venkalippaa example:");
    const result = parse_poem_wasm(testText);
    console.log(result);
}

test();