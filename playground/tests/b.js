const {expect, it, xit, end} = require('LittleFinger');


it("should it 1==1 is true", () => {
    expect(1 === 1);
});

it("should it 1 !== 2 is true", () => {
    expect(1 !== 2);
});

it("should it 0/5 === 0 is true", () => {
    expect(1 === 1);
});

it("should it 0/5 === 0 is true1", () => {
    expect(1 === 1);
});

it("should it 0/5 === 0 is true2", () => {
    expect(1 === 1);
});

it("should it 0/5 === 0 is true3", () => {
    expect(1 === 1);
});

it("should it 0/5 === 0 is true4", () => {
    expect(1 === 1);
});

for (let i = 0; i < 50; i++) {
    it(`should it 0/5 === 0 is true ${i}`, () => {
        expect(1 === 1);
    });
}

xit("should xit not work", () => {
    expect(1 === 2);
});

