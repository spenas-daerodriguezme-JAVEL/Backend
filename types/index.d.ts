import express from 'express';

declare module 'express' {
  export interface JRequest extends express.Request {
    user: {
      _id: string;
      isAdmin: boolean;
    };
  }
}

export namespace javel {
  export interface currentUser {
    _id: string;
    isAdmin: boolean;
  }
}