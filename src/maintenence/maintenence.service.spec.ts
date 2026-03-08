import { Test, TestingModule } from '@nestjs/testing';
import { MaintenenceService } from './maintenence.service';

describe('MaintenenceService', () => {
  let service: MaintenenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenenceService],
    }).compile();

    service = module.get<MaintenenceService>(MaintenenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
