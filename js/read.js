let isReading = false
let currentSpeech = null
let currentAudio = null

let voices = []

function loadVoices(){
voices = speechSynthesis.getVoices()
}

speechSynthesis.onvoiceschanged = loadVoices
loadVoices()


/* =========================
LANGUAGE
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
DETECT SAFARI / IOS
========================= */

function isSafari(){

return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

}


/* =========================
WEB SPEECH
========================= */

function startSpeech(text,lang){

speechSynthesis.cancel()

currentSpeech = new SpeechSynthesisUtterance(text)

let voice = voices.find(v => v.lang.startsWith(lang))

if(voice){
currentSpeech.voice = voice
}

currentSpeech.lang = lang

currentSpeech.onend = function(){

isReading = false
updateButton()

}

speechSynthesis.speak(currentSpeech)

isReading = true
updateButton()

}


/* =========================
GOOGLE TTS (MOBILE SAFE)
========================= */

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
"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" +
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


/* =========================
STOP
========================= */

function stopReading(){

speechSynthesis.cancel()

if(currentAudio){
currentAudio.pause()
currentAudio = null
}

isReading = false
updateButton()

}


/* =========================
MAIN
========================= */

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
so:"so",
no:"no",
hi:"hi",
de:"de",
fr:"fr",
es:"es",
pl:"pl",
tr:"tr",
fa:"fa",
ar:"ar"

}

let speechLang = langMap[lang] || "sv"


/* Safari / iPhone */

if(isSafari()){

playTTS(text,speechLang)
return

}


/* Desktop */

startSpeech(text,speechLang)

}


/* =========================
BUTTON UI
========================= */

function updateButton(){

const button = document.getElementById("readBtn")

if(!button) return

if(isReading){

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
