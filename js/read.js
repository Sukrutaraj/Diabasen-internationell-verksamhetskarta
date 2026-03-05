let isReading = false
let currentSpeech = null

let voices = []

let arabicAudio = null
let arabicPlaying = false


/* =========================
LOAD VOICES
========================= */

function loadVoices(){
voices = speechSynthesis.getVoices()
}

speechSynthesis.onvoiceschanged = loadVoices
loadVoices()


/* =========================
GET LANGUAGE
========================= */

function getLanguage(){
return localStorage.getItem("selectedLanguage") || "sv"
}


/* =========================
GET PAGE TEXT
========================= */

function getReadableText(){

let content =
document.querySelector('.readable-content') ||
document.querySelector('.readable-content-wrapper')

if(!content) return ""

return content.innerText

}


/* =========================
TRANSLATE
========================= */

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


/* =========================
START SPEECH
========================= */

function startReading(text,lang){

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


/* =========================
STOP
========================= */

function stopReading(){

speechSynthesis.cancel()

if(arabicAudio){
arabicAudio.pause()
arabicAudio = null
}

arabicPlaying = false
isReading = false

updateButton()

}


/* =========================
MAIN READ FUNCTION
========================= */

async function toggleRead(){

if(isReading || arabicPlaying){
stopReading()
return
}

let lang = getLanguage()
let text = getReadableText()

/* Arabic special */

if(lang === "ar"){
readArabic(text)
return
}

/* Translate if needed */

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
fa:"fa-IR"

}

let speechLang = langMap[lang] || "sv-SE"

startReading(text,speechLang)

}


/* =========================
ARABIC GOOGLE TTS
========================= */

async function readArabic(text){

let translated = await translateText(text,"ar")

let chunks = translated.match(/.{1,180}/g)

if(!chunks) return

arabicPlaying = true

let i = 0

function playNext(){

if(!arabicPlaying) return

if(i >= chunks.length){
arabicPlaying = false
updateButton()
return
}

let url =
"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar&q=" +
encodeURIComponent(chunks[i])

arabicAudio = new Audio(url)

arabicAudio.onended = function(){
i++
playNext()
}

arabicAudio.play()

}

playNext()

updateButton()

}


/* =========================
BUTTON STATE
========================= */

function updateButton(){

const button = document.getElementById("readBtn")

if(!button) return

if(isReading || arabicPlaying){

button.innerHTML = "⏹"
button.title = "Stop"

}else{

button.innerHTML = "🔊"
button.title = "Play"

}

}


/* =========================
INIT
========================= */

document.addEventListener("DOMContentLoaded",function(){

const button = document.getElementById("readBtn")

if(button){

button.addEventListener("click",toggleRead)

updateButton()

}

})