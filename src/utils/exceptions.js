// Classe de base pour toutes les erreurs HTTP
export class HttpException extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

// Erreur 400 - Requête invalide (données manquantes ou mal formatées)
export class BadRequestException extends HttpException {
  constructor(message = "Requête invalide", details = null) {
    super(400, message, details);
  }
}

// Erreur 401 - Non autorisé (mauvais identifiants)
export class UnauthorizedException extends HttpException {
  constructor(message = "Identifiants invalides") {
    super(401, message);
  }
}

// Erreur 403 - Interdit (accès refusé)
export class ForbiddenException extends HttpException {
  constructor(message = "Accès refusé") {
    super(403, message);
  }
}

// Erreur 404 - Ressource non trouvée
export class NotFoundException extends HttpException {
  constructor(message = "Ressource non trouvée") {
    super(404, message);
  }
}

// Erreur 409 - Conflit 
export class ConflictException extends HttpException {
  constructor(message = "Conflit avec une ressource existante") {
    super(409, message);
  }
}

// Erreur 400 - Spécifique à la validation de formulaires
export class ValidationException extends HttpException {
  constructor(errors) {
    super(400, "Erreur de validation", errors);
  }
}

