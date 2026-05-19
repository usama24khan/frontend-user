import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

const appEnv = process.env.APP_ENV || (process.env.NODE_ENV === "development" ? "development" : "production");
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${appEnv}`),
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

