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

    const hideSailNumber = urlParams.get('hidesailnumber') != null;

    var dayFilter = urlParams.get('day');
    console.log(dayFilter);

    var dayName = '';

    if (!eventId) {
        return resultsTableDiv.innerHTML = '<div class="notice">Invalid search query</div>';
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


    // Delegated so it keeps working after live updates re-render the tables
    function revealPoints(cell) {
        clearTimeout(cell.revealTimer);
        cell.classList.add('show-points');
        cell.revealTimer = setTimeout(function () {
            cell.classList.remove('show-points');
        }, 1500);
    }

    resultsTableDiv.addEventListener('click', function (e) {
        var cell = e.target.closest('.abbr');
        if (cell) revealPoints(cell);
    });

    resultsTableDiv.addEventListener('keydown', function (e) {
        var cell = e.target.closest('.abbr');
        if (cell && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            revealPoints(cell);
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

                let hideClub = true;
                for (var competitor of classResults.competitors) {
                    if (competitor.club) {
                        hideClub = false;
                        break;
                    }
                }

                console.log(classResults);

                resultsTable += `<h3 class="class-title">${className}${dayName}</h3>`;
                resultsTable += '<div class="table-wrap"><table class="results-table"><thead><tr><th>Pos</th><th>Name</th>';
                if (!hideSailNumber) {
                    resultsTable += '<th class="hide-sm">Sail Number</th>';
                }
                if (!hideClub) {
                    resultsTable += '<th class="hide-md">Club</th>';
                }

                if (classResults.num_days != null) {
                    for (var i = 0; i < classResults.num_days; i++) {
                        resultsTable += `<th class="score">D${i+1}</th>`;
                    }
                } else {
                    for (var i = 0; i < classResults.num_races; i++) {
                        resultsTable += `<th class="score">R${i+1}</th>`;
                    }
                }

                resultsTable += '<th class="score">Points</th></tr></thead><tbody>'


                for (var competitor of classResults.competitors) {
                    resultsTable += '<tr>';

                    resultsTable += `<td style="width:50px"><div class="pos-badge pos-${competitor.position}">${competitor.position}</div></td><td>${competitor.skipper}`;
                    
                    if (competitor.crew) {
                        for (crew of competitor.crew.slice(0,10)) {
                            resultsTable += `<br>${crew}`;
                        }
                    }

                    if (!hideSailNumber) {
                        resultsTable += `</td><td class="hide-sm">${competitor.sail_number}</td>`
                    }

                    if (!hideClub) {
                        resultsTable += `<td class="hide-md">${competitor.club}</td>`;
                    }

                    for (var score of competitor.scores) {
                        formattedScore = Number.isInteger(score.points) ? score.points.toFixed(0) : score.points.toFixed(1);
                        var scoreClass = score.discard ? 'score discard' : 'score';
                        if (score.abbreviations && score.abbreviations.length > 0) {
                            // Tapping an abbreviation briefly reveals the points behind it
                            resultsTable += `<td class="${scoreClass} abbr" tabindex="0" title="${formattedScore} pts">`;
                            resultsTable += `<span class="abbr-flip"><span class="abbr-code">${score.abbreviations.join('<br>')}</span><span class="abbr-points">${formattedScore}</span></span>`;
                        } else {
                            resultsTable += `<td class="${scoreClass}">${formattedScore}`;
                        }
                        resultsTable += '</td>';

                    }

                    resultsTable += `<td class="total">${Number.isInteger(competitor.net_total) ? competitor.net_total.toFixed(0) : competitor.net_total.toFixed(1)}</td>`;
                    resultsTable += '</tr>';
                }

                resultsTable += '</tbody></table></div>';
                resultsTableDiv.innerHTML = resultsTable;
            }
        } else {
            resultsTableDiv.innerHTML = `<div class="notice">No results found for ${dayFilter}</div>`;
        }
    });
})();
