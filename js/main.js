const key = '2f137e570a9d4c6188e211028192505';
const key1 = '2c9ecf23c2cc167ce8dda16db67700ba';
const locations = JSON.parse(localStorage.getItem('locations')) || [];


window.onload = function(){

    //weather from location on page load
    if(navigator.geolocation) {
        var latitude;
        var longitude;
        navigator.geolocation.getCurrentPosition(function showLocation(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            getWeather('cords', latitude, longitude);
            buildCityList()
        },
        function(error){
            alert(error.message);
        }, 
        {
            enableHighAccuracy: true
                ,timeout : 10000
                ,maximumAge: 0
        });

    } else{ 
        alert("Geolocation is not supported by this browser.");
    }

    function getWeather(method, lat, lon){
        let q, q1;
        if(method == 'cords'){
            q = `lat=${lat}&lon=${lon}`;
            q1 = `q=${lat},${lon}`;
        } if(method == 'name'){
            q = `q=${lat}`;
            q1 = `q=${lat}`;
        }
        fetch(`https://api.openweathermap.org/data/2.5/forecast?appid=${key1}&${q}&units=metric`)
        .then(response => response.json())
        .then(json => {
            console.log(json)
            document.querySelector('.city').innerHTML = json.city.name;
            checkIfOnList();
            let count = 0;
            document.querySelectorAll('.temp-by-hour>ul>li').forEach((e)=>{
                e.children[0].innerHTML = `${Math.round(json.list[count].main.temp)}°`;
                let hour = json.list[count].dt_txt[11]+json.list[count].dt_txt[12];
                hour = eval(`${hour}`)+json.city.timezone/3600
                if(hour<0) hour+=24;
                if(hour>24) hour-=24;
                e.children[1].innerHTML = `${hour}:00`;
                count++;
            });
        });
        fetch(`https://api.apixu.com/v1/forecast.json?key=${key}&${q1}&days=7`)
            .then(response => response.json())
            .then(json => {
                document.querySelector('.date').innerHTML = `${json.location.localtime}`;
                document.querySelector('.weather-visuality>p').innerHTML = json.current.condition.text;
                document.querySelector('.weather-visuality>img').src = json.current.condition.icon;
                document.querySelector('h1').innerHTML = `${Math.round(json.current.temp_c)}°`;
                document.querySelector('.highest-temp').innerHTML = `${Math.round(json.forecast.forecastday[0].day.maxtemp_c)}° C`;            
                document.querySelector('.lowest-temp').innerHTML = `${Math.round(json.forecast.forecastday[0].day.mintemp_c)}° C`;
                let count = 1;
                document.querySelectorAll('.temp-by-day>li').forEach((e)=>{
                    let date = json.forecast.forecastday[count].date;
                    e.children[0].innerHTML = date.slice(5,10);
                    e.children[1].src = json.forecast.forecastday[count].day.condition.icon;
                    e.children[1].title = json.forecast.forecastday[count].day.condition.text;
                    e.children[2].innerHTML = `${Math.round(json.forecast.forecastday[count].day.maxtemp_c)}°`;
                    e.children[4].innerHTML = `${Math.round(json.forecast.forecastday[count].day.mintemp_c)}°`;
                    count++;
                });
            });
    }

    function checkIfOnList(){
        for(e in locations){
            if(locations[e].text == document.querySelector('.city').innerHTML){
                document.querySelector('.add-to-fav').classList.add('remove');
                break;
            } else{
                document.querySelector('.add-to-fav').classList.remove('remove');
            }
        }
    }

    //hamburger menu
    document.querySelector('.hamburger').addEventListener('click', (e)=>{
        document.querySelector('.city-list').classList.toggle('hidden');
        document.querySelector('.hamburger').classList.toggle('opened');
    })

    function buildCityList(){
        document.querySelector('.city-names').innerHTML = '';
        locations.forEach((city)=>{
            let newCityLi = document.createElement('li');
            let newCityP = document.createElement('p');
            newCityP.innerHTML = city.text;
            newCityLi.appendChild(newCityP);
            document.querySelector('.city-names').appendChild(newCityLi);
        });
        listItemOnClick();
    }


    //city list click on element will switch class, close menu and change location
    function listItemOnClick(){
        document.querySelectorAll('.city-names>li>p').forEach((city)=>{
            city.addEventListener('click',(e)=>{
                if(document.querySelector('.active')){
                    document.querySelector('.active').classList.remove('active');
                }
                e.target.classList.add('active');
                getWeather('name' ,document.querySelector('.active').innerHTML);
                checkIfOnList;
                setTimeout(function(){
                    document.querySelector('.city-list').classList.toggle('hidden');
                    document.querySelector('.hamburger').classList.toggle('opened');
                }, 100);
            });
        });
    }

    //searching city by name |
    document.querySelector('.city-list-form').addEventListener('submit', (e)=>{
        e.preventDefault();
        document.querySelector('.city-list').classList.toggle('hidden');
        document.querySelector('.hamburger').classList.toggle('opened');
        getWeather('name' ,document.querySelector('.city-list-form>input').value);
        checkIfOnList;
    });

    //when + is clicked it check if it have remove class and add or remove city name from the list
    document.querySelector('.add-to-fav').addEventListener('click', (e)=>{
        document.querySelector('.add-to-fav').classList.toggle('remove');
        let classlist = document.querySelector('.add-to-fav').classList
        if(classlist.contains('remove')){
            const item = {
                text: document.querySelector('.city').innerHTML
            }
            locations.push(item);
        } else{
            locations.splice(locations.indexOf(document.querySelector('.city').innerHTML), 1);
        }
        localStorage.setItem('locations', JSON.stringify(locations));
        buildCityList();
    });



}