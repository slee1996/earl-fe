import { USER_PROMPTS } from "./user-prompts";
import { SYSTEM_PROMPTS } from "./system-prompts";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_COMPONENT = {
  id: uuidv4(),
  lineLimit: 8,
  meter: [[1, 0, 1, 0, 1, 0, 1, 0]],
  selectedUserPrompt: USER_PROMPTS.verse,
  selectedSystemPrompt: SYSTEM_PROMPTS.popstar,
  customSystemPrompt: "",
  rhymeScheme: "",
};
