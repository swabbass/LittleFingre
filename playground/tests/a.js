
describe('Basic test', () => {
    console.log(JSON.stringify(LilRunner));

    it("should it 1==1 is true",  () => {
        expect(1 === 1);
        
    });

    it("should it 1 !== 2 is true", () => {
        expect(1 !== 2);
    });

    it("should it 0/5 === 0 is true", () => {
        expect(1 === 1);
    });

    xit("should xit not work", () => {
        expect(1 === 2);
    });
});


