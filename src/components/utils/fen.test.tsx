import fenHandler from './fen';

const fenStart = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const fenStartStripped = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const fenStartExpanded = "rnbqkbnr/pppppppp/11111111/11111111/11111111/11111111/PPPPPPPP/RNBQKBNR"

const fenZero = "8/8/8/8/8/8/8/8"
const fenZeroExpanded = "11111111/11111111/11111111/11111111/11111111/11111111/11111111/11111111";
const fenZeroParts = ["11111111","11111111","11111111","11111111","11111111","11111111","11111111","11111111"];

test('test removeExtraInfo', async () => {
    expect(new fenHandler().removeExtraInfo(fenStart)).toBe(fenStartStripped);
})

test('test expandNumbers', async () => {
    expect(new fenHandler().expandNumbers(fenStartStripped)).toBe(fenStartExpanded);
    expect(new fenHandler().expandNumbers(fenZero)).toBe(fenZeroExpanded);
})

test('test compressNumbers', async() => {
    expect(new fenHandler().compressNumbers(fenStartExpanded)).toBe(fenStartStripped);
    expect(new fenHandler().compressNumbers(fenZeroExpanded)).toBe(fenZero);
})

test('test getFenParts', async () => {
    expect(new fenHandler().getFenParts(fenZeroExpanded)).toEqual(fenZeroParts);
})

test('test setPiece', async () => {
    expect(new fenHandler().setPiece(fenZeroParts, "a1", "x")).toEqual(["11111111","11111111","11111111","11111111","11111111","11111111","11111111","x1111111"])
})

test('test move', async () => {
    expect(new fenHandler().move(fenStart, "P", "e2", "e4")).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR")
})