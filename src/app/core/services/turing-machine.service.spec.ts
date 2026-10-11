import { TestBed } from '@angular/core/testing';
import { TuringMachineService } from './turing-machine.service';

describe('TuringMachineService', () => {
  let service: TuringMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuringMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse single-tape configuration', () => {
    const config = `{
      "numberOfTapes": 1,
      "states": ["q0", "q1"],
      "inputAlphabet": ["0", "1"],
      "tapeAlphabet": ["0", "1", "_"],
      "initialState": "q0",
      "blank": "_",
      "finalStates": ["q1"],
      "transitions": [["q0", ["0"], "q1", ["1"], ["R"]]]
    }`;

    const { machine, errors } = service.parseTuringMachineConfig(config);
    expect(errors.length).toBe(0);
    expect(machine.numberOfTapes).toBe(1);
    expect(machine.transitions.length).toBe(1);
    expect(machine.transitions[0].readSymbols).toEqual(['0']);
    expect(machine.transitions[0].writeSymbols).toEqual(['1']);
    expect(machine.transitions[0].moveDirections).toEqual(['R']);
  });

  it('should parse multi-tape configuration', () => {
    const config = `{
      "numberOfTapes": 2,
      "states": ["q0", "q1"],
      "inputAlphabet": ["a", "b"],
      "tapeAlphabet": ["a", "b", "_"],
      "initialState": "q0",
      "blank": "_",
      "finalStates": ["q1"],
      "transitions": [["q0", ["a", "_"], "q1", ["a", "a"], ["R", "R"]]]
    }`;

    const { machine, errors } = service.parseTuringMachineConfig(config);
    expect(errors.length).toBe(0);
    expect(machine.numberOfTapes).toBe(2);
    expect(machine.transitions.length).toBe(1);
    expect(machine.transitions[0].readSymbols).toEqual(['a', '_']);
    expect(machine.transitions[0].writeSymbols).toEqual(['a', 'a']);
    expect(machine.transitions[0].moveDirections).toEqual(['R', 'R']);
  });

  it('should provide multi-tape example configurations', () => {
    const singleTape = service.getSingleTapeExample();
    const twoTape = service.getTwoTapeExample();
    const threeTape = service.getThreeTapeExample();

    expect(singleTape).toContain('"numberOfTapes": 1');
    expect(twoTape).toContain('"numberOfTapes": 2');
    expect(threeTape).toContain('"numberOfTapes": 3');
  });
});
