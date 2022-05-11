import { testFn as testFunction } from './spec-only';

describe('spec only', () => {
    it('testFn should return null', () => {
        expect(testFunction()).toBeNull();
    });
});
