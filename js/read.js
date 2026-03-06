let isReading = false
let speech = null


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


function startSpeech(text,lang){

speechSynthesis.cancel()

speech = new SpeechSynthesisUtterance(text)

speech.lang = lang
speech.rate = 1

speech.onend = function(){
isReading=false
}

speechSynthesis.speak(speech)

isReading=true

}


function stopSpeech(){

speechSynthesis.cancel()

isReading=false

}


async function toggleRead(){

if(isReading){
stopSpeech()
return
}

let text = getReadableText()

if(!text) return

let lang = getLanguage()

if(lang !== "sv"){
text = await translateText(text,lang)
}

let langMap = {

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

startSpeech(text,speechLang)

}


document.addEventListener("DOMContentLoaded",function(){

const button = document.getElementById("readBtn")

if(button){
button.addEventListener("click",toggleRead)
}

})
