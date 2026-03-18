import { Test, TestingModule } from '@nestjs/testing';
import { PaymantsController } from './paymants.controller';
import { PaymantsService } from './paymants.service';

describe('PaymantsController', () => {
  let controller: PaymantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymantsController],
      providers: [PaymantsService],
    }).compile();

    controller = module.get<PaymantsController>(PaymantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
