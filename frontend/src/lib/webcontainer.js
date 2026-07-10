import { WebContainer } from "@webcontainer/api";

let containerInstance = null;

export async function getWebContainer() {
  if (!containerInstance) {
    containerInstance = await WebContainer.boot();
    console.log("✅ WebContainer Booted");
  }
  return containerInstance;
}
