// middleware/ipMiddleware.ts
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    clientIp?: string;
  }
}

const captureIp = (req: Request, res: Response, next: NextFunction) => {
  // Get IP address from request
  let ip = req.ip || 
           req.socket.remoteAddress || 
           (req.headers['x-forwarded-for'] as string)?.split(',')[0];
  
  // For localhost, you might get ::1 (IPv6) or 127.0.0.1 (IPv4)
  if (ip === '::1') {
    ip = '127.0.0.1';
  }
  
  // Attach IP to request object
  req.clientIp = ip;
  next();
};

module.exports = captureIp