import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseService } from './supabase/supabase.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { rootConfig } from './rootConfig';

@Module({
  controllers: [],
  providers: [PrismaService, SupabaseService],
  imports: [AuthModule, ConfigModule.forRoot(rootConfig)],
})
export class AppModule {}
