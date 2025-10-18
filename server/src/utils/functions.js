
export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(i => i.message).join(', ');
      return res.status(400).json({ error: message });
    }
    next();
  };
}
