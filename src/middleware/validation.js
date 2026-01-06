export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      const errors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      res.status(400).json({ error: 'Validation failed', errors });
    }
  };
}