console.log("starting extension...")
ii(0);

window.navigation.addEventListener("navigate", (event) => {
    console.log("navigate detected");
    //matches /users/<id>/osu though the /osu is optional and other gamemodes (taiko, mania, fruits) won't match
    const regex = /\/users\/\d+(\/osu)?$/;
    if (regex.test(event.destination.url))
        ii(0);
})

function ii(additionalPlaytimeHours) {
    console.log("executing...")
    /** TODO FIX
     * 
     * Timeout of 2 seconds to ensure site is fully loaded. Necessary, bc it's a
     * SPA and that messes with the document_idle thingy in the manifest, idk what im doing
     * Yes I know this is a shitty solution and will break when it loads slower than that
     * */
    setTimeout(function () {
        let pp = 0;
        let playtime = 0 + additionalPlaytimeHours;

        const labels = document.querySelectorAll('.value-display__label');

        labels.forEach(label => {
            // Searches for pp, then gets playtime by sibling (bc pp is same in every language)
            if (label.textContent.trim() === 'pp') {
                const ppElement = label.nextElementSibling.querySelector('.value-display__value div');
                const playtimeElement = ppElement.parentElement.parentElement.nextElementSibling.querySelector('.value-display__value span');

                console.log("playtimeelement:" + playtimeElement)
                playtime += parseInt(playtimeElement.getAttribute('title').split(' ')[0].replace(',', ''));
                console.log("line 27" + playtime)
                pp = parseInt(ppElement.textContent.replace(/[,.]/g, ''));
            }
        });

        // Compute expected playtime and ii, prerework: 1.16e-3 * Math.pow(pp, 1.17) and playtime/24
        let expectedPlaytime = 0.0183 * Math.pow(pp, 1.2);
        let ii = expectedPlaytime / playtime;

        // Insert ii on website
        updateElementStyles();
        updateElementGap('8px');

        const parentElement = document.querySelector('.profile-detail__values--grid');

        const iiElementAlreadyExists = document.getElementById('iiElement');

        if (iiElementAlreadyExists) {
            iiElementAlreadyExists.remove();
            console.log('Element with ID "iiElement" has been removed.');
        }

        const outerDiv = document.createElement('div');
        outerDiv.className = 'value-display value-display--plain';
        outerDiv.id = 'iiElement';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'value-display__label';
        labelDiv.textContent = 'ii';

        const valueDiv = document.createElement('div');
        valueDiv.className = 'value-display__value';
        valueDiv.textContent = ii.toFixed(2) + "x";

        outerDiv.appendChild(labelDiv);
        outerDiv.appendChild(valueDiv);

        parentElement.appendChild(outerDiv)
    }, 2000)
}

// Function to update grid-template-columns for elements with the class
function updateElementStyles() {
    // Select all elements with the class 'profile-detail__values--grid'
    const elements = document.querySelectorAll('.profile-detail__values--grid');

    // Loop through each element and update its style
    elements.forEach(element => {
        element.style.gridTemplateColumns = 'repeat(5, 1fr)';
    });
}

function updateElementGap(newGap) {
    // Select all elements with the class 'profile-detail__values'
    const elements = document.querySelectorAll('.profile-detail__values');

    // Loop through each element and update its style
    elements.forEach(element => {
        element.style.gap = newGap;
    });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        sendResponse(request);
        ii(Number(request.additionalPlaytimeHours));
    }
);