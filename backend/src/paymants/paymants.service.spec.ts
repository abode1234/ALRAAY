import { Test, TestingModule } from '@nestjs/testing';
import { PaymantsService } from './paymants.service';

describe('PaymantsService', () => {
  let service: PaymantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymantsService],
    }).compile();

    service = module.get<PaymantsService>(PaymantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
