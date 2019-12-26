import jwt from "jsonwebtoken";
import config from "config";
import express from "express";
import { IUser } from "../types/user-type";

export default function(
  req: express.Request<IUser>,
  res: express.Response,
  next: Function
) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.body = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
}
