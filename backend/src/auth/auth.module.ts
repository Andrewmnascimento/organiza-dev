import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ProGuard } from './pro.guard';
import { AuthWSGuard } from './auth.ws.guard';

@Module({
  providers: [AuthGuard, ProGuard, AuthWSGuard],
  exports: [AuthGuard, ProGuard, AuthWSGuard],
})
export class AuthModule {}
