// src/prisma/prisma.module.ts
// Un único PrismaService (y un único pool de conexiones) para toda la app.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
