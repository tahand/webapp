// document loaded
$(document).ready(function () {

    getCurrentLocation();

    buildCalendar();

    $("#btn_delete").on("click", function(){
        $("#task-input").val("");  //clear text input
        saveCalendarItem();        //save the value (empty input values tell the save to delete the entry
    });

    $("#filter_search").on("keyup",function(e){
        buildCalendar(e.target.value);
    })

    $("#clear_calendar").on("click", function(){
        localStorage.setItem(calendar_local_key, JSON.stringify({}));
        buildCalendar();
    });

    $("#calendar-form").on("submit", function(e){
        e.preventDefault();
        saveCalendarItem();
    });

});

const calendar_local_key = "calendar_items";

function buildCalendar(filterValue=""){
    const $grid = $("#calendar-grid").empty();
    const savedData = JSON.parse(localStorage.getItem(calendar_local_key));
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMin = currentDate.getMinutes();

    for (let hour = 8; hour < 18; hour++){
        for(let min = 0; min < 60; min+= 15){

            let showRecord = false;
            const timeID = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            const displayTime = displayTimeText(hour, min);
            const taskText  = (savedData && savedData[displayTime]) || "";
            let timeClass = "bg-white";
            let stateBadge = "";

            if (hour < currentHour || (hour === currentHour && min+15 <=currentMin)){
                timeClass = "bg-light text-muted";
            }
            else if (hour===currentHour && currentMin >= min && currentMin < min + 15){
                timeClass = "border-start border-4 border-primary bg-primary bg-primary-subtle fw-semibold";
            }             
 
            //by default the records are not shown but are then enabled if there is no filter or if the filter applies
            if (filterValue==="") {
                showRecord = true;
            }
            else {
                if (displayTime.toLowerCase().includes(filterValue)||taskText.toLowerCase().includes(filterValue)||timeID.toLowerCase().includes(filterValue)) {
                    showRecord = true;
                }
            }

            if (showRecord===false) continue;

            const $slot = $(`
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 ${timeClass}"
                    id="slot-${timeID.replace(':', '-')}"
                >
                
                <div id="calendar_item_container_${timeID}" class="w-100 p-3 calendar-item-container border d-flex align-items-center gap-3">
                    <span class="fw-bold font-monospace text-secondary" style="min-width:80px">${displayTime}</span>
                    <span class="calendar-label ${displayTime ? 'fw-bold text-dark' : 'text-muted fs-6'}">
                        ${taskText || '<em>Click or press to add'}
                    </span>
                    ${stateBadge}                

                    </div>

                <button class="m-3 btn btn-sm btn-outline-secondary edit-slot-btn" type="button" >
                Edit
                </button>

                </div>  
                `);


            $slot.on("click", function(){
                openCalendarModal(timeID, displayTime, taskText);
            });

            $slot.on("keydown", function(e){
                if (e.key === "Enter" || e.key === " "){
                    e.preventDefault();
                    openCalendarModal(timeID, displayTime, taskText);
                }
            });

            $grid.append($slot);
        }
    }
}


function openCalendarModal(timeID, displayTime, currentCalItem){
    
    $("#modal-time-key").val(timeID);
    $("#modal-time-display").val(displayTime);
    $("#task-input").val(currentCalItem);

    
    const modalElement = document.getElementById("calendarModal");
    const $modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    //return;

    $modalInstance.show();

    //set the focus to te input for easy entering directly into the input field.
    $("#calendarModal").one("shown.bs.modal", function(){
        $("#task-input").focus();
    });
}

function displayTimeText(hour, min){
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMin = String(min).padStart(2, "0");
    return `${displayHour}:${displayMin} ${ampm}`;
}

function saveCalendarItem(){

    const timeID = $("#modal-time-display").val();
    const calendarText = $("#task-input").val().trim();
    const savedCalendarData = JSON.parse(localStorage.getItem(calendar_local_key) || "{}");

    if (calendarText){
        savedCalendarData[timeID] = calendarText;
    }
    else {
        delete savedCalendarData[timeID];        
    }

    localStorage.setItem(calendar_local_key, JSON.stringify(savedCalendarData));

    const modalElement = document.getElementById("calendarModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
    
    buildCalendar();

}

async function updateWeather(pos) {
    if (!navigator.onLine){
        noWeatherAPI();
        return;
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos[1]}&longitude=${pos[0]}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
        $.getJSON(url, 
            function (data) {
            createWeatherChart(data.hourly.time, data.hourly.temperature_2m);
        })
        .fail(function(){ noWeatherAPI(); });
    } catch(e) {
        noWeatherAPI();
    }
}

function indexOfStartHour(valuesList){
    // the date contains temperatures from the start of the day that has passed
    // finding index of the current hour -1
    if (!Array.isArray(valuesList)) return null;
    
    const current = new Date();    

    for (let i = 0; i < valuesList.length; i++){
        const dt = new Date(valuesList[i]);
        if (dt > current) return (i > 0) ? (i-1) : 0;  //early escape when we find the index
    }

    return 0; //return first index as default
}

function noWeatherAPI(){
    let $container = $("#weather_container");
    $container.empty();
    $("<div>", {class:"d-flex flex-column align-items-center justify-content-center text-center", "aria-live":"polite"})
        .append($("<small>", {html:"Unable to load the weather...please check your connection."}))
        .appendTo($container);
}


function createWeatherChart(xLabels, yValues) {

    const startIndex = indexOfStartHour(xLabels);
    if (startIndex === null) return;

    const endIndex = ((startIndex+8) > (xLabels.length-1)) ? xLabels.length : (startIndex+8);  

    // cut the labels and values from index to end
    xLabels = xLabels.slice(startIndex, endIndex);
    yValues = yValues.slice(startIndex, endIndex);

    // convert the xLabels from date values to time values
    xLabels = xLabels.map(label=>{
        const dt = new Date(label);
        return dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
    });

    let $container = $("#weather_container");
    $container.empty();
    $.each(xLabels, function(i, label){
        $("<div>", {class:"card-body weather-card-item d-flex flex-column align-items-center justify-content-center text-center", "aria-live":"polite"})
            .append($("<div>", {class:"weather-temp", html:yValues[i] + "&deg;"}))
            .append($("<small>", {class:"weather-date", text: label}))
            .appendTo($container);
    });

}


function getCurrentLocation() {
    //default to london if no location can be found.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            console.log(pos);
            updateWeather([pos.coords.latitude, pos.coords.longitude]);
        }, (err) => {
            console.log(err.message);
            // example error if denied access GeolocationPositionError {code: 1, message: 'User denied Geolocation'}
            updateWeather([51.5085, -0.1257]);  // return london position
        });

    }

}
