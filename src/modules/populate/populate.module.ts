import { UsersModule, RolesModule, PermissionsModule } from 'oteos-backend-lib';
import { Module } from '@nestjs/common';
import { PopulateService } from './populate.service';

@Module({
  imports:[
    PermissionsModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [PopulateService]
})
export class PopulateModule {}
