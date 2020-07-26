import jwt from 'jsonwebtoken';
import express from 'express';
import { javel } from '../types';

export default (
  req: express.Request,
  res: express.Response,
  next: Function,
) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  try {
    const key = process.env.JWT_KEY as string;
    const decoded = jwt.verify(token, key) as javel.currentUser;
    (req as express.JRequest).user = decoded;

    return next();
  } catch (ex) {
    return res.status(400).send('Invalid token.');
  }
};
