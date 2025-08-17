  
  
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";  
  
const API_KEY = "API_KEY";  
const genAI = new GoogleGenerativeAI(API_KEY);  
  
const promptInput = document.getElementById("prompt-input");  
const upscaleBtn = document.getElementById("prompt-upscale-btn");  
const generateBtn = document.getElementById("generate-btn");  
const imageContainer = document.getElementById("image-container");  
const statusText = document.getElementById("status-text");  
const historyGrid = document.getElementById("history-grid");  
  
let currentPrompt = "";  
const historyImages = [];  
  
// Prompt Upscale  
upscaleBtn.addEventListener("click", async () => {  
  const prompt = promptInput.value.trim();  
  if (!prompt) return;  
  
  upscaleBtn.disabled = true;  
  upscaleBtn.textContent = "Enhancing...";  
  
  try {  
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });  
    const result = await model.generateContent(  
      `You are an AI assistant specialized in generating detailed prompts for image generation. The user will provide a short and simple prompt. Your task is to expand, enhance, and add creative details to it, making it suitable for generating image. without any introductory phrases, explanations, or conversational filler. Enhance the following image generation prompt : "${prompt}"`  
    );  
  
    const text = result.response.text().trim();  
    promptInput.value = text;  
    currentPrompt = text;  
  } catch (err) {  
    alert("Failed to enhance prompt.");  
    console.error(err);  
  } finally {  
    upscaleBtn.textContent = "Enhance";  
    upscaleBtn.disabled = false;  
  }  
});  
  
// Generate Image  
generateBtn.addEventListener("click", async () => {  
  const prompt = promptInput.value.trim();  
  if (!prompt) return;  
  
  currentPrompt = prompt;  
  generateBtn.disabled = true;  
  statusText.textContent = "Generating image...";  
  imageContainer.innerHTML = "";  
  
  try {  
    const model = genAI.getGenerativeModel({  
      model: "gemini-2.0-flash-exp",  
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },  
    });  
  
    const result = await model.generateContent(prompt);  
    const parts = result?.response?.candidates?.[0]?.content?.parts || [];  
  
    const images = parts.filter(p => p.inlineData);  
    if (images.length === 0) {  
      statusText.textContent = "No image generated.";  
      return;  
    }  
  
    const imgData = images[0].inlineData.data;  
    const img = createImage(imgData, prompt);  
    imageContainer.appendChild(img);  
    addToHistory(imgData, prompt);  
  
    statusText.textContent = "";  
  } catch (err) {  
    statusText.textContent = "Failed to generate image.";  
    console.error(err);  
  } finally {  
    generateBtn.disabled = false;  
  }  
});  
  
// Create Image with buttons  
function createImage(base64, prompt) {  
  const wrapper = document.createElement("div");  
  wrapper.className = "image-wrapper";  
  
  const img = document.createElement("img");  
  img.src = `data:image/png;base64,${base64}`;  
  img.alt = prompt;  
  
  const btnGroup = document.createElement("div");  
  btnGroup.className = "image-btns";  
  
  const download = document.createElement("button");  
  download.textContent = "⬇️Download";  
  download.title = "Download";  
  download.onclick = () => downloadImage(base64, prompt);  
  
  const regen = document.createElement("button");  
  regen.textContent = "🔁Regenarate";  
  regen.title = "Regenerate";  
  regen.onclick = () => {  
    promptInput.value = prompt;  
    generateBtn.click();  
  };  
  
  const del = document.createElement("button");  
  del.textContent = "❌Delete";  
  del.title = "Delete";  
  del.onclick = () => wrapper.remove();  
  
  btnGroup.append(download, regen, del);  
  wrapper.append(img, btnGroup);  
  return wrapper;  
}  
  
function downloadImage(data, name = "image") {  
  const link = document.createElement("a");  
  link.href = `data:image/png;base64,${data}`;  
  link.download = `${name}.png`;  
  document.body.appendChild(link);  
  link.click();  
  link.remove();  
}  
  
// History Management  
function addToHistory(base64, prompt) {  
  historyImages.push({ base64, prompt });  
  
  const thumb = document.createElement("img");  
  thumb.src = `data:image/png;base64,${base64}`;  
  thumb.alt = prompt;  
  thumb.onclick = () => {  
    imageContainer.innerHTML = "";  
    const img = createImage(base64, prompt);  
    imageContainer.appendChild(img);  
  };  
  
  historyGrid.prepend(thumb);  
}  
  
// Allow multiline input only (no Enter submission)  
promptInput.addEventListener("keydown", (e) => {  
  if (e.key === "Enter" && !e.shiftKey) {  
    e.stopPropagation();  
  }  
});