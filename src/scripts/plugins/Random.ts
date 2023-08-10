export function RandomNumber(min: number, max: number): number {
    let array = new Uint32Array(1);
    window.crypto.getRandomValues(array);

    let randomNumber = array[0] / (0xffffffff + 1);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(randomNumber * (max - min + 1)) + min;
}
