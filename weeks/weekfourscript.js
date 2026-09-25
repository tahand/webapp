        // this will run last when the required page components are rendered
        function createSubMenu() {
            // script to search through the document for each section and 
            // get the id and h2 title of each for the menu

            sections = [];

            //get section elements and convert to an array to loop through
            Array.from(document.getElementsByTagName("section")).forEach(section => {
                //get the id to identify the section element
                elementID = section.id
                //get the h2 element from within this section
                title = section.getElementsByTagName("h2")[0].innerText

                sections.push({ "href": elementID, "title": title })

            });

            //get the menu list element 
            navMenu = document.getElementById("navigation_menu")
            
            // loop through the array
            sections.map(section => {
                // create li and a element objects
                newItem = document.createElement("li")
                newATag = document.createElement("a")

                // set a element values
                newATag.href = "#" + section.href   //adding # for an internal link
                newATag.innerText = section.title

                newItem.appendChild(newATag)    //add a element to li
                navMenu.appendChild(newItem)    //add li to menu

            })
        }


        function checkForm(){
            let querystring = window.location.search;
            //remove the first character which is ?
            querystring = querystring.substring(1, querystring.length)     
            querystring = decodeURI(querystring)
            key_value_array = querystring.split("&")
            
            let form_values = key_value_array.map(k_v=>{
                [key, value] = k_v.split("=");
                return {"key":key, "value":value}
            })

            
            if (form_values[0].value ===undefined) return;

            const html_review = document.getElementById("form-review")
            form_values.forEach((rec=>{
                html_key = document.createElement("div")
                html_key.innerText = rec.key
                html_key.classList.add("review-key");

                html_value = document.createElement("div")
                html_value.innerText = rec.value
                html_value.classList.add("review-value");

                html_review.appendChild(html_key)
                html_review.appendChild(html_value)
            }))
            
            html_review.style.display = "grid";
        }

        createSubMenu();
        checkForm();
