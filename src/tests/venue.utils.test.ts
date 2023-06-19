import { decodeEmoji, encodeEmoji } from '../utils/venue.utils';
import { assert } from 'chai';

describe('testing venue utils', () => {
  it('mapEmoji() TEST #1', done => {
    const result = decodeEmoji('🔥');
    assert.equal(result, 'FIRE');
    done();
  });
  it('mapEmoji() TEST #2', done => {
    const result = decodeEmoji('⚠️');
    assert.equal(result, 'CAUTION');
    done();
  });
  it('mapEmoji() TEST #3', done => {
    const result = decodeEmoji('💩');
    assert.equal(result, 'POOP');
    done();
  });
  it('mapEmoji() TEST #4', done => {
    const result = decodeEmoji('🎉');
    assert.equal(result, 'PARTY');
    done();
  });
  it('mapEmoji() TEST #5', done => {
    const result = decodeEmoji('🛡');
    assert.equal(result, 'SHIELD');
    done();
  });
  it('mapEmoji() TEST #6', done => {
    const result = encodeEmoji('FIRE');
    assert.equal(result, '🔥');
    done();
  });
  it('mapEmoji() TEST #7', done => {
    const result = encodeEmoji('CAUTION');
    assert.equal(result, '⚠️');
    done();
  });
  it('mapEmoji() TEST #8', done => {
    const result = encodeEmoji('POOP');
    assert.equal(result, '💩');
    done();
  });
  it('mapEmoji() TEST #9', done => {
    const result = encodeEmoji('PARTY');
    assert.equal(result, '🎉');
    done();
  });
  it('mapEmoji() TEST #10', done => {
    const result = encodeEmoji('SHIELD');
    assert.equal(result, '🛡');
    done();
  });
  it('mapEmoji() TEST #11', done => {
    const result = encodeEmoji('bad data');
    assert.equal(result, null);
    done();
  });
  it('mapEmoji() TEST #12', done => {
    const result = decodeEmoji('bad data');
    assert.equal(result, null);
    done();
  });
});
