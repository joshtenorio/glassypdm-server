import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';

@Module({
    providers: [ClerkService]
    
})
export class ClerkModule {}
