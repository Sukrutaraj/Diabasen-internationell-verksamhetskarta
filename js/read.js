let isReading = false
let utterance = null


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


async function translateText(text,target){

const url =
"https://translate.googleapis.com/translate_a/single?client=gtx&sl=sv&tl="+
target+
"&dt=t&q="+
encodeURIComponent(text)

const response = await fetch(url)

const data = await response.json()

return data[0].map(x=>x[0]).join("")

}


function speak(text,lang){

speechSynthesis.cancel()

let utterance = new SpeechSynthesisUtterance(text)

let voices = speechSynthesis.getVoices()

let voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.substring(0,2)))

if(!voice){
voice = voices.find(v => v.lang && v.lang.startsWith("en"))
}

if(!voice){
voice = voices[0]
}

if(voice){
utterance.voice = voice
utterance.lang = voice.lang
}

utterance.rate = 1

utterance.onend = function(){
isReading = false
updateButton()
}

speechSynthesis.speak(utterance)

isReading = true
updateButton()

}

}


function stopReading(){

speechSynthesis.cancel()

isReading = false

updateButton()

}


async function toggleRead(){

if(isReading){
stopReading()
return
}

let text = getReadableText()

if(!text) return

let lang = getLanguage()

if(lang !== "sv"){
text = await translateText(text,lang)
}

const langMap = {

sv:"sv-SE",
en:"en-US",
ar:"ar-SA",
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

let voices = speechSynthesis.getVoices()
let voiceAvailable = voices.find(v => v.lang.startsWith(speechLang.substring(0,2)))

if(!voiceAvailable){
speechLang = "en-US"
}
  
speak(text,speechLang)

}


function updateButton(){

const button = document.getElementById("readBtn")

if(!button) return

if(isReading){
button.innerHTML="⏹"
button.title="Stop"
}
else{
button.innerHTML="🔊"
button.title="Play"
}

}


document.addEventListener("DOMContentLoaded",function(){

const button = document.getElementById("readBtn")

if(button){
button.addEventListener("click",toggleRead)
updateButton()
}

})


