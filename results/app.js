(function() {

    var firebaseConfig = {
        apiKey: "AIzaSyCipKSjtrDDLm9-HPvi3p2m_Py_pl5E5qw",
        authDomain: "regatta-studio.firebaseapp.com",
        databaseURL: "https://regatta-studio.firebaseio.com",
        projectId: "regatta-studio",
        storageBucket: "regatta-studio.appspot.com",
        messagingSenderId: "815391158813",
        appId: "1:815391158813:web:f3346166833fcd34f60cf4",
        measurementId: "G-JSWVYXKC6G"
    };

    firebase.initializeApp(firebaseConfig);
    var firestore = firebase.firestore();

    const eventNameDiv = document.querySelector("#eventName");
    const eventLocationDiv = document.querySelector("#eventLocation");
    const eventDatesDiv = document.querySelector("#eventDates");

    const resultsTableDiv = document.querySelector("#resultsTable");
    const errorMessageDiv = document.querySelector("#errorMessage");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const eventId = urlParams.get('event');
    console.log(eventId);

    const className = urlParams.get('class');
    console.log(className);

    var day = urlParams.get('day');
    console.log(day);

    if (!eventId || !className) {
        return resultsTableDiv.innerHTML = 'Missing mandatory parameter';
    }

    if (!day) {
        day = 'day1';
    }

    firestore.collection("events").doc(eventId).get().then(doc => {
        if (doc && doc.exists) {
            eventData = doc.data();

            eventNameDiv.innerText = eventData.name;
            eventLocationDiv.innerText = eventData.location_name;

            var startDate = `${eventData.start_date.toDate().getMonth()} ${eventData.start_date.toDate().getFullYear()}`;

            if (eventData.start_date.toDate().getTime() != eventData.end_date.toDate().getTime()) {
                eventDatesDiv.innerText = `${eventData.start_date.toDate().toDateString()} - ${eventData.end_date.toDate().toDateString()}`;
            } else {
                eventDatesDiv.innerText = `${eventData.start_date.toDate().toDateString()}`;
            }
        }
    });


    firestore.collection("events").doc(eventId).collection("results").doc(day).onSnapshot(function (doc) {
        if (doc && doc.exists) {
            resultsData = doc.data();

            if (!resultsData.class_results[className]) {
                resultsTableDiv.innerHTML = `<div class="w3-container w3-amber w3-padding-large">No ${className} results found for ${day}</div>`;
            } else {
                var classResults = resultsData.class_results[className];
                console.log(classResults);

                var resultsTable = '<table class="w3-table-all"><tr><th>Pos</th><th>Name</th><th>Sail Number</th><th class="w3-hide-small">Club</th>';
                for (var i = 0; i < classResults.num_races; i++) {
                    resultsTable += `<th>R${i+1}</th>`; 
                }
                resultsTable += '<th>Points</th></tr>'

                for (var competitor of classResults.competitors) {
                    resultsTable += '<tr>';

                    resultsTable += `<td style="width:50px"><div class="w3-teal w3-circle w3-center">${competitor.position}</div></td><td>${competitor.skipper}`;
                    
                    if (competitor.crew && competitor.crew.length > 0) {
                        resultsTable += `<br>${competitor.crew[0]}`;
                    }
                    resultsTable += `</td><td>${competitor.sail_number}</td><td class="w3-hide-small">${competitor.club}</td>`;

                    for (var score of competitor.scores) {
                        resultsTable += score.discard ? `<td style="text-decoration:line-through">` : "<td>";
                        resultsTable += score.abbreviations && score.abbreviations.length > 0 ? score.abbreviations.join('+') : score.points.toFixed(1);
                        resultsTable += '</td>';

                    }

                    resultsTable += `<td>${competitor.net_total.toFixed(1)}</td>`;
                    resultsTable += '</tr>';
                }

                resultsTable += '</table>';    
                resultsTableDiv.innerHTML = resultsTable;
            }   
        } else {
            resultsTableDiv.innerHTML = `<div class="w3-container w3-amber w3-padding-large">No results found for ${day}</div>`;
        }
    });
})();
