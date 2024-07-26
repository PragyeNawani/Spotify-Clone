let songs;
let currfolder;
let currentsong = new Audio();
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds <= 0){
        return formattedSeconds
    }
    const minutes = Math.floor(seconds/60);
    const remainingseconds = Math.floor(seconds%60)

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingseconds).padStart(2,'0');
    return `${formattedMinutes}:${formattedSeconds}`
}
async function getSongs(folder){
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);  
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songul = document.querySelector(".songslist").getElementsByTagName("ul")[0]
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
                            <img class="invert defimg" src="../Svg Files/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Nishu</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert defimg" src="../Svg Files/play.svg" alt="">
                            </div>
        </li>`
    }
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", (element)=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            Play.src="../Svg Files/pause.svg"
        })
    })
    return songs
}
const playMusic = (track, pause=false)=>{
    currentsong.src = `/${currfolder}/` + track
    if(!pause){
        currentsong.play()
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "")
}
async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/albums`);  
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let playlistcardcon = document.querySelector(".playlistcardcon")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/albums")){
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/albums/${folder}/info.json`);  
            let response = await a.json();
            playlistcardcon.innerHTML = playlistcardcon.innerHTML + `<div data-folder="${folder}" class="playlistcard">
                            <div class="aplaycon">
                                <div class="aplayhover"><i class="fa fa-play"></i></div>
                            </div>
                            <img src="../Songs/albums/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p><a href="#">${response.description}</a></p>
                        </div>`
        }

    }
    Array.from(document.getElementsByClassName("playlistcard")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log(item.currentTarget.dataset.folder)
            songs = await getSongs(`songs/albums/${item.currentTarget.dataset.folder}`)
        })
    })
}           
async function displayartists(){
    let a = await fetch(`http://127.0.0.1:3000/songs/artists`);  
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let artistscardcon = document.querySelector(".artistscardcon")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/artists")){
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/artists/${folder}/info.json`);  
            let response = await a.json();
            artistscardcon.innerHTML = artistscardcon.innerHTML + `<div data-folder="${folder}" class="artistscard">
                            <div class="acardhead"><img
                                    src="../songs/artists/${folder}/cover.jpg" alt=""></div>
                            <div class="acardbody">${response.title}</div>
                            <div class="playcon">
                                <div class="playhover opacity"><i class="fa fa-play"></i></div>
                            </div>
                        </div>`
        }

    }
    Array.from(document.getElementsByClassName("artistscard")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/artists/${item.currentTarget.dataset.folder}`)
        })
    })
}
async function main(){
    //get the list of all songs
    songs = await getSongs("songs/default");
    playMusic(songs[0], true)
    //display all the albums on the page
    displayAlbums()
    displayartists()
    //Attach an event listener to play, next and previous
    Play.addEventListener("click",()=>{
        if (currentsong.paused){
            currentsong.play()
            Play.src = "../Svg Files/pause.svg"
        }
        else{
            currentsong.pause()
            Play.src = "../Svg Files/play.svg"
        }
    })
    //Listen for time update event
    currentsong.addEventListener("timeupdate",()=>{
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${
            secondsToMinutesSeconds(currentsong.currentTime)
        }:${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/ currentsong.duration) * 100 + "%";
    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration)*percent)/100
    })
    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0" 
    })
    //add event listener fot close button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-110%" 
    })
    //add event listener to previous and next
    Previous.addEventListener("click",()=>{
        console.log("previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0])
        if ((index-1)>=0){
            playMusic(songs[index-1])
        }
    })
    Next.addEventListener("click",()=>{
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1) [0])
        if ((index+1)>length){
            playMusic(songs[index+1])
        }
    })
    //add event to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("Setting Volume to ", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value)/100
    })
    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("artistscard")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/artists/${item.currentTarget.dataset.folder}`)
        })
    })
    Array.from(document.getElementsByClassName("playlistcard")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/albums/${item.currentTarget.dataset.folder}`)
        })
    })
}
main()
function toggleinp() {
    var x = document.getElementById("volinp");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }
lihome.addEventListener("click", ()=>{
    if(homem.src="../Svg Files/home.svg"){
        homem.src = "../Svg Files/homec.svg"
        search.src="../Svg Files/search.svg"
    }
    else{
        homem.src = "../Svg Files/home.svg"
    }
})
lisearch.addEventListener("click",()=>{
    if(search.src="../Svg Files/search.svg"){
        homem.src ="../Svg Files/home.svg"
        search.src ="../Svg Files/searchc.svg"
    }
})