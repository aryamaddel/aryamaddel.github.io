/**
 * Fetches the last commit date for the repository and updates the footer.
 * @param {string} repo - The GitHub repository in "username/repo" format.
 */
function updateLastUpdated(repo) {
  const element = document.getElementById("last-updated");
  if (!element) return;

  fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data[0] && data[0].commit) {
        const date = new Date(data[0].commit.committer.date);
        element.innerText = "Last updated: " + date.toLocaleDateString();
      }
    })
    .catch((e) => console.error("Error fetching last commit:", e));
}

// Initial call
updateLastUpdated("aryamaddel/aryamaddel.github.io");
