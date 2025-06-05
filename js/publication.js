  <script>
    const orcid = "0009-0002-6981-0362";
    const worksUrl = `https://pub.orcid.org/v3.0/${orcid}/works`;

    fetch(worksUrl, {
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      const works = data.group;
      const list = document.getElementById('pubs');
      const workItems = [];

      // Step 1: Gather all work detail fetches
      const fetches = works.map(work => {
        const summary = work['work-summary'][0];
        const putCode = summary['put-code'];
        return fetch(`https://pub.orcid.org/v3.0/${orcid}/work/${putCode}`, {
          headers: { 'Accept': 'application/json' }
        })
        .then(response => response.json())
        .then(fullWork => {
          const title = fullWork.title?.title?.value || "Untitled";
          const year = parseInt(fullWork['publication-date']?.year?.value) || 0;
          const journal = fullWork['journal-title']?.value || "";

          // Format authors
          let authors = "Unknown author";
          const contributors = fullWork.contributors?.contributor;
          if (contributors && contributors.length > 0) {
            authors = contributors.map(c => {
              const name = c['credit-name']?.value || c['contributor-orcid']?.path || "Unnamed";
              return name === "Abhishek Rai" ? `<b>${name}</b>` : name;
            }).join(', ');
          }

          // Get DOI
          let doi = "";
          const externalIds = fullWork['external-ids']?.['external-id'];
          if (externalIds) {
            const doiEntry = externalIds.find(id => id['external-id-type'] === 'doi');
            if (doiEntry) {
              doi = doiEntry['external-id-value'];
            }
          }

          return {
            year,
            html: `${authors} (<b>${year || 'n.d.'}</b>). <i>${title}</i>${journal ? `. ${journal}` : ''}${doi ? `. <a href="https://doi.org/${doi}" target="_blank">https://doi.org/${doi}</a>` : ''}.`
          };
        })
        .catch(err => {
          console.error("Error fetching full work:", err);
          return null;
        });
      });

      // Step 2: After all fetches complete, sort and display
      Promise.all(fetches).then(results => {
        const validItems = results.filter(r => r !== null);
        validItems.sort((a, b) => b.year - a.year); // Descending year

        validItems.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = item.html;
          list.appendChild(li);
        });
      });
    })
    .catch(error => {
      console.error('Error fetching ORCID summary:', error);
    });
  </script>
