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
            lat = replaceSpecialSigns(lat);
            q = `q=${lat}`;
            q1 = `q=${lat}`;
        }
        fetch(`https://api.openweathermap.org/data/2.5/forecast?appid=${key1}&${q}&units=metric`)
        .then(response => response.json())
        .then(json => {
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
            document.querySelector('.lon').innerHTML = json.city.coord.lon;
            document.querySelector('.lat').innerHTML = json.city.coord.lat;
        });
        fetch(`https://api.apixu.com/v1/forecast.json?key=${key}&${q1}&days=7`)
            .then(response => response.json())
            .then(json => {
                document.querySelector('.date').innerHTML = `${json.location.localtime}`;
                document.querySelector('.weather-visuality>p').innerHTML = json.current.condition.text;
                document.querySelector('.weather-visuality>img').src = json.current.condition.icon;
                changeBg(document.querySelector('.weather-visuality>img').src);
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
                let locationTarget;
                for(e in locations){
                    if(locations[e].text == document.querySelector('.active').innerHTML){
                        locationTarget = locations[e]
                        break;
                    }}
                getWeather('cords',locationTarget.lat, locationTarget.lon);
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
                text: document.querySelector('.city').innerHTML,
                lon: document.querySelector('.lon').innerHTML,
                lat: document.querySelector('.lat').innerHTML
            }
            locations.push(item);
        } else{
            locations.splice(locations.indexOf(document.querySelector('.city').innerHTML), 1);
        }
        localStorage.setItem('locations', JSON.stringify(locations));
        buildCityList();
    });

    function replaceSpecialSigns(word){
        let replaced = word.replace(/[ęĘ]/gi, 'e');
        replaced = replaced.replace(/[óÓ]/gi, 'o');
        replaced = replaced.replace(/[ąĄ]/gi, 'a');
        replaced = replaced.replace(/[śŚ]/gi, 's');
        replaced = replaced.replace(/[łŁ]/gi, 'l');
        replaced = replaced.replace(/[żźŻŹ]/gi, 'z');
        replaced = replaced.replace(/[ćĆ]/gi, 'c');
        replaced = replaced.replace(/[ńŃ]/gi, 'n');
        return replaced;
    }

    function changeFontColor(color){
        document.querySelector('body').style.color = `${color}`;
        document.querySelector('.city-list').style.color = `white`;
        if(color == 'black'){
            document.querySelector('.hamburger').classList.remove('whiteburger')
            document.querySelector('.add-to-fav').classList.remove('whiteplus')
            document.querySelector('.hamburger').classList.add('blackburger')
            document.querySelector('.add-to-fav').classList.add('blackplus')
            document.querySelector('.line').classList.add('blackline')

        }
        if(color == 'white'){
            document.querySelector('.hamburger').classList.remove('blackburger')
            document.querySelector('.add-to-fav').classList.remove('blackplus')
            document.querySelector('.line').classList.remove('blackline')
            document.querySelector('.hamburger').classList.add('whiteburger')
            document.querySelector('.add-to-fav').classList.add('whiteplus')

        }
    }

    function changeBg(src){
        //weather at night
        let regex = /night/gi;
        if(regex.test(src)){
            //thunders at night
            console.log('o')
            regex = /(200)|(386)|(389)|(392)|(395)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(-0deg, #fbff31b3 -200%, #1a2530 50%,#11171d 100%) fixed'
                changeFontColor('white')
                return;
            }

            document.querySelector('body').style.background = 'linear-gradient(-20deg, #2b5876 0%, #4e4376 100%) fixed'
            changeFontColor('white')
            return;
        } else{
            //sunny
            regex = /(113)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(to top, #fddb92 0%, #d1fdff 100%) fixed'
                changeFontColor('black')
                return;
            }
            //sun with clouds
            regex = /(116)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(-240deg, #5f9cff 0%, #c2e9fb 100%) fixed'
                changeFontColor('black')
                return;
            }
            //cloudy
            regex = /(119)|(122)|(143)|(248)|(260)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(-225deg, #f5f7fa 0%, #c3cfe2 100%) fixed'
                changeFontColor('black')
                return;
            }
            //sun with rain
            regex = /(176)|(182)|(293)|(299)|(305)|(353)|(356)|(359)|(362)|(365)|(374)|(377)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(to top, #0c3483 0%, #dfdaa2 130%) fixed'
                changeFontColor('white')
                return;
            }
            ///thunders
            regex = /(200)|(386)|(389)|(392)|(395)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(-0deg, #fbff31b3 -200%, #303f4e 100%) fixed'
                changeFontColor('white')
                return;
            }
            //sun with snow
            regex = /(179)|(323)|(329)|(335)|(368)|(371)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(to top, #6e6b6b 0%,#d8d8d8 70%, #f9f586 100%) fixed'
                changeFontColor('black')
                return;
            }
            //rain
            regex = /(263)|(266)|(296)|(302)|(208)|(317)|(320)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(to top, #2bb5b6 0%, #424057 100%) fixed'
                changeFontColor('white')
                return;
            }
            //snow
            regex = /(185)|(281)|(284)|(311)|(314)|(227)|(230)|(326)|(332)|(338)|(350)/gi;
            if(regex.test(src)){
                document.querySelector('body').style.background = 'linear-gradient(to top, #9dabcb 0%, #eef1f5 100%) fixed;'
                changeFontColor('black')
                return;
            }
            document.querySelector('body').style.background = 'linear-gradient(#1A2760, #9561A1) fixed'
            changeFontColor('white')
            return;
        }
    }
}