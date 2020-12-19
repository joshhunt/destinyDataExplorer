const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { promisify } = require("util");

const _mkdirp = require("mkdirp");
const async = require("async");
const axios = require("axios");
const cheerio = require("cheerio");

const tempDirectory = require("temp-dir");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdirp = promisify(_mkdirp);

const API_KEY = process.env.REACT_APP_API_KEY;

const hashString = (string) =>
  crypto.createHash("md5").update(string).digest("hex");

async function getDefinitions() {
  const manifestResponse = await axios.get(
    "https://www.bungie.net/Platform/Destiny2/Manifest/",
    { headers: { "x-api-key": API_KEY } }
  );

  const definitonsPath =
    manifestResponse.data.Response.jsonWorldContentPaths.en;
  const definitionsUrl = `https://www.bungie.net${definitonsPath}`;

  const hash = hashString(definitionsUrl);

  const tempDefsPath = path.join(tempDirectory, hash);
  let tempDefs;

  try {
    const tempDefsFile = await readFile(tempDefsPath);
    console.log("have cached definitions");
    tempDefs = JSON.parse(tempDefsFile.toString());
  } catch (e) {}

  if (tempDefs) {
    return tempDefs;
  }

  console.log("requesting definitions from remote");

  const defsResponse = await axios.get(definitionsUrl, {
    headers: { "x-api-key": API_KEY },
  });

  const defs = defsResponse.data;

  await writeFile(tempDefsPath, JSON.stringify(defs));

  return defs;
}

(async function run() {
  const definitions = await getDefinitions();

  const htmlPath = path.resolve(path.join(".", "build", "index.html"));

  const htmlFile = (await readFile(htmlPath)).toString();

  const itemsToBuild = Object.values(
    definitions.DestinyInventoryItemDefinition
  ).filter(
    (item) =>
      item && item.itemCategoryHashes && item.itemCategoryHashes.includes(20)
  );

  console.log(`Have ${itemsToBuild.length} items to build pages for`);

  const MAP_LIMIT = 20;

  async.eachLimit(
    itemsToBuild,
    MAP_LIMIT,
    async (item) => {
      const $ = cheerio.load(htmlFile);
      const shortTableName = "InventoryItem";

      const fields = [
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", value: item.displayProperties.name },
        {
          name: "twitter:description",
          value: item.displayProperties.description,
        },

        {
          name: "twitter:image",
          content: `https://bungie.net${item.displayProperties.icon}`,
        },
        {
          name: "twitter:url",
          value: `https://data.destinysets.com/i/${shortTableName}:${item.hash}`,
        },

        { name: "twitter:label1", value: "Table" },
        { name: "twitter:data1", value: `Destiny${shortTableName}Definition` },

        { name: "twitter:label2", value: "Hash" },
        { name: "twitter:data2", value: item.hash },
      ];

      fields.forEach((field) => {
        const $metaHost = cheerio.load("<html><meta /> </html>");
        Object.entries(field).forEach(([attrName, attrValue]) => {
          $metaHost("meta").attr(attrName, attrValue);
        });
        $("head").append($metaHost("meta"));
      });

      // $("head").append(`
      //   <!-— twitter card tags additive with the og: tags -->
      //   <meta name="twitter:card" content="summary">
      //   <meta name="twitter:domain" value="data.destinysets.com" />

      //   <meta name="twitter:title" value="${item.displayProperties.name}" />
      //   <meta name="twitter:description" value="${item.displayProperties.description}" />

      //   <meta name="twitter:image" content="https://bungie.net${item.displayProperties.icon}" />
      //   <meta name="twitter:url" value="https://data.destinysets.com/i/${shortTableName}:${item.hash}" />

      //   <meta name="twitter:label1" value="Table" />
      //   <meta name="twitter:data1" value="Destiny${shortTableName}Definition" />

      //   <meta name="twitter:label2" value="Hash" />
      //   <meta name="twitter:data2" value="${item.hash}" />
      // `);

      const writeFolder = path.resolve(path.join(".", "build", "i"));

      await mkdirp(writeFolder);

      const writePath = path.resolve(
        writeFolder,
        `${shortTableName}:${item.hash}.html`
      );

      console.log(`Writing ${writePath}`);
      await writeFile(writePath, $.html());
    },
    (err) => {
      if (err) throw err;
      console.log("done all");
    }
  );
})();
