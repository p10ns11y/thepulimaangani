import fs from 'fs';
import init, { parse_poem } from './rust-parser/pkg/thepulimaangani_parser.js';

const testText = `ஏர்மலர் நறுங்கோதை எருத்தலைப்ப இறைஞ்சித்தன்
வார்மலர்த் தடங்கண்ணார் வலைப்பட்டு வருந்தியவென்
தார்வரை அகன்மார்பன் தனிமையை அறியுங்கொல்
சீர்மலி கொடியிடை சிறந்து`;

async function test() {
    const wasmBuffer = fs.readFileSync('./rust-parser/pkg/thepulimaangani_parser_bg.wasm');
    await init(wasmBuffer);
    console.log("Testing venkalippaa example:");
    const result = parse_poem(testText);
    console.log(result);
}

test();