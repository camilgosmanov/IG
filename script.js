document.getElementById("analyze-btn").addEventListener("click", function () {
    const followingFile = document.getElementById("following-file").files[0];
    const followersFile = document.getElementById("followers-file").files[0];

    if (!followingFile || !followersFile) {
        alert("Please upload both files!");
        return;
    }

    const loadFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(JSON.parse(reader.result));
            reader.onerror = () => reject("Failed to load file");
            reader.readAsText(file);
        });
    };

    Promise.all([loadFile(followingFile), loadFile(followersFile)]).then(
        ([followingData, followersData]) => {
            const followingUsernames = extractUsernames(
                followingData["relationships_following"]
            );
            const followerUsernames = extractUsernames(followersData);

            const notFollowingBack = [...followingUsernames].filter(
                (user) => !followerUsernames.has(user)
            );
            const notFollowedBack = [...followerUsernames].filter(
                (user) => !followingUsernames.has(user)
            );

            document.getElementById("total-following").textContent =
                `Total following: ${followingUsernames.size}`;
            document.getElementById("total-followers").textContent =
                `Total followers: ${followerUsernames.size}`;

            const notFollowingBackList = document.getElementById(
                "not-following-back"
            );
            notFollowingBackList.innerHTML = notFollowingBack
                .map((user) => `<li>${user}</li>`)
                .join("");

            const notFollowedBackList = document.getElementById(
                "not-followed-back"
            );
            notFollowedBackList.innerHTML = notFollowedBack
                .map((user) => `<li>${user}</li>`)
                .join("");

            document.getElementById("results").style.display = "block";
        }
    ).catch((err) => alert(err));
});

function extractUsernames(data) {
    const usernames = new Set();
    data.forEach((entry) =>
        entry.string_list_data.forEach((user) =>
            usernames.add(user.value)
        )
    );
    return usernames;
}
