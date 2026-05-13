import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ProGuard } from './pro.guard';

@Module({
  providers: [AuthGuard, ProGuard],
  exports: [AuthGuard, ProGuard],
})
export class AuthModule {}
