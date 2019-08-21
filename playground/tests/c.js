const {expect, it, xit, end} = require('LittleFinger');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


for (let i = 0; i < 10; i++) {
    it(`test-${i} from C`,async () => {
       await sleep(1000);
        expect(1 === 1);
    });
}

// xit("should xit not work", () => {
//     expect(1 === 2);
// });
//
