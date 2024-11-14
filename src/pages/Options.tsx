import "./Options.css";

export default function () {
  return (
    <div>
      <textarea name="System prompt" id="system-prompt"></textarea>
      <textarea name="User prompt" id="user-prompt"></textarea>
      <textarea name="Response" id="response" value={""} />
      <input type="range" name="Default Top K" id="default-top-k" min="1" max="10" defaultValue={3} />
      <input type="range" name="Max Top K" id="max-top-k" min="1" max="10" defaultValue={8} />
      <input type="range" name="Temperature" id="temperature" min="0" max="2" step="0.1" defaultValue={1} />
      <input type="button" value="Generate" id="generate" />
    </div>
  );
}
