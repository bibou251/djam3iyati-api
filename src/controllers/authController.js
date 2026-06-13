const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { phone, password, fullName } = req.body;
    if (!phone || !password || !fullName) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }
    // Vérifier si l'utilisateur existe déjà
    const existing = await User.findByPhone(phone);
    if (existing) {
      return res.status(409).json({ error: 'Ce numéro est déjà inscrit' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create(phone, passwordHash, fullName);
    res.status(201).json({ message: 'Inscription réussie', user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Téléphone et mot de passe requis' });
    }
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, phone: user.phone, fullName: user.full_name, trustScore: user.trust_score } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
