import cheerio from "cheerio";

export default {
  async fetch(request, env, ctx) {
    // You can view your logs in the Observability dashboard
    console.info({ message: 'Hello World Worker received a request!' }); 
    return new Response('Hello World!');
  }
};

const document = await fetch("https://www.boc.cn/sourcedb/whpj/index.html");

const html = await document.text();
const $ = cheerio.load(html)

const rows = $("table tr");
rows.forEach(row => {
  if (row.textContent.includes("加拿大元")) {
    console.log(row);
    const not_row = row.querySelectorAll("td");
    console.log(not_row[2],not_row[4])
  };
});
