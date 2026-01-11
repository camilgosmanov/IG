document.getElementById("analyze-btn").addEventListener("click", function () {
    const folderInput1 = document.getElementById("folder-upload-1").files;
    const folderInput2 = document.getElementById("folder-upload-2").files;
    
    if (folderInput1.length === 0) {
        alert("Please upload the first folder containing the required files!");
        return;
    }
    
    let followingFile1 = null;
    let followersFile1 = null;
    
    // Find the required files in the first uploaded folder
    Array.from(folderInput1).forEach((file) => {
        if (file.name === "following.json") followingFile1 = file;
        if (file.name === "followers_1.json") followersFile1 = file;
    });
    
    if (!followingFile1 || !followersFile1) {
        alert(
            "The first folder must contain both 'following.json' and 'followers_1.json' files!"
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
    
    Promise.all([loadFile(followingFile1), loadFile(followersFile1)]).then(
        ([followingData1, followersData1]) => {
            const followingUsernames1 = extractUsernames(
                followingData1["relationships_following"]
            );
            const followerUsernames1 = extractUsernames(followersData1);
            const notFollowingBack1 = [...followingUsernames1].filter(
                (user) => !followerUsernames1.has(user)
            );
            const notFollowedBack1 = [...followerUsernames1].filter(
                (user) => !followingUsernames1.has(user)
            );
            
            // Update first folder results
            document.getElementById("total-following").textContent =
                `Total following: ${followingUsernames1.size}`;
            document.getElementById("total-followers").textContent =
                `Total followers: ${followerUsernames1.size}`;
            document.getElementById("count-not-following-back").textContent =
                notFollowingBack1.length;
            const notFollowingBackList = document.getElementById(
                "not-following-back"
            );
            notFollowingBackList.innerHTML = notFollowingBack1
                .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                .join("");
            document.getElementById("count-not-followed-back").textContent =
                notFollowedBack1.length;
            const notFollowedBackList = document.getElementById(
                "not-followed-back"
            );
            notFollowedBackList.innerHTML = notFollowedBack1
                .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                .join("");
            
            document.getElementById("results").style.display = "block";
            
            // If second folder is provided, perform comparison
            if (folderInput2.length > 0) {
                let followingFile2 = null;
                let followersFile2 = null;
                
                Array.from(folderInput2).forEach((file) => {
                    if (file.name === "following.json") followingFile2 = file;
                    if (file.name === "followers_1.json") followersFile2 = file;
                });
                
                if (!followingFile2 || !followersFile2) {
                    alert(
                        "The second folder must contain both 'following.json' and 'followers_1.json' files!"
                    );
                    return;
                }
                
                Promise.all([loadFile(followingFile2), loadFile(followersFile2)]).then(
                    ([followingData2, followersData2]) => {
                        const followingUsernames2 = extractUsernames(
                            followingData2["relationships_following"]
                        );
                        const followerUsernames2 = extractUsernames(followersData2);
                        
                        // Calculate differences (folder1 is newer, folder2 is older)
                        const newFollowers = [...followerUsernames1].filter(
                            (user) => !followerUsernames2.has(user)
                        );
                        const lostFollowers = [...followerUsernames2].filter(
                            (user) => !followerUsernames1.has(user)
                        );
                        const newFollowing = [...followingUsernames1].filter(
                            (user) => !followingUsernames2.has(user)
                        );
                        const unfollowed = [...followingUsernames2].filter(
                            (user) => !followingUsernames1.has(user)
                        );
                        
                        // Update comparison results
                        document.getElementById("count-new-followers").textContent =
                            newFollowers.length;
                        document.getElementById("new-followers").innerHTML = newFollowers
                            .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                            .join("");
                        
                        document.getElementById("count-lost-followers").textContent =
                            lostFollowers.length;
                        document.getElementById("lost-followers").innerHTML = lostFollowers
                            .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                            .join("");
                        
                        document.getElementById("count-new-following").textContent =
                            newFollowing.length;
                        document.getElementById("new-following").innerHTML = newFollowing
                            .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                            .join("");
                        
                        document.getElementById("count-unfollowed").textContent =
                            unfollowed.length;
                        document.getElementById("unfollowed").innerHTML = unfollowed
                            .map((user, index) => `<li>${index + 1}. ${user}</li>`)
                            .join("");
                        
                        document.getElementById("comparison-results").style.display = "block";
                    }
                ).catch((err) => alert(err));
            }
        }
    ).catch((err) => alert(err));
});
function extractUsernames(data) {
    const usernames = new Set();
    data.forEach((entry) => {
        if (entry.title) {
            usernames.add(entry.title);
        } else {
            entry.string_list_data.forEach((user) =>
                usernames.add(user.value)
            );
        }
    });
    return usernames;
}
