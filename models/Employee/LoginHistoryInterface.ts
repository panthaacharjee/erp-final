interface ILoginHistory {
  timestamp: Date;
  ipAddress: string | undefined;
  userAgent?: string;
}


export default ILoginHistory