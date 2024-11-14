import browser from "webextension-polyfill";

async function printStream(stream: AsyncIterable<string>) {
  let previousChunk = "";
  let result = "";
  for await (const chunk of stream) {
    const newChunk = chunk.startsWith(previousChunk) ? chunk.slice(previousChunk.length) : chunk;
    console.log(newChunk);
    result += newChunk;
    previousChunk = chunk;
  }
}

async function main() {
  browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);
  });

  const capabilities = await browser.aiOriginTrial.languageModel.capabilities();
  console.log("Capabilities:", capabilities);

  const session = await browser.aiOriginTrial.languageModel.create({
    systemPrompt: "You are a wizard. So you have to complete all your sentences with a magic word, such as abracadabra",
  });

  const stream = session.promptStreaming("Who are you?");
  printStream(stream);
}

main().catch(console.error);
