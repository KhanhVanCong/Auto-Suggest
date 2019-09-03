class autosuggest {
    constructor(input, options) {
        this.input = input;
        this.options = options;
        //bind function
        this.setOptions = this.setOptions.bind(this);
        this.fetchAPI = this.fetchAPI.bind(this);
        this.findMatch = this.findMatch.bind(this);
        this.closeAllLists = this.closeAllLists.bind(this);
        this.rdSuggestTerm = this.rdSuggestTerm.bind(this);
        this.rdCollection = this.rdCollection.bind(this);
        this.rdProduct = this.rdProduct.bind(this);
        // get data, setup default
        this.fetchAPI();
        this.setOptions();
        this.input.addEventListener("input", this.findMatch);
        
    }

    findMatch() {
        let divListComplete, val = this.input.value;
        this.closeAllLists();
        if(val.length >= this.options.numChar)
        {
            if (!val) { return false;}
            let suggestTerm = JSON.parse(sessionStorage.getItem("suggestTerm"));
            let collections = JSON.parse(sessionStorage.getItem("collections"));
            let products = JSON.parse(sessionStorage.getItem("product"));
    
            // Find Match items
            // -- Suggest Term
            let divSuggest = this.rdSuggestTerm(suggestTerm, val);
            // -- Collection
            let divCollection = this.rdCollection(collections, val);
            // -- Product
            let divProduct = this.rdProduct(products, val);
            if(divSuggest || divCollection || divProduct)
            {
                // Create Parent class Auto Complete
                divListComplete = document.createElement("DIV");
                divListComplete.setAttribute("id", this.input.id + "autosuggest-list");
                divListComplete.setAttribute("class", "autosuggest-items");
                // Nedd to set position realative to show auto complete
                this.input.parentNode.style.position= "relative";
                this.input.parentNode.appendChild(divListComplete);
                // Add Child item matched
                this.options.orderBlock.forEach(item => {
                    switch (item){
                        case "suggest":
                            if(divSuggest){divListComplete.appendChild(divSuggest)};
                            break;
                        case "collection":
                            if(divCollection){divListComplete.appendChild(divCollection)};
                            break;
                        case "product":
                            if(divProduct){divListComplete.appendChild(divProduct)};
                            break;
                        default:
                            break;
                    }
                })         
            }
        }
        
    };

    // Render SuggestTerm
    rdSuggestTerm(suggestTerm, val)
    {
        let countMatch = 0;
        let divSuggest = document.createElement("DIV");
        divSuggest.innerHTML = "<h4>SUGGESTIONS</h4>";
        divSuggest.setAttribute("class", "suggest-term-wrap")
        suggestTerm.forEach(item => {
            if(item.term.toUpperCase().match(val.toUpperCase())) {
                countMatch++;
                let divChil = document.createElement("DIV");
                let regex = new RegExp(`${val}`, "i");
                divChil.innerHTML = "<p>" + item.term.replace(regex, "<b>$&</b>") + "</p>";

                divChil.addEventListener("click", () => 
                                            {
                                                this.input.value = item.term;
                                                this.closeAllLists();
                                            });
                divSuggest.appendChild(divChil);
            }
        });
        return countMatch === 0 ? false : divSuggest;
    }

    // Render Collection
    rdCollection(collections, val)
    {
        let countMatch = 0;
        let divCollection = document.createElement("DIV");
        divCollection.setAttribute("class", "collection-wrap");
        divCollection.innerHTML = "<h4>Collections</h4>";
        collections.forEach(item => {
            if(item.title.toUpperCase().match(val.toUpperCase())) {
                countMatch++;
                let divChil = document.createElement("DIV");
                divChil.innerHTML = `<a href=${item.url}>` + item.title + "</a>";
                divCollection.appendChild(divChil);
            }
        });
        return countMatch === 0 ? false : divCollection;
    }

    // Render Product
    rdProduct(products, val)
    {
        let countMatch = 0;
        let divProduct = document.createElement("DIV");
        divProduct.setAttribute("class", "product-wrap");
        divProduct.innerHTML = "<h4>Products</h4>";
        let divUL = document.createElement('ul');
        products.forEach(item => {
            if(item.title.toUpperCase().match(val.toUpperCase())) {
                countMatch++;
            }
        });

        let limitNum = this.options.limitNum;
        let lengthLoop = countMatch > limitNum ? limitNum : countMatch;
        for(let i = 0; i < lengthLoop; i++)
        {
            let divChil = document.createElement("li");
            let item = products[i];
            divChil.innerHTML = `<a href="${item.url}">
                                    <span class="thumbnail">
                                        <img src="${item.image}"/>
                                    </span>
                                    <span class="product-detail">
                                        <p class="title">${item.title}</p>
                                        <p class="brand">${item.brand}</p>
                                        <p class="price">${item.price}</p>
                                    </span>
                                </a>`
            divUL.appendChild(divChil);
        }
        if(countMatch > limitNum)
        {
            let divViewMore = document.createElement("li");
            divViewMore.innerHTML = `<a href="#" class="remainder">View All ${countMatch} Products</a>`;
            divUL.appendChild(divViewMore);
        }



        divProduct.appendChild(divUL);

        return countMatch === 0 ? false : divProduct;
    }

    closeAllLists() {
        let classAuto = document.getElementsByClassName("autosuggest-items");
        for (var i = 0; i < classAuto.length; i++) {
            classAuto[i].parentNode.removeChild(classAuto[i]);
        }
    };

    // Get all data from API
    // Save data Session Stored
    fetchAPI() {
        let url = [{name: "suggestTerm", url: "http://www.json-generator.com/api/json/get/cewyFlqjDm?indent=2"},
                    {name: "collections", url: "http://www.json-generator.com/api/json/get/bTUUAYECdK?indent=2"},
                    {name: "product", url: "http://www.json-generator.com/api/json/get/cpDFcyRLKG?indent=2"}];
        url.forEach(item => {
            let checkSS = sessionStorage.getItem(item.name);
            if(!checkSS)
            {
                fetch(item.url)
                    .then(res => res.json())
                    .then(
                        (result) => {
                            sessionStorage.setItem(item.name, JSON.stringify(result));
                        })
            }
        })        
    };

    // Check & Define Default Option
    setOptions() {
        let defaultObj = {numChar: 1, limitNum: 3, orderBlock: ["suggest","collection","product"]};
        if(!this.options)
        {
            this.options = defaultObj; // set default if user not put arg
        }
        else {
            for(let key in defaultObj) // 
            {
                if(!this.options[key])
                {
                    this.options[key] = defaultObj[key];
                }
            }
        }
            

        
    }

}


