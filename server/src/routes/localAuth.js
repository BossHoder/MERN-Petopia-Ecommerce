import { Router } from 'express';

import requireLocalAuth from '../middleware/requireLocalAuth.js';
import userService from '../services/userService.js';
import { validateUserRegistration } from '../validations/userValidation.js';
import { createErrorDto, createSuccessDto } from '../dto/index.js';

const router = Router();

// Test endpoint để debug
router.get('/test', (req, res) => {
  try {
    res.json({ 
      message: 'Auth route is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test register validation
router.post('/test-register', async (req, res) => {
  try {
    console.log('Test register request body:', req.body);
    
    const { error } = validateUserRegistration(req.body);
    if (error) {
      return res.status(422).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    res.json({ 
      message: 'Validation passed',
      data: req.body
    });
  } catch (error) {
    console.error('Test register error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.post('/login', requireLocalAuth, (req, res) => {
  const token = req.user.generateJWT();
  const me = req.user.toJSON();
  res.json({ token, me });
});

// GET route for testing login endpoint
router.get('/login', (req, res) => {
  res.json({ 
    message: 'Login endpoint - use POST method with email and password',
    method: 'POST',
    endpoint: '/auth/login',
    body: {
      email: 'your-email@example.com',
      password: 'your-password'
    }
  });
});

// GET route for testing register endpoint
router.get('/register', (req, res) => {
  res.json({ 
    message: 'Register endpoint - use POST method',
    method: 'POST',
    endpoint: '/auth/register',
    body: {
      name: 'Your Name',
      email: 'your-email@example.com',
      password: 'your-password',
      username: 'your-username'
    }
  });
});

router.post('/register', async (req, res) => {
try {
    const { error } = validateUserRegistration(req.body);
    if (error) {
      return res.status(422).json(createErrorDto(
        error.details[0].message,
        'VALIDATION_ERROR'
      ));
    }

    const result = await userService.createUser({
      ...req.body,
      provider: 'local'
    });

    if (!result.success) {
      return res.status(422).json(createErrorDto(
        result.error || 'Registration failed',
        'REGISTRATION_ERROR'
      ));
    }

    res.status(201).json(createSuccessDto(
      { user: result.user },
      'User registered successfully'
    ));

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorDto(
      'Internal server error',
      'INTERNAL_SERVER_ERROR'
    ));
  }

});

// logout
router.get('/logout', (req, res) => {
  req.logout();
  res.send(false);
});

export default router;
