import express from 'express';
import { IUser } from '../types/user-type';

export default (
  req: express.Request,
  res: express.Response,
  next: Function,
) => {
  const { user } = req as express.JRequest;

  if (user.isAdmin === true) {
    next();
  } else {
    return res.status(403).json({
      ok: false,
      err: {
        message: 'The user is not an administrator',
      },
    });
  }
};
