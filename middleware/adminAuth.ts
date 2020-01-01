import express from "express";
import { IUser } from "../types/user-type";

export default function(
  req: express.JRequest,
  res: express.Response,
  next: Function
) {

  const user = req.user;

  if (user.isAdmin === true) {
    next();
  } else {
    return res.status(403).json({
      ok: false,
      err: {
        message: "The user is not an administrator"
      }
    });
  }
}
