<script>
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
        alert("The folder must contain both 'following.json' and 'followers_1.json' files!");
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
            // following.json has "relationships_following" key
            const followingList = followingData["relationships_following"] || followingData;
            const followingUsernames = extractUsernames(followingList, "following");
            const followerUsernames = extractUsernames(followersData, "followers");

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
            document.getElementById("not-following-back").innerHTML =
                notFollowingBack.map((user) => `<li>${user}</li>`).join("");

            // Update not followed back count
            document.getElementById("count-not-followed-back").textContent =
                notFollowedBack.length;
            document.getElementById("not-followed-back").innerHTML =
                notFollowedBack.map((user) => `<li>${user}</li>`).join("");

            document.getElementById("results").style.display = "block";
        }
    ).catch((err) => alert(err));
});

// Adjusted to handle both formats (followers vs following)
function extractUsernames(data, type) {
    const usernames = new Set();

    data.forEach((entry) => {
        if (type === "following") {
            // In following.json, username is in entry.title
            if (entry.title) usernames.add(entry.title);
        } else {
            // In followers_1.json, username is in entry.string_list_data[0].value
            if (
                entry.string_list_data &&
                entry.string_list_data.length > 0 &&
                entry.string_list_data[0].value
            ) {
                usernames.add(entry.string_list_data[0].value);
            }
        }
    });

    return usernames;
}
</script>
