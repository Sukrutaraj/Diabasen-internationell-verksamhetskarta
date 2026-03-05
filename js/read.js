let isReading = false
let currentSpeech = null
let currentAudio = null
let voices = []

/* LOAD VOICES */
function loadVoices(){
voices = speechSynthesis.getVoices()
}
speechSynthesis.onvoiceschanged = loadVoices
loadVoices()

/* LANGUAGE */
function getLanguage(){
return localStorage.getItem("selectedLanguage") || "sv"
}

/* GET TEXT */
function getReadableText(){
let content =
document.querySelector('.readable-content') ||
document.querySelector('.readable-content-wrapper')
if(!content) return ""
return content.innerText
}

/* TRANSLATE */
async function translateText(text,target){

const url =
"https://translate.googleapis.com/translate_a/single?client=gtx&sl=sv&tl=" +
target +
"&dt=t&q=" +
encodeURIComponent(text)

const response = await fetch(url)
const data = await response.json()

return data[0].map(x=>x[0]).join("")
}

/* START DESKTOP SPEECH */
function startSpeech(text,lang){

speechSynthesis.cancel()

currentSpeech = new SpeechSynthesisUtterance(text)

let voice = voices.find(v => v.lang.startsWith(lang))

if(voice){
currentSpeech.voice = voice
}

currentSpeech.lang = lang
currentSpeech.rate = 1

currentSpeech.onend = function(){
isReading = false
updateButton()
}

speechSynthesis.speak(currentSpeech)

isReading = true
updateButton()

}

/* MOBILE AUDIO */
function playTTS(text,lang){

let chunks = text.match(/.{1,180}/g)
if(!chunks) return

let i = 0
isReading = true
updateButton()

function playNext(){

if(!isReading) return

if(i >= chunks.length){
isReading = false
updateButton()
return
}

let url =
"https://translate.google.com/translate_tts?client=gtx&ie=UTF-8&tl=" +
lang +
"&q=" +
encodeURIComponent(chunks[i])

currentAudio = new Audio(url)

currentAudio.onended = function(){
i++
playNext()
}

currentAudio.play()

}

playNext()

}

/* STOP */
function stopReading(){

speechSynthesis.cancel()

if(currentAudio){
currentAudio.pause()
currentAudio = null
}

isReading = false
updateButton()

}

/* DEVICE CHECK */
function isMobile(){
return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/* MAIN */
async function toggleRead(){

if(isReading){
stopReading()
return
}

let lang = getLanguage()
let text = getReadableText()

if(lang !== "sv"){
text = await translateText(text,lang)
}

let langMap = {
sv:"sv-SE",
en:"en-US",
so:"so-SO",
no:"no-NO",
hi:"hi-IN",
de:"de-DE",
fr:"fr-FR",
es:"es-ES",
pl:"pl-PL",
tr:"tr-TR",
fa:"fa-IR",
ar:"ar-SA"
}

let speechLang = langMap[lang] || "sv-SE"

if(isMobile()){
playTTS(text,lang)
}else{
startSpeech(text,speechLang)
}

}

/* BUTTON */
function updateButton(){

const button = document.getElementById("readBtn")
if(!button) return

if(isReading){
button.innerHTML = "⏹"
}else{
button.innerHTML = "🔊"
}

}

/* INIT */
document.addEventListener("DOMContentLoaded",function(){

const button = document.getElementById("readBtn")

if(button){
button.addEventListener("click",toggleRead)
updateButton()
}

})
