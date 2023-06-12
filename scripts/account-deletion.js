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

    const accountDeletionPolicyDiv = document.querySelector("#account-deletion");

    firestore.collection("misc").doc("account_deletion").get().then(doc => {
        if (doc && doc.exists) {
            accountDeletionDoc = doc.data();

            accountDeletionPolicyDiv.innerHTML = accountDeletionDoc.text.replaceAll('\\n', '<br>');
        }
    });
    
})();
