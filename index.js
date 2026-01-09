const express = require('express');
const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Routes
const profileRoutes = require('./src/routes/profile.routes');
app.use('/api/profile', profileRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});

const profileRoutes = require('./src/routes/profile.routes');
app.use('/api/profile', profileRoutes);