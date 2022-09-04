import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { IConfigService } from '../../config/config.service.interface';
import { TYPES } from '../../types';
import { User } from '../user.entity';
import { IUsersRepository } from '../users.repository.interface';
import { IUserService } from '../users.service.interface';
import { UserLoginDto } from './user-login.dto';
import { UserRegisterDto } from './user-register.dto';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.IConfigService) private configService: IConfigService,
		@inject(TYPES.IUsersRepository) private usersRepository: IUsersRepository,
	) {}

	async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
		const newUser = new User(name, email);
		const salt = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));

		const existedUser = await this.usersRepository.find(email);
		if (existedUser) return null;

		return this.usersRepository.create(newUser);
	}

	async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
		const existedUser = await this.usersRepository.find(email);
		if (!existedUser) return false;
		const newUser = new User(existedUser.name, existedUser.email, existedUser.password);

		return newUser.comparePassword(password);
	}

	async getUserInfo(email: string): Promise<UserModel | null> {
		return this.usersRepository.find(email);
	}
}
