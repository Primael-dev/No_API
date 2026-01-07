const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

// Service pour gérer la logique de l'authentification

	// Inscription d'un utilisateur
	async function register(userData) {
		// Vérification de l'existence de l'email dans la base
		const existingUser = await prisma.user.findUnique({
			
		})
	}
