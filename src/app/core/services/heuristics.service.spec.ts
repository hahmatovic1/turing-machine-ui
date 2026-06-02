import { TestBed } from '@angular/core/testing';

import { HeuristicsService } from './heuristics.service';

describe('HeuristicsService', () => {
  let service: HeuristicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeuristicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
