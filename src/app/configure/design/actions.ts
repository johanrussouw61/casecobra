"use server";

import { db } from "@/app/db";
import {
  CaseColor,
  CaseFinish,
  CaseMaterial,
  PhoneModel,
} from "@prisma/client";

export type SafeConfigArgs = {
  color: CaseColor;
  finish: CaseFinish;
  material: CaseMaterial;
  model: PhoneModel;
  configId: string;
};

export async function saveConfig({
  color,
  finish,
  material,
  model,
  configId,
}: SafeConfigArgs) {
  await db.configuration.update({
    where: { id: configId },
    data: { color, finish, material, model },
  });
}
