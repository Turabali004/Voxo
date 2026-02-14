import type { Request, Response, NextFunction } from "express";

export const responseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  const originalJson = res.json;

  let responseBody: any;

  res.json = function (body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log("========== API LOG ==========");
    console.log("Method:", req.method);
    console.log("Full URL:", req.originalUrl);
    console.log("Status:", res.statusCode);
    console.log("Response Time:", duration + "ms");
    console.log("Response Body:", responseBody);
    console.log("=============================\n");
  });

  next();
};