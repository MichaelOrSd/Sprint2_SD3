const searchBtn = document.getElementById("searchBtn");
const searchBar = document.getElementById("searchBar");

let searchQuery;

searchBar.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && searchBar.value != "") {
        location.href = 'pages/results/results.html';
        searchQuery = searchBar.value;
        console.log(searchQuery)
    }
})