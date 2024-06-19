declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      NODE_ENV: 'development' | 'production';
      SESSION_SECRET: string;
      DATABASE_URL: string;
      ORIGIN: string;
    }
  }
}

export {};
