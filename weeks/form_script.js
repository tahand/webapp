function generate_form_tabs(){
    //get the form element
    let form = document.getElementById("dynamic_form");
    let nav_buttons = document.getElementById("form_tab_buttons");
    
    // queryselector on form to get all the fieldset elements with the attribute tagName
    let tagNames = form.querySelectorAll("fieldset[tabName]");

    Array.from(tagNames).forEach(tag=>{
        const tabName = tag.getAttribute("tabname");
        let new_button = document.createElement("div");
        new_button.className = "tab-selector";
        new_button.innerHTML = tabName;
        new_button.onclick = function (){hide_show_tabs(tabName)};
        nav_buttons.appendChild(new_button);

    });

}


function hide_show_tabs(tabName){
    let fieldsets = document.getElementById("dynamic_form").getElementsByTagName("fieldset");
    
    Array.from(fieldsets).forEach(tag=>{
        
        if (tag.getAttribute("tabname") == tabName) {
            tag.style.display = "block";
        }
        else {
            tag.style.display = "none";
        }
    });

}



generate_form_tabs();
hide_show_tabs("Basic Details");