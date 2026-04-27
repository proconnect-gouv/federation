import { Controller, Get, Header, Res } from "@nestjs/common";
import type { Response } from "express";
import { Routes } from "../enums";

@Controller()
export class AccessibilityController {
  @Get(Routes.ACCESSIBILITY)
  @Header("cache-control", "no-store")
  async getAccessibilityStatement(@Res() res: Response): Promise<void> {
    res.render("accessibility");
  }
}
