import prisma from '#utils/prisma';
import { hashPassword, verifyPassword } from '#utils/password';
import { ConflictException, UnauthorizedException } from '#utils/exceptions';

export class AuthService {
	// Inscription
	static async register(userData){
		const existingUser = await prisma.user.findUnique({
			where: {email: userData.email},
		});

		if (existingUser) {
			throw new ConflictException("Cet email est déjà utilisé");
		}

		 const hashedPassword = await hashPassword(userData.password);

		 return await prisma.user.create({
			data: {
				email: userData.email, 
				password: hashedPassword,
				firstName: userData.firstName,
				lastName: userData.lastName,
			},
		});
	}

	// Connexion 
	static async login(email, password, loginInfo){
		const user = await prisma.user.findUnique({ where: {email }});

		let isPasswordValid = false;

		if(user){
			isPasswordValid = await verifyPassword(user.password, password)
		}

		// Enregistrement dans l'historique
		await prisma.loginHistory.create({
			data: {
				userId: user ? user.id : null,
				ipAddress: loginInfo.ipAddress,
				userAgent: loginInfo.userAgent,
				success: (user !== null && isPasswordValid === true)
			}
		});

		// Gestion de l'échec
		if(!user || !isPasswordValid){
			throw new UnauthorizedException("Identifiants incorrects");
		}

		return user;	
	}

	// Déconnexion
	static async logout(userId, token){
		if(!token) return;

		return await prisma.blacklistedAccessToken.create({
			data: {
				token: token,
				userId: userId,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			},
		});
	}
}
