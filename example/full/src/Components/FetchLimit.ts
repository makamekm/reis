const nodeFetch: typeof fetch = require('node-fetch');

let limits: number = 0;
const maxLimit: number = 10;
const maxTimeout: number = null;
let count = 0;

export const limitedFetch: typeof fetch = async (input, init?): Promise<any> => {
  let time = Math.floor(Date.now());

  while (limits > maxLimit) {
    await new Promise(r => setTimeout(() => r(), 50));
    if (maxTimeout && Math.floor(Date.now()) - time > maxTimeout) {
      throw new Error('Timeout fetch limit from: ' + input);
    }
  }

  limits++;

  let result = await nodeFetch(input, init);

  limits--;

  return result;
}