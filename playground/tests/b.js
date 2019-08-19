const {expect, it, xit, end} = require('LittleFinger');
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


for (let i = 0; i < 100; i++) {
    it(`should it 0/5 === 0 is true ${i}`,async () => {
       await sleep(1000);
        expect(1 === 1);
    });
}

// xit("should xit not work", () => {
//     expect(1 === 2);
// });
//
