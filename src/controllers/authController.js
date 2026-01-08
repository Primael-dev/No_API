	import { authService } from '../services/authService.js';
	import { UserDto } from '../dto/user.dto.js';
	import jwt from 'jsonwebtoken';
	import prisma from '../utils/prisma.js';

	export const authController = {
	// Inscription
	async register(req, res) {
		try {
		const { email, password, firstName, lastName } = req.body;

		// Créer l'utilisateur
		const user = await authService.register({ email, password, firstName, lastName });

		// Générer les tokens
		const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
		const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

		// Sauvegarder le refresh token
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		
		await prisma.refreshToken.create({
			data: {
			token: refreshToken,
			userId: user.id,
			userAgent: req.get('user-agent') || 'Unknown',
			ipAddress: req.ip || '127.0.0.1',
			expiresAt
			}
		});

		res.status(201).json({
			success: true,
			user: UserDto.transform(user),
			accessToken,
			refreshToken
		});
		} catch (error) {
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message
		});
		}
	},

	// Connexion
	async login(req, res) {
		try {
		const { email, password } = req.body;
		
		const loginInfo = {
			ipAddress: req.ip || '127.0.0.1',
			userAgent: req.get('user-agent') || 'Unknown'
		};

		const user = await authService.login(email, password, loginInfo);

		// Générer les tokens
		const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
		const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

		// Sauvegarder le refresh token
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);
		
		await prisma.refreshToken.create({
			data: {
			token: refreshToken,
			userId: user.id,
			userAgent: loginInfo.userAgent,
			ipAddress: loginInfo.ipAddress,
			expiresAt
			}
		});

		res.status(200).json({
			success: true,
			user: UserDto.transform(user),
			accessToken,
			refreshToken
		});
		} catch (error) {
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message
		});
		}
	},

	// Déconnexion
	async logout(req, res) {
		try {
		const userId = req.user.userId;
		const token = req.headers.authorization?.split(' ')[1];

		if (token) {
			await authService.logout(userId, token);
		}

		res.status(200).json({
			success: true,
			message: 'Déconnexion réussie'
		});
		} catch (error) {
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message
		});
		}
	}
	};