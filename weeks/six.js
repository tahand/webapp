let quotes_list = [];
let quote_index = 0;


function enable_sections() {
    const hashValue = window.location.hash.replace("#", "") || "quotes";
    $("section").hide();
    const sectionID = `#${hashValue}_section`;
    $(sectionID).slideToggle(300);

    if (hashValue=="mood") historicMoods();
}

$(window).on("hashchange", function () {
    enable_sections();
});



function halloween_check() {
    const halloween_checked = $("#halloween_switch").is(":checked");
    $("html").attr("data-bs-theme", (halloween_checked) ? "halloween" : "light");
}

$(document).ready(function () {
    halloween_check();
    enable_sections();
});
$("#halloween_switch").on("change", () => {
    halloween_check();
});


async function getQuotes() {

    await fetch("https://api.freeapi.app/api/v1/public/quotes/", {
        method: "get",
        headers: {
            "Accept": "application/json"
        }
    })
        .then(async (response) => {
            const result = await response.json();
            quotes = result.data.data;
            localStorage.setItem("quotes_list", JSON.stringify(quotes));
            getDisplayQuotes();
        })
        .catch(e => console.log(e));

}

function show_quotes(quotes_string) {

    try {
        quotes_list = JSON.parse(quotes_string);

        const quote_text_object = document.getElementById("quote-value");
        const quote_author_object = document.getElementById("quote_author");

        quote_text_object.innerHTML = quotes_list[quote_index].content;
        quote_author_object.innerHTML = quotes_list[quote_index].author;

        // disable previous and next
        document.getElementById("prev_selector").setAttribute("quote_status", "disabled");
        document.getElementById("next_selector").setAttribute("quote_status", "disabled");

        if (quote_index > 0) {
            document.getElementById("prev_selector").setAttribute("quote_status", "enabled");
        }

        if (quote_index < quotes_list.length - 1) {
            document.getElementById("next_selector").setAttribute("quote_status", "enabled");
        }

        document.getElementById("selector_page_details").innerText = `Page ${(quote_index + 1)} of ${quotes_list.length}`;

    }
    catch (e) {
        // the quotes can't be converted to JSON or the index can't be updated 
        // then set the index to 0 
        // return and don't go any further
        return;
    }


}

function updatePage(moveValue) {
    quote_index = quote_index + moveValue;  //set index to plus or minus depending on prev/next
    if (quote_index < 0) quote_index = 0;   //set to zero if less that zero (first index)
    if (quote_index >= quotes_list.length) quote_index = quotes_list.length - 1  //set to the end of the list if greater than that value
    getDisplayQuotes();
}

function getDisplayQuotes() {
    let quotes_string = localStorage.getItem("quotes_list");

    if (quotes_string === null) {
        getQuotes();
        return;
    }

    show_quotes(quotes_string);

}

function clearLocalCache() {
    // set local storage to null and then get values from the api
    localStorage.setItem("quotes_list", null);
    getQuotes();
}

$("#survey_form").on("submit", (e) => {
    console.log("survery");
    e.preventDefault();

    const x = $("form").serializeArray();

    $.each(x, function (i, field) {
        if (field.name === "mood_range") {

            let latestMood = field;

            // get the local storage value for historic_moods            
            let pastMoods = localStorage.getItem("historic_moods");
            if (!pastMoods || pastMoods === "null") {
                pastMoods = [];
            }
            else {
                pastMoods = JSON.parse(pastMoods);
            }

            // add the current date to the object
            latestMood["DateTime"] = new Date();
            pastMoods.push(latestMood);
            console.log(pastMoods);

            localStorage.setItem("historic_moods", JSON.stringify(pastMoods));

            historicMoods();

        }
    });


});


function historicMoods() {
    let pastMoods = localStorage.getItem("historic_moods");

    if (!pastMoods || pastMoods === "null") return;
    
    // display historic moods
    if (pastMoods.length > 0) {
        pastMoods = JSON.parse(pastMoods);
        const $historyElement = $("#historic_moods_list");
        console.log($historyElement);
        $historyElement.empty();
        console.log("1");
        
        $.each(pastMoods, function(index, moodObj) {
            console.log(moodObj);
            const dateFormatted = new Date(moodObj.DateTime).toLocaleString();
            const $container = $("<div>").addClass("card mb-2 p-2");
            const $value = $("<div>").html(`<strong>Mood Rating: </strong> ${moodObj.value}`)
            const $datetime = $("<div>").html(`<small>${dateFormatted}</small>`)

            $container.append($value, $datetime);
            $historyElement.append($container);
        });

    }

}

getDisplayQuotes();