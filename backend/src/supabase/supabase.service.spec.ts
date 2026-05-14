import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('https://xyz.supabase.co'),
          },
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
