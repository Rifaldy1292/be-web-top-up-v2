import { Test, TestingModule } from '@nestjs/testing';
import { MaintenenceController } from './maintenence.controller';
import { MaintenenceService } from './maintenence.service';

describe('MaintenenceController', () => {
  let controller: MaintenenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenenceController],
      providers: [MaintenenceService],
    }).compile();

    controller = module.get<MaintenenceController>(MaintenenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
