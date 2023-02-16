import { assert } from 'chai';
import { mapEmoji } from '../utils/venue.utils';

describe('testing venue utils', () => {
  it('mapEmoji() TEST #1', done => {
    const result = mapEmoji('🔥');
    assert.equal(result, 'FIRE');
    done();
  });
  it('mapEmoji() TEST #2', done => {
    const result = mapEmoji('⚠️');
    assert.equal(result, 'CAUTION');
    done();
  });
  it('mapEmoji() TEST #3', done => {
    const result = mapEmoji('💩');
    assert.equal(result, 'POOP');
    done();
  });
  it('mapEmoji() TEST #4', done => {
    const result = mapEmoji('🎉');
    assert.equal(result, 'PARTY');
    done();
  });
  it('mapEmoji() TEST #5', done => {
    const result = mapEmoji('🛡');
    assert.equal(result, 'SHIELD');
    done();
  });
  it('mapEmoji() TEST #6', done => {
    const result = mapEmoji('FIRE');
    assert.equal(result, '🔥');
    done();
  });
  it('mapEmoji() TEST #7', done => {
    const result = mapEmoji('CAUTION');
    assert.equal(result, '⚠️');
    done();
  });
  it('mapEmoji() TEST #8', done => {
    const result = mapEmoji('POOP');
    assert.equal(result, '💩');
    done();
  });
  it('mapEmoji() TEST #9', done => {
    const result = mapEmoji('PARTY');
    assert.equal(result, '🎉');
    done();
  });
  it('mapEmoji() TEST #10', done => {
    const result = mapEmoji('SHIELD');
    assert.equal(result, '🛡');
    done();
  });
  it('mapEmoji() TEST #11', done => {
    const result = mapEmoji('bad data');
    assert.equal(result, null);
    done();
  });
});
