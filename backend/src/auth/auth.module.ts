import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ProGuard } from './pro.guard';
import { AuthWSGuard } from './auth.ws.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AuthGuard,
    ProGuard,
    AuthWSGuard,
    PrismaService,
    SupabaseService,
    ConfigService,
  ],
  exports: [AuthGuard, ProGuard, AuthWSGuard],
})
export class AuthModule {}
