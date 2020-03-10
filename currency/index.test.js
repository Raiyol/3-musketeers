const nock = require('nock');

beforeEach(() => {
  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=USD')
    .reply(200, {
      'base': 'USD',
      'rates': {
        'EUR': 0.899
      }
    });

  nock('https://api.exchangeratesapi.io')
    .get('/latest?base=EUR')
    .reply(200, {
      'base': 'EUR',
      'rates': {
        'USD': 1.1122
      }
    });

  nock('https://blockchain.info')
    .get('/ticker')
    .reply(200, {
      'USD': {
        '15m': 8944.49,
        'last': 8944.49,
        'buy': 8944.49,
        'sell': 8944.49,
        'symbol': '$'
      },
      'EUR': {
        '15m': 8048.11,
        'last': 8048.11,
        'buy': 8048.11,
        'sell': 8048.11,
        'symbol': '€'
      }
    });
});

const currency = require('./index');

describe('currency', () => {
  test('should convert 1 USD to EUR', async () => {
    expect(await currency({amount : 1, from : 'USD', to : 'EUR'})).toBe(0.899);
  });

  test('should convert 1 USD to USD', async () => {
    expect(await currency({amount : 1, from : 'USD', to : 'USD'})).toBe(1);
  });

  test('should convert 1 EUR to USD', async () => {
    expect(await currency({amount : 1, from : 'EUR', to : 'USD'})).toBe(1.1122);
  });

  test('should convert 1 BTC to USD', async () => {
    expect(await currency({amount : 1, from : 'BTC', to : 'USD'})).toBe(8944.49);
  });

  test('should convert 1 BTC to EUR', async () => {
    expect(await currency({amount : 1, from : 'BTC', to : 'EUR'})).toBe(8048.11);
  });

  test('should convert (with default values) without arguments', async () => {
    expect(await currency({})).toBe(0.00011180067281644902);
  });

  test('should convert with amount only as argument', async () => {
    expect(await currency({amount : 10})).toBe(10*0.00011180067281644902);
  });

  test('should convert with amount and (from) currency only as arguments', async () => {
    expect(await currency({amount : 10, from: 'USD'})).toBe(10*0.00011180067281644902);
  });

  test('should return errors message for unknown `from` or `to` currency value', async () => {
    expect(await currency({amount : 10, from: 'AU', to : 'BTC'})).toThrow(Error);
  });
});
