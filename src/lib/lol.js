Array.from($0.querySelectorAll("tr"))
  .map(el => ({
    link: (el.querySelector("a") || {}).href,
    name: (el.querySelector("td:nth-child(3)") || {}).textContent,
    type: (el.querySelector("td:nth-child(5)") || {}).textContent,
    perk: (el.querySelector("td:nth-child(4) p") || {}).textContent
  }))
  .map(d => `[${d.name}](${d.link})}|${d.perk}|${d.type}`)
  .join("\n");
