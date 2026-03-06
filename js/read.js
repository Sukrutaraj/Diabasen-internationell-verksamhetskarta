let isReading = false
let currentAudio = null


function getLanguage(){
return localStorage.getItem("selectedLanguage") || "sv"
}


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


/* PLAY GOOGLE TTS */

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

if(currentAudio){
currentAudio.pause()
currentAudio = null
}

isReading = false
updateButton()

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

playTTS(text,lang)

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
