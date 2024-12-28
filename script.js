document.getElementById("analyze-btn").addEventListener("click", function () {
    const folderInput = document.getElementById("folder-upload").files;

    if (folderInput.length === 0) {
        alert("Please upload a folder containing the required files!");
        return;
    }

    let followingFile = null;
    let followersFile = null;

    // Find the required files in the uploaded folder
    Array.from(folderInput).forEach((file) => {
        if (file.name === "following.json") followingFile = file;
        if (file.name === "followers_1.json") followersFile = file;
    });

    if (!followingFile || !followersFile) {
        alert(
            "The folder must contain both 'following.json' and 'followers_1.json' files!"
        );
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

            // Update total counts
            document.getElementById("total-following").textContent =
                `Total following: ${followingUsernames.size}`;
            document.getElementById("total-followers").textContent =
                `Total followers: ${followerUsernames.size}`;

            // Update not following back count
            document.getElementById("count-not-following-back").textContent =
                notFollowingBack.length;
            const notFollowingBackList = document.getElementById(
                "not-following-back"
            );
            notFollowingBackList.innerHTML = notFollowingBack
                .map((user) => `<li>${user}</li>`)
                .join("");

            // Update not followed back count
            document.getElementById("count-not-followed-back").textContent =
                notFollowedBack.length;
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
