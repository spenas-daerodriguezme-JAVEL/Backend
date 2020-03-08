import jwt from "jsonwebtoken";
import config from "config";
import express from "express";
import { javel } from "../types";

export default function(
  req: express.Request,
  res: express.Response,
  next: Function
) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");
  try {
    const decoded = jwt.verify(token, "casa") as javel.currentUser;
    (req as express.JRequest).user = decoded;

    next();
  } catch (ex) {
    return res.status(400).send("Invalid token.");
  }
}
