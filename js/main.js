let key = '2f137e570a9d4c6188e211028192505';
let key1 = '2c9ecf23c2cc167ce8dda16db67700ba';
window.onload = function(){
if(navigator.geolocation) {
    var latitude;
    var longitude;
    navigator.geolocation.getCurrentPosition(function showLocation(position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        continueExecution();
    },
    function(error){
        alert(error.message);
   }, 
   {
        enableHighAccuracy: true
             ,timeout : 5000
             ,maximumAge: 0
   });

} else { 
    alert("Geolocation is not supported by this browser.");
}

function continueExecution(){
    getWeatherByCords(latitude, longitude);
}

function getWeatherByCords(lat, lon){
    fetch(`http://api.apixu.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=7`)
        .then(response => response.json())
        .then(json => {
            document.querySelector('.date').innerHTML = `${json.location.localtime}`;
            document.querySelector('.weather-visuality>p').innerHTML = json.current.condition.text;
            document.querySelector('.weather-visuality>img').src = json.current.condition.icon;
            document.querySelector('h1').innerHTML = `${json.current.temp_c}°`;
            document.querySelector('.highest-temp').innerHTML = `${Math.round(json.forecast.forecastday[0].day.maxtemp_c)}° C`;            
            document.querySelector('.lowest-temp').innerHTML = `${Math.round(json.forecast.forecastday[0].day.mintemp_c)}° C`;
            let count = 1;
            document.querySelectorAll('.temp-by-day>li').forEach((e)=>{
                let date = json.forecast.forecastday[count].date
                e.children[0].innerHTML = date.slice(5,10)
                e.children[1].src = json.forecast.forecastday[count].day.condition.icon;
                e.children[1].title = json.forecast.forecastday[count].day.condition.text;
                e.children[2].innerHTML = `${Math.round(json.forecast.forecastday[count].day.maxtemp_c)}°`;
                e.children[4].innerHTML = `${Math.round(json.forecast.forecastday[count].day.mintemp_c)}°`;
                count++;
            });
        });
        fetch(`http://api.openweathermap.org/data/2.5/forecast?appid=${key1}&lat=${lat}&lon=${lon}&units=metric`)
        .then(response => response.json())
        .then(json => {
            document.querySelector('.city').innerHTML = json.city.name;
            let count = 0;
            document.querySelectorAll('.temp-by-hour>ul>li').forEach((e)=>{
                e.children[0].innerHTML = `${Math.round(json.list[count].main.temp)}°`;
                e.children[1].innerHTML = `${json.list[count+1].dt_txt[11]}${json.list[count+1].dt_txt[12]}:00`;
                count++
            });
        });
}

//hamburger menu
document.querySelector('.hamburger').addEventListener('click', (e)=>{
    document.querySelector('.city-list').classList.toggle('hidden');
    document.querySelector('.hamburger').classList.toggle('opened');
})
}

document.querySelectorAll('.city-names>li>p').forEach((city)=>{
    city.addEventListener('click',(e)=>{
        document.querySelector('.active').classList.remove('active');
        e.target.classList.add('active')
        console.log(e.target.innerHTML)
        setTimeout(function(){
            document.querySelector('.city-list').classList.toggle('hidden');
            document.querySelector('.hamburger').classList.toggle('opened');
        }, 100);
    })
})