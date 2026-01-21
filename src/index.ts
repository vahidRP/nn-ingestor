import express, { Request, Response } from "express";

const app = express();
const port: number = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
  console.log("Response sent");
});

app.listen(port, (): void => {
  console.log(`App listening on port ${port}`);
});
