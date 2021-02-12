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

    const classFilter = urlParams.get('class');
    console.log(classFilter);

    var dayFilter = urlParams.get('day');
    console.log(dayFilter);

    var dayName = '';

    if (!eventId) {
        return resultsTableDiv.innerHTML = 'Invalid search query';
    }

    if (!dayFilter) {
        dayFilter = 'day1';
    }

    firestore.collection("events").doc(eventId).get().then(doc => {
        if (doc && doc.exists) {
            eventData = doc.data();

            eventNameDiv.innerText = eventData.name;
            document.title = `${eventData.name} Results`;
            eventLocationDiv.innerText = eventData.location_name;

            var startDate = `${eventData.start_date.toDate().getMonth()} ${eventData.start_date.toDate().getFullYear()}`;

            if (eventData.start_date.toDate().getTime() != eventData.end_date.toDate().getTime()) {
                eventDatesDiv.innerText = `${eventData.start_date.toDate().toDateString()} - ${eventData.end_date.toDate().toDateString()}`;
            } else {
                eventDatesDiv.innerText = `${eventData.start_date.toDate().toDateString()}`;
            }

            if (eventData.series) {
                dayName = dayFilter.includes('day') ? ' · Day ' + dayFilter.substring(dayFilter.length - 1, dayFilter.length) : ' · Overall';
            }
        }
    });


    firestore.collection("events").doc(eventId).collection("results").doc(dayFilter).onSnapshot(function (doc) {
        var resultsTable = '';

        if (doc && doc.exists) {
            resultsData = doc.data();

            if (classFilter) {
                resultsData.class_results = { [classFilter]: resultsData.class_results[classFilter] };
            }

            for (var className in resultsData.class_results) {
                var classResults = resultsData.class_results[className];

                if (!classResults) {
                    continue;
                }

                console.log(classResults);

                resultsTable += `<h3 class="w3-padding-small">${className}${dayName}</h3>`;
                resultsTable += '<table class="w3-table-all"><tr><th>Pos</th><th>Name</th><th class="w3-hide-small">Sail Number</th><th class="w3-hide-small w3-hide-medium">Club</th>';

                if (classResults.num_days != null) {
                    for (var i = 0; i < classResults.num_days; i++) {
                        resultsTable += `<th>D${i+1}</th>`; 
                    }
                } else {
                    for (var i = 0; i < classResults.num_races; i++) {
                        resultsTable += `<th>R${i+1}</th>`; 
                    }
                }

                resultsTable += '<th>Points</th></tr>'

                for (var competitor of classResults.competitors) {
                    resultsTable += '<tr>';

                    resultsTable += `<td style="width:50px"><div class="w3-teal w3-circle w3-center">${competitor.position}</div></td><td>${competitor.skipper}`;
                    
                    if (competitor.crew) {
                        for (crew of competitor.crew.slice(0,10)) {
                            resultsTable += `<br>${crew}`;
                        }
                    }
                    resultsTable += `</td><td class="w3-hide-small">${competitor.sail_number}</td><td class="w3-hide-small w3-hide-medium">${competitor.club}</td>`;

                    for (var score of competitor.scores) {
                        resultsTable += score.discard ? `<td style="text-decoration:line-through">` : "<td>";
                        resultsTable += score.abbreviations && score.abbreviations.length > 0 ? score.abbreviations.join('<br>') : score.points.toFixed(1);
                        resultsTable += '</td>';

                    }

                    resultsTable += `<td>${competitor.net_total.toFixed(1)}</td>`;
                    resultsTable += '</tr>';
                }

                resultsTable += '</table><br>';
                resultsTableDiv.innerHTML = resultsTable;
            }
        } else {
            resultsTableDiv.innerHTML = `<div class="w3-container w3-amber w3-padding-large">No results found for ${day}</div>`;
        }
    });
})();
