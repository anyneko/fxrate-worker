import cheerio from "cheerio";

const BOC_URL = "https://www.boc.cn/sourcedb/whpj/index.html";
const TARGET_CURRENCY = "加拿大元";

export default {
  async fetch(request, env, ctx) {
    console.info({ message: "fxrate worker received a request." });

    try {
      const upstreamResponse = await fetch(BOC_URL);
      if (!upstreamResponse.ok) {
        console.error("Failed to fetch BOC rates.", { status: upstreamResponse.status });
        return new Response("Upstream service error.", { status: 502 });
      }

      const html = await upstreamResponse.text();
      const $ = cheerio.load(html);
      let currencyRow;

      $("table tr").each((_, element) => {
        const cells = $(element).find("td");
        if (cells.length === 0) {
          return;
        }

        const currencyName = $(cells[0]).text().trim();
        if (currencyName === TARGET_CURRENCY) {
          if (cells.length < 6) {
            console.warn("Target currency row missing expected columns.");
            return false;
          }

          currencyRow = {
            currency: currencyName,
            cashBuying: $(cells[1]).text().trim(),
            spotBuying: $(cells[2]).text().trim(),
            cashSelling: $(cells[3]).text().trim(),
            spotSelling: $(cells[4]).text().trim(),
            publishedAt: $(cells[5]).text().trim(),
          };
          return false;
        }
      });

      if (!currencyRow) {
        console.warn("Target currency not found in BOC table.");
        return new Response("Currency not found.", { status: 404 });
      }

      return new Response(JSON.stringify(currencyRow), {
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      console.error("Unexpected error while fetching BOC rates.", error);
      return new Response("Internal error.", { status: 500 });
    }
  },
};
