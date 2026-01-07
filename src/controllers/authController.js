import {AuthService} from "#services/authService";
import {UserDto} from "#dto/user.dto";
import {generateAccessToken} from "#utils/jwt";
import { validateData } from "#utils/validate";
import { registerSchema, loginSchema } from "#schemas/user.schema";
import { success } from "zod/v4";

export class AuthController {
	// Inscription d'un nouvel utilisateur
	static async register(req, res, next) {
		try {
			const validatedData = validateData(registerSchema, req.body);

			// On demande au service de créer l'utilisateur
			const newUser = await AuthService.register(validatedData);

			const token = generateAccessToken(newUser.id);

			// Réponse de succès
			return res.status(201).json({
				success: true,
				user: UserDto.transform(newUser),
				token: token
			});	
		} catch(error) {
			next(error);
		}
	}

	// Connexion d'un utilisateur
	static async login(req, res, next) {
		try{
			const validatedData = validateData(loginSchema, req.body);
			const { email, password } = validatedData;

			// Récupération de l'adresse IP et de l'userAgent de la table LoginHistory
			const loginInfo = {
				ipAddress: req.ip || '127.0.0.1',
				userAgent: req.get('user-agent')
			}

			// Vérification des infos et enregistrement de l'historique de connexion
			const result = await AuthService.login(email, password, loginInfo);

			const token = generateAccessToken(result.id);
			res.status(200).json({
				success:true,
				user: UserDto.transform(result),
				token: token,
			});
		} catch(error){
			next(error);
		}
	}

	// Déconnexion d'un utilisateur
	static async logout(req, res, next) {
		try{
			// l'id de l'utilisateur provenant du token décodé
			const user = req.user;
			// Récupération du token actuel
			let token = null;
			if(req.headers.authorization){
				const parts = req.headers.authorization.split(' ');
				if(parts.length === 2){
					token = parts[1];
				}
			}

			if(user){
				await AuthService.logout(user.id, token);
			}
			
			return res.status(200).json({
				success: true,
				message: "Déconnexion fermée"
			});

		} catch(error){
			next(error);
		}
	}
}
