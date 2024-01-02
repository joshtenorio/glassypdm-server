import { Injectable } from '@nestjs/common';
import { User, clerkClient } from '@clerk/clerk-sdk-node';
@Injectable()
export class UserService {
    async userById(id: string): Promise<User> {
        return clerkClient.users.getUser(id);
    }
}
