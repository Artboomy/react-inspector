import {
  markMatches,
  createMarker,
  caseInsensitiveMatch,
} from './SearchContext';
import expect from 'expect';

describe('markMatches reproduction', () => {
  it('should return true when the key matches the search value for an object', () => {
    const data = [
      {
        product_name: 'somename',
        product_version: '4.1.0',
        configs: {
          foo: [],
          connections: [],
          bar: [],
          foobar: [],
          user_roles: [],
          user_settings: [],
          grants: [],
          crontabs: [],
          kube_api_requests: [],
        },
      },
    ];

    const searchValue = 'configs';
    const comparator = caseInsensitiveMatch;
    const marker = createMarker(comparator, searchValue);
    const symbol = Symbol.for('configs.false');

    // We are checking the object at data[0] and the key "configs"
    const result = markMatches(data[0], 'configs', marker, symbol);

    expect(result).toBe(true);
  });
});
